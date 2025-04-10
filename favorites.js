// ======= Element References =======
const favoriteQuotesList = document.getElementById("favorite-quotes-list");
const favoriteAuthorsList = document.getElementById("favorite-authors-list");
const favoriteCategoriesList = document.getElementById(
  "favorite-categories-list"
);

// ======= Initial Rendering on Page Load =======
document.addEventListener("DOMContentLoaded", () => {
  renderFavoriteQuotes();
  renderFavoriteAuthors();
  renderFavoriteCategories();
});

// ======= Render Functions =======

// Render list of favorite quotes
function renderFavoriteQuotes() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favoriteQuotesList.innerHTML = "";

  if (favorites.length === 0) {
    favoriteQuotesList.innerHTML = "<li>No favorite quotes found.</li>";
    return;
  }

  favorites.forEach((favorite, index) => {
    const listItem = document.createElement("li");
    listItem.classList.add(
      "bg-white",
      "p-4",
      "rounded-lg",
      "shadow-md",
      "text-left",
      "italic",
      "relative"
    );

    listItem.innerHTML = `
      <blockquote>"${favorite.quote}"</blockquote>
      <p class="text-right text-gray-500">${favorite.author}</p>
      <button class="absolute top-2 right-1 text-red-500 hover:text-red-600" onclick="deleteFavoriteQuote(${index})">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    `;

    favoriteQuotesList.appendChild(listItem);
  });
}

// Render list of favorite authors
function renderFavoriteAuthors() {
  const savedAuthors = JSON.parse(localStorage.getItem("savedAuthors")) || [];
  favoriteAuthorsList.innerHTML = "";

  if (savedAuthors.length === 0) {
    favoriteAuthorsList.innerHTML = "<li>No favorite authors found.</li>";
    return;
  }

  savedAuthors.forEach((author, index) => {
    const listItem = document.createElement("li");
    listItem.classList.add(
      "bg-white",
      "p-4",
      "rounded-lg",
      "shadow-md",
      "text-left",
      "relative"
    );

    listItem.textContent = author.name;

    const deleteButton = document.createElement("button");
    deleteButton.classList.add(
      "absolute",
      "top-2",
      "right-1",
      "text-red-500",
      "hover:text-red-600"
    );
    deleteButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    `;
    deleteButton.onclick = () => deleteFavoriteAuthor(index);

    listItem.appendChild(deleteButton);
    favoriteAuthorsList.appendChild(listItem);
  });
}

// Render list of favorite categories
function renderFavoriteCategories() {
  const savedCategories =
    JSON.parse(localStorage.getItem("favoriteCategories")) || [];
  favoriteCategoriesList.innerHTML = "";

  if (savedCategories.length === 0) {
    favoriteCategoriesList.innerHTML = "<li>No favorite categories found.</li>";
    return;
  }

  savedCategories.forEach((category, index) => {
    const listItem = document.createElement("li");
    listItem.classList.add(
      "bg-white",
      "p-4",
      "rounded-lg",
      "shadow-md",
      "text-left",
      "relative"
    );

    listItem.textContent = category;

    const deleteButton = document.createElement("button");
    deleteButton.classList.add(
      "absolute",
      "top-2",
      "right-1",
      "text-red-500",
      "hover:text-red-600"
    );
    deleteButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    `;
    deleteButton.onclick = () => deleteFavoriteCategory(index);

    listItem.appendChild(deleteButton);
    favoriteCategoriesList.appendChild(listItem);
  });
}

// ======= Delete Functions =======

// Delete a favorite quote by index
function deleteFavoriteQuote(index) {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites.splice(index, 1);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavoriteQuotes();
}

// Delete a favorite author by index
function deleteFavoriteAuthor(index) {
  const savedAuthors = JSON.parse(localStorage.getItem("savedAuthors")) || [];
  savedAuthors.splice(index, 1);
  localStorage.setItem("savedAuthors", JSON.stringify(savedAuthors));
  renderFavoriteAuthors();
}

// Delete a favorite category by index
function deleteFavoriteCategory(index) {
  const savedCategories =
    JSON.parse(localStorage.getItem("favoriteCategories")) || [];
  savedCategories.splice(index, 1);
  localStorage.setItem("favoriteCategories", JSON.stringify(savedCategories));
  renderFavoriteCategories();
}
