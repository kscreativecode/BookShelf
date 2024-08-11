const apiKey = 'AIzaSyDNmwXFFevatsj1Gr_HOgtGychQCkwWoRc';

async function searchBooks() {
    const query = document.getElementById('suche').value;
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&key=${apiKey}`);
    const data = await response.json();
    displayBooks(data.items);
}

function displayBooks(books) {
    const bookList = document.getElementById('book-list');
    bookList.innerHTML = '';
    books.forEach(book => {
        const li = document.createElement('li');
        li.textContent = book.volumeInfo.title;
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Speichern';
        saveButton.onclick = () => saveBook(book.volumeInfo);
        li.appendChild(saveButton);
        bookList.appendChild(li);
    });
}

function saveBook(book) {
    let savedBooks = JSON.parse(localStorage.getItem('books')) || [];
    savedBooks.push(book);
    localStorage.setItem('books', JSON.stringify(savedBooks));
}

function getSavedBooks() {
    return JSON.parse(localStorage.getItem('books')) || [];
}

function displaySavedBooks() {
    const savedBooks = getSavedBooks();
    const bookList = document.getElementById('book-list');
    bookList.innerHTML = '';
    savedBooks.forEach(book => {
        const li = document.createElement('li');
        li.textContent = book.title;
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Löschen';
        deleteButton.onclick = () => deleteBook(book.title);
        li.appendChild(deleteButton);
        bookList.appendChild(li);
    });
}

function deleteBook(title) {
    let savedBooks = getSavedBooks();
    savedBooks = savedBooks.filter(book => book.title !== title);
    localStorage.setItem('books', JSON.stringify(savedBooks));
    displaySavedBooks();
}
