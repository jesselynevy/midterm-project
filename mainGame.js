document.addEventListener("DOMContentLoaded", function () {
    let now = new Date();
    let gameHour = now.getHours();
    let gameMinute = now.getMinutes();
    let gameDayIndex = now.getDay();
    const daysWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    function updateBackground(hour) {
        const body = document.body;
        let backgroundImg = "";
        let greeting = document.getElementById("greetings");
        let username = localStorage.getItem("username");
        
        if (hour >= 4 && hour <= 9) {
            greeting.innerHTML = `Good Morning, ${username}!`;
            backgroundImg = './assets/backgroundAsset/morning-bg.jpg';
        } else if (hour >= 10 && hour <= 14) {
            greeting.innerHTML = `Good Day, ${username}!`;
            backgroundImg = './assets/backgroundAsset/day-bg.jpg';
        } else if (hour >= 15 && hour <= 18) {
            greeting.innerHTML = `Good Afternoon, ${username}!`;
            backgroundImg = './assets/backgroundAsset/afternoon-bg.jpg';
        } else {
            greeting.innerHTML = `Good Night, ${username}!`;
            backgroundImg = './assets/backgroundAsset/night-bg.jpeg';
        }

        body.style.backgroundImage = `url('${backgroundImg}')`;
        body.style.backgroundSize = "cover";
        body.style.backgroundPosition = "center";
        body.style.position = "relative";
    }

    function startTime() {
        gameMinute += 1;  //1 real second = 1 in-game minute

        if (gameMinute >= 60) { 
            gameMinute = 0;
            gameHour += 1;

            if (gameHour >= 24) { 
                gameHour = 0;
                gameDayIndex = (gameDayIndex + 1) % 7;
            }
        }

        let formattedHour = gameHour.toString().padStart(2, '0');
        let formattedMinute = gameMinute.toString().padStart(2, '0');
        let gameDay = daysWeek[gameDayIndex];

        document.getElementById("dayNtime").innerHTML = `${gameDay} | ${formattedHour}:${formattedMinute}`;
        updateBackground(gameHour);
    }

    startTime();
    setInterval(startTime, 1000);  
    displayUserCharacter();
});

function displayUserCharacter(){
    let userCharIndex = parseInt(localStorage.getItem('character'));
    let characterImg = document.getElementById('display-char');

    const characters = [
        './assets/finnSprite/finn.png',
        './assets/jakeSprite/jake.png',
        '/assets/princessBubblegumSprite/princess-bubblegum.png',
        './assets/marcelineSprite/marceline.png',
        './assets/iceKingSprite/ice-king.png',
    ];

    characterImg.src = characters[userCharIndex];
}

var character = document.querySelector(".character");
var map = document.querySelector(".map");

// Character starting positions
const startPositions = [
    { x: 548, y: 309 }, // Finn - Tree
    { x: 548, y: 309 }, // Jake - Tree
    { x: 214, y: 189 }, // Princess Bubblegum - Bubblegum
    { x: 714, y: 690 }, // Marceline - Batcave
    { x: 666, y: 117 }  // Ice King - Ice
];

var held_directions = []; // State of which arrow keys we are holding down
var speed = 3; // Character movement speed in pixels per frame

const characters = [
    './assets/finnSprite/finn.png',
    './assets/jakeSprite/jake.png',
    './assets/princessBubblegumSprite/princess-bubblegum.png',
    './assets/marcelineSprite/marceline.png',
    './assets/iceKingSprite/ice-king.png',
];

const charAnimate = {
    0: ["./assets/finnSprite/fin-walk-left.png", "./assets/finnSprite/fin-walk-right.png"],
    1: ["./assets/jakeSprite/jake-walk-left.png", "./assets/jakeSprite/jake-walk-right.png"],
    2: ["./assets/princessBubblegumSprite/princess-bubblegum-walk.png"],
    3: ["./assets/marcelineSprite/marceline-walk-left.png", "./assets/marcelineSprite/marceline-walk-right.png"],
    4: ["./assets/iceKingSprite/ice-king-walk.png"],
};

const characterSprite = document.querySelector(".character_spritesheet");
let currentCharIndex = parseInt(localStorage.getItem('character')) || 0;
let { x, y } = startPositions[currentCharIndex]; // Set character's starting position

characterSprite.style.backgroundImage = `url(${characters[currentCharIndex]})`;
console.log(characters[currentCharIndex]);

