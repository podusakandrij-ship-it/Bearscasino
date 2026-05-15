// ============================================================
// РЕНДЕР
// ============================================================
const RARITY_GLOW={
    'Звичайний':'#94a3b8','Незвичайний':'#3b82f6','Рідкісний':'#a855f7',
    'Епічний':'#f59e0b','Легендарний':'#f43f5e','Міфічний':'#06b6d4',
    'Смехуятина':'#ff6b35',
};

function ren(){
    try {
    // Баланс BB
    document.getElementById('bal-val').innerText = Number.isInteger(s.b) ? s.b : s.b.toFixed(2);

    // Дублони
    const dblEl = document.getElementById('dbl-val');
    if(dblEl) dblEl.innerText = s.dbl || 0;

    const petLvl  = s.p ? (s.p.lvl||1) : 1;
    const needed  = xpForLevel(petLvl);
    const pct     = Math.min((s.x / needed)*100, 100);

    // XP бар з анімацією
    const xpFill = document.getElementById('xp-f');
    if (xpFill) xpFill.style.width = pct + '%';

    // XP текст
    const xpText = document.getElementById('xp-text');
    if (xpText) xpText.textContent = `${s.x} / ${needed} XP`;

    // Бонус лейбл
    const bonusLbl = document.getElementById('pet-bonus-lbl');
    if (bonusLbl) bonusLbl.textContent = L('bonusLabelHud');

    const hudWrap = document.getElementById('p-hud-wrap');

    if (s.p) {
        if (hudWrap) {
            const imgSrc = getPetImageSrc(s.p);
            if (imgSrc.type === 'img') {
                hudWrap.innerHTML = `<img src="${imgSrc.src}" style="width:52px;height:52px;object-fit:contain;">`;
            } else {
                hudWrap.innerHTML = `<span style="font-size:34px;animation:pet-float 3s ease-in-out infinite">${imgSrc.src}</span>`;
            }
        }
        document.getElementById('p-name').innerText  = s.p.n;
        document.getElementById('p-m').innerText     = 'x' + s.p.m.toFixed(3);
        document.getElementById('p-l').innerText     = s.p.lvl || 1;
        const rb = document.getElementById('p-rarity');
        rb.innerText = s.p.r;
        rb.style.background = (s.p.c||'#94a3b8') + '22';
        rb.style.color = s.p.c || '#94a3b8';
        rb.style.border = `1px solid ${s.p.c||'#94a3b8'}44`;
    } else {
        if (hudWrap) hudWrap.innerHTML = `<span style="font-size:34px">🥚</span>`;
        document.getElementById('p-name').innerText = L('noPet');
        document.getElementById('p-m').innerText    = 'x1.000';
        document.getElementById('p-l').innerText    = '1';
        const rb = document.getElementById('p-rarity');
        rb.innerText = L('noPetRarity');
        rb.style.background = 'rgba(107,114,128,.2)';
        rb.style.color = '#9ca3af';
        rb.style.border = '1px solid rgba(107,114,128,.3)';
    }

    if (ADMINS.includes(Number(myId)))
        document.getElementById('admin-tab').style.display = 'flex';

    // Daily quests
    renderDailyQuests();
    } catch(e) { console.error('ren() error:', e); }
}

// ============================================================
// НАВІГАЦІЯ
// ============================================================
window.tab=(t,el)=>{
    stopAllPetAnims();
    document.querySelectorAll('.page').forEach(p=>p.style.display='none');
    document.querySelectorAll('.nav-tab').forEach(n=>n.classList.remove('active'));
    document.getElementById('v-'+t).style.display='block';
    el.classList.add('active');
    if(t==='shop')     renderShop();
    if(t==='inv')      renderInv();
    if(t==='top')      loadTop();
    if(t==='admin')    loadAdmin();
    if(t==='settings') renderSettings();
    if(t==='pass')     renderBP();
};
