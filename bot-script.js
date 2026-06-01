// ============================================================
// FIREBASE + TELEGRAM INIT
// ============================================================
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
const ADMINS = [8216362223, 2067230442];

// Перевизначаємо myId/myName для бота (вже визначено вище з Telegram)
// st — стан бота

const tg=window.Telegram?.WebApp;
if(tg){tg.ready();tg.expand();}

const st={balance:0,nick:'Гравець',lang:'uk',lightTheme:false,isAdmin:true,userId:'#bears-'+String(Math.floor(Math.random()*9000)+1000),history:[],pending:[],users:{},stats:{pumps:0,ops:0,wds:0},chat:[],wdData:{}};

// ── РІВНІ 0-4 ──────────────────────────────────────────
const LVLS=[{lvl:0,emoji:'🐣',color:'#6b7280',next:3},{lvl:1,emoji:'🐻',color:'#22c55e',next:10},{lvl:2,emoji:'🐻‍❄️',color:'#38bdf8',next:25},{lvl:3,emoji:'🔥',color:'#f0b84a',next:50},{lvl:4,emoji:'💎',color:'#a855f7',next:Infinity}];
function getLvlIdx(ops){for(let i=LVLS.length-1;i>=0;i--){const t=i===0?0:LVLS[i-1].next;if(ops>=t)return i;}return 0;}
function updateLvlUI(){
  const ops=st.stats.ops,li=getLvlIdx(ops),l=LVLS[li];
  const names=L('lvlNames'),name=names[li]||'';
  const prev=li===0?0:LVLS[li-1].next,nxt=l.next===Infinity?prev+50:l.next;
  const pct=l.next===Infinity?100:Math.min(100,Math.round((ops-prev)/(nxt-prev)*100));
  const cLvl=document.getElementById('cLvl');
  if(cLvl){cLvl.textContent='LVL '+l.lvl+' '+l.emoji;cLvl.style.color=l.color;cLvl.style.borderColor=l.color+'55';}
  const pr=document.getElementById('profRank');
  if(pr)pr.innerHTML='<span style="color:'+l.color+'">'+l.emoji+'</span><span>LVL '+l.lvl+' · '+name+'</span>';
  const rf=document.getElementById('rbFill');
  if(rf){rf.style.width=pct+'%';rf.style.background=l.color;}
  if(l.next!==Infinity){setText('rbTitle',l.emoji+' LVL '+l.lvl+' → '+LVLS[li+1].emoji+' LVL '+(l.lvl+1));setText('rbNext',(nxt-ops)+' '+L('lvlOps')+' '+(l.lvl+1));}
  else{setText('rbTitle',L('lvlMax'));setText('rbNext',L('lvlMaxSub'));}
}

