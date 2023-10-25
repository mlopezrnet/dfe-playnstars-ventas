import { fetchAPI } from './fetch-api.js';

class Sale {
    constructor(id, franchiseId, movieId, showtime, promoDescription, total) {
        this.id = id;
        this.franchiseId = franchiseId;
        this.movieId = movieId;
        this.showtime = showtime;
        this.promoDescription = promoDescription;
        this.total = total;
    }
}

const modal = document.querySelector("dialog");
const addSaleButton = document.getElementById('addSale');
const closeButton = document.getElementById("close-modal");

const sales = new Map();

addSaleButton.addEventListener("click", () => {
    modal.showModal();
});

closeButton.addEventListener("click", () => {
    modal.close();
});

// Función para obtener los boletos vendidos
function getSales() {
    fetchAPI('sales', 'GET')
        .then(data => {
            console.log('Ventas existentes:', data);
            mapAPIToSales(data);
        });
}

function mapAPIToSales(data) {
    for (const sale of data) {
        sales.set(sale.id, new Sale(sale.franchiseId, sale.movieId, sale.showtime, sale.promoDescription, sale.total));
    }
}

function populateSales() { 
    const salesTable = document.getElementById('data-table');
    const salesTableBody = document.getElementById('data-table-body');
    salesTableBody.innerHTML = '';

    for (const sale of sales.values()) {
        const row = salesTableBody.insertRow();
        row.innerHTML = `
            <td>${sale.franchiseId}</td>
            <td>${sale.movieId}</td>
            <td>${sale.showtime}</td>
            <td>${sale.promoDescription}</td>
            <td>${sale.total}</td>
            <td>
                <button class="btn btn-primary btn-sm" data-sale-id="${sale.id}" data-action="edit">Editar</button>
                <button class="btn btn-danger btn-sm" data-sale-id="${sale.id}" data-action="delete">Eliminar</button>
            </td>
        `;
    }
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
    getSales();
    populateSales();

}

document.addEventListener('DOMContentLoaded', initSalesPage);
