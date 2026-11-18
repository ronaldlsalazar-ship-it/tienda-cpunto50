const NUMERO_WA = '584148565666';

let products = [], services = [], config = {};

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando aplicación...');
    
    const data = await dataLoader.loadAll();
    products = data.products;
    services = data.services;
    config = data.config;

    console.log('📊 Datos disponibles:', {
        productos: products.length,
        servicios: services.length,
        telas: config.telas?.length || 0,
        colores: config.colores?.length || 0
    });

    renderProducts(products);
    renderServices();
    renderPayments();
    populateBankSelect();
    populatePaymentSelect();
    initCotizador();
    initFilters();
    initCartModal();
    
    console.log('✅ Aplicación iniciada correctamente');
});

function renderProducts(list) {
    const grid = document.getElementById('productsGrid');
    if (!list.length) { grid.innerHTML = '<p style="text-align:center;grid-column:1/-1;">No se encontraron productos.</p>'; return; }
    
    grid.innerHTML = list.map(p => {
        const imagenHTML = p.imagen 
            ? `<div class="product-image">
                 <img src="assets/images/${p.imagen}" alt="${p.name}" loading="lazy"
                      onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas ${p.icon}\\'></i>';">
               </div>`
            : `<div class="product-image"><i class="fas ${p.icon}"></i></div>`;
        
        return `
        <div class="product-card">
            ${imagenHTML}
            <div class="product-info">
                <span class="product-category">${p.category.toUpperCase()}</span>
                <h3 class="product-name">${p.name}</h3>
                <p class="product-desc">${p.description}</p>
                <div class="product-price">$${p.price.toFixed(2)}</div>
                <span class="stock-badge ${p.stock > 0 ? 'in-stock' : 'made-to-order'}">${p.stock > 0 ? 'En Stock ('+p.stock+')' : 'Bajo Pedido'}</span>
                <button class="btn-add-cart" onclick="addToCart(${p.id})"><i class="fas fa-shopping-cart"></i> Agregar</button>
            </div>
        </div>`;
    }).join('');
}

function renderServices() {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;
    if (!services.length) { grid.innerHTML = '<p style="text-align:center;">No hay servicios disponibles.</p>'; return; }
    grid.innerHTML = services.map(s => `
        <div class="service-card"><i class="fas ${s.icon}"></i><h3>${s.name}</h3><p>${s.description}</p></div>`).join('');
}

function renderPayments() {
    const grid = document.getElementById('paymentGrid');
    if (!grid || !config.metodosPago) return;
    const iconos = { 'EFECTIVO':'fa-money-bill-wave','PAGO':'fa-mobile-alt','TRANSFERENCIA':'fa-university','PUNTO':'fa-credit-card','BINANCE':'fa-bitcoin','PAYPAL':'fa-paypal','ZELLE':'fa-wallet','BIOPAGO':'fa-qrcode' };
    grid.innerHTML = config.metodosPago.map(m => {
        let ic = 'fa-credit-card';
        for (const k in iconos) if (m.toUpperCase().includes(k)) { ic = iconos[k]; break; }
        return `<div class="payment-item"><i class="fas ${ic}"></i><span>${m}</span></div>`;
    }).join('');
}

function populateBankSelect() {
    const sel = document.getElementById('bankSelect');
    if (sel && config.bancos) sel.innerHTML = '<option value="">Sin banco / Efectivo</option>' + config.bancos.map(b => `<option value="${b}">${b}</option>`).join('');
}
function populatePaymentSelect() {
    const sel = document.getElementById('paymentMethod');
    if (sel && config.metodosPago) sel.innerHTML = '<option value="">Seleccionar...</option>' + config.metodosPago.map(m => `<option value="${m}">${m}</option>`).join('');
}

function addToCart(id) {
    const p = products.find(x => x.id === id);
    if (p) { cart.addItem(p); showNotification(`${p.name} agregado al carrito`); }
}

function initFilters() {
    const f = document.getElementById('filterCategory');
    if (f) f.addEventListener('change', e => {
        const v = e.target.value;
        renderProducts(v === 'all' ? products : products.filter(p => p.category === v));
    });
}

function initCartModal() {
    const modal = document.getElementById('cartModal');
    document.getElementById('cartBtn').addEventListener('click', () => modal.classList.add('active'));
    document.getElementById('closeCart').addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); });
}

function showNotification(msg) {
    const n = document.getElementById('notification');
    document.getElementById('notificationText').textContent = msg;
    n.classList.add('show');
    setTimeout(() => n.classList.remove('show'), 3000);
}

