import { wordPairList } from './words.js';
import { isTotallyValid } from './word-validity.js';

const startWordRack = document.getElementById('startWord');
const normRack = document.getElementById('normRack'); 
const flipRack = document.getElementById('flipRack');
const endWordRack = document.getElementById('endWord');


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
    resultMessage: ''
});

export let gameState = initialGameState();

function resetGameState() {
    gameState = initialGameState();
}


export let wordPair = {
    currentPairIndex: 0,
    startWord: '',
    endWord: '',
    maxLength: 6,
    minLength: 3,
    bestScoreIndex: {}
}


//FUNC: SETTING NEW WORD PAIR FOR ROUND; CALCULATING MIN./MAX. LENGTHS //❗️❗️❗️❗️❗️
function setWordPairAndLengths() {
    const index = wordPair.currentPairIndex;

    if (index < wordPairList.length) {
        wordPair.startWord = wordPairList[index].start;
        wordPair.endWord = wordPairList[index].end;

        wordPair.maxLength = Math.max(wordPair.startWord.length, wordPair.endWord.length) + 1;
        wordPair.minLength = Math.max(Math.min(wordPair.startWord.length, wordPair.endWord.length) - 1, 3);

        gameState.latestWord = wordPair.startWord;
        gameState.targetWord = wordPair.endWord;
    } else {
        document.getElementById('gameArea').innerText = "All Rounds Completed!";
    }
}

function buildWordPairTiles() {
    makeTilesFor(wordPair.startWord, startWordRack);
    makeTilesFor(wordPair.endWord, endWordRack);
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

function focusTextInputBox() {
    document.getElementById('currentInput').focus();
}
function emptyTextInputBox() {
    document.getElementById('currentInput').value = '';
}

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
function checkAndUpdateBestScoreIndex() { //just at end of round?
    const indexNum = wordPair.currentPairIndex;
    // Check for existing best score, update, and return latest best score
    //(="If there's no best score for the index no. in bestScoreIndex corresponding to crntPairIndex, or if the moveCounter is lower than it, then the moveCounter shall be the new bestScore in the index")
    if (!wordPair.bestScoreIndex[indexNum] || gameState.moveCounter < wordPair.bestScoreIndex[indexNum]) {
        wordPair.bestScoreIndex[indexNum] = gameState.moveCounter;
    }
}

//SHOW LATEST BEST SCORE on SCREEN ///　UPDATE!!!!! IF!!!! ANIMATION!!!!!
function updateBestScoreUI() {
    const bestScoreDisplay = document.getElementById('bestScore');
    const latestBestScore = wordPair.bestScoreIndex[wordPair.currentPairIndex] || "--";
    bestScoreDisplay.innerText = "Best: " + latestBestScore;
}

//UPDATE MOVECOUNTER ON SCREEN - ❓ COMBINE?
function updateMoveCounterUI() {
    document.getElementById('moveCounter').innerText = "Moves: " + gameState.moveCounter;
}

// let currentOffset = 0;

////GENERATING WORD TILES////
function makeTilesFor(word, rack) {
    let wordCont;
    if (rack === startWordRack) wordCont = startWordRack;
    else if (rack === endWordRack) wordCont = endWordRack;
    else wordCont = prepareInputWordCont();

    wordCont.querySelectorAll('div').forEach((tile, i) => {
        const isVisible = i < word.length;
        tile.textContent = isVisible ? word[i].toUpperCase() : '';
        tile.classList.toggle('tile', isVisible);
        tile.classList.toggle('hidden', !isVisible);
        if (isVisible && (wordCont === startWordRack || wordCont === endWordRack)) tile.style.animationDelay = `${i * 0.3}s`;
    });
    wordCont.classList.remove('hidden');

    wordCont.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // Ensure visibility
}



//GETTING THE INPUTWORD CONT READY
function prepareInputWordCont() {
    const { upperRack, upperRackArray } = getDirectionalConfig();
    const howManyInArray = upperRackArray.length;
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
            upperRackArray: gameState.normArray,
            lowerRackArray: gameState.flipArray,
        };
    } else { // i.e. is 'flip'
        return {
            upperRack: flipRack,
            lowerRack: normRack,
            wordAtTop: wordPair.endWord,
            wordAtBottom: wordPair.startWord,
            upperRackArray: gameState.flipArray,
            lowerRackArray: gameState.normArray,
        };
    }
}

