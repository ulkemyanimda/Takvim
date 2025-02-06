// Local Storage anahtarı
const STORAGE_KEY = 'events';

// Tema kontrolü
let isDarkTheme = localStorage.getItem('darkTheme') === 'true';
if (isDarkTheme) {
    document.body.classList.add('dark-theme');
    document.getElementById('themeBtn').innerHTML = '<i class="fas fa-sun"></i>';
}

// Tema değiştirme fonksiyonu
function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle('dark-theme');
    document.getElementById('themeBtn').innerHTML = isDarkTheme ? 
        '<i class="fas fa-sun"></i>' : 
        '<i class="fas fa-moon"></i>';
    localStorage.setItem('darkTheme', isDarkTheme);
}

// Etkinlikleri Local Storage'dan yükleme
function loadEvents() {
    const events = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return events.sort((a, b) => new Date(a.date) - new Date(b.date));
}

// Etkinlikleri Local Storage'a kaydetme
function saveEvents(events) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

// Etkinlikleri dosyaya kaydetme (dışa aktarma)
function exportEvents() {
    const events = loadEvents();
    const dataStr = JSON.stringify(events, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'takvim-etkinlikler.json';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
}

// Dosyadan etkinlik yükleme (içe aktarma)
function importEvents(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const events = JSON.parse(e.target.result);
            saveEvents(events);
            updateEventsList();
            alert('Etkinlikler başarıyla içe aktarıldı!');
        } catch (error) {
            alert('Dosya okuma hatası! Lütfen geçerli bir JSON dosyası seçin.');
        }
    };
    reader.readAsText(file);
}

// Kalan süreyi hesaplama
function calculateTimeRemaining(targetDate) {
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target - now;

    if (diff < 0) {
        return 'Tarih geçti';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days} gün, ${hours} saat, ${minutes} dakika`;
}

// Etkinlik ekleme
function addEvent() {
    const nameInput = document.getElementById('eventName');
    const dateInput = document.getElementById('eventDate');
    const noteInput = document.getElementById('eventNote');

    const name = nameInput.value.trim();
    const date = dateInput.value;
    const note = noteInput.value.trim();

    if (!name || !date) {
        alert('Lütfen etkinlik adı ve tarih alanlarını doldurun!');
        return;
    }

    const events = loadEvents();
    events.push({ name, date, note });
    saveEvents(events);

    nameInput.value = '';
    dateInput.value = '';
    noteInput.value = '';

    updateEventsList();
}

// Etkinlik silme
function deleteEvent(index) {
    const events = loadEvents();
    events.splice(index, 1);
    saveEvents(events);
    updateEventsList();
}

// Etkinlik listesini güncelleme
function updateEventsList() {
    const eventsList = document.getElementById('eventsList');
    const events = loadEvents();

    eventsList.innerHTML = '';

    events.forEach((event, index) => {
        const timeRemaining = calculateTimeRemaining(event.date);
        const formattedDate = new Date(event.date).toLocaleDateString('tr-TR');

        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        eventCard.innerHTML = `
            <div class="event-info">
                <h3>${event.name}</h3>
                <div class="event-time">
                    <i class="far fa-calendar"></i> ${formattedDate}<br>
                    <i class="far fa-clock"></i> ${timeRemaining}
                </div>
                ${event.note ? `<div class="event-note"><i class="far fa-sticky-note"></i> ${event.note}</div>` : ''}
            </div>
            <button onclick="deleteEvent(${index})" class="delete-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        eventsList.appendChild(eventCard);
    });
}

// Sayfa yüklendiğinde etkinlikleri göster
document.addEventListener('DOMContentLoaded', () => {
    updateEventsList();
    // Her dakika güncelle
    setInterval(updateEventsList, 60000);
});
