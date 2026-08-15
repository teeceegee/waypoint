# Waypoint JSON Update Schema & Instructions

Use this document to instruct any system, parser, or Large Language Model (LLM) on how to generate correct update and synchronization payloads for the Waypoint PWA.

---

## 📋 JSON Structure and Schema

The update payload is a flat JSON object containing two optional arrays: `"trips"` and `"passes"`. 
Each item in these arrays **must** specify an `action` (`"upsert"` or `"delete"`) and a stable string `slug` (used to uniquely identify the item).

Waypoint derives its passenger list from the distinct `travelerId` values in each imported JSON file. Passenger IDs are not predefined. Use a stable lowercase identifier for each person and use the same ID consistently across files. Waypoint supports up to 12 distinct passenger IDs.

New trips and passes default to `"shared"` when `travelerId` is omitted. The special `shared` value is not a passenger: it makes the item visible to every selected traveller. For group travel, trips should normally be shared while person-specific tickets, seats, barcodes, or documents should carry the appropriate passenger ID. Existing records keep their current traveller label when an incremental update omits the field.

### Attachment Support (New)
You can attach documents (PDF boarding passes, reservation screenshots, etc.) directly by including an `"attachment"` object in any pass. 
The system will automatically decode the base64 data and store it offline in IndexedDB.

```json
{
  "trips": [
    {
      "action": "upsert" | "delete",
      "slug": "string (unique ID, e.g., 'trip-tokyo-2026')",
      "name": "string (required for new)",
      "destination": "string (required for new)",
      "startDate": "YYYY-MM-DD (required for new)",
      "endDate": "YYYY-MM-DD (required for new)",
      "description": "string (optional)",
      "travelerId": "string passenger ID or shared" (optional, defaults to "shared")
    }
  ],
  "passes": [
    {
      "action": "upsert" | "delete",
      "slug": "string (unique ID, e.g., 'pass-jl042-passenger-1')",
      "tripSlug": "string (references Trip slug, required for new)",
      "title": "string (required for new)",
      "type": "flight" | "train" | "bus" | "hotel" | "restaurant" | "activity" | "other" (required for new),
      "travelerId": "string passenger ID or shared" (optional, defaults to "shared"),
      "date": "YYYY-MM-DD (required for new)",
      "time": "HH:MM (optional, 24h format)",
      "location": "string (required for new)",
      "gate": "string (optional, e.g. terminal/gate)",
      "seat": "string (optional, e.g. seat number)",
      "confirmationCode": "string (optional)",
      "barcodeType": "aztec" | "pdf417" | "qr" | "code128" | "none" (required for new),
      "barcodeContent": "string (optional, raw barcode payload)",
      "notes": "string (optional)",
      "mapsUrl": "string (optional, Apple Maps or Google Maps URL, e.g. 'https://maps.apple.com/?q=Freyja+Hornsgatan+18+Stockholm')",
      "website": "string (optional URL, e.g. 'https://www.tivoli.dk/')",
      "status": "confirmed" | "recommended" | "optional" (optional, defaults to "confirmed" if confirmationCode exists, otherwise "recommended"),
      "attachment": {
        "fileName": "string (e.g. 'pass.pdf')",
        "fileType": "string (e.g. 'application/pdf' or 'image/png')",
        "dataUrl": "string (base64 Data URL, e.g. 'data:application/pdf;base64,JVBERi...')"
      }
    }
  ]
}
```

### Confirmed Dining vs. Dining Recommendations (`status`)
Waypoint distinguishes between **confirmed reservations** and **flexible food recommendations**:
- **Confirmed Reservations (`status: "confirmed"`):** Uses a deep crimson/wine red card (`🍽️ Dining Reservation`) with time slot and booking reference.
- **Dining Recommendations (`status: "recommended"`):** Uses a **lighter, warm coral/terracotta card** (`🍴 Dining Recommendation`) with `RECOMMENDED` badge and direct one-tap links to Menu/Website and Maps for drop-in visits.

### Direct Website Links (`website`)
Any pass (activity, attraction, dining booking, hotel, transit provider) can specify an optional `website` URL. 
Waypoint presents this as a dedicated website button directly on the timeline card and inside the pass details modal for rapid one-tap access to menus, opening hours, or official guides.

### Apple Maps & Google Maps Deep Linking (`mapsUrl`)
Any pass can include a `mapsUrl` field.
Waypoint is OS-aware:
- On **iOS / iPadOS / macOS**, tapping the map button automatically opens **Apple Maps**.
- On **Android / Windows / Linux**, Apple Maps queries are automatically adapted to open seamlessly in **Google Maps**.
- If `mapsUrl` is omitted, Waypoint automatically generates a search link using the `location` field.

---

## 🤖 Gmail Scraper & LLM Integration Guide

