
const { chromium } = require('playwright');
const path = require('path');

const TARGET_URL = 'http://localhost:5173';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 Starting Frontend Validation...');

    // 1. Login
    await page.goto(`${TARGET_URL}/login`);
    console.log('Current URL (start):', await page.url());
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Check if there are login errors visible
    const errorText = await page.getByRole('alert').allInnerTexts().catch(() => []);
    if (errorText.length > 0) {
      console.log('❌ Login error detected:', errorText[0]);
    }

    try {
      await page.waitForURL(`${TARGET_URL}/`, { timeout: 10000 });
      console.log('✅ Login successful');
    } catch (e) {
      console.log('Current URL (fail):', await page.url());
      await page.screenshot({ path: '/tmp/login-fail.png' });
      console.log('📸 Saved login fail screenshot to /tmp/login-fail.png');
      throw e;
    }

    // 2. Test Service Management Navigation
    await page.click('nav >> text=Servicios');
    await page.waitForURL('**/services');
    console.log('✅ Navigated to Service Management');

    // Check tabs
    await page.waitForSelector('button:has-text("Tipologías")');
    console.log('✅ Found Tipologías tab');
    
    await page.click('button:has-text("Asignaciones")');
    console.log('✅ Clicked Asignaciones tab');
    
    // Wait for mapping table to show something
    await page.waitForSelector('td:has-text("Empresa")');
    console.log('✅ Service Mappings are listed');

    // 3. Test Service Request Filtering
    await page.click('nav >> text=Solicitudes');
    await page.waitForURL('**/requests');
    
    await page.goto(`${TARGET_URL}/requests/new`);
    console.log('✅ Navigated to New Request form');

    // Wait for equipment list to load beyond the placeholder
    const selects = page.locator('select');
    await page.waitForFunction(() => {
      const sels = document.querySelectorAll('select');
      return sels[0] && sels[0].options.length > 1;
    });
    
    // Select an equipment (e.g., Máscara)
    const eqLabel = await page.evaluate(() => {
      const el = document.querySelectorAll('select')[0];
      const options = Array.from(el.options);
      return options.find(o => o.text.includes('Máscara'))?.text;
    });
    
    if (eqLabel) {
      await selects.first().selectOption({ label: eqLabel });
      console.log(`✅ Selected equipment: ${eqLabel}`);
    }

    // Wait for service types to load and enable
    await page.waitForFunction(() => {
      const sels = document.querySelectorAll('select');
      return sels[1] && !sels[1].disabled;
    });
    
    let serviceOptions = await selects.nth(1).locator('option').allInnerTexts();
    console.log('Available services for Máscara:', serviceOptions.filter(o => !o.includes('Seleccionar')));

    // Now try ERA
    const eraLabel = await page.evaluate(() => {
      const el = document.querySelectorAll('select')[0];
      const options = Array.from(el.options);
      return options.find(o => o.text.includes('Autónoma'))?.text;
    });

    if (eraLabel) {
      await selects.first().selectOption({ label: eraLabel });
      console.log(`✅ Selected equipment: ${eraLabel}`);
      
      // Wait for options to update
      await page.waitForTimeout(1000);
      
      const eraServices = await selects.nth(1).locator('option').allInnerTexts();
      console.log('Available services for ERA:', eraServices.filter(o => !o.includes('Seleccionar')));
      
      if (eraServices.some(o => o.includes('Limpieza'))) {
        console.error('❌ "Limpieza" should NOT be available for ERA');
      } else {
        console.log('✅ "Limpieza" correctly excluded for ERA');
      }
    }

    await page.screenshot({ path: '/tmp/frontend-validation.png' });
    console.log('📸 Final screenshot saved to /tmp/frontend-validation.png');

  } catch (error) {
    console.error('❌ Error during validation:', error);
  } finally {
    await browser.close();
  }
})();
