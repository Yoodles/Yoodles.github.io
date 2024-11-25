const inputField = document.getElementById('input-field');
const normRack = document.getElementById('norm-rack'); 
const flipRack = document.getElementById('flip-rack');


////WORD PAIR OBJECT AND LOGIC ===============================================////

let wordPair = {
    currentPairKey: '',
    startWord: '',
    endWord: '',
    maxLength: 6,
    minLength: 3,
    score3star: 0,
    score2star: 0
};

// Update WordPair properties for upcoming round (start/end words, lengths, benchmarks) 
function updateWordPairObj(pairKey) {
    // Find the word pair by its pairKey
    const wordPairData = wordPairsAndDetails.find(pair => pair.pairKey === pairKey);

    if (wordPairData) {
        wordPair.currentPairKey = pairKey;

        wordPair.startWord = wordPairData.start;
        wordPair.endWord = wordPairData.end;

        wordPair.maxLength = Math.min(Math.max(wordPair.startWord.length, wordPair.endWord.length) + 1, 6);
        wordPair.minLength = Math.max(Math.min(wordPair.startWord.length, wordPair.endWord.length) - 1, 3);

        wordPair.score3star = wordPairData.score.A;
        wordPair.score2star = wordPairData.score.B;

        console.log(`Word pair updated: ${wordPair.startWord} -> ${wordPair.endWord}`);
    } else {
        console.error(`Invalid pairKey: "${pairKey}" - No matching word pair found.`);
    }
}

// Find Word Pair  with pairKey *****if unneeded globally, keep in jumpToRound?
function getWordPairDetailsFor(pairKey) {
    const pair = wordPairsAndDetails.find(pair => pair.pairKey === pairKey);
    if (!pair) console.warn(`Word pair with key "${pairKey}" not found.`);
    return pair;
}

// Jump to a specific round when selected from the list
function jumpToRound(pairKey) {

    const pair = getWordPairDetailsFor(pairKey);
    if (!pair) return;

    resetGameState();

    // Set the new word pair and reset the UI
    updateWordPairObj(pairKey);
    updateLatestAndTargetWords();

    resetInitialUI();
    buildWordPairTiles();
    updateBestScoreDisplay(pairKey);
    updateMinMaxDisplay();

    togglePanel('close');

    console.log(`Jumped to round for '${pairKey}'. Start word "${wordPair.startWord}", End word "${wordPair.endWord}".`);
}




////GAME STATE ===============================================================////

//INITIAL GAMESTATE AT START OF ROUND
const initialGameState = () => ({
    direction: 'norm',
    moveCounter: 0,
    normArray: [],
    flipArray: [],
    latestWord: '',
    targetWord: '',
    lastMove: '',
    isComplete: false,
});

let gameState = initialGameState();

function resetGameState() {
    gameState = initialGameState();
}

// DIRECTIONAL CONFIGURATIONS
function getDirectionalConfig() {
    if (gameState.direction === 'norm') {
        return {
            upperRack: normRack,
            lowerRack: flipRack,
            upperArray: gameState.normArray,
            lowerArray: gameState.flipArray,
        };
    } else { // i.e. is 'flip'
        return {
            upperRack: flipRack,
            lowerRack: normRack,
            upperArray: gameState.flipArray,
            lowerArray: gameState.normArray,
        };
    }
}

// Update latest/target words based on WORDPAIR and direction
function updateLatestAndTargetWords() {
    const {upperArray, lowerArray} = getDirectionalConfig();

    const wordAtTop = gameState.direction === 'norm' ? wordPair.startWord : wordPair.endWord;
    const wordAtBottom = gameState.direction === 'norm' ? wordPair.endWord : wordPair.startWord;

    gameState.latestWord = upperArray.length ? upperArray.at(-1) : wordAtTop;
    gameState.targetWord = lowerArray.length ? lowerArray.at(-1) : wordAtBottom;

    console.log('update latest/target: ', gameState.latestWord, gameState.targetWord);
}

function updateDeleterVisibility() {
    const upperDeleter = document.getElementById('upper-deleter');
    const lowerDeleter = document.getElementById('lower-deleter');
    const {upperArray, lowerArray} = getDirectionalConfig();

    if (upperArray.length > 0) upperDeleter.classList.add('active');
    else upperDeleter.classList.remove('active');

    if (lowerArray.length > 0) lowerDeleter.classList.add('active');
    else lowerDeleter.classList.remove('active');

}

