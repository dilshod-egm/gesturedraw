// Canvas Draw

// Получение элементов DOM и контекста холста
const canvas = document.querySelector("canvas");
const toolBtns = document.querySelectorAll(".tool");
const fillColor = document.querySelector("#fill-color");
const sizeSlider = document.querySelector("#size-slider");
const colorBtns = document.querySelectorAll(".colors .option");
const colorPicker = document.querySelector("#color-picker");
const clearcanvas = document.querySelector(".clear-canvas");
const saveImg = document.querySelector(".save-img");
const ctx = canvas.getContext("2d");

// Инициализация переменных для рисования
let prevMouseX, prevMouseY, snapshot;
let isDrawing = false;
let selectedTool = "brush";
let brushWidth = 5;
let selectedColor = "#000";

// Установка фона холста и его размеров при загрузке страницы
const setCanvasBackground = () => {
  ctx.fillStyle = "#fff"; // Фон - белый
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Заполнить весь холст белым цветом
  ctx.fillStyle = selectedColor; // Установить текущий цвет
};

window.addEventListener("load", () => {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  setCanvasBackground();
});

// Функции для рисования геометрических фигур на холсте
const drawRect = (e) => {
  // Если флажок "Заливка" не установлен, рисуем прямоугольник с контуром
  if (!fillColor.checked) {
    return ctx.strokeRect(
      e.offsetX,
      e.offsetY,
      prevMouseX - e.offsetX,
      prevMouseY - e.offsetY
    );
  }
  ctx.fillRect(
    e.offsetX,
    e.offsetY,
    prevMouseX - e.offsetX,
    prevMouseY - e.offsetY
  );
};

const drawCircle = (e) => {
  ctx.beginPath();
  let radius = Math.sqrt(
    Math.pow(prevMouseX - e.offsetX, 2) + (Math.pow(prevMouseY - e.offsetY), 2)
  );
  ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
  fillColor.checked ? ctx.fill() : ctx.stroke();
};

const drawTriangle = (e) => {
  ctx.beginPath();
  ctx.moveTo(prevMouseX, prevMouseY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
  ctx.closePath();
  fillColor.checked ? ctx.fill() : ctx.stroke();
};

const startDraw = (e) => {
  isDrawing = true;
  prevMouseX = e.offsetX;
  prevMouseY = e.offsetY;
  ctx.beginPath();
  ctx.lineWidth = brushWidth;
  ctx.strokeStyle = selectedColor;
  ctx.fillStyle = selectedColor;
  snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
};

const drawing = (e) => {
  if (!isDrawing) return;
  ctx.putImageData(snapshot, 0, 0);
  if (selectedTool === "brush" || selectedTool === "eraser") {
    ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  } else if (selectedTool === "rectangle") {
    drawRect(e);
  } else if (selectedTool === "circle") {
    drawCircle(e);
  } else {
    drawTriangle(e);
  }
};

// Обработчики событий для кнопок инструментов
toolBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".options .active").classList.remove("active");
    btn.classList.add("active");
    selectedTool = btn.id; // Установка выбранного инструмента (кисть, ластик, прямоугольник и т. д.)
  });
});

// Обработчик изменения размера кисти
sizeSlider.addEventListener("change", () => (brushWidth = sizeSlider.value));

// Обработчики событий для выбора цвета
colorBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".options .selected").classList.remove("selected");
    btn.classList.add("selected");
    selectedColor = window
      .getComputedStyle(btn)
      .getPropertyValue("background-color"); // Установка выбранного цвета
  });
});

// Обработчик изменения цвета с помощью colorPicker
colorPicker.addEventListener("change", () => {
  colorPicker.parentElement.style.background = colorPicker.value;
  colorPicker.parentElement.click();
});

// Обработчик очистки холста
clearcanvas.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Очистка холста
  setCanvasBackground();
});

// Обработчик сохранения изображения
saveImg.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = `${Date.now()}.jpg`;
  link.href = canvas.toDataURL();
  link.click();
});

// Обработчики событий для рисования на холсте
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", () => (isDrawing = false));

// Gesture Cursor

