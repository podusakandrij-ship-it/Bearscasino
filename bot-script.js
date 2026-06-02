// ============================================================
// BEARS SHOP — bot-script.js (written from scratch)
// ============================================================

// ── FIREBASE ──
const firebaseConfig = {
  apiKey: "AIzaSyD7F2lrec5XWyMWG7J0uW6IhEKD-LJ4jRY",
  authDomain: "bearscasino-bcded.firebaseapp.com",
  projectId: "bearscasino-bcded",
  storageBucket: "bearscasino-bcded.firebasestorage.app",
  messagingSenderId: "826765969101",
  appId: "1:826765969101:web:ee5e5da5057582f8ba4b84",
  databaseURL: "https://bearscasino-bcded-default-rtdb.europe-west1.firebasedatabase.app"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ── TELEGRAM ──
const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
if (tg) { tg.ready(); tg.expand(); }

const ADMINS = [8216362223, 2067230442];
const myId   = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.id)
               ? String(tg.initDataUnsafe.user.id)
               : 'guest';
const myName = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.first_name)
               ? tg.initDataUnsafe.user.first_name
               : 'Гравець';

// ── СТАН ──
var balance  = 0;
var nick     = myName;
var lang     = 'uk';
var isAdmin  = ADMINS.indexOf(Number(myId)) !== -1;
var stats    = { pumps: 0, ops: 0, wds: 0 };
var history  = [];
var pending  = [];
var chatMsgs = [];
var users    = {};
var wdData   = {};
var curCat   = 'all';
var lightTheme = false;

// ── РІВНІ ──
var LVLS = [
  { lvl:0, emoji:'🐣', color:'#6b7280', next:3  },
  { lvl:1, emoji:'🐻', color:'#22c55e', next:10 },
  { lvl:2, emoji:'🐻‍❄️', color:'#38bdf8', next:25 },
  { lvl:3, emoji:'🔥', color:'#f0b84a', next:50 },
  { lvl:4, emoji:'💎', color:'#a855f7', next:Infinity }
];
function getLvlIdx(ops) {
  for (var i = LVLS.length - 1; i >= 0; i--) {
    var t = i === 0 ? 0 : LVLS[i-1].next;
    if (ops >= t) return i;
  }
  return 0;
}

