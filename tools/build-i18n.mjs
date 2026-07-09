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
const LANGS = ['en', 'de', 'es', 'fr', 'ja', 'it'];
const OG_LOCALE = { en: 'en_US', de: 'de_DE', es: 'es_ES', fr: 'fr_FR', ja: 'ja_JP', it: 'it_IT' };
const AUTONYM = { en: 'English', de: 'Deutsch', es: 'Español', fr: 'Français', ja: '日本語', it: 'Italiano' };
// The homepage and the CNDWN section are separate products sharing one
// domain, so each remembers its own language preference.
const STORAGE_KEY = { home: 'schillan-lang' };
const DEFAULT_STORAGE_KEY = 'cndwn-lang';

const landingPath = { en: '/cndwn/', de: '/cndwn/de/', es: '/cndwn/es/', fr: '/cndwn/fr/', ja: '/cndwn/ja/', it: '/cndwn/it/' };
const privacyPath = { en: '/cndwn/privacy/', de: '/cndwn/de/privacy/', es: '/cndwn/es/privacy/', fr: '/cndwn/fr/privacy/', ja: '/cndwn/ja/privacy/', it: '/cndwn/it/privacy/' };
const bestAppPath = { en: '/cndwn/best-countdown-app-iphone/', de: '/cndwn/de/best-countdown-app-iphone/', es: '/cndwn/es/best-countdown-app-iphone/', fr: '/cndwn/fr/best-countdown-app-iphone/', ja: '/cndwn/ja/best-countdown-app-iphone/', it: '/cndwn/it/best-countdown-app-iphone/' };
const widgetGuidePath = { en: '/cndwn/countdown-widget-ios/', de: '/cndwn/de/countdown-widget-ios/', es: '/cndwn/es/countdown-widget-ios/', fr: '/cndwn/fr/countdown-widget-ios/', ja: '/cndwn/ja/countdown-widget-ios/', it: '/cndwn/it/countdown-widget-ios/' };
const widgetHowToPath = { en: '/cndwn/how-to-add-countdown-widget/', de: '/cndwn/de/how-to-add-countdown-widget/', es: '/cndwn/es/how-to-add-countdown-widget/', fr: '/cndwn/fr/how-to-add-countdown-widget/', ja: '/cndwn/ja/how-to-add-countdown-widget/', it: '/cndwn/it/how-to-add-countdown-widget/' };
const liveActivitiesPath = { en: '/cndwn/countdown-live-activities/', de: '/cndwn/de/countdown-live-activities/', es: '/cndwn/es/countdown-live-activities/', fr: '/cndwn/fr/countdown-live-activities/', ja: '/cndwn/ja/countdown-live-activities/', it: '/cndwn/it/countdown-live-activities/' };
const vacationCountdownPath = { en: '/cndwn/vacation-countdown/', de: '/cndwn/de/vacation-countdown/', es: '/cndwn/es/vacation-countdown/', fr: '/cndwn/fr/vacation-countdown/', ja: '/cndwn/ja/vacation-countdown/', it: '/cndwn/it/vacation-countdown/' };
const icloudSyncPath = { en: '/cndwn/countdown-icloud-sync/', de: '/cndwn/de/countdown-icloud-sync/', es: '/cndwn/es/countdown-icloud-sync/', fr: '/cndwn/fr/countdown-icloud-sync/', ja: '/cndwn/ja/countdown-icloud-sync/', it: '/cndwn/it/countdown-icloud-sync/' };
const weddingCountdownPath = { en: '/cndwn/wedding-countdown/', de: '/cndwn/de/wedding-countdown/', es: '/cndwn/es/wedding-countdown/', fr: '/cndwn/fr/wedding-countdown/', ja: '/cndwn/ja/wedding-countdown/', it: '/cndwn/it/wedding-countdown/' };
const homePath = { en: '/', de: '/de/', es: '/es/', fr: '/fr/', ja: '/ja/', it: '/it/' };
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
    fr: {
      title: "CNDWN — Belle app de compte à rebours et compteur de jours pour iPhone, iPad, Mac et Apple Watch",
      desc: "CNDWN est une application de compte à rebours et de compteur de jours respectueuse de la vie privée pour les appareils Apple. Compte à rebours vers anniversaires, vacances, voyages et échéances avec barres de progression, widgets d'écran d'accueil, d'écran verrouillé et StandBy, Activités en direct, synchronisation iCloud, couleurs personnalisées, import Calendrier et Rappels, et partage. La première app de compte à rebours dont toutes les fonctions sont gratuites. Aucune publicité, aucun tracker.",
      ogTitle: "CNDWN — Belle app de compte à rebours pour appareils Apple",
      ogDesc: "Compte à rebours (et compteur de jours) vers ce qui compte, avec barres de progression, superbes widgets, Activités en direct, synchronisation iCloud et confidentialité totale. Pour iPhone, iPad, Mac et Apple Watch. Toutes les fonctions gratuites.",
      breadcrumbPrivacy: "Politique de confidentialité",
      howTo: {
        name: "Comment créer un compte à rebours dans CNDWN",
        steps: [
          { name: "Ajoutez un événement", text: "Saisissez un titre et choisissez une date, ou importez un événement directement depuis Calendrier ou Rappels." },
          { name: "Personnalisez-le", text: "Ajoutez un emoji, choisissez une couleur personnalisée et optez pour un compte à rebours, un compteur de jours ou une barre de progression." },
          { name: "Regardez-le défiler", text: "Épinglez un widget sur votre écran d'accueil ou verrouillé et regardez chaque jour défiler — même dans la Dynamic Island." },
        ],
      },
    },
    ja: {
      title: "CNDWN — iPhone・iPad・Mac・Apple Watch対応の美しいカウントダウン&カウントアップアプリ",
      desc: "CNDWNはApple製デバイス向けのプライバシー重視のカウントダウン&カウントアップアプリです。誕生日、休日、旅行、締め切りまでの日数を、プログレスバー、ホーム画面・ロック画面・StandByウィジェット、ライブアクティビティ、iCloud同期、カスタムカラー、カレンダー&リマインダーのインポート、共有機能とともにカウントダウン。すべての機能が無料の初めてのカウントダウンアプリ。広告なし、トラッキングなし。",
      ogTitle: "CNDWN — Apple製デバイス向けの美しいカウントダウンアプリ",
      ogDesc: "プログレスバー、美しいウィジェット、ライブアクティビティ、iCloud同期、完全なプライバシーで大切な瞬間までカウントダウン(&カウントアップ)。iPhone・iPad・Mac・Apple Watch対応。すべての機能が無料。",
      breadcrumbPrivacy: "プライバシーポリシー",
      howTo: {
        name: "CNDWNでカウントダウンを作成する方法",
        steps: [
          { name: "イベントを追加", text: "タイトルを入力して日付を選ぶか、カレンダーやリマインダーからイベントを直接インポートします。" },
          { name: "自分好みにカスタマイズ", text: "絵文字を追加し、好きな色を選んで、カウントダウン、カウントアップ、プログレスバーから選択します。" },
          { name: "カウントを見守る", text: "ウィジェットをホーム画面やロック画面に配置すれば、Dynamic Islandでも毎日のカウントを確認できます。" },
        ],
      },
    },
    it: {
      title: "CNDWN — Bella app di conto alla rovescia e conteggio giorni per iPhone, iPad, Mac e Apple Watch",
      desc: "CNDWN è un'app di conto alla rovescia e conteggio giorni orientata alla privacy per i dispositivi Apple. Conto alla rovescia per compleanni, vacanze, viaggi e scadenze con barre di progresso, widget per schermata Home, Blocco e StandBy, Attività Live, sincronizzazione iCloud, colori personalizzati, importazione da Calendario e Promemoria, e condivisione. La prima app di conto alla rovescia con tutte le funzioni gratuite. Nessuna pubblicità, nessun tracciamento.",
      ogTitle: "CNDWN — Bella app di conto alla rovescia per dispositivi Apple",
      ogDesc: "Conto alla rovescia (e in avanti) verso ciò che conta, con barre di progresso, widget bellissimi, Attività Live, sincronizzazione iCloud e privacy totale. Per iPhone, iPad, Mac e Apple Watch. Tutte le funzioni gratuite.",
      breadcrumbPrivacy: "Informativa sulla privacy",
      howTo: {
        name: "Come creare un conto alla rovescia in CNDWN",
        steps: [
          { name: "Aggiungi un evento", text: "Scrivi un titolo e scegli una data, oppure importa un evento direttamente da Calendario o Promemoria." },
          { name: "Personalizzalo", text: "Aggiungi un'emoji, scegli un colore personalizzato e opta per conto alla rovescia, conteggio giorni o barra di progresso." },
          { name: "Guardalo scorrere", text: "Fissa un widget sulla schermata Home o di Blocco e guarda ogni giorno passare — anche nella Dynamic Island." },
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
    fr: {
      title: "CNDWN — Politique de confidentialité",
      desc: "Politique de confidentialité de l'application de compte à rebours CNDWN (RGPD). Aucune publicité, aucun tracker — vos comptes à rebours restent sur votre appareil et dans votre propre iCloud.",
    },
    ja: {
      title: "CNDWN — プライバシーポリシー",
      desc: "カウントダウンアプリCNDWNのプライバシーポリシー(GDPR準拠)。広告なし、トラッキングなし — あなたのカウントダウンはあなたの端末とあなた自身のiCloudの中だけに留まります。",
    },
    it: {
      title: "CNDWN — Informativa sulla privacy",
      desc: "Informativa sulla privacy dell'app di conto alla rovescia CNDWN (GDPR). Nessuna pubblicità, nessun tracciamento: i tuoi conti alla rovescia restano sul tuo dispositivo e nel tuo iCloud personale.",
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
    fr: {
      title: "Meilleure app de compte à rebours gratuite pour iPhone (Guide 2026) — CNDWN",
      desc: "Vous cherchez la meilleure app de compte à rebours pour iPhone ? Voici les critères à surveiller — confidentialité, widgets, Activités en direct, synchronisation iCloud — et pourquoi CNDWN offre toutes ses fonctions gratuitement, sans publicité ni tracker.",
      breadcrumbName: "Meilleure app de compte à rebours pour iPhone",
    },
    ja: {
      title: "iPhone向けの最高の無料カウントダウンアプリ(2026年版ガイド)— CNDWN",
      desc: "iPhone向けの最高のカウントダウンアプリをお探しですか?プライバシー、ウィジェット、ライブアクティビティ、iCloud同期など注目すべきポイントと、CNDWNがすべての機能を無料で、広告もトラッキングもなしで提供している理由を解説します。",
      breadcrumbName: "iPhone向け最高のカウントダウンアプリ",
    },
    it: {
      title: "La migliore app di conto alla rovescia gratuita per iPhone (Guida 2026) — CNDWN",
      desc: "Cerchi la migliore app di conto alla rovescia per iPhone? Ecco cosa cercare — privacy, widget, Attività Live, sincronizzazione iCloud — e perché CNDWN offre tutte le funzioni gratis, senza pubblicità né tracciamento.",
      breadcrumbName: "Migliore app di conto alla rovescia per iPhone",
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
    fr: {
      title: "Widgets de compte à rebours pour iPhone : écran d'accueil, verrouillé et StandBy — CNDWN",
      desc: "Un guide des widgets de compte à rebours sous iOS : widgets d'écran d'accueil, d'écran verrouillé et StandBy, Activités en direct et Dynamic Island — et comment en configurer un avec CNDWN, une app de compte à rebours gratuite pour iPhone.",
      breadcrumbName: "Widgets de compte à rebours pour iOS",
    },
    ja: {
      title: "iPhoneのカウントダウンウィジェット:ホーム画面・ロック画面・StandByガイド — CNDWN",
      desc: "iOSのカウントダウンウィジェットガイド:ホーム画面、ロック画面、StandByウィジェット、ライブアクティビティ、Dynamic Islandについて解説し、無料カウントダウンアプリCNDWNでの設定方法を紹介します。",
      breadcrumbName: "iOS向けカウントダウンウィジェット",
    },
    it: {
      title: "Widget conto alla rovescia per iPhone: schermata Home, Blocco e StandBy — CNDWN",
      desc: "Una guida ai widget di conto alla rovescia su iOS: widget per schermata Home, Blocco e StandBy, Attività Live e Dynamic Island — e come configurarne uno con CNDWN, un'app di conto alla rovescia gratuita per iPhone.",
      breadcrumbName: "Widget di conto alla rovescia per iOS",
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
    fr: {
      title: "Comment ajouter un widget de compte à rebours sur iPhone (étape par étape) — CNDWN",
      desc: "Un guide simple, étape par étape, pour ajouter un widget de compte à rebours à l'écran d'accueil, à l'écran verrouillé ou à StandBy de votre iPhone avec CNDWN — six étapes, aucune compétence technique requise.",
      breadcrumbName: "Comment ajouter un widget de compte à rebours",
      howTo: {
        name: "Comment ajouter un widget de compte à rebours sur iPhone",
        steps: [
          { name: "Téléchargez CNDWN", text: "Obtenez CNDWN gratuitement sur l'App Store et ouvrez-le." },
          { name: "Créez un compte à rebours", text: "Appuyez sur +, ajoutez un titre et choisissez une date — ou importez un événement directement depuis Calendrier ou Rappels." },
          { name: "Appuyez longuement sur votre écran d'accueil", text: "Touchez et maintenez une zone vide de votre écran d'accueil jusqu'à ce que les icônes se mettent à trembler." },
          { name: "Appuyez sur le bouton +", text: "Appuyez sur le + dans le coin supérieur pour ouvrir la galerie de widgets." },
          { name: "Recherchez CNDWN", text: "Tapez « CNDWN » dans la barre de recherche et sélectionnez-le parmi les résultats." },
          { name: "Choisissez une taille et ajoutez-le", text: "Faites glisser pour choisir petit, moyen ou grand, puis appuyez sur Ajouter le widget. Appuyez sur Terminé." },
        ],
      },
    },
    ja: {
      title: "iPhoneでカウントダウンウィジェットを追加する方法(手順解説) — CNDWN",
      desc: "CNDWNを使ってiPhoneのホーム画面、ロック画面、StandByにカウントダウンウィジェットを追加する簡単な手順ガイド — 6ステップ、専門知識は不要です。",
      breadcrumbName: "カウントダウンウィジェットの追加方法",
      howTo: {
        name: "iPhoneでカウントダウンウィジェットを追加する方法",
        steps: [
          { name: "CNDWNをダウンロード", text: "App StoreからCNDWNを無料で入手して開きます。" },
          { name: "カウントダウンを作成", text: "+をタップしてタイトルを入力し、日付を選択します — またはカレンダーやリマインダーからイベントを直接インポートします。" },
          { name: "ホーム画面を長押し", text: "アイコンが揺れ始めるまで、ホーム画面の空いている場所を長押しします。" },
          { name: "+ボタンをタップ", text: "画面上部の+をタップしてウィジェットギャラリーを開きます。" },
          { name: "CNDWNを検索", text: "検索バーに「CNDWN」と入力し、結果から選択します。" },
          { name: "サイズを選んで追加", text: "スワイプして小・中・大から選び、ウィジェットを追加をタップします。最後に完了をタップします。" },
        ],
      },
    },
    it: {
      title: "Come aggiungere un widget di conto alla rovescia su iPhone (passo dopo passo) — CNDWN",
      desc: "Una semplice guida passo dopo passo per aggiungere un widget di conto alla rovescia alla schermata Home, Blocco o StandBy del tuo iPhone con CNDWN — sei passaggi, nessuna competenza tecnica richiesta.",
      breadcrumbName: "Come aggiungere un widget di conto alla rovescia",
      howTo: {
        name: "Come aggiungere un widget di conto alla rovescia su iPhone",
        steps: [
          { name: "Scarica CNDWN", text: "Ottieni CNDWN gratis dall'App Store e aprilo." },
          { name: "Crea un conto alla rovescia", text: "Tocca +, aggiungi un titolo e scegli una data — oppure importa un evento direttamente da Calendario o Promemoria." },
          { name: "Tieni premuto sulla schermata Home", text: "Tocca e tieni premuta un'area vuota della schermata Home finché le icone non iniziano a tremolare." },
          { name: "Tocca il pulsante +", text: "Tocca il + nell'angolo superiore per aprire la galleria dei widget." },
          { name: "Cerca CNDWN", text: "Digita \"CNDWN\" nella barra di ricerca e selezionalo tra i risultati." },
          { name: "Scegli una dimensione e aggiungilo", text: "Scorri per scegliere piccolo, medio o grande, poi tocca Aggiungi widget. Tocca Fine." },
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
    fr: {
      title: "Comment ajouter une Activité en direct de compte à rebours sur iPhone — CNDWN",
      desc: "Comment activer les Activités en direct et démarrer un compte à rebours en temps réel sur l'écran verrouillé et la Dynamic Island de votre iPhone avec CNDWN.",
      breadcrumbName: "Activités en direct de compte à rebours",
      howTo: {
        name: "Comment ajouter une Activité en direct de compte à rebours sur iPhone",
        steps: [
          { name: "Vérifiez votre version d'iOS", text: "Assurez-vous que votre iPhone utilise iOS 16.1 ou une version ultérieure — c'est nécessaire pour les Activités en direct." },
          { name: "Activez les Activités en direct pour CNDWN", text: "Ouvrez Réglages, faites défiler jusqu'à CNDWN et vérifiez que les Activités en direct sont activées." },
          { name: "Ouvrez un compte à rebours dans CNDWN", text: "Ouvrez l'app et sélectionnez le compte à rebours que vous voulez suivre en direct." },
          { name: "Démarrez l'Activité en direct", text: "Appuyez sur Démarrer l'Activité en direct sur le compte à rebours. Elle apparaît aussitôt." },
          { name: "Verrouillez votre téléphone pour la voir", text: "Verrouillez votre iPhone pour voir le compte à rebours en direct sur l'écran verrouillé, et dans la Dynamic Island si votre modèle en dispose." },
        ],
      },
    },
    ja: {
      title: "iPhoneでカウントダウンのライブアクティビティを追加する方法 — CNDWN",
      desc: "CNDWNを使ってライブアクティビティをオンにし、iPhoneのロック画面とDynamic Islandでリアルタイムのカウントダウンを開始する方法。",
      breadcrumbName: "カウントダウンのライブアクティビティ",
      howTo: {
        name: "iPhoneでカウントダウンのライブアクティビティを追加する方法",
        steps: [
          { name: "iOSのバージョンを確認", text: "iPhoneがiOS 16.1以降であることを確認してください — ライブアクティビティにはこれが必要です。" },
          { name: "CNDWNのライブアクティビティをオンにする", text: "設定を開き、CNDWNまでスクロールして、ライブアクティビティがオンになっていることを確認します。" },
          { name: "CNDWNでカウントダウンを開く", text: "アプリを開き、ライブで追跡したいカウントダウンを選択します。" },
          { name: "ライブアクティビティを開始", text: "カウントダウン画面で「ライブアクティビティを開始」をタップします。すぐに表示されます。" },
          { name: "画面をロックして確認", text: "iPhoneをロックすると、ロック画面でライブカウントダウンを確認できます。対応機種ではDynamic Islandでも表示されます。" },
        ],
      },
    },
    it: {
      title: "Come aggiungere un'Attività Live di conto alla rovescia su iPhone — CNDWN",
      desc: "Come attivare le Attività Live e avviare un conto alla rovescia in tempo reale sulla schermata di Blocco e nella Dynamic Island del tuo iPhone con CNDWN.",
      breadcrumbName: "Attività Live di conto alla rovescia",
      howTo: {
        name: "Come aggiungere un'Attività Live di conto alla rovescia su iPhone",
        steps: [
          { name: "Controlla la versione di iOS", text: "Assicurati che il tuo iPhone abbia iOS 16.1 o versioni successive — è richiesto per le Attività Live." },
          { name: "Attiva le Attività Live per CNDWN", text: "Apri Impostazioni, scorri fino a CNDWN e verifica che le Attività Live siano attivate." },
          { name: "Apri un conto alla rovescia in CNDWN", text: "Apri l'app e seleziona il conto alla rovescia che vuoi seguire in tempo reale." },
          { name: "Avvia l'Attività Live", text: "Tocca Avvia Attività Live sul conto alla rovescia. Comparirà subito." },
          { name: "Blocca il telefono per vederla", text: "Blocca il tuo iPhone per vedere il conto alla rovescia live sulla schermata di Blocco, e nella Dynamic Island se il tuo modello ce l'ha." },
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
    fr: {
      title: "Compte à rebours de vacances et de voyage : comptez les jours avant votre prochain départ — CNDWN",
      desc: "Comment configurer un compte à rebours de vacances ou de voyage avec CNDWN — ajoutez votre date de départ, épinglez un widget et partagez-le avec vos compagnons de voyage.",
      breadcrumbName: "Compte à rebours de vacances et de voyage",
    },
    ja: {
      title: "旅行・休暇カウントダウン:次の旅行までの日数を数える — CNDWN",
      desc: "CNDWNで旅行や休暇のカウントダウンを設定する方法 — 出発日を追加し、ウィジェットを配置して、旅の仲間と共有しましょう。",
      breadcrumbName: "旅行・休暇カウントダウン",
    },
    it: {
      title: "Conto alla rovescia per vacanze e viaggi: i giorni che mancano al tuo prossimo viaggio — CNDWN",
      desc: "Come impostare un conto alla rovescia per vacanze o viaggi con CNDWN — aggiungi la data di partenza, fissa un widget e condividilo con i tuoi compagni di viaggio.",
      breadcrumbName: "Conto alla rovescia per vacanze e viaggi",
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
    fr: {
      title: "Comment synchroniser vos comptes à rebours sur iPhone, iPad, Mac et Apple Watch — CNDWN",
      desc: "Comment synchroniser automatiquement vos comptes à rebours sur iPhone, iPad, Mac et Apple Watch avec CNDWN et votre propre compte iCloud privé.",
      breadcrumbName: "Synchroniser les comptes à rebours entre appareils",
      howTo: {
        name: "Comment synchroniser des comptes à rebours sur iPhone, iPad, Mac et Apple Watch",
        steps: [
          { name: "Activez iCloud sur chaque appareil", text: "Ouvrez Réglages, appuyez sur votre nom, puis iCloud, et assurez-vous qu'iCloud Drive est activé." },
          { name: "Connectez-vous avec le même identifiant Apple partout", text: "Utilisez le même identifiant Apple sur votre iPhone, iPad, Mac et Apple Watch." },
          { name: "Ouvrez CNDWN sur chaque appareil", text: "Installez CNDWN et ouvrez-le — vos comptes à rebours apparaissent automatiquement, sans configuration." },
          { name: "Utilisez Handoff pour reprendre là où vous en étiez", text: "Commencez à modifier un compte à rebours sur votre iPhone et continuez instantanément sur votre iPad ou Mac." },
        ],
      },
    },
    ja: {
      title: "iPhone・iPad・Mac・Apple Watchでカウントダウンを同期する方法 — CNDWN",
      desc: "CNDWNとあなた自身のプライベートなiCloudアカウントを使って、iPhone、iPad、Mac、Apple Watch間でカウントダウンを自動的に同期する方法。",
      breadcrumbName: "デバイス間でカウントダウンを同期",
      howTo: {
        name: "iPhone、iPad、Mac、Apple Watchでカウントダウンを同期する方法",
        steps: [
          { name: "各デバイスでiCloudをオンにする", text: "設定を開き、自分の名前をタップしてからiCloudをタップし、iCloud Driveがオンになっていることを確認します。" },
          { name: "すべてのデバイスで同じApple IDでサインイン", text: "iPhone、iPad、Mac、Apple Watchで同じApple IDを使用します。" },
          { name: "各デバイスでCNDWNを開く", text: "CNDWNをインストールして開くと、カウントダウンが自動的に表示されます。設定は不要です。" },
          { name: "Handoffで続きから再開", text: "iPhoneでカウントダウンの編集を始めれば、iPadやMacですぐに続きを編集できます。" },
        ],
      },
    },
    it: {
      title: "Come sincronizzare i conti alla rovescia su iPhone, iPad, Mac e Apple Watch — CNDWN",
      desc: "Come sincronizzare automaticamente i tuoi conti alla rovescia su iPhone, iPad, Mac e Apple Watch con CNDWN e il tuo account iCloud personale.",
      breadcrumbName: "Sincronizzare i conti alla rovescia tra dispositivi",
      howTo: {
        name: "Come sincronizzare i conti alla rovescia su iPhone, iPad, Mac e Apple Watch",
        steps: [
          { name: "Attiva iCloud su ogni dispositivo", text: "Apri Impostazioni, tocca il tuo nome, poi iCloud, e assicurati che iCloud Drive sia attivato." },
          { name: "Accedi con lo stesso Apple ID ovunque", text: "Usa lo stesso Apple ID su iPhone, iPad, Mac e Apple Watch." },
          { name: "Apri CNDWN su ogni dispositivo", text: "Installa CNDWN e aprilo — i tuoi conti alla rovescia compaiono automaticamente, senza configurazione." },
          { name: "Usa Handoff per riprendere da dove eri rimasto", text: "Inizia a modificare un conto alla rovescia sul tuo iPhone e continua subito su iPad o Mac." },
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
    fr: {
      title: "Compte à rebours de mariage : comment compter les jours avant le grand jour — CNDWN",
      desc: "Comment configurer un compte à rebours de mariage avec CNDWN — couleurs personnalisées, barre de progression des fiançailles au mariage, et partage avec votre partenaire et vos témoins.",
      breadcrumbName: "Compte à rebours de mariage",
    },
    ja: {
      title: "結婚式カウントダウン:結婚式当日までの日数を数える方法 — CNDWN",
      desc: "CNDWNで結婚式のカウントダウンを設定する方法 — カスタムカラー、婚約から結婚式までのプログレスバー、パートナーや友人との共有機能。",
      breadcrumbName: "結婚式カウントダウン",
    },
    it: {
      title: "Conto alla rovescia per il matrimonio: come contare i giorni al grande giorno — CNDWN",
      desc: "Come impostare un conto alla rovescia per il matrimonio con CNDWN — colori personalizzati, una barra di progresso dal fidanzamento al matrimonio, e condivisione con il partner e il corteo nuziale.",
      breadcrumbName: "Conto alla rovescia per il matrimonio",
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
    fr: {
      title: "Schillan — Développeuse indépendante d'apps Apple (Alexandra Schillhahn) — CNDWN & TerraGuessr",
      desc: "Schillan est le studio d'une seule personne, Alexandra Schillhahn, qui conçoit des applications respectueuses de la vie privée pour iPhone, iPad, Mac et Apple Watch. Créatrice de CNDWN, une app gratuite de compte à rebours, et de TerraGuessr, un jeu de géographie grandeur nature. Aucune publicité, aucun tracker.",
      ogTitle: "Schillan — Développeuse indépendante d'apps Apple (Alexandra Schillhahn)",
      ogDesc: "Des applications respectueuses de la vie privée pour iPhone, iPad, Mac et Apple Watch, conçues par une seule personne. Créatrice de CNDWN et TerraGuessr. Aucune publicité, aucun tracker.",
    },
    ja: {
      title: "Schillan — インディーApple開発者(Alexandra Schillhahn)— CNDWN & TerraGuessr",
      desc: "SchillanはAlexandra Schillhahnによる一人スタジオで、iPhone、iPad、Mac、Apple Watch向けのプライバシー重視のアプリを開発しています。無料のカウントダウン&カウントアップアプリ「CNDWN」と、実在の場所を使った地理当てゲーム「TerraGuessr」の開発者。広告なし、トラッキングなし。",
      ogTitle: "Schillan — インディーApple開発者(Alexandra Schillhahn)",
      ogDesc: "一人で開発する、iPhone、iPad、Mac、Apple Watch向けのプライバシー重視のアプリ。CNDWNとTerraGuessrの開発者。広告なし、トラッキングなし。",
    },
    it: {
      title: "Schillan — Sviluppatrice indie di app Apple (Alexandra Schillhahn) — CNDWN e TerraGuessr",
      desc: "Schillan è lo studio individuale di Alexandra Schillhahn, che crea app orientate alla privacy per iPhone, iPad, Mac e Apple Watch. Creatrice di CNDWN, un'app gratuita di conto alla rovescia, e di TerraGuessr, un gioco di geografia con luoghi reali. Nessuna pubblicità, nessun tracciamento.",
      ogTitle: "Schillan — Sviluppatrice indie di app Apple (Alexandra Schillhahn)",
      ogDesc: "App orientate alla privacy per iPhone, iPad, Mac e Apple Watch, create da una sola persona. Creatrice di CNDWN e TerraGuessr. Nessuna pubblicità, nessun tracciamento.",
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
  var supported = ['de', 'es', 'fr', 'ja', 'it'];
  var detected = 'en';
  for (var i = 0; i < supported.length; i++) {
    if (nav.indexOf(supported[i]) === 0) { detected = supported[i]; break; }
  }
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

// One output per (type, lang): the destination file is always <path>/index.html,
// except the bare-domain home path ('/', '/de/', ...) which maps to <path>index.html.
const OUTPUTS = [];
for (const type of Object.keys(TEMPLATE_FILES)) {
  for (const lang of LANGS) {
    const urlPath = pathFor[type][lang]; // e.g. '/cndwn/fr/privacy/' or '/fr/' or '/'
    const out = urlPath.replace(/^\//, '') + 'index.html';
    OUTPUTS.push([type, lang, out]);
  }
}

for (const [type, lang, out] of OUTPUTS) {
  const html = build(type, lang);
  const dest = path.join(ROOT, out);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html, 'utf8');
  console.log(`✓ ${out}  (${type}/${lang})`);
}
console.log(`Done. Regenerated ${OUTPUTS.length} pages from tools/templates/.`);

// ---- sitemap.xml: generated from the same pathFor/LANGS data so every URL
// cluster always lists a full, reciprocal set of hreflang alternates. ----
const SITEMAP_META = {
  home: { lastmod: '2026-07-08', changefreq: 'monthly', priority: 1.0, prioritySecondary: 0.9, image: 'https://schillan.com/og-image.png' },
  landing: { lastmod: '2026-07-07', changefreq: 'monthly', priority: 0.9, prioritySecondary: 0.8, image: 'https://schillan.com/cndwn/og-image.png' },
  privacy: { lastmod: '2026-06-25', changefreq: 'yearly', priority: 0.5, prioritySecondary: 0.5 },
  bestApp: { lastmod: '2026-07-07', changefreq: 'monthly', priority: 0.8, prioritySecondary: 0.7 },
  widgetGuide: { lastmod: '2026-07-07', changefreq: 'monthly', priority: 0.8, prioritySecondary: 0.7 },
  widgetHowTo: { lastmod: '2026-07-08', changefreq: 'monthly', priority: 0.7, prioritySecondary: 0.6 },
  liveActivities: { lastmod: '2026-07-08', changefreq: 'monthly', priority: 0.7, prioritySecondary: 0.6 },
  vacationCountdown: { lastmod: '2026-07-08', changefreq: 'monthly', priority: 0.6, prioritySecondary: 0.5 },
  icloudSync: { lastmod: '2026-07-08', changefreq: 'monthly', priority: 0.6, prioritySecondary: 0.5 },
  weddingCountdown: { lastmod: '2026-07-08', changefreq: 'monthly', priority: 0.6, prioritySecondary: 0.5 },
};

function sitemapUrlBlock(type, lang) {
  const m = SITEMAP_META[type];
  const loc = absUrl(type, lang);
  const alternates = [...LANGS.map(l => [l, absUrl(type, l)]), ['x-default', absUrl(type, 'en')]]
    .map(([hl, href]) => `    <xhtml:link rel="alternate" hreflang="${hl}" href="${href}"/>`).join('\n');
  const image = m.image ? `\n    <image:image><image:loc>${m.image}</image:loc></image:image>` : '';
  const priority = (lang === 'en' ? m.priority : m.prioritySecondary).toFixed(1);
  return `  <url>\n    <loc>${loc}</loc>\n${alternates}${image}\n    <lastmod>${m.lastmod}</lastmod>\n    <changefreq>${m.changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

const sitemapUrls = [];
for (const type of Object.keys(TEMPLATE_FILES)) {
  for (const lang of LANGS) sitemapUrls.push(sitemapUrlBlock(type, lang));
}
// TerraGuessr is a separate product outside this i18n system — kept as a single static entry.
sitemapUrls.push(
  `  <url>\n    <loc>https://schillan.com/terraguessr/</loc>\n` +
  `    <image:image><image:loc>https://schillan.com/terraguessr/img/app-icon.jpg</image:loc></image:image>\n` +
  `    <lastmod>2026-07-08</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`
);

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
  `        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n` +
  `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n\n` +
  sitemapUrls.join('\n\n') + '\n\n</urlset>\n';

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemapXml, 'utf8');
console.log(`✓ sitemap.xml  (${sitemapUrls.length} urls)`);