// ── I18N ───────────────────────────────────────────────
const LANG={
  uk:{greet:'Привіт 👋',navHome:'Головна',navShop:'Магазин',navChat:'Чат',navProfile:'Профіль',navAdmin:'Адмін',cardOwner:'Власник',cardBal:'Баланс',statPump:'Прокачок',statOps:'Операцій',statWd:'Виводів',svcPump:'Прокачка',svcWd:'Вивід',svcSup:'Підтримка',secRecent:'Останні операції',secAll:'Всі →',homeEmpty:'Поки що порожньо',shopTitle:'🐻 Пет-магазин',catAll:'Всі',catLeg:'Легендарні',catRare:'Рідкісні',catCom:'Звичайні',petLeg:'Легендарний',petRare:'Рідкісний',petCom:'Звичайний',chatAdminName:'Адміністрація BEARS SHOP',chatOnline:'онлайн',chatPh:'Напишіть повідомлення...',welcomeMsg:'👋 Привіт! Напишіть своє запитання — адміністратор відповість тут!',histTitle:'📋 Історія',hsOps:'Операцій',hsWd:'Виведено R',hsPu:'Прокачок',histEmpty:'Ще немає операцій',psNick:'Нікнейм',psLang:'Мова',psSett:'Налаштування',nickPh:'Ваш нік...',nickSave:'Зберегти',nickErr:'⚠️ Введіть нік',nickSaved:'✅ Нік збережено!',themeLabel:'Світла тема',themeSub:'Перемкнути',idLabel:'Ваш ID',idCopy:'Копіювати',idCopied:'✅ ID скопійовано!',adminTitle:'🔐 Адмін панель',aBalLbl:'Баланс',aAddTitle:'➕ Поповнити',aRemTitle:'➖ Зняти',aChatLbl:'💬 Чат',aPendLbl:'Заявки',aUsersLbl:'Користувачі',adminNoMsg:'Немає повідомлень',adminNoPend:'Немає нових заявок',adminNoUsers:'Немає',adminSend:'Надіслати',adminReplyPh:'Відповідь...',fPumpTitle:'Прокачка петів',fPumpS1tag:'1️⃣ Крок 1 з 2',fPumpS1h:'🐾 Прокачка петів',fPumpS1p:'Введіть ваш нікнейм у Roblox',fNickLbl:'Нікнейм у Roblox',fNickPh:'Введіть нік...',fNickErr:'⚠️ Введіть нік',fPumpS2tag:'2️⃣ Крок 2 з 2',fPumpS2h:'🐾 Кількість петів',fPumpS2p:'Виберіть скільки петів взяти на прокачку',fNextBtn:'Далі →',fPumpSendBtn:'Надіслати заявку →',fPumpDoneTitle:'Заявку надіслано!',fPumpDoneText:"Як тільки з'являться вільні пети,\n👨‍💼 адмін відповість у 💬 Чаті",fToHomeBtn:'На головну',fOpenChatBtn:'Відкрити чат',fSupTitle:'Підтримка',fSupTag:'📩 Підтримка',fSupH:'📩 Написати адміністрації',fSupP:'Або відкрийте 💬 Чат',fSupMsgLbl:'Ваше повідомлення',fSupMsgPh:'Напишіть тут...',fSupMsgErr:'⚠️ Напишіть повідомлення',fSupBtn:'Надіслати в чат 💬',fWdTitle:'Вивід',fWdS1tag:'1️⃣ Крок 1 з 5',fWdBalLbl:'Ваш баланс',fWdAmtLbl:'Кількість ROBUX',fWdAmtPh:'Мін. 40 ROBUX',fWdHint:'📌 Мінімальна сума — 40 ROBUX',fWdErrNum:'⚠️ Введіть число',fWdErrMin:'⚠️ Мінімум 40 ROBUX',fWdErrFunds:'⚠️ Недостатньо коштів',fWdS2tag:'2️⃣ Крок 2 з 5',fWdS2h:'🎮 Нікнейм',fWdS2p:'Ваш нікнейм у Roblox',fWdS2lbl:'Нікнейм',fWdS2ph:'Ваш нік...',fWdS3tag:'3️⃣ Крок 3 з 5',fWdS3h:'🧩 Назва карти',fWdS3p:'Назва гри з геймпасом',fWdS3lbl:'Карта',fWdS3ph:'Назва гри...',fWdS4tag:'4️⃣ Крок 4 з 5',fWdS4h:'🎟️ Геймпасс',fWdS4p:'Точна назва геймпасу',fWdS4lbl:'Геймпасс',fWdS4ph:'Назва...',fWdS5tag:'5️⃣ Крок 5 з 5',fWdGpLbl:'Створіть геймпасс на суму',fWdCommH:'ℹ️ Комісія',fWdCommP:'Roblox утримує 30% — тому сума геймпасу більша',fWdYes:'✅ Так, створив',fWdNo:'❌ Ні',fWdDoneTitle:'Заявку надіслано!',fWdDoneText:'⏳ Адміністрація перевіряє дані\n👨‍💼 Відповідь у 💬 Чаті',fWdNewBal:'Новий баланс',fErrVal:'⚠️ Введіть значення',fShopTitle:'Пет-магазин',fShopTag:'🛒 Підтвердження',fShopConfH:'ℹ️ Підтвердження',fShopConfP:"Натисніть «Замовити» — відповідь у 💬 Чаті",fShopBtn:'Замовити 🛒',fShopNoBal:'⚠️ Недостатньо коштів!',fShopNoBalSub:'Баланс',fShopOk:'Зрозуміло',fShopDoneTitle:'ДЯКУЄМО!',stPend:'⏳ В очікуванні',stDone:'✅ Виконано',stRej:'❌ Відхилено',admDone:'✅ Вашу заявку виконано!',admRej:'❌ Вашу заявку відхилено.',admDoneToast:'✅ Виконано!',admRejToast:'❌ Відхилено',admBalAdded:'💰 Ваш баланс поповнено на',histPump:'Прокачка петів',histSup:'Звернення до підтримки',histWd:'Вивід ROBUX',histShop:'Покупка',lvlMax:'💎 LVL 4 · Легенда — Максимум!',lvlMaxSub:'Ви на вершині!',lvlOps:'до LVL',lvlNames:['Новачок','Гравець','Досвідчений','Про','Легенда']},
  ru:{greet:'Привет 👋',navHome:'Главная',navShop:'Магазин',navChat:'Чат',navProfile:'Профиль',navAdmin:'Админ',cardOwner:'Владелец',cardBal:'Баланс',statPump:'Прокачок',statOps:'Операций',statWd:'Выводов',svcPump:'Прокачка',svcWd:'Вывод',svcSup:'Поддержка',secRecent:'Последние операции',secAll:'Все →',homeEmpty:'Пока пусто',shopTitle:'🐻 Пет-магазин',catAll:'Все',catLeg:'Легендарные',catRare:'Редкие',catCom:'Обычные',petLeg:'Легендарный',petRare:'Редкий',petCom:'Обычный',chatAdminName:'Администрация BEARS SHOP',chatOnline:'онлайн',chatPh:'Напишите сообщение...',welcomeMsg:'👋 Привет! Напишите ваш вопрос — администратор ответит здесь!',histTitle:'📋 История',hsOps:'Операций',hsWd:'Выведено R',hsPu:'Прокачок',histEmpty:'Нет операций',psNick:'Никнейм',psLang:'Язык',psSett:'Настройки',nickPh:'Ваш ник...',nickSave:'Сохранить',nickErr:'⚠️ Введите ник',nickSaved:'✅ Ник сохранён!',themeLabel:'Светлая тема',themeSub:'Переключить',idLabel:'Ваш ID',idCopy:'Копировать',idCopied:'✅ ID скопирован!',adminTitle:'🔐 Админ панель',aBalLbl:'Баланс',aAddTitle:'➕ Пополнить',aRemTitle:'➖ Снять',aChatLbl:'💬 Чат',aPendLbl:'Заявки',aUsersLbl:'Пользователи',adminNoMsg:'Нет сообщений',adminNoPend:'Нет новых заявок',adminNoUsers:'Нет',adminSend:'Отправить',adminReplyPh:'Ответ...',fPumpTitle:'Прокачка петов',fPumpS1tag:'1️⃣ Шаг 1 из 2',fPumpS1h:'🐾 Прокачка петов',fPumpS1p:'Введите ваш никнейм в Roblox',fNickLbl:'Никнейм в Roblox',fNickPh:'Введите ник...',fNickErr:'⚠️ Введите ник',fPumpS2tag:'2️⃣ Шаг 2 из 2',fPumpS2h:'🐾 Количество петов',fPumpS2p:'Выберите сколько петов прокачать',fNextBtn:'Далее →',fPumpSendBtn:'Отправить заявку →',fPumpDoneTitle:'Заявка отправлена!',fPumpDoneText:'Как только появятся свободные питомцы,\n👨‍💼 admin ответит в 💬 Чате',fToHomeBtn:'На главную',fOpenChatBtn:'Открыть чат',fSupTitle:'Поддержка',fSupTag:'📩 Поддержка',fSupH:'📩 Написать администрации',fSupP:'Или откройте 💬 Чат',fSupMsgLbl:'Ваше сообщение',fSupMsgPh:'Напишите здесь...',fSupMsgErr:'⚠️ Напишите сообщение',fSupBtn:'Отправить в чат 💬',fWdTitle:'Вывод',fWdS1tag:'1️⃣ Шаг 1 из 5',fWdBalLbl:'Ваш баланс',fWdAmtLbl:'Количество ROBUX',fWdAmtPh:'Мин. 40 ROBUX',fWdHint:'📌 Минимальная сумма — 40 ROBUX',fWdErrNum:'⚠️ Введите число',fWdErrMin:'⚠️ Минимум 40 ROBUX',fWdErrFunds:'⚠️ Недостаточно средств',fWdS2tag:'2️⃣ Шаг 2 из 5',fWdS2h:'🎮 Никнейм',fWdS2p:'Ваш никнейм в Roblox',fWdS2lbl:'Никнейм',fWdS2ph:'Ваш ник...',fWdS3tag:'3️⃣ Шаг 3 из 5',fWdS3h:'🧩 Название карты',fWdS3p:'Название игры с геймпассом',fWdS3lbl:'Карта',fWdS3ph:'Название игры...',fWdS4tag:'4️⃣ Шаг 4 из 5',fWdS4h:'🎟️ Геймпасс',fWdS4p:'Точное название геймпасса',fWdS4lbl:'Геймпасс',fWdS4ph:'Название...',fWdS5tag:'5️⃣ Шаг 5 из 5',fWdGpLbl:'Создайте геймпасс на сумму',fWdCommH:'ℹ️ Комиссия',fWdCommP:'Roblox удерживает 30% — поэтому сумма больше',fWdYes:'✅ Да, создал',fWdNo:'❌ Нет',fWdDoneTitle:'Заявка отправлена!',fWdDoneText:'⏳ Администрация проверяет данные\n👨‍💼 Ответ в 💬 Чате',fWdNewBal:'Новый баланс',fErrVal:'⚠️ Введите значение',fShopTitle:'Пет-магазин',fShopTag:'🛒 Подтверждение',fShopConfH:'ℹ️ Подтверждение',fShopConfP:'Нажмите «Заказать» — ответ в 💬 Чате',fShopBtn:'Заказать 🛒',fShopNoBal:'⚠️ Недостаточно средств!',fShopNoBalSub:'Баланс',fShopOk:'Понятно',fShopDoneTitle:'СПАСИБО!',stPend:'⏳ В ожидании',stDone:'✅ Выполнено',stRej:'❌ Отклонено',admDone:'✅ Ваша заявка выполнена!',admRej:'❌ Ваша заявка отклонена.',admDoneToast:'✅ Выполнено!',admRejToast:'❌ Отклонено',admBalAdded:'💰 Ваш баланс пополнен на',histPump:'Прокачка петов',histSup:'Обращение в поддержку',histWd:'Вывод ROBUX',histShop:'Покупка',lvlMax:'💎 LVL 4 · Легенда — Максимум!',lvlMaxSub:'Вы на вершине!',lvlOps:'до LVL',lvlNames:['Новичок','Игрок','Опытный','Про','Легенда']},
  en:{greet:'Hello 👋',navHome:'Home',navShop:'Shop',navChat:'Chat',navProfile:'Profile',navAdmin:'Admin',cardOwner:'Owner',cardBal:'Balance',statPump:'Leveled',statOps:'Operations',statWd:'Withdrawals',svcPump:'Leveling',svcWd:'Withdraw',svcSup:'Support',secRecent:'Recent operations',secAll:'All →',homeEmpty:'Nothing yet',shopTitle:'🐻 Pet Shop',catAll:'All',catLeg:'Legendary',catRare:'Rare',catCom:'Common',petLeg:'Legendary',petRare:'Rare',petCom:'Common',chatAdminName:'BEARS SHOP Administration',chatOnline:'online',chatPh:'Write a message...',welcomeMsg:'👋 Hi! Write your question — admin will reply here!',histTitle:'📋 History',hsOps:'Operations',hsWd:'Withdrawn R',hsPu:'Leveled',histEmpty:'No operations yet',psNick:'Nickname',psLang:'Language',psSett:'Settings',nickPh:'Your nick...',nickSave:'Save',nickErr:'⚠️ Enter a nickname',nickSaved:'✅ Nickname saved!',themeLabel:'Light theme',themeSub:'Toggle',idLabel:'Your ID',idCopy:'Copy',idCopied:'✅ ID copied!',adminTitle:'🔐 Admin panel',aBalLbl:'Balance',aAddTitle:'➕ Add balance',aRemTitle:'➖ Remove balance',aChatLbl:'💬 Chat',aPendLbl:'Requests',aUsersLbl:'Users',adminNoMsg:'No messages',adminNoPend:'No new requests',adminNoUsers:'None',adminSend:'Send',adminReplyPh:'Reply...',fPumpTitle:'Pet Leveling',fPumpS1tag:'1️⃣ Step 1 of 2',fPumpS1h:'🐾 Pet Leveling',fPumpS1p:'Enter your Roblox nickname',fNickLbl:'Roblox nickname',fNickPh:'Enter nick...',fNickErr:'⚠️ Enter a nickname',fPumpS2tag:'2️⃣ Step 2 of 2',fPumpS2h:'🐾 Number of pets',fPumpS2p:'Select how many pets to level up',fNextBtn:'Next →',fPumpSendBtn:'Submit request →',fPumpDoneTitle:'Request submitted!',fPumpDoneText:'Once pets are available,\n👨‍💼 admin will reply in 💬 Chat',fToHomeBtn:'Home',fOpenChatBtn:'Open chat',fSupTitle:'Support',fSupTag:'📩 Support',fSupH:'📩 Write to administration',fSupP:'Or open 💬 Chat',fSupMsgLbl:'Your message',fSupMsgPh:'Write here...',fSupMsgErr:'⚠️ Write a message',fSupBtn:'Send to chat 💬',fWdTitle:'Withdraw',fWdS1tag:'1️⃣ Step 1 of 5',fWdBalLbl:'Your balance',fWdAmtLbl:'Amount of ROBUX',fWdAmtPh:'Min. 40 ROBUX',fWdHint:'📌 Minimum amount — 40 ROBUX',fWdErrNum:'⚠️ Enter a number',fWdErrMin:'⚠️ Minimum 40 ROBUX',fWdErrFunds:'⚠️ Insufficient funds',fWdS2tag:'2️⃣ Step 2 of 5',fWdS2h:'🎮 Nickname',fWdS2p:'Your Roblox nickname',fWdS2lbl:'Nickname',fWdS2ph:'Your nick...',fWdS3tag:'3️⃣ Step 3 of 5',fWdS3h:'🧩 Map name',fWdS3p:'Game name with gamepass',fWdS3lbl:'Map',fWdS3ph:'Game name...',fWdS4tag:'4️⃣ Step 4 of 5',fWdS4h:'🎟️ Gamepass',fWdS4p:'Exact gamepass name',fWdS4lbl:'Gamepass',fWdS4ph:'Name...',fWdS5tag:'5️⃣ Step 5 of 5',fWdGpLbl:'Create a gamepass for',fWdCommH:'ℹ️ Commission',fWdCommP:'Roblox takes 30% — so the amount is higher',fWdYes:'✅ Yes, created',fWdNo:'❌ No',fWdDoneTitle:'Request submitted!',fWdDoneText:'⏳ Administration is reviewing\n👨‍💼 Reply in 💬 Chat',fWdNewBal:'New balance',fErrVal:'⚠️ Enter a value',fShopTitle:'Pet Shop',fShopTag:'🛒 Confirmation',fShopConfH:'ℹ️ Confirmation',fShopConfP:"Press 'Order' — reply in 💬 Chat",fShopBtn:'Order 🛒',fShopNoBal:'⚠️ Insufficient funds!',fShopNoBalSub:'Balance',fShopOk:'Got it',fShopDoneTitle:'THANK YOU!',stPend:'⏳ Pending',stDone:'✅ Done',stRej:'❌ Rejected',admDone:'✅ Your request is done!',admRej:'❌ Your request was rejected.',admDoneToast:'✅ Done!',admRejToast:'❌ Rejected',admBalAdded:'💰 Your balance was topped up by',histPump:'Pet leveling',histSup:'Support request',histWd:'ROBUX withdrawal',histShop:'Purchase',lvlMax:'💎 LVL 4 · Legend — Maximum!',lvlMaxSub:"You're at the top!",lvlOps:'to LVL',lvlNames:['Beginner','Player','Experienced','Pro','Legend']},
  pl:{greet:'Cześć 👋',navHome:'Główna',navShop:'Sklep',navChat:'Czat',navProfile:'Profil',navAdmin:'Admin',cardOwner:'Właściciel',cardBal:'Saldo',statPump:'Ulepszono',statOps:'Operacji',statWd:'Wypłat',svcPump:'Ulepszanie',svcWd:'Wypłata',svcSup:'Wsparcie',secRecent:'Ostatnie operacje',secAll:'Wszystkie →',homeEmpty:'Jeszcze nic',shopTitle:'🐻 Sklep z petami',catAll:'Wszystkie',catLeg:'Legendarne',catRare:'Rzadkie',catCom:'Zwykłe',petLeg:'Legendarny',petRare:'Rzadki',petCom:'Zwykły',chatAdminName:'Administracja BEARS SHOP',chatOnline:'online',chatPh:'Napisz wiadomość...',welcomeMsg:'👋 Cześć! Napisz pytanie — admin odpowie tutaj!',histTitle:'📋 Historia',hsOps:'Operacji',hsWd:'Wypłacono R',hsPu:'Ulepszono',histEmpty:'Brak operacji',psNick:'Pseudonim',psLang:'Język',psSett:'Ustawienia',nickPh:'Twój nick...',nickSave:'Zapisz',nickErr:'⚠️ Wpisz nick',nickSaved:'✅ Nick zapisany!',themeLabel:'Jasny motyw',themeSub:'Przełącz',idLabel:'Twoje ID',idCopy:'Kopiuj',idCopied:'✅ ID skopiowane!',adminTitle:'🔐 Panel admina',aBalLbl:'Saldo',aAddTitle:'➕ Doładuj',aRemTitle:'➖ Odejmij',aChatLbl:'💬 Czat',aPendLbl:'Zgłoszenia',aUsersLbl:'Użytkownicy',adminNoMsg:'Brak wiadomości',adminNoPend:'Brak zgłoszeń',adminNoUsers:'Brak',adminSend:'Wyślij',adminReplyPh:'Odpowiedź...',fPumpTitle:'Ulepszanie petów',fPumpS1tag:'1️⃣ Krok 1 z 2',fPumpS1h:'🐾 Ulepszanie petów',fPumpS1p:'Wpisz swój nick w Roblox',fNickLbl:'Nick w Roblox',fNickPh:'Wpisz nick...',fNickErr:'⚠️ Wpisz nick',fPumpS2tag:'2️⃣ Krok 2 z 2',fPumpS2h:'🐾 Liczba petów',fPumpS2p:'Wybierz ile petów ulepszyć',fNextBtn:'Dalej →',fPumpSendBtn:'Wyślij zgłoszenie →',fPumpDoneTitle:'Zgłoszenie wysłane!',fPumpDoneText:'Gdy pojawią się wolne pety,\n👨‍💼 admin odpowie w 💬 Czacie',fToHomeBtn:'Strona główna',fOpenChatBtn:'Otwórz czat',fSupTitle:'Wsparcie',fSupTag:'📩 Wsparcie',fSupH:'📩 Napisz do administracji',fSupP:'Lub otwórz 💬 Czat',fSupMsgLbl:'Twoja wiadomość',fSupMsgPh:'Napisz tutaj...',fSupMsgErr:'⚠️ Napisz wiadomość',fSupBtn:'Wyślij do czatu 💬',fWdTitle:'Wypłata',fWdS1tag:'1️⃣ Krok 1 z 5',fWdBalLbl:'Twoje saldo',fWdAmtLbl:'Ilość ROBUX',fWdAmtPh:'Min. 40 ROBUX',fWdHint:'📌 Minimalna kwota — 40 ROBUX',fWdErrNum:'⚠️ Wpisz liczbę',fWdErrMin:'⚠️ Minimum 40 ROBUX',fWdErrFunds:'⚠️ Za mało środków',fWdS2tag:'2️⃣ Krok 2 z 5',fWdS2h:'🎮 Pseudonim',fWdS2p:'Twój nick w Roblox',fWdS2lbl:'Pseudonim',fWdS2ph:'Twój nick...',fWdS3tag:'3️⃣ Krok 3 z 5',fWdS3h:'🧩 Nazwa mapy',fWdS3p:'Nazwa gry z gamepassem',fWdS3lbl:'Mapa',fWdS3ph:'Nazwa gry...',fWdS4tag:'4️⃣ Krok 4 z 5',fWdS4h:'🎟️ Gamepass',fWdS4p:'Dokładna nazwa gamepassa',fWdS4lbl:'Gamepass',fWdS4ph:'Nazwa...',fWdS5tag:'5️⃣ Krok 5 z 5',fWdGpLbl:'Utwórz gamepass na kwotę',fWdCommH:'ℹ️ Prowizja',fWdCommP:'Roblox pobiera 30% — kwota jest wyższa',fWdYes:'✅ Tak, stworzyłem',fWdNo:'❌ Nie',fWdDoneTitle:'Zgłoszenie wysłane!',fWdDoneText:'⏳ Administracja sprawdza dane\n👨‍💼 Odpowiedź w 💬 Czacie',fWdNewBal:'Nowe saldo',fErrVal:'⚠️ Wpisz wartość',fShopTitle:'Sklep z petami',fShopTag:'🛒 Potwierdzenie',fShopConfH:'ℹ️ Potwierdzenie',fShopConfP:"Kliknij 'Zamów' — odpowiedź w 💬 Czacie",fShopBtn:'Zamów 🛒',fShopNoBal:'⚠️ Za mało środków!',fShopNoBalSub:'Saldo',fShopOk:'Rozumiem',fShopDoneTitle:'DZIĘKUJEMY!',stPend:'⏳ Oczekuje',stDone:'✅ Wykonano',stRej:'❌ Odrzucono',admDone:'✅ Twoje zgłoszenie wykonano!',admRej:'❌ Twoje zgłoszenie odrzucono.',admDoneToast:'✅ Wykonano!',admRejToast:'❌ Odrzucono',admBalAdded:'💰 Twoje saldo doładowano o',histPump:'Ulepszanie petów',histSup:'Zgłoszenie wsparcia',histWd:'Wypłata ROBUX',histShop:'Zakup',lvlMax:'💎 LVL 4 · Legenda — Maksimum!',lvlMaxSub:'Jesteś na szczycie!',lvlOps:'do LVL',lvlNames:['Początkujący','Gracz','Doświadczony','Pro','Legenda']}
};
function L(k){return(LANG[st.lang]||LANG.uk)[k]||k;}

