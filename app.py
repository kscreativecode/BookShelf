from flask import Flask, request, jsonify, render_template
import json
import os

app = Flask(__name__)

# Pfad zur Backup-Datei
BACKUP_FILE = 'books_backup.json'

from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/bookshelfgoogle')
def bookshelfgoogle():
    return render_template('bookshelfgoogle.html')

@app.route('/bookshelf')
def bookshelf():
    return render_template('bookshelf.html')

@app.route('/sub')
def sub():
    return render_template('sub.html')

@app.route('/wishlist')
def wishlist():
    return render_template('wishlist.html')

@app.route('/save_books', methods=['POST'])
def save_books():
    books = request.json
    with open(BACKUP_FILE, 'w') as f:
        json.dump(books, f)
    return jsonify({'message': 'Books saved successfully'})

@app.route('/load_books', methods=['GET'])
def load_books():
    if os.path.exists(BACKUP_FILE):
        with open(BACKUP_FILE, 'r') as f:
            books = json.load(f)
        return jsonify(books)
    return jsonify([])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
