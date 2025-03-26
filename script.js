/* -------------------------------- ELEMENTS -------------------------------- */

const elemGridWrapper = document.querySelector('.grid__wrapper');
const elemBtnReset = document.querySelector('.btn--reset');
const elemBtnBoard = document.querySelector('.btn--board');
const elemBtnGrid = document.querySelector('.btn--grid');
const elemBtnSave = document.querySelector('.btn--save');
const elemBtnEraser = document.querySelector('.btn--eraser');
const elemBtnBrush = document.querySelector('.btn--brush');
const elemColorInput = document.querySelector('.color__input');
const elemColorHex = document.querySelector('.color__hex__input');
const elemColorEyedropper = document.querySelector('.color__picker');
const elemColorWrapper = document.querySelector('.color__wrapper');
const elemBtnClassic = document.querySelector('.btn--classic');
const elemBtnClassicLabel = document.querySelector('.label__mode-opacity');
const elemBtnRandom = document.querySelector('.btn--random');
const elemBtnRandomLabel = document.querySelector('.label__mode-hue');
const elemSliderOpacity = document.querySelector('.slider__opacity');
const elemSliderOpacityLabel = document.querySelector('.slider__opacity__label');
const elemSliderRandomness = document.querySelector('.slider__randomness');
const elemSliderRandomnessLabel = document.querySelector('.slider__randomness__label');
const elemRoot = document.documentElement;

/* -------------------------------- CONSTANTS ------------------------------- */

const DEFAULT_ITEM_COUNT = 16;
const MAX_ITEM_COUNT = 100;
const MAX_SLIDER_LABEL_LENGTH = 4;
const HEX_REGEX = /([^a-f0-9])/gi;
const NUM_REGEX = /([^0-9\.])/gi;
const DEFAULT_COLOR = '#ffffff';
const DEFAULT_OPACITY = 100;
const DEFAULT_RANDOMNESS = 0;

/* -------------------------------- VARIABLES ------------------------------- */

let clicked = false;
let eyedropper = false;
let random = false;
let eraser = false;
let currentColor = '#222222';
let cachedColor = currentColor;
let cachedEyedropperColor;
let cachedMode, cachedModeLabel;
let cachedSettings = {
    brush: new InitCachedSettings(DEFAULT_OPACITY, DEFAULT_RANDOMNESS),
    eraser: new InitCachedSettings(DEFAULT_OPACITY, DEFAULT_RANDOMNESS)
}
let modeButtons = [...document.querySelectorAll('.btn--mode')];

/* -------------------------------- FUNCTIONS ------------------------------- */

function InitCachedSettings(opacity, randomness) {
    this.opacity = opacity;
    this.randomness = randomness;

    this.update = function (opacity, randomness) {
        this.opacity = opacity;
        this.randomness = randomness;
    }
}

const updateSliders = (opacity, randomness) => {
    elemSliderOpacity.value = elemSliderOpacityLabel.value = opacity
    elemSliderRandomness.value = elemSliderRandomnessLabel.value = randomness
}

const createBoard = itemCount => {
    elemRoot.style.setProperty('--gridItemCount', itemCount);
    elemGridWrapper.innerHTML = '';
    for (let i = 0; i < itemCount ** 2; i++) {
        elemGridWrapper.insertAdjacentHTML('beforeend', `
    <div class="grid__item" style="background-color: #fff"></div>
    `)
    }
};

const separateHexValues = hex => {
    if (hex[0] == '#') hex = hex.slice(1);
    r = hexToDecimal(hex.slice(0, 2));
    g = hexToDecimal(hex.slice(2, 4));
    b = hexToDecimal(hex.slice(4));
    return [r, g, b];
}

const setHexInputColor = brushColor => {
    rgb = separateHexValues(brushColor);
    if (rgb[0] + rgb[1] + rgb[2] > 255 * 3 / 2) {
        elemColorWrapper.classList.add('dark');
    } else elemColorWrapper.classList.remove('dark');
}

