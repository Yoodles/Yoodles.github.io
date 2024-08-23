import { wordPairList } from './words.js';
import { isTotallyValid } from './word-validity.js';

const gameArea = document.getElementById('gameArea');

const startWordRack = document.getElementById('startWordRack');
const normInputRack = document.getElementById('normInputRack'); 
const flipInputRack = document.getElementById('flipInputRack');
const endWordRack = document.getElementById('endWordRack');

const upperDeleter = document.getElementById('upperDeleter');
const lowerDeleter = document.getElementById('lowerDeleter');


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
    normInputArray: [], //❓❓❓❓❓❓
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
function logContentOfArrays() {
    console.log('Norm Inputs:', gameState.normInputArray);
    console.log('Flip Inputs:', gameState.flipInputArray);
}

function showOrHideGameArea(which) { //toggleでも
    which === 'show'
        ? gameArea.classList.remove('hidden')
        : gameArea.classList.add('hidden');    
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

////EMPTYING CONTAINERS and CONTAINER RACKS ❗️❗️❗️❗️❗️❗️
function emptyInputRacks() {
    // Function to clear the contents of each tile and reset classes
    function clearAndResetWordCont(wordCont) {
        const tiles = wordCont.querySelectorAll('div');
        tiles.forEach(tile => {
            tile.textContent = '';  // Clear text content of each tile
            tile.classList.remove('tiles');  // Remove 'tiles' class from each tile
        });

        wordCont.classList.remove('wordCont');  // Remove 'wordCont' class from the word container
    }

    // Get all wordConts in normInputRack and flipInputRack and process them
    const normWordConts = normInputRack.querySelectorAll('.wordCont');
    const flipWordConts = flipInputRack.querySelectorAll('.wordCont');

    normWordConts.forEach(clearAndResetWordCont);
    flipWordConts.forEach(clearAndResetWordCont);
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

    /*    return gameState.wordPair.bestScoreIndex[indexNum] || gameState.moveCounter; */
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





// FUNCTION: Update the latest and target word based on the current directional configuration
function updateLatestAndTargetWord() {
    const { upperRackArray, wordAtTop, lowerRackArray, wordAtBottom } = getDirectionalConfig();
    gameState.latestWord = upperRackArray.length ? upperRackArray.at(-1) : wordAtTop;
    gameState.targetWord = lowerRackArray.length ? lowerRackArray.at(-1) : wordAtBottom;
}

// FUNCTION: Update UI direction after toggling flip state (DELETERSももしや?あと、GAME LOGICとUIを一緒でいいのか)
function updateDirectionUI() {
    const elementsToUpdate = [
        document.getElementById('gameplayCont'),
        document.getElementById('flipperAndDeleters')
    ];
    elementsToUpdate.forEach(element => {
        if (element) {
            gameState.gameDirection === 'flip'
                ? element.setAttribute('data-flip', '')
                : element.removeAttribute('data-flip');
        }
    });
}


//FUNC: FLIPPING (AND UPDATING LATEST/TARGET WORDS)
function toggleFlip() {
    gameState.gameDirection = gameState.gameDirection === 'norm' ? 'flip' : 'norm';

    /* console.log("Word at Top/Upper Rack Array ", currentDirectionalConfig.wordAtTop, currentDirectionalConfig.upperRackArray); */
    updateDirectionUI();
    updateLatestAndTargetWord();
    // updateDeleters();
    console.log("Game Mode: ", gameState.gameDirection, ". Latest Word: ", gameState.latestWord,". Target Word: ", gameState.targetWord);
    updateGame();
}





//HANDLING THE INPUT

////GENERATING WORD TILES////

function highlightMatchingLettersBasedOnWords(inputWord, endWord) {
    const inputTiles = currentDirectionalConfig.upperRack.lastElementChild.querySelectorAll('.tiles');
    const endTiles = endWordRack.querySelectorAll('.tiles');

    for (let i = 0; i < inputWord.length; i++) {
        if (i < endWord.length && inputWord[i].toUpperCase() === endWord[i].toUpperCase()) {
            if (inputTiles[i]) inputTiles[i].classList.add('matching-letter');
            if (endTiles[i]) endTiles[i].classList.add('matching-letter');
        }
    }
}


function makeTilesFor(word) {
    const wordCont = getWordContainer(word);
    const tileConts = wordCont.querySelectorAll('div');

    tileConts.forEach((tile, i) => {
        const isVisible = i < word.length;
        tile.textContent = isVisible ? word[i].toUpperCase() : '';
        tile.classList.toggle('tiles', isVisible);
        tile.classList.toggle('hidden', !isVisible);
        if (isVisible) tile.style.animationDelay = `${i * 0.2}s`;
    });

    wordCont.classList.remove('hidden');
}

function getWordContainer(word) {
    if (word === gameState.wordPair.startWord) return startWordRack;
    if (word === gameState.wordPair.endWord) return endWordRack;
    return prepareInputWordCont();
}

//GETTING THE INPUTWORD CONT READY
function prepareInputWordCont() {
    const { upperRack, upperRackArray } = getDirectionalConfig();
    const placeInRack = upperRackArray.length;
    const rackDivs = upperRack.children;

    let wordCont;

    if (rackDivs && placeInRack < rackDivs.length) {
        wordCont = rackDivs[placeInRack];
    } else {
        wordCont = document.createElement('div');
        upperRack.appendChild(wordCont);
    }

    wordCont.innerHTML = ''; // Clear any existing content

    // Prepare 6 empty divs inside wordCont
    for (let i = 0; i < 6; i++) {
        const tileCont = document.createElement('div');
        wordCont.appendChild(tileCont);
    }

    wordCont.classList.add('wordCont');
    return wordCont;
}


//// GENERATE TILES FOR ROUND'S WORDPAIR //"if preRound""にすれば、argumentもこのfunctionも要らない？
function makeInitialPairTiles() {
    makeTilesFor(gameState.wordPair.startWord);
    makeTilesFor(gameState.wordPair.endWord);
}


//消してマッチした場合はどうなるか？？？特にMove Counterやcompleteアニメーションなど

//FUNC: SUBMITTING A MOVE
function submitMove() {
    const inputWord = document.getElementById('currentInput').value.toLowerCase();

    // Check if input is valid...
    if (isTotallyValid(inputWord, gameState.latestWord)) {
        // gameState.latestWord = inputWord; //...update latestWord...
        gameState.moveCounter++;

        const { upperRackArray } = getDirectionalConfig();
        upperRackArray.push(inputWord);
        console.log("Upper Array", upperRackArray);

        if (upperRackArray.length === 1) upperDeleter.classList.remove('invisible');

        makeTilesFor(inputWord);

        // If round complete
         (inputWord === gameState.targetWord || inputWord === gameState.latestWord)
            ? updateGame('completeRound')
            : updateGame('midRound');

        // emptyTextInputBox();
        updateLatestAndTargetWord(); //要る？

    } else document.getElementById('currentInput').focus();

    console.log(`WORD SUBMITTED. Latest Word: ${gameState.latestWord}; Target Word: ${gameState.targetWord}`);
}


function updateDeleters() {
    if (gameState.gamePhase === 'postRound') {
        upperDeleter.classList.add('invisible');
        lowerDeleter.classList.add('invisible');
    } else {
        let currentDirectionalConfig = getDirectionalConfig();
        upperDeleter.classList.toggle('invisible', currentDirectionalConfig.upperRackArray.length === 0);
        lowerDeleter.classList.toggle('invisible', currentDirectionalConfig.lowerRackArray.length === 0);
    }
}

//FUNC: DELETE LAST INPUT (x TWO BUTTONS)
function deleteOne(upperOrLower, direction) {
    let deleteButton = upperOrLower === 'upper' ? upperDeleter : lowerDeleter;

    let rack = (direction === 'norm') ? normInputRack : flipInputRack;
    let array = (direction === 'norm') ? gameState.normInputArray : gameState.flipInputArray;

    if (array.length > 0) {
        array.pop();
        if (rack.lastChild) rack.removeChild(rack.lastChild);   /////lastElementChildじゃなくて良いのか❓
    }
    else deleteButton.classList.add('invisible');     //redundant!!!!! でもどうするか

    updateLatestAndTargetWord();
    gameState.moveCounter--; //When to display?
    console.log("Deleted. Latest: ", gameState.latestWord,"; Target: ", gameState.targetWord);
/*    updateGame('deleteOne'); */
}


// FUNCTION TO UPDATE GAME
// UPDATING UI
function updateUI(phase) {
    switch (phase) {
        case 'preRound':   ///これだとゲーム中にupdateUIを使えない?
            resultMessage.innerText = "";
            showClass('preRound');
            hideClass('postRound');
            break;
            //UPDATE MOVE COUNTER

        case 'postRound':
            resultMessage.innerText = "Completed in " + gameState.moveCounter + " moves!\nYou know words good!";
            hideClass('preRound');
            showClass('postRound');
            emptyTextInputBox(); //消しとかないと？でも"BACK"した時
            // showContentOfArrays();
            break;

        case 'midRound':
            showClass('preRound', 'midRound');
            hideClass('postRound');
            //でも'midRound'だと、Deletersが両方出てない場合ダメ=親funcの最後で回収？
            break;

        default:
            break;
    }
    updateDeleters();
    updateMoveCounterUI(); //"go back"を考えると、completeでも一応update?いや、数字がアプデされてればいい？
    console.log("UPDATEUI: Lat/Targ: ", gameState.latestWord, gameState.targetWord);
}


function updateGame(action) {
    switch (action) {

        case 'resetRound': //TRY AGAINを忘れている？❗️❗️ restartに変える
            setInitialGameState(); //includes phase, arrays
            //INSERT fade-out animation etc.
            emptyInputRacks(); //→ "clearPrevInput"? clarify UI; not in updateUI(preRound)?
            
            getDirectionalConfig(); //ここ？letする必要は？？
            updateUI('preRound');
            showLatestBestScore(); //???

            break;

        case 'completeRound':
            gameState.gamePhase = 'postRound';
            console.log("ROUND COMPLETE");
            checkAndUpdateBestScoreIndex(); //SUBMITでやったっけ？
            //INSERT fade-out animation etc.
            updateUI('postRound');  //❓❓❓❓
            break;


        // NEXT ROUND or SKIP ROUND ❗️違い：if postRoundだったらpreRoundに消す  ❗️❗️ リストの長さと計算合うか確認
        case 'goToNextRound':
            if (gameState.wordPair.currentPairIndex === wordPairList.length - 1) {
                document.getElementById('gameArea').innerText = "All rounds completed!"; //🚨 
            } else {
                gameState.wordPair.currentPairIndex++;
                setInitialPairAndLengths();
                setInitialGameState(); //includes Arrays
                emptyInputRacks(); //??
                updateDeleters();
                updateDirectionUI();
                updateUI('preRound');

                makeInitialPairTiles(); //Animationをリセットするか否か
                
                showLatestBestScore(); //ここ？
            }
            break;

        case 'deleteOne':
            updateUI('delete') //????
            break;

        default:
            emptyTextInputBox();
            updateMoveCounterUI(); //submitMoveの場合だけこっちかsubmitMoveで。他はupdateUIの共通エンディング
            document.getElementById('currentInput').focus(); //でもsubmitがinvalidだったら？ 
            break;
    };
    document.getElementById('currentInput').focus(); //FOCUS;
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
                case 'upperDeleter':
                    deleteOne('upper', gameState.gameDirection === 'norm' ? 'norm' : 'flip');
                    break;
                case 'lowerDeleter':
                    deleteOne('lower', gameState.gameDirection === 'norm' ? 'flip' : 'norm');
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
