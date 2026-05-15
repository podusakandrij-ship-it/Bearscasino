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

// ============================================================
// РЕФЕРАЛЬНА СИСТЕМА
// ============================================================
function getRefCode(){
    if(!s.refCode){
        s.refCode='BEAR'+String(myId).slice(-4)+Math.random().toString(36).slice(2,5).toUpperCase();
        save();
    }
    return s.refCode;
}

window.applyRef=async function(){
    const code=(document.getElementById('ref-inp')?.value||'').trim().toUpperCase();
    if(!code) return;
    if(code===getRefCode()) return showToast('\u274C Не можна використати власний код!');
    if(s.refUsed) return showToast('\u274C Ти вже використав реферальний код!');
    const snap=await db.ref('players').orderByChild('refCode').equalTo(code).once('value');
    if(!snap.exists()) return showToast('\u274C Код не знайдено');
    const [refUid]=Object.entries(snap.val())[0];
    if(String(refUid)===String(myId)) return showToast('\u274C Не можна використати власний код!');
    const bonus=250;
    s.b+=bonus; s.refUsed=code; save();
    db.ref('players/'+refUid+'/b').transaction(c=>(c||0)+bonus);
    db.ref('players/'+refUid+'/refCount').transaction(c=>(c||0)+1);
    showToast(`\uD83C\uDF89 +${bonus} BB тобі і другу!`);
    renderSettings();
};
