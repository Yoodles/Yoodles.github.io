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


// Convert word pairs and set up a best scores object
let bestScores = {};


// Function to update the best score in localStorage
function updateBestScore(pairKey, score) {
    if (score > bestScores[pairKey]) {
        bestScores[pairKey] = score;
        localStorage.setItem(pairKey, JSON.stringify(score));
    }
}

//FUNC: SETTING NEW WORD PAIR FOR ROUND; CALCULATING MIN./MAX. LENGTHS //❗️❗️❗️❗️❗️
function setWordPairAndLengths() {
    const index = wordPair.currentPairIndex;

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

    console.log(`Benchmarks: A = ${wordPair.score3star}, B = ${wordPair.score2star}`);

}

function buildWordPairTiles() {
    makeTilesFor(wordPair.startWord, startWordCont);
    makeTilesFor(wordPair.endWord, endWordCont);
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

function emptyInputArea() {inputField.value = ''}

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
//UPDATE BEST SCORE FOR THE ROUND ❗️❗️(CHECK IF BEST SCORE?)
// function checkAndUpdateBestScoreIndex() { //just at end of round?
//     const indexNum = wordPair.currentPairIndex;
//     // Check for existing best score, update, and return latest best score
//     //(="If there's no best score for the index no. in bestScoreIndex corresponding to crntPairIndex, or if the moveCounter is lower than it, then the moveCounter shall be the new bestScore in the index")
//     if (!wordPair.bestScoreIndex[indexNum] || gameState.moveCounter < wordPair.bestScoreIndex[indexNum]) {
//         wordPair.bestScoreIndex[indexNum] = gameState.moveCounter;
//     }
// }

function checkAndUpdateBestScoreIndex() {
    const pairKey = `${wordPair.startWord}-${wordPair.endWord}`;

    // Check and update the best score for the current pair if necessary
    if (!bestScores[pairKey] || gameState.moveCounter < bestScores[pairKey]) {
        bestScores[pairKey] = gameState.moveCounter;
        localStorage.setItem(pairKey, JSON.stringify(gameState.moveCounter)); // Store in localStorage
    }
}

//SHOW LATEST BEST SCORE on SCREEN ///　UPDATE!!!!! IF!!!! ANIMATION!!!!!
// function updateBestScoreUI() {
//     const bestScoreDisplay = document.getElementById('bestScore');
//     const latestBestScore = wordPair.bestScoreIndex[wordPair.currentPairIndex] || "--";
//     bestScoreDisplay.innerText = "Best: " + latestBestScore;
// }

function updateBestScoreUI() {
    const bestScoreDisplay = document.getElementById('bestScore');
    const pairKey = `${wordPair.startWord}-${wordPair.endWord}`;
    const latestBestScore = bestScores[pairKey] || "--";
    bestScoreDisplay.innerText = "Best: " + latestBestScore;
}


//UPDATE MOVECOUNTER ON SCREEN - ❓ COMBINE?
function updateMoveCounterUI() {
    document.getElementById('moveCounter').innerText = "Moves: " + gameState.moveCounter;
}



function toggleMenu() {
    document.getElementById('menuPanel').classList.toggle('show');
}



function renderRoundList() {
    const roundList = document.getElementById('roundList');
    roundList.innerHTML = ''; // Clear existing list

    wordPairDetails.forEach(pair => {
        const pairKey = `${pair.start}-${pair.end}`;
        const bestScore = bestScores[pairKey] || 0;

        // Create list item
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            ${pair.start.toUpperCase()} → ${pair.end.toUpperCase()}
            <span class="stars">${generateStars(bestScore)}</span>
        `;
        listItem.onclick = () => jumpToRound(pairKey); // Add click event for navigating rounds

        roundList.appendChild(listItem);
    });
}

function showPopup(type) {
    const popup = document.getElementById('popupPanel');
    const helpContent = document.getElementById('helpContent');
    const roundsContent = document.getElementById('roundsContent');

    // Hide all content initially
    helpContent.classList.add('hidden');
    roundsContent.classList.add('hidden');

    if (type === 'help') {
        helpContent.classList.remove('hidden');
    } else if (type === 'rounds') {
        roundsContent.classList.remove('hidden');
    }

    popup.classList.remove('hidden'); // Show the panel
}


function closePopup() {
    document.getElementById('popupPanel').classList.add('hidden');
}

////GENERATING WORD TILES////
function makeTilesFor(word, rack) {

    let wordCont = (rack !== startWordCont && rack !== endWordCont)
        ? prepareInputWordCont()
        : rack;

    wordCont.querySelectorAll('div').forEach((tile, i) => {
        const isVisible = i < word.length;
        tile.textContent = isVisible ? word[i].toUpperCase() : '';
        tile.classList.toggle('tile', isVisible);
        tile.classList.toggle('hidden', !isVisible);
        if (isVisible && (wordCont === startWordCont || wordCont === endWordCont)) tile.style.animationDelay = `${i * 0.3}s`;
    });
    wordCont.classList.remove('hidden');

    wordCont.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // Ensure visibility
}


function modifyHeight(rack, array) {
    // Get the height of startWordCont in pixels
    let wordContHeight = parseFloat(window.getComputedStyle(startWordCont).height);

    // // New height of rack = number of words in array x wordCont height
    rack.style.height = array.length * wordContHeight + 'px';
}



//GETTING THE INPUTWORD CONT READY
function prepareInputWordCont() {
    const { upperRack, upperArray } = getDirectionalConfig();
    const howManyInArray = upperArray.length;
    const wordsInRack = upperRack.children;
    let wordCont;

    if (wordsInRack && howManyInArray < wordsInRack.length) {
        wordCont = wordsInRack[howManyInArray];
    } else {
        wordCont = document.createElement('div');
        upperRack.appendChild(wordCont);
    }

    wordCont.innerHTML = ''; // Clear word container

    // Prepare 6 empty divs inside wordCont
    for (let i = 0; i < 6; i++) {
        const tileCont = document.createElement('div');
        wordCont.appendChild(tileCont);
    }

    wordCont.classList.add('wordCont');
    return wordCont;
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
    const { upperArray, wordAtTop, lowerArray, wordAtBottom } = getDirectionalConfig();
    gameState.latestWord = upperArray.length ? upperArray.at(-1) : wordAtTop;
    gameState.targetWord = lowerArray.length ? lowerArray.at(-1) : wordAtBottom;
    console.log('update latest/target: ', gameState.latestWord, gameState.targetWord);
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
    const button = document.getElementById('toggleFlip');
    const wordConts = document.querySelectorAll('.wordCont');
    const deleters = document.querySelectorAll('.deleter');

    // Start the button rotation animation
    button.classList.add('rotating');
    inputField.classList.add('rotating');

    // Add 'fading' class to all .wordCont and .deleters elements to fade them out
    wordConts.forEach(cont => cont.classList.add('fading'));
    deleters.forEach(deleter => deleter.classList.add('fading'));
    // inputField.classList.add('fading');

    // Set a timeout to remove the 'fading' class after the fade-out duration (0.9s)
    setTimeout(() => {
        wordConts.forEach(cont => cont.classList.remove('fading'));
        deleters.forEach(deleter => deleter.classList.remove('fading'));
        // inputField.classList.remove('fading');

        // Run updateGame('flip') while elements are still faded out
        updateGame('flip');
    }, 900); // This matches the fade-out duration

    // Remove the 'rotating' class after the animation ends (1.8s)
    setTimeout(() => {
        button.classList.remove('rotating');
        inputField.classList.remove('rotating');
    }, 1200);

    // Toggle game direction and update word state
    gameState.direction = gameState.direction === 'norm' ? 'flip' : 'norm';
    updateLatestAndTargetWords();
}



function updateDeleters() {
    const deleteNorm = document.getElementById('normDeleter');
    const deleteFlip = document.getElementById('flipDeleter');

    gameState.normArray.length < 1
        ? deleteNorm.classList.add('invisible')
        : deleteNorm.classList.remove('invisible');
            
    gameState.flipArray.length < 1
        ? deleteFlip.classList.add('invisible')
        : deleteFlip.classList.remove('invisible');
}


//FUNC: SUBMITTING A MOVE
function submitMove() {
    const inputWord = inputField.value.toLowerCase();

    if (isTotallyValid(inputWord, gameState.latestWord)) {
        const { upperRack, upperArray } = getDirectionalConfig();
        upperArray.push(inputWord);
        makeTilesFor(inputWord);

        modifyHeight(upperRack, upperArray);

        gameState.moveCounter++;
        updateLatestAndTargetWords();

        gameState.latestMove = 'submit';

        inputWord === gameState.targetWord
            ? updateGame('complete')
            : updateGame('submit');
    }
    // else inputField.focus(); //i.e. if isTotallyValid returns "false"
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

    // delete last entry in array (if non-empty) and last wordCont in rack
    if (dirConfig.array.length > 0) dirConfig.array.pop();
    if (wordConts) wordConts[wordConts.length - 1].remove();

    modifyHeight(dirConfig.rack, dirConfig.array);

    gameState.moveCounter--;
    updateLatestAndTargetWords();

    // record latestMove (for "Undo" post-completion)
    gameState.latestMove = dirConfig.rack === normRack
        ? 'delete-norm'
        : 'delete-flip';

    // if latest & target match after delete, trigger completion code
    gameState.latestWord === gameState.targetWord
        ? updateGame('complete')
        : updateGame('delete');

    logArrays('after delete');
    console.log('After: ', dirConfig.rack, dirConfig.array);
}

function updateResultPanel() {
    const stars = document.querySelectorAll('#starContainer .star');
    const moves = gameState.moveCounter;
    const message = document.getElementById('resultMessage');

    
    // Determine star rating based on score3star and score2star
    let starRating;
    if (moves <= wordPair.score3star) starRating = 3;
    else if (moves <= wordPair.score2star) starRating = 2;
    else starRating = 1;

    // Reset all stars to grey
    stars.forEach(star => star.classList.remove('yellow'));

    // Add 'yellow' class to the appropriate number of stars
    for (let i = 0; i < starRating; i++) {
        stars[i].classList.add('yellow');
    }


    // Update the result message based on the star rating

    switch (starRating) {
        case 3:
            message.innerText = `Completed in ${gameState.moveCounter} moves!\nOutstanding work! You earned 3 stars!`;
            break;
        case 2:
            message.innerText = `Completed in ${gameState.moveCounter} moves!\nGreat job! You earned 2 stars!`;
            break;
        case 1:
            message.innerText = `Completed in ${gameState.moveCounter} moves!\nYou know words good!!`;
            break;
    }

}

// Function to jump to a round (implement logic as needed)
function jumpToRound(pairKey) {
    console.log(`Jumping to round: ${pairKey}`);
    // Implement the logic for loading the selected round here
}

function undoMove() {
    // gameState.phase = 'mid';

    switch (gameState.latestMove) {
        case 'submit':
            deleteMove('top');
            break;
        case 'delete-norm':
            makeTilesFor(gameState.latestWord, normRack);
            break;
        case 'delete-flip':
            makeTilesFor(gameState.latestWord, flipRack);
            break;
    }
    updateGame('undoMove');
}

function updateUI(stateOrAction) {

    console.log('phase: ', gameState.phase);

    if (gameState.phase === 'pre') {
        removeClass('post', 'complete');
        updateDeleters();
        updateDirectionUI('norm');
        clearInputUI();
        emptyInputArea();
        normRack.style.height = 0;
        flipRack.style.height = 0;
    }

    switch (stateOrAction) {
        case 'submit':
        case 'delete':
            // inputField.focus();
            emptyInputArea();
            updateDeleters();
            break;
        case 'flip':
            updateDirectionUI(gameState.direction);
            break;
        case 'complete':
            emptyInputArea();
            addClass('post', 'complete');
            break;
        case 'undoMove':
            removeClass('post', 'complete');
            break;
        default:
            break;
    }

    updateBestScoreUI();
    // inputField.focus();
    updateMoveCounterUI(); //"go back"を考えると、completeでも一応update?いや、数字がアプデされてればいい？
}




function updateGame(action) {
    gameState.phase = 'mid';

    switch (action) {   
        case 'submit':
        case 'flip':
        case 'delete':
        case 'undoMove':
            updateUI(action);
            break;

        case 'complete':
            gameState.phase = 'post';
            checkAndUpdateBestScoreIndex();
            updateResultPanel();

            updateUI(action);
            updateLatestAndTargetWords();
            console.log("ROUND COMPLETE!!");
            break;

        case 'nextRound':
            updateBestScore();
            updateBestScoreUI();
            wordPair.currentPairIndex++;
        case 'resetRound':
            resetGameState();
            logArrays('after reset/next');
            setWordPairAndLengths();
            updateUI();
            buildWordPairTiles();
            
            console.log(`'${action}'. latest/target word: ${gameState.latestWord}; ${gameState.targetWord}`);
            break;

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

    checkAndUpdateBestScoreIndex();
    updateBestScoreUI();

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

    // Initialize
    removeClass('overlayer', 'loading');
});
