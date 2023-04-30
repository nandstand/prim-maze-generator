
// DOM elements

const canvas = document.getElementById('mazeCanvas');
const context = canvas.getContext('2d');
const generateBtn = document.getElementById('generateBtn');
const saveBtn = document.getElementById('saveBtn');

// Constants

const cellSize = 20;
const numRows = canvas.height / cellSize;
const numCols = canvas.width / cellSize;

const oppositeWall = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right'
};

// Classes

class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.visited = false;
        this.walls = { top: true, right: true, bottom: true, left: true };
    }
}



// Event listeners

generateBtn.addEventListener('click', () => {
    const grid = generateMaze();
    const backgroundColor = getRandomColor();
    drawMaze(grid, backgroundColor);
    saveMaze(grid, backgroundColor); // save maze wall layout and color to local storage
});


saveBtn.addEventListener('click', () => {
    downloadMaze();
});

// App initialization

const savedMazeData = loadMaze();

if (savedMazeData) {
    drawMaze(savedMazeData.grid, savedMazeData.backgroundColor);
} else {
    const grid = generateMaze();
    const backgroundColor = getRandomColor();
    drawMaze(grid, backgroundColor);
    saveMaze(grid, backgroundColor);
}




// Grid is a 2D array of unvisited cells

function createGrid() {
    const grid = [];
    for (let row = 0; row < numRows; row++) {
        const currentRow = [];
        for (let col = 0; col < numCols; col++) {
            currentRow.push(new Cell(row, col));
        }
        grid.push(currentRow);
    }
    return grid;
}

// Prim's algorithm
// Since the grid cannot be represented as a weighted graph, this implementation
// just chooses a random unvisited neighbor for each cell

function getRandomNeighbor(grid, cell) {
    const neighbors = [];

    if (cell.row > 0) {
        const top = grid[cell.row - 1][cell.col];
        if (!top.visited) 
            neighbors.push({ cell: top, wall: 'top' });
    }

    if (cell.col < numCols - 1) {
        const right = grid[cell.row][cell.col + 1];
        if (!right.visited)
            neighbors.push({ cell: right, wall: 'right' });
    }

    if (cell.row < numRows - 1) {
        const bottom = grid[cell.row + 1][cell.col];
        if (!bottom.visited) 
            neighbors.push({ cell: bottom, wall: 'bottom' });
    }

    if (cell.col > 0) {
        const left = grid[cell.row][cell.col - 1];
        if (!left.visited) 
            neighbors.push({ cell: left, wall: 'left' });
    }

    if (neighbors.length > 0) {
        const randomIndex = Math.floor(Math.random() * neighbors.length);
        return neighbors[randomIndex];
    }

    return null;
}


// Generate the maze using Prim's algorithm
// Returns the grid with the walls removed between cells

function generateMaze() {
    const grid = createGrid();
    const startRow = Math.floor(Math.random() * numRows);
    const startCol = Math.floor(Math.random() * numCols);
    const startCell = grid[startRow][startCol];
    startCell.visited = true;

    const frontier = [startCell]; // stack of cells to visit

    while (frontier.length > 0) {
        const currentCell = frontier.pop();
        const neighbor = getRandomNeighbor(grid, currentCell);

        if (neighbor) {
            
            // Mark neighbor cell as visited
            // Wall is which wall of the current cell is between the current cell and the neighbor cell
            const { cell: neighborCell, wall: neighborWall } = neighbor; 
            neighborCell.visited = true;

            // Remove walls between current cell and neighbor cell
            // Creates the maze's passages
            currentCell.walls[neighborWall] = false; 
            neighborCell.walls[oppositeWall[neighborWall]] = false; 
            
            // Add current cell and neighbor cell back to the stack
            // So that the neighbor cell can be visited next
            // And the current cell can be visited again if it has more neighbors
            frontier.push(currentCell);
            frontier.push(neighborCell);
        }
    }

    return grid;
}

function drawMaze(grid, backgroundColor) {

    context.fillStyle = backgroundColor; // set background color of drawn shapes
    context.fillRect(0, 0, canvas.width, canvas.height); // draw the maze background

    context.strokeStyle = 'black';
    context.lineWidth = 2;

    // Draw the walls for each cell
    // Each cell is a square with wall data: { top: bool, right: bool, bottom: bool, left: bool }
    // If wall is true, draw

    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const cell = grid[row][col];
            const x = col * cellSize; // pixel coordinate
            const y = row * cellSize; // pixel coordinate

            if (cell.walls.top) {
                context.beginPath();
                context.moveTo(x, y); // move to the top left corner of the cell
                context.lineTo(x + cellSize, y); // 20 pixels to the right
                context.stroke(); // actually render the line
            }

            if (cell.walls.right) {
                context.beginPath();
                context.moveTo(x + cellSize, y);
                context.lineTo(x + cellSize, y + cellSize);
                context.stroke();
            }

            if (cell.walls.bottom) {
                context.beginPath();
                context.moveTo(x, y + cellSize);
                context.lineTo(x + cellSize, y + cellSize);
                context.stroke();
            }

            if (cell.walls.left) {
                context.beginPath();
                context.moveTo(x, y);
                context.lineTo(x, y + cellSize);
                context.stroke();
            }
        }
    }
}

function getRandomColor() {
    const r = Math.floor(Math.random() * 256); // 0-255
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
}

function downloadMaze() {
    const imageData = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imageData;
    link.download = 'maze.png';
    link.click();
}

// Save maze data to local storage
// The grid is saved as a 2D array of walls, not the whole Cell object
// Also saves the background color for redrawing

function saveMaze(grid, backgroundColor) {
    const gridData = JSON.stringify(grid.map(row => row.map(cell => cell.walls)));
    localStorage.setItem('mazeData', gridData);
    localStorage.setItem('mazeBackgroundColor', backgroundColor);
}


// Load maze data from local storage
// Rebuilds the grid using the wall data

function loadMaze() {
    const gridData = localStorage.getItem('mazeData');
    const backgroundColor = localStorage.getItem('mazeBackgroundColor');

    if (gridData && backgroundColor) {
        const wallsData = JSON.parse(gridData);
        const grid = createGrid();

        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                grid[row][col].walls = wallsData[row][col];
            }
        }

        return { grid, backgroundColor };
    }

    return null;
}