function applyLang(){
  setText('greetTxt',L('greet'));
  setText('nl-home',L('navHome'));setText('nl-shop',L('navShop'));setText('nl-chat',L('navChat'));setText('nl-profile',L('navProfile'));setText('nl-admin',L('navAdmin'));
  setText('cOwnerLbl',L('cardOwner'));setText('cBalLbl',L('cardBal'));
  setText('stPumpL',L('statPump'));setText('stOpsL',L('statOps'));setText('stWdL',L('statWd'));
  setText('psPumpL',L('statPump'));setText('psOpsL',L('statOps'));setText('psWdL',L('statWd'));
  setText('svcPump',L('svcPump'));setText('svcWd',L('svcWd'));setText('svcSup',L('svcSup'));
  setText('secRecent',L('secRecent'));setText('secAll',L('secAll'));
  setText('shopTitleTxt',L('shopTitle'));
  setText('catAll',L('catAll'));setText('catLeg',L('catLeg'));setText('catRare',L('catRare'));setText('catCom',L('catCom'));
  setText('chatAdminName',L('chatAdminName'));setText('chatOnline',L('chatOnline'));
  setText('welcomeMsg',L('welcomeMsg'));
  const ci=document.getElementById('chatInp');if(ci)ci.placeholder=L('chatPh');
  setText('histTitle',L('histTitle'));setText('hsOpsL',L('hsOps'));setText('hsWdL',L('hsWd'));setText('hsPuL',L('hsPu'));
  setText('psNickLbl',L('psNick'));setText('psLangLbl',L('psLang'));setText('psSettLbl',L('psSett'));
  const ni=document.getElementById('nickIn');if(ni)ni.placeholder=L('nickPh');
  setText('nickSvBtn',L('nickSave'));setText('themeLbl',L('themeLabel'));setText('themeSubLbl',L('themeSub'));
  setText('idLbl',L('idLabel'));setText('copyLbl',L('idCopy'));
  setText('adminTitle',L('adminTitle'));setText('aBalLbl',L('aBalLbl'));setText('aAddTitle',L('aAddTitle'));setText('aRemTitle',L('aRemTitle'));
  setText('aChatLbl',L('aChatLbl'));setText('aPendLbl',L('aPendLbl'));setText('aUsersLbl',L('aUsersLbl'));
  setText('adminSendBtn',L('adminSend'));
  const ri=document.getElementById('adminReplyInp');if(ri)ri.placeholder=L('adminReplyPh');
  renderHomePrev();renderHistory();renderShop(curCat);updateLvlUI();
}

