const apiKey = "AIzaSyDNmwXFFevatsj1Gr_HOgtGychQCkwWoRc";

//Using Google Books API and a search window for saving a list of books in data.items.
function fetchBooks(query, apiKey) {
  return fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${apiKey}`
  )
    .then((response) => response.json())
    .then((data) => data.items)
    .catch((error) => {
      console.error("Fehler beim Abrufen der Bücher:", error);
      return [];
    });
}
// create an HTML element that represents a book
function createBookElement(
  title,
  authors,
  thumbnail,
  bookId,
  isSaved = false,
  mode = "default"
) {
  const bookItem = document.createElement("div");
  bookItem.classList.add("book-item");

  if (mode === "thumbnailOnly") {
    // Nur das Thumbnail anzeigen
    const bookCover = document.createElement("img");
    if (thumbnail) {
      bookCover.src = thumbnail;
      bookCover.alt = `Cover von ${title}`;
      bookItem.appendChild(bookCover);
    }}

    else if (mode === "rotatingThumbnail") {
        // 3D-Rotation: Buchcover vorne, Titel und Autoren hinten
        const book = document.createElement("div");
        book.classList.add("book");
    
        // Vorderseite - Buchcover
        const bookFront = document.createElement("div");
        bookFront.classList.add("book-front");
    
        const bookCover = document.createElement("img");
        if (thumbnail) {
          bookCover.src = thumbnail;
          bookCover.alt = `Cover von ${title}`;
        }
        bookFront.appendChild(bookCover);
    
        // Rückseite - Titel und Autor(en)
        const bookBack = document.createElement("div");
        bookBack.classList.add("book-back");
    
        const bookTitle = document.createElement("h2");
        bookTitle.textContent = title;
    
        const bookAuthors = document.createElement("p");
        bookAuthors.textContent = `Autor(en): ${authors}`;
    
        bookBack.appendChild(bookTitle);
        bookBack.appendChild(bookAuthors);
    
        // Füge Vorder- und Rückseite zum Buch hinzu
        book.appendChild(bookFront);
        book.appendChild(bookBack);
    
        // Füge das Buch zum Container hinzu
        bookItem.appendChild(book);

  } else {
    // Vollständige Ansicht anzeigen
    const bookTitle = document.createElement("h2");
    bookTitle.textContent = title;

    const bookAuthors = document.createElement("p");
    bookAuthors.textContent = `Autor(en): ${authors}`;

    const bookCover = document.createElement("img");
    if (thumbnail) {
      bookCover.src = thumbnail;
      bookCover.alt = `Cover von ${title}`;
      bookItem.appendChild(bookCover);
    }

    bookItem.appendChild(bookTitle);
    bookItem.appendChild(bookAuthors);
  }

  if (!isSaved) {
    const saveButton = document.createElement("button");
    saveButton.textContent = "Gelesen";
    saveButton.onclick = () => {
      saveBookToLocalStorage({ title, authors, thumbnail, id: bookId });
      showNotification("Buch hinzugefügt");
    };
    bookItem.appendChild(saveButton);
  }

  if (isSaved) {
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Löschen";
    deleteButton.onclick = () => {
      deleteBookFromLocalStorage(bookId);
      showNotification("Buch gelöscht");
    };
    bookItem.appendChild(deleteButton);
  }

  return bookItem;
}
//insert a book element into a container element on the web page
function addBookToContainer(containerId, bookElement) {
  const container = document.getElementById(containerId);
  if (container) {
    container.appendChild(bookElement);
  } else {
    console.error("Container nicht gefunden:", containerId);
  }
}

//deletesa book based on its ID
function deleteBookFromLocalStorage(bookId) {
  localStorage.removeItem(`book_${bookId}`);
  saveBooksToServer();
  displaySavedBooks();
}

//load all saved books from the local memory
function loadBooksFromLocalStorage() {
  const savedBooks = [];
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("book_")) {
      const book = JSON.parse(localStorage.getItem(key));
      savedBooks.push(book);
    }
  });
  return savedBooks;
}

//start a book search and display the books found
function searchAndDisplayBooks() {
  const query = document.getElementById("searchInput").value;

  fetchBooks(query, apiKey).then((books) => {
    if (books && books.length > 0) {
      displayBooks(books, "book-list");
    } else {
      console.log("Keine Bücher gefunden");
    }
  });
}

//save all locally stored books on a server
function saveBooksToServer() {
  const savedBooks = loadBooksFromLocalStorage();
  fetch("/save_books", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(savedBooks),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data.message);
    })
    .catch((error) => {
      console.error("Fehler beim Speichern auf dem Server:", error);
    });
}

// load books from the server and saves them in the local memory
async function loadBooksFromServer() {
  try {
    const response = await fetch("/load_books");
    const books = await response.json();
    books.forEach((book) => {
      localStorage.setItem(`book_${book.id}`, JSON.stringify(book));
    });
    displaySavedBooks();
  } catch (error) {
    console.error("Fehler beim Laden der Bücher:", error);
  }
}

//return the last five saved books
function getLastFiveBooks() {
  const books = loadBooksFromLocalStorage();

  // Überprüfe die geladenen Bücher
  console.log("Alle gespeicherten Bücher:", books);

  // Hole die letzten 5 Bücher oder weniger, wenn es weniger als 5 Bücher gibt
  const lastFiveBooks = books.slice(-5);

  // Überprüfe die letzten 5 Bücher
  console.log("Die letzten 5 Bücher:", lastFiveBooks);

  return lastFiveBooks;
}

//Loading the page executed
async function init() {
  await loadBooksFromServer(); // Lade Bücher von Server beim Start
  displayLastFiveBooks(); // Zeige die letzten 5 Bücher an
}

//Function saves a book in the local memory
function saveBookToLocalStorage(book) {
  const bookWithDate = { ...book, addedDate: new Date().toISOString() };
  const bookId = book.id;
  localStorage.setItem(`book_${bookId}`, JSON.stringify(bookWithDate));
  saveBooksToServer(); // Backup erstellen, wenn ein Buch gespeichert wird
}

//displays all saved books on the website
function displaySavedBooks() {
  const container = document.getElementById("saved-books");
  container.innerHTML = "";

  const savedBooks = loadBooksFromLocalStorage();
  savedBooks.forEach((book) => {
    const bookElement = createBookElement(
      book.title,
      book.authors,
      book.thumbnail,
      book.id,
      true,
      "rotatingThumbnail" // Hier wird der 'mode'-Parameter festgelegt
      
    );
    addBookToContainer("saved-books", bookElement);
  });
}

//Display a list of books in a specified container element on the web page
function displayBooks(
  books,
  containerId,
  clearContainer = false,
  isSaved = false,
  mode = "default"
) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error("Container nicht gefunden:", containerId);
    return;
  }

  if (clearContainer) {
    container.innerHTML = ""; // Container leeren, bevor neue Bücher hinzugefügt werden
  }

  books.forEach((book) => {
    console.log("Verarbeite Buch:", book); // Füge diese Zeile hinzu, um das Buchobjekt zu überprüfen

    const title = book.title || book.volumeInfo?.title || "Unbekannter Titel";
    const authors = Array.isArray(book.authors)
      ? book.authors.join(", ")
      : book.authors || "Unbekannter Autor";
    const thumbnail =
      book.thumbnail || book.volumeInfo?.imageLinks?.thumbnail || "";
    const bookId = book.id || book.volumeInfo?.id || "unknown_id";

    const bookElement = createBookElement(
      title,
      authors,
      thumbnail,
      bookId,
      isSaved,
      mode
    );
    container.appendChild(bookElement);
  });
}

//shows the last five books saved
function displayLastFiveBooks() {
    const container = document.getElementById("latest-books-container");
    if (!container) {
      console.error('Container "latest-books-container" nicht gefunden');
      return;
    }
    console.log("Container gefunden:", container);
  
    const books = getLastFiveBooks();
    console.log("Anzuzeigende Bücher:", books);
  
    displayBooks(books, "latest-books-container", true, true, "thumbnailOnly");
  }

function showNotification(message) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.style.display = "block";

  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}

window.onload = function () {
  init(); // Stelle sicher, dass die init-Funktion aufgerufen wird, wenn du diese verwendest

  displayLastFiveBooks(); // Die letzten 5 Bücher beim Laden der Seite anzeigen
};

document
  .getElementById("searchButton")
  .addEventListener("click", searchAndDisplayBooks);
