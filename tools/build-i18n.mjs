#!/usr/bin/env node
/*
 * CNDWN i18n static-site generator.
 *
 * Reads the trilingual templates in tools/templates/ and emits one clean
 * single-language HTML page per language, each at its own URL with correct
 * canonical + hreflang tags (proper multilingual SEO). Run after editing a
 * template:
 *
 *   npm install cheerio        # once
 *   node tools/build-i18n.mjs  # regenerates the six pages below
 *
 * Outputs:
 *   /cndwn/                 /cndwn/de/                 /cndwn/es/
 *   /cndwn/privacy/         /cndwn/de/privacy/         /cndwn/es/privacy/
 */
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '..', '..');
const SITE = 'https://schillan.com';
const LANGS = ['en', 'de', 'es'];
const OG_LOCALE = { en: 'en_US', de: 'de_DE', es: 'es_ES' };

const landingPath = { en: '/cndwn/', de: '/cndwn/de/', es: '/cndwn/es/' };
const privacyPath = { en: '/cndwn/privacy/', de: '/cndwn/de/privacy/', es: '/cndwn/es/privacy/' };
const pathFor = { landing: landingPath, privacy: privacyPath };

const META = {
  landing: {
    en: {
      title: 'CNDWN — Beautiful Countdown & Countup App for iPhone, iPad, Mac & Apple Watch',
      desc: 'CNDWN is a privacy-first countdown and countup app for Apple devices. Count down to birthdays, holidays, trips and deadlines with progress bars, Home Screen, Lock Screen and StandBy widgets, Live Activities, iCloud sync, custom colors, calendar & reminders import and sharing. The first countdown app with every feature free. No ads, no trackers.',
      ogTitle: 'CNDWN — Beautiful Countdown & Countup App for Apple Devices',
      ogDesc: 'Count down (and up) to what matters with progress bars, gorgeous widgets, Live Activities, iCloud sync and total privacy. For iPhone, iPad, Mac and Apple Watch. Every feature free.',
      breadcrumbPrivacy: 'Privacy Policy',
    },
    de: {
      title: 'CNDWN — Schöne Countdown- & Countup-App für iPhone, iPad, Mac & Apple Watch',
      desc: 'CNDWN ist eine datenschutzfreundliche Countdown- und Countup-App für Apple-Geräte. Zähle herunter zu Geburtstagen, Feiertagen, Reisen und Deadlines – mit Fortschrittsbalken, Home-, Sperrbildschirm- und StandBy-Widgets, Live-Aktivitäten, iCloud-Sync, eigenen Farben, Kalender- und Erinnerungen-Import und Teilen. Die erste Countdown-App mit allen Funktionen gratis. Keine Werbung, keine Tracker.',
      ogTitle: 'CNDWN — Schöne Countdown- & Countup-App für Apple-Geräte',
      ogDesc: 'Zähle herunter (und hinauf) zu allem, was zählt – mit Fortschrittsbalken, schönen Widgets, Live-Aktivitäten, iCloud-Sync und voller Privatsphäre. Für iPhone, iPad, Mac und Apple Watch. Alle Funktionen gratis.',
      breadcrumbPrivacy: 'Datenschutzerklärung',
    },
    es: {
      title: 'CNDWN — Bonita app de cuenta atrás y adelante para iPhone, iPad, Mac y Apple Watch',
      desc: 'CNDWN es una app de cuenta atrás y adelante centrada en la privacidad para dispositivos Apple. Cuenta atrás hacia cumpleaños, vacaciones, viajes y fechas límite con barras de progreso, widgets de pantalla de inicio, bloqueo y StandBy, actividades en vivo, sincronización con iCloud, colores personalizados, importación de Calendario y Recordatorios, y opción de compartir. La primera app de cuenta atrás con todas las funciones gratis. Sin anuncios ni rastreadores.',
      ogTitle: 'CNDWN — Bonita app de cuenta atrás y adelante para dispositivos Apple',
      ogDesc: 'Cuenta atrás (y adelante) hacia lo que importa: barras de progreso, bonitos widgets, actividades en vivo, sincronización con iCloud y total privacidad. Para iPhone, iPad, Mac y Apple Watch. Todo gratis.',
      breadcrumbPrivacy: 'Política de Privacidad',
    },
  },
  privacy: {
    en: {
      title: 'CNDWN — Privacy Policy',
      desc: 'Privacy Policy for the CNDWN countdown app (GDPR). No ads, no trackers — your countdowns stay on your device and in your own iCloud.',
    },
    de: {
      title: 'CNDWN — Datenschutzerklärung',
      desc: 'Datenschutzerklärung der Countdown-App CNDWN (DSGVO). Keine Werbung, keine Tracker – deine Countdowns bleiben auf deinem Gerät und in deiner eigenen iCloud.',
    },
    es: {
      title: 'CNDWN — Política de Privacidad',
      desc: 'Política de Privacidad de la app de cuenta atrás CNDWN (RGPD). Sin anuncios, sin rastreadores: tus cuentas atrás permanecen en tu dispositivo y en tu propia iCloud.',
    },
  },
};

