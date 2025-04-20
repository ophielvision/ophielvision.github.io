const TOTAL_VIDEOS = 116;
const TOTAL_INTERTITLES = 207;
const cardContainer = document.getElementById('cardContainer');
const zoomOverlay = document.getElementById('zoomOverlay');

const usedVideos = new Set();
let usedIntertitle = false;
let sessionData = [];

const createCard = (index) => {
  const card = document.createElement('div');
  card.classList.add('card');
  card.innerHTML = `<img src="./assets/placeholder.jpg" />`;
  card.addEventListener('click', () => onCardClick(card, index));
  return card;
};

const generateVideoFilename = (prefix, number) =>
  `${prefix}${String(number).padStart(3, '0')}.mp4`;

const getUniqueRandom = (total, usedSet) => {
  let num;
  do {
    num = Math.floor(Math.random() * total) + 1;
  } while (usedSet.has(num));
  usedSet.add(num);
  return num;
};

const onCardClick = (card, index) => {
  // Prevent re-revealing
  if (card.dataset.revealed === 'true') return;

  let videoType = 'video';
  let filename;

  if (!usedIntertitle) {
    usedIntertitle = true;
    const interNum = getUniqueRandom(TOTAL_INTERTITLES, new Set());
    filename = generateVideoFilename('intertitle', interNum);
    videoType = 'intertitle';
  } else {
    const vidNum = getUniqueRandom(TOTAL_VIDEOS, usedVideos);
    filename = generateVideoFilename('video', vidNum);
  }

  const videoPath = `assets/${videoType === 'intertitle' ? 'intertitles' : 'videos'}/${filename}`;
  assignVideoToCard(card, videoPath);
  sessionData[index] = { type: videoType, file: filename };
};

const assignVideoToCard = (card, videoSrc) => {
  card.dataset.revealed = 'true';

  const videoWrapper = document.createElement('div');
  videoWrapper.classList.add('videoWrapper');

  const video = document.createElement('video');
  video.src = videoSrc;
  video.autoplay = true;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;

  const zoomBtn = document.createElement('button');
  zoomBtn.classList.add('zoomButton');
  zoomBtn.innerText = '⤢';
  zoomBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent card click
    openZoom(videoSrc);
  });


  videoWrapper.appendChild(video);
  videoWrapper.appendChild(zoomBtn);
  card.innerHTML = '';
  card.appendChild(videoWrapper);

  video.addEventListener("canplay", () => {
  video.play().catch(err => {
    console.warn("Video play failed:", err);
    });
  });

  requestAnimationFrame(() => {
    setTimeout(() => {
      video.play().catch(err => {
        console.warn("Play failed:", err);
      });
    }, 50); // Sometimes 50–100ms is enough
  });
  video.load();

  // Try to autoplay safely
  const tryPlay = () => {
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Autoplay failed, waiting for user interaction", err);
      });
    }
  };

    // Ensure muted is set explicitly and play when ready
  video.muted = true;
  video.setAttribute("muted", "muted");
  video.setAttribute("preload", "auto");

  video.setAttribute("playsinline", "playsinline");

  video.addEventListener("loadeddata", tryPlay);
  video.addEventListener("canplay", tryPlay);

  // As a fallback, try to play after user interaction
  const userPlay = () => {
    tryPlay();
    document.removeEventListener("click", userPlay);
    document.removeEventListener("touchstart", userPlay);
  };

  video.addEventListener("loadeddata", () => {
    setTimeout(() => {
      tryPlayVideoWithRetries(video);
    }, 200); // Short delay before attempting playback
  });

  function tryPlayVideoWithRetries(video, attempts = 0) {
    const maxAttempts = 10;
    const delay = 300;

    if (!video.paused && !video.ended && video.readyState >= 3) {
      return; // Already playing
    }

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Success!
        })
        .catch((err) => {
          if (attempts < maxAttempts) {
            setTimeout(() => {
              tryPlayVideoWithRetries(video, attempts + 1);
            }, delay);
          } else {
            console.warn('Video failed to play after retries:', err);
          }
        });
    }
  }
  document.addEventListener("click", userPlay);
  document.addEventListener("touchstart", userPlay);
};

const openZoom = (videoSrc) => {
  const clonedVideo = document.createElement('video');
  clonedVideo.src = videoSrc;
  clonedVideo.autoplay = true;
  clonedVideo.loop = true;
  clonedVideo.muted = true;
  clonedVideo.playsInline = true;
  clonedVideo.style.transform = 'scale(0.8)';

  zoomOverlay.innerHTML = '';
  zoomOverlay.appendChild(clonedVideo);
  zoomOverlay.classList.add('active');

  requestAnimationFrame(() => {
    clonedVideo.style.transform = 'scale(1)';
  });

  zoomOverlay.onclick = () => {
    clonedVideo.style.transform = 'scale(0.8)';
    zoomOverlay.classList.remove('active');
    setTimeout(() => {
      zoomOverlay.innerHTML = '';
    }, 300);
  };
};

const clearAllCards = () => {
  cardContainer.innerHTML = '';
  usedVideos.clear();
  usedIntertitle = false;
  sessionData = [];
  initCards();
};

const initCards = () => {
  for (let i = 0; i < 4; i++) {
    const card = createCard(i);
    cardContainer.appendChild(card);
  }
};

const saveSession = () => {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .split('Z')[0];
  const fileName = `ophiel-${timestamp}.json`;
  const blob = new Blob([JSON.stringify(sessionData)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
};

const loadSession = (data) => {
  clearAllCards();
  sessionData = data;

  data.forEach((item, index) => {
    const card = cardContainer.children[index];
    const videoPath = `assets/${item.type === 'intertitle' ? 'intertitles' : 'videos'}/${item.file}`;
    assignVideoToCard(card, videoPath);
    usedVideos.add(parseInt(item.file.match(/\d+/)[0], 10));
    if (item.type === 'intertitle') usedIntertitle = true;
  });
};

document.getElementById('clearBtn').addEventListener('click', clearAllCards);
document.getElementById('saveSessionBtn').addEventListener('click', saveSession);
document.getElementById('loadSessionBtn').addEventListener('click', () => {
  document.getElementById('fileInput').click();
});
document.getElementById('fileInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      loadSession(data);
    } catch (err) {
      alert('Invalid session file.');
    }
  };
  reader.readAsText(file);
});

initCards();
