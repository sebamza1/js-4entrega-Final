/*******************clases********************************/
/*class Producto {
    constructor(codigo, tipo, precio, marca, img) {
        this.codigo = codigo;
        this.tipo = tipo;
        this.precio = precio;
        this.marca = marca;
        this.img = img;
    }
}*/

class Lista {
    constructor() {
        this.listaItems = [];
    }

    agregarHTML(productos) {
        this.listaItems = productos;
    }

    mostrarHTML() {
        const contenedor = document.getElementById("contenedor");
        this.listaItems.forEach(p => {
            const tarjetaProducto = document.createElement("div");
            tarjetaProducto.className = "tarjeta-producto";

            tarjetaProducto.innerHTML = `
            <div class="card" style="width: 18rem;">
                <div class="card-body">
                    <img src="${p.img}" class="card-img-top" alt="...">
                    <div class="detalle-producto">
                    <h5 class="card-title">${p.marca}</h5>
                    <p class="card-text">   
                        <p>Código: ${p.codigo}</p>
                        <p>Precio: $ ${p.precio}</p>
                    </p>
                    
                    <button id="btn-${p.codigo}" type="button" class="btn btn-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cart" viewBox="0 0 16 16">
                            <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"></path>
                            </svg>
                    </button>
                </div>
            </div>`;

            contenedor.appendChild(tarjetaProducto);

            const btn = document.getElementById(`btn-${p.codigo}`);
            btn.addEventListener("click", () => manejadorCarrito.agregar(p));
        });
    }

    async cargarProductos() {
        try {
            const response = await fetch('./javascript/productos.json');
            const listaProductos = await response.json();

            this.agregarHTML(listaProductos);
            this.mostrarHTML();

        } catch (error) {
            console.error("Error al recuperar productos:", error);
        }
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

/***************************************************/
const listaHTML = new Lista();
const manejadorCarrito = new Carrito();

listaHTML.cargarProductos();// Llamar a leerJSON para cargar los datos
manejadorCarrito.mostrar();// Mostrar el carrito
