/**
 * Peshala & Pubudu – Wedding RSVP + Wishes endpoint
 *
 * POST  sheet=RSVP  name, phone, attendance, guests, message, invitedAs
 * POST  sheet=WISH  name, message, invitedAs
 *
 * Sheets "RSVP" and "Wishes" are created automatically with styled headers.
 */

const SPREADSHEET_ID = '16Y_7i508gYbbcPSgSy24fj4ls6UIeRaIY9brTR94hbw';

const SHEETS = {
  RSVP: {
    name: 'RSVP',
    headers: ['Timestamp', 'Guest Name', 'Phone', 'Attendance', 'No. of Guests', 'Message / Notes', 'Invited As'],
    widths: [170, 200, 130, 120, 110, 320, 200],
    textColumns: [3], // Phone – keep leading zeros
  },
  WISH: {
    name: 'Wishes',
    headers: ['Timestamp', 'Name', 'Message', 'Invited As'],
    widths: [170, 200, 420, 200],
    textColumns: [],
  },
};

const HEADER_BG = '#2d1146';
const HEADER_FG = '#e9c766';

// ---------------------------------------------------------------------------
// Web app entry points
// ---------------------------------------------------------------------------

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    const payload = parsePayload_(e);
    const key = String(payload.sheet || '').toUpperCase();
    const config = SHEETS[key];

    if (!config) {
      return jsonResponse_({ ok: false, error: 'Invalid sheet. Use RSVP or WISH.' });
    }

    const name = clip_(payload.name, 120);
    if (!name) {
      return jsonResponse_({ ok: false, error: 'Name is required.' });
    }

    const sheet = getOrCreateSheet_(config);
    let row;

    if (key === 'RSVP') {
      row = [
        new Date(),
        safe_(name),
        safe_(clip_(payload.phone, 30)),
        safe_(clip_(payload.attendance, 30)),
        safe_(clip_(payload.guests, 10)),
        safe_(clip_(payload.message || payload.dietaryRestrictions, 1000)),
        safe_(clip_(payload.invitedAs, 120)),
      ];
    } else {
      const message = clip_(payload.message, 1000);
      if (!message) {
        return jsonResponse_({ ok: false, error: 'Message is required.' });
      }
      row = [
        new Date(),
        safe_(name),
        safe_(message),
        safe_(clip_(payload.invitedAs, 120)),
      ];
    }

    sheet.appendRow(row);
    return jsonResponse_({ ok: true });
  } catch (error) {
    return jsonResponse_({
      ok: false,
      error: String(error && error.message ? error.message : error),
    });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return jsonResponse_({
    ok: true,
    message: 'Peshala & Pubudu wedding endpoint is running.',
  });
}

/** Run once from the Apps Script editor to create both sheets (optional – they also auto-create). */
function setup() {
  Object.keys(SHEETS).forEach(function (key) {
    getOrCreateSheet_(SHEETS[key]);
  });
}

// ---------------------------------------------------------------------------
// Sheet helpers
// ---------------------------------------------------------------------------

function getOrCreateSheet_(config) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(config.name);

  if (!sheet) {
    sheet = ss.insertSheet(config.name);
  }

  if (sheet.getLastRow() === 0) {
    writeHeaders_(sheet, config);
  }

  return sheet;
}

function writeHeaders_(sheet, config) {
  const cols = config.headers.length;
  const header = sheet.getRange(1, 1, 1, cols);

  header
    .setValues([config.headers])
    .setFontWeight('bold')
    .setFontColor(HEADER_FG)
    .setBackground(HEADER_BG)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 32);

  config.widths.forEach(function (width, i) {
    sheet.setColumnWidth(i + 1, width);
  });

  // Timestamp column formatting
  sheet.getRange('A2:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');

  // Plain-text columns (e.g. phone numbers)
  config.textColumns.forEach(function (col) {
    sheet.getRange(2, col, sheet.getMaxRows() - 1, 1).setNumberFormat('@');
  });

  // Wrap long text
  sheet.getRange(2, 1, sheet.getMaxRows() - 1, cols).setWrap(true).setVerticalAlignment('top');

  // Remove unused columns for a tidy look
  const extra = sheet.getMaxColumns() - cols;
  if (extra > 0) {
    sheet.deleteColumns(cols + 1, extra);
  }
}

// ---------------------------------------------------------------------------
// Request / response helpers
// ---------------------------------------------------------------------------

function parsePayload_(e) {
  const params = e && e.parameter ? e.parameter : {};

  if (Object.keys(params).length > 0) {
    return params;
  }

  const contents = e && e.postData && e.postData.contents ? e.postData.contents : '';
  if (!contents) {
    return {};
  }

  if (contents.indexOf('=') !== -1 && contents.indexOf('{') !== 0) {
    return parseQueryString_(contents);
  }

  try {
    return JSON.parse(contents);
  } catch (_error) {
    return {};
  }
}

function parseQueryString_(query) {
  const out = {};
  const pairs = String(query).split('&');

  for (let i = 0; i < pairs.length; i++) {
    const part = pairs[i];
    if (!part) continue;

    const idx = part.indexOf('=');
    const rawKey = idx >= 0 ? part.slice(0, idx) : part;
    const rawValue = idx >= 0 ? part.slice(idx + 1) : '';
    const key = decodeURIComponent(rawKey.replace(/\+/g, ' '));
    const value = decodeURIComponent(rawValue.replace(/\+/g, ' '));

    out[key] = value;
  }

  return out;
}

function clip_(value, max) {
  return String(value == null ? '' : value).trim().slice(0, max);
}

/** Stops spreadsheet formula injection (values starting with = + - @). */
function safe_(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