function updateDirectionUI(direction) {
    const gameplayCont = document.getElementById('gameplay-cont');

    if (direction === 'flip') gameplayCont.classList.add('flip');
    else if (direction === 'norm') gameplayCont.classList.remove('flip');

    updateDeleterVisibility();
}



////BEST SCORES AND MOVE COUNTER ===============================================////


// Convert word pairs and set up a best scores object
let bestScores = {};

// Check and update the best score after a round
function checkBestScoreAndUpdate() {
    const pairKey = wordPair.currentPairKey; // Current round's pair key
    const score = gameState.moveCounter;

    console.log(pairKey);
    console.log(bestScores);

    // Update if score is lower than in object (or there's no best score)
    if (!bestScores[pairKey] || score < bestScores[pairKey]) {
        bestScores[pairKey] = score;
        localStorage.setItem(pairKey, JSON.stringify(score)); // Persist new best score
    }

    // Update the UI with the new best score
    updateBestScoreDisplay(pairKey);
}

// Update the best score display in the UI
function updateBestScoreDisplay(pairKey) {
    const bestScoreDisplay = document.getElementById('best-score');
    const bestScore = bestScores[pairKey] || "--";
    bestScoreDisplay.innerHTML = `Best<span class="display__colon">:</span>${bestScore}`;
}

//UPDATE MOVECOUNTER ON SCREEN
function updateMoveCounterUI() {
    document.getElementById('move-counter').innerHTML = "Moves<span class='display__colon'>:</span>" + gameState.moveCounter;
}

function updateMinMaxDisplay() {
    document.getElementById('min-max-lengths').innerHTML = `
    <span class="tile display--min-max__tile"></span><span class="display__colon">:</span><span> ${wordPair.minLength} – ${wordPair.maxLength}</span>
    `;
}


////UTILITY FUNCTIONS ===========================================////

function focusOnInputField() {inputField.focus()}

function emptyInputField() {inputField.value = ''}

function logArrays(when) {
    const normArray = gameState.normArray;
    const flipArray = gameState.flipArray;

    console.log(when, ": normArray Contents:", normArray, ". normArray items:", normArray.length);
    console.log(when, ": flipArray Contents:", flipArray, ". flipArray items:", flipArray.length);

}


////UI: BUILDING AND REMOVING WORD TILES ========================////

// Prepare a .word-row div for the input word
function prepareInputCont(rack, array) {
    const positionInArray = array.length -1;
    const wordRowsInRack = rack.querySelectorAll('.word-row');
    let cont;

    // Use an existing .word-row div if available
    if (positionInArray < wordRowsInRack.length) {
        cont = wordRowsInRack[positionInArray];
    
    // Otherwise create a new .word-row div
    } else {
        cont = document.createElement('div');
        cont.classList.add('word-row');
        rack.appendChild(cont);
    }

    resetTiles(cont); // Reset tiles for reuse

    // Dynamically populate word-row with tiles if it has none
    if (!cont.hasChildNodes()) cont.innerHTML = '<div class="tile"></div>'.repeat(6);

    cont.classList.remove('visible');
    return cont;
}

// Generate tiles for the input word and populate the word-row
function makeTilesIn(wordRow, word) {
    wordRow.querySelectorAll('.tile').forEach((tile, i) => {
        const isVisible = i < word.length;
        tile.textContent = isVisible ? word[i].toUpperCase() : '';
        tile.classList.toggle('hidden', !isVisible);

        if (isVisible) tile.style.animationDelay = `${i * 0.2}s`;
    });
}

function buildWordPairTiles() {
    const startwordRow = document.getElementById('start-word');
    const endwordRow = document.getElementById('end-word');

    makeTilesIn(startwordRow, wordPair.startWord);
    makeTilesIn(endwordRow, wordPair.endWord);
}

// Reset the tiles inside an existing word-row
function resetTiles(wordRow) {
    wordRow.querySelectorAll('.tile').forEach(tile => {
        tile.textContent = ''; // Clear text content
        tile.classList.remove('hidden', 'fade-in', 'visible'); // Reset classes
    });
}

function addWordToRack(rack, array, word) {
    const wordRow = prepareInputCont(rack, array);
    makeTilesIn(wordRow, word);

    // Make the wordRow visible with a fade-in effect
    setTimeout(() => {
        // toggleClassesInSequence(wordRow, ['fade-in', 'visible', 'fade-in'], [0, 0, 1000]);
        wordRow.classList.add('visible');
    }, 100);

    return wordRow; // Return for further use if needed
}



