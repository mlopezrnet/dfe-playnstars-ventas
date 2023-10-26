import { fetchAPI } from './fetch-api.js';
import { franchisesMap, moviesMap, screeningsMap, getScreenings, formatCurrency } from './common.js';

class Sale {
    constructor(id, franchiseId, movieId, date, showtime, room, seats, promoDescription, total) {
        this.id = id;
        this.franchiseId = franchiseId;
        this.movieId = movieId;
        this.date = date;
        this.showtime = showtime;
        this.room = room;
        this.seats = seats;
        this.promoDescription = promoDescription;
        this.total = total;
    }
}

//#region DATOS GLOBALES

const salesMap = new Map();
let editingSaleId = null;

//#endregion

// Función para obtener los boletos vendidos
function getSales() {
    showLoadingMessage();

    return fetchAPI('sales', 'GET')
        .then(data => {
            console.log('Ventas existentes:', data);
            mapAPIToSales(data);
            hideMessage();
        })
        .catch(error => {
            console.error('Error al obtener las ventas:', error);
            hideMessage();
        });
}


function mapAPIToSales(data) {
    salesMap.clear();
    for (const sale of data) {
        salesMap.set(parseInt(sale.id), new Sale(sale.id, sale.franchiseId, sale.movieId, sale.date, sale.showtime, sale.room, sale.seats, sale.promoDescription, sale.total));
    }
}

