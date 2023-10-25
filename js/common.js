import { fetchAPI } from './fetch-api.js';

//#region MODELO

export class Franchise {
    constructor(id, name, address) {
        this.id = id;
        this.name = name;
        this.address = address;
    }
}

export class Movie {
    constructor(id, img, name, genre, length, ageRating, avgRating, summary) {
        this.id = id;
        this.img = img;
        this.name = name;
        this.genre = genre;
        this.length = length;
        this.ageRating = ageRating;
        this.avgRating = avgRating;
        this.summary = summary;
    }
}

export class Screening {
    constructor(franchiseId, movieId, showtimes, promoDescription, retailPrice, promoPrice) {
        this.franchiseId = franchiseId;
        this.movieId = movieId;
        this.showtimes = showtimes;
        this.promoDescription = promoDescription;
        this.retailPrice = retailPrice;
        this.promoPrice = promoPrice;
    }
}

export class Showtimes {
    constructor(date, room, showtimes) {
        this.date = date; // string
        this.room = room;
        this.showtimes = showtimes;
    }
}
//#endregion

//#region DATOS GLOBALES

// Maps donde se almacenarán los objetos
export const franchisesMap = new Map();
export const moviesMap = new Map();
export const screeningsMap = new Map();

export function populateMaps(data) {
    data = data[0];  // los datos están anidados en un arreglo, por lo que se extrae el primer elemento

    data.franchises.forEach(franchise => {
        franchisesMap.set(franchise.id, new Franchise(franchise.id, franchise.name, franchise.address));
    });

    data.movies.forEach(movie => {
        moviesMap.set(movie.id, new Movie(movie.id, movie.img, movie.name, movie.genre, movie.length, movie.ageRating, movie.avgRating, movie.summary));
    });

    data.screenings.forEach(screening => {
        screeningsMap.set(screening.id, new Screening(screening.franchiseId, screening.movieId, new Showtimes(screening.showtimes.date, screening.showtimes.room, screening.showtimes.showtimes), screening.promoDescription, screening.retailPrice, screening.promoPrice));
    });
}
//#endregion

//#region CONSUMO DE DATOS DESDE API

export function getScreenings() {

    return fetchAPI('screenings', 'GET')
        .then(data => {
            populateMaps(data);
        });

}

//#endregion

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

// Formato de moneda
const currencyFormatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
});

export function formatCurrency(value) {
    const formattedValue = currencyFormatter.format(value);
    if (formattedValue !== '$NaN') {
        return formattedValue;
    } else {
        return value;
    }
}
