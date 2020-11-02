(function(){

/*************** DOM NODES & VARIABLES *****************/

// how to cache dom references?
const maxQuestions = document.querySelector('#js-max-questions');
const currentQuestion = document.querySelector('#js-current-question')

const startTrainingButton = document.querySelector('#js-startTraining')
const replayButton = document.querySelector('#js-replay')
const quitButton = document.querySelector('#js-quit')

const selectCustom = document.querySelector('#js-select-custom')

const resultsDisplay = document.querySelector('#js-results-display')
const resultsText = document.querySelector('#js-results-text')

const reviewWrongAnswersQuestion = document.querySelector('#js-review-wrong-answers-question')
const yesReviewWrongAnswersButton = document.querySelector('#js-review-button-yes')
const noReviewWrongAnswersButton = document.querySelector('#js-review-button-no')

// the audio files
const notes = document.querySelectorAll(`[data-key]`)

let intervalSequences = []
let questionNumber = 0;

let userAlreadyChoseAnOption = false;
let gameOn = false;

/*************** FUNCTIONS *****************/

function populateCopyrightYear(){
    const copyrightYear = document.querySelector('#js-copyright-year');
    const date = new Date()
    const year = date.getFullYear() 

    copyrightYear.textContent = year;
}

function setUpProgressBar(questionsShowing) {
    const progressBarNotes = document.querySelectorAll('.progress-bar-note')

    //! TODO: can the numer 10 not be hard coded!
    for (let i = 0; i < 10; i++){
        // in case any notes were showing from a previous round
        progressBarNotes[i].classList.remove('opaque')
         progressBarNotes[i].classList.remove('partially-opaque')
   }

    for (let i = 0; i < questionsShowing; i++){
        progressBarNotes[i].classList.add('partially-opaque')
    }
}

function toggleButtonDisabledAttribute(btn, bool){
    btn.disabled = bool;
}

function resetOptionBorderColors(){
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.classList.remove('correct')
        option.classList.remove('incorrect')
    })
}


function playNotes(arr, firstNote, secondNote){
    arr[firstNote].play();
    setTimeout(() => arr[secondNote].play(), 1300)
}


// ensure that we only work within the range of an octave (no 12th's, for example)
function getOctaveBounds(arr){
    // get a random index from the passed in array
    let index =  Math.floor(Math.random() * arr.length + 1)

    let upper;
    let lower;

    // from the index, we can get the upper and lower bounds of our octave
    if(index + 12 >= arr.length){
        upper = index;
        lower = index - 12;
    }else if(index - 12 < 0){
        lower = index;
        upper = index + 12
    }else {
        lower = index 
        upper = index + 12
    }
    
    return {
        upper,
        lower
    }
   
}

// get a random note somewhere within the bounds of the octave that was chosen in the getOctaveBounds function
function getRandomNote(arr, bounds){
   // because the slice method will not work on a node list.
   const notesArray = Array.from(arr)

   // slice an octave out of the array of notes
    let octave = notesArray.slice(bounds.lower, (bounds.upper + 1))
    //console.log(octave)
   
    // get a random note from our octave 
    return Math.floor(Math.random() * octave.length + 1)
}


//! make this 10 questions eventually
// add (num) arrays of intervals to the global intervalSequences array
function generateIntervals(numQuestions = 3){
    for(let i = 0; i < numQuestions; i++){
        let octaveBounds = getOctaveBounds(notes)
   
    // the array that will hold the first note and second note
        let intervalSequence = []

        const firstNoteIndex = getRandomNote(notes, octaveBounds)
        intervalSequence.push(firstNoteIndex)
    
        let secondNoteIndex = firstNoteIndex;

        // make sure the two notes are different
        while(secondNoteIndex === firstNoteIndex){
        secondNoteIndex = getRandomNote(notes, octaveBounds)
        }

        intervalSequence.push(secondNoteIndex)

        // add the sequence to the array of all sequences played in this round
        intervalSequences.push(intervalSequence)
    }
   
}

