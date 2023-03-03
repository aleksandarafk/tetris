console.log('ok');
//we create constants and declare them by using getElementById function from the html file.
const canvas = document.getElementById('tetris');

const context = canvas.getContext('2d');

const myInstructions = document.getElementById("myInstructions");

const instructionsButton = document.getElementById("instructions");

const span = document.getElementsByClassName("close")[0];

const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

const arena = createMatrix(12, 20);

const player =
{
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
};

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;

context.scale(20, 20);

//this is used to display the instructions when user clicks on the button
instructionsButton.addEventListener("click", () =>
{
  myInstructions.style.display = "block";
});

span.addEventListener("click", () =>
{
  myInstructions.style.display = "none";
});

window.onclick = function (event)
{
  if (event.target == myInstructions)
  {
    myInstructions.style.display = "none";
  }
};

//used to clear the arena if the player has one line of blocks 
function arenaSweep()
{
    let rowCount = 1;
    outer: for (let y = arena.length -1; y > 0; y--)
    {
        for (let x = 0; x < arena[y].length; x++)
        {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

//we create a collide function to detect whether the user has crashed into the ground or landed on another piece
function collide(arena, player)
{
    const playerMatrix = player.matrix;
    const playerPosition = player.pos;
    for (let y = 0; y < playerMatrix.length; ++y)
    {
        for (let x = 0; x < playerMatrix[y].length; ++x)
        {
            if (playerMatrix[y][x] !== 0 &&
               (arena[y + playerPosition.y] &&
                arena[y + playerPosition.y][x + playerPosition.x]) !== 0)
                {
                return true;
            }
        }
    }
    return false;
}

//we create the matrix for the game
function createMatrix(width, height)
{
    const matrix = [];
    while (height--)
    {
        matrix.push(new Array(width).fill(0));
    }
    return matrix;
}

//function that creates the pieces seen in the game using arrays
function createPieces(type)
{
    if (type === 'I')
    {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    }
    else if (type === 'L')
    {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    }
    else if (type === 'J')
    {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    }
    else if (type === 'O')
    {
        return [
            [4, 4],
            [4, 4],
        ];
    }
    else if (type === 'Z')
    {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    }
    else if (type === 'S')
    {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    }
    else if (type === 'T')
    {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}

//function that colors the matrix
function drawMatrix(matrix, offset)
{
    matrix.forEach((row, y) =>
    {
        row.forEach((value, x) =>
        {
            if (value !== 0)
            {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                                 y + offset.y,
                                 1, 1);
            }
        });
    });
}


//function to draw the canvas
function draw()
{
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

//merges the player and the arena(canvas)
function mergePlayerAndArena(arena, player)
{
    player.matrix.forEach((row, y) =>
    {
        row.forEach((value, x) =>
         {
            if (value !== 0)
            {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}


//function to declare the rotations the user can do
function rotate(matrix, direction)
{
    for (let y = 0; y < matrix.length; ++y)
    {
        for (let x = 0; x < y; ++x)
        {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }
    //reverses direction if it has been moved
    if (direction > 0)
    {
        matrix.forEach(row => row.reverse());
    }
    else
    {
        matrix.reverse();
    }
}

//function to check if the player is dead
function playerDrop()
{
    player.pos.y++;
    if (collide(arena, player))
    {
        player.pos.y--;
        mergePlayerAndArena(arena, player);
        playerRestart();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

//function to check the player`s movement
function playerMove(offset)
{
    player.pos.x += offset;
    if (collide(arena, player))
    {
        player.pos.x -= offset;
    }
}

//for when the player restarts or starts the game
function playerRestart()
{
const pieces = 'TJLOSZI';
    player.matrix = createPieces(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);
    if (collide(arena, player))
    {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

//function to detect in which direction the piece is rotated
function playerRotate(direction)
{
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, direction);
    while (collide(arena, player))
    {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length)
        {
            rotate(player.matrix, -direction);
            player.pos.x = pos;
            return;
        }
    }
}

//function to update the panel + automatically drops the pieces
function update(time = 0)
{
    const deltaTime = time - lastTime;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval)
    {
        playerDrop();
    }

    lastTime = time;

    draw();
    requestAnimationFrame(update);
}


//showcases the score if the user clears blocks
function updateScore()
{
    document.getElementById('score').innerText = player.score;
}
//adds keycontrols - not as efficient as switch, but i couldn`t come up with it
document.addEventListener('keydown', event =>
{
    if (event.keyCode === 37)
    {
        playerMove(-1);
    }
    else if (event.keyCode === 39)
    {
        playerMove(1);
    }
    else if (event.keyCode === 40)
    {
        playerDrop();
    }
    else if (event.keyCode === 38)
    {
        playerRotate(-1);
    }
    else if (event.keyCode === 87)
    {
        playerRotate(1);
    }
});


//calling the functions
playerRestart();
updateScore();
update();
