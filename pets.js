// ============================================================
// СИСТЕМА ВІДОБРАЖЕННЯ ПЕТІВ — OpenMoji SVG ілюстрації
// ============================================================
// OpenMoji — безкоштовні ілюстровані emoji, виглядають як справжні малюнки

// Маппінг emoji → OpenMoji codepoint (hex unicode)
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

// Отримати зображення пета (кастомне фото або emoji)
function getPetImageSrc(pet) {
    try{
        const key = pet.drawKey;
        if (key && typeof PET_IMAGES !== 'undefined' && PET_IMAGES && PET_IMAGES[key]) {
            return { type: 'img', src: PET_IMAGES[key] };
        }
    }catch(e){}
    return { type: 'emoji', src: getPetEmoji(pet) };
}

// Малюємо красиву картку пета з кастомним фото або emoji
function createPetCardHTML(pet, size=80) {
  const glow   = RARITY_GLOW[pet.r] || '#94a3b8';
  const bg     = RARITY_BG[pet.r]   || RARITY_BG['Звичайний'];
  const radius = Math.round(size*0.18);
  const imgSrc = getPetImageSrc(pet);
  const particles = makeRarityParticles(pet.r, glow);

  // Анімація ТІЛЬКИ для emoji-петів (без фото)
  const hasPhoto = imgSrc.type === 'img';
  const anim = hasPhoto ? '' : (RARITY_ANIM[pet.r] || '');
  const animStyle = anim ? `animation:${anim} 2.5s ease-in-out infinite` : '';

  let content;
  if (hasPhoto) {
    const sz = Math.round(size * 0.90);
    // Фото без анімації. Фон контейнера завжди видно через прозорі пікселі
    content = `<img src="${imgSrc.src}"
      width="${sz}" height="${sz}"
      style="object-fit:contain;position:relative;z-index:1;display:block;flex-shrink:0"
      alt="${pet.n}">`;
  } else {
    content = `<span style="font-size:${Math.round(size*.54)}px;line-height:1;position:relative;z-index:1;${animStyle}">${imgSrc.src}</span>`;
  }

  return `<div style="
    width:${size}px;height:${size}px;background:${bg};
    border-radius:${radius}px;border:2px solid ${glow};
    box-shadow:0 0 ${Math.round(size*.2)}px ${glow}66,inset 0 0 ${Math.round(size*.1)}px ${glow}11;
    display:flex;align-items:center;justify-content:center;
    position:relative;overflow:hidden;flex-shrink:0;">${particles}${content}</div>`;
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

// Для canvas у кейс-рулетці — використовує кастомні фото або emoji
function drawPetCard(canvas, pet) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0,0,W,H);
  const glow = RARITY_GLOW[pet.r] || '#94a3b8';

  // Фон
  const bgColors = {
    'Звичайний':['#1e2433','#141820'],'Незвичайний':['#0f1e35','#0a1225'],
    'Рідкісний':['#1a0f2e','#0d0a20'],'Епічний':['#2a1800','#1a0f00'],
    'Легендарний':['#2a0a0a','#180505'],'Міфічний':['#001a2a','#000f18'],
    'Смехуятина':['#2a1000','#1a0800'],
  };
  const [c1,c2]=bgColors[pet.r]||bgColors['Звичайний'];
  const bg=ctx.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,c1);bg.addColorStop(1,c2);
  ctx.fillStyle=bg;roundRect(ctx,0,0,W,H,10);ctx.fill();

  // Рамка
  ctx.shadowColor=glow;ctx.shadowBlur=12;ctx.strokeStyle=glow;ctx.lineWidth=2;
  roundRect(ctx,1,1,W-2,H-2,10);ctx.stroke();ctx.shadowBlur=0;

  // Зірочки для рідкісних
  if(!['Звичайний','Незвичайний'].includes(pet.r)){
    ctx.fillStyle=glow;
    for(let i=0;i<5;i++){
      const px=W*(0.1+Math.random()*.8),py=H*(0.05+Math.random()*.55);
      ctx.globalAlpha=0.4+Math.random()*.4;
      ctx.beginPath();ctx.arc(px,py,1.5+Math.random()*2,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
  }

  const drawFallbackEmoji = () => {
    ctx.font=`${Math.floor(H*.45)}px serif`;
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(getPetEmoji(pet),W/2,H*.43);
    drawLabels();
  };
  const drawLabels = () => {
    ctx.font=`bold ${Math.max(9,Math.floor(H*.11))}px system-ui`;
    ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='alphabetic';
    ctx.fillText(pet.n.length>9?pet.n.slice(0,9)+'…':pet.n,W/2,H*.82);
    ctx.font=`bold ${Math.max(7,Math.floor(H*.09))}px system-ui`;
    ctx.fillStyle=glow;ctx.fillText(pet.r,W/2,H*.94);
  };

  // Пробуємо завантажити кастомне фото
  const imgSrc = getPetImageSrc(pet);
  if (imgSrc.type === 'img') {
    const img = new Image();
    img.onload = () => {
      const sz=Math.floor(H*.58),ox=(W-sz)/2,oy=H*.05;
      ctx.drawImage(img,ox,oy,sz,sz);
      drawLabels();
    };
    img.onerror = drawFallbackEmoji;
    img.src = imgSrc.src;
    drawLabels(); // одразу малюємо текст
  } else {
    drawFallbackEmoji();
  }
}


// Анімовані картки в інвентарі — через CSS div замість canvas
const petAnimFrames = new Map();

function startPetAnim(containerId, pet) {
  // Для HUD canvas — анімована картка з фото
  if (containerId === 'p-hud-canvas') {
    const canvas = document.getElementById(containerId);
    if (!canvas) return;
    if (petAnimFrames.has(containerId)) cancelAnimationFrame(petAnimFrames.get(containerId));
    const ctx = canvas.getContext('2d');
    const W=canvas.width, H=canvas.height;
    const glow = RARITY_GLOW[pet.r]||'#94a3b8';
    const imgSrc = getPetImageSrc(pet);
    let petImg = null;
    if (imgSrc.type === 'img') {
      petImg = new Image();
      petImg.src = imgSrc.src;
    }
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
      if (petImg && petImg.complete && petImg.naturalHeight>0) {
        const sz=Math.floor(W*.82);
        ctx.drawImage(petImg,-sz/2,-sz/2,sz,sz);
      } else {
        ctx.font=`${Math.floor(W*.6)}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(getPetEmoji(pet),0,0);
      }
      ctx.restore();
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

// Дедлайн великоднього кейсу (14 квітня 2026, 00:00 UTC)
const DEADLINE_EASTER_CASE = new Date('2026-04-14T00:00:00Z').getTime();

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
        {n:'Панда',    s:'🐼',r:'Епічний',    m:1.14,w:50,c:'#f59e0b'},
        {n:'Лев',      s:'🦁',r:'Легендарний',m:1.16,w:30,c:'#f43f5e'},
        {n:'Дракон',   s:'🐲',r:'Легендарний',m:1.17,w:20,c:'#f43f5e'}]},
    easter:   { n:"Великодній Кейс 🥚", p:1450, limited:true, deadline:DEADLINE_EASTER_CASE, drop:[
        {n:'Місячний заєць',   s:'🌙🐇',r:'Рідкісний',  m:1.165,w:33,c:'#a855f7',drawKey:'moonhare'},
        {n:'Місячний баранчик',s:'🌙🐑',r:'Рідкісний',  m:1.165,w:33,c:'#a855f7',drawKey:'moonlamb'},
        {n:'Пончик-хом\'як',   s:'🍩🐹',r:'Епічний',    m:1.22, w:20,c:'#f59e0b',drawKey:'donutham'},
        {n:'Фенікс-писанка',   s:'🔥🥚',r:'Легендарний',m:1.26, w:10,c:'#f43f5e',drawKey:'phoenixegg'},
        {n:'Привид пасхи',     s:'👻🐰',r:'Міфічний',   m:1.33, w:4, c:'#06b6d4',drawKey:'easterghost'}]},
};

const ADMIN_ONLY_PETS = [
    {n:'Клоун',              s:'🤡',r:'Смехуятина', m:1.67, c:'#ff6b35',drawKey:'clown2'},
    {n:'Смітник',            s:'🗑️',r:'Легендарний',m:1.35, c:'#f43f5e'},
    {n:'Медовий пасх. медвідь',s:'🍯🐻',r:'Епічний',m:1.25, c:'#f59e0b',drawKey:'honeybear'},
    {n:'Унітаз',             s:'🚽',r:'Епічний',    m:1.20, c:'#f59e0b',drawKey:'toilet'},
    {n:'Какашка',            s:'💩',r:'Легендарний', m:1.25, c:'#f43f5e',drawKey:'poop'},
    {n:'Нокіа3310',          s:'📱',r:'Міфічний',   m:1.32, c:'#bf40bf',drawKey:'nokia'},
    // 🌊 Океан кейс (видалений кейс, пети залишились в інвентарях)
    {n:'Рибка',              s:'🐟',r:'Рідкісний',  m:1.160,c:'#3b82f6'},
    {n:'Тропічна рибка',     s:'🐠',r:'Епічний',    m:1.195,c:'#f59e0b'},
    {n:'Акула',              s:'🦈',r:'Епічний',    m:1.150,c:'#6366f1'},
    {n:'Восьминіг',          s:'🐙',r:'Міфічний',   m:1.300,c:'#06b6d4'},
    // 🏴‍☠️ Bears Pass
    {n:'Золотий глист',         s:'🪱', r:'Міфічний',    m:1.233,c:'#d4a017',drawKey:'goldworm'},
    {n:'Балу',                  s:'🐻', r:'Епічний',     m:1.200,c:'#f59e0b',drawKey:'balu'},
    {n:'Нанук',                 s:'🐻‍❄️',r:'Міфічний',    m:1.265,c:'#06b6d4',drawKey:'nanuk'},
    // 🏴‍☠️ Піратський кейс
    {n:'Енн Бонні',             s:'🏴‍☠️',r:'Епічний',     m:1.180,c:'#f59e0b'},
    {n:'Душа Першого Матроса',  s:'💀', r:'Легендарний', m:1.220,c:'#f43f5e'},
    {n:'Одноокий Вартовий',     s:'🏴‍☠️',r:'Міфічний',    m:1.250,c:'#06b6d4'},
];


// ============================================================
// ПОКЕДЕКС
// ============================================================
function getAllPetsForDex(){
    const all=[];
    const seen=new Set();
    Object.values(CASES).forEach(c=>c.drop.forEach(p=>{
        if(!seen.has(p.n)){all.push(p);seen.add(p.n);}
    }));
    // Додаємо всіх петів з інвентаря гравця (щоб адмін-пети теж відображались)
    (s.inv||[]).forEach(p=>{
        if(!seen.has(p.n)){all.push({...p,w:0});seen.add(p.n);}
    });
    return all;
}

let showingDex=false;
window.togglePokedex=function(){showingDex=!showingDex;renderInv();};

function renderPokedex(){
    const all=getAllPetsForDex();
    const owned=new Set(s.inv.map(p=>p.n));
    const byRarity={};
    all.forEach(p=>{if(!byRarity[p.r])byRarity[p.r]=[];byRarity[p.r].push(p);});
    const rarityOrder=['Звичайний','Незвичайний','Рідкісний','Епічний','Легендарний','Міфічний','Смехуятина'];
    const total=all.length,gotCount=all.filter(p=>owned.has(p.n)).length;
    let h=`<button class="btn-s" style="width:100%;margin-bottom:12px" onclick="togglePokedex()">\u2190 Назад до інвентаря</button>
    <div style="text-align:center;margin-bottom:12px;font-size:13px;color:var(--muted);font-weight:700">${gotCount} / ${total} петів зібрано</div>`;
    rarityOrder.forEach(rar=>{
        if(!byRarity[rar]) return;
        h+=`<div style="font-size:9px;font-weight:700;letter-spacing:1px;color:${RARITY_GLOW[rar]||'var(--muted)'};text-transform:uppercase;margin:10px 0 6px">${rar}</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:4px">`;
        byRarity[rar].forEach(p=>{
            const have=owned.has(p.n);
            const imgSrc=getPetImageSrc(p);
            const img=imgSrc.type==='img'
                ?`<img src="${imgSrc.src}" style="width:36px;height:36px;object-fit:contain;${have?'':'filter:grayscale(1) opacity(.3)'}">`
                :`<span style="font-size:26px;${have?'':'filter:grayscale(1) opacity(.3)'}">${p.s}</span>`;
            h+=`<div style="background:${have?p.c+'18':'rgba(255,255,255,.03)'};border:1px solid ${have?p.c+'44':'rgba(255,255,255,.06)'};border-radius:10px;padding:8px 4px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:3px">
                ${img}
                <div style="font-size:9px;font-weight:700;color:${have?p.c:'var(--muted)'};line-height:1.2">${p.n}</div>
                ${have?`<div style="font-size:8px;color:var(--muted)">x${p.m.toFixed(2)}</div>`:''}
            </div>`;
        });
        h+=`</div>`;
    });
    h+=`<div class="glass" style="margin-top:12px"><div class="card-title">\uD83C\uDF81 Бонуси за повну колекцію</div>`;
    rarityOrder.forEach(rar=>{
        if(!byRarity[rar]) return;
        const cnt=byRarity[rar].length,got=byRarity[rar].filter(p=>owned.has(p.n)).length;
        const full=got===cnt,bonus=Math.round(cnt*50);
        h+=`<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.05)">
            <span style="font-size:12px;color:${RARITY_GLOW[rar]||'var(--muted)'}">${rar} (${got}/${cnt})</span>
            <span style="font-size:11px;font-weight:700;color:${full?'var(--success)':'var(--muted)'}">+${bonus} BB ${full?'\u2705':'\uD83D\uDD12'}</span>
        </div>`;
    });
    h+=`</div>`;
    return h;
}
