# Waypoint JSON Update Schema & Instructions

Use this document to instruct any system, parser, or Large Language Model (LLM) on how to generate correct update and synchronization payloads for the Waypoint PWA.

---

## 📋 JSON Structure and Schema

The update payload is a flat JSON object containing two optional arrays: `"trips"` and `"passes"`. 
Each item in these arrays **must** specify an `action` (`"upsert"` or `"delete"`) and a stable string `slug` (used to uniquely identify the item).

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
      "travelerId": "tony" | "graeme" | "shared" (required for new)
    }
  ],
  "passes": [
    {
      "action": "upsert" | "delete",
      "slug": "string (unique ID, e.g., 'pass-jl042-tony')",
      "tripSlug": "string (references Trip slug, required for new)",
      "title": "string (required for new)",
      "type": "flight" | "train" | "bus" | "hotel" | "restaurant" | "activity" | "other" (required for new),
      "travelerId": "tony" | "graeme" | "shared" (required for new),
      "date": "YYYY-MM-DD (required for new)",
      "time": "HH:MM (optional, 24h format)",
      "location": "string (required for new)",
      "gate": "string (optional, e.g. terminal/gate)",
      "seat": "string (optional, e.g. seat number)",
      "confirmationCode": "string (optional)",
      "barcodeType": "aztec" | "pdf417" | "qr" | "code128" | "none" (required for new),
      "barcodeContent": "string (optional, raw barcode payload)",
      "notes": "string (optional)",
      "attachment": {
        "fileName": "string (e.g. 'pass.pdf')",
        "fileType": "string (e.g. 'application/pdf' or 'image/png')",
        "dataUrl": "string (base64 Data URL, e.g. 'data:application/pdf;base64,JVBERi...')"
      }
    }
  ]
}
```

---

## 🤖 Gmail Scraper & LLM Integration Guide

If you are using an LLM or script to scan a traveler's Gmail inbox for barcodes and confirmation documents, follow these steps to generate the sync file:

1.  **Search & Match:**
    *   Find the relevant email in Gmail by searching for the flight number, hotel name, or travel dates.
    *   Locate the pass in the Waypoint app by matching the `confirmationCode` (e.g. `ZYLQQY`), `date`, or `title`.
2.  **Extract the Barcode:**
    *   Scan the email body or attachments for barcode patterns (Aztec, PDF417, or QR codes).
    *   Extract the raw text string containing the barcode payload (e.g. the standard IATA BCBP string for flights).
3.  **Extract Attachments:**
    *   If the email contains a PDF ticket or image boarding pass, extract the file, convert it to a base64 Data URL, and set the `attachment` fields.
4.  **Format the Incremental Update:**
    *   Write an incremental JSON update containing **only** the target pass's `slug` (or search terms) and the extracted barcode/attachment fields. You do **not** need to respecify unchanged metadata.

---

## 💡 Examples

### Example 1: Gmail Scraper Adds Barcode & PDF (Incremental Update)
If you found the barcode string and PDF attachment for an existing flight pass `pass-flight-cph-tony` (Reference `ZYLQQY`):

```json
{
  "passes": [
    {
      "action": "upsert",
      "slug": "pass-flight-cph-tony",
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

### Example 2: Creating a New Trip with a Boarding Pass
```json
{
  "trips": [
    {
      "action": "upsert",
      "slug": "trip-tokyo-2026",
      "name": "Summer Voyage to Tokyo",
      "destination": "Tokyo, Japan",
      "startDate": "2026-08-10",
      "endDate": "2026-08-23",
      "description": "First joint trip to Japan!",
      "travelerId": "shared"
    }
  ],
  "passes": [
    {
      "action": "upsert",
      "slug": "pass-flight-jl042-tony",
      "tripSlug": "trip-tokyo-2026",
      "title": "Flight JL042: LHR ➔ HND (Tony)",
      "type": "flight",
      "travelerId": "tony",
      "date": "2026-08-10",
      "time": "09:40",
      "location": "London Heathrow (LHR) Terminal 3",
      "barcodeType": "pdf417",
      "barcodeContent": "M1ME/PASSENGER..."
    }
  ]
}
```

### Example 3: Deleting a Pass
```json
{
  "passes": [
    {
      "action": "delete",
      "slug": "pass-flight-jl042-tony"
    }
  ]
}
```
