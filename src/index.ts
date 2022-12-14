var components = {
    num_of_rows : 8,
    num_of_cols : 8,
    num_of_bombs : 10,
    bomb : 'ð£',
    flag : 'ð©',
    alive : true,
    bombs : [],
    clicked : [],
    flagged : [],
    // ã»ã«ãéããæããã®ã»ã«ãçå¼¾ã§ãªããé£æ¥ããã»ã«ã«çå¼¾ãããå ´åã®ãã­ã¹ãã«ã©ã¼ã
    // çå¼¾ã®æ°ã«å¿ãã¦ãã­ã¹ãã«ã©ã¼ãè¨­å®ããã
    colors : {
        // https://www.colordic.org/colorsample/2079
        1: '#0095d9',
        // https://www.colordic.org/colorsample/2112
        2: '#69b076',
        // https://www.colordic.org/colorsample/2013
        3: '#d9333f',
        // https://www.colordic.org/colorsample/2037
        4: '#824880',
        // https://www.colordic.org/colorsample/2275
        5: '#96514d',
        // https://www.colordic.org/colorsample/2085
        6: '#89c3eb',
        // https://www.colordic.org/colorsample/2463
        7: '#333631',
        // https://www.colordic.org/colorsample/2367
        8: '#887f7a'
    },
    // https://www.colordic.org/colorsample/2013
    is_bomb : '#d9333f',
    is_num : '#e4d2d8'
}

/**
 * ã²ã¼ã ãéå§ããã
 */
function startGame() {
    let rows = components.num_of_rows;
    let cols = components.num_of_cols;
    let bombs = components.num_of_bombs;

    let cells = generate(rows, cols, bombs);
    let shuffled = shuffle(cells);
    components.bombs = makeBoard(shuffled, rows, cols);

    let table = createTable(rows, cols);
    document.getElementById('field').appendChild(table);
}

function gameWin() {
    components.alive = false;
    document.getElementById('won').style.display = "block";
}

/**
 * çå¼¾ãè¸ãã å ´åã¯å¨ã¦ã®ã»ã«ãéããã²ã¼ã ãªã¼ãã¼ã«ããã
 */
 function gameOver() {
    components.alive = false;
    document.getElementById('lost').style.display = "block";
    clickAllCells(components.num_of_rows, components.num_of_cols);
}

/**
 * ãªã¹ã¿ã¼ãããã
 */
function reload(){
    window.location.reload();
}

/**
 * rows * colsã®ãµã¤ãºã®éåãè¿ãã
 * bombsã¨ç­ããæ°ã ãéåã®åé ­ã«trueãå¥ããã
 * @param {number} rows 
 * @param {number} cols 
 * @param {number} bombs 
 * @returns Array<boolean>
 */
 function generate(rows, cols, bombs) {
    let cells = Array(rows * cols)
    for (let i = 0; i < rows * cols; i++) {
        cells[i] = i < bombs;
    }
    return cells;
}

/**
 * Array<Boolean>ãåãåããã·ã£ããã«ãã¦è¿ãã
 * Fisher-Yates shuffleã
 * https://www.nxworld.net/js-array-shuffle.html
 * @param {Array<boolean>} cells 
 * @returns Array<Boolean>
 */
function shuffle(cells) {
    for (let i = cells.length - 1; i >=0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cells[i], cells[j]] = [cells[j], cells[i]];
    }
    return cells;
}

/**
 * cellsãrows * colsã®äºæ¬¡åéåã«ä¸¦ã³æ¿ããã
 * @param {Array<boolean>} cells 
 * @param {number} rows ã²ã¼ã çã®æ¨ªæ¹åã®ã»ã«ã®åæ°
 * @param {number} cols ã²ã¼ã çã®ç¸¦æ¹åã®ã»ã«ã®åæ°
 * @returns Array<Array<boolean>>
 */
function makeBoard(cells, rows, cols) {
    let clicked: Array<Array<boolean>> = new Array(cols);
    let flagged: Array<Array<boolean>> = new Array(cols);

    let board = Array(cols);
    for (let j = 0; j < cols; j++) {
        let clicked_row: Array<boolean> = new Array(rows);
        clicked_row.fill(false);
        clicked[j] = clicked_row;

        let flagged_row: Array<boolean> = new Array(rows);
        flagged_row.fill(false);
        flagged[j] = flagged_row;

        // rowsåã ãéåãã¹ã©ã¤ã¹ãã¦boardã«è©°ãæ¿ããã
        let first = j * rows;
        let last = first + rows;
        board[j] = cells.slice(first, last);
    }

    components.clicked = clicked;
    components.flagged = flagged;

    return board;
}

