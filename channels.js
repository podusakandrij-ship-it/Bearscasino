// ============================================================
// ПІДПИСКИ НА КАНАЛИ
// ============================================================
window.renderChannels=async function(){
    const el=document.getElementById('channels-wrap');
    if(!el) return;
    const snap=await db.ref('channels').once('value');
    const channels=snap.val()||{};
    if(!Object.keys(channels).length){
        el.innerHTML=`<div style="text-align:center;color:var(--muted);padding:16px;font-size:13px">Немає активних підписок</div>`;
        return;
    }
    const claimed=s.claimedChannels||{};
    // Зберігаємо які посилання клікнув гравець (локально)
    if(!window._chClicked) window._chClicked={};
    el.innerHTML=Object.entries(channels).map(([id,ch])=>{
        const done=!!claimed[id];
        const rwStr=ch.rewardType==='bb'?`+${ch.reward} BB`:`+${ch.reward} XP`;
        const clicked=!!window._chClicked[id];
        return `<div class="sett-card" style="margin-bottom:8px;flex-direction:column;align-items:flex-start;gap:8px">
            <div style="display:flex;align-items:center;gap:10px;width:100%">
                <span style="font-size:22px">📢</span>
                <div style="flex:1"><div style="font-weight:700;font-size:14px">${ch.name}</div>
                <div style="font-size:11px;color:var(--muted)">Нагорода: <b style="color:var(--accent2)">${rwStr}</b></div></div>
                ${done?'<span style="color:var(--success);font-size:13px;font-weight:700">✅</span>':''}
            </div>
            ${!done?`<div style="display:flex;gap:7px;width:100%">
                <a href="${ch.url}" target="_blank" style="flex:1;padding:9px;border-radius:9px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:var(--text);font-size:12px;font-weight:700;text-align:center;text-decoration:none"
                   onclick="window._chClicked['${id}']=Date.now();setTimeout(()=>window.renderChannels(),500)">🔗 Підписатись</a>
                <button class="btn" style="flex:1;padding:9px;font-size:12px;font-family:inherit;${!clicked?'opacity:.4;cursor:not-allowed':''}"
                   onclick="${clicked?`claimChannel('${id}')`:'showToast(\"⚠️ Спочатку натисни Підписатись!\")'}">${clicked?'✅ Отримати':'🔒 Отримати'}</button>
            </div>
            ${clicked?`<div style="font-size:10px;color:var(--success);width:100%">✔ Посилання відкрито — тепер натисни Отримати</div>`:
            `<div style="font-size:10px;color:var(--muted);width:100%">⚠️ Спочатку підпишись на канал, потім натисни Отримати</div>`}
            `:''}
        </div>`;
    }).join('');
};

window.claimChannel=async function(id){
    if((s.claimedChannels||{})[id]) return showToast('Вже отримано!');
    // Перевірка що гравець натиснув посилання
    if(!window._chClicked||!window._chClicked[id]) return showToast('⚠️ Спочатку натисни кнопку Підписатись!');
    const snap=await db.ref('channels/'+id).once('value');
    const ch=snap.val();
    if(!ch) return;
    if(!s.claimedChannels) s.claimedChannels={};
    s.claimedChannels[id]=true;
    let rewardMsg='';
    // Підтримка кількох нагород: rewards масив або одна нагорода
    const rewards=ch.rewards||[{type:ch.rewardType||'bb',amount:ch.reward}];
    rewards.forEach(rw=>{
        if(rw.type==='bb'){s.b+=rw.amount;rewardMsg+=`+${rw.amount} BB `;}
        else if(rw.type==='xp'){s.x=(s.x||0)+rw.amount;checkPetLevelUp();rewardMsg+=`+${rw.amount} XP `;}
        else if(rw.type==='pet'&&rw.pet){const p={...rw.pet,id:Date.now(),lvl:1};s.inv.push(p);rewardMsg+=`${p.s||''}${p.n} `;}
    });
    save();
    showToast(`🎉 Дякуємо за підписку! ${rewardMsg.trim()}`);
    window.renderChannels();
};
