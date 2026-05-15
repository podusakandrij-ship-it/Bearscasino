// ============================================================
// МАГАЗИН
// ============================================================
window.setShopTab=t=>{currentShopTab=t;renderShop();};
function renderShop(){
    const list=document.getElementById('shop-list');
    const tabs=`<div class="shop-tabs">
        <div class="s-tab ${currentShopTab==='cases'?'active':''}" onclick="setShopTab('cases')">${L('tabCases')}</div>
        <div class="s-tab ${currentShopTab==='adoptme'?'active':''}" onclick="setShopTab('adoptme')">🐾 Adopt Me <span style="background:#ef4444;color:#fff;font-size:9px;font-weight:800;padding:1px 5px;border-radius:4px;margin-left:3px;vertical-align:middle">NEW</span></div>
        <div class="s-tab ${currentShopTab==='market'?'active':''}" onclick="setShopTab('market')">${L('tabMarket')}</div>
    </div>`;
    if(currentShopTab==='cases'){
        let h=tabs; const now=Date.now();
        for(const k in CASES){
            const c=CASES[k];
            const dl=c.deadline||0;
            if(c.limited&&now>dl) continue;
            const badge=c.limited?'<span class="badge-ltd">Лімітовано</span>':'';
            const chances = c.drop.map(p => {
                const imgSrc = getPetImageSrc(p);
                const petIcon = imgSrc.type === 'img'
                    ? `<img src="${imgSrc.src}" style="width:18px;height:18px;object-fit:contain;vertical-align:middle;margin-right:2px">`
                    : `<span style="font-size:14px;vertical-align:middle;margin-right:1px">${p.s}</span>`;
                return `<span style="color:${p.c}">${petIcon}${p.w}%</span>`;
            }).join(' · ');
            let timer='';
            if(c.limited){const diff=dl-now,d=Math.floor(diff/86400000),hr=Math.floor((diff/3600000)%24),mn=Math.floor((diff/60000)%60);timer=`<div class="case-timer">⏳ ${d}д ${hr}г ${mn}хв</div>`;}
            h+=`<div class="shop-card"><div class="case-info">
                <div class="case-name">${c.n} ${badge}</div>
                <div style="font-size:10px;margin:4px 0;font-weight:600;opacity:.85">${chances}</div>${timer}
            </div><button class="btn-buy" onclick="buyCase('${k}')">${c.p} BB</button></div>`;
        }
        // Піратський кейс — лімітований за дублони
        const pirateTimeLeft=bpTimeLeft();
        if(pirateTimeLeft){
            h+=`<div style="margin-top:6px;background:linear-gradient(135deg,rgba(15,8,2,.98),rgba(25,12,3,.98));border:1px solid rgba(212,160,23,.35);border-radius:14px;padding:13px;position:relative;overflow:hidden">
                <div style="position:absolute;top:0;right:0;background:linear-gradient(135deg,#d4a017,#f0c840);font-size:8px;font-weight:900;color:#000;padding:3px 10px;border-radius:0 14px 0 8px;letter-spacing:1px">ЛІМІТОВАНО</div>
                <div style="display:flex;align-items:center;gap:12px">
                    <span style="font-size:32px;flex-shrink:0">⚓</span>
                    <div style="flex:1;min-width:0">
                        <div style="font-family:'Fredoka One',cursive;font-size:15px;color:#f0c840">Піратський кейс</div>
                        <div style="font-size:10px;color:rgba(255,255,255,.35);margin-top:2px;line-height:1.5">🏴‍☠️ 55% · 💀 35% · 👁 10%</div>
                        <div style="font-size:10px;color:rgba(212,160,23,.5);font-weight:700;margin-top:3px">⏳ ${pirateTimeLeft}</div>
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:center;gap:5px;flex-shrink:0">
                        <div style="font-size:13px;font-weight:900;color:#f0c840">⚓ 3</div>
                        <button onclick="buyPirateCase()" style="background:linear-gradient(135deg,#d4a017,#f0c840);border:none;border-radius:9px;padding:8px 12px;font-size:11px;font-weight:900;color:#000;cursor:pointer">ВІДКРИТИ</button>
                    </div>
                </div>
            </div>`;
        }
        list.innerHTML=h;
    } else if(currentShopTab==='adoptme'){
        list.innerHTML=tabs+`<div id="adoptme-list" class="card" style="text-align:center;color:var(--muted)">Завантаження...</div>`;
        renderAdoptMe();
    } else {
        list.innerHTML=tabs+`<div id="m-list" class="card" style="text-align:center;color:var(--muted)">${L('loading')}</div>`;
        db.ref('market').once('value',snap=>{
            let myLots='', otherLots='';
            snap.forEach(child=>{
                const lot=child.val();
                if(!lot||!lot.pet) return;
                const imgSrc=getPetImageSrc(lot.pet);
                const icon = imgSrc.type==='img'
                    ? `<img src="${imgSrc.src}" width="38" height="38" style="object-fit:contain;border-radius:8px;flex-shrink:0">`
                    : `<span style="font-size:28px;flex-shrink:0">${lot.pet.s}</span>`;
                if(String(lot.sellerId)===String(myId)){
                    myLots+=`<div class="market-item">
                        ${icon}
                        <div style="flex:1">
                            <div style="font-weight:700;color:${lot.pet.c};font-size:13px">${lot.pet.n}</div>
                            <div style="font-size:11px;color:var(--muted)">Твій лот · <b style="color:var(--accent2)">${lot.price} BB</b></div>
                        </div>
                        <button class="btn-ghost" style="color:var(--error);border-color:rgba(239,68,68,.3);font-size:11px;padding:7px 10px" onclick="cancelMarketLot('${child.key}')">✕ Забрати</button>
                    </div>`;
                } else {
                    otherLots+=`<div class="market-item">
                        ${icon}
                        <div style="flex:1">
                            <div style="font-weight:700;color:${lot.pet.c};font-size:13px">${lot.pet.n}</div>
                            <div style="font-size:11px;color:var(--muted)">LVL ${lot.pet.lvl||1} · x${lot.pet.m.toFixed(3)} · ${lot.sellerName}</div>
                        </div>
                        <button class="btn-buy" onclick="buyFromMarket('${child.key}')">${lot.price} BB</button>
                    </div>`;
                }
            });
            let result='';
            if(myLots) result+=`<div style="font-size:10px;color:var(--muted);font-weight:700;letter-spacing:.5px;margin-bottom:8px">МОЇ ЛОТИ</div>${myLots}<div style="height:1px;background:rgba(255,255,255,.06);margin:12px 0"></div>`;
            result+=otherLots||`<div style="padding:20px;text-align:center;color:var(--muted)">${L('marketEmpty')}</div>`;
            const el=document.getElementById('m-list');
            if(el) el.innerHTML=result;
        });
    }
}
// ============================================================
// ADOPT ME SHOP
// ============================================================
async function renderAdoptMe(){
    const el=document.getElementById('adoptme-list');
    if(!el) return;
    const snap=await db.ref('adoptme').once('value');
    const items=snap.val()||{};
    const keys=Object.keys(items);
    if(!keys.length){
        el.innerHTML=`<div style="text-align:center;padding:30px;color:var(--muted)">
            <div style="font-size:40px;margin-bottom:10px">🐾</div>
            <div style="font-weight:700">Магазин порожній</div>
            <div style="font-size:12px;margin-top:6px">Незабаром тут з'являться товари!</div>
        </div>`;
        return;
    }
    const myPurchases=s.adoptPurchases||{};
    let h='<div style="display:flex;flex-direction:column;gap:10px">';
    keys.forEach(id=>{
        const item=items[id];
        if(!item||item.hidden) return;
        const totalBought=item.totalBought||0;
        const myBought=myPurchases[id]||0;
        const limitPerUser=item.limitPerUser||0;
        const limitTotal=item.limitTotal||0;
        const soldOut=(limitTotal>0 && totalBought>=limitTotal);
        const myLimitReached=(limitPerUser>0 && myBought>=limitPerUser);
        const blocked=soldOut||myLimitReached;
        let maxCanBuy=99;
        if(limitPerUser>0) maxCanBuy=Math.min(maxCanBuy, limitPerUser-myBought);
        if(limitTotal>0)   maxCanBuy=Math.min(maxCanBuy, limitTotal-totalBought);
        if(maxCanBuy<1)    maxCanBuy=1;
        const stockLine=limitTotal>0
            ? `📦 ${soldOut?`<span style="color:var(--error)">Розпродано</span>`:`<span style="color:var(--accent2)">${totalBought}/${limitTotal} куплено</span>`}`
            : `📦 <span style="color:var(--muted)">Необмежено</span>`;
        const myLine=myBought>0
            ? `&nbsp;·&nbsp;<span style="color:var(--accent)">Ти купив: <b>${myBought}</b>${limitPerUser>0?' / '+limitPerUser:''}</span>`
            : (limitPerUser>0?`&nbsp;·&nbsp;<span style="color:var(--muted)">Ліміт: ${limitPerUser}</span>`:'');
        h+=`<div style="background:rgba(255,255,255,.04);border:1px solid ${blocked?'rgba(255,255,255,.07)':'rgba(255,200,50,.18)'};border-radius:14px;padding:14px">
            <div style="display:flex;align-items:flex-start;gap:12px">
                <div style="font-size:38px;flex-shrink:0;line-height:1">${item.icon||'🎁'}</div>
                <div style="flex:1;min-width:0">
                    <div style="font-weight:800;font-size:14px;color:#fff;margin-bottom:3px">${item.name}</div>
                    ${item.desc?`<div style="font-size:11px;color:var(--muted);margin-bottom:5px;line-height:1.4">${item.desc}</div>`:''}
                    <div style="font-size:10px;font-weight:700;margin-bottom:8px">${stockLine}${myLine}</div>
                    ${!blocked?`
                    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                        <div style="display:flex;align-items:center;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:8px;overflow:hidden;flex-shrink:0">
                            <button onclick="amQty('${id}',-1,${maxCanBuy})" style="background:none;border:none;color:#fff;font-size:20px;padding:4px 12px;cursor:pointer;line-height:1">−</button>
                            <span id="am-qty-${id}" style="min-width:30px;text-align:center;font-weight:800;font-size:15px;color:#fff">1</span>
                            <button onclick="amQty('${id}',1,${maxCanBuy})" style="background:none;border:none;color:#fff;font-size:20px;padding:4px 12px;cursor:pointer;line-height:1">+</button>
                        </div>
                        <div style="flex:1;min-width:60px">
                            <div style="font-size:10px;color:var(--muted)">Разом:</div>
                            <div id="am-total-${id}" style="font-weight:900;font-size:15px;color:var(--accent2)">${item.price} BB</div>
                        </div>
                        <button class="btn-buy" onclick="buyAdoptMe('${id}',${item.price},${maxCanBuy})">🛒 Купити</button>
                    </div>`:`
                    <div style="font-size:12px;font-weight:700;color:var(--error)">${soldOut?'❌ Розпродано':'❌ Досяг ліміту'}</div>`}
                </div>
            </div>
        </div>`;
    });
    h+='</div>';
    el.innerHTML=h;
}

