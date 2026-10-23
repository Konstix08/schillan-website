/*
 * Renders the countdown pages ("How many days until Christmas?"), the
 * per-language overview of all countdowns, the days calculator and the
 * embeddable countdown widget from tools/countdowns-data.mjs.
 *
 * Pages are static: the HTML states the next date ("Christmas 2026 is on
 * Friday, 25 December 2026") and the dates for the coming years, which stay
 * true until that date passes; the day count itself runs live in the browser
 * (/cndwn/js/countdown.js), so pages never show a stale number. Rebuilding
 * after an occasion moves its "next date" on to the following year.
 */
import { EVENTS, UI, CALC, COUNTRY, HUB_PATH, CALC_PATH } from './countdowns-data.mjs';

const YEARS_SHOWN = 5;
const APP_STORE = 'https://apps.apple.com/app/apple-store/id6455257754?pt=126072150&ct=countdowns&mt=8';
const AUTONYM = { en: 'English', de: 'Deutsch', es: 'Español', fr: 'Français', ja: '日本語', it: 'Italiano', pt: 'Português' };
const NAV = {
  en: ['Countdowns', 'Days calculator', 'App'], de: ['Countdowns', 'Tage-Rechner', 'App'], es: ['Cuentas atrás', 'Calculadora', 'App'],
  fr: ['Comptes à rebours', 'Calculateur', 'App'], ja: ['カウントダウン', '日数計算', 'アプリ'], it: ['Conti alla rovescia', 'Calcolatore', 'App'],
  pt: ['Contagens', 'Calculadora', 'App'],
};
const COMPARE = { en: 'Comparison', de: 'Vergleich', es: 'Comparativa', fr: 'Comparatif', ja: '比較', it: 'Confronto', pt: 'Comparação' };
const FOOT = {
  en: ['Features', 'Privacy Policy'], de: ['Funktionen', 'Datenschutz'], es: ['Funciones', 'Privacidad'], fr: ['Fonctionnalités', 'Politique de confidentialité'],
  ja: ['機能', 'プライバシーポリシー'], it: ['Funzionalità', 'Informativa sulla privacy'], pt: ['Funcionalidades', 'Política de Privacidade'],
};
const STORE_BADGE = {
  en: ['appstore-en.svg', 'Download on the App Store', 162], de: ['appstore-de.svg', 'Laden im App Store', 162], es: ['appstore-es.svg', 'Consíguelo en el App Store', 162],
  fr: ['appstore-fr.svg', "Télécharger dans l'App Store", 171], ja: ['appstore-ja.svg', 'App Storeからダウンロード', 147], it: ['appstore-it.svg', 'Scarica su App Store', 162],
  pt: ['appstore-pt.svg', 'Descarregar na App Store', 162],
};

// ---------------------------------------------------------------- dates

const pad = n => String(n).padStart(2, '0');
const ymd = (y, m, d) => { const t = new Date(Date.UTC(y, m - 1, d)); return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() }; };
const addDays = (o, n) => ymd(o.y, o.m, o.d + n);
const weekday = o => new Date(Date.UTC(o.y, o.m - 1, o.d)).getUTCDay();
const iso = o => `${o.y}-${pad(o.m)}-${pad(o.d)}`;

// Western (Gregorian) Easter Sunday, anonymous Gregorian algorithm.
function easter(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return ymd(y, month, day);
}

function nthWeekday(y, month, wd, n) {
  if (n > 0) {
    const first = ymd(y, month, 1);
    return addDays(first, ((wd - weekday(first) + 7) % 7) + 7 * (n - 1));
  }
  const last = ymd(y, month + 1, 0);
  return addDays(last, -((weekday(last) - wd + 7) % 7));
}

