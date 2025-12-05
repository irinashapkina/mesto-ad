export const deleteCard = (cardElement) => {
  cardElement.remove();
};

export const isCardLiked = (likes, userId) => {
  return likes.some((user) => user._id === userId);
};

export const updateLikeState = (likeButton, likeCounter, likesArray) => {
  likeButton.classList.toggle("card__like-button_is-active");
  likeCounter.textContent = likesArray.length;
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  { currentUserId, onPreviewPicture, onLikeIcon, onDeleteClick }
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCounter = cardElement.querySelector(".card__like-count");
  const deleteButton = cardElement.querySelector(
    ".card__control-button_type_delete"
  );
  const cardImage = cardElement.querySelector(".card__image");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  likeCounter.textContent = data.likes.length;

  if (isCardLiked(data.likes, currentUserId)) {
    likeButton.classList.add("card__like-button_is-active");
  }

  if (data.owner._id !== currentUserId) {
    deleteButton.remove();
  } else {
    deleteButton.addEventListener("click", () =>
      onDeleteClick(cardElement, data._id)
    );
  }

  likeButton.addEventListener("click", () =>
    onLikeIcon(likeButton, data._id, likeCounter)
  );

  cardImage.addEventListener("click", () =>
    onPreviewPicture({ name: data.name, link: data.link })
  );

  return cardElement;
};
