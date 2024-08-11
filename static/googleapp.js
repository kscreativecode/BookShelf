const apiKey = 'AIzaSyDNmwXFFevatsj1Gr_HOgtGychQCkwWoRc';

function fetchBooks(query, apiKey) {
    return fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&key=${apiKey}`)
        .then(response => response.json())
        .then(data => data.items)
        .catch(error => {
            console.error('Fehler beim Abrufen der Bücher:', error);
            return [];
        });
}

function createBookElement(title, authors, thumbnail, bookId, isSaved = false) {
    const bookItem = document.createElement('div');
    bookItem.classList.add('book-item');

    const bookTitle = document.createElement('h2');
    bookTitle.textContent = title;

    const bookAuthors = document.createElement('p');
    bookAuthors.textContent = `Autor(en): ${authors}`;

    const bookCover = document.createElement('img');
    if (thumbnail) {
        bookCover.src = thumbnail;
        bookCover.alt = `Cover von ${title}`;
        bookItem.appendChild(bookCover);
    }

    bookItem.appendChild(bookTitle);
    bookItem.appendChild(bookAuthors);

    if (!isSaved) {
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Gelesen';
        saveButton.onclick = () => {
            saveBookToLocalStorage({ title, authors, thumbnail, id: bookId });
            showNotification('Buch hinzugefügt');
        };
        bookItem.appendChild(saveButton);
    }

    if (isSaved) {
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Löschen';
        deleteButton.onclick = () => {
            deleteBookFromLocalStorage(bookId);
            showNotification('Buch gelöscht');
        };
        bookItem.appendChild(deleteButton);
    }

    return bookItem;
}

function addBookToContainer(containerId, bookElement) {
    const container = document.getElementById(containerId);
    if (container) {
        container.appendChild(bookElement);
    } else {
        console.error('Container nicht gefunden:', containerId);
    }
}

function displayBooks(books, containerId, isSaved = false) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container nicht gefunden:', containerId);
        return;
    }
    container.innerHTML = '';

    books.forEach(item => {
        const title = item.volumeInfo.title;
        const authors = item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unbekannter Autor';
        const thumbnail = item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : '';
        const bookId = item.id;

        const bookElement = createBookElement(title, authors, thumbnail, bookId, isSaved);
        addBookToContainer(containerId, bookElement);
    });
}


function deleteBookFromLocalStorage(bookId) {
    localStorage.removeItem(`book_${bookId}`);
    saveBooksToServer();
    displaySavedBooks();
}

function loadBooksFromLocalStorage() {
    const savedBooks = [];
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('book_')) {
            const book = JSON.parse(localStorage.getItem(key));
            savedBooks.push(book);
        }
    });
    return savedBooks;
}

function searchAndDisplayBooks() {
    const query = document.getElementById('searchInput').value;

    fetchBooks(query, apiKey).then(books => {
        if (books && books.length > 0) {
            displayBooks(books, 'book-list');
        } else {
            console.log('Keine Bücher gefunden');
        }
    });
}

function saveBooksToServer() {
    const savedBooks = loadBooksFromLocalStorage();
    fetch('/save_books', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(savedBooks),
    }).then(response => response.json())
      .then(data => {
          console.log(data.message);
      })
      .catch(error => {
          console.error('Fehler beim Speichern auf dem Server:', error);
      });
}

function loadBooksFromServer() {
    fetch('/load_books')
        .then(response => response.json())
        .then(books => {
            books.forEach(book => {
                localStorage.setItem(`book_${book.id}`, JSON.stringify(book));
            });
            displaySavedBooks();
        })
        .catch(error => {
            console.error('Fehler beim Laden der Bücher:', error);
        });
}


function getLastFiveBooks() {
    const savedBooks = loadBooksFromLocalStorage();
    savedBooks.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));
    return savedBooks.slice(0, 5);
}

function displayLastFiveBooks() {
    const container = document.getElementById('latest-books-container');
   

    if (!container) {
        console.error('Container nicht gefunden: latest-books-container');
        return;
    }
    console.log('Container gefunden. Lade die letzten 5 Bücher.');

    const books = getLastFiveBooks();
    displayBooks(books, 'latest-books-container', true);
}

function init() {
    loadBooksFromServer(); // Lade Bücher von Server beim Start
    displayLastFiveBooks(); // Zeige die letzten 5 Bücher an
}

function saveBookToLocalStorage(book) {
    const bookWithDate = { ...book, addedDate: new Date().toISOString() };
    const bookId = book.id;
    localStorage.setItem(`book_${bookId}`, JSON.stringify(bookWithDate));
    saveBooksToServer(); // Backup erstellen, wenn ein Buch gespeichert wird
} 

function displaySavedBooks() {
    const container = document.getElementById('saved-books');
    container.innerHTML = '';

    const savedBooks = loadBooksFromLocalStorage();
    savedBooks.forEach(book => {
        const bookElement = createBookElement(book.title, book.authors, book.thumbnail, book.id, true);
        addBookToContainer('saved-books', bookElement);
    });
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

window.onload = init;

document.getElementById('searchButton').addEventListener('click', searchAndDisplayBooks);
