document.addEventListener("DOMContentLoaded", () => {
  const filterElement = document.getElementById("filter");
  const authorsListElement = document.getElementById("authors-list");

  // Fetch authors from the API
  async function fetchAuthors() {
    try {
      const response = await fetch("http://api.quotable.io/authors");
      const data = await response.json();

      if (response.ok) {
        renderAuthors(data.results); // API returns an object with 'results' array
      } else {
        console.error("Error fetching authors:", data.message);
      }
    } catch (error) {
      console.error("Error fetching authors:", error);
    }
  }

  // Render authors to the DOM
  function renderAuthors(authors) {
    authorsListElement.innerHTML = ""; // Clear the list first

    authors.forEach((author) => {
      const authorElement = document.createElement("div");
      authorElement.classList.add(
        "bg-white",
        "p-4",
        "rounded-lg",
        "shadow-md",
        "flex",
        "flex-col",
        "items-center"
      );
      authorElement.innerHTML = `
        <h2 class="text-xl font-semibold text-gray-800">${author.name}</h2>
        <p class="text-gray-600">${author.bio || "No bio available"}</p>
      `;
      authorsListElement.appendChild(authorElement);
    });
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
  filterElement.addEventListener("change", async (event) => {
    const filterValue = event.target.value;

    try {
      const response = await fetch("http://api.quotable.io/authors");
      const data = await response.json();
      let sortedAuthors = data.results;

      if (filterValue === "asc") {
        sortedAuthors = sortAuthorsAsc(sortedAuthors);
      } else if (filterValue === "desc") {
        sortedAuthors = sortAuthorsDesc(sortedAuthors);
      }

      renderAuthors(sortedAuthors);
    } catch (error) {
      console.error("Error filtering authors:", error);
    }
  });

  // Fetch authors on page load
  fetchAuthors();
});
