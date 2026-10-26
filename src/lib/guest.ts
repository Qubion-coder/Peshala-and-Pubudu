export const GUEST_PREFIXES = ['Mr.', 'Mrs.', 'Miss', 'Mr. & Mrs.', 'Family', 'Dear'] as const;
export type GuestPrefix = (typeof GUEST_PREFIXES)[number];

// Short codes carried in the invitation link (?p=...) so the site can rebuild the display name.
// "Dear" has no code: it only affects the greeting, never the display name.
const PREFIX_CODES: Record<GuestPrefix, string | null> = {
  'Mr.': 'mr',
  'Mrs.': 'mrs',
  'Miss': 'miss',
  'Mr. & Mrs.': 'mrmrs',
  'Family': 'family',
  'Dear': null,
};

export const normalizeName = (name: string) =>
  name
    .replace(/\s+/g, ' ')
    .trim()
    // "Dear" is added by the greeting, so never keep it inside the name itself
    .replace(/^dear\s+/i, '');

export function buildDisplayName(prefix: GuestPrefix, rawName: string): string {
  const name = normalizeName(rawName);
  if (!name) return '';

  switch (prefix) {
    case 'Family':
      return `${name} and Family`;
    case 'Dear':
      return name;
    default:
      return `${prefix} ${name}`;
  }
}

export const buildGreeting = (displayName: string) => `Dear ${displayName} ❤️`;

export function buildInvitationLink(baseUrl: string, prefix: GuestPrefix, rawName: string): string {
  const name = normalizeName(rawName);
  const code = PREFIX_CODES[prefix];
  const base = baseUrl.replace(/\/+$/, '');
  return `${base}/${encodeURIComponent(name)}${code ? `?p=${code}` : ''}`;
}

export function buildInvitationMessage(opts: {
  displayName: string;
  link: string;
  groomName: string;
  brideName: string;
}): string {
  return `${buildGreeting(opts.displayName)}

With joyful hearts, we warmly invite you to celebrate one of the most special days of our lives as we begin our journey together.

Please view our wedding invitation and all the event details through the link below 🌐:

${opts.link}

Your presence would truly mean the world to us, and we would be honored to celebrate this beautiful moment together.

With love,
❤️ ${opts.groomName} & ${opts.brideName}`;
}

/** Reads the guest from the current URL (`/{guestName}?p=code`). Returns '' when not personalised. */
export function getGuestDisplayNameFromUrl(location: Location = window.location): string {
  const segment = location.pathname.split('/').filter(Boolean)[0];
  if (!segment) return '';

  let name: string;
  try {
    name = normalizeName(decodeURIComponent(segment));
  } catch {
    return '';
  }
  if (!name) return '';

  const code = new URLSearchParams(location.search).get('p')?.toLowerCase();
  const prefix =
    (Object.keys(PREFIX_CODES) as GuestPrefix[]).find((p) => PREFIX_CODES[p] === code) ?? 'Dear';
  return buildDisplayName(prefix, name);
}