function setText(id,v){const e=document.getElementById(id);if(e)e.textContent=v;}
function animNum(f,t,id){const el=document.getElementById(id);if(!el)return;const dur=500,steps=25,step=(t-f)/steps;let cur=f,i=0;const iv=setInterval(()=>{cur+=step;i++;el.textContent=Math.round(cur);if(i>=steps){el.textContent=t;clearInterval(iv);}},dur/steps);}
function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.style.opacity='1';clearTimeout(t._t);t._t=setTimeout(()=>t.style.opacity='0',2200);}
function haptic(){if(tg)tg.HapticFeedback?.impactOccurred('light');}
function nowTime(){return new Date().toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit'});}
function scrollEl(id){setTimeout(()=>{const e=document.getElementById(id);if(e)e.scrollTop=e.scrollHeight;},80);}

function updateBal(v){const old=st.balance;st.balance=v;if(Math.abs(v-old)>0)animNum(old,v,'cBal');else setText('cBal',v);setText('fbal',v);setText('shopBal',v);}
function updateNickUI(){setText('homeNick',st.nick);setText('profNick',st.nick);setText('cName',st.nick.toUpperCase());const ni=document.getElementById('nickIn');if(ni)ni.value=st.nick;}
function saveNick(){const v=document.getElementById('nickIn').value.trim();if(!v){document.getElementById('nickErr').textContent=L('nickErr');return;}document.getElementById('nickErr').textContent='';st.nick=v;updateNickUI();document.getElementById('nickIn').blur();showToast(L('nickSaved'));}
function setLang(l){st.lang=l;document.querySelectorAll('.lbtn').forEach(b=>b.classList.remove('on'));document.getElementById('lang-'+l).classList.add('on');applyLang();showToast('✅');}
function toggleTheme(){st.lightTheme=!st.lightTheme;document.body.classList.toggle('light',st.lightTheme);document.getElementById('tswitch').classList.toggle('on',st.lightTheme);}
function copyId(){navigator.clipboard?.writeText(st.userId).then(()=>showToast(L('idCopied')));}

function switchTab(tab){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.bni').forEach(n=>n.classList.remove('on'));
  document.getElementById('page-'+tab).classList.add('active');
  const nav=document.getElementById('nav-'+tab);if(nav)nav.classList.add('on');
  if(tab==='shop')renderShop(curCat);
  if(tab==='profile'){updateStatsUI();updateLvlUI();setText('uidVal',st.userId);}
  if(tab==='admin')renderAdmin();
  if(tab==='chat'){document.getElementById('chatDot').classList.remove('show');scrollEl('chatMsgs');}
  if(tab==='history')renderHistory();
  setText('fbal',st.balance);setText('shopBal',st.balance);
}

function updateStatsUI(){setText('stPump',st.stats.pumps);setText('psPump',st.stats.pumps);setText('stOps',st.stats.ops);setText('psOps',st.stats.ops);setText('stWd',st.stats.wds);setText('psWd',st.stats.wds);setText('hsTx',st.stats.ops);setText('hsWd',st.stats.wds);setText('hsPu',st.stats.pumps);}

const TC={pump:'rgba(224,90,24,.15)',support:'rgba(56,189,248,.15)',wd:'rgba(200,146,42,.15)',shop:'rgba(34,197,94,.15)'};
const TI={pump:'🐾',support:'📩',wd:'💰',shop:'🛒'};
function stBadge(s,cls){const m={pending:L('stPend'),done:L('stDone'),rejected:L('stRej')};const c={pending:'s-p',done:'s-d',rejected:'s-r'};return'<span class="'+(cls||'hpi-st')+' '+(c[s]||'')+'">'+( m[s]||s)+'</span>';}

function addHistory(item){st.history.unshift({...item,id:Date.now(),status:'pending',date:new Date().toLocaleString('uk-UA',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})});st.stats.ops++;if(item.type==='pump')st.stats.pumps++;if(item.type==='wd')st.stats.wds++;updateStatsUI();updateLvlUI();renderHomePrev();st.pending.push(st.history[0]);st.users[st.userId]={nick:st.nick,balance:st.balance};}
function renderHomePrev(){const el=document.getElementById('homePrev');if(!st.history.length){el.innerHTML='<div class="empty">'+L('homeEmpty')+'</div>';return;}el.innerHTML=st.history.slice(0,3).map(h=>'<div class="hpi"><div class="hpi-ic" style="background:'+TC[h.type]+'">'+TI[h.type]+'</div><div class="hpi-info"><div class="hpi-name">'+h.label+'</div><div class="hpi-date">'+h.date+'</div></div>'+stBadge(h.status,'hpi-st')+'</div>').join('');}
function renderHistory(){const el=document.getElementById('histList');if(!el)return;if(!st.history.length){el.innerHTML='<div class="hn">'+L('histEmpty')+'</div>';return;}el.innerHTML=st.history.map(h=>'<div class="hli"><div class="hli-ic" style="background:'+TC[h.type]+'">'+TI[h.type]+'</div><div class="hli-info"><div class="hli-nm">'+h.label+'</div><div class="hli-dt">'+(h.detail||'')+'</div></div><div class="hli-r"><div class="hli-amt" style="color:'+(h.amount?h.amount>0?'var(--green)':'var(--red)':'var(--sub)')+'">'+(h.amount?(h.amount>0?'+':'')+h.amount+'R':'—')+'</div><div class="hli-date">'+h.date+'</div>'+stBadge(h.status,'hli-st')+'</div></div>').join('');}

