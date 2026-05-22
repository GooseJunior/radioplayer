const audio = document.getElementById('radio-audio');
const playBtn = document.getElementById('play-btn');
const volumeSlider = document.getElementById('volume-slider');
const statusText = document.getElementById('status');

let isPlaying = false;

playBtn.addEventListener('click', () => {
    if (!isPlaying) {
        // Reload stream source on play to prevent lag accumulation from live stream buffers
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

// Handle volume adjustments
volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
});
