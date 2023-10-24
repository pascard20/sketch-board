/* -------------------------------- ELEMENTS -------------------------------- */

elemGridWrapper = document.querySelector('.grid__wrapper');
elemBtnReset = document.querySelector('.btn--reset');
elemBtnBoard = document.querySelector('.btn--board');
elemRoot = document.documentElement;

/* -------------------------------- CONSTANTS ------------------------------- */

const DEFAULT_ITEM_COUNT = 16;
const MAX_ITEM_COUNT = 100;

/* -------------------------------- VARIABLES ------------------------------- */

let clicked = false;

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
    if (clicked) elemCurrent.classList.add('active');
};

const handleClick = event => {
    clicked = true;
    handleHover(event);
};

const handleRelease = () => clicked = false;

const handleReset = () => {
    [...elemGridWrapper.children].forEach(item => {
        item.classList.remove('active');
    })
};

const handleNewBoard = () => {
    const newItemCount = prompt(`Enter number of columns/rows (max ${MAX_ITEM_COUNT}):`)
    if (newItemCount > 0 && newItemCount <= MAX_ITEM_COUNT) createBoard(newItemCount);
};

/* --------------------------------- EVENTS --------------------------------- */

elemGridWrapper.addEventListener('mouseover', handleHover);
elemGridWrapper.addEventListener('mousedown', handleClick);
document.addEventListener('mouseup', handleRelease);
elemBtnReset.addEventListener('click', handleReset)
elemBtnBoard.addEventListener('click', handleNewBoard)

/* ---------------------------------- MAIN ---------------------------------- */

createBoard(DEFAULT_ITEM_COUNT);