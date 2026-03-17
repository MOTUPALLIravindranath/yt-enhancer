// FIX: Original timeToSeconds destructured as [h, m, s] which breaks MM:SS format
// (h becomes minutes, m becomes seconds, s becomes NaN → wrong result)
function timeToSeconds(time) {
  const parts = time.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

// Outputs HH:MM:SS always (used by contentScript capture button)
function secondsToTime(sec) {
  const h = String(Math.floor(sec / 3600)).padStart(2, "0");
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
  const s = String(Math.floor(sec % 60)).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function getVideoId(url) {
  try {
    return new URL(url).searchParams.get("v");
  } catch {
    return null;
  }
}
