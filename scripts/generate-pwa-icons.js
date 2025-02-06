const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const ICONS_DIR = path.join(process.cwd(), 'public', 'icons');
const SOURCE_ICON = path.join(process.cwd(), 'public', 'logo.jpg'); // Your source image

const ICON_SIZES = [
  72,
  96,
  128,
  144,
  152,
  192,
  384,
  512
];

async function generateIcons() {
  try {
    // Create icons directory if it doesn't exist
    await fs.mkdir(ICONS_DIR, { recursive: true });

    // Generate icons for each size
    for (const size of ICON_SIZES) {
      const iconPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
      
      await sharp(SOURCE_ICON)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 17, g: 24, b: 39, alpha: 1 } // bg-gray-900
        })
        .toFile(iconPath);

      console.log(`✅ Generated ${size}x${size} icon`);
    }

    console.log('\n🎉 All PWA icons generated successfully!');
    console.log(`📁 Icons are located in: ${ICONS_DIR}`);
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`❌ Error: Source image not found at ${SOURCE_ICON}`);
      console.log('\nPlease add your source image (logo.png) to the public directory.');
    } else {
      console.error('❌ Error generating icons:', error);
    }
    process.exit(1);
  }
}

generateIcons();
