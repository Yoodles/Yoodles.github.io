import { wordPairList } from './words.js';
import { isTotallyValid } from './word-validity.js';

const gameArea = document.getElementById('gameArea');

const startWordRack = document.getElementById('startWordRack');
const normInputRack = document.getElementById('normInputRack'); 
const flipInputRack = document.getElementById('flipInputRack');
const endWordRack = document.getElementById('endWordRack');

const normDeleter = document.getElementById('normDeleter');
const flipDeleter = document.getElementById('flipDeleter');


//// INITIAL STATE AT START OF ROUND ////
export let gameState = {
    wordPair: {
        currentPairIndex: 0, //
        startWord: '', //
        endWord: '', //
        maxLength: 6, //
        minLength: 3, //
        bestScoreIndex: {}
    },
    gamePhase: 'preRound', //
    gameDirection: 'norm', //
    moveCounter: 0, //
    normInputArray: [],
    flipInputArray: [],
    latestWord: '',
    targetWord: '',
    resultMessage: ''
}

function setInitialGameState() {   // 🚨 
    gameState.latestWord = gameState.wordPair.startWord;
    gameState.targetWord = gameState.wordPair.endWord;
    gameState.gameDirection = 'norm';
    gameState.moveCounter = 0;
    gameState.normInputArray = [];
    gameState.flipInputArray = [];
    gameState.gamePhase = 'preRound';
    gameState.resultMessage = '';
    updateUI('preRound');
}


//FUNC: SETTING NEW WORD PAIR FOR ROUND; CALCULATING MIN./MAX. LENGTHS //❗️❗️❗️❗️❗️⬇️
function setInitialPairAndLengths(index) { //❗️❗️❗️❗️❗️"ALL rounds completed"は"NEXTROUND"の場合オンリー
    index = gameState.wordPair.currentPairIndex;
    if (gameState.wordPair.currentPairIndex < wordPairList.length) {

        gameState.wordPair.startWord = wordPairList[index].start;
        gameState.wordPair.endWord = wordPairList[index].end;

        gameState.wordPair.maxLength = Math.max(gameState.wordPair.startWord.length, gameState.wordPair.endWord.length) + 1;
        gameState.wordPair.minLength = Math.max(Math.min(gameState.wordPair.startWord.length, gameState.wordPair.endWord.length) - 1, 3);
    } else {
        document.getElementById('gameArea').innerText = "No Word Pair Found!";
    }
/*    console.log("INsetInitialPairAndLengths: PairIndex; start; end; Max.; Min.:", gameState.wordPair.currentPairIndex, gameState.wordPair.startWord, gameState.wordPair.endWord, gameState.wordPair.maxLength, gameState.wordPair.minLength);
*/
}

//"if preRound""にすれば、argumentもこのfunctionも要らない？
function makeInitialPairTiles() {
    makeTilesFor(gameState.wordPair.startWord, startWordRack);
    makeTilesFor(gameState.wordPair.endWord, endWordRack);
}

// DIRECTIONAL CONFIGURATIONS
function getDirectionalConfig() {
    if (gameState.gameDirection === 'norm') {
        return {
            upperRack: normInputRack,
            lowerRack: flipInputRack,
            wordAtTop: gameState.wordPair.startWord,
            wordAtBottom: gameState.wordPair.endWord,
            upperRackArray: gameState.normInputArray,
            lowerRackArray: gameState.flipInputArray,
        };
    } else { // i.e. is 'flip'
        return {
            upperRack: flipInputRack,
            lowerRack: normInputRack,
            wordAtTop: gameState.wordPair.endWord,
            wordAtBottom: gameState.wordPair.startWord,
            upperRackArray: gameState.flipInputArray,
            lowerRackArray: gameState.normInputArray,
        };
    }
}

//// DEBUGGING: DISPLAY CONTENT OF ARRAYS TO VERIFY
function logArrays() {
    console.log('Norm Inputs:', gameState.normInputArray);
    console.log('Flip Inputs:', gameState.flipInputArray);
}
 

//====UTILITY FUNCTIONS====//
////SHOWING & HIDING WHOLE CLASSES//// ✅
function showClass(className) {
    let elements = document.querySelectorAll('.' + className);
    elements.forEach(function(element) {
        element.classList.remove('hidden');
    });
}
function hideClass(className) {
    let elements = document.querySelectorAll('.' + className);
    elements.forEach(function(element) {
        element.classList.add('hidden');
    });
}