const setColor = color => {
    if (elemBtnBrush.className.includes('switched-on')) {
        currentColor = color;
    } else cachedColor = color;

    setHexInputColor(color);
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

const switchButtons = (clickedButton, otherButtons, additionalCommands) => {
    if (!clickedButton.className.includes('switched-on')) {
        let btnList;
        if (Array.isArray(otherButtons)) {
            btnList = [clickedButton, ...otherButtons];
        } else btnList = [clickedButton, otherButtons];
        btnList.forEach(item => item.classList.toggle('switched-on'));
        additionalCommands();
    }
}

const randomizeColor = (decimalColor, factor) => {
    factor = Math.sqrt(factor ** 5);
    const randomValue = (Math.floor(Math.random() * 255 * 2 + 1) - 255);
    let newColor = decimalColor + randomValue * factor;
    if (newColor > 255) {
        newColor = 255;
    } else if (newColor < 0) {
        newColor = 0;
    }
    return newColor;
}

const randomizeOpacity = (opacity, factor) => {
    factor = Math.sqrt(factor ** 4);
    const randomValue = (Math.floor(Math.random() * 100 * 2 + 1) - 100) / 100;
    let newOpacity = opacity + randomValue * factor;
    if (newOpacity > 1) {
        newOpacity = 1;
    } else if (newOpacity < 0) {
        newOpacity = 0;
    }
    return newOpacity;
}

const selectTextInput = element => {
    element.select();
}

const interpolateWithOpacity = (firstValue, secondValue, opacity) => {
    return Math.round(+firstValue * (1 - opacity) + +secondValue * opacity);
}

const calculateWithOpacity = (elemCurrent, rgbArray, opacity) => {
    const oldColor = elemCurrent.style.backgroundColor;
    const oldRgb = oldColor.slice(4, -1).split(', ');
    return [
        interpolateWithOpacity(oldRgb[0], rgbArray[0], opacity),
        interpolateWithOpacity(oldRgb[1], rgbArray[1], opacity),
        interpolateWithOpacity(oldRgb[2], rgbArray[2], opacity)
    ];
}

const sanitizeInput = (element, regex) => {
    const caretPos = element.selectionStart;
    const matches = element.value.match(regex);
    const matchCount = matches ? matches.length : 0;
    element.value = element.value.replaceAll(regex, '');
    element.selectionStart = caretPos - matchCount;
    element.selectionEnd = caretPos - matchCount;
}

const savePixelArt = () => {
    const grid = elemGridWrapper;
    const divs = grid.querySelectorAll("div");
    const gridSize = Math.sqrt(divs.length);

    // Create a canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const pixelSize = divs[0].offsetWidth * 2;
    canvas.width = canvas.height = gridSize * pixelSize;

    // Draw divs onto the canvas
    divs.forEach((div, index) => {
        const x = (index % gridSize) * pixelSize;
        const y = Math.floor(index / gridSize) * pixelSize;
        ctx.fillStyle = window.getComputedStyle(div).backgroundColor;
        ctx.fillRect(x, y, pixelSize, pixelSize);
    });

    // Convert canvas to image and download
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "pixel-art.png";
    link.click();
}

/* -------------------------------- HANDLERS -------------------------------- */

const handleHover = event => {
    elemCurrent = event.target;
    if (elemCurrent.closest('.grid__wrapper')) {
        console.log('aa');
        if (elemCurrent.className.includes('wrapper')) return;
        if (eyedropper) {
            const hoverColorArray = elemCurrent.style.backgroundColor.slice(4, -1).split(', ');
            const hoverColorHex = rgbToHex(hoverColorArray);
            elemColorInput.value = '#' + hoverColorHex;
            elemColorHex.value = hoverColorHex;
            setHexInputColor(hoverColorHex);
        }
        if (clicked) {
            const rgb = separateHexValues(currentColor);
            let r = rgb[0];
            let g = rgb[1];
            let b = rgb[2];

            const opacityValue = +elemSliderOpacity.value / 100;
            const randomnessValue = +elemSliderRandomness.value / 100;

            let opacity = opacityValue;
            if (random) {
                r = randomizeColor(r, randomnessValue);
                g = randomizeColor(g, randomnessValue);
                b = randomizeColor(b, randomnessValue);
            } else opacity = randomizeOpacity(opacity, randomnessValue);
            const rgbOpacity = calculateWithOpacity(elemCurrent, [r, g, b], opacity);
            const newColor = '#' + rgbToHex(rgbOpacity);
            elemCurrent.style.backgroundColor = newColor;
        }
    } else if (eyedropper) {
        updateColorDisplay();
    }
};

const updateColorDisplay = () => {
    elemColorInput.value = cachedEyedropperColor;
    elemColorHex.value = cachedEyedropperColor.slice(1);
    setHexInputColor(cachedEyedropperColor);
}

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
    switchButtons(elemBtnEraser, elemBtnBrush, () => {
        cachedColor = currentColor;
        currentColor = DEFAULT_COLOR;
        eraser = true;
    })
    cachedMode = document.querySelector('.btn--mode.switched-on');
    cachedModeLabel = document.querySelector('.label__mode span.switched-on')
    modeButtons.forEach(item => {
        item.classList.remove('switched-on');
        item.classList.add('disabled');
        random = false;
    });
    cachedModeLabel.classList.remove('switched-on');

    cachedSettings.brush.update(elemSliderOpacity.value, elemSliderRandomness.value);
    updateSliders(cachedSettings.eraser.opacity, cachedSettings.eraser.randomness);
}

const handleBrush = () => {
    switchButtons(elemBtnBrush, elemBtnEraser, () => {
        currentColor = cachedColor;
        eraser = false;
        if (cachedMode) {
            cachedMode.classList.add('switched-on');
            if (cachedMode.className.includes('btn--random')) random = true;
            cachedMode = null;
        }
        if (cachedModeLabel) cachedModeLabel.classList.add('switched-on');
        modeButtons.forEach(item => item.classList.remove('disabled'));
    })

    cachedSettings.eraser.update(elemSliderOpacity.value, elemSliderRandomness.value)
    updateSliders(cachedSettings.brush.opacity, cachedSettings.brush.randomness);
}

