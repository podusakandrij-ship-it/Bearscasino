// ============================================================
// ТЕМИ
// ============================================================
const THEMES = {
    gold:   {name:'🏆 Золото',  a:'#d4a017',a2:'#f0c840',bg:'#07090a',btnTxt:'#0a0800'},
    blue:   {name:'💎 Сапфір',  a:'#58a6ff',a2:'#93c5fd',bg:'#030810',btnTxt:'#fff'},
    purple: {name:'🔮 Аметист', a:'#a855f7',a2:'#c084fc',bg:'#07050f',btnTxt:'#fff'},
    green:  {name:'🌿 Смарагд', a:'#22c55e',a2:'#4ade80',bg:'#030c05',btnTxt:'#000'},
    red:    {name:'🔥 Рубін',   a:'#ef4444',a2:'#f87171',bg:'#0c0303',btnTxt:'#fff'},
};
let currentTheme = localStorage.getItem('bc_theme') || 'gold';
let currentLang  = localStorage.getItem('bc_lang')  || 'uk';

function applyTheme(key) {
    const t=THEMES[key]||THEMES.gold;
    const r=document.documentElement.style;
    r.setProperty('--accent',  t.a);
    r.setProperty('--accent2', t.a2);
    r.setProperty('--bg',      t.bg);
    r.setProperty('--btn-txt', t.btnTxt);
    // Логотип — завжди градієнт з кольорів поточної теми
    const logo=document.querySelector('.logo');
    if(logo) logo.style.backgroundImage=`linear-gradient(90deg,${t.a},${t.a2},${t.a},${t.a2},${t.a})`;
    // Баланс чіп
    const balChip=document.querySelector('.bal-chip');
    if(balChip){
        balChip.style.background=`rgba(${hexToRgb(t.a)},.1)`;
        balChip.style.borderColor=`rgba(${hexToRgb(t.a)},.3)`;
        balChip.style.color=t.a2;
    }
    // Splash bar
    const sb=document.getElementById('splash-bar');
    if(sb) sb.style.background=`linear-gradient(90deg,${t.a},${t.a2})`;
    currentTheme=key; localStorage.setItem('bc_theme',key);
}

function hexToRgb(hex){
    const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
    return `${r},${g},${b}`;
}

