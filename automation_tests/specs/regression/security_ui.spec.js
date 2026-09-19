const { expect } = require('chai');
const { By, until } = require('selenium-webdriver');
const {
  createDriver,
  clickWhenReady,
  typeWhenReady,
  performLogin
} = require('../../helpers/driver_helper');
const {
  installBrowserProbe,
  expectNoBrowserExecution
} = require('../../helpers/security_helper');
const { xssPayloads, sqlPayloads } = require('../../security_payloads');
const config = require('../../test_config');

describe('Selenium UI Security Regression Tests', function () {
  let driver;

  beforeEach(async function () {
    driver = createDriver();
  });

  afterEach(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it('redirects unauthenticated users away from protected routes', async function () {
    await driver.get(`${config.baseUrl}/assets`);
    await driver.wait(until.urlContains('/Login'), config.timeout);

    const url = await driver.getCurrentUrl();
    expect(url.toLowerCase()).to.include('/login');
  });

  it('keeps login form payloads inert in the browser', async function () {
    await driver.get(config.baseUrl);
    await installBrowserProbe(driver);

    for (const payload of xssPayloads) {
      await typeWhenReady(driver, By.css('input[type="email"]'), payload.value);
      await typeWhenReady(driver, By.css('input[type="password"]'), payload.value);
      await clickWhenReady(driver, By.css('button.btn-submit-premium'));
      await driver.sleep(500);
      await expectNoBrowserExecution(driver);
    }
  });

  it('keeps asset search payloads inert after authenticated navigation', async function () {
    await performLogin(driver);
    await driver.get(`${config.baseUrl}/assets`);
    await installBrowserProbe(driver);

    for (const payload of [...xssPayloads, ...sqlPayloads]) {
      await typeWhenReady(driver, By.name('search'), payload.value);
      await clickWhenReady(driver, By.css('button.icon'));
      await driver.sleep(750);
      await expectNoBrowserExecution(driver);
    }
  });

  it('does not render executable markup returned into the asset table', async function () {
    await performLogin(driver);
    await driver.get(`${config.baseUrl}/assets`);
    await installBrowserProbe(driver);

    const payload = xssPayloads.find((item) => item.name === 'image-error').value;
    await typeWhenReady(driver, By.name('search'), payload);
    await clickWhenReady(driver, By.css('button.icon'));
    await driver.sleep(750);

    const executableNodes = await driver.findElements(By.css('tbody script, tbody img[onerror], tbody svg[onload]'));
    expect(executableNodes).to.have.length(0);
    await expectNoBrowserExecution(driver);
  });
});
