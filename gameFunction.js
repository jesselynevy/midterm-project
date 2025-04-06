document.addEventListener("DOMContentLoaded", function () {
  // Game State Variables
  const statusBars = {
    hunger: 50,
    happiness: 50,
    experience: 50,
    energy: 50,
  };
  const originalStatus = { ...statusBars };
  let coins = 0;
  const originalCoin = coins;
  let isGameOver = false;
  let statusInterval;
  let activeActivity = false;
  let isDialogueActive = false;
  let introFinished = false;
  let dialogueIndex = 0;
  let currentDialogues = [];
  let witchImage = null;
  let witchDialogueFinished = false;
  let hasMagicOrb = false;
  let hasVisitedWitch = false;
  window.demonTowerUnlocked = false;
  //DOM Elements
  const dialogueBox = document.querySelector(
    ".dialogue-box .dialogue-text span"
  );
  const dialogueContainer = document.querySelector(".dialogue-box");
  const mapCharacter = document.querySelector(".map .character");
  const mapContainer = document.querySelector(".map");
  const moneyDisplay = document.getElementById("money");
  const infoButtonContainer = document.querySelector(".info-button");

  // Retrieve username from local storage
  const username = localStorage.getItem("username") || "Hero";

  // Dialogues
  const introDialogues = [
    `Welcome to the Land of OOO, ${username}👋🏻. Click anywhere outside the box to continue.`,
    "The Demon King👿 has created chaos all around the OOO.",
    "You are chosen as the hero to defeat it.",
    "To defeat it you need to obtain the magic orb🔮.",
    "Your first task will be meeting the witch in the Fire Empire🧙🏻🪄.",
  ];

  const witchDialogues = [
    "Hello young hero, you must come here to beat the Demon King👿.",
    "To beat it you need to visit some places and maximize your stats.",
    "Then you need to collect 100 coins to buy the magic orb🔮.",
  ];

  // Button Effects Configuration
  const buttonEffects = {
    garden: {
      happiness: 7,
      energy: -5,
      duration: 1000,
      message: "Gardening brings life to nature and boosts happiness!",
    },
    sleep: {
      energy: 30,
      hunger: -5,
      duration: 2000,
      message: "You take a nap and regain energy, but feel hungrier.",
    },
    cook: {
      hunger: 10,
      duration: 1000,
      message: "You cook a meal to satisfy your hunger.",
    },
    read: {
      experience: 5,
      happiness: 8,
      energy: -2,
      duration: 1000,
      message: "Reading expands your knowledge but tires your eyes.",
    },
    fight: {
      experience: 5,
      hunger: -10,
      energy: -5,
      coins: 10,
      duration: 2000,
      message:
        "Fight Ice Golems for experience and coins, but drain energy and makes you hungry.",
    },
    snow: {
      happiness: 10,
      energy: -5,
      duration: 1000,
      message: "Play in the snow to feel joy, though it drains your energy.",
    },
    meditate: {
      happiness: 2,
      energy: 3,
      experience: 2,
      hunger: 2,
      duration: 1000,
      message: "Meditate to harmonize yourself, slightly increasing all stats.",
    },
    work: {
      coins: 20,
      experience: 8,
      happiness: -7,
      duration: 2000,
      message: "Work for stable earnings but at the expense of happiness.",
    },
    research: {
      coins: 15,
      experience: 8,
      energy: -7,
      duration: 2000,
      message:
        "Research to earn extra money and experience, though it drains energy.",
    },
    tavern: {
      coins: -8,
      happiness: 10,
      hunger: 15,
      duration: 1000,
      message:
        "Visit the Tavern to enjoy yourself, it will cost 10 coins but it makes you happy.",
    },
    patrol: {
      coins: 100,
      happiness: -10,
      energy: -15,
      hunger: -15,
      experience: 15,
      duration: 3000,
      message:
        "Help the Royals, a risky but rewarding task—100 coins and increase experience but it drains the rest of the stats.",
    },
    dungeon: {
      coins: 30,
      experience: 18,
      happiness: -5,
      energy: -15,
      hunger: -10,
      duration: 3000,
      message:
        "Explore Dungeons for riches and vast experience, but it heavily drains energy and hunger",
    },
    stargaze: {
      energy: 8,
      happiness: 10,
      duration: 2000,
      message:
        "In the calm night, stargazing will increase your energy and happiness",
    },
    "have-meal": {
      hunger: 10,
      coins: -10,
      duration: 2000,
      message:
        "You will spend 10 coins for having meal at tavern to satisfy your hunger",
    },
    potion: {
      coins: -100,
      happiness: 100,
      hunger: 100,
      energy: 100,
      experience: statusBars.experience,
      duration: 2000,
      message:
        "Potion will make all your stats to the max except Experience but you need 100 coins.",
    },
    magic: {
      coins: -100,
      requirement: { experience: 80 },
      message:
        "Magic Orb can only be obtained if your Experience is above 80 and you need 100 coins.",
      duration: 2000,
    },
    witch: {
      requirement: {
        experience: 80,
        happiness: 80,
        hunger: 80,
        energy: 80,
      },
      condition: () => hasMagicOrb, // Requires Magic Orb to proceed
      message:
        "The witch will test your knowledge before revealing the Demon Tower!",
      action: startRiddleChallenge,
    },
    demon: {
      condition: () => demonTowerUnlocked,
      message: "The Demon Tower is now revealed. Prepare for battle!",
    },
  };

  // Initialize Game
  function initGame() {
    updateStatusBars();
    updateMoneyDisplay();
    startGameIntro();
    lockDemonTower();
    setupEventListeners();
  }
  // Dialogue Functions
  function showNextDialogue(dialogues, callback) {
    if (dialogueIndex < dialogues.length) {
      dialogueBox.textContent = dialogues[dialogueIndex];
      dialogueIndex++;
    } else {
      dialogueIndex = 0;
      isDialogueActive = false;
      document.removeEventListener("click", handleDialogueClick);
      if (callback) callback();
    }
  }

  function handleDialogueClick(event) {
    if (!dialogueContainer.contains(event.target) && isDialogueActive) {
      showNextDialogue(currentDialogues, () => {
        if (currentDialogues === witchDialogues) {
          removeWitch();
          startStatusDecrease();
          enableButtons();
          witchDialogueFinished = true;
          hasVisitedWitch = true;
        }
      });
    }
  }

  function startGameIntro() {
    dialogueBox.textContent = introDialogues[0];
    dialogueContainer.style.display = "block";
    isDialogueActive = true;
    currentDialogues = introDialogues;

    document.addEventListener("click", function handleIntro(event) {
      if (!dialogueContainer.contains(event.target) && isDialogueActive) {
        showNextDialogue(introDialogues, () => {
          document.removeEventListener("click", handleIntro);
          introFinished = true;
        });
      }
    });
  }

  // Witch Functions
  function spawnWitch() {
    if (witchImage) return;

    witchImage = document.createElement("img");
    witchImage.src = "assets/purple-witch.png";
    witchImage.classList.add("witch-npc");
    witchImage.style.position = "absolute";
    witchImage.style.width = "80px";
    witchImage.style.height = "80px";
    witchImage.style.zIndex = "15";

    const characterRect = mapCharacter.getBoundingClientRect();
    const mapRect = mapContainer.getBoundingClientRect();

    witchImage.style.left = `${characterRect.right - mapRect.left + 10}px`;
    witchImage.style.top = `${characterRect.top - mapRect.top}px`;

    mapContainer.appendChild(witchImage);
  }

  function removeWitch() {
    if (witchImage) {
      witchImage.remove();
      witchImage = null;
    }
  }

  function startWitchDialogue() {
    if (hasVisitedWitch) return;

    spawnWitch();
    disableButtons();
    dialogueIndex = 0;
    isDialogueActive = true;
    currentDialogues = witchDialogues;
    dialogueBox.textContent = currentDialogues[0];
    dialogueContainer.style.display = "block";
    document.addEventListener("click", handleWitchDialogueClick);
  }

  function handleWitchDialogueClick(event) {
    // Only allow progression if not clicking inside the dialogue box
    if (!dialogueContainer.contains(event.target) && isDialogueActive) {
      showNextDialogue(witchDialogues, () => {
        // Once Witch dialogue ends, finish it and set flag
        witchDialogueFinished = true;
        removeWitch();
        startStatusDecrease();
        enableButtons(); // Enable all buttons now
      });
    }
  }
  function resetGame() {
    isGameOver = false;
  
    // Reset status bars
    Object.keys(statusBars).forEach((key) => {
      statusBars[key] = originalStatus[key];
    });
  
    // Reset money
    coins = originalCoin;
    updateMoneyDisplay();
  
    // Reset dialogue and flags
    dialogueIndex = 0;
    isDialogueActive = false;
    introFinished = false;
    witchDialogueFinished = false;
    hasVisitedWitch = false;
  
    // Clear current dialogues
    currentDialogues = [];
  
    // Clear and hide dialogue box
    dialogueBox.textContent = "";
    dialogueContainer.style.display = "none";
  
    // Remove event listeners if still hanging around
    document.removeEventListener("click", handleDialogueClick);
    document.removeEventListener("click", handleWitchDialogueClick);
  
    // Remove witch if she’s still around
    removeWitch();
  }
  
  
  function showGameOverOverlay() {
    const messages = [
      "Lesson learned: Don\'t fight evil on an empty stomach.",
      "You faceplanted from zero energy. The Demon King didn\'t even have to try.",
      "You forgot to take care of yourself and now... well, this happened.",
      "You forgot the most important quest: self-care"
    ];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
  
    // Overlay (dimmed background)
    const overlay = document.createElement("div");
    overlay.id = "game-over-overlay";
  
    // Actual box content
    const box = document.createElement("div");
    box.id = "game-over-box";
  
    const title = document.createElement("h1");
    title.textContent = "GAME OVER";
  
    const message = document.createElement("p");
    message.textContent = randomMsg;
  
    const playAgainBtn = document.createElement("button");
    playAgainBtn.textContent = "Play Again";
    playAgainBtn.onclick = () => {
      document.body.removeChild(overlay);
      resetGame();
      initGame();
    };
  
    const quitBtn = document.createElement("button");
    quitBtn.textContent = "Quit";
    quitBtn.onclick = () => {
      window.location.href = "index.html";
    };
  
    const btnContainer = document.createElement("div");
    btnContainer.className = "game-over-buttons";
    btnContainer.appendChild(playAgainBtn);
    btnContainer.appendChild(quitBtn);
  
    box.appendChild(title);
    box.appendChild(message);
    box.appendChild(btnContainer);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  }
  
  // Status Bar Functions
  function updateStatusBars() {
    Object.keys(statusBars).forEach((key) => {
      const bar = document.getElementById(key);
      if (!bar) return;

      const value = Math.max(0, Math.min(100, statusBars[key]));
      bar.style.width = `${value}%`;

      if (value < 25 && !bar.dataset.alerted) {
        alert(`🚨 Your ${key} is critically low! If you don't take action soon, you won\'t survive much longer…`);
        bar.dataset.alerted = "true"; // prevent repeated alerts
      } else if (value >= 25) {
        bar.dataset.alerted = ""; // reset alert state if stat goes back up
      }
      // Set visual state based on value
      bar.style.backgroundImage =
        value >= 60
          ? "url('assets/status-bar/full.png')"
          : value >= 30
          ? "url('assets/status-bar/half.png')"
          : "url('assets/status-bar/low.png')";

      // Common styles
      Object.assign(bar.style, {
        objectFit: "cover",
        zIndex: "-10",
        marginLeft: "8px",
      });

      // Responsive styles
      const windowWidth = window.innerWidth;
      Object.assign(
        bar.style,
        windowWidth < 570
          ? {
              marginTop: "7px",
              height: "12px",
            }
          : windowWidth < 768
          ? {
              marginTop: "6px",
              height: "11px",
            }
          : {
              marginTop: "9px",
              height: "15px",
            }
      );
    });
    const anyStatZero = Object.values(statusBars).some((val) => val <= 0);
    if (anyStatZero && !isGameOver) {
      isGameOver = true;
      clearInterval(statusInterval); // stop status drain
      showGameOverOverlay();
    }
  }

  function startStatusDecrease() {
    if (statusInterval) clearInterval(statusInterval);

    statusInterval = setInterval(() => {
      Object.keys(statusBars).forEach((key) => {
        statusBars[key] = Math.max(0, statusBars[key] - 2);
      });
      updateStatusBars();
    }, 7000);
  }

  // Money Functions
  function updateMoneyDisplay() {
    moneyDisplay.innerHTML = `<span><img src="assets/coin.png"></span>${coins}`;
  }

  function addCoins(amount) {
    coins = Math.max(0, coins + amount);
    updateMoneyDisplay();
  }

  function handlePurchase(item) {
    if (item === "magic" && hasMagicOrb) {
      dialogueBox.textContent =
        "You have obtained the magic orb, use it first by asking the witch.";
      dialogueContainer.style.display = "block";
      return;
    }
    const effect = buttonEffects[item];

    if (!effect) return;

    // Check if the player has enough coins
    if (coins < Math.abs(effect.coins)) {
      dialogueBox.textContent = `Not enough coins! You need 100 coins.`;
      dialogueContainer.style.display = "block";
      return;
    }

    showConfirmationBox(item, effect);
  }
  function showConfirmationBox(item, effect) {
    const confirmationBox = document.createElement("div");
    confirmationBox.classList.add("confirmation-box");
    confirmationBox.innerHTML = `
            <p>Do you want to ${
              item === "potion" ? "buy the potion?" : "obtain the magic orb?"
            }<br>You need 100 coins.</p>
            <button class="confirm-yes">Yes</button>
            <button class="confirm-no">No</button>
        `;

    document.body.appendChild(confirmationBox);

    // Handle button clicks
    confirmationBox
      .querySelector(".confirm-yes")
      .addEventListener("click", function () {
        addCoins(effect.coins);
        updateMoneyDisplay();
        applyPurchaseEffect(item);
        confirmationBox.remove();
      });

    confirmationBox
      .querySelector(".confirm-no")
      .addEventListener("click", function () {
        confirmationBox.remove();
      });
  }
  function applyPurchaseEffect(item) {
    if (item === "magic") {
      hasMagicOrb = true; // Set the flag to true
    }

    const successBox = document.createElement("div");
    successBox.classList.add("success-box");
    successBox.innerHTML = `
            <p>Successfully ${
              item === "potion"
                ? "purchased the potion"
                : "obtained the Magic Orb <br> Ask the witch now!"
            }!</p>
            <img src="${
              item === "potion"
                ? "assets/potion-red.png"
                : "assets/magic-orb.png"
            }" alt="${item}">
            <p>Click the item to close the box</p>
        `;

    document.body.appendChild(successBox);

    if (item === "potion") {
      // Maximize all stats except Experience
      Object.keys(statusBars).forEach((stat) => {
        if (stat !== "experience") statusBars[stat] = 100;
      });
      updateStatusBars();
    }

    // Close success box when clicking the item
    successBox.addEventListener("click", function () {
      successBox.remove();
    });
  }
  function startRiddleChallenge() {
    isActivityInProgress = true;
    clearInterval(statusInterval); // Stop status decrease

    const riddles = [
      {
        question: "Who is the main character of Adventure Time?",
        answer: ["finn", "fin"],
      },
      {
        question: "What's the name of BMO's alter ego? (Hint : ⚽, Initial: F)",
        answer: ["football"],
      },
      {
        question: "What is the real name of Ice King?",
        answer: ["simon", "simon petrikov"],
      },
      { question: "What's the color of Jake?", answer: ["yellow"] },
      {
        question:
          "Who is the main villain in Adventure Time that is a skeleton-like creature? (Hint: Demon King in this game, Initial: L)",
        answer: ["the lich", "lich"],
      },
      {
        question: "Where do Finn and Jake live?",
        answer: ["the treehouse", "treehouse"],
      },
    ];

    let attempts = 3;
    let currentRiddle = null;
    function getRandomRiddle() {
      return riddles[Math.floor(Math.random() * riddles.length)];
    }
    function askRiddle() {
      if (attempts === 0) {
        Object.keys(statusBars).forEach((stat) => (statusBars[stat] -= 20));
        hasMagicOrb = false;
        updateStatusBars();
        dialogueBox.textContent =
          "You failed the challenge. Your stats have been reduced, and you need to obtain the magic orb again.";
        dialogueContainer.style.display = "block";
        isActivityInProgress = false;
        startStatusDecrease();
        document.querySelector(".riddle-overlay")?.remove();
        return;
      }
      currentRiddle = getRandomRiddle();
      document.querySelector(".riddle-overlay")?.remove();

      // Create overlay
      const overlay = document.createElement("div");
      overlay.classList.add("riddle-overlay");

      // Create riddle box
      const riddleBox = document.createElement("div");
      riddleBox.classList.add("riddle-box");
      riddleBox.innerHTML = `
                <p>The Witch: 'Answer this to know location of Demon's Tower or suffer the consequences.'</p>
                <p>${currentRiddle.question}</p>
                <input type="text" id="riddle-answer" placeholder="Type your answer here">
                <button id="submit-answer">Submit</button>
            `;

      overlay.appendChild(riddleBox);
      document.body.appendChild(overlay);

      document
        .getElementById("submit-answer")
        .addEventListener("click", function () {
          const answer = document
            .getElementById("riddle-answer")
            .value.trim()
            .toLowerCase();
          if (currentRiddle.answer.includes(answer)) {
            overlay.remove();
            unlockDemonTower();
          } else {
            attempts--;
            riddleBox.querySelector(
              "p"
            ).textContent = `Wrong! You have ${attempts} attempts left.`;
            askRiddle();
          }
        });
    }
    askRiddle();
    hasMagicOrb = false;
  }

  function unlockDemonTower() {
    const minimapImage = document.querySelector('#minimap img');
    minimapImage.src = 'assets/place/map-demon.png'; 
    window.demonTowerUnlocked = true;
    mapContainer.style.backgroundImage = "url(assets/place/full-map.png)";
    dialogueBox.textContent =
      "You have unlocked the Demon Tower! Now you can face the Demon King.";
    dialogueContainer.style.display = "block";
    isActivityInProgress = false;
    startStatusDecrease();
    const demonButton = document.querySelector(".demon");
    if (demonButton) {
      demonButton.disabled = false;
      demonButton.style.display = "inline-block";
    }
    setTimeout(() => {
      const demonInfo = document.querySelector(".demon-info");
      if (demonInfo) {
        demonInfo.style.display = "block";
      }
    }, 100);
  }
  // Handle losing (disable replay & update map)
  function lockDemonTower() {
    const minimapImage = document.querySelector('#minimap img');
    minimapImage.src = 'assets/place/map-icon.png'; 
    window.demonTowerUnlocked = false;
    const demonButton = document.querySelector(".demon");
    if (demonButton) {
      demonButton.disabled = true;
      demonButton.style.display = "none";
    }
    setTimeout(() => {
      const demonInfo = document.querySelector(".demon-info");
      if (demonInfo) {
        demonInfo.style.display = "none";
      }
    }, 100);
  }
  // Activity Functions
  function applyEffect(buttonClass) {
    const effect = buttonEffects[buttonClass];
    if (!effect || activeActivity || !introFinished) return;
    if (buttonClass === "demon") {
      if (!demonTowerUnlocked) {
        dialogueBox.textContent = "You must unlock the Demon Tower first! Ask the Witch";
        dialogueContainer.style.display = "block";
        return;
      }
      showDemonIntro();
      return;
    }
    if (buttonClass === "potion" || buttonClass === "magic") {
      if (buttonClass === "magic" && statusBars.experience < 80) {
        dialogueBox.textContent =
          "You need at least 80 experience and 100 coins to obtain the Magic Orb.";
        dialogueContainer.style.display = "block";
        return;
      }
      handlePurchase(buttonClass);
      return;
    }
    if (buttonClass === "witch") {
      if (!hasMagicOrb) {
        dialogueBox.textContent = "You need to obtain the magic orb first.";
        dialogueContainer.style.display = "block";
        return;
      }

      const allStatsAbove80 = Object.keys(effect.requirement).every(
        (stat) => statusBars[stat] >= 80
      );
      if (!allStatsAbove80) {
        dialogueBox.textContent =
          "Your stats are too low. Train harder before facing the witch!";
        dialogueContainer.style.display = "block";
        return;
      }

      effect.action();
      return;
    }
    // Check if there are enough coins for actions that cost coins
    if (effect.coins && effect.coins < 0 && coins < Math.abs(effect.coins)) {
      // Not enough coins - show feedback
      const button = document.querySelector(`button.${buttonClass}`);
      button.classList.add("insufficient-coins");

      // Show message in dialogue box
      dialogueBox.textContent = `Not enough coins! You need ${Math.abs(
        effect.coins
      )} coins for this action.`;
      dialogueContainer.style.display = "block";

      // Remove the feedback after 2 seconds
      setTimeout(() => {
        button.classList.remove("insufficient-coins");
      }, 2000);
      return;
    }

    activeActivity = true;
    isActivityInProgress = true;
    disableButtons();
    dialogueBox.textContent = effect.message;
    dialogueContainer.style.display = "block";

    setTimeout(() => {
      activeActivity = false;
      isActivityInProgress = false;
      enableButtons();
      Object.keys(effect).forEach((stat) => {
        if (stat === "coins") {
          addCoins(effect[stat]);
        } else if (stat !== "duration" && stat !== "message") {
          statusBars[stat] = Math.max(
            0,
            Math.min(100, statusBars[stat] + effect[stat])
          );
        }
      });
      updateStatusBars();
    }, effect.duration);
  }

  function showDemonIntro() {
    dialogueBox.textContent =
        "The Demon Tower is now revealed. Prepare for battle!";
    dialogueContainer.style.display = "block";
    const overlay = document.createElement("div");
    overlay.id = "demon-overlay";

    const box = document.createElement("div");
    box.id = "demon-box";

    const message = document.createElement("p");
    message.textContent =
      "You are strong, child. But I am beyond strength. I am the end.";

    const demonImg = document.createElement("img");
    demonImg.src = "assets/demon-king.png";

    const nextButton = document.createElement("button");
    nextButton.id = "next-button";
    nextButton.textContent = "Next";

    nextButton.addEventListener("click", function () {
      const overlayElement = document.getElementById("demon-overlay");
      if (overlayElement) {
        document.body.removeChild(overlayElement);
      }
      startRockPaperScissors();
    });

    box.appendChild(message);
    box.appendChild(demonImg);
    box.appendChild(nextButton);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  }

  function startRockPaperScissors() {
    let userScore = 0;
    let demonScore = 0;
    let roundsPlayed = 0;
    const choices = ["✌🏻", "🖐🏻", "✊🏻"];

    const overlay = document.createElement("div");
    overlay.id = "rps-overlay";

    const box = document.createElement("div");
    box.id = "rps-box";

    const message = document.createElement("p");
    message.textContent = "Choose your move! First to 3 wins.";

    const scoreDisplay = document.createElement("p");
    scoreDisplay.textContent = `You: ${userScore} - Demon: ${demonScore}`;

    const choiceDisplay = document.createElement("p");
    choiceDisplay.textContent = "Your choice: - | Demon choice: -";

    const buttonsContainer = document.createElement("div");
    buttonsContainer.id = "rps-buttons";

    choices.forEach((choice) => {
      const button = document.createElement("button");
      button.classList.add("rps-btn");
      button.textContent = choice;
      button.addEventListener("click", function () {
        if (userScore >= 3 || demonScore >= 3) return;

        const userChoice = choice;
        const demonChoice = choices[Math.floor(Math.random() * choices.length)];
        choiceDisplay.textContent = `Your choice: ${userChoice} | Demon choice: ${demonChoice}`;

        const winner = determineWinner(userChoice, demonChoice);
        if (winner === "user") userScore++;
        if (winner === "demon") demonScore++;

        scoreDisplay.textContent = `You: ${userScore} - Demon: ${demonScore}`;
        roundsPlayed++;

        if (userScore === 3) {
          // Remove unnecessary elements
          buttonsContainer.remove();
          scoreDisplay.remove();
          choiceDisplay.remove();

          message.textContent =
            "You have defeated the Demon King on the first round!";
          const nextButton = document.createElement("button");
          nextButton.id = "next-button";
          nextButton.textContent = "Continue to next stage";

          nextButton.addEventListener("click", function () {
            document.body.removeChild(overlay);
            startMathBattle();
          });
          box.appendChild(message);
          box.appendChild(nextButton);
        } else if (demonScore === 3) {
          setTimeout(() => {
            dialogueBox.textContent =
              "Your hand falters. The Demon King has won this duel of fate.";
            dialogueContainer.style.display = "block";
            message.textContent =
              "You have failed, child. Now, I have the power to destroy all life 😈";
            overlay.addEventListener("click", function (event) {
              if (event.target === overlay) {
                const overlayElement = document.getElementById("rps-overlay");
                if (overlayElement) {
                  document.body.removeChild(overlayElement);
                }
                lockDemonTower();
                reduceStats();
              }
            });
          }, 1000);
        }
      });
      buttonsContainer.appendChild(button);
    });

    box.appendChild(message);
    box.appendChild(scoreDisplay);
    box.appendChild(choiceDisplay);
    box.appendChild(buttonsContainer);
    overlay.appendChild(box);

    document.body.appendChild(overlay);
  }

  // Function to determine winner
  function determineWinner(user, demon) {
    if (user === demon) return "tie";
    if (
      (user === "✌🏻" && demon === "🖐🏻") ||
      (user === "🖐🏻" && demon === "✊🏻") ||
      (user === "✊🏻" && demon === "✌🏻")
    ) {
      return "user";
    }
    return "demon";
  }

  function reduceStats() {
    statusBars.hunger -= 25;
    statusBars.happiness -= 25;
    statusBars.energy -= 25;
    statusBars.experience -= 25;
    coins -= 20;
    updateStatusBars();
    updateMoneyDisplay();
  }

  function startMathBattle() {
    let correctAnswers = 0;
    let currentQuestionIndex = 0;
    const questions = generateRandomQuestions(5); // Generate 5 questions

    const overlay = document.createElement("div");
    overlay.id = "math-overlay";

    const box = document.createElement("div");
    box.id = "math-box";

    const message = document.createElement("p");
    message.textContent =
      "The second challenge is a math battle. Answer correctly to proceed.";

    const questionElement = document.createElement("p");
    questionElement.id = "math-question";

    const inputField = document.createElement("input");
    inputField.type = "number";
    inputField.id = "math-answer";
    inputField.placeholder = "Your answer";

    const submitButton = document.createElement("button");
    submitButton.id = "submit-button";
    submitButton.textContent = "Submit Answer";

    function showQuestion(index) {
      if (index < questions.length) {
        questionElement.textContent = questions[index].question;
        inputField.value = ""; // Reset input
      } else {
        finishMathBattle(); // All questions answered
      }
    }

    submitButton.addEventListener("click", function () {
      const userAnswer = parseInt(inputField.value);
      if (
        !isNaN(userAnswer) &&
        userAnswer === questions[currentQuestionIndex].answer
      ) {
        correctAnswers++;
      }

      currentQuestionIndex++;
      showQuestion(currentQuestionIndex);
    });

    function finishMathBattle() {
      if (correctAnswers >= 3) {
        const overlayElement = document.getElementById("math-overlay");
        if (overlayElement) {
            document.body.removeChild(overlayElement);
        }
        showFinalVictory(overlay);
        lockDemonTower();
      } else {
        dialogueBox.textContent =
          "Don't worry, a hero always rises after defeat...";
        dialogueContainer.style.display = "block";
        message.textContent =
          "You have failed, child. Now, I have the power to destroy all life 😈";
        overlay.addEventListener("click", function (event) {
          if (event.target === overlay) {
            const overlayElement = document.getElementById("math-overlay");
            if (overlayElement) {
              document.body.removeChild(overlayElement);
            }
            document.body.removeChild(overlay);
            lockDemonTower();
            reduceStats();
          }
        });
      }
    }

    box.appendChild(message);
    box.appendChild(questionElement);
    box.appendChild(inputField);
    box.appendChild(submitButton);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    showQuestion(0); // Start with first question
  }
  function generateRandomQuestions(numberOfQuestions) {
    const operations = ["+", "-", "*", "/"];
    let questions = [];

    for (let i = 0; i < numberOfQuestions; i++) {
      const num1 = Math.floor(Math.random() * 151);
      const num2 = Math.floor(Math.random() * 151) || 1; // Ensure nonzero divisor
      const operation =
        operations[Math.floor(Math.random() * operations.length)];

      let question = "";
      let answer = 0;

      switch (operation) {
        case "+":
          question = `${num1} + ${num2} = ?`;
          answer = num1 + num2;
          break;
        case "-":
          question = `${num1} - ${num2} = ?`;
          answer = num1 - num2;
          break;
        case "*":
          question = `${num1} * ${num2} = ?`;
          answer = num1 * num2;
          break;
        case "/":
          const divisor = num2 === 0 ? 1 : num2;
          question = `${num1} / ${divisor} = ?`;
          answer = Math.floor(num1 / divisor);
          break;
      }

      questions.push({ question, answer });
    }

    return questions;
  }

  // Show Victory Screen with rewards
  function showFinalVictory(overlay) {
    overlay.innerHTML = ""; // Clear previous content

    const box = document.createElement("div");
    box.id = "final-victory-box";

    const message = document.createElement("p");
    message.innerHTML =
      "🎉 Congratulations!! 🎉 <br> You have sealed the Demon King!!";

    const treasureImage = document.createElement("img");
    treasureImage.src = "assets/treasure.png";
    treasureImage.alt = "Treasure";
    treasureImage.style.width = "200px";
    treasureImage.style.display = "block";
    treasureImage.style.margin = "20px auto";

    const rewardMessage = document.createElement("p");
    rewardMessage.innerHTML =
      "🎁 The rewards! <br> Your stats will remain 100 for 1 hour and you get 100 coins!";

    const closeButton = document.createElement("button");
    closeButton.id = "close-button";
    closeButton.textContent = "Claim Rewards";
    closeButton.addEventListener("click", function () {
      document.body.removeChild(overlay);
      applyVictoryRewards();
    });

    box.appendChild(message);
    box.appendChild(treasureImage);
    box.appendChild(rewardMessage);
    box.appendChild(closeButton);
    overlay.appendChild(box);

    startConfetti();
  }

  // Apply rewards
  function applyVictoryRewards() {
    statusBars.hunger = 100;
    statusBars.happiness = 100;
    statusBars.energy = 100;
    statusBars.experience = 100;
    coins += 100;
    updateStatusBars();
    updateMoneyDisplay();

    setTimeout(() => {
      statusBars.hunger -= 10;
      statusBars.happiness -= 10;
      statusBars.energy -= 10;
      statusBars.experience -= 10;
      updateStatusBars();
    }, 60000); // 1 minute real-time
  }

  // Confetti effect
  function startConfetti() {
    const confettiCanvas = document.createElement("canvas");
    confettiCanvas.id = "confetti-canvas";
    document.body.appendChild(confettiCanvas);

    const confettiSettings = { target: "confetti-canvas", max: 150 };
    const confetti = new ConfettiGenerator(confettiSettings);
    confetti.render();

    setTimeout(() => {
      document.body.removeChild(confettiCanvas);
    }, 5000);
  }
  function ConfettiGenerator(settings) {
    const canvas = document.getElementById(settings.target);
    const ctx = canvas.getContext("2d");

    // Set canvas size to full screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confettiPieces = [];

    // Create confetti pieces
    for (let i = 0; i < settings.max; i++) {
      confettiPieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 5 + 2,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
        speed: Math.random() * 3 + 1,
        angle: Math.random() * 360,
        rotationSpeed: Math.random() * 5 - 2.5,
      });
    }

    function updateConfetti() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confettiPieces.forEach((piece) => {
        piece.y += piece.speed;
        piece.angle += piece.rotationSpeed;

        if (piece.y > canvas.height) {
          piece.y = -10; // Reset when it falls off the screen
          piece.x = Math.random() * canvas.width;
        }

        // Draw confetti
        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate(piece.angle * (Math.PI / 180));
        ctx.fillStyle = piece.color;
        ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
        ctx.restore();
      });

      requestAnimationFrame(updateConfetti);
    }

    this.render = function () {
      updateConfetti();
    };
  }

  function disableButtons() {
    infoButtonContainer.classList.add("grayscale"); // Apply grayscale effect
    const buttons = infoButtonContainer.querySelectorAll("button");
    buttons.forEach((button) => {
      button.disabled = true;
    });
  }

  function enableButtons() {
    infoButtonContainer.classList.remove("grayscale"); // Remove grayscale effect
    const buttons = infoButtonContainer.querySelectorAll("button");
    buttons.forEach((button) => {
      button.disabled = false;
    });
  }

  // Event Listeners
  function setupEventListeners() {
    infoButtonContainer.addEventListener("click", function (event) {
      const button = event.target.closest("button");

      if (!button || activeActivity || !introFinished) return;

      // Allow clicking the Witch button, but block others until Witch dialogue is done
      if (!witchDialogueFinished && !button.classList.contains("witch")) {
        dialogueBox.textContent =
          "You must finish speaking to the Witch first!";
        dialogueContainer.style.display = "block";
        return;
      }

      if (button.classList.contains("witch")) {
        if (!witchDialogueFinished) {
          startWitchDialogue(); // Ensure Witch dialogue plays first
          return;
        }

        // After dialogue, check conditions for the Riddle Challenge
        if (
          hasMagicOrb &&
          Object.values(statusBars).every((stat) => stat >= 80)
        ) {
          startRiddleChallenge();
        } else {
          dialogueBox.textContent =
            "You need the Magic Orb and all stats above 80 to face the Witch's challenge!";
          dialogueContainer.style.display = "block";
        }
      } else {
        for (let className of button.classList) {
          if (buttonEffects[className]) {
            applyEffect(className);
            break;
          }
        }
      }
    });
    // Show hover messages from buttonEffects in dialogueBox
    infoButtonContainer.addEventListener("mouseover", function (event) {
      const button = event.target.closest("button");

      if (!button || button.classList.contains("witch") || !introFinished) return;

      // Find which effect applies based on button class
      for (let className of button.classList) {
        if (buttonEffects[className]) {
          const effect = buttonEffects[className];
          if (effect.message) {
            dialogueBox.textContent = effect.message;
            dialogueContainer.style.display = "block";
          }
          break;
        }
      }
    });
    infoButtonContainer.addEventListener("mouseout", function (event) {
      const button = event.target.closest("button");
    
      if (!button || button.classList.contains("witch") || !introFinished) return;
    
      // Optionally, clear the dialogue only if not in use
      dialogueBox.textContent = "Hover the button to know what's going on, go ask the witch if you haven't";
      dialogueContainer.style.display = "block";
    });

    window.addEventListener("resize", debounce(updateStatusBars, 100));
  }
  // Utility Functions
  function debounce(func, wait) {
    let timeout;
    return function () {
      const context = this,
        args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  // Start the game
  initGame();
});