function pushMsg(from,text,time){st.chat.push({from,text,time,nick:from==='admin'?'Admin':st.nick});const msgs=document.getElementById('chatMsgs');const wrap=document.createElement('div');wrap.className='mw '+(from==='user'?'me':'adm');wrap.innerHTML='<div class="mb">'+text+'</div><div class="mt">'+time+'</div>';msgs.appendChild(wrap);scrollEl('chatMsgs');if(document.getElementById('page-admin').classList.contains('active'))renderAdmin();}
function userSend(){const inp=document.getElementById('chatInp');const text=inp.value.trim();if(!text)return;inp.value='';inp.style.height='';pushMsg('user',text,nowTime());if(tg)tg.sendData(JSON.stringify({action:'chat',message:text}));}
function adminReply(){const inp=document.getElementById('adminReplyInp');const text=inp.value.trim();if(!text){showToast('⚠️');return;}inp.value='';pushMsg('admin',text,nowTime());if(!document.getElementById('page-chat').classList.contains('active'))document.getElementById('chatDot').classList.add('show');showToast('✅');}
const _chatInp=document.getElementById('chatInp');
if(_chatInp){
  _chatInp.addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,100)+'px';});
  _chatInp.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();userSend();}});
}
const _adminInp=document.getElementById('adminReplyInp');
if(_adminInp) _adminInp.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();adminReply();}});

