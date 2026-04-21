# Dirty Dawgs Dirt Works Website

Website and local quote request backend for Dirty Dawgs Dirt Works.

## Run Locally

Open PowerShell in this folder and run:

```powershell
.\start-server.ps1
```

Then open:

```text
http://127.0.0.1:3000
```

Quote requests and uploaded photos are saved in the `submissions` folder.

## Deploy On Render

Create a new Render Web Service from the GitHub repo and use:

```text
Build Command: npm install
Start Command: npm start
```

After the service is live, add `DirtyDawgsDirtWorks.com` as a custom domain in Render and follow Render's DNS instructions at your domain registrar.

## Important

The `submissions` folder is ignored by Git because it contains customer quote requests and uploaded photos.
