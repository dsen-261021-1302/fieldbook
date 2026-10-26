# Sure Power FieldBook

**Open it:** https://dsen-261021-1302.github.io/fieldbook/

FieldBook is the field app for Sure Power UPS Rental technicians. One **job** holds the Work Order, one checklist per asset, and the photos. When you're done (or at the end of each day) you tap **Send** and get **one PDF + one CSV** to email, text or drop in Drive. Both files go into the rental database.

It runs in the phone or laptop browser, installs like an app, and works with no signal.

## Install (once per device)

- **iPhone / iPad:** open the link in **Safari** → Share button → **Add to Home Screen**.
- **Android:** open the link in **Chrome** → ⋮ menu → **Install app** (or **Add to Home screen**).
- **Laptop (Chrome or Edge):** open the link → install icon at the right of the address bar.

Open it once with signal after installing. After that it opens anywhere.

## Using it

1. **+ New job** → job #, site, assets, technician.
2. **Work Order**: fill in the fields, the QTY / TYPE / DESCRIPTION rows and comments. The S.P.I. rep and the customer sign with a finger. These two signatures also print on every checklist.
3. **+ Add checklist**: pick the checklist and the asset #. One checklist per asset.
4. **Required screen photos** (top of the checklist): take each listed screen. Drag the red corners to crop to the display, or **Use whole photo**. Each row shows the TMEIC screen code and how to get there. Extra photos are optional: use **Extra photo** in any section, and add notes to any photo.
5. Tick each line, add notes or settings, then tick **CERT** for the section yourself. "Mark all passed" never ticks CERT.
6. **Photos not permitted at this site** (job screen): turn it on only when the site bans photos, and give the reason. Required screen photos are skipped, and the PDF (page 1) and CSV state the reason.
7. **Photos** (on the job screen): damage, nameplates, site conditions.
8. **Send PDF + CSV**. Send as often as you like. Each send is a complete copy of the whole job.
9. **Job done: clear this job…** only after the final send. Cleared jobs can be restored for 7 days.

Photos are checked for blur, glare and darkness and saved at **80 kB or less** each, so a full startup with photos is about 1 MB.

## What's in the files

- **PDF**: the Work Order page (laid out like the Sure Power Work Order), then each checklist with a header on every page, PASS checkmarks, notes, CERT rows, readings, comments and signatures. **Checklist pages carry no photos, so they look the same on every job.** All photos come last (printing optional): required screens in order, with any missing ones marked MISSING, then extra photos tagged to their section, then job photos. Page 1 says which pages are photos. Every page has "page n of N" and the pack version.
- **CSV**: one row per Work Order field, checklist line (PASS / OPEN), reading, CERT, required screen photo (TAKEN / MISSING) and photo, for Excel and the Trailer History Generator.

## Privacy: important

Jobs, photos and signatures stay **on the device** until you send them. Nothing is uploaded anywhere by the app.

**Never upload a job, PDF, CSV, photo or signature to this repository.** This repository is public and holds only the blank app.

Phone storage can be cleared by the phone itself when space runs low. **Send your progress at the end of each day.** The app reminds you.

## Checklists (content packs)

Checklist content lives in `packs/` as data, so a new checklist is a new file, not new code.

| Pack | Checklist | Version |
|---|---|---|
| `g9k1m-sms` | G9K1M SMS Startup Checklist, Toshiba G9000 1000 kVA SMS. 15 required screen photos (TMEIC L300 screen tree 3JAA0004) | 1.1.0 (2026-10-26) |

Planned: G9000 225 / 500 kVA SMS, Toshiba standalone, Vertiv / NPower PM, load test.

## Developer mode

Enter job # **LTCOLUMBO** to create a synthetic demo job (fake screens, fake readings). Automated test: `tests/e2e.js` (Playwright; run against a local server, `node tests/e2e.js <photo-folder> <out-folder>`; test photos are kept locally, never in this repo).

## Change log

- **0.2.1 · 2026-10-26**: "Photos not permitted at this site" switch with a required reason (and optional who said so), shown on the Work Order page and in the CSV.

- **0.2.0 · 2026-10-26**: Photos moved out of the checklist pages to the end of the PDF (printing optional). Each pack lists its minimum required screen photos; Send warns about missing ones; the CSV lists each as TAKEN or MISSING. Photo notes print under the photo.

- **0.1.0 · 2026-10-26**: First version. Jobs, Work Order with on-device signatures, G9K1M SMS startup checklist, per-section photos with crop and 80 kB compression, job photos, Send one PDF + one CSV, offline install, 7-day cleared-job restore, LTCOLUMBO demo.

Owner: Don Senavitis, Sure Power, Inc.
