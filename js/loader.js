class DataLoader {
    constructor() {
        this.products = [];
        this.services = [];
        this.config = { 
            telas: [], colores: [], tallas: [], sexos: [], 
            metodosPago: [], bancos: [], modelos: [], mangas: [], servicios: [] 
        };
    }

    parseCSV(text) {
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const values = line.split(',').map(v => v.trim());
            const obj = {};
            headers.forEach((header, index) => { obj[header] = values[index] || ''; });
            data.push(obj);
        }
        return data;
    }

    async loadAll() {
        try {
            // 1. Cargar Productos
            console.log('📦 Cargando productos.csv...');
            const resProd = await fetch('data/productos.csv');
            if (!resProd.ok) throw new Error('No se encontró productos.csv (HTTP ' + resProd.status + ')');
            const prodData = this.parseCSV(await resProd.text());
            
            this.products = prodData.map(p => ({
                id: parseInt(p.id),
                name: p.nombre,
                category: p.categoria,
                // FIX: Reemplaza coma por punto por si acaso quedó en el Excel original (ej: 3,5)
                price: parseFloat(String(p.precio).replace(',', '.')) || 0,
                stock: parseInt(p.stock) || 0,
                description: p.descripcion,
                icon: p.icono,
                imagen: p.imagen || ''
            }));
            console.log('✅ Productos cargados:', this.products.length);

            // 2. Cargar Servicios
            console.log('🛠️ Cargando servicios.csv...');
            const resServ = await fetch('data/servicios.csv');
            if (!resServ.ok) throw new Error('No se encontró servicios.csv');
            const servData = this.parseCSV(await resServ.text());
            this.services = servData.map(s => ({ 
                id: parseInt(s.id), name: s.nombre, description: s.descripcion, icon: s.icono 
            }));
            console.log('✅ Servicios cargados:', this.services.length);

            // 3. Cargar Configuración
            console.log('⚙️ Cargando configuracion.csv...');
            const resConf = await fetch('data/configuracion.csv');
            if (!resConf.ok) throw new Error('No se encontró configuracion.csv');
            const confData = this.parseCSV(await resConf.text());
            
            // FIX: Lógica corregida sin errores de sintaxis
            confData.forEach(item => {
                let key = item.tipo + 's'; // Ej: 'tela' -> 'telas'
                
                // Excepciones para plurales irregulares o nombres compuestos
                if (item.tipo === 'metodo_pago') key = 'metodosPago';
                if (item.tipo === 'color') key = 'colores';
                
                if (this.config[key]) {
                    this.config[key].push(item.valor);
                } else {
                    console.warn('⚠️ Tipo no reconocido en CSV:', item.tipo, '| Valor:', item.valor);
                }
            });

            console.log('✅ Configuración cargada:');
            console.log('   - Telas:', this.config.telas.length);
            console.log('   - Colores:', this.config.colores.length);
            console.log('   - Tallas:', this.config.tallas.length);
            console.log('   - Sexos:', this.config.sexos.length);
            console.log('   - Modelos:', this.config.modelos.length);
            console.log('   - Mangas:', this.config.mangas.length);
            console.log('   - Servicios:', this.config.servicios.length);
            console.log('   - Métodos de pago:', this.config.metodosPago.length);
            console.log('   - Bancos:', this.config.bancos.length);
            
            return { products: this.products, services: this.services, config: this.config };
        } catch (error) {
            console.error('❌ ERROR CRÍTICO cargando datos:', error);
            return { products: [], services: [], config: {} };
        }
    }
}
const dataLoader = new DataLoader();