// function centerInputField() {
//     const gameplayCont = document.getElementById('gameplay-cont');
//     const inputField = document.getElementById('input-field');
//     const isFlipped = gameplayCont.classList.contains('flip');

//     // Dimensions
//     const inputPosition = inputField.offsetTop;
//     const containerHeight = gameplayCont.clientHeight;
//     const inputHeight = inputField.offsetHeight;

//     // Calculate the scroll position
//     let scrollTo = inputPosition - (containerHeight / 2) + (inputHeight / 2);

//     console.log({ inputPosition, containerHeight, inputHeight });


//     // If flipped, adjust for reversed scroll direction
//     if (isFlipped) {
//         const totalScrollHeight = gameplayCont.scrollHeight;
//         scrollTo = totalScrollHeight - containerHeight - scrollTo;
//     }

//     // Scroll to the calculated position
//     gameplayCont.scrollTo({
//         top: scrollTo,
//         behavior: 'smooth',
//     });
// }



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


// ***** update after completion?
function renderWordPairMenu() {
    const wordPairMenu = document.getElementById('word-pair-menu');
    wordPairMenu.innerHTML = ''; // Clear existing list

    const greyStarsHTML = `
    <span class="star-cont">
        <span class="star">★</span>
        <span class="star">★</span>
        <span class="star">★</span>
    </span>
    `;

    wordPairsAndDetails.forEach(pair => {
        // Create list item with static grey stars
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            ${pair.start.toUpperCase()} ↔︎ ${pair.end.toUpperCase()}
            ${greyStarsHTML}
        `;

        // Calculate star rating based on the best score
        const bestScore = bestScores[pair.pairKey] || 0;
        const starRating = calculateStarRating(bestScore, pair.score.A, pair.score.B);

        // Update star colors for the list item
        const starContainer = listItem.querySelector('.star-cont');
        updateStarColors(starContainer, starRating);

        // Add click event to jump to the specific round
        listItem.addEventListener('click', () => jumpToRound(pair.pairKey));
        wordPairMenu.appendChild(listItem);
    });
    // console.log('Best Scores:', bestScores);

}

function updateStarColors(container, starRating) {
    const stars = container.querySelectorAll('.star');
    stars.forEach((star, index) => star.classList.toggle('yellow', index < starRating));
    container.classList.toggle('unattempted', starRating === 0); // Add class for unattempted rounds
}

function calculateStarRating(howManyMoves, scoreFor3, scoreFor2) {
    if (howManyMoves === 0) return 0; // No stars for unattempted rounds
    if (howManyMoves <= scoreFor3) return 3;
    if (howManyMoves <= scoreFor2) return 2;
    return 1;
}



function prepareResultPanel() {
    const starContainer = document.getElementById('star-cont');
    const howManyMoves = gameState.moveCounter;
    const message = document.getElementById('result-message');

    // Calculate star rating
    const starRating = calculateStarRating(howManyMoves, wordPair.score3star, wordPair.score2star);

    // Update star colors based on the rating
    updateStarColors(starContainer, starRating);

    // Update the result message based on the star rating
    if (starRating === 3) message.innerText = `Completed in ${gameState.moveCounter} moves!\nOutstanding!`;
    else if (starRating === 2) message.innerText = `Completed in ${gameState.moveCounter} moves!\nGreat job!`;
    else message.innerText = `Completed in ${gameState.moveCounter} moves!\nYou know words good!!`;

    console.log(`Rendered result panel with ${starRating} stars.`);

}


function togglePanel(panelType) { // *****
    const popup = document.getElementById('popup-panel');

    if (panelType === 'close') {
        const allContentTypes = popup.querySelectorAll('.panel-content');
        console.log(allContentTypes);
        allContentTypes.forEach((type) => type.classList.add('hidden'));
        popup.className = 'popup-panel hidden';
        // popup.classList.add('hidden');

    } else {
        // const content = document.getElementById(`${panelType}-content`);
        // content.classList.remove('hidden');
        popup.classList.add(`panel--${panelType}`);
        popup.classList.remove('hidden');
    }
    // toggleOverlay('popup-background');
}








function toggleFlip() {
    // Toggle game direction and update latest/target words
    gameState.direction = gameState.direction === 'norm'
        ? 'flip'
        : 'norm';
    updateLatestAndTargetWords();

    // Animation UI
    // const inputSet = document.getElementById('input-set');
    const deleters = document.getElementById('deleters-cont');
    const overlay = document.getElementById('overlay');
    const flipper = document.getElementById('flippin-button');

    // toggleClassesInSequence([toggleFlip], ['pressed', 'pressed'], [0, 200]);
    toggleClassesInSequence([inputField, flipper], ['rotating', 'rotating'], [0, 1000]);
    toggleClassesInSequence([deleters], ['fade-out', 'fade-out'], [0, 800]);

    // toggleOverlay();
    fadeIn(overlay, 300);
    setTimeout(() => {
        updateDirectionUI(gameState.direction);
        // centerInputField();



        fadeOut(overlay, 300);
    }, 1000);

}


////MOVES ===============================================================////

// SUBMIT
function submitMove() {
    const inputWord = inputField.value.toLowerCase();

    if (isTotallyValid(inputWord, gameState.latestWord)) {
        const {upperRack, upperArray} = getDirectionalConfig();

        upperArray.push(inputWord);

        updateLatestAndTargetWords();
        if (inputWord === gameState.targetWord) gameState.isComplete = true;

        gameState.lastMove = 'submit';
        gameState.moveCounter++;

        // Add the input word to the rack
        addWordToRack(upperRack, upperArray, inputWord);

        // Adjust rack height and UI
        modifyHeight('submit', upperRack, upperArray);
        // centerInputField();


        setTimeout(() => {
            scrollScreen();
        }, 0);


        updateDeleterVisibility();
        emptyInputField();
        updateMoveCounterUI();
        if (gameState.isComplete) updateGame('complete');
    }

}

function scrollScreen() {
    const gameplayCont = document.getElementById('gameplay-cont');
    console.log('scrollHeight:', gameplayCont.scrollHeight);
    console.log('clientHeight:', gameplayCont.clientHeight);
    console.log('scrollTop:', gameplayCont.scrollTop);

    const wordRowHeight = calculateWordRowHeight();

    console.log('wordRowHeight: ', wordRowHeight);
    // gameplayCont.scrollBy(0, -wordRowHeight *2);
    // gameplayCont.scrollBy(0, 200);
    gameplayCont.scrollBy({
        top: wordRowHeight, // Amount to scroll
        // top: 200,
        behavior: 'smooth', // Smooth scrolling
    });
    console.log('After scrollBy:', gameplayCont.scrollTop);

}

// DELETE
function deleteMove(which) {
    const {upperRack, upperArray, lowerRack, lowerArray} = getDirectionalConfig();
    let rack, array;

    if (which === 'upper') {
        rack = upperRack;
        array = upperArray;
    } else if (which ==='lower') {
        rack = lowerRack;
        array = lowerArray;
    }

    const wordToDelete = array[array.length - 1];

    // Update game state and arrays
    gameState.moveCounter--;

    console.log('delete ', wordToDelete);
    
    gameState.lastMove = `delete-${array === gameState.normArray ? 'norm' : 'flip'}-${array[array.length - 1]}`;
    console.log('lastMove: ', gameState.lastMove);

    if (array.length > 0) array.pop(); //🚨 MUST BE AFTER CHANGING lastMove
    updateLatestAndTargetWords();
    if (gameState.latestWord === gameState.targetWord) gameState.isComplete = true;


    // find all visible wordRows in the rack
    const wordRows = Array.from(rack.querySelectorAll('.word-row.visible'));
    const wordRowToDelete = wordRows[wordRows.length - 1];

    toggleClassesInSequence(wordRowToDelete, ['visible', 'fade-out'], [0, 0]);
    // toggleClassesInSequence(wordRowToDelete, ['fade-out', 'visible'], [0, 200]);

    // Reset tiles for future reuse after fade-out
    setTimeout(() => {
        resetTiles(wordRowToDelete); // Reset tiles instead of removing the wordRow
        modifyHeight('delete', rack, array);
    }, 400);

    updateDeleterVisibility();
    emptyInputField();
    updateMoveCounterUI();
    if (gameState.isComplete) updateGame('complete');
}

// UNDO
function undoMove() {
    gameState.isComplete = false;
    togglePanel('close');
    modifyHeight('undo'); //*****


    if (gameState.lastMove === 'submit') deleteMove('upper'); // ✅
    else {
        // Parse the lastMove string
        const [actionType, rackType, word] = gameState.lastMove.split('-');
        if (actionType !== 'delete') {
            console.warn('Latest move is not a delete action.');
            return;
        }

        console.log('gameState.lastMove: ', gameState.lastMove);

        // Determine the rack and array based on the rackType
        const { rack, array } = rackType === 'norm'
            ? { rack: normRack, array: gameState.normArray }
            : { rack: flipRack, array: gameState.flipArray };

        array.push(word); // Re-add to array

        addWordToRack(rack, array, word); //Re-add to rack
        // modifyHeight('undo'); //*****

        updateLatestAndTargetWords();

        emptyInputField();
        updateMoveCounterUI(); //*****prob unnecessary
        updateDeleterVisibility();

        console.log(`Undo complete: Restored "${word}" to ${rackType} rack.`);
    }
    logArrays();
}


function calculateWordRowHeight() {
    const gameplayCont = document.getElementById('gameplay-cont');
    if (!gameplayCont) return 0;

    const styles = getComputedStyle(gameplayCont);
    const remToPixels = parseFloat(styles.fontSize); // 1rem in pixels

    return (
        (parseFloat(styles.getPropertyValue('--tile-height-width')) +
        parseFloat(styles.getPropertyValue('--tile-margin')) * 2) *
        remToPixels
    );
}


function modifyHeight(action, rack, array) {

    const wordRowHeight = calculateWordRowHeight();

    console.log('wordRowHeight in modify...(): ', wordRowHeight);
    const normSet = document.getElementById('norm-set');
    const flipSet = document.getElementById('flip-set');

    // Utility function to reset normSet and flipSet
    const resetSets = () => {
        normSet.className = 'set';
        flipSet.className = 'set';
    };

    // Utility function to add the appropriate classes
    const addSlideClassForComplete = (actionType) => {
        const directionClass = gameState.direction === 'norm' ? 'down' : 'up';
        const normClass = `slide-${directionClass}--comp-${actionType}`;
        const flipClass = `slide-${directionClass === 'down' ? 'up' : 'down'}--comp-${actionType}`;

        normSet.classList.add(normClass);
        flipSet.classList.add(flipClass);
    };

    switch (action) {
        case 'submit':
            if (gameState.isComplete) addSlideClassForComplete('sbmt');
            else rack.style.height = array.length * wordRowHeight + 'px';
            break;
        case 'delete':
            if (gameState.isComplete) addSlideClassForComplete('del');
            else rack.style.height = array.length * wordRowHeight + 'px';
            break;
        case 'undo':
            resetSets();
            break;
        case 'reset':
            resetSets();
            normRack.style.height = '0';
            flipRack.style.height = '0';
            break;
        default:
            console.warn(`Unknown action: ${action}`);
            break;
    }
}



function toggleOverlay(mode) {
    const overlay = document.getElementById('overlay');
    let duration = 300;

    switch (mode) {
        case 'popup-background':
            overlay.classList.add('overlay--full-scr', 'overlay--dark');
            duration = 1000;
            break;
        case 'on-and-off':

            break;
        case 'initial':
            duration = 500;
            // fadeOut(overlay, 500);
            break;
        case 'message':
            overlay.classList.add('overlay--message');
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



function updateGame(action) {
    switch (action) {
        case 'complete':
            checkBestScoreAndUpdate();
            localStorage.setItem('lastCompletedPair', wordPair.currentPairKey);
            prepareResultPanel();
            setTimeout(() => togglePanel('result'), 1200);
            break;

        case 'nextRound':
            console.log('Current Pair Key:', wordPair.currentPairKey);
            const currentIndex = wordPairsAndDetails.findIndex(pair => pair.pairKey === wordPair.currentPairKey);
            const nextPair = wordPairsAndDetails[currentIndex + 1];
        
            if (nextPair) {
                wordPair.currentPairKey = nextPair.pairKey;
                console.log('Next Pair Key:', wordPair.currentPairKey);
                updateGame('resetRound');
            } else document.getElementById('game-area').innerText = "All Rounds Completed!";

            break;

        case 'resetRound':
            gameState.isComplete = false;
            // toggleOverlay('initial');

            resetGameState();

            updateWordPairObj(wordPair.currentPairKey);
            updateLatestAndTargetWords();

            resetInitialUI();

            buildWordPairTiles();
            updateBestScoreDisplay(wordPair.currentPairKey);
            updateMinMaxDisplay();

            // console.log(result);
            logArrays();
            break;
    };
    
    console.log(`'${action}'. latest/target word: ${gameState.latestWord}; ${gameState.targetWord}`);
}



////EMPTYING CONTAINERS and CONTAINER RACKS
function clearInputUI() {
    document.querySelectorAll('#norm-rack .word-row, #flip-rack .word-row').forEach(wordRow => {
        resetTiles(wordRow); // Clear each word-row for reuse
        wordRow.classList.remove('visible');
    });

    // Remove excess wordRows if any
    while (normRack.children.length > 10) normRack.lastElementChild.remove();
    while (flipRack.children.length > 10) flipRack.lastElementChild.remove();

    // console.log('Racks after clear:', normRack.innerHTML, flipRack.innerHTML);
}


function resetInitialUI() {
    togglePanel('close');

    // Reset height adjustments and directions
    modifyHeight('reset');
    updateDirectionUI('norm'); //inludes deleter visibility

    // Clear racks and input field
    clearInputUI();
    emptyInputField();
    updateMoveCounterUI();
}






function showPathFinderDialog() {
    const dialog = document.getElementById('pathFinderDialog');
    dialog.classList.remove('hidden');

    const runButton = document.getElementById('runPathFinder');
    const closeButton = document.getElementById('closeDialog');

    // Dynamically generate the maxSteps dropdown if not already present
    const maxStepsDropdown = document.getElementById('maxStepsDropdown');
    if (maxStepsDropdown.children.length === 0) {
        for (let i = 1; i <= 10; i++) { // Populate dropdown with step options (1–10)
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i} ${i === 1 ? 'step' : 'steps'}`;
            if (i === 6) option.selected = true; // Default to 6 steps
            maxStepsDropdown.appendChild(option);
        }
    }

    // Attach event listeners
    runButton.addEventListener('click', () => {
        const startWord = document.getElementById('startWordInput').value.toLowerCase();
        const endWord = document.getElementById('endWordInput').value.toLowerCase();
        const maxSteps = parseInt(maxStepsDropdown.value, 10);

        if (startWord && endWord) {
            console.log(`Looking for paths from "${startWord}" to "${endWord}" with a maximum of ${maxSteps} steps...`);
            const result = findShortestPath(startWord, endWord, maxSteps);
            console.log(result); // Log the result or display it in your UI
        } else {
            alert('Please enter both a start word and an end word.');
        }
    });

    closeButton.addEventListener('click', () => {
        dialog.classList.add('hidden');
    });
}

