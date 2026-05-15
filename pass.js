// ============================================================
// BEARS PASS
// ============================================================
// Дата закінчення івенту — керується з Firebase (admin може змінити)
// Fallback: далеке майбутнє якщо не задано
let BP_END = Date.now() + 365*24*3600*1000;
db.ref('bpend').once('value', snap => {
    if(snap.val()) BP_END = snap.val();
    window._bpEndLoaded = true;
    if(document.getElementById('v-pass')?.style.display!=='none') renderBP();
});

const BP_LEVELS = [
    {lvl:1,  xp:0,   reward:{type:'bb',   amount:100}},
    {lvl:2,  xp:20,  reward:{type:'dbl',  amount:1}},
    {lvl:3,  xp:50,  reward:{type:'xp',   amount:100}},
    {lvl:4,  xp:70,  reward:{type:'dbl',  amount:1}},
    {lvl:5,  xp:100, reward:{type:'bb',   amount:50}},
    {lvl:6,  xp:120, reward:{type:'dbl',  amount:1}},
    {lvl:7,  xp:160, reward:{type:'xp',   amount:100}},
    {lvl:8,  xp:180, reward:{type:'dbl',  amount:1}},
    {lvl:9,  xp:200, reward:{type:'bb',   amount:50}},
    {lvl:10, xp:230, reward:{type:'case',  caseKey:'bp'}},
    {lvl:11, xp:250, reward:{type:'dbl',  amount:1}},
    {lvl:12, xp:250, reward:{type:'xp',   amount:300}},
    {lvl:13, xp:250, reward:{type:'dbl',  amount:1}},
    {lvl:14, xp:250, reward:{type:'bb',   amount:50}},
    {lvl:15, xp:260, reward:{type:'case',  caseKey:'bp'}},
    {lvl:16, xp:270, reward:{type:'dbl',  amount:3}},
    {lvl:17, xp:300, reward:{type:'bb',   amount:100}},
    {lvl:18, xp:310, reward:{type:'xp',   amount:250}},
    {lvl:19, xp:320, reward:{type:'bb',   amount:100}},
    {lvl:20, xp:325, reward:{type:'dbl',  amount:1}},
    {lvl:21, xp:330, reward:{type:'xp',   amount:200}},
    {lvl:22, xp:330, reward:{type:'bb',   amount:100}},
    {lvl:23, xp:350, reward:{type:'dbl',  amount:2}},
    {lvl:24, xp:360, reward:{type:'bb',   amount:150}},
    {lvl:25, xp:370, reward:{type:'case',  caseKey:'bp'}},
    {lvl:26, xp:400, reward:{type:'xp',   amount:250}},
    {lvl:27, xp:430, reward:{type:'bb',   amount:100}},
    {lvl:28, xp:460, reward:{type:'dbl',  amount:3}},
    {lvl:29, xp:500, reward:{type:'case',  caseKey:'bp'}},
    {lvl:30, xp:525, reward:{type:'pet',  petKey:'bp_pet'}},
];
// Після 30 рівня: кожні 150 XP → 25 BB
const BP_BONUS_XP   = 150;
const BP_BONUS_BB   = 25;

function getBPState(){
    if(!s.bp) s.bp={xp:0,claimed:{},bonusClaimed:0};
    return s.bp;
}

// Розраховуємо поточний рівень паса
function getBPLevel(bpXp){
    let lvl=1;
    let spent=0;
    for(let i=1;i<BP_LEVELS.length;i++){
        const needed=BP_LEVELS[i].xp;
        if(bpXp>=spent+needed){ spent+=needed; lvl=BP_LEVELS[i].lvl; }
        else break;
    }
    return {lvl, spent};
}

