import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

async function main() {
  const logoPath = path.resolve('public/logo-app.png');
  const apkPath = path.resolve('palabritas.apk');

  const densities: Record<string, number> = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192
  };

  const tempDir = path.resolve('.temp-apk-icons');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const generatedWebp: { zipPath: string; buffer: Buffer }[] = [];

  for (const [folder, size] of Object.entries(densities)) {
    // 1. Regular square/squircle webp
    const regularWebpBuf = await sharp(logoPath)
      .resize(size, size, { fit: 'cover' })
      .webp({ quality: 90 })
      .toBuffer();

    // 2. Round icon webp with circular mask
    const circleSvg = Buffer.from(
      `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`
    );

    const roundWebpBuf = await sharp(logoPath)
      .resize(size, size, { fit: 'cover' })
      .composite([{ input: circleSvg, blend: 'dest-in' }])
      .webp({ quality: 90 })
      .toBuffer();

    // Save to app/src/main/res
    const resDir = path.resolve('app/src/main/res', folder);
    if (!fs.existsSync(resDir)) fs.mkdirSync(resDir, { recursive: true });

    fs.writeFileSync(path.join(resDir, 'ic_launcher.webp'), regularWebpBuf);
    fs.writeFileSync(path.join(resDir, 'ic_launcher_round.webp'), roundWebpBuf);

    // Also collect for APK zip replacement
    const v4Folder = `${folder}-v4`;
    generatedWebp.push({
      zipPath: `res/${v4Folder}/ic_launcher.webp`,
      buffer: regularWebpBuf
    });
    generatedWebp.push({
      zipPath: `res/${v4Folder}/ic_launcher_round.webp`,
      buffer: roundWebpBuf
    });

    console.log(`✓ Generated ${folder} (${size}x${size}) webp icons`);
  }

  // Update palabritas.apk if it exists
  if (fs.existsSync(apkPath)) {
    console.log(`Updating ${apkPath}...`);
    // Backup original APK first
    const backupPath = path.resolve('palabritas.apk.bak');
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(apkPath, backupPath);
      console.log(`✓ Created backup: ${backupPath}`);
    }

    const zip = new AdmZip(apkPath);
    for (const item of generatedWebp) {
      // Remove existing entry if present
      const entry = zip.getEntry(item.zipPath);
      if (entry) {
        zip.deleteFile(entry);
      }
      const dir = path.dirname(item.zipPath);
      const filename = path.basename(item.zipPath);
      zip.addFile(item.zipPath, item.buffer);
    }
    zip.writeZip(apkPath);
    console.log(`✓ Successfully updated palabritas.apk with new WebP launcher icons!`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
