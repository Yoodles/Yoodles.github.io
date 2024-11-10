const inputField = document.getElementById('inputField');
const startWordCont = document.getElementById('startWord');
const normRack = document.getElementById('normRack'); 
const flipRack = document.getElementById('flipRack');
const endWordCont = document.getElementById('endWord');


//// INITIAL STATE AT START OF ROUND ////
const initialGameState = () => ({
    direction: 'norm',
    moveCounter: 0,
    normArray: [],
    flipArray: [],
    latestWord: '',
    targetWord: '',
    latestMove: '',
    isComplete: false,
});

let gameState = initialGameState();

function resetGameState() {
    gameState = initialGameState();
}

let wordPair = {
    currentPairKey: '',  // Store the current pair key instead of an index
    startWord: '',
    endWord: '',
    maxLength: 6,
    minLength: 3,
    score3star: 0,
    score2star: 0
};

//Function to find Word Pair by pairKey
function findWordPair(pairKey) {
    return wordPairDetails.find(pair => pair.pairKey === pairKey);
}

// Jump to a specific round when selected from the list
function jumpToRound(pairKey) {
    console.log(`Jumping to round: ${pairKey}`);
    
    // Set up the new word pair, calculate lengths, and initialize latest/target words
    setWordPairAndLengths(pairKey);
    resetUI();
    // Verify that the correct words are set
    console.log(`Start word: ${wordPair.startWord}, End word: ${wordPair.endWord}`);
    console.log(`Current pairKey: ${pairKey}`);

    buildWordPairTiles();

    // Update the best score UI for the selected round
    updateBestScoreUI(pairKey);

    togglePanel('close');
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

function toggleClassWithDelay(elements, className, action, delay) {
    // Ensure `elements` is an array, even if a single element is passed
    const elementArray = Array.isArray(elements) ? elements : [elements];

    // Apply the add/remove action
    elementArray.forEach(element => {
        if (action === 'add') {
            element.classList.add(className);
        } else if (action === 'remove') {
            element.classList.remove(className);
        } else {
            console.error("Invalid action: use 'add' or 'remove'");
            return;
        }

        // If a delay is provided, reverse the action after the delay
        if (delay) {
            setTimeout(() => {
                if (action === 'add') {
                    element.classList.remove(className);
                } else if (action === 'remove') {
                    element.classList.add(className);
                }
            }, delay);
        }
    });
}







function renderRoundList() {
    const roundList = document.getElementById('roundList');
    roundList.innerHTML = ''; // Clear existing list

    // Define static grey stars to avoid repeated creation
    const greyStarsHTML = `
    <span class="star-container">
        <span class="star">★</span>
        <span class="star">★</span>
        <span class="star">★</span>
    </span>
    `;

    wordPairDetails.forEach(pair => {
        const bestScore = bestScores[pair.pairKey] || 0;

        // Create list item with static grey stars
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            ${pair.start.toUpperCase()} → ${pair.end.toUpperCase()}
            ${greyStarsHTML}
        `;
        
        // Add 'yellow' class to stars based on the best score
        const stars = listItem.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < bestScore) star.classList.add('yellow');
        });

        // Set up click event to jump to the specific round
        listItem.addEventListener('click', () => jumpToRound(pair.pairKey));
        roundList.appendChild(listItem);
    });
}


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
    stars.forEach(star => star.classList.remove('yellow'));

    stars.forEach((star, index) => {
        if (index < starRating) star.classList.add('yellow');
    });

    // Update the result message based on the star rating
    if (starRating === 3) message.innerText = `Completed in ${gameState.moveCounter} moves!\nOutstanding!`;
    else if (starRating === 2) message.innerText = `Completed in ${gameState.moveCounter} moves!\nGreat job!`;
    else message.innerText = `Completed in ${gameState.moveCounter} moves!\nYou know words good!!`;
}




function toggleFlip() {
    // Toggle game direction and update latest/target words
    gameState.direction = gameState.direction === 'norm' ? 'flip' : 'norm';
    updateLatestAndTargetWords();

    // Animation UI
    // const inputSet = document.getElementById('inputSet');
    const upperDeleter = document.getElementById('upperDeleter');
    const deleters = document.querySelectorAll('.deleter');
    const overlay = document.getElementById('overlay');
    const flipper = document.getElementById('toggleFlip');

    // toggleClassesInSequence([toggleFlip], ['pressed', 'pressed'], [0, 200]);
    toggleClassesInSequence([inputField, flipper], ['rotating', 'rotating'], [0, 1400]);
    toggleClassesInSequence([deleters], ['fade-out', 'fade-out'], [0, 800]);

    // toggleOverlay();
    fadeIn(overlay, 600);
    setTimeout(() => {
        updateDirectionUI(gameState.direction);
        fadeOut(overlay, 1000);
    }, 1000);

}


//FUNC: SUBMITTING A MOVE
// function submitMove() {
//     const inputWord = inputField.value.toLowerCase();

//     if (isTotallyValid(inputWord, gameState.latestWord)) {
//         const {upperRack, upperArray} = getDirectionalConfig();

//         upperArray.push(inputWord);

//         updateLatestAndTargetWords();
//         gameState.latestMove = 'submit';
//         gameState.moveCounter++;
//         if (inputWord === gameState.targetWord) gameState.isComplete = true;

//         // UPDATE UI (Build tiles, animations, etc.)
//         let wordCont = prepareInputCont(upperRack, upperArray);
//         makeTilesIn(wordCont, inputWord);
//         wordCont.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // Ensure visibility


//         setTimeout(() => {
//             toggleClassesInSequence(wordCont, ['fade-in', 'visible', 'fade-in'], [0, 0, 2000]);
//         }, 4000);

//         modifyHeight('submit', upperRack, upperArray);

//         updateDeleterVisibility();
//         emptyInputField();
//         updateMoveCounterUI();
//         if (gameState.isComplete) updateGame('complete');
//     }

//     //GETTING THE INPUTWORD CONT READY
//     function prepareInputCont(rack, array) {
//         const positionInArray = array.length;
//         const wordContsInRack = rack.children;
//         let cont;

//         // If the array has fewer entries than there are divs in, then use rack's child at array length...
//         if (wordContsInRack && positionInArray < wordContsInRack.length) {
//             cont = wordContsInRack[positionInArray];
//         // ...otherwise, use a new div added to rack.
//         } else {
//             cont = document.createElement('div');
//             rack.appendChild(cont);
//         }

//         // Clear the wordCont in case of preexisting tiles
//         cont.innerHTML = '';

//         // Make 6 empty tileConts inside the wordCont
//         for (let i = 0; i < 6; i++) {
//             const tileCont = document.createElement('div');
//             cont.appendChild(tileCont);
//         }

//         cont.classList.add('wordCont');
//         return cont;
//     }
// }




function submitMove() {
    const inputWord = inputField.value.toLowerCase();

    if (isTotallyValid(inputWord, gameState.latestWord)) {
        const {upperRack, upperArray} = getDirectionalConfig();

        // Push the input word to the corresponding array
        upperArray.push(inputWord);

        updateLatestAndTargetWords();
        gameState.latestMove = 'submit';
        gameState.moveCounter++;

        if (inputWord === gameState.targetWord) gameState.isComplete = true;

        // Get or create the wordCont for the input word
        let wordCont = prepareInputCont(upperRack, upperArray);

        makeTilesIn(wordCont, inputWord);

        setTimeout(() => {
            toggleClassesInSequence(wordCont, ['fade-in', 'visible', 'fade-in'], [0, 0, 1000]);
        }, 300);

        modifyHeight('submit', upperRack, upperArray);

        updateDeleterVisibility();
        emptyInputField();
        updateMoveCounterUI();
        if (gameState.isComplete) updateGame('complete');
    }

}



function createTilesHTML() {
    return '<div class="tile"></div>'.repeat(6);
}



// Prepare a wordCont for the input word
function prepareInputCont(rack, array) {
    const positionInArray = array.length -1;
    const wordContsInRack = rack.querySelectorAll('.wordCont');
    let cont;

    // Use an existing wordCont if available
    if (positionInArray < wordContsInRack.length) {
        cont = wordContsInRack[positionInArray];

        resetTiles(cont); //Reset the tiles for reuse

    // ...otherwise, create new .wordCont and populate with tiles
    } else {
        cont = createWordContWithTiles();
        rack.appendChild(cont);
    }
    return cont;
}

function createWordContWithTiles() {
    const cont = document.createElement('div');
    cont.classList.add('wordCont');
    cont.innerHTML = createTilesHTML(); // Add 6 tiles using a string literal
    return cont;
}

// Reset the tiles inside an existing wordCont
function resetTiles(wordCont) {
    wordCont.querySelectorAll('.tile').forEach(tile => {
        tile.textContent = ''; // Clear text content
        tile.classList.remove('hidden', 'fade-in', 'visible'); // Reset classes
    });
}



// Generate tiles for the input word and populate the wordCont
function makeTilesIn(wordCont, word) {
    wordCont.querySelectorAll('.tile').forEach((tile, i) => {
        const isVisible = i < word.length;
        tile.textContent = isVisible ? word[i].toUpperCase() : '';
        tile.classList.toggle('tile', isVisible);
        tile.classList.toggle('hidden', !isVisible);
        // if (isVisible) tile.style.transitionDelay = `${0.2 + i * 0.2}s`;

        if (isVisible && (wordCont === startWordCont || wordCont === endWordCont)) tile.style.animationDelay = `${i * 0.2}s`;
    });
}
    




function deleteMove(which) {
    // determine which rack/array to delete from
    const {upperRack, upperArray, lowerRack, lowerArray} = getDirectionalConfig();
    let rack, array;

    if (which === 'upper') {
        rack = upperRack;
        array = upperArray;
    } else if (which ==='lower') {
        rack = lowerRack;
        array = lowerArray;
    }

    // find all visible wordConts in the rack
    const wordConts = Array.from(rack.querySelectorAll('.wordCont.visible'));
    const wordContToDelete = wordConts[wordConts.length - 1];

    if (!wordContToDelete) {
        console.warn('No visible wordConts to delete.');
        return;
    }
    console.log('wordContToDelete: ', array[array.length -1]);

    // Update game state and arrays
    gameState.latestMove = `delete-${array === gameState.normArray ? 'norm' : 'flip'}-${array[array.length - 1]}`;
    console.log('latestMove: ', gameState.latestMove);

    // delete last entry in array (if non-empty) and last wordCont in rack
    if (array.length > 0) array.pop();

    updateLatestAndTargetWords();
    gameState.moveCounter--;
    if (gameState.latestWord === gameState.targetWord) gameState.isComplete = true;


    // Apply the classes in sequence to trigger the fade-out effect
    toggleClassesInSequence(wordContToDelete, ['visible', 'fade-out'], [0, 0]);
    toggleClassesInSequence(wordContToDelete, ['fade-out', 'visible'], [0, 200]);


    // Reset tiles for future reuse after fade-out
    setTimeout(() => {
        resetTiles(wordContToDelete); // Reset tiles instead of removing the wordCont
        modifyHeight('delete', rack, array);
    }, 400);

    updateDeleterVisibility();
    emptyInputField();
    updateMoveCounterUI();
    if (gameState.isComplete) updateGame('complete');
    // else wordContToDelete.remove();
}


function toggleOverlay(mode) {
    const overlay = document.getElementById('overlay');
    let duration = 300;

    switch (mode) {
        case 'popup-background':
            overlay.classList.add('full-screen', 'dark');
            duration = 1000;
            break;
        case 'on-and-off':

            break;
        case 'initial':
            duration = 500;
            // fadeOut(overlay, 500);
            break;
        case 'message':
            overlay.classList.add('message');
            break;
        default:
            break;
    }

    if (overlay.classList.contains('hidden')) {
        fadeIn(overlay, duration);
    }
    else {
        fadeOut(overlay, duration);
        setTimeout(() => {
            overlay.className = 'overlay hidden';
        }, 1000);
    }

}

//Element should start with .invisible or already be at opacity: 0.
function fadeIn(element, duration = 500) {
    element.style.transitionDuration = `${duration}ms`;

    // Always remove 'hidden' and reset display if it exists
    element.classList.remove('hidden');
    // element.style.display = ''; // Reset inline display property if previously set to 'none'

    // Handle fade-in
    element.classList.remove('invisible', 'fade-out');
    element.classList.add('fade-in');
}

//Element should start with the fade-in or visible state (already at opacity: 1).
function fadeOut(element, duration = 500, addHidden = false) {
    element.style.transitionDuration = `${duration}ms`;

    // Start fade-out transition
    element.classList.remove('fade-in');
    element.classList.add('fade-out');

    // Handle post-transition state
    setTimeout(() => {
        if (addHidden) {
            element.classList.add('hidden'); // Add 'hidden' for display: none
            // element.style.display = 'none'; // Explicitly set display to none
        }
        else element.classList.add('invisible'); // Just make it invisible

    }, duration);
}

function modifyHeight(action, rack, array) {
    const wordContHeight = window.innerWidth * 11.5 / 100;

    // If Complete: 
    if (gameState.isComplete) {
        const normSet = document.getElementById('normSet');
        const flipSet = document.getElementById('flipSet');

        if (action === 'submit') {
            normSet.classList.add('subm');
            flipSet.classList.add('subm');
        } else if (action === 'delete') {
            normSet.classList.add('del');
            flipSet.classList.add('del');
        }

        if (gameState.direction === 'norm') {
            normSet.classList.add('slide-down-complete');
            flipSet.classList.add('slide-up-complete');
        } else {
            normSet.classList.add('slide-up-complete');
            flipSet.classList.add('slide-down-complete');
        }
    }
    else rack.style.height = array.length * wordContHeight + 'px';
}


function toggleResult() {
    const resultPanel = document.getElementById('resultPanel');
    resultPanel.classList.toggle('hidden');
}

function togglePanel(action) {
    const popup = document.getElementById('popupPanel');

    if (action === 'close') {
        // Hide the overlay and the popup
        toggleOverlay();
        popup.classList.add('hidden');

    } else {
        const helpContent = document.getElementById('helpContent');
        const roundsContent = document.getElementById('roundsContent');

        // Hide all content initially
        helpContent.classList.add('hidden');
        roundsContent.classList.add('hidden');
        
        // Show specific content based on the type
        if (action === 'help') helpContent.classList.remove('hidden');
        else if (action === 'rounds') roundsContent.classList.remove('hidden');
    }
    // Show the overlay and the popup
    toggleOverlay('popup-background');
    popup.classList.remove('hidden');

}


function undoMove() {
    gameState.isComplete = false;
    // gameState.moveCounter--;
    toggleResult();

    if (gameState.latestMove === 'submit') deleteMove('upper');
    else {
        'delete-norm'; //***** wordConts[wordConts.length - 1];
        makeTilesIn(gameState.latestWord, normRack, gameState.normArray);
        makeTilesIn(gameState.latestWord, flipRack, gameState.flipArray);
    }

    updateMoveCounterUI(); //*****prob unnecessary

    const stars = document.getElementById('starContainer').querySelectorAll('.star');
    stars.forEach(star => {
        star.classList.remove('yellow');
    });
}





function updateGame(action) {
    const currentPairKey = `${wordPair.startWord}-${wordPair.endWord}`;

    switch (action) {   
        case 'complete':
            checkAndUpdateBestScoreAfterRound();
            localStorage.setItem('lastCompletedPair', currentPairKey);

            renderResultPanel();
            setTimeout(() => {
                toggleResult();
            }, 1200);           
            break;

        case 'nextRound':
            gameState.isComplete = false;
            const currentIndex = wordPairDetails.findIndex(pair => pair.pairKey === currentPairKey);
            const nextPair = wordPairDetails[currentIndex + 1];
        
            if (nextPair) {
                resetGameState();
                setWordPairAndLengths(nextPair.pairKey);
                resetUI();
                buildWordPairTiles();
            } else document.getElementById('gameArea').innerText = "All Rounds Completed!";

            break;

        case 'resetRound':
            gameState.isComplete = false;
            toggleOverlay('initial');

            resetGameState();
            setWordPairAndLengths(currentPairKey);
            resetUI();
            buildWordPairTiles();
            break;
    };
    
    // logArrays();
    console.log('latestMove: ', gameState.latestMove);
    console.log(`'${action}'. latest/target word: ${gameState.latestWord}; ${gameState.targetWord}`);
}



function resetUI() {

    document.getElementById('resultPanel').classList.remove('active');

    updateDirectionUI('norm');
    clearInputUI();
    emptyInputField();

    normRack.style.height = 0;
    flipRack.style.height = 0;
    //also reset .set

    const pairKey = `${wordPair.startWord}-${wordPair.endWord}`;

    updateBestScoreUI(pairKey);
    updateMoveCounterUI();
}







// FUNC: SETTING NEW WORD PAIR FOR ROUND; CALCULATING MIN./MAX. LENGTHS
function setWordPairAndLengths(pairKey) {
    // Find the word pair by its pairKey
    const wordPairData = wordPairDetails.find(pair => pair.pairKey === pairKey);

    if (wordPairData) {
        wordPair.currentPairKey = pairKey;  // Update currentPairKey

        // Set the word pair properties
        wordPair.startWord = wordPairData.start;
        wordPair.endWord = wordPairData.end;
        wordPair.score3star = wordPairData.score.A;
        wordPair.score2star = wordPairData.score.B;

        // Set min and max lengths for the round
        wordPair.maxLength = Math.max(wordPair.startWord.length, wordPair.endWord.length) + 1;
        wordPair.minLength = Math.max(Math.min(wordPair.startWord.length, wordPair.endWord.length) - 1, 3);

        // Update game state
        gameState.latestWord = wordPair.startWord;
        gameState.targetWord = wordPair.endWord;

        console.log(`New round set: ${wordPair.startWord} -> ${wordPair.endWord}. Max. ${wordPair.maxLength}, Min. ${wordPair.minLength}`);
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

//====BEST SCORES====//

// Convert word pairs and set up a best scores object
let bestScores = {};

// Check and update the best score after a round
function checkAndUpdateBestScoreAfterRound(currentScore) {
    const pairKey = wordPair.currentPairKey; // Use currentPairKey directly
    updateBestScore(pairKey, currentScore);
    updateBestScoreUI(pairKey);
}

// Update the best score for a word pair in `localStorage`
function updateBestScore(pairKey, score) {
    // Update if score is lower than in object (or there's no best score in object)
    if (!bestScores[pairKey] || score < bestScores[pairKey]) {
        bestScores[pairKey] = score;

        localStorage.setItem(pairKey, JSON.stringify(score));
    }
}

// Update the best score display in the UI
function updateBestScoreUI(pairKey) {
    const bestScoreDisplay = document.getElementById('bestScore');
    const bestScore = bestScores[pairKey] || "--";
    bestScoreDisplay.innerText = `Best: ${bestScore}`;
}

//UPDATE MOVECOUNTER ON SCREEN - ❓ COMBINE?
function updateMoveCounterUI() {
    document.getElementById('moveCounter').innerText = "Moves: " + gameState.moveCounter;
}



function focusTextInputBox() {inputField.focus()}

function emptyInputField() {inputField.value = ''}

////EMPTYING CONTAINERS and CONTAINER RACKS
function clearInputUI() {
    document.querySelectorAll('#normRack .wordCont, #flipRack .wordCont').forEach(wordCont => {
        wordCont.querySelectorAll('div').forEach(tile => {
            tile.textContent = '';
            tile.classList.remove('tile');
        });
        wordCont.classList.remove('wordCont');
    });
}

function logArrays(when) {
    const normArray = gameState.normArray;
    const flipArray = gameState.flipArray;

    console.log(when, ": normArray Contents:", normArray, ". normArray items:", normArray.length);
    console.log(when, ": flipArray Contents:", flipArray, ". flipArray items:", flipArray.length);

}




function updateDirectionUI(direction) {
    const gameplayCont = document.getElementById('gameplayCont');

    if (direction === 'flip') gameplayCont.classList.add('flip');
    else if (direction === 'norm') gameplayCont.classList.remove('flip');

    updateDeleterVisibility();
}

function updateDeleterVisibility() {
    const upperDeleter = document.getElementById('upperDeleter');
    const lowerDeleter = document.getElementById('lowerDeleter');
    const {upperArray, lowerArray} = getDirectionalConfig();

    if (upperArray.length > 0) upperDeleter.classList.add('active');
    else upperDeleter.classList.remove('active');

    if (lowerArray.length > 0) lowerDeleter.classList.add('active');
    else lowerDeleter.classList.remove('active');

}



// INITIALIZE GAME DISPLAY AFTER GAMELOAD
document.addEventListener('DOMContentLoaded', (event) => {

    console.log('localStorage contents:', { ...localStorage });


    // Function to set custom --vh unit based on viewport height
    function setVhUnit() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    // Call setVhUnit on load + add listener to adjust --vh on resize
    setVhUnit();
    window.addEventListener('resize', setVhUnit);


    // localStorage.clear();

    // Initialize best scores for each word pair from localStorage if available, or default to 0
    wordPairDetails.forEach(pair => {
        const storedScore = localStorage.getItem(pair.pairKey);
    
        try {
            bestScores[pair.pairKey] = storedScore && storedScore !== 'undefined' 
                ? JSON.parse(storedScore) 
                : 0;
        } catch (error) {
            console.warn(`Error parsing data for key: ${pair.pairKey}`, error);
            bestScores[pair.pairKey] = 0;
        }
    });
    

    // Load the first word pair and initialize game state
    const initialPairKey = wordPairDetails[0].pairKey;
    setWordPairAndLengths(initialPairKey);
    buildWordPairTiles();

    // Update the best score UI for the initial pair
    updateBestScoreUI(initialPairKey);

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

    // Initialize UI
    toggleOverlay('initial');
    renderRoundList();
});
