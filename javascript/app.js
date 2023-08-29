/*******************clases********************************/
class Producto {
    constructor(codigo, tipo, precio, marca, img) {
        this.codigo = codigo;
        this.tipo = tipo;
        this.precio = precio;
        this.marca = marca;
        this.img = img;
    }
}

class Lista {
    constructor() {
        this.listaItems = [];
    }

    agregarHTML(producto) {
        this.listaItems.push(producto);
    }

    mostrarHTML() {
        const contenedor = document.getElementById("contenedor");
        this.listaItems.forEach(p => {
            const tarjetaProducto = document.createElement("div");
            tarjetaProducto.className = "tarjeta-producto";

            tarjetaProducto.innerHTML = `
                <img src="${p.img}">
                <div class="detalle-producto">
                    <h2>Precio: $ ${p.precio}</h2>
                    <p>Código: ${p.codigo}</p>
                    <p>Marca: ${p.marca}</p>
                    <button id="btn-${p.codigo}" class="btnAddCarrito"><img src="./img/Shopping-Cart.png"></button>
                </div>`;
            contenedor.appendChild(tarjetaProducto);

            const btn = document.getElementById(`btn-${p.codigo}`);
            btn.addEventListener("click", () => manejadorCarrito.agregar(p));
        });
    }
}

class Carrito {
    constructor() {
        this.listaItems = [];
    }

    agregar(p) {
        const carritoStorage = JSON.parse(localStorage.getItem("carritoStorage"));
        const nuevoProducto = p;
        if (!carritoStorage) {
            nuevoProducto.cantidad = 1;
            localStorage.setItem("carritoStorage", JSON.stringify([nuevoProducto]));
            Toasty(nuevoProducto);
        } else {
            const indice = carritoStorage.findIndex(item => item.codigo === p.codigo);
            const nuevoCarritoStorage = carritoStorage.slice();
            if (indice >= 0) {
                nuevoCarritoStorage[indice].cantidad++;
            } else {
                nuevoProducto.cantidad = 1;
                nuevoCarritoStorage.push(nuevoProducto);
            }
            localStorage.setItem("carritoStorage", JSON.stringify(nuevoCarritoStorage));
            Toasty(nuevoProducto);
        }
    }

    restarCantidad(producto) {
        const carritoStorage = JSON.parse(localStorage.getItem("carritoStorage"));
        const indice = carritoStorage.findIndex(item => item.codigo === producto.codigo);
        
        if (indice >= 0 && carritoStorage[indice].cantidad > 1) {
            carritoStorage[indice].cantidad--;
            localStorage.setItem("carritoStorage", JSON.stringify(carritoStorage));
            this.actualizarCarrito();
        } else if (indice >= 0 && carritoStorage[indice].cantidad === 1) {
            Swal.fire({
                title: 'Eliminar producto',
                text: '¿Deseas eliminar este producto del carrito?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'Cancelar',
                confirmButtonText: 'Eliminar'
            }).then((result) => {
                if (result.isConfirmed) {
                    carritoStorage.splice(indice, 1);
                    localStorage.setItem("carritoStorage", JSON.stringify(carritoStorage));
                    this.actualizarCarrito();
                }
            });
        }
    }


    sumarCantidad(producto) {
        const carritoStorage = JSON.parse(localStorage.getItem("carritoStorage"));
        const indice = carritoStorage.findIndex(item => item.codigo === producto.codigo);
        if (indice >= 0) {
            carritoStorage[indice].cantidad++;
            localStorage.setItem("carritoStorage", JSON.stringify(carritoStorage));
            this.actualizarCarrito();
        }
    }

