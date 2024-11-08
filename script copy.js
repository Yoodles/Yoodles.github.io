// import { wordPairDetails } from './words.js';
// import { isTotallyValid } from './word-validity.js';

const inputField = document.getElementById('inputField');
const startWordCont = document.getElementById('startWord');
const normRack = document.getElementById('normRack'); 
const flipRack = document.getElementById('flipRack');
const endWordCont = document.getElementById('endWord');


//// INITIAL STATE AT START OF ROUND ////
const initialGameState = () => ({
    phase: 'pre',
    direction: 'norm',
    moveCounter: 0,
    normArray: [],
    flipArray: [],
    latestWord: '',
    targetWord: '',
    latestMove: '',
});

let gameState = initialGameState();
// export let gameState = initialGameState();

function resetGameState() {
    gameState = initialGameState();
}

// export let wordPair = {
let wordPair = {
    currentPairIndex: 0,
    startWord: '',
    endWord: '',
    maxLength: 6,
    minLength: 3,
    bestScoreIndex: {},
    score3star: 0,
    score2star: 0
}

//FUNC: SETTING NEW WORD PAIR FOR ROUND; CALCULATING MIN./MAX. LENGTHS //❗️❗️❗️❗️❗️
function setWordPairAndLengths(pairKey) {
    const index = wordPair.currentPairIndex;

    // if (pairKey);

    if (index < wordPairDetails.length) {
        wordPair.startWord = wordPairDetails[index].start;
        wordPair.endWord = wordPairDetails[index].end;
        
        wordPair.score3star = wordPairDetails[index].score.A;
        wordPair.score2star = wordPairDetails[index].score.B;

        wordPair.maxLength = Math.max(wordPair.startWord.length, wordPair.endWord.length) + 1;
        wordPair.minLength = Math.max(Math.min(wordPair.startWord.length, wordPair.endWord.length) - 1, 3);

        gameState.latestWord = wordPair.startWord;
        gameState.targetWord = wordPair.endWord;
    } else {
        document.getElementById('gameArea').innerText = "All Rounds Completed!";
    }
}

function buildWordPairTiles() {
    makeTilesIn(startWordCont, wordPair.startWord);
    makeTilesIn(endWordCont, wordPair.endWord);
}



// DIRECTIONAL CONFIGURATIONS
function getDirectionalConfig() {
    if (gameState.direction === 'norm') {
        return {
            upperRack: normRack,
            lowerRack: flipRack,
            wordAtTop: wordPair.startWord,
            wordAtBottom: wordPair.endWord,
            upperArray: gameState.normArray,
            lowerArray: gameState.flipArray,
        };
    } else { // i.e. is 'flip'
        return {
            upperRack: flipRack,
            lowerRack: normRack,
            wordAtTop: wordPair.endWord,
            wordAtBottom: wordPair.startWord,
            upperArray: gameState.flipArray,
            lowerArray: gameState.normArray,
        };
    }
}

// FUNCTION: Update the latest and target word based on the current directional configuration
function updateLatestAndTargetWords() {
    const {upperArray, wordAtTop, lowerArray, wordAtBottom} = getDirectionalConfig();

    gameState.latestWord = upperArray.length ? upperArray.at(-1) : wordAtTop;
    gameState.targetWord = lowerArray.length ? lowerArray.at(-1) : wordAtBottom;
    console.log('update latest/target: ', gameState.latestWord, gameState.targetWord);
}


//====UTILITY FUNCTIONS====//

function addClass(className, classToAdd) {
    const elems = document.querySelectorAll('.' + className);
    elems.forEach(el => el.classList.add(classToAdd));
}
function removeClass(className, classToRemove) {
    const elems = document.querySelectorAll('.' + className);
    elems.forEach(el => el.classList.remove(classToRemove));
}

function focusTextInputBox() {inputField.focus()}

function emptyInputField() {inputField.value = ''}

function logArrays(when) {
    const normArray = gameState.normArray;
    const flipArray = gameState.flipArray;

    console.log(when, ": normArray Contents:", normArray, ". normArray items:", normArray.length);
    console.log(when, ": flipArray Contents:", flipArray, ". flipArray items:", flipArray.length);

}


////EMPTYING CONTAINERS and CONTAINER RACKS ❗️❗️❗️❗️❗️❗️
function clearInputUI() {
    document.querySelectorAll('#normRack .wordCont, #flipRack .wordCont').forEach(wordCont => {
        wordCont.querySelectorAll('div').forEach(tile => {
            tile.textContent = '';
            tile.classList.remove('tile');
        });
        wordCont.classList.remove('wordCont');
    });
}