//max-length *****
function findShortestPath(startWord, endWord, maxSteps = 6) {
    console.log(`Looking for paths from "${startWord}" to "${endWord}"...`);
    const minLength = Math.max(3, Math.min(startWord.length, endWord.length) - 1, 3);
    const maxLength = Math.min(6, Math.max(startWord.length, endWord.length) + 1, 6);

    const queue = [[startWord]]; // BFS queue initialized with the start word as the only path
    const visited = new Map(); // Track visited words and their shortest known path length
    visited.set(startWord, 0);

    let foundPaths = [];
    let shortestPathLength = Infinity;
    let currentPathLength = 0; // Tracks the length being explored for logging

    console.log(`Starting search for paths with up to ${maxSteps} steps...`);

    function processQueue() {
        const startTime = performance.now();

        while (queue.length > 0 && performance.now() - startTime < 50) {
            const path = queue.shift();
            const currentWord = path.at(-1);
            const movesUsed = path.length - 1;

            // Log the current path length being explored (only once per length)
            if (movesUsed > currentPathLength) {
                currentPathLength = movesUsed;
                console.log(`Now exploring paths of length ${currentPathLength}...`);
            }

            // Terminate longer paths once the shortest path is found
            if (movesUsed > shortestPathLength || movesUsed >= maxSteps) continue;

            // If the end word is reached, record the path
            if (currentWord === endWord) {
                if (movesUsed < shortestPathLength) {
                    shortestPathLength = movesUsed;
                    foundPaths = [path];
                    console.log(`Found a path of ${shortestPathLength} moves: ${path.join(" → ")}`);
                } else if (movesUsed === shortestPathLength) {
                    foundPaths.push(path);
                    console.log(`Found another path of ${shortestPathLength} moves: ${path.join(" → ")}`);
                }
                continue;
            }

            // Generate valid neighbors (only words 1 move apart)
            const neighbors = getValidNeighbors(currentWord, minLength, maxLength, visited, movesUsed + 1);
            for (const neighbor of neighbors) {
                queue.push([...path, neighbor]);
            }
        }

        // If there's more work to do, continue in the next chunk
        // if (queue.length > 0) {
        //     setTimeout(processQueue, 0);
        // } else {
        //     if (foundPaths.length === 0) {
        //         console.log(`No paths found from "${startWord}" to "${endWord}" within ${maxSteps} steps.`);
        //     } else {
        //         console.log(`Search complete. Found ${foundPaths.length} path(s) of ${shortestPathLength} steps:`, foundPaths);
        //     }
        // }
        // If there's more work to do, continue in the next chunk
        if (queue.length > 0) {
            // Use a slightly delayed `setTimeout` to reduce strain on the event loop
            setTimeout(() => {
                processQueue();
            }, 1); // A minimal delay of 1ms allows the browser to handle other tasks
        } else {
            // Log results after the search is complete
            if (foundPaths.length === 0) {
                console.log(`No paths found from "${startWord}" to "${endWord}" within ${maxSteps} steps.`);
            } else {
                console.log(`Search complete. Found ${foundPaths.length} path(s) of ${shortestPathLength} steps:`, foundPaths);
            }
        }
    }

    processQueue(); // Start the async search
    return foundPaths;
}

