let videoId, activeTabId = null;
const store = chrome.storage.local;
let allTimestamps = [];

const list = document.getElementById("list");
const textarea = document.getElementById("bulkInput");
const searchInput = document.getElementById("searchInput");

function sendToTab(message, callback) {
  if (!activeTabId) return;
  chrome.tabs.sendMessage(activeTabId, message, (res) => {
    chrome.runtime.lastError; // Consume error to prevent console noise
    if (callback) callback(res);
  });
}

function render(data) {
  list.innerHTML = "";
  data.forEach(item => {
    const li = document.createElement("li");
    li.className = item.tag ? `tag-${item.tag}` : "tag-blue";
    li.innerHTML = `<span>${item.time} ${item.desc}</span>`;
    li.onclick = () => sendToTab({ action: "seek", time: item.seconds });
    const del = document.createElement("span");
    del.textContent = "✕";
    del.className = "delete-btn";
    del.onclick = (e) => { e.stopPropagation(); deleteTimestamp(item.seconds); };
    li.appendChild(del);
    list.appendChild(li);
  });
}

function deleteTimestamp(seconds) {
  const newData = allTimestamps.filter(i => i.seconds !== seconds);
  store.set({ [videoId]: newData }, () => {
    allTimestamps = newData;
    render(allTimestamps);
    sendToTab({ action: "refreshUI" }); // Instant update on page
  });
}

chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
  const tab = tabs[0];
  if (!tab || !tab.url.includes("v=")) return;
  activeTabId = tab.id;
  videoId = new URL(tab.url).searchParams.get("v");
  store.get(videoId, res => {
    allTimestamps = res[videoId] || [];
    render(allTimestamps);
  });
});

document.getElementById("add").onclick = () => {
  const lines = textarea.value.trim().split("\n");
  const data = [...allTimestamps];
  lines.forEach(line => {
    const timeMatch = line.match(/(\d{1,2}:\d{2}(?::\d{2})?)/);
    if (!timeMatch) return;
    const timeStr = timeMatch[1];
    const parts = timeStr.split(":").map(Number);
    const seconds = parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts[0] * 60 + parts[1];
    data.push({ 
      time: timeStr, 
      desc: line.replace(timeStr, "").trim() || "Note", 
      seconds, 
      tag: document.getElementById("tagSelector").value 
    });
  });
  data.sort((a, b) => a.seconds - b.seconds);
  store.set({ [videoId]: data }, () => {
    allTimestamps = data;
    render(allTimestamps);
    textarea.value = "";
    sendToTab({ action: "refreshUI" }); // Instant update on page
  });
};

document.getElementById("currentTimeBtn").onclick = () => {
  sendToTab({ action: "getTime" }, (res) => {
    if (res?.time) {
      const sec = Math.floor(res.time);
      const h = String(Math.floor(sec / 3600)).padStart(2, "0");
      const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
      const s = String(Math.floor(sec % 60)).padStart(2, "0");
      textarea.value += `${h}:${m}:${s} - `;
    }
  });
};