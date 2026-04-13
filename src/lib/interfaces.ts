const INTERFACES: Record<string, string> = {
  'peakd':          'https://peakd.com',
  'ecency':         'https://ecency.com',
  'leofinance':     'https://leofinance.io',
  'inleo':          'https://inleo.io',
  'hivelist':       'https://hivelist.io',
  'splintertalk':   'https://www.splintertalk.io',
  'weedcash':       'https://weedcash.network',
  'naturalmedicine':'https://naturalmedicine.io',
  'ctptalk':        'https://ctptalk.com',
  // Legacy — kept for backwards compat
  'ulogs':          'https://ulogs.org',
  'steempeak':      'https://peakd.com',
  'esteem':         'https://ecency.com',
  'reggaejahm':     'https://reggaejahm.com',
  'sportstalk':     'https://sportstalksocial.com',
  'hivehustlers':   'https://hivehustlers.io',
  'wearealive':     'https://wearealiveand.social',
  'musicforlife':   'https://musicforlife.io',
  'blocktunes':     'https://hive.blocktunes.net',
  'beatzchain':     'https://beatzchain.com',
  'dunksocial':     'https://dunksocial.io',
};

const DEFAULT_BASE = 'https://hive.blog';

/** Main frontends shown on the home page interface picker (all slugs still work via `INTERFACES`). */
export const INTERFACE_QUERY_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: '', label: 'hive.blog (default)' },
  { value: 'peakd', label: 'PeakD' },
  { value: 'ecency', label: 'Ecency' },
  { value: 'inleo', label: 'InLeo' },
];

export function getInterfaceBase(iface?: string): string {
  if (!iface) return DEFAULT_BASE;
  return INTERFACES[iface.toLowerCase()] ?? DEFAULT_BASE;
}

export function makeFeedItemUrl(path: string, iface?: string, refer?: string): string {
  const url = `${getInterfaceBase(iface)}${path}`;
  return refer ? `${url}?ref=${refer}` : url;
}

export function makeTagUrl(category: string, tag: string, iface?: string, refer?: string): string {
  const url = `${getInterfaceBase(iface)}/${category}/${tag}`;
  return refer ? `${url}?ref=${refer}` : url;
}

export function makeAuthorUrl(username: string, type: string, iface?: string, refer?: string): string {
  const url = `${getInterfaceBase(iface)}/@${username}/${type}`;
  return refer ? `${url}?ref=${refer}` : url;
}