    actualizarCarrito() {
        const carritoStorage = JSON.parse(localStorage.getItem("carritoStorage"));
        let subTotal = 0;

        if (carritoStorage.length === 0) {
            Swal.fire({
                title: 'Carrito vacío',
                text: 'No hay productos en el carrito',
                icon: 'warning',
                width: 250,
                position: 'top-end',
                confirmButtonText: 'Cerrar'
            });
        } else {
            const carritoHTML = carritoStorage.map(producto => {
                const precioTotalProducto = producto.precio * producto.cantidad;
                subTotal += precioTotalProducto;
                return `
                    <div class="producto-carrito">
                        <img src="${producto.img}" class="miniatura swal2-image">
                        <p>${producto.marca}</p>
                        <p>Precio: ${producto.precio}</p>
                        <button id="btnMenos-${producto.codigo}"> - </button>${producto.cantidad}<button id="btnMas-${producto.codigo}"> + </button>
                    </div>
                `;
            }).join("");

            const subtotalHTML = `<p class="subtotal">Subtotal: $ ${subTotal}</p>`;

            Swal.fire({
                title: 'Carrito',
                html: carritoHTML + subtotalHTML,
                position: 'top-end',
                width: 250,
                showCancelButton: true,
                cancelButtonColor: '#d33',
                confirmButtonColor: '#3085d6',
                cancelButtonText: 'Cancelar',
                confirmButtonText: 'Comprar'
            }).then((result) => {
                if (result.isConfirmed) {
                    this.pagar(subTotal);
                }
            });

            carritoStorage.forEach(producto => {
                const btnMenos = document.getElementById(`btnMenos-${producto.codigo}`);
                const btnMas = document.getElementById(`btnMas-${producto.codigo}`);

                btnMenos.addEventListener("click", () => this.restarCantidad(producto));
                btnMas.addEventListener("click", () => this.sumarCantidad(producto));
            });
        }
    }

    pagar(subTotal) {
        Swal.fire({
            title: 'Finalizar Compra?',
            text: "SubTotal: " + subTotal,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Cancelar Compra',
            confirmButtonText: 'Confirmar Pago'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.clear();
                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Gracias por Su Compra',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        });
    }

    mostrar() {
        const btnVerCarrito = document.getElementById("btnVerCarrito");

        btnVerCarrito.addEventListener("click", () => {
            const carritoStorage = JSON.parse(localStorage.getItem("carritoStorage"));

            if (carritoStorage) {
                this.actualizarCarrito();
            } else {
                Swal.fire({
                    title: 'Carrito vacío',
                    text: 'No hay productos en el carrito',
                    icon: 'warning',
                    width: 250,
                    position: 'top-end',
                    confirmButtonText: 'Cerrar'
                });
            }
        });
    }
}

/*******************Instancia Obj********************************/
/*
const produc1 = new Producto("M023","mouse", 32412, "RedDragon", "./img/productos/m01.png");
const produc2 = new Producto("M024", "mouse",42412, "BlueFalcon", "./img/productos/m02.png");
const produc3 = new Producto("M025", "microfono", 52412, "GreenPhoenix", "./img/productos/mic01.png");
const produc4 = new Producto("M026", "teclado",62412, "RedDragon", "./img/productos/t02.png");
const produc5 = new Producto("M027", "auricular",72412, "BlueFalcon", "./img/productos/a01.png");
const produc6 = new Producto("M029", "parlante",82412, "GreenPhoenix", "./img/productos/p01.png");
const produc7 = new Producto("M030", "auricular",62412, "RedDragon", "./img/productos/a02.png");
const produc8 = new Producto("M031", "teclado",72412, "BlueFalcon", "./img/productos/t01.png");
const produc9 = new Producto("M032", "parlante",82412, "GreenPhoenix", "./img/productos/p02.png");*/

const listaHTML = new Lista();
/*
listaHTML.agregarHTML(produc1);
listaHTML.agregarHTML(produc2);
listaHTML.agregarHTML(produc3);
listaHTML.agregarHTML(produc4);
listaHTML.agregarHTML(produc5);
listaHTML.agregarHTML(produc6);
listaHTML.agregarHTML(produc7);
listaHTML.agregarHTML(produc8);
listaHTML.agregarHTML(produc9);*/

const manejadorCarrito = new Carrito();

/*********************************************************************/

cargarProductosDesdeJSON();

listaHTML.mostrarHTML();
manejadorCarrito.mostrar();
