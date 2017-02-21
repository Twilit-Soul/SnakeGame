//FYI, I learned partway through this that using ' instead of " is usually
//just fine. It's more convenient so I started using it. That's why it's
//inconsistent. (were this something to publish, I'd fix it).

var side = 30;
var canDraw = true;
var snaker;
var snake = {direction:3, active:false, x:19, y:19, exists:false, paused:false};
snake.body = [];
snake.food = [];
var tbody;
var rows;
var cells;
var widthMulti;
var foody, foodx;
var score = 0;
var topText;
var hasTurned = false;
var highScore = 0;
var infinitySnakeScore = 0;
//var animSpeed = 1;
//var animState = []; 
var infinitySnake = false; //alternative game mode
var foodColor = "green", bodyColor = "purple", headColor = "red";
var isTouchSupported = 'ontouchstart' in window;

$(document).ready(function() { //initialization to hide touchButtons if needed
    if (!isTouchSupported) {
        $('.touchButton').hide();
	} else {
		$('.touchButton').width(100).height(100);
	}
});
 
//initialization function to insert cells into the table
function createCanvas ()
{
    widthMulti = 1.8;
    var tbody = document.getElementById( "tablebody" );
    topText = document.getElementById( "topText" );
    topText.colSpan = side * widthMulti;
  
    for ( var i = 0; i < side; i++ )
    {
       var row = document.createElement( "tr" );
       
       for ( var j = 0; j < side * widthMulti; j++ )
       {
          var cell = document.createElement( "td" );
          cell.onmousemove = processMouseMove;
          cell.className = "pixel";
          row.appendChild( cell );
       } // end for

       tbody.appendChild( row );
    } // end for
    checkCookie();
} // end function createCanvas
      
// processes the onmousemove event
function processMouseMove( e )
{   
    var ev = e;
    
    // get the event object from IE
    if ( !ev ) {
        ev = window.event;
    }
    if (canDraw) {
        // I thought it would be fun to make blue and red combine for purple.
        if ( ev.altKey ) {
            this.className = "pixel white";
        } else if ( ev.ctrlKey) {
            if (!ev.shiftKey) {
                this.className = "pixel " + "blue";
            } else {
                this.className = "pixel " + "purple";
            }
        } else if ( ev.shiftKey ){
           this.className = "pixel " + "red";
        }
    }
} // end function processMouseMove
 
function eraseAll() {
    colorFill("white");
}
 
function purpleFill() {
    if (canDraw) {
        colorFill("purple");
    }
}
 
function redFill() {
    if (canDraw) {
        colorFill("red");
    }
}
 
function blueFill() {
    if (canDraw) {
        colorFill("blue");
    }
}
 
function colorFill(color) {
    tbody = document.getElementById( "tablebody" );
    rows = tbody.getElementsByTagName( "tr" );
	var otherCells;
	
	for (var i = 0; i < rows.length; i++) {
		otherCells = rows[i].getElementsByTagName( "td" );
		for (var j = 0; j < otherCells.length; j++) {
			otherCells[j].className = "pixel " + color;
		}
	}
    $("#fillColors").css({"background-color": color});
    if (color == "white" || color == "yellow") {
        $("#fillColors").css({"color": "black"});
    } else {
        $("#fillColors").css({"color": "white"});
    }
}

function foodColorChange(color) {
    colorReplace(".food",foodColor,color);
    foodColor = color;
    $("#foodColors").css({"background-color": color});
}

function headColorChange(color) {
    colorReplace(".head",headColor,color);
    headColor = color;
    $("#headColors").css({"background-color": color});
}

function bodyColorChange(color) {
    colorReplace(".body",bodyColor,color);
    bodyColor = color;
    $("#bodyColors").css({"background-color": color});
}

function colorReplace(rClass,oldColor,newColor) {
    $(rClass+"."+oldColor).removeClass(oldColor).addClass(newColor);
}

function snakeMode(mode) {
    if (mode == "infinitySnake") {
        infinitySnake = true;
    } else {
        infinitySnake = false;
    }
    checkCookie();
}
 
