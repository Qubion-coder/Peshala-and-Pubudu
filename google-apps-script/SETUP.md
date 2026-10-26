# Google Sheets setup (RSVP + Wishes)

Spreadsheet: https://docs.google.com/spreadsheets/d/16Y_7i508gYbbcPSgSy24fj4ls6UIeRaIY9brTR94hbw/edit

1. Open the spreadsheet and go to **Extensions > Apps Script**.
2. Replace everything in `Code.gs` with the contents of `google-apps-script/code.gs`. Save.
3. (Optional) Select the `setup` function and click **Run** once. Approve the permissions.
   This creates the **RSVP** and **Wishes** tabs with styled headers. If you skip this,
   they are created automatically on the first submission.
4. Click **Deploy > New deployment**, type **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Deploy and copy the Web App URL (ends with `/exec`).
6. In the project root create `.env` (see `.env.example`):

   ```
   VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXX/exec
   ```

7. Restart the Vite dev server. On your hosting provider (Vercel / Netlify), add the same
   environment variable and redeploy.

Notes:
- After editing the Apps Script later, use **Deploy > Manage deployments > Edit > New version**
  so the same URL keeps working.
- RSVP columns: Timestamp, Guest Name, Phone, Attendance, No. of Guests, Message / Notes, Invited As
- Wishes columns: Timestamp, Name, Message, Invited As
- `Invited As` is the personalised name from the invitation link (e.g. "Mr. & Mrs. Perera").
