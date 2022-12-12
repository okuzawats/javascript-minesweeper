var components = {
    num_of_rows : 8,
    num_of_cols : 8,
    num_of_bombs : 10,
    bomb : '💣',
    flag : '🚩',
    alive : true,
    bombs : [],
    clicked : [],
    flagged : [],
    // セルを開いた時、そのセルが爆弾でなく、隣接するセルに爆弾がある場合のテキストカラー。
    // 爆弾の数に応じてテキストカラーを設定する。
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
 * ゲームを開始する。
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
 * 爆弾を踏んだ場合は全てのセルを開き、ゲームオーバーにする。
 */
 function gameOver() {
    components.alive = false;
    document.getElementById('lost').style.display = "block";
    clickAllCells(components.num_of_rows, components.num_of_cols);
}

/**
 * リスタートする。
 */
function reload(){
    window.location.reload();
}

/**
 * rows * colsのサイズの配列を返す。
 * bombsと等しい数だけ配列の先頭にtrueを入れる。
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
 * Array<Boolean>を受け取り、シャッフルして返す。
 * Fisher-Yates shuffle。
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
 * cellsをrows * colsの二次元配列に並び替える。
 * @param {Array<boolean>} cells 
 * @param {number} rows ゲーム版の横方向のセルの個数
 * @param {number} cols ゲーム版の縦方向のセルの個数
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

        // rows分だけ配列をスライスしてboardに詰め替える。
        let first = j * rows;
        let last = first + rows;
        board[j] = cells.slice(first, last);
    }

    components.clicked = clicked;
    components.flagged = flagged;

    return board;
}

/**
 * ゲーム版のHTMLを生成して返す。
 * @param {number} num_of_rows 行の数 
 * @param {number} num_of_cols 列の数
 * @returns ゲーム版を表すHTML
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
 * セルに対するクリックリスナーを設定する。
 * @param {Element} td セルのHTML要素
 * @param {number} i 横方向のインデックス
 * @param {number} j 縦方向のインデックス
 */
function addCellListeners(td, i, j) {
    td.addEventListener('mousedown', function(event) {
        if (!components.alive) { return; }

        if (event.button === 0) {
            // 左クリックの処理
            if (components.flagged[i][j]) { return; }
            handleCellClick(this, i, j)
        } else if (event.button === 2) {
            // 右クリックの処理
            if (components.flagged[i][j]) {
                this.textContent = '';
                components.flagged[i][j] = false;
            } else {
                this.textContent = components.flag;
                components.flagged[i][j] = true;
            }
        }
    });

    // 右クリック押下時にコンテキストメニューが表示されるのを防ぐための処理
    td.oncontextmenu = function(event) { 
        event.preventDefault();
        event.stopPropagation();
        return false; 
    };
}

/**
 * クリック時の処理。
 * @param {Element} cell セルのHTML要素
 * @param {*} i 横方向のインデックス
 * @param {*} j 縦方向のインデックス
 */
function handleCellClick(cell, i, j) {
    if (!components.alive || components.flagged[i][j]) { return; }

    components.clicked[i][j] = true;

    if (components.bombs[i][j]) {
        // 対象のセルが爆弾だった時
        cell.style.backgroundColor = components.is_bomb;
        cell.textContent = components.bomb;
        gameOver();
    } else {
        // 対象のセルが爆弾でなかった時
        cell.style.backgroundColor = components.is_num;
        let num_of_bombs = countAdjacentBombs(i, j);
        if (num_of_bombs > 0) {
            // 周辺のセルに爆弾がある場合
            cell.style.color = components.colors[num_of_bombs];
            cell.textContent = num_of_bombs;
        } else {
            // 周辺のセルに爆弾がない場合
            clickAdjacentCells(i, j);
        }
        if (is_win()) {
            gameWin();
        }
    }
}

/**
 * 対象のセルの周辺8セルに存在する爆弾の数を返す。
 * @param {number} row 対象のセルの行番号
 * @param {number} col 対象のセルの列番号
 * @returns 周辺8セルに存在する爆弾の数
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
 * 対象のセルの周辺8セルをまとめてクリックする。
 * @param {number} row 対象のセルの行番号
 * @param {number} col 対象のセルの列番号
 */
function clickAdjacentCells(row, col) {
    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            if (row + i < 0 || row + i >= components.num_of_rows || col + j < 0 || col + j >= components.num_of_cols) {
                // インデックスが範囲外の時は処理しない
                continue;
            }

            // 対象のセル自身
            if (i === 0 && j === 0) { continue; }

            let cell = document.getElementById(cellID(row + i, col + j));
            // クリック済みの場合、フラグ済みの場合はスキップ
            let not_clicked = !components.clicked[row + i][col + j];
            let not_flagged = !components.flagged[row + i][col + j];
            if (!!cell && not_clicked && not_flagged) {
                handleCellClick(cell, row + i, col + j);
            }
        }
    }
}

/**
 * 全てのセルをまとめてクリックする。
 * @param {number} num_of_rows 
 * @param {number} num_of_cols 
 */
function clickAllCells(num_of_rows, num_of_cols) {
    for (let i = 0; i < num_of_rows; i++) {
        for (let j = 0; j < num_of_cols; j++) {
            let cell = document.getElementById(cellID(i, j));
            // クリック済みの場合はスキップ
            if (!!cell && !components.clicked[i][j]) {
                if (components.bombs[i][j]) {
                    // 対象のセルが爆弾だった時
                    cell.style.backgroundColor = components.is_bomb;
                    cell.textContent = components.bomb;
                } else {
                    // 対象のセルが爆弾でなかった時
                    cell.style.backgroundColor = components.is_num;
                    let num_of_bombs = countAdjacentBombs(i, j);
                    if (num_of_bombs > 0) {
                        // 周辺のセルに爆弾がある場合
                        cell.style.color = components.colors[num_of_bombs];
                        cell.textContent = num_of_bombs.toString();
                    }
                }
            }
        }
    }
}

/**
 * ゲームの勝利判定結果を返す。
 * @returns boolean ゲームに勝利していればtrue、それ以外はfalse
 */
function is_win() {
    let num_of_rows = components.num_of_rows;
    let num_of_cols = components.num_of_cols;
    // 爆弾の置かれていないセルで、かつまだクリックされていないセルがあれば、
    // まだ勝利判定を満たしていないためfalseを返す。
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
 * 行・列の番号からユニークなIDを生成して返す。
 * @param {number} row 行番号
 * @param {number} col 列番号
 * @returns {string} cell-{row}-{col}形式の文字列
 */
 function cellID(row, col) {
    return 'cell-' + row + '-' + col;
}

window.addEventListener('load', function() {
    document.getElementById('lost').style.display="none";
    startGame();
});
