const audio = document.getElementById('radio-audio');
const playBtn = document.getElementById('play-btn');
const volumeSlider = document.getElementById('volume-slider');
const statusText = document.getElementById('status');

// Metadata DOM Elements
const trackTitleElem = document.getElementById('track-title');
const artistNameElem = document.getElementById('artist-name');
const historyListElem = document.getElementById('history-list');

// REPLACE THIS with your actual Radio API Endpoint URL
const API_URL = "https://demo.azuracast.com/api/nowplaying/1"; 

let isPlaying = false;
let currentSongTitle = "";

// 1. Audio Control Logic
playBtn.addEventListener('click', () => {
    if (!isPlaying) {
        audio.load(); 
        audio.play()
            .then(() => {
                isPlaying = true;
                playBtn.innerText = '⏸ Pause';
                statusText.innerText = 'Status: Live 🔴';
            })
            .catch(error => {
                console.error("Playback failed:", error);
                statusText.innerText = 'Error loading stream.';
            });
    } else {
        audio.pause();
        isPlaying = false;
        playBtn.innerText = '▶ Play';
        statusText.innerText = 'Status: Paused';
    }
});

volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
});


// 2. Metadata & History Logic
async function fetchMetadata() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network response error');
        
        const data = await response.json();
        
        // This structural paths standard mapping matches AzuraCast.
        // Adjust these paths depending on your specific streaming service API layout
        const liveTrack = data.now_playing.song.title;
        const liveArtist = data.now_playing.song.artist;
        const songHistory = data.song_history || [];

        // Update current UI text
        trackTitleElem.innerText = liveTrack || "Unknown Title";
        artistNameElem.innerText = liveArtist || "Unknown Artist";

        // Update the recently played track history visually
        updateHistoryUI(songHistory);

    } catch (error) {
        console.error("Failed to fetch stream metadata:", error);
        trackTitleElem.innerText = "Live Broadcast Stream";
        artistNameElem.innerText = "";
    }
}

function updateHistoryUI(historyArray) {
    // Clear out old data
    historyListElem.innerHTML = '';

    if (historyArray.length === 0) {
        historyListElem.innerHTML = '<li class="empty-history">No history available yet</li>';
        return;
    }

    // Loop through the historical tracks provided by your API data array
    historyArray.forEach(item => {
        const li = document.createElement('li');
        const title = item.song.title;
        const artist = item.song.artist;
        
        li.innerText = `${artist} - ${title}`;
        historyListElem.appendChild(li);
    });
}

// Fetch metadata instantly on page load
fetchMetadata();

// Continuously poll the API server for track changes every 15 seconds
setInterval(fetchMetadata, 15000);
