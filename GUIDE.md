# Waypoint — User Guide

A shared travel wallet PWA for trips, boarding passes, hotel reservations, restaurant bookings, rail tickets, and activity passes — fully offline on your device.

---

## 🌐 App URL

**https://teeceegee.github.io/waypoint/**

> This URL is the source of truth. The app code lives here but your personal travel data never touches this server — it is stored only on your device.

---

## 📲 Installing on Your Phone

### iPhone / iPad (Safari only)
1. Open the URL above in **Safari** (not Chrome or Firefox)
2. Tap the **Share** button (square with arrow pointing up, bottom of screen)
3. Scroll down and tap **Add to Home Screen**
4. Tap **Add** in the top-right corner

The app will appear on your home screen and launch in fullscreen mode with no browser bar.

### Android (Chrome)
1. Open the URL above in **Google Chrome**
2. Tap the **three-dot menu** (top right)
3. Tap **Install App** or **Add to Home Screen**
4. Tap **Install**

### Installing on another device
Send the URL by message or email, then follow the same installation steps on the other device. Each device keeps its own local copy of the data.

---

## 🧭 Using Waypoint

Waypoint supports groups of up to 12 travellers without predefined names or user accounts.

1. Import an update or restore a backup using the **Database icon**.
2. Waypoint reads the distinct `travelerId` values in that JSON file and asks you to choose one traveller.
3. Tap a trip card to open that traveller's chronological timeline. Items labelled `shared` are included automatically.
4. Tap a pass to view its details, barcode, and attached document.
5. To show a different traveller, use the dynamically generated selector in the header.

The selected traveller is remembered on that device. Importing another JSON file asks again using the passenger IDs found in that file. If a file contains only shared data, no passenger question is needed.

---

## 📂 How Data Works

All data (trips, tickets, documents, barcodes) is stored **100% on your device** using IndexedDB. Nothing is ever sent to any server.

| | Location | Visible to anyone else? |
|---|---|---|
| App code | GitHub Pages | No personal data |
| Your travel data | Your phone only | Never |

The app works fully **offline** once installed. You only need internet to install it the first time or receive updates.

---

## 🔄 Importing Travel Data (JSON Sync)

All data is added via JSON update files. See **[llm_json_instructions.md](./llm_json_instructions.md)** for the full schema.

### How to Import
1. Tap the **Database icon** (top-right of the app header)
2. Find **Import Incremental Updates**
3. Tap **Upload Update JSON File** and select your `.json` file
4. Choose one traveller from the passenger list Waypoint derives from the file

The paste box under **Import Backup / Restore** is only for a complete exported backup. It does not accept an incremental update.

### Update Actions
Each item in the JSON uses an `action` field:
- `"upsert"` — create or update an item (matched by `slug`)
- `"delete"` — remove an item by `slug`

You only need to include fields that are changing — unchanged fields are preserved automatically.

If `travelerId` is omitted when a new trip or pass is created, Waypoint defaults it to `shared`. For an individual booking, use any stable passenger ID such as `"travelerId": "passenger-1"`. Waypoint supports up to 12 distinct passenger IDs and does not contain a predefined passenger list.

For a group trip, normally label the trip itself `shared` and label only person-specific passes—such as seats, barcodes, or tickets—with the appropriate passenger ID. This ensures every selected traveller can open the common trip while seeing only their own personal passes plus shared passes.

---

## 📤 Moving Data Between Devices

### Export your data
1. Open the **Database icon** in the app header
2. Tap **Download JSON** — saves a backup file to your phone
3. Transfer the file securely to the other device

### Restore it on the other device
1. Open **Waypoint** on the destination device
2. Tap the **Database icon**
3. Find **Import Backup / Restore**
4. Tap **Upload Backup JSON File** and select the transferred file
5. Choose one traveller from the passenger IDs restored from the backup

> Restoring a full backup replaces all Waypoint data currently stored on that device. Export the destination device first if it contains anything you may need.

---

## 🗑️ Wiping Local Data (Factory Reset)

To clear all trips and passes from a device:
1. Open the **Database icon**
2. Scroll to **Danger Zone** at the bottom
3. Tap **Wipe All Local Data** and confirm

> This only affects the device you are on. Other devices are unaffected.

---

## ⚙️ Making Code Changes

The source code lives at: **https://github.com/teeceegee/waypoint**

Any changes pushed to the `main` branch automatically trigger a GitHub Actions build and deploy to GitHub Pages within ~2 minutes.

### Local Development
```bash
cd ~/Documents/waypoint
npm run dev          # Start local dev server at http://localhost:5173
npm run build        # Build production bundle (output to dist/)
```

### Deploying Changes
```bash
git add .
git commit -m "Description of changes"
git push             # GitHub Actions automatically builds and deploys
```

### GitHub Actions Workflow
Defined in `.github/workflows/deploy.yml`. Runs `npm ci && npm run build` then deploys `dist/` to GitHub Pages on every push to `main`.

---

## 🔒 Repository Visibility

The repository is currently **public**, which is required for GitHub Pages to work on the free GitHub plan.

**Important:** If you make the repo private, the GitHub Pages URL will stop working. The app will continue to work on devices that already have it installed (cached by the service worker), but:
- New users won't be able to install it
- Existing users who delete and reinstall the app will lose access
- App updates won't be delivered

### Alternatives if you want a private repo
- **GitHub Pro** (~£3.50/month) — enables Pages for private repos
- **Cloudflare Pages** (free) — supports private GitHub repos with automatic deploys

---

## 🏷️ Pass Types & Colours

| Type | Style |
|---|---|
| ✈️ Flight | Blue boarding pass |
| 🚂 Train | Rail ticket (perforated edges) |
| 🏨 Hotel | Green key card |
| 🍽️ Restaurant | Red/orange reservation slip |
| 🎡 Activity | Purple event ticket |
| 🚌 Bus | Amber coach ticket |
| 📄 Other | Grey generic pass |

---

## 👤 Dynamic Traveller IDs

The `travelerId` field accepts any stable, non-empty string. Waypoint converts IDs to lowercase, derives the passenger list from the imported JSON, and supports up to 12 distinct passengers. For readability, use short IDs containing a name or another recognisable label, for example `passenger-1`.

The special ID `shared` is the default and does not represent a passenger. Shared trips and passes appear for whichever traveller is selected.

Traveller selection is a display filter, not an account, sign-in, or access-control mechanism. Anyone with access to the device and its local Waypoint data can switch to another passenger using the header selector.

---

## 📋 Quick Reference — JSON Update File

```json
{
  "trips": [
    {
      "action": "upsert",
      "slug": "trip-mytrip-2026",
      "name": "My Trip",
      "destination": "Paris, France",
      "startDate": "2026-09-01",
      "endDate": "2026-09-05"
    }
  ],
  "passes": [
    {
      "action": "upsert",
      "slug": "pass-flight-cdg-passenger-1",
      "tripSlug": "trip-mytrip-2026",
      "title": "Flight BA304: LHR ➔ CDG",
      "type": "flight",
      "travelerId": "passenger-1",
      "date": "2026-09-01",
      "time": "08:00",
      "location": "London Heathrow Terminal 5",
      "seat": "12A",
      "confirmationCode": "XYZABC",
      "barcodeType": "pdf417",
      "barcodeContent": "M1ME/PASSENGER..."
    }
  ]
}
```

For the full schema and more examples see **[llm_json_instructions.md](./llm_json_instructions.md)**.