// ============================================================
// МОВА
// ============================================================
const LANGS = {
    uk:{
        chooseGame:'ОБЕРИ ГРУ',betLbl:'СТАВКА',betBtn:'ЗРОБИТИ СТАВКУ',
        win:'Переміг!',lose:'Програв!',waiting:'⏳ Очікування...',
        spinning:'🎰 Крутимо...',openCells:'⚡ Відкривай клітинки!',
        minesBoom:'Бум! Міна!',
        take:'💰 ЗАБРАТИ',round:'РАУНД',prize:'Приз:',
        myPets:'🎒 МОЇ ПЕТИ',leaders:'🏆 ЛІДЕРИ',admin:'⚡ АДМІН',
        settings:'⚙️ Налаштування',theme:'Тема',lang:'Мова',
        invEmpty:'Інвентар порожній',invEmptySub:'Відкривай кейси в магазині!',
        loading:'Завантаження...',marketEmpty:'На ринку порожньо',
        saved:'✅ Збережено!',chosen:'ВИБРАНЕ ЧИСЛО',
        g_f50:'⚖️ 50/50 (x1.55)',g_dice:'🎲 Кубик (x2.05)',
        g_wheel:'🎡 Колесо (до x1.6)',g_slots:'🎰 Слоти (до x5.0)',
        g_mines:'💣 Міни (до x4.0)',
        g_bj:'🃏 Блекджек (x2.0)',
        navShop:'📦',navInv:'🎒',navTop:'🏆',navSet:'⚙️',
        tabCases:'📦 Кейси',tabMarket:'🛒 Ринок',
        dealer:'ДИЛЕР',you:'ВИ',hit:'ЩЕ',stand:'СТОП',
        bonusLabel:'БОНУС',lvlLabel:'LVL',
        adminBalance:'Баланс',adminPets:'Пети',adminInv:'Інвентар',
        equip:'Взяти',equipped:'✅',bonusWord:'Бонус',
        roundsAndMults:'РАУНДИ ТА МНОЖНИКИ',pressToStart:'Натисни ЗРОБИТИ СТАВКУ щоб почати',
        popsCount:'Лопань:',bjBust:'Перебір!',bjWin:'Виграш!',bjLose:'Програш',
        anon:'Анонім',petsCount:'Петів:',viewInv:'🎒 Переглянути',empty:'Порожньо',
        activePet:'Активний',confirmDelete:'Видалити',given:'Видано!',
        invCountLabel:'ПЕТІВ',
        back:'← Назад',petsOf:'петів',noPet:'Обери пета',noPetRarity:'НЕМАЄ',
        bonusLabelHud:'БОНУС',openingCase:'ВІДКРИВАЄМО...',
        music:'Музика',musicOn:'🔊 Увімк.',musicOff:'🔇 Вимк.',
    },
    en:{
        chooseGame:'CHOOSE GAME',betLbl:'BET',betBtn:'PLACE BET',
        win:'Won!',lose:'Lost!',waiting:'⏳ Waiting...',
        spinning:'🎰 Spinning...',openCells:'⚡ Open cells!',
        minesBoom:'Boom! Mine!',
        take:'💰 TAKE',round:'ROUND',prize:'Prize:',
        myPets:'🎒 MY PETS',leaders:'🏆 LEADERS',admin:'⚡ ADMIN',
        settings:'⚙️ Settings',theme:'Theme',lang:'Language',
        invEmpty:'Inventory empty',invEmptySub:'Open cases in the shop!',
        loading:'Loading...',marketEmpty:'Market is empty',
        saved:'✅ Saved!',chosen:'CHOSEN NUMBER',
        g_f50:'⚖️ 50/50 (x1.55)',g_dice:'🎲 Dice (x2.05)',
        g_wheel:'🎡 Wheel (up to x1.6)',g_slots:'🎰 Slots (up to x5.0)',
        g_mines:'💣 Mines (up to x4.0)',
        g_bj:'🃏 Blackjack (x2.0)',
        navShop:'📦',navInv:'🎒',navTop:'🏆',navSet:'⚙️',
        tabCases:'📦 Cases',tabMarket:'🛒 Market',
        dealer:'DEALER',you:'YOU',hit:'HIT',stand:'STAND',
        bonusLabel:'BONUS',lvlLabel:'LVL',
        adminBalance:'Balance',adminPets:'Pets',adminInv:'Inventory',
        equip:'Equip',equipped:'✅',bonusWord:'Bonus',
        roundsAndMults:'ROUNDS & MULTIPLIERS',pressToStart:'Press PLACE BET to start',
        popsCount:'Pops:',bjBust:'Bust!',bjWin:'Win!',bjLose:'Loss',
        anon:'Anonymous',petsCount:'Pets:',viewInv:'🎒 View',empty:'Empty',
        activePet:'Active',confirmDelete:'Delete',given:'Given!',
        invCountLabel:'PETS',
        back:'← Back',petsOf:'pets',noPet:'Choose a pet',noPetRarity:'NONE',
        bonusLabelHud:'BONUS',openingCase:'OPENING...',
        music:'Music',musicOn:'🔊 On',musicOff:'🔇 Off',
    },
    ru:{
        chooseGame:'ВЫБЕРИ ИГРУ',betLbl:'СТАВКА',betBtn:'СДЕЛАТЬ СТАВКУ',
        win:'Победил!',lose:'Проиграл!',waiting:'⏳ Ожидание...',
        spinning:'🎰 Крутим...',openCells:'⚡ Открывай клетки!',
        minesBoom:'Бум! Мина!',
        take:'💰 ЗАБРАТЬ',round:'РАУНД',prize:'Приз:',
        myPets:'🎒 МОИ ПИТОМЦЫ',leaders:'🏆 ЛИДЕРЫ',admin:'⚡ АДМИН',
        settings:'⚙️ Настройки',theme:'Тема',lang:'Язык',
        invEmpty:'Инвентарь пуст',invEmptySub:'Открывай кейсы в магазине!',
        loading:'Загрузка...',marketEmpty:'Рынок пуст',
        saved:'✅ Сохранено!',chosen:'ВЫБРАННОЕ ЧИСЛО',
        g_f50:'⚖️ 50/50 (x1.55)',g_dice:'🎲 Кубик (x2.05)',
        g_wheel:'🎡 Колесо (до x1.6)',g_slots:'🎰 Слоты (до x5.0)',
        g_mines:'💣 Мины (до x4.0)',
        g_bj:'🃏 Блекджек (x2.0)',
        navShop:'📦',navInv:'🎒',navTop:'🏆',navSet:'⚙️',
        tabCases:'📦 Кейсы',tabMarket:'🛒 Рынок',
        dealer:'ДИЛЕР',you:'ВЫ',hit:'ЕЩЁ',stand:'СТОП',
        bonusLabel:'БОНУС',lvlLabel:'УРВ',
        adminBalance:'Баланс',adminPets:'Питомцы',adminInv:'Инвентарь',
        equip:'Взять',equipped:'✅',bonusWord:'Бонус',
        roundsAndMults:'РАУНДЫ И МНОЖИТЕЛИ',pressToStart:'Нажми СДЕЛАТЬ СТАВКУ чтобы начать',
        popsCount:'Взрывов:',bjBust:'Перебор!',bjWin:'Выигрыш!',bjLose:'Проигрыш',
        anon:'Аноним',petsCount:'Питомцев:',viewInv:'🎒 Просмотр',empty:'Пусто',
        activePet:'Активный',confirmDelete:'Удалить',given:'Выдано!',
        invCountLabel:'ПИТОМЦЕВ',
        back:'← Назад',petsOf:'питомцев',noPet:'Выбери питомца',noPetRarity:'НЕТ',
        bonusLabelHud:'БОНУС',openingCase:'ОТКРЫВАЕМ...',
        music:'Музыка',musicOn:'🔊 Вкл.',musicOff:'🔇 Выкл.',
    },
};
function L(k){return(LANGS[currentLang]||LANGS.uk)[k]||k;}

