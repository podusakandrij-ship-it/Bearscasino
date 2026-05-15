// ============================================================
// КЕЙСИ
// ============================================================

// Дедлайн великоднього кейсу (14 квітня 2026, 00:00 UTC)
const DEADLINE_EASTER_CASE = new Date('2026-04-14T00:00:00Z').getTime();

const CASES = {
    basic:    { n:"Common Case 🐾", p:285, drop:[
        {n:'Собака',s:'🐶',r:'Звичайний',  m:1.05,w:40,c:'#94a3b8'},
        {n:'Кіт',   s:'🐱',r:'Звичайний',  m:1.05,w:40,c:'#94a3b8'},
        {n:'Кролик',s:'🐰',r:'Незвичайний',m:1.08,w:20,c:'#3b82f6'}]},
    uncommon: { n:"Rare Case 🌟",   p:525, drop:[
        {n:'Кролик',s:'🐰',r:'Незвичайний',m:1.08,w:46,c:'#3b82f6'},
        {n:'Лисиця',s:'🦊',r:'Незвичайний',m:1.09,w:40,c:'#3b82f6'},
        {n:'Вовк',  s:'🐺',r:'Рідкісний',  m:1.11,w:14,c:'#a855f7'}]},
    rare:     { n:"Epic Case 💎",   p:875, drop:[
        {n:'Вовк',  s:'🐺',r:'Рідкісний',  m:1.11,w:50,c:'#a855f7'},
        {n:'Бджола',s:'🐝',r:'Рідкісний',  m:1.12,w:40,c:'#a855f7'},
        {n:'Панда', s:'🐼',r:'Епічний',    m:1.14,w:10,c:'#f59e0b'}]},
    legend:   { n:"Legendary Case 👑", p:1200, drop:[
        {n:'Панда',    s:'🐼',r:'Епічний',    m:1.14,w:50,c:'#f59e0b'},
        {n:'Лев',      s:'🦁',r:'Легендарний',m:1.16,w:30,c:'#f43f5e'},
        {n:'Дракон',   s:'🐲',r:'Легендарний',m:1.17,w:20,c:'#f43f5e'}]},
    easter:   { n:"Великодній Кейс 🥚", p:1450, limited:true, deadline:DEADLINE_EASTER_CASE, drop:[
        {n:'Місячний заєць',   s:'🌙🐇',r:'Рідкісний',  m:1.165,w:33,c:'#a855f7',drawKey:'moonhare'},
        {n:'Місячний баранчик',s:'🌙🐑',r:'Рідкісний',  m:1.165,w:33,c:'#a855f7',drawKey:'moonlamb'},
        {n:'Пончик-хом\'як',   s:'🍩🐹',r:'Епічний',    m:1.22, w:20,c:'#f59e0b',drawKey:'donutham'},
        {n:'Фенікс-писанка',   s:'🔥🥚',r:'Легендарний',m:1.26, w:10,c:'#f43f5e',drawKey:'phoenixegg'},
        {n:'Привид пасхи',     s:'👻🐰',r:'Міфічний',   m:1.33, w:4, c:'#06b6d4',drawKey:'easterghost'}]},
};

const ADMIN_ONLY_PETS = [
    {n:'Клоун',              s:'🤡',r:'Смехуятина', m:1.67, c:'#ff6b35',drawKey:'clown2'},
    {n:'Смітник',            s:'🗑️',r:'Легендарний',m:1.35, c:'#f43f5e'},
    {n:'Медовий пасх. медвідь',s:'🍯🐻',r:'Епічний',m:1.25, c:'#f59e0b',drawKey:'honeybear'},
    {n:'Унітаз',             s:'🚽',r:'Епічний',    m:1.20, c:'#f59e0b',drawKey:'toilet'},
    {n:'Какашка',            s:'💩',r:'Легендарний', m:1.25, c:'#f43f5e',drawKey:'poop'},
    {n:'Нокіа3310',          s:'📱',r:'Міфічний',   m:1.32, c:'#bf40bf',drawKey:'nokia'},
    // 🌊 Океан кейс (видалений кейс, пети залишились в інвентарях)
    {n:'Рибка',              s:'🐟',r:'Рідкісний',  m:1.160,c:'#3b82f6'},
    {n:'Тропічна рибка',     s:'🐠',r:'Епічний',    m:1.195,c:'#f59e0b'},
    {n:'Акула',              s:'🦈',r:'Епічний',    m:1.150,c:'#6366f1'},
    {n:'Восьминіг',          s:'🐙',r:'Міфічний',   m:1.300,c:'#06b6d4'},
    // 🏴‍☠️ Bears Pass
    {n:'Золотий глист',         s:'🪱', r:'Міфічний',    m:1.233,c:'#d4a017',drawKey:'goldworm'},
    {n:'Балу',                  s:'🐻', r:'Епічний',     m:1.200,c:'#f59e0b',drawKey:'balu'},
    {n:'Нанук',                 s:'🐻‍❄️',r:'Міфічний',    m:1.265,c:'#06b6d4',drawKey:'nanuk'},
    // 🏴‍☠️ Піратський кейс
    {n:'Енн Бонні',             s:'🏴‍☠️',r:'Епічний',     m:1.180,c:'#f59e0b'},
    {n:'Душа Першого Матроса',  s:'💀', r:'Легендарний', m:1.220,c:'#f43f5e'},
    {n:'Одноокий Вартовий',     s:'🏴‍☠️',r:'Міфічний',    m:1.250,c:'#06b6d4'},
];