// Equinoxes and solstices (Meeus, Astronomical Algorithms, ch. 27): accurate
// to about a minute, which is all a day countdown needs.
const SEASON_TERMS = [
  [485, 324.96, 1934.136], [203, 337.23, 32964.467], [199, 342.08, 20.186], [182, 27.85, 445267.112], [156, 73.14, 45036.886],
  [136, 171.52, 22518.443], [77, 222.54, 65928.934], [74, 296.72, 3034.906], [70, 243.58, 9037.513], [58, 119.81, 33718.147],
  [52, 297.17, 150.678], [50, 21.02, 2281.226], [45, 247.54, 29929.562], [44, 325.15, 31555.956], [29, 60.93, 4443.417],
  [18, 155.12, 67555.328], [17, 288.79, 4562.452], [16, 198.04, 62894.029], [14, 199.76, 31436.921], [12, 95.39, 14577.848],
  [12, 287.11, 31931.756], [12, 320.81, 34777.259], [9, 227.73, 1222.114], [8, 15.45, 16859.074],
];
const SEASON_MEAN = [
  [2451623.80984, 365242.37404, 0.05169, -0.00411, -0.00057],
  [2451716.56767, 365241.62603, 0.00325, 0.00888, -0.00030],
  [2451810.21715, 365242.01767, -0.11575, 0.00337, 0.00078],
  [2451900.05952, 365242.74049, -0.06223, -0.00823, 0.00032],
];
function seasonInstant(year, k) {
  const Y = (year - 2000) / 1000;
  const [a, b, c, d, e] = SEASON_MEAN[k];
  const jde0 = a + b * Y + c * Y ** 2 + d * Y ** 3 + e * Y ** 4;
  const T = (jde0 - 2451545.0) / 36525;
  const rad = Math.PI / 180;
  const W = (35999.373 * T - 2.47) * rad;
  const dl = 1 + 0.0334 * Math.cos(W) + 0.0007 * Math.cos(2 * W);
  const S = SEASON_TERMS.reduce((s, [A, B, C]) => s + A * Math.cos((B + C * T) * rad), 0);
  const jde = jde0 + (0.00001 * S) / dl;
  const deltaT = 69; // seconds, TT − UT
  return new Date((jde - 2440587.5) * 86400000 - deltaT * 1000);
}

function ruleFor(event, lang) {
  const r = event.rule;
  return r[lang] && typeof r[lang] === 'object' && !Array.isArray(r[lang]) ? r[lang] : r;
}

// One occurrence in year y: { day: {y,m,d} } for all-day occasions, { instant: Date } for seasons.
function occurrence(rule, y) {
  if (rule.fixed) return { day: ymd(y, rule.fixed[0], rule.fixed[1]) };
  if ('easter' in rule) return { day: addDays(easter(y), rule.easter) };
  if (rule.nth) return { day: nthWeekday(y, ...rule.nth) };
  if (rule.firstAdvent) { const n27 = ymd(y, 11, 27); return { day: addDays(n27, (7 - weekday(n27)) % 7) }; }
  if (rule.blackFriday) return { day: addDays(nthWeekday(y, 11, 4, 4), 1) };
  if (rule.frMothersDay) {
    const last = nthWeekday(y, 5, 0, -1);
    return { day: iso(last) === iso(addDays(easter(y), 49)) ? nthWeekday(y, 6, 0, 1) : last };
  }
  if ('season' in rule) return { instant: seasonInstant(y, rule.season) };
  throw new Error('unknown rule ' + JSON.stringify(rule));
}

function todayIn(tz, now) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

// The next YEARS_SHOWN occurrences from `now` (an occasion happening today still counts).
function upcoming(event, lang, now) {
  const rule = ruleFor(event, lang);
  const today = todayIn(COUNTRY[lang].tz, now);
  const out = [];
  for (let y = now.getUTCFullYear() - 1; out.length < YEARS_SHOWN; y++) {
    const o = occurrence(rule, y);
    if (o.day ? iso(o.day) >= today : o.instant > now) out.push({ ...o, year: y });
  }
  return out;
}

function fmtDate(lang, o) {
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return o.day
    ? new Intl.DateTimeFormat(COUNTRY[lang].locale, { ...opts, timeZone: 'UTC' }).format(new Date(Date.UTC(o.day.y, o.day.m - 1, o.day.d)))
    : new Intl.DateTimeFormat(COUNTRY[lang].locale, { ...opts, timeZone: COUNTRY[lang].tz }).format(o.instant);
}

// ---------------------------------------------------------------- helpers

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
function clip(s, max = 158) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(' ') > 80 ? cut.lastIndexOf(' ') : cut.length).replace(/[,;:]$/, '') + '…';
}
const pathOf = (lang, slug) => `/cndwn/${lang === 'en' ? '' : lang + '/'}${slug}/`;

// data attributes the live counter reads: all-day dates or exact instants
function cdAttrs(lang, occ) {
  return occ[0].day
    ? `data-cd data-lang="${lang}" data-dates="${occ.map(o => iso(o.day)).join(',')}"`
    : `data-cd data-lang="${lang}" data-instants="${occ.map(o => o.instant.toISOString()).join(',')}"`;
}

function i18nScript(lang) {
  const u = UI[lang];
  const strings = { locale: COUNTRY[lang].locale, day: u.day, days: u.days, until: u.until, today: u.today, weeksVal: u.weeksVal, sleepsVal: u.sleepsVal, hoursVal: u.hoursVal };
  return `<script type="application/json" id="cd-i18n">${JSON.stringify(strings)}</script>`;
}

// ---------------------------------------------------------------- page chrome

