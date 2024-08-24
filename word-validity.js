import { wordList } from './words.js';
import { wordPair } from './script.js';

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
export function isTotallyValid(word, word2) {

    //INPUT IS VALID WORD LENGTH ✅
    function isValidLength(word) {
        if (word.length === 0) {
            alert("Don't be shy, have a try.");
            return false;
        }
        if (word.length < wordPair.minLength) {
            alert("Minimum length is " + wordPair.minLength + " letters.");
            return false;
        }
        if (word.length > wordPair.maxLength) {
            alert("Maximum length is " + wordPair.maxLength + " letters.");
            return false;
        }
        return true;
    }

    //IS IS IN EITHER WORDLIST OR ONE OF THE STARTING PAIR ❓❓startWordとendWordおけ❓❓
    function isInWordListOrWordPair(word) {
        let length = word.length;
        if ((word === wordPair.startWord) || (word === wordPair.endWord)) {
            return true;
        } else if (wordList[length] && wordList[length].has(word)) {
            return true;
        } else {
            alert("That's not even a word!");
            return false;
        }
    };

    console.log(wordPair.startWord);


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
    return true;
}