// XP до наступного рівня
function getBPProgress(bpXp){
    const {lvl,spent}=getBPLevel(bpXp);
    const remaining=bpXp-spent;
    const nextIdx=BP_LEVELS.findIndex(l=>l.lvl===lvl+1);
    if(lvl>=30){
        // Після 30 рівня — бонусний прогрес
        const bonusXp=(bpXp-spent);
        return {lvl,remaining:bonusXp%BP_BONUS_XP,needed:BP_BONUS_XP,isBonus:true,bonusCount:Math.floor(bonusXp/BP_BONUS_XP)};
    }
    if(nextIdx===-1) return {lvl,remaining:0,needed:0,isBonus:false,bonusCount:0};
    return {lvl,remaining,needed:BP_LEVELS[nextIdx].xp,isBonus:false,bonusCount:0};
}

// Додаємо XP до паса (1BB виграно = 1 XP паса)
function addBPXp(amount){
    if(!s.bp) s.bp={xp:0,claimed:{},bonusClaimed:0};
    // Перевіряємо чи закінчився івент тільки якщо BP_END завантажено з Firebase
    if(window._bpEndLoaded && Date.now()>BP_END) return;
    s.bp.xp=(s.bp.xp||0)+amount;
    save();
    if(document.getElementById('v-pass')?.style.display!=='none') renderBP();
}

// Нагороди
function bpRewardLabel(r){
    if(r.type==='bb')   return `💰 ${r.amount} BB`;
    if(r.type==='dbl')  return `⚓ ${r.amount} дублон${r.amount>1?(r.amount<5?'и':'ів'):''}`;
    if(r.type==='xp')   return `⭐ ${r.amount} XP`;
    if(r.type==='case') return `📦 BP Кейс`;
    if(r.type==='pet')  return `🐾 Ексклюзивний пет`;
    return '?';
}
function bpRewardIcon(r){
    if(r.type==='bb')   return '💰';
    if(r.type==='dbl')  return '⚓';
    if(r.type==='xp')   return '⭐';
    if(r.type==='case') return '📦';
    if(r.type==='pet')  return '🐾';
    return '🎁';
}

window.claimBPReward=function(lvl){
    const bp=getBPState();
    if(bp.claimed[lvl]) return showToast('Вже отримано!');
    const {lvl:curLvl}=getBPLevel(bp.xp||0);
    if(lvl>curLvl) return showToast('❌ Ще не досягнуто цього рівня!');
    const levelData=BP_LEVELS.find(l=>l.lvl===lvl);
    if(!levelData) return;
    const r=levelData.reward;
    bp.claimed[lvl]=true;
    if(r.type==='bb'){s.b+=r.amount;showToast(`✅ +${r.amount} BB`);}
    else if(r.type==='dbl'){s.dbl=(s.dbl||0)+r.amount;showToast(`✅ +${r.amount} ⚓`);}
    else if(r.type==='xp'){s.x=(s.x||0)+r.amount;checkPetLevelUp();showToast(`✅ +${r.amount} XP`);}
    else if(r.type==='case'){
        // BP Кейс
        const BP_CASE_DROP=[
            {type:'bb', w:60},
            {type:'pet', w:30, pet:{n:'Балу',   s:'🐻', r:'Епічний',  m:1.200, bm:1.200, c:'#f59e0b', drawKey:'balu'}},
            {type:'pet', w:10, pet:{n:'Нанук',  s:'🐻‍❄️', r:'Міфічний', m:1.265, bm:1.265, c:'#06b6d4', drawKey:'nanuk'}},
        ];
        let rand=Math.random()*100, win=null, cur=0;
        for(const d of BP_CASE_DROP){ cur+=d.w; if(rand<=cur){win=d;break;} }
        if(!win) win=BP_CASE_DROP[0];

        if(win.type==='bb'){
            const amount=Math.floor(Math.random()*(1000-50+1))+50;
            s.b+=amount; save(); ren();
            showToast(`📦 BP Кейс: +${amount} BB!`);
        } else {
            const pet={...win.pet, id:Date.now(), lvl:1};
            s.inv.push(pet); save();
            // Показуємо анімацію як звичайний кейс
            openCaseAnimation(pet,()=>{ ren(); });
        }
        return;
    }
    else if(r.type==='pet'){
        // Ексклюзивний BP пет — Золотий глист
        const pet={
            n:'Золотий глист', s:'🪱', r:'Міфічний',
            m:1.233, bm:1.233, c:'#d4a017', drawKey:'goldworm',
            id:Date.now(), lvl:1
        };
        s.inv.push(pet); save(); ren();
        showToast(`🐾 ${pet.s} ${pet.n} отримано!`);
        return;
    }
    save(); ren(); renderBP();
};

