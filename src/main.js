/**
 * EcoCast Podcast — Audio Player
 *
 * Wires up the custom play/pause button and progress bar
 * to the native <audio> element.  No external libraries needed.
 */

const audio       = document.getElementById('podcast-audio');
const playBtn     = document.getElementById('play-btn');
const iconPlay    = document.getElementById('icon-play');
const iconPause   = document.getElementById('icon-pause');
const progressFill  = document.getElementById('progress-fill');
const progressTrack = document.getElementById('progress-track');
const currentTimeEl = document.getElementById('current-time');
const totalDurationEl = document.getElementById('total-duration');

// ── Helpers ──────────────────────────────────────────────────

/** Format seconds as m:ss */
function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/** Update the progress bar fill and ARIA value */
function updateProgress() {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  progressFill.style.width = `${pct}%`;
  progressTrack.setAttribute('aria-valuenow', Math.round(pct));
  currentTimeEl.textContent = formatTime(audio.currentTime);
}

/** Switch between play and pause icons */
function setPlayingState(playing) {
  iconPlay.classList.toggle('hidden', playing);
  iconPause.classList.toggle('hidden', !playing);
  playBtn.setAttribute('aria-label', playing ? 'Pause episode' : 'Play episode');
}

// ── Event listeners ───────────────────────────────────────────

/* Show total duration once metadata is loaded */
audio.addEventListener('loadedmetadata', () => {
  totalDurationEl.textContent = formatTime(audio.duration);
  progressTrack.setAttribute('aria-valuemax', Math.round(audio.duration));
});

/* Keep progress bar in sync while playing */
audio.addEventListener('timeupdate', updateProgress);

/* Reset icon when playback ends naturally */
audio.addEventListener('ended', () => setPlayingState(false));

/* Play / Pause toggle */
playBtn.addEventListener('click', () => {
  if (audio.paused) {
    audio.play();
    setPlayingState(true);
  } else {
    audio.pause();
    setPlayingState(false);
  }
});

/* Seek by clicking on the progress track */
progressTrack.addEventListener('click', (e) => {
  if (!audio.duration) return;
  const rect = progressTrack.getBoundingClientRect();
  const ratio = (e.clientX - rect.left) / rect.width;
  audio.currentTime = ratio * audio.duration;
});

/* Keyboard seeking on the progress track (← / → arrows) */
progressTrack.addEventListener('keydown', (e) => {
  if (!audio.duration) return;
  const step = 5; // seconds
  if (e.key === 'ArrowRight') {
    audio.currentTime = Math.min(audio.currentTime + step, audio.duration);
  } else if (e.key === 'ArrowLeft') {
    audio.currentTime = Math.max(audio.currentTime - step, 0);
  }
});