// Получение элементов DOM для управления предпочтительной рукой
const leftyCheckbox = document.querySelector("#hand_choice");
leftyCheckbox.addEventListener("change", () => {
  OPTIONS.PREFERRED_HAND = leftyCheckbox.checked ? "left" : "right"; // Установка предпочтительной руки
});

// Настройки опций жестов
const OPTIONS = {
  IS_DEBUG_MODE: false, // Режим отладки (отображение отладочной информации)
  PREFERRED_HAND: leftyCheckbox.checked ? "left" : "right", // Предпочтительная рука
  PINCH_DELAY_MS: 60, // Задержка для жеста щипка
};

// Состояние жестов
const state = {
  isPinched: false,
  pinchChangeTimeout: null,
  grabbedElement: null,
  lastGrabbedElement: null,
};

// События жеста "щипок"
const PINCH_EVENTS = {
  START: "pinch_start",
  MOVE: "pinch_move",
  STOP: "pinch_stop",
  PICK_UP: "pinch_pick_up",
  DROP: "pinch_drop",
};

// Функция для вызова пользовательского события
function triggerEvent({ eventName, eventData }) {
  const event = new CustomEvent(eventName, { detail: eventData });
  document.dispatchEvent(event);
}

// Получение элемента видеопотока и холста для отладки
const videoElement = document.querySelector(".input_video");
const debugCanvas = document.querySelector(".output_canvas");
const debugCanvasCtx = debugCanvas.getContext("2d");

// Курсор и движимые элементы
const cursor = document.querySelector(".cursor");
const movableElements = [...document.querySelectorAll(".movable")];

// Определение частей руки для отслеживания
const handParts = {
  wrist: 0,
  thumb: { base: 1, middle: 2, topKnuckle: 3, tip: 4 },
  indexFinger: { base: 5, middle: 6, topKnuckle: 7, tip: 8 },
  middleFinger: { base: 9, middle: 10, topKnuckle: 11, tip: 12 },
  ringFinger: { base: 13, middle: 14, topKnuckle: 15, tip: 16 },
  pinky: { base: 17, middle: 18, topKnuckle: 19, tip: 20 },
};

// Функция для получения координат элемента DOM
function getElementCoords(element) {
  const rect = element.getBoundingClientRect();
  const elementTop = rect.top / window.innerHeight;
  const elementBottom = rect.bottom / window.innerHeight;
  const elementLeft = rect.left / window.innerWidth;
  const elementRight = rect.right / window.innerWidth;
  return { elementTop, elementBottom, elementLeft, elementRight };
}

// Функция для проверки, находится ли щипок над элементом
function isElementPinched({
  pinchX,
  pinchY,
  elementTop,
  elementBottom,
  elementLeft,
  elementRight,
}) {
  const isPinchInXRange = elementLeft <= pinchX && pinchX <= elementRight;
  const isPinchInYRange = elementTop <= pinchY && pinchY <= elementBottom;
  return isPinchInXRange && isPinchInYRange;
}

// Функция для определения элемента, над которым находится щипок
function getPinchedElement({ pinchX, pinchY, elements }) {
  let grabbedElement;
  for (const element of elements) {
    const elementCoords = getElementCoords(element);
    if (isElementPinched({ pinchX, pinchY, ...elementCoords })) {
      grabbedElement = {
        domNode: element,
        coords: {
          x: elementCoords.elementLeft,
          y: elementCoords.elementTop,
        },
        offsetFromCorner: {
          x: pinchX - elementCoords.elementLeft,
          y: pinchY - elementCoords.elementTop,
        },
      };
      const isTopElement = element === state.lastGrabbedElement;
      if (isTopElement) {
        return grabbedElement;
      }
    }
  }
  return grabbedElement;
}

// Функция для отладочного вывода в консоль
function log(...args) {
  if (OPTIONS.IS_DEBUG_MODE) {
    console.log(...args);
  }
}

// Функция для получения текущей руки (левой или правой)
function getCurrentHand(handData) {
  const isHandAvailable = !!handData.multiHandLandmarks?.[0];
  if (!isHandAvailable) {
    return null;
  }
  const mirroredHand =
    handData.multiHandedness[0].label === "Left" ? "right" : "left";
  return mirroredHand;
}