function showOrHideGameArea(which) { //toggleでも
    which === 'show'
        ? gameArea.classList.remove('hidden')
        : gameArea.classList.add('hidden');    
}


////EMPTYING CONTAINERS and CONTAINER RACKS ❗️❗️❗️❗️❗️❗️
function emptyInputRacks() {
    document.querySelectorAll('#normInputRack .wordCont, #flipInputRack .wordCont').forEach(wordCont => {
        wordCont.querySelectorAll('div').forEach(tile => {
            tile.textContent = '';
            tile.classList.remove('tile');
        });
        wordCont.classList.remove('wordCont');
    });
}

////CLEARING TEXT INPUT BOX
function emptyTextInputBox() {
    document.getElementById('currentInput').value = '';
}


//====BEST SCORES====//
//UPDATE BEST SCORE FOR THE ROUND ❗️❗️(CHECK IF BEST SCORE?)
function checkAndUpdateBestScoreIndex() { //just at end of round?
    const indexNum = gameState.wordPair.currentPairIndex;
    // Check for existing best score, update, and return latest best score
    //(="If there's no best score for the index no. in bestScoreIndex corresponding to crntPairIndex, or if the moveCounter is lower than it, then the moveCounter shall be the new bestScore in the index")
    if (!gameState.wordPair.bestScoreIndex[indexNum] || gameState.moveCounter < gameState.wordPair.bestScoreIndex[indexNum]) {
        gameState.wordPair.bestScoreIndex[indexNum] = gameState.moveCounter;
    }
    console.log("BestScore: " + gameState.wordPair.bestScoreIndex[indexNum]);
}

//SHOW LATEST BEST SCORE on SCREEN ///　UPDATE!!!!! IF!!!! ANIMATION!!!!!
function showLatestBestScore() {
    let bestScoreDisplay = document.getElementById('bestScore');
    let latestBestScore = gameState.wordPair.bestScoreIndex[gameState.wordPair.currentPairIndex] || "--";
    console.log("Best Score: ", latestBestScore);
    ////Animation if updated: if it's POSTROUND (i.e. not start of game) and (moveCounter  < latestBestScore), animation
    bestScoreDisplay.innerText = "Low Score: " + latestBestScore;
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
            ? updateGame('completeRound')
            : updateGame('submit');

    } else document.getElementById('currentInput').focus(); //i.e. if isTotallyValid returns "false"
}




// FUNCTION: Update the latest and target word based on the current directional configuration
function updateLatestAndTargetWord() {
    const { upperRackArray, wordAtTop, lowerRackArray, wordAtBottom } = getDirectionalConfig();
    gameState.latestWord = upperRackArray.length ? upperRackArray.at(-1) : wordAtTop;
    gameState.targetWord = lowerRackArray.length ? lowerRackArray.at(-1) : wordAtBottom;
}

// FUNCTION: Update UI direction after toggling flip state (DELETERSももしや?あと、GAME LOGICとUIを一緒でいいのか)
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


//FUNC: FLIPPING (AND UPDATING LATEST/TARGET WORDS)
function toggleFlip() {
    gameState.gameDirection = gameState.gameDirection === 'norm' ? 'flip' : 'norm';

    updateDirectionUI(gameState.gameDirection);
    updateLatestAndTargetWord();
    console.log("Game Mode: ", gameState.gameDirection, ". Latest Word: ", gameState.latestWord,". Target Word: ", gameState.targetWord);
    updateGame();
}




//消してマッチした場合はどうなるか？？？特にMove Counterやcompleteアニメーションなど

function updateDeleterVisibility(action) {
    const normArray = gameState.normInputArray;
    const flipArray = gameState.flipInputArray;

    switch (true) {
        case gameState.gamePhase === 'preRound':
        case gameState.gamePhase === 'postRound':
            normDeleter.classList.add('invisible');
            flipDeleter.classList.add('invisible');
            break;

        case action === 'delete':
            if (normArray.length === 0) normDeleter.classList.add('invisible');
            else if (flipArray.length === 0) flipDeleter.classList.add('invisible');
            break;

        case action === 'submit':
            if (normArray.length === 1) normDeleter.classList.remove('invisible');
            if (flipArray.length === 1) flipDeleter.classList.remove('invisible');
            break;
    }
}


