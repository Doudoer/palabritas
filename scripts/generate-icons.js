import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generate() {
  const svgBuffer = fs.readFileSync(path.resolve('./public/icon.svg'));

  // 192x192 PNG
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.resolve('./public/pwa-192x192.png'));

  // 512x512 PNG
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.resolve('./public/pwa-512x512.png'));

  // Apple touch icon 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.resolve('./public/apple-touch-icon.png'));

  // Maskable 512x512 (with 15% safe-zone margin per PWA spec: background filled, icon centered with padding)
  // Maskable dimensions: 512x512 canvas, icon scaled to 410x410 inside
  const innerIcon = await sharp(svgBuffer)
    .resize(410, 410)
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 255, g: 126, b: 95, alpha: 1 }, // brand orange-coral #ff7e5f
    },
  })
    .composite([
      {
        input: innerIcon,
        gravity: 'center',
      },
    ])
    .png()
    .toFile(path.resolve('./public/pwa-maskable-512x512.png'));

  // Favicon 64x64 PNG copied to favicon.ico
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.resolve('./public/favicon.ico'));

  console.log('All PWA icons generated successfully!');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
