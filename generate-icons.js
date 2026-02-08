const fs = require('fs');
const path = require('path');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

// SVG template for a camera/screenshot icon
function createIconSVG(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="url(#grad)"/>
  
  <!-- Camera body -->
  <rect x="${size*0.25}" y="${size*0.35}" width="${size*0.5}" height="${size*0.4}" 
        rx="${size*0.05}" fill="white" opacity="0.9"/>
  
  <!-- Lens -->
  <circle cx="${size/2}" cy="${size*0.55}" r="${size*0.15}" 
          fill="white" opacity="0.6"/>
  
  <!-- Flash/viewfinder -->
  <rect x="${size*0.65}" y="${size*0.3}" width="${size*0.08}" height="${size*0.08}" 
        rx="${size*0.02}" fill="white" opacity="0.8"/>
</svg>`;
}

// Icon sizes to generate
const sizes = [16, 32, 48, 128];

sizes.forEach(size => {
  const svg = createIconSVG(size);
  const filename = path.join(iconsDir, `icon${size}.svg`);
  fs.writeFileSync(filename, svg);
  console.log(`✓ Generated icon${size}.svg`);
});

console.log('\n📸 SVG icons generated successfully!');
console.log('\nTo convert to PNG (you have options):');
console.log('\n1. Online converter:');
console.log('   - Visit https://svgtopng.com');
console.log('   - Upload each SVG file');
console.log('   - Download as PNG with same filename');
console.log('\n2. Using ImageMagick (if installed):');
console.log('   convert icons/icon16.svg icons/icon16.png');
console.log('   convert icons/icon32.svg icons/icon32.png');
console.log('   convert icons/icon48.svg icons/icon48.png');
console.log('   convert icons/icon128.svg icons/icon128.png');
console.log('\n3. Using Inkscape (if installed):');
console.log('   inkscape icons/icon16.svg -o icons/icon16.png');
console.log('   inkscape icons/icon32.svg -o icons/icon32.png');
console.log('   inkscape icons/icon48.svg -o icons/icon48.png');
console.log('   inkscape icons/icon128.svg -o icons/icon128.png');
console.log('\nAlternatively, you can use any image editor to create simple PNG icons.');
