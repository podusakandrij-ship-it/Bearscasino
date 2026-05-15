// ============================================================
// КОЛЕСО
// ============================================================
const WHEEL_SEGS=[
    {label:'0x',      color:'#c0392b',m:0,   start:0,  end:180},
    {label:'1.4x',    color:'#27ae60',m:1.4, start:180,end:270},
    {label:'1.6x',    color:'#2980b9',m:1.6, start:270,end:342},
    {label:'1.8x',    color:'#f59e0b',m:1.8, start:342,end:360},
];
let wheelAngle=0,wheelSpinning=false;
function drawWheel(rot){
    const canvas=document.getElementById('wheel-canvas');
    if(!canvas) return;
    const ctx=canvas.getContext('2d'),cx=110,cy=110,r=100;
    ctx.clearRect(0,0,220,220);
    WHEEL_SEGS.forEach(seg=>{
        const sa=(seg.start+rot-90)*Math.PI/180,ea=(seg.end+rot-90)*Math.PI/180;
        ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,sa,ea);ctx.closePath();
        ctx.fillStyle=seg.color;ctx.fill();
        ctx.strokeStyle='rgba(0,0,0,0.5)';ctx.lineWidth=2;ctx.stroke();
        const mid=((seg.start+seg.end)/2+rot-90)*Math.PI/180;
        ctx.save();ctx.translate(cx+Math.cos(mid)*r*.65,cy+Math.sin(mid)*r*.65);
        ctx.rotate(mid+Math.PI/2);ctx.fillStyle='#fff';ctx.font='bold 13px system-ui';
        ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(seg.label,0,0);ctx.restore();
    });
    ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=3;ctx.stroke();
    ctx.beginPath();ctx.arc(cx,cy,16,0,Math.PI*2);ctx.fillStyle='#060810';ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=2;ctx.stroke();
}
function spinWheel(resultM,onDone){
    if(wheelSpinning) return; wheelSpinning=true;
    const seg=WHEEL_SEGS.find(s=>s.m===resultM);
    const segMid=(seg.start+seg.end)/2,halfArc=(seg.end-seg.start)/2;
    const randOff=(Math.random()-.5)*halfArc*.7,landAt=segMid+randOff;
    const finalRot=((360-landAt%360)+360)%360,totalRot=6*360+finalRot-(wheelAngle%360);
    const a0=wheelAngle,t0=performance.now(),dur=4500;
    function easeOut(t){return 1-Math.pow(1-t,4);}
    function frame(now){
        const t=Math.min((now-t0)/dur,1);
        wheelAngle=a0+totalRot*easeOut(t);drawWheel(wheelAngle%360);
        if(t<1) requestAnimationFrame(frame);
        else{wheelAngle=wheelAngle%360;wheelSpinning=false;onDone();}
    }
    requestAnimationFrame(frame);
}

// ============================================================
// СЛОТИ
// ============================================================
const SLOT_SYMS=['🍒','🍋','🍊','🍇','⭐','💎','7'];
const SLOT_W=[30,25,20,15,6,3,1];
let slotsSpinning=false;
function pickSlot(){let r=Math.random()*100,cur=0;for(let i=0;i<SLOT_SYMS.length;i++){cur+=SLOT_W[i];if(r<cur)return SLOT_SYMS[i];}return SLOT_SYMS[0];}
function slotMult(a,b,c){if(a===b&&b===c){if(a==='7')return 5;if(a==='💎')return 4;if(a==='⭐')return 3;return 2;}if(a===b||b===c||a===c)return 1.3;return 0;}
function spinReel(id,final,onDone){let t=0;const iv=setInterval(()=>{document.getElementById(id).innerText=SLOT_SYMS[Math.floor(Math.random()*SLOT_SYMS.length)];if(++t>=14){clearInterval(iv);document.getElementById(id).innerText=final;onDone();}},75);}
function runSlots(cb){if(slotsSpinning)return;slotsSpinning=true;const r0=pickSlot(),r1=pickSlot(),r2=pickSlot();spinReel('reel-0',r0,()=>spinReel('reel-1',r1,()=>spinReel('reel-2',r2,()=>{slotsSpinning=false;cb(r0,r1,r2);})));}