function displaySalesTable() {
    clearTable();

    const salesTableBody = document.getElementById('data-table-body');

    if (salesMap.size === 0) {
        showNotFoundMessage();
    } else {
        hideMessage();

        for (const sale of salesMap.values()) {
            const franchise = franchisesMap.get(sale.franchiseId);
            const movie = moviesMap.get(sale.movieId);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${sale.id}</td>
                <td>${franchise.name}</td>
                <td>${movie.name}</td>
                <td>${sale.date}</td>
                <td>
                    <p class="room">Sala ${sale.room}</p>
                    <p>${sale.showtime}</p>
                </td>
                <td>${sale.seats}</td>
                <td>${sale.promoDescription}</td>
                <td>${formatCurrency(sale.total)}</td>
                <td>
                    <button class="btn-sm" data-sale-id="${sale.id}" data-action="edit"><i class="fas fa-edit"></i></button>
                    <button class="btn-sm" data-sale-id="${sale.id}" data-action="delete"><i class="far fa-trash-alt"></i></button>
                </td>
    
            `;
            salesTableBody.appendChild(row);
        }
    }

}

// Funcion que limpia la tabla
function clearTable() {
    const tableBody = document.getElementById('data-table-body');
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
    message.innerHTML = 'No se encontraron ventas con el filtro proporcionado.';
    message.style.display = 'block';
}

// Funcion que oculta mensaje
function hideMessage() {
    const message = document.getElementById('message');
    message.style.display = 'none';
}

// Función para crear una nueva venta
function createSale(newSale) {
    return fetchAPI('sales', 'POST', newSale)
        .then(data => {
            console.log('Nueva venta:', data);
        });
}

function resetModalForm() {
    document.getElementById('sale-modal-title').textContent = 'NUEVA VENTA DE BOLETOS';
    document.getElementById('sale-form').reset();
    document.getElementById('sale-tickets-field').step = 1;
    document.getElementById('sale-tickets-field').min = 1;
    document.getElementById('sale-tickets-field').value = 1;
    document.querySelectorAll('#sale-form select').forEach(select => {
        select.selectedIndex = 0;
        select.innerHTML = '';
    });
}

function checkSeats() {
    // si el número de entradas no coincide con el número de asientos, mandar una alerta
    const seatsField = document.getElementById('showtime-seats');
    const seats = seatsField.value.split(' ').length;
    const tickets = document.getElementById('sale-tickets-field').value;
    if (seats != tickets) {
        alert('El número de asientos no coincide con el número de boletos. Por favor revise los datos.');
        return false;
    }
    return true;
}

function processSubmitSale() {
    if (!checkSeats()) return false;

    const franchiseId = parseInt(document.getElementById('franchise-field').value);
    const movieId = parseInt(document.getElementById('movie-field').value);
    const date = document.getElementById('sale-date-field').value;
    const showtime = document.getElementById('showtime-field').value.split(',')[1];
    const room = document.getElementById('showtime-field').value.split(',')[0];
    const seats = document.getElementById('showtime-seats').value;
    const promoDescription = document.getElementById('sale-promo-field').value;
    const total = parseFloat(document.getElementById('sale-total-field').value.replace('$', '').replace(',', ''));

    const saleToSave = new Sale(
        null,
        franchiseId,
        movieId,
        date,
        showtime,
        room,
        seats,
        promoDescription,
        total
    );

    if (editingSaleId) {
        saleToSave.id = editingSaleId;
        return updateSale(editingSaleId, saleToSave)
            .then(() => {
                // Después de que se edite la venta, obtener las ventas actualizadas
                return getSales();
            })
            .then(() => {
                displaySalesTable(); // Mostrar la tabla actualizada
            })
            .catch(error => {
                console.error(`Error al moficar la venta ${editingSaleId}:`, error);
            });
    } else {
        return createSale(saleToSave)
            .then(() => {
                // Después de que se cree la venta, obtener las ventas actualizadas
                return getSales();
            })
            .then(() => {
                displaySalesTable(); // Mostrar la tabla actualizada
            })
            .catch(error => {
                console.error('Error al crear la venta:', error);
            });
    }

}

// Funciòn para actualizar una venta existente
function updateSale(saleId, updatedSale) {
    return fetchAPI(`sales/${saleId}`, 'PUT', updatedSale)
        .then(data => {
            console.log('Venta actualizada:', data);
            editingSaleId = null;
        });
}

// Función para eliminar una venta existente
function deleteSale(saleId) {
    return fetchAPI(`sales/${saleId}`, 'DELETE')
        .then(data => {
            console.log('Venta eliminada:', data);
        });
}

//#region VISTA DE FORMULARIOS
function initFilterForm() {
    const franchiseFilter = document.getElementById('franchise-filter');
    const movieFilter = document.getElementById('movie-filter');
    franchisesMap.forEach(franchise => {
        const option = document.createElement('option');
        option.value = franchise.id;
        option.text = franchise.name;

        franchiseFilter.appendChild(option);
    });
    moviesMap.forEach(movie => {
        const option = document.createElement('option');
        option.value = movie.id;
        option.text = movie.name;
        movieFilter.appendChild(option);
    });
}


function initModalForm() {

    const franchiseSelectField = document.getElementById('franchise-field');
    franchisesMap.forEach(franchise => {
        const option = document.createElement('option');
        option.value = franchise.id;
        option.text = `${franchise.name} - ${franchise.address}`;
        franchiseSelectField.appendChild(option);
    });

    franchiseSelectField.addEventListener('change', () => {
        refreshScreenings();
    });

    // inicializar nueva venta con fecha de hoy
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('sale-date-field').value = today;

    const showtimeSelectField = document.getElementById('showtime-field');
    const movieSelectField = document.getElementById('movie-field');
    const promoField = document.getElementById('sale-promo-field');

    const ticketsField = document.getElementById('sale-tickets-field');
    const totalField = document.getElementById('sale-total-field');
    let precioPromo = -1;
    let totalVenta = -1;

    function refreshMovies(screening) {
        if (screening.franchiseId == franchiseSelectField.value) {
            // agregar las películas disponibles según la franquicia seleccionada
            const movie = moviesMap.get(screening.movieId);
            const option = document.createElement('option');
            option.value = movie.id;
            option.text = movie.name;
            movieSelectField.appendChild(option);
        }
    }

    function refreshScreenings(bMovieSelectCallback = false) {
        showtimeSelectField.innerHTML = '';
        if (!bMovieSelectCallback) { movieSelectField.innerHTML = ''; }

        screeningsMap.forEach(screening => {

            if (!bMovieSelectCallback) { refreshMovies(screening); }

            if (screening.movieId == movieSelectField.value) {
                // si hay promoción, mostrarla
                screening.promoDescription ? promoField.value = screening.promoDescription : promoField.value = 'Ninguna';
                // si la promo es 2x1 forzar el incremento del campo de tickets a ese múltiplo
                if (screening.promoDescription.includes('2x1')) {
                    const promoMultiplier = 2;
                    ticketsField.step = promoMultiplier;
                    ticketsField.value = promoMultiplier;
                    ticketsField.min = promoMultiplier;
                } else {
                    ticketsField.step = 1;
                    ticketsField.value = 1;
                    ticketsField.min = 1;
                }

                // establecer el precio de promoción en el total a pagar multiplicado por las entradas
                precioPromo = screening.promoPrice;
                refreshTotal();

                // para cada hora, crea una opción con el formato "sala,hora"
                // dividimos el string de horas por espacios y partimos de ahí
                screening.showtimes.showtimes.split(' ').forEach(showtime => {
                    const option = document.createElement('option');
                    option.value = `${screening.showtimes.room},${showtime}`;
                    option.text = `Sala ${screening.showtimes.room} - ${showtime}`;
                    showtimeSelectField.appendChild(option);
                });

                return; // ya se encontró la película correspondiente, salir del bucle
            }
        });
    }

    refreshScreenings();
    movieSelectField.addEventListener('change', () => {
        refreshScreenings(true);
    });

    // event listener para el campo de tickets
    function refreshTotal() {
        const price = parseFloat(precioPromo);
        totalVenta = price * ticketsField.value;
        totalField.value = formatCurrency(totalVenta);
    }
    ticketsField.addEventListener('change', () => {
        refreshTotal();
    });

}

function setupModalFormForEdit(saleId) {
    editingSaleId = saleId;
    const modalTitle = document.getElementById('sale-modal-title');
    modalTitle.textContent = `Editar venta Folio ${saleId}`;

    const sale = salesMap.get(parseInt(saleId));
    console.log('Venta a editar:', sale);
    document.getElementById('franchise-field').value = sale.franchiseId;

    // manualmente crear un evento change para que se seleccionen las funciones correspondientes
    const franchiseSelectField = document.getElementById('franchise-field');
    const franchiseChangeEvent = new Event('change');
    franchiseSelectField.dispatchEvent(franchiseChangeEvent);
    document.getElementById('movie-field').value = sale.movieId;
    // manualmente crear un evento change para que se seleccionen las funciones correspondientes
    const movieSelectField = document.getElementById('movie-field');
    const movieChangeEvent = new Event('change');
    movieSelectField.dispatchEvent(movieChangeEvent);

    document.getElementById('sale-date-field').value = sale.date;
    document.getElementById('showtime-field').value = `${sale.room},${sale.showtime}`;
    document.getElementById('sale-tickets-field').value = sale.seats.split(' ').length;
    document.getElementById('showtime-seats').value = sale.seats;
    document.getElementById('sale-promo-field').value = sale.promoDescription;
    document.getElementById('sale-total-field').value = sale.total;
}

// Funcion que inicializa los eventos de los botones
function initButtonsHandler() {
    const modal = document.querySelector("dialog");
    const addSaleButton = document.getElementById('addSale');
    const closeButton = document.getElementById("close-modal");

    document.getElementById('filter-form').addEventListener('submit', event => {
        event.preventDefault();
        //displayScreenings();
    });

    document.getElementById('reset-filters').addEventListener('click', () => {
        document.querySelectorAll('input.filter-field').forEach(input => input.value = '');
        //displayScreenings();
    });

    document.getElementById('sale-form').addEventListener('submit', event => {
        event.preventDefault();
        if (processSubmitSale()) {
            modal.close();
            displaySalesTable();
        };
    });

    addSaleButton.addEventListener("click", () => {
        editingSaleId = null;
        resetModalForm();
        initModalForm();
        modal.showModal();
    });

    // eventos de acciones editar y eliminar
    document.getElementById('data-table-body').addEventListener('click', event => {
        let saleId = null;
        let action = null;
        try {
            saleId = parseInt(event.target.closest('button').dataset.saleId);
            action = event.target.closest('button').dataset.action;
        } catch (error) {
            return;
        }

        if (action === 'edit') {
            resetModalForm();
            initModalForm();
            setupModalFormForEdit(saleId);
            modal.showModal();
        } else if (action === 'delete') {
            // si se confirma la eliminación, eliminar la venta y actualizar la tabla
            if (!confirm(`¿Está seguro/a de eliminar la venta ${saleId}?`)) return;
            deleteSale(saleId)
                .then(() => {
                    // Esperar a que se elimine la venta y obtener las ventas actualizadas
                    return getSales();
                })
                .then(() => {
                    displaySalesTable(); // Mostrar la tabla actualizada
                })
                .catch(error => {
                    console.error('Error al procesar la venta:', error);
                });
        }
    });

    closeButton.addEventListener("click", () => {
        modal.close();
    });

}

//#endregion

// INICIALIZACIÓN
function initSalesPage() {
    salesMap.clear();
    showLoadingMessage();
    // Hacer promesas para obtener ambos screenings y sales
    Promise.all([getScreenings(), getSales()])
        .then(() => {
            initFilterForm();
            initModalForm();
            initButtonsHandler();
            hideMessage(); // Ocultar mensaje de carga después de obtener los datos
            displaySalesTable();
        })
        .catch(error => {
            console.error('Hubo un error al inicializar la página de ventas:', error);
            hideMessage();
        });
}

document.addEventListener('DOMContentLoaded', initSalesPage);
