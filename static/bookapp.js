

    const ul = document.querySelector('ul');
    const input = document.getElementById("Eingabe");

    let itemsArray = localStorage.getItem('items') ?
JSON.parse(localStorage.getItem('items')) : [];
  
itemsArray.forEach(addBook);
function addBook(text){
  const li = document.createElement('li')
  li.textContent = text;
  ul.appendChild(li);
}
function add(){
    itemsArray.push(input.value);
    localStorage.setItem('items', JSON.stringify(itemsArray));
    addBook(input.value);
    input.value = '';
  }