const PAGE_CSS = `
  main { max-width: 820px; margin: 0 auto; padding: 0 22px 40px; }
  .crumbs { font-size: 14px; color: var(--muted); padding: 22px 0 0; }
  .crumbs a { color: var(--muted); }
  .hero { text-align: center; padding: 26px 0 8px; }
  .hero .emoji { font-size: 54px; line-height: 1; }
  .hero h1 { font-size: clamp(28px, 5vw, 44px); line-height: 1.12; letter-spacing: -0.02em; margin: 14px auto 18px; max-width: 22ch; }
  .counter { display: inline-block; background: var(--card); border: 1px solid var(--border); border-radius: 26px; padding: 22px 34px 20px; min-width: min(100%, 360px); }
  .counter .num { font-size: clamp(64px, 14vw, 104px); font-weight: 800; letter-spacing: -0.04em; line-height: 1;
    background: linear-gradient(120deg, var(--accent), var(--accent-2)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
  .counter .unit { font-size: 22px; font-weight: 700; margin-left: 6px; }
  .counter .clock { font-variant-numeric: tabular-nums; color: var(--muted); margin-top: 8px; font-size: 16px; }
  .counter .until { margin-top: 6px; font-weight: 600; }
  .counter .is-today { display: none; font-size: 30px; font-weight: 800; }
  [data-cd].today .is-today { display: block; }
  [data-cd].today .not-today { display: none; }
  .card { background: var(--card); border: 1px solid var(--border); border-radius: 20px; padding: 26px 28px; margin: 22px 0; }
  .card h2 { font-size: 22px; margin: 0 0 12px; letter-spacing: -0.01em; }
  .answer { font-size: 19px; }
  .answer strong { color: var(--text); }
  .ways { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .ways div { background: var(--bg); border-radius: 14px; padding: 14px; text-align: center; }
  .ways b { display: block; font-size: 13px; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
  .ways span { font-size: 18px; font-weight: 700; }
  @media (max-width: 560px) { .ways { grid-template-columns: 1fr; } }
  table.dates { width: 100%; border-collapse: collapse; }
  table.dates th, table.dates td { text-align: left; padding: 10px 6px; border-bottom: 1px solid var(--border); }
  table.dates th { font-size: 14px; color: var(--muted); }
  .cta { display: flex; gap: 22px; align-items: center; }
  .cta img.icon { width: 72px; height: 72px; border-radius: 17px; flex: none; box-shadow: 0 4px 14px rgba(0,0,0,0.18); }
  .cta p { margin: 0 0 14px; color: var(--muted); }
  .badge-link img { height: 48px; width: auto; display: block; }
  @media (max-width: 560px) { .cta { flex-direction: column; text-align: center; } .cta .badge-link { display: inline-block; } }
  textarea.code { width: 100%; min-height: 96px; font: 13px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--text);
    background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 12px; resize: vertical; }
  .btn { display: inline-block; margin-top: 10px; background: var(--accent); color: #fff; border: 0; border-radius: 12px; padding: 10px 18px; font: inherit; font-weight: 600; cursor: pointer; }
  .chips { display: flex; flex-wrap: wrap; gap: 10px; list-style: none; padding: 0; margin: 0; }
  .chips a { display: inline-block; background: var(--bg); border: 1px solid var(--border); border-radius: 999px; padding: 8px 14px; color: var(--text); font-size: 15px; }
  .chips a:hover { text-decoration: none; border-color: var(--accent); }
  .faq { max-width: none; }
  .grid .is-today { display: none; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 14px; list-style: none; padding: 0; margin: 0; }
  .grid a { display: block; background: var(--card); border: 1px solid var(--border); border-radius: 18px; padding: 18px; color: var(--text); height: 100%; }
  .grid a:hover { text-decoration: none; border-color: var(--accent); }
  .grid .e { font-size: 28px; }
  .grid .n { font-weight: 700; display: block; margin: 6px 0 2px; }
  .grid .d { color: var(--muted); font-size: 14px; display: block; }
  .grid .c { font-weight: 800; font-size: 26px; color: var(--accent); }
  .lead { color: var(--muted); font-size: 18px; text-align: center; max-width: 52ch; margin: 0 auto 26px; }
  .calc label { display: block; font-weight: 600; margin: 10px 0 6px; }
  .calc input[type=date] { font: inherit; padding: 10px 12px; border-radius: 12px; border: 1px solid var(--border); background: var(--bg); color: var(--text); }
  .calc .row { display: flex; gap: 18px; flex-wrap: wrap; }
  .calc output { display: block; margin-top: 14px; font-size: 22px; font-weight: 700; min-height: 1.4em; }
  .calc output small { display: block; font-size: 15px; color: var(--muted); font-weight: 500; }
`;

