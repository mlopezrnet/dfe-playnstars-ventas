//#region MODELO

class Franchise {
    constructor(id, name, address) {
        this.id = id;
        this.name = name;
        this.address = address;
    }
}

class Movie {
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

class Screening {
    constructor(franchiseId, movieId, showtimes, promoDescription, retailPrice, promoPrice) {
        this.franchiseId = franchiseId;
        this.movieId = movieId;
        this.showtimes = showtimes;
        this.promoDescription = promoDescription;
        this.retailPrice = retailPrice;
        this.promoPrice = promoPrice;
    }
}

class Showtimes {
    constructor(date, room, showtimes) {
        this.date = date; // string
        this.room = room;
        this.showtimes = showtimes;
    }
}

//#endregion


//#region DATOS GLOBALES

// Delay para simular carga desde servidor
let delay = 2000;

// Maps donde se almacenarán los objetos
const franchisesMap = new Map();
const moviesMap = new Map();
const screeningsMap = new Map();
let filteredScreenings = [];

function populateData() {
// Crea y setea los objetos en los maps
franchisesMap.set(1, new Franchise(1, "Cinépolis Luis Encinas", "Blvd. Luis Encinas J. 227-P. B, San Benito, 83190 Hermosillo, Son."));
franchisesMap.set(2, new Franchise(2, "Cinemex Luis Encinas", "Blvd. Jesús García Morales 2, Montebello, 83210 Hermosillo, Son."));
franchisesMap.set(3, new Franchise(3, "Cinépolis Galerías Mall", "Av Cultura 55, Proyecto Rio Sonora Hermosillo XXI, 83270 Hermosillo, Son."));

moviesMap.set(1, new Movie(1, "gatoconbotas2.jpg", "El Gato con Botas: El último Deseo", "Aventura/Comedia", "1h 40m", "A", 7.8, "El Gato con Botas descubre que su pasión por la aventura le ha pasado factura cuando descubre que ha usado ocho de sus nueve vidas. El Gato emprende un viaje épico para encontrar el mítico Último Deseo y restaurar sus nueve vidas."));
moviesMap.set(2, new Movie(2, "oppenheimer.jpg", "Oppenheimer", "Drama/Thriller", "3h", "B-15", 7.2, "En tiempos de guerra, el brillante físico estadounidense Julius Robert Oppenheimer (Cillian Murphy), al frente del \"Proyecto Manhattan\", lidera los ensayos nucleares para construir la bomba atómica para su país. Impactado por su poder destructivo, Oppenheimer se cuestiona las consecuencias morales de su creación. Desde entonces y el resto de su vida, se opondría firmemente al uso de armas nucleares."));
moviesMap.set(3, new Movie(3, "barbie.webp", "Barbie", "Comedia/Fantasía", "1h 54m", "B", 7.1, "Barbie (Margot Robbie) lleva una vida ideal en Barbieland, allí todo es perfecto, con chupi fiestas llenas de música y color, y todos los días son el mejor día. Claro que Barbie se hace algunas preguntas, cuestiones bastante incómodas que no encajan con el mundo idílico en el que ella y las demás Barbies viven. Cuando Barbie se dé cuenta de que es capaz de apoyar los talones en el suelo, y tener los pies planos, decidirá calzarse unos zapatos sin tacones y viajar hasta el mundo real."));
moviesMap.set(4, new Movie(4, "blackadam.webp", "Black Adam", "Drama/Acción", "2h 5m", "B", 6.3, "Casi 5.000 años después de haber sido dotado de los poderes omnipotentes de los antiguos dioses, Black Adam (Johnson) es liberado de su tumba terrenal, listo para desatar su forma única de justicia en el mundo moderno..."));

screeningsMap.set(1, new Screening(1, 1, new Showtimes("2023-10-12", "Sala 11", "11:55 13:50 14:25 16:15 16:50 18:00 19:20 20:25 21:50"), "Entradas 2x1", 74, 37));
screeningsMap.set(2, new Screening(1, 2, new Showtimes("2023-10-12", "Sala 4 VIP", "11:55 13:50 14:25 16:15 16:50 18:00 19:20 20:25 21:50"), "Entrada VIP a precio de sala normal", 175, 74));
screeningsMap.set(3, new Screening(3, 3, new Showtimes("2023-10-12", "Sala 9", "11:55 13:50 14:25 16:15 16:50 18:00 19:20 20:25 21:50"), "Mercancía exclusiva", "Desde $99", 99));
screeningsMap.set(4, new Screening(2, 4, new Showtimes("2023-10-12", "Sala 6 VIP", "16:15 16:50 18:00 19:20"), "¡Tómate una foto con Dwayne Johnson en persona!", 999, 500));
}

//#endregion


//#region VISTA

// Función para generar y mostrar la tabla de las funciones disponibles
function displayScreenings() {
    clearTable();

    showLoadingMessage();

    setTimeout(() => {
        const tabla = document.getElementById('salas-table');
        const tablaBody = tabla.querySelector('tbody');
        const headerRow = tabla.querySelector('thead tr');
        // const numColumns = headerRow.children.length;  // Se obtiene el número de columnas dinámicamente

        const imgPath = `../img/cartelera/`;

        applyFilters();

        if (filteredScreenings.length === 0) {
            showNotFoundMessage();
        } else {
            hideMessage();

            // Iteramos por funciones y tomamos nota de su sucursal
            let currentFranchise = null;

            filteredScreenings.forEach((screening) => {

                const franchise = franchisesMap.get(screening[1].franchiseId);
                const movie = moviesMap.get(screening[1].movieId);

                if (currentFranchise !== franchise) {

                    // Agrupamos las funciones por sucursal
                    const franchiseCell = document.createElement('td');
                    franchiseCell.innerHTML = `
                        <h3>${franchise.name}</h3>
                        <small>${franchise.address}</small>
                    `;
                    const franchiseRow = document.createElement('tr');
                    franchiseRow.className = 'franchise-leading-row';
                    //franchiseCell.colSpan = numColumns;
                    franchiseCell.colSpan = 10;  // Número fijo para que abarque todo el ancho de la tabla
                    franchiseRow.appendChild(franchiseCell);
                    tablaBody.appendChild(franchiseRow);

                    currentFranchise = franchise;
                }

                // Creamos las filas con la información de cada película
                const row = document.createElement('tr');
                let commonHTML = `
                    <td><img src="${imgPath + movie.img}" alt="${movie.name}" width="100"></td>
                    <td>
                    <h3>${movie.name}</h3>
                    <span class="rating">${movie.ageRating}</span><span class="genre">${movie.genre}</span>
                    <br><span class="length">${movie.length}</span>
                    </td>
                    <td>${movie.summary}</td>
                    <td>
                        <p>${screening[1].showtimes.date}</p>
                        <p class="room">${screening[1].showtimes.room}</p>
                        <p>${screening[1].showtimes.showtimes}</p>
                    </td>
                    <td>${screening[1].promoDescription}</td>
                `;

                // Mostrar precio de promocion si es menor al precio normal
                if (screening[1].promoPrice && screening[1].promoPrice < screening[1].retailPrice) {
                    commonHTML += `
                    <td>
                        <del style="color: gray;">${formatCurrency(screening[1].retailPrice)}</del><br>
                        <span style="color: #ec008c;">${formatCurrency(screening[1].promoPrice)}</span>
                    </td>
                `;
                } else {
                    // Mostrar precio normal
                    commonHTML += `
                    <td>${formatCurrency(screening[1].retailPrice)}</td>
                `;
                }
                row.innerHTML = commonHTML;

                tablaBody.appendChild(row);
            });
        }
    }, delay);
}

//#endregion

// Formato de moneda
const currencyFormatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
});

