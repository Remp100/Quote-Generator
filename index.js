const quoteElement = document.getElementById("quote");
const authorElement = document.getElementById("author");
const newQuoteButton = document.getElementById("new-quote");
const loadingElement = document.getElementById("loading");
const errorElement = document.getElementById("error");
const favoritesSection = document.getElementById("favorites-section");
const favoritesList = document.getElementById("favorites-list");
const favoritesActions = document.getElementById("favorites-actions");
const saveFavoriteButton = document.getElementById("save-favorite");

// Fetch a random quote from the API
async function fetchQuote() {
  loadingElement.classList.remove("hidden");
  errorElement.classList.add("hidden");

  try {
    const response = await fetch("http://api.quotable.io/random");
    if (!response.ok) {
      throw new Error("Failed to fetch the quote");
    }
    const data = await response.json();

    // Update the quote and author on the page
    quoteElement.textContent = `${data.content}`;
    authorElement.textContent = `- ${data.author}`;

    // Save the quote and author to localStorage
    localStorage.setItem("quote", data.content);
    localStorage.setItem("author", data.author);

    loadingElement.classList.add("hidden");
  } catch (error) {
    console.error("Error fetching quote:", error);
    errorElement.classList.remove("hidden");
    quoteElement.textContent = "Something went wrong. Please try again.";
    authorElement.textContent = "";
    loadingElement.classList.add("hidden");
  }
}

// Check if there's a saved quote in localStorage on page load
function loadSavedQuote() {
  const savedQuote = localStorage.getItem("quote");
  const savedAuthor = localStorage.getItem("author");

  if (savedQuote && savedAuthor) {
    quoteElement.textContent = savedQuote;
    authorElement.textContent = savedAuthor;
  } else {
    fetchQuote(); // If no saved quote, fetch a new one
  }
}

// Save the current quote to favorites in LocalStorage
function saveFavoriteQuote() {
  const currentQuote = quoteElement.textContent.trim();
  const currentAuthor = authorElement.textContent.trim();

  if (currentQuote === "Loading..." || !currentAuthor) {
    return;
  }

  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  // ✅ Check for duplicate quote+author
  const isDuplicate = favorites.some(
    (fav) =>
      fav.quote.trim() === currentQuote && fav.author.trim() === currentAuthor
  );

  if (isDuplicate) {
    errorElement.classList.remove("hidden");
    errorElement.textContent = "This quote is already saved to your favorites.";
    return;
  }

  // ✅ Save only if not duplicate
  favorites.push({ quote: currentQuote, author: currentAuthor });
  localStorage.setItem("favorites", JSON.stringify(favorites));

  errorElement.classList.add("hidden"); // Clear error on success
  renderFavorites();
}

// Remove a quote from favorites
function removeFavoriteQuote(index) {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites.splice(index, 1);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavorites();
}

// Attach the removeFavoriteQuote function to the window object
window.removeFavoriteQuote = removeFavoriteQuote;

// Render the list of favorite quotes
function renderFavorites() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favoritesList.innerHTML = "";

  if (favorites.length === 0) {
    favoritesSection.classList.add("hidden"); // Hide if no favorites
  } else {
    favoritesSection.classList.remove("hidden"); // Show if favorites exist
  }
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
                  <p class="text-right text-gray-500"> ${favorite.author}</p>
                  <button class="absolute top-2 right-1 text-red-500 hover:text-red-600" onclick="removeFavoriteQuote(${index})">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                  </button>
              `;
    favoritesList.appendChild(listItem);
  });
}

// Event listeners
newQuoteButton.addEventListener("click", fetchQuote);
saveFavoriteButton.addEventListener("click", saveFavoriteQuote);

// Initial quote load from localStorage or fetch if not present
loadSavedQuote();

// Load favorites on page load
renderFavorites();
