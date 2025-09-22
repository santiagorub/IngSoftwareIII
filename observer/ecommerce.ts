// --- SERVICIOS QUE DEBEN REACCIONAR A UNA VENTA ---
// En el código actual, la clase Tienda está fuertemente acoplada a estos.

class GestorDeInventario {
    public actualizarStock(producto: string): void {
        console.log(`[Inventario]: Stock del producto '${producto}' actualizado.`);
    }
}

class ServicioDeEnvios {
    public despacharPedido(producto: string): void {
        console.log(`[Envíos]: Preparando el envío del producto '${producto}'.`);
    }
}

// Esta es la clase que conoce y llama directamente a los otros componentes.

class Tienda {
    private inventario: GestorDeInventario;
    private envios: ServicioDeEnvios;

    constructor() {
        // La tienda crea y conoce sus dependencias directamente. ¡Mal!
        this.inventario = new GestorDeInventario();
        this.envios = new ServicioDeEnvios();
    }

    public realizarVenta(producto: string, cantidad: number): void {
        console.log(`\n================================`);
        console.log(`Venta realizada: ${cantidad} x ${producto}`);
        console.log(`================================`);
        
        // La tienda está haciendo el trabajo de notificar a cada componente.
        // Si añadimos un nuevo servicio (ej. notificaciones), hay que modificar esta clase.
        this.inventario.actualizarStock(producto);
        this.envios.despacharPedido(producto);
    }
}


// ----- Simulación de la ejecución en la tienda online -----

const miTienda = new Tienda();

miTienda.realizarVenta("Laptop Gamer X", 1);
miTienda.realizarVenta("Mouse Óptico", 2);

export {};