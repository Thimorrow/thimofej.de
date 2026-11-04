import assert from 'node:assert/strict';

export async function checkLiltHitAreas(page) {
  async function clickPoint({x, y}) {
    await page.cdp('Input.dispatchMouseEvent', {type: 'mousePressed', x, y, button: 'left', clickCount: 1});
    await page.cdp('Input.dispatchMouseEvent', {type: 'mouseReleased', x, y, button: 'left', clickCount: 1});
  }
  async function click(selector) {
    const point = await page.evaluate(selector => {
      const element = document.querySelector(selector);
      element.scrollIntoView({block: 'center', behavior: 'instant'});
      const bounds = element.getBoundingClientRect();
      return {x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2};
    }, selector);
    await clickPoint(point);
  }
  async function settled(open) {
    await page.waitForFunction(open => {
      const stage = document.querySelector('.lilt-demo-stage');
      const height = open ? document.querySelector('.lilt-demo-expanded').offsetHeight : 32;
      return stage.dataset.open === String(open) && Math.abs(parseFloat(document.querySelector('.lilt-demo-shadow').style.height) - height) < .01;
    }, open);
  }
  async function openNotch() {await click('.lilt-demo-compact');await settled(true);}
  async function leftOfPlay() {
    const point = await page.evaluate(() => {
      const bounds = document.querySelector('.lilt-demo-focus .lilt-demo-primary').getBoundingClientRect();
      const x = bounds.left - 30, y = bounds.top + bounds.height / 2;
      return {x, y, button: document.elementFromPoint(x, y)?.closest('button')?.className ?? null};
    });
    assert.equal(point.button, null, 'Blank space left of Play must not belong to the activity button');
    return point;
  }

  await page.waitForSelector('.lilt-demo-stage');
  if (await page.evaluate(() => document.querySelector('.lilt-demo-stage').dataset.open !== 'true')) await openNotch();
  await click('.lilt-demo-tabs button:nth-of-type(2)');
  await settled(true);
  await clickPoint(await leftOfPlay());await settled(false);
  await openNotch();
  await click('.lilt-demo-activity>span');
  await page.waitForSelector('.lilt-demo-menu[data-activity=true]');
  await clickPoint(await leftOfPlay());
  await page.waitForFunction(() => !document.querySelector('.lilt-demo-menu'));
  assert.equal(await page.evaluate(() => document.querySelector('.lilt-demo-stage').dataset.open), 'true');
  await click('.lilt-demo-focus .lilt-demo-primary');
  await page.waitForSelector('.lilt-demo-focus .lilt-demo-pill');
  assert.equal(await page.evaluate(() => document.querySelector('.lilt-demo-stage').dataset.open), 'true');
  await clickPoint(await leftOfPlay());await settled(false);
  await openNotch();
  await click('.lilt-demo-focus .lilt-demo-icon-button');
  await click('.lilt-demo-tabs button:nth-of-type(1)');
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.lilt-demo-music')).opacity === '1');
  await click('.lilt-demo-track');await settled(false);
  await openNotch();
  await click('.lilt-demo-tabs button:nth-of-type(2)');
  return {idleGapFolds: true,activityLabelOpensMenu: true,gapDismissesMenuOnly: true,playKeepsOpen: true,runningGapFolds: true,musicTextFolds: true};
}

