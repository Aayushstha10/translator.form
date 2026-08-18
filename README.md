# Nepali Citizenship Form

A MERN-stack app: a Nepali citizenship application form with bilingual
English/Japanese labels throughout. As you type into most fields, a live
Japanese translation appears underneath — this now runs entirely in the
browser (MyMemory, with a Lingva Translate fallback), so translation works
the moment `client`'s dev server is running, even before the Express server
is started. Once every required field is filled, you can download the
completed application as a **PDF** or a **Word (.doc)** file — downloads
are blocked with a clear message if anything required is missing.

## Stack
- MongoDB + Mongoose
- Express (REST API)
- React (Vite) + Tailwind CSS
- Node.js
- Translation: MyMemory free translation API (no key required, with a
  Lingva Translate fallback) — called directly from the browser
- Export: `html2canvas` + `jsPDF` for the PDF, a Word-openable HTML Blob for
  the `.doc`

## Project layout
```
server/   Express API + Mongoose model + /api/translate proxy
client/   React (Vite + Tailwind) form UI, PDF/Word export
```

## Run it

### 1. Client (translation works with just this running)
```
cd client
npm install
npm run dev                # http://localhost:5173
```

### 2. Server (only needed to save applications to MongoDB)
```
cd server
cp .env.example .env      # edit MONGO_URI if needed
npm install
npm run dev                # http://localhost:5000
```

The client is configured (see `vite.config.js`) to proxy `/api` requests to
`http://localhost:5000` for saving applications, so no CORS setup is needed
in development. Live translation does not go through this proxy — it calls
the translation service directly from the browser.

## What's translated live, and what isn't
Free-text fields (names, districts, municipality, purpose, and the selected
gender) show a live Japanese translation. Numeric identifiers — Ward No. and
Certificate Number — and the two date fields (Date of Birth, Issued Date) are
left untranslated on purpose, since translating a number or a date doesn't
mean anything.

## Downloading the application
The **Download PDF** and **Download Word** buttons both validate that every
required field has a value first. If something's missing, the button lists
exactly which fields to fill in and does not generate a file. Once valid,
both buttons render the same bilingual summary (each field shown as
"English (Japanese)": value) — the PDF via a rendered image embedded in an
A4 page, the Word file as an HTML document Word can open directly.

## API

| Method | Route              | Body                                   | Description                     |
|--------|--------------------|-----------------------------------------|----------------------------------|
| POST   | /api/citizens        | full form payload                       | Saves a citizenship application |
| GET    | /api/citizens        | —                                        | Lists saved applications        |

`server/routes/translate.js` still exists and works standalone (`POST
/api/translate`) if you'd rather translate server-side — the client just
doesn't call it anymore, to avoid translation breaking whenever the server
isn't running.

## Notes
- Swap MyMemory for Google Cloud Translate / DeepL in
  `translateText()` inside `client/src/components/CitizenshipForm.jsx` (or
  in `server/routes/translate.js` if you switch back to server-side
  translation) if you need higher volume or accuracy.
- Name fields are translated for demonstration purposes even though names
  aren't conventionally "translated" between languages — remove `translate: true`
  on any field in `client/src/components/CitizenshipForm.jsx`'s `SECTIONS`
  array if you'd rather it not.
