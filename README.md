# Multi-Chronometer Standard Notes Extension

A powerful Standard Notes editor extension for tracking multiple timers simultaneously with precision timing and persistent state.

## Features

- ⏱️ Track unlimited chronometers simultaneously
- 🎯 Individual start/pause/reset controls for each timer
- ✏️ Editable timer names and values
- 💾 Automatic sync across all your devices via Standard Notes
- 🔒 End-to-end encrypted through Standard Notes
- 🎨 Adapts to your Standard Notes theme (light/dark mode)
- ⚡ No external dependencies - runs entirely within Standard Notes

## Installation in Standard Notes

### Method 1: Install from URL (After GitHub Pages Setup)

1. Open Standard Notes
2. Go to **Settings** → **Extensions** → **Import Extension**
3. Paste the extension URL:
   ```
   https://yourusername.github.io/chronometer-extension/ext.json
   ```
   *(Replace `yourusername` and `chronometer-extension` with your actual GitHub username and repository name)*
4. Click **Install**
5. The Multi-Chronometer will now be available as an editor option

### Method 2: Install Locally (For Development)

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. In Standard Notes, import the extension using:
   ```
   http://localhost:8080/ext.json
   ```

## Usage

1. Create a new note in Standard Notes
2. Select **Multi-Chronometer** from the editor picker
3. Click **Add Chronometer** to create a new timer
4. Use the controls to:
   - ▶️ Start/Pause timers
   - 🔄 Reset timers
   - ✏️ Edit timer names and values
   - 🗑️ Delete timers

All your chronometer data is automatically saved to the note and synced across all your devices through Standard Notes.

## Deployment to GitHub Pages

This extension is configured for automatic deployment to GitHub Pages via GitHub Actions.

### Setup Steps

1. **Create a GitHub repository** for this project (if you haven't already)

2. **Enable GitHub Pages:**
   - Go to your repository **Settings** → **Pages**
   - Under **Build and deployment**, select:
     - **Source**: GitHub Actions

3. **Update configuration files** with your GitHub information:

   **In `public/ext.json`:**
   ```json
   {
     "url": "https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPO_NAME/",
     "download_url": "https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPO_NAME/latest.zip",
     "latest_url": "https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPO_NAME/ext.json"
   }
   ```

   **In `vite.config.ts`:**
   ```typescript
   base: mode === "production" ? "/YOUR_REPO_NAME/" : "/"
   ```

4. **Push to the `main` branch:**
   ```bash
   git add .
   git commit -m "Configure for GitHub Pages"
   git push origin main
   ```

5. **Wait for deployment:**
   - GitHub Actions will automatically build and deploy
   - Check the **Actions** tab to see the deployment progress
   - Once complete, your extension will be available at:
     ```
     https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPO_NAME/
     ```

6. **Install in Standard Notes** using the URL from step 5 with `/ext.json` appended

## Technologies Used

This extension is built with:

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **sn-extension-api** - Standard Notes integration

## Local Development

### Development Commands

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:8080)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing in Standard Notes

1. Run the development server (`npm run dev`)
2. In Standard Notes, install the extension using:
   ```
   http://localhost:8080/ext.json
   ```
3. Create a note and select the Multi-Chronometer editor
4. Make changes in your code - they'll hot-reload in Standard Notes
5. Test all features to ensure they work correctly

## How It Works

The extension integrates with Standard Notes using the `sn-extension-api` library:

- **Data Storage**: Chronometer data is stored as JSON in the note's `text` field
- **Sync**: Standard Notes handles all synchronization and encryption
- **Themes**: The extension uses Standard Notes theme variables for seamless integration
- **Offline**: Works offline through Standard Notes' desktop app with the download_url

### Architecture

```
┌─────────────────┐
│ Standard Notes  │
│   Application   │
└────────┬────────┘
         │
         │ iframe
         ▼
┌─────────────────┐
│  React App      │
│  (This Ext)     │
├─────────────────┤
│ sn-extension-api│ ◄── Handles communication
└─────────────────┘
         │
         │ JSON data
         ▼
┌─────────────────┐
│  Note.text      │ ◄── Chronometer data
│  (Encrypted)    │
└─────────────────┘
```

## Troubleshooting

### Extension doesn't load
- Check that the URL in `ext.json` matches your GitHub Pages URL
- Verify GitHub Pages is enabled and deployment succeeded
- Clear Standard Notes cache and reinstall the extension

### Data not saving
- Check browser console for errors
- Verify the note is not read-only
- Try creating a new note

### Theme issues
- Ensure `@import 'sn-extension-api/dist/sn.min.css';` is in `src/index.css`
- Check that you're using CSS variables from the theme

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use and modify as needed.

## Resources

- [Standard Notes Extension Guide](https://randombits.dev/standard-notes/creating-extensions)
- [Extension Template](https://github.com/nienow/sn-extension-template)
- [sn-extension-api Documentation](https://github.com/nienow/sn-extension-api)

## Credits

Built with [Lovable](https://lovable.dev) and inspired by the Standard Notes extension ecosystem.

---

## Original Lovable Project

**Project URL**: https://lovable.dev/projects/52ef8967-125e-4e51-88ad-ed2f4e50f1a6

This project was created using Lovable and converted to a Standard Notes extension.
