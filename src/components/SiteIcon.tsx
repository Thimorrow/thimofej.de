type SiteIconName = "arrow-up-right" | "arrow-right" | "arrow-down" | "replay" | "sound-on" | "sound-off";

/** One optical grid and stroke weight for the portfolio's small controls. */
export function SiteIcon({ name, className = "" }: { name: SiteIconName; className?: string }) {
  return (
    <svg
      className={`site-icon ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {name === "arrow-up-right" && <path d="M6 18 18 6M6 6h12v12" />}
      {name === "arrow-right" && <path d="M4 12h16m-7-7 7 7-7 7" />}
      {name === "arrow-down" && <path d="M12 4v16m-7-7 7 7 7-7" />}
      {name === "replay" && <path d="M4 10a8 8 0 1 1 .6 5M4 4v6h6" />}
      {(name === "sound-on" || name === "sound-off") && <path d="m11 4-6 5H2v6h3l6 5V4Z" />}
      {name === "sound-on" && <><path d="M15 8a6 6 0 0 1 0 8" /><path d="M18 5a10 10 0 0 1 0 14" /></>}
      {name === "sound-off" && <path d="m16 9 6 6m0-6-6 6" />}
    </svg>
  );
}
