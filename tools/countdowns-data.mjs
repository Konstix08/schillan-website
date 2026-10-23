/*
 * Countdown pages ("How many days until …?"): the occasions per language and
 * every translated string. Rendered by tools/countdown-pages.mjs, which is
 * called from tools/build-i18n.mjs.
 *
 * An occasion listed in several languages gets one page per language, linked
 * with hreflang; a local holiday exists only in its own language.
 *
 * rule:  { fixed: [month, day] }            same date every year
 *        { easter: offsetDays }             relative to Western Easter Sunday
 *        { nth: [month, weekday, n] }       n-th weekday of a month (n = -1: last), weekday 0 = Sunday
 *        { firstAdvent: true }              Sunday between 27 Nov and 3 Dec
 *        { blackFriday: true }              the day after US Thanksgiving
 *        { frMothersDay: true }             last Sunday of May, or 1st of June when that is Pentecost
 *        { season: 0..3 }                   March equinox, June solstice, September equinox, December solstice
 *
 * holiday: true / false = public holiday in the language's country (answered
 * in an FAQ), null = no such question on the page.
 */

export const COUNTRY = {
  en: { tz: 'America/New_York', locale: 'en-US' },
  de: { tz: 'Europe/Berlin', locale: 'de-DE' },
  es: { tz: 'Europe/Madrid', locale: 'es-ES' },
  fr: { tz: 'Europe/Paris', locale: 'fr-FR' },
  ja: { tz: 'Asia/Tokyo', locale: 'ja-JP' },
  it: { tz: 'Europe/Rome', locale: 'it-IT' },
  pt: { tz: 'Europe/Lisbon', locale: 'pt-PT' },
};

const MOTHERS = { en: { nth: [5, 0, 2] }, de: { nth: [5, 0, 2] }, es: { nth: [5, 0, 1] }, fr: { frMothersDay: true }, ja: { nth: [5, 0, 2] }, it: { nth: [5, 0, 2] }, pt: { nth: [5, 0, 1] } };
const FATHERS = { en: { nth: [6, 0, 3] }, de: { easter: 39 }, es: { fixed: [3, 19] }, fr: { nth: [6, 0, 3] }, ja: { nth: [6, 0, 3] }, it: { fixed: [3, 19] }, pt: { fixed: [3, 19] } };