// ============================================================
// МІНИ
// ============================================================
let minesState=null;
function calcMinesMult(opened,mineCount){if(opened===0)return 1.0;const maxMult=1.0+mineCount*.25,progress=opened/(25-mineCount);return Math.round((1.0+(maxMult-1.0)*progress)*100)/100;}
window.updateMinesCount=()=>{const n=parseInt(document.getElementById('mines-count').value);document.getElementById('mines-count-label').innerText=n;document.getElementById('mines-mult-label').innerText=(1+n*.25).toFixed(2);};
function buildMinesGrid(){
    if(!minesState){document.getElementById('mines-grid').innerHTML='';return;}
    let h='';
    for(let i=0;i<25;i++){const cell=minesState.cells[i];if(cell.revealed){h+=cell.mine?`<div class="mc mc-boom">💣</div>`:`<div class="mc mc-safe">✅</div>`;}else if(minesState.alive){h+=`<div class="mc mc-btn" onclick="minesReveal(${i})">?</div>`;}else{h+=`<div class="mc" style="opacity:.3">·</div>`;}}
    document.getElementById('mines-grid').innerHTML=h;
}
window.minesReveal=idx=>{
    if(!minesState||!minesState.alive)return;
    const cell=minesState.cells[idx];cell.revealed=true;
    if(cell.mine){
        minesState.alive=false;minesState.cells.forEach(c=>{if(c.mine)c.revealed=true;});buildMinesGrid();
        document.getElementById('mines-ctrl').style.display='none';
        const bt=minesState.bet;s.b-=bt;save();ren();
        setTimeout(()=>{document.getElementById('g-stat').innerHTML=`<span style="color:var(--error)">-${bt.toFixed(2)} BB 💣</span><br><small>${L('minesBoom')}</small>`;minesState=null;buildMinesGrid();},600);
    } else {
        minesState.opened++;const mult=calcMinesMult(minesState.opened,minesState.mineCount);
        minesState.currentMult=mult;document.getElementById('mines-curr-mult').innerText=mult.toFixed(2);
        buildMinesGrid();if(minesState.opened>=minesState.safeCells)minesCashout();
    }
};
window.minesCashout=()=>{
    if(!minesState||!minesState.alive||minesState.opened===0)return;
    const bt=minesState.bet,mult=minesState.currentMult,win=(bt*mult-bt)*(s.p?s.p.m:1);
    s.b+=win;s.x+=Math.floor(bt/2);save();ren();checkPetLevelUp();
    addBPXp(Math.floor(win));
    document.getElementById('g-stat').innerHTML=`<span style="color:var(--success)">+${win.toFixed(2)} BB</span><br><small>Забрав x${mult.toFixed(2)} 💰</small>`;
    minesState.alive=false;minesState.cells.forEach(c=>c.revealed=true);buildMinesGrid();
    document.getElementById('mines-ctrl').style.display='none';minesState=null;
};
function startMines(bt){
    const mineCount=parseInt(document.getElementById('mines-count').value),safeCells=25-mineCount;
    let pos=Array.from({length:25},(_,i)=>i);
    for(let i=pos.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pos[i],pos[j]]=[pos[j],pos[i]];}
    const mineSet=new Set(pos.slice(0,mineCount));
    minesState={bet:bt,mineCount,safeCells,opened:0,alive:true,currentMult:1.0,cells:Array.from({length:25},(_,i)=>({mine:mineSet.has(i),revealed:false}))};
    document.getElementById('mines-curr-mult').innerText='1.00';document.getElementById('mines-ctrl').style.display='block';
    document.getElementById('g-stat').innerHTML=`<span style="color:var(--accent)">${L('openCells')}</span>`;buildMinesGrid();
}

