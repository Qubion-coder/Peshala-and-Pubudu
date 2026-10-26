const SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyS4iIaMkQpnQPKM21Nwjf0I8FG--PznXJ514nlaeotEZ6gY8IQFVCosXG3-LtGb4MI/exec';

export interface SheetWish {
  name: string;
  message: string;
  createdAt: string;
}

export async function submitToSheet(sheet: 'RSVP' | 'WISH', fields: Record<string, string>) {
  if (!SCRIPT_URL) {
    throw new Error('VITE_GOOGLE_APPS_SCRIPT_URL is not configured.');
  }

  // Form-encoded body keeps this a "simple" request; Apps Script reads it from e.parameter.
  // no-cors means the response is opaque, so a resolved fetch is treated as success.
  await fetch(SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: new URLSearchParams({ sheet, ...fields }),
  });
}

export async function fetchWishes(): Promise<SheetWish[]> {
  if (!SCRIPT_URL) return [];

  const res = await fetch(`${SCRIPT_URL}?action=wishes`);
  const data = await res.json();
  return data && data.ok && Array.isArray(data.wishes) ? data.wishes : [];
}
