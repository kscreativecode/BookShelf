async function searchBooks() {
    const query = document.getElementById('search').value;
    const apiKey = 'AIzaSyDNmwXFFevatsj1Gr_HOgtGychQCkwWoRc';
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&key=${apiKey}`);
    const data = await response.json();
    displayResults(data);
}

function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    data.items.forEach(item => {
        const book = item.volumeInfo;
        const bookDiv = document.createElement('div');
        bookDiv.innerHTML = `<h2>${book.title}</h2><p>${book.authors}</p><p>${book.description}</p>`;
        resultsDiv.appendChild(bookDiv);
    });
}