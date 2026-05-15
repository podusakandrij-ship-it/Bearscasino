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
// SPLASH SCREEN
// ============================================================
(function initSplash(){
    const splash = document.getElementById('splash-screen');
    const bar    = document.getElementById('splash-bar');
    const txt    = document.getElementById('splash-text');
    if(!splash) return;

    const msgs = ['Завантаження...','Підключення до сервера...','Готуємо стіл...','Тасуємо карти...'];
    let progress = 0;
    let msgIdx   = 0;

    // Animate progress bar
    const iv = setInterval(()=>{
        const step = 2 + Math.random()*4;
        progress = Math.min(progress + step, 92);
        if(bar) bar.style.width = progress + '%';
        if(txt && msgIdx < msgs.length && progress > msgIdx * 25){
            txt.textContent = msgs[msgIdx++];
        }
    }, 120);

    // Hide splash when Firebase player data loaded (or max 4s)
    window._splashDone = function(){
        clearInterval(iv);
        if(bar) bar.style.width = '100%';
        if(txt) txt.textContent = 'Готово!';
        setTimeout(()=>{ if(splash) splash.classList.add('hidden'); }, 400);
    };

    // Safety fallback — max 4.5s
    setTimeout(()=>{ if(splash && !splash.classList.contains('hidden')) window._splashDone(); }, 4500);
})();

// Global error catch - prevent silent failures
window.onerror = function(msg, src, line, col, err) {
    console.error('CASINO ERROR:', msg, 'at', src, line, col, err);
    return false;
};
window.onunhandledrejection = function(e) {
    console.error('CASINO PROMISE ERROR:', e.reason);
};


// ============================================================
// КОНСТАНТИ
// ============================================================
const ADMINS          = [8216362223, 2067230442];
const myId            = tg.initDataUnsafe?.user?.id || 101;
const myName          = tg.initDataUnsafe?.user?.first_name || "Гравець";
const XP_BASE = 1000; // XP для 1-го рівня
function xpForLevel(lvl) {
    // Кожен рівень потребує на 30% більше ніж попередній
    return Math.round(XP_BASE * Math.pow(1.3, (lvl||1) - 1));
}

// ============================================================
// ПЕТИ — canvas малюнки + анімація
// ============================================================
// Кожен пет має функцію draw(ctx, W, H, t) де t = time для анімації

function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
}

