const audio = document.getElementById('radio-audio');
const playBtn = document.getElementById('play-btn');
const volumeSlider = document.getElementById('volume-slider');
const statusText = document.getElementById('status');

// Metadata & Image DOM Elements
const trackTitleElem = document.getElementById('track-title');
const artistNameElem = document.getElementById('artist-name');
const albumArtElem = document.getElementById('album-art');
const historyListElem = document.getElementById('history-list');

// Placeholder fallback image URL if API doesn't return one
const DEFAULT_ART = "https://placehold.co/300x300/1e1e2f/ffffff?text=Radio";

const API_URL = "https://demo.azuracast.com/api/nowplaying/1"; 

let isPlaying = false;

// Audio Controls
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

// Fetching Data with Images
async function fetchMetadata() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network response error');
        
        const data = await response.json();
        
        // Mapping paths based on standard AzuraCast JSON schemas
        const liveTrack = data.now_playing.song.title;
        const liveArtist = data.now_playing.song.artist;
        const liveArt = data.now_playing.song.art; // Image URL path key
        const songHistory = data.song_history || [];

        // Update Text Info
        trackTitleElem.innerText = liveTrack || "Unknown Title";
        artistNameElem.innerText = liveArtist || "Unknown Artist";

        // Update Main Album Artwork Image
        albumArtElem.src = liveArt || DEFAULT_ART;

        // Process History List
        updateHistoryUI(songHistory);

    } catch (error) {
        console.error("Failed to fetch stream metadata:", error);
        trackTitleElem.innerText = "Live Broadcast Stream";
        artistNameElem.innerText = "";
        albumArtElem.src = DEFAULT_ART;
    }
}

function updateHistoryUI(historyArray) {
    historyListElem.innerHTML = '';

    if (historyArray.length === 0) {
        historyListElem.innerHTML = '<li class="empty-history">No history available yet</li>';
        return;
    }

    historyArray.forEach(item => {
        const li = document.createElement('li');
        
        // Create small thumbnail image element
        const img = document.createElement('img');
        img.classList.add('history-art');
        img.src = item.song.art || DEFAULT_ART;
        img.alt = "Track Art";

        // Create metadata layout container wrapper
        const detailsDiv = document.createElement('div');
        detailsDiv.classList.add('history-details');

        const titleSpan = document.createElement('span');
        titleSpan.classList.add('history-title');
        titleSpan.innerText = item.song.title;

        const artistSpan = document.createElement('span');
        artistSpan.classList.add('history-artist');
        artistSpan.innerText = item.song.artist;

        // Assembly
        detailsDiv.appendChild(titleSpan);
        detailsDiv.appendChild(artistSpan);
        
        li.appendChild(img);
        li.appendChild(detailsDiv);
        
        historyListElem.appendChild(li);
    });
}

// Init
fetchMetadata();
setInterval(fetchMetadata, 15000);
