import { wordPairList, wordList } from './words.js';

const gameArea = document.getElementById('gameArea');
const startWordRack = document.getElementById('startWordRack');
const endWordRack = document.getElementById('endWordRack');

const normInputRack = document.getElementById('normInputRack'); 
const flipInputRack = document.getElementById('flipInputRack');

const upperDeleter = document.getElementById('upperDeleter');
const lowerDeleter = document.getElementById('lowerDeleter');

// let inputWord = document.getElementById('currentInput');

//// INITIAL STATE AT START OF ROUND ////
// GAME STATE
let gameState = {
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
function setWordPairAndLengths(index) { //❗️❗️❗️❗️❗️"ALL rounds completed"は"NEXTROUND"の場合オンリー
    index = gameState.wordPair.currentPairIndex;
    if (gameState.wordPair.currentPairIndex < wordPairList.length) {

        gameState.wordPair.startWord = wordPairList[index].start;
        gameState.wordPair.endWord = wordPairList[index].end;

        gameState.wordPair.maxLength = Math.max(gameState.wordPair.startWord.length, gameState.wordPair.endWord.length) + 1;
        gameState.wordPair.minLength = Math.max(Math.min(gameState.wordPair.startWord.length, gameState.wordPair.endWord.length) - 1, 3);
    } else {
        document.getElementById('gameArea').innerText = "No Word Pair Found!";
    }
/*    console.log("INsetWordPairAndLengths: PairIndex; start; end; Max.; Min.:", gameState.wordPair.currentPairIndex, gameState.wordPair.startWord, gameState.wordPair.endWord, gameState.wordPair.maxLength, gameState.wordPair.minLength);
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

let dirConfigNow = getDirectionalConfig(); //❓❓❓❓❓


//// DEBUGGING: DISPLAY CONTENT OF ARRAYS TO VERIFY
function displayArrays() {
    console.log('Norm Inputs:', gameState.normInputArray);
    console.log('Flip Inputs:', gameState.flipInputArray);
}

function showOrHideGameArea(which) { //toggleでも
    if (which === 'show') {
        gameArea.classList.remove('hidden');
    } else {
        gameArea.classList.add('hidden');
    }    
}
 

// UTILITY FUNCTIONS
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

function showOrHideElements(showOrHide, type, selector) {
    let elements;
    if (type === 'class') {
        elements = document.querySelectorAll('.' + selector);
    } else if (type === 'data') {
        elements = document.querySelectorAll(`[data-${selector}]`);
    }

    elements.forEach(function(element) {
        if (showOrHide === 'show') {
            element.classList.remove('hidden');
        } else if (showOrHide === 'hide') {
            element.classList.add('hidden');
        }
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


////FUNCTIONS FOR UPDATING LATEST/TARGET WORD ❓❓❓❓

function updateLatestWord() {
    dirConfigNow = getDirectionalConfig();
    let {upperRackArray, wordAtTop} = dirConfigNow;   //これ今後大事？？？？❗️❗️❗️❗️  
    console.log("Word at Top: ", dirConfigNow.wordAtTop, "Upper Rack Array: ", dirConfigNow.upperRackArray);
    gameState.latestWord = upperRackArray.length > 0 ? upperRackArray[upperRackArray.length - 1] : wordAtTop;
    console.log("Latest: ", gameState.latestWord);
}
function updateTargetWord() {
    dirConfigNow = getDirectionalConfig();
    let {lowerRackArray, wordAtBottom} = dirConfigNow;
    gameState.targetWord = lowerRackArray.length > 0 ? lowerRackArray[lowerRackArray.length - 1] : wordAtBottom;
    console.log("Target:", gameState.targetWord);
}


////FUNC: UPDATE UI (AND CONFIG) AFTER TOGGLEFLIP (DELETERSももしや?あと、GAME LOGICとUIを一緒でいいのか)
function updateDirectionUI() {
    const isFlipped = gameState.gameDirection === 'flip';
    const gameplayCont = document.getElementById('gameplayCont');

    // flipInputRack.classList.toggle('flip', !isFlipped);
    // normInputRack.classList.toggle('flip', isFlipped);

    // startWordRack[isFlipped ? 'removeAttribute' : 'setAttribute']('data-flip', '');
    flipInputRack[isFlipped ? 'removeAttribute' : 'setAttribute']('data-flip', '');
    normInputRack[!isFlipped ? 'removeAttribute' : 'setAttribute']('data-flip', '');
    // endWordRack[isFlipped ? 'removeAttribute' : 'setAttribute']('data-flip', '');
    gameplayCont[!isFlipped ? 'removeAttribute' : 'setAttribute']('data-flip', '');
}


//FUNC: FLIPPING (AND UPDATING LATEST/TARGET WORDS)
function toggleFlip() { ////アニメーション！！
    gameState.gameDirection = gameState.gameDirection === 'norm' ? 'flip' : 'norm';
    dirConfigNow = getDirectionalConfig(); //＜＜＜ここで、ちゃんとFLIPのCONFIGに変わっているか？
/*    console.log("Word at Top/Upper Rack Array ", dirConfigNow.wordAtTop, dirConfigNow.upperRackArray); */
    updateDirectionUI();
    console.log("4: ", gameState.latestWord);
    updateLatestWord();
    updateTargetWord();
    updateDeleters();
    console.log("Game Mode:", gameState.gameDirection, ". Latest Word:", gameState.latestWord,". Target Word:", gameState.targetWord);
    updateGame();
}

//=====BEST SCORES=====
////UPDATE BEST SCORE FOR THE ROUND ❗️❗️(CHECK IF BEST SCORE?)
function checkAndUpdateBestScoreIndex() { //just at end of round?
    const indexNum = gameState.wordPair.currentPairIndex;
    // Check for existing best score, update it, and return latest best score
    //(="If there's no best score for the index no. in bestScoreIndex corresponding to crntPairIndex, or if the moveCounter is lower than it, then the moveCounter shall be the new bestScore in the index")
    if (!gameState.wordPair.bestScoreIndex[indexNum] || gameState.moveCounter < gameState.wordPair.bestScoreIndex[indexNum]) {
        gameState.wordPair.bestScoreIndex[indexNum] = gameState.moveCounter;

    /*    return gameState.wordPair.bestScoreIndex[indexNum] || gameState.moveCounter; */
    }
    console.log("BestScore: " + gameState.wordPair.bestScoreIndex[indexNum]);
}


////SHOW LATEST BEST SCORE on SCREEN ///　UPDATE!!!!! IF!!!! ANIMATION!!!!!
function showLatestBestScore() {
    let bestScoreDisplay = document.getElementById('bestScore');
    let latestBestScore = gameState.wordPair.bestScoreIndex[gameState.wordPair.currentPairIndex] || "--";
    console.log("Best Score: ", latestBestScore);
    ////Animation if updated: if it's POSTROUND (i.e. not start of game) and (moveCounter  < latestBestScore), animation
    bestScoreDisplay.innerText = "Low Score: " + latestBestScore;
}

function updateDeleters() {
    if (gameState.gamePhase === 'postRound') {
        upperDeleter.classList.add('invisible');
        lowerDeleter.classList.add('invisible');
    } else {
        dirConfigNow = getDirectionalConfig();
        upperDeleter.classList.toggle('invisible', dirConfigNow.upperRackArray.length === 0);
        lowerDeleter.classList.toggle('invisible', dirConfigNow.lowerRackArray.length === 0);
    }
}

//UPDATE MOVECOUNTER ON SCREEN - ❓ COMBINE?
function updateMoveCounterUI() {
    document.getElementById('moveCounter').innerText = "Moves: " + gameState.moveCounter;
}

//==========//

//=====MOVES====✅

////FUNC: CHECK IF 2 WORDS ARE A TWEAK, SCRAMBLE, OR ADD/REMOVE APART ✅
function isOneMoveApart(word1, word2) {
    function isTweak(word1, word2) {
        if (word1.length !== word2.length) return false;
        let diffCount = 0;
        for (let i = 0; i < word1.length; i++) {
          if (word1[i] !== word2[i]) diffCount++;
          if (diffCount > 1) return false;
        }
        return diffCount === 1;
      }
      function isScramble(word1, word2) {
          if (word1 === word2) {
              return false;
          }
          let sortedCompared = word1.split('').sort().join('');
          let sortedInput = word2.split('').sort().join('');
          return sortedCompared === sortedInput;
      }
      function isAddOrRemove(word1, word2) {
          // Function to check if removing one letter from 'word' equals 'other'
          function oneLetterDiff(wordX, wordY) {
              for (let i = 0; i < wordX.length; i++) {
                  let tempWord = wordX.substring(0, i) + wordX.substring(i + 1);
                  if (tempWord === wordY) return true;
              }
              return false;
          }
          // Check both ways since addition in one word is removal in the other
          return oneLetterDiff(word1, word2) || oneLetterDiff(word2, word1);
      }
    return isTweak(word1, word2) || isScramble(word1, word2) ||
        isAddOrRemove(word1, word2);
}

////FUNC: CHECK IF WORD MEETS ALL CONDITIONS // ✅
function isTotallyValid(word, word2) {

    //INPUT IS VALID WORD LENGTH ✅
    function isValidLength(word) {
        if (word.length === 0) {
            alert("Don't be shy, have a try.");
            return false;
        }
        if (word.length < gameState.wordPair.minLength) {
            alert("Minimum length is " + gameState.wordPair.minLength + " letters.");
            return false;
        }
        if (word.length > gameState.wordPair.maxLength) {
            alert("Maximum length is " + gameState.wordPair.maxLength + " letters.");
            return false;
        }
        return true;
    }

    //IS IS IN EITHER WORDLIST OR ONE OF THE STARTING PAIR ❓❓startWordとendWordおけ❓❓
    function isInWordListOrWordPair(word) {
        let length = word.length;
        if ((word === gameState.wordPair.startWord) || (word === gameState.wordPair.endWord)) {
            return true;
        } else if (wordList[length] && wordList[length].has(word)) {
            return true;
        } else {
            alert("That's not even a word!");
            return false;
        }
    };

    if (!isValidLength(word)) {
        return false;
    };
    if (!isOneMoveApart(word, word2)) {
        alert("You can't do that!");
        return false;
    };
    if (!isInWordListOrWordPair(word)) {
        return false;
    }
    console.log("Valid Word!!");
    return true;
}

//============================================

//FUNCTION FOR A TILE WITH A MATCHING WORD???❓❓❓❓


//HANDLING THE INPUT
////FUNC: ADD INPUT TO RIGHT ARRAYS ❓❓❓❓//　ちゃんとこの時点でconfigが平気か❓❓❓❓ DELETEどこでcall
function addToCorrectArray(word) {
    dirConfigNow = getDirectionalConfig();
    dirConfigNow.upperRackArray.push(word);
    // console.log("upperRackArrayに入ってる言葉の数は", dirConfigNow.upperRackArray.length) 
    if (dirConfigNow.upperRackArray.length === 1) {
        upperDeleter.classList.remove('invisible');
    }
    console.log("Upper Array", dirConfigNow.upperRackArray);
}

// GENERATING WORD TILES


//FUNCTION to reset the tiles (maybe attribute too)
function resetTilesOfCont(wordCont) {
    const tiles = wordCont.querySelectorAll('.tiles');

    tiles.forEach(tile => {
        tile.textContent = ''; // Clear the text content
        tile.style.animationDelay = ''; // Clear the inline animation delay style
        tile.classList.remove('tiles'); // Remove the 'tiles' class
    });
}
 
//GETTING THE INPUTWORD CONT READY // ❗️❗️❗️❗️❗️ロード後にたくさん作らせとく
function prepareInputWordCont() {
    dirConfigNow;
    const placeInRack = dirConfigNow.upperRackArray.length;
    console.log("upperRackArray.length: ", dirConfigNow.upperRackArray.length);
    let wordCont;

    const rackDivs = dirConfigNow.upperRack.children;

    if (rackDivs && placeInRack < rackDivs.length) {
        wordCont = rackDivs[placeInRack];
    } else {
        wordCont = document.createElement('div');
        dirConfigNow.upperRack.appendChild(wordCont);
    }

    // Ensure wordCont is empty before adding new tiles (HOW DOES WHILE WORK)
    wordCont.innerHTML = '';

    // Prepare 6 empty divs inside wordCont
    for (let i = 0; i < 6; i++) {
        let tileCont = document.createElement('div');
        wordCont.appendChild(tileCont);
    }
    wordCont.classList.add('wordCont');
    return wordCont;
}

function fillAndShowTiles(word, wordCont) {
    let tileConts = wordCont.querySelectorAll('div');

    for (let i = 0; i < tileConts.length; i++) {
        if (i < word.length) {
            tileConts[i].textContent = word[i].toUpperCase();
            tileConts[i].classList.add('tiles');
            tileConts[i].classList.remove('hidden');
            tileConts[i].style.animationDelay = `${i * 0.3}s`;
        } else {
            tileConts[i].textContent = '';
            tileConts[i].classList.remove('tiles');
            tileConts[i].classList.add('hidden');
        }
    }
    wordCont.classList.remove('hidden'); /////// ❓❓❓❓❓❓❓
}


function highlightMatchingLettersBasedOnWords(inputWord, endWord) {
    const inputTiles = dirConfigNow.upperRack.lastElementChild.querySelectorAll('.tiles');
    const endTiles = endWordRack.querySelectorAll('.tiles');

    for (let i = 0; i < inputWord.length; i++) {
        if (i < endWord.length && inputWord[i].toUpperCase() === endWord[i].toUpperCase()) {
            if (inputTiles[i]) inputTiles[i].classList.add('matching-letter');
            if (endTiles[i]) endTiles[i].classList.add('matching-letter');
        }
    }
}

function makeTilesFor(word) {
    let wordCont;
    if (word === gameState.wordPair.startWord || word === gameState.wordPair.endWord) {
        wordCont = word === gameState.wordPair.startWord ? startWordRack : endWordRacka;
    } else {
        wordCont = prepareInputWordCont();
    }
    fillAndShowTiles(word, wordCont);
     // Call the highlighting function after a short delay
     setTimeout(() => {
        highlightMatchingLettersBasedOnWords(word, gameState.wordPair.endWord);
    }, 600); // Adjust based on your animation duration
}

//// GENERATE TILES FOR ROUND'S WORDPAIR //"if preRound""にすれば、argumentもこのfunctionも要らない？
function makeWordPairTiles() {
    makeTilesFor(gameState.wordPair.startWord);
    makeTilesFor(gameState.wordPair.endWord);
}


//FUNC: SUBMITTING A MOVE
function submitMove() {
    let inputWord = document.getElementById('currentInput').value.toLowerCase();
    if (isTotallyValid(inputWord, gameState.latestWord)) {
        gameState.latestWord = inputWord;
        gameState.moveCounter++;

        addToCorrectArray(inputWord);
        // makeInputWord(inputWord); //いったん見せてからアニメーション？それとも直接postRound UIに？
        makeTilesFor(inputWord);

        //消してマッチした場合はどうなるか？？？特にMove Counterやcompleteアニメーションなど
        // if (inputWord === gameState.targetWord || inputWord === gameState.latestWord) {
        if (inputWord === gameState.targetWord) {
            console.log('inputWord matches targetWord');
            updateGame('completeRound');
        
        } else {
            updateGame();
        }
        emptyTextInputBox();

    } else {
        document.getElementById('currentInput').focus(); //要る？
    }

    console.log("SUBMIT: Latest/Target: ", gameState.latestWord, gameState.targetWord);
}

//FUNC: DELETE LAST INPUT (x TWO BUTTONS)
function deleteOne(upperOrLower, direction) {
    let deleteButton = upperOrLower === 'upper' ? upperDeleter : lowerDeleter;

    let rack = (direction === 'norm') ? normInputRack : flipInputRack;
    let array = (direction === 'norm') ? gameState.normInputArray : gameState.flipInputArray;

    if (array.length > 0) {
        array.pop();
        if (rack.lastChild) {
            rack.removeChild(rack.lastChild);   /////lastElementChildじゃなくて良いのか❓
        }
    }

    if (array.length === 0) {     //redundant!!!!! でもどうするか
        deleteButton.classList.add('invisible');
    }
    updateLatestWord();
    updateTargetWord();
    gameState.moveCounter--; //When to display?
    console.log("Deleted. Latest:", gameState.latestWord,"; Target:", gameState.targetWord);
/*    updateGame('deleteOne'); */
}


// FUNCTION TO UPDATE GAME
// UPDATING UI
function updateUI(phase) {
    switch (phase) {
        case 'preRound':   ///これだとゲーム中にupdateUIを使えない?
            resultMessage.innerText = "";
            showClass('preRound');
            hideClass('midRound', 'postRound');
            // updateDeleters();
            break;
            //UPDATE MOVE COUNTER
        /*    console.log("Successfully hidden")*/

        case 'postRound':
            resultMessage.innerText = "Completed in " + gameState.moveCounter + " moves!\nYou know words good!";
            hideClass('preRound', 'midRound');
            showClass('postRound');
            // updateDeleters();
            emptyTextInputBox(); //消しとかないと？でも"BACK"した時
            displayArrays();
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
            checkAndUpdateBestScoreIndex(); //重複
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
                setWordPairAndLengths();
                setInitialGameState(); //includes Arrays
                emptyInputRacks(); //??
                updateDeleters();
                updateDirectionUI();
                updateUI('preRound');


                makeWordPairTiles(); //Animationをリセットするか否か
                // var afterEmptying = true;
                // makeWordPairTiles(afterEmptying);
                
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
    //dirConfigNow?
    document.getElementById('currentInput').focus(); //FOCUS;
}


// INITIALIZE GAME DISPLAY AFTER GAMELOAD　//❓❓❓いつconfigは？ 最初にgameAreaを「hidden」にしておく
document.addEventListener('DOMContentLoaded', (event) => {

    setWordPairAndLengths(0);
    setInitialGameState();

    makeWordPairTiles();
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
