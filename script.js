/* -------------------------------- ELEMENTS -------------------------------- */

elemGridWrapper = document.querySelector('.grid__wrapper');
elemBtnReset = document.querySelector('.btn--reset');
elemBtnBoard = document.querySelector('.btn--board');
elemBtnGrid = document.querySelector('.btn--grid');
elemBtnEraser = document.querySelector('.btn--eraser');
elemBtnBrush = document.querySelector('.btn--brush');
elemColorInput = document.querySelector('.color__input');
elemColorHex = document.querySelector('.color__hex__input');
elemColorEyedropper = document.querySelector('.color__picker');
elemRoot = document.documentElement;

/* -------------------------------- CONSTANTS ------------------------------- */

const DEFAULT_ITEM_COUNT = 16;
const MAX_ITEM_COUNT = 100;
const HEX_REGEX = /([^a-f0-9])/gi;
const DEFAULT_COLOR = '#ffffff';

/* -------------------------------- VARIABLES ------------------------------- */

let clicked = false;
let eyedropper = false;
let currentColor = '#333333';
let cachedColor = currentColor;

/* -------------------------------- FUNCTIONS ------------------------------- */

const createBoard = itemCount => {
    elemRoot.style.setProperty('--gridItemCount', itemCount);
    elemGridWrapper.innerHTML = '';
    for (let i = 0; i < itemCount ** 2; i++) {
        elemGridWrapper.insertAdjacentHTML('beforeend', `
    <div class="grid__item" style="background-color: #fff"></div>
    `)
    }
};

const setColor = color => {
    if (elemBtnBrush.className.includes('switched-on')) {
        currentColor = color;
    } else cachedColor = color;
}

const numberToHex = num => {
    const hex = num.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
}

const rgbToHex = rgbArray => {
    r = +rgbArray[0]
    g = +rgbArray[1]
    b = +rgbArray[2]
    return `${numberToHex(r)}${numberToHex(g)}${numberToHex(b)}`;
}

const hexToDecimal = hex => {
    return parseInt(hex, 16);
}

const moveCursor = (event, cursor) => {
    const mouseY = event.clientY;
    const mouseX = event.clientX;
    cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
}

const autocompleteHex = hex => {
    let endHex;
    switch (hex.length) {
        case 0:
            endHex = '0'.repeat(6);
            break;
        case 1:
        case 2:
            endHex = hex.repeat(6 / hex.length);
            break;
        case 3:
            endHex = hex[0].repeat(2) + hex[1].repeat(2) + hex[2].repeat(2);
            break;
        case 4:
            r = hexToDecimal(hex.slice(0, 2));
            g = hexToDecimal(hex.slice(2));
            b = Math.floor((r + g) / 2);
            endHex = rgbToHex([r, g, b]);
            break;
        case 5:
            endHex = hex + hex.slice(-1);
            break;
        case 6:
            endHex = hex;
    }
    return endHex;
}

/* -------------------------------- HANDLERS -------------------------------- */


const handleHover = event => {
    elemCurrent = event.target;
    if (elemCurrent.className.includes('wrapper')) return;
    if (clicked) elemCurrent.style.backgroundColor = currentColor;
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

const handleEraser = () => {
    if (!elemBtnEraser.className.includes('switched-on')) {
        [elemBtnEraser, elemBtnBrush].forEach(item => item.classList.toggle('switched-on'))
        cachedColor = currentColor;
        currentColor = DEFAULT_COLOR;
    }
}

const handleBrush = () => {
    if (!elemBtnBrush.className.includes('switched-on')) {
        [elemBtnEraser, elemBtnBrush].forEach(item => item.classList.toggle('switched-on'))
        currentColor = cachedColor;
    }
}

const handleColorChange = () => {
    const color = elemColorInput.value;
    elemColorHex.value = color.slice(1);
    setColor(color);
}

const handleEyedropper = event => {
    if (!eyedropper) {
        const cursor = document.createElement("div");
        cursor.classList.add('eyedropper-cursor');
        cursor.innerHTML = `<i class="fa-solid fa-eye-dropper"></i>`;
        document.body.insertAdjacentElement('afterbegin', cursor);
        moveCursor(event, cursor);
        setTimeout(() => eyedropper = true, 1);
    }
    elemRoot.classList.add('eyedropper-on');
}

const handleClick = event => {
    elemClicked = event.target
    if (eyedropper && elemClicked.closest('.color__picker') !== elemColorEyedropper) {
        eyedropper = false;
        document.querySelector('.eyedropper-cursor').remove();
        elemRoot.classList.remove('eyedropper-on');
        if (elemClicked.closest('.grid__wrapper')) {
            const color = elemClicked.style.backgroundColor;
            const rgbArray = color.slice(4, -1).split(', ');
            const hex = '#' + rgbToHex(rgbArray);
            setColor(hex);
            elemColorInput.value = hex;
            elemColorHex.value = hex.slice(1);

        }
    } else if (elemClicked.closest('.grid__wrapper')) {
        clicked = true;
        handleHover(event);
    }
}

const handleMouseMove = event => {
    const cursor = document.querySelector('.eyedropper-cursor');
    if (cursor) moveCursor(event, cursor);
}

const handleHexInput = () => {
    const caretPos = elemColorHex.selectionStart;
    const matches = elemColorHex.value.match(HEX_REGEX);
    const matchCount = matches ? matches.length : 0;
    elemColorHex.value = elemColorHex.value.replaceAll(HEX_REGEX, '');
    elemColorHex.selectionStart = caretPos - matchCount;
    elemColorHex.selectionEnd = caretPos - matchCount;

    const color = '#' + autocompleteHex(elemColorHex.value);
    setColor(color);
    elemColorInput.value = color;
}

/* --------------------------------- EVENTS --------------------------------- */

window.addEventListener('mousedown', handleClick);
window.addEventListener('mousemove', handleMouseMove);
elemGridWrapper.addEventListener('mouseover', handleHover);
window.addEventListener('mouseup', handleRelease);
elemBtnReset.addEventListener('click', handleReset);
elemBtnBoard.addEventListener('click', handleNewBoard);
elemBtnGrid.addEventListener('click', handleToggleGrid);
elemBtnEraser.addEventListener('click', handleEraser);
elemBtnBrush.addEventListener('click', handleBrush);
elemColorInput.addEventListener('input', handleColorChange);
elemColorEyedropper.addEventListener('click', handleEyedropper);
elemColorHex.addEventListener('input', handleHexInput);

/* ---------------------------------- MAIN ---------------------------------- */

createBoard(DEFAULT_ITEM_COUNT);
elemColorInput.value = currentColor;
elemColorHex.value = currentColor.slice(1);