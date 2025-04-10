// ======= DOM Element References =======
const quoteElement = document.getElementById("quote");
const authorElement = document.getElementById("author");
const newQuoteButton = document.getElementById("new-quote");
const loadingElement = document.getElementById("loading");
const errorElement = document.getElementById("error");
const favoritesSection = document.getElementById("favorites-section");
const favoritesList = document.getElementById("favorites-list");
const favoritesActions = document.getElementById("favorites-actions");
const saveFavoriteButton = document.getElementById("save-favorite");

// ======= Quote Fetching and Display =======

// Fetch a random quote from API
async function fetchQuote() {
  loadingElement.classList.remove("hidden");
  errorElement.classList.add("hidden");

  try {
    const response = await fetch("https://api.quotable.io/random");
    if (!response.ok) {
      throw new Error("Failed to fetch the quote");
    }

    const data = await response.json();
    quoteElement.textContent = data.content;
    authorElement.textContent = `- ${data.author}`;

    localStorage.setItem("quote", data.content);
    localStorage.setItem("author", data.author);
  } catch (error) {
    console.error("Error fetching quote:", error);
    quoteElement.textContent = "Something went wrong. Please try again.";
    authorElement.textContent = "";
    errorElement.classList.remove("hidden");
  } finally {
    loadingElement.classList.add("hidden");
  }
}

// Load quote from localStorage if available
function loadSavedQuote() {
  const savedQuote = localStorage.getItem("quote");
  const savedAuthor = localStorage.getItem("author");

  if (savedQuote && savedAuthor) {
    quoteElement.textContent = savedQuote;
    authorElement.textContent = `- ${savedAuthor}`;
  } else {
    fetchQuote();
  }
}

// ======= Favorites Management =======

// Save current quote to favorites
function saveFavoriteQuote() {
  const currentQuote = quoteElement.textContent.trim();
  const currentAuthor = authorElement.textContent.trim();

  if (currentQuote === "Loading..." || !currentAuthor) return;

  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  const isDuplicate = favorites.some(
    (fav) =>
      fav.quote.trim() === currentQuote && fav.author.trim() === currentAuthor
  );

  if (isDuplicate) {
    errorElement.classList.remove("hidden");
    errorElement.textContent = "This quote is already saved to your favorites.";
    return;
  }

  favorites.push({ quote: currentQuote, author: currentAuthor });
  localStorage.setItem("favorites", JSON.stringify(favorites));
  errorElement.classList.add("hidden");
  renderFavorites();
}

// Remove quote from favorites by index
function removeFavoriteQuote(index) {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites.splice(index, 1);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavorites();
}

// Make removeFavoriteQuote accessible in inline HTML onclick
window.removeFavoriteQuote = removeFavoriteQuote;

// Render the list of favorite quotes
function renderFavorites() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favoritesList.innerHTML = "";

  if (favorites.length === 0) {
    favoritesSection.classList.add("hidden");
    return;
  }

  favoritesSection.classList.remove("hidden");

  favorites.forEach((favorite, index) => {
    const listItem = document.createElement("li");
    listItem.classList.add(
      "bg-white",
      "p-4",
      "rounded-lg",
      "shadow-md",
      "text-left",
      "flex",
      "flex-col",
      "space-y-2",
      "relative"
    );

    listItem.innerHTML = `
      <blockquote class="italic text-gray-600 py-4">"${favorite.quote}"</blockquote>
      <p class="text-right text-gray-500">${favorite.author}</p>
      <button class="absolute top-2 right-1 text-red-500 hover:text-red-600" onclick="removeFavoriteQuote(${index})">
        <svg xmlns="https://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    `;

    favoritesList.appendChild(listItem);
  });
}

// ======= Event Listeners =======
newQuoteButton.addEventListener("click", fetchQuote);
saveFavoriteButton.addEventListener("click", saveFavoriteQuote);

// ======= Initial Load =======
loadSavedQuote();
renderFavorites();
