// ⚠️ CAMBIA ESTE NÚMERO por el WhatsApp real de tu negocio (código país + número, sin + ni espacios)
const NUMERO_WA_PEDIDOS = '584148565666';

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

        // Construir mensaje para WhatsApp
        let msg = `🛒 *NUEVO PEDIDO - Creaciones Punto 50*\n\n`;
        msg += `📋 *Pedido:* #${orderData.orderId}\n`;
        msg += `👤 *Cliente:* ${orderData.cliente}\n`;
        msg += `📱 *Teléfono:* ${orderData.telefono}\n`;
        msg += `📍 *Dirección:* ${orderData.direccion}\n`;
        msg += `💳 *Método de pago:* ${orderData.metodoPago}\n`;
        if (orderData.banco) msg += `🏦 *Banco:* ${orderData.banco}\n`;
        msg += `\n*PRODUCTOS:*\n`;
        orderData.items.forEach(i => {
            msg += `• ${i.name} x${i.quantity} = $${(i.price*i.quantity).toFixed(2)}\n`;
            if (i.specs) {
                const s = i.specs;
                const detalles = [];
                if (s.tela) detalles.push(s.tela);
                if (s.color) detalles.push(s.color);
                if (s.talla) detalles.push('Talla ' + s.talla);
                if (s.servicio) detalles.push(s.servicio);
                if (detalles.length) msg += `  _(${detalles.join(' | ')})_\n`;
            }
        });
        msg += `\n💰 *TOTAL: $${orderData.total.toFixed(2)}*\n\n`;
        msg += `Enviado desde www.cpunto50.com`;

        // Mostrar pantalla de éxito
        document.getElementById('successOrderId').textContent = '#' + orderData.orderId;
        document.getElementById('successDetails').innerHTML =
            `<div><span>Cliente</span><span>${orderData.cliente}</span></div>` +
            `<div><span>Teléfono</span><span>${orderData.telefono}</span></div>` +
            `<div><span>Método de pago</span><span>${orderData.metodoPago}</span></div>` +
            (orderData.banco ? `<div><span>Banco</span><span>${orderData.banco}</span></div>` : '') +
            `<div><span>Total</span><span>$${orderData.total.toFixed(2)}</span></div>`;
        checkoutForm.style.display = 'none';
        successView.style.display = 'block';

        // Abrir WhatsApp con el mensaje
        const url = 'https://wa.me/' + NUMERO_WA_PEDIDOS + '?text=' + encodeURIComponent(msg);
        window.open(url, '_blank');

        cart.clear();
        checkoutForm.reset();
    });

    successClose.addEventListener('click', () => {
        checkoutModal.classList.remove('active');
        checkoutForm.style.display = 'block';
        successView.style.display = 'none';
    });
});
