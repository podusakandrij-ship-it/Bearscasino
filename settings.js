// ============================================================
// БЛЕКДЖЕК
// ============================================================
let bj=null;
function dr(){return Math.floor(Math.random()*10)+2;}
function startBJ(bt){bj={p:[dr(),dr()],d:[dr()],bt};document.getElementById('bj-ctrl').style.display='flex';reBJ();}
function reBJ(){
    const card=n=>`<div class="bj-card">${n}</div>`;
    document.getElementById('bj-pc').innerHTML=bj.p.map(card).join('');
    document.getElementById('bj-dc').innerHTML=bj.d.map(card).join('');
    if(bj.p.reduce((a,b)=>a+b,0)>21){res(false,bj.bt,0,L('bjBust'));endBJ();}
}
window.bjDo=a=>{
    if(a==='hit'){bj.p.push(dr());reBJ();}
    else{while(bj.d.reduce((a,b)=>a+b,0)<17)bj.d.push(dr());reBJ();const ps=bj.p.reduce((a,b)=>a+b,0),ds=bj.d.reduce((a,b)=>a+b,0);const w=ds>21||ps>ds;res(w,bj.bt,2,w?L('bjWin'):L('bjLose'));endBJ();}
};
function endBJ(){document.getElementById('bj-ctrl').style.display='none';}

// ============================================================
// ЛІДЕРИ
// ============================================================
function loadTop(){
    db.ref('players').once('value',snap=>{
        let l=[];
        snap.forEach(c=>{const v=c.val();if(v&&v.name)l.push(v);});
        l.sort((a,b)=>b.b-a.b);
        const medals=['🥇','🥈','🥉'];
        document.getElementById('leaderboard').innerHTML=l.slice(0,10).map((p,i)=>`
            <div class="leader-item">
                <div class="leader-rank">${medals[i]||`<span style="color:var(--muted);font-size:13px">${i+1}</span>`}</div>
                <div>
                    <div class="leader-name">${p.name}</div>
                    <div style="font-size:10px;color:var(--muted)">${p.p?`${p.p.s||''} ${p.p.n}`:''}</div>
                </div>
                <div class="leader-bal">${Math.floor(p.b).toLocaleString()} BB</div>
            </div>`).join('');
    });
}

