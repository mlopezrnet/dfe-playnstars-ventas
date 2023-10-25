import { fetchAPI } from './fetch-api.js';
import { franchisesMap, moviesMap, screeningsMap, getScreenings, formatCurrency } from './common.js';

class Sale {
    constructor(id, franchiseId, movieId, date, showtime, promoDescription, total) {
        this.id = id;
        this.franchiseId = franchiseId;
        this.movieId = movieId;
        this.date = date;
        this.showtime = showtime;
        this.promoDescription = promoDescription;
        this.total = total;
    }
}

const modal = document.querySelector("dialog");
const addSaleButton = document.getElementById('addSale');
const closeButton = document.getElementById("close-modal");

//#region DATOS GLOBALES

const sales = new Map();
// Delay para simular carga desde servidor
let delay = 2000;

//#endregion

addSaleButton.addEventListener("click", () => {
    modal.showModal();
});

closeButton.addEventListener("click", () => {
    modal.close();
});

// Función para obtener los boletos vendidos
function getSales() {
    return fetchAPI('sales', 'GET')
        .then(data => {
            console.log('Ventas existentes:', data);
            mapAPIToSales(data);
        });
}

function mapAPIToSales(data) {
    for (const sale of data) {
        sales.set(sale.id, new Sale(sale.id, sale.franchiseId, sale.movieId, sale.date, sale.showtime, sale.promoDescription, sale.total));
    }
}

function displaySalesTable() {
    clearTable();
    showLoadingMessage();

    setTimeout(() => {
        const salesTable = document.getElementById('data-table');
        const salesTableBody = document.getElementById('data-table-body');

        if (sales.size === 0) {
            showNotFoundMessage();
        } else {
            hideMessage();

            for (const sale of sales.values()) {
                const franchise = franchisesMap.get(sale.franchiseId);
                const movie = moviesMap.get(sale.movieId);

                const row = document.createElement('tr');
                row.innerHTML = `
                <td>${sale.id}</td>
                <td>${franchise.name}</td>
                <td>${movie.name}</td>
                <td>${sale.date}</td>
                <td>${sale.showtime}</td>
                <td>${sale.promoDescription}</td>
                <td>${formatCurrency(sale.total)}</td>
                <td>
                    <button class="btn btn-primary btn-sm" data-sale-id="${sale.id}" data-action="edit">Editar</button>
                    <button class="btn btn-danger btn-sm" data-sale-id="${sale.id}" data-action="delete">Eliminar</button>
                </td>
    
            `;
                salesTableBody.appendChild(row);
            }
        }

    }, delay);
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
    fetchAPI('sales', 'POST', newSale)
        .then(data => {
            console.log('Nueva venta:', data);
        });
}

// Funciòn para actualizar una venta existente
function updateSale(saleId, updatedSale) {
    fetchAPI(`sales/${saleId}`, 'PUT', updatedSale)
        .then(data => {
            console.log('Venta actualizada:', data);
        });
}

// Función para eliminar una venta existente
function deleteSale(saleId) {
    fetchAPI(`sales/${saleId}`, 'DELETE')
        .then(data => {
            console.log('Venta eliminada:', data);
        });
}

// INICIALIZACIÓN
function initSalesPage() {
    // Hacer promesas para obtener ambos screenings y sales
    Promise.all([getScreenings(), getSales()])
        .then(() => {
            displaySalesTable();
        })
        .catch(error => {
            console.error('Hubo un error al obtener las ventas:', error);
        });
}

document.addEventListener('DOMContentLoaded', initSalesPage);
