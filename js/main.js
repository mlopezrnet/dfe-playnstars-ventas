import { franchisesMap, moviesMap, screeningsMap, getScreenings, formatCurrency } from './common.js';

//#region DATOS GLOBALES

// Filtrado del lado del cliente
let filteredScreenings = [];

//#endregion


//#region VISTA

// Función para generar y mostrar la tabla de las funciones disponibles
function displayScreenings() {
    clearTable();

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

            const franchise = franchisesMap.get(screening.franchiseId);
            const movie = moviesMap.get(screening.movieId);

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
                    <td class="summary">${movie.summary}</td>
                    <td>
                        <p>${screening.showtimes.date}</p>
                        <p class="room">Sala ${screening.showtimes.room}</p>
                        <p>${screening.showtimes.showtimes}</p>
                    </td>
                    <td>${screening.promoDescription}</td>
                `;

            // Mostrar precio de promocion si es menor al precio normal
            if (screening.promoPrice && screening.promoPrice < screening.retailPrice) {
                commonHTML += `
                    <td>
                        <del style="color: gray;">${formatCurrency(screening.retailPrice)}</del><br>
                        <span style="color: #ec008c;">${formatCurrency(screening.promoPrice)}</span>
                    </td>
                `;
            } else {
                // Mostrar precio normal
                commonHTML += `
                    <td>${formatCurrency(screening.retailPrice)}</td>
                `;
            }
            row.innerHTML = commonHTML;

            tablaBody.appendChild(row);
        });
    }

}

//#endregion

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
        displayScreenings();
    });

    document.getElementById('reset-filters').addEventListener('click', () => {
        document.querySelectorAll('input.filter-field').forEach(input => input.value = '');
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
    return [...screeningsMap.values()].filter(screening => {
        const movie = moviesMap.get(screening.movieId);
        const _franchise = franchisesMap.get(screening.franchiseId);

        // Condiciones que tiene que pasar para que se considere una coincidencia
        const textMatch = movie.name.toLowerCase().includes(text) || movie.summary.toLowerCase().includes(text);
        const ageRatingMatch = movie.ageRating.toLowerCase().includes(ageRating);
        const genreMatch = movie.genre.toLowerCase().includes(genre);
        const promoMatch = screening.promoDescription.toLowerCase().includes(promo);
        const priceMatch = !maxPrice || screening.promoPrice <= maxPrice;
        let franchiseMatch = true;  // Siempre filtrar por todas las franquicias a menos que se especifique una
        if (franchise && franchise > -1) {
            franchiseMatch = screening.franchiseId == franchise;
        }

        return textMatch && ageRatingMatch && genreMatch && promoMatch && priceMatch && franchiseMatch;
    });
}

//#endregion

//#region CONTROLADOR

showLoadingMessage();
getScreenings().then(() => {
    initForms();
    displayScreenings();
});


//#endregion