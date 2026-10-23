import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { validPrintConfig } from '@/components/orbit-preview/print-config';

export async function POST(request: Request) {
  if(process.env.NODE_ENV!=='development') return Response.json({error:'Dateispeicherung ist nur lokal verfügbar.'},{status:404});
  try {
    const origin=request.headers.get('origin');
    if(!origin || new URL(origin).host!==request.headers.get('host')) return Response.json({error:'Ungültige Herkunft.'},{status:403});
    if(Number(request.headers.get('content-length')??0)>2048) return Response.json({error:'Konfiguration zu groß.'},{status:413});
    const text=await request.text();
    if(text.length>2048) return Response.json({error:'Konfiguration zu groß.'},{status:413});
    const {variant,...config}=JSON.parse(text);
    if(![1,2].includes(variant) || !validPrintConfig(config)) return Response.json({error:'Ungültige Konfiguration.'},{status:400});
    const relative=`src/components/orbit-preview/saved/page-${variant}-${config.seed}-${Date.now()}.json`;
    await mkdir(path.dirname(path.join(process.cwd(),relative)),{recursive:true});
    await writeFile(path.join(process.cwd(),relative),JSON.stringify({variant,...config},null,2)+'\n',{flag:'wx'});
    return Response.json({path:relative});
  } catch {return Response.json({error:'Speichern fehlgeschlagen.'},{status:400});}
}
