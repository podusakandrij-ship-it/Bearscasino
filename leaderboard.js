// ============================================================
// МУЗИКА — мультитрек плеєр
// ============================================================
let currentTrack  = localStorage.getItem('bc_track') || 'bubblegum';
let musicEnabled  = localStorage.getItem('bc_music') !== 'false';
let bgAudio       = null;

function getMusicSrc(key) {
    if (!key) return null;
    if (typeof MUSIC_TRACKS !== 'undefined' && MUSIC_TRACKS[key]) return MUSIC_TRACKS[key].src;
    // Fallback: стара MUSIC_B64
    if (typeof MUSIC_B64 !== 'undefined' && key === 'bubblegum') return MUSIC_B64;
    return null;
}

function initMusic() {
    if (!musicEnabled || !currentTrack) return;
    const src = getMusicSrc(currentTrack);
    if (!src) return;
    if (!bgAudio) {
        bgAudio = new Audio(src);
        bgAudio.loop   = true;
        bgAudio.volume = 0.35;
    } else if (bgAudio.src !== src) {
        bgAudio.pause();
        bgAudio = new Audio(src);
        bgAudio.loop   = true;
        bgAudio.volume = 0.35;
    }
    bgAudio.play().catch(() => {
        document.addEventListener('click', () => {
            if (musicEnabled && bgAudio && bgAudio.paused) bgAudio.play();
        }, { once: true });
    });
}

window.pickTrack = key => {
    currentTrack = key;
    localStorage.setItem('bc_track', key || '');
    if (bgAudio) { bgAudio.pause(); bgAudio = null; }
    if (key && musicEnabled) {
        musicEnabled = true;
        localStorage.setItem('bc_music', 'true');
        initMusic();
    } else if (!key) {
        // Вимкнути звук
        musicEnabled = false;
        localStorage.setItem('bc_music', 'false');
    }
    renderSettings();
    if (key && typeof MUSIC_TRACKS !== 'undefined' && MUSIC_TRACKS[key]) {
        showToast(`🎵 ${MUSIC_TRACKS[key].title}`);
    }
};

window.toggleMusic = () => {
    musicEnabled = !musicEnabled;
    localStorage.setItem('bc_music', musicEnabled);
    if (musicEnabled) {
        if (!bgAudio) initMusic();
        else bgAudio.play().catch(()=>{});
    } else {
        if (bgAudio) bgAudio.pause();
    }
    renderSettings();
    showToast(musicEnabled ? L('musicOn') : L('musicOff'));
};
