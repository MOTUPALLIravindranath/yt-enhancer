/* ==================================================
   1. VARIABLES & UTILITIES
   ================================================== */
let video, overlay, timestamps = [], videoId;

function getVideoId() {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("v");
  } catch(e) { return null; }
}

/* ==================================================
   2. UI RENDERERS (DOTS & CHIPS)
   ================================================== */

function renderProgressDots() {
  const bar = document.querySelector(".ytp-progress-bar-container");
  if (!bar || !video?.duration) return;

  const old = document.getElementById("custom-dots-wrapper");
  if (old) old.remove();
  
  const wrapper = document.createElement("div");
  wrapper.id = "custom-dots-wrapper";
  wrapper.className = "custom-marker-wrapper";
  
  timestamps.forEach(t => {
    const dot = document.createElement("div");
    dot.className = "custom-progress-dot";
    dot.style.left = `${(t.seconds / video.duration) * 100}%`;
    
    // Cherry Red palette for a premium feel
    const colors = { red: "#ff0000", green: "#22c55e", yellow: "#eab308", blue: "#ff0000" };
    dot.style.backgroundColor = colors[t.tag] || "#ff0000";
    wrapper.appendChild(dot);
  });
  bar.appendChild(wrapper);
}

function renderUI() {
  const target = document.getElementById("above-the-fold") || document.querySelector("#meta");
  if (!target) return;

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "custom-timeline";
    target.insertAdjacentElement("afterbegin", overlay);
  }
  
  overlay.innerHTML = "";
  if (timestamps.length === 0) { overlay.style.display = "none"; return; }
  overlay.style.display = "flex";

  timestamps.forEach(t => {
    const chip = document.createElement("span");
    chip.className = "timeline-chip";
    const colors = { red: "#ff0000", green: "#22c55e", yellow: "#eab308", blue: "#ff0000" };
    chip.style.borderTop = `3px solid ${colors[t.tag] || "#ff0000"}`;
    chip.textContent = t.time;
    chip.title = t.desc;
    chip.onclick = () => { if(video) { video.currentTime = t.seconds; video.play(); } };
    overlay.appendChild(chip);
  });
}

/* ==================================================
   3. AUTO-SCROLL & HIGHLIGHT
   ================================================== */

function highlightActive() {
  if (!overlay || !video || !overlay.children.length) return;
  
  let activeIndex = -1;
  for (let i = 0; i < timestamps.length; i++) {
    if (video.currentTime >= timestamps[i].seconds) activeIndex = i;
  }

  const chips = overlay.children;
  if (activeIndex >= 0 && chips[activeIndex]) {
    for (let i = 0; i < chips.length; i++) {
      chips[i].classList.toggle("active", i === activeIndex);
    }
    // Centering the active chip for Java/DSA study focus
    chips[activeIndex].scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center"
    });
  }
}

/* ==================================================
   4. AD SKIPPER
   ================================================== */

function handleAds() {
  const videoEl = document.querySelector("video");
  const player = document.querySelector(".html5-video-player");
  if (player?.classList.contains("ad-showing") && videoEl) {
    videoEl.playbackRate = 16.0;
    videoEl.muted = true;
    document.querySelector(".ytp-ad-skip-button, .ytp-ad-skip-button-modern")?.click();
  } else if (videoEl && videoEl.playbackRate > 2.0) {
    videoEl.playbackRate = 1.0;
    videoEl.muted = false;
  }
}

/* ==================================================
   5. INITIALIZATION & CONTEXT GUARD (THE FIX)
   ================================================== */

function init() {
  // CRITICAL: Check if extension was reloaded to prevent "context invalidated" crash
  if (!chrome.runtime?.id || !chrome.storage?.local) return;

  video = document.querySelector("video");
  videoId = getVideoId();
  if (!video || !videoId) return;

  try {
    chrome.storage.local.get(videoId, res => {
      if (chrome.runtime.lastError) return; // Immediate exit on invalidation
      timestamps = res[videoId] || [];
      renderUI();
      if (video.duration) renderProgressDots();
      else video.addEventListener('loadedmetadata', renderProgressDots, { once: true });
    });
  } catch (e) {
    console.info("[Timestamps] Context invalidated. Please refresh the page.");
  }

  video.removeEventListener("timeupdate", highlightActive);
  video.addEventListener("timeupdate", highlightActive);
}

/* ==================================================
   6. LISTENERS & OBSERVERS
   ================================================== */

chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
  if (!chrome.runtime?.id) return false; // Prevent crash on message
  if (msg.action === "refreshUI") { init(); sendResponse({ ok: true }); }
  if (msg.action === "getTime") sendResponse({ time: video?.currentTime });
  if (msg.action === "seek" && video) video.currentTime = msg.time;
  return true; 
});

const observer = new MutationObserver(() => {
  // Kill switch: Stop observing if extension context is gone
  if (!chrome.runtime?.id) {
    observer.disconnect();
    return;
  }

  handleAds();
  
  const hasChips = document.getElementById("custom-timeline");
  const hasDots = document.getElementById("custom-dots-wrapper");
  
  if (getVideoId() && (!hasChips || !hasDots) && timestamps.length > 0) {
    init();
  }
});

observer.observe(document.body, { childList: true, subtree: true });

document.addEventListener("yt-navigate-finish", () => {
  if (chrome.runtime?.id) init();
});

// Initial load call
init();