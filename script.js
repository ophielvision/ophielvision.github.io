const NUM_VIDEOS = 116;
const NUM_INTERTITLES = 207;
const cards = [];
let usedVideos = new Set();
let usedIntertitles = new Set();
let currentSession = [null, null, null, null];
let intertitleCardIndex = -1;

const cardContainer = document.getElementById("cardContainer");

function getRandomAvailableVideo(isIntertitle = false) {
  const max = isIntertitle ? NUM_INTERTITLES : NUM_VIDEOS;
  const used = isIntertitle ? usedIntertitles : usedVideos;
  let index;
  do {
    index = Math.floor(Math.random() * max) + 1;
  } while (used.has(index) && used.size < max);
  used.add(index);
  const padded = String(index).padStart(3, "0");
  const folder = isIntertitle ? "intertitles" : "videos";
  return `assets/${folder}/${isIntertitle ? "intertitle" : "video"}${padded}.webm`;
}

function createCard(index) {
  const card = document.createElement("div");
  card.classList.add("card");

  const img = document.createElement("img");
  img.src = "assets/placeholder.jpg";
  img.alt = "Placeholder";

  card.appendChild(img);

  card.addEventListener("click", () => {
    if (currentSession[index]) return;
    let videoSrc;
    if (index === intertitleCardIndex) {
      videoSrc = getRandomAvailableVideo(true);
    } else {
      videoSrc = getRandomAvailableVideo(false);
    }
    currentSession[index] = videoSrc;
    revealCard(card, videoSrc);
  });

  cards.push(card);
  return card;
}

function revealCard(card, videoSrc) {
  card.innerHTML = `
    <div class="videoWrapper">
      <video src="${videoSrc}" autoplay loop muted playsinline></video>
      <button class="zoomButton">Zoom</button>
    </div>
  `;

  const zoomButton = card.querySelector(".zoomButton");
  zoomButton.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleExpandVideo(card);
  });
}

function toggleExpandVideo(card) {
  card.classList.toggle("expanded");
}

function clearAllCards() {
  cardContainer.innerHTML = "";
  cards.length = 0;
  usedVideos.clear();
  usedIntertitles.clear();
  currentSession = [null, null, null, null];
  intertitleCardIndex = Math.floor(Math.random() * 4);
  for (let i = 0; i < 4; i++) {
    const card = createCard(i);
    cardContainer.appendChild(card);
  }
}

function saveSession() {
  const timestamp = new Date()
    .toISOString()
    .replace(/T/, "_")
    .replace(/:/g, "-")
    .replace(/\..+/, "");
  const data = {
    session: currentSession,
    intertitleCardIndex,
  };
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ophiel-${timestamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function loadSession() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.addEventListener("change", () => {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data.session) && data.session.length === 4) {
          currentSession = data.session;
          intertitleCardIndex = data.intertitleCardIndex;
          usedVideos.clear();
          usedIntertitles.clear();
          cardContainer.innerHTML = "";
          cards.length = 0;
          data.session.forEach((videoSrc, i) => {
            const card = document.createElement("div");
            card.classList.add("card");
            if (videoSrc) {
              currentSession[i] = videoSrc;
              if (videoSrc.includes("intertitle")) {
                usedIntertitles.add(
                  parseInt(videoSrc.match(/intertitle(\d+)/)[1])
                );
              } else {
                usedVideos.add(parseInt(videoSrc.match(/video(\d+)/)[1]));
              }
              revealCard(card, videoSrc);
            } else {
              const img = document.createElement("img");
              img.src = "assets/placeholder.jpg";
              img.alt = "Placeholder";
              card.appendChild(img);
              card.addEventListener("click", () => {
                if (currentSession[i]) return;
                let newSrc;
                if (i === intertitleCardIndex) {
                  newSrc = getRandomAvailableVideo(true);
                } else {
                  newSrc = getRandomAvailableVideo(false);
                }
                currentSession[i] = newSrc;
                revealCard(card, newSrc);
              });
            }
            cards.push(card);
            cardContainer.appendChild(card);
          });
        }
      } catch (err) {
        console.error("Error loading session:", err);
      }
    };
    reader.readAsText(file);
  });
  input.click();
}

document.getElementById("clearBtn").addEventListener("click", clearAllCards);
document.getElementById("saveSessionBtn").addEventListener("click", saveSession);
document.getElementById("loadSessionBtn").addEventListener("click", loadSession);

clearAllCards(); // initialize