let walkFrame = 0;
setInterval(() => {
    if(held_directions.length > 0){
        walkFrame = (walkFrame + 1) % charAnimate[currentCharIndex].length;
        characterSprite.style.backgroundImage = `url('${charAnimate[currentCharIndex][walkFrame]}')`;
    }
}, 150);
const updateCharacterSprite = () => {
    if (held_directions.length === 0) {
        characterSprite.style.backgroundImage = `url('${characters[currentCharIndex]}')`;
    }
};

const placeCharacter = () => {
    var pixelSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--pixel-size'));
    const held_direction = held_directions[0];
    
    if (held_direction) {
        if (held_direction === directions.right) { x += speed; }
        if (held_direction === directions.left) { x -= speed; }
        if (held_direction === directions.down) { y += speed; }
        if (held_direction === directions.up) { y -= speed; }
        updateCharacterSprite();
    }
    
    character.setAttribute("walking", held_direction ? "true" : "false");

    // Map boundaries
    var leftLimit = 16;
    var rightLimit = 920;
    var topLimit = 20;
    var bottomLimit = 755;
    if (x < leftLimit) { x = leftLimit; }
    if (x > rightLimit) { x = rightLimit; }
    if (y < topLimit) { y = topLimit; }
    if (y > bottomLimit) { y = bottomLimit; }
    console.log("x:", x, "y:", y);
    var camera_left = pixelSize * 66;
    var camera_top = pixelSize * 42;
    map.style.transform = `translate3d( ${-x * pixelSize + camera_left}px, ${-y * pixelSize + camera_top}px, 0 )`;
    character.style.transform = `translate3d( ${x * pixelSize}px, ${y * pixelSize}px, 0 )`;
};

const step = () => {
    placeCharacter();
    updateCharacterSprite(); // Only resets to idle
    window.requestAnimationFrame(step);
 };
 step();

/* Direction key state */
let isActivityInProgress = false;
const directions = { up: "up", down: "down", left: "left", right: "right" };
const keys = { 38: directions.up, 87: directions.up, 37: directions.left, 65: directions.left, 39: directions.right, 68: directions.right, 40: directions.down, 83: directions.down };

document.addEventListener("keydown", (e) => {
    if (isActivityInProgress) return;
    var dir = keys[e.which];
    if (dir && held_directions.indexOf(dir) === -1) {
        held_directions.unshift(dir);
    }
});

document.addEventListener("keyup", (e) => {
    if (isActivityInProgress) return;
    var dir = keys[e.which];
    var index = held_directions.indexOf(dir);
    if (index > -1) {
        held_directions.splice(index, 1);
    }
});

var isPressed = false;
const removePressedAll = () => {
    document.querySelectorAll(".dpad-button").forEach(d => {
        d.classList.remove("pressed");
    });
};

document.body.addEventListener("mousedown", () => { 
    if (isActivityInProgress) return;
    isPressed = true; 
});
document.body.addEventListener("mouseup", () => {
    if (isActivityInProgress) return;
    isPressed = false;
    held_directions = [];
    removePressedAll();
});

const handleDpadPress = (direction, click) => {
    if (isActivityInProgress) return;
    if (click) { isPressed = true; }
    held_directions = (isPressed) ? [direction] : [];
    if (isPressed) {
        removePressedAll();
        document.querySelector(".dpad-" + direction).classList.add("pressed");
    }
};

document.querySelector(".dpad-left").addEventListener("touchstart", (e) => handleDpadPress(directions.left, true));
document.querySelector(".dpad-up").addEventListener("touchstart", (e) => handleDpadPress(directions.up, true));
document.querySelector(".dpad-right").addEventListener("touchstart", (e) => handleDpadPress(directions.right, true));
document.querySelector(".dpad-down").addEventListener("touchstart", (e) => handleDpadPress(directions.down, true));

document.querySelector(".dpad-left").addEventListener("mousedown", (e) => handleDpadPress(directions.left, true));
document.querySelector(".dpad-up").addEventListener("mousedown", (e) => handleDpadPress(directions.up, true));
document.querySelector(".dpad-right").addEventListener("mousedown", (e) => handleDpadPress(directions.right, true));
document.querySelector(".dpad-down").addEventListener("mousedown", (e) => handleDpadPress(directions.down, true));

document.querySelector(".dpad-left").addEventListener("mouseover", (e) => handleDpadPress(directions.left));
document.querySelector(".dpad-up").addEventListener("mouseover", (e) => handleDpadPress(directions.up));
document.querySelector(".dpad-right").addEventListener("mouseover", (e) => handleDpadPress(directions.right));
document.querySelector(".dpad-down").addEventListener("mouseover", (e) => handleDpadPress(directions.down));

