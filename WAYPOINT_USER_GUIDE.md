# Waypoint User Guide

Waypoint is an offline-first shared travel wallet. It keeps trips, flights, rail tickets, hotel reservations, restaurant bookings, activity passes, barcodes, and attached documents together on a phone. It does not require user accounts or ask you to choose a device owner.

**Waypoint app address:** https://teeceegee.github.io/waypoint/

> Your travel data is stored locally on your device. It is not uploaded to GitHub. Export regular backups because clearing browser data, wiping Waypoint, or losing the device can remove the only copy.

## Contents

- [Open or install Waypoint](#open-or-install-waypoint)
- [First launch](#first-launch)
- [Use Waypoint](#use-waypoint)
- [Understand the two kinds of JSON file](#understand-the-two-kinds-of-json-file)
- [Load an incremental update](#load-an-incremental-update)
- [Ask an AI to create the JSON file](#ask-an-ai-to-create-the-json-file)
- [Incremental JSON structure](#incremental-json-structure)
- [JSON examples](#json-examples)
- [Back up and restore Waypoint](#back-up-and-restore-waypoint)
- [Move data to another device](#move-data-to-another-device)
- [Work offline and receive updates](#work-offline-and-receive-updates)
- [Troubleshooting](#troubleshooting)

## Open or install Waypoint

Open Waypoint at https://teeceegee.github.io/waypoint/. It can be used in a normal browser tab or installed on a phone like an app.

### iPhone or iPad

Safari is the recommended installation route:

1. Open [Waypoint](https://teeceegee.github.io/waypoint/) in **Safari**.
2. Tap the **Share** button (a square with an upward arrow).
3. Scroll down and tap **Add to Home Screen**.
4. Check that the name is **Waypoint**.
5. Tap **Add**.
6. Launch Waypoint from its new Home Screen icon.

If **Add to Home Screen** is not visible, scroll to the bottom of the Share sheet and choose **Edit Actions**.

### Android

1. Open [Waypoint](https://teeceegee.github.io/waypoint/) in Chrome.
2. Open Chrome's three-dot menu.
3. Tap **Install app** or **Add to Home screen**.
4. Confirm the installation.
5. Launch Waypoint from its app icon.

### Computer

Waypoint also works in a normal browser. A supporting desktop browser may show an install icon in the address bar or an **Install Waypoint** command in its menu.

## First launch

Waypoint has no predefined users or separate accounts. Each installation contains one local travel wallet and supports groups of up to 12 travellers.

If no trips have been loaded, Waypoint displays **No Trips Scheduled**. Use the database button in the top-right corner to import an update or restore a backup.

After a JSON file containing passenger IDs is imported, Waypoint asks you to choose one traveller. It then shows that traveller's items together with all items labelled `shared`. The choice is remembered on that device.

## Use Waypoint

### Choose a traveller

Waypoint builds its passenger list dynamically from the distinct `travelerId` values in imported JSON. It does not contain any hardcoded passenger names.

When prompted, choose one traveller. To switch later, use the traveller selector in the header. Only one traveller can be selected at a time. The selected view contains:

- trips and passes carrying that traveller's ID; and
- trips and passes labelled `shared`.

The selection is a display filter, not a sign-in or security control. Anyone with access to the device can switch travellers.

### Open a trip

1. After choosing a traveller, tap a trip card under **Scheduled Trips**.
2. The trip opens as a timeline of flights, trains, hotels, restaurants, activities, buses, and other passes.
3. Tap the back arrow in the header to return to the trip list.

### Open a pass

Tap a pass in a trip timeline. The details screen can show:

- date, time, and location;
- terminal, gate, or seat information;
- confirmation code and notes;
- a QR, PDF417, Aztec, or Code 128 barcode;
- an attached PDF or image.

When presenting a barcode, increase the phone's brightness and make sure the correct barcode type and exact barcode content were imported.

### Open data tools

Tap the **database button** in the top-right corner. This opens four areas:

1. **Import Incremental Updates** — create, change, or delete selected trips and passes.
2. **Export Backup** — download or copy a complete backup.
3. **Import Backup / Restore** — replace all local data with a complete backup.
4. **Danger Zone** — permanently wipe local trips, passes, and attachments.

## Understand the two kinds of JSON file

Waypoint uses two different JSON formats. They are not interchangeable.

| JSON type | Purpose | Where to load it | Effect |
|---|---|---|---|
| **Incremental update** | Add, change, or delete particular trips and passes | **Upload Update JSON File** | Merges changes into existing data |
| **Full backup** | Preserve or transfer the complete local database | **Upload Backup JSON File** or **Restore JSON Data** | Erases current local data and replaces it with the backup |

**Use an incremental update for routine changes. Use a full backup for recovery or moving the entire wallet to another device.**

The paste box labelled **Or Paste JSON String** belongs to full backup restore. Do not paste an incremental update there.

## Load an incremental update

An incremental update is a `.json` file containing one or both of these top-level arrays:

- `trips`
- `passes`

To load one:

1. Open Waypoint.
2. Tap the **database button**.
3. Find **Import Incremental Updates**.
4. Tap **Upload Update JSON File**.
5. Select the `.json` file from Files, iCloud Drive, Google Drive, Downloads, or another available location.
6. Wait for the result message.
7. Confirm that the reported numbers of upserted and deleted trips and passes are sensible.
8. Choose one traveller from the passenger IDs found in the imported file.
9. Return to the main screen and check the affected traveller and trip.

If the file contains only `shared` records, Waypoint has no passenger list to present and does not show the selection question.

Waypoint processes trips before passes. A single file can therefore create a new trip and then add passes that refer to it.

## Ask an AI to create the JSON file

An AI assistant such as ChatGPT can collect booking details and turn them into a Waypoint incremental update. It can work from:

- a connected email account;
- confirmation emails or text pasted into the conversation;
- uploaded PDFs, tickets, screenshots, calendar entries, or itinerary documents; and
- an existing Waypoint JSON file that needs updating.

ChatGPT cannot search an inbox unless the relevant email plugin is connected and permitted for the current account or workspace. If email access is unavailable, download or print the relevant messages and provide them as files instead. OpenAI's current email workflow guidance is available at [Get your email to inbox zero](https://learn.chatgpt.com/use-cases/manage-your-inbox).

### Before asking the AI

1. Decide which trip, dates, and inboxes should be searched.
2. Connect the appropriate Gmail or Outlook Email plugin if it is available, or gather the emails and attachments yourself.
3. Give the AI the [Waypoint JSON instructions](./llm_json_instructions.md), or provide this repository URL:
   `https://github.com/teeceegee/waypoint/blob/main/llm_json_instructions.md`
4. If this is an update to existing Waypoint data, also provide the previous incremental JSON or a current backup so the AI can preserve existing slugs.
5. Decide how each passenger should be identified. Use one stable lowercase `travelerId` per person and no more than 12 passenger IDs.

Booking confirmations, barcodes, and backups contain sensitive information. Use only an AI service and account you trust, provide no more information than necessary, and do not paste the resulting JSON into a public conversation or commit it to a public repository.

### Use a two-stage request

Ask the AI to review the evidence before it writes JSON. This makes missing or conflicting details easier to catch.

Copy and adapt this first prompt:

```text
Help me prepare an incremental JSON update for the Waypoint travel wallet.

Search my connected email and inspect the files I have provided for travel relating to:
- destination or trip: [describe the trip]
- date range: [start date to end date]
- likely booking names, airlines, hotels, rail operators, or senders: [list any clues]

Follow the Waypoint schema in llm_json_instructions.md.

Do not create the JSON yet. First give me a concise evidence table containing:
- each trip or booking you found;
- the source email or document;
- passenger name;
- date and local time;
- location, terminal, platform, gate, seat, and confirmation code when present;
- whether an exact barcode type and barcode content were found; and
- anything missing, uncertain, or contradictory.

Never guess a booking detail, passenger, barcode value, date, or time. Ask me to resolve uncertainties before continuing.

Derive one stable lowercase travelerId from each passenger name. Use shared for trip details and bookings that apply to everyone. Use passenger-specific travelerIds only for individual seats, tickets, barcodes, booking references, or documents. Support no more than 12 passengers.
```

Check the evidence table against the original messages and documents. Correct mistakes and answer the AI's questions before asking for the file.

When the evidence is correct, use this follow-up prompt:

```text
Now create the final Waypoint incremental update.

Return one valid JSON object containing trips and/or passes. Follow llm_json_instructions.md exactly.

Requirements:
- use action: upsert;
- use stable, unique, lowercase slugs;
- make a group trip shared;
- assign each personal ticket or booking to the correct travelerId;
- include every required field for a new record;
- omit unknown optional values instead of guessing them;
- use barcodeType: none when no exact barcode data was found;
- include barcodeContent only when it was extracted exactly from the source;
- do not abbreviate Base64 attachment data;
- do not add explanations, comments, citations, Markdown fences, or fields outside the Waypoint schema.

Check that the result is valid JSON before returning it. If you cannot satisfy a required field, stop and tell me what is missing instead of producing an invalid file.
```

### Check and save the result

Before importing the AI-generated file:

1. Confirm every passenger has the intended `travelerId` and that there are no more than 12.
2. Confirm a group trip is `shared`, so every selected passenger can see it.
3. Compare dates, local times, locations, seats, and confirmation codes with the original booking.
4. Treat barcode data especially carefully. An AI must not reconstruct or guess barcode content from the visible appearance of a code.
5. Confirm that every pass's `tripSlug` exactly matches a trip slug already in Waypoint or created in the same file.
6. Copy only the JSON into a plain-text file and save it with a `.json` extension, for example `waypoint-update-paris-2026.json`. If the AI offers a downloadable file, confirm that its contents are plain JSON before using it.
7. Import it through **Upload Update JSON File**, review Waypoint's import totals, choose one passenger, and inspect the resulting trip and passes.

Large PDF or image attachments encoded as Base64 can make a conversation and JSON file very large. It is often safer to create and verify the trip and pass records first, then add attachments in a separate update. Keep the original tickets available even when a barcode or attachment has been imported successfully.

## Incremental JSON structure

The top level is a JSON object. It may contain `trips`, `passes`, or both:

```json
{
  "trips": [],
  "passes": []
}
```

Every item requires:

- an `action`: `"upsert"` or `"delete"`;
- a stable, unique `slug` that identifies the record.

### Actions

| Action | Meaning |
|---|---|
| `"upsert"` | Create the record if the slug is new, or merge supplied fields into the existing record |
| `"delete"` | Delete the record with that slug |

When updating an existing record, include only `action`, `slug`, and the fields that should change. Fields you omit are preserved.

When creating a record, `travelerId` is optional and defaults to `shared`. For an individual booking, provide any stable passenger ID. Waypoint converts IDs to lowercase and supports no more than 12 distinct passenger IDs in the wallet.

Deleting a trip also deletes its associated passes and their attachments. Deleting a pass also deletes its attached document.

### Slugs

A slug should remain unchanged for the lifetime of a record. Use lowercase words separated by hyphens, for example:

- `trip-copenhagen-2026`
- `pass-ba812-passenger-1`
- `pass-ba812-passenger-2`
- `pass-hotel-copenhagen-shared`

Trip and pass slugs must be unique within their respective collections. Give individual travellers separate pass slugs.

### Trip fields

| Field | Required for a new trip? | Format or values | Description |
|---|---:|---|---|
| `action` | Yes | `upsert` or `delete` | Operation to perform |
| `slug` | Yes | Unique string | Stable trip identifier |
| `name` | Yes | Text | Name shown on the trip card |
| `destination` | Yes | Text | Main destination |
| `startDate` | Yes | `YYYY-MM-DD` | First day of the trip |
| `endDate` | Yes | `YYYY-MM-DD` | Last day of the trip |
| `travelerId` | No | Passenger ID or `shared` | Dynamic passenger filter; defaults to `shared` |
| `description` | No | Text | Optional summary or note |

For `action: "delete"`, only `action` and `slug` are needed.

### Pass fields

| Field | Required for a new pass? | Format or values | Description |
|---|---:|---|---|
| `action` | Yes | `upsert` or `delete` | Operation to perform |
| `slug` | Yes | Unique string | Stable pass identifier |
| `tripSlug` | Yes | Existing trip slug | Links the pass to a trip |
| `title` | Yes | Text | Main pass title |
| `type` | Yes | See pass types below | Controls presentation |
| `travelerId` | No | Passenger ID or `shared` | Dynamic passenger filter; defaults to `shared` |
| `date` | Yes | `YYYY-MM-DD` | Pass date |
| `time` | No | `HH:MM` | Local time in 24-hour format |
| `location` | Yes | Text | Airport, station, hotel, venue, or address |
| `gate` | No | Text | Terminal, platform, gate, or similar detail |
| `seat` | No | Text | Seat, room, coach, or table detail |
| `confirmationCode` | No | Text | Booking reference |
| `barcodeType` | Yes | `aztec`, `pdf417`, `qr`, `code128`, or `none` | Barcode format |
| `barcodeContent` | No | Exact text | Raw data encoded in the barcode |
| `notes` | No | Text | Additional instructions |
| `mapsUrl` | No | URL | Apple Maps or Google Maps link for the destination |
| `website` | No | URL | Official venue, attraction, restaurant, or hotel website |
| `attachment` | No | Object | Embedded PDF or image |

For a pass with no barcode, set `"barcodeType": "none"` and omit `barcodeContent`.

### Website Links & Maps Integration

- **`website`:** Provide a direct URL to the official attraction, restaurant, or provider website. Waypoint renders a dedicated website button on both the timeline card and the details modal.
- **`mapsUrl`:** Provide an Apple Maps or Google Maps URL. Waypoint is **OS-aware** (opens Apple Maps on Apple devices and translates queries to Google Maps on Android/other devices).

### Pass types & styling

The `type` field accepts:

| Value | Appearance & Color | Intended use |
|---|---|---|
| `flight` | Blue boarding pass | Flight or boarding pass |
| `train` | Amber railway ticket | Rail ticket |
| `bus` | Amber coach ticket | Bus or coach ticket |
| `hotel` | Emerald green key card | Hotel or accommodation booking |
| `restaurant` | Crimson reservation slip | Restaurant reservation |
| `activity` | **Clean white event ticket** | Event, attraction, tour, or activity |
| `other` | Slate grey pass | Anything that does not fit another type |

### Attachment structure

An attachment is stored inside a pass update:

```json
"attachment": {
  "fileName": "boarding-pass.pdf",
  "fileType": "application/pdf",
  "dataUrl": "data:application/pdf;base64,JVBERi0xLjQK..."
}
```

| Field | Meaning |
|---|---|
| `fileName` | Name shown for the file |
| `fileType` | MIME type, such as `application/pdf` or `image/png` |
| `dataUrl` | The complete file encoded as a Base64 Data URL |

The `...` in the example is only an abbreviation. A real import must contain the complete Base64 content. Attachments increase the JSON file size and use storage on every device that imports them.

## JSON examples

### Create a trip and two passes

```json
{
  "trips": [
    {
      "action": "upsert",
      "slug": "trip-paris-2026",
      "name": "Paris Weekend",
      "destination": "Paris, France",
      "startDate": "2026-09-18",
      "endDate": "2026-09-21",
      "description": "Long weekend in Paris"
    }
  ],
  "passes": [
    {
      "action": "upsert",
      "slug": "pass-eurostar-outbound-passenger-1",
      "tripSlug": "trip-paris-2026",
      "title": "Eurostar to Paris — Passenger 1",
      "type": "train",
      "travelerId": "passenger-1",
      "date": "2026-09-18",
      "time": "08:01",
      "location": "London St Pancras International",
      "gate": "International Departures",
      "seat": "Coach 7, Seat 42",
      "confirmationCode": "ABC123",
      "barcodeType": "qr",
      "barcodeContent": "EXACT-BARCODE-CONTENT-HERE",
      "notes": "Arrive at least 60 minutes before departure."
    },
    {
      "action": "upsert",
      "slug": "pass-paris-hotel-shared",
      "tripSlug": "trip-paris-2026",
      "title": "Paris Hotel",
      "type": "hotel",
      "date": "2026-09-18",
      "time": "15:00",
      "location": "12 Rue Exemple, Paris",
      "confirmationCode": "HOTEL456",
      "barcodeType": "none",
      "notes": "Check-out by 11:00 on 21 September."
    }
  ]
}
```

### Update one field on an existing pass

This changes the seat while preserving every other field:

```json
{
  "passes": [
    {
      "action": "upsert",
      "slug": "pass-eurostar-outbound-passenger-1",
      "seat": "Coach 8, Seat 21"
    }
  ]
}
```

### Add a barcode and attachment to an existing pass

```json
{
  "passes": [
    {
      "action": "upsert",
      "slug": "pass-eurostar-outbound-passenger-1",
      "barcodeType": "qr",
      "barcodeContent": "EXACT-BARCODE-CONTENT-HERE",
      "attachment": {
        "fileName": "eurostar-passenger-1.pdf",
        "fileType": "application/pdf",
        "dataUrl": "data:application/pdf;base64,COMPLETE-BASE64-DATA-HERE"
      }
    }
  ]
}
```

### Delete a pass

```json
{
  "passes": [
    {
      "action": "delete",
      "slug": "pass-eurostar-outbound-passenger-1"
    }
  ]
}
```

### Delete a trip and everything in it

```json
{
  "trips": [
    {
      "action": "delete",
      "slug": "trip-paris-2026"
    }
  ]
}
```

For additional machine-oriented instructions, see [`llm_json_instructions.md`](./llm_json_instructions.md).

## Back up and restore Waypoint

### Download a full backup

1. Tap the **database button**.
2. Find **Export Backup**.
3. Tap **Download JSON**.
4. Save the file somewhere protected, such as iCloud Drive or Google Drive.

The filename includes the date, for example `waypoint-backup-2026-08-14.json`.

The backup includes trips, passes, and Base64-encoded attachments. Its top-level structure resembles:

```json
{
  "app": "waypoint",
  "version": 2,
  "exportedAt": "2026-08-14T12:00:00.000Z",
  "data": {
    "trips": [],
    "passes": [],
    "attachments": []
  }
}
```

Do not normally edit a full backup by hand. Use an incremental update for routine changes.

### Copy a full backup

Tap **Copy JSON Code** to place the complete backup on the clipboard. This can be useful for temporary transfer, but a downloaded file is safer for long-term storage.

### Restore a full backup

**Restoring replaces all Waypoint data currently stored on that device.**

1. Export the current device first if it contains anything worth keeping.
2. Tap the **database button**.
3. Find **Import Backup / Restore**.
4. Tap **Upload Backup JSON File** and choose a Waypoint backup.
5. Wait for the success message.
6. Choose one traveller from the passenger IDs restored from the backup.
7. Check that the selected traveller's items and all shared items are present.

Alternatively, paste a complete backup into **Or Paste JSON String** and tap **Restore JSON Data**.

Waypoint accepts a restore only when the JSON has `"app": "waypoint"` and contains the expected backup data.

### Wipe local data

The **Wipe All Local Data** button permanently deletes trips, passes, and attachments from the current device.

Export a backup first. Wiping one device does not wipe another device.

## Move data to another device

To make the second device an exact copy:

1. On the source device, download a full backup.
2. Send or save the file securely.
3. Install and open Waypoint on the destination device.
4. Open **Import Backup / Restore**.
5. Upload the backup file.
6. Choose a traveller and check that their items and all shared items are present.

To send only new or changed bookings, send an incremental update instead. The recipient loads it through **Upload Update JSON File**, preserving their other data.

Waypoint does not automatically synchronise devices. Repeat the transfer whenever the devices need the same updated information.

## Work offline and receive updates

After Waypoint and its assets have loaded successfully, the installed app can start without an internet connection. Imported trips, passes, barcodes, and attachments are stored on the device.

Internet access is still needed to:

- install Waypoint for the first time;
- download a new version of the app;
- receive a JSON file from an online service;
- open any external link that has not been stored as an attachment.

Waypoint checks for app updates automatically. If a published change is not visible:

1. Connect to the internet.
2. Open Waypoint and leave it open briefly.
3. Close every Waypoint window.
4. Reopen it from the app icon.

Do not clear browser or site storage as an update method unless you have first exported a current backup.

## Troubleshooting

### “No Trips Scheduled” after import

- Check the success message to confirm records were upserted.
- Confirm the correct traveller is selected in the header.
- Confirm the trip's `travelerId` matches that traveller or is `shared`.
- For group travel, normally make the trip `shared` and apply individual IDs to person-specific passes.
- Confirm that dates and required fields are present.

### A traveller is missing from the selection list

- Confirm at least one upserted trip or pass in the imported JSON contains that person's `travelerId`.
- Confirm `travelerId` is a non-empty string.
- Use the same spelling consistently; Waypoint converts IDs to lowercase.
- Confirm that the wallet contains no more than 12 distinct passenger IDs.

### “Trip with slug … not found”

The pass's `tripSlug` does not match a stored trip. Correct the spelling, or include the missing trip in the same update file. Trip slugs are case-sensitive.

### “Invalid file format. This is not a Waypoint backup”

You used the full-backup restore control with an incremental update, or the backup is incomplete. Load an update through **Upload Update JSON File**. Load only an exported Waypoint backup through **Upload Backup JSON File** or **Restore JSON Data**.

### A JSON file will not parse

JSON requires:

- double quotes around names and text values;
- commas between fields and array items;
- no comma after the final field or item;
- matching braces `{}` and brackets `[]`;
- no comments.

Validate the file with a JSON validator before importing it, but do not paste sensitive bookings or barcode data into an untrusted website.

### A barcode does not scan

- Confirm `barcodeType` matches the original barcode.
- Use the exact unaltered `barcodeContent`.
- Increase screen brightness.
- Open the barcode at full size and avoid reflections.
- Keep the original ticket or attached document available as a fallback.

### An attachment will not open or import

- Confirm `fileType` matches the actual file.
- Confirm `dataUrl` contains the complete Base64 Data URL.
- Re-create the update from the original document.
- Check that the device has enough free storage.

### Data disappeared

Waypoint data is local to the browser/site storage on that device. It can be lost if site data is cleared, the wipe command is used, or the device is reset or lost. Restore the latest full backup.

## Data safety checklist

- Export a backup after adding important tickets.
- Keep at least one backup somewhere other than the phone.
- Back up before a full restore or wipe.
- Treat backup and update files as sensitive; they can contain booking references, barcodes, and complete documents.
- Do not commit personal JSON files or ticket attachments to the public GitHub repository.
- Keep original airline, rail, hotel, and event documents available when travelling.

---

Open the app at https://teeceegee.github.io/waypoint/.

For the source code, visit the [Waypoint GitHub repository](https://github.com/teeceegee/waypoint).
