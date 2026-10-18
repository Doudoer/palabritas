const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = '/Users/user/.gemini/antigravity-ide/brain/15dbc1a8-4c25-4919-9aa3-42eb487da8dd';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function run() {
  console.log('🚀 Iniciando Chrome en modo móvil (390x844)...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: {
      width: 390,
      height: 844,
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
    },
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  console.log('✅ Aplicación cargada en localhost:3000');

  // Wait a moment for any initial render
  await new Promise(r => setTimeout(r, 1200));

  // Find and click "Mi Cuarto" in bottom navigation or tab
  console.log('👉 Navegando a "Mi Cuarto"...');
  await page.evaluate(() => {
    // Look for button with text "Mi Cuarto"
    const buttons = Array.from(document.querySelectorAll('button, nav button'));
    const miCuartoBtn = buttons.find(b => b.textContent && b.textContent.includes('Mi Cuarto'));
    if (miCuartoBtn) {
      miCuartoBtn.click();
    }
  });

  await new Promise(r => setTimeout(r, 1500));

  // Scroll Room Stage into view so it is not obscured by fixed headers or bottom dock
  await page.evaluate(() => {
    const stage = document.querySelector('.relative.w-full.min-h-\\[460px\\]') || document.querySelector('[title*="Cuarto de"]');
    if (stage) {
      stage.scrollIntoView({ behavior: 'instant', block: 'center' });
    }
  });
  await new Promise(r => setTimeout(r, 600));

  // 1. Screenshot of Mi Cuarto: Avatar + Room
  const screenshot1Path = path.join(ARTIFACT_DIR, 'sim_1_mi_cuarto_room.png');
  await page.screenshot({ path: screenshot1Path, fullPage: false });
  console.log('📸 Captura 1 guardada:', screenshot1Path);

  // 2. Click on the floor to make the avatar walk!
  console.log('👉 Simulando toque en el piso para caminar...');
  await page.evaluate(() => {
    const floor = document.querySelector('[title*="mover a tu niña"]') || document.querySelector('[class*="border-t-4 border-[#e2a875]"]');
    if (floor) {
      const rect = floor.getBoundingClientRect();
      const clickEvent = new MouseEvent('click', {
        clientX: rect.left + rect.width * 0.25,
        clientY: rect.top + rect.height * 0.5,
        bubbles: true,
        cancelable: true,
        view: window,
      });
      floor.dispatchEvent(clickEvent);
    }
  });

  await new Promise(r => setTimeout(r, 800));

  // Click on avatar to trigger speech bubble and celebration
  console.log('👉 Tocando al avatar de la niña...');
  await page.evaluate(() => {
    const avatar = document.querySelector('[title*="Toca a la niña"]') || document.querySelector('.anim-breathe');
    if (avatar) {
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
      avatar.dispatchEvent(clickEvent);
    }
  });

  await new Promise(r => setTimeout(r, 800));

  await page.evaluate(() => {
    const stage = document.querySelector('.relative.w-full.min-h-\\[460px\\]');
    if (stage) stage.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 400));

  const screenshot2Path = path.join(ARTIFACT_DIR, 'sim_2_avatar_walk_speech.png');
  await page.screenshot({ path: screenshot2Path, fullPage: false });
  console.log('📸 Captura 2 guardada (caminar + hablar):', screenshot2Path);

  // 3. Click on "Mi Armario" to open the wardrobe modal!
  console.log('👉 Abriendo "Mi Armario"...');
  await page.evaluate(() => {
    const armarioBtn = document.querySelector('[title*="mi armario"]') || Array.from(document.querySelectorAll('span, button, div')).find(el => el.textContent && el.textContent.trim() === 'Mi Armario');
    if (armarioBtn) {
      armarioBtn.click();
    }
  });

  await new Promise(r => setTimeout(r, 1000));

  const screenshot3Path = path.join(ARTIFACT_DIR, 'sim_3_armario_modal_open.png');
  await page.screenshot({ path: screenshot3Path, fullPage: false });
  console.log('📸 Captura 3 guardada (modal armario centrado):', screenshot3Path);

  // 4. Test tabs inside the wardrobe: Click "🏠 Mi Habitación" tab
  console.log('👉 Cambiando a pestaña "Mi Habitación" en el armario...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const habTab = tabs.find(t => t.textContent && t.textContent.includes('Mi Habitación'));
    if (habTab) {
      habTab.click();
    }
  });

  await new Promise(r => setTimeout(r, 800));

  const screenshot4Path = path.join(ARTIFACT_DIR, 'sim_4_armario_tab_habitacion.png');
  await page.screenshot({ path: screenshot4Path, fullPage: false });
  console.log('📸 Captura 4 guardada (pestaña habitación):', screenshot4Path);

  // 4b. Equip Cama Nube Soñadora
  console.log('👉 Equipando Cama Nube Soñadora...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const ponerBtn = buttons.find(b => b.textContent && b.textContent.includes('Poner en Cuarto'));
    if (ponerBtn) {
      ponerBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 800));

  // 5. Close the wardrobe modal
  console.log('👉 Cerrando el armario...');
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[aria-label="Cerrar armario"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Cerrar'));
    if (closeBtn) {
      closeBtn.click();
    }
  });

  await new Promise(r => setTimeout(r, 800));

  await page.evaluate(() => {
    const stage = document.querySelector('.relative.w-full.min-h-\\[460px\\]');
    if (stage) stage.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 400));

  const screenshotEquippedPath = path.join(ARTIFACT_DIR, 'sim_4b_room_with_bed_equipped.png');
  await page.screenshot({ path: screenshotEquippedPath, fullPage: false });
  console.log('📸 Captura 4b guardada (habitación con cama nube equipada):', screenshotEquippedPath);

  // 6. Navigate to "Minijuegos" (Rasca)
  console.log('👉 Navegando a pestaña "Minijuegos"...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const miniTab = tabs.find(t => t.textContent && t.textContent.includes('Minijuegos'));
    if (miniTab) {
      miniTab.click();
    }
  });

  await new Promise(r => setTimeout(r, 1000));

  // Simulate scratch on canvas
  console.log('👉 Simulando rascado táctil en la lámina mágica...');
  await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      // Dispatch touch/mouse scratch strokes
      for (let i = 0; i < 20; i++) {
        const clientX = rect.left + 50 + (i * 12);
        const clientY = rect.top + 60 + ((i % 4) * 20);
        const touch = new Touch({
          identifier: 1,
          target: canvas,
          clientX: clientX,
          clientY: clientY,
        });
        const touchEvent = new TouchEvent('touchmove', {
          touches: [touch],
          targetTouches: [touch],
          changedTouches: [touch],
          bubbles: true,
          cancelable: true,
        });
        canvas.dispatchEvent(touchEvent);
      }
    }
  });

  await new Promise(r => setTimeout(r, 1000));

  const screenshot5Path = path.join(ARTIFACT_DIR, 'sim_5_minijuegos_scratch.png');
  await page.screenshot({ path: screenshot5Path, fullPage: false });
  console.log('📸 Captura 5 guardada (minijuego rascador):', screenshot5Path);

  await browser.close();
  console.log('🎉 Simulación completada con éxito!');
}

run().catch(err => {
  console.error('❌ Error en la simulación:', err);
  process.exit(1);
});
