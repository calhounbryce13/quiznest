'use strict';

//! why do i need to refresh the page in order to delete after deleting a card?


document.addEventListener('DOMContentLoaded', ()=>{

    init_storage();

    check_window_size();
    window.addEventListener('resize', ()=>{
        check_window_size();
    });

    clear_flashcards_functionality();

    form_functionality();

    flashcard_generation();

    card_flip_functionality();

    delete_card_functionality();

});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const init_storage = function(){
    if(!localStorage.getItem("Quiznest")){
        localStorage.setItem("Quiznest", JSON.stringify({}));
    }
}
const set_user_data = function(answers, questions){
    let userData = {
        "questions": questions,
        "answers": answers
    }
    localStorage.setItem("Quiznest", JSON.stringify(userData));
}

const clear_screen = function(){
    const parent = document.getElementById('flashCards');
    while(parent.children.length > 0){
        parent.removeChild(parent.lastChild);
    }
}

const attach_event_listener = function(myButtons){
    for(let i = 0; i < myButtons.length; i++){
        myButtons[i].addEventListener('click', ()=>{
            let userAnswers = JSON.parse(localStorage.getItem("Quiznest")).answers;
            let userQuestions = JSON.parse(localStorage.getItem("Quiznest")).questions;
            userAnswers.splice(i, 1);
            userQuestions.splice(i, 1);
            set_user_data(userAnswers, userQuestions);
            clear_screen();
            if(userAnswers.length == 0){
                display_empty_message();
            }
            else{
                flashcard_generation();
            }

            

        });
    }
}

const delete_card_functionality = function(){
    const myButtons = Array.from(document.getElementsByClassName('delete-button'));
    if(myButtons){
        attach_event_listener(myButtons);
    }
}



const card_flip_functionality = function(){
    const cards = Array.from(document.querySelectorAll('.flashcard'));
    for(let i = 0; i < cards.length; i++){
        cards[i].addEventListener('click', (event)=>{
            event.currentTarget.classList.toggle('flip');
        });
    }

}

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
        let userAnswers = JSON.parse(localStorage.getItem('Quiznest')).answers;
        let userQuestions = JSON.parse(localStorage.getItem('Quiznest')).questions;
        if(!userAnswers){
            display_empty_message();
        }
        else{
            populate_flashcard_view(userQuestions, userAnswers);
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
    let delteOption = create_delete_container();

    let newFlashcard = document.createElement('div');
    newFlashcard.classList.add('flashcard');
    newFlashcard.appendChild(delteOption);
    newFlashcard.appendChild(newContent);

    return newFlashcard;
}

const create_delete_container = function(){
    let button = document.createElement('button');
    button.classList.add('delete-button');
    let container = document.createElement('div');
    container.classList.add('delete-container');
    container.appendChild(button);

    return container;
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
            console.log(JSON.parse(localStorage.getItem('Quiznest')))
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
    //console.log(JSON.parse(localStorage.getItem('Quiznest')))
    if(JSON.parse(localStorage.getItem('Quiznest')).answers){
        if((JSON.parse(localStorage.getItem('Quiznest')).answers)[0] != ""){
            questions = JSON.parse(localStorage.getItem('Quiznest')).questions;
            answers = JSON.parse(localStorage.getItem('Quiznest')).answers;
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
    set_user_data(answers, questions);
}

const display_empty_message = function(){
    
    const flashCards = document.getElementById('flashCards');

    let messageText = document.createElement('p');
    messageText.style.textAlign = 'center'
    messageText.innerText = 'No flashcards made :( \n go back to the form page to add flashcards to your set!';

    let messageContainer = document.createElement('div');
    messageContainer.appendChild(messageText);

    flashCards.appendChild(messageContainer);
    
}
