export function SourceBadge({ source }: { source?: string }) {
  if (!source) return null;
  const s = source.toUpperCase();
  const map: Record<string, string> = {
    OFFICIAL: 'official',
    COMMUNITY_REPORT: 'community',
    AUTOMATED_ESTIMATE: 'estimate',
  };
  const kind = map[s] || 'community';
  return (
    <span className={`source-badge ${kind}`}>
      {s.replace(/_/g, ' ')}
    </span>
  );
}
