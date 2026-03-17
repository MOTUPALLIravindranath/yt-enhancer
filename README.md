# yt-enhancer
## YouTube Enhancer  A Chrome extension that lets you add and manage your own timestamp markers on any YouTube video — no more scrubbing around trying to find that one moment.


//// MARCH 17 v1.4.1///////🚀🚀🚀

# YouTube Enhancer & Timestamp Manager (v1.4.1)

A powerful Chrome Extension built for students and developers to manage learning workflows directly on YouTube. Originally designed to streamline **Java and DSA** study sessions by marking key concepts on the timeline.

## 🚀 Key Features

### 1. Visual Timeline Markers
* **Cherry Red Dots:** Custom markers are injected directly into the YouTube progress bar, giving you a visual "map" of your notes.
* **Pro Branding:** Styled with a vibrant red aesthetic to match the native YouTube/Netflix interface.

### 2. Intelligent Chip Bar
* **Auto-Centering Scroll:** The active timestamp chip automatically scrolls into the center of the viewport as the video plays.
* **Frosted Glass UI:** A modern, semi-transparent overlay that stays out of the way while providing high readability.
* **Tag-Based Styling:** Color-coded categories (Red for Important, Green for Concepts, etc.) for quick visual scanning.

### 3. Navigation & UX
* **Alt + Arrow Shortcuts:** Navigate through your custom timestamps using `Alt + Left/Right` without touching the mouse.
* **Instant Seek:** Click any chip to jump to that exact second in the video instantly.

### 4. Engineering Stability
* **Context Invalidation Guard:** Robust logic to prevent script crashes when the extension is updated or the browser context changes.
* **Unlimited Storage:** Utilizes `unlimitedStorage` permissions to handle extensive note-taking across thousands of videos.
* **Silent Ad Skipper:** Automatically accelerates and mutes ads, ensuring an uninterrupted learning experience.

## 🛠️ Installation

1. Clone this repository or download the ZIP.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer Mode** (top right).
4. Click **Load unpacked** and select the project folder.

## 💻 Tech Stack
* **JavaScript (ES6+):** DOM manipulation, MutationObservers, and Chrome API integration.
* **CSS3:** Advanced layouts, backdrop filters, and smooth transition animations.
* **Chrome Storage API:** Persistent data management for video-specific timestamps.