function nav(lang, alternates) {
  const [cd, calc, app] = NAV[lang];
  const menu = Object.keys(AUTONYM).map(l =>
    `<a href="${alternates[l] || HUB_PATH[l]}" data-lang="${l}"${l === lang ? ' class="active" aria-current="page"' : ''}>${AUTONYM[l]}</a>`).join('\n          ');
  const landing = `/cndwn/${lang === 'en' ? '' : lang + '/'}`;
  return `<nav class="site">
  <div class="wrap">
    <div style="display:flex;align-items:center;gap:10px;">
      <a class="brand" href="${landing}">
        <img class="mark" src="/cndwn/img/app-icon.png" width="34" height="34" alt="CNDWN app icon">
        CNDWN
      </a>
      <a href="${lang === 'en' ? '/' : '/' + lang + '/'}" style="color:var(--muted);font-size:12px;font-weight:600;white-space:nowrap;">by Schillan</a>
    </div>
    <div class="nav-right">
      <div class="nav-links">
        <a href="${HUB_PATH[lang]}">${cd}</a>
        <a href="${CALC_PATH[lang]}">${calc}</a>
        <a href="${landing}">${app}</a>
      </div>
      <details class="lang-switch">
        <summary aria-label="Change language"><span data-lang-label>${lang.toUpperCase()}</span></summary>
        <div class="lang-menu">
          ${menu}
        </div>
      </details>
    </div>
  </div>
</nav>`;
}

function footer(lang) {
  const landing = `/cndwn/${lang === 'en' ? '' : lang + '/'}`;
  const [features, privacy] = FOOT[lang];
  return `<footer class="site">
  <div class="wrap">
    <div class="brand" style="font-size:16px">
      <img class="mark" src="/cndwn/img/app-icon.png" alt="" style="width:26px;height:26px;border-radius:7px">
      CNDWN
    </div>
    <div class="flinks">
      <a href="${landing}#features">${features}</a>
      <a href="${HUB_PATH[lang]}">${NAV[lang][0]}</a>
      <a href="${CALC_PATH[lang]}">${NAV[lang][1]}</a>
      <a href="${landing}countdown-app-comparison/">${COMPARE[lang]}</a>
      <a href="${landing}privacy/">${privacy}</a>
      <a href="mailto:cndwn@schillan.com">Contact</a>
    </div>
    <div>© 2026 <a href="${lang === 'en' ? '/' : '/' + lang + '/'}">Schillan</a>. CNDWN.</div>
  </div>
</footer>`;
}

function badge(lang) {
  const [file, alt, w] = STORE_BADGE[lang];
  return `<a class="badge-link" href="${APP_STORE}" aria-label="${esc(UI[lang].getApp)}"><img src="/cndwn/img/${file}" alt="${esc(alt)}" width="${w}" height="54"></a>`;
}

