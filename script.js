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
  card.innerHTML = `<img src="./assets/placeholder.jpg" alt="Placeholder" />`;
  card.addEventListener('click', () => onCardClick(card, index));
  return card;
};

const generateVideoFilename = (prefix, number) =>
  `${prefix}${String(number).padStart(3, '0')}.webm`;

const getUniqueRandom = (total, usedSet) => {
  let num;
  do {
    num = Math.floor(Math.random() * total) + 1;
  } while (usedSet.has(num));
  usedSet.add(num);
  return num;
};

const assignVideoToCard = (card, videoSrc) => {
  card.dataset.revealed = 'true';
  const videoWrapper = document.createElement('div');
  videoWrapper.classList.add('videoWrapper');

  const video = document.createElement('video');
  video.src = videoSrc;
  video.muted = true;
  video.autoplay = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute("muted", "true");

  const zoomBtn = document.createElement('button');
  zoomBtn.classList.add('zoomButton');
  zoomBtn.innerText = '⤢';
  zoomBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openZoom(videoSrc);
  });

  videoWrapper.appendChild(video);
  videoWrapper.appendChild(zoomBtn);
  card.innerHTML = '';
  card.appendChild(videoWrapper);

  video.addEventListener("loadeddata", () => {
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn("Play failed:", err);
      });
    }
  });

  // iOS and Firefox workaround
  document.body.addEventListener('touchstart', () => {
    video.play().catch(() => {});
  }, { once: true });

  document.body.addEventListener('click', () => {
    video.play().catch(() => {});
  }, { once: true });
};

const onCardClick = (card, index) => {
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

const openZoom = (videoSrc) => {
  const zoomVideo = document.createElement('video');
  zoomVideo.src = videoSrc;
  zoomVideo.autoplay = true;
  zoomVideo.loop = true;
  zoomVideo.muted = true;
  zoomVideo.playsInline = true;

  zoomOverlay.innerHTML = '';
  zoomOverlay.appendChild(zoomVideo);
  zoomOverlay.classList.add('active');

  zoomOverlay.onclick = () => {
    zoomOverlay.classList.remove('active');
    setTimeout(() => {
      zoomOverlay.innerHTML = '';
    }, 300);
  };

  zoomVideo.addEventListener("loadeddata", () => {
    zoomVideo.play().catch(err => console.warn("Zoom video play failed:", err));
  });
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
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const blob = new Blob([JSON.stringify(sessionData)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `ophiel-${timestamp}.json`;
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
