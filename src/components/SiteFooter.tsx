export function SiteFooter() {
  return (
    <footer className="relative border-t border-line/5 bg-void/45 backdrop-blur-[2px] px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-2">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-text-meta">
          Thimofej Zapko · Bochum
        </p>
        <p className="text-sm text-text-muted">
          © {new Date().getFullYear()} Thimofej Zapko. Built in the open.
        </p>
      </div>
    </footer>
  );
}
