import { 
  createCardElement, 
  deleteCard, 
  updateLikeState 
} from "./components/card.js";

import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners,
} from "./components/modal.js";
import { enableValidation } from "./components/validation.js";
import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setUserAvatar,
  addCard,
  deleteCardRequest,
  changeLikeCardStatus,
} from "./components/api.js";

const placesWrap = document.querySelector(".places__list");

const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(
  ".popup__input_type_description"
);

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

const statsPopup = document.querySelector(".popup_type_info");
const statsTitle = statsPopup.querySelector(".popup__title");
const statsList = statsPopup.querySelector(".popup__info");
const statsUsersTitle = statsPopup.querySelector(".popup__text");
const statsUsersList = statsPopup.querySelector(".popup__list");

const statsDefinitionTemplate = document.getElementById(
  "popup-info-definition-template"
);
const statsUserTemplate = document.getElementById(
  "popup-info-user-preview-template"
);

const logoButton = document.querySelector(".header__logo");

let currentUserId = null;
let cardToDelete = null;
let cardToDeleteId = null;

const renderLoading = (button, isLoading, normalText, loadingText) => {
  button.textContent = isLoading ? loadingText : normalText;
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;

  renderLoading(submitButton, true, "Сохранить", "Сохранение...");
  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch(console.log)
    .finally(() => {
      renderLoading(submitButton, false, "Сохранить", "Сохранение...");
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;

  renderLoading(submitButton, true, "Сохранить", "Сохранение...");
  setUserAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch(console.log)
    .finally(() => {
      renderLoading(submitButton, false, "Сохранить", "Сохранение...");
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;

  renderLoading(submitButton, true, "Создать", "Создание...");
  const name = cardNameInput.value;
  const link = cardLinkInput.value;

  addCard({ name, link })
    .then((newCard) => {
      const cardElement = createCardElement(newCard, {
        currentUserId,
        onPreviewPicture: handlePreviewPicture,
        onLikeIcon: handleLikeClick,
        onDeleteClick: handleDeleteClick,
      });

      placesWrap.prepend(cardElement);
      closeModalWindow(cardFormModalWindow);
      cardForm.reset();
    })
    .catch(console.log)
    .finally(() => {
      renderLoading(submitButton, false, "Создать", "Создание...");
    });
};

const handleDeleteClick = (cardElement, cardId) => {
  cardToDelete = cardElement;
  cardToDeleteId = cardId;
  openModalWindow(deleteConfirmPopup);
};

deleteConfirmForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;

  renderLoading(submitButton, true, "Да", "Удаление...");
  deleteCardRequest(cardToDeleteId)
    .then(() => {
      deleteCard(cardToDelete);
      closeModalWindow(deleteConfirmPopup);
    })
    .catch(console.log)
    .finally(() => {
      renderLoading(submitButton, false, "Да", "Удаление...");
    });
});

const handleLikeClick = (likeButton, cardId, likeCounter) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");

  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      updateLikeState(likeButton, likeCounter, updatedCard.likes);
    })
    .catch(console.log);
};

const createDefinitionItem = (term, description) => {
  const element = statsDefinitionTemplate.content.cloneNode(true);
  element.querySelector(".popup__info-term").textContent = term;
  element.querySelector(".popup__info-description").textContent = description;
  return element;
};

const createUserBadge = (name) => {
  const element = statsUserTemplate.content.cloneNode(true);
  element.querySelector(".popup__list-item").textContent = name;
  return element;
};

const handleOpenStats = () => {
  statsList.innerHTML = "";
  statsUsersList.innerHTML = "";
  statsTitle.textContent = "Статистика карточек";

  getCardList()
    .then((cards) => {
      const usersSet = new Set(cards.map((c) => c.owner.name));
      const totalUsers = usersSet.size;
      const totalLikes = cards.reduce((sum, c) => sum + c.likes.length, 0);
      const maxLikes = Math.max(...cards.map((c) => c.likes.length));
      const championCard = cards.find((c) => c.likes.length === maxLikes);
      const championName = championCard ? championCard.owner.name : "—";
      const popularCards = cards
        .filter((c) => c.likes.length === maxLikes)
        .map((c) => c.name);

      statsList.append(
        createDefinitionItem("Всего пользователей:", totalUsers)
      );
      statsList.append(createDefinitionItem("Всего лайков:", totalLikes));
      statsList.append(
        createDefinitionItem("Максимально лайков от одного:", maxLikes)
      );
      statsList.append(createDefinitionItem("Чемпион лайков:", championName));

      statsUsersTitle.textContent = "Популярные карточки:";
      popularCards.forEach((cardName) => {
        statsUsersList.append(createUserBadge(cardName));
      });

      openModalWindow(statsPopup);
    })
    .catch(console.log);
};

logoButton.addEventListener("click", handleOpenStats);

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
          onLikeIcon: handleLikeClick,
          onDeleteClick: handleDeleteClick,
        })
      )
    );
  })
  .catch(console.log);