# Standard Notes Extension Implementation

## Changes Made

This document outlines the changes made to convert the Multi-Chronometer app into a Standard Notes extension.

### 1. Dependencies
- ✅ Added `sn-extension-api` package for Standard Notes integration
- ✅ Removed `react-router-dom` (not needed for extension)

### 2. Core Application Changes

#### `src/pages/Index.tsx`
- Replaced `localStorage` with Standard Notes API
- Added `snApi.initialize()` on mount
- Added `snApi.subscribe()` to receive note data
- Save chronometer data to `snApi.text` as JSON
- All data is now stored in the note's `text` field

#### `src/App.tsx`
- Removed React Router and routing logic
- Removed `<BrowserRouter>` and `<Routes>`
- Renders `<Index />` component directly
- Removed NotFound page (not needed in extension context)

#### `src/index.css`
- Added `@import 'sn-extension-api/dist/sn.min.css'` at the top
- This imports Standard Notes theme CSS variables
- Allows the extension to adapt to Standard Notes themes

#### `index.html`
- Simplified meta tags (removed OG and Twitter cards)
- Extensions run in iframes, so standalone SEO not needed

### 3. Configuration Files

#### `public/ext.json` (NEW)
- Extension manifest file
- Defines extension metadata (name, description, version)
- Specifies installation URLs
- **IMPORTANT**: Must be updated with actual GitHub Pages URL

#### `vite.config.ts`
- Added `base` configuration for GitHub Pages
- Uses `/chronometer-extension/` in production
- **IMPORTANT**: Must match your GitHub repository name

### 4. Deployment

#### `.github/workflows/deploy.yml` (NEW)
- GitHub Actions workflow for automatic deployment
- Builds and deploys to GitHub Pages on push to main
- No manual deployment needed

### 5. Documentation

#### `README.md`
- Complete rewrite for Standard Notes extension
- Installation instructions for users
- Deployment guide for GitHub Pages
- Development and testing instructions

## Before You Deploy

Make sure to update these files with your actual GitHub information:

1. **`public/ext.json`** - Update all URLs:
   ```json
   "url": "https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/"
   ```

2. **`vite.config.ts`** - Update base path:
   ```typescript
   base: mode === "production" ? "/YOUR_REPO_NAME/" : "/"
   ```

## How Data is Stored

### Before (Standalone App)
```javascript
localStorage.setItem('chronometers', JSON.stringify(chronometers));
```

### After (Standard Notes Extension)
```javascript
snApi.text = JSON.stringify(chronometers);
// Standard Notes encrypts and syncs this automatically
```

## Testing Locally

1. Start dev server: `npm run dev`
2. In Standard Notes, import extension:
   ```
   http://localhost:8080/ext.json
   ```
3. Create a note and select Multi-Chronometer editor
4. Test all features

## Production Deployment

1. Push code to GitHub
2. GitHub Actions automatically builds and deploys
3. Extension available at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`
4. Users install via: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/ext.json`

## Key Benefits

✅ **Encrypted**: All data encrypted by Standard Notes
✅ **Synced**: Automatic sync across all devices  
✅ **Themed**: Adapts to Standard Notes light/dark themes
✅ **Offline**: Works offline in Standard Notes desktop app
✅ **Simple**: No backend or database setup required

## Architecture

```
Standard Notes App
    ↓ (iframe)
Multi-Chronometer Extension
    ↓ (sn-extension-api)
Note.text (JSON data)
    ↓
Standard Notes Sync & Encryption
```

## Next Steps

1. Update `public/ext.json` with your GitHub Pages URL
2. Update `vite.config.ts` with your repository name
3. Push to GitHub and enable GitHub Pages
4. Wait for deployment to complete
5. Install extension in Standard Notes using your URL
6. Share your extension with the Standard Notes community!