// Функция для определения, что произошел жест "щипок"
function isPinched(handData) {
  if (isPrimaryHandAvailable(handData)) {
    const fingerTip = handData.multiHandLandmarks[0][handParts.indexFinger.tip];
    const thumbTip = handData.multiHandLandmarks[0][handParts.thumb.tip];
    const distance = {
      x: Math.abs(fingerTip.x - thumbTip.x),
      y: Math.abs(fingerTip.y - thumbTip.y),
      z: Math.abs(fingerTip.z - thumbTip.z),
    };
    const areFingersCloseEnough =
      distance.x < 0.08 && distance.y < 0.08 && distance.z < 0.11;
    log(distance);
    log({ isPinched: areFingersCloseEnough });
    return areFingersCloseEnough;
  }
  return false;
}

// Функция для преобразования координат в позицию элемента DOM
function convertCoordsToDomPosition({ x, y }) {
  return {
    x: `${x * 100}vw`,
    y: `${y * 100}vh`,
  };
}

// Функция для обновления отладочного холста с отображением руки
function updateDebugCanvas(handData) {
  debugCanvasCtx.save();
  debugCanvasCtx.clearRect(0, 0, debugCanvas.width, debugCanvas.height);
  debugCanvasCtx.drawImage(
    handData.image,
    0,
    0,
    debugCanvas.width,
    debugCanvas.height
  );
  if (handData.multiHandLandmarks) {
    for (const landmarks of handData.multiHandLandmarks) {
      drawConnectors(debugCanvasCtx, landmarks, HAND_CONNECTIONS, {
        color: "#0ff",
        lineWidth: 5,
      });
      drawLandmarks(debugCanvasCtx, landmarks, { color: "#f0f", lineWidth: 2 });
    }
  }
  debugCanvasCtx.restore();
}

// Функция для получения координат курсора на основе данных о руке
function getCursorCoords(handData) {
  const { x, y, z } =
    handData.multiHandLandmarks[0][handParts.indexFinger.middle];
  const mirroredXCoord = -x + 1; /* из-за отражения камеры */
  return { x: mirroredXCoord, y, z };
}

// Функция для проверки доступности первичной руки
function isPrimaryHandAvailable(handData) {
  return getCurrentHand(handData) === OPTIONS.PREFERRED_HAND;
}

// Функция, вызываемая при получении результатов анализа жестов
function onResults(handData) {
  if (!handData) {
    return;
  }
  if (OPTIONS.IS_DEBUG_MODE) {
    updateDebugCanvas(handData);
  }

  updateCursor(handData);
  updatePinchState(handData);
}

// Функция для обновления положения курсора
function updateCursor(handData) {
  if (isPrimaryHandAvailable(handData)) {
    const cursorCoords = getCursorCoords(handData);
    if (!cursorCoords) {
      return;
    }
    const { x, y } = convertCoordsToDomPosition(cursorCoords);
    cursor.style.transform = `translate(${x}, ${y})`;
  }
}

// Функция для обновления состояния жеста "щипок"
function updatePinchState(handData) {
  const wasPinchedBefore = state.isPinched;
  const isPinchedNow = isPinched(handData);
  const hasPassedPinchThreshold = isPinchedNow !== wasPinchedBefore;
  const hasWaitStarted = !!state.pinchChangeTimeout;

  if (hasPassedPinchThreshold && !hasWaitStarted) {
    registerChangeAfterWait(handData, isPinchedNow);
  }

  if (!hasPassedPinchThreshold) {
    cancelWaitForChange();
    if (isPinchedNow) {
      triggerEvent({
        eventName: PINCH_EVENTS.MOVE,
        eventData: getCursorCoords(handData),
      });
    }
  }
}

// Функция для регистрации изменения после задержки
function registerChangeAfterWait(handData, isPinchedNow) {
  state.pinchChangeTimeout = setTimeout(() => {
    state.isPinched = isPinchedNow;
    triggerEvent({
      eventName: isPinchedNow ? PINCH_EVENTS.START : PINCH_EVENTS.STOP,
      eventData: getCursorCoords(handData),
    });
  }, OPTIONS.PINCH_DELAY_MS);
}