export async function checkLiltResponsiveHitAreas(page, baseUrl) {
  async function clickPoint({x, y}) {
    await page.cdp('Input.dispatchMouseEvent', {type: 'mousePressed', x, y, button: 'left', clickCount: 1});
    await page.cdp('Input.dispatchMouseEvent', {type: 'mouseReleased', x, y, button: 'left', clickCount: 1});
  }
  async function click(selector) {
    await clickPoint(await page.evaluate(selector => {
      const element = document.querySelector(selector);
      element.scrollIntoView({block: 'center', behavior: 'instant'});
      const bounds = element.getBoundingClientRect();
      return {x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2};
    }, selector));
  }
  let step = 'mobile page';
  try {
    await page.cdp('Emulation.setDeviceMetricsOverride', {width: 390, height: 844, deviceScaleFactor: 1, mobile: true});
    const url = `${baseUrl}/de#lilt`;
    if (await page.url() === url) await page.reload();else await page.goto(url);
    await page.waitForFunction(() => document.querySelector('.lilt-demo-inline')?.inert);
    await page.evaluate(async () => {await document.fonts.ready;await document.querySelector('.lilt-work-device').decode();});
    step = 'open enlarged view';
    await click('.lilt-demo-enlarge');
    await page.waitForFunction(() => document.querySelector('.lilt-demo-stage')?.dataset.small === 'true');
    const gap = await page.evaluate(() => {
      const bounds = document.querySelector('.lilt-demo-focus .lilt-demo-primary').getBoundingClientRect();
      const x = bounds.left - 30, y = bounds.top + bounds.height / 2;
      return {x, y, button: document.elementFromPoint(x, y)?.closest('button')?.className ?? null};
    });
    assert.equal(gap.button, null, 'The mobile timer must not stretch into the blank space left of Play');
    step = 'fold via mobile gap';
    await clickPoint(gap);
    await page.waitForFunction(() => document.querySelector('.lilt-demo-stage').dataset.open === 'false');
    step = 'mobile sliders';
    await click('.lilt-demo-compact');
    await page.waitForFunction(() => Math.abs(parseFloat(document.querySelector('.lilt-demo-shadow').style.height) - 252) < .01);
    await click('.lilt-demo-tabs button:nth-of-type(1)');
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.lilt-demo-music')).opacity === '1');
    const seek = await page.evaluate(() => {
      const input = document.querySelector('.lilt-demo-progress input');
      const bounds = input.getBoundingClientRect();
      const x = bounds.x + bounds.width / 2, y = bounds.bottom - 2;
      return {x, y, height: bounds.height, edgeIsSlider: document.elementFromPoint(x, y) === input};
    });
    assert.ok(seek.height >= 44 && seek.edgeIsSlider, 'The mobile seek target must have 44px height without another control covering its edge');
    await clickPoint(seek);
    assert.equal(await page.evaluate(() => document.querySelector('.lilt-demo-stage').dataset.page), 'music');
    await click('.lilt-demo-settings');
    await page.waitForSelector('.lilt-demo-detail[open]');
    assert.ok(await page.evaluate(() => document.querySelector('.lilt-demo-preferences input[type=range]').getBoundingClientRect().height >= 44));
    await click('.lilt-demo-detail header button');
    await click('.lilt-demo-fold');
    step = 'return to folded preview';
    await click('.lilt-demo-dialog-bar button');
    await page.waitForFunction(() => document.querySelector('.lilt-demo-inline')?.inert && Math.abs(parseFloat(document.querySelector('.lilt-demo-shadow').style.height) - 32) < .01);
    await page.evaluate(() => document.querySelector('.lilt-work-macbook').scrollIntoView({block: 'center', behavior: 'instant'}));
    const white = await page.evaluate(() => {
      const screen = document.querySelector('.lilt-work-screen').getBoundingClientRect();
      const x = screen.x + screen.width / 2, y = screen.y + 55;
      return {x, y, button: document.elementFromPoint(x, y)?.closest('button')?.className ?? null};
    });
    assert.notEqual(white.button, 'lilt-demo-mobile-open', 'White screen below the folded notch must not open the demo');
    await clickPoint(white);
    assert.equal(await page.evaluate(() => Boolean(document.querySelector('.lilt-demo-dialog[open]'))), false);
    const compact = await page.evaluate(() => {
      const bounds = document.querySelector('.lilt-demo-compact').getBoundingClientRect();
      return {x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2};
    });
    step = 'reopen from compact preview';
    await clickPoint(compact);
    await page.waitForSelector('.lilt-demo-dialog[open]');
    await click('.lilt-demo-dialog-bar button');
    step = 'medium viewport';
    await page.cdp('Emulation.setDeviceMetricsOverride', {width: 900, height: 900, deviceScaleFactor: 1, mobile: false});
    await page.waitForFunction(() => document.querySelector('.lilt-demo-inline')?.inert === false);
    const settingsWidth = await page.evaluate(() => document.querySelector('.lilt-demo-settings').getBoundingClientRect().width);
    assert.ok(settingsWidth >= 43.99, `Settings target shrank to ${settingsWidth}px`);
    return {mobileTimerGapFolds: true,whiteScreenIsNotAButton: true,compactStillOpensZoom: true,mobileSlidersHave44pxTargets: true,mediumSettingsWidth: settingsWidth};
  } catch (error) {
    if (error instanceof Error) error.message = `${step}: ${error.message}`;
    throw error;
  } finally {
    await page.cdp('Emulation.clearDeviceMetricsOverride');
  }
}
