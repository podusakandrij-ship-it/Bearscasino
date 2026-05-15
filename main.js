// ============================================================


// ============================================================
// СТАРТ
// ============================================================
applyTheme(currentTheme);
applyLang(currentLang);
updUI();
initMusic();

// ── Кастомні множники петів ──
function applyPetMults(overrides){
    if(!overrides) return;
    const applyToList=list=>list.forEach(pet=>{
        const key=pet.n.replace(/[^a-zA-ZА-Яа-яёЁіІїЇєЄ0-9]/g,'_');
        if(overrides[key]!==undefined){
            // Оновлюємо базовий множник
            pet.bm=overrides[key];
            // Перераховуємо фінальний з урахуванням рівня
            pet.m=Math.round((pet.bm+((pet.lvl||1)-1)*0.005)*1000)/1000;
        }
    });
    Object.values(CASES).forEach(c=>applyToList(c.drop));
    applyToList(ADMIN_ONLY_PETS);
    // Оновлюємо петів в інвентарі гравця і зберігаємо в Firebase
    if(s.inv){
        applyToList(s.inv);
        db.ref('players/'+myId+'/inv').set(s.inv);
    }
    // Оновлюємо активного пета і зберігаємо
    if(s.p){
        const key=s.p.n.replace(/[^a-zA-ZА-Яа-яёЁіІїЇєЄ0-9]/g,'_');
        if(overrides[key]!==undefined){
            s.p.bm=overrides[key];
            s.p.m=Math.round((s.p.bm+((s.p.lvl||1)-1)*0.005)*1000)/1000;
            db.ref('players/'+myId+'/p').set(s.p);
        }
    }
    ren();
}
db.ref('petmults').on('value',snap=>applyPetMults(snap.val()));

// ── Оголошення для гравців ──
function initAnnounce(){
    db.ref('announce').on('value',snap=>{
        const ann=snap.val();
        let banner=document.getElementById('announce-banner');
        if(!ann||!ann.text){
            if(banner) banner.remove();
            return;
        }
        if(!banner){
            banner=document.createElement('div');
            banner.id='announce-banner';
            const container=document.querySelector('.container');
            if(container) container.prepend(banner);
        }
        const colors={info:'rgba(6,182,212,.12)',warn:'rgba(251,191,36,.12)',event:'rgba(168,85,247,.12)'};
        const borders={info:'rgba(6,182,212,.3)',warn:'rgba(251,191,36,.3)',event:'rgba(168,85,247,.3)'};
        const icons={info:'ℹ️',warn:'⚠️',event:'🎉'};
        const t=ann.type||'info';
        banner.style.cssText=`background:${colors[t]};border:1px solid ${borders[t]};border-radius:12px;padding:10px 14px;margin:0 0 10px;display:flex;align-items:center;gap:10px`;
        banner.innerHTML=`<span style="font-size:18px;flex-shrink:0">${icons[t]}</span>
            <div style="flex:1;font-size:12px;font-weight:700;color:#fff;line-height:1.4">${ann.text}${ann.link?`<br><a href="${ann.link}" target="_blank" style="color:var(--accent2);font-size:11px">🔗 Детальніше</a>`:''}</div>
            <button onclick="document.getElementById('announce-banner').style.display='none'" style="background:none;border:none;color:var(--muted);font-size:18px;cursor:pointer;flex-shrink:0;padding:0">✕</button>`;
    });
}
setTimeout(initAnnounce, 1500);

// Оновлення таймеру кейсів кожну хвилину
setInterval(()=>{
    if(document.getElementById('v-shop')?.style.display!=='none') renderShop();
}, 60000);