//FUNC: DELETE LAST INPUT (x TWO BUTTONS)
function deleteOne(which) {
    const config = which === 'norm'
        ? { rack: normInputRack, array: gameState.normInputArray }
        : { rack: flipInputRack, array: gameState.flipInputArray };

    const wordConts = config.rack.querySelectorAll('.wordCont');

    console.log('Before: ', config.rack, config.array);

    if (config.array.length > 0) config.array.pop();
    if (wordConts) wordConts[wordConts.length - 1].remove();

    console.log('After: ', config.rack, config.array);

    gameState.moveCounter--;
    updateGame('delete');
}

function updateUI(stateOrAction) {
    updateDeleterVisibility(stateOrAction);

    if (stateOrAction === 'postRound') {
        hideClass('preRound');
        showClass('postRound');
        emptyTextInputBox();

        resultMessage.innerText = "Completed in " + gameState.moveCounter + " moves!\nYou know words good!";

        showLatestBestScore();
    }
    else if (stateOrAction === 'preRound') {
        showClass('preRound');
        hideClass('postRound');
        updateDirectionUI('norm');

        emptyTextInputBox();
        showLatestBestScore();
    }

    if (stateOrAction === 'submit' || stateOrAction === 'delete') {
        emptyTextInputBox();
        document.getElementById('currentInput').focus();
    }
}

function updateGame(action) {
    switch (action) {   
        case 'submit':
        case 'delete':
            gameState.gamePhase = 'midRound';
            updateUI(action);
            updateLatestAndTargetWord();
            break;

        case 'completeRound':
            gameState.gamePhase = 'postRound';
            updateUI('postRound');
            checkAndUpdateBestScoreIndex();

            console.log("ROUND COMPLETE!!");
            break;

        case 'resetRound': //TRY AGAINを忘れている？❗️❗️ restartに変える
            setInitialGameState(); //includes phase, arrays
            emptyInputRacks(); //→ "clearPrevInput"? clarify UI; not in resetToPreroundUI()?
            
            getDirectionalConfig(); //ここ？letする必要は？？

            updateUI('preRound');

            break;

        // NEXT ROUND or SKIP ROUND ❗️違い：if postRoundだったらpreRoundに消す  ❗️❗️ リストの長さと計算合うか確認
        case 'goToNextRound':
            if (gameState.wordPair.currentPairIndex === wordPairList.length - 1) {
                document.getElementById('gameArea').innerText = "All rounds completed!"; //🚨 
            } else {
                gameState.wordPair.currentPairIndex++;
                setInitialPairAndLengths();

                setInitialGameState(); //includes Arrays
                emptyInputRacks();

                updateUI('preRound');

                makeInitialPairTiles(); //Animationをリセットするか否か                
            }
            break;
    };
    updateMoveCounterUI(); //"go back"を考えると、completeでも一応update?いや、数字がアプデされてればいい？

    document.getElementById('currentInput').focus(); //FOCUS;


    console.log(`${action} performed. latest/target word: ${gameState.latestWord}; ${gameState.targetWord}`);

}


// INITIALIZE GAME DISPLAY AFTER GAMELOAD　//❓❓❓いつconfigは？ 最初にgameAreaを「hidden」にしておく
document.addEventListener('DOMContentLoaded', (event) => {

    setInitialPairAndLengths(0);
    setInitialGameState();

    makeInitialPairTiles();
    showLatestBestScore();
    
    document.getElementById('currentInput').focus();
    // console.log("PAGE LOAD: Latest/Target: ", gameState.latestWord, gameState.targetWord);
    
    // EVENT LISTENERS for BUTTONS
    document.getElementById('toggleFlip').addEventListener('click', function() {
        toggleFlip();
    });
    
    document.addEventListener('click', function(event) {
        if (event.target.tagName === 'BUTTON' && event.target.id) {
            switch(event.target.id) {
                case 'submitMove':
		            submitMove();
                    break;
                case 'nextRound':
                case 'skipRound':
                    updateGame('goToNextRound');
                    break;                 
                case 'resetRound':
                case 'tryAgain':
                    updateGame('resetRound');
                    break;
                case 'normDeleter':
                    deleteOne('norm');
                    break;
                case 'flipDeleter':
                    deleteOne('flip');
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
    document.getElementById('currentInput').focus(); //FOCUS;
    showOrHideGameArea('show');
    //THEN, REVEAL. (toggle) document.getElementById('gameArea').classList.remove('hidden');
});