export const EVENTS = [
  // ---------------------------------------------------------------- shared
  {
    id: 'christmas', emoji: '🎄', rule: { fixed: [12, 25] },
    langs: {
      en: { slug: 'days-until-christmas', name: 'Christmas', the: 'Christmas', q: 'How many days until Christmas?', holiday: true,
        about: 'Christmas Day is on 25 December every year. It is a federal holiday in the United States, and for many families the countdown starts the day after Thanksgiving.' },
      de: { slug: 'tage-bis-weihnachten', name: 'Weihnachten', the: 'Weihnachten', q: 'Wie viele Tage bis Weihnachten?', holiday: true,
        about: 'Der erste Weihnachtsfeiertag ist jedes Jahr am 25. Dezember, der zweite am 26. Dezember. Die Bescherung ist in Deutschland meist schon an Heiligabend, dem 24. Dezember.' },
      es: { slug: 'dias-para-navidad', name: 'Navidad', the: 'Navidad', q: '¿Cuántos días faltan para Navidad?', holiday: true,
        about: 'El día de Navidad es el 25 de diciembre de cada año y es festivo nacional. La cena familiar suele ser la víspera, en Nochebuena.' },
      fr: { slug: 'jours-avant-noel', name: 'Noël', the: 'Noël', q: 'Combien de jours avant Noël ?', holiday: true,
        about: "Noël tombe chaque année le 25 décembre, un jour férié en France. Le réveillon se fête la veille au soir, le 24 décembre." },
      ja: { slug: 'days-until-christmas', name: 'クリスマス', the: 'クリスマス', q: 'クリスマスまであと何日?', holiday: false,
        about: 'クリスマスは毎年12月25日です。日本では祝日ではありませんが、前日のクリスマスイブ(12月24日)とあわせて街がにぎわいます。' },
      it: { slug: 'giorni-a-natale', name: 'Natale', the: 'Natale', q: 'Quanti giorni mancano a Natale?', holiday: true,
        about: 'Natale è il 25 dicembre di ogni anno ed è giorno festivo in Italia, così come Santo Stefano il 26 dicembre.' },
      pt: { slug: 'dias-para-o-natal', name: 'Natal', the: 'o Natal', q: 'Quantos dias faltam para o Natal?', holiday: true,
        about: 'O dia de Natal é a 25 de dezembro de cada ano e é feriado nacional. Em Portugal, a Consoada junta a família na noite de 24 de dezembro.' },
    },
  },
  {
    id: 'christmas-eve', emoji: '🎁', rule: { fixed: [12, 24] },
    langs: {
      en: { slug: 'days-until-christmas-eve', name: 'Christmas Eve', the: 'Christmas Eve', q: 'How many days until Christmas Eve?', holiday: false,
        about: 'Christmas Eve is on 24 December, the evening before Christmas Day. Many families open one present, go to a candlelight service or leave cookies out for Santa.' },
      de: { slug: 'tage-bis-heiligabend', name: 'Heiligabend', the: 'Heiligabend', q: 'Wie viele Tage bis Heiligabend?', holiday: false,
        about: 'Heiligabend ist jedes Jahr am 24. Dezember. In Deutschland ist an diesem Abend die Bescherung; Geschäfte schließen meist am frühen Nachmittag.' },
      es: { slug: 'dias-para-nochebuena', name: 'Nochebuena', the: 'Nochebuena', q: '¿Cuántos días faltan para Nochebuena?', holiday: false,
        about: 'Nochebuena es el 24 de diciembre, la noche antes de Navidad, cuando muchas familias se reúnen para la cena más importante del año.' },
      fr: { slug: 'jours-avant-le-reveillon-de-noel', name: 'Réveillon de Noël', the: 'le réveillon de Noël', q: 'Combien de jours avant le réveillon de Noël ?', holiday: false,
        about: "Le réveillon de Noël a lieu le soir du 24 décembre, veille de Noël : c'est souvent le moment du grand repas en famille." },
      ja: { slug: 'days-until-christmas-eve', name: 'クリスマスイブ', the: 'クリスマスイブ', q: 'クリスマスイブまであと何日?', holiday: false,
        about: 'クリスマスイブは毎年12月24日。日本では恋人や家族と過ごす特別な夜として定着しています。' },
      it: { slug: 'giorni-alla-vigilia-di-natale', name: 'Vigilia di Natale', the: 'la Vigilia di Natale', q: 'Quanti giorni mancano alla Vigilia di Natale?', holiday: false,
        about: 'La Vigilia di Natale è il 24 dicembre: in molte famiglie italiane si festeggia con il cenone e si aspetta la mezzanotte.' },
      pt: { slug: 'dias-para-a-vespera-de-natal', name: 'Véspera de Natal', the: 'a Véspera de Natal', q: 'Quantos dias faltam para a Véspera de Natal?', holiday: false,
        about: 'A Véspera de Natal é a 24 de dezembro. É a noite da Consoada, com bacalhau, doces de Natal e, para muitos, a Missa do Galo.' },
    },
  },
  {
    id: 'new-years-eve', emoji: '🎆', rule: { fixed: [12, 31] },
    langs: {
      en: { slug: 'days-until-new-years-eve', name: "New Year's Eve", the: "New Year's Eve", q: "How many days until New Year's Eve?", holiday: false,
        about: "New Year's Eve is on 31 December, the last day of the year. The countdown to midnight ends with fireworks and the Times Square ball drop." },
      de: { slug: 'tage-bis-silvester', name: 'Silvester', the: 'Silvester', q: 'Wie viele Tage bis Silvester?', holiday: false,
        about: 'Silvester ist jedes Jahr am 31. Dezember. Um Mitternacht wird das neue Jahr mit Feuerwerk und Sekt begrüßt.' },
      es: { slug: 'dias-para-nochevieja', name: 'Nochevieja', the: 'Nochevieja', q: '¿Cuántos días faltan para Nochevieja?', holiday: false,
        about: 'Nochevieja es el 31 de diciembre. En España se despide el año comiendo las doce uvas con las campanadas de medianoche.' },
      fr: { slug: 'jours-avant-la-saint-sylvestre', name: 'Saint-Sylvestre', the: 'la Saint-Sylvestre', q: 'Combien de jours avant la Saint-Sylvestre ?', holiday: false,
        about: "La Saint-Sylvestre, le 31 décembre, est le dernier jour de l'année : on fête le réveillon et le passage à la nouvelle année à minuit." },
      ja: { slug: 'days-until-omisoka', name: '大晦日', the: '大晦日', q: '大晦日まであと何日?', holiday: false,
        about: '大晦日は毎年12月31日。年越しそばを食べ、除夜の鐘を聞きながら新しい年を迎えます。' },
      it: { slug: 'giorni-a-san-silvestro', name: 'San Silvestro', the: 'San Silvestro', q: 'Quanti giorni mancano a San Silvestro?', holiday: false,
        about: "San Silvestro è il 31 dicembre, l'ultimo giorno dell'anno: si festeggia con il cenone e il brindisi di mezzanotte." },
      pt: { slug: 'dias-para-a-passagem-de-ano', name: 'Passagem de Ano', the: 'a Passagem de Ano', q: 'Quantos dias faltam para a Passagem de Ano?', holiday: false,
        about: 'A Passagem de Ano é na noite de 31 de dezembro. Em Portugal, comem-se doze passas à meia-noite, uma por cada desejo.' },
    },
  },
  {
    id: 'new-year', emoji: '🥂', rule: { fixed: [1, 1] },
    langs: {
      en: { slug: 'days-until-new-year', name: "New Year's Day", the: "New Year's Day", q: 'How many days until New Year?', holiday: true,
        about: "New Year's Day is on 1 January and is a federal holiday in the United States." },
      de: { slug: 'tage-bis-neujahr', name: 'Neujahr', the: 'Neujahr', q: 'Wie viele Tage bis Neujahr?', holiday: true,
        about: 'Neujahr ist der 1. Januar und in ganz Deutschland ein gesetzlicher Feiertag.' },
      es: { slug: 'dias-para-ano-nuevo', name: 'Año Nuevo', the: 'Año Nuevo', q: '¿Cuántos días faltan para Año Nuevo?', holiday: true,
        about: 'El día de Año Nuevo es el 1 de enero y es festivo nacional en España.' },
      fr: { slug: 'jours-avant-le-nouvel-an', name: 'Nouvel An', the: 'le jour de l\'An', q: 'Combien de jours avant le Nouvel An ?', holiday: true,
        about: "Le jour de l'An, le 1er janvier, ouvre la nouvelle année. C'est un jour férié en France." },
      ja: { slug: 'days-until-new-year', name: '元日', the: '元日', q: 'お正月(元日)まであと何日?', holiday: true,
        about: '元日は1月1日で、国民の祝日です。初詣やおせち料理で新しい年を祝います。' },
      it: { slug: 'giorni-a-capodanno', name: 'Capodanno', the: 'Capodanno', q: 'Quanti giorni mancano a Capodanno?', holiday: true,
        about: "Capodanno è il 1° gennaio, primo giorno dell'anno e giorno festivo in Italia." },
      pt: { slug: 'dias-para-o-ano-novo', name: 'Ano Novo', the: 'o Ano Novo', q: 'Quantos dias faltam para o Ano Novo?', holiday: true,
        about: 'O dia de Ano Novo é a 1 de janeiro e é feriado nacional em Portugal.' },
    },
  },
  {
    id: 'easter', emoji: '🐣', rule: { easter: 0 },
    langs: {
      en: { slug: 'days-until-easter', name: 'Easter', the: 'Easter', q: 'How many days until Easter?', holiday: null,
        about: 'Easter Sunday moves every year: it is the first Sunday after the first full moon on or after 21 March, so it falls between 22 March and 25 April.' },
      de: { slug: 'tage-bis-ostern', name: 'Ostern', the: 'Ostern', q: 'Wie viele Tage bis Ostern?', holiday: null,
        about: 'Ostersonntag ist der erste Sonntag nach dem ersten Frühlingsvollmond und liegt deshalb zwischen dem 22. März und dem 25. April. Karfreitag und Ostermontag sind gesetzliche Feiertage.' },
      es: { slug: 'dias-para-pascua', name: 'Pascua', the: 'el Domingo de Pascua', q: '¿Cuántos días faltan para Pascua?', holiday: null,
        about: 'El Domingo de Pascua cambia cada año: es el primer domingo tras la primera luna llena de primavera, entre el 22 de marzo y el 25 de abril.' },
      fr: { slug: 'jours-avant-paques', name: 'Pâques', the: 'Pâques', q: 'Combien de jours avant Pâques ?', holiday: null,
        about: "Le dimanche de Pâques change chaque année : c'est le premier dimanche après la première pleine lune du printemps. Le lundi de Pâques est férié en France." },
      ja: { slug: 'days-until-easter', name: 'イースター', the: 'イースター', q: 'イースター(復活祭)まであと何日?', holiday: null,
        about: 'イースター(復活祭)は春分の日の後の最初の満月の次の日曜日で、毎年日付が変わります。' },
      it: { slug: 'giorni-a-pasqua', name: 'Pasqua', the: 'Pasqua', q: 'Quanti giorni mancano a Pasqua?', holiday: null,
        about: 'La domenica di Pasqua cambia ogni anno: è la prima domenica dopo il primo plenilunio di primavera. Il lunedì dell\'Angelo (Pasquetta) è festivo.' },
      pt: { slug: 'dias-para-a-pascoa', name: 'Páscoa', the: 'a Páscoa', q: 'Quantos dias faltam para a Páscoa?', holiday: null,
        about: 'O Domingo de Páscoa muda todos os anos: é o primeiro domingo depois da primeira lua cheia da primavera. A Sexta-feira Santa é feriado nacional.' },
    },
  },
  {
    id: 'halloween', emoji: '🎃', rule: { fixed: [10, 31] },
    langs: {
      en: { slug: 'days-until-halloween', name: 'Halloween', the: 'Halloween', q: 'How many days until Halloween?', holiday: false,
        about: 'Halloween is on 31 October every year: costumes, jack-o\'-lanterns and trick-or-treating after dark.' },
      de: { slug: 'tage-bis-halloween', name: 'Halloween', the: 'Halloween', q: 'Wie viele Tage bis Halloween?', holiday: false,
        about: 'Halloween ist jedes Jahr am 31. Oktober. Am selben Tag ist in mehreren Bundesländern Reformationstag, ein gesetzlicher Feiertag.' },
      es: { slug: 'dias-para-halloween', name: 'Halloween', the: 'Halloween', q: '¿Cuántos días faltan para Halloween?', holiday: false,
        about: 'Halloween es el 31 de octubre, la víspera del Día de Todos los Santos, que sí es festivo el 1 de noviembre.' },
      fr: { slug: 'jours-avant-halloween', name: 'Halloween', the: 'Halloween', q: 'Combien de jours avant Halloween ?', holiday: false,
        about: "Halloween a lieu chaque année le 31 octobre, la veille de la Toussaint." },
      ja: { slug: 'days-until-halloween', name: 'ハロウィン', the: 'ハロウィン', q: 'ハロウィンまであと何日?', holiday: false,
        about: 'ハロウィンは毎年10月31日。仮装したり、かぼちゃのお菓子を楽しんだりするイベントです。' },
      it: { slug: 'giorni-ad-halloween', name: 'Halloween', the: 'Halloween', q: 'Quanti giorni mancano ad Halloween?', holiday: false,
        about: 'Halloween è il 31 ottobre, la sera prima di Ognissanti, che invece è festivo il 1° novembre.' },
      pt: { slug: 'dias-para-o-halloween', name: 'Halloween', the: 'o Halloween', q: 'Quantos dias faltam para o Halloween?', holiday: false,
        about: 'O Halloween é a 31 de outubro, véspera do Dia de Todos-os-Santos, que é feriado a 1 de novembro.' },
    },
  },
  {
    id: 'valentines', emoji: '💘', rule: { fixed: [2, 14] },
    langs: {
      en: { slug: 'days-until-valentines-day', name: "Valentine's Day", the: "Valentine's Day", q: "How many days until Valentine's Day?", holiday: false,
        about: "Valentine's Day is on 14 February every year." },
      de: { slug: 'tage-bis-valentinstag', name: 'Valentinstag', the: 'Valentinstag', q: 'Wie viele Tage bis Valentinstag?', holiday: false,
        about: 'Valentinstag ist jedes Jahr am 14. Februar, der Tag der Verliebten.' },
      es: { slug: 'dias-para-san-valentin', name: 'San Valentín', the: 'San Valentín', q: '¿Cuántos días faltan para San Valentín?', holiday: false,
        about: 'San Valentín, el día de los enamorados, es el 14 de febrero de cada año.' },
      fr: { slug: 'jours-avant-la-saint-valentin', name: 'Saint-Valentin', the: 'la Saint-Valentin', q: 'Combien de jours avant la Saint-Valentin ?', holiday: false,
        about: 'La Saint-Valentin, la fête des amoureux, a lieu chaque année le 14 février.' },
      ja: { slug: 'days-until-valentines-day', name: 'バレンタインデー', the: 'バレンタインデー', q: 'バレンタインデーまであと何日?', holiday: false,
        about: 'バレンタインデーは毎年2月14日。日本ではチョコレートを贈る日として知られ、1か月後の3月14日はホワイトデーです。' },
      it: { slug: 'giorni-a-san-valentino', name: 'San Valentino', the: 'San Valentino', q: 'Quanti giorni mancano a San Valentino?', holiday: false,
        about: 'San Valentino, la festa degli innamorati, è il 14 febbraio di ogni anno.' },
      pt: { slug: 'dias-para-o-dia-dos-namorados', name: 'Dia dos Namorados', the: 'o Dia dos Namorados', q: 'Quantos dias faltam para o Dia dos Namorados?', holiday: false,
        about: 'Em Portugal, o Dia dos Namorados (Dia de São Valentim) é a 14 de fevereiro de cada ano.' },
    },
  },
  {
    id: 'mothers-day', emoji: '💐', rule: MOTHERS,
    langs: {
      en: { slug: 'days-until-mothers-day', name: "Mother's Day", the: "Mother's Day", q: "How many days until Mother's Day?", holiday: null,
        about: "In the United States, Mother's Day is the second Sunday in May." },
      de: { slug: 'tage-bis-muttertag', name: 'Muttertag', the: 'Muttertag', q: 'Wie viele Tage bis Muttertag?', holiday: null,
        about: 'Muttertag ist in Deutschland immer am zweiten Sonntag im Mai.' },
      es: { slug: 'dias-para-el-dia-de-la-madre', name: 'Día de la Madre', the: 'el Día de la Madre', q: '¿Cuántos días faltan para el Día de la Madre?', holiday: null,
        about: 'En España, el Día de la Madre se celebra el primer domingo de mayo.' },
      fr: { slug: 'jours-avant-la-fete-des-meres', name: 'Fête des Mères', the: 'la fête des Mères', q: 'Combien de jours avant la fête des Mères ?', holiday: null,
        about: "En France, la fête des Mères est le dernier dimanche de mai, sauf quand il coïncide avec la Pentecôte : elle passe alors au premier dimanche de juin." },
      ja: { slug: 'days-until-mothers-day', name: '母の日', the: '母の日', q: '母の日まであと何日?', holiday: null,
        about: '日本の母の日は5月の第2日曜日。カーネーションを贈るのが定番です。' },
      it: { slug: 'giorni-alla-festa-della-mamma', name: 'Festa della mamma', the: 'la festa della mamma', q: 'Quanti giorni mancano alla festa della mamma?', holiday: null,
        about: 'In Italia la festa della mamma si celebra la seconda domenica di maggio.' },
      pt: { slug: 'dias-para-o-dia-da-mae', name: 'Dia da Mãe', the: 'o Dia da Mãe', q: 'Quantos dias faltam para o Dia da Mãe?', holiday: null,
        about: 'Em Portugal, o Dia da Mãe celebra-se no primeiro domingo de maio.' },
    },
  },
  {
    id: 'fathers-day', emoji: '👔', rule: FATHERS,
    langs: {
      en: { slug: 'days-until-fathers-day', name: "Father's Day", the: "Father's Day", q: "How many days until Father's Day?", holiday: null,
        about: "In the United States, Father's Day is the third Sunday in June." },
      de: { slug: 'tage-bis-vatertag', name: 'Vatertag', the: 'Vatertag', q: 'Wie viele Tage bis Vatertag?', holiday: true,
        about: 'Vatertag fällt in Deutschland auf Christi Himmelfahrt, 39 Tage nach Ostersonntag und damit immer auf einen Donnerstag.' },
      es: { slug: 'dias-para-el-dia-del-padre', name: 'Día del Padre', the: 'el Día del Padre', q: '¿Cuántos días faltan para el Día del Padre?', holiday: null,
        about: 'En España, el Día del Padre es el 19 de marzo, día de San José.' },
      fr: { slug: 'jours-avant-la-fete-des-peres', name: 'Fête des Pères', the: 'la fête des Pères', q: 'Combien de jours avant la fête des Pères ?', holiday: null,
        about: 'En France, la fête des Pères est le troisième dimanche de juin.' },
      ja: { slug: 'days-until-fathers-day', name: '父の日', the: '父の日', q: '父の日まであと何日?', holiday: null,
        about: '日本の父の日は6月の第3日曜日です。' },
      it: { slug: 'giorni-alla-festa-del-papa', name: 'Festa del papà', the: 'la festa del papà', q: 'Quanti giorni mancano alla festa del papà?', holiday: null,
        about: 'In Italia la festa del papà è il 19 marzo, giorno di San Giuseppe.' },
      pt: { slug: 'dias-para-o-dia-do-pai', name: 'Dia do Pai', the: 'o Dia do Pai', q: 'Quantos dias faltam para o Dia do Pai?', holiday: null,
        about: 'Em Portugal, o Dia do Pai é a 19 de março, dia de São José.' },
    },
  },
  {
    id: 'spring', emoji: '🌷', rule: { season: 0 },
    langs: {
      en: { slug: 'days-until-spring', name: 'First day of spring', the: 'the first day of spring', q: 'How many days until spring?', holiday: null,
        about: 'Astronomical spring begins at the March equinox, on 19, 20 or 21 March, when day and night are about equally long.' },
      de: { slug: 'tage-bis-fruehling', name: 'Frühlingsanfang', the: 'Frühlingsanfang', q: 'Wie viele Tage bis Frühlingsanfang?', holiday: null,
        about: 'Der astronomische Frühling beginnt mit der Tagundnachtgleiche im März, meist am 20. März. Der meteorologische Frühling startet schon am 1. März.' },
      es: { slug: 'dias-para-la-primavera', name: 'Inicio de la primavera', the: 'el inicio de la primavera', q: '¿Cuántos días faltan para la primavera?', holiday: null,
        about: 'La primavera astronómica empieza con el equinoccio de marzo, normalmente el 20 o 21 de marzo.' },
      fr: { slug: 'jours-avant-le-printemps', name: 'Début du printemps', the: 'le début du printemps', q: 'Combien de jours avant le printemps ?', holiday: null,
        about: "Le printemps astronomique commence à l'équinoxe de mars, généralement le 20 mars." },
      ja: { slug: 'days-until-spring', name: '春分の日', the: '春分の日', q: '春分の日まであと何日?', holiday: true,
        about: '春分の日は昼と夜の長さがほぼ同じになる日で、毎年3月20日ごろ。天文学的な春の始まりです。' },
      it: { slug: 'giorni-alla-primavera', name: 'Inizio della primavera', the: "l'inizio della primavera", q: 'Quanti giorni mancano alla primavera?', holiday: null,
        about: "La primavera astronomica inizia con l'equinozio di marzo, di solito il 20 marzo." },
      pt: { slug: 'dias-para-a-primavera', name: 'Início da primavera', the: 'o início da primavera', q: 'Quantos dias faltam para a primavera?', holiday: null,
        about: 'A primavera astronómica começa com o equinócio de março, normalmente a 20 de março.' },
    },
  },
  {
    id: 'summer', emoji: '☀️', rule: { season: 1 },
    langs: {
      en: { slug: 'days-until-summer', name: 'First day of summer', the: 'the first day of summer', q: 'How many days until summer?', holiday: null,
        about: 'Astronomical summer begins at the June solstice, on 20 or 21 June: the longest day of the year in the Northern Hemisphere.' },
      de: { slug: 'tage-bis-sommer', name: 'Sommeranfang', the: 'Sommeranfang', q: 'Wie viele Tage bis Sommeranfang?', holiday: null,
        about: 'Der astronomische Sommer beginnt mit der Sommersonnenwende am 20. oder 21. Juni, dem längsten Tag des Jahres.' },
      es: { slug: 'dias-para-el-verano', name: 'Inicio del verano', the: 'el inicio del verano', q: '¿Cuántos días faltan para el verano?', holiday: null,
        about: 'El verano astronómico empieza con el solsticio de junio, el 20 o 21 de junio, el día más largo del año.' },
      fr: { slug: 'jours-avant-l-ete', name: "Début de l'été", the: "le début de l'été", q: "Combien de jours avant l'été ?", holiday: null,
        about: "L'été astronomique commence au solstice de juin, le 20 ou le 21 juin, le jour le plus long de l'année." },
      ja: { slug: 'days-until-summer', name: '夏至', the: '夏至', q: '夏至まであと何日?', holiday: null,
        about: '夏至は一年で最も昼が長い日で、毎年6月21日ごろです。' },
      it: { slug: 'giorni-all-estate', name: "Inizio dell'estate", the: "l'inizio dell'estate", q: "Quanti giorni mancano all'estate?", holiday: null,
        about: "L'estate astronomica inizia con il solstizio di giugno, il 20 o 21 giugno, il giorno più lungo dell'anno." },
      pt: { slug: 'dias-para-o-verao', name: 'Início do verão', the: 'o início do verão', q: 'Quantos dias faltam para o verão?', holiday: null,
        about: 'O verão astronómico começa com o solstício de junho, a 20 ou 21 de junho, o dia mais longo do ano.' },
    },
  },
  {
    id: 'autumn', emoji: '🍂', rule: { season: 2 },
    langs: {
      en: { slug: 'days-until-fall', name: 'First day of fall', the: 'the first day of fall', q: 'How many days until fall?', holiday: null,
        about: 'Astronomical fall begins at the September equinox, on 22 or 23 September.' },
      de: { slug: 'tage-bis-herbst', name: 'Herbstanfang', the: 'Herbstanfang', q: 'Wie viele Tage bis Herbstanfang?', holiday: null,
        about: 'Der astronomische Herbst beginnt mit der Tagundnachtgleiche im September, am 22. oder 23. September.' },
      es: { slug: 'dias-para-el-otono', name: 'Inicio del otoño', the: 'el inicio del otoño', q: '¿Cuántos días faltan para el otoño?', holiday: null,
        about: 'El otoño astronómico empieza con el equinoccio de septiembre, el 22 o 23 de septiembre.' },
      fr: { slug: 'jours-avant-l-automne', name: "Début de l'automne", the: "le début de l'automne", q: "Combien de jours avant l'automne ?", holiday: null,
        about: "L'automne astronomique commence à l'équinoxe de septembre, le 22 ou le 23 septembre." },
      ja: { slug: 'days-until-autumn', name: '秋分の日', the: '秋分の日', q: '秋分の日まであと何日?', holiday: true,
        about: '秋分の日は昼と夜の長さがほぼ同じになる日で、毎年9月23日ごろ。国民の祝日です。' },
      it: { slug: 'giorni-all-autunno', name: "Inizio dell'autunno", the: "l'inizio dell'autunno", q: "Quanti giorni mancano all'autunno?", holiday: null,
        about: "L'autunno astronomico inizia con l'equinozio di settembre, il 22 o 23 settembre." },
      pt: { slug: 'dias-para-o-outono', name: 'Início do outono', the: 'o início do outono', q: 'Quantos dias faltam para o outono?', holiday: null,
        about: 'O outono astronómico começa com o equinócio de setembro, a 22 ou 23 de setembro.' },
    },
  },
  {
    id: 'winter', emoji: '❄️', rule: { season: 3 },
    langs: {
      en: { slug: 'days-until-winter', name: 'First day of winter', the: 'the first day of winter', q: 'How many days until winter?', holiday: null,
        about: 'Astronomical winter begins at the December solstice, on 21 or 22 December: the shortest day of the year in the Northern Hemisphere.' },
      de: { slug: 'tage-bis-winter', name: 'Winteranfang', the: 'Winteranfang', q: 'Wie viele Tage bis Winteranfang?', holiday: null,
        about: 'Der astronomische Winter beginnt mit der Wintersonnenwende am 21. oder 22. Dezember, dem kürzesten Tag des Jahres.' },
      es: { slug: 'dias-para-el-invierno', name: 'Inicio del invierno', the: 'el inicio del invierno', q: '¿Cuántos días faltan para el invierno?', holiday: null,
        about: 'El invierno astronómico empieza con el solsticio de diciembre, el 21 o 22 de diciembre, el día más corto del año.' },
      fr: { slug: 'jours-avant-l-hiver', name: "Début de l'hiver", the: "le début de l'hiver", q: "Combien de jours avant l'hiver ?", holiday: null,
        about: "L'hiver astronomique commence au solstice de décembre, le 21 ou le 22 décembre, le jour le plus court de l'année." },
      ja: { slug: 'days-until-winter', name: '冬至', the: '冬至', q: '冬至まであと何日?', holiday: null,
        about: '冬至は一年で最も昼が短い日で、毎年12月22日ごろ。ゆず湯に入り、かぼちゃを食べる風習があります。' },
      it: { slug: 'giorni-all-inverno', name: "Inizio dell'inverno", the: "l'inizio dell'inverno", q: "Quanti giorni mancano all'inverno?", holiday: null,
        about: "L'inverno astronomico inizia con il solstizio di dicembre, il 21 o 22 dicembre, il giorno più corto dell'anno." },
      pt: { slug: 'dias-para-o-inverno', name: 'Início do inverno', the: 'o início do inverno', q: 'Quantos dias faltam para o inverno?', holiday: null,
        about: 'O inverno astronómico começa com o solstício de dezembro, a 21 ou 22 de dezembro, o dia mais curto do ano.' },
    },
  },
  {
    id: 'black-friday', emoji: '🛍️', rule: { blackFriday: true },
    langs: {
      en: { slug: 'days-until-black-friday', name: 'Black Friday', the: 'Black Friday', q: 'How many days until Black Friday?', holiday: false,
        about: 'Black Friday is the day after Thanksgiving, so always the Friday after the fourth Thursday in November.' },
      de: { slug: 'tage-bis-black-friday', name: 'Black Friday', the: 'Black Friday', q: 'Wie viele Tage bis Black Friday?', holiday: false,
        about: 'Black Friday ist der Freitag nach dem US-Feiertag Thanksgiving, also immer der Freitag nach dem vierten Donnerstag im November.' },
      es: { slug: 'dias-para-black-friday', name: 'Black Friday', the: 'Black Friday', q: '¿Cuántos días faltan para Black Friday?', holiday: false,
        about: 'Black Friday es el viernes después de Acción de Gracias en Estados Unidos: el viernes siguiente al cuarto jueves de noviembre.' },
      fr: { slug: 'jours-avant-le-black-friday', name: 'Black Friday', the: 'le Black Friday', q: 'Combien de jours avant le Black Friday ?', holiday: false,
        about: "Le Black Friday est le vendredi qui suit Thanksgiving aux États-Unis, soit le vendredi après le quatrième jeudi de novembre." },
      ja: { slug: 'days-until-black-friday', name: 'ブラックフライデー', the: 'ブラックフライデー', q: 'ブラックフライデーまであと何日?', holiday: false,
        about: 'ブラックフライデーはアメリカの感謝祭(11月第4木曜日)の翌日の金曜日。日本でもセールの日として定着しています。' },
      it: { slug: 'giorni-al-black-friday', name: 'Black Friday', the: 'il Black Friday', q: 'Quanti giorni mancano al Black Friday?', holiday: false,
        about: 'Il Black Friday è il venerdì dopo il Ringraziamento americano, cioè il venerdì successivo al quarto giovedì di novembre.' },
      pt: { slug: 'dias-para-a-black-friday', name: 'Black Friday', the: 'a Black Friday', q: 'Quantos dias faltam para a Black Friday?', holiday: false,
        about: 'A Black Friday é a sexta-feira a seguir ao Dia de Ação de Graças americano, ou seja, depois da quarta quinta-feira de novembro.' },
    },
  },

  // ---------------------------------------------------------------- English (US)
  { id: 'thanksgiving', emoji: '🦃', rule: { nth: [11, 4, 4] }, langs: {
    en: { slug: 'days-until-thanksgiving', name: 'Thanksgiving', the: 'Thanksgiving', q: 'How many days until Thanksgiving?', holiday: true,
      about: 'Thanksgiving is on the fourth Thursday in November and is a federal holiday in the United States.' } } },
  { id: 'independence-day', emoji: '🇺🇸', rule: { fixed: [7, 4] }, langs: {
    en: { slug: 'days-until-4th-of-july', name: 'Fourth of July', the: 'the Fourth of July', q: 'How many days until the 4th of July?', holiday: true,
      about: 'Independence Day is on 4 July every year, celebrating the Declaration of Independence of 1776 with parades and fireworks.' } } },
  { id: 'st-patricks-day', emoji: '☘️', rule: { fixed: [3, 17] }, langs: {
    en: { slug: 'days-until-st-patricks-day', name: "St. Patrick's Day", the: "St. Patrick's Day", q: "How many days until St. Patrick's Day?", holiday: false,
      about: "St. Patrick's Day is on 17 March every year, with parades and plenty of green." } } },
  { id: 'memorial-day', emoji: '🎖️', rule: { nth: [5, 1, -1] }, langs: {
    en: { slug: 'days-until-memorial-day', name: 'Memorial Day', the: 'Memorial Day', q: 'How many days until Memorial Day?', holiday: true,
      about: 'Memorial Day is the last Monday in May. It honors those who died serving in the US military and marks the unofficial start of summer.' } } },
  { id: 'labor-day', emoji: '🛠️', rule: { nth: [9, 1, 1] }, langs: {
    en: { slug: 'days-until-labor-day', name: 'Labor Day', the: 'Labor Day', q: 'How many days until Labor Day?', holiday: true,
      about: 'Labor Day is the first Monday in September and a federal holiday that marks the unofficial end of summer.' } } },

  // ---------------------------------------------------------------- German
  { id: 'nikolaus', emoji: '🥾', rule: { fixed: [12, 6] }, langs: {
    de: { slug: 'tage-bis-nikolaus', name: 'Nikolaus', the: 'Nikolaus', q: 'Wie viele Tage bis Nikolaus?', holiday: false,
      about: 'Nikolaus ist am 6. Dezember. Am Abend davor stellen Kinder ihre geputzten Stiefel vor die Tür.' } } },
  { id: 'sankt-martin', emoji: '🏮', rule: { fixed: [11, 11] }, langs: {
    de: { slug: 'tage-bis-sankt-martin', name: 'Sankt Martin', the: 'Sankt Martin', q: 'Wie viele Tage bis Sankt Martin?', holiday: false,
      about: 'Sankt Martin ist am 11. November. Rund um den Tag ziehen Kinder mit Laternen durch die Straßen.' } } },
  { id: 'erster-advent', emoji: '🕯️', rule: { firstAdvent: true }, langs: {
    de: { slug: 'tage-bis-zum-ersten-advent', name: '1. Advent', the: 'der 1. Advent', q: 'Wie viele Tage bis zum 1. Advent?', holiday: null,
      about: 'Der erste Advent ist der vierte Sonntag vor Weihnachten und liegt immer zwischen dem 27. November und dem 3. Dezember.' } } },
  { id: 'rosenmontag', emoji: '🎭', rule: { easter: -48 }, langs: {
    de: { slug: 'tage-bis-rosenmontag', name: 'Rosenmontag', the: 'Rosenmontag', q: 'Wie viele Tage bis Rosenmontag?', holiday: false,
      about: 'Rosenmontag ist 48 Tage vor Ostersonntag, der Höhepunkt des Karnevals mit den großen Umzügen in Köln, Düsseldorf und Mainz.' } } },
  { id: 'pfingsten', emoji: '🕊️', rule: { easter: 49 }, langs: {
    de: { slug: 'tage-bis-pfingsten', name: 'Pfingsten', the: 'Pfingsten', q: 'Wie viele Tage bis Pfingsten?', holiday: null,
      about: 'Pfingstsonntag ist 49 Tage nach Ostersonntag; der Pfingstmontag danach ist ein gesetzlicher Feiertag.' } } },
  { id: 'tag-der-deutschen-einheit', emoji: '🇩🇪', rule: { fixed: [10, 3] }, langs: {
    de: { slug: 'tage-bis-tag-der-deutschen-einheit', name: 'Tag der Deutschen Einheit', the: 'der Tag der Deutschen Einheit', q: 'Wie viele Tage bis zum Tag der Deutschen Einheit?', holiday: true,
      about: 'Der Tag der Deutschen Einheit am 3. Oktober erinnert an die Wiedervereinigung 1990 und ist der Nationalfeiertag.' } } },

  // ---------------------------------------------------------------- Spanish
  { id: 'reyes', emoji: '👑', rule: { fixed: [1, 6] }, langs: {
    es: { slug: 'dias-para-reyes', name: 'Día de Reyes', the: 'el Día de Reyes', q: '¿Cuántos días faltan para Reyes?', holiday: true,
      about: 'El Día de Reyes es el 6 de enero. La noche anterior, los Reyes Magos traen los regalos y se celebra la cabalgata.' } } },
  { id: 'semana-santa', emoji: '✝️', rule: { easter: -7 }, langs: {
    es: { slug: 'dias-para-semana-santa', name: 'Semana Santa', the: 'la Semana Santa', q: '¿Cuántos días faltan para Semana Santa?', holiday: null,
      about: 'La Semana Santa empieza el Domingo de Ramos, una semana antes del Domingo de Pascua. El Viernes Santo es festivo nacional.' } } },
  { id: 'san-juan', emoji: '🔥', rule: { fixed: [6, 24] }, langs: {
    es: { slug: 'dias-para-san-juan', name: 'San Juan', the: 'San Juan', q: '¿Cuántos días faltan para San Juan?', holiday: null,
      about: 'San Juan es el 24 de junio. La noche anterior se celebran hogueras y fiestas en la playa, sobre todo en el Mediterráneo.' } } },
  { id: 'hispanidad', emoji: '🇪🇸', rule: { fixed: [10, 12] }, langs: {
    es: { slug: 'dias-para-el-dia-de-la-hispanidad', name: 'Día de la Hispanidad', the: 'el Día de la Hispanidad', q: '¿Cuántos días faltan para el Día de la Hispanidad?', holiday: true,
      about: 'La Fiesta Nacional de España, el Día de la Hispanidad, es el 12 de octubre.' } } },
  { id: 'san-fermin', emoji: '🐂', rule: { fixed: [7, 6] }, langs: {
    es: { slug: 'dias-para-san-fermin', name: 'San Fermín', the: 'San Fermín', q: '¿Cuántos días faltan para San Fermín?', holiday: null,
      about: 'Los Sanfermines de Pamplona empiezan cada 6 de julio a mediodía con el chupinazo y duran hasta el 14 de julio.' } } },

  // ---------------------------------------------------------------- French
  { id: 'fete-nationale', emoji: '🇫🇷', rule: { fixed: [7, 14] }, langs: {
    fr: { slug: 'jours-avant-le-14-juillet', name: '14 Juillet', the: 'le 14 Juillet', q: 'Combien de jours avant le 14 Juillet ?', holiday: true,
      about: 'Le 14 Juillet est la fête nationale française : défilé sur les Champs-Élysées le matin, feux d\'artifice le soir.' } } },
  { id: 'chandeleur', emoji: '🥞', rule: { fixed: [2, 2] }, langs: {
    fr: { slug: 'jours-avant-la-chandeleur', name: 'Chandeleur', the: 'la Chandeleur', q: 'Combien de jours avant la Chandeleur ?', holiday: false,
      about: 'La Chandeleur a lieu chaque année le 2 février : on y fait sauter les crêpes.' } } },
  { id: 'fete-de-la-musique', emoji: '🎶', rule: { fixed: [6, 21] }, langs: {
    fr: { slug: 'jours-avant-la-fete-de-la-musique', name: 'Fête de la musique', the: 'la fête de la musique', q: 'Combien de jours avant la fête de la musique ?', holiday: false,
      about: 'La fête de la musique a lieu chaque 21 juin depuis 1982, avec des concerts gratuits partout en France.' } } },
  { id: 'toussaint', emoji: '🕯️', rule: { fixed: [11, 1] }, langs: {
    fr: { slug: 'jours-avant-la-toussaint', name: 'Toussaint', the: 'la Toussaint', q: 'Combien de jours avant la Toussaint ?', holiday: true,
      about: 'La Toussaint, le 1er novembre, est un jour férié en France ; elle donne aussi son nom aux vacances scolaires d\'automne.' } } },
  { id: 'epiphanie', emoji: '👑', rule: { fixed: [1, 6] }, langs: {
    fr: { slug: 'jours-avant-l-epiphanie', name: 'Épiphanie', the: "l'Épiphanie", q: "Combien de jours avant l'Épiphanie ?", holiday: false,
      about: "L'Épiphanie tombe le 6 janvier ; en France, elle est souvent fêtée le premier dimanche de janvier avec la galette des rois." } } },

  // ---------------------------------------------------------------- Japanese
  { id: 'golden-week', emoji: '🎏', rule: { fixed: [4, 29] }, langs: {
    ja: { slug: 'days-until-golden-week', name: 'ゴールデンウィーク', the: 'ゴールデンウィーク', q: 'ゴールデンウィークまであと何日?', holiday: null,
      about: 'ゴールデンウィークは4月29日の昭和の日から5月5日のこどもの日まで、祝日が続く大型連休です。' } } },
  { id: 'hinamatsuri', emoji: '🎎', rule: { fixed: [3, 3] }, langs: {
    ja: { slug: 'days-until-hinamatsuri', name: 'ひな祭り', the: 'ひな祭り', q: 'ひな祭りまであと何日?', holiday: false,
      about: 'ひな祭り(桃の節句)は3月3日。女の子の健やかな成長を願い、ひな人形を飾ります。' } } },
  { id: 'white-day', emoji: '🍬', rule: { fixed: [3, 14] }, langs: {
    ja: { slug: 'days-until-white-day', name: 'ホワイトデー', the: 'ホワイトデー', q: 'ホワイトデーまであと何日?', holiday: false,
      about: 'ホワイトデーは3月14日。バレンタインデーのお返しを贈る日です。' } } },
  { id: 'tanabata', emoji: '🎋', rule: { fixed: [7, 7] }, langs: {
    ja: { slug: 'days-until-tanabata', name: '七夕', the: '七夕', q: '七夕まであと何日?', holiday: false,
      about: '七夕は7月7日。短冊に願いごとを書いて笹に飾ります。' } } },
  { id: 'obon', emoji: '🏮', rule: { fixed: [8, 13] }, langs: {
    ja: { slug: 'days-until-obon', name: 'お盆', the: 'お盆', q: 'お盆まであと何日?', holiday: false,
      about: 'お盆は多くの地域で8月13日から16日まで。祝日ではありませんが、帰省や夏休みの時期です。' } } },

  // ---------------------------------------------------------------- Italian
  { id: 'ferragosto', emoji: '🏖️', rule: { fixed: [8, 15] }, langs: {
    it: { slug: 'giorni-a-ferragosto', name: 'Ferragosto', the: 'Ferragosto', q: 'Quanti giorni mancano a Ferragosto?', holiday: true,
      about: "Ferragosto è il 15 agosto, festa dell'Assunzione e cuore delle vacanze estive italiane." } } },
  { id: 'befana', emoji: '🧹', rule: { fixed: [1, 6] }, langs: {
    it: { slug: 'giorni-alla-befana', name: 'Befana', the: "l'Epifania", q: 'Quanti giorni mancano alla Befana?', holiday: true,
      about: "L'Epifania è il 6 gennaio: nella notte la Befana riempie le calze dei bambini. \"L'Epifania tutte le feste porta via.\"" } } },
  { id: 'festa-della-repubblica', emoji: '🇮🇹', rule: { fixed: [6, 2] }, langs: {
    it: { slug: 'giorni-alla-festa-della-repubblica', name: 'Festa della Repubblica', the: 'la Festa della Repubblica', q: 'Quanti giorni mancano alla Festa della Repubblica?', holiday: true,
      about: 'La Festa della Repubblica è il 2 giugno e ricorda il referendum del 1946, con la parata ai Fori Imperiali a Roma.' } } },
  { id: 'carnevale', emoji: '🎭', rule: { easter: -47 }, langs: {
    it: { slug: 'giorni-a-carnevale', name: 'Carnevale', the: 'il Martedì grasso', q: 'Quanti giorni mancano a Carnevale?', holiday: false,
      about: 'Il Martedì grasso, ultimo giorno di Carnevale, cade 47 giorni prima di Pasqua. Venezia e Viareggio ospitano i carnevali più famosi.' } } },
  { id: 'liberazione', emoji: '🌹', rule: { fixed: [4, 25] }, langs: {
    it: { slug: 'giorni-al-25-aprile', name: 'Festa della Liberazione', the: 'il 25 aprile', q: 'Quanti giorni mancano al 25 aprile?', holiday: true,
      about: 'Il 25 aprile è la Festa della Liberazione, che ricorda la fine dell\'occupazione nazifascista nel 1945.' } } },

  // ---------------------------------------------------------------- Portuguese (Portugal)
  { id: 'santo-antonio', emoji: '🐟', rule: { fixed: [6, 13] }, langs: {
    pt: { slug: 'dias-para-o-santo-antonio', name: 'Santo António', the: 'o Santo António', q: 'Quantos dias faltam para o Santo António?', holiday: null,
      about: 'O Santo António é a 13 de junho e é feriado municipal em Lisboa. Na noite de 12 para 13 há marchas populares e sardinhas assadas.' } } },
  { id: 'dia-de-portugal', emoji: '🇵🇹', rule: { fixed: [6, 10] }, langs: {
    pt: { slug: 'dias-para-o-dia-de-portugal', name: 'Dia de Portugal', the: 'o Dia de Portugal', q: 'Quantos dias faltam para o Dia de Portugal?', holiday: true,
      about: 'O Dia de Portugal, de Camões e das Comunidades Portuguesas é a 10 de junho.' } } },
  { id: 'carnaval-pt', emoji: '🎭', rule: { easter: -47 }, langs: {
    pt: { slug: 'dias-para-o-carnaval', name: 'Carnaval', the: 'o Carnaval', q: 'Quantos dias faltam para o Carnaval?', holiday: null,
      about: 'A terça-feira de Carnaval é 47 dias antes da Páscoa. Não é feriado obrigatório, mas costuma ser dada tolerância de ponto.' } } },
  { id: '25-de-abril', emoji: '🌹', rule: { fixed: [4, 25] }, langs: {
    pt: { slug: 'dias-para-o-25-de-abril', name: '25 de Abril', the: 'o 25 de Abril', q: 'Quantos dias faltam para o 25 de Abril?', holiday: true,
      about: 'O 25 de Abril, Dia da Liberdade, assinala a Revolução dos Cravos de 1974.' } } },
  { id: 'dia-de-reis', emoji: '👑', rule: { fixed: [1, 6] }, langs: {
    pt: { slug: 'dias-para-o-dia-de-reis', name: 'Dia de Reis', the: 'o Dia de Reis', q: 'Quantos dias faltam para o Dia de Reis?', holiday: false,
      about: 'O Dia de Reis é a 6 de janeiro, dia de comer bolo-rei e de cantar as Janeiras.' } } },
];

