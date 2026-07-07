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
 *   node tools/build-i18n.mjs  # regenerates the pages below
 *
 * Outputs:
 *   /cndwn/                              /cndwn/de/                              /cndwn/es/
 *   /cndwn/privacy/                      /cndwn/de/privacy/                      /cndwn/es/privacy/
 *   /cndwn/best-countdown-app-iphone/    /cndwn/de/best-countdown-app-iphone/    /cndwn/es/best-countdown-app-iphone/
 *   /cndwn/countdown-widget-ios/         /cndwn/de/countdown-widget-ios/         /cndwn/es/countdown-widget-ios/
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
const bestAppPath = { en: '/cndwn/best-countdown-app-iphone/', de: '/cndwn/de/best-countdown-app-iphone/', es: '/cndwn/es/best-countdown-app-iphone/' };
const widgetGuidePath = { en: '/cndwn/countdown-widget-ios/', de: '/cndwn/de/countdown-widget-ios/', es: '/cndwn/es/countdown-widget-ios/' };
const pathFor = { landing: landingPath, privacy: privacyPath, bestApp: bestAppPath, widgetGuide: widgetGuidePath };

const META = {
  landing: {
    en: {
      title: 'CNDWN — Beautiful Countdown & Countup App for iPhone, iPad, Mac & Apple Watch',
      desc: 'CNDWN is a privacy-first countdown and countup app for Apple devices. Count down to birthdays, holidays, trips and deadlines with progress bars, Home Screen, Lock Screen and StandBy widgets, Live Activities, iCloud sync, custom colors, calendar & reminders import and sharing. The first countdown app with every feature free. No ads, no trackers.',
      ogTitle: 'CNDWN — Beautiful Countdown & Countup App for Apple Devices',
      ogDesc: 'Count down (and up) to what matters with progress bars, gorgeous widgets, Live Activities, iCloud sync and total privacy. For iPhone, iPad, Mac and Apple Watch. Every feature free.',
      breadcrumbPrivacy: 'Privacy Policy',
      howTo: {
        name: 'How to create a countdown in CNDWN',
        steps: [
          { name: 'Add an event', text: 'Type a title and pick a date, or import an event straight from Calendar or Reminders.' },
          { name: 'Make it yours', text: 'Add an emoji, pick a custom color and choose a countdown, countup or progress bar.' },
          { name: 'Watch it tick', text: 'Pin a widget to your Home or Lock Screen and watch every day count down, even in the Dynamic Island.' },
        ],
      },
    },
    de: {
      title: 'CNDWN — Schöne Countdown- & Countup-App für iPhone, iPad, Mac & Apple Watch',
      desc: 'CNDWN ist eine datenschutzfreundliche Countdown- und Countup-App für Apple-Geräte. Zähle herunter zu Geburtstagen, Feiertagen, Reisen und Deadlines – mit Fortschrittsbalken, Home-, Sperrbildschirm- und StandBy-Widgets, Live-Aktivitäten, iCloud-Sync, eigenen Farben, Kalender- und Erinnerungen-Import und Teilen. Die erste Countdown-App mit allen Funktionen gratis. Keine Werbung, keine Tracker.',
      ogTitle: 'CNDWN — Schöne Countdown- & Countup-App für Apple-Geräte',
      ogDesc: 'Zähle herunter (und hinauf) zu allem, was zählt – mit Fortschrittsbalken, schönen Widgets, Live-Aktivitäten, iCloud-Sync und voller Privatsphäre. Für iPhone, iPad, Mac und Apple Watch. Alle Funktionen gratis.',
      breadcrumbPrivacy: 'Datenschutzerklärung',
      howTo: {
        name: 'So erstellst du einen Countdown in CNDWN',
        steps: [
          { name: 'Ereignis hinzufügen', text: 'Titel eingeben und Datum wählen — oder ein Ereignis direkt aus Kalender oder Erinnerungen importieren.' },
          { name: 'Mach es persönlich', text: 'Emoji hinzufügen, eigene Farbe wählen und zwischen Countdown, Countup oder Fortschrittsbalken entscheiden.' },
          { name: 'Sieh ihm beim Ticken zu', text: 'Hefte ein Widget an Home- oder Sperrbildschirm und zähl jeden Tag herunter — sogar in der Dynamic Island.' },
        ],
      },
    },
    es: {
      title: 'CNDWN — Bonita app de cuenta atrás y adelante para iPhone, iPad, Mac y Apple Watch',
      desc: 'CNDWN es una app de cuenta atrás y adelante centrada en la privacidad para dispositivos Apple. Cuenta atrás hacia cumpleaños, vacaciones, viajes y fechas límite con barras de progreso, widgets de pantalla de inicio, bloqueo y StandBy, actividades en vivo, sincronización con iCloud, colores personalizados, importación de Calendario y Recordatorios, y opción de compartir. La primera app de cuenta atrás con todas las funciones gratis. Sin anuncios ni rastreadores.',
      ogTitle: 'CNDWN — Bonita app de cuenta atrás y adelante para dispositivos Apple',
      ogDesc: 'Cuenta atrás (y adelante) hacia lo que importa: barras de progreso, bonitos widgets, actividades en vivo, sincronización con iCloud y total privacidad. Para iPhone, iPad, Mac y Apple Watch. Todo gratis.',
      breadcrumbPrivacy: 'Política de Privacidad',
      howTo: {
        name: 'Cómo crear una cuenta atrás en CNDWN',
        steps: [
          { name: 'Añade un evento', text: 'Escribe un título y elige una fecha, o importa un evento desde Calendario o Recordatorios.' },
          { name: 'Hazlo tuyo', text: 'Añade un emoji, elige un color y decide entre cuenta atrás, adelante o barra de progreso.' },
          { name: 'Míralo avanzar', text: 'Fija un widget en tu pantalla de inicio o bloqueo y ve pasar cada día — incluso en la Dynamic Island.' },
        ],
      },
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
  bestApp: {
    en: {
      title: 'Best Free Countdown App for iPhone (2026 Guide) — CNDWN',
      desc: 'Looking for the best countdown app for iPhone? Here is what to look for — privacy, widgets, Live Activities, iCloud sync — and why CNDWN is a free countdown app with every feature included, no ads and no trackers.',
      breadcrumbName: 'Best Countdown App for iPhone',
    },
    de: {
      title: 'Die beste kostenlose Countdown-App für iPhone (Ratgeber 2026) — CNDWN',
      desc: 'Auf der Suche nach der besten Countdown-App für iPhone? So erkennst du eine gute App — Datenschutz, Widgets, Live-Aktivitäten, iCloud-Sync — und warum CNDWN alle Funktionen kostenlos bietet, ohne Werbung und Tracker.',
      breadcrumbName: 'Beste Countdown-App für iPhone',
    },
    es: {
      title: 'La mejor app de cuenta atrás gratis para iPhone (Guía 2026) — CNDWN',
      desc: '¿Buscas la mejor app de cuenta atrás para iPhone? Esto es lo que debes buscar — privacidad, widgets, actividades en vivo, sincronización con iCloud — y por qué CNDWN incluye todas las funciones gratis, sin anuncios ni rastreadores.',
      breadcrumbName: 'Mejor app de cuenta atrás para iPhone',
    },
  },
  widgetGuide: {
    en: {
      title: 'Countdown Widgets for iPhone: Home Screen, Lock Screen & StandBy Guide — CNDWN',
      desc: 'A guide to countdown widgets on iOS: Home Screen, Lock Screen and StandBy widgets, Live Activities and the Dynamic Island — and how to set one up with CNDWN, a free countdown app for iPhone.',
      breadcrumbName: 'Countdown Widgets for iOS',
    },
    de: {
      title: 'Countdown-Widgets für iPhone: Home-Bildschirm, Sperrbildschirm & StandBy — CNDWN',
      desc: 'Ein Leitfaden zu Countdown-Widgets unter iOS: Home-Bildschirm-, Sperrbildschirm- und StandBy-Widgets, Live-Aktivitäten und die Dynamic Island — und wie du eins mit CNDWN einrichtest, einer kostenlosen Countdown-App für iPhone.',
      breadcrumbName: 'Countdown-Widgets für iOS',
    },
    es: {
      title: 'Widgets de cuenta atrás para iPhone: pantalla de inicio, bloqueo y StandBy — CNDWN',
      desc: 'Una guía sobre los widgets de cuenta atrás en iOS: widgets de pantalla de inicio, de bloqueo y StandBy, actividades en vivo y la Dynamic Island — y cómo configurar uno con CNDWN, una app de cuenta atrás gratis para iPhone.',
      breadcrumbName: 'Widgets de cuenta atrás para iOS',
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

const TEMPLATE_FILES = {
  landing: 'landing.html',
  privacy: 'privacy.html',
  bestApp: 'best-countdown-app.html',
  widgetGuide: 'countdown-widget-ios.html',
};
const SHARED_CSS = fs.readFileSync(path.join(ROOT, 'tools', 'templates', 'shared.css'), 'utf8');

function build(type, lang) {
  const tplFile = path.join(ROOT, 'tools', 'templates', TEMPLATE_FILES[type]);
  const $ = cheerio.load(fs.readFileSync(tplFile, 'utf8'), { decodeEntities: false });
  const meta = META[type][lang];
  const canonical = absUrl(type, lang);
  const targets = pathFor[type];

  // 0. inject shared design tokens/nav/footer CSS (new templates only opt in
  //    via <style id="shared-styles">; landing/privacy keep their own copy)
  if ($('style#shared-styles').length) $('style#shared-styles').text('\n' + SHARED_CSS);

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
  for (const t of Object.keys(pathFor)) {
    $(`a[href="${pathFor[t].en}"]`).attr('href', pathFor[t][lang]);
  }
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
  if ($('meta[property="og:title"]').length) {
    setOG($, 'og:title', meta.ogTitle || meta.title);
    setOG($, 'og:description', meta.ogDesc || meta.desc);
    setMetaName($, 'twitter:title', meta.ogTitle || meta.title);
    setMetaName($, 'twitter:description', meta.ogDesc || meta.desc);
  }

  // 8. JSON-LD rebuilt in the page language from the stripped DOM
  rebuildJsonLd($, type, lang, meta, canonical);

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

function rebuildJsonLd($, type, lang, meta, canonical) {
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
    } else if (data['@type'] === 'WebPage') {
      data.name = meta.title;
      data.description = meta.desc;
      data.url = canonical;
      data.inLanguage = lang;
    } else if (data['@type'] === 'BreadcrumbList') {
      data.itemListElement = type === 'landing'
        ? [
          { '@type': 'ListItem', position: 1, name: 'CNDWN', item: canonical },
          { '@type': 'ListItem', position: 2, name: meta.breadcrumbPrivacy, item: privacyUrl },
        ]
        : [
          { '@type': 'ListItem', position: 1, name: 'CNDWN', item: SITE + landingPath[lang] },
          { '@type': 'ListItem', position: 2, name: meta.breadcrumbName, item: canonical },
        ];
    } else if (data['@type'] === 'HowTo' && meta.howTo) {
      data.name = meta.howTo.name;
      data.step = meta.howTo.steps.map(s => ({ '@type': 'HowToStep', name: s.name, text: s.text }));
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
  ['bestApp', 'en', 'cndwn/best-countdown-app-iphone/index.html'],
  ['bestApp', 'de', 'cndwn/de/best-countdown-app-iphone/index.html'],
  ['bestApp', 'es', 'cndwn/es/best-countdown-app-iphone/index.html'],
  ['widgetGuide', 'en', 'cndwn/countdown-widget-ios/index.html'],
  ['widgetGuide', 'de', 'cndwn/de/countdown-widget-ios/index.html'],
  ['widgetGuide', 'es', 'cndwn/es/countdown-widget-ios/index.html'],
];

for (const [type, lang, out] of OUTPUTS) {
  const html = build(type, lang);
  const dest = path.join(ROOT, out);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html, 'utf8');
  console.log(`✓ ${out}  (${type}/${lang})`);
}
console.log(`Done. Regenerated ${OUTPUTS.length} pages from tools/templates/.`);