// ============================================================
// КУБИК
// ============================================================
const DICE_FACES=['⚀','⚁','⚂','⚃','⚄','⚅'];
let selN_val=1;
function buildDiceUI(){
    let h=`<div class="dice-display"><div id="dice-big" style="transition:transform .15s">${DICE_FACES[selN_val-1]}</div>
        <div style="font-size:10px;color:#8d99ae;font-weight:700;margin-top:6px;letter-spacing:.5px">${L('chosen')}</div>
    </div><div class="dice-grid">`;
    for(let i=1;i<=6;i++)h+=`<button class="dice-btn${i===selN_val?' dice-sel':''}" onclick="selN(${i})">${DICE_FACES[i-1]}<span>${i}</span></button>`;
    h+=`</div>`;document.getElementById('ui-dice').innerHTML=h;
}
window.selN=n=>{selN_val=n;buildDiceUI();const big=document.getElementById('dice-big');if(big){big.style.transform='scale(.8) rotate(-10deg)';setTimeout(()=>big.style.transform='scale(1.1) rotate(5deg)',80);setTimeout(()=>big.style.transform='scale(1) rotate(0)',160);}};
function rollDiceAnim(onDone){const big=document.getElementById('dice-big');if(!big){onDone(Math.floor(Math.random()*6)+1);return;}let t=0;const iv=setInterval(()=>{const r=Math.floor(Math.random()*6);big.innerText=DICE_FACES[r];big.style.transform=`rotate(${(Math.random()-.5)*30}deg) scale(${.85+Math.random()*.2})`;if(++t>12){clearInterval(iv);const result=Math.floor(Math.random()*6)+1;big.innerText=DICE_FACES[result-1];big.style.transform='scale(1) rotate(0)';onDone(result);}},55);}

