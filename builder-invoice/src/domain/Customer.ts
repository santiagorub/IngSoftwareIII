export interface Customer {
  id: string;
  name: string;
  country: string; // Para calcular IVA/Impuestos por país
  email?: string;
}