// FUNCTION: Update the latest and target word based on the current directional configuration
function updateLatestAndTargetWord() {
    const { upperRackArray, wordAtTop, lowerRackArray, wordAtBottom } = getDirectionalConfig();
    gameState.latestWord = upperRackArray.length ? upperRackArray.at(-1) : wordAtTop;
    gameState.targetWord = lowerRackArray.length ? lowerRackArray.at(-1) : wordAtBottom;
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

function toggleFlip() {
    gameState.direction = gameState.direction === 'norm' ? 'flip' : 'norm';
    updateGame('flip');
}


//消してマッチした場合はどうなるか？？？特にMove Counterやcompleteアニメーションなど

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
    const inputWord = document.getElementById('currentInput').value.toLowerCase();

    if (isTotallyValid(inputWord, gameState.latestWord)) {
        getDirectionalConfig().upperRackArray.push(inputWord);
        makeTilesFor(inputWord);
        gameState.moveCounter++;
        gameState.latestMove = 'submit';

        // If round complete
        //  (inputWord === gameState.targetWord || inputWord === gameState.latestWord)
        inputWord === gameState.targetWord
            ? updateGame('complete')
            : updateGame('submit');

    }
    // else focusTextInputBox(); //i.e. if isTotallyValid returns "false"
}

function deleteMove(which) {
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

    let wordConts = dirConfig.rack.querySelectorAll('.wordCont');

    if (dirConfig.array.length > 0) dirConfig.array.pop();
    if (wordConts) wordConts[wordConts.length - 1].remove();

    gameState.moveCounter--;

    gameState.latestMove = dirConfig.rack === normRack
        ? 'delete-norm'
        : 'delete-flip';

    updateLatestAndTargetWord();

    gameState.latestWord !== gameState.targetWord
        ? updateGame('delete')
        : updateGame('complete');

    logArrays('after delete');
    // console.log('After: ', dirConfig.rack, dirConfig.array);
}


function goBackOne() {
    gameState.phase = 'mid';

    switch (gameState.latestMove) {
        case 'submit':
            deleteMove('top');
            break;
        case 'delete-norm':
            makeTilesFor(gameState.latestWord, normRack);
            break;
        case 'delete-flip':
            makeTilesFor(gameState.targetWord, flipRack);
            break;
    }
    updateGame('goBackOne');
}

function updateUI(stateOrAction) {

    console.log('phase: ', gameState.phase);

    if (gameState.phase === 'pre') {
        removeClass('post', 'complete');
        updateDeleters();
        updateDirectionUI('norm');
        clearInputUI();
        emptyTextInputBox();
    }

    switch (stateOrAction) {
        case 'submit':
        case 'delete':
            // focusTextInputBox();
            emptyTextInputBox();
            updateDeleters();
            break;
        case 'flip':
            updateDirectionUI(gameState.direction);
            break;
        case 'complete':
            emptyTextInputBox();
            resultMessage.innerText = "Completed in " + gameState.moveCounter + " moves!\nYou know words good!!";
            addClass('post', 'complete');
            break;

        default:
            break;
    }

    updateBestScoreUI();
    // focusTextInputBox();
    updateMoveCounterUI(); //"go back"を考えると、completeでも一応update?いや、数字がアプデされてればいい？
}




function updateGame(action) {

    gameState.phase = 'mid';

    switch (action) {   
        case 'submit':
        case 'flip':
            updateUI(action);
            updateLatestAndTargetWord();
            break;
        case 'delete':
            updateUI(action);
            // updateLatestAndTargetWord();
            break;

        case 'complete':
            gameState.phase = 'post';
            checkAndUpdateBestScoreIndex();

            updateUI(action);
            updateLatestAndTargetWord();
            console.log("ROUND COMPLETE!!");
            break;

        case 'nextRound':
            wordPair.currentPairIndex++;
        case 'resetRound':

            resetGameState();
            logArrays('after reset/next');
            setWordPairAndLengths();
            updateUI();
            buildWordPairTiles();
            
            console.log(`'${action}'. latest/target word: ${gameState.latestWord}; ${gameState.targetWord}`);
            break;

        case 'goBackOne':
            // gameState.phase = 'mid';
            // deleteMove('top');
            removeClass('post', 'complete');
            break;
    };
    
    logArrays();
    console.log('latestMove: ', gameState.latestMove);
    console.log(`'${action}'. latest/target word: ${gameState.latestWord}; ${gameState.targetWord}`);
}


// // INITIALIZE GAME DISPLAY AFTER GAMELOAD　//
// document.addEventListener('DOMContentLoaded', (event) => {

//     // Function to set custom --vh unit based on viewport height
//     function setVhUnit() {
//         let vh = window.innerHeight * 0.01;
//         document.documentElement.style.setProperty('--vh', `${vh}px`);
//     }

//     // Call setVhUnit on load + add listener to adjust --vh on resize
//     setVhUnit();
//     window.addEventListener('resize', setVhUnit);


