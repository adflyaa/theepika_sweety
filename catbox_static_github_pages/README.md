# Mini Catbox — GitHub Pages Demo

இது **client-side only** (no server). Uploaded files are saved **your browser's localStorage**.  
**GitHub Pages**-இல் host செய்ய இந்த repo-வை upload & publish செயலாம்.

## Deploy steps (GitHub Pages)
1. Create a new GitHub repo (e.g. `mini-catbox-static`) and push the files from this zip.
2. In GitHub repo → Settings → Pages:
   - Source: `main` branch
   - Folder: `/ (root)`
   - Save.
3. Wait a minute, open the site URL.
> **Important:** This is a static demo. Files uploaded by visitors are stored in **their own browsers only**. To have real server-side uploads, you'll need a backend (Node/Cloudinary/R2 etc).

## How it works
- Upload form converts file to dataURL and stores in localStorage under key `mini_catbox_files`.
- Each uploaded item gets a short id and a shareable link like: `https://<your-site>/# /f/<id>` (no spaces).
- Viewer page increments view count and stores likes/views in localStorage.

## Notes & Next steps
- For real hosting of files, connect to Cloudinary / Cloudflare R2 and update `script.js` to send file to your server.
- This repo is intended to be a quick GitHub-Pages demo and UI prototype.

