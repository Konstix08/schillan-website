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
 *   /                                    /de/                                    /es/
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
const AUTONYM = { en: 'English', de: 'Deutsch', es: 'Español' };
// The homepage and the CNDWN section are separate products sharing one
// domain, so each remembers its own language preference.
const STORAGE_KEY = { home: 'schillan-lang' };
const DEFAULT_STORAGE_KEY = 'cndwn-lang';

const landingPath = { en: '/cndwn/', de: '/cndwn/de/', es: '/cndwn/es/' };
const privacyPath = { en: '/cndwn/privacy/', de: '/cndwn/de/privacy/', es: '/cndwn/es/privacy/' };
const bestAppPath = { en: '/cndwn/best-countdown-app-iphone/', de: '/cndwn/de/best-countdown-app-iphone/', es: '/cndwn/es/best-countdown-app-iphone/' };
const widgetGuidePath = { en: '/cndwn/countdown-widget-ios/', de: '/cndwn/de/countdown-widget-ios/', es: '/cndwn/es/countdown-widget-ios/' };
const widgetHowToPath = { en: '/cndwn/how-to-add-countdown-widget/', de: '/cndwn/de/how-to-add-countdown-widget/', es: '/cndwn/es/how-to-add-countdown-widget/' };
const liveActivitiesPath = { en: '/cndwn/countdown-live-activities/', de: '/cndwn/de/countdown-live-activities/', es: '/cndwn/es/countdown-live-activities/' };
const vacationCountdownPath = { en: '/cndwn/vacation-countdown/', de: '/cndwn/de/vacation-countdown/', es: '/cndwn/es/vacation-countdown/' };
const icloudSyncPath = { en: '/cndwn/countdown-icloud-sync/', de: '/cndwn/de/countdown-icloud-sync/', es: '/cndwn/es/countdown-icloud-sync/' };
const weddingCountdownPath = { en: '/cndwn/wedding-countdown/', de: '/cndwn/de/wedding-countdown/', es: '/cndwn/es/wedding-countdown/' };
const homePath = { en: '/', de: '/de/', es: '/es/' };
const pathFor = {
  landing: landingPath, privacy: privacyPath, bestApp: bestAppPath, widgetGuide: widgetGuidePath,
  widgetHowTo: widgetHowToPath, liveActivities: liveActivitiesPath, vacationCountdown: vacationCountdownPath,
  icloudSync: icloudSyncPath, weddingCountdown: weddingCountdownPath, home: homePath,
};

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
  widgetHowTo: {
    en: {
      title: 'How to Add a Countdown Widget on iPhone (Step by Step) — CNDWN',
      desc: 'A simple step-by-step guide to adding a countdown widget to your iPhone Home Screen, Lock Screen or StandBy with CNDWN — six steps, no technical skill required.',
      breadcrumbName: 'How to Add a Countdown Widget',
      howTo: {
        name: 'How to add a countdown widget on iPhone',
        steps: [
          { name: 'Download CNDWN', text: 'Get CNDWN for free from the App Store and open it.' },
          { name: 'Create a countdown', text: 'Tap +, add a title and pick a date — or import an event straight from Calendar or Reminders.' },
          { name: 'Long-press your Home Screen', text: 'Touch and hold any empty area of your Home Screen until the icons start to jiggle.' },
          { name: 'Tap the + button', text: 'Tap the + in the top corner to open the widget gallery.' },
          { name: 'Search for CNDWN', text: 'Type "CNDWN" in the search bar and select it from the results.' },
          { name: 'Choose a size and add it', text: 'Swipe to pick small, medium or large, then tap Add Widget. Tap Done to finish.' },
        ],
      },
    },
    de: {
      title: 'So fügst du ein Countdown-Widget auf dem iPhone hinzu (Schritt für Schritt) — CNDWN',
      desc: 'Eine einfache Schritt-für-Schritt-Anleitung, um ein Countdown-Widget auf deinem iPhone-Home-Bildschirm, Sperrbildschirm oder StandBy mit CNDWN hinzuzufügen — sechs Schritte, keine technischen Kenntnisse nötig.',
      breadcrumbName: 'Countdown-Widget hinzufügen',
      howTo: {
        name: 'So fügst du ein Countdown-Widget auf dem iPhone hinzu',
        steps: [
          { name: 'CNDWN herunterladen', text: 'Lade CNDWN kostenlos aus dem App Store und öffne es.' },
          { name: 'Erstelle einen Countdown', text: 'Tippe auf +, gib einen Titel ein und wähle ein Datum — oder importiere ein Ereignis direkt aus Kalender oder Erinnerungen.' },
          { name: 'Halte deinen Home-Bildschirm gedrückt', text: 'Berühre und halte eine leere Stelle auf dem Home-Bildschirm, bis die Symbole wackeln.' },
          { name: 'Tippe auf die Schaltfläche +', text: 'Tippe oben in der Ecke auf +, um die Widget-Galerie zu öffnen.' },
          { name: 'Suche nach CNDWN', text: 'Gib "CNDWN" in die Suchleiste ein und wähle es aus den Ergebnissen aus.' },
          { name: 'Wähle eine Größe und füge es hinzu', text: 'Wische, um klein, mittel oder groß zu wählen, und tippe dann auf Widget hinzufügen. Tippe auf Fertig.' },
        ],
      },
    },
    es: {
      title: 'Cómo añadir un widget de cuenta atrás en iPhone (paso a paso) — CNDWN',
      desc: 'Una guía sencilla paso a paso para añadir un widget de cuenta atrás a la pantalla de inicio, de bloqueo o StandBy de tu iPhone con CNDWN — seis pasos, sin conocimientos técnicos.',
      breadcrumbName: 'Cómo añadir un widget de cuenta atrás',
      howTo: {
        name: 'Cómo añadir un widget de cuenta atrás en iPhone',
        steps: [
          { name: 'Descarga CNDWN', text: 'Consigue CNDWN gratis en la App Store y ábrelo.' },
          { name: 'Crea una cuenta atrás', text: 'Toca +, añade un título y elige una fecha — o importa un evento desde Calendario o Recordatorios.' },
          { name: 'Mantén pulsada tu pantalla de inicio', text: 'Toca y mantén pulsada una zona vacía de tu pantalla de inicio hasta que los iconos empiecen a moverse.' },
          { name: 'Toca el botón +', text: 'Toca el + en la esquina superior para abrir la galería de widgets.' },
          { name: 'Busca CNDWN', text: 'Escribe "CNDWN" en la barra de búsqueda y selecciónalo entre los resultados.' },
          { name: 'Elige un tamaño y añádelo', text: 'Desliza para elegir pequeño, mediano o grande, y toca Añadir widget. Toca Listo.' },
        ],
      },
    },
  },
  liveActivities: {
    en: {
      title: 'How to Add a Countdown Live Activity on iPhone — CNDWN',
      desc: 'How to turn on Live Activities and start a real-time countdown on your iPhone Lock Screen and in the Dynamic Island with CNDWN.',
      breadcrumbName: 'Countdown Live Activities',
      howTo: {
        name: 'How to add a countdown Live Activity on iPhone',
        steps: [
          { name: 'Check your iOS version', text: 'Make sure your iPhone is running iOS 16.1 or later — Live Activities require it.' },
          { name: 'Turn on Live Activities for CNDWN', text: 'Open Settings, scroll to CNDWN and make sure Live Activities is switched on.' },
          { name: 'Open a countdown in CNDWN', text: 'Open the app and select the countdown you want to follow live.' },
          { name: 'Start the Live Activity', text: 'Tap Start Live Activity on the countdown. It will appear right away.' },
          { name: 'Lock your phone to see it', text: 'Lock your iPhone to see the live countdown on the Lock Screen, and in the Dynamic Island if your model has one.' },
        ],
      },
    },
    de: {
      title: 'So fügst du eine Countdown-Live-Aktivität auf dem iPhone hinzu — CNDWN',
      desc: 'So schaltest du Live-Aktivitäten ein und startest einen Countdown in Echtzeit auf dem Sperrbildschirm und in der Dynamic Island mit CNDWN.',
      breadcrumbName: 'Countdown-Live-Aktivitäten',
      howTo: {
        name: 'So fügst du eine Countdown-Live-Aktivität auf dem iPhone hinzu',
        steps: [
          { name: 'Prüfe deine iOS-Version', text: 'Stelle sicher, dass dein iPhone mit iOS 16.1 oder neuer läuft — das ist Voraussetzung für Live-Aktivitäten.' },
          { name: 'Aktiviere Live-Aktivitäten für CNDWN', text: 'Öffne Einstellungen, gehe zu CNDWN und stelle sicher, dass Live-Aktivitäten aktiviert ist.' },
          { name: 'Öffne einen Countdown in CNDWN', text: 'Öffne die App und wähle den Countdown, den du live verfolgen möchtest.' },
          { name: 'Starte die Live-Aktivität', text: 'Tippe beim Countdown auf Live-Aktivität starten. Sie erscheint sofort.' },
          { name: 'Sperre dein Handy, um sie zu sehen', text: 'Sperre dein iPhone, um den Live-Countdown auf dem Sperrbildschirm zu sehen — und in der Dynamic Island, falls dein Modell eine hat.' },
        ],
      },
    },
    es: {
      title: 'Cómo añadir una actividad en vivo de cuenta atrás en iPhone — CNDWN',
      desc: 'Cómo activar las actividades en vivo e iniciar una cuenta atrás en tiempo real en la pantalla de bloqueo y la Dynamic Island de tu iPhone con CNDWN.',
      breadcrumbName: 'Actividades en vivo de cuenta atrás',
      howTo: {
        name: 'Cómo añadir una actividad en vivo de cuenta atrás en iPhone',
        steps: [
          { name: 'Comprueba tu versión de iOS', text: 'Asegúrate de que tu iPhone tiene iOS 16.1 o posterior — es un requisito para las actividades en vivo.' },
          { name: 'Activa las actividades en vivo para CNDWN', text: 'Abre Ajustes, ve a CNDWN y comprueba que las actividades en vivo estén activadas.' },
          { name: 'Abre una cuenta atrás en CNDWN', text: 'Abre la app y elige la cuenta atrás que quieres seguir en vivo.' },
          { name: 'Inicia la actividad en vivo', text: 'Toca Iniciar actividad en vivo en la cuenta atrás. Aparecerá al instante.' },
          { name: 'Bloquea tu teléfono para verla', text: 'Bloquea tu iPhone para ver la cuenta atrás en vivo en la pantalla de bloqueo, y en la Dynamic Island si tu modelo la tiene.' },
        ],
      },
    },
  },
  vacationCountdown: {
    en: {
      title: 'Vacation & Trip Countdown: Count Down to Your Next Trip — CNDWN',
      desc: 'How to set up a vacation or trip countdown with CNDWN — add your departure date, pin a widget and share it with your travel companions.',
      breadcrumbName: 'Vacation & Trip Countdown',
    },
    de: {
      title: 'Urlaubs- & Reise-Countdown: Zähl herunter zu deiner nächsten Reise — CNDWN',
      desc: 'So richtest du einen Urlaubs- oder Reise-Countdown mit CNDWN ein — füge dein Abreisedatum hinzu, hefte ein Widget an und teile es mit deinen Reisebegleitern.',
      breadcrumbName: 'Urlaubs- & Reise-Countdown',
    },
    es: {
      title: 'Cuenta atrás de vacaciones y viajes: cuenta atrás para tu próximo viaje — CNDWN',
      desc: 'Cómo configurar una cuenta atrás de vacaciones o viaje con CNDWN — añade tu fecha de salida, fija un widget y compártela con tus compañeros de viaje.',
      breadcrumbName: 'Cuenta atrás de vacaciones y viajes',
    },
  },
  icloudSync: {
    en: {
      title: 'How to Sync Countdowns Across iPhone, iPad, Mac & Apple Watch — CNDWN',
      desc: 'How to sync your countdowns automatically across iPhone, iPad, Mac and Apple Watch with CNDWN and your own private iCloud account.',
      breadcrumbName: 'Sync Countdowns Across Devices',
      howTo: {
        name: 'How to sync countdowns across iPhone, iPad, Mac and Apple Watch',
        steps: [
          { name: 'Turn on iCloud on each device', text: 'Open Settings, tap your name, then iCloud, and make sure iCloud Drive is turned on.' },
          { name: 'Sign in with the same Apple ID everywhere', text: 'Use the same Apple ID on your iPhone, iPad, Mac and Apple Watch.' },
          { name: 'Open CNDWN on each device', text: 'Install CNDWN and open it — your countdowns appear automatically, no setup needed.' },
          { name: 'Use Handoff to pick up where you left off', text: 'Start editing a countdown on your iPhone and continue instantly on your iPad or Mac.' },
        ],
      },
    },
    de: {
      title: 'So synchronisierst du Countdowns auf iPhone, iPad, Mac & Apple Watch — CNDWN',
      desc: 'So synchronisierst du deine Countdowns automatisch auf iPhone, iPad, Mac und Apple Watch mit CNDWN und deiner eigenen privaten iCloud.',
      breadcrumbName: 'Countdowns geräteübergreifend synchronisieren',
      howTo: {
        name: 'So synchronisierst du Countdowns auf iPhone, iPad, Mac und Apple Watch',
        steps: [
          { name: 'Aktiviere iCloud auf jedem Gerät', text: 'Öffne Einstellungen, tippe auf deinen Namen und dann auf iCloud, und stelle sicher, dass iCloud-Drive aktiviert ist.' },
          { name: 'Melde dich überall mit derselben Apple-ID an', text: 'Nutze auf iPhone, iPad, Mac und Apple Watch dieselbe Apple-ID.' },
          { name: 'Öffne CNDWN auf jedem Gerät', text: 'Installiere CNDWN und öffne es — deine Countdowns erscheinen automatisch, ohne weitere Einrichtung.' },
          { name: 'Mach mit Handoff nahtlos weiter', text: 'Beginne die Bearbeitung eines Countdowns auf deinem iPhone und mach sofort auf iPad oder Mac weiter.' },
        ],
      },
    },
    es: {
      title: 'Cómo sincronizar cuentas atrás en iPhone, iPad, Mac y Apple Watch — CNDWN',
      desc: 'Cómo sincronizar automáticamente tus cuentas atrás en iPhone, iPad, Mac y Apple Watch con CNDWN y tu propia cuenta privada de iCloud.',
      breadcrumbName: 'Sincronizar cuentas atrás entre dispositivos',
      howTo: {
        name: 'Cómo sincronizar cuentas atrás en iPhone, iPad, Mac y Apple Watch',
        steps: [
          { name: 'Activa iCloud en cada dispositivo', text: 'Abre Ajustes, toca tu nombre y luego iCloud, y comprueba que iCloud Drive esté activado.' },
          { name: 'Inicia sesión con el mismo Apple ID en todos lados', text: 'Usa el mismo Apple ID en tu iPhone, iPad, Mac y Apple Watch.' },
          { name: 'Abre CNDWN en cada dispositivo', text: 'Instala CNDWN y ábrelo — tus cuentas atrás aparecen automáticamente, sin configuración adicional.' },
          { name: 'Usa Handoff para continuar donde lo dejaste', text: 'Empieza a editar una cuenta atrás en tu iPhone y continúa al instante en tu iPad o Mac.' },
        ],
      },
    },
  },
  weddingCountdown: {
    en: {
      title: 'Wedding Countdown: How to Count Down to Your Wedding Day — CNDWN',
      desc: 'How to set up a wedding countdown with CNDWN — custom colors, a progress bar from engagement to wedding day, and sharing with your partner and wedding party.',
      breadcrumbName: 'Wedding Countdown',
    },
    de: {
      title: 'Hochzeits-Countdown: So zählst du herunter zu deinem Hochzeitstag — CNDWN',
      desc: 'So richtest du einen Hochzeits-Countdown mit CNDWN ein — eigene Farben, ein Fortschrittsbalken von der Verlobung bis zur Hochzeit und Teilen mit Partner und Hochzeitsgesellschaft.',
      breadcrumbName: 'Hochzeits-Countdown',
    },
    es: {
      title: 'Cuenta atrás de boda: cómo contar los días hasta tu boda — CNDWN',
      desc: 'Cómo configurar una cuenta atrás de boda con CNDWN — colores personalizados, una barra de progreso desde el compromiso hasta la boda, y compartirla con tu pareja y cortejo nupcial.',
      breadcrumbName: 'Cuenta atrás de boda',
    },
  },
  home: {
    en: {
      title: 'Schillan — Indie Apple App Developer (Alexandra Schillhahn) — CNDWN & TerraGuessr',
      desc: 'Schillan is the one-person studio of Alexandra Schillhahn, building privacy-first apps for iPhone, iPad, Mac and Apple Watch. Maker of CNDWN, a free countdown & countup app, and TerraGuessr, a real-world geography guessing game. No ads, no trackers.',
      ogTitle: 'Schillan — Indie Apple App Developer (Alexandra Schillhahn)',
      ogDesc: 'Privacy-first apps for iPhone, iPad, Mac and Apple Watch, built by one person. Maker of CNDWN and TerraGuessr. No ads, no trackers.',
    },
    de: {
      title: 'Schillan — Indie Apple-App-Entwicklerin (Alexandra Schillhahn) — CNDWN & TerraGuessr',
      desc: 'Schillan ist das Ein-Personen-Studio von Alexandra Schillhahn und entwickelt datenschutzfreundliche Apps für iPhone, iPad, Mac und Apple Watch. Macherin von CNDWN, einer kostenlosen Countdown- & Countup-App, und TerraGuessr, einem Geografie-Ratespiel mit echten Orten. Keine Werbung, keine Tracker.',
      ogTitle: 'Schillan — Indie Apple-App-Entwicklerin (Alexandra Schillhahn)',
      ogDesc: 'Datenschutzfreundliche Apps für iPhone, iPad, Mac und Apple Watch, entwickelt von einer Person. Macherin von CNDWN und TerraGuessr. Keine Werbung, keine Tracker.',
    },
    es: {
      title: 'Schillan — Desarrolladora indie de apps para Apple (Alexandra Schillhahn) — CNDWN y TerraGuessr',
      desc: 'Schillan es el estudio de una sola persona de Alexandra Schillhahn, que crea apps centradas en la privacidad para iPhone, iPad, Mac y Apple Watch. Creadora de CNDWN, una app gratuita de cuenta atrás y adelante, y de TerraGuessr, un juego de adivinanza geográfica con lugares reales. Sin anuncios, sin rastreadores.',
      ogTitle: 'Schillan — Desarrolladora indie de apps para Apple (Alexandra Schillhahn)',
      ogDesc: 'Apps centradas en la privacidad para iPhone, iPad, Mac y Apple Watch, creadas por una sola persona. Creadora de CNDWN y TerraGuessr. Sin anuncios, sin rastreadores.',
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

function langSwitchScript(storageKey) {
  return `
<script>
(function () {
  var KEY = '${storageKey}';
  var sw = document.querySelector('.lang-switch');
  if (!sw) return;

  document.addEventListener('click', function (e) {
    if (sw.open && !sw.contains(e.target)) sw.open = false;
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') sw.open = false;
  });
  sw.querySelectorAll('.lang-menu a[data-lang]').forEach(function (a) {
    a.addEventListener('click', function () {
      try { localStorage.setItem(KEY, a.getAttribute('data-lang')); } catch (e) {}
    });
  });

  var saved;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved) return;

  var nav = ((navigator.language || 'en') + '').toLowerCase();
  var detected = nav.indexOf('de') === 0 ? 'de' : (nav.indexOf('es') === 0 ? 'es' : 'en');
  try { localStorage.setItem(KEY, detected); } catch (e) {}
  if (detected === document.documentElement.lang) return;

  var target = sw.querySelector('.lang-menu a[data-lang="' + detected + '"]');
  if (target) location.replace(target.getAttribute('href'));
})();
</script>`;
}

const TEMPLATE_FILES = {
  landing: 'landing.html',
  privacy: 'privacy.html',
  bestApp: 'best-countdown-app.html',
  widgetGuide: 'countdown-widget-ios.html',
  widgetHowTo: 'how-to-add-countdown-widget.html',
  liveActivities: 'countdown-live-activities.html',
  vacationCountdown: 'vacation-countdown.html',
  icloudSync: 'countdown-icloud-sync.html',
  weddingCountdown: 'wedding-countdown.html',
  home: 'home.html',
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

  // 6. language switcher dropdown (real links) — built AFTER link rewrites so
  //    its absolute /cndwn/… targets are not themselves rewritten
  const menuLinks = LANGS.map(l =>
    `<a href="${targets[l]}" data-lang="${l}"${l === lang ? ' class="active" aria-current="page"' : ''}>${AUTONYM[l]}</a>`
  ).join('\n          ');
  $('.lang-switch').html(
    `\n        <summary aria-label="Change language"><span data-lang-label>${lang.toUpperCase()}</span></summary>\n` +
    `        <div class="lang-menu">\n          ${menuLinks}\n        </div>\n      `
  );

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

  // 9. language-switch behavior: closes the dropdown on outside click/Escape,
  //    remembers an explicit pick, and — on a first visit with no stored
  //    preference — redirects once to the language matching the device.
  if ($('.lang-switch').length) $('body').append(langSwitchScript(STORAGE_KEY[type] || DEFAULT_STORAGE_KEY));

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
    } else if (data['@type'] === 'Organization' && type === 'home') {
      data.url = SITE + '/';
    } else if (data['@type'] === 'WebSite' && type === 'home') {
      data.url = canonical;
      data.inLanguage = lang;
    } else if (data['@type'] === 'ItemList' && type === 'home') {
      data.itemListElement = [
        {
          '@type': 'ListItem', position: 1,
          item: { '@type': 'SoftwareApplication', name: 'CNDWN', url: SITE + landingPath[lang], applicationCategory: 'LifestyleApplication' },
        },
        {
          '@type': 'ListItem', position: 2,
          item: { '@type': 'SoftwareApplication', name: 'TerraGuessr', url: SITE + '/terraguessr/', applicationCategory: 'GameApplication' },
        },
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
  ['bestApp', 'en', 'cndwn/best-countdown-app-iphone/index.html'],
  ['bestApp', 'de', 'cndwn/de/best-countdown-app-iphone/index.html'],
  ['bestApp', 'es', 'cndwn/es/best-countdown-app-iphone/index.html'],
  ['widgetGuide', 'en', 'cndwn/countdown-widget-ios/index.html'],
  ['widgetGuide', 'de', 'cndwn/de/countdown-widget-ios/index.html'],
  ['widgetGuide', 'es', 'cndwn/es/countdown-widget-ios/index.html'],
  ['widgetHowTo', 'en', 'cndwn/how-to-add-countdown-widget/index.html'],
  ['widgetHowTo', 'de', 'cndwn/de/how-to-add-countdown-widget/index.html'],
  ['widgetHowTo', 'es', 'cndwn/es/how-to-add-countdown-widget/index.html'],
  ['liveActivities', 'en', 'cndwn/countdown-live-activities/index.html'],
  ['liveActivities', 'de', 'cndwn/de/countdown-live-activities/index.html'],
  ['liveActivities', 'es', 'cndwn/es/countdown-live-activities/index.html'],
  ['vacationCountdown', 'en', 'cndwn/vacation-countdown/index.html'],
  ['vacationCountdown', 'de', 'cndwn/de/vacation-countdown/index.html'],
  ['vacationCountdown', 'es', 'cndwn/es/vacation-countdown/index.html'],
  ['icloudSync', 'en', 'cndwn/countdown-icloud-sync/index.html'],
  ['icloudSync', 'de', 'cndwn/de/countdown-icloud-sync/index.html'],
  ['icloudSync', 'es', 'cndwn/es/countdown-icloud-sync/index.html'],
  ['weddingCountdown', 'en', 'cndwn/wedding-countdown/index.html'],
  ['weddingCountdown', 'de', 'cndwn/de/wedding-countdown/index.html'],
  ['weddingCountdown', 'es', 'cndwn/es/wedding-countdown/index.html'],
  ['home', 'en', 'index.html'],
  ['home', 'de', 'de/index.html'],
  ['home', 'es', 'es/index.html'],
];

for (const [type, lang, out] of OUTPUTS) {
  const html = build(type, lang);
  const dest = path.join(ROOT, out);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html, 'utf8');
  console.log(`✓ ${out}  (${type}/${lang})`);
}
console.log(`Done. Regenerated ${OUTPUTS.length} pages from tools/templates/.`);
