// Функция показывает сообщение об ошибке
function showInputError(formElement, inputElement, errorMessage, settings) {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  inputElement.classList.add(settings.inputErrorClass);
  errorElement.textContent = errorMessage;
  errorElement.classList.add(settings.errorClass);
}

// Функция скрывает сообщение об ошибке
function hideInputError(formElement, inputElement, settings) {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  inputElement.classList.remove(settings.inputErrorClass);
  errorElement.textContent = "";
  errorElement.classList.remove(settings.errorClass);
}

// Проверка валидности поля
function checkInputValidity(formElement, inputElement, settings) {
  // Кастомная проверка через регулярку, если есть data-error-message
  if (inputElement.dataset.errorMessage) {
    const regex = /^[A-Za-zА-Яа-яЁё\s-]+$/;
    if (!regex.test(inputElement.value)) {
      showInputError(formElement, inputElement, inputElement.dataset.errorMessage, settings);
      return;
    }
  }

  // Стандартная проверка HTML5
  if (!inputElement.validity.valid) {
    showInputError(formElement, inputElement, inputElement.validationMessage, settings);
    return;
  }

  hideInputError(formElement, inputElement, settings);
}

// Проверка: есть ли невалидные поля
function hasInvalidInput(inputList) {
  return inputList.some((inputElement) => !inputElement.validity.valid);
}

// Отключить кнопку
function disableSubmitButton(buttonElement, settings) {
  buttonElement.disabled = true;
  buttonElement.classList.add(settings.inactiveButtonClass);
}

// Включить кнопку
function enableSubmitButton(buttonElement, settings) {
  buttonElement.disabled = false;
  buttonElement.classList.remove(settings.inactiveButtonClass);
}

// Переключение состояния кнопки
function toggleButtonState(inputList, buttonElement, settings) {
  if (hasInvalidInput(inputList)) {
    disableSubmitButton(buttonElement, settings);
  } else {
    enableSubmitButton(buttonElement, settings);
  }
}

// Назначение слушателей
function setEventListeners(formElement, settings) {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);

  toggleButtonState(inputList, buttonElement, settings);

  inputList.forEach((inputElement) => {
    inputElement.addEventListener("input", () => {
      checkInputValidity(formElement, inputElement, settings);
      toggleButtonState(inputList, buttonElement, settings);
    });
  });
}

// Очистка ошибок при открытии формы
export function clearValidation(formElement, settings) {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);

  inputList.forEach((inputElement) => {
    hideInputError(formElement, inputElement, settings);
  });

  disableSubmitButton(buttonElement, settings);
}

// Включение валидации всех форм
export function enableValidation(settings) {
  const formList = Array.from(document.querySelectorAll(settings.formSelector));

  formList.forEach((formElement) => {
    setEventListeners(formElement, settings);
  });
}
