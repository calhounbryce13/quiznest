'use strict';

//! need to refresh the page in order to delete after deleting a card !
//! empty set message doesn't show consistently !


document.addEventListener('DOMContentLoaded', ()=>{

    init_storage();

    check_window_size();

    listen_for_resize();

    feedback_functionality();

    form_functionality();

    flashcard_generation();

    clear_flashcards_functionality();

    card_flip_functionality();

    delete_card_functionality(); //todo


});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const show_feedback_form = function(){
    document.getElementById('feedback').addEventListener('click', () => {
        const backdrop = Array.from(document.getElementsByClassName('backdrop'))[0];
        backdrop.classList.add('backdrop-show');
        const form = Array.from(document.getElementsByClassName('feedback-form'))[0];
        form.classList.add('feedback-show');
    });

}

const actually_close_the_feedback_form = function(){
    const form = Array.from(document.getElementsByClassName('feedback-form'))[0];
    const fieldset = form.children[1].children[0].children[0];
    fieldset.value = '';
    form.classList.remove('feedback-show');
    const backdrop = Array.from(document.getElementsByClassName('backdrop'))[0];
    backdrop.classList.remove('backdrop-show');
}

const close_feedback_form = function(){
    document.getElementById('close-feedback').addEventListener('click', actually_close_the_feedback_form);
}

const submit_feedback = function(){
    const form = Array.from(document.getElementsByName('form-for-feedback'))[0];
    form.addEventListener('submit', async(event) => {
        event.preventDefault();
        const input = event.target.children[0].children[0];
        if((input.value).trim() != ''){
            try{
                const response = await fetch('https://calhounbryce13-backend.onrender.com/mailer', {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify({
                        'message': input.value
                    })
                })
                switch(response.status){
                    case 200:
                        window.alert("Success ! Thanks for the message.");
                        actually_close_the_feedback_form();
                        return;
                    case 400:
                        window.alert("Sorry :/ it looks like there was an issue with that request, please try agian tho");
                        return;
                    case 500:
                        window.alert("Sorry :/ it looks like there was an isse communicating with the database, please try again tho");
                        return;
                    default:
                        window.alert("Sorry :/ an unexpected issue occured, please try again");
                        return;
                }
            }catch(error){
                console.log(error);
                window.alert("There was an error sending the request, please try again");
                return;
            }
        }
        window.alert("please add text to the feedback form before you submit");
        return;
    })
}



const feedback_functionality = function(){
    show_feedback_form();
    close_feedback_form();
    submit_feedback();

}


const container_styling = function(iconContainerId){
    const container = document.createElement('div');
    container.classList.add('container');
    container.style.flexDirection = 'column';
    container.style.padding = '5vh';
    container.style.borderRadius = '20px';
    container.style.border = '2px solid var(--deep-orange)';
    container.style.backgroundColor = 'var(--soft-teal)';
    add_icon(container, iconContainerId);

    return container;
}

const add_icon = function(parent, iconContainerId){
    let container = document.createElement('div');
    container.classList.add('container', 'icon-container');
    container.id = iconContainerId;
    parent.appendChild(container);

}
const system_message = function(message, parentContainerId, iconContainerId){
    const body = document.getElementById(parentContainerId);
    let temp = [];
    while(body.children.length > 0){
        temp.push(body.lastChild);
        body.removeChild(body.lastChild);
    }
    const text = document.createElement('p');
    text.style.fontSize = '200%';
    text.textContent = message;

    const container = container_styling(iconContainerId);
    container.appendChild(text);

    body.appendChild(container);

    setTimeout(()=>{
        body.removeChild(body.lastChild);
        for(let i = (temp.length - 1); i >= 0; i--){
            body.appendChild(temp[i]);
        }
    }, (message.length) * 90)

}


const empty_container = function(quizContainer){
    while(quizContainer.children.length > 0){
        quizContainer.removeChild(quizContainer.lastChild);
    }
}

/**************************************************************************/
/**************************************************************************/
/**************************************************************************/

const compare_responses = function(user, actual){
    if(user === actual){
        return 1;
    }
    return 0;
}

const build_question_container_for_quiz = function(index){
    const questionText = document.createElement('p');
    questionText.textContent = Array.from(JSON.parse(localStorage.getItem("Quiznest")).questions)[index];
    console.log(questionText.textContent);
    questionText.classList.add('quiz-question');

    const questionContainer = document.createElement('div');
    questionContainer.classList.add('container');
    questionContainer.id = 'quiz-question-container';

    questionContainer.appendChild(questionText);

    return questionContainer;
}

const validate_quiz_input = function(inputBox, index){
    if(inputBox.value != ''){
        const userAnswer = (inputBox.value).toLowerCase();
        inputBox.value = '';
        const actualAnswer = (Array.from(JSON.parse(localStorage.getItem("Quiznest")).answers)[index]).toLowerCase();
        let res = compare_responses(userAnswer, actualAnswer);
        return res;
    }
    else{
        system_message("you need to enter an answer in the text field", 'quiz', 'error');
    }
}

const ui_response = function(res){
    if(res == 1){
        system_message("correct", 'quiz', 'correct');
    }
    else{
        system_message("incorrect", 'quiz', 'incorrect');
    }
}

