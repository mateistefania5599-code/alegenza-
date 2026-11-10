const buton = document.getElementById('butonInteractiune');
const mesaj = document.getElementById('mesajAscuns');

if (buton && mesaj) {
    buton.addEventListener('click', function() {
        mesaj.style.display = 'block';
        buton.style.backgroundColor = '#64748b';
        buton.innerText = 'Activat!';
    });
}