//====BEST SCORES====//

// Convert word pairs and set up a best scores object
let bestScores = {};

// Update the best score for a word pair in `localStorage`
function updateBestScore(pairKey, score) {
    if (score < bestScores[pairKey] || !bestScores[pairKey]) { // Only update if score is lower
        bestScores[pairKey] = score;
        localStorage.setItem(pairKey, JSON.stringify(score));
    }
}

// Check and update the best score after a round, if it's a new best
function checkAndUpdateBestScoreIndex() {
    const pairKey = `${wordPair.startWord}-${wordPair.endWord}`;
    if (!bestScores[pairKey] || gameState.moveCounter < bestScores[pairKey]) {
        bestScores[pairKey] = gameState.moveCounter;
        localStorage.setItem(pairKey, JSON.stringify(gameState.moveCounter));
    }
}



// Display the best score on the UI
function updateBestScoreUI() {
    const bestScoreDisplay = document.getElementById('bestScore');
    const pairKey = `${wordPair.startWord}-${wordPair.endWord}`;
    const latestBestScore = bestScores[pairKey] || "--";
    bestScoreDisplay.innerText = "Best: " + latestBestScore;
}


// function renderRoundList() {
//     const roundList = document.getElementById('roundList');
//     roundList.innerHTML = ''; // Clear existing list

//     console.log(wordPairDetails);

//     wordPairDetails.forEach(pair => {
//         const pairKey = `${pair.start}-${pair.end}`;
//         const bestScore = bestScores[pairKey] || 0;

//         // Create list item
//         const listItem = document.createElement('li');
//         listItem.innerHTML = `
//             ${pair.start.toUpperCase()} → ${pair.end.toUpperCase()}
//             <span class="star-container">${generateStars(bestScore)}</span>
//         `;
//         listItem.addEventListener('click', () => jumpToRound(pairKey));

//         roundList.appendChild(listItem);
//     });
// }

