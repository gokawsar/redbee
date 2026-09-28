const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const filePath = path.resolve(__dirname, 'index.html');
const fileUrl = 'file://' + filePath.replace(/\\/g, '/');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  function log(msg, pass = true) {
    const status = pass ? 'PASS' : 'FAIL';
    results.push({ msg, pass });
    console.log(`[${status}] ${msg}`);
  }

  // ---- DESKTOP TEST ----
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const dPage = await desktopContext.newPage();
  await dPage.goto(fileUrl);

  // Ensure page is loaded and JS has run
  await dPage.waitForTimeout(500);

  // Test: hero background GIF exists directly before the hero title
  const gifBox = await dPage.$eval('.hero__bg-gif', (el) => {
    const rect = el.getBoundingClientRect();
    return {
      top: Math.round(rect.top),
      left: Math.round(rect.left),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };
  });
  log(`[Desktop] hero__bg-gif found: ${gifBox.width}x${gifBox.height}px`);

  const heroOrder = await dPage.$eval('.hero', (hero) => {
    const gif = hero.querySelector('.hero__bg-gif');
    const title = hero.querySelector('.hero__title');
    return Boolean(gif && title && gif.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  log(`[Desktop] GIF is placed before hero title`, heroOrder);

  // Test: GIF is horizontally centered in the hero
  const centerX = gifBox.left + gifBox.width / 2;
  const expectedCenterX = 720; // 1440/2
  const centeredH = Math.abs(centerX - expectedCenterX) < 50;
  log(`[Desktop] GIF horizontally centered (${centerX} vs ${expectedCenterX})`, centeredH);

  // Test: GIF is visible (opacity should be 1 after animation)
  // Wait for gif animation (0.8s + 0.1s delay = ~0.9s) plus extra time for hero animations
  await dPage.waitForTimeout(1500);

  const gifOpacity = await dPage.$eval('.hero__bg-gif', (el) => {
    return parseFloat(getComputedStyle(el).opacity);
  });
  log(`[Desktop] hero__bg-gif opacity after animation: ${gifOpacity}`, gifOpacity >= 0.99);

  // Test: hero title is visible (has 'visible' class) after gif animation
  const heroTitleVisible = await dPage.$eval('.hero__title', (el) => {
    return el.classList.contains('visible');
  });
  log(`[Desktop] hero__title has 'visible' class after gif animation`, heroTitleVisible);

  // Test: hero bottom reveals are visible
  const heroBottomVisible = await dPage.$eval('.hero__desc', (el) => {
    return el.classList.contains('visible');
  });
  log(`[Desktop] hero__desc has 'visible' class after gif animation`, heroBottomVisible);

  // Test: hero stats visible
  const statsVisible = await dPage.$eval('.hero__stats', (el) => {
    return el.classList.contains('visible');
  });
  log(`[Desktop] hero__stats has 'visible' class after gif animation`, statsVisible);

  // Test: hero stat numbers are counting (should have is-glitching class)
  const statGlitching = await dPage.$eval('.hero__stat-num', (el) => {
    return el.classList.contains('is-glitching');
  });
  log(`[Desktop] hero__stat-num has 'is-glitching' class (counter running)`, statGlitching);

  // Test: hero stats are side by side (flex-wrap: nowrap)
  const statsFlexWrap = await dPage.$eval('.hero__stats', (el) => {
    return getComputedStyle(el).flexWrap;
  });
  log(`[Desktop] hero__stats flex-wrap is 'nowrap' (side by side)`, statsFlexWrap === 'nowrap');

  // Test: individual stat items have flex-shrink: 0
  const statFlexShrink = await dPage.$$eval('.hero__stats > div', (els) => {
    return els.map(el => getComputedStyle(el).flexShrink);
  });
  const allNoShrink = statFlexShrink.every(v => v === '0');
  log(`[Desktop] hero__stats > div flex-shrink is 0 (no shrinking)`, allNoShrink);

  // Test: all stat items are on the same line (check their positions)
  const statPositions = await dPage.$$eval('.hero__stats > div', (els) => {
    return els.map(el => {
      const rect = el.getBoundingClientRect();
      return { top: Math.round(rect.top), left: Math.round(rect.left) };
    });
  });
  const sameLine = statPositions.every(p => Math.abs(p.top - statPositions[0].top) < 5);
  log(`[Desktop] all hero__stats items on same line`, sameLine);

  await desktopContext.close();

  // ---- MOBILE (375px) TEST ----
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 812 },
  });
  const mPage = await mobileContext.newPage();
  await mPage.goto(fileUrl);
  await mPage.waitForTimeout(500);

  // Wait for animations
  await mPage.waitForTimeout(1500);

  // Test: GIF centered on mobile
  const mGifBox = await mPage.$eval('.hero__bg-gif', (el) => {
    const rect = el.getBoundingClientRect();
    return {
      top: Math.round(rect.top),
      left: Math.round(rect.left),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };
  });
  const mCenterX = mGifBox.left + mGifBox.width / 2;
  const mCenteredH = Math.abs(mCenterX - 187) < 50; // 375/2
  log(`[Mobile 375] GIF horizontally centered (${mCenterX} vs 187)`, mCenteredH);

  // Test: hero stats side-by-side on mobile
  const mStatsFlexWrap = await mPage.$eval('.hero__stats', (el) => {
    return getComputedStyle(el).flexWrap;
  });
  log(`[Mobile 375] hero__stats flex-wrap is 'nowrap' (side by side)`, mStatsFlexWrap === 'nowrap');

  const mStatFlexShrink = await mPage.$$eval('.hero__stats > div', (els) => {
    return els.map(el => getComputedStyle(el).flexShrink);
  });
  const mAllNoShrink = mStatFlexShrink.every(v => v === '0');
  log(`[Mobile 375] hero__stats > div flex-shrink is 0 (no shrinking)`, mAllNoShrink);

  const mStatPositions = await mPage.$$eval('.hero__stats > div', (els) => {
    return els.map(el => {
      const rect = el.getBoundingClientRect();
      return { top: Math.round(rect.top), left: Math.round(rect.left) };
    });
  });
  const mSameLine = mStatPositions.every(p => Math.abs(p.top - mStatPositions[0].top) < 5);
  log(`[Mobile 375] all hero__stats items on same line`, mSameLine);

  // Test: hero title visible on mobile
  const mTitleVisible = await mPage.$eval('.hero__title', (el) => {
    return el.classList.contains('visible');
  });
  log(`[Mobile 375] hero__title visible after gif animation`, mTitleVisible);

  // Test: hero bottom reveals visible on mobile
  const mBottomVisible = await mPage.$eval('.hero__desc', (el) => {
    return el.classList.contains('visible');
  });
  log(`[Mobile 375] hero__desc visible after gif animation`, mBottomVisible);

  await mobileContext.close();

  // ---- MOBILE (480px) TEST ----
  const mobile480Context = await browser.newContext({
    viewport: { width: 480, height: 800 },
  });
  const p480 = await mobile480Context.newPage();
  await p480.goto(fileUrl);
  await p480.waitForTimeout(500);
  await p480.waitForTimeout(1500);

  const s480StatsFlexWrap = await p480.$eval('.hero__stats', (el) => {
    return getComputedStyle(el).flexWrap;
  });
  log(`[Mobile 480] hero__stats flex-wrap is 'nowrap' (side by side)`, s480StatsFlexWrap === 'nowrap');

  const s480StatPositions = await p480.$$eval('.hero__stats > div', (els) => {
    return els.map(el => {
      const rect = el.getBoundingClientRect();
      return { top: Math.round(rect.top) };
    });
  });
  const s480SameLine = s480StatPositions.every(p => Math.abs(p.top - s480StatPositions[0].top) < 5);
  log(`[Mobile 480] all hero__stats items on same line`, s480SameLine);

  await mobile480Context.close();
  await browser.close();

  // Summary
  const failed = results.filter(r => !r.pass);
  console.log(`\n=== SUMMARY: ${results.length - failed.length}/${results.length} checks passed ===`);
  if (failed.length > 0) {
    console.log('FAILED checks:');
    failed.forEach(r => console.log(`  - ${r.msg}`));
    process.exit(1);
  } else {
    console.log('All checks passed!');
    process.exit(0);
  }
})();