// ============================================================
// ЩОДЕННІ ЗАВДАННЯ
// ============================================================
const DAILY_QUESTS_DEF = [
    {id:'play5', icon:'🎮', title:'Зіграй 5 ігор',        type:'play',   need:5, reward:{type:'xp',amount:300}},
    {id:'open1', icon:'📦', title:'Відкрий 1 кейс',        type:'case',   need:1, reward:{type:'bb',amount:100}},
    {id:'win3',  icon:'🏆', title:'Виграй 3 рази поспіль', type:'winrow', need:3, reward:{type:'bb',amount:200}},
];

function todayKey(){ return new Date().toISOString().slice(0,10); }

function getDailyState(){
    if(!s.daily||s.daily.day!==todayKey())
        s.daily={day:todayKey(),play:0,case:0,winrow:0,done:{}};
    return s.daily;
}

function dailyProgress(type,amount=1){
    const d=getDailyState();
    if(type==='win')       d.winrow=(d.winrow||0)+1;
    else if(type==='lose') d.winrow=0;
    else                   d[type]=(d[type]||0)+amount;
    DAILY_QUESTS_DEF.forEach(q=>{
        if(d.done[q.id]) return;
        const cur=q.type==='winrow'?(d.winrow||0):(d[q.type]||0);
        if(cur>=q.need){
            d.done[q.id]=true;
            if(q.reward.type==='bb'){s.b+=q.reward.amount;showToast(`\u2705 Завдання виконано! +${q.reward.amount} BB`);}
            if(q.reward.type==='xp'){s.x=(s.x||0)+q.reward.amount;checkPetLevelUp();showToast(`\u2705 Завдання виконано! +${q.reward.amount} XP`);}
        }
    });
    save();
    if(document.getElementById('v-main')?.style.display!=='none') renderDailyQuests();
}

function renderDailyQuests(){
    const el=document.getElementById('daily-quests-card');
    if(!el) return;
    const d=getDailyState();
    const now=new Date(),midnight=new Date(now);
    midnight.setHours(24,0,0,0);
    const diff=midnight-now;
    const hh=Math.floor(diff/3600000),mm=Math.floor((diff%3600000)/60000);
    const rows=DAILY_QUESTS_DEF.map(q=>{
        const done=!!d.done[q.id];
        const cur=Math.min(q.type==='winrow'?(d.winrow||0):(d[q.type]||0),q.need);
        const pct=Math.round(cur/q.need*100);
        const rwStr=q.reward.type==='bb'?`+${q.reward.amount} BB`:`+${q.reward.amount} XP`;
        return `<div class="dq-row${done?' dq-done':''}">
            <div class="dq-icon">${q.icon}</div>
            <div class="dq-info">
                <div class="dq-title-q">${q.title}</div>
                <div class="dq-bar-wrap"><div class="dq-bar" style="width:${pct}%"></div></div>
                <div class="dq-sub">${cur}/${q.need} &middot; <b style="color:var(--accent2)">${rwStr}</b></div>
            </div>
            ${done?'<div class="dq-check">\u2705</div>':''}
        </div>`;
    }).join('');
    el.innerHTML=`<div class="dq-header">
        <span class="dq-title-main">\uD83D\uDCCB Щоденні завдання</span>
        <span class="dq-timer">\uD83D\uDD04 ${hh}г ${mm}хв</span>
    </div>${rows}`;
}