function absUrl(type, lang) { return SITE + pathFor[type][lang]; }

function rewriteAssetAttr(val) {
  if (!val) return val;
  if (val.startsWith('../img/')) return '/cndwn/img/' + val.slice('../img/'.length);
  if (val.startsWith('img/')) return '/cndwn/img/' + val.slice('img/'.length);
  return val;
}

function normText(s) { return (s || '').replace(/\s+/g, ' ').trim(); }

function build(type, lang) {
  const tplFile = path.join(ROOT, 'tools', 'templates', type === 'landing' ? 'landing.html' : 'privacy.html');
  const $ = cheerio.load(fs.readFileSync(tplFile, 'utf8'), { decodeEntities: false });
  const meta = META[type][lang];
  const canonical = absUrl(type, lang);
  const targets = pathFor[type];

  // 1. document language
  $('html').attr('lang', lang);
  $('body').removeAttr('data-lang');

  // 2. strip to a single language (remove other-language content nodes in <body>)
  $('body [lang]').each((_, el) => {
    const l = $(el).attr('lang');
    if (LANGS.includes(l) && l !== lang) $(el).remove();
  });

  // 3. drop the client-side switcher script
  $('script').each((_, el) => { if (($(el).html() || '').includes('data-set-lang')) $(el).remove(); });

  // 4. rewrite internal links to the correct language path
  $('a[href="/cndwn/"]').attr('href', landingPath[lang]);
  $('a[href="/cndwn/privacy/"]').attr('href', privacyPath[lang]);
  $('a[href^="/cndwn/#"]').each((_, el) => {
    const h = $(el).attr('href');
    $(el).attr('href', landingPath[lang] + h.slice('/cndwn/'.length));
  });

  // 5. root-absolute asset paths (work from any subdirectory depth)
  $('[src]').each((_, el) => $(el).attr('src', rewriteAssetAttr($(el).attr('src'))));
  $('[href]').each((_, el) => {
    const h = $(el).attr('href');
    if (h && (h.startsWith('img/') || h.startsWith('../img/'))) $(el).attr('href', rewriteAssetAttr(h));
  });

  // 6. static language switcher (real links) — built AFTER link rewrites so
  //    its absolute /cndwn/… targets are not themselves rewritten
  const links = LANGS.map(l =>
    `<a href="${targets[l]}"${l === lang ? ' class="active" aria-current="page"' : ''}>${l.toUpperCase()}</a>`
  ).join('\n        ');
  $('.lang-switch').attr('role', 'group').attr('aria-label', 'Language').html('\n        ' + links + '\n      ');

  // 7. head: title, description, robots, canonical, hreflang, Open Graph
  $('title').text(meta.title);
  $('meta[name="description"]').attr('content', meta.desc);
  $('meta[name="robots"]').attr('content', 'index, follow, max-image-preview:large');
  $('link[rel="canonical"]').attr('href', canonical);

  $('link[rel="alternate"][hreflang]').remove();
  const hreflangs = [...LANGS.map(l => [l, absUrl(type, l)]), ['x-default', absUrl(type, 'en')]]
    .map(([hl, href]) => `<link rel="alternate" hreflang="${hl}" href="${href}">`).join('\n');
  $('link[rel="canonical"]').after('\n' + hreflangs);

  setOG($, 'og:url', canonical);
  setOG($, 'og:locale', OG_LOCALE[lang]);
  $('meta[property="og:locale:alternate"]').remove();
  LANGS.filter(l => l !== lang).forEach(l =>
    $('meta[property="og:locale"]').after(`\n<meta property="og:locale:alternate" content="${OG_LOCALE[l]}">`));
  if (type === 'landing') {
    setOG($, 'og:title', meta.ogTitle);
    setOG($, 'og:description', meta.ogDesc);
    setMetaName($, 'twitter:title', meta.ogTitle);
    setMetaName($, 'twitter:description', meta.ogDesc);
  }

  // 8. JSON-LD (landing) rebuilt in the page language from the stripped DOM
  if (type === 'landing') rebuildJsonLd($, lang, meta, canonical);

  let html = $.html();
  if (!/^<!doctype/i.test(html.trimStart())) html = '<!DOCTYPE html>\n' + html;
  return html;
}