const PETS=[{id:1,key:'MFR Frost Fury',emoji:'🦋',rk:'petLeg',cat:'legendary',price:350,tag:'hot'},{id:2,key:'NFR Shadow Dragon',emoji:'🐉',rk:'petLeg',cat:'legendary',price:500,tag:'rare'},{id:3,key:'FR Crow',emoji:'🦅',rk:'petLeg',cat:'legendary',price:280,tag:null},{id:4,key:'MFR Parrot',emoji:'🦜',rk:'petRare',cat:'rare',price:180,tag:'new'},{id:5,key:'NFR Unicorn',emoji:'🦄',rk:'petRare',cat:'rare',price:150,tag:null},{id:6,key:'FR Robin',emoji:'🐦',rk:'petRare',cat:'rare',price:90,tag:null},{id:7,key:'Normal Cat',emoji:'🐱',rk:'petCom',cat:'common',price:20,tag:'new'},{id:8,key:'Normal Dog',emoji:'🐶',rk:'petCom',cat:'common',price:15,tag:null},{id:9,key:'Normal Bunny',emoji:'🐰',rk:'petCom',cat:'common',price:10,tag:null}];
const RC={petLeg:'var(--gold)',petRare:'var(--purple)',petCom:'var(--sub)'};
let curCat='all';
function filterCat(cat,btn){curCat=cat;document.querySelectorAll('.cat').forEach(b=>b.classList.remove('on'));btn.classList.add('on');renderShop(cat);}
function renderShop(cat){setText('shopBal',st.balance);const pets=cat==='all'?PETS:PETS.filter(p=>p.cat===cat);document.getElementById('petGrid').innerHTML=pets.map(p=>'<div class="pcard" onclick="buyPet('+p.id+')">'+(p.tag?'<div class="ptag t-'+p.tag+'">'+(p.tag==='hot'?'🔥 HOT':p.tag==='new'?'✨ NEW':'💎 RARE')+'</div>':'')+'<span class="p-em">'+p.emoji+'</span><div class="p-nm">'+p.key+'</div><div class="p-ra" style="color:'+RC[p.rk]+'">'+L(p.rk)+'</div><div class="p-pr">💰 '+p.price+' R</div></div>').join('');}
function buyPet(id){const pet=PETS.find(p=>p.id===id);if(!pet)return;openFlowWith('shop-pet',pet);}

function renderAdmin(){const conv=document.getElementById('adminConv');conv.innerHTML=st.chat.length?st.chat.map(m=>'<div class="acmsg '+(m.from==='admin'?'fa':'fu')+'"><div class="acmsg-top"><span class="acmsg-who">'+(m.from==='admin'?'👨‍💼 Admin':'👤 '+m.nick)+'</span><span class="acmsg-time">'+m.time+'</span></div><div class="acmsg-txt">'+m.text+'</div></div>').join(''):'<div class="pend-none">'+L('adminNoMsg')+'</div>';const pend=st.pending.filter(p=>p.status==='pending');document.getElementById('pendingList').innerHTML=pend.length?pend.map(p=>'<div class="pend-row"><div class="pend-top"><span class="pend-type">'+TI[p.type]+' '+p.label+'</span><span class="pend-date">'+p.date+'</span></div><div class="pend-info">'+(p.detail||'—')+'</div><div class="pend-btns"><button class="pbtn-ok" onclick="resolveOp('+p.id+',\'done\')">'+L('stDone')+'</button><button class="pbtn-no" onclick="resolveOp('+p.id+',\'rejected\')">'+L('stRej')+'</button></div></div>').join(''):'<div class="pend-none">'+L('adminNoPend')+'</div>';const users=Object.entries(st.users);document.getElementById('userList').innerHTML=users.length?users.map(([id,u])=>'<div class="urow"><div class="urow-info"><div class="urow-nick">'+u.nick+'</div><div class="urow-id">'+id+'</div></div><div class="urow-bal">'+u.balance+' R</div></div>').join(''):'<div class="pend-none">'+L('adminNoUsers')+'</div>';}
function resolveOp(id,status){const item=st.history.find(h=>h.id===id);const pi=st.pending.find(h=>h.id===id);if(item)item.status=status;if(pi)pi.status=status;pushMsg('admin',status==='done'?L('admDone'):L('admRej'),nowTime());if(!document.getElementById('page-chat').classList.contains('active'))document.getElementById('chatDot').classList.add('show');renderAdmin();renderHomePrev();renderHistory();showToast(status==='done'?L('admDoneToast'):L('admRejToast'));}
function adminAdd(){const id=document.getElementById('aAddId').value.trim(),amt=parseInt(document.getElementById('aAddAmt').value);if(!id||isNaN(amt)||amt<=0){showToast('⚠️');return;}if(!st.users[id])st.users[id]={nick:id,balance:0};st.users[id].balance+=amt;if(id===st.userId){updateBal(st.balance+amt);pushMsg('admin',L('admBalAdded')+' '+amt+' ROBUX!',nowTime());if(!document.getElementById('page-chat').classList.contains('active'))document.getElementById('chatDot').classList.add('show');}document.getElementById('aAddId').value='';document.getElementById('aAddAmt').value='';renderAdmin();showToast('✅ +'+amt+' R');}
function adminRem(){const id=document.getElementById('aRemId').value.trim(),amt=parseInt(document.getElementById('aRemAmt').value);if(!id||isNaN(amt)||amt<=0){showToast('⚠️');return;}if(!st.users[id]){showToast('⚠️');return;}st.users[id].balance=Math.max(0,st.users[id].balance-amt);if(id===st.userId)updateBal(Math.max(0,st.balance-amt));document.getElementById('aRemId').value='';document.getElementById('aRemAmt').value='';renderAdmin();showToast('✅ -'+amt+' R');}

function openFlow(name){haptic();openFlowWith(name,null);}
function openFlowWith(name,data){const titles={pump:L('fPumpTitle'),support:L('fSupTitle'),withdraw:L('fWdTitle'),'shop-pet':L('fShopTitle')};setText('ftitle',titles[name]||name);setText('fbal',st.balance);const c=document.getElementById('fcontent');c.innerHTML='';FLOWS[name](c,data);document.getElementById('fov').classList.add('open');}
function closeFlow(){document.getElementById('fov').classList.remove('open');}
function mk(t,c){const e=document.createElement(t);if(c)e.className=c;return e;}
function mkBody(){return mk('div','fbody');}
function mkBtn(l,d){const b=mk('button','fbtn fbtn-g');b.textContent=l;if(d)b.disabled=true;return b;}
function mkCard(h,p){const c=mk('div','fcard');c.innerHTML='<h3>'+h+'</h3><p>'+p+'</p>';return c;}
function mkTag(l){const d=mk('div','ftag');d.textContent=l;return d;}
function mkIg(lbl,...els){const g=mk('div','fig');const l=mk('div','filbl');l.textContent=lbl;g.appendChild(l);els.forEach(e=>g.appendChild(e));return g;}
function mkIn(ph,tp){const i=mk('input','fif');i.placeholder=ph;i.type=tp||'text';return i;}
function mkTA(ph,rows){const t=mk('textarea','fif');t.placeholder=ph;t.rows=rows;return t;}
function mkErr(){return mk('div','ferr');}