// ── I18N ──
var LANG = {
  uk: {
    greet:'Привіт 👋', navHome:'Головна', navShop:'Магазин', navChat:'Чат',
    navProfile:'Профіль', navAdmin:'Адмін', cardOwner:'Власник', cardBal:'Баланс',
    statPump:'Прокачок', statOps:'Операцій', statWd:'Виводів',
    svcPump:'Прокачка', svcWd:'Вивід', svcSup:'Підтримка',
    secRecent:'Останні операції', secAll:'Всі →', homeEmpty:'Поки що порожньо',
    shopTitle:'🐻 Пет-магазин', catAll:'Всі', catLeg:'Легендарні', catRare:'Рідкісні', catCom:'Звичайні',
    petLeg:'Легендарний', petRare:'Рідкісний', petCom:'Звичайний',
    chatAdminName:'Адміністрація BEARS SHOP', chatOnline:'онлайн', chatPh:'Напишіть повідомлення...',
    welcomeMsg:'👋 Привіт! Напишіть своє запитання — адміністратор відповість тут!',
    histTitle:'📋 Історія', hsOps:'Операцій', hsWd:'Виведено R', hsPu:'Прокачок',
    histEmpty:'Ще немає операцій',
    psNick:'Нікнейм', psLang:'Мова', psSett:'Налаштування',
    nickPh:'Ваш нік...', nickSave:'Зберегти', nickErr:'⚠️ Введіть нік', nickSaved:'✅ Нік збережено!',
    themeLabel:'Світла тема', themeSub:'Перемкнути', idLabel:'Ваш ID', idCopy:'Копіювати', idCopied:'✅ ID скопійовано!',
    adminTitle:'🔐 Адмін панель', aBalLbl:'Баланс', aAddTitle:'➕ Поповнити', aRemTitle:'➖ Зняти',
    aChatLbl:'💬 Чат', aPendLbl:'Заявки', aUsersLbl:'Користувачі',
    adminNoMsg:'Немає повідомлень', adminNoPend:'Немає нових заявок', adminNoUsers:'Немає',
    adminSend:'Надіслати', adminReplyPh:'Відповідь...',
    stPend:'⏳ В очікуванні', stDone:'✅ Виконано', stRej:'❌ Відхилено',
    admDone:'✅ Вашу заявку виконано!', admRej:'❌ Вашу заявку відхилено.',
    admDoneToast:'✅ Виконано!', admRejToast:'❌ Відхилено',
    admBalAdded:'💰 Ваш баланс поповнено на',
    histPump:'Прокачка петів', histSup:'Звернення до підтримки', histWd:'Вивід ROBUX', histShop:'Покупка',
    fPumpTitle:'Прокачка петів', fPumpS1tag:'1️⃣ Крок 1 з 2', fPumpS1h:'🐾 Прокачка петів',
    fPumpS1p:'Введіть ваш нікнейм у Roblox', fNickLbl:'Нікнейм у Roblox', fNickPh:'Введіть нік...',
    fNickErr:'⚠️ Введіть нік', fPumpS2tag:'2️⃣ Крок 2 з 2', fPumpS2h:'🐾 Кількість петів',
    fPumpS2p:'Виберіть скільки петів взяти на прокачку', fNextBtn:'Далі →', fPumpSendBtn:'Надіслати заявку →',
    fPumpDoneTitle:'Заявку надіслано!', fPumpDoneText:'Як тільки з\'являться вільні пети,\n👨‍💼 адмін відповість у 💬 Чаті',
    fToHomeBtn:'На головну', fOpenChatBtn:'Відкрити чат',
    fSupTitle:'Підтримка', fSupTag:'📩 Підтримка', fSupH:'📩 Написати адміністрації',
    fSupP:'Або відкрийте 💬 Чат', fSupMsgLbl:'Ваше повідомлення', fSupMsgPh:'Напишіть тут...',
    fSupMsgErr:'⚠️ Напишіть повідомлення', fSupBtn:'Надіслати в чат 💬',
    fWdTitle:'Вивід', fWdS1tag:'1️⃣ Крок 1 з 5', fWdBalLbl:'Ваш баланс',
    fWdAmtLbl:'Кількість ROBUX', fWdAmtPh:'Мін. 40 ROBUX', fWdHint:'📌 Мінімальна сума — 40 ROBUX',
    fWdErrNum:'⚠️ Введіть число', fWdErrMin:'⚠️ Мінімум 40 ROBUX', fWdErrFunds:'⚠️ Недостатньо коштів',
    fWdS2tag:'2️⃣ Крок 2 з 5', fWdS2h:'🎮 Нікнейм', fWdS2p:'Ваш нікнейм у Roblox',
    fWdS2lbl:'Нікнейм', fWdS2ph:'Ваш нік...',
    fWdS3tag:'3️⃣ Крок 3 з 5', fWdS3h:'🧩 Назва карти', fWdS3p:'Назва гри з геймпасом',
    fWdS3lbl:'Карта', fWdS3ph:'Назва гри...',
    fWdS4tag:'4️⃣ Крок 4 з 5', fWdS4h:'🎟️ Геймпасс', fWdS4p:'Точна назва геймпасу',
    fWdS4lbl:'Геймпасс', fWdS4ph:'Назва...',
    fWdS5tag:'5️⃣ Крок 5 з 5', fWdGpLbl:'Створіть геймпасс на суму',
    fWdCommH:'ℹ️ Комісія', fWdCommP:'Roblox утримує 30% — тому сума геймпасу більша',
    fWdYes:'✅ Так, створив', fWdNo:'❌ Ні',
    fWdDoneTitle:'Заявку надіслано!', fWdDoneText:'⏳ Адміністрація перевіряє дані\n👨‍💼 Відповідь у 💬 Чаті',
    fWdNewBal:'Новий баланс', fErrVal:'⚠️ Введіть значення',
    fShopTitle:'Пет-магазин', fShopTag:'🛒 Підтвердження', fShopConfH:'ℹ️ Підтвердження',
    fShopConfP:'Натисніть «Замовити» — відповідь у 💬 Чаті', fShopBtn:'Замовити 🛒',
    fShopNoBal:'⚠️ Недостатньо коштів!', fShopNoBalSub:'Баланс', fShopOk:'Зрозуміло',
    fShopDoneTitle:'ДЯКУЄМО!',
    lvlMax:'💎 LVL 4 · Легенда — Максимум!', lvlMaxSub:'Ви на вершині!',
    lvlOps:'до LVL', lvlNames:['Новачок','Гравець','Досвідчений','Про','Легенда']
  }
};
// копіюємо uk як базу для інших мов (спрощено)
LANG.ru = Object.assign({}, LANG.uk, {
  greet:'Привет 👋', navHome:'Главная', navShop:'Магазин', navChat:'Чат',
  navProfile:'Профиль', navAdmin:'Админ', cardOwner:'Владелец', cardBal:'Баланс',
  statPump:'Прокачок', statOps:'Операций', statWd:'Выводов',
  svcPump:'Прокачка', svcWd:'Вывод', svcSup:'Поддержка',
  secRecent:'Последние операции', secAll:'Все →', homeEmpty:'Пока пусто',
  shopTitle:'🐻 Пет-магазин', catAll:'Все', catLeg:'Легендарные', catRare:'Редкие', catCom:'Обычные',
  petLeg:'Легендарный', petRare:'Редкий', petCom:'Обычный',
  chatAdminName:'Администрация BEARS SHOP', chatOnline:'онлайн', chatPh:'Напишите сообщение...',
  welcomeMsg:'👋 Привет! Напишите ваш вопрос — администратор ответит здесь!',
  histTitle:'📋 История', hsOps:'Операций', hsWd:'Выведено R', hsPu:'Прокачок',
  histEmpty:'Нет операций', psNick:'Никнейм', psLang:'Язык', psSett:'Настройки',
  nickPh:'Ваш ник...', nickSave:'Сохранить', nickErr:'⚠️ Введите ник', nickSaved:'✅ Ник сохранён!',
  themeLabel:'Светлая тема', themeSub:'Переключить', idLabel:'Ваш ID', idCopy:'Копировать', idCopied:'✅ ID скопирован!',
  adminTitle:'🔐 Админ панель', aBalLbl:'Баланс', aAddTitle:'➕ Пополнить', aRemTitle:'➖ Снять',
  adminNoMsg:'Нет сообщений', adminNoPend:'Нет новых заявок', adminNoUsers:'Нет',
  adminSend:'Отправить', adminReplyPh:'Ответ...',
  stPend:'⏳ В ожидании', stDone:'✅ Выполнено', stRej:'❌ Отклонено',
  admDone:'✅ Ваша заявка выполнена!', admRej:'❌ Ваша заявка отклонена.',
  histPump:'Прокачка петов', histSup:'Обращение в поддержку', histWd:'Вывод ROBUX', histShop:'Покупка',
  lvlNames:['Новичок','Игрок','Опытный','Про','Легенда']
});
LANG.en = Object.assign({}, LANG.uk, {
  greet:'Hello 👋', navHome:'Home', navShop:'Shop', navChat:'Chat',
  navProfile:'Profile', navAdmin:'Admin', cardOwner:'Owner', cardBal:'Balance',
  statPump:'Leveled', statOps:'Operations', statWd:'Withdrawals',
  svcPump:'Leveling', svcWd:'Withdraw', svcSup:'Support',
  secRecent:'Recent operations', secAll:'All →', homeEmpty:'Nothing yet',
  shopTitle:'🐻 Pet Shop', catAll:'All', catLeg:'Legendary', catRare:'Rare', catCom:'Common',
  petLeg:'Legendary', petRare:'Rare', petCom:'Common',
  chatAdminName:'BEARS SHOP Administration', chatOnline:'online', chatPh:'Write a message...',
  welcomeMsg:'👋 Hi! Write your question — admin will reply here!',
  histTitle:'📋 History', hsOps:'Operations', hsWd:'Withdrawn R', hsPu:'Leveled',
  histEmpty:'No operations yet', psNick:'Nickname', psLang:'Language', psSett:'Settings',
  nickPh:'Your nick...', nickSave:'Save', nickErr:'⚠️ Enter a nickname', nickSaved:'✅ Nickname saved!',
  themeLabel:'Light theme', themeSub:'Toggle', idLabel:'Your ID', idCopy:'Copy', idCopied:'✅ ID copied!',
  stPend:'⏳ Pending', stDone:'✅ Done', stRej:'❌ Rejected',
  admDone:'✅ Your request is done!', admRej:'❌ Your request was rejected.',
  histPump:'Pet leveling', histSup:'Support request', histWd:'ROBUX withdrawal', histShop:'Purchase',
  lvlNames:['Beginner','Player','Experienced','Pro','Legend']
});
LANG.pl = Object.assign({}, LANG.uk, {
  greet:'Cześć 👋', navHome:'Główna', navShop:'Sklep', navChat:'Czat',
  navProfile:'Profil', navAdmin:'Admin', cardOwner:'Właściciel', cardBal:'Saldo',
  statPump:'Ulepszono', statOps:'Operacji', statWd:'Wypłat',
  svcPump:'Ulepszanie', svcWd:'Wypłata', svcSup:'Wsparcie',
  secRecent:'Ostatnie operacje', secAll:'Wszystkie →', homeEmpty:'Jeszcze nic',
  shopTitle:'🐻 Sklep z petami', catAll:'Wszystkie', catLeg:'Legendarne', catRare:'Rzadkie', catCom:'Zwykłe',
  petLeg:'Legendarny', petRare:'Rzadki', petCom:'Zwykły',
  chatAdminName:'Administracja BEARS SHOP', chatOnline:'online', chatPh:'Napisz wiadomość...',
  welcomeMsg:'👋 Cześć! Napisz pytanie — admin odpowie tutaj!',
  histEmpty:'Brak operacji', psNick:'Pseudonim', psLang:'Język',
  nickPh:'Twój nick...', nickSave:'Zapisz', nickErr:'⚠️ Wpisz nick', nickSaved:'✅ Nick zapisany!',
  themeLabel:'Jasny motyw', themeSub:'Przełącz', idCopy:'Kopiuj', idCopied:'✅ ID skopiowane!',
  stPend:'⏳ Oczekuje', stDone:'✅ Wykonano', stRej:'❌ Odrzucono',
  admDone:'✅ Twoje zgłoszenie wykonano!', admRej:'❌ Twoje zgłoszenie odrzucono.',
  histPump:'Ulepszanie petów', histSup:'Zgłoszenie wsparcia', histWd:'Wypłata ROBUX', histShop:'Zakup',
  lvlNames:['Początkujący','Gracz','Doświadczony','Pro','Legenda']
});

