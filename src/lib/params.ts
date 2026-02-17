export function getInterface(url: URL): string | undefined {
  return url.searchParams.get('interface') ?? undefined;
}

export function getLimit(url: URL, defaultLimit = 10, max = 100): number {
  const raw = url.searchParams.get('limit');
  if (!raw) return defaultLimit;
  const n = parseInt(raw, 10);
  return isNaN(n) ? defaultLimit : Math.min(Math.max(1, n), max);
}

export function getMinVotePct(url: URL): number {
  const raw = url.searchParams.get('minVotePct');
  if (!raw) return 0;
  const n = parseFloat(raw);
  return isNaN(n) ? 0 : Math.min(Math.max(0, n), 100);
}

export function getTagFilter(url: URL): string {
  return url.searchParams.get('tagFilter')?.toLowerCase() ?? '';
}

export function getRefer(url: URL): string | undefined {
  return url.searchParams.get('refer') ?? url.searchParams.get('ref') ?? undefined;
}