// Paths of the per-language overview ("all countdowns") and calculator pages.
export const HUB_PATH = { en: '/cndwn/countdowns/', de: '/cndwn/de/countdowns/', es: '/cndwn/es/countdowns/', fr: '/cndwn/fr/countdowns/', ja: '/cndwn/ja/countdowns/', it: '/cndwn/it/countdowns/', pt: '/cndwn/pt/countdowns/' };
export const CALC_PATH = { en: '/cndwn/days-calculator/', de: '/cndwn/de/tage-rechner/', es: '/cndwn/es/calculadora-de-dias/', fr: '/cndwn/fr/calculateur-de-jours/', ja: '/cndwn/ja/days-calculator/', it: '/cndwn/it/calcolatore-di-giorni/', pt: '/cndwn/pt/calculadora-de-dias/' };

// UI strings. {x} placeholders are filled in by the renderer.
export const UI = {
  en: {
    day: 'day', days: 'days', until: 'until {date}', today: "It's today! 🎉",
    answer: '{The} {Y} is on {date}.', exact: 'Exactly', otherWays: 'Other ways to count',
    weeks: 'Weeks', weeksVal: '{w} weeks, {d} days', sleeps: 'Sleeps', sleepsVal: '{n} sleeps', hours: 'Hours', hoursVal: '{n} hours',
    datesH: 'Dates for the coming years', year: 'Year', date: 'Date',
    ctaH: 'Keep this countdown on your Home Screen',
    ctaP: 'CNDWN shows your countdowns as widgets on the Home Screen, Lock Screen and StandBy, and live in the Dynamic Island. Every feature is free: no ads, no in-app purchases.',
    getApp: 'Get CNDWN free',
    faqH: 'Frequently asked questions',
    qWhen: 'When is {the} {Y}?', aWhen: '{The} {Y} falls on {date}.',
    qHoliday: 'Is {the} a public holiday?', aYes: 'Yes. {The} is a public holiday in the United States.', aNo: 'No. {The} is not a public holiday in the United States.',
    qIphone: 'How do I put a countdown to {the} on my iPhone?',
    aIphone: 'Download CNDWN for free, tap + and pick the date, or import it from Calendar. Then touch and hold your Home Screen or Lock Screen, tap + and add the CNDWN widget. All widgets and Live Activities are free.',
    embedH: 'Add this countdown to your website', embedP: 'Copy this code into your page. The countdown updates live, and the link below it credits CNDWN.', copy: 'Copy code', copied: 'Copied',
    byCndwn: 'countdown by CNDWN',
    moreH: 'More countdowns', allLink: 'All countdowns', calcLink: 'Days calculator',
    hubTitle: 'How many days until…? Live countdowns', hubH1: 'How many days until…?', hubDesc: 'Live countdowns to Christmas, Easter, Halloween, the seasons and more, with the exact dates for the coming years.', hubLead: 'Live countdowns to the holidays and moments of the year, sorted by what comes next.', hubBreadcrumb: 'Countdowns',
  },
  de: {
    day: 'Tag', days: 'Tage', until: 'bis {date}', today: 'Heute ist es so weit! 🎉',
    answer: '{The} {Y} ist am {date}.', exact: 'Genau', otherWays: 'Anders gezählt',
    weeks: 'Wochen', weeksVal: '{w} Wochen, {d} Tage', sleeps: 'Mal schlafen', sleepsVal: 'noch {n}-mal schlafen', hours: 'Stunden', hoursVal: '{n} Stunden',
    datesH: 'Termine der nächsten Jahre', year: 'Jahr', date: 'Datum',
    ctaH: 'Diesen Countdown auf den Home-Bildschirm',
    ctaP: 'CNDWN zeigt deine Countdowns als Widgets auf Home-Bildschirm, Sperrbildschirm und StandBy und live in der Dynamic Island. Alle Funktionen gratis: keine Werbung, keine In-App-Käufe.',
    getApp: 'CNDWN gratis laden',
    faqH: 'Häufige Fragen',
    qWhen: 'Wann ist {the} {Y}?', aWhen: '{The} {Y} fällt auf {date}.',
    qHoliday: 'Ist {the} ein Feiertag?', aYes: 'Ja. {The} ist in Deutschland ein gesetzlicher Feiertag.', aNo: 'Nein. {The} ist in Deutschland kein gesetzlicher Feiertag.',
    qIphone: 'Wie bekomme ich diesen Countdown aufs iPhone?',
    aIphone: 'Lade CNDWN kostenlos, tippe auf + und wähle das Datum oder importiere es aus dem Kalender. Dann Home- oder Sperrbildschirm gedrückt halten, auf + tippen und das CNDWN-Widget hinzufügen. Alle Widgets und Live-Aktivitäten sind gratis.',
    embedH: 'Diesen Countdown auf deiner Website', embedP: 'Kopiere diesen Code in deine Seite. Der Countdown läuft live, der Link darunter nennt CNDWN als Quelle.', copy: 'Code kopieren', copied: 'Kopiert',
    byCndwn: 'Countdown von CNDWN',
    moreH: 'Weitere Countdowns', allLink: 'Alle Countdowns', calcLink: 'Tage-Rechner',
    hubTitle: 'Wie viele Tage bis …? Live-Countdowns', hubH1: 'Wie viele Tage bis …?', hubDesc: 'Live-Countdowns bis Weihnachten, Ostern, Silvester, Nikolaus, zu den Jahreszeiten und mehr, mit den genauen Terminen der nächsten Jahre.', hubLead: 'Live-Countdowns zu den Feiertagen und Momenten des Jahres, sortiert nach dem, was als Nächstes kommt.', hubBreadcrumb: 'Countdowns',
  },
  es: {
    day: 'día', days: 'días', until: 'hasta el {date}', today: '¡Es hoy! 🎉',
    answer: '{The} {Y} es el {date}.', exact: 'Exactamente', otherWays: 'Otras formas de contar',
    weeks: 'Semanas', weeksVal: '{w} semanas y {d} días', sleeps: 'Noches', sleepsVal: '{n} noches', hours: 'Horas', hoursVal: '{n} horas',
    datesH: 'Fechas de los próximos años', year: 'Año', date: 'Fecha',
    ctaH: 'Lleva esta cuenta atrás en tu pantalla de inicio',
    ctaP: 'CNDWN muestra tus cuentas atrás como widgets en la pantalla de inicio, la de bloqueo y StandBy, y en directo en la Dynamic Island. Todo gratis: sin anuncios ni compras dentro de la app.',
    getApp: 'Descarga CNDWN gratis',
    faqH: 'Preguntas frecuentes',
    qWhen: '¿Cuándo es {the} {Y}?', aWhen: '{The} {Y} cae el {date}.',
    qHoliday: '¿Es festivo {the}?', aYes: 'Sí. {The} es festivo nacional en España.', aNo: 'No. {The} no es festivo nacional en España.',
    qIphone: '¿Cómo pongo una cuenta atrás para {the} en mi iPhone?',
    aIphone: 'Descarga CNDWN gratis, toca + y elige la fecha, o impórtala del Calendario. Después mantén pulsada la pantalla de inicio o de bloqueo, toca + y añade el widget de CNDWN. Todos los widgets y actividades en vivo son gratis.',
    embedH: 'Añade esta cuenta atrás a tu web', embedP: 'Copia este código en tu página. La cuenta atrás se actualiza en directo y el enlace de debajo cita a CNDWN.', copy: 'Copiar código', copied: 'Copiado',
    byCndwn: 'cuenta atrás de CNDWN',
    moreH: 'Más cuentas atrás', allLink: 'Todas las cuentas atrás', calcLink: 'Calculadora de días',
    hubTitle: '¿Cuántos días faltan para…? Cuentas atrás en directo', hubH1: '¿Cuántos días faltan para…?', hubDesc: 'Cuentas atrás en directo para Navidad, Nochevieja, Reyes, Semana Santa, las estaciones y más, con las fechas exactas de los próximos años.', hubLead: 'Cuentas atrás en directo para las fiestas y momentos del año, ordenadas por lo que llega antes.', hubBreadcrumb: 'Cuentas atrás',
  },
  fr: {
    day: 'jour', days: 'jours', until: "jusqu'au {date}", today: "C'est aujourd'hui ! 🎉",
    answer: '{The} {Y} tombe le {date}.', exact: 'Précisément', otherWays: 'Autres façons de compter',
    weeks: 'Semaines', weeksVal: '{w} semaines et {d} jours', sleeps: 'Dodos', sleepsVal: '{n} dodos', hours: 'Heures', hoursVal: '{n} heures',
    datesH: 'Dates des prochaines années', year: 'Année', date: 'Date',
    ctaH: "Gardez ce compte à rebours sur votre écran d'accueil",
    ctaP: "CNDWN affiche vos comptes à rebours en widgets sur l'écran d'accueil, l'écran verrouillé et StandBy, et en direct dans la Dynamic Island. Tout est gratuit : ni publicité ni achats intégrés.",
    getApp: 'Télécharger CNDWN gratuitement',
    faqH: 'Questions fréquentes',
    qWhen: 'Quand tombe {the} {Y} ?', aWhen: '{The} {Y} tombe le {date}.',
    qHoliday: 'Est-ce que {the} est un jour férié ?', aYes: 'Oui. {The} est un jour férié en France.', aNo: "Non. {The} n'est pas un jour férié en France.",
    qIphone: 'Comment afficher un compte à rebours avant {the} sur mon iPhone ?',
    aIphone: "Téléchargez CNDWN gratuitement, touchez + et choisissez la date, ou importez-la depuis Calendrier. Maintenez ensuite le doigt sur l'écran d'accueil ou l'écran verrouillé, touchez + et ajoutez le widget CNDWN. Tous les widgets et Activités en direct sont gratuits.",
    embedH: 'Ajoutez ce compte à rebours à votre site', embedP: 'Copiez ce code dans votre page. Le compte à rebours se met à jour en direct et le lien en dessous cite CNDWN.', copy: 'Copier le code', copied: 'Copié',
    byCndwn: 'compte à rebours par CNDWN',
    moreH: 'Autres comptes à rebours', allLink: 'Tous les comptes à rebours', calcLink: 'Calculateur de jours',
    hubTitle: 'Combien de jours avant… ? Comptes à rebours en direct', hubH1: 'Combien de jours avant… ?', hubDesc: 'Comptes à rebours en direct avant Noël, le Nouvel An, Pâques, le 14 Juillet, les saisons et plus, avec les dates exactes des prochaines années.', hubLead: "Comptes à rebours en direct avant les fêtes et moments de l'année, triés par ordre d'arrivée.", hubBreadcrumb: 'Comptes à rebours',
  },
  ja: {
    day: '日', days: '日', until: '{date}まで', today: '今日です!🎉',
    answer: '{Y}年の{the}は{date}です。', exact: '正確には', otherWays: 'ほかの数え方',
    weeks: '週', weeksVal: '{w}週と{d}日', sleeps: 'あと何回寝る?', sleepsVal: 'あと{n}回寝ると', hours: '時間', hoursVal: '{n}時間',
    datesH: '今後の日付', year: '年', date: '日付',
    ctaH: 'このカウントダウンをホーム画面に',
    ctaP: 'CNDWNなら、カウントダウンをホーム画面・ロック画面・StandByのウィジェットやDynamic Islandのライブ表示で確認できます。全機能無料、広告もApp内課金もありません。',
    getApp: 'CNDWNを無料で入手',
    faqH: 'よくある質問',
    qWhen: '{Y}年の{the}はいつ?', aWhen: '{Y}年の{the}は{date}です。',
    qHoliday: '{the}は祝日ですか?', aYes: 'はい。{the}は日本の祝日です。', aNo: 'いいえ。{the}は日本の祝日ではありません。',
    qIphone: '{the}までのカウントダウンをiPhoneに表示するには?',
    aIphone: 'CNDWNを無料でダウンロードし、+をタップして日付を選ぶか、カレンダーから読み込みます。ホーム画面またはロック画面を長押しして+をタップし、CNDWNのウィジェットを追加しましょう。ウィジェットもライブアクティビティもすべて無料です。',
    embedH: 'このカウントダウンをあなたのサイトに', embedP: 'このコードをページに貼り付けてください。カウントダウンはリアルタイムで更新され、下のリンクでCNDWNが表示されます。', copy: 'コードをコピー', copied: 'コピーしました',
    byCndwn: 'カウントダウン by CNDWN',
    moreH: 'ほかのカウントダウン', allLink: 'すべてのカウントダウン', calcLink: '日数計算',
    hubTitle: 'あと何日?リアルタイムのカウントダウン', hubH1: 'あと何日?', hubDesc: 'クリスマス、お正月、ゴールデンウィーク、お盆、季節の節目までのカウントダウンと、今後の正確な日付。', hubLead: '一年の行事や祝日までのリアルタイムのカウントダウン。近い順に並んでいます。', hubBreadcrumb: 'カウントダウン',
  },
  it: {
    day: 'giorno', days: 'giorni', until: 'fino a {date}', today: 'È oggi! 🎉',
    answer: '{The} {Y} è {date}.', exact: 'Per la precisione', otherWays: 'Altri modi di contare',
    weeks: 'Settimane', weeksVal: '{w} settimane e {d} giorni', sleeps: 'Nanne', sleepsVal: '{n} nanne', hours: 'Ore', hoursVal: '{n} ore',
    datesH: 'Date dei prossimi anni', year: 'Anno', date: 'Data',
    ctaH: 'Tieni questo conto alla rovescia sulla schermata Home',
    ctaP: 'CNDWN mostra i tuoi conti alla rovescia come widget sulla schermata Home, di Blocco e StandBy, e in diretta nella Dynamic Island. Tutto gratis: niente pubblicità né acquisti in-app.',
    getApp: 'Scarica CNDWN gratis',
    faqH: 'Domande frequenti',
    qWhen: 'Quando è {the} {Y}?', aWhen: '{The} {Y} cade {date}.',
    qHoliday: '{The} è un giorno festivo?', aYes: 'Sì. {The} è un giorno festivo in Italia.', aNo: 'No. {The} non è un giorno festivo in Italia.',
    qIphone: "Come metto un conto alla rovescia per {the} sull'iPhone?",
    aIphone: "Scarica CNDWN gratis, tocca + e scegli la data, oppure importala dal Calendario. Poi tieni premuto sulla schermata Home o di Blocco, tocca + e aggiungi il widget di CNDWN. Tutti i widget e le Attività Live sono gratuiti.",
    embedH: 'Aggiungi questo conto alla rovescia al tuo sito', embedP: 'Copia questo codice nella tua pagina. Il conto alla rovescia si aggiorna in diretta e il link sotto cita CNDWN.', copy: 'Copia il codice', copied: 'Copiato',
    byCndwn: 'conto alla rovescia di CNDWN',
    moreH: 'Altri conti alla rovescia', allLink: 'Tutti i conti alla rovescia', calcLink: 'Calcolatore di giorni',
    hubTitle: 'Quanti giorni mancano a…? Conti alla rovescia in diretta', hubH1: 'Quanti giorni mancano a…?', hubDesc: 'Conti alla rovescia in diretta per Natale, Capodanno, Pasqua, Ferragosto, le stagioni e altro, con le date esatte dei prossimi anni.', hubLead: "Conti alla rovescia in diretta per le feste e i momenti dell'anno, in ordine di arrivo.", hubBreadcrumb: 'Conti alla rovescia',
  },
  pt: {
    day: 'dia', days: 'dias', until: 'até {date}', today: 'É hoje! 🎉',
    answer: '{The} {Y} é {date}.', exact: 'Ao certo', otherWays: 'Outras formas de contar',
    weeks: 'Semanas', weeksVal: '{w} semanas e {d} dias', sleeps: 'Noites', sleepsVal: '{n} noites', hours: 'Horas', hoursVal: '{n} horas',
    datesH: 'Datas dos próximos anos', year: 'Ano', date: 'Data',
    ctaH: 'Tem esta contagem no ecrã principal',
    ctaP: 'O CNDWN mostra as tuas contagens como widgets no ecrã principal, no ecrã bloqueado e no StandBy, e em direto na Dynamic Island. Tudo grátis: sem anúncios nem compras na app.',
    getApp: 'Descarregar o CNDWN grátis',
    faqH: 'Perguntas frequentes',
    qWhen: 'Quando é {the} {Y}?', aWhen: '{The} {Y} calha a {date}.',
    qHoliday: '{The} é feriado?', aYes: 'Sim. {The} é feriado nacional em Portugal.', aNo: 'Não. {The} não é feriado nacional em Portugal.',
    qIphone: 'Como ponho uma contagem para {the} no iPhone?',
    aIphone: 'Descarrega o CNDWN grátis, toca em + e escolhe a data, ou importa-a do Calendário. Depois mantém premido o ecrã principal ou o ecrã bloqueado, toca em + e adiciona o widget do CNDWN. Todos os widgets e Atividades em Direto são grátis.',
    embedH: 'Adiciona esta contagem ao teu site', embedP: 'Copia este código para a tua página. A contagem atualiza-se em direto e a ligação por baixo cita o CNDWN.', copy: 'Copiar código', copied: 'Copiado',
    byCndwn: 'contagem do CNDWN',
    moreH: 'Mais contagens', allLink: 'Todas as contagens', calcLink: 'Calculadora de dias',
    hubTitle: 'Quantos dias faltam para…? Contagens em direto', hubH1: 'Quantos dias faltam para…?', hubDesc: 'Contagens em direto para o Natal, o Ano Novo, a Páscoa, o Santo António, as estações e mais, com as datas exatas dos próximos anos.', hubLead: 'Contagens em direto para as festas e momentos do ano, ordenadas pelo que vem primeiro.', hubBreadcrumb: 'Contagens',
  },
};

