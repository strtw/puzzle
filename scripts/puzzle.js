/**
 * Created by stu on 5/8/17.
 */
(function puzzle(){
    'use strict';
    var puzzleColumns = document.querySelectorAll('.puzzle__board .col');
    var drawerColumns = document.querySelectorAll('.puzzle__drawer .col');
    var pieces = document.querySelectorAll('.puzzle__image');
    var puzzleGrid = document.querySelectorAll('.puzzle__grid')[0];
    var startButton = document.getElementsByClassName("puzzle__start")[0];
    var shuffledPieces;
    var hintButton = document.getElementsByClassName("puzzle__hint")[0];
    var puzzleBoard = document.getElementsByClassName("puzzle__board")[0];
    var resetButton = document.getElementsByClassName("puzzle__resetButton")[0];
    var timeOffset;
    var gameRunning = false;
    var clock = document.getElementById("puzzle__timer");
    var minutesSpan = clock.querySelector('.puzzle__minutes-data');
    var secondsSpan = clock.querySelector('.puzzle__seconds-data');
    var minuteLength = "6";
    var secondLength = "60";
    var timerLengthMilliSeconds = 6 * 60 * 1000;
    var advancedMode = document.querySelector(".toggle__toggleInput");
    var resetButtonClicked;
    var hintData = document.querySelector(".puzzle__hints");
    var hintCount = 3;
    var advancedModeState = document.querySelector(".toggle__label");
    // ======= TIMER FUNCTIONALITY ====== //

    //modified from: http://codepen.io/SitePoint/pen/MwNPVq

    // parses a
    // date string  and returns the number of milliseconds between the date
    // string and midnight of January 1, 1970.


    function getTimeRemaining(endtime) {
        var currentTime =  Date.parse(new Date()); //convert date object to milliseconds
        var endTime = Date.parse(endtime); // on a time line, endtime is ahead of
        // current time.
        var timeRemaining =  endTime - currentTime; //currentTime catches up to
        // endTime because endTime is ahead on time line so timeRemaining shrinks.
        var seconds = Math.floor((timeRemaining / 1000) % 60);//converts
        // milliseconds to seconds
        var minutes = Math.floor((timeRemaining / 1000 / 60) % 60);

        return {
            'total':timeRemaining,
            'min': minutes,
            'sec': seconds
        };
    }

    function initializeClock(id, endtime) {
        var gameOver = new Audio('audio/gameover.wav');
        gameRunning = true;

        function updateClock() {
            var timeRemaining = getTimeRemaining(endtime);//updates timeRemaining

            minutesSpan.innerHTML = "" + timeRemaining.min;//""+ converts
            // timeRemaining.min to string.
            secondsSpan.innerHTML = ('0' + timeRemaining.sec).slice(-2);

            if (timeRemaining.total <= 0) { //timeRemaining total
                // approaches
                // zero as time passes and updateClock is repeatedly executed.
                gameRunning = false;
                gameOver.play();
                clearInterval(timeInterval);//stop the updateClock loop
                resetGame();
            }else if(resetButtonClicked === true){
                gameRunning = false;
                clearInterval(timeInterval);//stop the updateClock loop
                resetGame();
            }

        }

        updateClock(); //updateClock is called which sets function loop.

        var timeInterval = setInterval(updateClock, 1000); //must set to value
        // for clearInterval to work.
    }

    //========= Drag and Drop Functionality ============//

    function dragStart(ev) {
        ev.dataTransfer.setData("text", ev.target.id);
    }

    function dragEnter(ev) {
        ev.preventDefault();
    }

    function dragOver(ev){
        ev.preventDefault();
    }


    function drop(ev) {
        var data = ev.dataTransfer.getData("text");
        if(ev.target.tagName === "DIV"){
            ev.target.appendChild(document.getElementById(data));
        }
        ev.preventDefault();
    }


    [].forEach.call(puzzleColumns,function(col) {
        col.addEventListener('dragenter',dragEnter);
        col.addEventListener('drop',drop);
        col.addEventListener('dragover',dragOver);
    });


    [].forEach.call(pieces,function(pieces){
        pieces.addEventListener('dragstart', dragStart, false);
    });



    //========== SHUFFLE AND MOVE PIECES OFF BOARD ===========//


    function shiftPieces(){
        puzzleGrid.classList.add("puzzle__shiftPieces");
    }

    function removePiecesFromPuzzle(){
        for(var i = 0; i < puzzleColumns.length;i++){
            if(pieces[i].hasChildNodes()){
                puzzleColumns[i].removeChild(pieces[i]);
            }
        }
        puzzleGrid.classList.remove("puzzle__shiftPieces");
    }

    shuffledPieces = (function randomDOMList(DOMlist){// randomly reordered DOM List
        var shuffled = [];
        var temp = [];
        var randomNum = 0;
        for(var a = 0; a < DOMlist.length; a++){
            temp[a] = pieces[a];
        }

        for(var l = 0 ; l < DOMlist.length; l++){
            randomNum = (function (min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            })(0,temp.length-1);

            shuffled[l] = temp[randomNum];
            temp.splice(randomNum,1)
        }
        return shuffled;
    })(pieces);


    function addPiecesToGrid(array,columnType){
        for(var j = 0; j < pieces.length;j++){
            columnType[j].appendChild(array[j]);
        }
    }


    startButton.addEventListener("click",function(ev){
        resetButtonClicked = false;
        if(gameRunning === false){
            timeOffset = new Date(Date.parse(new Date()) + timerLengthMilliSeconds);
            shiftPieces();
            initializeClock('puzzle__timer', timeOffset);
            setTimeout(function(){ //wait for pieces to drop off the board
                removePiecesFromPuzzle();
                addPiecesToGrid(shuffledPieces,drawerColumns);
                checkPuzzleInterval();
                shakePiecesWhenSolved();
            },1000);
            ev.stopPropagation();
        }

    });


    //==== CHECK PUZZLE COMPLETION ==== //


    function checkPuzzleCompletion(){
        var puzzleComplete = true;
        var dropId;
        var solveAttempt =  true;
        var puzzleID;
        for(var i = 0; i <puzzleColumns.length; i++){
            if(!puzzleColumns[i].hasChildNodes()){
                solveAttempt = false;
                puzzleComplete = false;
            }
        }
        if(solveAttempt){
            for(var j = 0; j <puzzleColumns.length; j++){
                puzzleID = pieces[j].getAttribute("id");
                dropId = puzzleColumns[j].getAttribute("data-piece");
                if(dropId !== puzzleID ){
                    puzzleComplete = false;
                }
            }
        }
        return puzzleComplete;
    }

    function shakePiecesWhenSolved(){
        if(checkPuzzleCompletion()){
            setTimeout(shakeAllPieces,3000);
        }
    }


    function checkPuzzleInterval(){
        var checkLoop = setInterval(checkPuzzleCompletion,2000);
        if(checkPuzzleCompletion()){
            clearInterval(checkLoop);
            return false;
        }
    }
    //====PUZZLE WIN ANIMATION====//

    function shakePiece(img){
        var count = 0;
        var animatePiece = setInterval(movePiece,80);

        function movePiece(){
           var randomNum = (function (min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            })(-5,5);
            img.style.transform = "translate("+ randomNum + "px,"+ randomNum + "px)";
            count++;
            if(count >=25){
                clearInterval(animatePiece);
                img.style.transform = "translate("+ 0 + "px,"+ 0 + "px)";

            }
        }
    }

    function shakeAllPieces(){
        for(var i=0; i<pieces.length; i++) {
            shakePiece(pieces[i]);
        }
    }



    //===== HINT FUNCTIONALITY =======//






    function hintMouseDown(){
        if(gameRunning){
            if(hintCount > 0){
                hintCount--;
                if(hintCount >=0){
                    puzzleBoard.classList.remove('puzzle__backgroundImage-unSolved');
                    puzzleBoard.classList.add('puzzle__backgroundImage-solved');
                    hintData.innerHTML = "" + hintCount;
                }
            }
        }
    }

    hintButton.addEventListener("mousedown",hintMouseDown);

    hintButton.addEventListener("mouseup",function(){
        puzzleBoard.classList.remove('puzzle__backgroundImage-solved');
        puzzleBoard.classList.add('puzzle__backgroundImage-unSolved');
    });


    // ===== RESET GAME ===== //

    function resetGame(){
        removePiecesFromPuzzle();
        addPiecesToGrid(pieces,puzzleColumns);

        minutesSpan.innerHTML = minuteLength;
        // timeRemaining.min to string.
        secondsSpan.innerHTML = "00";
        if(advancedMode.checked){
            hintCount = 0;
        }else{
            hintCount = 3;
        }
        hintData.innerHTML = hintCount;
        puzzleGrid.classList.add("puzzle__resetStage");
        setTimeout(function(){
            puzzleGrid.classList.remove("puzzle__resetStage");
            puzzleGrid.classList.add("puzzle__shiftPiecesUp");
            setTimeout(function(){
                puzzleGrid.classList.remove("puzzle__shiftPiecesUp");
            },500)
        },500);
    }

    resetButton.addEventListener("click",function(){
        resetButtonClicked = true;
        resetGame();
        //timeOffset = new Date(Date.parse(new Date()) + timerLengthMilliSeconds);
        // initializeClock('puzzle__timer', timeOffset);
    });

    //====== TOGGLE ADVANCED MODE ===== //

    advancedMode.addEventListener("change",function(){
        if(gameRunning===false){ //game is running
            if(this.checked){
                minuteLength = "3";
                timerLengthMilliSeconds = minuteLength * 60 * 1000;
                minutesSpan.innerHTML = minuteLength;
                secondsSpan.innerHTML = "00";
                hintButton.removeEventListener("mousedown",hintMouseDown)
                hintCount = 0;
                hintData.innerHTML = hintCount;
            }else {
                minuteLength = "6";
                timerLengthMilliSeconds = minuteLength * 60 * 1000;
                minutesSpan.innerHTML = minuteLength;
                hintButton.addEventListener("mousedown",hintMouseDown)
                minutesSpan.innerHTML = minuteLength;
                hintCount = 3;
                hintData.innerHTML = hintCount;
            }
        }
    });

    advancedModeState.addEventListener("click",function(){
        if(gameRunning===false){
            advancedModeState.setAttribute("for","slide-1")//activates toggle
        }
        else{
            advancedModeState.setAttribute("for","");//deactivates toggle
        }
    });
})();

//FIXME Pressing reset after starting the game initiates shaking of images
// in loop
