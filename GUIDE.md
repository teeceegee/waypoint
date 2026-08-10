# Waypoint — User Guide

A personal travel wallet PWA for Tony and Graeme. Stores trips, boarding passes, hotel reservations, restaurant bookings, rail tickets, and activity passes — fully offline on your device.

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

### Sharing with Graeme
Just send him the URL above via iMessage or WhatsApp. He follows the same steps above to install it on his phone.

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
2. Scroll to **Incremental Updates**
3. Tap **Upload Update JSON File** and select your `.json` file
   — or paste raw JSON into the text box and tap **Apply Update**

### Update Actions
Each item in the JSON uses an `action` field:
- `"upsert"` — create or update an item (matched by `slug`)
- `"delete"` — remove an item by `slug`

You only need to include fields that are changing — unchanged fields are preserved automatically.

---

## 📤 Sharing Data with Graeme

### Export your data
1. Open the **Database icon** in the app header
2. Tap **Download JSON** — saves a backup file to your phone
3. AirDrop, iMessage, or email the file to Graeme

### Graeme imports it
1. He opens **Waypoint** on his phone
2. Taps the **Database icon**
3. Scrolls to **Import Backup / Restore**
4. Taps **Upload Backup JSON File** and selects the file you sent

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

## 👤 Traveller Profiles

| ID | Name |
|---|---|
| `tony` | Tony |
| `graeme` | Graeme |
| `shared` | Both travellers |

Use the `travelerId` field in JSON updates to assign items to the right person.

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
      "endDate": "2026-09-05",
      "travelerId": "shared"
    }
  ],
  "passes": [
    {
      "action": "upsert",
      "slug": "pass-flight-cdg-tony",
      "tripSlug": "trip-mytrip-2026",
      "title": "Flight BA304: LHR ➔ CDG",
      "type": "flight",
      "travelerId": "tony",
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
