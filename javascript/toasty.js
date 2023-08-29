function Toasty(producto) {
    Toastify({
        text: `${producto.tipo} ${producto.marca} \n Agregado al Carrito`,
        duration: 2000,
        style: {
            background: "linear-gradient(to right, #420885, #313130 )",
          },
    }).showToast();
}