function page(ctx, { lang, title, desc, canonical, alternates, body, jsonLd, type, scripts = '' }) {
  const hreflangs = Object.entries(alternates).map(([l, p]) => `<link rel="alternate" hreflang="${l}" href="${ctx.SITE}${p}">`);
  if (Object.keys(alternates).length > 1) hreflangs.push(`<link rel="alternate" hreflang="x-default" href="${ctx.SITE}${alternates.en || Object.values(alternates)[0]}">`);
  const graph = ctx.entityGraph(type, lang, { title, desc }, ctx.SITE + canonical);
  const ld = [...jsonLd, graph].map(d => `<script type="application/ld+json">\n${JSON.stringify(d, null, 2)}\n</script>`).join('\n');
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#5b6cff" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0b0b0f" media="(prefers-color-scheme: dark)">
<link rel="canonical" href="${ctx.SITE}${canonical}">
${hreflangs.join('\n')}
<meta property="og:type" content="website">
<meta property="og:site_name" content="CNDWN">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${ctx.SITE}${canonical}">
<meta property="og:image" content="${ctx.SITE}/cndwn/og-image.png">
<meta property="og:locale" content="${ctx.OG_LOCALE[lang]}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="/cndwn/img/app-icon.png">
<link rel="apple-touch-icon" href="/cndwn/img/app-icon.png">
${ld}
<style>
${ctx.SHARED_CSS}
${PAGE_CSS}
</style>
</head>
<body>
${nav(lang, alternates)}
${body}
${footer(lang)}
${scripts}
${ctx.langSwitchScript('cndwn-lang')}
</body>
</html>
`;
}

function breadcrumb(ctx, items) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: ctx.SITE + p })),
  };
}
const faqLd = qa => ({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: qa.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});
const faqHtml = qa => `<div class="faq">\n${qa.map(([q, a], i) => `      <details${i === 0 ? ' open' : ''}>\n        <summary>${esc(q)}</summary>\n        <p>${esc(a)}</p>\n      </details>`).join('\n')}\n    </div>`;

// ---------------------------------------------------------------- event page

function eventPage(ctx, event, lang, now, langEvents) {
  const t = event.langs[lang];
  const u = UI[lang];
  const occ = upcoming(event, lang, now);
  const next = occ[0];
  const canonical = pathOf(lang, t.slug);
  const alternates = Object.fromEntries(Object.entries(event.langs).map(([l, v]) => [l, pathOf(l, v.slug)]));
  const vars = { the: t.the, The: cap(t.the), Y: next.year, date: fmtDate(lang, next) };
  const answer = fill(u.answer, vars);

  const qa = [[fill(u.qWhen, { ...vars, Y: occ[1].year }), fill(u.aWhen, { the: t.the, The: cap(t.the), Y: occ[1].year, date: fmtDate(lang, occ[1]) })]];
  if (t.holiday !== null) qa.push([fill(u.qHoliday, vars), fill(t.holiday ? u.aYes : u.aNo, vars)]);
  qa.push([fill(u.qIphone, vars), u.aIphone]);

  const title = `${t.q} | CNDWN`;
  const desc = clip(`${answer} ${t.about}`);
  const embedUrl = `${ctx.SITE}/cndwn/embed/?c=${lang}/${t.slug}`;
  const snippet = `<iframe src="${embedUrl}" width="360" height="200" style="border:0;max-width:100%" loading="lazy" title="${esc(t.q)}"></iframe>\n<p><a href="${ctx.SITE}${canonical}">${esc(t.q)}</a> – ${esc(u.byCndwn)}</p>`;
  const others = langEvents.filter(e => e.event !== event).map(e =>
    `<li><a href="${pathOf(lang, e.t.slug)}">${e.event.emoji} ${esc(e.t.name)}</a></li>`).join('\n        ');

  const body = `<main>
  <div class="crumbs"><a href="/cndwn/${lang === 'en' ? '' : lang + '/'}">CNDWN</a> › <a href="${HUB_PATH[lang]}">${esc(u.hubBreadcrumb)}</a> › ${esc(t.name)}</div>
  <header class="hero">
    <div class="emoji" aria-hidden="true">${event.emoji}</div>
    <h1>${esc(t.q)}</h1>
    <div class="counter" ${cdAttrs(lang, occ)}>
      <div class="is-today">${esc(u.today)}</div>
      <div class="not-today">
        <span class="num" data-cd-days>–</span><span class="unit" data-cd-unit>${esc(u.days)}</span>
        <div class="clock" data-cd-clock></div>
      </div>
      <div class="until" data-cd-until>${esc(fill(u.until, { date: vars.date }))}</div>
    </div>
  </header>

  <section class="card">
    <p class="answer"><strong>${esc(answer)}</strong> ${esc(t.about)}</p>
  </section>

  <section class="card">
    <h2>${esc(u.otherWays)}</h2>
    <div class="ways" ${cdAttrs(lang, occ)}>
      <div><b>${esc(u.weeks)}</b><span data-cd-weeks>–</span></div>
      <div><b>${esc(u.sleeps)}</b><span data-cd-sleeps>–</span></div>
      <div><b>${esc(u.hours)}</b><span data-cd-hours>–</span></div>
    </div>
  </section>

  <section class="card">
    <h2>${esc(u.datesH)}</h2>
    <table class="dates">
      <thead><tr><th>${esc(u.year)}</th><th>${esc(u.date)}</th></tr></thead>
      <tbody>
${occ.map(o => `        <tr><td>${o.year}</td><td>${esc(fmtDate(lang, o))}</td></tr>`).join('\n')}
      </tbody>
    </table>
  </section>

  <section class="card cta">
    <img class="icon" src="/cndwn/img/app-icon.png" width="72" height="72" alt="CNDWN app icon">
    <div>
      <h2>${esc(u.ctaH)}</h2>
      <p>${esc(u.ctaP)}</p>
      ${badge(lang)}
    </div>
  </section>

  <section>
    <h2>${esc(u.faqH)}</h2>
    ${faqHtml(qa)}
  </section>

  <section class="card">
    <h2>${esc(u.embedH)}</h2>
    <p>${esc(u.embedP)}</p>
    <textarea class="code" readonly id="embed-code">${esc(snippet)}</textarea>
    <button class="btn" type="button" data-copy="embed-code" data-copied="${esc(u.copied)}">${esc(u.copy)}</button>
  </section>

  <section class="card">
    <h2>${esc(u.moreH)}</h2>
    <ul class="chips">
        ${others}
        <li><a href="${HUB_PATH[lang]}">${esc(u.allLink)} →</a></li>
        <li><a href="${CALC_PATH[lang]}">🧮 ${esc(u.calcLink)}</a></li>
    </ul>
  </section>
</main>`;

  const html = page(ctx, {
    lang, title, desc, canonical, alternates, type: 'countdown',
    jsonLd: [breadcrumb(ctx, [['CNDWN', `/cndwn/${lang === 'en' ? '' : lang + '/'}`], [u.hubBreadcrumb, HUB_PATH[lang]], [t.name, canonical]]), faqLd(qa)],
    body, scripts: `${i18nScript(lang)}\n<script src="/cndwn/js/countdown.js" defer></script>`,
  });
  return { path: canonical, html, alternates, type: 'countdown', priority: lang === 'en' ? 0.7 : 0.6 };
}

// ---------------------------------------------------------------- overview

function hubPage(ctx, lang, langEvents) {
  const u = UI[lang];
  const alternates = { ...HUB_PATH };
  const items = langEvents.map(({ event, t, occ }) =>
    `<li><a href="${pathOf(lang, t.slug)}" ${cdAttrs(lang, occ)}>
        <span class="e" aria-hidden="true">${event.emoji}</span>
        <span class="n">${esc(t.name)}</span>
        <span class="d">${esc(fmtDate(lang, occ[0]))}</span>
        <span class="c"><span class="not-today"><span data-cd-days>–</span> <span data-cd-unit>${esc(u.days)}</span></span><span class="is-today">${esc(u.today)}</span></span>
      </a></li>`).join('\n      ');
  const body = `<main>
  <div class="crumbs"><a href="/cndwn/${lang === 'en' ? '' : lang + '/'}">CNDWN</a> › ${esc(u.hubBreadcrumb)}</div>
  <header class="hero">
    <h1>${esc(u.hubH1)}</h1>
    <p class="lead">${esc(u.hubLead)}</p>
  </header>
  <ul class="grid">
      ${items}
      <li><a href="${CALC_PATH[lang]}"><span class="e" aria-hidden="true">🧮</span><span class="n">${esc(u.calcLink)}</span><span class="d">${esc(CALC[lang].lead)}</span></a></li>
  </ul>
  <section class="card cta" style="margin-top:34px">
    <img class="icon" src="/cndwn/img/app-icon.png" width="72" height="72" alt="CNDWN app icon">
    <div>
      <h2>${esc(u.ctaH)}</h2>
      <p>${esc(u.ctaP)}</p>
      ${badge(lang)}
    </div>
  </section>
</main>`;
  const itemList = {
    '@context': 'https://schema.org', '@type': 'ItemList', name: u.hubH1,
    itemListElement: langEvents.map(({ t }, i) => ({ '@type': 'ListItem', position: i + 1, name: t.q, url: ctx.SITE + pathOf(lang, t.slug) })),
  };
  const html = page(ctx, {
    lang, title: `${u.hubTitle} | CNDWN`, desc: u.hubDesc, canonical: HUB_PATH[lang], alternates, type: 'countdownHub',
    jsonLd: [breadcrumb(ctx, [['CNDWN', `/cndwn/${lang === 'en' ? '' : lang + '/'}`], [u.hubBreadcrumb, HUB_PATH[lang]]]), itemList],
    body, scripts: `${i18nScript(lang)}\n<script src="/cndwn/js/countdown.js" defer></script>`,
  });
  return { path: HUB_PATH[lang], html, alternates: { ...HUB_PATH }, type: 'countdownHub', priority: lang === 'en' ? 0.8 : 0.7 };
}

// ---------------------------------------------------------------- calculator

function calcPage(ctx, lang) {
  const c = CALC[lang];
  const u = UI[lang];
  const strings = { locale: COUNTRY[lang].locale, resUntil: c.resUntil, resSince: c.resSince, resToday: c.resToday, resBetween: c.resBetween, resWeeks: c.resWeeks, resMonths: c.resMonths };
  const body = `<main>
  <div class="crumbs"><a href="/cndwn/${lang === 'en' ? '' : lang + '/'}">CNDWN</a> › <a href="${HUB_PATH[lang]}">${esc(u.hubBreadcrumb)}</a> › ${esc(c.breadcrumb)}</div>
  <header class="hero">
    <div class="emoji" aria-hidden="true">🧮</div>
    <h1>${esc(c.h1)}</h1>
    <p class="lead">${esc(c.lead)}</p>
  </header>
  <section class="card calc">
    <h2>${esc(c.untilH)}</h2>
    <label for="calc-date">${esc(c.dateLabel)}</label>
    <input type="date" id="calc-date">
    <output id="calc-until" aria-live="polite"></output>
  </section>
  <section class="card calc">
    <h2>${esc(c.betweenH)}</h2>
    <div class="row">
      <div><label for="calc-from">${esc(c.fromLabel)}</label><input type="date" id="calc-from"></div>
      <div><label for="calc-to">${esc(c.toLabel)}</label><input type="date" id="calc-to"></div>
    </div>
    <output id="calc-between" aria-live="polite"></output>
  </section>
  <section class="card">
    <h2>${esc(c.howH)}</h2>
    <p>${esc(c.how)}</p>
  </section>
  <section class="card cta">
    <img class="icon" src="/cndwn/img/app-icon.png" width="72" height="72" alt="CNDWN app icon">
    <div>
      <h2>${esc(u.ctaH)}</h2>
      <p>${esc(u.ctaP)}</p>
      ${badge(lang)}
    </div>
  </section>
  <section>
    <h2>${esc(u.faqH)}</h2>
    ${faqHtml(c.faq)}
  </section>
</main>`;
  const script = `<script type="application/json" id="calc-i18n">${JSON.stringify(strings)}</script>
<script>
(function () {
  var S = JSON.parse(document.getElementById('calc-i18n').textContent);
  function parse(v) { if (!v) return null; var p = v.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function diff(a, b) { return Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 864e5); }
  function fmt(d) { return new Intl.DateTimeFormat(S.locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d); }
  function f(t, v) { return t.replace(/\\{(\\w+)\\}/g, function (m, k) { return k in v ? v[k] : m; }); }
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  var today = new Date(); today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  var date = document.getElementById('calc-date'), from = document.getElementById('calc-from'), to = document.getElementById('calc-to');
  var later = new Date(today.getFullYear(), 11, 25); if (later <= today) later = new Date(today.getFullYear() + 1, 11, 25);
  date.value = iso(later); from.value = iso(today); to.value = iso(later);
  function until() {
    var d = parse(date.value), out = document.getElementById('calc-until');
    if (!d) { out.textContent = ''; return; }
    var n = diff(today, d);
    out.textContent = n === 0 ? S.resToday : f(n > 0 ? S.resUntil : S.resSince, { n: Math.abs(n).toLocaleString(S.locale), date: fmt(d) });
  }
  function between() {
    var a = parse(from.value), b = parse(to.value), out = document.getElementById('calc-between');
    if (!a || !b) { out.textContent = ''; return; }
    var n = Math.abs(diff(a, b));
    out.innerHTML = '';
    out.appendChild(document.createTextNode(f(S.resBetween, { n: n.toLocaleString(S.locale) })));
    var s = document.createElement('small');
    s.textContent = f(S.resWeeks, { w: Math.floor(n / 7), d: n % 7 }) + ' · ' + f(S.resMonths, { m: (n / 30.4375).toLocaleString(S.locale, { maximumFractionDigits: 1 }) });
    out.appendChild(s);
  }
  date.addEventListener('input', until); from.addEventListener('input', between); to.addEventListener('input', between);
  until(); between();
})();
</script>`;
  const html = page(ctx, {
    lang, title: `${c.title} | CNDWN`, desc: c.desc, canonical: CALC_PATH[lang], alternates: { ...CALC_PATH }, type: 'daysCalculator',
    jsonLd: [
      breadcrumb(ctx, [['CNDWN', `/cndwn/${lang === 'en' ? '' : lang + '/'}`], [u.hubBreadcrumb, HUB_PATH[lang]], [c.breadcrumb, CALC_PATH[lang]]]),
      faqLd(c.faq),
      { '@context': 'https://schema.org', '@type': 'WebApplication', name: c.h1, url: ctx.SITE + CALC_PATH[lang], applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any', inLanguage: lang, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    ],
    body, scripts: script,
  });
  return { path: CALC_PATH[lang], html, alternates: { ...CALC_PATH }, type: 'daysCalculator', priority: lang === 'en' ? 0.7 : 0.6 };
}

// ---------------------------------------------------------------- embed

function embedPage(all) {
  const data = {};
  for (const { lang, t, occ, event, path } of all) {
    data[`${lang}/${t.slug}`] = {
      q: t.q, e: event.emoji, u: path, l: lang,
      ...(occ[0].day ? { d: occ.map(o => iso(o.day)).join(',') } : { i: occ.map(o => o.instant.toISOString()).join(',') }),
    };
  }
  const strings = Object.fromEntries(Object.keys(UI).map(l => [l, {
    locale: COUNTRY[l].locale, day: UI[l].day, days: UI[l].days, until: UI[l].until, today: UI[l].today, by: UI[l].byCndwn,
  }]));
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex">
<title>Countdown · CNDWN</title>
<style>
  :root { --text: #1d1d1f; --muted: #6e6e73; --accent: #5b6cff; --accent-2: #9b5bff; --card: #ffffff; --border: #e3e3e8; }
  @media (prefers-color-scheme: dark) { :root { --text: #f5f5f7; --muted: #9a9aa2; --accent: #7d8bff; --accent-2: #b885ff; --card: #17171d; --border: #26262e; } }
  html, body { margin: 0; background: transparent; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: var(--text); }
  .w { box-sizing: border-box; background: var(--card); border: 1px solid var(--border); border-radius: 20px; padding: 16px 18px; text-align: center; max-width: 360px; margin: 0 auto; }
  .t { font-weight: 700; font-size: 16px; }
  .num { font-size: 52px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.05;
    background: linear-gradient(120deg, var(--accent), var(--accent-2)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
  .unit { font-weight: 700; margin-left: 4px; }
  .clock, .until { color: var(--muted); font-size: 13px; font-variant-numeric: tabular-nums; }
  .by { display: inline-block; margin-top: 8px; font-size: 12px; color: var(--muted); text-decoration: none; }
  .is-today { display: none; font-size: 26px; font-weight: 800; margin: 8px 0; }
  [data-cd].today .is-today { display: block; } [data-cd].today .not-today { display: none; }
</style>
</head>
<body>
<div class="w" id="w"></div>
<script type="application/json" id="embed-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
<script type="application/json" id="embed-i18n">${JSON.stringify(strings)}</script>
<script>
(function () {
  var data = JSON.parse(document.getElementById('embed-data').textContent);
  var S = JSON.parse(document.getElementById('embed-i18n').textContent);
  var p = new URLSearchParams(location.search);
  var item = data[p.get('c')];
  if (!item) {
    // custom countdown: ?t=Title&d=YYYY-MM-DD[THH:MM]&e=emoji&l=lang
    var d = p.get('d') || '';
    if (!/^\\d{4}-\\d{2}-\\d{2}(T\\d{2}:\\d{2})?$/.test(d)) return;
    item = { q: (p.get('t') || '').slice(0, 80), e: (p.get('e') || '').slice(0, 8), u: '/cndwn/', l: S[p.get('l')] ? p.get('l') : 'en' };
    if (d.length > 10) item.i = new Date(d).toISOString(); else item.d = d;
  }
  var s = S[item.l] || S.en;
  document.documentElement.lang = item.l;
  var w = document.getElementById('w');
  var t = document.createElement('div'); t.className = 't'; t.textContent = (item.e ? item.e + ' ' : '') + item.q;
  var box = document.createElement('div'); box.setAttribute('data-cd', ''); box.setAttribute('data-lang', item.l);
  if (item.d) box.setAttribute('data-dates', item.d); else box.setAttribute('data-instants', item.i);
  box.innerHTML = '<div class="is-today"></div><div class="not-today"><span class="num" data-cd-days>–</span><span class="unit" data-cd-unit></span>' +
    '<div class="clock" data-cd-clock></div></div><div class="until" data-cd-until></div>';
  box.querySelector('.is-today').textContent = s.today;
  var by = document.createElement('a'); by.className = 'by'; by.target = '_blank'; by.rel = 'noopener';
  by.href = 'https://schillan.com' + item.u; by.textContent = s.by;
  w.appendChild(t); w.appendChild(box); w.appendChild(by);
  var i18n = document.createElement('script'); i18n.type = 'application/json'; i18n.id = 'cd-i18n';
  i18n.textContent = JSON.stringify({ locale: s.locale, day: s.day, days: s.days, until: s.until, today: s.today });
  document.body.appendChild(i18n);
})();
</script>
<script src="/cndwn/js/countdown.js"></script>
</body>
</html>
`;
}

