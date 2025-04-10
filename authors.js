// Get references to DOM elements
const filterElement = document.getElementById("filter");
const authorsListElement = document.getElementById("authors-list");
const searchElement = document.getElementById("search");

let allAuthors = []; // Global cache for fetched authors

// ======= Fetch & Data Utilities  =======

// Fetch all authors from the API (handles pagination)
async function fetchAllAuthors() {
  let page = 1;
  let authors = [];
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `http://api.quotable.io/authors?page=${page}&limit=100`
    );
    const data = await response.json();

    if (data.results.length > 0) {
      authors = authors.concat(data.results);
      page++;
    } else {
      hasMore = false;
    }
  }

  allAuthors = authors;
  return authors;
}

// Group authors by the first letter (or a special character group)
function groupAuthorsByLetter(authors) {
  const groups = {};

  authors.forEach((author) => {
    const firstChar = author.name.charAt(0).toUpperCase();
    const groupKey = /^[A-Za-z]/.test(firstChar)
      ? firstChar
      : "$%^& (Special Characters)";

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(author);
  });

  return groups;
}

// Sort authors alphabetically (ascending)
function sortAuthorsAsc(authors) {
  return authors.sort((a, b) => a.name.localeCompare(b.name));
}

// Sort authors alphabetically (descending)
function sortAuthorsDesc(authors) {
  return authors.sort((a, b) => b.name.localeCompare(a.name));
}

// ============= Rendering Functions ================

// Generate clickable alphabet bar based on author groups
function generateAlphabetBar(groupedAuthors) {
  const alphabetBar = document.getElementById("alphabet-bar");
  alphabetBar.innerHTML = "";

  Object.keys(groupedAuthors).forEach((letter) => {
    const button = document.createElement("button");
    button.textContent = letter;
    button.classList.add(
      "bg-white",
      "px-3",
      "py-1",
      "rounded-md",
      "shadow",
      "hover:bg-blue-100",
      "transition",
      "text-sm",
      "font-medium"
    );

    button.addEventListener("click", () => {
      const section = document.getElementById(`group-${letter}`);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    });

    alphabetBar.appendChild(button);
  });
}

// Render all authors grouped by letter
function renderAuthors(authors) {
  const savedAuthors = JSON.parse(localStorage.getItem("savedAuthors")) || [];
  authorsListElement.innerHTML = "";

  const groupedAuthors = groupAuthorsByLetter(authors);

  Object.keys(groupedAuthors).forEach((group) => {
    const groupContainer = document.createElement("div");
    groupContainer.className = "flex flex-col w-full mb-8";
    groupContainer.id = `group-${group}`;

    const groupHeader = document.createElement("h3");
    groupHeader.classList.add(
      "text-l",
      "font-semibold",
      "text-gray-800",
      "mb-2"
    );
    groupHeader.textContent = group;
    groupContainer.appendChild(groupHeader);

    const authorList = document.createElement("ul");
    authorList.classList.add("flex", "flex-wrap", "gap-4", "items-start");

    groupedAuthors[group].forEach((author) => {
      const isAuthorFav = savedAuthors.some((a) => a.name === author.name);

      const authorElement = document.createElement("div");
      authorElement.classList.add(
        "bg-white",
        "p-4",
        "rounded-lg",
        "shadow-md",
        "text-left",
        "hover:bg-blue-100",
        "transition",
        "duration-200",
        "min-w-[180px]",
        "flex",
        "justify-between",
        "items-start"
      );

      const nameBtn = document.createElement("button");
      nameBtn.innerHTML = `<h2 class="text-sm font-semibold text-gray-800">${author.name}</h2>`;
      nameBtn.addEventListener("click", () => showAuthorModal(author));

      const heart = document.createElement("span");
      heart.textContent = isAuthorFav ? "💖" : "🤍";
      heart.className = "text-lg cursor-pointer ml-2";
      heart.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFavoriteAuthor(author);
        renderAuthors(allAuthors);
      });

      authorElement.appendChild(nameBtn);
      authorElement.appendChild(heart);

      const listItem = document.createElement("li");
      listItem.appendChild(authorElement);
      authorList.appendChild(listItem);
    });

    groupContainer.appendChild(authorList);
    authorsListElement.appendChild(groupContainer);
  });

  generateAlphabetBar(groupedAuthors);
}