function getValidNeighbors(currentWord, minLength, maxLength, visited, pathLength) {
    const neighbors = [];
    const wordLength = currentWord.length;

    for (let length = minLength; length <= maxLength; length++) {
        const wordSet = wordList[length];
        if (!wordSet) continue;

        wordSet.forEach(candidateWord => {
            if (
                (!visited.has(candidateWord) || visited.get(candidateWord) >= pathLength) &&
                isOneMoveApart(currentWord, candidateWord)
            ) {
                neighbors.push(candidateWord);
                visited.set(candidateWord, pathLength); // Mark as visited with the current path length
            }
        });
    }

    return neighbors;
}




// function findShortestPath(startWord, endWord, maxSteps = 6) {
//     console.log(`Looking for paths from "${startWord}" to "${endWord}"...`);
//     const minLength = Math.max(3, Math.min(startWord.length, endWord.length) - 1);
//     const maxLength = Math.min(6, Math.max(startWord.length, endWord.length) + 1);

//     const queue = [[startWord]]; // BFS queue initialized with the start word as the only path
//     const visited = new Set(); // Track visited words to avoid redundant searches
//     visited.add(startWord);

//     let foundPaths = [];
//     let shortestPathLength = Infinity;

//     console.log(`Starting search for paths with up to ${maxSteps} steps...`);