const handleColorChange = () => {
    const color = elemColorInput.value;
    elemColorHex.value = color.slice(1);
    setColor(color);
}

const handleEyedropper = event => {
    if (!eyedropper) {
        if (eraser) {
            cachedEyedropperColor = cachedColor;
        } else cachedEyedropperColor = currentColor;
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
        } else updateColorDisplay();
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
    sanitizeInput(elemColorHex, HEX_REGEX)

    const color = '#' + autocompleteHex(elemColorHex.value);
    setColor(color);
    elemColorInput.value = color;
}

const handleClassic = () => {
    if (!elemBtnClassic.className.includes('disabled')) {
        switchButtons(elemBtnClassic, elemBtnRandom, () => {
            random = false;
            elemBtnClassicLabel.classList.add('switched-on')
            elemBtnRandomLabel.classList.remove('switched-on')
        })
    }
}

const handleRandom = () => {
    if (!elemBtnRandom.className.includes('disabled')) {
        switchButtons(elemBtnRandom, elemBtnClassic, () => {
            random = true;
            elemBtnClassicLabel.classList.remove('switched-on')
            elemBtnRandomLabel.classList.add('switched-on')
        })
    }
}

const handleSlider = (slider, label) => {
    label.value = slider.value;
}

const handleSliderLabel = (label, slider) => {
    if (!label.value) {
        slider.value = 0;
        return;
    }

    sanitizeInput(label, NUM_REGEX);

    if (label.value[0] === '0' && label.value[1] !== '.') label.value = label.value[0];

    // ensure that only one dot is included in the input value
    let valueArray = label.value.split('.');
    if (valueArray.length > 2) {
        valueArray.forEach((item, index) => {
            valueArray[index] = item.replaceAll('.', '');
        })
        valueArray = [valueArray[0], valueArray.slice(1).join('')];
    }
    label.value = valueArray.join('.');

    const sliderMax = +slider.attributes.max.value;
    const sliderMin = +slider.attributes.min.value;
    if (+label.value > sliderMax) label.value = sliderMax;
    if (+label.value < sliderMin) label.value = sliderMin;

    if (label.value.length > MAX_SLIDER_LABEL_LENGTH) label.value = label.value.slice(0, MAX_SLIDER_LABEL_LENGTH);

    slider.value = label.value;
}

const handleChangeLabel = label => {
    if (!label.value) label.value = 0;
}

/* --------------------------------- EVENTS --------------------------------- */

window.addEventListener('mousedown', handleClick);
window.addEventListener('mousemove', handleMouseMove);
window.addEventListener('mouseover', handleHover);
window.addEventListener('mouseup', handleRelease);
elemBtnReset.addEventListener('click', handleReset);
elemBtnBoard.addEventListener('click', handleNewBoard);
elemBtnGrid.addEventListener('click', handleToggleGrid);
elemBtnSave.addEventListener('click', savePixelArt);
elemBtnEraser.addEventListener('click', handleEraser);
elemBtnBrush.addEventListener('click', handleBrush);
elemColorInput.addEventListener('input', handleColorChange);
elemColorEyedropper.addEventListener('click', handleEyedropper);
elemColorHex.addEventListener('input', handleHexInput);
elemColorHex.addEventListener('focus', () => selectTextInput(elemColorHex));
elemBtnClassic.addEventListener('click', handleClassic);
elemBtnRandom.addEventListener('click', handleRandom);
elemSliderOpacity.addEventListener('input', () => handleSlider(elemSliderOpacity, elemSliderOpacityLabel));
elemSliderOpacityLabel.addEventListener('focus', () => selectTextInput(elemSliderOpacityLabel));
elemSliderOpacityLabel.addEventListener('input', () => handleSliderLabel(elemSliderOpacityLabel, elemSliderOpacity));
elemSliderOpacityLabel.addEventListener('change', () => handleChangeLabel(elemSliderOpacityLabel));
elemSliderRandomness.addEventListener('input', () => handleSlider(elemSliderRandomness, elemSliderRandomnessLabel))
elemSliderRandomnessLabel.addEventListener('focus', () => selectTextInput(elemSliderRandomnessLabel));
elemSliderRandomnessLabel.addEventListener('input', () => handleSliderLabel(elemSliderRandomnessLabel, elemSliderRandomness));
elemSliderRandomnessLabel.addEventListener('change', () => handleChangeLabel(elemSliderRandomnessLabel));

/* ---------------------------------- INIT ---------------------------------- */

createBoard(DEFAULT_ITEM_COUNT);
elemColorInput.value = currentColor;
elemColorHex.value = currentColor.slice(1);
elemSliderOpacityLabel.value = DEFAULT_OPACITY;
elemSliderOpacity.value = DEFAULT_OPACITY;
elemSliderRandomnessLabel.value = DEFAULT_RANDOMNESS;
elemSliderRandomness.value = DEFAULT_RANDOMNESS;