function setOG($, prop, content) {
  const el = $(`meta[property="${prop}"]`);
  if (el.length) el.attr('content', content);
}
function setMetaName($, name, content) {
  const el = $(`meta[name="${name}"]`);
  if (el.length) el.attr('content', content);
}

function rebuildJsonLd($, lang, meta, canonical) {
  const scripts = $('script[type="application/ld+json"]').toArray();
  const featureList = $('.features .feature h3').map((_, el) => normText($(el).text())).get();
  const faq = $('.faq details').map((_, el) => ({
    q: normText($(el).find('summary').text()),
    a: normText($(el).find('p').text()),
  })).get();
  const privacyUrl = SITE + privacyPath[lang];

  for (const s of scripts) {
    let data;
    try { data = JSON.parse($(s).text()); } catch { continue; }
    if (data['@type'] === 'SoftwareApplication') {
      data.description = meta.desc;
      data.url = canonical;
      data.inLanguage = lang;
      if (featureList.length) data.featureList = featureList;
    } else if (data['@type'] === 'FAQPage') {
      if (faq.length) data.mainEntity = faq.map(f => ({
        '@type': 'Question', name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      }));
    } else if (data['@type'] === 'BreadcrumbList') {
      data.itemListElement = [
        { '@type': 'ListItem', position: 1, name: 'CNDWN', item: canonical },
        { '@type': 'ListItem', position: 2, name: meta.breadcrumbPrivacy, item: privacyUrl },
      ];
    }
    $(s).text('\n' + JSON.stringify(data, null, 2) + '\n');
  }
}

const OUTPUTS = [
  ['landing', 'en', 'cndwn/index.html'],
  ['landing', 'de', 'cndwn/de/index.html'],
  ['landing', 'es', 'cndwn/es/index.html'],
  ['privacy', 'en', 'cndwn/privacy/index.html'],
  ['privacy', 'de', 'cndwn/de/privacy/index.html'],
  ['privacy', 'es', 'cndwn/es/privacy/index.html'],
];

for (const [type, lang, out] of OUTPUTS) {
  const html = build(type, lang);
  const dest = path.join(ROOT, out);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html, 'utf8');
  console.log(`✓ ${out}  (${type}/${lang})`);
}
console.log('Done. Regenerated 6 pages from tools/templates/.');
