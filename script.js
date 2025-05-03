'use strict';


document.addEventListener('DOMContentLoaded', ()=>{

    check_window_size();
    window.addEventListener('resize', ()=>{
        check_window_size();
    });

    clear_flashcards_functionality();

    form_functionality();

    flashcard_generation();

});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const check_window_size = function(){
    const windowWidth = document.documentElement.clientWidth;
    const stylesheetLink = document.getElementById('styles');
    if(windowWidth < 900){
        stylesheetLink.setAttribute('href', 'main-mobile.css');
    }
    else{
        stylesheetLink.setAttribute('href', 'main-desktop.css');
    }
}


const flashcard_generation = function(){
    if(window.location.pathname.endsWith('/userhome.html')){
        let answers = JSON.parse(localStorage.getItem('answers'));
        let questions = JSON.parse(localStorage.getItem('questions'));
        if(!answers){
            display_empty_message();
        }
        else{
            populate_flashcard_view(questions, answers);
        }
    }
}


const populate_flashcard_view = function(questions, answers){
    let numCards = answers.length;
    const flashCards = document.getElementById('flashCards');
    for(let i = 0; i < numCards; i++){
        if(answers[i] != ""){
            const newFlashcard = make_flashcard(questions, answers, i);
            flashCards.appendChild(newFlashcard);
        }
    }
}


const make_flashcard = function(questions, answers, i){
    let newFront = create_card_face(questions, i, true);
    let newBack = create_card_face(answers, i, false);
    let newContent = create_card_content(newFront, newBack);

    let newFlashcard = document.createElement('div');
    newFlashcard.classList.add('flashcard');
    newFlashcard.appendChild(newContent);

    return newFlashcard;
}


const create_card_content = function(newFront, newBack){
    let newContent = document.createElement('div');
    newContent.classList.add('content');
    newContent.appendChild(newFront);
    newContent.appendChild(newBack);

    return newContent;
}

const create_card_face = function(array, counter, boolean){
    let text = document.createElement('p');
    text.innerText = array[counter];
    let newFace = document.createElement('div');
    if(boolean){
        newFace.classList.add('front');
    }
    else{
        newFace.classList.add('back');
    }
    newFace.style.textAlign = 'center';
    newFace.appendChild(text);

    return newFace;
}

const clear_flashcards_functionality = function(){
    const clearButton = document.getElementById('clearData');
    if(clearButton){
        clearButton.addEventListener('click', ()=>{
            localStorage.clear();
            window.location.reload();
        })
    }
}

const form_functionality = function(){
    const myform = document.getElementById('myForm');
    const addmore = document.getElementById('addMore');
    if(addmore && myform){
        addmore.addEventListener('click', add_new_row);

        myform.addEventListener('submit', (event)=>{
            event.preventDefault();
            const inputs = Array.from(document.getElementsByTagName('input'));
            const numInputs = inputs.length;
            if(inputs[1].value != ""){
                store_info(inputs, numInputs);
            }
            window.location.href = 'userhome.html';
        });
    }

}

const add_new_row = function(){
    const newContainer = document.createElement('div');
    newContainer.classList.add('inputContainer');
    for(let i = 0; i < 2; i++){
        const newInput = document.createElement('input');
        newInput.setAttribute("type","text");
        newContainer.appendChild(newInput);
    }
    const myFieldset = Array.from(document.getElementsByTagName('fieldset'))[0];
    myFieldset.appendChild(newContainer);
}

const store_info = function(inputs, numInputs){
    let questions = [];
    let answers = [];
    if(localStorage.getItem('answers')){
        if(localStorage.getItem('answers')[0] != ''){
            questions = JSON.parse(localStorage.getItem('questions'));
            answers = JSON.parse(localStorage.getItem('answers'));
        }
    }
    for(let i = 0; i < numInputs; i++){
        if(i % 2 == 0){
            questions.push(inputs[i].value);
        }
        else{
            answers.push(inputs[i].value);
        }
    }
    localStorage.setItem("questions", JSON.stringify(questions));
    localStorage.setItem("answers", JSON.stringify(answers));
}

const display_empty_message = function(){
    console.log("here")
    const flashCards = document.getElementById('flashCards');

    let messageText = document.createElement('p');
    messageText.style.textAlign = 'center'
    messageText.innerText = 'No flashcards made :( \n go back to the form page to add flashcards to your set!';

    let messageContainer = document.createElement('div');
    messageContainer.appendChild(messageText);

    flashCards.appendChild(messageContainer);
    
}