/**
 * ã²ã¼ã çã®HTMLãçæãã¦è¿ãã
 * @param {number} num_of_rows è¡ã®æ° 
 * @param {number} num_of_cols åã®æ°
 * @returns ã²ã¼ã çãè¡¨ãHTML
 */
 function createTable(num_of_rows, num_of_cols) {
    let table = document.createElement('table');
    for (let i = 0; i < num_of_rows; i++) {
        let row = document.createElement('tr');
        for (let j = 0; j < num_of_cols; j++) {
            let td = document.createElement('td');
            td.id = cellID(i, j);
            row.appendChild(td);
            addCellListeners(td, i, j);
        }
        table.appendChild(row);
    }
    return table;
}

/**
 * ã»ã«ã«å¯¾ããã¯ãªãã¯ãªã¹ãã¼ãè¨­å®ããã
 * @param {Element} td ã»ã«ã®HTMLè¦ç´ 
 * @param {number} i æ¨ªæ¹åã®ã¤ã³ããã¯ã¹
 * @param {number} j ç¸¦æ¹åã®ã¤ã³ããã¯ã¹
 */
function addCellListeners(td, i, j) {
    var interval_id = 0;
    td.addEventListener('mousedown', function(event) {
        if (!components.alive) { return; }

        interval_id = setInterval(() => {
            clearInterval(interval_id);
            interval_id = 0;

            if (components.clicked[i][j]) { return; }

            // ã­ã³ã°ã¯ãªãã¯ã®å¦ç
            if (components.flagged[i][j]) {
                td.textContent = '';
                components.flagged[i][j] = false;
            } else {
                td.textContent = components.flag;
                components.flagged[i][j] = true;
            }
        }, 1000);
    });

    td.addEventListener('mouseup', function(event) {
        if (!components.alive) { return; }
        clearInterval(interval_id);
        interval_id = 0;

        if (components.flagged[i][j]) { return; }
        handleCellClick(td, i, j)
    });

    // å³ã¯ãªãã¯æ¼ä¸æã«ã³ã³ãã­ã¹ãã¡ãã¥ã¼ãè¡¨ç¤ºãããã®ãé²ãããã®å¦ç
    td.oncontextmenu = function(event) { 
        event.preventDefault();
        event.stopPropagation();
        return false; 
    };
}

/**
 * ã¯ãªãã¯æã®å¦çã
 * @param {Element} cell ã»ã«ã®HTMLè¦ç´ 
 * @param {*} i æ¨ªæ¹åã®ã¤ã³ããã¯ã¹
 * @param {*} j ç¸¦æ¹åã®ã¤ã³ããã¯ã¹
 */
function handleCellClick(cell, i, j) {
    if (!components.alive || components.flagged[i][j]) { return; }

    components.clicked[i][j] = true;

    if (components.bombs[i][j]) {
        // å¯¾è±¡ã®ã»ã«ãçå¼¾ã ã£ãæ
        cell.style.backgroundColor = components.is_bomb;
        cell.textContent = components.bomb;
        gameOver();
    } else {
        // å¯¾è±¡ã®ã»ã«ãçå¼¾ã§ãªãã£ãæ
        cell.style.backgroundColor = components.is_num;
        let num_of_bombs = countAdjacentBombs(i, j);
        if (num_of_bombs > 0) {
            // å¨è¾ºã®ã»ã«ã«çå¼¾ãããå ´å
            cell.style.color = components.colors[num_of_bombs];
            cell.textContent = num_of_bombs;
        } else {
            // å¨è¾ºã®ã»ã«ã«çå¼¾ããªãå ´å
            clickAdjacentCells(i, j);
        }
        if (is_win()) {
            gameWin();
        }
    }
}

/**
 * å¯¾è±¡ã®ã»ã«ã®å¨è¾º8ã»ã«ã«å­å¨ããçå¼¾ã®æ°ãè¿ãã
 * @param {number} row å¯¾è±¡ã®ã»ã«ã®è¡çªå·
 * @param {number} col å¯¾è±¡ã®ã»ã«ã®åçªå·
 * @returns å¨è¾º8ã»ã«ã«å­å¨ããçå¼¾ã®æ°
 */
 function countAdjacentBombs(row, col) {
    var num_of_bombs = 0;
    let bombs = components.bombs;
    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            if (bombs[row + i] && bombs[row + i][col + j]) {
                num_of_bombs++;
            }
        }
    }
    return num_of_bombs;
}