const FLOWS={};
FLOWS.pump=function(c){const b=mkBody();b.appendChild(mkTag(L('fPumpS1tag')));b.appendChild(mkCard(L('fPumpS1h'),L('fPumpS1p')));const inp=mkIn(L('fNickPh')),err=mkErr();b.appendChild(mkIg(L('fNickLbl'),inp,err));const btn=mkBtn(L('fNextBtn'));btn.onclick=()=>{const v=inp.value.trim();if(!v){err.textContent=L('fNickErr');return;}c.innerHTML='';pumpS2(c,v);};b.appendChild(btn);c.appendChild(b);};
function pumpS2(c,nick){const b=mkBody();b.appendChild(mkTag(L('fPumpS2tag')));b.appendChild(mkCard(L('fPumpS2h'),L('fPumpS2p')));const row=mk('div','fcrow');let sel=0;const btn=mkBtn(L('fPumpSendBtn'),true);for(let i=1;i<=5;i++){const cb=mk('button','fcb');cb.textContent=String(i);cb.onclick=()=>{row.querySelectorAll('.fcb').forEach(x=>x.classList.remove('sel'));cb.classList.add('sel');sel=i;btn.disabled=false;};row.appendChild(cb);}b.appendChild(row);btn.onclick=()=>{addHistory({type:'pump',label:L('histPump'),detail:L('fNickLbl')+': '+nick+' × '+sel});c.innerHTML='';const wb=mkBody(),wc=mk('div','fwc');wc.innerHTML='<div class="fwi">⏳</div><div class="fwt">'+L('fPumpDoneTitle')+'</div><div class="fwx">'+L('fPumpDoneText').replace('\n','<br>')+'</div>';wb.appendChild(wc);const fb=mkBtn(L('fToHomeBtn'));fb.style.marginTop='12px';fb.onclick=()=>{closeFlow();switchTab('home');};wb.appendChild(fb);c.appendChild(wb);if(tg)tg.sendData(JSON.stringify({action:'pump',nick,count:sel}));};b.appendChild(btn);c.appendChild(b);}
FLOWS.support=function(c){const b=mkBody();b.appendChild(mkTag(L('fSupTag')));b.appendChild(mkCard(L('fSupH'),L('fSupP')));const ta=mkTA(L('fSupMsgPh'),5),err=mkErr();b.appendChild(mkIg(L('fSupMsgLbl'),ta,err));const btn=mkBtn(L('fSupBtn'));btn.onclick=()=>{const v=ta.value.trim();if(!v){err.textContent=L('fSupMsgErr');return;}addHistory({type:'support',label:L('histSup'),detail:v.slice(0,50)+(v.length>50?'…':'')});pushMsg('user',v,nowTime());closeFlow();switchTab('chat');if(tg)tg.sendData(JSON.stringify({action:'support',message:v}));};b.appendChild(btn);c.appendChild(b);};
FLOWS.withdraw=function(c){st.wdData={};wdS1(c);};
function wdS1(c){const b=mkBody();b.appendChild(mkTag(L('fWdS1tag')));const bc=mk('div','fbc');bc.innerHTML='<div class="fbc-lbl">'+L('fWdBalLbl')+'</div><div class="fbc-amt">'+st.balance+'</div><div class="fbc-unit">ROBUX</div>';b.appendChild(bc);const inp=mkIn(L('fWdAmtPh'),'number'),err=mkErr();const hint=mk('div');hint.style.cssText='font-size:10px;color:var(--sub);padding:0 2px';hint.textContent=L('fWdHint');b.appendChild(mkIg(L('fWdAmtLbl'),inp,err,hint));const btn=mkBtn(L('fNextBtn'));btn.onclick=()=>{const amt=parseInt(inp.value);if(!inp.value||isNaN(amt)){err.textContent=L('fWdErrNum');return;}if(amt<40){err.textContent=L('fWdErrMin');return;}if(amt>st.balance){err.textContent=L('fWdErrFunds');return;}st.wdData.amount=amt;c.innerHTML='';wdS2(c);};b.appendChild(btn);c.appendChild(b);}
function wdStep(c,tag,h,p,lbl,ph,next,field){const b=mkBody();b.appendChild(mkTag(tag));b.appendChild(mkCard(h,p));const inp=mkIn(ph),err=mkErr();b.appendChild(mkIg(lbl,inp,err));const btn=mkBtn(L('fNextBtn'));btn.onclick=()=>{const v=inp.value.trim();if(!v){err.textContent=L('fErrVal');return;}st.wdData[field]=v;c.innerHTML='';next(c);};b.appendChild(btn);c.appendChild(b);}
function wdS2(c){wdStep(c,L('fWdS2tag'),L('fWdS2h'),L('fWdS2p'),L('fWdS2lbl'),L('fWdS2ph'),wdS3,'nick');}
function wdS3(c){wdStep(c,L('fWdS3tag'),L('fWdS3h'),L('fWdS3p'),L('fWdS3lbl'),L('fWdS3ph'),wdS4,'map');}
function wdS4(c){wdStep(c,L('fWdS4tag'),L('fWdS4h'),L('fWdS4p'),L('fWdS4lbl'),L('fWdS4ph'),wdS5,'gamepass');}
function wdS5(c){const{amount}=st.wdData,gp=Math.ceil(amount/0.7);st.wdData.gpAmount=gp;const b=mkBody();b.appendChild(mkTag(L('fWdS5tag')));const gpb=mk('div','fgpb');gpb.innerHTML='<div class="fgp-l">'+L('fWdGpLbl')+'</div><div class="fgp-v">'+gp+' ROBUX</div><div class="fgp-n">'+gp+' − 30% = '+amount+' ROBUX</div>';b.appendChild(gpb);b.appendChild(mkCard(L('fWdCommH'),L('fWdCommP')));const yn=mk('div','fynr');const yes=mk('button','fyes');yes.textContent=L('fWdYes');const no=mk('button','fno');no.textContent=L('fWdNo');yes.onclick=()=>{const nb=st.balance-amount;updateBal(nb);addHistory({type:'wd',label:L('histWd'),detail:st.wdData.gamepass+' · '+st.wdData.nick,amount:-amount});st.users[st.userId]={nick:st.nick,balance:nb};c.innerHTML='';wdS6(c,nb);if(tg)tg.sendData(JSON.stringify({action:'withdraw',...st.wdData}));};no.onclick=()=>{closeFlow();switchTab('home');};yn.appendChild(yes);yn.appendChild(no);b.appendChild(yn);c.appendChild(b);}
function wdS6(c,nb){const b=mkBody();const wc=mk('div','fwc');wc.innerHTML='<div class="fwi">📬</div><div class="fwt">'+L('fWdDoneTitle')+'</div><div class="fwx">'+L('fWdDoneText').replace('\n','<br>')+'</div>';b.appendChild(wc);const bc=mk('div','fbc');bc.style.marginTop='4px';bc.innerHTML='<div class="fbc-lbl">'+L('fWdNewBal')+'</div><div class="fbc-amt">'+nb+'</div><div class="fbc-unit">ROBUX</div>';b.appendChild(bc);const btn=mkBtn(L('fToHomeBtn'));btn.style.marginTop='4px';btn.onclick=()=>{closeFlow();switchTab('home');};b.appendChild(btn);c.appendChild(b);}
FLOWS['shop-pet']=function(c,pet){const b=mkBody();b.appendChild(mkTag(L('fShopTag')));const pc=mk('div','fpconf');pc.innerHTML='<div class="fpc-e">'+pet.emoji+'</div><div class="fpc-n">'+pet.key+'</div><div class="fpc-r" style="color:'+RC[pet.rk]+'">'+L(pet.rk)+'</div><div class="fpc-p">💰 '+pet.price+' ROBUX</div>';b.appendChild(pc);if(pet.price>st.balance){const w=mk('div','fcard');w.innerHTML='<p style="color:var(--red)">'+L('fShopNoBal')+'<br>'+L('fShopNoBalSub')+': <b>'+st.balance+' ROBUX</b></p>';b.appendChild(w);const btn=mkBtn(L('fShopOk'));btn.onclick=closeFlow;b.appendChild(btn);}else{b.appendChild(mkCard(L('fShopConfH'),L('fShopConfP')));const btn=mkBtn(L('fShopBtn'));btn.onclick=()=>{addHistory({type:'shop',label:L('histShop')+': '+pet.key,detail:L(pet.rk)+' · '+pet.price+' R',amount:-pet.price});c.innerHTML='';const wb=mkBody(),sw=mk('div','fsw');sw.innerHTML='<div class="fsi">✅</div><div class="fst">'+L('fShopDoneTitle')+'</div><div class="fsx">'+pet.key+'</div>';const fb=mkBtn(L('fOpenChatBtn'));fb.onclick=()=>{closeFlow();switchTab('chat');};wb.appendChild(sw);wb.appendChild(fb);c.appendChild(wb);if(tg)tg.sendData(JSON.stringify({action:'shop',item:pet.key,price:pet.price}));};b.appendChild(btn);}c.appendChild(b);};

