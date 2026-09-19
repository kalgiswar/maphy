const { expect } = require('chai');
const { By, until } = require('selenium-webdriver');
const config = require('../../test_config');
const {
  createDriver,
  clickWhenReady,
  performLogin
} = require('../../helpers/driver_helper');

async function countVisible(driver, selector) {
  const elements = await driver.findElements(By.css(selector));
  let visible = 0;

  for (const element of elements) {
    if (await element.isDisplayed()) {
      visible += 1;
    }
  }

  return visible;
}

describe('UI Form Validation Workflow Tests', function () {
  let driver;

  beforeEach(async function () {
    driver = createDriver();
  });

  afterEach(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it('shows required validation when login is submitted empty', async function () {
    await driver.get(`${config.baseUrl}/login`);
    await clickWhenReady(driver, By.css('button.btn-submit-premium'));

    await driver.wait(async () => {
      return (await countVisible(driver, '.text-danger')) >= 2;
    }, config.timeout);

    expect(await countVisible(driver, '.text-danger')).to.be.at.least(2);
    expect(await driver.getCurrentUrl()).to.include('/login');
  });

  it('shows required validation when company create form is submitted empty', async function () {
    await performLogin(driver);
    await driver.get(`${config.baseUrl}/addEditCompany`);
    await driver.wait(until.elementLocated(By.css('form')), config.timeout);

    await clickWhenReady(driver, By.css('button[type="submit"]'));

    await driver.wait(async () => {
      return (await countVisible(driver, '.error, .text-danger, .invalid-feedback')) >= 1;
    }, config.timeout);

    expect(await countVisible(driver, '.error, .text-danger, .invalid-feedback')).to.be.at.least(1);
    expect(await driver.getCurrentUrl()).to.include('/addEditCompany');
  });
});
