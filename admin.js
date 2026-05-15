// ============================================================
// НАЛАШТУВАННЯ
// ============================================================
function renderSettings(){
    const el=document.getElementById('settings-body');if(!el)return;
    const themeHtml=Object.entries(THEMES).map(([k,t])=>`
        <div class="sett-card${currentTheme===k?' sett-active':''}" onclick="pickTheme('${k}')">
            <span>${t.name}</span><div class="sett-dot" style="background:${t.a}"></div>
        </div>`).join('');
    const langHtml=[['uk','🇺🇦 Українська'],['en','🇬🇧 English'],['ru','🇷🇺 Русский']].map(([k,n])=>`
        <div class="sett-card${currentLang===k?' sett-active':''}" onclick="pickLang('${k}')">
            <span>${n}</span>${currentLang===k?'<span style="color:var(--accent)">✓</span>':''}
        </div>`).join('');
    const musicTracksHtml = (() => {
        if (typeof MUSIC_TRACKS === 'undefined') return '<div style="color:var(--muted);font-size:12px">music.js не завантажено</div>';
        const tracks = Object.entries(MUSIC_TRACKS);
        const offCard = `<div class="sett-card${currentTrack===null?' sett-active':''}" onclick="pickTrack(null)">
            <span>🔇 Без звуку</span>
            ${currentTrack===null?'<span style="color:var(--accent)">✓</span>':''}
        </div>`;
        const trackCards = tracks.map(([k,t])=>`
            <div class="sett-card${currentTrack===k?' sett-active':''}" onclick="pickTrack('${k}')">
                <span>🎵 ${t.title}</span>
                <div style="display:flex;align-items:center;gap:6px">
                    ${currentTrack===k && musicEnabled ? '<span style="color:var(--accent);font-size:16px;animation:xp-shine 1s infinite">▶</span>' : ''}
                    ${currentTrack===k?'<span style="color:var(--accent)">✓</span>':''}
                </div>
            </div>`).join('');
        return offCard + trackCards;
    })();

    el.innerHTML=`
        <div class="glass"><div class="sett-section-title">${L('theme')}</div><div class="sett-grid">${themeHtml}</div></div>
        <div class="glass"><div class="sett-section-title">${L('lang')}</div><div class="sett-list">${langHtml}</div></div>
        <div class="glass">
            <div class="sett-section-title">${L('music')}</div>
            <div style="display:flex;gap:8px;margin-bottom:10px">
                <button class="btn-s" style="flex:1;background:${musicEnabled?'rgba(var(--accent-rgb),.15)':'rgba(255,255,255,.04)'};border-color:${musicEnabled?'var(--accent)':'rgba(255,255,255,.12)'};color:${musicEnabled?'var(--accent)':'var(--muted)'}" onclick="toggleMusic()">
                    ${musicEnabled?'🔊 Увімк.':'🔇 Вимк.'}
                </button>
                <div style="flex:2;display:flex;align-items:center;font-size:12px;color:var(--muted);padding:0 8px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:8px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">
                    ${currentTrack && typeof MUSIC_TRACKS!=='undefined' && MUSIC_TRACKS[currentTrack] ? '🎵 ' + MUSIC_TRACKS[currentTrack].title : '🔇 Без звуку'}
                </div>
            </div>
            <div class="sett-list">${musicTracksHtml}</div>
        </div>
        <div class="glass">
            <div class="sett-section-title">📢 Підписки на канали</div>
            <div id="channels-wrap"><div style="color:var(--muted);font-size:12px;text-align:center;padding:12px">Завантаження...</div></div>
        </div>
        <div class="glass">
            <div class="sett-section-title">👥 Реферальна система</div>
            <div style="font-size:11px;color:var(--muted);margin-bottom:8px">Твій реферальний код — поділись з другом. Обидва отримаєте <b style="color:var(--accent2)">+250 BB</b>!</div>
            <div style="display:flex;gap:8px;margin-bottom:10px">
                <div style="flex:1;padding:11px 14px;background:rgba(255,255,255,.04);border:1px solid var(--border-gold);border-radius:10px;font-size:15px;font-weight:800;color:var(--accent2);letter-spacing:1.5px;text-align:center">${getRefCode()}</div>
                <button class="btn-s" onclick="if(navigator.clipboard)navigator.clipboard.writeText('${getRefCode()}').then(()=>showToast('✅ Скопійовано!'))">📋</button>
            </div>
            ${s.refUsed
                ? `<div style="font-size:12px;color:var(--success);font-weight:700;text-align:center">✅ Ти вже активував код друга</div>`
                : `<div style="display:flex;gap:8px">
                    <input type="text" id="ref-inp" placeholder="Код друга..." style="flex:1;margin:0;text-transform:uppercase;letter-spacing:1px" oninput="this.value=this.value.toUpperCase()">
                    <button class="btn" style="width:auto;padding:12px 16px;flex-shrink:0;font-size:13px" onclick="applyRef()">▶</button>
                </div>`
            }
            <div style="margin-top:10px;font-size:11px;color:var(--muted)">Запрошено друзів: <b style="color:var(--accent2)">${s.refCount||0}</b></div>
        </div>
        <div class="glass">
            <div class="sett-section-title">🎟 ПРОМОКОД</div>
            <div style="display:flex;gap:8px">
                <input type="text" id="promo-inp" placeholder="Введи промокод..." style="flex:1;margin:0;text-transform:uppercase;letter-spacing:1px" oninput="this.value=this.value.toUpperCase()">
                <button class="btn" style="width:auto;padding:12px 16px;flex-shrink:0;font-size:13px" onclick="applyPromo()">▶</button>
            </div>
        </div>`;
    // Load channels async
    setTimeout(()=>window.renderChannels(), 50);
}
window.pickTheme=k=>{applyTheme(k);renderSettings();showToast(L('saved'));};
window.pickLang=k=>{applyLang(k);renderSettings();showToast(L('saved'));};
