// ============================================================
// FIREBASE
// ============================================================
const firebaseConfig = {
    apiKey: "AIzaSyD7F2lrec5XWyMWG7J0uW6IhEKD-LJ4jRY",
    authDomain: "bearscasino-bcded.firebaseapp.com",
    projectId: "bearscasino-bcded",
    storageBucket: "bearscasino-bcded.firebasestorage.app",
    messagingSenderId: "826765969101",
    appId: "1:826765969101:web:ee5e5da5057582f8ba4b84",
    measurementId: "G-J2BCGS7NVM",
    databaseURL: "https://bearscasino-bcded-default-rtdb.europe-west1.firebasedatabase.app"
};
firebase.initializeApp(firebaseConfig);
const db  = firebase.database();
const tg  = window.Telegram.WebApp;

// ============================================================
// КОНСТАНТИ
// ============================================================
const ADMINS          = [8216362223, 2067230442];
const myId            = tg.initDataUnsafe?.user?.id || 101;
const myName          = tg.initDataUnsafe?.user?.first_name || "Гравець";
const DEADLINE_EASTER = new Date("2026-04-14T00:00:00+03:00").getTime();
const DEADLINE_CLOWN  = new Date("2026-04-02T00:00:00+03:00").getTime();
const XP_PER_LEVEL    = 1000;