const generate_question_form = function(quizContainer, index){

    if(index >= Array.from(JSON.parse(localStorage.getItem('Quiznest')).questions).length){
        return;
    }

    const questionContainer = build_question_container_for_quiz(index);

    const inputBox = document.createElement('input');
    inputBox.classList.add('quiz-answer-input')
    inputBox.type = 'text';
    inputBox.placeholder = 'your answer';
    inputBox.style.minWidth = '15vw';

    const submitButton = document.createElement('button');
    submitButton.textContent = 'submit';
    submitButton.classList.add('submit-quiz-answer');

    const answerContainer = document.createElement('div');
    answerContainer.style.minWidth = '30vw';
    answerContainer.style.padding = '1vw';

    answerContainer.classList.add('container', 'quiz-form-container');

    answerContainer.appendChild(inputBox);
    answerContainer.appendChild(submitButton);

    const parent = document.createElement('div');
    parent.appendChild(questionContainer);
    parent.appendChild(answerContainer);
    parent.classList.add('container', 'quiz-flashcard-container');

    quizContainer.appendChild(parent);

    submitButton.addEventListener('click', ()=>{
        let res = validate_quiz_input(inputBox, index);
        ui_response(res);

        while(quizContainer.children.length > 0){
            quizContainer.removeChild(quizContainer.lastChild);
        }

        setTimeout(()=>{
            generate_question_form(quizContainer, index + 1);
        }, 3000);

    });
}

const quiz_session = function(quizContainer){
    let x = 0;
    generate_question_form(quizContainer, x);
    
}

const quiz_initalization = function(){
    const quizButton = document.getElementById('start-quiz-button');
    const quizContainer = document.getElementById('quiz');
    if(quizButton && quizContainer){
        quizButton.addEventListener('click', ()=>{
            system_message("This feature is not yet avaiable, check back later", "quiz", "error");
            //empty_container(quizContainer);
            //quiz_session(quizContainer);
            //show_results();
        });
    }
}


/**************************************************************************/
/**************************************************************************/
/**************************************************************************/
const listen_for_resize = function(){
    window.addEventListener('resize', ()=>{
        check_window_size();
    });
}

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
    console.log("\nhere\n");
    const parent = document.getElementById('flashCards');
    console.log("\nparent:", parent);

    while(parent.children.length > 0){

        console.log("\nremoving child: ", parent.lastChild)
        parent.removeChild(parent.lastChild);
    }
}

const attach_event_listener = function(myButtons){
    for(let i = 0; i < myButtons.length; i++){
        myButtons[i].addEventListener('click', ()=>{
            if(confirm("are you sure you want to permanently delete this flashcard?")){
                let userAnswers = JSON.parse(localStorage.getItem("Quiznest")).answers;
                let userQuestions = JSON.parse(localStorage.getItem("Quiznest")).questions;
                userAnswers.splice(i, 1);
                userQuestions.splice(i, 1);
                set_user_data(userAnswers, userQuestions);
                window.location.reload();
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
        stylesheetLink.setAttribute('href', 'style/main-mobile.css');
    }
    else{
        stylesheetLink.setAttribute('href', 'style/main-desktop.css');
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

const build_quiz_button_container = function(){
    const anchor = document.createElement('a');
    anchor.id = 'quiz-button';
    anchor.href = 'quiz.html';

    const container = document.createElement('div');
    container.id = 'quiz-button-container';
    container.appendChild(anchor);

    return container;
}

//! uncomment this
const populate_flashcard_view = function(questions, answers){
    let numCards = answers.length;
    const flashCards = document.getElementById('flashCards');
    console.log(numCards);
    for(let i = 0; i < numCards; i++){
        if(i == 0){
            //!const quizContainer = build_quiz_button_container();
            //!flashCards.append(quizContainer);
        }
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
            if(confirm("Are you sure you want to permanently clear your current set of flashcards?")){
                localStorage.clear();
                window.location.reload();
            }
        })
    }
}

const clear_placeholder_text = function(){
    const inputs = Array.from(document.getElementsByClassName('flash-card-input'));
    if(inputs){
        for(let i = 0; i < inputs.length; i++){
            inputs[i].addEventListener('click', (event)=>{
                event.target.placeholder = "";
            });
        }
    }
}

const dynamic_textarea_height = function(){
    if(document.getElementsByTagName('textarea')){
        Array.from(document.getElementsByTagName('textarea')).forEach((singleTextarea) => {
            singleTextarea.style.height = 'auto';
            singleTextarea.style.height = singleTextarea.scrollHeight + 'px';
            singleTextarea.addEventListener('input', () => {
                singleTextarea.style.height = 'auto';
                singleTextarea.style.height = singleTextarea.scrollHeight + 'px';
            });
        })
    }
}

const form_functionality = function(){
    dynamic_textarea_height();

    const myform = document.getElementById('myForm');
    const addmore = document.getElementById('addMore');
    if(addmore && myform){
        addmore.addEventListener('click', add_new_row);
        clear_placeholder_text();
        myform.addEventListener('submit', (event)=>{
            event.preventDefault();
            const inputs = Array.from(document.getElementsByTagName('textarea'));
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
        const newInput = document.createElement('textarea');
        newInput.classList.add('flash-card-input');
        newInput.setAttribute("type","text");
        newContainer.appendChild(newInput);
    }
    const myFieldset = Array.from(document.getElementsByTagName('fieldset'))[0];
    myFieldset.appendChild(newContainer);
    dynamic_textarea_height();
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
    messageText.style.textAlign = 'center';
    messageText.classList.add('empty-text');
    messageText.innerText = 'No flashcards made :( \n go back to the form page to add flashcards to your set!';

    let messageContainer = document.createElement('div');
    messageContainer.classList.add('empty-container');
    messageContainer.appendChild(messageText);

    flashCards.appendChild(messageContainer);
    
}
