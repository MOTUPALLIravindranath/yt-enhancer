let video, overlay, timestamps = [], videoId;

function getVideoId() {
  return new URL(location.href).searchParams.get("v");
}

function createOverlay() {
  if (overlay) return;

  const player = document.querySelector("#player");
  if (!player) return;

  overlay = document.createElement("div");
  overlay.id = "custom-timeline";
  player.parentElement.insertBefore(overlay, player.nextSibling);
}

function renderOverlay() {
  if (!overlay) return;
  overlay.innerHTML = "";

  timestamps.forEach(t => {
    const chip = document.createElement("span");
    chip.className = "timeline-chip";
    chip.textContent = t.time;
    chip.onclick = () => {
      video.currentTime = t.seconds;
      video.play();
    };
    overlay.appendChild(chip);
  });
}

function highlightActive() {
  let active = -1;
  timestamps.forEach((t, i) => {
    if (video.currentTime >= t.seconds) active = i;
  });

  [...overlay.children].forEach((c, i) =>
    c.classList.toggle("active", i === active)
  );
}

chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
  if (!video) return;
  if (msg.action === "seek") video.currentTime = msg.time;
  if (msg.action === "getTime") sendResponse({ time: video.currentTime });
});

function init() {
  video = document.querySelector("video");
  if (!video) return;

  videoId = getVideoId();

  chrome.storage.local.get(videoId, res => {
    timestamps = res[videoId] || [];
    if (timestamps.length) {
      createOverlay();
      renderOverlay();
    }
  });

  chrome.storage.onChanged.addListener(changes => {
    if (changes[videoId]) {
      timestamps = changes[videoId].newValue || [];
      createOverlay();
      renderOverlay();
    }
  });

  video.addEventListener("timeupdate", highlightActive);
}

const obs = new MutationObserver(() => {
  if (document.querySelector("video")) {
    obs.disconnect();
    init();
  }
});

obs.observe(document.body, { childList: true, subtree: true });
