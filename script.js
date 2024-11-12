const inputField = document.getElementById('input-field');
const startWordCont = document.getElementById('start-word');
const normRack = document.getElementById('norm-rack'); 
const flipRack = document.getElementById('flip-rack');
const endWordCont = document.getElementById('end-word');



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

        wordPair.maxLength = Math.max(wordPair.startWord.length, wordPair.endWord.length) + 1;
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
    bestScoreDisplay.innerText = `Best: ${bestScore}`;
}

//UPDATE MOVECOUNTER ON SCREEN
function updateMoveCounterUI() {
    document.getElementById('move-counter').innerText = "Moves: " + gameState.moveCounter;
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

// Prepare a .word-cont div for the input word
function prepareInputCont(rack, array) {
    const positionInArray = array.length -1;
    const wordContsInRack = rack.querySelectorAll('.word-cont');
    let cont;

    // Use an existing .word-cont div if available
    if (positionInArray < wordContsInRack.length) {
        cont = wordContsInRack[positionInArray];
    
    // Otherwise create a new .word-cont div
    } else {
        cont = document.createElement('div');
        cont.classList.add('word-cont');
        rack.appendChild(cont);
    }

    resetTiles(cont); // Reset tiles for reuse

    // Dynamically populate word-cont with tiles if it has none
    if (!cont.hasChildNodes()) cont.innerHTML = '<div class="tile"></div>'.repeat(6);

    cont.classList.remove('visible');
    return cont;
}

// Generate tiles for the input word and populate the word-cont
function makeTilesIn(wordCont, word) {
    wordCont.querySelectorAll('.tile').forEach((tile, i) => {
        const isVisible = i < word.length;
        tile.textContent = isVisible ? word[i].toUpperCase() : '';
        tile.classList.toggle('hidden', !isVisible);

        if (isVisible && (wordCont === startWordCont || wordCont === endWordCont)) tile.style.animationDelay = `${i * 0.2}s`;
    });
}

function buildWordPairTiles() {
    makeTilesIn(startWordCont, wordPair.startWord);
    makeTilesIn(endWordCont, wordPair.endWord);
}

// Reset the tiles inside an existing word-cont
function resetTiles(wordCont) {
    wordCont.querySelectorAll('.tile').forEach(tile => {
        tile.textContent = ''; // Clear text content
        tile.classList.remove('hidden', 'fade-in', 'visible'); // Reset classes
    });
}

function addWordToRack(rack, array, word) {
    const wordCont = prepareInputCont(rack, array);
    makeTilesIn(wordCont, word);

    // Make the wordCont visible with a fade-in effect
    setTimeout(() => {
        // toggleClassesInSequence(wordCont, ['fade-in', 'visible', 'fade-in'], [0, 0, 1000]);
        wordCont.classList.add('visible');
    }, 100);

    return wordCont; // Return for further use if needed
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
    console.log('Best Scores:', bestScores);

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

// ***** add fade?
function showOrHideResultPanel(which) {
    const resultPanel = document.getElementById('result-panel');
    
    if (which === "hide") resultPanel.classList.add('hidden');
    else resultPanel.classList.toggle('hidden');

}


function toggleFlip() {
    // Toggle game direction and update latest/target words
    gameState.direction = gameState.direction === 'norm'
        ? 'flip'
        : 'norm';
    updateLatestAndTargetWords();

    // Animation UI
    // const inputSet = document.getElementById('input-set');
    // const upperDeleter = document.getElementById('upper-deleter');
    const deleters = document.querySelectorAll('.deleter');
    const overlay = document.getElementById('overlay');
    const flipper = document.getElementById('flippin-button');

    // toggleClassesInSequence([toggleFlip], ['pressed', 'pressed'], [0, 200]);
    toggleClassesInSequence([inputField, flipper], ['rotating', 'rotating'], [0, 1000]);
    toggleClassesInSequence([...deleters], ['fade-out', 'fade-out'], [0, 800]);

    // toggleOverlay();
    fadeIn(overlay, 300);
    setTimeout(() => {
        updateDirectionUI(gameState.direction);
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
        updateDeleterVisibility();
        emptyInputField();
        updateMoveCounterUI();
        if (gameState.isComplete) updateGame('complete');
    }

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


    // find all visible wordConts in the rack
    const wordConts = Array.from(rack.querySelectorAll('.word-cont.visible'));
    const wordContToDelete = wordConts[wordConts.length - 1];

    toggleClassesInSequence(wordContToDelete, ['visible', 'fade-out'], [0, 0]);
    // toggleClassesInSequence(wordContToDelete, ['fade-out', 'visible'], [0, 200]);

    // Reset tiles for future reuse after fade-out
    setTimeout(() => {
        resetTiles(wordContToDelete); // Reset tiles instead of removing the wordCont
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
    showOrHideResultPanel('hide');
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



function modifyHeight(action, rack, array) {
    const wordContHeight = window.innerWidth * 11.5 / 100;
    const normSet = document.getElementById('norm-set');
    const flipSet = document.getElementById('flip-set');

    // Utility function to reset normSet and flipSet
    const resetSets = () => {
        normSet.className = 'set';
        flipSet.className = 'set';
    };

    switch (action) {
        case 'submit':
            if (gameState.isComplete) {
                normSet.classList.add('slide--subm', gameState.direction === 'norm' ? 'slide--down-complete' : 'slide--up-complete');
                flipSet.classList.add('slide--subm', gameState.direction === 'norm' ? 'slide--up-complete' : 'slide--down-complete');
            } else rack.style.height = array.length * wordContHeight + 'px';

            break;

        case 'delete':
            if (!gameState.isComplete) rack.style.height = array.length * wordContHeight + 'px';
            break;

        case 'undo':
            resetSets();
            break;

        case 'reset':
            resetSets();
            normRack.style.height = '0px';
            flipRack.style.height = '0px';
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



function togglePanel(action) {
    const popup = document.getElementById('popup-panel');

    if (action === 'close') {
        // toggleOverlay(); *****
        popup.classList.add('hidden');

    } else {
        const helpContent = document.getElementById('help-content');
        const roundsContent = document.getElementById('rounds-content');

        // Hide all content initially
        helpContent.classList.add('hidden');
        roundsContent.classList.add('hidden');
        
        // Show specific content based on the type
        if (action === 'help') helpContent.classList.remove('hidden');
        else if (action === 'rounds') roundsContent.classList.remove('hidden');

        popup.classList.remove('hidden');

    }

    // toggleOverlay('popup-background');
}



function updateGame(action) {
    switch (action) {
        case 'complete':
            checkBestScoreAndUpdate();
            localStorage.setItem('lastCompletedPair', wordPair.currentPairKey);
            prepareResultPanel();
            setTimeout(() => showOrHideResultPanel(), 1200);
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

            // console.log(result);
            logArrays();
            break;
    };
    
    console.log(`'${action}'. latest/target word: ${gameState.latestWord}; ${gameState.targetWord}`);
}



////EMPTYING CONTAINERS and CONTAINER RACKS
function clearInputUI() {
    document.querySelectorAll('#norm-rack .word-cont, #flip-rack .word-cont').forEach(wordCont => {
        resetTiles(wordCont); // Clear each word-cont for reuse
        wordCont.classList.remove('visible');
    });

    // Remove excess wordConts if any
    while (normRack.children.length > 10) normRack.lastElementChild.remove();
    while (flipRack.children.length > 10) flipRack.lastElementChild.remove();

    // console.log('Racks after clear:', normRack.innerHTML, flipRack.innerHTML);
}


function resetInitialUI() {

    showOrHideResultPanel("hide");

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

    // Attach event listeners
    runButton.addEventListener('click', () => {
        const startWord = document.getElementById('startWordInput').value.toLowerCase();
        const endWord = document.getElementById('endWordInput').value.toLowerCase();

        if (startWord && endWord) {
            const result = findAllShortestPaths(startWord, endWord, wordList);
            console.log(result); // Log the result or display it in your UI
        } else {
            alert('Please enter both a start word and an end word.');
        }
    });

    closeButton.addEventListener('click', () => {
        dialog.classList.add('hidden');
    });
}



function findAllShortestPaths(startWord, endWord, wordList) {
    // Validate word lengths
    if (startWord.length < 3 || startWord.length > 6 || endWord.length < 3 || endWord.length > 6) {
        console.error('Both words must be between 3 and 6 letters long.');
        return [];
    }

    const minLength = Math.max(3, Math.min(startWord.length, endWord.length) - 1);
    const maxLength = Math.min(6, Math.max(startWord.length, endWord.length) + 1);
    const maxSteps = 6; // Limit the maximum number of steps
    let shortestSteps = Infinity; // Track the shortest path length found
    const paths = []; // Store all valid shortest paths

    // BFS setup
    const queue = [{ word: startWord, path: [startWord], steps: 0 }];
    const visited = new Set([startWord]);

    while (queue.length > 0) {
        const { word, path, steps } = queue.shift();

        // If we exceed the max allowed steps, terminate
        if (steps > maxSteps) break;

        // If we've reached the endWord and matched shortest steps, add path to results
        if (word === endWord) {
            if (steps < shortestSteps) {
                shortestSteps = steps;
                paths.length = 0; // Clear previous paths
            }
            if (steps === shortestSteps) paths.push(path);
            continue; // Skip further exploration for this branch
        }

        // Generate valid neighbors
        for (let length = minLength; length <= maxLength; length++) {
            if (!wordList[length]) continue; // Skip lengths without valid words

            wordList[length].forEach(neighbor => {
                if (!visited.has(neighbor) && isOneMoveApart(word, neighbor)) {
                    visited.add(neighbor);
                    queue.push({
                        word: neighbor,
                        path: [...path, neighbor],
                        steps: steps + 1
                    });
                }
            });
        }
    }

    if (paths.length === 0) {
        console.log(`No paths found from "${startWord}" to "${endWord}" within ${maxSteps} steps.`);
        return [];
    }

    console.log(`Found ${paths.length} shortest paths from "${startWord}" to "${endWord}" in ${shortestSteps} steps:`);
    paths.forEach((path, index) => console.log(`${index + 1}: ${path.join(' → ')}`));

    return paths;
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