function snakeIt() {
    if (snake.active && !snake.paused) {
        
        //move the snake
        if (snake.direction == 3
        && snake.x < (side * widthMulti) - 1) {
            snake.x++;
        } else if (snake.direction == 6
            && snake.y < side - 1) {
            snake.y++;
        } else if (snake.direction == 9
            && snake.x > 0) {
            snake.x--;
        } else if (snake.direction == 12
            && snake.y > 0) {
            snake.y--;
        } else {
            youLost("You crashed into a wall!");
        }
        
        //check for self-collision
        if (snake.exists && snake.active) {
            for (var i = 0; i < snake.body.length; i++) {
                if (snake.y == snake.body[i][0] &&
                    snake.x == snake.body[i][1]) {
                    if (!(infinitySnake && 
                        cells[snake.y][snake.x].style.backgroundColor == foodColor)) {
                        youLost("You crashed into yourself!");
                    }
                }
            }
        }
        
        if (snake.exists && snake.active) {
            if (!(snake.y != foody || snake.x != foodx)) {
                score += 1;
                topText.innerHTML = getSnakeText(); //update score
                snake.food.push([snake.y,snake.x]); //add to list of food
                //animState.push(0); //uh?
                makeFood(); //make more food
            }
            
            snake.body.push([snake.y,snake.x]); //add to the head
            
            colorFill("white"); //clear animation
            
            
            moveFood(); //food "moving" through body animation
            
            var isFood;
            
            //Draw the snake
            for (var j = 0; j < snake.body.length; j++) {
                isFood = false;
                
                if (findPointMatch(snake.body[j],snake.food) != -1) {
                    isFood = true;
                }
                
                if (isFood) {
                    cells[snake.body[j][0]][snake.body[j][1]].className = "food pixel " + foodColor;
                } else if (j == snake.body.length - 1) {
                    cells[snake.body[j][0]][snake.body[j][1]].className = "head pixel " + headColor;
                } else {
                    cells[snake.body[j][0]][snake.body[j][1]].className = "body pixel " + bodyColor;
                }
            }
            
            //Infinity snake is supposed to allow moving through foodPoints in the body.
            //Bugged. Haven't tried to fix yet.
            if (cells[snake.body[0][0]][snake.body[0][1]].className != "food pixel " + foodColor && !(infinitySnake && score > 1)) {
                snake.body = snake.body.slice(1);
            } else if (!infinitySnake) {
                var foodIndex = findPointMatch([snake.body[0][0],snake.body[0][1]],snake.food);
                snake.food.splice(foodIndex,1);
            }
            
            //Draw food
            cells[foody][foodx].className = "food pixel " + foodColor;
            hasTurned = false;
        }
    }
}

/**
 * This method went through way too many iterations too fast.
 * Right now I think it just makes sure to erase food when the body leaves it
 * behind (and then the body replaces it with a body pixel).
 */
function moveFood() {
    var foodBodyIndex;
    for (var l = 0; l < snake.food.length; l++) {
        foodBodyIndex = findPointMatch(snake.food[l],snake.body);        
        
        if (foodBodyIndex == -1) { //if Food is off body, forget it
            snake.food.splice(l,1);
            //animState.splice(l,1);
            moveFood();
            break;
        }
    }
}


function findPointMatch(item,array) {
    for (var i = 0; i < array.length; i++) {
        if (item[0] == array[i][0] &&
            item[1] == array[i][1]) {
            return i;    
        }
    }
    return -1;
}

/**
 * Modify the message at the top and flash it red.
 * If they get 10 or higher on Infinity snake, I express my amazement =p
 * It also slides the controls back into view.
 */
function youLost(why) {
    snake.active = false;
    hasTurned = false;
    topText.className = "key " + "red";
    setTimeout(function() {
        topText.className = "key " + "white";
    },1000)
    if (infinitySnake) {
        if (score > highScore) {
            setCookie("infinitySnakeScore",score,36500);
            highScore = score;
        }
        topText.innerHTML=why + "<br />Score: " + score + ". Infinity Score: " + highScore;
    } else {
        if (score > highScore) {
            setCookie("highScore",score,36500);
            
            highScore = score;
        }
        topText.innerHTML=why + "<br />Score: " + score + ". High Score: " + highScore;
    }
    
    if (infinitySnake && score >= 10) {
        window.alert("You scored 10 or higher. I'm impressed.\n-Mitch");
    }
    
    $("#controlRow").slideDown("slow");
}

//These cookie functions are from w3schools
function getCookie(c_name)
    {
    var c_value = document.cookie;
    var c_start = c_value.indexOf(" " + c_name + "=");
    if (c_start == -1)
      {
      c_start = c_value.indexOf(c_name + "=");
      }
    if (c_start == -1)
      {
      c_value = null;
      }
    else
      {
      c_start = c_value.indexOf("=", c_start) + 1;
      var c_end = c_value.indexOf(";", c_start);
      if (c_end == -1)
        {
        c_end = c_value.length;
        }
      c_value = unescape(c_value.substring(c_start,c_end));
      }
    return c_value;
}

function setCookie(c_name,value,exdays)
{
    var exdate=new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value=escape(value) + ((exdays===null) ? "" : ";expires="+exdate.toUTCString());
    document.cookie=c_name + "=" + c_value;
}

/**
 * Get highscore from cookie if it exists.
 */
function checkCookie()
{
    var tempHighScore;
    if (infinitySnake) {
        tempHighScore=getCookie("infinitySnakeScore");
        
    } else {
        tempHighScore=getCookie("highScore");
    }
    if (tempHighScore!==null && tempHighScore!=="")
        {
            highScore = tempHighScore;
        }
}

//Realized that I don't want to re-edit this everywhere.
function getSnakeText() {
    if (infinitySnake) {
        return "Arrow keys to move, space to pause, esc to stop.<br />Score: " + score +
                ". Infinity Score: " + highScore;
    } else {
        return "Arrow keys to move, space to pause, esc to stop.<br />Score: " + score +
             ". High Score: " + highScore;
    }
}

