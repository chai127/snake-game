const settingsPanel = document.getElementById('settings-panel');
window.isMuted = false;
// window.onload = function() { 
document.addEventListener("DOMContentLoaded", function () {
    settingsPanel.innerHTML = `
        <button id="pause" class="settingsBtn">Pause</button>
        <button id="play" class="settingsBtn">Play</button>
        <button id="restart" class="settingsBtn">Restart</button>
        <button id="music-1" class="settingsBtn">Music 1</button>
        <button id="music-2" class="settingsBtn">Music 2</button>
        <button id="mute" class="settingsBtn">Mute</button>
    `;


const allBtns = document.querySelectorAll(".settingsBtn");
const pauseBtn = document.getElementById('pause');
const playBtn = document.getElementById('play');
const restartBtn = document.getElementById('restart'); 
const musicBtn_1 = document.getElementById('music-1');
const musicBtn_2 = document.getElementById('music-2');
const muteBtn = document.getElementById('mute');

window.musicEffects = {
    gameEnd_2 : new Audio('res/audio/game-end.wav'),
    highScore : new Audio('res/audio/high-score-chime.wav'),
    heart : new Audio('res/audio/lose-heart.wav'),
    gameEnd : new Audio('res/audio/losing-bleeps.wav'),
    bgMusic_1 : new Audio('res/audio/music1.mp3'),
    bgMusic_2 : new Audio('res/audio/music2.mp3'),
    score : new Audio('res/audio/score-chime.wav'),
    select : new Audio('res/audio/select.mp3')
};

window.currentMusic = musicEffects.bgMusic_1;

// Set both music tracks to loop
window.musicEffects.bgMusic_1.loop = true;
window.musicEffects.bgMusic_2.loop = true;

    function stopAllMusic() {
        Object.values(musicEffects).forEach(audio => {
        audio.pause();
        audio.currentTime = 0; // reset to start if you want
        });
    }

    addSelectSound(allBtns, musicEffects);
   //this helps pass stuff!
    musicBtn_1.addEventListener('click', function () {
    
    toggleMusic(musicEffects.bgMusic_1, musicEffects.bgMusic_2);
    });
    musicBtn_2.addEventListener('click', function () {
        
    toggleMusic(musicEffects.bgMusic_2, musicEffects.bgMusic_1);
    });
    muteBtn.addEventListener('click', () => {
    isMuted = !isMuted; // toggle the mute state
    
    if (isMuted) {
        stopAllMusic(); // stop all sounds immediately when muted
        muteBtn.textContent = "Unmute"; // optionally update the button text
    } else {
        muteBtn.textContent = "Mute";
        playMusic(musicEffects.bgMusic_1)
    }
});

});//end of the onload thing

function addSelectSound(buttons, musicEffects) {
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
           if (!isMuted) {
                musicEffects.select.play();
            }
        });
    });
}

function toggleMusic(play, stop) {
   currentMusic = play;
   stopMusic(stop);
   playMusic(play);

}

function stopMusic(music){
    music.pause();
    music.currentTime = 0;
}

function playMusic(music){
    if (isMuted) return; // Don't play if muted
    music.currentTime = 0;
    
    music.play().catch((e) => {
        console.warn('Audio failed to play:', e);
    });
}


function isAudioPlaying(audio) {
  return !audio.paused && !audio.ended && audio.currentTime > 0;
}

function checkIfPlaying() {
  const audio = document.getElementById('myAudio');
  return isAudioPlaying(audio);
}
