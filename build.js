const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Build function
function build() {
  console.log('Building Chrome Extension...');
  
  // Clean dist-extension directory
  if (fs.existsSync('dist-extension')) {
    fs.rmSync('dist-extension', { recursive: true, force: true });
  }
  
  // Create dist-extension directory
  fs.mkdirSync('dist-extension');
  
  // Compile TypeScript
  console.log('Compiling TypeScript...');
  execSync('npx tsc', { stdio: 'inherit' });
  
  // Copy HTML files
  console.log('Copying HTML files...');
  if (fs.existsSync('src/popup.html')) {
    fs.copyFileSync('src/popup.html', 'dist-extension/popup.html');
  }
  
  // Copy compiled JavaScript files
  console.log('Copying compiled JavaScript files...');
  if (fs.existsSync('src/popup.js')) {
    fs.copyFileSync('src/popup.js', 'dist-extension/popup.js');
  }
  if (fs.existsSync('src/content-script.js')) {
    fs.copyFileSync('src/content-script.js', 'dist-extension/content-script.js');
  }
  
  // Copy manifest
  console.log('Copying manifest...');
  if (fs.existsSync('src/manifest.json')) {
    fs.copyFileSync('src/manifest.json', 'dist-extension/manifest.json');
  }
  
  // Copy any other assets (CSS, images, etc.)
  console.log('Copying assets...');
  const assetExtensions = ['.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'];
  
  function copyAssets(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        copyAssets(filePath);
      } else {
        const ext = path.extname(file);
        if (assetExtensions.includes(ext)) {
          const relativePath = path.relative('src', filePath);
          const destPath = path.join('dist-extension', relativePath);
          
          // Ensure destination directory exists
          const destDir = path.dirname(destPath);
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
          }
          
          fs.copyFileSync(filePath, destPath);
        }
      }
    });
  }
  
  copyAssets('src');
  
  console.log('Build complete! Extension files are in dist-extension/');
  console.log('Load the dist-extension folder in Chrome to test your extension.');
}

build();
