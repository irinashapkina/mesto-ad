/*
  Файл index.js — точка входа в приложение.
  Здесь должна находиться только логика инициализации,
  все вспомогательные функции импортируются из отдельных модулей.

  ВНИМАНИЕ: из index.js ничего экспортировать нельзя!
*/

import {
  createCardElement,
  likeCard
} from "./components/card.js";

import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners
} from "./components/modal.js";

import { enableValidation } from "./components/validation.js";

import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setUserAvatar,
  addCard,
  deleteCardRequest
} from "./components/api.js";



const placesWrap = document.querySelector(".places__list");

const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");
const openCardFormButton = document.querySelector(".profile__add-button");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const deleteConfirmPopup = document.querySelector(".popup_type_remove-card");
const deleteConfirmForm = deleteConfirmPopup.querySelector(".popup__form");

let currentUserId = null;
let cardToDelete = null;
let cardToDeleteId = null;


const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch(console.log);
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();

  setUserAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch(console.log);
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();

  const name = cardNameInput.value;
  const link = cardLinkInput.value;

  addCard({ name, link })
    .then((newCard) => {
      const cardElement = createCardElement(newCard, {
        currentUserId,
        onPreviewPicture: handlePreviewPicture,
        onLikeIcon: likeCard,
        onDeleteClick: handleDeleteClick
      });

      placesWrap.prepend(cardElement);
      closeModalWindow(cardFormModalWindow);
      cardForm.reset();
    })
    .catch(console.log);
};

const handleDeleteClick = (cardElement, cardId) => {
  cardToDelete = cardElement;
  cardToDeleteId = cardId;
  openModalWindow(deleteConfirmPopup);
};

deleteConfirmForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  deleteCardRequest(cardToDeleteId)
    .then(() => {
      cardToDelete.remove();
      closeModalWindow(deleteConfirmPopup);
    })
    .catch(console.log);
});

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  openModalWindow(cardFormModalWindow);
});

document.querySelectorAll(".popup").forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});


enableValidation({
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
});


Promise.all([getUserInfo(), getCardList()])
  .then(([userData, cards]) => {
    currentUserId = userData._id;
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.reverse().forEach((card) =>
      placesWrap.append(
        createCardElement(card, {
          currentUserId,
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: likeCard,
          onDeleteClick: handleDeleteClick
        })
      )
    );
  })
  .catch(console.log);