// The days calculator page.
export const CALC = {
  en: {
    title: 'Days calculator: days until a date and days between dates', h1: 'Days calculator',
    desc: 'Count the days until or since any date, or the days between two dates, in days, weeks and months. Free, private, nothing to install.',
    lead: 'Pick a date to see how many days are left, or compare two dates.',
    untilH: 'Days until or since a date', dateLabel: 'Date', betweenH: 'Days between two dates', fromLabel: 'From', toLabel: 'To',
    resUntil: '{n} days until {date}', resSince: '{n} days since {date}', resToday: 'That is today.',
    resBetween: '{n} days', resWeeks: '{w} weeks and {d} days', resMonths: 'about {m} months',
    howH: 'How the days are counted', how: 'The calculator counts calendar days in your own time zone, from midnight to midnight. The days between two dates include the start date but not the end date, the same way you count nights in a hotel.',
    faq: [
      ['How many days until a date?', 'Enter the date above: the calculator shows the number of days left, counted from today in your time zone. For a countdown that stays on your Home Screen, add the date to CNDWN.'],
      ['How do I count the days between two dates?', 'Enter a start and an end date. The result counts each midnight in between, so from Monday to the next Monday is 7 days.'],
    ],
    breadcrumb: 'Days calculator',
  },
  de: {
    title: 'Tage-Rechner: Tage bis zu einem Datum und zwischen zwei Daten', h1: 'Tage-Rechner',
    desc: 'Berechne die Tage bis oder seit einem Datum oder zwischen zwei Daten, in Tagen, Wochen und Monaten. Kostenlos, privat, ohne Installation.',
    lead: 'Wähle ein Datum und sieh, wie viele Tage noch übrig sind, oder vergleiche zwei Daten.',
    untilH: 'Tage bis oder seit einem Datum', dateLabel: 'Datum', betweenH: 'Tage zwischen zwei Daten', fromLabel: 'Von', toLabel: 'Bis',
    resUntil: 'noch {n} Tage bis {date}', resSince: '{n} Tage seit {date}', resToday: 'Das ist heute.',
    resBetween: '{n} Tage', resWeeks: '{w} Wochen und {d} Tage', resMonths: 'etwa {m} Monate',
    howH: 'So wird gezählt', how: 'Der Rechner zählt Kalendertage in deiner eigenen Zeitzone, von Mitternacht zu Mitternacht. Bei zwei Daten zählt der Starttag mit, der Endtag nicht, so wie Übernachtungen im Hotel.',
    faq: [
      ['Wie viele Tage sind es bis zu einem Datum?', 'Gib oben das Datum ein: Der Rechner zeigt, wie viele Tage ab heute in deiner Zeitzone noch übrig sind. Für einen Countdown auf dem Home-Bildschirm trag das Datum in CNDWN ein.'],
      ['Wie zähle ich die Tage zwischen zwei Daten?', 'Gib Start- und Enddatum ein. Gezählt wird jede Mitternacht dazwischen, von Montag bis zum nächsten Montag sind es also 7 Tage.'],
    ],
    breadcrumb: 'Tage-Rechner',
  },
  es: {
    title: 'Calculadora de días: días hasta una fecha y entre dos fechas', h1: 'Calculadora de días',
    desc: 'Calcula los días que faltan o han pasado desde una fecha, o los días entre dos fechas, en días, semanas y meses. Gratis y sin instalar nada.',
    lead: 'Elige una fecha para ver cuántos días faltan, o compara dos fechas.',
    untilH: 'Días hasta o desde una fecha', dateLabel: 'Fecha', betweenH: 'Días entre dos fechas', fromLabel: 'Desde', toLabel: 'Hasta',
    resUntil: 'Faltan {n} días para el {date}', resSince: 'Han pasado {n} días desde el {date}', resToday: 'Es hoy.',
    resBetween: '{n} días', resWeeks: '{w} semanas y {d} días', resMonths: 'unos {m} meses',
    howH: 'Cómo se cuentan los días', how: 'La calculadora cuenta días naturales en tu zona horaria, de medianoche a medianoche. Entre dos fechas cuenta el día de inicio pero no el de fin, igual que las noches de hotel.',
    faq: [
      ['¿Cuántos días faltan para una fecha?', 'Introduce la fecha arriba: la calculadora muestra los días que faltan desde hoy en tu zona horaria. Para tener la cuenta atrás en la pantalla de inicio, añade la fecha a CNDWN.'],
      ['¿Cómo cuento los días entre dos fechas?', 'Introduce una fecha de inicio y otra de fin. Se cuenta cada medianoche entre ambas, así que de lunes al lunes siguiente hay 7 días.'],
    ],
    breadcrumb: 'Calculadora de días',
  },
  fr: {
    title: 'Calculateur de jours : jours avant une date et entre deux dates', h1: 'Calculateur de jours',
    desc: "Calculez le nombre de jours avant ou depuis une date, ou entre deux dates, en jours, semaines et mois. Gratuit, sans rien installer.",
    lead: 'Choisissez une date pour voir combien de jours il reste, ou comparez deux dates.',
    untilH: 'Jours avant ou depuis une date', dateLabel: 'Date', betweenH: 'Jours entre deux dates', fromLabel: 'Du', toLabel: 'Au',
    resUntil: 'Encore {n} jours avant le {date}', resSince: '{n} jours depuis le {date}', resToday: "C'est aujourd'hui.",
    resBetween: '{n} jours', resWeeks: '{w} semaines et {d} jours', resMonths: 'environ {m} mois',
    howH: 'Comment les jours sont comptés', how: "Le calculateur compte les jours calendaires dans votre fuseau horaire, de minuit à minuit. Entre deux dates, le jour de début est compté mais pas celui de fin, comme les nuits à l'hôtel.",
    faq: [
      ['Combien de jours avant une date ?', "Saisissez la date ci-dessus : le calculateur affiche le nombre de jours restants à partir d'aujourd'hui dans votre fuseau horaire. Pour un compte à rebours sur l'écran d'accueil, ajoutez la date dans CNDWN."],
      ['Comment compter les jours entre deux dates ?', "Saisissez une date de début et une date de fin. Chaque minuit entre les deux est compté : du lundi au lundi suivant, il y a donc 7 jours."],
    ],
    breadcrumb: 'Calculateur de jours',
  },
  ja: {
    title: '日数計算:指定日まで・2つの日付の間の日数', h1: '日数計算',
    desc: '指定した日まであと何日か、何日経ったか、2つの日付の間が何日かを日・週・月で計算。無料、インストール不要。',
    lead: '日付を選ぶと残りの日数がわかります。2つの日付の比較もできます。',
    untilH: '指定日まで・指定日からの日数', dateLabel: '日付', betweenH: '2つの日付の間の日数', fromLabel: '開始日', toLabel: '終了日',
    resUntil: '{date}まであと{n}日', resSince: '{date}から{n}日経過', resToday: '今日です。',
    resBetween: '{n}日', resWeeks: '{w}週と{d}日', resMonths: '約{m}か月',
    howH: '日数の数え方', how: 'お使いの端末のタイムゾーンで、午前0時から午前0時までを1日として数えます。2つの日付の間では、開始日は含み、終了日は含みません(ホテルの宿泊数と同じ数え方です)。',
    faq: [
      ['指定した日まであと何日?', '上に日付を入力すると、今日からの残り日数が表示されます。ホーム画面でカウントダウンしたいときは、その日付をCNDWNに追加しましょう。'],
      ['2つの日付の間の日数の数え方は?', '開始日と終了日を入力してください。間にある午前0時を数えるので、月曜日から次の月曜日までは7日です。'],
    ],
    breadcrumb: '日数計算',
  },
  it: {
    title: 'Calcolatore di giorni: giorni a una data e tra due date', h1: 'Calcolatore di giorni',
    desc: 'Calcola quanti giorni mancano a una data o sono passati, oppure i giorni tra due date, in giorni, settimane e mesi. Gratis, senza installare nulla.',
    lead: 'Scegli una data per vedere quanti giorni mancano, oppure confronta due date.',
    untilH: 'Giorni a una data o da una data', dateLabel: 'Data', betweenH: 'Giorni tra due date', fromLabel: 'Dal', toLabel: 'Al',
    resUntil: 'Mancano {n} giorni al {date}', resSince: 'Sono passati {n} giorni dal {date}', resToday: 'È oggi.',
    resBetween: '{n} giorni', resWeeks: '{w} settimane e {d} giorni', resMonths: 'circa {m} mesi',
    howH: 'Come vengono contati i giorni', how: "Il calcolatore conta i giorni di calendario nel tuo fuso orario, da mezzanotte a mezzanotte. Tra due date conta il giorno di inizio ma non quello di fine, come le notti in albergo.",
    faq: [
      ['Quanti giorni mancano a una data?', 'Inserisci la data qui sopra: il calcolatore mostra i giorni che mancano da oggi nel tuo fuso orario. Per avere il conto alla rovescia sulla schermata Home, aggiungi la data a CNDWN.'],
      ['Come conto i giorni tra due date?', 'Inserisci una data di inizio e una di fine. Viene contata ogni mezzanotte in mezzo, quindi da lunedì al lunedì successivo ci sono 7 giorni.'],
    ],
    breadcrumb: 'Calcolatore di giorni',
  },
  pt: {
    title: 'Calculadora de dias: dias até uma data e entre duas datas', h1: 'Calculadora de dias',
    desc: 'Calcula quantos dias faltam ou passaram desde uma data, ou os dias entre duas datas, em dias, semanas e meses. Grátis, sem instalar nada.',
    lead: 'Escolhe uma data para ver quantos dias faltam, ou compara duas datas.',
    untilH: 'Dias até ou desde uma data', dateLabel: 'Data', betweenH: 'Dias entre duas datas', fromLabel: 'De', toLabel: 'Até',
    resUntil: 'Faltam {n} dias para {date}', resSince: 'Passaram {n} dias desde {date}', resToday: 'É hoje.',
    resBetween: '{n} dias', resWeeks: '{w} semanas e {d} dias', resMonths: 'cerca de {m} meses',
    howH: 'Como os dias são contados', how: 'A calculadora conta dias de calendário no teu fuso horário, de meia-noite a meia-noite. Entre duas datas conta o dia de início mas não o de fim, tal como as noites num hotel.',
    faq: [
      ['Quantos dias faltam para uma data?', 'Introduz a data acima: a calculadora mostra os dias que faltam a partir de hoje no teu fuso horário. Para teres a contagem no ecrã principal, adiciona a data ao CNDWN.'],
      ['Como conto os dias entre duas datas?', 'Introduz uma data de início e uma de fim. Conta-se cada meia-noite entre as duas, por isso de segunda a segunda seguinte são 7 dias.'],
    ],
    breadcrumb: 'Calculadora de dias',
  },
};