If you are using an LLM or script to scan a traveler's Gmail inbox for barcodes, confirmation documents, website links, and location addresses, follow these steps to generate the sync file:

1.  **Search & Match:**
    *   Find the relevant email in Gmail by searching for the flight number, hotel name, or travel dates.
    *   Locate the pass in the Waypoint app by matching the `confirmationCode` (e.g. `ZYLQQY`), `date`, or `title`.
2.  **Extract Details, Barcode & Links:**
    *   Scan the email body or attachments for barcode patterns (Aztec, PDF417, or QR codes).
    *   Extract the raw text string containing the barcode payload (e.g. the standard IATA BCBP string for flights).
    *   Extract destination addresses for `mapsUrl` and official homepage/booking URLs for `website`.
3.  **Extract Attachments:**
    *   If the email contains a PDF ticket or image boarding pass, extract the file, convert it to a base64 Data URL, and set the `attachment` fields.
4.  **Format the Incremental Update:**
    *   Write an incremental JSON update containing **only** the target pass's `slug` (or search terms) and the extracted barcode/attachment/maps/website fields. You do **not** need to respecify unchanged metadata.

---

## 💡 Examples

### Example 1: Adding a Website & Maps URL to an Activity or Restaurant
```json
{
  "passes": [
    {
      "action": "upsert",
      "slug": "pass-restaurant-freyja-soder",
      "mapsUrl": "https://maps.apple.com/?q=Freyja+Hornsgatan+18+Stockholm",
      "website": "https://www.freyjasoder.se/"
    }
  ]
}
```

### Example 2: Creating a New Trip with an Activity Pass (White Card), Website & Barcode
```json
{
  "trips": [
    {
      "action": "upsert",
      "slug": "trip-cph-2026",
      "name": "Copenhagen Weekend",
      "destination": "Copenhagen, Denmark",
      "startDate": "2026-09-04",
      "endDate": "2026-09-07",
      "description": "Autumn trip to Copenhagen"
    }
  ],
  "passes": [
    {
      "action": "upsert",
      "slug": "pass-activity-tivoli-gardens",
      "tripSlug": "trip-cph-2026",
      "title": "Tivoli Gardens Admission & Ride Pass",
      "type": "activity",
      "travelerId": "shared",
      "date": "2026-09-05",
      "time": "14:00",
      "location": "Vesterbrogade 3, 1630 København V",
      "mapsUrl": "https://maps.apple.com/?q=Tivoli+Gardens+Copenhagen",
      "website": "https://www.tivoli.dk/",
      "confirmationCode": "TIV-88219",
      "barcodeType": "qr",
      "barcodeContent": "https://www.tivoli.dk/tickets/TIV-88219"
    }
  ]
}
```

### Example 2: Gmail Scraper Adds Barcode & PDF (Incremental Update)
If you found the barcode string and PDF attachment for an existing flight pass `pass-flight-cph-passenger-1` (Reference `ZYLQQY`):

```json
{
  "passes": [
    {
      "action": "upsert",
      "slug": "pass-flight-cph-passenger-1",
      "barcodeType": "pdf417",
      "barcodeContent": "M1ME/PASSENGER  EZYLQQY NCLCPHDY 83529 229Y012A0023 150>2180B  6229B3",
      "attachment": {
        "fileName": "copenhagen_boarding_pass.pdf",
        "fileType": "application/pdf",
        "dataUrl": "data:application/pdf;base64,JVBERi0xLjQKJ..."
      }
    }
  ]
}
```

### Example 3: Creating a New Trip with an Activity Pass & Maps Link
```json
{
  "trips": [
    {
      "action": "upsert",
      "slug": "trip-stockholm-2026",
      "name": "Nordic Getaway in Stockholm",
      "destination": "Stockholm, Sweden",
      "startDate": "2026-09-12",
      "endDate": "2026-09-16",
      "description": "Exploration of Gamla Stan and culinary hotspots"
    }
  ],
  "passes": [
    {
      "action": "upsert",
      "slug": "pass-activity-vasa-museum",
      "tripSlug": "trip-stockholm-2026",
      "title": "Vasa Museum Guided Tour",
      "type": "activity",
      "travelerId": "shared",
      "date": "2026-09-13",
      "time": "11:00",
      "location": "Galärvarvsvägen 14, 115 21 Stockholm",
      "mapsUrl": "https://maps.apple.com/?q=Vasa+Museum+Galarvarvsvagen+14+Stockholm",
      "confirmationCode": "VASA-9942",
      "barcodeType": "qr",
      "barcodeContent": "https://vasamuseet.se/tickets/VASA-9942"
    }
  ]
}
```

### Example 4: Deleting a Pass
```json
{
  "passes": [
    {
      "action": "delete",
      "slug": "pass-activity-vasa-museum"
    }
  ]
}
```