// ============================================================
// АДМІНКА
// ============================================================
window.setAdminTab=t=>{currentAdminTab=t;adminInvUserId=null;loadAdmin();};
function loadAdmin(){
    if(currentAdminTab==='inv'&&adminInvUserId){loadAdminUserInv(adminInvUserId,adminInvUserName);return;}

    const makeTabs=()=>`<div class="admin-tabs">
        <div class="a-tab ${currentAdminTab==='stats'?'active':''}"     onclick="setAdminTab('stats')">📊 Стат</div>
        <div class="a-tab ${currentAdminTab==='balance'?'active':''}"   onclick="setAdminTab('balance')">💰 BB</div>
        <div class="a-tab ${currentAdminTab==='inv'?'active':''}"       onclick="setAdminTab('inv')">🐾 Пети</div>
        <div class="a-tab ${currentAdminTab==='petmult'?'active':''}"   onclick="setAdminTab('petmult')">⚡ Множ.</div>
        <div class="a-tab ${currentAdminTab==='promo'?'active':''}"     onclick="setAdminTab('promo')">🎟 Промо</div>
        <div class="a-tab ${currentAdminTab==='channels'?'active':''}"  onclick="setAdminTab('channels')">📢</div>
        <div class="a-tab ${currentAdminTab==='announce'?'active':''}"  onclick="setAdminTab('announce')">📣</div>
        <div class="a-tab ${currentAdminTab==='adoptme'?'active':''}"   onclick="setAdminTab('adoptme')">AM</div>
        <div class="a-tab ${currentAdminTab==='orders'?'active':''}"    onclick="setAdminTab('orders')" id="admin-orders-tab">📬 <span id="admin-orders-badge" style="display:none;background:#ef4444;color:#fff;font-size:8px;padding:1px 4px;border-radius:4px;margin-left:2px">!</span></div>
    </div>`;

    // ── ОГОЛОШЕННЯ ──
    if(currentAdminTab==='announce'){
        db.ref('announce').once('value',snap=>{
            const cur=snap.val()||{};
            document.getElementById('admin-list').innerHTML=makeTabs()+`
            <div class="admin-card">
                <div class="card-title">📣 Активне оголошення</div>
                <div style="font-size:11px;color:var(--muted);margin-bottom:8px">Показується всім гравцям при вході в гру як банер зверху</div>
                <textarea id="ann-text" rows="3" style="width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:10px;color:#fff;font-family:inherit;font-size:13px;padding:10px;resize:vertical;margin-bottom:8px">${cur.text||''}</textarea>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
                    <select id="ann-type" style="margin:0">
                        <option value="info" ${(cur.type||'info')==='info'?'selected':''}>ℹ️ Інфо</option>
                        <option value="warn" ${cur.type==='warn'?'selected':''}>⚠️ Увага</option>
                        <option value="event" ${cur.type==='event'?'selected':''}>🎉 Івент</option>
                    </select>
                    <input type="text" id="ann-link" placeholder="Посилання (необов.)" value="${cur.link||''}" style="margin:0">
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                    <button class="btn" style="margin:0" onclick="adminSaveAnnounce()">📣 Опублікувати</button>
                    <button class="btn-s" style="background:rgba(239,68,68,.15);border-color:rgba(239,68,68,.3);color:#f87171" onclick="adminClearAnnounce()">🗑 Прибрати</button>
                </div>
            </div>
            ${cur.text?`<div class="admin-card" style="border-color:rgba(255,200,50,.2)">
                <div style="font-size:10px;color:var(--accent);font-weight:700;margin-bottom:6px">ЗАРАЗ АКТИВНЕ:</div>
                <div style="font-size:13px;color:#fff">${cur.text}</div>
                ${cur.link?`<div style="font-size:11px;color:var(--muted);margin-top:4px">🔗 ${cur.link}</div>`:''}
            </div>`:'<div class="admin-card" style="text-align:center;color:var(--muted);padding:16px">Активних оголошень немає</div>'}
            <div class="admin-card" style="margin-top:10px">
                <div class="card-title">⏳ Дата завершення Bears Pass</div>
                <div style="font-size:11px;color:var(--muted);margin-bottom:8px">Зараз: <b style="color:var(--accent2)">${new Date(BP_END).toLocaleString('uk')}</b></div>
                <input type="datetime-local" id="bp-end-inp" style="margin-bottom:8px">
                <button class="btn" onclick="adminSaveBPEnd()">💾 Зберегти дату</button>
            </div>`;        });
        return;
    }

    // ── РЕДАКТОР МНОЖНИКІВ ПЕТІВ ──
    if(currentAdminTab==='petmult'){
        // Отримуємо кастомні множники з Firebase
        db.ref('petmults').once('value',snap=>{
            const overrides=snap.val()||{};
            const allPets=getAllPets();
            let rows='';
            allPets.forEach(pet=>{
                const key=pet.n.replace(/[^a-zA-ZА-Яа-яёЁіІїЇєЄ0-9]/g,'_');
                const currentMult=overrides[key]!==undefined ? overrides[key] : pet.m;
                const isModified=overrides[key]!==undefined;
                rows+=`<div class="admin-card" style="padding:10px 12px;${isModified?'border-color:rgba(251,191,36,.3)':''}">
                    <div style="display:flex;align-items:center;gap:10px">
                        <span style="font-size:24px;flex-shrink:0">${pet.s||'🐾'}</span>
                        <div style="flex:1;min-width:0">
                            <div style="font-weight:700;font-size:13px;color:#fff">${pet.n}</div>
                            <div style="font-size:10px;color:var(--muted)">${pet.r} · База: <b>x${pet.m}</b>${isModified?` · <span style="color:var(--accent2)">Змінено: x${currentMult}</span>`:''}</div>
                        </div>
                        <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
                            <input type="number" id="pm-${key}" value="${currentMult}" step="0.005" min="1" max="5"
                                style="width:72px;margin:0;text-align:center;font-size:13px;font-weight:700;padding:6px 8px">
                            <button class="btn-ctrl b-add" style="padding:7px 10px;font-size:11px" onclick="adminSavePetMult('${key}','${pet.n}')">✓</button>
                            ${isModified?`<button class="btn-ctrl b-sub" style="padding:7px 8px;font-size:11px" onclick="adminResetPetMult('${key}')">↩</button>`:''}
                        </div>
                    </div>
                </div>`;
            });
            document.getElementById('admin-list').innerHTML=makeTabs()+`
            <div class="admin-card" style="padding:12px">
                <div style="font-size:11px;color:var(--muted);line-height:1.5">
                    ⚡ Зміна множника діє одразу для всіх гравців.<br>
                    ↩ — повернути до базового значення.<br>
                    🟡 Підсвічені — вже змінені від базових.
                </div>
            </div>
            <div style="font-size:10px;color:var(--muted);font-weight:700;letter-spacing:.5px;margin:10px 0 8px">ВСІ ПЕТИ (${allPets.length})</div>
            ${rows}`;
        });
        return;
    }

    // ── КАНАЛИ ──
    if(currentAdminTab==='channels'){
        db.ref('channels').once('value',snap=>{
            const chs=snap.val()||{};
            let rows='';
            Object.entries(chs).forEach(([id,ch])=>{
                rows+=`<div class="admin-card" style="padding:12px">
                    <div style="display:flex;justify-content:space-between;align-items:center">
                        <div>
                            <div style="font-weight:700;font-size:14px;color:var(--text)">${ch.name}</div>
                            <div style="font-size:11px;color:var(--muted);margin-top:2px">${ch.url} · ${ch.rewardType==='bb'?'+'+ch.reward+' BB':'+'+ch.reward+' XP'}</div>
                        </div>
                        <button class="btn-ctrl b-sub" style="padding:7px 10px" onclick="db.ref('channels/${id}').remove().then(()=>{showToast('🗑 Видалено');loadAdmin();})">🗑</button>
                    </div>
                </div>`;
            });
            document.getElementById('admin-list').innerHTML=makeTabs()+`
            <div class="admin-card">
                <div class="card-title">➕ Додати канал</div>
                <input type="text" id="ch-name" placeholder="Назва каналу" style="margin-bottom:8px">
                <input type="text" id="ch-url"  placeholder="https://t.me/канал" style="margin-bottom:8px">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
                    <input type="number" id="ch-reward-bb" placeholder="💰 BB (0 = не давати)" style="margin:0">
                    <input type="number" id="ch-reward-xp" placeholder="⭐ XP (0 = не давати)" style="margin:0">
                </div>
                <div style="font-size:10px;color:var(--muted);margin-bottom:8px">Можна одночасно дати і BB і XP. Залиш 0 якщо не потрібно.</div>
                <button class="btn" onclick="adminAddChannel()">✅ Додати</button>
            </div>
            <div style="font-size:10px;color:var(--muted);font-weight:700;letter-spacing:.5px;margin:14px 0 8px">АКТИВНІ КАНАЛИ (${Object.keys(chs).length})</div>
            ${rows||'<div style="text-align:center;color:var(--muted);padding:20px;font-size:13px">Немає каналів</div>'}`;
        });
        return;
    }
    // ── ADOPT ME УПРАВЛІННЯ ──
    if(currentAdminTab==='adoptme'){
        db.ref('adoptme').once('value',snap=>{
            const items=snap.val()||{};
            let rows='';
            Object.entries(items).forEach(([id,item])=>{
                // Іконка може бути URL — показуємо як img якщо починається з http
                const isUrl=item.icon&&(item.icon.startsWith('http')||item.icon.startsWith('/'));
                const iconPreview=isUrl
                    ? `<img src="${item.icon}" style="width:40px;height:40px;object-fit:contain;border-radius:6px;background:rgba(255,255,255,.05)">`
                    : `<span style="font-size:32px">${item.icon||'🎁'}</span>`;
                rows+=`<div class="admin-card" style="padding:12px" id="am-card-${id}">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
                        ${iconPreview}
                        <div style="flex:1;min-width:0">
                            <div style="font-weight:700;font-size:13px">${item.name}</div>
                            <div style="font-size:11px;color:var(--muted)">${item.price} BB · куплено: ${item.totalBought||0}${item.limitTotal>0?' / '+item.limitTotal:''}${item.limitPerUser>0?' · ліміт/особу: '+item.limitPerUser:''}</div>
                            ${isUrl?`<div style="font-size:9px;color:var(--error);margin-top:2px">⚠️ Іконка — посилання (може бути великою)</div>`:''}
                        </div>
                        <div style="display:flex;flex-direction:column;gap:5px;flex-shrink:0">
                            <button class="btn-ctrl" style="background:#6366f1;padding:6px 10px;font-size:11px" onclick="adminEditAdoptItem('${id}')">✏️ Ред.</button>
                            <button class="btn-ctrl" style="background:${item.hidden?'#374151':'#059669'};padding:6px 10px;font-size:11px" onclick="adminToggleAdoptItem('${id}',${!item.hidden})">${item.hidden?'👁':'🙈'}</button>
                            <button class="btn-ctrl b-sub" style="padding:6px 10px" onclick="adminDeleteAdoptItem('${id}')">🗑</button>
                        </div>
                    </div>
                    <div id="am-edit-${id}" style="display:none;border-top:1px solid rgba(255,255,255,.08);padding-top:10px;margin-top:4px">
                        <div style="font-size:10px;color:var(--accent);font-weight:700;margin-bottom:8px">✏️ РЕДАГУВАННЯ</div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
                            <input type="text" id="am-edit-icon-${id}" placeholder="Іконка (emoji або URL)" value="${item.icon||''}" style="margin:0;font-size:13px">
                            <input type="number" id="am-edit-price-${id}" placeholder="Ціна BB" value="${item.price||0}" style="margin:0">
                        </div>
                        <input type="text" id="am-edit-name-${id}" placeholder="Назва" value="${item.name||''}" style="margin-bottom:8px">
                        <input type="text" id="am-edit-desc-${id}" placeholder="Опис" value="${item.desc||''}" style="margin-bottom:8px">
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
                            <input type="number" id="am-edit-lpu-${id}" placeholder="Ліміт/особу (0=∞)" value="${item.limitPerUser||0}" style="margin:0">
                            <input type="number" id="am-edit-lt-${id}" placeholder="Ліміт всього (0=∞)" value="${item.limitTotal||0}" style="margin:0">
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                            <button class="btn" style="margin:0" onclick="adminSaveAdoptItem('${id}')">💾 Зберегти</button>
                            <button class="btn-s" onclick="document.getElementById('am-edit-${id}').style.display='none'">✕ Скасувати</button>
                        </div>
                    </div>
                </div>`;
            });
            document.getElementById('admin-list').innerHTML=makeTabs()+`
            <div class="admin-card">
                <div class="card-title">➕ Додати товар Adopt Me</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
                    <input type="text" id="am-icon" placeholder="Іконка (emoji, напр. 🐶)" style="margin:0;font-size:20px">
                    <input type="number" id="am-price" placeholder="Ціна BB" style="margin:0">
                </div>
                <input type="text" id="am-name" placeholder="Назва товару" style="margin-bottom:8px">
                <input type="text" id="am-desc" placeholder="Опис (необов'язково)" style="margin-bottom:8px">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
                    <input type="number" id="am-limit-user" placeholder="Ліміт на 1 особу (0=∞)" style="margin:0" value="0">
                    <input type="number" id="am-limit-total" placeholder="Ліміт всього (0=∞)" style="margin:0" value="0">
                </div>
                <button class="btn" onclick="adminAddAdoptItem()">✅ Додати товар</button>
            </div>
            <div style="font-size:10px;color:var(--muted);font-weight:700;letter-spacing:.5px;margin:14px 0 8px">ТОВАРИ (${Object.keys(items).length})</div>
            ${rows||'<div style="text-align:center;color:var(--muted);padding:20px;font-size:13px">Немає товарів</div>'}`;
        });
        return;
    }
    // ── ЗАМОВЛЕННЯ ADOPT ME ──
    if(currentAdminTab==='orders'){
        db.ref('adoptorders').orderByChild('createdAt').once('value',snap=>{
            const orders=[];
            // Беремо KEY як orderId — val() може не мати orderId якщо запис старий
            snap.forEach(c=>{
                const v=c.val();
                if(v) orders.unshift({...v, orderId: c.key});
            });
            const pending=orders.filter(o=>o.status==='pending');
            const delivered=orders.filter(o=>o.status==='delivered');
            // Позначаємо нотифікації як прочитані
            db.ref('adminNotifs/'+myId).once('value',ns=>{
                if(ns.val()) ns.forEach(n=>{if(n.val()&&!n.val().read) db.ref('adminNotifs/'+myId+'/'+n.key+'/read').set(true);});
            });
            const renderOrder=(o,isDone)=>`<div class="admin-card" style="padding:12px;${isDone?'opacity:.55':'border-left:3px solid var(--accent)'}">
                <div style="display:flex;align-items:center;gap:10px">
                    <span style="font-size:26px">${o.itemIcon||'🎁'}</span>
                    <div style="flex:1;min-width:0">
                        <div style="font-weight:700;font-size:13px">${o.itemName}${(o.qty&&o.qty>1)?` <span style="color:var(--accent2)">x${o.qty}</span>`:''}</div>
                        <div style="font-size:11px;color:var(--muted)">👤 <b>${o.buyerName}</b> · ID: <span style="user-select:all">${o.buyerId}</span></div>
                        <div style="font-size:11px;color:var(--accent2);font-weight:700">${o.totalCost||o.price} BB</div>
                        <div style="font-size:10px;color:var(--muted)">${new Date(o.createdAt).toLocaleString('uk')}</div>
                    </div>
                    ${!isDone
                        ?`<button class="btn-ctrl b-add" style="padding:8px 10px;font-size:11px;white-space:nowrap" onclick="adminDeliverOrder('${o.orderId}')">✅ Видано</button>`
                        :`<span style="color:var(--success);font-size:20px">✅</span>`
                    }
                </div>
            </div>`;
            let h=makeTabs();
            h+=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                <div style="font-size:10px;color:var(--error);font-weight:700;letter-spacing:.5px">⏳ ОЧІКУЮТЬ ВИДАЧІ (${pending.length})</div>
                <button class="btn-s" style="font-size:10px;padding:5px 10px" onclick="loadAdmin()">🔄 Оновити</button>
            </div>`;
            h+=pending.length
                ? pending.map(o=>renderOrder(o,false)).join('')
                : `<div class="admin-card" style="text-align:center;color:var(--muted);padding:16px">Нових замовлень немає 🎉</div>`;
            if(delivered.length){
                h+=`<div style="font-size:10px;color:var(--muted);font-weight:700;letter-spacing:.5px;margin:14px 0 8px">✅ ВИКОНАНІ (${delivered.length})</div>`;
                h+=delivered.slice(0,30).map(o=>renderOrder(o,true)).join('');
            }
            document.getElementById('admin-list').innerHTML=h;
        });
        return;
    }
    if(currentAdminTab==='promo'){
        db.ref('promo').once('value',snap=>{
            const codes=snap.val()||{};
            let codeRows='';
            Object.entries(codes).forEach(([code,data])=>{
                const used=data.used||0, max=data.maxUses||1;
                const expired=used>=max;
                codeRows+=`<div class="admin-card" style="padding:12px">
                    <div style="display:flex;justify-content:space-between;align-items:center">
                        <div>
                            <div style="font-weight:800;font-size:15px;letter-spacing:1px;color:${expired?'var(--muted)':'var(--accent2)'}">${code}</div>
                            <div style="font-size:11px;color:var(--muted);margin-top:3px">
                                ${promoRewardLabel(data)} · ${used}/${max} активацій${expired?' · <span style="color:var(--error)">Вичерпано</span>':''}
                            </div>
                        </div>
                        <button class="btn-ctrl b-sub" style="padding:7px 10px" onclick="adminDeletePromo('${code}')">🗑</button>
                    </div>
                </div>`;
            });
            document.getElementById('admin-list').innerHTML=makeTabs()+`
            <div class="admin-card">
                <div class="card-title">➕ Створити промокод</div>
                <input type="text" id="promo-code-inp" placeholder="Код (напр. EASTER2026)" style="text-transform:uppercase;margin-bottom:8px" oninput="this.value=this.value.toUpperCase()">
                <div style="font-size:10px;color:var(--muted);font-weight:700;letter-spacing:.5px;margin-bottom:6px">ТИП НАГОРОДИ</div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:10px">
                    <button id="pt-bb"   class="btn-s promo-type-btn active-type" onclick="setPromoType('bb')">💰 BB</button>
                    <button id="pt-pet"  class="btn-s promo-type-btn" onclick="setPromoType('pet')">🐾 Пет</button>
                    <button id="pt-case" class="btn-s promo-type-btn" onclick="setPromoType('case')">📦 Кейс</button>
                </div>
                <div id="promo-bb-inp">
                    <input type="number" id="promo-amount" placeholder="Кількість BB (0 = не давати)" style="margin-bottom:8px">
                </div>
                <div id="promo-pet-inp" style="display:none">
                    <select id="promo-pet-sel" style="margin-bottom:8px">
                        ${getAllPets().map((p,i)=>`<option value="${i}">${p.s||''} ${p.n} (${p.r})</option>`).join('')}
                    </select>
                </div>
                <div id="promo-case-inp" style="display:none">
                    <select id="promo-case-sel" style="margin-bottom:8px">
                        ${Object.entries(CASES).map(([k,c])=>`<option value="${k}">${c.n} — ${c.p} BB</option>`).join('')}
                    </select>
                    <input type="number" id="promo-case-count" placeholder="Кількість кейсів" value="1" style="margin-bottom:8px">
                </div>
                <div style="font-size:10px;color:var(--muted);margin-bottom:8px">💡 Для типу BB — можна одночасно дати і пета: переключись між типами, але BB + Пет комбінується автоматично якщо ввести суму > 0</div>
                <input type="number" id="promo-uses" placeholder="Макс. активацій (0 = необмежено)" style="margin-bottom:10px" value="1">
                <button class="btn" onclick="adminCreatePromo()">✅ Створити промокод</button>
            </div>
            <div style="font-size:10px;color:var(--muted);font-weight:700;letter-spacing:.5px;margin:14px 0 8px">АКТИВНІ ПРОМОКОДИ (${Object.keys(codes).length})</div>
            ${codeRows||`<div style="text-align:center;color:var(--muted);padding:20px;font-size:13px">Немає промокодів</div>`}`;
        });
        return;
    }

    // ── СТАТИСТИКА ──
    db.ref('players').once('value',snap=>{
        const players=[];
        snap.forEach(c=>{const v=c.val();if(v)players.push({uid:c.key,...v});});

        if(currentAdminTab==='stats'){
            const totalBB=players.reduce((a,p)=>a+(p.b||0),0);
            const totalPets=players.reduce((a,p)=>a+(p.inv?p.inv.length:0),0);
            const avgBB=players.length?(totalBB/players.length).toFixed(0):0;
            const richest=players.reduce((a,b)=>(b.b||0)>(a.b||0)?b:a,{b:0,name:'—'});
            const mostPets=players.reduce((a,b)=>((b.inv||[]).length>((a.inv||[]).length))?b:a,{inv:[],name:'—'});
            const rarityCount={};
            players.forEach(p=>(p.inv||[]).forEach(pet=>{rarityCount[pet.r]=(rarityCount[pet.r]||0)+1;}));
            document.getElementById('admin-list').innerHTML=makeTabs()+`
            <div class="stat-grid">
                <div class="stat-card"><div class="stat-val">${players.length}</div><div class="stat-lbl">Гравців</div></div>
                <div class="stat-card"><div class="stat-val">${Math.floor(totalBB).toLocaleString()}</div><div class="stat-lbl">BB у грі</div></div>
                <div class="stat-card"><div class="stat-val">${totalPets}</div><div class="stat-lbl">Петів всього</div></div>
                <div class="stat-card"><div class="stat-val">${avgBB}</div><div class="stat-lbl">BB на гравця</div></div>
            </div>
            <div class="admin-card">
                <div class="card-title">🏆 Лідери</div>
                <div style="font-size:13px;margin-bottom:6px">💰 <b style="color:var(--accent2)">${richest.name}</b> — ${Math.floor(richest.b||0)} BB</div>
                <div style="font-size:13px">🐾 <b style="color:var(--accent2)">${mostPets.name}</b> — ${(mostPets.inv||[]).length} петів</div>
            </div>
            <div class="admin-card">
                <div class="card-title">🐾 Розподіл по рідкості</div>
                ${Object.entries(rarityCount).sort((a,b)=>b[1]-a[1]).map(([r,n])=>`
                    <div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.05)">
                        <span style="color:${RARITY_GLOW[r]||'#fff'}">${r}</span>
                        <b style="color:var(--accent2)">${n}</b>
                    </div>`).join('')}
            </div>`;
            return;
        }

        // ── BB / ПЕТИ+ІНВ ──
        let h=makeTabs();
        // Пошук гравця
        const searchVal=(window._adminSearch||'').toLowerCase();
        const filtered=searchVal
            ? players.filter(p=>(p.name||'').toLowerCase().includes(searchVal))
            : players;
        h+=`<div style="position:relative;margin-bottom:10px">
            <input type="text" id="admin-search" placeholder="🔍 Пошук по імені..." value="${window._adminSearch||''}"
                oninput="window._adminSearch=this.value;loadAdmin()"
                style="margin:0;padding-left:14px;font-size:13px">
            ${searchVal?`<button onclick="window._adminSearch='';loadAdmin()" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--muted);font-size:16px;cursor:pointer">✕</button>`:''}
        </div>
        ${filtered.length===0?`<div class="admin-card" style="text-align:center;color:var(--muted);padding:16px">Нікого не знайдено</div>`:''}`;
        filtered.forEach(({uid,name,b,dbl,inv,p:activePet})=>{
            b=b||0; dbl=dbl||0; inv=inv||[];
            h+=`<div class="admin-card">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                    <div>
                        <b style="font-size:14px">${name||L('anon')}</b>
                        ${activePet?`<span style="font-size:11px;color:var(--muted);margin-left:6px">${activePet.s||''}</span>`:''}
                    </div>
                    <div style="text-align:right">
                        <div style="color:var(--accent2);font-weight:700;font-size:14px">${b.toFixed(0)} BB</div>
                        ${dbl>0?`<div style="color:#67e8f9;font-weight:700;font-size:11px">⚓ ${dbl} дубл.</div>`:''}
                    </div>
                </div>`;
            if(currentAdminTab==='balance'){
                h+=`<div class="admin-ctrl-grid">
                    <button class="btn-ctrl b-add" onclick="mathB('${uid}','add','bb')">＋ BB</button>
                    <button class="btn-ctrl b-sub" onclick="mathB('${uid}','sub','bb')">－ BB</button>
                    <button class="btn-ctrl b-set" onclick="mathB('${uid}','set','bb')">= BB</button>
                </div>
                <div class="admin-ctrl-grid" style="margin-top:6px">
                    <button class="btn-ctrl" style="background:rgba(6,182,212,.2);border-color:#06b6d4;color:#67e8f9" onclick="mathB('${uid}','add','dbl')">＋ ⚓</button>
                    <button class="btn-ctrl" style="background:rgba(6,182,212,.1);border-color:#06b6d4;color:#67e8f9" onclick="mathB('${uid}','sub','dbl')">－ ⚓</button>
                    <button class="btn-ctrl" style="background:rgba(6,182,212,.1);border-color:#06b6d4;color:#67e8f9" onclick="mathB('${uid}','set','dbl')">= ⚓</button>
                </div>`;
            } else {
                // Пети + інвентар в одній вкладці
                h+=`<div style="display:flex;gap:6px;margin-top:6px">
                    <button class="btn-buy" style="flex:1" onclick="adminGivePetModal('${uid}','${(name||'').replace(/'/g,"\\'")}')">🎁 Подарувати</button>
                    <button class="btn-ghost" style="flex:1;font-size:12px" onclick="openAdminInv('${uid}','${(name||'').replace(/'/g,"\\'")}')">🎒 Інвентар (${inv.length})</button>
                </div>`;
            }
            h+=`</div>`;
        });
        document.getElementById('admin-list').innerHTML=h;
    });
}

// ── Оголошення ──
window.adminSaveAnnounce=()=>{
    const text=(document.getElementById('ann-text')?.value||'').trim();
    const type=document.getElementById('ann-type')?.value||'info';
    const link=(document.getElementById('ann-link')?.value||'').trim();
    if(!text) return showToast('❌ Введи текст оголошення');
    db.ref('announce').set({text,type,link,createdAt:Date.now(),by:myName}).then(()=>{
        showToast('✅ Оголошення опубліковано!');
        loadAdmin();
    });
};
window.adminClearAnnounce=()=>{
    if(!confirm('Прибрати оголошення?')) return;
    db.ref('announce').remove().then(()=>{showToast('🗑 Оголошення прибрано');loadAdmin();});
};
window.adminSaveBPEnd=()=>{
    const val=document.getElementById('bp-end-inp')?.value;
    if(!val) return showToast('❌ Вкажи дату');
    const ts=new Date(val).getTime();
    if(isNaN(ts)) return showToast('❌ Невірний формат дати');
    db.ref('bpend').set(ts).then(()=>{
        BP_END=ts;
        showToast('✅ Дату завершення паса збережено!');
        loadAdmin();
    });
};

// ── Множники петів ──
window.adminSavePetMult=(key,petName)=>{
    const val=parseFloat(document.getElementById('pm-'+key)?.value||'1');
    if(isNaN(val)||val<1||val>5) return showToast('❌ Значення має бути від 1 до 5');
    db.ref('petmults/'+key).set(Math.round(val*1000)/1000).then(()=>{
        showToast(`✅ ${petName}: x${val.toFixed(3)}`);
        loadAdmin();
    });
};
window.adminResetPetMult=(key)=>{
    db.ref('petmults/'+key).remove().then(()=>{showToast('↩ Повернуто до базового');loadAdmin();});
};

// ── Хелпери промокодів ──
function getAllPets(){
    let all=[],seen=new Set();
    for(const k in CASES) CASES[k].drop.forEach(p=>{if(!seen.has(p.n)){all.push(p);seen.add(p.n);}});
    ADMIN_ONLY_PETS.forEach(p=>{if(!seen.has(p.n)){all.push(p);seen.add(p.n);}});
    return all;
}
function promoRewardLabel(d){
    if(d.type==='bb')   return `💰 ${d.amount} BB`;
    if(d.type==='pet')  return `🐾 ${d.pet?.s||''} ${d.pet?.n||'пет'}`;
    if(d.type==='case') return `📦 ${d.count||1}x ${CASES[d.caseKey]?.n||d.caseKey}`;
    return '?';
}
let currentPromoType='bb';
window.setPromoType=t=>{
    currentPromoType=t;
    ['bb','pet','case'].forEach(tp=>{
        const el=document.getElementById('promo-'+tp+'-inp');
        if(el) el.style.display=t===tp?'block':'none';
    });
    document.querySelectorAll('.promo-type-btn').forEach(b=>b.classList.remove('active-type'));
    const btn=document.getElementById('pt-'+t);
    if(btn) btn.classList.add('active-type');
};
window.adminCreatePromo=()=>{
    const code=(document.getElementById('promo-code-inp').value||'').trim().toUpperCase().replace(/\s+/g,'');
    if(!code) return alert('Введи код!');
    const uses=parseInt(document.getElementById('promo-uses').value)||1;
    let reward={};
    if(currentPromoType==='bb'){
        const amt=parseFloat(document.getElementById('promo-amount').value);
        if(!amt||amt<=0) return alert('Введи кількість BB!');
        reward={type:'bb',amount:amt};
    } else if(currentPromoType==='pet'){
        const idx=parseInt(document.getElementById('promo-pet-sel').value);
        const pets=getAllPets();
        if(!pets[idx]) return alert('Обери пета!');
        // Перевіряємо чи є і BB сума
        const bbAmt=parseFloat(document.getElementById('promo-amount')?.value||'0');
        if(bbAmt>0){
            // Комбінована: пет + BB
            reward={type:'multi',rewards:[
                {type:'pet',pet:{...pets[idx],id:Date.now(),lvl:1}},
                {type:'bb',amount:bbAmt}
            ]};
        } else {
            reward={type:'pet',pet:{...pets[idx],id:Date.now(),lvl:1}};
        }
    } else if(currentPromoType==='case'){
        const caseKey=document.getElementById('promo-case-sel').value;
        const count=parseInt(document.getElementById('promo-case-count').value)||1;
        if(!CASES[caseKey]) return alert('Обери кейс!');
        reward={type:'case',caseKey,count};
    }
    db.ref('promo/'+code).set({...reward,maxUses:uses||999999,used:0,createdAt:Date.now()}).then(()=>{
        showToast(`✅ Промокод ${code} створено!`);
        loadAdmin();
    });
};
window.adminDeletePromo=code=>{
    if(!confirm(`Видалити промокод ${code}?`)) return;
    db.ref('promo/'+code).remove().then(()=>{showToast('🗑 Видалено');loadAdmin();});
};
window.adminGivePetModal=(uid,name)=>{
    const pets=getAllPets();
    const list=pets.map((p,i)=>`${i}: ${p.s||''} ${p.n} (${p.r})`).join('\n');
    const ch=prompt(list);
    if(ch===null||!pets[ch]) return;
    const p={...pets[ch],id:Date.now(),lvl:1};
    db.ref('players/'+uid+'/inv').once('value',sn=>{
        const inv=sn.val()||[]; inv.push(p);
        db.ref('players/'+uid+'/inv').set(inv);
        showToast(`✅ ${p.s||''} ${p.n} → ${name}`);
    });
};

// ── Застосувати промокод (гравець) ──
window.applyPromo=()=>{
    const code=(document.getElementById('promo-inp').value||'').trim().toUpperCase();
    if(!code) return;
    const btn=document.querySelector('[onclick="applyPromo()"]');
    if(btn) btn.disabled=true;
    db.ref('promo/'+code).once('value',snap=>{
        if(btn) btn.disabled=false;
        const data=snap.val();
        if(!data){showToast('❌ Промокод не знайдено');return;}
        const used=data.used||0, max=data.maxUses||1;
        if(used>=max){showToast('❌ Промокод вичерпано');return;}
        const usedBy=data.usedBy||[];
        if(usedBy.includes(String(myId))){showToast('❌ Ти вже використав цей промокод');return;}
        // Застосовуємо нагороду
        db.ref('promo/'+code+'/used').set(used+1);
        db.ref('promo/'+code+'/usedBy').set([...usedBy,String(myId)]);
        document.getElementById('promo-inp').value='';

        function applySingleReward(d,toastParts){
            if(d.type==='bb'){
                s.b+=d.amount; toastParts.push(`+${d.amount} BB`);
            } else if(d.type==='pet'&&d.pet){
                const pet={...d.pet,id:Date.now(),lvl:1};
                s.inv.push(pet); toastParts.push(`${pet.s||''} ${pet.n}`);
            } else if(d.type==='case'&&d.caseKey){
                const c=CASES[d.caseKey];
                if(!c){showToast('❌ Кейс більше не доступний');return;}
                const count=d.count||1;
                let opened=0;
                function openNext(){
                    if(opened>=count){renderSettings();showToast(`🎉 ${count}x ${c.n} відкрито!`);return;}
                    let rand=Math.random()*100,win=null,cur2=0;
                    for(const p of c.drop){cur2+=p.w;if(rand<=cur2){win={...p};break;}}
                    if(!win) win={...c.drop[c.drop.length-1]};
                    opened++;
                    win.id=Date.now()+opened; win.lvl=1;
                    s.inv.push(win); save();
                    openCaseAnimation(win,()=>{
                        ren();
                        const origClose=window.closeCase;
                        if(opened<count){
                            window.closeCase=()=>{origClose();window.closeCase=origClose;setTimeout(openNext,300);};
                        }
                    });
                }
                openNext();
            }
        }

        const toastParts=[];
        if(data.type==='multi'&&Array.isArray(data.rewards)){
            data.rewards.forEach(rw=>applySingleReward(rw,toastParts));
        } else {
            applySingleReward(data,toastParts);
        }
        save(); ren();
        if(toastParts.length) showToast(`🎉 Промокод активовано! ${toastParts.join(' + ')}`);
        renderSettings();
    });
};
window.openAdminInv=(uid,name)=>{adminInvUserId=uid;adminInvUserName=name;currentAdminTab='inv';loadAdminUserInv(uid,name);};
function loadAdminUserInv(uid,name){
    db.ref('players/'+uid).once('value',snap=>{
        const p=snap.val()||{},inv=p.inv||[];
        const tabs=`<div class="admin-tabs">
            <div class="a-tab" onclick="setAdminTab('stats')">📊</div>
            <div class="a-tab" onclick="setAdminTab('balance')">💰</div>
            <div class="a-tab active">🐾</div>
            <div class="a-tab" onclick="setAdminTab('promo')">🎟</div>
        </div>`;
        let h=tabs+`<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
            <button class="btn-s" onclick="adminInvUserId=null;loadAdmin()" style="padding:8px 14px;font-size:14px">${L('back')}</button>
            <div><b>${name}</b> <span style="color:var(--muted);font-size:12px">${inv.length} ${L('petsOf')}</span></div>
        </div>`;
        if(!inv.length){
            h+=`<div class="admin-card" style="text-align:center;color:var(--muted);padding:20px">${L('empty')}</div>`;
        } else {
            inv.forEach((pet,idx)=>{
                const eq=p.p&&p.p.id===pet.id;
                const imgSrc=getPetImageSrc(pet);
                const icon = imgSrc.type==='img'
                    ? `<img src="${imgSrc.src}" width="36" height="36" style="object-fit:contain;border-radius:8px">`
                    : `<span style="font-size:26px">${pet.s}</span>`;
                h+=`<div class="admin-card" style="padding:12px">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
                        ${icon}
                        <div style="flex:1">
                            <div style="font-weight:700;font-size:13px">${pet.n}${eq?` <span style="font-size:10px;background:rgba(16,185,129,.2);color:var(--success);padding:1px 5px;border-radius:4px">Активний</span>`:''}</div>
                            <div style="font-size:11px;color:${pet.c}">${pet.r} · x${pet.m.toFixed(3)} · LVL ${pet.lvl||1}</div>
                        </div>
                        <button class="btn-ctrl b-sub" style="padding:8px 10px;font-size:16px" onclick="adminRemovePet('${uid}',${idx},'${name.replace(/'/g,"\\'")}')">🗑</button>
                    </div>
                    <div class="admin-ctrl-grid" style="grid-template-columns:1fr 1fr 1fr 1fr;gap:6px">
                        <button class="btn-ctrl" style="background:#6366f1;font-size:10px" onclick="adminSetPetLevel('${uid}',${idx},'${name.replace(/'/g,"\\'")}')">✏️ Рівень</button>
                        <button class="btn-ctrl b-add" style="font-size:10px" onclick="adminAddPetLevel('${uid}',${idx},1)">LVL +1</button>
                        <button class="btn-ctrl b-sub" style="font-size:10px" onclick="adminAddPetLevel('${uid}',${idx},-1)">LVL -1</button>
                        <button class="btn-ctrl" style="background:#374151;font-size:10px" onclick="adminResetXP('${uid}')">🔄 XP</button>
                    </div>
                </div>`;
            });
        }
        document.getElementById('admin-list').innerHTML=h;
    });
}
window.adminRemovePet=(uid,idx,name)=>{
    db.ref('players/'+uid).once('value',snap=>{
        const p=snap.val(); let inv=p.inv?[...p.inv]:[];
        const pet=inv[idx];
        if(!pet) return alert('Не знайдено!');
        if(!confirm(`${L('confirmDelete')} ${pet.n}?`)) return;
        // Якщо це активний пет — знімаємо
        if(p.p&&p.p.id===pet.id) db.ref('players/'+uid+'/p').set(null);
        inv.splice(idx,1);
        db.ref('players/'+uid+'/inv').set(inv).then(()=>loadAdminUserInv(uid,name));
    });
};
window.adminSetPetLevel=(uid,idx,name)=>{
    const newLvlStr=prompt('Новий рівень (1-100):');
    if(!newLvlStr||isNaN(newLvlStr)) return;
    const newLvl=Math.max(1,Math.min(100,parseInt(newLvlStr)));
    db.ref('players/'+uid).once('value',snap=>{
        const p=snap.val(); const inv=[...(p.inv||[])];
        if(!inv[idx]) return;
        const pet=inv[idx];
        const oldLvl=pet.lvl||1;
        // Базовий множник — беремо збережений bm або розраховуємо від поточного
        const baseMult = pet.bm
            ? pet.bm
            : Math.round((pet.m - (oldLvl-1)*0.005)*1000)/1000;
        pet.bm  = baseMult; // зберігаємо для майбутніх змін
        pet.lvl = newLvl;
        pet.m   = Math.round((baseMult + (newLvl-1)*0.005)*1000)/1000;
        if(pet.m < 1) pet.m = 1;
        // Скидаємо XP гравця до 0 при зміні рівня
        db.ref('players/'+uid+'/x').set(0);
        db.ref('players/'+uid+'/inv').set(inv);
        if(p.p&&p.p.id===pet.id) db.ref('players/'+uid+'/p').set(pet);
        showToast(`✅ ${pet.n}: LVL ${newLvl}, x${pet.m.toFixed(3)}`);
        setTimeout(()=>loadAdminUserInv(uid,name),400);
    });
};
window.adminResetXP=(uid)=>{
    if(!confirm('Скинути XP до 0?')) return;
    db.ref('players/'+uid+'/x').set(0);
    showToast('✅ XP скинуто');
};
window.adminAddPetLevel=(uid,idx,delta)=>{
    db.ref('players/'+uid).once('value',snap=>{
        const p=snap.val(); const inv=[...(p.inv||[])];
        if(!inv[idx]) return;
        const pet=inv[idx];
        const oldLvl=pet.lvl||1;
        const newLvl=Math.max(1,oldLvl+delta);
        const baseMult=Math.round((pet.m-(oldLvl-1)*0.005)*1000)/1000;
        pet.lvl=newLvl;
        pet.m=Math.round((baseMult+(newLvl-1)*0.005)*1000)/1000;
        if(pet.m<1) pet.m=1;
        db.ref('players/'+uid+'/inv').set(inv);
        if(p.p&&p.p.id===pet.id) db.ref('players/'+uid+'/p').set(pet);
        setTimeout(()=>loadAdminUserInv(uid,p.name||name),300);
    });
};
window.mathB=(id,type,currency='bb')=>{
    const label=currency==='dbl'?'⚓ Дублони':'BB';
    let v=prompt(`Сума (${label}):`);
    if(!v||isNaN(v))return;
    v=Number(v);
    const field=currency==='dbl'?'dbl':'b';
    const ref=db.ref('players/'+id+'/'+field);
    if(type==='add')ref.transaction(c=>(c||0)+v);
    else if(type==='sub')ref.transaction(c=>Math.max(0,(c||0)-v));
    else ref.set(Math.max(0,v));
    setTimeout(loadAdmin,500);
};
// adminGivePet — alias для зворотньої сумісності
window.adminGivePet=uid=>window.adminGivePetModal(uid,'');

window.adminEditAdoptItem=(id)=>{
    const editEl=document.getElementById('am-edit-'+id);
    if(editEl) editEl.style.display=editEl.style.display==='none'?'block':'none';
};
window.adminSaveAdoptItem=(id)=>{
    const icon=(document.getElementById('am-edit-icon-'+id)?.value||'🎁').trim();
    const name=(document.getElementById('am-edit-name-'+id)?.value||'').trim();
    const desc=(document.getElementById('am-edit-desc-'+id)?.value||'').trim();
    const price=parseInt(document.getElementById('am-edit-price-'+id)?.value||'0');
    const limitPerUser=parseInt(document.getElementById('am-edit-lpu-'+id)?.value||'0');
    const limitTotal=parseInt(document.getElementById('am-edit-lt-'+id)?.value||'0');
    if(!name||price<=0) return showToast('❌ Введи назву і ціну');
    db.ref('adoptme/'+id).update({icon,name,desc,price,limitPerUser,limitTotal}).then(()=>{
        showToast('✅ Збережено!');
        loadAdmin();
    });
};
window.adminAddAdoptItem=()=>{
    const icon=(document.getElementById('am-icon')?.value||'🎁').trim();
    const name=(document.getElementById('am-name')?.value||'').trim();
    const desc=(document.getElementById('am-desc')?.value||'').trim();
    const price=parseInt(document.getElementById('am-price')?.value||'0');
    const limitPerUser=parseInt(document.getElementById('am-limit-user')?.value||'0');
    const limitTotal=parseInt(document.getElementById('am-limit-total')?.value||'0');
    if(!name||price<=0) return showToast('❌ Введи назву і ціну');
    db.ref('adoptme').push({icon,name,desc,price,limitPerUser,limitTotal,totalBought:0,hidden:false,createdAt:Date.now()}).then(()=>{
        showToast('✅ Товар додано!');
        loadAdmin();
    });
};
window.adminToggleAdoptItem=(id,visible)=>{
    db.ref('adoptme/'+id+'/hidden').set(!visible).then(()=>{showToast(visible?'👁 Показано':'🙈 Сховано');loadAdmin();});
};
window.adminDeleteAdoptItem=(id)=>{
    if(!confirm('Видалити товар?')) return;
    db.ref('adoptme/'+id).remove().then(()=>{showToast('🗑 Видалено');loadAdmin();});
};

// ── Показ оголошення гравцям ──
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
            document.querySelector('.container').prepend(banner);
        }
        const colors={info:'rgba(6,182,212,.12)',warn:'rgba(251,191,36,.12)',event:'rgba(168,85,247,.12)'};
        const borders={info:'rgba(6,182,212,.3)',warn:'rgba(251,191,36,.3)',event:'rgba(168,85,247,.3)'};
        const icons={info:'ℹ️',warn:'⚠️',event:'🎉'};
        const t=ann.type||'info';
        banner.style.cssText=`background:${colors[t]};border:1px solid ${borders[t]};border-radius:12px;padding:10px 14px;margin:0 0 10px;display:flex;align-items:center;gap:10px;position:relative`;
        banner.innerHTML=`<span style="font-size:18px;flex-shrink:0">${icons[t]}</span>
            <div style="flex:1;font-size:12px;font-weight:700;color:#fff;line-height:1.4">${ann.text}
                ${ann.link?`<br><a href="${ann.link}" target="_blank" style="color:var(--accent2);font-size:11px">🔗 Детальніше</a>`:''}
            </div>
            <button onclick="document.getElementById('announce-banner').style.display='none'"
                style="background:none;border:none;color:var(--muted);font-size:18px;cursor:pointer;flex-shrink:0;padding:0">✕</button>`;
    });
}
setTimeout(initAnnounce, 1800);


function initAdminNotifs(){
    if(!ADMINS.includes(Number(myId))) return;
    db.ref('adminNotifs/'+myId).on('value',snap=>{
        let unread=0;
        if(snap.val()) snap.forEach(n=>{ if(!n.val().read) unread++; });
        const badge=document.getElementById('admin-orders-badge');
        if(badge){
            badge.style.display=unread>0?'inline':'none';
            badge.textContent=unread>9?'9+':unread||'!';
        }
    });
}
// Запускаємо після ініціалізації Firebase
setTimeout(initAdminNotifs, 1500);


window.adminAddChannel=()=>{
    const name=(document.getElementById('ch-name')?.value||'').trim();
    const url=(document.getElementById('ch-url')?.value||'').trim();
    if(!name||!url) return showToast('❌ Заповни назву і посилання');
    // Збираємо нагороди
    const rewards=[];
    const bb=parseInt(document.getElementById('ch-reward-bb')?.value||'0');
    const xp=parseInt(document.getElementById('ch-reward-xp')?.value||'0');
    if(bb>0) rewards.push({type:'bb',amount:bb});
    if(xp>0) rewards.push({type:'xp',amount:xp});
    if(!rewards.length) return showToast('❌ Додай хоча б одну нагороду (BB або XP)');
    // Для сумісності зі старим кодом — зберігаємо і старий формат
    db.ref('channels').push({name,url,rewardType:rewards[0].type,reward:rewards[0].amount,rewards}).then(()=>{
        showToast('✅ Канал додано!');
        loadAdmin();
    });
};