function L(k) { return (LANG[lang] || LANG.uk)[k] || k; }

// ── УТИЛІТИ ──
function el(id) { return document.getElementById(id); }
function setText(id, v) { var e = el(id); if (e) e.textContent = v; }
function showToast(msg) {
  var t = el('toast'); if (!t) return;
  t.textContent = msg; t.style.opacity = '1';
  clearTimeout(t._t); t._t = setTimeout(function(){ t.style.opacity = '0'; }, 2200);
}
function nowTime() {
  return new Date().toLocaleTimeString('uk-UA', { hour:'2-digit', minute:'2-digit' });
}
function scrollBottom(id) {
  setTimeout(function(){ var e = el(id); if (e) e.scrollTop = e.scrollHeight; }, 80);
}

// ── БАЛАНС ──
function updateBal(v) {
  balance = Math.floor(v);
  setText('cBal', balance);
  setText('fbal', balance);
  setText('shopBal', balance);
}

// ── НІК ──
function updateNickUI() {
  setText('homeNick', nick);
  setText('profNick', nick);
  setText('cName', nick.toUpperCase());
  var ni = el('nickIn'); if (ni) ni.value = nick;
}

// ── РІВНІ UI ──
function updateLvlUI() {
  var ops = stats.ops;
  var li = getLvlIdx(ops);
  var l = LVLS[li];
  var names = L('lvlNames');
  var name = names[li] || '';
  var prev = li === 0 ? 0 : LVLS[li-1].next;
  var nxt = l.next === Infinity ? prev + 50 : l.next;
  var pct = l.next === Infinity ? 100 : Math.min(100, Math.round((ops - prev) / (nxt - prev) * 100));

  var cLvl = el('cLvl');
  if (cLvl) { cLvl.textContent = 'LVL ' + l.lvl + ' ' + l.emoji; cLvl.style.color = l.color; cLvl.style.borderColor = l.color + '55'; }
  var pr = el('profRank');
  if (pr) pr.innerHTML = '<span style="color:'+l.color+'">'+l.emoji+'</span><span>LVL '+l.lvl+' · '+name+'</span>';
  var rf = el('rbFill');
  if (rf) { rf.style.width = pct + '%'; rf.style.background = l.color; }
  if (l.next !== Infinity) {
    setText('rbTitle', l.emoji + ' LVL ' + l.lvl + ' → ' + LVLS[li+1].emoji + ' LVL ' + (l.lvl+1));
    setText('rbNext', (nxt - ops) + ' ' + L('lvlOps') + ' ' + (l.lvl+1));
  } else {
    setText('rbTitle', L('lvlMax'));
    setText('rbNext', L('lvlMaxSub'));
  }
}

// ── СТАТИ UI ──
function updateStatsUI() {
  setText('stPump', stats.pumps); setText('psPump', stats.pumps);
  setText('stOps',  stats.ops);   setText('psOps',  stats.ops);
  setText('stWd',   stats.wds);   setText('psWd',   stats.wds);
  setText('hsTx',   stats.ops);   setText('hsWd',   stats.wds); setText('hsPu', stats.pumps);
}

// ── МОВА ──
function setLang(l) {
  lang = l;
  document.querySelectorAll('.lbtn').forEach(function(b){ b.classList.remove('on'); });
  var lb = el('lang-' + l); if (lb) lb.classList.add('on');
  applyLang();
  showToast('✅');
  db.ref('botdata/' + myId + '/lang').set(l);
}