// Функция для отмены ожидания изменения состояния жеста "щипок"
function cancelWaitForChange() {
  clearTimeout(state.pinchChangeTimeout);
  state.pinchChangeTimeout = null;
}

// Добавление обработчиков событий для событий жеста "щипок"
document.addEventListener(PINCH_EVENTS.START, onPinchStart);
document.addEventListener(PINCH_EVENTS.MOVE, onPinchMove);
document.addEventListener(PINCH_EVENTS.STOP, onPinchStop);

// Обработчик события начала жеста "щипок"
function onPinchStart(eventInfo) {
  const cursorCoords = eventInfo.detail;

  console.log("Pinch started!");

  state.grabbedElement = getPinchedElement({
    pinchX: cursorCoords.x,
    pinchY: cursorCoords.y,
    elements: movableElements,
  });
  if (state.grabbedElement) {
    // Включаем режим рисования при начале щипка
    triggerEvent({
      eventName: PINCH_EVENTS.PICK_UP,
      eventData: state.grabbedElement.domNode,
    });
  }

  document.body.classList.add("is-pinched");
}

// Обработчик события движения жеста "щипок"
function onPinchMove(eventInfo) {
  const cursorCoords = eventInfo.detail;
  console.log("Pinch Move");

  if (state.grabbedElement) {
    state.grabbedElement.coords = {
      x: cursorCoords.x - state.grabbedElement.offsetFromCorner.x,
      y: cursorCoords.y - state.grabbedElement.offsetFromCorner.y,
    };

    const { x, y } = convertCoordsToDomPosition(state.grabbedElement.coords);
    state.grabbedElement.domNode.style.transform = `translate(${x}, ${y})`;
  }
}

// Обработчик события завершения жеста "щипок"
function onPinchStop() {
  document.body.classList.remove("is-pinched");
  console.log("Pinch stopped!");
  if (state.grabbedElement) {
    // Останавливаем режим рисования при завершении щипка
    stopDrawing();
    triggerEvent({
      eventName: PINCH_EVENTS.DROP,
      eventData: state.grabbedElement.domNode,
    });
  }
}

// Создание объекта для отслеживания жестов рук (используется библиотека MediaPipe)
const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  },
});
hands.setOptions({
  maxNumHands: 1, // Максимальное количество отслеживаемых рук
  modelComplexity: 1, // Сложность модели
  minDetectionConfidence: 0.5, // Минимальная уверенность в обнаружении
  minTrackingConfidence: 0.5, // Минимальная уверенность в отслеживании
});
hands.onResults(onResults);

// Ваш класс .drawing-canvas
const drawingBoard = document.querySelector(".drawing-canvas");

// Обработчик события начала жеста "щипок"
document.addEventListener(PINCH_EVENTS.START, onPinchStart);

function onPinchStart(eventInfo) {
  const cursorCoords = eventInfo.detail;

  // Проверяем, находится ли щипок над холстом
  if (
    isElementPinched({
      pinchX: cursorCoords.x,
      pinchY: cursorCoords.y,
      ...getElementCoords(drawingBoard),
    })
  ) {
    // Включаем режим рисования при начале щипка над холстом
    startDrawing();
  }
}

// Обработчик события движения жеста "щипок"
document.addEventListener(PINCH_EVENTS.MOVE, onPinchMove);

function onPinchMove(eventInfo) {
  const cursorCoords = eventInfo.detail;

  // Проверяем, включен ли режим рисования
  if (isDrawing) {
    // Получаем координаты курсора на холсте
    const canvasX = cursorCoords.x * canvas.width;
    const canvasY = cursorCoords.y * canvas.height;

    // Рисуем на холсте (ваша логика рисования)
    ctx.lineTo(canvasX, canvasY);
    ctx.stroke();
  }
}

// Функция для включения режима рисования
function startDrawing() {
  isDrawing = true;
  ctx.beginPath();
  ctx.strokeStyle = selectedColor;
  ctx.lineWidth = brushWidth;
}

// Функция для выключения режима рисования
function stopDrawing() {
  isDrawing = false;
  ctx.closePath();
}

// Создание объекта для работы с видеопотоком
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 1280, // Ширина видеопотока
  height: 720, // Высота видеопотока
});
camera.start();