function resetSnake() {
    score = 0;
    snake.x = 19;
    snake.y = 19;
    snake.direction = 3;
    snake.exists = false;
    snake.active = false;
    snake.paused = false;
    snake.body = [];
    snake.food = [];
}

/**
 * As in, stop playing Snake.
 */
function stopSnake() {
    if (snake.exists) {
        resetSnake();
        colorFill("white");
        clearInterval(snaker);
        score = 0;
        canDraw = true;
        topText.innerHTML = "Hold <tt>ctrl</tt>" + 
            "to draw blue. Hold <tt>shift</tt> to draw red. " +
            "<tt>Both</tt> for purple.<br /><tt>Alt</tt> erases.";
    }
    
    $("#controlRow").slideDown("slow");
    $("#drawButton").fadeOut();
}

/**
 * Activates Snake game.
 */
function startSnake() {
    if (!snake.active) {
        colorFill("white");
        resetSnake();
        snake.exists = true;
        snake.active = true;
        canDraw = false;
        tbody = document.getElementById( "tablebody" );
        rows = tbody.getElementsByTagName( "tr" );
        cells = [];
        
        for (var i = 1; i < rows.length; i++) {
            cells.push(rows[i].getElementsByTagName("td"));
        }
        
        //lol the snake used to always be blue.
        //Code I wrote elsewhere takes care of this so well I forgot it was
        //here.
        cells[snake.y][snake.x - 1].className = "body pixel " + "blue";
        cells[snake.y][snake.x].className = "body pixel " + "blue";
        
        //generate first food
        makeFood();
        
        snake.body.push([snake.y, snake.x - 2]);
        snake.body.push([snake.y, snake.x - 1]);
        snake.body.push([snake.y,snake.x]);
        
        topText.innerHTML = getSnakeText();
        
        clearInterval(snaker);
        snaker = setInterval(snakeIt, 55);
        $("#controlRow").slideUp("slow");
        setTimeout(function () {
            $("#drawButton").hide().fadeIn();
        },500);
    }
}
 
//mm I need the food to not appear in the same position as the snake.
//I can either random regen until I get a valid spot (which could take forever
//if unlucky)
//Or I can push it until it's valid. Pushing seems better practice.
//I'm not pushing though, as it hasn't been an issue.
function makeFood() {
    do {
        foody = Math.floor(Math.random() * side);
        foodx = Math.floor(Math.random() * (side * widthMulti));
    } while (onSnake());
}

function onSnake() {
    for (var i = 0; i < snake.body.length; i++) {
        if (foody == snake.body[i][0] &&
            foodx == snake.body[i][1]) {
            return true;
        }
    }
    return false;
}


function controlSnake(prefix, evt) {
    //This prefix/evt thing is a fix I found for Firefox online.
    thisKey = (evt.which) ? evt.which : evt.keyCode;
    if (snake.exists && !hasTurned) {
        switch (thisKey) {
            case 13: //start [again?] with enter
                if (snake.exists) startSnake();
                break;
            case 27: //quit with esc
                stopSnake();
                break;
            case 32: //pause with space
                snake.paused = !snake.paused;
                break;
            case 37: //left
                moveLeft();
                break;
            case 38: //up
                moveUp();
                break;
            case 39: //right
                moveRight();
                break;
            case 40: //down
                moveDown();
                break;
        }
    }
}

function moveLeft() {
	if (snake.direction != 3
		&& canTurn(9)) {
			snake.direction = 9;
			hasTurned = true;
		}
}

function moveRight() {
	if (snake.direction != 9
		&& canTurn(3)) {
			snake.direction = 3;    
			hasTurned = true;
		}
}

function moveDown() {
	if (snake.direction != 12
		&& canTurn(6)) {
			snake.direction = 6;
			hasTurned = true;
		}
}

function moveUp() {
	if (snake.direction != 6
		&& canTurn(12)) {
			snake.direction = 12;
			hasTurned = true;
		}
}
 
//Just to get this out of the if statement
function canTurn(num) {
    if (snake.active) {
        switch (num) {
            case 9:
                if (snake.body[snake.body.length - 1][1] -
                    snake.body[snake.body.length - 2][1] != 1 && 
                    snake.body[snake.body.length - 1][0] !=
                    snake.body[snake.body.length - 2][0]) {
                    return true;
                }
                break;
            case 12:
                if (snake.body[snake.body.length - 1][1] !=
                    snake.body[snake.body.length - 2][1] && 
                    snake.body[snake.body.length - 2][0] -
                    snake.body[snake.body.length - 1][0] != 1) {
                    return true;
                }
                break;
            case 3:
                if (snake.body[snake.body.length - 2][1] -
                    snake.body[snake.body.length - 1][1] != 1 && 
                    snake.body[snake.body.length - 1][0] !=
                    snake.body[snake.body.length - 2][0]) {
                    return true;
                }
                break;
            case 6:
                if (snake.body[snake.body.length - 1][1] !=
                    snake.body[snake.body.length - 2][1] && 
                    snake.body[snake.body.length - 1][0] -
                    snake.body[snake.body.length - 2][0] != 1) {
                    return true;
                }
                break;
            default:
                return false;
        }
    } else {
        return false;
    }
}