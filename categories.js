const categoryButtonsEl = document.getElementById("category-buttons");
const quotesContainerEl = document.getElementById("quotes-container");

let allCategories = [];
let favoriteQuotes = JSON.parse(localStorage.getItem("favorites")) || [];
let favoriteCategories =
  JSON.parse(localStorage.getItem("favoriteCategories")) || [];

// Fetch all categories (tags)
async function fetchCategories() {
  const res = await fetch("http://api.quotable.io/tags");
  const data = await res.json();
  allCategories = data;
  renderCategoryButtons();
}

// Render category buttons
function renderCategoryButtons() {
  categoryButtonsEl.innerHTML = "";

  allCategories.forEach((tag) => {
    const btn = document.createElement("button");
    btn.textContent = tag.name;
    btn.className = `px-4 py-2 rounded-full shadow text-sm ${
      favoriteCategories.includes(tag.name)
        ? "bg-yellow-400 text-white"
        : "bg-white text-gray-800"
    } hover:bg-blue-100 transition`;
    btn.addEventListener("click", () => {
      fetchQuotesByCategory(tag.name);
    });

    const heart = document.createElement("span");
    heart.textContent = favoriteCategories.includes(tag.name) ? "❤️" : "🤍";
    heart.className = "ml-2 cursor-pointer";
    heart.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent fetching quotes
      toggleFavoriteCategory(tag.name);
      renderCategoryButtons();
    });

    btn.appendChild(heart);
    categoryButtonsEl.appendChild(btn);
  });
}

// Fetch quotes by category
async function fetchQuotesByCategory(category) {
  quotesContainerEl.innerHTML = "<p>Loading quotes...</p>";

  try {
    const res = await fetch(
      `http://api.quotable.io/quotes?tags=${encodeURIComponent(
        category
      )}&limit=50`
    );
    const data = await res.json();

    renderQuotes(data.results, category);
  } catch (error) {
    quotesContainerEl.innerHTML =
      "<p class='text-red-500'>Failed to load quotes.</p>";
  }
}

// Render quotes in grid
function renderQuotes(quotes, category) {
  quotesContainerEl.innerHTML = "";

  if (quotes.length === 0) {
    quotesContainerEl.innerHTML =
      "<p class='text-gray-500'>No quotes found in this category.</p>";
    return;
  }

  quotes.forEach((quote) => {
    const card = document.createElement("div");
    card.className =
      "bg-white p-4 rounded-lg shadow-md flex flex-col justify-between";

    const quoteText = document.createElement("p");
    quoteText.className = "text-gray-800 italic mb-2";
    quoteText.textContent = `"${quote.content}"`;

    const authorText = document.createElement("p");
    authorText.className = "text-right text-sm text-gray-600";
    authorText.textContent = `— ${quote.author}`;

    const actions = document.createElement("div");
    actions.className = "mt-4 flex justify-between items-center";

    const categoryLabel = document.createElement("span");
    categoryLabel.className =
      "text-xs px-2 py-1 bg-blue-100 rounded-full text-blue-800";
    categoryLabel.textContent = category;

    const favBtn = document.createElement("button");
    const isFav = favoriteQuotes.some(
      (fav) =>
        fav.quote === quote.content.trim() && fav.author === quote.author.trim()
    );
    favBtn.textContent = isFav ? "💖" : "🤍";
    favBtn.className = "text-lg";
    favBtn.addEventListener("click", () => {
      toggleFavoriteQuote({ quote: quote.content, author: quote.author });
      renderQuotes(quotes, category);
    });

    actions.appendChild(categoryLabel);
    actions.appendChild(favBtn);

    card.appendChild(quoteText);
    card.appendChild(authorText);
    card.appendChild(actions);

    quotesContainerEl.appendChild(card);
  });
}

// Toggle favorite quote
function toggleFavoriteQuote(quoteObj) {
  const exists = favoriteQuotes.some(
    (q) => q.quote === quoteObj.quote && q.author === quoteObj.author
  );

  if (exists) {
    favoriteQuotes = favoriteQuotes.filter(
      (q) => !(q.quote === quoteObj.quote && q.author === quoteObj.author)
    );
  } else {
    favoriteQuotes.push(quoteObj);
  }

  localStorage.setItem("favorites", JSON.stringify(favoriteQuotes));
}

// Toggle favorite category
function toggleFavoriteCategory(categoryName) {
  if (favoriteCategories.includes(categoryName)) {
    favoriteCategories = favoriteCategories.filter((c) => c !== categoryName);
  } else {
    favoriteCategories.push(categoryName);
  }
  localStorage.setItem(
    "favoriteCategories",
    JSON.stringify(favoriteCategories)
  );
}

// Init
fetchCategories();