// ============================================================
// ПЕТИ — canvas малюнки + анімація
// ============================================================
// Кожен пет має функцію draw(ctx, W, H, t) де t = time для анімації
const PET_DRAW = {
  '🐶': (ctx,W,H,t) => { // Собака
    ctx.fillStyle='#c8a96e'; roundRect(ctx,W*.2,H*.25,W*.6,H*.5,W*.15); ctx.fill();
    ctx.fillStyle='#b8935a'; roundRect(ctx,W*.15,H*.2,W*.18,H*.28,W*.08); ctx.fill();
    roundRect(ctx,W*.67,H*.2,W*.18,H*.28,W*.08); ctx.fill();
    ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(W*.37,H*.42,W*.06,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(W*.63,H*.42,W*.06,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#e8748a'; ctx.beginPath(); ctx.ellipse(W*.5,H*.6,W*.1,H*.07,0,0,Math.PI*2); ctx.fill();
    // Tail wag
    const tw = Math.sin(t*3)*0.3;
    ctx.strokeStyle='#c8a96e'; ctx.lineWidth=W*.05; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(W*.8,H*.55); ctx.quadraticCurveTo(W*(1+tw*.1),H*.4,W*.85,H*.35); ctx.stroke();
  },
  '🐱': (ctx,W,H,t) => { // Кіт
    ctx.fillStyle='#e8c88a'; roundRect(ctx,W*.2,H*.28,W*.6,H*.48,W*.15); ctx.fill();
    // Ears
    ctx.beginPath(); ctx.moveTo(W*.22,H*.3); ctx.lineTo(W*.15,H*.1); ctx.lineTo(W*.38,H*.28); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W*.78,H*.3); ctx.lineTo(W*.85,H*.1); ctx.lineTo(W*.62,H*.28); ctx.fill();
    ctx.fillStyle='#f8a8b8';
    ctx.beginPath(); ctx.moveTo(W*.25,H*.28); ctx.lineTo(W*.19,H*.14); ctx.lineTo(W*.37,H*.28); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W*.75,H*.28); ctx.lineTo(W*.81,H*.14); ctx.lineTo(W*.63,H*.28); ctx.fill();
    ctx.fillStyle='#1a1a2e'; ctx.beginPath(); ctx.ellipse(W*.37,H*.44,W*.07,W*.09,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(W*.63,H*.44,W*.07,W*.09,0,0,Math.PI*2); ctx.fill();
    // Blink
    if (Math.sin(t*1.5)>0.95) { ctx.fillStyle='#e8c88a'; ctx.fillRect(W*.3,H*.41,W*.14,W*.08); ctx.fillRect(W*.56,H*.41,W*.14,W*.08); }
    ctx.strokeStyle='#c8a870'; ctx.lineWidth=W*.02;
    for(let i=0;i<3;i++){ ctx.beginPath(); ctx.moveTo(W*.5,H*.57); ctx.lineTo(W*.2+i*W*.05,H*.54+Math.sin(t*2+i)*.02*H); ctx.stroke(); }
    for(let i=0;i<3;i++){ ctx.beginPath(); ctx.moveTo(W*.5,H*.57); ctx.lineTo(W*.8-i*W*.05,H*.54+Math.sin(t*2+i)*.02*H); ctx.stroke(); }
  },
  '🐰': (ctx,W,H,t) => { // Кролик
    // Body
    ctx.fillStyle='#f0f0f0'; ctx.beginPath(); ctx.ellipse(W*.5,H*.6,W*.25,H*.22,0,0,Math.PI*2); ctx.fill();
    // Head
    ctx.beginPath(); ctx.ellipse(W*.5,H*.38,W*.18,H*.16,0,0,Math.PI*2); ctx.fill();
    // Ears bounce
    const eb=Math.sin(t*2)*0.04;
    ctx.fillStyle='#f0f0f0'; roundRect(ctx,W*.32,H*(0.08+eb),W*.1,H*.24,W*.05); ctx.fill();
    roundRect(ctx,W*.58,H*(0.08+eb),W*.1,H*.24,W*.05); ctx.fill();
    ctx.fillStyle='#ffb6c1'; roundRect(ctx,W*.345,H*(0.1+eb),W*.06,H*.18,W*.03); ctx.fill();
    roundRect(ctx,W*.6,H*(0.1+eb),W*.06,H*.18,W*.03); ctx.fill();
    ctx.fillStyle='#333'; ctx.beginPath(); ctx.arc(W*.43,H*.37,W*.04,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(W*.57,H*.37,W*.04,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#ffb6c1'; ctx.beginPath(); ctx.arc(W*.5,H*.44,W*.03,0,Math.PI*2); ctx.fill();
  },
  '🦊': (ctx,W,H,t) => { // Лисиця
    ctx.fillStyle='#e8651a'; roundRect(ctx,W*.18,H*.28,W*.64,H*.48,W*.15); ctx.fill();
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.ellipse(W*.5,H*.52,W*.14,H*.12,0,0,Math.PI*2); ctx.fill();
    // Ears
    ctx.fillStyle='#e8651a';
    ctx.beginPath(); ctx.moveTo(W*.2,H*.3); ctx.lineTo(W*.12,H*.08); ctx.lineTo(W*.38,H*.28); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W*.8,H*.3); ctx.lineTo(W*.88,H*.08); ctx.lineTo(W*.62,H*.28); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(W*.37,H*.43,W*.055,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(W*.63,H*.43,W*.055,0,Math.PI*2); ctx.fill();
    // Tail
    const fa=Math.sin(t*2.5)*0.2;
    ctx.strokeStyle='#e8651a'; ctx.lineWidth=W*.08; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(W*.82,H*.72); ctx.quadraticCurveTo(W*(1.1+fa*.1),H*.6,W*.9,H*.35); ctx.stroke();
    ctx.strokeStyle='#fff'; ctx.lineWidth=W*.04;
    ctx.beginPath(); ctx.moveTo(W*.82,H*.72); ctx.quadraticCurveTo(W*(1.08+fa*.1),H*.61,W*.9,H*.36); ctx.stroke();
  },
  '🐺': (ctx,W,H,t) => { // Вовк
    ctx.fillStyle='#7a8a9a'; roundRect(ctx,W*.17,H*.27,W*.66,H*.5,W*.13); ctx.fill();
    ctx.fillStyle='#c8d0d8'; ctx.beginPath(); ctx.ellipse(W*.5,H*.52,W*.15,H*.13,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#7a8a9a';
    ctx.beginPath(); ctx.moveTo(W*.2,H*.3); ctx.lineTo(W*.13,H*.07); ctx.lineTo(W*.4,H*.28); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W*.8,H*.3); ctx.lineTo(W*.87,H*.07); ctx.lineTo(W*.6,H*.28); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#f8d84a'; ctx.beginPath(); ctx.arc(W*.37,H*.42,W*.07,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(W*.63,H*.42,W*.07,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#222'; ctx.beginPath(); ctx.ellipse(W*.37,H*.42,W*.03,W*.05,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(W*.63,H*.42,W*.03,W*.05,0,0,Math.PI*2); ctx.fill();
    // Howl animation
    if(Math.sin(t*.8)>0.7){ ctx.fillStyle='#c8d0d8'; ctx.beginPath(); ctx.ellipse(W*.5,H*.62,W*.08,H*.1,0,0,Math.PI*2); ctx.fill(); }
  },
  '🐝': (ctx,W,H,t) => { // Бджола
    const by=Math.sin(t*8)*H*.03;
    ctx.fillStyle='#f8d84a'; ctx.beginPath(); ctx.ellipse(W*.5,H*.5+by,W*.2,H*.28,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#222'; for(let i=0;i<3;i++){ ctx.beginPath(); ctx.ellipse(W*.5,H*(.37+i*.12)+by,W*.2,H*.04,0,0,Math.PI*2); ctx.fill(); }
    ctx.fillStyle='rgba(200,240,255,0.7)';
    ctx.beginPath(); ctx.ellipse(W*.32,H*.35+by,W*.15,H*.09,-.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(W*.68,H*.35+by,W*.15,H*.09,.5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(W*.43,H*.4+by,W*.03,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(W*.57,H*.4+by,W*.03,0,Math.PI*2); ctx.fill();
  },
  '🐼': (ctx,W,H,t) => { // Панда
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.ellipse(W*.5,H*.55,W*.27,H*.25,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(W*.5,H*.38,W*.2,H*.18,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#222'; ctx.beginPath(); ctx.ellipse(W*.37,H*.38,W*.08,W*.09,-.3,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(W*.63,H*.38,W*.08,W*.09,.3,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(W*.37,H*.37,W*.04,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(W*.63,H*.37,W*.04,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(W*.37,H*.37,W*.02,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(W*.63,H*.37,W*.02,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(W*.3,H*.22,W*.07,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(W*.7,H*.22,W*.07,0,Math.PI*2); ctx.fill();
    // Bamboo
    const bsw=Math.sin(t*1.5)*0.05;
    ctx.strokeStyle='#4a8a4a'; ctx.lineWidth=W*.04;
    ctx.beginPath(); ctx.moveTo(W*(0.15+bsw),H*.9); ctx.lineTo(W*(0.2+bsw),H*.35); ctx.stroke();
  },
  '🦁': (ctx,W,H,t) => { // Лев
    ctx.fillStyle='#c8852a'; ctx.beginPath(); ctx.arc(W*.5,H*.45,W*.32,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#e8a84a'; ctx.beginPath(); ctx.arc(W*.5,H*.43,W*.2,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(W*.4,H*.4,W*.055,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(W*.6,H*.4,W*.055,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#e8857a'; ctx.beginPath(); ctx.arc(W*.5,H*.5,W*.06,0,Math.PI*2); ctx.fill();
    // Mane animate
    for(let i=0;i<8;i++){
      const a=i/8*Math.PI*2+t*.5; const r=W*.3+Math.sin(t*2+i)*.03*W;
      ctx.fillStyle='#a85a18'; ctx.beginPath(); ctx.ellipse(W*.5+Math.cos(a)*r,H*.43+Math.sin(a)*r*.8,W*.06,W*.1,a,0,Math.PI*2); ctx.fill();
    }
  },
  '🐲': (ctx,W,H,t) => { // Дракон
    ctx.fillStyle='#2a8a4a';
    ctx.beginPath(); ctx.ellipse(W*.5,H*.55,W*.25,H*.2,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(W*.5,H*.35,W*.2,H*.17,0,0,Math.PI*2); ctx.fill();
    // Wings
    const wa=Math.sin(t*4)*0.15;
    ctx.fillStyle='rgba(42,138,74,0.7)';
    ctx.beginPath(); ctx.moveTo(W*.3,H*.4); ctx.quadraticCurveTo(W*.05,H*(0.1-wa),W*.2,H*.55); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W*.7,H*.4); ctx.quadraticCurveTo(W*.95,H*(0.1-wa),W*.8,H*.55); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#f8d84a'; ctx.beginPath(); ctx.arc(W*.4,H*.32,W*.06,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(W*.6,H*.32,W*.06,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#e82a2a'; ctx.beginPath(); ctx.arc(W*.4,H*.32,W*.03,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(W*.6,H*.32,W*.03,0,Math.PI*2); ctx.fill();
    // Fire breath
    if(Math.sin(t*.7)>0.6){ ctx.fillStyle='rgba(248,100,20,0.8)'; ctx.beginPath(); ctx.ellipse(W*.5,H*.48,W*.07,H*.06,0,0,Math.PI*2); ctx.fill(); }
  },
  '🐟': (ctx,W,H,t) => { // Рибка
    const fy=Math.sin(t*3)*H*.04;
    ctx.fillStyle='#4a8ae8'; ctx.beginPath(); ctx.ellipse(W*.45,H*.5+fy,W*.25,H*.14,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#4a8ae8'; ctx.beginPath(); ctx.moveTo(W*.2,H*.5+fy); ctx.lineTo(W*.08,H*.38+fy); ctx.lineTo(W*.08,H*.62+fy); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(W*.63,H*.48+fy,W*.04,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(W*.64,H*.47+fy,W*.015,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.4)'; ctx.lineWidth=W*.015;
    ctx.beginPath(); ctx.arc(W*.45,H*.5+fy,W*.12,-.5,.5); ctx.stroke();
  },
  '🐠': (ctx,W,H,t) => { // Тропічна рибка
    const fy=Math.sin(t*2.5)*H*.03;
    ctx.fillStyle='#f87820'; ctx.beginPath(); ctx.ellipse(W*.45,H*.5+fy,W*.25,H*.15,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff'; for(let i=0;i<3;i++){ ctx.beginPath(); ctx.rect(W*(.3+i*.12),H*.36+fy,W*.03,H*.28); ctx.fill(); }
    ctx.fillStyle='#1a1afe'; ctx.beginPath(); ctx.arc(W*.63,H*.47+fy,W*.04,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#f87820'; ctx.beginPath(); ctx.moveTo(W*.2,H*.5+fy); ctx.lineTo(W*.06,H*.37+fy); ctx.lineTo(W*.06,H*.63+fy); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.ellipse(W*.39,H*.45+fy,W*.06,H*.06,-.3,0,Math.PI*2); ctx.fill();
  },
  '🦈': (ctx,W,H,t) => { // Акула
    const sa=Math.sin(t*2)*0.04;
    ctx.fillStyle='#5a7a9a'; ctx.beginPath(); ctx.ellipse(W*.48,H*.55,W*.35,H*.18,sa,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#e8e8f0'; ctx.beginPath(); ctx.ellipse(W*.5,H*.62,W*.2,H*.1,sa,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#5a7a9a'; ctx.beginPath(); ctx.moveTo(W*.5,H*.3); ctx.lineTo(W*.42,H*.42); ctx.lineTo(W*.58,H*.42); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#111'; ctx.beginPath(); ctx.arc(W*.62,H*.52,W*.04,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(W*.63,H*.51,W*.015,0,Math.PI*2); ctx.fill();
  },
  '🐙': (ctx,W,H,t) => { // Восьминіг
    ctx.fillStyle='#bf40bf'; ctx.beginPath(); ctx.arc(W*.5,H*.38,W*.22,0,Math.PI*2); ctx.fill();
    for(let i=0;i<8;i++){
      const a=i/8*Math.PI*2+Math.PI/8; const wave=Math.sin(t*3+i*.8)*.08;
      ctx.strokeStyle='#bf40bf'; ctx.lineWidth=W*.07; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(W*.5+Math.cos(a)*W*.18,H*.5+Math.sin(a)*H*.1);
      ctx.quadraticCurveTo(W*(.5+Math.cos(a)*.4+wave),H*(.6+Math.sin(a)*.25),W*(.5+Math.cos(a)*.38+wave*1.5),H*.85); ctx.stroke();
    }
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(W*.41,H*.33,W*.07,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(W*.59,H*.33,W*.07,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(W*.41,H*.34,W*.04,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(W*.59,H*.34,W*.04,0,Math.PI*2); ctx.fill();
  },
  '🚽': (ctx,W,H,t) => { // Унітаз
    ctx.fillStyle='#f0f0ff'; roundRect(ctx,W*.2,H*.3,W*.6,H*.55,W*.1); ctx.fill();
    ctx.strokeStyle='#ddd'; ctx.lineWidth=2; roundRect(ctx,W*.2,H*.3,W*.6,H*.55,W*.1); ctx.stroke();
    ctx.fillStyle='#e0e0ff'; roundRect(ctx,W*.15,H*.25,W*.7,H*.12,W*.06); ctx.fill();
    // Water ripple
    ctx.strokeStyle='rgba(100,150,255,0.4)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.ellipse(W*.5,H*.65,W*.2+Math.sin(t*2)*.02*W,H*.06,0,0,Math.PI*2); ctx.stroke();
  },
  '💩': (ctx,W,H,t) => { // Какашка
    ctx.fillStyle='#8B4513';
    ctx.beginPath(); ctx.ellipse(W*.5,H*.7,W*.25,H*.15,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(W*.5,H*.58,W*.18,H*.13,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(W*.5,H*.47,W*.12,H*.11,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(W*.5,H*.38,W*.07,H*.08,0,0,Math.PI*2); ctx.fill();
    // Flies
    const fa=t*4;
    ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(W*.3+Math.cos(fa)*W*.1,H*.3+Math.sin(fa)*.8*H*.1,W*.025,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(W*.7+Math.cos(fa+2)*W*.08,H*.25+Math.sin(fa+2)*.8*H*.1,W*.02,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#f0f';
    ctx.beginPath(); ctx.arc(W*.43,H*.42,W*.03,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(W*.57,H*.42,W*.03,0,Math.PI*2); ctx.fill();
  },
  '📱': (ctx,W,H,t) => { // Нокіа3310
    ctx.fillStyle='#1a3a6a'; roundRect(ctx,W*.25,H*.12,W*.5,H*.76,W*.08); ctx.fill();
    ctx.fillStyle='#2a5aaa'; roundRect(ctx,W*.32,H*.18,W*.36,H*.28,W*.04); ctx.fill();
    // Screen glow
    const gl=0.7+Math.sin(t*2)*.3;
    ctx.fillStyle=`rgba(100,200,100,${gl})`; ctx.font=`bold ${W*.12}px monospace`; ctx.textAlign='center';
    ctx.fillText('NOKIA',W*.5,H*.38);
    ctx.fillStyle='#3a3a3a'; roundRect(ctx,W*.3,H*.52,W*.12,H*.1,W*.03); ctx.fill();
    roundRect(ctx,W*.44,H*.52,W*.12,H*.1,W*.03); ctx.fill();
    roundRect(ctx,W*.58,H*.52,W*.12,H*.1,W*.03); ctx.fill();
    roundRect(ctx,W*.3,H*.64,W*.12,H*.1,W*.03); ctx.fill();
    roundRect(ctx,W*.44,H*.64,W*.12,H*.1,W*.03); ctx.fill();
    roundRect(ctx,W*.58,H*.64,W*.12,H*.1,W*.03); ctx.fill();
  },
  '🤡': (ctx,W,H,t) => { // Клоун
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(W*.5,H*.42,W*.22,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#e82a2a'; ctx.beginPath(); ctx.arc(W*.5,H*.22,W*.18,Math.PI,0); ctx.fill();
    ctx.beginPath(); ctx.arc(W*.28,H*.18,W*.06,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(W*.72,H*.18,W*.06,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#f8d84a'; ctx.beginPath(); ctx.arc(W*.5,H*.22,W*.18,0,Math.PI); ctx.fill();
    // Eyes
    ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(W*.4,H*.39,W*.05,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(W*.6,H*.39,W*.05,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#e82a2a'; ctx.beginPath(); ctx.arc(W*.5,H*.47,W*.05,0,Math.PI*2); ctx.fill();
    // Bow tie
    ctx.fillStyle='#e82a4a'; ctx.beginPath(); ctx.moveTo(W*.35,H*.65); ctx.lineTo(W*.5,H*.7); ctx.lineTo(W*.65,H*.65); ctx.lineTo(W*.5,H*.6); ctx.closePath(); ctx.fill();
    // Bounce
    const by=Math.abs(Math.sin(t*2))*H*.04;
    ctx.fillStyle='rgba(232,42,42,0.3)'; ctx.beginPath(); ctx.ellipse(W*.5,H*.88+by,W*.15,H*.03,0,0,Math.PI*2); ctx.fill();
  },
  '🗑️': (ctx,W,H,t) => { // Смітник
    ctx.fillStyle='#5a6a7a'; roundRect(ctx,W*.2,H*.3,W*.6,H*.6,W*.06); ctx.fill();
    ctx.strokeStyle='#4a5a6a'; ctx.lineWidth=W*.04;
    for(let i=0;i<3;i++){ ctx.beginPath(); ctx.moveTo(W*(.35+i*.15),H*.38); ctx.lineTo(W*(.35+i*.15),H*.84); ctx.stroke(); }
    ctx.fillStyle='#6a7a8a'; roundRect(ctx,W*.15,H*.24,W*.7,H*.1,W*.04); ctx.fill();
    roundRect(ctx,W*.35,H*.16,W*.3,H*.1,W*.04); ctx.fill();
    // Smell waves
    const sw=Math.sin(t*3);
    ctx.strokeStyle='rgba(100,200,50,0.5)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(W*.3,H*.2); ctx.quadraticCurveTo(W*.25,H*(.12+sw*.02),W*.3,H*.05); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W*.5,H*.18); ctx.quadraticCurveTo(W*.45,H*(.1+sw*.02),W*.5,H*.03); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W*.7,H*.2); ctx.quadraticCurveTo(W*.65,H*(.12+sw*.02),W*.7,H*.05); ctx.stroke();
  },
  // === НОВІ ВЕЛИКОДНІ ПЕТИ ===
  '🌙🐑': (ctx,W,H,t) => { // Місячний баранчик
    // Starry sky body
    const grd=ctx.createRadialGradient(W*.5,H*.55,0,W*.5,H*.55,W*.3);
    grd.addColorStop(0,'#1a2a5a'); grd.addColorStop(1,'#0a1030');
    ctx.fillStyle=grd; ctx.beginPath(); ctx.ellipse(W*.5,H*.57,W*.28,H*.22,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(W*.5,H*.38,W*.2,H*.18,0,0,Math.PI*2); ctx.fill();
    // Stars
    ctx.fillStyle='#fff';
    [[.4,.55],[.6,.52],[.5,.65],[.35,.62],[.65,.6],[.45,.45]].forEach(([sx,sy])=>{
      const ss=0.6+Math.sin(t*3+sx*10)*.4;
      ctx.globalAlpha=ss; ctx.beginPath(); ctx.arc(W*sx,H*sy,W*.015,0,Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha=1;
    // Crescent horns
    ctx.strokeStyle='#c8d0f0'; ctx.lineWidth=W*.04; ctx.lineCap='round';
    ctx.beginPath(); ctx.arc(W*.35,H*.18,W*.1,Math.PI,Math.PI*.3); ctx.stroke();
    ctx.beginPath(); ctx.arc(W*.65,H*.18,W*.1,Math.PI*.7,0); ctx.stroke();
    // Eyes
    ctx.fillStyle='#f8f8ff'; ctx.beginPath(); ctx.arc(W*.41,H*.36,W*.05,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(W*.59,H*.36,W*.05,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#8080ff'; ctx.beginPath(); ctx.arc(W*.41,H*.36,W*.03,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(W*.59,H*.36,W*.03,0,Math.PI*2); ctx.fill();
    // Star on forehead
    const sp=0.7+Math.sin(t*4)*.3;
    ctx.fillStyle=`rgba(255,240,100,${sp})`; ctx.font=`${W*.12}px serif`; ctx.textAlign='center'; ctx.fillText('★',W*.5,H*.28);
  },
  '🌙🐇': (ctx,W,H,t) => { // Місячний заєць
    // Semi-transparent dark blue body
    ctx.globalAlpha=0.85;
    const grd=ctx.createLinearGradient(W*.2,H*.2,W*.8,H*.8);
    grd.addColorStop(0,'#1a2a6a'); grd.addColorStop(1,'#0a0a3a');
    ctx.fillStyle=grd;
    ctx.beginPath(); ctx.ellipse(W*.5,H*.6,W*.25,H*.22,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(W*.5,H*.38,W*.18,H*.17,0,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=1;
    // Comet ears
    const et=t*.8;
    ctx.fillStyle='rgba(80,120,220,0.9)';
    ctx.beginPath(); ctx.moveTo(W*.35,H*.24); ctx.bezierCurveTo(W*.28,H*.05,W*.1,H*(-.1+Math.sin(et)*.05),W*.22,H*.22); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W*.65,H*.24); ctx.bezierCurveTo(W*.72,H*.05,W*.9,H*(-.1+Math.sin(et+1)*.05),W*.78,H*.22); ctx.closePath(); ctx.fill();
    // Stars inside body
    ctx.fillStyle='rgba(200,220,255,0.8)';
    [[.38,.55],[.55,.63],[.62,.5],[.45,.7],[.5,.42]].forEach(([sx,sy])=>{
      ctx.globalAlpha=0.5+Math.sin(t*2+sx*8)*.5;
      ctx.beginPath(); ctx.arc(W*sx,H*sy,W*.012,0,Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha=1;
    ctx.fillStyle='#e0e8ff'; ctx.beginPath(); ctx.arc(W*.42,H*.36,W*.05,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(W*.58,H*.36,W*.05,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#4060ff'; ctx.beginPath(); ctx.arc(W*.42,H*.36,W*.03,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(W*.58,H*.36,W*.03,0,Math.PI*2); ctx.fill();
  },
  '🍩🐹': (ctx,W,H,t) => { // Пончик-хом'як
    // Donut body
    ctx.fillStyle='#c8784a';
    ctx.beginPath(); ctx.arc(W*.5,H*.5,W*.28,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#f8d0a0'; // Glaze
    ctx.beginPath(); ctx.arc(W*.5,H*.5,W*.22,0,Math.PI*2); ctx.fill();
    // Strawberry jam drip
    ctx.fillStyle='#e82040';
    ctx.beginPath(); ctx.arc(W*.5,H*.5,W*.22,-.5,.5); ctx.fill();
    ctx.beginPath(); ctx.ellipse(W*.68,H*.56,W*.05,H*.07,0,0,Math.PI*2); ctx.fill();
    // Hole
    ctx.fillStyle='var(--bg,#050710)';
    ctx.beginPath(); ctx.arc(W*.5,H*.5,W*.1,0,Math.PI*2); ctx.fill();
    // Face on top
    ctx.fillStyle='#c8784a'; ctx.beginPath(); ctx.ellipse(W*.5,H*.3,W*.15,H*.13,0,0,Math.PI*2); ctx.fill();
    // Cheeks
    ctx.fillStyle='#f8a890'; ctx.beginPath(); ctx.ellipse(W*.37,H*.35,W*.05,W*.04,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(W*.63,H*.35,W*.05,W*.04,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(W*.43,H*.28,W*.03,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(W*.57,H*.28,W*.03,0,Math.PI*2); ctx.fill();
    // Sprinkles bounce
    const sp=['#e82a2a','#2a8ae8','#2ae83a','#f8d84a','#e82ae8'];
    sp.forEach((c,i)=>{
      ctx.fillStyle=c; ctx.save(); ctx.translate(W*(.3+i*.1),H*(.42+Math.sin(t*3+i)*.02));
      ctx.rotate(i*.8); ctx.fillRect(-W*.02,-W*.01,W*.04,W*.015); ctx.restore();
    });
  },
  '🍯🐻': (ctx,W,H,t) => { // Медовий пасхальний ведмідь
    // Honey body glow
    const gl=0.85+Math.sin(t*2)*.15;
    ctx.fillStyle=`rgba(255,${Math.floor(180+gl*30)},20,${gl})`;
    ctx.beginPath(); ctx.ellipse(W*.5,H*.6,W*.28,H*.22,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(W*.5,H*.38,W*.2,H*.18,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=`rgba(255,200,30,${gl})`;
    ctx.beginPath(); ctx.arc(W*.3,H*.22,W*.09,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(W*.7,H*.22,W*.09,0,Math.PI*2); ctx.fill();
    // Honey drip
    ctx.fillStyle='rgba(255,160,0,0.8)';
    const ht=Math.sin(t*1.5)*.05;
    ctx.beginPath(); ctx.moveTo(W*.42,H*.28); ctx.quadraticCurveTo(W*.4,H*(.45+ht),W*.42,H*(.52+ht)); ctx.quadraticCurveTo(W*.44,H*(.56+ht),W*.46,H*(.52+ht)); ctx.quadraticCurveTo(W*.44,H*(.38+ht),W*.46,H*.28); ctx.fill();
    // Eggshell hat
    ctx.fillStyle='#f8e8d0'; ctx.beginPath(); ctx.ellipse(W*.5,H*.16,W*.15,H*.08,0,Math.PI,0); ctx.fill();
    ctx.strokeStyle='#e82a4a'; ctx.lineWidth=2;
    for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(W*(.37+i*.09),H*.12);ctx.lineTo(W*(.37+i*.09),H*.2);ctx.stroke();}
    // Easter bee in paw
    ctx.fillStyle='#f8d84a'; ctx.beginPath(); ctx.ellipse(W*.78,H*.6,W*.08,W*.06,-.3,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#222'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(W*.71,H*.58); ctx.lineTo(W*.85,H*.58); ctx.stroke();
    // Eyes
    ctx.fillStyle='#5a2a0a'; ctx.beginPath(); ctx.arc(W*.42,H*.36,W*.04,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(W*.58,H*.36,W*.04,0,Math.PI*2); ctx.fill();
  },
  '🔥🥚': (ctx,W,H,t) => { // Фенікс-писанка
    // Egg
    const eg=ctx.createRadialGradient(W*.5,H*.45,W*.05,W*.5,H*.5,W*.28);
    eg.addColorStop(0,'#fff8e0'); eg.addColorStop(0.5,'#f8c830'); eg.addColorStop(1,'#e87820');
    ctx.fillStyle=eg; ctx.beginPath(); ctx.ellipse(W*.5,H*.5,W*.2,H*.27,0,0,Math.PI*2); ctx.fill();
    // Embroidery pattern
    ctx.strokeStyle='#e82a2a'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.ellipse(W*.5,H*.5,W*.2,H*.27,0,Math.PI*.3,Math.PI*.9); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(W*.5,H*.5,W*.2,H*.27,0,Math.PI*1.3,Math.PI*1.9); ctx.stroke();
    ctx.strokeStyle='#2a5ae8'; ctx.lineWidth=1.5;
    for(let i=0;i<5;i++){
      const a=i/5*Math.PI*2; ctx.beginPath();
      ctx.moveTo(W*.5+Math.cos(a)*W*.08,H*.5+Math.sin(a)*H*.12);
      ctx.lineTo(W*.5+Math.cos(a)*W*.18,H*.5+Math.sin(a)*H*.24); ctx.stroke();
    }
    // Phoenix emerging
    const py=Math.sin(t*2)*H*.02;
    ctx.fillStyle='#f87820'; ctx.beginPath(); ctx.ellipse(W*.5,H*.18+py,W*.08,H*.1,0,0,Math.PI*2); ctx.fill();
    // Wings
    ctx.fillStyle='rgba(248,180,20,0.8)';
    ctx.beginPath(); ctx.moveTo(W*.5,H*.2+py); ctx.quadraticCurveTo(W*.2,H*(.1+py),W*.15,H*.35+py); ctx.quadraticCurveTo(W*.3,H*.25+py,W*.4,H*.28+py); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W*.5,H*.2+py); ctx.quadraticCurveTo(W*.8,H*(.1+py),W*.85,H*.35+py); ctx.quadraticCurveTo(W*.7,H*.25+py,W*.6,H*.28+py); ctx.closePath(); ctx.fill();
    // Tail - embroidered
    ctx.strokeStyle='#e82a2a'; ctx.lineWidth=W*.02;
    for(let i=0;i<5;i++){
      const ta=i/5*Math.PI+Math.PI*.6+Math.sin(t*2+i)*.1;
      ctx.beginPath(); ctx.moveTo(W*.5,H*.3+py); ctx.lineTo(W*.5+Math.cos(ta)*W*.3,H*.3+py+Math.sin(ta)*H*.25); ctx.stroke();
    }
    // Fire
    for(let i=0;i<6;i++){
      const fa=t*3+i; const fc=`hsl(${30+i*10},100%,${50+i*5}%)`;
      ctx.fillStyle=fc; ctx.globalAlpha=0.7;
      ctx.beginPath(); ctx.ellipse(W*(.35+i*.06),H*.85,W*.03,H*(.08+Math.sin(fa)*.03),0,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;
  },
  '👻🐰': (ctx,W,H,t) => { // Привид пасхи
    // Ghost rabbit body - translucent
    ctx.globalAlpha=0.75+Math.sin(t*2)*.15;
    const gg=ctx.createRadialGradient(W*.5,H*.5,0,W*.5,H*.5,W*.35);
    gg.addColorStop(0,'rgba(255,255,255,0.9)'); gg.addColorStop(1,'rgba(200,230,255,0.3)');
    ctx.fillStyle=gg;
    ctx.beginPath(); ctx.moveTo(W*.25,H*.85); ctx.lineTo(W*.2,H*.4);
    ctx.quadraticCurveTo(W*.2,H*.2,W*.5,H*.2); ctx.quadraticCurveTo(W*.8,H*.2,W*.8,H*.4);
    ctx.lineTo(W*.75,H*.85); ctx.quadraticCurveTo(W*.65,H*.78,W*.5,H*.85);
    ctx.quadraticCurveTo(W*.35,H*.78,W*.25,H*.85); ctx.closePath(); ctx.fill();
    // Ghost ears
    ctx.beginPath(); ctx.moveTo(W*.35,H*.22); ctx.quadraticCurveTo(W*.3,H*.03,W*.4,H*.18); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W*.65,H*.22); ctx.quadraticCurveTo(W*.7,H*.03,W*.6,H*.18); ctx.closePath(); ctx.fill();
    ctx.globalAlpha=1;
    // Glowing eyes
    const egel=0.6+Math.sin(t*3)*.4;
    ctx.fillStyle=`rgba(100,220,255,${egel})`; ctx.beginPath(); ctx.arc(W*.4,H*.42,W*.06,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(W*.6,H*.42,W*.06,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(W*.41,H*.41,W*.02,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(W*.61,H*.41,W*.02,0,Math.PI*2); ctx.fill();
    // Glowing basket
    ctx.globalAlpha=0.6+Math.sin(t*2)*.2;
    ctx.fillStyle='rgba(200,220,255,0.7)'; roundRect(ctx,W*.35,H*.6,W*.3,H*.2,W*.04); ctx.fill();
    ctx.globalAlpha=1;
    // Easter eggs in basket (glowing)
    ['rgba(255,100,100,0.8)','rgba(100,255,100,0.8)','rgba(100,100,255,0.8)'].forEach((c,i)=>{
      ctx.fillStyle=c; ctx.globalAlpha=0.7;
      ctx.beginPath(); ctx.ellipse(W*(.42+i*.08),H*.68,W*.03,W*.04,0,0,Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha=1;
    // Float animation handled by canvas translate offset
  },
};

function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
}

// Map emoji → draw key
const PET_KEY_MAP = {
  '🐶':'🐶','🐱':'🐱','🐰':'🐰','🦊':'🦊','🐺':'🐺','🐝':'🐝','🐼':'🐼',
  '🦁':'🦁','🐲':'🐲','🐟':'🐟','🐠':'🐠','🦈':'🦈','🐙':'🐙',
  '🚽':'🚽','💩':'💩','📱':'📱','🤡':'🤡','🗑️':'🗑️',
  'moonlamb':'🌙🐑','moonhare':'🌙🐇','donutham':'🍩🐹',
  'honeybear':'🍯🐻','phoenixegg':'🔥🥚','easterghost':'👻🐰',
};

// Canvas pet card renderer (for case roulette and result)
// ============================================================
// СИСТЕМА ВІДОБРАЖЕННЯ ПЕТІВ — CSS картки з анімацією
// ============================================================
// Замість поганих canvas-малюнків використовуємо красиві CSS картки
// з великими емодзі, фонами і анімаціями

// Емодзі для відображення (підтримка складених емодзі)
function getPetEmoji(pet) {
  const emojiMap = {
    'moonlamb':    '🌙🐑', 'moonhare':   '🌙🐇',
    'donutham':    '🍩🐹', 'honeybear':  '🍯🐻',
    'phoenixegg':  '🔥🥚', 'easterghost':'👻🐰',
  };
  return emojiMap[pet.drawKey] || pet.s;
}

// Фонові градієнти для кожної рідкості
const RARITY_BG = {
  'Звичайний':   'linear-gradient(135deg,#1e2433,#141820)',
  'Незвичайний': 'linear-gradient(135deg,#0f1e35,#0a1225)',
  'Рідкісний':   'linear-gradient(135deg,#1a0f2e,#0d0a20)',
  'Епічний':     'linear-gradient(135deg,#2a1800,#1a0f00)',
  'Легендарний': 'linear-gradient(135deg,#2a0a0a,#180505)',
  'Міфічний':    'linear-gradient(135deg,#001a2a,#000f18)',
  'Смехуятина':  'linear-gradient(135deg,#2a1000,#1a0800)',
};

// Анімації для різних рідкостей
const RARITY_ANIM = {
  'Звичайний':   '',
  'Незвичайний': 'pet-float',
  'Рідкісний':   'pet-float',
  'Епічний':     'pet-pulse',
  'Легендарний': 'pet-pulse',
  'Міфічний':    'pet-glow-anim',
  'Смехуятина':  'pet-bounce',
};

// Малюємо пета як HTML-елемент (не canvas)
function createPetCardHTML(pet, size=80, showInfo=false) {
  const emoji   = getPetEmoji(pet);
  const glow    = RARITY_GLOW[pet.r] || '#94a3b8';
  const bg      = RARITY_BG[pet.r]   || RARITY_BG['Звичайний'];
  const anim    = RARITY_ANIM[pet.r] || '';
  const emojiSize = Math.round(size * 0.52);
  const particles = makeRarityParticles(pet.r, glow);

  return `<div class="pet-visual" style="
    width:${size}px;height:${size}px;
    background:${bg};
    border-radius:${Math.round(size*0.18)}px;
    border:2px solid ${glow};
    box-shadow:0 0 ${Math.round(size*.2)}px ${glow}55, inset 0 0 ${Math.round(size*.15)}px ${glow}11;
    display:flex;align-items:center;justify-content:center;
    position:relative;overflow:hidden;flex-shrink:0;
  ">
    ${particles}
    <span style="font-size:${emojiSize}px;line-height:1;position:relative;z-index:1;${anim?`animation:${anim} 2s ease-in-out infinite`:''}">${emoji}</span>
  </div>`;
}

// Часточки/декор для рідкісних петів
function makeRarityParticles(rarity, color) {
  if (['Звичайний','Незвичайний'].includes(rarity)) return '';
  const count = rarity==='Mythic'||rarity==='Міфічний' ? 8 : 5;
  let html = '';
  for (let i=0; i<count; i++) {
    const x = 10+Math.random()*80, y = 10+Math.random()*80;
    const delay = (i*0.3).toFixed(1);
    const size  = 2+Math.random()*3;
    html += `<div style="
      position:absolute;left:${x}%;top:${y}%;
      width:${size}px;height:${size}px;
      background:${color};border-radius:50%;
      animation:particle-twinkle 2s ${delay}s ease-in-out infinite;
      opacity:0;
    "></div>`;
  }
  return html;
}

// Для canvas у кейс-рулетці (залишаємо canvas але з великим емодзі)
function drawPetCard(canvas, pet) {
  const ctx = canvas.getContext('2d');
  const W   = canvas.width, H = canvas.height;
  const dpr = window.devicePixelRatio || 1;
  ctx.clearRect(0,0,W,H);

  const glow = RARITY_GLOW[pet.r] || '#94a3b8';
  const bg   = ctx.createLinearGradient(0,0,W,H);

  // Фон залежно від рідкості
  const bgColors = {
    'Звичайний':   ['#1e2433','#141820'],
    'Незвичайний': ['#0f1e35','#0a1225'],
    'Рідкісний':   ['#1a0f2e','#0d0a20'],
    'Епічний':     ['#2a1800','#1a0f00'],
    'Легендарний': ['#2a0a0a','#180505'],
    'Міфічний':    ['#001a2a','#000f18'],
    'Смехуятина':  ['#2a1000','#1a0800'],
  };
  const [c1,c2] = bgColors[pet.r] || bgColors['Звичайний'];
  bg.addColorStop(0,c1); bg.addColorStop(1,c2);
  ctx.fillStyle = bg;
  roundRect(ctx,0,0,W,H,10); ctx.fill();

  // Glow border
  ctx.shadowColor  = glow;
  ctx.shadowBlur   = 12;
  ctx.strokeStyle  = glow;
  ctx.lineWidth    = 2;
  roundRect(ctx,1,1,W-2,H-2,10); ctx.stroke();
  ctx.shadowBlur   = 0;

  // Зірочки/частинки для рідкісних
  if (!['Звичайний','Незвичайний'].includes(pet.r)) {
    ctx.fillStyle = glow;
    for (let i=0; i<6; i++) {
      const px = W*(0.1+Math.random()*0.8), py = H*(0.1+Math.random()*0.6);
      const ps = 1.5+Math.random()*2;
      ctx.globalAlpha = 0.4+Math.random()*0.4;
      ctx.beginPath(); ctx.arc(px,py,ps,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ВЕЛИКЕ ЕМОДЗІ — центр картки
  const emoji = getPetEmoji(pet);
  const emojiSize = Math.floor(H * 0.48);
  ctx.font = `${emojiSize}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, W/2, H*0.44);

  // Назва
  ctx.font = `bold ${Math.max(10, Math.floor(H*0.12))}px system-ui`;
  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'alphabetic';
  const name = pet.n.length > 9 ? pet.n.slice(0,9)+'…' : pet.n;
  ctx.fillText(name, W/2, H*0.82);

  // Рідкість
  ctx.font = `bold ${Math.max(8, Math.floor(H*0.09))}px system-ui`;
  ctx.fillStyle = glow;
  ctx.fillText(pet.r, W/2, H*0.94);
}

// Анімовані картки в інвентарі — через CSS div замість canvas
const petAnimFrames = new Map();

function startPetAnim(containerId, pet) {
  // Для HUD canvas — залишаємо простий canvas
  if (containerId === 'p-hud-canvas') {
    const canvas = document.getElementById(containerId);
    if (!canvas) return;
    if (petAnimFrames.has(containerId)) cancelAnimationFrame(petAnimFrames.get(containerId));
    const ctx = canvas.getContext('2d');
    const W=canvas.width, H=canvas.height;
    const glow = RARITY_GLOW[pet.r]||'#94a3b8';
    const emoji = getPetEmoji(pet);
    let startT=null;
    function frame(ts) {
      if(!startT) startT=ts;
      const t=(ts-startT)/1000;
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle='#1a1f2e'; roundRect(ctx,0,0,W,H,10); ctx.fill();
      ctx.shadowColor=glow; ctx.shadowBlur=8;
      ctx.strokeStyle=glow; ctx.lineWidth=2;
      roundRect(ctx,1,1,W-2,H-2,10); ctx.stroke(); ctx.shadowBlur=0;
      const scale = 1+Math.sin(t*2)*0.04;
      ctx.save(); ctx.translate(W/2,H/2); ctx.scale(scale,scale);
      ctx.font=`${Math.floor(W*.6)}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(emoji,0,0); ctx.restore();
      petAnimFrames.set(containerId, requestAnimationFrame(frame));
    }
    petAnimFrames.set(containerId, requestAnimationFrame(frame));
    return;
  }
  // Для інвентарю — вставляємо HTML div
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = createPetCardHTML(pet, container.dataset.size||80);
}

function stopAllPetAnims() {
  petAnimFrames.forEach(id=>cancelAnimationFrame(id));
  petAnimFrames.clear();
}


// ============================================================
// КЕЙСИ
// ============================================================
const DEADLINE_EASTER_CASE = new Date("2026-04-14T00:00:00+03:00").getTime();

const CASES = {
    basic:    { n:"Common Case 🐾", p:285, drop:[
        {n:'Собака',s:'🐶',r:'Звичайний',  m:1.05,w:40,c:'#94a3b8'},
        {n:'Кіт',   s:'🐱',r:'Звичайний',  m:1.05,w:40,c:'#94a3b8'},
        {n:'Кролик',s:'🐰',r:'Незвичайний',m:1.08,w:20,c:'#3b82f6'}]},
    uncommon: { n:"Rare Case 🌟",   p:525, drop:[
        {n:'Кролик',s:'🐰',r:'Незвичайний',m:1.08,w:46,c:'#3b82f6'},
        {n:'Лисиця',s:'🦊',r:'Незвичайний',m:1.09,w:40,c:'#3b82f6'},
        {n:'Вовк',  s:'🐺',r:'Рідкісний',  m:1.11,w:14,c:'#a855f7'}]},
    rare:     { n:"Epic Case 💎",   p:875, drop:[
        {n:'Вовк',  s:'🐺',r:'Рідкісний',  m:1.11,w:50,c:'#a855f7'},
        {n:'Бджола',s:'🐝',r:'Рідкісний',  m:1.12,w:40,c:'#a855f7'},
        {n:'Панда', s:'🐼',r:'Епічний',    m:1.14,w:10,c:'#f59e0b'}]},
    legend:   { n:"Legendary Case 👑", p:1200, drop:[
        {n:'Панда', s:'🐼',r:'Епічний',    m:1.14,w:56,c:'#f59e0b'},
        {n:'Лев',   s:'🦁',r:'Легендарний',m:1.16,w:24,c:'#f43f5e'},
        {n:'Дракон',s:'🐲',r:'Легендарний',m:1.17,w:20,c:'#f43f5e'}]},
    easter:   { n:"Великодній Кейс 🥚", p:1450, limited:true, deadline:DEADLINE_EASTER_CASE, drop:[
        {n:'Місячний заєць',   s:'🌙🐇',r:'Рідкісний',  m:1.165,w:33,c:'#a855f7',drawKey:'moonhare'},
        {n:'Місячний баранчик',s:'🌙🐑',r:'Рідкісний',  m:1.165,w:33,c:'#a855f7',drawKey:'moonlamb'},
        {n:'Пончик-хом\'як',   s:'🍩🐹',r:'Епічний',    m:1.22, w:20,c:'#f59e0b',drawKey:'donutham'},
        {n:'Фенікс-писанка',   s:'🔥🥚',r:'Легендарний',m:1.26, w:10,c:'#f43f5e',drawKey:'phoenixegg'},
        {n:'Привид пасхи',     s:'👻🐰',r:'Міфічний',   m:1.33, w:4, c:'#06b6d4',drawKey:'easterghost'}]},
};

const ADMIN_ONLY_PETS = [
    {n:'Клоун',              s:'🤡',r:'Смехуятина', m:1.67, c:'#ff6b35'},
    {n:'Смітник',            s:'🗑️',r:'Легендарний',m:1.35, c:'#f43f5e'},
    {n:'Медовий пасх. медвідь',s:'🍯🐻',r:'Епічний',m:1.25, c:'#f59e0b',drawKey:'honeybear'},
];

// ============================================================
// ТЕМИ
// ============================================================
const THEMES = {
    gold:   {name:'🏆 Золото',  a:'#f59e0b',a2:'#fbbf24',bg:'#050710',btnTxt:'#000'},
    blue:   {name:'💎 Сапфір',  a:'#58a6ff',a2:'#93c5fd',bg:'#030812',btnTxt:'#fff'},
    purple: {name:'🔮 Аметист', a:'#a855f7',a2:'#c084fc',bg:'#070510',btnTxt:'#fff'},
    green:  {name:'🌿 Смарагд', a:'#22c55e',a2:'#4ade80',bg:'#030c06',btnTxt:'#000'},
    red:    {name:'🔥 Рубін',   a:'#ef4444',a2:'#f87171',bg:'#0c0303',btnTxt:'#fff'},
    easter: {name:'🐣 Великдень',a:'#e879a0',a2:'#fbbf24',bg:'#0a0518',btnTxt:'#fff'},
};
let currentTheme = localStorage.getItem('bc_theme') || 'easter';
let currentLang  = localStorage.getItem('bc_lang')  || 'uk';

function applyTheme(key) {
    const t=THEMES[key]||THEMES.easter;
    const r=document.documentElement.style;
    r.setProperty('--accent', t.a); r.setProperty('--accent2',t.a2);
    r.setProperty('--bg', t.bg);    r.setProperty('--btn-txt',t.btnTxt);
    const logo=document.querySelector('.logo');
    if(logo) logo.style.backgroundImage=`linear-gradient(90deg,${t.a},${t.a2},${t.a},${t.a2},${t.a})`;
    currentTheme=key; localStorage.setItem('bc_theme',key);
}

// ============================================================
// МОВА
// ============================================================
const LANGS = {
    uk:{
        chooseGame:'ОБЕРИ ГРУ',betLbl:'СТАВКА',betBtn:'ЗРОБИТИ СТАВКУ',
        win:'Переміг!',lose:'Програв!',waiting:'⏳ Очікування...',
        spinning:'🎰 Крутимо...',openCells:'⚡ Відкривай клітинки!',
        chooseDoor:'🚪 Обирай двері без кролика!',tapBalloon:'🎈 Тисни на яйце!',
        minesBoom:'Бум! Міна!',clownBoom:'За тою дверью був кролик!',
        allRounds:'Виграв всі 4 раунди!',balloonBoom:'Яйце луснуло!',
        take:'💰 ЗАБРАТИ',round:'РАУНД',prize:'Приз:',
        myPets:'🎒 МОЇ ПЕТИ',leaders:'🏆 ЛІДЕРИ',admin:'⚡ АДМІН',
        settings:'⚙️ Налаштування',theme:'Тема',lang:'Мова',
        invEmpty:'Інвентар порожній',invEmptySub:'Відкривай кейси в магазині!',
        loading:'Завантаження...',marketEmpty:'На ринку порожньо',
        saved:'✅ Збережено!',chosen:'ВИБРАНЕ ЧИСЛО',
        g_f50:'⚖️ 50/50 (x1.55)',g_dice:'🎲 Кубик (x2.05)',
        g_wheel:'🎡 Колесо (до x1.6)',g_slots:'🎰 Слоти (до x5.0)',
        g_mines:'💣 Міни (до x4.0)',
        g_clown:'🐰 Двері Великодня (до x2.4)',
        g_balloon:'🥚 Яйце Удачі (до x2.5)',
        g_bj:'🃏 Блекджек (x2.0)',
        g_pvp:'⚔️ Бій Крашанками',
        g_plinko:'🥚 Кошик Удачі (Plinko)',
        expired:'Ця гра вже недоступна',
        navShop:'📦',navInv:'🎒',navTop:'🏆',navSet:'⚙️',
        tabCases:'📦 Кейси',tabMarket:'🛒 Ринок',
        dealer:'ДИЛЕР',you:'ВИ',hit:'ЩЕ',stand:'СТОП',
        bonusLabel:'БОНУС',lvlLabel:'LVL',
        adminBalance:'Баланс',adminPets:'Пети',adminInv:'Інвентар',
        equip:'Взяти',equipped:'✅',bonusWord:'Бонус',
        roundsAndMults:'РАУНДИ ТА МНОЖНИКИ',pressToStart:'Натисни ЗРОБИТИ СТАВКУ щоб почати',
        popsCount:'Лопань:',bjBust:'Перебір!',bjWin:'Виграш!',bjLose:'Програш',
        anon:'Анонім',petsCount:'Петів:',viewInv:'🎒 Переглянути',empty:'Порожньо',
        activePet:'Активний',confirmDelete:'Видалити',given:'Видано!',
        invCountLabel:'ПЕТІВ',balloonPopsLabel:'Лопань:',
        back:'← Назад',petsOf:'петів',noPet:'Обери пета',noPetRarity:'НЕМАЄ',
        bonusLabelHud:'БОНУС',openingCase:'ВІДКРИВАЄМО...',
        music:'Музика',musicOn:'🔊 Увімк.',musicOff:'🔇 Вимк.',
        pvpTitle:'⚔️ БІЙ КРАШАНКАМИ',pvpSelect:'Обери зону захисту',
        pvpAttack:'Обери куди бити',pvpTop:'Верх',pvpSide:'Боки',pvpBot:'Низ',
        pvpFight:'⚔️ БИТИСЯ!',pvpCommission:'Комісія казино: 5%',
        plinkoTitle:'🥚 КОШИК УДАЧІ',plinkoDrop:'КИНУТИ ЯЙЦЕ',
    },
    en:{
        chooseGame:'CHOOSE GAME',betLbl:'BET',betBtn:'PLACE BET',
        win:'Won!',lose:'Lost!',waiting:'⏳ Waiting...',
        spinning:'🎰 Spinning...',openCells:'⚡ Open cells!',
        chooseDoor:'🚪 Pick a door without the bunny!',tapBalloon:'🎈 Tap the egg!',
        minesBoom:'Boom! Mine!',clownBoom:'The bunny was behind that door!',
        allRounds:'Won all 4 rounds!',balloonBoom:'The egg cracked!',
        take:'💰 TAKE',round:'ROUND',prize:'Prize:',
        myPets:'🎒 MY PETS',leaders:'🏆 LEADERS',admin:'⚡ ADMIN',
        settings:'⚙️ Settings',theme:'Theme',lang:'Language',
        invEmpty:'Inventory empty',invEmptySub:'Open cases in the shop!',
        loading:'Loading...',marketEmpty:'Market is empty',
        saved:'✅ Saved!',chosen:'CHOSEN NUMBER',
        g_f50:'⚖️ 50/50 (x1.55)',g_dice:'🎲 Dice (x2.05)',
        g_wheel:'🎡 Wheel (up to x1.6)',g_slots:'🎰 Slots (up to x5.0)',
        g_mines:'💣 Mines (up to x4.0)',
        g_clown:'🐰 Easter Doors (up to x2.4)',
        g_balloon:'🥚 Lucky Egg (up to x2.5)',
        g_bj:'🃏 Blackjack (x2.0)',
        g_pvp:'⚔️ Egg Battle',
        g_plinko:'🥚 Easter Plinko',
        expired:'This game is no longer available',
        navShop:'📦',navInv:'🎒',navTop:'🏆',navSet:'⚙️',
        tabCases:'📦 Cases',tabMarket:'🛒 Market',
        dealer:'DEALER',you:'YOU',hit:'HIT',stand:'STAND',
        bonusLabel:'BONUS',lvlLabel:'LVL',
        adminBalance:'Balance',adminPets:'Pets',adminInv:'Inventory',
        equip:'Equip',equipped:'✅',bonusWord:'Bonus',
        roundsAndMults:'ROUNDS & MULTIPLIERS',pressToStart:'Press PLACE BET to start',
        popsCount:'Pops:',bjBust:'Bust!',bjWin:'Win!',bjLose:'Loss',
        anon:'Anonymous',petsCount:'Pets:',viewInv:'🎒 View',empty:'Empty',
        activePet:'Active',confirmDelete:'Delete',given:'Given!',
        invCountLabel:'PETS',balloonPopsLabel:'Pops:',
        back:'← Back',petsOf:'pets',noPet:'Choose a pet',noPetRarity:'NONE',
        bonusLabelHud:'BONUS',openingCase:'OPENING...',
        music:'Music',musicOn:'🔊 On',musicOff:'🔇 Off',
        pvpTitle:'⚔️ EGG BATTLE',pvpSelect:'Choose defense zone',
        pvpAttack:'Choose attack zone',pvpTop:'Top',pvpSide:'Sides',pvpBot:'Bottom',
        pvpFight:'⚔️ FIGHT!',pvpCommission:'Casino fee: 5%',
        plinkoTitle:'🥚 EASTER PLINKO',plinkoDrop:'DROP EGG',
    },
    ru:{
        chooseGame:'ВЫБЕРИ ИГРУ',betLbl:'СТАВКА',betBtn:'СДЕЛАТЬ СТАВКУ',
        win:'Победил!',lose:'Проиграл!',waiting:'⏳ Ожидание...',
        spinning:'🎰 Крутим...',openCells:'⚡ Открывай клетки!',
        chooseDoor:'🚪 Выбирай дверь без кролика!',tapBalloon:'🎈 Нажимай на яйцо!',
        minesBoom:'Бум! Мина!',clownBoom:'За той дверью был кролик!',
        allRounds:'Выиграл все 4 раунда!',balloonBoom:'Яйцо лопнуло!',
        take:'💰 ЗАБРАТЬ',round:'РАУНД',prize:'Приз:',
        myPets:'🎒 МОИ ПИТОМЦЫ',leaders:'🏆 ЛИДЕРЫ',admin:'⚡ АДМИН',
        settings:'⚙️ Настройки',theme:'Тема',lang:'Язык',
        invEmpty:'Инвентарь пуст',invEmptySub:'Открывай кейсы в магазине!',
        loading:'Загрузка...',marketEmpty:'Рынок пуст',
        saved:'✅ Сохранено!',chosen:'ВЫБРАННОЕ ЧИСЛО',
        g_f50:'⚖️ 50/50 (x1.55)',g_dice:'🎲 Кубик (x2.05)',
        g_wheel:'🎡 Колесо (до x1.6)',g_slots:'🎰 Слоты (до x5.0)',
        g_mines:'💣 Мины (до x4.0)',
        g_clown:'🐰 Двери Пасхи (до x2.4)',
        g_balloon:'🥚 Яйцо Удачи (до x2.5)',
        g_bj:'🃏 Блекджек (x2.0)',
        g_pvp:'⚔️ Бой Крашанками',
        g_plinko:'🥚 Корзина Удачи (Plinko)',
        expired:'Эта игра уже недоступна',
        navShop:'📦',navInv:'🎒',navTop:'🏆',navSet:'⚙️',
        tabCases:'📦 Кейсы',tabMarket:'🛒 Рынок',
        dealer:'ДИЛЕР',you:'ВЫ',hit:'ЕЩЁ',stand:'СТОП',
        bonusLabel:'БОНУС',lvlLabel:'УРВ',
        adminBalance:'Баланс',adminPets:'Питомцы',adminInv:'Инвентарь',
        equip:'Взять',equipped:'✅',bonusWord:'Бонус',
        roundsAndMults:'РАУНДЫ И МНОЖИТЕЛИ',pressToStart:'Нажми СДЕЛАТЬ СТАВКУ чтобы начать',
        popsCount:'Взрывов:',bjBust:'Перебор!',bjWin:'Выигрыш!',bjLose:'Проигрыш',
        anon:'Аноним',petsCount:'Питомцев:',viewInv:'🎒 Просмотр',empty:'Пусто',
        activePet:'Активный',confirmDelete:'Удалить',given:'Выдано!',
        invCountLabel:'ПИТОМЦЕВ',balloonPopsLabel:'Взрывов:',
        back:'← Назад',petsOf:'питомцев',noPet:'Выбери питомца',noPetRarity:'НЕТ',
        bonusLabelHud:'БОНУС',openingCase:'ОТКРЫВАЕМ...',
        music:'Музыка',musicOn:'🔊 Вкл.',musicOff:'🔇 Выкл.',
        pvpTitle:'⚔️ БОЙ КРАШАНКАМИ',pvpSelect:'Выбери зону защиты',
        pvpAttack:'Выбери куда бить',pvpTop:'Верх',pvpSide:'Бока',pvpBot:'Низ',
        pvpFight:'⚔️ БИТЬСЯ!',pvpCommission:'Комиссия казино: 5%',
        plinkoTitle:'🥚 КОРЗИНА УДАЧИ',plinkoDrop:'БРОСИТЬ ЯЙЦО',
    },
};
function L(k){return(LANGS[currentLang]||LANGS.uk)[k]||k;}

function applyLang(lang){
    currentLang=lang; localStorage.setItem('bc_lang',lang);
    // Select options
    const sel=document.getElementById('g-sel');
    if(sel){
        const keys=['g_f50','g_dice','g_wheel','g_slots','g_mines','g_clown','g_balloon','g_bj','g_pvp','g_plinko'];
        [...sel.options].forEach((o,i)=>{if(keys[i])o.text=L(keys[i]);});
    }
    // data-l elements
    document.querySelectorAll('[data-l]').forEach(el=>el.textContent=L(el.dataset.l));
    // IDs
    const ids={
        'btn-play':'betBtn','inv-heading':'myPets','top-heading':'leaders',
        'sett-heading':'settings','admin-heading':'admin',
        'bj-dealer-lbl':'dealer','bj-you-lbl':'you',
        'bj-hit':'hit','bj-stop':'stand',
        'pet-bonus-lbl':'bonusLabelHud','case-title':'openingCase',
    };
    Object.entries(ids).forEach(([id,key])=>{
        const el=document.getElementById(id); if(el) el.textContent=L(key);
    });
    // Re-render open pages
    ren();
    if(document.getElementById('v-settings')?.style.display!=='none') renderSettings();
    if(document.getElementById('v-shop')?.style.display!=='none') renderShop();
    if(document.getElementById('v-inv')?.style.display!=='none') renderInv();
    if(document.getElementById('ui-clown')?.style.display!=='none') buildClownUI();
    if(document.getElementById('ui-balloon')?.style.display!=='none') buildBalloonUI();
    buildDiceUI();
}

// ============================================================
// СТАН
// ============================================================
let s={b:0,x:0,r:1,name:myName,p:null,inv:[],v:6.0};
let currentShopTab='cases',currentAdminTab='balance';
let adminInvUserId=null,adminInvUserName='';

// FIREBASE SYNC
db.ref('players/'+myId).on('value',snap=>{
    const d=snap.val();
    if(d){s=d;if(!s.inv)s.inv=[];}
    else{db.ref('players/'+myId).set(s);}
    ren();
});
function save(){db.ref('players/'+myId).set(s);}

// ============================================================
// XP / LEVELUP
// ============================================================
function checkPetLevelUp(){
    if(!s.p) return;
    const needed=(s.p.lvl||1)*XP_PER_LEVEL;
    if(s.x>=needed){
        s.x-=needed; s.p.lvl=(s.p.lvl||1)+1;
        s.p.m=Math.round((s.p.m+0.005)*1000)/1000;
        const idx=s.inv.findIndex(i=>i.id===s.p.id);
        if(idx!==-1) s.inv[idx]=s.p;
        save(); showToast(`${s.p.s||''} <b>${s.p.n}</b> — LVL ${s.p.lvl}! <span style="color:var(--accent)">+0.005</span>`);
    }
}
function showToast(html){
    const t=document.createElement('div');
    t.innerHTML=html; t.className='toast';
    document.body.appendChild(t);
    setTimeout(()=>t.remove(),3000);
}

// ============================================================
// РЕНДЕР
// ============================================================
const RARITY_GLOW={
    'Звичайний':'#94a3b8','Незвичайний':'#3b82f6','Рідкісний':'#a855f7',
    'Епічний':'#f59e0b','Легендарний':'#f43f5e','Міфічний':'#06b6d4',
    'Смехуятина':'#ff6b35',
};

function ren(){
    document.getElementById('bal-val').innerText=Number.isInteger(s.b)?s.b:s.b.toFixed(2);
    const petLvl=s.p?(s.p.lvl||1):1;
    document.getElementById('xp-f').style.width=Math.min((s.x/(petLvl*XP_PER_LEVEL))*100,100)+'%';
    const bonusLblEl=document.getElementById('pet-bonus-lbl');
    if(bonusLblEl) bonusLblEl.textContent=L('bonusLabelHud');
    if(s.p){
        document.getElementById('p-img').innerText='';
        // Draw pet on HUD canvas
        const hc=document.getElementById('p-hud-canvas');
        if(hc){ hc.width=hc.width; startPetAnim('p-hud-canvas',s.p); }
        else {
            const img=document.getElementById('p-img');
            if(img) img.innerText=s.p.s||'';
        }
        document.getElementById('p-name').innerText=s.p.n;
        document.getElementById('p-m').innerText=s.p.m.toFixed(3);
        document.getElementById('p-l').innerText=s.p.lvl||1;
        const t=document.getElementById('p-rarity');
        t.innerText=s.p.r; t.style.background=s.p.c;
    } else {
        const img=document.getElementById('p-img'); if(img) img.innerText='🥚';
        document.getElementById('p-name').innerText=L('noPet');
        const t=document.getElementById('p-rarity');
        t.innerText=L('noPetRarity'); t.style.background='';
    }
    if(ADMINS.includes(Number(myId))) document.getElementById('admin-tab').style.display='block';
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
};

// ============================================================
// МАГАЗИН
// ============================================================
window.setShopTab=t=>{currentShopTab=t;renderShop();};
function renderShop(){
    const list=document.getElementById('shop-list');
    const tabs=`<div class="shop-tabs">
        <div class="s-tab ${currentShopTab==='cases'?'active':''}" onclick="setShopTab('cases')">${L('tabCases')}</div>
        <div class="s-tab ${currentShopTab==='market'?'active':''}" onclick="setShopTab('market')">${L('tabMarket')}</div>
    </div>`;
    if(currentShopTab==='cases'){
        let h=tabs; const now=Date.now();
        for(const k in CASES){
            const c=CASES[k];
            const dl=c.deadline||0;
            if(c.limited&&now>dl) continue;
            const badge=c.limited?'<span class="badge-ltd">Лімітовано</span>':'';
            const chances=c.drop.map(p=>`<span style="color:${p.c}">${p.s} ${p.w}%</span>`).join(' · ');
            let timer='';
            if(c.limited){const diff=dl-now,d=Math.floor(diff/86400000),hr=Math.floor((diff/3600000)%24);timer=`<div class="case-timer">⏳ ${d}д ${hr}г</div>`;}
            h+=`<div class="shop-card"><div class="case-info">
                <div class="case-name">${c.n} ${badge}</div>
                <div style="font-size:10px;margin:4px 0;font-weight:600;opacity:.85">${chances}</div>${timer}
            </div><button class="btn-buy" onclick="buyCase('${k}')">${c.p} BB</button></div>`;
        }
        list.innerHTML=h;
    } else {
        list.innerHTML=tabs+`<div id="m-list" class="glass" style="text-align:center;color:#8d99ae">${L('loading')}</div>`;
        db.ref('market').once('value',snap=>{
            let h='';
            snap.forEach(child=>{
                const lot=child.val();
                if(!lot||!lot.pet) return;
                if(String(lot.sellerId)===String(myId)) return;
                h+=`<div class="market-item">
                    <div><div style="font-weight:700;color:${lot.pet.c}">${lot.pet.s} ${lot.pet.n}</div>
                    <div style="font-size:11px;color:#8d99ae">LVL ${lot.pet.lvl||1} · x${lot.pet.m.toFixed(3)} · ${lot.sellerName}</div></div>
                    <button class="btn-buy" onclick="buyFromMarket('${child.key}')">${lot.price} BB</button>
                </div>`;
            });
            const el=document.getElementById('m-list');
            if(el) el.innerHTML=h||`<div style="padding:30px;text-align:center;color:#8d99ae">${L('marketEmpty')}</div>`;
        });
    }
}
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
    if(!s.inv||!s.inv.length){
        el.innerHTML=`<div class="inv-empty"><div style="font-size:52px;margin-bottom:12px">🥚</div>
            <div style="font-weight:bold;font-size:15px">${L('invEmpty')}</div>
            <div style="font-size:12px;opacity:.6;margin-top:4px">${L('invEmptySub')}</div></div>`;
        return;
    }
    let h=`<div style="font-size:11px;color:#8d99ae;font-weight:700;margin-bottom:10px;letter-spacing:.5px">${s.inv.length} ${L('invCountLabel')}</div>`;
    s.inv.forEach((p,i)=>{
        const eq=s.p&&s.p.id===p.id;
        const containerId=`pet-vis-${i}`;
        h+=`<div class="pet-card${eq?' pet-eq':''}">
            <div class="pet-stripe" style="background:${p.c}"></div>
            <div id="${containerId}" data-size="72" style="flex-shrink:0"></div>
            <div class="pet-info">
                <div class="pet-badge" style="background:${p.c}25;color:${p.c};border:1px solid ${p.c}50">${p.r}</div>
                <div class="pet-name">${p.n}${eq?`<span class="pet-active-tag">✦ ${L('activePet')}</span>`:''}</div>
                <div class="pet-stats">
                    <span>${L('bonusWord')} <b style="color:${p.c}">x${p.m.toFixed(3)}</b></span>
                    <span style="margin-left:10px">LVL <b style="color:#eee">${p.lvl||1}</b></span>
                </div>
            </div>
            <div class="pet-btns">
                <button class="pb-equip${eq?' pb-eq':''}" onclick="equip(${p.id})">${eq?L('equipped'):L('equip')}</button>
                <button class="pb-sell" onclick="listOnMarket(${p.id})">🏪</button>
            </div>
        </div>`;
    });
    el.innerHTML=h;
    // Insert pet visuals after render
    requestAnimationFrame(()=>{
        s.inv.forEach((p,i)=>startPetAnim(`pet-vis-${i}`,p));
    });
}
window.equip=id=>{s.p=s.inv.find(i=>i.id===id);save();renderInv();ren();};

// ============================================================
// КОЛЕСО
// ============================================================
const WHEEL_SEGS=[
    {label:'0x',      color:'#c0392b',m:0,   start:0,  end:180},
    {label:'1.4x',    color:'#27ae60',m:1.4, start:180,end:270},
    {label:'1.6x',    color:'#2980b9',m:1.6, start:270,end:342},
    {label:'🍯🐻',   color:'#f59e0b',m:999, start:342,end:360},
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
    for(let i=0;i<25;i++){const cell=minesState.cells[i];if(cell.revealed){h+=cell.mine?`<div class="mc mc-boom">💣</div>`:`<div class="mc mc-safe">🌿</div>`;}else if(minesState.alive){h+=`<div class="mc mc-btn" onclick="minesReveal(${i})">🥚</div>`;}else{h+=`<div class="mc" style="opacity:.3">·</div>`;}}
    document.getElementById('mines-grid').innerHTML=h;
}
window.minesReveal=idx=>{
    if(!minesState||!minesState.alive)return;
    const cell=minesState.cells[idx];cell.revealed=true;
    if(cell.mine){
        minesState.alive=false;minesState.cells.forEach(c=>{if(c.mine)c.revealed=true;});buildMinesGrid();
        document.getElementById('mines-ctrl').style.display='none';
        const bt=minesState.bet;s.b-=bt;save();
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
    s.b+=win;s.x+=Math.floor(bt/2);save();checkPetLevelUp();
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
// ВЕЛИКОДНІ ДВЕРІ (Clown Doors → Easter Doors)
// ============================================================
const CLOWN_MULTS=[1.1,1.5,2.0,2.4];
let clownState=null;
function buildClownUI(){
    const el=document.getElementById('ui-clown');if(!el)return;
    if(!clownState){
        el.innerHTML=`<div class="clown-info">
            <div style="font-size:13px;font-weight:700;color:#8d99ae;margin-bottom:10px">${L('roundsAndMults')}</div>
            <div class="clown-rounds-info">${CLOWN_MULTS.map((m,i)=>`<div class="clown-ri"><span>${L('round')} ${i+1}</span><b style="color:var(--accent)">x${m}</b><small>${5-i} 🚪</small></div>`).join('')}</div>
            <div style="font-size:11px;color:#8d99ae;margin-top:10px;text-align:center">${L('pressToStart')}</div>
        </div>`;return;
    }
    const {round,alive,doors,betweenRounds}=clownState,totalDoors=5-round;
    let doorsHtml='';
    for(let i=0;i<totalDoors;i++){
        if(doors[i]==='clown') doorsHtml+=`<div class="clown-door door-boom">🐰</div>`;
        else if(doors[i]==='ok') doorsHtml+=`<div class="clown-door door-ok">🥚</div>`;
        else if(alive) doorsHtml+=`<div class="clown-door door-closed" onclick="clownPick(${i})">🚪</div>`;
        else doorsHtml+=`<div class="clown-door" style="opacity:.3">🚪</div>`;
    }
    const prevMult=round>0?CLOWN_MULTS[round-1]:null;
    const canCashout=round>0&&alive&&betweenRounds;
    el.innerHTML=`<div class="clown-game">
        <div class="clown-header"><span style="color:#8d99ae;font-size:12px;font-weight:700">${L('round')} ${round+1}/4</span><span style="color:var(--accent);font-weight:800">${L('prize')} x${CLOWN_MULTS[round]}</span></div>
        <div class="clown-doors">${doorsHtml}</div>
        <div style="font-size:11px;color:#8d99ae;text-align:center;margin-top:8px">${L('chooseDoor')}</div>
        ${canCashout?`<button class="btn" style="background:var(--success);margin-top:10px;padding:11px;font-size:13px" onclick="clownCashout()">${L('take')} x${prevMult}</button>`:''}
    </div>`;
}
window.clownPick=idx=>{
    if(!clownState||!clownState.alive)return;
    clownState.betweenRounds=false;
    const{round,bet}=clownState,totalDoors=5-round,clownDoor=Math.floor(Math.random()*totalDoors);
    clownState.doors[idx]=(idx===clownDoor)?'clown':'ok';
    if(idx===clownDoor){
        clownState.alive=false;buildClownUI();s.b-=bet;save();
        setTimeout(()=>{document.getElementById('g-stat').innerHTML=`<span style="color:var(--error)">-${bet.toFixed(2)} BB 🐰</span><br><small>${L('clownBoom')}</small>`;clownState=null;buildClownUI();},800);
    } else {
        if(round>=3){
            const mult=CLOWN_MULTS[3],bon=s.p?s.p.m:1,win=(bet*mult-bet)*bon;
            s.b+=win;s.x+=Math.floor(bet/2);save();checkPetLevelUp();
            document.getElementById('g-stat').innerHTML=`<span style="color:var(--success)">+${win.toFixed(2)} BB 🎉</span><br><small>${L('allRounds')} x${mult}</small>`;
            clownState.alive=false;buildClownUI();setTimeout(()=>{clownState=null;buildClownUI();},1500);
        } else {clownState.round++;clownState.doors={};clownState.betweenRounds=true;buildClownUI();}
    }
};
window.clownCashout=()=>{
    if(!clownState||!clownState.alive)return;
    const{bet,round}=clownState,mult=CLOWN_MULTS[round-1],bon=s.p?s.p.m:1,win=(bet*mult-bet)*bon;
    s.b+=win;s.x+=Math.floor(bet/2);save();checkPetLevelUp();
    document.getElementById('g-stat').innerHTML=`<span style="color:var(--success)">+${win.toFixed(2)} BB 💰</span><br><small>${L('take')} x${mult}</small>`;
    clownState=null;buildClownUI();
};
function startClown(bt){clownState={bet:bt,round:0,alive:true,betweenRounds:false,doors:{}};document.getElementById('g-stat').innerHTML=`<span style="color:var(--accent)">${L('chooseDoor')}</span>`;buildClownUI();}

// ============================================================
// ЯЙЦe УДАЧІ (Balloon → Easter Egg)
// ============================================================
const BALLOON_MAX=15;
let balloonState=null;
function buildBalloonUI(){
    const el=document.getElementById('ui-balloon');if(!el)return;
    if(!balloonState){
        el.innerHTML=`<div style="text-align:center;padding:10px 0">
            <div style="font-size:11px;color:#8d99ae;font-weight:700;margin-bottom:8px">ЗА КОЖНЕ ЛОПАННЯ +x0.1</div>
            <div style="font-size:11px;color:#8d99ae">Макс. ${BALLOON_MAX} лопань · Яйце може луснути будь-коли</div>
            <div style="font-size:11px;color:#8d99ae;margin-top:4px">Макс. приз: <b style="color:var(--accent)">x${(1+BALLOON_MAX*.1).toFixed(1)}</b></div>
        </div>`;return;
    }
    const{pops,alive}=balloonState,mult=(1+pops*.1).toFixed(1),size=Math.min(80+pops*8,180);
    // Easter egg colors
    const colors=['#e82a4a','#4a8ae8','#4ae84a','#f8d84a','#e84ae8'];
    const col=colors[pops%colors.length];
    el.innerHTML=`<div class="balloon-game">
        <div class="balloon-mult">x${mult}</div>
        <div id="balloon-el" style="width:${size}px;height:${size*1.2}px;margin:0 auto;cursor:${alive?'pointer':'default'};transition:.15s;position:relative;${alive?'':'opacity:.6'}"
             ${alive?'onclick="balloonPop()"':''}>
            <canvas id="egg-canvas" width="${size}" height="${size*1.2}" style="border-radius:50% 50% 45% 45%;"></canvas>
        </div>
        <div style="font-size:11px;color:#8d99ae;margin-top:8px">${L('balloonPopsLabel')} ${pops}</div>
        ${alive&&pops>0?`<button class="btn" style="background:var(--success);margin-top:10px;padding:11px;font-size:13px" onclick="balloonCashout()">${L('take')} x${mult}</button>`:''}
    </div>`;
    // Draw egg on canvas
    const ec=document.getElementById('egg-canvas');
    if(ec){
        const ectx=ec.getContext('2d'),EW=ec.width,EH=ec.height;
        const eg=ectx.createRadialGradient(EW*.4,EH*.3,EW*.05,EW*.5,EH*.5,EW*.5);
        eg.addColorStop(0,'#fff'); eg.addColorStop(0.3,col); eg.addColorStop(1,'#8b0000');
        ectx.fillStyle=eg; ectx.beginPath(); ectx.ellipse(EW*.5,EH*.5,EW*.45,EH*.47,0,0,Math.PI*2); ectx.fill();
        // Pattern
        ectx.strokeStyle='rgba(255,255,255,0.6)'; ectx.lineWidth=2;
        ectx.beginPath(); ectx.ellipse(EW*.5,EH*.5,EW*.45,EH*.47,0,Math.PI*.3,Math.PI*.9); ectx.stroke();
        ectx.strokeStyle='rgba(255,255,255,0.4)';
        for(let i=0;i<5;i++){ectx.beginPath();const a=i/5*Math.PI*2;ectx.moveTo(EW*.5+Math.cos(a)*EW*.15,EH*.5+Math.sin(a)*EH*.15);ectx.lineTo(EW*.5+Math.cos(a)*EW*.4,EH*.5+Math.sin(a)*EH*.4);ectx.stroke();}
        if(!alive){ectx.strokeStyle='#333';ectx.lineWidth=3;ectx.beginPath();ectx.moveTo(EW*.3,EH*.4);ectx.lineTo(EW*.7,EH*.6);ectx.moveTo(EW*.7,EH*.4);ectx.lineTo(EW*.3,EH*.6);ectx.stroke();}
    }
}
window.balloonPop=()=>{
    if(!balloonState||!balloonState.alive)return;
    balloonState.pops++;
    if(balloonState.pops>=balloonState.burstAt||balloonState.pops>=BALLOON_MAX){
        balloonState.alive=false;buildBalloonUI();const bt=balloonState.bet;s.b-=bt;save();
        setTimeout(()=>{document.getElementById('g-stat').innerHTML=`<span style="color:var(--error)">-${bt.toFixed(2)} BB 💥</span><br><small>${L('balloonBoom')}</small>`;balloonState=null;buildBalloonUI();},700);
    } else {
        const el=document.getElementById('balloon-el');if(el){el.style.transform='scale(1.15)';setTimeout(()=>el.style.transform='scale(1)',150);}
        buildBalloonUI();
    }
};
window.balloonCashout=()=>{
    if(!balloonState||!balloonState.alive||balloonState.pops===0)return;
    const{bet,pops}=balloonState,mult=1+pops*.1,bon=s.p?s.p.m:1,win=(bet*mult-bet)*bon;
    s.b+=win;s.x+=Math.floor(bet/2);save();checkPetLevelUp();
    document.getElementById('g-stat').innerHTML=`<span style="color:var(--success)">+${win.toFixed(2)} BB 🥚</span><br><small>Забрав x${mult.toFixed(1)}</small>`;
    balloonState=null;buildBalloonUI();
};
function startBalloon(bt){balloonState={bet:bt,pops:0,burstAt:Math.floor(Math.random()*BALLOON_MAX)+1,alive:true};document.getElementById('g-stat').innerHTML=`<span style="color:var(--accent)">${L('tapBalloon')}</span>`;buildBalloonUI();}

// ============================================================
// БІЙ КРАШАНКАМИ (PvP)
// ============================================================
let pvpState=null;
function buildPvpUI(){
    const el=document.getElementById('ui-pvp');if(!el)return;
    const zones=[{k:'pvpTop',v:'top'},{k:'pvpSide',v:'side'},{k:'pvpBot',v:'bot'}];
    const zoneHtml=z=>zones.map(({k,v})=>`<button class="pvp-zone-btn${pvpState&&pvpState[z]===v?' pvp-sel':''}" onclick="pvpPick('${z}','${v}')">${L(k)}</button>`).join('');
    el.innerHTML=`<div class="pvp-game">
        <div style="font-size:13px;font-weight:700;color:#8d99ae;margin-bottom:12px;text-align:center">${L('pvpCommission')}</div>
        <div class="pvp-row">
            <div><div style="font-size:11px;color:#8d99ae;margin-bottom:6px;font-weight:700">${L('pvpSelect')}</div><div class="pvp-zone-grid">${zoneHtml('defense')}</div></div>
            <div style="font-size:32px;align-self:center">🥚⚔️🥚</div>
            <div><div style="font-size:11px;color:#8d99ae;margin-bottom:6px;font-weight:700">${L('pvpAttack')}</div><div class="pvp-zone-grid">${zoneHtml('attack')}</div></div>
        </div>
        ${pvpState&&pvpState.defense&&pvpState.attack?`<button class="btn" style="margin-top:14px" onclick="pvpFight()">${L('pvpFight')}</button>`:''}
        <div id="pvp-result" style="margin-top:12px;text-align:center;font-weight:bold;font-size:15px"></div>
    </div>`;
}
window.pvpPick=(zone,val)=>{
    if(!pvpState) pvpState={};
    pvpState[zone]=val; buildPvpUI();
};
window.pvpFight=()=>{
    const bt=parseFloat(document.getElementById('bet-a').value);
    if(isNaN(bt)||bt<=0||bt>s.b) return alert('Мало BB!');
    if(!pvpState||!pvpState.defense||!pvpState.attack) return;
    // Bot picks random
    const zones=['top','side','bot'];
    const botDefense=zones[Math.floor(Math.random()*3)];
    const botAttack=zones[Math.floor(Math.random()*3)];
    // Win if player attack ≠ bot defense AND bot attack ≠ player defense
    const playerCracks=pvpState.attack!==botDefense;
    const botCracks=botAttack!==pvpState.defense;
    const commission=bt*0.05;
    const resEl=document.getElementById('pvp-result');
    if(playerCracks&&!botCracks){
        const win=(bt-commission)*(s.p?s.p.m:1);
        s.b+=win;s.x+=Math.floor(bt/2);save();checkPetLevelUp();
        resEl.innerHTML=`<span style="color:var(--success)">+${win.toFixed(2)} BB 🎉</span><br><small>Твоє яйце вціліло! Ворожнє тріснуло!</small>`;
    } else if(botCracks&&!playerCracks){
        s.b-=bt;save();
        resEl.innerHTML=`<span style="color:var(--error)">-${bt.toFixed(2)} BB 💔</span><br><small>Твоє яйце тріснуло!</small>`;
    } else if(playerCracks&&botCracks){
        // Both crack — draw, commission taken
        s.b-=commission;save();
        resEl.innerHTML=`<span style="color:var(--warning)">Нічия! -${commission.toFixed(2)} BB комісія</span><br><small>Обидва яйця тріснули!</small>`;
    } else {
        // Neither cracks — draw
        resEl.innerHTML=`<span style="color:var(--warning)">Нічия! Обидва захистились!</span>`;
    }
    pvpState=null; setTimeout(()=>buildPvpUI(),2000);
};

// ============================================================
// PLINKO (Кошик Удачі)
// ============================================================
const PLINKO_MULTS=[0.2,0.5,1.0,1.5,2.0,3.0,5.0,10.0,50.0,10.0,5.0,3.0,2.0,1.5,1.0,0.5,0.2];
let plinkoRunning=false;
function buildPlinkoUI(){
    const el=document.getElementById('ui-plinko');if(!el)return;
    el.innerHTML=`<div style="text-align:center">
        <canvas id="plinko-canvas" width="280" height="320" style="border-radius:12px;background:rgba(0,0,0,.3)"></canvas>
        <div id="plinko-result" style="margin-top:8px;font-weight:bold;min-height:24px"></div>
    </div>`;
    drawPlinkoBoard();
}
function drawPlinkoBoard(ballX,ballY,winIdx){
    const canvas=document.getElementById('plinko-canvas');if(!canvas)return;
    const ctx=canvas.getContext('2d'),W=280,H=320;
    ctx.clearRect(0,0,W,H);
    // Pegs (carrot shaped)
    const rows=8,cols=9;
    for(let r=0;r<rows;r++){
        const numPegs=cols-r%2,startX=r%2===0?14:28;
        for(let c=0;c<numPegs;c++){
            const px=startX+c*(W-28)/(numPegs-1),py=40+r*28;
            ctx.fillStyle='#f8a030';
            ctx.beginPath();ctx.arc(px,py,5,0,Math.PI*2);ctx.fill();
        }
    }
    // Buckets
    const bW=W/PLINKO_MULTS.length;
    PLINKO_MULTS.forEach((m,i)=>{
        const hue=m<1?0:m<3?60:m<10?120:180;
        ctx.fillStyle=`hsla(${hue},80%,50%,.85)`;
        ctx.fillRect(i*bW+1,H-32,bW-2,32);
        ctx.fillStyle='#fff';ctx.font='bold 8px system-ui';ctx.textAlign='center';
        ctx.fillText(`x${m}`,i*bW+bW/2,H-16);
    });
    // Ball
    if(ballX!==undefined){
        ctx.fillStyle='#e82a4a';ctx.beginPath();ctx.arc(ballX,ballY,8,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(255,255,255,0.5)';ctx.beginPath();ctx.arc(ballX-2,ballY-2,3,0,Math.PI*2);ctx.fill();
    }
    // Highlight winning bucket
    if(winIdx!==undefined){
        ctx.strokeStyle='#fff';ctx.lineWidth=2;
        ctx.strokeRect(winIdx*(W/PLINKO_MULTS.length)+1,H-32,W/PLINKO_MULTS.length-2,32);
    }
}
function dropPlinkoEgg(bt){
    if(plinkoRunning)return; plinkoRunning=true;
    const W=280,H=320;
    let bx=W/2+(Math.random()-.5)*20,by=10,vel=0,hBounce=false;
    const rows=8;
    // Determine final bucket based on physics simulation
    let curX=bx;
    for(let r=0;r<rows;r++){curX+=Math.random()<.5?-14:14;}
    const bucketIdx=Math.max(0,Math.min(PLINKO_MULTS.length-1,Math.round((curX/(W))*PLINKO_MULTS.length)));
    const finalMult=PLINKO_MULTS[bucketIdx];
    const finalX=bucketIdx*(W/PLINKO_MULTS.length)+W/(PLINKO_MULTS.length*2);
    // Animate
    let frame=0;
    const totalFrames=60;
    const iv=setInterval(()=>{
        frame++;
        const t=frame/totalFrames;
        bx=W/2+(finalX-W/2)*t+(Math.random()-.5)*8*(1-t);
        by=10+t*(H-50);
        drawPlinkoBoard(bx,by);
        if(frame>=totalFrames){
            clearInterval(iv);
            drawPlinkoBoard(finalX,H-40,bucketIdx);
            plinkoRunning=false;
            // Check confetti bonus
            const confetti=Math.random()<0.15;
            const finalMultiplier=confetti?finalMult*2:finalMult;
            const bon=s.p?s.p.m:1;
            const win=bt*finalMultiplier*bon-bt;
            if(win>0){s.b+=win;s.x+=Math.floor(bt/2);save();checkPetLevelUp();
                document.getElementById('plinko-result').innerHTML=`<span style="color:var(--success)">+${win.toFixed(2)} BB${confetti?' 🎊 x2 КОНФЕТІ!':''}</span>`;
            } else {
                s.b+=bt*finalMultiplier-bt;save();
                document.getElementById('plinko-result').innerHTML=`<span style="color:var(--error)">${(bt*finalMultiplier-bt).toFixed(2)} BB (x${finalMult})</span>`;
            }
        }
    },25);
}

// ============================================================
// CANVAS КЕЙСИ
// ============================================================
function buyCase(k){
    const c=CASES[k];
    if(s.b<c.p)return alert('Мало BB!');
    s.b-=c.p;save();
    document.getElementById('case-modal').style.display='flex';
    let rand=Math.random()*100,win,cur=0;
    for(const p of c.drop){cur+=p.w;if(rand<=cur){win={...p};break;}}
    const CARD_W=90,COUNT=55,WIN_IDX=40;
    const pool=[];for(const key in CASES)pool.push(...CASES[key].drop);
    const scr=document.getElementById('case-scroll');
    scr.innerHTML='';scr.style.transition='none';scr.style.left='0px';
    const items=[];for(let i=0;i<COUNT;i++)items.push(i===WIN_IDX?win:pool[Math.floor(Math.random()*pool.length)]);
    items.forEach(pet=>{
        const cv=document.createElement('canvas');cv.width=84;cv.height=104;
        cv.style.cssText='display:block;margin:3px;border-radius:12px;flex-shrink:0';
        scr.appendChild(cv);drawPetCard(cv,pet);
    });
    setTimeout(()=>{scr.style.transition='5s cubic-bezier(0.05,0,0.1,1)';scr.style.left=`-${WIN_IDX*CARD_W-(window.innerWidth/2-CARD_W/2)}px`;},50);
    const resEl=document.getElementById('case-res'),closeEl=document.getElementById('case-close');
    setTimeout(()=>{
        const bigCv=document.createElement('canvas');bigCv.width=160;bigCv.height=196;
        bigCv.style.cssText='border-radius:16px;display:block;margin:0 auto 10px';
        drawPetCard(bigCv,win);resEl.innerHTML='';resEl.appendChild(bigCv);
        const label=document.createElement('div');
        label.innerHTML=`<span style="color:${RARITY_GLOW[win.r]||'#fff'};font-size:20px;font-weight:900">${win.n}</span><br><small style="color:#8d99ae">${win.r} · x${win.m.toFixed(3)}</small>`;
        resEl.appendChild(label);closeEl.style.display='block';
        win.id=Date.now();win.lvl=1;s.inv.push(win);save();
    },5600);
}
window.buyCase=buyCase;
window.closeCase=()=>{document.getElementById('case-modal').style.display='none';document.getElementById('case-close').style.display='none';document.getElementById('case-res').innerText='';};

// ============================================================
// updUI + play
// ============================================================
window.updUI=()=>{
    const g=document.getElementById('g-sel').value;
    ['dice','wheel','slots','mines','bj','clown','balloon','pvp','plinko'].forEach(id=>{
        const el=document.getElementById('ui-'+id);if(el)el.style.display=(g===id)?'block':'none';
    });
    if(g==='dice')    buildDiceUI();
    if(g==='wheel')   setTimeout(()=>drawWheel(wheelAngle),50);
    if(g==='mines')   updateMinesCount();
    if(g==='clown')   buildClownUI();
    if(g==='balloon') buildBalloonUI();
    if(g==='pvp')     buildPvpUI();
    if(g==='plinko')  buildPlinkoUI();
};

window.play=()=>{
    const bt=parseFloat(document.getElementById('bet-a').value);
    if(isNaN(bt)||bt<=0||bt>s.b)return alert('Мало BB!');
    const g=document.getElementById('g-sel').value;
    const now=Date.now();
    if((g==='clown'||g==='balloon')&&now>DEADLINE_CLOWN)return alert(L('expired'));
    if(g==='mines'&&minesState&&minesState.alive)return alert('Спочатку завершуй гру!');
    if(g==='clown'&&clownState&&clownState.alive)return alert('Спочатку завершуй гру!');
    if(g==='balloon'&&balloonState&&balloonState.alive)return alert('Спочатку завершуй гру!');
    document.getElementById('g-stat').innerText=L('waiting');
    if(g==='f50'){
        const w=Math.random()>.5;let ticks=0;
        document.getElementById('g-stat').innerHTML='<div id="coin-anim" style="font-size:56px;display:inline-block;transition:transform .08s">🥚</div>';
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
        if(p<50)m=0;else if(p<75)m=1.4;else if(p<95)m=1.6;else m=999;
        spinWheel(m,()=>{
            if(m===999){
                const bear={n:'Медовий пасх. медвідь',s:'🍯🐻',r:'Епічний',m:1.25,w:0,c:'#f59e0b',id:Date.now(),lvl:1,drawKey:'honeybear'};
                s.inv.push(bear);save();
                document.getElementById('g-stat').innerHTML=`<span style="color:#f59e0b">🎉 Ти виграв 🍯🐻 Медового ведмедя!</span>`;
                showToast('🍯🐻 <b>Медовий ведмідь</b> в інвентарі!');
            } else {res(m>0,bt,m,`Множник x${m}`);}
        });
    } else if(g==='slots'){
        if(slotsSpinning)return;
        document.getElementById('g-stat').innerText=L('spinning');
        runSlots((a,b,c)=>res(slotMult(a,b,c)>0,bt,slotMult(a,b,c),`${a} ${b} ${c}`));
    } else if(g==='mines'){startMines(bt);return;
    } else if(g==='clown'){startClown(bt);return;
    } else if(g==='balloon'){startBalloon(bt);return;
    } else if(g==='pvp'){buildPvpUI();document.getElementById('g-stat').innerText='';return;
    } else if(g==='plinko'){dropPlinkoEgg(bt);s.b-=bt;save();return;
    } else if(g==='bj') startBJ(bt);
};

function res(win,bt,m,msg){
    const bon=s.p?s.p.m:1;
    if(win){const w=(bt*m-bt)*bon;s.b+=w;s.x+=Math.floor(bt/2);document.getElementById('g-stat').innerHTML=`<span style="color:var(--success)">+${w.toFixed(2)} BB</span><br><small>${msg}</small>`;checkPetLevelUp();}
    else{s.b-=bt;document.getElementById('g-stat').innerHTML=`<span style="color:var(--error)">-${bt.toFixed(2)} BB</span><br><small>${msg}</small>`;}
    save();
}

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
        let l=[];snap.forEach(c=>{const v=c.val();if(v.name)l.push(v);});l.sort((a,b)=>b.b-a.b);
        document.getElementById('leaderboard').innerHTML=l.slice(0,10).map((p,i)=>`
            <div class="market-item"><span>${['🥇','🥈','🥉'][i]||`${i+1}.`} ${p.name}</span><b style="color:var(--accent)">${Math.floor(p.b)} BB</b></div>`).join('');
    });
}

// ============================================================
// АДМІНКА
// ============================================================
window.setAdminTab=t=>{currentAdminTab=t;adminInvUserId=null;loadAdmin();};
function loadAdmin(){
    if(currentAdminTab==='inv'&&adminInvUserId){loadAdminUserInv(adminInvUserId,adminInvUserName);return;}
    db.ref('players').once('value',snap=>{
        let tabs=`<div class="admin-tabs">
            <div class="a-tab ${currentAdminTab==='balance'?'active':''}" onclick="setAdminTab('balance')">💰 ${L('adminBalance')}</div>
            <div class="a-tab ${currentAdminTab==='pets'?'active':''}" onclick="setAdminTab('pets')">🐾 ${L('adminPets')}</div>
            <div class="a-tab ${currentAdminTab==='inv'?'active':''}" onclick="setAdminTab('inv')">🎒 ${L('adminInv')}</div>
        </div>`;
        let h=tabs;
        snap.forEach(c=>{
            const p=c.val(),uid=c.key;
            h+=`<div class="admin-card"><b>${p.name||L('anon')}</b> <small style="color:#8d99ae">${(p.b||0).toFixed(2)} BB</small>`;
            if(currentAdminTab==='balance'){h+=`<div class="admin-ctrl-grid"><button class="btn-ctrl b-add" onclick="mathB('${uid}','add')">+ ${L('adminBalance')}</button><button class="btn-ctrl b-sub" onclick="mathB('${uid}','sub')">−</button><button class="btn-ctrl b-set" onclick="mathB('${uid}','set')">Set</button></div>`;}
            else if(currentAdminTab==='pets'){h+=`<button class="btn" style="padding:8px;font-size:12px;margin-top:8px;background:#8b5cf6" onclick="adminGivePet('${uid}')">🎁 ${L('adminPets')}</button>`;}
            else{h+=`<br><small style="color:#8d99ae">${L('petsCount')} ${(p.inv||[]).length}</small><button class="btn" style="padding:8px;font-size:12px;margin-top:8px;background:#1c4a8a" onclick="openAdminInv('${uid}','${(p.name||L('anon')).replace(/'/g,"\\'")}')"> ${L('viewInv')}</button>`;}
            h+=`</div>`;
        });
        document.getElementById('admin-list').innerHTML=h;
    });
}
window.openAdminInv=(uid,name)=>{adminInvUserId=uid;adminInvUserName=name;loadAdminUserInv(uid,name);};
function loadAdminUserInv(uid,name){
    db.ref('players/'+uid).once('value',snap=>{
        const p=snap.val(),inv=(p&&p.inv)?p.inv:[];
        let h=`<div class="admin-tabs"><div class="a-tab" onclick="setAdminTab('balance')">💰</div><div class="a-tab" onclick="setAdminTab('pets')">🐾</div><div class="a-tab active">🎒</div></div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
            <button class="btn-s" onclick="adminInvUserId=null;loadAdmin()" style="font-size:15px;padding:8px 14px">${L('back')}</button>
            <div><b>${name}</b> <small style="color:#8d99ae">(${inv.length} ${L('petsOf')})</small></div>
        </div>`;
        if(!inv.length){h+=`<div class="admin-card" style="text-align:center;color:#8d99ae;padding:20px">${L('empty')}</div>`;}
        else{inv.forEach((pet,idx)=>{const eq=p.p&&p.p.id===pet.id;h+=`<div class="admin-card" style="display:flex;justify-content:space-between;align-items:center;gap:10px"><div style="display:flex;align-items:center;gap:10px"><span style="font-size:28px">${pet.s}</span><div><div style="font-weight:bold">${pet.n}${eq?` <span style="font-size:10px;background:var(--success);padding:1px 5px;border-radius:4px">${L('activePet')}</span>`:''}</div><div style="font-size:11px;color:${pet.c}">${pet.r} · x${pet.m.toFixed(3)} · LVL ${pet.lvl||1}</div></div></div><button class="btn-ctrl b-sub" onclick="adminRemovePet('${uid}',${idx},'${name}')">🗑</button></div>`;});}
        document.getElementById('admin-list').innerHTML=h;
    });
}
window.adminRemovePet=(uid,idx,name)=>{
    db.ref('players/'+uid).once('value',snap=>{
        const p=snap.val();let inv=p.inv?[...p.inv]:[];const pet=inv[idx];
        if(!pet)return alert('Не знайдено!');
        if(!confirm(`${L('confirmDelete')} ${pet.s} ${pet.n}?`))return;
        if(p.p&&p.p.id===pet.id)db.ref('players/'+uid+'/p').set(null);
        inv.splice(idx,1);db.ref('players/'+uid+'/inv').set(inv).then(()=>loadAdminUserInv(uid,name));
    });
};
window.mathB=(id,type)=>{
    let v=prompt('Сума:');if(!v||isNaN(v))return;v=Number(v);const ref=db.ref('players/'+id+'/b');
    if(type==='add')ref.transaction(c=>(c||0)+v);else if(type==='sub')ref.transaction(c=>(c||0)-v);else ref.set(v);
    setTimeout(loadAdmin,500);
};
window.adminGivePet=tid=>{
    let unique=[],seen=new Set();
    for(const k in CASES)CASES[k].drop.forEach(p=>{if(!seen.has(p.n)){unique.push(p);seen.add(p.n);}});
    ADMIN_ONLY_PETS.forEach(p=>{if(!seen.has(p.n)){unique.push(p);seen.add(p.n);}});
    const list=unique.map((p,i)=>`${i}: ${p.s} ${p.n} (${p.r})`).join('\n');
    const ch=prompt(list);
    if(ch!==null&&unique[ch]){
        const p={...unique[ch],id:Date.now(),lvl:1};
        db.ref('players/'+tid+'/inv').once('value',sn=>{const inv=sn.val()||[];inv.push(p);db.ref('players/'+tid+'/inv').set(inv);});
        alert(`${L('given')} ${unique[ch].s} ${unique[ch].n}`);
    }
};

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
    el.innerHTML=`
        <div class="glass"><div class="sett-section-title">${L('theme')}</div><div class="sett-grid">${themeHtml}</div></div>
        <div class="glass"><div class="sett-section-title">${L('lang')}</div><div class="sett-list">${langHtml}</div></div>
        <div class="glass"><div class="sett-section-title">${L('music')}</div>
            <div class="sett-card${musicEnabled?' sett-active':''}" onclick="toggleMusic()">
                <span>${musicEnabled?L('musicOn'):L('musicOff')}</span>
                <div style="font-size:22px">${musicEnabled?'🔊':'🔇'}</div>
            </div>
        </div>`;
}
window.pickTheme=k=>{applyTheme(k);renderSettings();showToast(L('saved'));};
window.pickLang=k=>{applyLang(k);renderSettings();showToast(L('saved'));};

// ============================================================
// МУЗИКА
// ============================================================
const MUSIC_URL=typeof MUSIC_B64!=='undefined'?MUSIC_B64:'';
let musicEnabled=localStorage.getItem('bc_music')!=='false';
let bgAudio=null;
function initMusic(){
    if(!MUSIC_URL)return;
    if(!bgAudio){bgAudio=new Audio(MUSIC_URL);bgAudio.loop=true;bgAudio.volume=0.35;}
    if(musicEnabled){bgAudio.play().catch(()=>{document.addEventListener('click',()=>{if(musicEnabled&&bgAudio.paused)bgAudio.play();},{once:true});});}
}
window.toggleMusic=()=>{
    musicEnabled=!musicEnabled;localStorage.setItem('bc_music',musicEnabled);
    if(musicEnabled){if(!bgAudio)initMusic();else bgAudio.play().catch(()=>{});}
    else{if(bgAudio)bgAudio.pause();}
    renderSettings();showToast(musicEnabled?L('musicOn'):L('musicOff'));
};

// ============================================================
// ВЕЛИКОДНІЙ ФОН (Easter particles)
// ============================================================
function startEasterBg(){
    const canvas=document.getElementById('easter-bg');if(!canvas)return;
    const ctx=canvas.getContext('2d');
    canvas.width=window.innerWidth;canvas.height=window.innerHeight;
    window.addEventListener('resize',()=>{canvas.width=window.innerWidth;canvas.height=window.innerHeight;});
    const items=['🥚','🐣','🌸','🌷','🐰','✨','🍬'];
    const particles=Array.from({length:20},()=>({
        x:Math.random()*canvas.width,y:Math.random()*canvas.height,
        s:items[Math.floor(Math.random()*items.length)],
        size:16+Math.random()*20,speed:.3+Math.random()*.5,
        wobble:Math.random()*Math.PI*2,wobbleSpeed:.02+Math.random()*.03,
        alpha:.15+Math.random()*.25,
    }));
    function frame(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        particles.forEach(p=>{
            p.y+=p.speed;p.wobble+=p.wobbleSpeed;p.x+=Math.sin(p.wobble)*.5;
            if(p.y>canvas.height+30){p.y=-30;p.x=Math.random()*canvas.width;}
            ctx.globalAlpha=p.alpha;ctx.font=`${p.size}px serif`;ctx.textAlign='center';
            ctx.fillText(p.s,p.x,p.y);
        });
        ctx.globalAlpha=1;requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

// ============================================================
// СТАРТ
// ============================================================
applyTheme(currentTheme);
initMusic();
updUI();
startEasterBg();
