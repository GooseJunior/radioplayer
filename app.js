const audio = document.getElementById('radio-audio');
const heroPlayBtn = document.getElementById('hero-play-btn');
const barPlayBtn = document.getElementById('bar-play-btn');
const volumeSlider = document.getElementById('volume-slider');

// Metadata DOM elements
const trackTitle = document.getElementById('track-title');
const artistName = document.getElementById('artist-name');
const albumArt = document.getElementById('album-art');

const barTrackTitle = document.getElementById('bar-track-title');
const barArtistName = document.getElementById('bar-artist-name');
const barAlbumArt = document.getElementById('bar-album-art');

const historyGrid = document.getElementById('history-grid');

// Modal Elements
const historyModal = document.getElementById('history-modal');
const viewAllBtn = document.getElementById('view-all-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const fullHistoryList = document.getElementById('full-history-list');

const DEFAULT_ART = "https://placehold.co/400x400/999/fff?text=90.3 WJCE";
const API_URL = "https://socast-public.s3.amazonaws.com/player/np_2169_1980.js"; 

let isPlaying = false;

// Universal sync playback toggler
function togglePlayback() {
    if (!isPlaying) {
        audio.load();
        audio.play()
            .then(() => {
                isPlaying = true;
                updatePlayButtons('⏸');
            })
            .catch(err => console.log("Stream play blocked or failed: ", err));
    } else {
        audio.pause();
        isPlaying = false;
        updatePlayButtons('▶');
    }
}

function updatePlayButtons(icon) {
    heroPlayBtn.innerText = icon;
    barPlayBtn.innerText = icon;
    if(isPlaying) {
        heroPlayBtn.classList.add('playing');
    } else {
        heroPlayBtn.classList.remove('playing');
    }
}

heroPlayBtn.addEventListener('click', togglePlayback);
barPlayBtn.addEventListener('click', togglePlayback);
volumeSlider.addEventListener('input', (e) => audio.volume = e.target.value);

// Modal Show/Hide
viewAllBtn.addEventListener('click', () => historyModal.style.display = 'block');
closeModalBtn.addEventListener('click', () => historyModal.style.display = 'none');
window.addEventListener('click', (e) => {
    if (e.target === historyModal) historyModal.style.display = 'none';
});

// Fetch API metadata
async function fetchMetadata() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Data missing");
        const data = await response.json();

        const current = data.now_playing.song;
        const history = data.song_history || [];

        // Update main and bottom layouts concurrently
        const titleText = current.title || "All Your Favorite Country Music";
        const artistText = current.artist || "90.3 WJCE";
        const artUrl = current.art || DEFAULT_ART;

        trackTitle.innerText = titleText;
        artistName.innerText = artistText;
        albumArt.src = artUrl;

        barTrackTitle.innerText = titleText;
        barArtistName.innerText = artistText;
        barAlbumArt.src = artUrl;

        // Populate grids and listings
        renderHistoryGrid(history);
        renderFullHistoryModal(history);

    } catch (error) {
        console.error("Error reading api data stream:", error);
    }
}

// Render exactly 5 items cleanly in grid layout
function renderHistoryGrid(historyArray) {
    historyGrid.innerHTML = '';
    
    // Take up to 5 items max
    const displayList = historyArray.slice(0, 5);

    // If API returns fewer items, fill up empty cells to keep styling structure consistent
    while(displayList.length < 5) {
        displayList.push({ song: { title: "Song Title", artist: "Artist", art: DEFAULT_ART } });
    }

    displayList.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('grid-item');

        const artWrapper = document.createElement('div');
        artWrapper.classList.add('grid-art-wrapper');

        const img = document.createElement('img');
        img.src = item.song.art || DEFAULT_ART;
        // Fix for missing image URLs returning broken icons
        img.onerror = function() { this.src = DEFAULT_ART; };

        const titleSpan = document.createElement('span');
        titleSpan.classList.add('grid-title');
        titleSpan.innerText = item.song.title;

        const artistSpan = document.createElement('span');
        artistSpan.classList.add('grid-artist');
        artistSpan.innerText = item.song.artist;

        artWrapper.appendChild(img);
        itemDiv.appendChild(artWrapper);
        itemDiv.appendChild(titleSpan);
        itemDiv.appendChild(artistSpan);

        historyGrid.appendChild(itemDiv);
    });
}

// Render the remaining history inside modal overlay menu drawer
function renderFullHistoryModal(historyArray) {
    fullHistoryList.innerHTML = '';
    if(historyArray.length === 0) {
        fullHistoryList.innerHTML = '<li>No extended history found.</li>';
        return;
    }
    historyArray.forEach(item => {
        const li = document.createElement('li');
        li.innerText = `${item.song.artist} — ${item.song.title}`;
        fullHistoryList.appendChild(li);
    });
}

// Polling interval cycle loops
fetchMetadata();
setInterval(fetchMetadata, 15000);