function handleUserGuess(e){
    const selectedOption = selectCustom.selectedIndex;
    const guess =  e.target.value
    
    
    const lastSequencePlayed = intervalSequences[questionNumber - 1]
    const answer = Math.abs(lastSequencePlayed[0] - lastSequencePlayed[1]);
   
    if(guess == answer){
       intervalSequences[questionNumber - 1].splice(2, 1, 'correct')
       selectCustom[selectedOption].classList.add('correct')
       
    }else {
        intervalSequences[questionNumber - 1].splice(2, 1, 'incorrect')
        selectCustom[selectedOption].classList.add('incorrect')
        selectCustom[answer -1].classList.add('correct')
    }
}

// returns how many questions the user got right
function getQuizScore(){
    const numCorrect = intervalSequences.filter(value => value[2] === 'correct').length;
    return numCorrect;
}


function showEndOfGameResults(){
    //! TODO: should I make a modal to display the results??
    toggleButtonDisabledAttribute(startTrainingButton, true)

    const numCorrect = getQuizScore();

     if(numCorrect < intervalSequences.length){
         const percent =  Math.round((numCorrect / intervalSequences.length) * 100);

        resultsDisplay.style.display = 'block'
        resultsText.textContent = `Score: ${percent}%`
        reviewWrongAnswersQuestion.style.display = 'block'
    }else {
        resultsDisplay.style.display = 'block'
        reviewWrongAnswersQuestion.style.display = 'none'
        
        //! TODO: make this look nice
        resultsText.textContent = `Score: 100% Congratulations!`
        resultsText.style.textAlign = 'center'
    }
}

// resets global variables & DOM node styles
function resetAllGameValues(intervalsArray = [], maxNumQuestions){
    intervalSequences = intervalsArray;
    resetOptionBorderColors();
    toggleButtonDisabledAttribute(replayButton, true)
    toggleButtonDisabledAttribute(quitButton, true)
    startTrainingButton.textContent = 'Begin'
    resultsDisplay.style.display = 'none;'
    resultsText.textContent = '';
    reviewWrongAnswersQuestion.style.display = 'none'

    currentQuestion.textContent = 0;
    maxQuestions.textContent = maxNumQuestions || 3

    questionNumber = 0;
    userAlreadyChoseAnOption = false;
    gameOn = false;
}

function runOnClick(e){
    // Don't allow the user to select an interval if the game hasn't started
    if(!gameOn) return

    // Only allow the user to click once
    if(userAlreadyChoseAnOption) return;
       
    userAlreadyChoseAnOption = true;

    resetOptionBorderColors();

    handleUserGuess(e)

   if(questionNumber === intervalSequences.length){
       toggleButtonDisabledAttribute(startTrainingButton, true);
       showEndOfGameResults()
       toggleButtonDisabledAttribute(replayButton, true)
       return;
   }

   setTimeout(() => toggleButtonDisabledAttribute(startTrainingButton, false), 1000)
    
    toggleButtonDisabledAttribute(replayButton, true)
}

function focusNextOption(){
    console.log(selectCustom.options)
    const options = Array.from(selectCustom.querySelectorAll('.option'));
    options.forEach(option => {
        option.classList.remove('option-focused')
    })

    const selectedOption = selectCustom.options[selectCustom.selectedIndex]
   
    
    // this is here because I cannot seem to call .focus() on the selected option
     selectedOption.classList.add('option-focused')
}


// TODO: add more notes in html???
// TODO: go through every file and delete comments to myself and unused styles
// TODO: UI
// TODO: check over html, make sure I'm using semantic elements
// TODO: run everything through a validator
//TODO: credit getwaves.io and Tilda icons in readme

//! TODO: another select menu for mobile layouts?
//! TODO: do i need to add aria-disabled when i disable buttons????
//! TODO bug fix: when i tab to the first option, it chooses it as an option -> bind change to keypress???? or another listener for keypress?
// TODO: do the readme
// TODO: make github repo
// TODO: netlify

