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

// iOS splash screen sizes
const SPLASH_SCREENS = [
  { width: 1284, height: 2778, name: 'iPhone14ProMax' },   // iPhone 14 Pro Max
  { width: 1170, height: 2532, name: 'iPhone14Pro' },      // iPhone 14 Pro
  { width: 1179, height: 2556, name: 'iPhone14' },         // iPhone 14
  { width: 1170, height: 2532, name: 'iPhone13Pro' },      // iPhone 13 Pro
  { width: 1080, height: 2340, name: 'iPhone12Mini' },     // iPhone 12 Mini
  { width: 1125, height: 2436, name: 'iPhoneX' },          // iPhone X
  { width: 828, height: 1792, name: 'iPhoneXr' },          // iPhone Xr
  { width: 750, height: 1334, name: 'iPhone8' },           // iPhone 8
  // iPad sizes
  { width: 1668, height: 2388, name: 'iPadPro3' },         // iPad Pro 11-inch
  { width: 2048, height: 2732, name: 'iPadPro4' },         // iPad Pro 12.9-inch
];

async function generateIcons() {
  try {
    // Create icons directory if it doesn't exist
    await fs.mkdir(ICONS_DIR, { recursive: true });

    // Generate PWA icons
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

    // Generate Apple touch icons
    await sharp(SOURCE_ICON)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toFile(path.join(process.cwd(), 'public', 'apple-touch-icon.png'));

    console.log('✅ Generated PWA icons successfully');

    // Create splash screens directory
    const splashDir = path.join(process.cwd(), 'public', 'splash');
    await fs.mkdir(splashDir, { recursive: true });

    // Generate splash screens
    for (const screen of SPLASH_SCREENS) {
      // Calculate the size of the icon on the splash screen (40% of the smaller dimension)
      const iconSize = Math.min(screen.width, screen.height) * 0.4;
      
      // Create a blank canvas with background color
      const canvas = sharp({
        create: {
          width: screen.width,
          height: screen.height,
          channels: 4,
          background: { r: 17, g: 24, b: 39, alpha: 1 } // bg-gray-900
        }
      });

      // Read and resize the icon
      const icon = await sharp(SOURCE_ICON)
        .resize(Math.round(iconSize), Math.round(iconSize), {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toBuffer();

      // Composite the icon onto the center of the canvas
      await canvas
        .composite([{
          input: icon,
          top: Math.round((screen.height - iconSize) / 2),
          left: Math.round((screen.width - iconSize) / 2)
        }])
        .toFile(path.join(splashDir, `splash-${screen.name}.png`));
    }

    console.log('✅ Generated iOS splash screens successfully');
    console.log('\n🎉 All PWA icons and iOS splash screens generated successfully!');
    console.log(`📁 Icons are located in: ${ICONS_DIR}`);
    console.log(`📁 Splash screens are located in: ${path.join(process.cwd(), 'public', 'splash')}`);
    
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