// ── ТЕМА ──
function toggleTheme() {
  lightTheme = !lightTheme;
  document.body.classList.toggle('light', lightTheme);
  var ts = el('tswitch'); if (ts) ts.classList.toggle('on', lightTheme);
}

// ── COPY ID ──
function copyId() {
  var id = '#' + myId;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(id).then(function(){ showToast(L('idCopied')); });
  } else {
    showToast(id);
  }
}

// ── ЗБЕРЕЖЕННЯ НІКА ──
function saveNick() {
  var inp = el('nickIn'); if (!inp) return;
  var v = inp.value.trim();
  var errEl = el('nickErr');
  if (!v) { if (errEl) errEl.textContent = L('nickErr'); return; }
  if (errEl) errEl.textContent = '';
  nick = v;
  updateNickUI();
  inp.blur();
  showToast(L('nickSaved'));
  db.ref('players/' + myId + '/name').set(v);
}

// ── НАВІГАЦІЯ ──
function switchTab(tab) {
  document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
  document.querySelectorAll('.bni').forEach(function(n){ n.classList.remove('on'); });
  var page = el('page-' + tab); if (page) page.classList.add('active');
  var nav  = el('nav-'  + tab); if (nav)  nav.classList.add('on');
  if (tab === 'shop')    { renderShop(curCat); }
  if (tab === 'profile') { updateStatsUI(); updateLvlUI(); setText('uidVal', '#' + myId); }
  if (tab === 'admin')   { renderAdmin(); }
  if (tab === 'chat')    { var dot = el('chatDot'); if (dot) dot.classList.remove('show'); scrollBottom('chatMsgs'); }
  if (tab === 'history') { renderHistory(); }
  setText('fbal', balance);
  setText('shopBal', balance);
}

// ── APPLY LANG ──
function applyLang() {
  setText('greetTxt',       L('greet'));
  setText('nl-home',        L('navHome'));
  setText('nl-shop',        L('navShop'));
  setText('nl-chat',        L('navChat'));
  setText('nl-profile',     L('navProfile'));
  setText('nl-admin',       L('navAdmin'));
  setText('cOwnerLbl',      L('cardOwner'));
  setText('cBalLbl',        L('cardBal'));
  setText('stPumpL',        L('statPump'));
  setText('stOpsL',         L('statOps'));
  setText('stWdL',          L('statWd'));
  setText('psPumpL',        L('statPump'));
  setText('psOpsL',         L('statOps'));
  setText('psWdL',          L('statWd'));
  setText('svcPump',        L('svcPump'));
  setText('svcWd',          L('svcWd'));
  setText('svcSup',         L('svcSup'));
  setText('secRecent',      L('secRecent'));
  setText('secAll',         L('secAll'));
  setText('shopTitleTxt',   L('shopTitle'));
  setText('catAll',         L('catAll'));
  setText('catLeg',         L('catLeg'));
  setText('catRare',        L('catRare'));
  setText('catCom',         L('catCom'));
  setText('chatAdminName',  L('chatAdminName'));
  setText('chatOnline',     L('chatOnline'));
  setText('welcomeMsg',     L('welcomeMsg'));
  var ci = el('chatInp'); if (ci) ci.placeholder = L('chatPh');
  setText('histTitle',      L('histTitle'));
  setText('hsOpsL',         L('hsOps'));
  setText('hsWdL',          L('hsWd'));
  setText('hsPuL',          L('hsPu'));
  setText('psNickLbl',      L('psNick'));
  setText('psLangLbl',      L('psLang'));
  setText('psSettLbl',      L('psSett'));
  var ni = el('nickIn'); if (ni) ni.placeholder = L('nickPh');
  setText('nickSvBtn',      L('nickSave'));
  setText('themeLbl',       L('themeLabel'));
  setText('themeSubLbl',    L('themeSub'));
  setText('idLbl',          L('idLabel'));
  setText('copyLbl',        L('idCopy'));
  setText('adminTitle',     L('adminTitle'));
  setText('aBalLbl',        L('aBalLbl'));
  setText('aAddTitle',      L('aAddTitle'));
  setText('aRemTitle',      L('aRemTitle'));
  setText('aChatLbl',       L('aChatLbl'));
  setText('aPendLbl',       L('aPendLbl'));
  setText('aUsersLbl',      L('aUsersLbl'));
  setText('adminSendBtn',   L('adminSend'));
  var ri = el('adminReplyInp'); if (ri) ri.placeholder = L('adminReplyPh');
  renderHomePrev();
  renderHistory();
  renderShop(curCat);
  updateLvlUI();
}

// ── ІСТОРІЯ ──
var TC = { pump:'rgba(224,90,24,.15)', support:'rgba(56,189,248,.15)', wd:'rgba(200,146,42,.15)', shop:'rgba(34,197,94,.15)' };
var TI = { pump:'🐾', support:'📩', wd:'💰', shop:'🛒' };

function stBadge(s, cls) {
  var m = { pending: L('stPend'), done: L('stDone'), rejected: L('stRej') };
  var c = { pending:'s-p', done:'s-d', rejected:'s-r' };
  return '<span class="' + (cls||'hpi-st') + ' ' + (c[s]||'') + '">' + (m[s]||s) + '</span>';
}

