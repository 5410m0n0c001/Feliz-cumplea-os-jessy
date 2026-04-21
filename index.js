document.addEventListener('DOMContentLoaded', () => {
    const coverContainer = document.getElementById('cover-container');
    const videoWrapper = document.getElementById('video-wrapper');
    const introVideo = document.getElementById('intro-video');
    const mainVideo = document.getElementById('main-video');
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const greetingCard = document.getElementById('greeting-card');
    const shareBtn = document.getElementById('share-btn');
    const videoToggle = document.getElementById('video-toggle');
    const vPlayIcon = document.getElementById('v-play-icon');
    const vPauseIcon = document.getElementById('v-pause-icon');
    
    // --- Smart Asset Loading ---
    const assetMap = {
        'envelope': { base: 'sobrec', exts: ['png', 'webp', 'jpg', 'jpeg'] },
        'intro-video-source': { base: 'sobrev', exts: ['mp4', 'webm', 'mov'] },
        'main-video-source': { base: 'video', exts: ['mp4', 'webm', 'mov'] },
        'bg-music-source': { base: 'mañanitas', exts: ['mp3', 'wav', 'ogg'] }
    };

    async function initSmartAssets() {
        for (const [id, data] of Object.entries(assetMap)) {
            const el = document.getElementById(id);
            if (!el) continue;
            
            // Try each extension
            for (const ext of data.exts) {
                const testUrl = `${data.base}.${ext}`;
                try {
                    const response = await fetch(testUrl, { method: 'HEAD' });
                    if (response.ok) {
                        el.src = testUrl;
                        // If it's a source tag, we need to reload the parent
                        if (el.tagName === 'SOURCE') {
                            el.parentElement.load();
                        }
                        break;
                    }
                } catch (e) {
                    // Fallback to default if fetch fails (e.g. CORS or file not found)
                }
            }
        }
    }

    initSmartAssets();

    let isMusicPlaying = false;
    let isVideoPlaying = false;

    // --- Interactive Logic ---

    // Envelope Click
    coverContainer.addEventListener('click', async () => {
        coverContainer.classList.add('hidden');
        videoWrapper.classList.add('visible');

        try {
            await introVideo.play();
            playMusic();
            mainVideo.load();
        } catch (error) { console.error("Play error:", error); }
    });

    // Intro Video Ends
    introVideo.addEventListener('ended', () => {
        fadeOutIn(introVideo, mainVideo);
        videoToggle.style.display = 'flex'; // Show the video control button
    });

    // Control Buttons logic
    videoToggle.addEventListener('click', () => {
        if (mainVideo.paused) {
            mainVideo.play();
            isVideoPlaying = true;
            vPlayIcon.style.display = 'none';
            vPauseIcon.style.display = 'block';
        } else {
            mainVideo.pause();
            isVideoPlaying = false;
            vPlayIcon.style.display = 'block';
            vPauseIcon.style.display = 'none';
        }
    });

    musicToggle.addEventListener('click', () => {
        isMusicPlaying ? pauseMusic() : playMusic();
    });

    // Audio & Transitions
    function playMusic() {
        bgMusic.volume = (introVideo.paused && mainVideo.paused) ? 1.0 : 0.15;
        bgMusic.play().then(() => {
            isMusicPlaying = true;
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        }).catch(() => console.log("Music blocked"));
    }

    function pauseMusic() {
        bgMusic.pause();
        isMusicPlaying = false;
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }

    function fadeOutIn(oldVid, newVid) {
        oldVid.style.display = 'none';
        newVid.style.display = 'block';
        requestFullScreen(newVid);
        newVid.play().then(() => {
            isVideoPlaying = true;
            vPlayIcon.style.display = 'none';
            vPauseIcon.style.display = 'block';
            setTimeout(() => { greetingCard.style.opacity = '1'; }, 5000);
        }).catch(() => {
            isVideoPlaying = false;
            vPlayIcon.style.display = 'block';
            vPauseIcon.style.display = 'none';
            console.log("Video fail");
        });
    }

    function requestFullScreen(element) {
        try {
            if (element.requestFullscreen) element.requestFullscreen().catch(() => {});
            else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
        } catch (e) {}
    }

    shareBtn.addEventListener('click', async () => {
        const shareData = {
            title: 'Felicitación Especial',
            text: '¡Mira esta felicitación personalizada!',
            url: window.location.href
        };
        try {
            if (navigator.share) await navigator.share(shareData);
            else {
                alert('Copiado al portapapeles: ' + window.location.href);
                navigator.clipboard.writeText(window.location.href);
            }
        } catch (err) { console.error('Share error', err); }
    });
});
