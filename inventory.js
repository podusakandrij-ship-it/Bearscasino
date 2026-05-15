// ============================================================
// updUI + play
// ============================================================
window.updUI=()=>{
    const g=document.getElementById('g-sel').value;
    ['dice','wheel','slots','mines','bj',].forEach(id=>{
        const el=document.getElementById('ui-'+id);if(el)el.style.display=(g===id)?'block':'none';
    });
    if(g==='dice')    buildDiceUI();
    if(g==='wheel')   setTimeout(()=>drawWheel(wheelAngle),50);
    if(g==='mines')   updateMinesCount();
};

window.play=()=>{
    const bt=parseFloat(document.getElementById('bet-a').value);
    if(isNaN(bt)||bt<=0||bt>s.b)return alert('Мало BB!');
    const g=document.getElementById('g-sel').value;
    const now=Date.now();
    if(g==='mines'&&minesState&&minesState.alive)return alert('Спочатку завершуй гру!');
    document.getElementById('g-stat').innerText=L('waiting');
    if(g==='f50'){
        const w=Math.random()>.5;let ticks=0;
        document.getElementById('g-stat').innerHTML='<div id="coin-anim" style="font-size:56px;display:inline-block;transition:transform .08s">🪙</div>';
        const iv=setInterval(()=>{
            const coin=document.getElementById('coin-anim');
            if(coin){coin.innerText=ticks%2===0?'✅':'❌';const sc=.7+Math.abs(Math.sin(ticks*.45))*.5,rot=ticks%2===0?-15:15;coin.style.transform=`scale(${sc}) rotate(${rot}deg)`;}
            if(++ticks>16){clearInterval(iv);const coin2=document.getElementById('coin-anim');if(coin2){coin2.innerText=w?'✅':'❌';coin2.style.transform='scale(1.2)';setTimeout(()=>coin2.style.transform='scale(1)',150);}setTimeout(()=>res(w,bt,1.55,w?L('win'):L('lose')),200);}
        },70);
    } else if(g==='dice'){
        rollDiceAnim(r=>res(r===selN_val,bt,2.05,`Випало ${r}`));
    } else if(g==='wheel'){
        if(wheelSpinning)return;
        let p=Math.random()*100,m;
        if(p<50)m=0;else if(p<75)m=1.4;else if(p<95)m=1.6;else m=1.8;
        spinWheel(m,()=>{res(m>0,bt,m,`Множник x${m}`);});
    } else if(g==='slots'){
        if(slotsSpinning)return;
        document.getElementById('g-stat').innerText=L('spinning');
        runSlots((a,b,c)=>res(slotMult(a,b,c)>0,bt,slotMult(a,b,c),`${a} ${b} ${c}`));
    } else if(g==='mines'){startMines(bt);return;
    } else if(g==='bj') startBJ(bt);
};

function res(win,bt,m,msg){
    const bon=s.p?s.p.m:1;
    if(win){
        const w=(bt*m-bt)*bon;
        s.b+=w;s.x+=Math.floor(bt/2);
        document.getElementById('g-stat').innerHTML=`<span style="color:var(--success)">+${w.toFixed(2)} BB</span><br><small>${msg}</small>`;
        checkPetLevelUp();dailyProgress('win');dailyProgress('play');
        // BP XP = виграш BB (округлено)
        addBPXp(Math.floor(w));
    }
    else{s.b-=bt;document.getElementById('g-stat').innerHTML=`<span style="color:var(--error)">-${bt.toFixed(2)} BB</span><br><small>${msg}</small>`;dailyProgress('lose');dailyProgress('play');}
    save();ren();
}