function addHistory(item) {
  item.id     = Date.now();
  item.status = 'pending';
  item.date   = new Date().toLocaleString('uk-UA', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
  history.unshift(item);
  stats.ops++;
  if (item.type === 'pump') stats.pumps++;
  if (item.type === 'wd')   stats.wds++;
  updateStatsUI();
  updateLvlUI();
  renderHomePrev();
  pending.push(item);
  users['#' + myId] = { nick: nick, balance: balance };
  saveToFirebase();
}

function renderHomePrev() {
  var e = el('homePrev'); if (!e) return;
  if (!history.length) { e.innerHTML = '<div class="empty">' + L('homeEmpty') + '</div>'; return; }
  e.innerHTML = history.slice(0, 3).map(function(h) {
    return '<div class="hpi"><div class="hpi-ic" style="background:'+TC[h.type]+'">'+TI[h.type]+'</div>'
      + '<div class="hpi-info"><div class="hpi-name">'+h.label+'</div><div class="hpi-date">'+h.date+'</div></div>'
      + stBadge(h.status, 'hpi-st') + '</div>';
  }).join('');
}

function renderHistory() {
  var e = el('histList'); if (!e) return;
  if (!history.length) { e.innerHTML = '<div class="hn">' + L('histEmpty') + '</div>'; return; }
  e.innerHTML = history.map(function(h) {
    var amt = h.amount ? ((h.amount > 0 ? '+' : '') + h.amount + 'R') : '—';
    var ac  = h.amount ? (h.amount > 0 ? 'var(--green)' : 'var(--red)') : 'var(--sub)';
    return '<div class="hli"><div class="hli-ic" style="background:'+TC[h.type]+'">'+TI[h.type]+'</div>'
      + '<div class="hli-info"><div class="hli-nm">'+h.label+'</div><div class="hli-dt">'+(h.detail||'')+'</div></div>'
      + '<div class="hli-r"><div class="hli-amt" style="color:'+ac+'">'+amt+'</div>'
      + '<div class="hli-date">'+h.date+'</div>' + stBadge(h.status, 'hli-st') + '</div></div>';
  }).join('');
}

// ── ЧАТ ──
function pushMsg(from, text, time) {
  chatMsgs.push({ from: from, text: text, time: time, nick: from === 'admin' ? 'Admin' : nick });
  var msgs = el('chatMsgs'); if (!msgs) return;
  var wrap = document.createElement('div');
  wrap.className = 'mw ' + (from === 'user' ? 'me' : 'adm');
  wrap.innerHTML = '<div class="mb">' + text + '</div><div class="mt">' + time + '</div>';
  msgs.appendChild(wrap);
  scrollBottom('chatMsgs');
  if (el('page-admin') && el('page-admin').classList.contains('active')) renderAdmin();
  saveToFirebase();
}

function userSend() {
  var inp = el('chatInp'); if (!inp) return;
  var text = inp.value.trim(); if (!text) return;
  inp.value = ''; inp.style.height = '';
  pushMsg('user', text, nowTime());
  if (tg) { try { tg.sendData(JSON.stringify({ action: 'chat', message: text })); } catch(e){} }
}

function adminReply() {
  var inp = el('adminReplyInp'); if (!inp) return;
  var text = inp.value.trim(); if (!text) { showToast('⚠️'); return; }
  inp.value = '';
  pushMsg('admin', text, nowTime());
  var dot = el('chatDot');
  if (dot && !(el('page-chat') && el('page-chat').classList.contains('active'))) dot.classList.add('show');
  showToast('✅');
}

// ── МАГАЗИН ──
var PETS = [
  { id:1, key:'MFR Frost Fury',    emoji:'🦋', rk:'petLeg', cat:'legendary', price:350, tag:'hot'  },
  { id:2, key:'NFR Shadow Dragon', emoji:'🐉', rk:'petLeg', cat:'legendary', price:500, tag:'rare' },
  { id:3, key:'FR Crow',           emoji:'🦅', rk:'petLeg', cat:'legendary', price:280, tag:null   },
  { id:4, key:'MFR Parrot',        emoji:'🦜', rk:'petRare', cat:'rare',     price:180, tag:'new'  },
  { id:5, key:'NFR Unicorn',       emoji:'🦄', rk:'petRare', cat:'rare',     price:150, tag:null   },
  { id:6, key:'FR Robin',          emoji:'🐦', rk:'petRare', cat:'rare',     price:90,  tag:null   },
  { id:7, key:'Normal Cat',        emoji:'🐱', rk:'petCom',  cat:'common',   price:20,  tag:'new'  },
  { id:8, key:'Normal Dog',        emoji:'🐶', rk:'petCom',  cat:'common',   price:15,  tag:null   },
  { id:9, key:'Normal Bunny',      emoji:'🐰', rk:'petCom',  cat:'common',   price:10,  tag:null   }
];
var RC = { petLeg:'var(--gold)', petRare:'var(--purple)', petCom:'var(--sub)' };

function filterCat(cat, btn) {
  curCat = cat;
  document.querySelectorAll('.cat').forEach(function(b){ b.classList.remove('on'); });
  btn.classList.add('on');
  renderShop(cat);
}

function renderShop(cat) {
  setText('shopBal', balance);
  var list = cat === 'all' ? PETS : PETS.filter(function(p){ return p.cat === cat; });
  var grid = el('petGrid'); if (!grid) return;
  grid.innerHTML = list.map(function(p) {
    var tagHtml = p.tag ? '<div class="ptag t-'+p.tag+'">'+(p.tag==='hot'?'🔥 HOT':p.tag==='new'?'✨ NEW':'💎 RARE')+'</div>' : '';
    return '<div class="pcard" onclick="buyPet('+p.id+')">'
      + tagHtml
      + '<span class="p-em">'+p.emoji+'</span>'
      + '<div class="p-nm">'+p.key+'</div>'
      + '<div class="p-ra" style="color:'+RC[p.rk]+'">'+L(p.rk)+'</div>'
      + '<div class="p-pr">💰 '+p.price+' R</div></div>';
  }).join('');
}

function buyPet(id) {
  var pet = PETS.find(function(p){ return p.id === id; });
  if (pet) openFlowWith('shop-pet', pet);
}

// ── АДМІН ──
function renderAdmin() {
  var conv = el('adminConv'); if (!conv) return;
  conv.innerHTML = chatMsgs.length
    ? chatMsgs.map(function(m) {
        return '<div class="acmsg '+(m.from==='admin'?'fa':'fu')+'">'
          + '<div class="acmsg-top"><span class="acmsg-who">'+(m.from==='admin'?'👨‍💼 Admin':'👤 '+m.nick)+'</span>'
          + '<span class="acmsg-time">'+m.time+'</span></div>'
          + '<div class="acmsg-txt">'+m.text+'</div></div>';
      }).join('')
    : '<div class="pend-none">' + L('adminNoMsg') + '</div>';

  var pend = pending.filter(function(p){ return p.status === 'pending'; });
  var pl = el('pendingList');
  if (pl) pl.innerHTML = pend.length
    ? pend.map(function(p) {
        return '<div class="pend-row"><div class="pend-top"><span class="pend-type">'+TI[p.type]+' '+p.label+'</span>'
          + '<span class="pend-date">'+p.date+'</span></div>'
          + '<div class="pend-info">'+(p.detail||'—')+'</div>'
          + '<div class="pend-btns"><button class="pbtn-ok" onclick="resolveOp('+p.id+',\'done\')">'+L('stDone')+'</button>'
          + '<button class="pbtn-no" onclick="resolveOp('+p.id+',\'rejected\')">'+L('stRej')+'</button></div></div>';
      }).join('')
    : '<div class="pend-none">' + L('adminNoPend') + '</div>';

  var ul = el('userList');
  var uArr = Object.entries(users);
  if (ul) ul.innerHTML = uArr.length
    ? uArr.map(function(e) {
        return '<div class="urow"><div class="urow-info"><div class="urow-nick">'+e[1].nick+'</div>'
          + '<div class="urow-id">'+e[0]+'</div></div><div class="urow-bal">'+e[1].balance+' R</div></div>';
      }).join('')
    : '<div class="pend-none">' + L('adminNoUsers') + '</div>';
}

function resolveOp(id, status) {
  var item = history.find(function(h){ return h.id === id; });
  var pi   = pending.find(function(h){ return h.id === id; });
  if (item) item.status = status;
  if (pi)   pi.status   = status;
  pushMsg('admin', status === 'done' ? L('admDone') : L('admRej'), nowTime());
  var dot = el('chatDot');
  if (dot && !(el('page-chat') && el('page-chat').classList.contains('active'))) dot.classList.add('show');
  renderAdmin(); renderHomePrev(); renderHistory();
  showToast(status === 'done' ? L('admDoneToast') : L('admRejToast'));
}

function adminAdd() {
  var uid = (el('aAddId')||{}).value; var amt = parseInt((el('aAddAmt')||{}).value);
  if (!uid || !amt) return;
  uid = uid.replace('#','');
  db.ref('players/' + uid + '/botBalance').transaction(function(b){ return (b||0) + amt; });
  showToast('✅ +' + amt + ' R');
  if (el('aAddId')) el('aAddId').value = '';
  if (el('aAddAmt')) el('aAddAmt').value = '';
}

function adminRem() {
  var uid = (el('aRemId')||{}).value; var amt = parseInt((el('aRemAmt')||{}).value);
  if (!uid || !amt) return;
  uid = uid.replace('#','');
  db.ref('players/' + uid + '/botBalance').transaction(function(b){ return Math.max(0, (b||0) - amt); });
  showToast('✅ -' + amt + ' R');
  if (el('aRemId')) el('aRemId').value = '';
  if (el('aRemAmt')) el('aRemAmt').value = '';
}

// ── FIREBASE SYNC ──
function saveToFirebase() {
  db.ref('botdata/' + myId).set({
    stats: stats,
    lang:  lang,
    nick:  nick
  });
}

function initFirebase() {
  // Баланс (realtime)
  db.ref('players/' + myId + '/botBalance').on('value', function(snap) {
    updateBal(snap.val() || 0);
  });
  // Ім'я
  db.ref('players/' + myId + '/name').once('value', function(snap) {
    if (snap.val()) { nick = snap.val(); updateNickUI(); }
  });
  // Фото
  db.ref('players/' + myId + '/photo').once('value', function(snap) {
    if (snap.val()) setPhoto(snap.val());
  });
  // Дані бота
  db.ref('botdata/' + myId).once('value', function(snap) {
    var d = snap.val();
    if (d) {
      if (d.stats) { Object.assign(stats, d.stats); updateStatsUI(); updateLvlUI(); }
      if (d.lang)  { lang = d.lang; applyLang(); }
      if (d.nick)  { nick = d.nick; updateNickUI(); }
    }
  });
}

// ── ФОТО ──
function setPhoto(b64) {
  document.querySelectorAll('.av-circle').forEach(function(av) {
    av.innerHTML = '<img src="'+b64+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%">';
    av.style.overflow = 'hidden'; av.style.padding = '0';
  });
}

document.addEventListener('click', function(e) {
  var av = e.target.closest && e.target.closest('.av-circle');
  if (!av) return;
  var inp = el('_photo_inp');
  if (!inp) {
    inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*'; inp.id = '_photo_inp';
    inp.style.display = 'none'; document.body.appendChild(inp);
    inp.addEventListener('change', function(ev) {
      var file = ev.target.files[0]; if (!file) return;
      var r = new FileReader();
      r.onload = function(e2) {
        var img = new Image();
        img.onload = function() {
          var c = document.createElement('canvas'); c.width = c.height = 256;
          var ctx = c.getContext('2d');
          var sz = Math.min(img.width, img.height);
          ctx.drawImage(img, (img.width-sz)/2, (img.height-sz)/2, sz, sz, 0, 0, 256, 256);
          var b64 = c.toDataURL('image/jpeg', 0.8);
          setPhoto(b64);
          db.ref('players/' + myId + '/photo').set(b64);
          showToast('✅ Фото оновлено!');
        };
        img.src = e2.target.result;
      };
      r.readAsDataURL(file);
    });
  }
  inp.click();
});

// ── FLOW ──
function openFlow(name) { openFlowWith(name, null); }
function openFlowWith(name, data) {
  var titles = { pump: L('fPumpTitle'), support: L('fSupTitle'), withdraw: L('fWdTitle'), 'shop-pet': L('fShopTitle') };
  setText('ftitle', titles[name] || name);
  setText('fbal', balance);
  var c = el('fcontent'); if (!c) return;
  c.innerHTML = '';
  FLOWS[name] && FLOWS[name](c, data);
  var fov = el('fov'); if (fov) fov.classList.add('open');
}
function closeFlow() { var fov = el('fov'); if (fov) fov.classList.remove('open'); }

function mk(t, cn) { var e = document.createElement(t); if (cn) e.className = cn; return e; }
function mkTag(l)   { var d = mk('div','ftag'); d.textContent = l; return d; }
function mkCard(h, p){ var c = mk('div','fcard'); c.innerHTML='<h3>'+h+'</h3><p>'+p+'</p>'; return c; }
function mkIg(lbl)  {
  var g = mk('div','fig'); var l = mk('div','filbl'); l.textContent = lbl; g.appendChild(l);
  for (var i = 1; i < arguments.length; i++) g.appendChild(arguments[i]);
  return g;
}
function mkIn(ph, tp){ var i = mk('input','fif'); i.placeholder = ph; i.type = tp||'text'; return i; }
function mkTa(ph, r) { var t = mk('textarea','fif'); t.placeholder = ph; t.rows = r||3; return t; }
function mkErr()    { return mk('div','ferr'); }
function mkBtn(l, d){ var b = mk('button','fbtn fbtn-g'); b.textContent = l; if(d) b.disabled = true; return b; }
function mkBody()   { return mk('div','fbody'); }

var FLOWS = {};

// Прокачка — крок 1
FLOWS.pump = function(c) {
  var b = mkBody();
  b.appendChild(mkTag(L('fPumpS1tag')));
  b.appendChild(mkCard(L('fPumpS1h'), L('fPumpS1p')));
  var inp = mkIn(L('fNickPh')), err = mkErr();
  b.appendChild(mkIg(L('fNickLbl'), inp, err));
  var btn = mkBtn(L('fNextBtn'));
  btn.onclick = function() {
    var v = inp.value.trim();
    if (!v) { err.textContent = L('fNickErr'); return; }
    c.innerHTML = ''; pumpS2(c, v);
  };
  b.appendChild(btn); c.appendChild(b);
};

function pumpS2(c, rNick) {
  var b = mkBody();
  b.appendChild(mkTag(L('fPumpS2tag')));
  b.appendChild(mkCard(L('fPumpS2h'), L('fPumpS2p')));
  var row = mk('div','fcrow'); var sel = 0;
  var btn = mkBtn(L('fPumpSendBtn'), true);
  for (var i = 1; i <= 5; i++) {
    (function(n){
      var cb = mk('button','fcb'); cb.textContent = String(n);
      cb.onclick = function() {
        row.querySelectorAll('.fcb').forEach(function(x){ x.classList.remove('sel'); });
        cb.classList.add('sel'); sel = n; btn.disabled = false;
      };
      row.appendChild(cb);
    })(i);
  }
  b.appendChild(row);
  btn.onclick = function() {
    addHistory({ type:'pump', label:L('histPump'), detail:L('fNickLbl')+': '+rNick+' × '+sel });
    c.innerHTML = '';
    var wb = mkBody(), wc = mk('div','fwc');
    wc.innerHTML = '<div class="fwi">⏳</div><div class="fwt">'+L('fPumpDoneTitle')+'</div>'
      + '<div class="fwx">'+L('fPumpDoneText').replace('\n','<br>')+'</div>';
    wb.appendChild(wc);
    var fb = mkBtn(L('fToHomeBtn')); fb.style.marginTop = '12px';
    fb.onclick = function(){ closeFlow(); switchTab('home'); };
    wb.appendChild(fb); c.appendChild(wb);
    if (tg) { try { tg.sendData(JSON.stringify({ action:'pump', nick:rNick, count:sel })); } catch(e){} }
  };
  b.appendChild(btn); c.appendChild(b);
}

// Підтримка
FLOWS.support = function(c) {
  var b = mkBody();
  b.appendChild(mkTag(L('fSupTag')));
  b.appendChild(mkCard(L('fSupH'), L('fSupP')));
  var ta = mkTa(L('fSupMsgPh'), 5), err = mkErr();
  b.appendChild(mkIg(L('fSupMsgLbl'), ta, err));
  var btn = mkBtn(L('fSupBtn'));
  btn.onclick = function() {
    var v = ta.value.trim();
    if (!v) { err.textContent = L('fSupMsgErr'); return; }
    addHistory({ type:'support', label:L('histSup'), detail: v.slice(0,50)+(v.length>50?'…':'') });
    pushMsg('user', v, nowTime());
    closeFlow(); switchTab('chat');
    if (tg) { try { tg.sendData(JSON.stringify({ action:'support', message:v })); } catch(e){} }
  };
  b.appendChild(btn); c.appendChild(b);
};

// Вивід
FLOWS.withdraw = function(c) { wdData = {}; wdS1(c); };

function wdS1(c) {
  var b = mkBody();
  b.appendChild(mkTag(L('fWdS1tag')));
  var bc = mk('div','fbc');
  bc.innerHTML = '<div class="fbc-lbl">'+L('fWdBalLbl')+'</div><div class="fbc-amt">'+balance+'</div><div class="fbc-unit">ROBUX</div>';
  b.appendChild(bc);
  var inp = mkIn(L('fWdAmtPh'),'number'), err = mkErr();
  var hint = mk('div'); hint.style.cssText='font-size:10px;color:var(--sub);padding:0 2px';
  hint.textContent = L('fWdHint');
  b.appendChild(mkIg(L('fWdAmtLbl'), inp, err, hint));
  var btn = mkBtn(L('fNextBtn'));
  btn.onclick = function() {
    var amt = parseInt(inp.value);
    if (!inp.value || isNaN(amt)) { err.textContent = L('fWdErrNum'); return; }
    if (amt < 40)      { err.textContent = L('fWdErrMin');   return; }
    if (amt > balance) { err.textContent = L('fWdErrFunds'); return; }
    wdData.amount = amt; c.innerHTML = ''; wdS2(c);
  };
  b.appendChild(btn); c.appendChild(b);
}

function wdStep(c, tag, h, p, lbl, ph, next, field) {
  var b = mkBody();
  b.appendChild(mkTag(tag));
  b.appendChild(mkCard(h, p));
  var inp = mkIn(ph), err = mkErr();
  b.appendChild(mkIg(lbl, inp, err));
  var btn = mkBtn(L('fNextBtn'));
  btn.onclick = function() {
    var v = inp.value.trim();
    if (!v) { err.textContent = L('fErrVal'); return; }
    wdData[field] = v; c.innerHTML = ''; next(c);
  };
  b.appendChild(btn); c.appendChild(b);
}

function wdS2(c){ wdStep(c, L('fWdS2tag'), L('fWdS2h'), L('fWdS2p'), L('fWdS2lbl'), L('fWdS2ph'), wdS3, 'nick'); }
function wdS3(c){ wdStep(c, L('fWdS3tag'), L('fWdS3h'), L('fWdS3p'), L('fWdS3lbl'), L('fWdS3ph'), wdS4, 'map'); }
function wdS4(c){ wdStep(c, L('fWdS4tag'), L('fWdS4h'), L('fWdS4p'), L('fWdS4lbl'), L('fWdS4ph'), wdS5, 'gamepass'); }

function wdS5(c) {
  var amt = wdData.amount, gp = Math.ceil(amt / 0.7);
  wdData.gpAmount = gp;
  var b = mkBody();
  b.appendChild(mkTag(L('fWdS5tag')));
  var gpb = mk('div','fgpb');
  gpb.innerHTML = '<div class="fgp-l">'+L('fWdGpLbl')+'</div><div class="fgp-v">'+gp+' ROBUX</div><div class="fgp-n">'+gp+' − 30% = '+amt+' ROBUX</div>';
  b.appendChild(gpb);
  b.appendChild(mkCard(L('fWdCommH'), L('fWdCommP')));
  var yn = mk('div','fynr');
  var yes = mk('button','fyes'); yes.textContent = L('fWdYes');
  var no  = mk('button','fno');  no.textContent  = L('fWdNo');
  yes.onclick = function() {
    var nb = balance - amt;
    db.ref('players/' + myId + '/botBalance').set(nb);
    updateBal(nb);
    addHistory({ type:'wd', label:L('histWd'), detail:wdData.gamepass+' · '+wdData.nick, amount:-amt });
    c.innerHTML = ''; wdS6(c, nb);
    if (tg) { try { tg.sendData(JSON.stringify(Object.assign({action:'withdraw'}, wdData))); } catch(e){} }
  };
  no.onclick = function(){ closeFlow(); switchTab('home'); };
  yn.appendChild(yes); yn.appendChild(no); b.appendChild(yn); c.appendChild(b);
}

function wdS6(c, nb) {
  var b = mkBody(), wc = mk('div','fwc');
  wc.innerHTML = '<div class="fwi">📬</div><div class="fwt">'+L('fWdDoneTitle')+'</div>'
    + '<div class="fwx">'+L('fWdDoneText').replace('\n','<br>')+'</div>';
  b.appendChild(wc);
  var bc = mk('div','fbc'); bc.style.marginTop='4px';
  bc.innerHTML = '<div class="fbc-lbl">'+L('fWdNewBal')+'</div><div class="fbc-amt">'+nb+'</div><div class="fbc-unit">ROBUX</div>';
  b.appendChild(bc);
  var btn = mkBtn(L('fToHomeBtn')); btn.style.marginTop='4px';
  btn.onclick = function(){ closeFlow(); switchTab('home'); };
  b.appendChild(btn); c.appendChild(b);
}

// Магазин — купівля
FLOWS['shop-pet'] = function(c, pet) {
  var b = mkBody();
  b.appendChild(mkTag(L('fShopTag')));
  var pc = mk('div','fpconf');
  pc.innerHTML = '<div class="fpc-e">'+pet.emoji+'</div><div class="fpc-n">'+pet.key+'</div>'
    + '<div class="fpc-r" style="color:'+RC[pet.rk]+'">'+L(pet.rk)+'</div>'
    + '<div class="fpc-p">💰 '+pet.price+' ROBUX</div>';
  b.appendChild(pc);
  if (pet.price > balance) {
    var w = mk('div','fcard');
    w.innerHTML = '<p style="color:var(--red)">'+L('fShopNoBal')+'<br>'+L('fShopNoBalSub')+': <b>'+balance+' ROBUX</b></p>';
    b.appendChild(w);
    var btn = mkBtn(L('fShopOk')); btn.onclick = closeFlow; b.appendChild(btn);
  } else {
    b.appendChild(mkCard(L('fShopConfH'), L('fShopConfP')));
    var btn = mkBtn(L('fShopBtn'));
    btn.onclick = function() {
      addHistory({ type:'shop', label:L('histShop')+': '+pet.key, detail:L(pet.rk)+' · '+pet.price+' R', amount:-pet.price });
      c.innerHTML = '';
      var wb = mkBody(), sw = mk('div','fsw');
      sw.innerHTML = '<div class="fsi">✅</div><div class="fst">'+L('fShopDoneTitle')+'</div><div class="fsx">'+pet.key+'</div>';
      var fb = mkBtn(L('fOpenChatBtn'));
      fb.onclick = function(){ closeFlow(); switchTab('chat'); };
      wb.appendChild(sw); wb.appendChild(fb); c.appendChild(wb);
      if (tg) { try { tg.sendData(JSON.stringify({ action:'shop', item:pet.key, price:pet.price })); } catch(e){} }
    };
    b.appendChild(btn);
  }
  c.appendChild(b);
};

// ── CHAT INPUT EVENTS ──
var chatInpEl = el('chatInp');
if (chatInpEl) {
  chatInpEl.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
  });
  chatInpEl.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); userSend(); }
  });
}
var adminInpEl = el('adminReplyInp');
if (adminInpEl) {
  adminInpEl.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); adminReply(); }
  });
}

// ── ІНІЦІАЛІЗАЦІЯ ──
(function init() {
  // Адмін навігація
  if (isAdmin) { var an = el('nav-admin'); if (an) an.style.display = ''; }

  // Початкові значення UI
  setText('uidVal', '#' + myId);
  updateNickUI();
  applyLang();
  updateLvlUI();
  renderShop('all');
  renderHomePrev();

  var now = new Date();
  setText('chatDate', now.toLocaleDateString('uk-UA', { day:'numeric', month:'long' }));
  setText('welcomeTime', nowTime());

  // Firebase
  try { initFirebase(); } catch(e) { console.error('Firebase error:', e); }

  // Сховати splash → показати app
  setTimeout(function() {
    var sp  = el('splash');
    var app = el('app');
    if (sp) {
      sp.style.transition = 'opacity 0.5s';
      sp.style.opacity    = '0';
      setTimeout(function() {
        sp.style.display = 'none';
        if (app) app.style.display = 'flex';
      }, 500);
    } else {
      if (app) app.style.display = 'flex';
    }
  }, 2000);
})();
