//background carousel
document.addEventListener("DOMContentLoaded", function() {
    const hour = new Date().getHours();
    const body = document.body;

    let backgroundImg = "";

    if(hour>=4 && hour<=9){
        backgroundImg = './assets/morning-bg.jpg';
    }else if(hour>=10 && hour<=14){
        backgroundImg = './assets/day-bg.jpg';
    }else if(hour>=15 && hour<=17){
        backgroundImg = './assets/afternoon-bg.jpg';
    }else{
        backgroundImg = './assets/night-bg.jpeg';
    }
    body.style.backgroundImage = `url('${backgroundImg}')`;
    body.style.backgroundSize = "cover";
    body.style.backgroundPosition = "center";
    body.style.position = "relative";

});

//for character update
const characters = [
    './assets/finn.png',
    './assets/jake.png',
    './assets/princess_bubblegum.png',
    './assets/marceline.png',
    './assets/iceking.png',
];

const charAnimate = {
    0: ["./assets/fin-walk-left.png", "./assets/fin-walk-right.png"],
    1: ["./assets/jake-walk-left.png", "./assets/jake-walk-right.png"],
    2: ["./assets/princess_bubblegum_walk.png"],
    3: ["./assets/marceline_walk_left.png", "./assets/marceline_walk_right.png"],
    4: ["./assets/iceking_walk.png"],
};

let currentCharIndex = 0;
let walkInterval;
//to update character
function updateCharacter(){
    const characterImg = document.getElementById('character-img');
    characterImg.src = characters[currentCharIndex];
    moveChar();
}

function moveChar() {
    const characterImg = document.getElementById("character-img");
    const images = charAnimate[currentCharIndex];

    if (walkInterval) clearInterval(walkInterval); 

    if (images.length === 1) {
        characterImg.src = images[0];
        characterImg.classList.add("animate-float");
    } else {
        characterImg.classList.remove("animate-float");
        let frame = 0;
        walkInterval = setInterval(() => {
            characterImg.src = images[frame];
            frame = (frame + 1) % images.length;
        }, 300);
    }
}

//previous character
document.getElementById('prev-char').addEventListener('click', ()=>{
    currentCharIndex = (currentCharIndex-1 + characters.length)%characters.length;
    updateCharacter();
});
//next character
document.getElementById('next-char').addEventListener('click', ()=>{
    currentCharIndex = (currentCharIndex+1)%characters.length;
    updateCharacter();
});
updateCharacter();

//start button transition
const startButton = document.getElementById('start');
const startImg = document.getElementById('start-img');
startButton.addEventListener('mouseenter', ()=>{
    startImg.src = 'assets/start-hover.png';
});
startButton.addEventListener('mouseleave', ()=>{
    startImg.src = 'assets/start.png';
});
startButton.addEventListener('click', () => {
    startImg.src = 'assets/start-hover.png';
});
//start click to the main game
startButton.addEventListener('click', ()=>{
    const username = document.getElementById('username').value;
    if(username){
        window.location.href = `mainGame.html?character=${currentCharIndex+1}&username=${username}`;
    }else{
        alert("Please enter your username!");
    }
});