document.addEventListener("DOMContentLoaded", function(){
   const mapButton = document.getElementById("map-icon");
   const minimapContainer = document.getElementById("minimap-container");
   const minimap = document.getElementById("minimap");

   if (!mapButton || !minimapContainer || !minimap) {
      console.error("Element(s) not found!");
      return;
   }
   mapButton.addEventListener("click", function(){
      minimapContainer.style.display = "flex";
   });

   minimapContainer.addEventListener("click", function(event){
      if(event.target === minimapContainer){
         minimapContainer.style.display = "none";
      }
   })
});

function updateInfoBox() {
   const infoBox = document.getElementById("info-box");
   const infoButtonContainer = document.querySelector(".info-button");

   // Determine screen size
   const isHorizontal = window.innerWidth < 950;
   const isSmallScreen = window.innerWidth < 570;

   // Dynamic margin based on screen width
   if (window.innerWidth >= 1280) {
       infoButtonContainer.style.marginTop = "11rem";
   } else if (window.innerWidth >= 950) {
       infoButtonContainer.style.marginTop = "8.5rem";
   } else {
       infoButtonContainer.style.marginTop = "";
   }

   const locations = [
       { name: "treehouse-info", xMin: 450, xMax: 590, yMin: 270, yMax: 360, background: "green.png", buttons: ["garden.png", "sleep.png", "cook.png", "read.png"] },
       { name: "bubble-info", xMin: 190, xMax: 290, yMin: 120, yMax: 250, background: "pink.png", buttons: ["work.png", "research.png", "tavern.png", "patrol.png"] },
       { name: "ice-info", xMin: 600, xMax: 670, yMin: 90, yMax: 180, background: "blue.png", buttons: ["snow.png", "meditate.png", "fight.png"] },
       { name: "cave-info", xMin: 670, xMax: 770, yMin: 620, yMax: 720, background: "purple.png", buttons: ["dungeon.png", "stargaze.png", "have-meal.png"] },
       { name: "fire-info", xMin: 280, xMax: 370, yMin: 500, yMax: 590, background: "orange.png", buttons: ["potion.png", "magic.png", "witch.png"] },
       { name: "demon-info", xMin: 700, xMax: 790, yMin: 300, yMax: 390, background: "gray.png", buttons: ["demon.png"] }
   ];

   let currentLocation = locations.find((loc) => {
    if (loc.name === "demon-info" && !window.demonTowerUnlocked) return false;
    return x >= loc.xMin && x <= loc.xMax && y >= loc.yMin && y <= loc.yMax;
   });
   if (!currentLocation) {
      // Default BMO info
      const bmoBackground = isHorizontal ? "bmo-info-hori.png" : "bmo-info.png";
      const newSrc = `assets/info/${bmoBackground}`;
      
      if (infoBox.src !== newSrc) {
         infoBox.src = newSrc;
         console.log("Setting BMO image:", infoBox.src);
      }

      infoButtonContainer.innerHTML = ""; 

      let placeholder = document.createElement("div");
      placeholder.style.width = isSmallScreen ? "56px" : "170px";
      placeholder.style.height = isSmallScreen ? "15px" : "32px";
      placeholder.style.visibility = "hidden";

      infoButtonContainer.appendChild(placeholder);
   } else {
      // Location-specific info
      const horizontalBackground = currentLocation.background.replace(".png", "-hori.png");
      infoBox.src = `assets/info/${currentLocation.name}/${isHorizontal ? horizontalBackground : currentLocation.background}`;
      
      infoButtonContainer.innerHTML = "";
      currentLocation.buttons.forEach((btn) => {
         let button = document.createElement("button");
         button.className = "hover:scale-105 transition-all";
         button.classList.add(btn.replace(".png", "")); // Add a dynamic class based on button name
     
         let img = document.createElement("img");
         img.src = `assets/info/${currentLocation.name}/${btn}`;
         img.className = `z-10 transition-all ${
           isSmallScreen
             ? "w-[56px] h-[15px]"
             : isHorizontal
             ? "w-[100px] h-[30px] max-w-[166px]"
             : "w-[170px] h-[32px] max-w-[166px]"
         }`;
     
         if (btn === "demon.png") {
            if (window.innerWidth >= 950) {
                button.style.marginTop = "15px";
            } else {
                button.style.marginTop = "";
            }
        }
         button.appendChild(img);
         infoButtonContainer.appendChild(button);
     });
     
   }
   infoButtonContainer.style.gap = "10px";
   // Apply responsive styles
   infoBox.style.width = isHorizontal ? "500px" : "";
   infoBox.style.height = isHorizontal ? "150px" : "";
   infoButtonContainer.style.flexDirection = isHorizontal ? "row" : "column";
}

// Call update function when character moves
setInterval(updateInfoBox, 500);
