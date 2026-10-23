#!/usr/bin/env node
/*
 * Sums CNDWN's App Store rating over every App Store country.
 *
 * The App Store only shows ratings per country, so the site quotes the
 * worldwide total instead of any one country's number. Run it, then copy the
 * printed APP_RATING line into tools/build-i18n.mjs (and the numbers into
 * llms.txt) and rebuild:
 *
 *   node tools/app-store-rating.mjs   # takes a few minutes (rate-limited API)
 */
const APP_ID = 6455257754;
const COUNTRIES = (
  'ae ag ai al am ao ar at au az bb be bg bh bj bm bn bo br bs bt bw by bz ca cg ch cl cn co cr cv cy cz ' +
  'de dk dm do dz ec ee eg es fi fj fm fr gb gd gh gm gr gt gw gy hk hn hr hu id ie il in is it jm jo jp ' +
  'ke kg kh kn kr kw ky kz la lb lc lk lr lt lu lv md mg mk ml mn mo mr ms mt mu mw mx my mz na ne ng ni ' +
  'nl no np nz om pa pe pg ph pk pl pt pw py qa ro ru sa sb sc se sg si sk sl sn sr st sv sz tc td th tj ' +
  'tm tn tr tt tw tz ua ug us uy uz vc ve vg vn ye za zw'
).split(' ');

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function lookup(country) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`https://itunes.apple.com/lookup?id=${APP_ID}&country=${country}`);
      if (res.ok) {
        const app = (await res.json()).results?.[0] || {};
        return { avg: app.averageUserRating || 0, count: app.userRatingCount || 0 };
      }
    } catch {}
    await sleep(10000);
  }
  throw new Error(`lookup failed for ${country}`);
}

let count = 0, sum = 0;
const perCountry = [];
for (const c of COUNTRIES) {
  const r = await lookup(c);
  count += r.count;
  sum += r.avg * r.count;
  if (r.count) perCountry.push([c, r.avg, r.count]);
  await sleep(2500);
}

perCountry.sort((a, b) => b[2] - a[2]);
for (const [c, avg, n] of perCountry) console.log(`${c}  ${avg.toFixed(2)}  (${n})`);
const value = Math.round((sum / count) * 10) / 10;
const asOf = new Date().toISOString().slice(0, 7);
console.log(`\nWorldwide: ${value} from ${count} ratings`);
console.log(`const APP_RATING = { value: ${value}, count: ${count}, asOf: '${asOf}' };`);
