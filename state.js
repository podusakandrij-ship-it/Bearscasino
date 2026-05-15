// ============================================================
// СТАН
// ============================================================
let s={b:0,x:0,r:1,name:myName,p:null,inv:[],dbl:0,v:6.0};
let currentShopTab='cases',currentAdminTab='balance';
let adminInvUserId=null,adminInvUserName='';

// FIREBASE SYNC
let _splashFired = false;
let _saving = false;
let _saveTimer = null;
function save(){
    _saving = true;
    clearTimeout(_saveTimer);
    _saveTimer = setTimeout(()=>{ _saving = false; }, 3000);
    db.ref('players/'+myId).set(s);
}

db.ref('players/'+myId).on('value',snap=>{
    const d=snap.val();
    if(d){
        if(_saving){
            // Під час збереження — тільки оновлюємо UI без перезапису s
            ren();
            if(!_splashFired){ _splashFired=true; if(window._splashDone) window._splashDone(); }
            return;
        }
        const curDaily=s.daily;
        const curAdoptPurchases=s.adoptPurchases;
        const curBP=s.bp;
        const curB=s.b;
        const curDbl=s.dbl;
        s=d;
        if(!s.inv) s.inv=[];
        // Зберігаємо найбільший баланс (захист від відкату)
        if(curB>s.b) s.b=curB;
        if(curDbl>(s.dbl||0)) s.dbl=curDbl;
        // Daily
        if(curDaily&&curDaily.day===todayKey()&&(!s.daily||s.daily.day!==todayKey())) s.daily=curDaily;
        // AdoptPurchases — мерджимо максимум
        if(curAdoptPurchases){
            if(!s.adoptPurchases) s.adoptPurchases={};
            Object.entries(curAdoptPurchases).forEach(([id,qty])=>{
                if((s.adoptPurchases[id]||0)<qty) s.adoptPurchases[id]=qty;
            });
        }
        // BP — зберігаємо більший XP і більше claimed
        if(curBP){
            if(!s.bp) s.bp=curBP;
            else{
                if((curBP.xp||0)>(s.bp.xp||0)) s.bp.xp=curBP.xp;
                if(curBP.claimed) Object.assign(s.bp.claimed=s.bp.claimed||{},curBP.claimed);
                if((curBP.bonusClaimed||0)>(s.bp.bonusClaimed||0)) s.bp.bonusClaimed=curBP.bonusClaimed;
            }
        }
    }
    else{ db.ref('players/'+myId).set(s); }
    ren();
    if(!_splashFired){ _splashFired=true; if(window._splashDone) window._splashDone(); }
});

// ============================================================
// XP / LEVELUP
// ============================================================
function checkPetLevelUp(){
    if(!s.p) return;
    let levelled = false;
    // Ініціалізуємо базовий множник якщо ще не збережено
    if(!s.p.bm) s.p.bm = Math.round((s.p.m - ((s.p.lvl||1)-1)*0.005)*1000)/1000;
    while(s.x >= xpForLevel(s.p.lvl||1)){
        const needed = xpForLevel(s.p.lvl||1);
        s.x  -= needed;
        s.p.lvl = (s.p.lvl||1) + 1;
        // Рахуємо від базового щоб не накопичувались помилки
        s.p.m = Math.round((s.p.bm + (s.p.lvl-1)*0.005)*1000)/1000;
        levelled = true;
    }
    if(levelled){
        const idx = s.inv.findIndex(i=>i.id===s.p.id);
        if(idx!==-1) s.inv[idx] = s.p;
        save();
        showToast(`${getPetEmoji(s.p)} <b>${s.p.n}</b> — LVL ${s.p.lvl}! <span style="color:var(--accent)">+0.005 бонус</span>`);
        ren();
    }
}
function showToast(html){
    const t=document.createElement('div');
    t.innerHTML=html; t.className='toast';
    document.body.appendChild(t);
    setTimeout(()=>t.remove(),3000);
}