// ---------------------------------------------------------------- entry

export function buildCountdownPages(ctx, now = new Date()) {
  const pages = [];
  const all = [];
  for (const lang of Object.keys(UI)) {
    const langEvents = EVENTS.filter(e => e.langs[lang])
      .map(event => ({ event, t: event.langs[lang], occ: upcoming(event, lang, now) }))
      .sort((a, b) => {
        const ta = a.occ[0].day ? Date.UTC(a.occ[0].day.y, a.occ[0].day.m - 1, a.occ[0].day.d) : +a.occ[0].instant;
        const tb = b.occ[0].day ? Date.UTC(b.occ[0].day.y, b.occ[0].day.m - 1, b.occ[0].day.d) : +b.occ[0].instant;
        return ta - tb;
      });
    for (const le of langEvents) {
      const p = eventPage(ctx, le.event, lang, now, langEvents);
      pages.push(p);
      all.push({ lang, ...le, path: p.path });
    }
    pages.push(hubPage(ctx, lang, langEvents));
    pages.push(calcPage(ctx, lang));
  }
  return { pages, embedHtml: embedPage(all) };
}

// The next `count` occasions in a language, soonest first, for linking from other pages.
export function nextCountdowns(lang, count, now = new Date()) {
  return EVENTS.filter(e => e.langs[lang])
    .map(e => ({ e, occ: upcoming(e, lang, now)[0] }))
    .sort((a, b) => (a.occ.day ? Date.UTC(a.occ.day.y, a.occ.day.m - 1, a.occ.day.d) : +a.occ.instant)
      - (b.occ.day ? Date.UTC(b.occ.day.y, b.occ.day.m - 1, b.occ.day.d) : +b.occ.instant))
    .slice(0, count)
    .map(({ e }) => ({ href: pathOf(lang, e.langs[lang].slug), emoji: e.emoji, name: e.langs[lang].name }));
}

export { upcoming, seasonInstant, easter, occurrence };
