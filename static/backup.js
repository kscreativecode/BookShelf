// backup.js

// Event listener für das Hochladen einer Datei
document.getElementById('upload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = JSON.parse(e.target.result);
            Object.keys(data).forEach(key => {
                localStorage.setItem(key, data[key]);
            });
            alert('localStorage erfolgreich wiederhergestellt!');
        };
        reader.readAsText(file);
    } else {
        alert('Bitte eine gültige JSON-Datei hochladen.');
    }
});

// Event listener für den Button zum Erstellen einer Backup-Datei
document.getElementById('backupButton').addEventListener('click', function() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
    }
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup.json';
    a.click();
    URL.revokeObjectURL(url);
});
