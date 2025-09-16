// Generate 128x128 PNG icon from SVG
const path = require('path');
const sharp = require('sharp');

const svgPath = path.resolve(__dirname, '..', 'media', 'icon.svg');
const pngPath = path.resolve(__dirname, '..', 'media', 'icon.png');

(async () => {
  try {
    await sharp(svgPath, { density: 384 })
      .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(pngPath);
    console.log(`[icon] Wrote ${pngPath}`);
  } catch (err) {
    console.error('[icon] Failed to generate PNG:', err);
    process.exit(1);
  }
})();