window.claimBPBonus=function(idx){
    const bp=getBPState();
    const {lvl,isBonus,bonusCount}=getBPProgress(bp.xp||0);
    if(lvl<30) return showToast('❌ Потрібно досягти 30 рівня!');
    const alreadyClaimed=bp.bonusClaimed||0;
    if(idx>=bonusCount) return showToast('❌ Ще не заробив цей бонус!');
    if(idx<alreadyClaimed) return showToast('Вже отримано!');
    // Видаємо всі незабрані бонуси до idx включно
    const toGive=idx-alreadyClaimed+1;
    s.b+= toGive * BP_BONUS_BB;
    bp.bonusClaimed=idx+1;
    save(); ren();
    showToast(`✅ +${toGive*BP_BONUS_BB} BB`);
    renderBP();
};

function bpTimeLeft(){
    const now=Date.now();
    const diff=BP_END-now;
    if(diff<=0) return null;
    const d=Math.floor(diff/86400000);
    const h=Math.floor((diff%86400000)/3600000);
    const m=Math.floor((diff%3600000)/60000);
    return `${d}д ${h}г ${m}хв`;
}

function renderBP(){
    const el=document.getElementById('v-pass');
    if(!el) return;
    const bp=getBPState();
    const bpXp=bp.xp||0;
    const {lvl:curLvl}=getBPLevel(bpXp);
    const {remaining,needed,isBonus,bonusCount}=getBPProgress(bpXp);
    const timeLeft=bpTimeLeft();
    const pct=needed>0?Math.min((remaining/needed)*100,100):100;

    const rewardColor=r=>{
        if(r.type==='dbl')  return '#f0c840';
        if(r.type==='bb')   return '#34d399';
        if(r.type==='xp')   return '#c084fc';
        if(r.type==='case') return '#fb923c';
        if(r.type==='pet')  return '#f472b6';
        return '#fff';
    };

    let html=`<div style="padding:0 0 90px">

    <!-- ШАПКА -->
    <div style="text-align:center;padding:24px 16px 20px;margin-bottom:4px">
        <div style="font-family:'Fredoka One',cursive;font-size:32px;letter-spacing:3px;
            background:linear-gradient(180deg,#f0c840 0%,#d4a017 100%);
            -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">
            BEARS PASS
        </div>
        <div style="font-size:9px;color:rgba(212,160,23,.5);font-weight:800;letter-spacing:4px;margin-top:2px">ПІРАТСЬКИЙ СЕЗОН</div>
        <div style="margin-top:10px;font-size:12px;font-weight:800;color:${timeLeft?'rgba(255,255,255,.45)':'#ef4444'}">
            ${timeLeft?`⏳ ${timeLeft}`:'❌ Івент завершено'}
        </div>
    </div>

    <!-- XP прогрес -->
    <div style="background:rgba(255,255,255,.04);border-radius:16px;padding:14px 16px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px">
            <span style="font-family:'Fredoka One',cursive;font-size:20px;color:#f0c840">LVL ${curLvl}${curLvl>=30?' ★':''}</span>
            <span style="font-size:11px;color:rgba(255,255,255,.35);font-weight:700">
                ${isBonus?`${remaining} / ${BP_BONUS_XP} XP`:`${remaining} / ${needed} XP`}
            </span>
        </div>
        <div style="background:rgba(255,255,255,.08);border-radius:50px;height:8px;overflow:hidden">
            <div style="background:linear-gradient(90deg,#d4a017,#f0c840);height:100%;width:${pct}%;border-radius:50px;transition:.4s"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:12px">
            <div style="text-align:center">
                <div style="font-size:9px;color:rgba(255,255,255,.3);font-weight:700;letter-spacing:1px;margin-bottom:3px">ДУБЛОНИ</div>
                <div style="font-size:15px;font-weight:900;color:#f0c840">⚓ ${s.dbl||0}</div>
            </div>
            <div style="width:1px;background:rgba(255,255,255,.08)"></div>
            <div style="text-align:center">
                <div style="font-size:9px;color:rgba(255,255,255,.3);font-weight:700;letter-spacing:1px;margin-bottom:3px">XP ПАСА</div>
                <div style="font-size:15px;font-weight:900;color:#c084fc">⭐ ${bpXp}</div>
            </div>
            <div style="width:1px;background:rgba(255,255,255,.08)"></div>
            <div style="text-align:center">
                <div style="font-size:9px;color:rgba(255,255,255,.3);font-weight:700;letter-spacing:1px;margin-bottom:3px">РІВЕНЬ</div>
                <div style="font-size:15px;font-weight:900;color:#f0c840">${curLvl} / 30</div>
            </div>
        </div>
    </div>

    <!-- НАГОРОДИ -->
    <div style="font-size:9px;color:rgba(255,255,255,.2);font-weight:800;letter-spacing:3px;text-align:center;margin:14px 0 8px">НАГОРОДИ</div>
    <div style="display:flex;flex-direction:column;gap:4px">`;

    BP_LEVELS.forEach(level=>{
        const claimed=!!bp.claimed[level.lvl];
        const unlocked=curLvl>=level.lvl;
        const canClaim=unlocked&&!claimed;
        const r=level.reward;
        const col=rewardColor(r);
        const isSpecial=r.type==='case'||r.type==='pet';

        html+=`<div style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:11px;
            background:${canClaim?'rgba(212,160,23,.08)':claimed?'rgba(255,255,255,.02)':isSpecial?'rgba(251,115,22,.04)':'transparent'};
            border:1px solid ${canClaim?'rgba(212,160,23,.3)':claimed?'rgba(255,255,255,.05)':isSpecial?'rgba(251,115,22,.15)':'rgba(255,255,255,.05)'}">
            <div style="width:28px;height:28px;border-radius:8px;flex-shrink:0;
                background:${claimed?'rgba(16,185,129,.12)':canClaim?'rgba(212,160,23,.12)':'rgba(255,255,255,.05)'};
                display:flex;align-items:center;justify-content:center;
                font-size:${claimed?'14':'11'}px;font-weight:900;
                color:${claimed?'#10b981':canClaim?'#f0c840':'rgba(255,255,255,.2)'}">
                ${claimed?'✓':level.lvl}
            </div>
            <div style="flex:1;min-width:0">
                <div style="font-size:13px;font-weight:800;color:${claimed?'rgba(255,255,255,.25)':col}">
                    ${bpRewardIcon(r)} ${bpRewardLabel(r)}
                </div>
                ${!unlocked&&level.lvl===curLvl+1&&needed>0?`
                <div style="background:rgba(255,255,255,.06);border-radius:50px;height:2px;margin-top:5px;overflow:hidden">
                    <div style="background:#d4a017;height:100%;width:${pct}%;border-radius:50px"></div>
                </div>`:''}
            </div>
            ${canClaim
                ?`<button onclick="claimBPReward(${level.lvl})" style="background:linear-gradient(135deg,#d4a017,#f0c840);border:none;border-radius:8px;padding:6px 12px;font-size:11px;font-weight:900;color:#000;cursor:pointer;flex-shrink:0;white-space:nowrap">ЗАБРАТИ</button>`
                :claimed
                    ?`<span style="color:#10b981;font-size:16px;flex-shrink:0">✓</span>`
                    :`<span style="font-size:11px;color:rgba(255,255,255,.15);flex-shrink:0">🔒</span>`
            }
        </div>`;
    });

    // Бонуси після 30 рівня
    if(curLvl>=30||bonusCount>0){
        const alreadyClaimed=bp.bonusClaimed||0;
        html+=`<div style="font-size:9px;color:rgba(255,255,255,.2);font-weight:800;letter-spacing:3px;text-align:center;margin:14px 0 8px">БОНУС КОЖНІ ${BP_BONUS_XP} XP</div>`;
        const totalBonus=Math.max(bonusCount,alreadyClaimed);
        for(let i=0;i<Math.max(totalBonus+1,3);i++){
            const bonusClaimed=i<alreadyClaimed;
            const bonusAvail=i<bonusCount&&!bonusClaimed;
            html+=`<div style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:11px;
                background:${bonusAvail?'rgba(212,160,23,.08)':'transparent'};
                border:1px solid ${bonusClaimed?'rgba(255,255,255,.05)':bonusAvail?'rgba(212,160,23,.3)':'rgba(255,255,255,.05)'}">
                <div style="width:28px;height:28px;border-radius:8px;flex-shrink:0;background:${bonusClaimed?'rgba(16,185,129,.12)':'rgba(255,255,255,.05)'};display:flex;align-items:center;justify-content:center;font-size:${bonusClaimed?'14':'13'}px;color:${bonusClaimed?'#10b981':'rgba(255,255,255,.2)'}">
                    ${bonusClaimed?'✓':'💰'}
                </div>
                <div style="flex:1"><div style="font-size:13px;font-weight:800;color:${bonusClaimed?'rgba(255,255,255,.25)':'#34d399'}">💰 ${BP_BONUS_BB} BB · Бонус #${i+1}</div></div>
                ${bonusAvail?`<button onclick="claimBPBonus(${i})" style="background:linear-gradient(135deg,#d4a017,#f0c840);border:none;border-radius:8px;padding:6px 12px;font-size:11px;font-weight:900;color:#000;cursor:pointer;flex-shrink:0">ЗАБРАТИ</button>`:bonusClaimed?`<span style="color:#10b981;font-size:16px">✓</span>`:`<span style="color:rgba(255,255,255,.15)">🔒</span>`}
            </div>`;
        }
    }

    html+=`</div></div>`;
    el.innerHTML=html;

    if(!window._bpTimer) window._bpTimer=setInterval(()=>{
        if(document.getElementById('v-pass')?.style.display!=='none') renderBP();
        else{clearInterval(window._bpTimer);window._bpTimer=null;}
    },60000);
}