/* ============ COTIZADOR ============ */
function initCotizador() {
    console.log('🎨 Iniciando cotizador...');
    
    // 1. Llenar productos
    const selProd = document.getElementById('cotProducto');
    if (selProd) {
        if (products.length > 0) {
            selProd.innerHTML = products.map(p => `<option value="${p.id}">${p.name} — $${p.price.toFixed(2)}</option>`).join('');
            console.log('✅ Productos en cotizador:', products.length);
        } else {
            selProd.innerHTML = '<option value="">No hay productos disponibles</option>';
            console.warn('⚠️ No hay productos para el cotizador');
        }
    } else {
        console.error('❌ No se encontró el elemento #cotProducto');
    }

    // 2. Función helper para llenar selects
    const fill = (id, arr, def) => {
        const el = document.getElementById(id);
        if (!el) {
            console.error('❌ No se encontró el elemento #' + id);
            return;
        }
        const list = arr && arr.length ? arr : ['—'];
        el.innerHTML = `<option value="">${def}</option>` + list.map(v => `<option value="${v}">${v}</option>`).join('');
        console.log(`✅ ${id}: ${arr?.length || 0} opciones`);
    };

    // 3. Llenar todos los selects del cotizador
    fill('cotServicio', config.servicios, 'Sin servicio extra');
    fill('cotTela', config.telas, 'Seleccionar tela');
    fill('cotColor', config.colores, 'Seleccionar color');
    fill('cotTalla', config.tallas, 'Seleccionar talla');
    fill('cotSexo', config.sexos, 'Seleccionar sexo');
    fill('cotModelo', config.modelos, 'Seleccionar modelo');
    fill('cotManga', config.mangas, 'Seleccionar manga');

    // 4. Eventos de cambio
    const ids = ['cotProducto','cotCantidad','cotServicio','cotTela','cotColor','cotTalla','cotSexo','cotModelo','cotManga'];
    ids.forEach(id => { 
        const el = document.getElementById(id); 
        if (el) el.addEventListener('change', updateCotizador); 
    });
    const cantEl = document.getElementById('cotCantidad');
    if (cantEl) cantEl.addEventListener('input', updateCotizador);

    // 5. Botones
    const btnAdd = document.getElementById('cotAddCart');
    if (btnAdd) btnAdd.addEventListener('click', () => {
        const p = products.find(x => x.id === parseInt(document.getElementById('cotProducto').value));
        if (!p) return showNotification('Selecciona un producto');
        const qty = parseInt(document.getElementById('cotCantidad').value) || 1;
        cart.addItem(p, qty, getCotSpecs());
        showNotification(`${p.name} x${qty} agregado al carrito`);
    });

    const btnWa = document.getElementById('cotSendWa');
    if (btnWa) btnWa.addEventListener('click', sendCotizacionWA);

    updateCotizador();
    console.log('✅ Cotizador iniciado');
}

function getCotSpecs() {
    return {
        servicio: document.getElementById('cotServicio').value,
        tela: document.getElementById('cotTela').value,
        color: document.getElementById('cotColor').value,
        talla: document.getElementById('cotTalla').value,
        sexo: document.getElementById('cotSexo').value,
        modelo: document.getElementById('cotModelo').value,
        manga: document.getElementById('cotManga').value,
        nota: document.getElementById('cotNota').value
    };
}

function updateCotizador() {
    const p = products.find(x => x.id === parseInt(document.getElementById('cotProducto').value));
    const qty = parseInt(document.getElementById('cotCantidad').value) || 1;
    const specs = getCotSpecs();
    const total = p ? p.price * qty : 0;
    document.getElementById('cotTotal').textContent = '$' + total.toFixed(2);

    const rows = [
        ['Producto', p ? p.name : '—'],
        ['Cantidad', qty],
        ['Servicio', specs.servicio || '—'],
        ['Tela', specs.tela || '—'],
        ['Color', specs.color || '—'],
        ['Talla', specs.talla || '—'],
        ['Sexo', specs.sexo || '—'],
        ['Modelo', specs.modelo || '—'],
        ['Manga', specs.manga || '—']
    ];
    document.getElementById('cotSpecs').innerHTML = rows.map(r => `<div><span>${r[0]}</span><span>${r[1]}</span></div>`).join('');
}

function sendCotizacionWA() {
    const p = products.find(x => x.id === parseInt(document.getElementById('cotProducto').value));
    if (!p) return showNotification('Selecciona un producto');
    const qty = parseInt(document.getElementById('cotCantidad').value) || 1;
    const s = getCotSpecs();
    const total = p.price * qty;
    const msg =
`*SOLICITUD DE COTIZACIÓN - Creaciones Punto 50*

📦 Producto: ${p.name}
🔢 Cantidad: ${qty}
💰 Total estimado: $${total.toFixed(2)}

⚙️ Especificaciones:
• Servicio: ${s.servicio || 'N/A'}
• Tela: ${s.tela || 'N/A'}
• Color: ${s.color || 'N/A'}
• Talla: ${s.talla || 'N/A'}
• Sexo: ${s.sexo || 'N/A'}
• Modelo: ${s.modelo || 'N/A'}
• Manga: ${s.manga || 'N/A'}
${s.nota ? '📝 Nota: ' + s.nota : ''}

Enviado desde www.cpunto50.com`;
    const url = 'https://wa.me/' + NUMERO_WA + '?text=' + encodeURIComponent(msg);
    window.open(url, '_blank');
}

window.addToCart = addToCart;