//     while (queue.length > 0) {
//         const path = queue.shift();
//         const currentWord = path.at(-1);

//         // Log the current path length being explored
//         if (path.length > shortestPathLength + 1) break;
//         if (path.length <= maxSteps + 1) {
//             console.log(`Now exploring paths of length ${path.length - 1}...`);
//         }

//         // If the end word is reached, record the path
//         if (currentWord === endWord) {
//             foundPaths.push(path);
//             shortestPathLength = path.length - 1; // Shortest path length is updated
//             console.log(`Found a path of ${shortestPathLength} steps: ${path.join(" → ")}`);
//             continue;
//         }

//         // Generate valid neighbors (only words 1 move apart)
//         const neighbors = getValidNeighbors(currentWord, minLength, maxLength, visited);
//         for (const neighbor of neighbors) {
//             visited.add(neighbor);
//             queue.push([...path, neighbor]);
//         }
//     }

//     if (foundPaths.length === 0) {
//         console.log(`No paths found from "${startWord}" to "${endWord}" within ${maxSteps} steps.`);
//     } else {
//         console.log(`Search complete. Found ${foundPaths.length} path(s) of ${shortestPathLength} steps:`, foundPaths);
//     }

//     return foundPaths;
// }

// function getValidNeighbors(currentWord, minLength, maxLength, visited) {
//     const neighbors = [];
//     const wordLength = currentWord.length;