// ─── Піратський кейс за дублони (в магазині) ───
const PIRATE_CASE_DROP=[
    {type:'pet',w:55,pet:{n:'Енн Бонні',             s:'🏴‍☠️',r:'Епічний',     m:1.180,bm:1.180,c:'#f59e0b'}},
    {type:'pet',w:35,pet:{n:'Душа Першого Матроса',  s:'💀', r:'Легендарний', m:1.220,bm:1.220,c:'#f43f5e'}},
    {type:'pet',w:10,pet:{n:'Одноокий Вартовий',     s:'👁', r:'Міфічний',    m:1.250,bm:1.250,c:'#06b6d4'}},
];
const PIRATE_CASE_PRICE=3;

window.buyPirateCase=function(){
    if((s.dbl||0)<PIRATE_CASE_PRICE) return showToast(`❌ Потрібно ${PIRATE_CASE_PRICE} ⚓ дублони!`);
    s.dbl-=PIRATE_CASE_PRICE;
    let rand=Math.random()*100,win=null,cur=0;
    for(const d of PIRATE_CASE_DROP){cur+=d.w;if(rand<=cur){win={...d.pet,id:Date.now(),lvl:1};break;}}
    if(!win) win={...PIRATE_CASE_DROP[0].pet,id:Date.now(),lvl:1};
    s.inv.push(win); save(); ren();
    openCaseAnimation(win,()=>{ ren(); });};