/**
 * å¯¾è±¡ã®ã»ã«ã®å¨è¾º8ã»ã«ãã¾ã¨ãã¦ã¯ãªãã¯ããã
 * @param {number} row å¯¾è±¡ã®ã»ã«ã®è¡çªå·
 * @param {number} col å¯¾è±¡ã®ã»ã«ã®åçªå·
 */
function clickAdjacentCells(row, col) {
    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            if (row + i < 0 || row + i >= components.num_of_rows || col + j < 0 || col + j >= components.num_of_cols) {
                // ã¤ã³ããã¯ã¹ãç¯å²å¤ã®æã¯å¦çããªã
                continue;
            }

            // å¯¾è±¡ã®ã»ã«èªèº«
            if (i === 0 && j === 0) { continue; }

            let cell = document.getElementById(cellID(row + i, col + j));
            // ã¯ãªãã¯æ¸ã¿ã®å ´åããã©ã°æ¸ã¿ã®å ´åã¯ã¹ã­ãã
            let not_clicked = !components.clicked[row + i][col + j];
            let not_flagged = !components.flagged[row + i][col + j];
            if (!!cell && not_clicked && not_flagged) {
                handleCellClick(cell, row + i, col + j);
            }
        }
    }
}

/**
 * å¨ã¦ã®ã»ã«ãã¾ã¨ãã¦ã¯ãªãã¯ããã
 * @param {number} num_of_rows 
 * @param {number} num_of_cols 
 */
function clickAllCells(num_of_rows, num_of_cols) {
    for (let i = 0; i < num_of_rows; i++) {
        for (let j = 0; j < num_of_cols; j++) {
            let cell = document.getElementById(cellID(i, j));
            // ã¯ãªãã¯æ¸ã¿ã®å ´åã¯ã¹ã­ãã
            if (!!cell && !components.clicked[i][j]) {
                if (components.bombs[i][j]) {
                    // å¯¾è±¡ã®ã»ã«ãçå¼¾ã ã£ãæ
                    cell.style.backgroundColor = components.is_bomb;
                    cell.textContent = components.bomb;
                } else {
                    // å¯¾è±¡ã®ã»ã«ãçå¼¾ã§ãªãã£ãæ
                    cell.style.backgroundColor = components.is_num;
                    let num_of_bombs = countAdjacentBombs(i, j);
                    if (num_of_bombs > 0) {
                        // å¨è¾ºã®ã»ã«ã«çå¼¾ãããå ´å
                        cell.style.color = components.colors[num_of_bombs];
                        cell.textContent = num_of_bombs.toString();
                    }
                }
            }
        }
    }
}

/**
 * ã²ã¼ã ã®åå©å¤å®çµæãè¿ãã
 * @returns boolean ã²ã¼ã ã«åå©ãã¦ããã°trueãããä»¥å¤ã¯false
 */
function is_win() {
    let num_of_rows = components.num_of_rows;
    let num_of_cols = components.num_of_cols;
    // çå¼¾ã®ç½®ããã¦ããªãã»ã«ã§ããã¤ã¾ã ã¯ãªãã¯ããã¦ããªãã»ã«ãããã°ã
    // ã¾ã åå©å¤å®ãæºããã¦ããªãããfalseãè¿ãã
    for (let i = 0; i < num_of_rows; i++) {
        for (let j = 0; j < num_of_cols; j++) {
            if (components.bombs[i][j]) { continue; }
            let cell = document.getElementById(cellID(i, j));
            if (!!cell && !components.clicked[i][j]) {
                return false;
            }
        }
    }
    return true;
}

/**
 * è¡ã»åã®çªå·ããã¦ãã¼ã¯ãªIDãçæãã¦è¿ãã
 * @param {number} row è¡çªå·
 * @param {number} col åçªå·
 * @returns {string} cell-{row}-{col}å½¢å¼ã®æå­å
 */
 function cellID(row, col) {
    return 'cell-' + row + '-' + col;
}

window.addEventListener('load', function() {
    document.getElementById('lost').style.display="none";
    startGame();
});
