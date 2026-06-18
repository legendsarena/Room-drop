# RoomDrop — Setup Guide

This is your RoomDrop app with real Firebase wired in: Google/Email/Guest
login, and rooms stored in Firestore in real time. The UI is unchanged
from the version you already saw.

## What you need to do, in order

### 1. Lock down your database (do this first, it's important)
Right now Firestore is in "test mode," which means anyone on the internet
can read or delete everything. Fix it:

- Firebase Console → your project → Firestore Database → **Rules** tab
- Delete everything in the box
- Paste in the entire contents of `firestore.rules` (included in this folder)
- Tap **Publish**

### 2. Get this running somewhere you can test it
This project can't run inside the Claude chat preview — real Google
Sign-In requires a proper domain that Firebase recognizes, which the
in-chat preview doesn't have.

You have two realistic options:

**Option A — Easiest: GitHub Pages (matches your existing workflow)**
1. Create a new GitHub repo (or use an existing one)
2. Upload all files in this folder, keeping the same structure
   (the `src/` folder must stay a folder, not flattened)
3. This project needs a build step (because of the `firebase` and
   `lucide-react` packages) — GitHub Pages alone can't run that build
   for you. Easiest fix: use **Vercel** or **Netlify** instead — both
   are free, both auto-detect this is a Vite project, and both will
   build and host it for you. Steps:
   - Go to vercel.com → Sign up with GitHub → "Add New Project" →
     pick this repo → it auto-detects Vite → click Deploy
   - You'll get a live URL like `roomdrop.vercel.app` in about a minute

**Option B — Test on your own phone first**
If you get access to a laptop/PC even briefly, or a friend's:
```
npm install
npm run dev
```
This runs it locally so you can click through and confirm login/rooms
work before deploying anywhere public.

### 3. Add your domain to Firebase's allowed list
Once you have a live URL (e.g. `roomdrop.vercel.app`):
- Firebase Console → Authentication → Settings → **Authorized domains**
- Tap **Add domain** → paste your URL's domain (just `roomdrop.vercel.app`,
  no `https://`) → Save

Without this step, Google Sign-In will fail with a domain error — this is
the #1 thing people forget.

## What's real now vs. what's still mock

**Real (Firebase-backed):**
- Google, Email/Password, and Guest login
- Creating, editing, deleting rooms — all saved to Firestore
- Room list on Home screen — live, synced across all users
- Saved/favorite creators — synced per-user

**Still local/mock (not yet wired, by design — wire these next when ready):**
- Coins wallet (currently just a number in memory, resets on refresh)
- Premium subscription status (no real payment yet)
- Push notifications (needs Firebase Cloud Messaging setup — separate step)
- Admin panel (currently shows fake stats — needs admin-only rules and
  real aggregation queries)

## Files in this folder
- `src/firebase.js` — all Firebase setup and helper functions, one place
- `src/RoomDropApp.jsx` — your app, same UI, now calling real Firebase
- `src/main.jsx` — tiny file that boots the React app
- `firestore.rules` — security rules, paste into Firebase Console
- `package.json`, `vite.config.js`, `index.html` — project plumbing
