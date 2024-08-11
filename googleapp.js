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

    // Speichern-Button hinzufügen
    if (!isSaved) {
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Gelesen';
        saveButton.onclick = () => {saveBookToLocalStorage({ title, authors, thumbnail, id: bookId});
        showNotification('Buch hinzugefügt'); // Zeige die Benachrichtigung hier
        };
        bookItem.appendChild(saveButton);
    }

    // Löschen-Button hinzufügen, wenn das Buch bereits gespeichert ist
    if (isSaved) {
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Löschen';
        deleteButton.onclick = () => deleteBookFromLocalStorage(bookId);
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
    container.innerHTML = ''; // Vorherigen Inhalt leeren

    books.forEach(item => {
        const title = item.volumeInfo.title;
        const authors = item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unbekannter Autor';
        const thumbnail = item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : '';
        const bookId = item.id;

        const bookElement = createBookElement(title, authors, thumbnail, bookId, isSaved);
        addBookToContainer(containerId, bookElement);
    });
}

function saveBookToLocalStorage(book) {
    const bookId = book.id;
    localStorage.setItem(`book_${bookId}`, JSON.stringify(book));
    downloadLocalStorageBackup(); // Backup erstellen, wenn ein Buch gespeichert wird
}

function deleteBookFromLocalStorage(bookId) {
    localStorage.removeItem(`book_${bookId}`);
    displaySavedBooks(); // Aktualisiere die Anzeige nach dem Löschen
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

function init() {
    displaySavedBooks(); // Zeige nur gespeicherte Bücher beim Laden der Seite an
}

function displaySavedBooks() {
    const container = document.getElementById('saved-books');
    container.innerHTML = ''; // Vorherigen Inhalt leeren

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

    // Verstecke die Benachrichtigung nach 3 Sekunden
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}
function downloadLocalStorageBackup() {
    const data = {};
    Object.keys(localStorage).forEach(key => {
        data[key] = localStorage.getItem(key);
    });

    const json = JSON.stringify(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'localStorage-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}



window.onload = init;

document.getElementById('searchButton').addEventListener('click', searchAndDisplayBooks);
document.getElementById('showSavedBooksButton').addEventListener('click', displaySavedBooks);