function applyLang(lang){
    currentLang=lang; localStorage.setItem('bc_lang',lang);
    // Select options
    const sel=document.getElementById('g-sel');
    if(sel){
        const keys=['g_f50','g_dice','g_wheel','g_slots','g_mines','g_bj',];
        [...sel.options].forEach((o,i)=>{if(keys[i])o.text=L(keys[i]);});
    }
    // data-l elements
    document.querySelectorAll('[data-l]').forEach(el=>el.textContent=L(el.dataset.l));
    // IDs
    const ids={
        'btn-play':'betBtn','inv-heading':'myPets','top-heading':'leaders',
        'sett-heading':'settings','admin-heading':'admin',
        'bj-dealer-lbl':'dealer','bj-you-lbl':'you',
        'bj-hit':'hit','bj-stop':'stand',
        'pet-bonus-lbl':'bonusLabelHud','case-title':'openingCase',
    };
    Object.entries(ids).forEach(([id,key])=>{
        const el=document.getElementById(id); if(el) el.textContent=L(key);
    });
    // Re-render open pages
    ren();
    if(document.getElementById('v-settings')?.style.display!=='none') renderSettings();
    if(document.getElementById('v-shop')?.style.display!=='none') renderShop();
    if(document.getElementById('v-inv')?.style.display!=='none') renderInv();
    buildDiceUI();
}
