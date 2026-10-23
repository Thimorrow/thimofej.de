import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { validConfig } from "@/components/type-lab/config";
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") return Response.json({error:"Dateispeicherung ist nur lokal verfügbar."},{status:404});
  const origin=request.headers.get("origin");
  if (!origin || new URL(origin).host !== request.headers.get("host")) return Response.json({error:"Ungültige Herkunft."},{status:403});
  if (Number(request.headers.get("content-length") ?? 0)>4096) return Response.json({error:"Konfiguration zu groß."},{status:413});
  try {
    const body=await request.text();
    if (body.length>4096) return Response.json({error:"Konfiguration zu groß."},{status:413});
    const config=JSON.parse(body);
    if (!validConfig(config)) return Response.json({error:"Ungültige Konfiguration."},{status:400});
    const relative=`src/components/type-lab/saved/type-${config.mode}-${config.seed}-${Date.now()}.json`;
    await mkdir(path.dirname(path.join(process.cwd(),relative)),{recursive:true});
    await writeFile(path.join(process.cwd(),relative),JSON.stringify(config,null,2)+"\n",{flag:"wx"});
    return Response.json({path:relative});
  } catch { return Response.json({error:"Konfiguration konnte nicht gespeichert werden."},{status:400}); }
}
