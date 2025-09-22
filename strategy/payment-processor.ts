// payment-processor.ts

// NO MODIFICAR ESTE ENUM
enum MetodoDePago {
    TARJETA = 'tarjeta',
    PAYPAL = 'paypal',
    MERCADOPAGO = 'mercadopago',
}

class ProcesadorDePagos {
    private metodoDePago: MetodoDePago;
    private monto: number;

    constructor(monto: number) {
        this.monto = monto;
        // Por defecto, se usa tarjeta de crédito
        this.metodoDePago = MetodoDePago.TARJETA; 
    }

    public setMetodoDePago(metodo: MetodoDePago): void {
        this.metodoDePago = metodo;
        console.log(`Método de pago cambiado a: ${this.metodoDePago}`);
    }

    public procesarPago(): void {
        console.log(`Iniciando procesamiento de pago por $${this.monto}...`);

        if (this.metodoDePago === MetodoDePago.TARJETA) {
            // Lógica específica para tarjetas de crédito
            console.log("Validando información de la tarjeta...");
            console.log("Contactando al banco emisor...");
            console.log(`¡Pago con TARJETA de $${this.monto} procesado exitosamente!`);

        } else if (this.metodoDePago === MetodoDePago.PAYPAL) {
            // Lógica específica para PayPal
            const emailUsuario = "usuario@ejemplo.com";
            console.log(`Redirigiendo al usuario a PayPal para autenticación...`);
            console.log(`Procesando pago para la cuenta de PayPal: ${emailUsuario}`);
            console.log(`¡Pago con PAYPAL de $${this.monto} procesado exitosamente!`);

        } else if (this.metodoDePago === MetodoDePago.MERCADOPAGO) {
            // Lógica específica para MercadoPago
            const idDePago = Math.floor(Math.random() * 100000);
            console.log(`Generando link de pago de MercadoPago...`);
            console.log(`ID de Transacción: ${idDePago}`);
            console.log(`¡Pago con MERCADOPAGO de $${this.monto} procesado exitosamente!`);
        }
        // -----------------------------------------------------------

        console.log("--------------------------------\n");
    }
}


// ----- Simulación de la ejecución en la tienda online -----
console.log("Cliente realiza una compra de $150.");
const procesador = new ProcesadorDePagos(150);

// El cliente paga con el método por defecto (Tarjeta)
procesador.procesarPago();

// El cliente decide cambiar a PayPal
procesador.setMetodoDePago(MetodoDePago.PAYPAL);
procesador.procesarPago();

// Finalmente, intenta con MercadoPago
procesador.setMetodoDePago(MetodoDePago.MERCADOPAGO);
procesador.procesarPago();

export {};