function formatCurrency(value) {
    const formattedValue = currencyFormatter.format(value);
    if (formattedValue !== '$NaN') {
        return formattedValue;
    } else {
        return value;
    }
}

// Funcion que limpia la tabla
function clearTable() {
    const tableBody = document.getElementById('salas-table-body');
    tableBody.innerHTML = '';
}

// Funcion que muestra mensaje de carga
function showLoadingMessage() {
    const message = document.getElementById('message');
    message.innerHTML = 'Cargando...';
    message.style.display = 'block';
}

// Funcion que muestra mensaje de que no se encuentraron datos
function showNotFoundMessage() {
    const message = document.getElementById('message');
    message.innerHTML = 'No se encontraron funciones con el filtro proporcionado.';
    message.style.display = 'block';
}

// Funcion que oculta mensaje
function hideMessage() {
    const message = document.getElementById('message');
    message.style.display = 'none';
}

//#endregion

//#region FILTROS (VIEW)

function initForms() {
    initButtonsHandler();

    const franchiseSelect = document.getElementById('franchise');
    franchisesMap.forEach(franchise => {
        const option = document.createElement('option');
        option.value = franchise.id;
        option.text = franchise.name;
        franchiseSelect.appendChild(option);
    });
}

// Funcion que inicializa los eventos de los botones del filto
function initButtonsHandler() {

    document.getElementById('filter-form').addEventListener('submit', event => {
        event.preventDefault();
        delay = 0;
        displayScreenings();
    });

    document.getElementById('reset-filters').addEventListener('click', () => {
        document.querySelectorAll('input.filter-field').forEach(input => input.value = '');
        delay = 2000;
        displayScreenings();
    });

}


// Gestiona los filtros del usuario y manda a llamar a la función que los aplica
function applyFilters() {
    const text = document.getElementById('text').value.toLowerCase();
    const ageRating = document.getElementById('ageRating').value.toLowerCase();
    const genre = document.getElementById('genre').value.toLowerCase();
    const promo = document.getElementById('promo').value.toLowerCase();
    // Si parseFloat regresa un Nan, extraer la parte numérica
    const maxPrice = parseFloat(document.getElementById('price-max').value) || parseFloat(document.getElementById('price-max').value.match(/\d+/));
    const franchise = document.getElementById('franchise').value;

    filteredScreenings = filterScreenings(text, ageRating, genre, promo, maxPrice, franchise);
}


// Funcion que filtra y regresa las funciones segun los filtros usados
function filterScreenings(text, ageRating, genre, promo, maxPrice, franchise) {
    return Array.from(screeningsMap).filter(screening => {
        const movie = moviesMap.get(screening[1].movieId);
        const _franchise = franchisesMap.get(screening[1].franchiseId);

        // Condiciones que tiene que pasar para que se considere una coincidencia
        const textMatch = movie.name.toLowerCase().includes(text) || movie.summary.toLowerCase().includes(text);
        const ageRatingMatch = movie.ageRating.toLowerCase().includes(ageRating);
        const genreMatch = movie.genre.toLowerCase().includes(genre);
        const promoMatch = screening[1].promoDescription.toLowerCase().includes(promo);
        const priceMatch = !maxPrice || screening[1].promoPrice <= maxPrice;
        let franchiseMatch = true;  // Siempre filtrar por todas las franquicias a menos que se especifique una
        if (franchise && franchise > -1) {
            franchiseMatch = screening[1].franchiseId == franchise;
        }

        return textMatch && ageRatingMatch && genreMatch && promoMatch && priceMatch && franchiseMatch;
    });
}

//#endregion

//#region CONTROLADOR

populateData();
displayScreenings();
initForms();

//#endregion