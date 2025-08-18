# My First Chrome Extension

A simple Chrome extension built with TypeScript that displays "This is my extension!" when activated.

## Project Structure

```
├── src/                    # Source files
│   ├── popup.html         # Popup window HTML
│   ├── popup.ts           # TypeScript source code
│   └── manifest.json      # Extension manifest
├── dist-extension/        # Built extension (load this in Chrome)
│   ├── popup.html         # Compiled HTML
│   ├── popup.js           # Compiled JavaScript
│   └── manifest.json      # Extension manifest
├── build.js               # Build script
├── tsconfig.json          # TypeScript configuration
└── package.json           # Project dependencies
```

## How to Load the Extension

1. **Build the extension**: Run `npm run build`
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable "Developer mode"** by toggling the switch in the top right
4. **Click "Load unpacked"** and select the `dist-extension` folder
5. **Click the extension icon** in the toolbar to see the popup

## Development Workflow

### Making Changes
1. Edit files in the `src/` directory
2. Run `npm run build` to compile and copy files to `dist-extension/`
3. Reload the extension in Chrome (click the refresh button on the extension card)

### Development Mode
- `npm run dev` - Build once and watch for TypeScript changes
- `npm run watch` - Watch TypeScript files only (faster for development)

## Build Commands

- `npm run build` - Build the complete extension
- `npm run dev` - Build and watch for changes
- `npm run watch` - Watch TypeScript files only

## Adding New Features

To expand your extension:

1. **Add new TypeScript files** in `src/`
2. **Add HTML files** in `src/`
3. **Add CSS files** in `src/` (they'll be automatically copied)
4. **Add images** in `src/` (they'll be automatically copied)
5. **Update manifest.json** in `src/` for new permissions or features

The build script will automatically handle compilation and file copying!
