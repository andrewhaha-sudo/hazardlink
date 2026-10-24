export function SeverityBadge({ severity }: { severity?: string }) {
  if (!severity) return null;
  const cls = `severity-badge severity-${severity.toLowerCase()}`;
  return <span className={cls}>{severity.charAt(0).toUpperCase() + severity.slice(1)}</span>;
}
