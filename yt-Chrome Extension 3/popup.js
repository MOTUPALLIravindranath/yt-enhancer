let videoId;
const list = document.getElementById("list");
const textarea = document.getElementById("bulkInput");

function render(data) {
  list.innerHTML = "";
  data.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.time} ${item.desc}`;

    li.onclick = () => {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "seek",
          time: item.seconds
        });
      });
    };

    list.appendChild(li);
  });
}

chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
  videoId = getVideoId(tabs[0].url);
  if (!videoId) return;

  chrome.storage.local.get(videoId, res => {
    render(res[videoId] || []);
  });
});

document.getElementById("currentTimeBtn").onclick = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "getTime" },
      res => {
        if (!res) return;
        textarea.value += `${secondsToTime(res.time)} \n`;
      }
    );
  });
};

document.getElementById("add").onclick = () => {
  const lines = textarea.value.trim().split("\n");
  if (!videoId) return;

  chrome.storage.local.get(videoId, res => {
    const data = res[videoId] || [];

    lines.forEach(line => {
      const m = line.match(/^(\d{2}:\d{2}:\d{2})\s+(.+)$/);
      if (!m) return;

      const seconds = timeToSeconds(m[1]);
      if (!data.some(d => d.seconds === seconds)) {
        data.push({ time: m[1], desc: m[2], seconds });
      }
    });

    data.sort((a, b) => a.seconds - b.seconds);

    chrome.storage.local.set({ [videoId]: data }, () => {
      render(data);
      textarea.value = "";
    });
  });
};

document.getElementById("exportTxt").onclick = () => {
  chrome.storage.local.get(videoId, res => {
    const text = (res[videoId] || [])
      .map(i => `${i.time} ${i.desc}`)
      .join("\n");
    navigator.clipboard.writeText(text);
  });
};

document.getElementById("exportJson").onclick = () => {
  chrome.storage.local.get(videoId, res => {
    const blob = new Blob(
      [JSON.stringify(res[videoId] || [], null, 2)],
      { type: "application/json" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "timestamps.json";
    a.click();
  });
};

document.getElementById("importJson").onchange = e => {
  const reader = new FileReader();
  reader.onload = () => {
    const data = JSON.parse(reader.result);
    chrome.storage.local.set({ [videoId]: data }, () => render(data));
  };
  reader.readAsText(e.target.files[0]);
};