// ============= Favorites & Modals ===============

// Toggle favorite status for an author
function toggleFavoriteAuthor(authorObj) {
  let savedAuthors = JSON.parse(localStorage.getItem("savedAuthors")) || [];
  const exists = savedAuthors.some((a) => a.name === authorObj.name);

  if (exists) {
    savedAuthors = savedAuthors.filter((a) => a.name !== authorObj.name);
  } else {
    savedAuthors.push({ name: authorObj.name, bio: authorObj.bio });
  }

  localStorage.setItem("savedAuthors", JSON.stringify(savedAuthors));
}

// Show modal with author details and their quotes
async function showAuthorModal(author) {
  document.getElementById("modal-author-name").textContent = author.name;
  document.getElementById("modal-author-bio").textContent =
    author.bio || "No bio available";

  const quotesList = document.getElementById("modal-author-quotes");
  quotesList.innerHTML = "<li>Loading quotes...</li>";
  document.getElementById("author-modal").classList.remove("hidden");

  try {
    const response = await fetch(
      `http://api.quotable.io/quotes?author=${encodeURIComponent(
        author.name
      )}&limit=100`
    );
    const data = await response.json();
    quotesList.innerHTML = "";

    if (data.results.length === 0) {
      quotesList.innerHTML = "<li class='text-gray-500'>No quotes found.</li>";
    } else {
      const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

      data.results.forEach((quote) => {
        const li = document.createElement("li");

        const wrapper = document.createElement("div");
        wrapper.classList.add(
          "flex",
          "items-center",
          "justify-between",
          "gap-4",
          "w-full"
        );

        const quoteBox = document.createElement("div");
        quoteBox.classList.add(
          "text-gray-700",
          "border-l-4",
          "border-blue-500",
          "pl-4",
          "italic",
          "flex-1",
          "p-2",
          "rounded-md"
        );

        const quoteText = document.createElement("span");
        quoteText.textContent = `"${quote.content}"`;
        quoteBox.appendChild(quoteText);

        const heartBtn = document.createElement("span");
        const isFavorite = favorites.some(
          (q) => q.quote === quote.content && q.author === author.name
        );
        heartBtn.textContent = isFavorite ? "💖" : "🤍";
        heartBtn.className = "cursor-pointer text-lg ml-2";

        heartBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          toggleFavoriteQuote({ quote: quote.content, author: author.name });
          heartBtn.textContent = heartBtn.textContent === "💖" ? "🤍" : "💖";
        });

        wrapper.appendChild(quoteBox);
        wrapper.appendChild(heartBtn);
        li.appendChild(wrapper);
        quotesList.appendChild(li);
      });
    }
  } catch (error) {
    quotesList.innerHTML =
      "<li class='text-red-500'>Failed to load quotes.</li>";
  }
}

// Toggle favorite status for a quote
function toggleFavoriteQuote({ quote, author }) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const index = favorites.findIndex(
    (q) => q.quote === quote && q.author === author
  );

  if (index >= 0) {
    favorites.splice(index, 1);
  } else {
    favorites.push({ quote, author });
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
}

// ============= Event Listeners ==============

// Handle filter dropdown change
filterElement.addEventListener("change", (event) => {
  const filterValue = event.target.value;
  let sortedAuthors = [...allAuthors];

  if (filterValue === "asc") sortedAuthors = sortAuthorsAsc(sortedAuthors);
  if (filterValue === "desc") sortedAuthors = sortAuthorsDesc(sortedAuthors);

  renderAuthors(sortedAuthors);
});

// Handle search input
searchElement.addEventListener("input", (event) => {
  const query = event.target.value.toLowerCase();
  const filterValue = filterElement.value;

  let filteredAuthors = allAuthors.filter((author) =>
    author.name.toLowerCase().includes(query)
  );

  if (filterValue === "asc") filteredAuthors = sortAuthorsAsc(filteredAuthors);
  if (filterValue === "desc")
    filteredAuthors = sortAuthorsDesc(filteredAuthors);

  renderAuthors(filteredAuthors);
});

// Close modal
document.getElementById("close-modal").addEventListener("click", () => {
  document.getElementById("author-modal").classList.add("hidden");
});

// =========== Initializa App =============

// Fetch authors and render them on load
fetchAllAuthors().then((authors) => {
  renderAuthors(sortAuthorsAsc([...authors]));
});
