class Cart {
    constructor() { this.items = JSON.parse(localStorage.getItem('cp50_cart')) || []; this.updateUI(); }
    addItem(product, qty = 1, specs = null) {
        const key = product.id + (specs ? JSON.stringify(specs) : '');
        const existing = this.items.find(i => i.key === key);
        if (existing) existing.quantity += qty;
        else this.items.push({ key, id: product.id, name: product.name, price: product.price, quantity: qty, specs });
        this.save(); this.updateUI();
    }
    removeItem(key) { this.items = this.items.filter(i => i.key !== key); this.save(); this.updateUI(); }
    updateQty(key, qty) {
        const item = this.items.find(i => i.key === key);
        if (item) { item.quantity = qty; if (qty <= 0) this.removeItem(key); else { this.save(); this.updateUI(); } }
    }
    clear() { this.items = []; this.save(); this.updateUI(); }
    getTotal() { return this.items.reduce((s, i) => s + i.price * i.quantity, 0); }
    getCount() { return this.items.reduce((s, i) => s + i.quantity, 0); }
    save() { localStorage.setItem('cp50_cart', JSON.stringify(this.items)); }
    specText(specs) {
        if (!specs) return '';
        const parts = [];
        if (specs.servicio) parts.push(specs.servicio);
        if (specs.tela) parts.push(specs.tela);
        if (specs.color) parts.push(specs.color);
        if (specs.talla) parts.push('Talla ' + specs.talla);
        if (specs.sexo) parts.push(specs.sexo);
        return parts.length ? parts.join(' · ') : '';
    }
    updateUI() {
        const c = document.getElementById('cartCount');
        const items = document.getElementById('cartItems');
        const total = document.getElementById('totalAmount');
        if (c) c.textContent = this.getCount();
        if (total) total.textContent = '$' + this.getTotal().toFixed(2);
        if (items) {
            if (!this.items.length) { items.innerHTML = '<p style="text-align:center;padding:2rem;color:#6b7280;">Tu carrito está vacío</p>'; return; }
            items.innerHTML = this.items.map(i => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${i.name}</h4>
                        <p>$${i.price.toFixed(2)} x ${i.quantity}</p>
                        ${i.specs ? '<p class="cart-item-specs">' + this.specText(i.specs) + '</p>' : ''}
                    </div>
                    <div class="cart-actions">
                        <div class="qty-controls">
                            <button onclick="cart.updateQty('${i.key}', ${i.quantity-1})">-</button>
                            <span>${i.quantity}</span>
                            <button onclick="cart.updateQty('${i.key}', ${i.quantity+1})">+</button>
                        </div>
                        <button class="btn-remove" onclick="cart.removeItem('${i.key}')"><i class="fas fa-trash"></i></button>
                    </div>
                </div>`).join('');
        }
    }
}
const cart = new Cart();
