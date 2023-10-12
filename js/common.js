document.addEventListener('DOMContentLoaded', function () {
    loadNavbar();
});

function loadNavbar() {
    fetch('./common/header.html')
        .then(response => response.text())
        .then(html => {
            var header = document.getElementById('navbar');
            if (header) {
                header.innerHTML = html;
            }
            markCurrentPage();
        })
        .catch(error => console.error('Error al cargar navbar:', error));
}

function markCurrentPage() {
    const pageTitle = document.title.toLowerCase();
    let navbar = document.getElementById('navbar');

    if (navbar) {
        let links = navbar.querySelectorAll('ul li a');

        links.forEach(function(link) {
            let linkText = link.innerText.toLowerCase();

            if (pageTitle.includes(linkText)) {
                link.classList.add('selected');
            }
        });
    }
}
