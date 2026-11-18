document.addEventListener('DOMContentLoaded', () => {
    const checkoutBtn = document.getElementById('checkoutBtn');
    const closeCheckout = document.getElementById('closeCheckout');
    const checkoutModal = document.getElementById('checkoutModal');
    const checkoutForm = document.getElementById('checkoutForm');
    const successView = document.getElementById('orderSuccess');
    const successClose = document.getElementById('successClose');

    checkoutBtn.addEventListener('click', () => {
        if (cart.items.length === 0) return showNotification('Tu carrito está vacío');
        document.getElementById('orderSummary').innerHTML = cart.items.map(i =>
            `<div class="summary-row"><span>${i.name} x${i.quantity}</span><span>$${(i.price*i.quantity).toFixed(2)}</span></div>`
        ).join('') + `<div class="summary-total"><span>Total:</span><span>$${cart.getTotal().toFixed(2)}</span></div>`;
        checkoutForm.style.display = 'block';
        successView.style.display = 'none';
        checkoutModal.classList.add('active');
    });

    closeCheckout.addEventListener('click', () => checkoutModal.classList.remove('active'));

    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const orderData = {
            orderId: 'CP50-' + Date.now().toString().slice(-6),
            cliente: document.getElementById('customerName').value,
            telefono: document.getElementById('customerPhone').value,
            direccion: document.getElementById('customerAddress').value,
            banco: document.getElementById('bankSelect').value,
            metodoPago: document.getElementById('paymentMethod').value,
            items: cart.items,
            total: cart.getTotal(),
            fecha: new Date().toLocaleString()
        };
        console.log('Pedido generado:', orderData);

        // Mostrar pantalla de éxito (reemplaza al alert bloqueado)
        document.getElementById('successOrderId').textContent = '#' + orderData.orderId;
        document.getElementById('successDetails').innerHTML =
            `<div><span>Cliente</span><span>${orderData.cliente}</span></div>` +
            `<div><span>Teléfono</span><span>${orderData.telefono}</span></div>` +
            `<div><span>Método de pago</span><span>${orderData.metodoPago}</span></div>` +
            (orderData.banco ? `<div><span>Banco</span><span>${orderData.banco}</span></div>` : '') +
            `<div><span>Total</span><span>$${orderData.total.toFixed(2)}</span></div>`;
        checkoutForm.style.display = 'none';
        successView.style.display = 'block';

        cart.clear();
        checkoutForm.reset();
    });

    successClose.addEventListener('click', () => {
        checkoutModal.classList.remove('active');
        checkoutForm.style.display = 'block';
        successView.style.display = 'none';
    });
});
