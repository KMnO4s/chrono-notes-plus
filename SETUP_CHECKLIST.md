# 🚀 Quick Setup Checklist

Follow these steps to deploy your Multi-Chronometer Standard Notes extension:

## ✅ Step 1: Create GitHub Repository
- [ ] Create a new GitHub repository (e.g., `chronometer-extension`)
- [ ] Push this code to the repository

## ✅ Step 2: Enable GitHub Pages
- [ ] Go to repository **Settings** → **Pages**
- [ ] Under "Build and deployment", select **Source: GitHub Actions**
- [ ] Save the settings

## ✅ Step 3: Update Configuration

### Update `public/ext.json`
Replace these placeholders with your actual information:
```json
{
  "url": "https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPO_NAME/",
  "download_url": "https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPO_NAME/latest.zip",
  "latest_url": "https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPO_NAME/ext.json"
}
```

Example (if your username is `johndoe` and repo is `sn-chronometer`):
```json
{
  "url": "https://johndoe.github.io/sn-chronometer/",
  "download_url": "https://johndoe.github.io/sn-chronometer/latest.zip",
  "latest_url": "https://johndoe.github.io/sn-chronometer/ext.json"
}
```

### Update `vite.config.ts`
Change line 8 from:
```typescript
base: mode === "production" ? "/chronometer-extension/" : "/",
```
To (using your repo name):
```typescript
base: mode === "production" ? "/YOUR_REPO_NAME/" : "/",
```

Example:
```typescript
base: mode === "production" ? "/sn-chronometer/" : "/",
```

## ✅ Step 4: Deploy
- [ ] Commit your changes:
  ```bash
  git add .
  git commit -m "Configure for GitHub Pages deployment"
  git push origin main
  ```
- [ ] Wait 2-3 minutes for GitHub Actions to build and deploy
- [ ] Check the **Actions** tab in your GitHub repo to see deployment status

## ✅ Step 5: Verify Deployment
- [ ] Visit: `https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPO_NAME/`
- [ ] You should see the Multi-Chronometer interface
- [ ] Visit: `https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPO_NAME/ext.json`
- [ ] You should see the JSON manifest file

## ✅ Step 6: Install in Standard Notes
- [ ] Open Standard Notes
- [ ] Go to **Settings** → **Extensions** → **Import Extension**
- [ ] Paste your extension URL:
  ```
  https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPO_NAME/ext.json
  ```
- [ ] Click **Install**
- [ ] Create a new note and select **Multi-Chronometer** from the editor picker

## 🎉 Success!
You should now have a working Standard Notes extension that:
- ✅ Syncs across all your devices
- ✅ Is end-to-end encrypted
- ✅ Adapts to your Standard Notes theme
- ✅ Works offline (desktop app)

## 🔧 Local Testing (Optional)

Before deploying, you can test locally:

1. Start dev server:
   ```bash
   npm install
   npm run dev
   ```

2. In Standard Notes, import:
   ```
   http://localhost:8080/ext.json
   ```

3. Test all features locally before deploying to production

## ❓ Troubleshooting

### Extension doesn't load
- Double-check all URLs match your GitHub username and repo name
- Verify GitHub Pages deployment succeeded in Actions tab
- Try clearing Standard Notes cache and reinstalling

### Blank page after installation
- Check browser console for errors
- Verify the `base` path in `vite.config.ts` matches your repo name
- Ensure all files were deployed correctly

### Data not saving
- Make sure you're creating a new note (not using an existing one initially)
- Check that Standard Notes can communicate with the extension
- Try refreshing the note

## 📚 Need Help?

- See `README.md` for detailed documentation
- See `IMPLEMENTATION_NOTES.md` for technical details
- Check Standard Notes extension documentation: https://randombits.dev/standard-notes/creating-extensions

---

**Remember**: Every time you make changes and push to `main`, GitHub Actions will automatically rebuild and redeploy your extension!
