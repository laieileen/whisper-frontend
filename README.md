# Whisper Frontend

A simple message jar interface. Leave anonymous messages and peek inside to see what others have shared.

**Live**: https://laieileen.github.io/whisper-frontend

**Backend**: https://whisper-backend-jrie.onrender.com

## Features
- Submit anonymous messages (up to 500 characters)
- View all stored messages
- Loading state while server wakes up

## Local Testing
Open `index.html` in your browser. The site will fetch messages from the deployed backend.

To run locally with a local backend, change the `BACKEND_URL` in `script.js` to `http://127.0.0.1:5000`.