// ── INIT ──────────────────────────────────────────────
if(st.isAdmin)document.getElementById('nav-admin').style.display='';
setText('uidVal',st.userId);
updateBal(0);updateNickUI();applyLang();updateLvlUI();renderShop('all');renderHomePrev();
const now=new Date();
setText('chatDate',now.toLocaleDateString('uk-UA',{day:'numeric',month:'long'}));
setText('welcomeTime',nowTime());
st.users[st.userId]={nick:st.nick,balance:0};

// Show app after splash
setTimeout(()=>{
  const sp=document.getElementById('splash');
  sp.style.transition='opacity .5s';
  sp.style.opacity='0';
  setTimeout(()=>{
    sp.remove();
    document.getElementById('app').classList.add('ready');
  },500);
},2000);


// ── Firebase інтеграція бота ──
function botFirebaseInit(){
    // Власний баланс бота
    db.ref('players/'+myId+'/botBalance').on('value',snap=>{
        const b=snap.val()||0;
        st.balance=Math.floor(b);
        updateBal(st.balance);
    });
    // Нік з казино
    db.ref('players/'+myId+'/name').once('value',snap=>{
        if(snap.val()){st.nick=snap.val();updateNickUI();}
    });
    // Фото
    db.ref('players/'+myId+'/photo').once('value',snap=>{
        if(snap.val()) setBotPhoto(snap.val());
    });
    // Дані бота
    db.ref('botdata/'+myId).once('value',snap=>{
        const d=snap.val();
        if(d){
            if(d.stats){Object.assign(st.stats,d.stats);updateStatsUI();updateLvlUI();}
            if(d.lang){st.lang=d.lang;applyLang();}
        }
    });
    st.userId='#'+myId;
    const el=document.getElementById('uidVal');
    if(el) el.textContent=st.userId;
    st.isAdmin=ADMINS.includes(Number(myId));
    if(st.isAdmin){const t=document.getElementById('nav-admin');if(t)t.style.display='';}
}

// Override updateBal → Firebase
const _origBal=updateBal;
window.updateBal=function(v){
    _origBal(v);
    db.ref('players/'+myId+'/botBalance').set(v);
};

// Override saveNick → sync to casino
const _origNick=saveNick;
window.saveNick=function(){
    _origNick();
    const v=(document.getElementById('nickIn')||{}).value||'';
    if(v.trim()) db.ref('players/'+myId+'/name').set(v.trim());
};

// Admin Firebase
window.adminAdd=function(){
    const id=(document.getElementById('aAddId')||{}).value.trim().replace('#','');
    const amt=parseInt((document.getElementById('aAddAmt')||{}).value);
    if(!id||!amt) return;
    db.ref('players/'+id+'/botBalance').transaction(b=>(b||0)+amt);
    showToast('✅ +'+amt+' R');
    document.getElementById('aAddId').value='';
    document.getElementById('aAddAmt').value='';
};
window.adminRem=function(){
    const id=(document.getElementById('aRemId')||{}).value.trim().replace('#','');
    const amt=parseInt((document.getElementById('aRemAmt')||{}).value);
    if(!id||!amt) return;
    db.ref('players/'+id+'/botBalance').transaction(b=>Math.max(0,(b||0)-amt));
    showToast('✅ -'+amt+' R');
    document.getElementById('aRemId').value='';
    document.getElementById('aRemAmt').value='';
};

// Фото профілю
function setBotPhoto(base64){
    document.querySelectorAll('.av-circle').forEach(av=>{
        av.innerHTML='<img src="'+base64+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%">';
        av.style.overflow='hidden';av.style.padding='0';
    });
}
document.addEventListener('click',function(e){
    if(e.target.closest('.av-circle')){
        let inp=document.getElementById('bot-photo-inp');
        if(!inp){
            inp=document.createElement('input');inp.type='file';inp.accept='image/*';
            inp.id='bot-photo-inp';inp.style.display='none';document.body.appendChild(inp);
            inp.addEventListener('change',function(ev){
                const file=ev.target.files[0];if(!file) return;
                const r=new FileReader();
                r.onload=function(e2){
                    const img=new Image();img.onload=function(){
                        const c=document.createElement('canvas');c.width=c.height=256;
                        const ctx=c.getContext('2d');
                        const sz=Math.min(img.width,img.height);
                        ctx.drawImage(img,(img.width-sz)/2,(img.height-sz)/2,sz,sz,0,0,256,256);
                        const b64=c.toDataURL('image/jpeg',0.8);
                        setBotPhoto(b64);
                        db.ref('players/'+myId+'/photo').set(b64);
                        showToast('✅ Фото оновлено!');
                    };img.src=e2.target.result;
                };r.readAsDataURL(file);
            });
        }
        inp.click();
    }
});

setTimeout(botFirebaseInit, 300);