function renderRoundList() {
    const roundList = document.getElementById('roundList');
    roundList.innerHTML = ''; // Clear existing list

    wordPairDetails.forEach(pair => {
        const pairKey = `${pair.start}-${pair.end}`;
        const bestScore = bestScores[pairKey] || 0;

        // Create list item with static grey stars
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            ${pair.start.toUpperCase()} → ${pair.end.toUpperCase()}
            <span class="star-container">
                <span class="star">★</span>
                <span class="star">★</span>
                <span class="star">★</span>
            </span>
        `;
        
        // Add 'yellow' class to stars based on the best score
        const stars = listItem.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < bestScore) star.classList.add('yellow');
        });

        listItem.addEventListener('click', () => jumpToRound(pairKey));
        roundList.appendChild(listItem);
    });
}


// function renderResultPanel() {
//     const starContainer = document.getElementById('starContainer');
//     const moves = gameState.moveCounter;
//     const message = document.getElementById('resultMessage');

//     // Determine star rating based on score3star and score2star
//     let starRating;
//     if (moves <= wordPair.score3star) starRating = 3;
//     else if (moves <= wordPair.score2star) starRating = 2;
//     else starRating = 1;

//     // Use generateStars to update the starContainer with the appropriate star rating
//     starContainer.innerHTML = generateStars(starRating);

//     // Update the result message based on the star rating

//     switch (starRating) {
//         case 3:
//             message.innerText = `Completed in ${gameState.moveCounter} moves!\nOutstanding!`;
//             break;
//         case 2:
//             message.innerText = `Completed in ${gameState.moveCounter} moves!\nGreat job!`;
//             break;
//         case 1:
//             message.innerText = `Completed in ${gameState.moveCounter} moves!\nYou know words good!!`;
//             break;
//     }

// }

function renderResultPanel() {
    const starContainer = document.getElementById('starContainer');
    const moves = gameState.moveCounter;
    const message = document.getElementById('resultMessage');

    // Determine star rating based on score3star and score2star
    let starRating;
    if (moves <= wordPair.score3star) starRating = 3;
    else if (moves <= wordPair.score2star) starRating = 2;
    else starRating = 1;

    // Add 'yellow' class to stars based on the starRating
    const stars = starContainer.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < starRating) star.classList.add('yellow');
    });

    // Update the result message based on the star rating
    if (starRating === 3) message.innerText = `Completed in ${gameState.moveCounter} moves!\nOutstanding!`;
    else if (starRating === 2) message.innerText = `Completed in ${gameState.moveCounter} moves!\nGreat job!`;
    else message.innerText = `Completed in ${gameState.moveCounter} moves!\nYou know words good!!`;
}



// Jump to a specific round when selected from the list
function jumpToRound(pairKey) {
    const [startWord, endWord] = pairKey.split('-');
    wordPair.startWord = startWord;
    wordPair.endWord = endWord;

    console.log(wordPair.startWord, wordPair.endWord);
    // setWordPairAndLengths(0);
    buildWordPairTiles(); //***** NEED TO SET LATEST/TARGET and LENGTHS
    updateBestScoreUI();
    togglePopup('close');
}




//UPDATE MOVECOUNTER ON SCREEN - ❓ COMBINE?
function updateMoveCounterUI() {
    document.getElementById('moveCounter').innerText = "Moves: " + gameState.moveCounter;
}


function togglePopup(action) {
    const overlay = document.querySelector('.overlay');
    const popup = document.getElementById('popupPanel');
    const helpContent = document.getElementById('helpContent');
    const roundsContent = document.getElementById('roundsContent');

    // Hide all content initially
    helpContent.classList.add('hidden');
    roundsContent.classList.add('hidden');

    if (action === 'close') {
        // Hide the overlay and the popup
        overlay.classList.remove('visible');
        popup.classList.add('hidden');
    } else {
        // Show specific content based on the type
        if (action === 'help') helpContent.classList.remove('hidden');
        else if (action === 'rounds') roundsContent.classList.remove('hidden');

        // Show the overlay and the popup
        overlay.classList.add('visible');
        popup.classList.remove('hidden');
    }
}

//GETTING THE INPUTWORD CONT READY
function prepareInputCont(rack, array) {
    const positionInArray = array.length;
    const wordContsInRack = rack.children;
    let cont;

    // If the array has fewer entries than there are divs in, then use rack's child at array length...
    if (wordContsInRack && positionInArray < wordContsInRack.length) {
        cont = wordContsInRack[positionInArray];
    // ...otherwise, use a new div added to rack.
    } else {
        cont = document.createElement('div');
        rack.appendChild(cont);
    }

    // Clear the wordCont in case of preexisting tiles
    cont.innerHTML = '';

    // Make 6 empty tileConts inside the wordCont
    for (let i = 0; i < 6; i++) {
        const tileCont = document.createElement('div');
        cont.appendChild(tileCont);
    }

    cont.classList.add('wordCont');
    return cont;
}

////GENERATING WORD TILES////
function makeTilesIn(wordCont, word) {
    wordCont.querySelectorAll('div').forEach((tile, i) => {
        const isVisible = i < word.length;
        tile.textContent = isVisible ? word[i].toUpperCase() : '';
        tile.classList.toggle('tile', isVisible);
        tile.classList.toggle('hidden', !isVisible);
        if (isVisible && (wordCont === startWordCont || wordCont === endWordCont)) tile.style.animationDelay = `${0.2 + i * 0.2}s`;
    });
}


//FUNC: SUBMITTING A MOVE
function submitMove() {
    const inputWord = inputField.value.toLowerCase();

    if (isTotallyValid(inputWord, gameState.latestWord)) {
        const {upperRack, upperArray} = getDirectionalConfig();

        upperArray.push(inputWord);
        updateLatestAndTargetWords();
        gameState.phase = 'mid';
        gameState.latestMove = 'submit';
        gameState.moveCounter++;

        // UPDATE UI (Build tiles, animations, etc.)
        let wordCont = prepareInputCont(upperRack, upperArray);
        makeTilesIn(wordCont, inputWord);

        if (inputWord === gameState.targetWord) updateGame('complete');
        else {

            // Start modifyHeight and then trigger toggleClassesInSequence only after it completes
            modifyHeight('submit', upperRack, upperArray)
                .then(() => {
                // Once modifyHeight completes, fade in and out .wordCont
                toggleClassesInSequence(wordCont, ['fade-in', 'visible', 'fade-in'], [0, 0, 2000]);
                });

            emptyInputField();
            updateDeleterVisibility();
        }
    }
}


function deleteMove(which) {
    // determine which rack/array to delete from
    let dirConfig;
    switch (which) {
        case 'norm':
            dirConfig = {rack: normRack, array: gameState.normArray};
            break;
        case 'flip':
            dirConfig = {rack: flipRack, array: gameState.flipArray};
            break;
        case 'top':
            dirConfig = gameState.direction === 'norm'
                ? {rack: normRack, array: gameState.normArray}
                : {rack: flipRack, array: gameState.flipArray};
            break;
    }

    // find all wordConts in the rack
    let wordConts = dirConfig.rack.querySelectorAll('.wordCont');
    let wordToDelete = wordConts[wordConts.length - 1];

    // delete last entry in array (if non-empty) and last wordCont in rack
    if (dirConfig.array.length > 0) dirConfig.array.pop();

    gameState.moveCounter--;
    updateLatestAndTargetWords();

    // record latestMove (for "Undo" post-completion)
    gameState.latestMove = dirConfig.rack === normRack
        ? 'delete-norm'
        : 'delete-flip';

    // if latest & target match after delete, trigger completion code
    if (gameState.latestWord === gameState.targetWord) updateGame('complete');
    else {
        // Apply the classes in sequence to trigger the fade-out effect
        toggleClassesInSequence(wordToDelete, ['visible', 'fade-out'], [0, 0]);

        // Delay the removal by .3 seconds
        setTimeout(() => {
            modifyHeight('delete', dirConfig.rack, dirConfig.array);
            wordToDelete.remove();
        }, 200);

        emptyInputField();
        updateDeleterVisibility();
    }

    logArrays('after delete');
}



// wordCont.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // Ensure visibility



// function modifyHeight(action, rack, array) {
//     // Get the height of startWordCont in pixels
//     let wordContHeight = parseFloat(window.getComputedStyle(startWordCont).height);

//     // If Submit/Delete: New height of rack = number of words in array x wordCont height
//     if (action === 'submit' || action === 'delete') rack.style.height = array.length * wordContHeight + 'px';

//     // If Complete: 
//     else if (action === 'complete') getDirectionalConfig().upperRack.style.transform = 'translateY(' + 18 * (window.innerWidth / 100) + wordContHeight + ')';
// }

function modifyHeight(action, rack, array) {
    return new Promise((resolve) => {
      let wordContHeight = parseFloat(window.getComputedStyle(startWordCont).height);
  
      if (action === 'submit' || action === 'delete') {
        // Set the height based on the array length
        rack.style.height = array.length * wordContHeight + 'px';
  
        // Listen for the height transition to complete
        const onTransitionEnd = (event) => {
          if (event.propertyName === 'height') { // Check if the height property finished transitioning
            rack.removeEventListener('transitionend', onTransitionEnd); // Clean up the event listener
            resolve(); // Resolve the promise when the transition ends
          }
        };
  
        // Add the event listener for the height transition
        rack.addEventListener('transitionend', onTransitionEnd);
      } 
      else if (action === 'complete') {
        // Set the transform for a sliding effect
        const upperRack = getDirectionalConfig().upperRack;
        upperRack.style.transform = 'translateY(' + (18 * (window.innerWidth / 100) + wordContHeight) + 'px';
  
        // Listen for the transform transition to complete
        const onTransformEnd = (event) => {
          if (event.propertyName === 'transform') { // Check if the transform property finished transitioning
            upperRack.removeEventListener('transitionend', onTransformEnd); // Clean up the event listener
            resolve(); // Resolve the promise when the transition ends
          }
        };
  
        // Add the event listener for the transform transition
        upperRack.addEventListener('transitionend', onTransformEnd);
      }
    });
  }
  






function updateDirectionUI(direction) {
    const elementsToUpdate = [
        document.getElementById('gameplayCont'),
        document.getElementById('flipperAndDeleters')
    ];

    elementsToUpdate.forEach(element => {
        if (element) {
            if (direction === 'flip') element.setAttribute('data-flip', '')
            else if (direction === 'norm') element.removeAttribute('data-flip');
        }
    });
}

// 
function toggleFlip() {
    // Toggle game direction and update latest/target words
    gameState.direction = gameState.direction === 'norm' ? 'flip' : 'norm';
    updateLatestAndTargetWords();
    gameState.phase = 'mid';

    // Animation UI
    const inputFieldAndButtons = document.getElementById('inputAndSideButtons')
    const toggleFlip = document.getElementById('toggleFlip');
    const racks = document.querySelectorAll('.rack');
    const deleters = document.querySelectorAll('.deleter');

    // Start the button rotation animation
    toggleClassesInSequence([toggleFlip], ['pressed', 'pressed'], [0, 200]);
    toggleClassesInSequence([inputFieldAndButtons], ['rotating', 'rotating'], [0, 2000]);


    toggleClassesInSequence([...racks, ...deleters], ['visible','fade-out','fade-out','visible'], [0,0,1200,1200]);

    // Set a timeout to flip racks during fade
    setTimeout(() => {
        updateDirectionUI(gameState.direction);
    }, 600);
}


function toggleClassesInSequence(elements, classes, delays) {
    // Ensure `elements` is an array, even if a single element is passed
    const elementArray = Array.isArray(elements) ? elements : [elements];

    // Apply each class in sequence for each element
    elementArray.forEach(element => {
        classes.forEach((className, index) => {
            setTimeout(() => {
                element.classList.toggle(className);
            }, delays[index]);
        });
    });
}


function updateDeleterVisibility() {
    const deleteNorm = document.getElementById('normDeleter');
    const deleteFlip = document.getElementById('flipDeleter');

    gameState.normArray.length < 1
        ? deleteNorm.classList.add('invisible')
        : deleteNorm.classList.remove('invisible');
            
    gameState.flipArray.length < 1
        ? deleteFlip.classList.add('invisible')
        : deleteFlip.classList.remove('invisible');
}

function undoMove() {
    gameState.phase = 'mid';

    switch (gameState.latestMove) {
        case 'submit':
            deleteMove('top');
            break;
        case 'delete-norm': //*****
            makeTilesIn(gameState.latestWord, normRack, gameState.normArray);
            break;
        case 'delete-flip':
            makeTilesIn(gameState.latestWord, flipRack, gameState.flipArray);
            break;
    }
    updateUI('undoMove');
}


function updateUI(stateOrAction) {

    const stars = document.getElementById('starContainer').querySelectorAll('.star');

    console.log('phase: ', gameState.phase);

    if (gameState.phase === 'pre') {
        removeClass('post', 'complete');

        stars.forEach(star => {
            star.classList.remove('yellow');
        });

        updateDeleterVisibility();
        updateDirectionUI('norm');
        clearInputUI();
        emptyInputField();

        normRack.style.height = 0;
        flipRack.style.height = 0;
    }

    switch (stateOrAction) {
        case 'complete':
            emptyInputField();
            modifyHeight('complete');
            addClass('post', 'complete');
            break;
        case 'undoMove':
            stars.forEach(star => {
                star.classList.remove('yellow');
            });
            removeClass('post', 'complete');
            break;
    }

    updateBestScoreUI();
    updateMoveCounterUI(); //"go back"を考えると、completeでも一応update?いや、数字がアプデされてればいい？
}




function updateGame(action) {
    switch (action) {   
        case 'complete':
            gameState.phase = 'post';
            checkAndUpdateBestScoreIndex();
            renderResultPanel();

            updateLatestAndTargetWords();
            updateBestScoreUI();
            checkAndUpdateBestScoreIndex();
            updateUI(action);
            console.log("ROUND COMPLETE!!");
            break;

        case 'nextRound':
            checkAndUpdateBestScoreIndex();
            // updateBestScoreUI();
            wordPair.currentPairIndex++;
        case 'resetRound':
            resetGameState();
            // logArrays('after reset/next');
            setWordPairAndLengths();
            updateUI();
            buildWordPairTiles();
            
            console.log(`'${action}'. latest/target word: ${gameState.latestWord}; ${gameState.targetWord}`);
            break;

    };
    
    logArrays();
    console.log('latestMove: ', gameState.latestMove);
    console.log(`'${action}'. latest/target word: ${gameState.latestWord}; ${gameState.targetWord}`);
}


// INITIALIZE GAME DISPLAY AFTER GAMELOAD
document.addEventListener('DOMContentLoaded', (event) => {

    // Function to set custom --vh unit based on viewport height
    function setVhUnit() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    // Call setVhUnit on load + add listener to adjust --vh on resize
    setVhUnit();
    window.addEventListener('resize', setVhUnit);

    setWordPairAndLengths(0);
    buildWordPairTiles();

    // Initialize best scores for each word pair
    wordPairDetails.forEach(pair => {
        const key = `${pair.start}-${pair.end}`;
        // Load from localStorage if available, otherwise default to 0 stars
        bestScores[key] = JSON.parse(localStorage.getItem(key)) || 0;
    });

    // Initialize best scores for each word pair from localStorage
    wordPairDetails.forEach(pair => {
        const key = `${pair.start}-${pair.end}`;
        bestScores[key] = JSON.parse(localStorage.getItem(key)) || 0;
    });

    checkAndUpdateBestScoreIndex();

    // Event listener for TEXT BOX (Enter Key)
    inputField.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') submitMove();
    });

    // Event listener for onscreen keyboard (using event delegation)
    document.getElementById('keyboard').addEventListener('click', function(event) {
        const key = event.target.closest('.key');
        if (!key) return; // Ignore clicks outside of keys

        const keyValue = key.textContent;

        if (keyValue === 'Enter') submitMove();
        else if (keyValue === 'Del') inputField.value = inputField.value.slice(0, -1);
        else inputField.value += keyValue;
    });

    updateBestScoreUI();

    // Initialize
    removeClass('overlay', 'loading');

    renderRoundList();
    
});