//     for (let length = minLength; length <= maxLength; length++) {
//         const wordSet = wordList[length];
//         if (!wordSet) continue;

//         wordSet.forEach(candidateWord => {
//             if (!visited.has(candidateWord) && isOneMoveApart(currentWord, candidateWord)) {
//                 neighbors.push(candidateWord);
//             }
//         });
//     }

//     return neighbors;
// }




// function generateValidMoves(currentWord) {
//     const validMoves = [];
//     const wordLength = currentWord.length;

//     // Iterate through words of permissible lengths
//     for (let length = Math.max(3, wordLength - 1); length <= Math.min(6, wordLength + 1); length++) {
//         if (!wordList[length]) continue; // Skip if no words of this length

//         wordList[length].forEach(candidate => {
//             if (isOneMoveApart(currentWord, candidate)) {
//                 validMoves.push(candidate);
//             }
//         });
//     }

//     return validMoves;
// }










// function findShortestPath(startWord, endWord, maxSteps = 6) {
//     console.log(`Looking for paths from "${startWord}" to "${endWord}"...`);

//     const minLength = Math.max(3, Math.min(startWord.length, endWord.length) - 1); // Min valid word length
//     const maxLength = Math.min(6, Math.max(startWord.length, endWord.length) + 1); // Max valid word length

