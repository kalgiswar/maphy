const { expect } = require('chai');
const { By, until } = require('selenium-webdriver');
const {
  createDriver,
  performLogin
} = require('../../helpers/driver_helper');
const { discoverFrontendPages } = require('../../helpers/project_inventory');
const config = require('../../test_config');

async function waitForDocumentReady(driver) {
  await driver.wait(async () => {
    const readyState = await driver.executeScript('return document.readyState');
    return readyState === 'complete' || readyState === 'interactive';
  }, config.timeout);
}

async function getBodyText(driver) {
  const body = await driver.wait(until.elementLocated(By.css('body')), config.timeout);
  return body.getText();
}

async function expectUsablePage(driver, expectedPath, allowLoginPage = false) {
  await waitForDocumentReady(driver);
  await driver.sleep(750);

  const currentUrl = await driver.getCurrentUrl();
  const bodyText = await getBodyText(driver);

  if (!allowLoginPage) {
    expect(currentUrl.toLowerCase(), `${expectedPath} redirected to login`).to.not.include('/login');
  }

  expect(bodyText.trim(), `${expectedPath} rendered a blank page`).to.not.equal('');
  expect(bodyText, `${expectedPath} rendered a React/runtime error`).to.not.match(
    /cannot read properties|undefined is not an object|script error|application error|runtime error|failed to compile/i
  );
}

describe('Whole Project UI Page Smoke Coverage', function () {
  this.timeout(180000);

  const pages = discoverFrontendPages();
  const publicPages = pages.filter((page) => !page.auth);
  const protectedPages = pages.filter((page) => page.auth);

  let driver;

  before(async function () {
    driver = createDriver();
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  async function ensureLoggedIn() {
    const token = await driver.executeScript('return window.localStorage.getItem("maphytoken");');
    if (!token) {
      await performLogin(driver);
    }
  }

  it('discovers all configured React Router pages', function () {
    expect(pages.length).to.be.greaterThan(80);
    expect(pages.map((page) => page.path)).to.include.members([
      '/',
      '/Dashboard',
      '/assets',
      '/accessories',
      '/components',
      '/consumables',
      '/license',
      '/tickets',
      '/peoples',
      '/adminsetting',
      '/login'
    ]);
  });

  for (const page of publicPages) {
    it(`loads public page ${page.path}`, async function () {
      await driver.get(`${config.baseUrl}${page.materializedPath}`);
      await expectUsablePage(driver, page.path, true);
    });
  }

  for (const page of protectedPages) {
    it(`loads protected page ${page.path}`, async function () {
      await ensureLoggedIn();
      await driver.get(`${config.baseUrl}${page.materializedPath}`);
      await expectUsablePage(driver, page.path);
    });
  }
});
