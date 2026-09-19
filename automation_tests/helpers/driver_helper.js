const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const config = require('../test_config');

/**
 * Creates and returns a Selenium WebDriver instance for Chrome.
 */
function createDriver() {
  const options = new chrome.Options();
  const defaultChromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeBinaryPath = process.env.CHROME_BINARY_PATH || (fs.existsSync(defaultChromePath) ? defaultChromePath : '');
  
  if (config.headless) {
    options.addArguments('--headless=new');
  }
  if (chromeBinaryPath) {
    options.setChromeBinaryPath(chromeBinaryPath);
  }
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-gpu');
  options.addArguments('--window-size=1440,900');

  // Suppress logs and extensions
  options.excludeSwitches('enable-logging');

  const builder = new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options);

  if (process.env.CHROMEDRIVER_PATH) {
    builder.setChromeService(new chrome.ServiceBuilder(process.env.CHROMEDRIVER_PATH));
  }

  return builder.build();
}

/**
 * Reusable helper to wait for an element to be located in the DOM.
 */
async function waitForElement(driver, locator, customTimeout = config.timeout) {
  return await driver.wait(until.elementLocated(locator), customTimeout);
}

/**
 * Reusable helper to wait for an element to be visible and active in the viewport.
 */
async function waitForVisible(driver, locator, customTimeout = config.timeout) {
  const element = await waitForElement(driver, locator, customTimeout);
  await driver.wait(until.elementIsVisible(element), customTimeout);
  return element;
}


/**
 * Optional sleep delay to slow down the UI tests for human observation.
 */
async function sleepIfConfigured(driver) {
  const slowDown = parseInt(process.env.UI_SLOW_DOWN_MS || '0', 10);
  if (slowDown > 0) {
    await driver.sleep(slowDown);
  }
}

/**
 * Reusable helper to wait for an element to be visible and click it.
 */
async function clickWhenReady(driver, locator, customTimeout = config.timeout) {
  const element = await waitForVisible(driver, locator, customTimeout);
  // Optional small sleep to let animations finish
  await driver.sleep(200);
  try {
    await element.click();
  } catch (err) {
    console.log(`Normal click failed, trying JS click: ${err.message}`);
    await driver.executeScript("arguments[0].click();", element);
  }
  await sleepIfConfigured(driver);
}

/**
 * Reusable helper to wait for an input field to be visible, clear it, and type text.
 */
async function typeWhenReady(driver, locator, text, customTimeout = config.timeout) {
  const element = await waitForVisible(driver, locator, customTimeout);
  await element.clear();
  await element.sendKeys(text);
  await sleepIfConfigured(driver);
}

/**
 * Bulletproof helper to set date inputs via JavaScript and trigger React state updates.
 * Calls the native prototype property setter directly so React intercepts the change.
 */
async function setDateWhenReady(driver, locator, dateStr, customTimeout = config.timeout) {
  const element = await waitForVisible(driver, locator, customTimeout);
  await driver.executeScript(
    `const element = arguments[0];
     const value = arguments[1];
     const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
     nativeSetter.call(element, value);
     element.dispatchEvent(new Event('input', { bubbles: true }));
     element.dispatchEvent(new Event('change', { bubbles: true }));`,
    element,
    dateStr
  );
  await sleepIfConfigured(driver);
}

/**
 * Performs a standard login using the configured credentials.
 */
async function performLogin(driver) {
  await driver.get(config.baseUrl);
  await sleepIfConfigured(driver);
  
  // Enter credentials
  await typeWhenReady(driver, By.css('input[type="email"]'), config.credentials.username);
  await typeWhenReady(driver, By.css('input[type="password"]'), config.credentials.password);
  
  // Submit the form
  await clickWhenReady(driver, By.css('button.btn-submit-premium'));
  
  // Wait for the URL to route to /Dashboard
  await driver.wait(until.urlContains('/Dashboard'), config.timeout);
  await sleepIfConfigured(driver);
}

module.exports = {
  createDriver,
  waitForElement,
  waitForVisible,
  clickWhenReady,
  typeWhenReady,
  setDateWhenReady,
  performLogin
};