//     setWordPairAndLengths(0);
//     buildWordPairTiles();

//     checkAndUpdateBestScoreIndex();
//     updateBestScoreUI();
    
//     console.log("PAGE LOAD: Word Pair: ", wordPair.startWord, wordPair.endWord, "Latest/Target: ", gameState.latestWord, gameState.targetWord);
    
//     //EVENT LISTENERS for BUTTONS
//     document.getElementById('toggleFlip').addEventListener('click', toggleFlip);
//     document.addEventListener('click', function(event) {
//         if (event.target.tagName === 'BUTTON' && event.target.id) {
//             switch(event.target.id) {
//                 case 'submitMove':
// 		            submitMove();
//                     break;
//                 case 'nextRound':
//                 case 'skipRound':
//                     updateGame('nextRound');
//                     break;                 
//                 case 'resetRound':
//                 case 'retryRound':
//                     updateGame('resetRound');
//                     break;
//                 case 'goBackOne':
//                     console.log('***GO BACK PRESSED');
//                     goBackOne();
//                     break;
//                 case 'normDeleter':
//                     deleteMove('norm');
//                     break;
//                 case 'flipDeleter':
//                     deleteMove('flip');
//                     break;
//                 default:
//             }
//         }
//     });

//     // Event listener for TEXT BOX (Enter Key)
//     document.getElementById('currentInput').addEventListener('keypress', function(event) {
//         if (event.key === 'Enter' && document.getElementById('submitMove').style.display !== 'none') {
//             submitMove();
//         }
//     });

//     // Event listeners for onscreen keyboard
//     document.querySelectorAll('#keyboard .key').forEach(key => {
//         key.addEventListener('click', function() {
//             const keyValue = key.textContent;

//             if (keyValue === 'Enter') {
//                 submitMove();
//             } else if (keyValue === '⌫') {
//                 // Simulate backspace by removing the last character from the input field
//                 const inputField = document.getElementById('currentInput');
//                 inputField.value = inputField.value.slice(0, -1);
//             } else {
//                 // Add the clicked key value to the input field
//                 const inputField = document.getElementById('currentInput');
//                 inputField.value += keyValue;
//             }
//         });
//     });


//     // Initialize
//     removeClass('overlayer', 'loading');
// });


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

    checkAndUpdateBestScoreIndex();
    updateBestScoreUI();

    // console.log("PAGE LOAD: Word Pair: ", wordPair.startWord, wordPair.endWord, "Latest/Target: ", gameState.latestWord, gameState.targetWord);

    // EVENT LISTENERS for BUTTONS
    document.getElementById('toggleFlip').addEventListener('click', toggleFlip);
    document.addEventListener('click', function(event) {
        if (event.target.tagName === 'BUTTON' && event.target.id) {
            switch(event.target.id) {
                case 'submitMove':
                    submitMove();
                    break;
                case 'nextRound':
                case 'skipRound':
                    updateGame('nextRound');
                    break;                 
                case 'resetRound':
                case 'retryRound':
                    updateGame('resetRound');
                    break;
                case 'goBackOne':
                    console.log('***GO BACK PRESSED');
                    goBackOne();
                    break;
                case 'normDeleter':
                    deleteMove('norm');
                    break;
                case 'flipDeleter':
                    deleteMove('flip');
                    break;
                default:
            }
        }
    });

    // Event listener for TEXT BOX (Enter Key)
    document.getElementById('currentInput').addEventListener('keypress', function(event) {
        if (event.key === 'Enter' && document.getElementById('submitMove').style.display !== 'none') {
            submitMove();
        }
    });

    // Event listener for onscreen keyboard (using event delegation)
    document.getElementById('keyboard').addEventListener('click', function(event) {
        const key = event.target.closest('.key');
        if (!key) return; // Ignore clicks outside of keys

        const keyValue = key.textContent;

        if (keyValue === 'Enter') {
            submitMove();
        } else if (keyValue === '⌫') {
            // Simulate backspace by removing the last character from the input field
            const inputField = document.getElementById('currentInput');
            inputField.value = inputField.value.slice(0, -1);
        } else {
            // Add the clicked key value to the input field
            const inputField = document.getElementById('currentInput');
            inputField.value += keyValue;
        }
    });

    // // Double-tap prevention for mobile devices
    // let lastTouchEnd = 0;
    // document.addEventListener('touchend', (event) => {
    //     const now = new Date().getTime();
    //     if (now - lastTouchEnd <= 300) { // Prevents zoom if double-tap occurs within 300 ms
    //         event.preventDefault();
    //     }
    //     lastTouchEnd = now;
    // }, false);

    // Initialize
    removeClass('overlayer', 'loading');
});