// TODO: stretch goals: ascending only, descending only, mixed direction, custom cursor, faster/slower, fixed root, number of questions, time the quiz, give average time per question, give score in percentage?

/*************** EVENT LISTENERS *****************/

startTrainingButton.addEventListener('click', function(e){
    // immediately disable the begin/next button, so the user can't keep clicking next without making an interval selection
    toggleButtonDisabledAttribute(startTrainingButton, true)

    // show the user what question number they're on
    currentQuestion.textContent = questionNumber + 1;

    // update the progress bar
    const progressBarNotes = document.querySelectorAll('.progress-bar-note')
    progressBarNotes[questionNumber].classList.add('opaque')

    gameOn = true;
    userAlreadyChoseAnOption = false;

    selectCustom.selectedIndex = -1;
    console.log('selected index after clicking begin/next:', selectCustom.selectedIndex)

    questionNumber += 1;
    
    resetOptionBorderColors();

    if(startTrainingButton.textContent === 'Begin') startTrainingButton.textContent = 'Next';

    // if it's a new game, get all of the sequences set up
    if(intervalSequences.length === 0)  generateIntervals();

    
    maxQuestions.textContent = intervalSequences.length;

    // get the notes and play the sequence
    const [firstNoteIndex, secondNoteIndex] = intervalSequences[questionNumber - 1]
    playNotes(notes, firstNoteIndex, secondNoteIndex) 

    // wait until the interval sequence is finished playing before allowing user to click replay or quit
    setTimeout(() => {
        if(replayButton.disabled) toggleButtonDisabledAttribute(replayButton, false)
        if(quitButton.disabled) toggleButtonDisabledAttribute(quitButton, false)
    }, 2000)
    
})

replayButton.addEventListener('click', function(){
    const lastSequencePlayed = intervalSequences[questionNumber - 1]
     playNotes(notes, ...lastSequencePlayed)
})

quitButton.addEventListener('click', function(){
    resetAllGameValues()
    setUpProgressBar(3);

    const options = Array.from(selectCustom.querySelectorAll('.option'));
    options.forEach(option => {
        option.classList.remove('option-focused')
    })

    // wait to toggle disabled on the Begin button, in case a sequence was in the middle of playing
    setTimeout(() => {
        toggleButtonDisabledAttribute(startTrainingButton, false)
    }, 1300)
})

// use keyup because it doesn't continue to fire if user holds the key down.
selectCustom.addEventListener('keyup', function(e){
    console.log('selected index when keyup is fired', this.selectedIndex)
    
    const space = 32;
    const enter = 13;
    const up = 38;
    const down = 40;
    
    switch (e.keyCode){
        case enter:
            runOnClick(e)
            const options = Array.from(selectCustom.querySelectorAll('.option'));
            options.forEach(option => {
                option.classList.remove('option-focused')
            })
            
            console.log('selectedIndex after clicking enter: ', this.selectedIndex)
            console.log(selectCustom.options)
           
            return

        case space:
            return;

        case down:
            console.log(selectCustom.selectedIndex)
            focusNextOption()
            return;

        case up:
            return;
        
        default:
            return
    }
})

selectCustom.addEventListener('click', runOnClick);

noReviewWrongAnswersButton.addEventListener('click', function() {
    resetAllGameValues()
    setUpProgressBar(3)
    toggleButtonDisabledAttribute(startTrainingButton, false)

    const options = Array.from(selectCustom.querySelectorAll('.option'));
    options.forEach(option => {
        option.classList.remove('option-focused')
    })
})


yesReviewWrongAnswersButton.addEventListener('click', function(){
    const wrongAnswers = intervalSequences.filter(value => value[2] === 'incorrect')
    resetAllGameValues(wrongAnswers, wrongAnswers.length)
    setUpProgressBar(wrongAnswers.length);
    toggleButtonDisabledAttribute(startTrainingButton, false)
})

populateCopyrightYear()
setUpProgressBar(3);

})()