window.amQty=function(id,delta,maxCanBuy){
    maxCanBuy=maxCanBuy||99;
    const el=document.getElementById('am-qty-'+id);
    const totalEl=document.getElementById('am-total-'+id);
    if(!el) return;
    let qty=parseInt(el.textContent)||1;
    qty=Math.max(1,Math.min(maxCanBuy,qty+delta));
    el.textContent=qty;
    if(totalEl){
        const btn=document.querySelector(`[onclick*="buyAdoptMe('${id}'"]`);
        if(btn){
            const m=btn.getAttribute('onclick').match(/buyAdoptMe\('[^']+',(\d+)/);
            if(m) totalEl.textContent=(parseInt(m[1])*qty)+' BB';
        }
    }
};

window.buyAdoptMe=async function(id,priceArg,maxCanBuy){
    const qtyEl=document.getElementById('am-qty-'+id);
    const qty=qtyEl?Math.max(1,parseInt(qtyEl.textContent)||1):1;
    const snap=await db.ref('adoptme/'+id).once('value');
    const item=snap.val();
    if(!item) return showToast('❌ Товар не знайдено');
    const myPurchases=s.adoptPurchases||{};
    const myBought=myPurchases[id]||0;
    const totalBought=item.totalBought||0;
    const limitPerUser=item.limitPerUser||0;
    const limitTotal=item.limitTotal||0;
    const totalCost=item.price*qty;
    if(limitPerUser>0 && myBought>=limitPerUser) return showToast('❌ Ти вже досяг ліміту покупок');
    if(limitTotal>0 && totalBought>=limitTotal)  return showToast('❌ Товар розпродано');
    if(limitPerUser>0 && myBought+qty>limitPerUser) return showToast(`❌ Можеш купити ще лише ${limitPerUser-myBought}`);
    if(limitTotal>0 && totalBought+qty>limitTotal)  return showToast(`❌ Залишилось лише ${limitTotal-totalBought} шт.`);
    if(s.b<totalCost) return showToast(`❌ Мало BB! Потрібно ${totalCost} BB`);
    s.b-=totalCost;
    if(!s.adoptPurchases) s.adoptPurchases={};
    s.adoptPurchases[id]=(s.adoptPurchases[id]||0)+qty;
    save();
    db.ref('adoptme/'+id+'/totalBought').set(totalBought+qty);
    const orderRef=db.ref('adoptorders').push();
    const order={orderId:orderRef.key,itemId:id,itemName:item.name,itemIcon:item.icon||'🎁',price:item.price,qty,totalCost,buyerId:myId,buyerName:myName,status:'pending',createdAt:Date.now()};
    orderRef.set(order);
    ADMINS.forEach(adminId=>{
        db.ref('adminNotifs/'+adminId).push({type:'adoptorder',msg:`🛒 ${myName} купив: ${item.icon||'🎁'} ${item.name} x${qty} за ${totalCost} BB`,orderId:orderRef.key,buyerName:myName,buyerId:myId,itemName:item.name,qty,read:false,createdAt:Date.now()});
    });
    showToast(`✅ Куплено ${qty}x ${item.icon||'🎁'} ${item.name}! Очікуй видачі від адміна`);
    renderAdoptMe();
    ren();
};
window.adminDeliverOrder=async function(orderId){
    if(!orderId||orderId==='undefined'){return showToast('❌ Помилка: ID замовлення не знайдено');}
    await db.ref('adoptorders/'+orderId+'/status').set('delivered');
    showToast('✅ Позначено як видано!');
    loadAdmin();
};


window.cancelMarketLot=lotId=>{
    db.ref('market/'+lotId).once('value',snap=>{
        const lot=snap.val();
        if(!lot) return;
        s.inv.push(lot.pet); save();
        db.ref('market/'+lotId).remove();
        showToast(`✅ ${lot.pet.n} повернуто в інвентар`);
        renderShop();
    });
};
window.buyFromMarket=lotId=>{
    db.ref('market/'+lotId).once('value',snap=>{
        const lot=snap.val();
        if(!lot) return alert('Лот недоступний!');
        if(s.b<lot.price) return alert(`Потрібно: ${lot.price} BB`);
        s.b-=lot.price; s.inv.push(lot.pet); save();
        db.ref('players/'+lot.sellerId+'/b').transaction(c=>(c||0)+lot.price);
        db.ref('market/'+lotId).remove();
        showToast(`✅ Куплено ${lot.pet.s} ${lot.pet.n}!`);
        renderShop();
    });
};
window.listOnMarket=petId=>{
    if(s.p&&s.p.id===petId) return alert('Спочатку зніми пета!');
    const pr=prompt('Ціна (BB):');
    if(!pr||isNaN(pr)||pr<=0) return;
    const idx=s.inv.findIndex(p=>p.id===petId),pet=s.inv[idx];
    db.ref('market').push({pet,price:Number(pr),sellerId:myId,sellerName:myName}).then(()=>{s.inv.splice(idx,1);save();renderInv();});
};

// ============================================================
// ІНВЕНТАР (canvas pets)
// ============================================================
function renderInv(){
    stopAllPetAnims();
    const el=document.getElementById('inv-list');
    const countEl=document.getElementById('inv-count');
    if(countEl) countEl.textContent=s.inv.length ? `${s.inv.length} ${L('invCountLabel')}` : '';

    // Pokédex mode
    if(showingDex){ el.innerHTML=renderPokedex(); return; }

    // Pokédex button
    const dexBtn=`<button class="btn-dex" onclick="togglePokedex()">📖 Покедекс</button>`;

    if(!s.inv||!s.inv.length){
        el.innerHTML=dexBtn+`<div class="inv-empty">
            <div style="font-size:52px;margin-bottom:12px">🥚</div>
            <div style="font-weight:700;font-size:15px">${L('invEmpty')}</div>
            <div style="font-size:12px;opacity:.6;margin-top:4px">${L('invEmptySub')}</div>
        </div>`;
        return;
    }
    let h=dexBtn;
    s.inv.forEach((p,i)=>{
        const eq=s.p&&s.p.id===p.id;
        const cid=`pet-vis-${i}`;
        const pvl=p.lvl||1, pxp=s.p&&s.p.id===p.id?s.x:0;
        const pct=eq?Math.min((pxp/xpForLevel(pvl))*100,100):0;
        const qsPrice = Math.floor(p.m * 50);
        h+=`<div class="pet-card${eq?' pet-eq':''}">
            <div class="pet-stripe" style="background:${p.c}"></div>
            <div id="${cid}" data-size="68" style="flex-shrink:0"></div>
            <div class="pet-info" style="overflow:hidden">
                <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">
                    <div class="pet-badge" style="background:${p.c}22;color:${p.c};border:1px solid ${p.c}44">${p.r}</div>
                    ${eq?`<span class="pet-active-tag">✦ ${L('activePet')}</span>`:''}
                </div>
                <div class="pet-name">${p.n}</div>
                <div class="pet-stats"><span>${L('bonusWord')} <b style="color:${p.c}">x${p.m.toFixed(3)}</b> · LVL <b style="color:#fff">${pvl}</b></span></div>
                ${eq?`<div style="margin-top:5px">
                    <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--muted);margin-bottom:2px">
                        <span>XP</span><span>${pxp}/${xpForLevel(pvl)}</span>
                    </div>
                    <div class="xp-bar" style="height:4px"><div class="xp-fill" style="width:${pct}%"></div></div>
                </div>`:''}
            </div>
            <div class="pet-btns">
                <button class="pb-equip${eq?' pb-eq':''}" onclick="equip(${p.id})">${eq?L('equipped'):L('equip')}</button>
                <button class="pb-sell" onclick="listOnMarket(${p.id})" title="На ринок">🏪</button>
                <button class="pb-quick-sell" onclick="quickSell(${p.id},${qsPrice})" title="Продати за ${qsPrice} BB">💰${qsPrice}</button>
            </div>
        </div>`;
    });
    el.innerHTML=h;
    requestAnimationFrame(()=>{ s.inv.forEach((p,i)=>startPetAnim(`pet-vis-${i}`,p)); });
}
window.equip=id=>{s.p=s.inv.find(i=>i.id===id);save();renderInv();ren();};
window.quickSell=(petId,price)=>{
    const pet=s.inv.find(p=>p.id===petId);
    if(!pet) return;
    if(s.p&&s.p.id===petId) return alert(`Спочатку зніми ${pet.n}!`);
    if(!confirm(`Продати ${pet.s||''} ${pet.n} за ${price} BB?`)) return;
    s.inv=s.inv.filter(p=>p.id!==petId);
    s.b+=price; save(); renderInv(); ren();
    showToast(`💰 Продано ${pet.n} за ${price} BB`);
};
