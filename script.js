import { wordPairList } from './words.js';
import { isTotallyValid } from './word-validity.js';

const startWordRack = document.getElementById('startWordRack');
const normInputRack = document.getElementById('normInputRack'); 
const flipInputRack = document.getElementById('flipInputRack');
const endWordRack = document.getElementById('endWordRack');
const resultPanel = document.getElementById('resultPanel');

//// INITIAL STATE AT START OF ROUND ////
const initialGameState = {
    gamePhase: 'preRound',
    gameDirection: 'norm',
    moveCounter: 0,
    normInputArray: [],
    flipInputArray: [],
    latestWord: '',
    targetWord: '',
    resultMessage: ''
};
export let gameState = { ...initialGameState };

function resetGameState() {
    gameState = { ...initialGameState };
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
////SHOWING & HIDING WHOLE CLASSES//// ✅
function showClass(className) {
    const elems = document.querySelectorAll('.' + className);
    elems.forEach(el => el.classList.remove('hidden'));
}
function hideClass(className) {
    const elems = document.querySelectorAll('.' + className);
    elems.forEach(el => el.classList.add('hidden'));
}
function focusTextInputBox() {
    document.getElementById('currentInput').focus();
}
function emptyTextInputBox() {
    document.getElementById('currentInput').value = '';
}

////EMPTYING CONTAINERS and CONTAINER RACKS ❗️❗️❗️❗️❗️❗️
function resetInputRackUI() {
    document.querySelectorAll('#normInputRack .wordCont, #flipInputRack .wordCont').forEach(wordCont => {
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
    bestScoreDisplay.innerText = "Best Score: " + latestBestScore;
}

//UPDATE MOVECOUNTER ON SCREEN - ❓ COMBINE?
function updateMoveCounterUI() {
    document.getElementById('moveCounter').innerText = "Moves: " + gameState.moveCounter;
}


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
        if (isVisible) tile.style.animationDelay = `${i * 0.2}s`;
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

//FUNC: SUBMITTING A MOVE
function submitMove() {
    const inputWord = document.getElementById('currentInput').value.toLowerCase();

    if (isTotallyValid(inputWord, gameState.latestWord)) {
        getDirectionalConfig().upperRackArray.push(inputWord);
        makeTilesFor(inputWord);
        gameState.moveCounter++;

        // If round complete
         (inputWord === gameState.targetWord || inputWord === gameState.latestWord)
            ? updateGame('roundComplete')
            : updateGame('submit');

    } else focusTextInputBox(); //i.e. if isTotallyValid returns "false"
}


// DIRECTIONAL CONFIGURATIONS
function getDirectionalConfig() {
    if (gameState.gameDirection === 'norm') {
        return {
            upperRack: normInputRack,
            lowerRack: flipInputRack,
            wordAtTop: wordPair.startWord,
            wordAtBottom: wordPair.endWord,
            upperRackArray: gameState.normInputArray,
            lowerRackArray: gameState.flipInputArray,
        };
    } else { // i.e. is 'flip'
        return {
            upperRack: flipInputRack,
            lowerRack: normInputRack,
            wordAtTop: wordPair.endWord,
            wordAtBottom: wordPair.startWord,
            upperRackArray: gameState.flipInputArray,
            lowerRackArray: gameState.normInputArray,
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
    gameState.gameDirection = gameState.gameDirection === 'norm' ? 'flip' : 'norm';
    updateGame('flip');
}


//消してマッチした場合はどうなるか？？？特にMove Counterやcompleteアニメーションなど

function updateDeleters(action) {
    const normArray = gameState.normInputArray;
    const flipArray = gameState.flipInputArray;
    const normDeleter = document.getElementById('normDeleter');
    const flipDeleter = document.getElementById('flipDeleter');

    switch (action) {
        case 'reset':
            normDeleter.classList.add('invisible');
            flipDeleter.classList.add('invisible');
            break;

        case 'delete':
            if (normArray.length === 0) normDeleter.classList.add('invisible');
            else if (flipArray.length === 0) flipDeleter.classList.add('invisible');
            break;

        case 'submit':
            if (normArray.length > 0) normDeleter.classList.remove('invisible');
            if (flipArray.length > 0) flipDeleter.classList.remove('invisible');
            break;
    }
}


function deleteMove(which) {
    let dirConfig = which === 'norm'
        ? { rack: normInputRack, array: gameState.normInputArray }
        : { rack: flipInputRack, array: gameState.flipInputArray };

    let wordConts = dirConfig.rack.querySelectorAll('.wordCont');

    if (dirConfig.array.length > 0) dirConfig.array.pop();
    if (wordConts) wordConts[wordConts.length - 1].remove();

    gameState.moveCounter--;

    gameState.latestWord !== gameState.targetWord
        ? updateGame('delete')
        : updateGame('roundComplete');

    console.log('After: ', dirConfig.rack, dirConfig.array);
}

function updateUI(stateOrAction) {

    console.log(gameState.gamePhase);

    if (gameState.gamePhase === 'preRound') {
        showClass('inputter');
        showClass('moveCounter');
        // hideClass('result-panel');
        resultPanel.classList.remove('complete');
        updateDeleters('reset'); //??
        updateDirectionUI('norm');
        resetInputRackUI();
        emptyTextInputBox();
    }
    else if (gameState.gamePhase === 'postRound') {
        hideClass('inputter');
        hideClass('moveCounter');
        // showClass('result-panel');
        resultPanel.classList.add('complete');
        emptyTextInputBox();
        updateDeleters('reset'); //??
        resultMessage.innerText = "Completed in " + gameState.moveCounter + " moves!\nYou know words good!!";
    }

    updateBestScoreUI();

    switch (stateOrAction) {
        case 'submit':
        case 'delete':
            focusTextInputBox();
            emptyTextInputBox();
            updateDeleters(stateOrAction);
            break;
        case 'flip':
            updateDirectionUI(gameState.gameDirection);
            break;
        default:
            break;
    }
    updateMoveCounterUI(); //"go back"を考えると、completeでも一応update?いや、数字がアプデされてればいい？
}


function updateGame(action) {
    switch (action) {   
        case 'submit':
        case 'flip':
            gameState.gamePhase = 'midRound';
        case 'delete':
            updateUI(action);
            updateLatestAndTargetWord();
            break;

        case 'roundComplete':
            gameState.gamePhase = 'postRound';
            checkAndUpdateBestScoreIndex();

            updateUI();
            updateLatestAndTargetWord();
            console.log("ROUND COMPLETE!!");
            break;

        case 'nextRound':
            wordPair.currentPairIndex++;
        case 'resetRound':
            resetGameState();
            setWordPairAndLengths();
            updateUI();
            buildWordPairTiles();
            
            console.log(`'${action}'. latest/target word: ${gameState.latestWord}; ${gameState.targetWord}`);
            break;

        case 'goBack':
            gameState.gamePhase = 'midRound';
            break;
    };
    
    console.log(`'${action}'. latest/target word: ${gameState.latestWord}; ${gameState.targetWord}`);
}


// INITIALIZE GAME DISPLAY AFTER GAMELOAD　//❓❓❓いつconfigは？ 最初にgameAreaを「hidden」にしておく
document.addEventListener('DOMContentLoaded', (event) => {

    setWordPairAndLengths(0);
    buildWordPairTiles();

    checkAndUpdateBestScoreIndex();
    updateBestScoreUI();
    
    console.log("PAGE LOAD: Word Pair: ", wordPair.startWord, wordPair.endWord, "Latest/Target: ", gameState.latestWord, gameState.targetWord);
    
    //EVENT LISTENERS for BUTTONS
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
                    console.log('go back pressed');
                    deleteMove();
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

    // Event listener for TEXT BOX (Enter Key) //これどういう意味なんだ？
    document.getElementById('currentInput').addEventListener('keypress', function(event) {
        if (event.key === 'Enter' && document.getElementById('submitMove').style.display !== 'none') {
            submitMove();
        }
    });
    focusTextInputBox();
    showClass('gameArea');
});