//     // To terminate the search manually
//     let searchTerminated = false;

//     const cancelSearch = () => {
//         searchTerminated = true;
//         console.log("Search canceled.");
//     };

//     // Initialize variables
//     let shortestPaths = [];
//     let shortestLength = Infinity;

//     const queue = [[startWord]]; // BFS queue initialized with the start word
//     const visited = new Set(); // Tracks visited words to avoid redundant checks
//     visited.add(startWord);

//     console.log("Starting search...");

//     while (queue.length > 0 && !searchTerminated) {
//         const path = queue.shift(); // Get the first path in the queue
//         const lastWord = path[path.length - 1];

//         // Stop exploring if path exceeds maxSteps or already found shortest path
//         if (path.length > maxSteps || path.length > shortestLength) continue;

//         // If the endWord is reached
//         if (lastWord === endWord) {
//             if (path.length < shortestLength) {
//                 shortestPaths = [path]; // Found a shorter path
//                 shortestLength = path.length;
//                 console.log(`Found a ${shortestLength}-step path: ${path.join(" -> ")}`);
//             } else if (path.length === shortestLength) {
//                 shortestPaths.push(path); // Found another shortest path
//             }
//             continue;
//         }

//         // Generate valid next moves
//         for (let length = minLength; length <= maxLength; length++) {
//             if (!wordList[length]) continue; // Skip if no words of this length exist

//             for (const nextWord of wordList[length]) {
//                 // Check if the word hasn't been visited and is a valid move
//                 if (!visited.has(nextWord) && isOneMoveApart(lastWord, nextWord)) {
//                     visited.add(nextWord); // Mark as visited
//                     queue.push([...path, nextWord]); // Add the new path to the queue
//                 }
//             }
//         }
//     }

//     // Report results
//     if (shortestPaths.length > 0) {
//         console.log(`Search completed. Found ${shortestPaths.length} shortest path(s):`);
//         shortestPaths.forEach(path => console.log(path.join(" -> ")));
//     } else {
//         console.log(`No path found from "${startWord}" to "${endWord}" within ${maxSteps} steps.`);
//     }

//     return shortestPaths;
// }




function testUI() {
    console.log('hey');
    document.getElementById('css-test').classList.toggle('off');
}





// INITIALIZE GAME DISPLAY AFTER GAMELOAD




document.addEventListener('DOMContentLoaded', (event) => {
    const DEBUG = true;

    if (DEBUG) console.log('localStorage contents:', { ...localStorage });
    // localStorage.clear();

    // Function to set custom --vh unit based on viewport height
    function setVhUnit() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    // Call setVhUnit on load + add listener to adjust --vh on resize
    setVhUnit();
    window.addEventListener('resize', setVhUnit);

    // Ensure wordPairsAndDetails has data
    if (wordPairsAndDetails.length === 0) {
        console.error('No word pairs available to initialize the game.');
        return;
    }

    // Initialize best scores for each word pair from localStorage if available, or default to 0
    wordPairsAndDetails.forEach(pair => {
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

    // Determine the starting word pair
    const lastPairKey = localStorage.getItem('lastCompletedPair');
    wordPair.currentPairKey = lastPairKey && wordPairsAndDetails.some(pair => pair.pairKey === lastPairKey)
        ? lastPairKey
        : wordPairsAndDetails[0].pairKey;

    // Load the word pair and initialize game state
    updateWordPairObj(wordPair.currentPairKey);
    updateLatestAndTargetWords();

    buildWordPairTiles();
    updateBestScoreDisplay(wordPair.currentPairKey);
    updateMinMaxDisplay();


    // Add event listeners
    const keyboard = document.getElementById('keyboard');

    if (inputField) {
        inputField.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') submitMove();
        });
    }
    if (keyboard) {
        keyboard.addEventListener('click', function (event) {
            const key = event.target.closest('.keyboard__key');
            if (!key) return; // Ignore clicks outside of keys

            const keyValue = key.textContent.trim();

            if (key.classList.contains('keyboard__key--enter')) submitMove();
            else if (key.classList.contains('keyboard__key--backspace')) inputField.value = inputField.value.slice(0, -1);
            else inputField.value += keyValue;
        });
    }

    // Initialize UI
    toggleOverlay('initial');
    renderWordPairMenu();
});
