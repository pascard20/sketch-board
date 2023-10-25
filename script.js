/* -------------------------------- ELEMENTS -------------------------------- */

elemGridWrapper = document.querySelector('.grid__wrapper');
elemBtnReset = document.querySelector('.btn--reset');
elemBtnBoard = document.querySelector('.btn--board');
elemBtnGrid = document.querySelector('.btn--grid');
elemBtnEraser = document.querySelector('.btn--eraser');
elemRoot = document.documentElement;

/* -------------------------------- CONSTANTS ------------------------------- */

const DEFAULT_ITEM_COUNT = 16;
const MAX_ITEM_COUNT = 100;
let DEFAULT_COLOR = '#fff';

/* -------------------------------- VARIABLES ------------------------------- */

let clicked = false;
let currentColor = '#333';
let cachedColor = currentColor;

/* -------------------------------- FUNCTIONS ------------------------------- */

const createBoard = itemCount => {
    elemRoot.style.setProperty('--gridItemCount', itemCount);
    elemGridWrapper.innerHTML = '';
    for (let i = 0; i < itemCount ** 2; i++) {
        elemGridWrapper.insertAdjacentHTML('beforeend', `
    <div class="grid__item"></div>
    `)
    }
};

const handleHover = event => {
    elemCurrent = event.target;
    if (elemCurrent.className.includes('wrapper')) return;
    if (clicked) elemCurrent.style.backgroundColor = currentColor;
};

const handleClick = event => {
    clicked = true;
    handleHover(event);
};

const handleRelease = () => clicked = false;

const handleReset = () => {
    [...elemGridWrapper.children].forEach(item => {
        item.style.backgroundColor = DEFAULT_COLOR;
    })
};

const handleNewBoard = () => {
    const newItemCount = prompt(`Enter number of columns/rows (max ${MAX_ITEM_COUNT}):`)
    if (newItemCount > 0 && newItemCount <= MAX_ITEM_COUNT) createBoard(newItemCount);
};

const handleToggleGrid = () => {
    elemGridWrapper.classList.toggle('grid--on');
}

const handleEraser = event => {
    const btn = event.target;
    if (btn.className.includes('eraser--on')) {
        currentColor = cachedColor;
    } else {
        cachedColor = currentColor;
        currentColor = DEFAULT_COLOR;
    }
    btn.classList.toggle('eraser--on');
}

/* --------------------------------- EVENTS --------------------------------- */

elemGridWrapper.addEventListener('mouseover', handleHover);
elemGridWrapper.addEventListener('mousedown', handleClick);
document.addEventListener('mouseup', handleRelease);
elemBtnReset.addEventListener('click', handleReset);
elemBtnBoard.addEventListener('click', handleNewBoard);
elemBtnGrid.addEventListener('click', handleToggleGrid);
elemBtnEraser.addEventListener('click', handleEraser);

/* ---------------------------------- MAIN ---------------------------------- */

createBoard(DEFAULT_ITEM_COUNT);