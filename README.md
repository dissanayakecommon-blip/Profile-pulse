# 👁️ Profile Pulse v1.1

A polished, phone-first Instagram analytics prototype with a real backend boundary for a future Meta OAuth connection.

## Included
- Responsive dark lavender/pink mobile UI
- Dashboard, activity estimates, engagement, story insights, analytics, notifications and settings
- PWA manifest + service worker
- Demo mode that works without an Instagram account
- Express backend with safe OAuth placeholders
- `.env.example` for server-side Meta credentials

## Important
The app intentionally does **not** pretend to know a secret list of people who visited an Instagram profile. Potential-interest entries are labelled as estimates. Story viewers and other interaction data are kept separate from estimates.

## Run
1. Install Node.js.
2. In this folder run `npm install`.
3. Run `npm start`.
4. Open `http://localhost:3000`.

## Live Instagram connection
The UI contains the connection handoff, but the live OAuth/API layer requires a Meta developer app owned/configured by the app operator. Keep `META_APP_SECRET` and access tokens on the server only. Never ask for an Instagram password.

I could not verify the current Meta developer documentation through web search during this build, so the exact current permissions/endpoints are deliberately left as a configuration step rather than hard-coded from memory.

## Suggested production path
PWA → Express backend → current Meta OAuth → permitted Instagram metrics → historical database → transparent analytics engine → UI.


## Install on Android

This package is PWA-ready. It must be opened from an HTTPS web address for Chrome to offer the full **Install app** experience. A local `file://` copy cannot be installed as a true PWA.

After uploading this folder to a static HTTPS host:
1. Open the site in Chrome on Android.
2. Tap ⋮.
3. Tap **Install app** (or **Install and create shortcut**).
4. Confirm **Install**.

Google documents the current Android Chrome web-app flow here:
https://support.google.com/chromebook/answer/9658361
