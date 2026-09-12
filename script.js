const display = document.querySelector("#display");
const expression = document.querySelector("#expression");
const keys = document.querySelector(".keypad");

let currentValue = "0";
let storedValue = null;
let pendingOperator = null;
let shouldResetDisplay = false;

function updateDisplay() {
  display.textContent = currentValue;
  display.classList.remove("is-updated");
  void display.offsetWidth;
  display.classList.add("is-updated");
  expression.textContent = storedValue !== null && pendingOperator
    ? `${formatNumber(storedValue)} ${operatorLabel(pendingOperator)}`
    : "\u00a0";
}

function formatNumber(value) {
  return Number(value).toLocaleString("en-US", { maximumFractionDigits: 10 });
}

function operatorLabel(operator) {
  return { "+": "+", "-": "−", "*": "×", "/": "÷", "%": "%" }[operator];
}

function inputDigit(digit) {
  if (shouldResetDisplay || currentValue === "Error") {
    currentValue = digit;
    shouldResetDisplay = false;
  } else if (currentValue === "0") {
    currentValue = digit;
  } else if (currentValue.length < 15) {
    currentValue += digit;
  }
  updateDisplay();
}

function inputDecimal() {
  if (shouldResetDisplay || currentValue === "Error") {
    currentValue = "0.";
    shouldResetDisplay = false;
  } else if (!currentValue.includes(".")) {
    currentValue += ".";
  }
  updateDisplay();
}

function calculate(left, operator, right) {
  const first = Number(left);
  const second = Number(right);

  if (operator === "+") return first + second;
  if (operator === "-") return first - second;
  if (operator === "*") return first * second;
  if (operator === "/") return second === 0 ? null : first / second;
  if (operator === "%") return first % second;
  return second;
}

function chooseOperator(operator) {
  if (currentValue === "Error") return;

  if (pendingOperator && !shouldResetDisplay) {
    resolveCalculation();
  }

  storedValue = Number(currentValue);
  pendingOperator = operator;
  shouldResetDisplay = true;
  updateDisplay();
}

function resolveCalculation() {
  if (pendingOperator === null || storedValue === null) return;

  const result = calculate(storedValue, pendingOperator, currentValue);
  if (result === null || !Number.isFinite(result)) {
    currentValue = "Error";
    storedValue = null;
    pendingOperator = null;
    shouldResetDisplay = true;
    updateDisplay();
    return;
  }

  currentValue = String(Number(result.toPrecision(12)));
  storedValue = null;
  pendingOperator = null;
  shouldResetDisplay = true;
  updateDisplay();
}

function clearCalculator() {
  currentValue = "0";
  storedValue = null;
  pendingOperator = null;
  shouldResetDisplay = false;
  updateDisplay();
}

function deleteDigit() {
  if (shouldResetDisplay || currentValue === "Error") {
    clearCalculator();
    return;
  }
  currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : "0";
  updateDisplay();
}

function handleInput(value) {
  if (/\d/.test(value)) inputDigit(value);
  else if (value === ".") inputDecimal();
  else chooseOperator(value);
}

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.action === "clear") clearCalculator();
  else if (button.dataset.action === "delete") deleteDigit();
  else if (button.dataset.action === "equals") resolveCalculation();
  else handleInput(button.dataset.value);
});

document.addEventListener("keydown", (event) => {
  const key = event.key;
  if (/\d/.test(key) || key === ".") handleInput(key);
  else if (["+", "-", "*", "/", "%"].includes(key)) handleInput(key);
  else if (key === "Enter" || key === "=") resolveCalculation();
  else if (key === "Backspace") deleteDigit();
  else if (key === "Escape") clearCalculator();
});

updateDisplay();
