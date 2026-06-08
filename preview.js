const PREVIEW_DELAY_MS = 400;
const PREVIEW_VOLUME = 0.6;

let activePreview = null;
let audioUnlocked = false;

function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;

    const unlockVideo = document.createElement('video');
    unlockVideo.muted = true;
    unlockVideo.playsInline = true;
    unlockVideo.play().then(() => unlockVideo.remove()).catch(() => {});
}

document.addEventListener('click', unlockAudio, { once: true });
document.addEventListener('keydown', unlockAudio, { once: true });

function stopActivePreview() {
    if (!activePreview) return;

    const { video, thumbnail } = activePreview;
    thumbnail.classList.remove('is-previewing');
    video.pause();
    video.currentTime = 0;
    video.muted = true;
    activePreview = null;
}

async function playWithSound(video) {
    video.muted = false;
    video.volume = PREVIEW_VOLUME;

    try {
        await video.play();
        return true;
    } catch {
        video.muted = true;

        try {
            await video.play();
        } catch {
            return false;
        }
    }

    return true;
}

document.querySelectorAll('.video[data-preview]').forEach((card) => {
    const thumbnail = card.querySelector('.thumbnail');
    if (!thumbnail) return;

    const video = document.createElement('video');
    video.className = 'preview-video';
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'none';
    video.src = card.dataset.preview;
    thumbnail.appendChild(video);

    let hoverTimer;

    const startPreview = async () => {
        stopActivePreview();

        thumbnail.classList.add('is-previewing');
        video.currentTime = 0;

        const isPlaying = await playWithSound(video);
        if (isPlaying) {
            activePreview = { video, thumbnail };
        }
    };

    const stopPreview = () => {
        clearTimeout(hoverTimer);

        if (activePreview?.video === video) {
            stopActivePreview();
        }
    };

    card.addEventListener('mouseenter', () => {
        hoverTimer = setTimeout(startPreview, PREVIEW_DELAY_MS);
    });

    card.addEventListener('mouseleave', stopPreview);
});
