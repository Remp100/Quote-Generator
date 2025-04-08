const filterElement = document.getElementById("filter");
const authorsListElement = document.getElementById("authors-list");
let allAuthors = [];

// Fetch authors from the API
async function fetchAllAuthors() {
  let page = 1;
  let hasMore = true;
  let authors = [];

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

  allAuthors = authors; // Store globally
  return authors;
}

// Group authors by the first letter of their name or special characters
function groupAuthorsByLetter(authors) {
  const groups = {};

  authors.forEach((author) => {
    // Get the first character of the author's name
    const firstChar = author.name.charAt(0).toUpperCase();

    // If it's a special character, group it under "$%^&"
    const groupKey = /^[A-Za-z]/.test(firstChar)
      ? firstChar
      : "$%^& (Special Characters)";

    // Add author to the corresponding group
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(author);
  });

  return groups;
}

// Render authors grouped by the first letter or special characters
function renderAuthors(authors) {
  authorsListElement.innerHTML = ""; // Clear the list

  const groupedAuthors = groupAuthorsByLetter(authors);

  Object.keys(groupedAuthors).forEach((group) => {
    // Create a group header
    const groupHeader = document.createElement("h3");
    groupHeader.classList.add(
      "text-xl",
      "font-semibold",
      "text-gray-800",
      "mt-4"
    );
    groupHeader.textContent = group;
    authorsListElement.appendChild(groupHeader);

    // Render the authors in this group
    const authorList = document.createElement("ul");
    groupedAuthors[group].forEach((author) => {
      const authorElement = document.createElement("button");
      authorElement.classList.add(
        "bg-white",
        "p-4",
        "rounded-lg",
        "shadow-md",
        "text-left",
        "hover:bg-blue-100",
        "transition",
        "duration-200",
        "mt-4",
        "flex-row"
      );
      authorElement.innerHTML = `<h2 class="text-lg font-semibold text-gray-800">${author.name}</h2>`;
      authorElement.addEventListener("click", () => showAuthorModal(author));
      const listItem = document.createElement("li");
      listItem.appendChild(authorElement);
      authorList.appendChild(listItem);
    });

    authorsListElement.appendChild(authorList);
  });
}

async function showAuthorModal(author) {
  // Show loading state
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
    quotesList.innerHTML = ""; // Clear loading

    if (data.results.length === 0) {
      quotesList.innerHTML = "<li class='text-gray-500'>No quotes found.</li>";
    } else {
      data.results.forEach((quote) => {
        const li = document.createElement("li");
        li.classList.add(
          "text-gray-700",
          "border-l-4",
          "border-blue-500",
          "pl-4",
          "italic"
        );
        li.textContent = `"${quote.content}"`;
        quotesList.appendChild(li);
      });
    }
  } catch (error) {
    quotesList.innerHTML =
      "<li class='text-red-500'>Failed to load quotes.</li>";
  }
}

// Sort authors alphabetically ascending
function sortAuthorsAsc(authors) {
  return authors.sort((a, b) => a.name.localeCompare(b.name));
}

// Sort authors alphabetically descending
function sortAuthorsDesc(authors) {
  return authors.sort((a, b) => b.name.localeCompare(a.name));
}

// Handle filter change
filterElement.addEventListener("change", (event) => {
  const filterValue = event.target.value;
  let sortedAuthors = [...allAuthors]; // Clone to avoid mutating original

  if (filterValue === "asc") {
    sortedAuthors = sortAuthorsAsc(sortedAuthors);
  } else if (filterValue === "desc") {
    sortedAuthors = sortAuthorsDesc(sortedAuthors);
  }

  renderAuthors(sortedAuthors);
});

document.getElementById("close-modal").addEventListener("click", () => {
  document.getElementById("author-modal").classList.add("hidden");
});

// Fetch authors on page load
fetchAllAuthors().then((authors) => {
  renderAuthors(sortAuthorsAsc([...authors])); // Default sort
});