// ============================================================
// CANVAS КЕЙСИ
// ============================================================
function openCaseAnimation(win, onComplete) {
    const modal = document.getElementById('case-modal');
    const title = document.getElementById('case-title');
    const resEl = document.getElementById('case-res');
    const closeEl = document.getElementById('case-close');
    const glow = RARITY_GLOW[win.r] || '#fff';

    modal.style.display = 'flex';
    closeEl.style.display = 'none';
    resEl.innerHTML = '';

    // Phase 1: Show rolling roulette
    const scr = document.getElementById('case-scroll');
    const CARD_W = 92, COUNT = 52, WIN_IDX = 38;
    const pool = [];
    for(const key in CASES) pool.push(...CASES[key].drop);
    if(!pool.length) pool.push(win);
    scr.innerHTML = ''; scr.style.transition = 'none'; scr.style.left = '0px';
    const items = [];
    for(let i=0;i<COUNT;i++) items.push(i===WIN_IDX ? win : pool[Math.floor(Math.random()*pool.length)]);
    items.forEach(pet=>{
        const cv=document.createElement('canvas'); cv.width=86; cv.height=106;
        cv.style.cssText='display:block;margin:3px;border-radius:14px;flex-shrink:0';
        scr.appendChild(cv); drawPetCard(cv,pet);
    });

    // Start spin
    setTimeout(()=>{
        scr.style.transition='4.5s cubic-bezier(0.08,0,0.05,1)';
        scr.style.left=`-${WIN_IDX*CARD_W-(window.innerWidth/2-CARD_W/2)}px`;
    }, 80);

    // Phase 2: After spin — dramatic reveal
    setTimeout(()=>{
        // Flash the winner card
        const winCard = scr.children[WIN_IDX];
        if(winCard){
            winCard.style.transition='transform .15s,box-shadow .15s';
            winCard.style.transform='scale(1.15)';
            winCard.style.boxShadow=`0 0 30px ${glow}, 0 0 60px ${glow}66`;
        }
        // Sparkle flash on modal
        modal.style.background=`rgba(4,6,12,.97)`;
        setTimeout(()=>{
            modal.style.background='rgba(4,6,12,.97)';
        },200);
    }, 4700);

    // Phase 3: Big reveal card
    setTimeout(()=>{
        // Hide roulette
        const roulette = modal.querySelector('.case-roulette');
        if(roulette){ roulette.style.transition='opacity .4s'; roulette.style.opacity='0'; }
        title.style.transition='opacity .3s'; title.style.opacity='0';

        setTimeout(()=>{
            if(roulette) roulette.style.display='none';
            title.style.display='none';

            // Big card reveal with animation
            const imgSrc = getPetImageSrc(win);
            const hasPhoto = imgSrc.type === 'img';
            const cardSize = 180;

            resEl.innerHTML = `<div id="reveal-card" style="
                opacity:0;transform:scale(0.3) rotate(-10deg);
                transition:opacity .5s,transform .5s cubic-bezier(.175,.885,.32,1.5);
                display:inline-block;
            ">
                <div style="
                    width:${cardSize}px;height:${cardSize}px;
                    background:${RARITY_BG[win.r]||'#1a1f2e'};
                    border-radius:20px;border:3px solid ${glow};
                    box-shadow:0 0 40px ${glow}88,0 0 80px ${glow}44;
                    display:flex;align-items:center;justify-content:center;
                    position:relative;overflow:hidden;margin:0 auto 12px;
                ">
                    ${hasPhoto
                        ? `<img src="${imgSrc.src}" style="width:${Math.round(cardSize*.9)}px;height:${Math.round(cardSize*.9)}px;object-fit:contain">`
                        : `<span style="font-size:${Math.round(cardSize*.5)}px">${imgSrc.src}</span>`
                    }
                </div>
            </div>
            <div id="reveal-info" style="opacity:0;transform:translateY(16px);transition:opacity .4s .3s,transform .4s .3s">
                <div style="font-size:24px;font-weight:900;color:${glow};letter-spacing:.5px">${win.n}</div>
                <div style="font-size:13px;color:#8d99ae;margin-top:4px">${win.r} · x${win.m.toFixed(3)}</div>
                <div style="font-size:12px;color:var(--accent2);margin-top:6px;font-weight:700">+${win.n} в інвентар!</div>
            </div>`;

            // Animate in
            requestAnimationFrame(()=>{
                requestAnimationFrame(()=>{
                    const card=document.getElementById('reveal-card');
                    const info=document.getElementById('reveal-info');
                    if(card){card.style.opacity='1';card.style.transform='scale(1) rotate(0deg)';}
                    if(info){info.style.opacity='1';info.style.transform='translateY(0)';}
                });
            });

            setTimeout(()=>{
                closeEl.style.display='block';
                closeEl.style.animation='toast-in .3s ease';
                onComplete();
            }, 700);
        }, 400);
    }, 5400);
}

function buyCase(k){
    const c=CASES[k];
    if(s.b<c.p)return alert('Мало BB!');

    // Pick winner
    let rand=Math.random()*100, win=null, cur=0;
    for(const p of c.drop){cur+=p.w;if(rand<=cur){win={...p};break;}}
    if(!win) win={...c.drop[c.drop.length-1]};

    // Знімаємо гроші та ОДРАЗУ додаємо пета в інвентар (до анімації!)
    // Це запобігає втраті пета через Firebase listener
    win.id=Date.now(); win.lvl=1; win.bm=win.m; // bm — базовий множник без левел-бонусу
    s.b-=c.p;
    s.inv.push(win);
    dailyProgress('case');
    save();

    openCaseAnimation(win, ()=>{
        // Пет вже в інвентарі, просто оновлюємо UI
        ren();
    });
}
window.buyCase=buyCase;
window.closeCase=()=>{
    const modal=document.getElementById('case-modal');
    const title=document.getElementById('case-title');
    const roulette=modal.querySelector('.case-roulette');
    // Reset modal for next use
    modal.style.display='none';
    if(title){title.style.display='';title.style.opacity='1';}
    if(roulette){roulette.style.display='';roulette.style.opacity='1';}
    document.getElementById('case-close').style.display='none';
    document.getElementById('case-res').innerHTML='';
};
