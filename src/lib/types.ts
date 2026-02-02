// Database types for Vinarija Fakturisanje

export interface Client {
  id: string;
  name: string;
  pib: string;
  mb: string;
  address: string | null;
  city: string | null;
  delivery_location: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  created_by: string | null;
}

export interface Product {
  id: string;
  name: string;
  unit: string;
  default_price: number | null;
  vat_rate: number;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: number;
  invoice_year: number;
  client_id: string;
  issue_date: string;
  issue_place: string;
  traffic_date: string | null;
  traffic_place: string | null;
  due_date: string | null;
  payment_method: string;
  status: 'draft' | 'sent' | 'paid';
  created_at: string;
  created_by: string | null;
  // Joined fields
  client?: Client;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_percent: number;
  vat_rate: number;
  sort_order: number;
}

export interface CompanySettings {
  id: string;
  owner_name: string;
  company_name: string;
  address: string | null;
  pib: string;
  mb: string;
  bank_account: string | null;
  bank_name: string | null;
  activity_code: string | null;
  phone: string | null;
  email: string | null;
}

// Form types for creating/updating
export type ClientInput = Omit<Client, 'id' | 'created_at' | 'created_by'>;
export type ProductInput = Omit<Product, 'id' | 'created_at'>;
export type InvoiceInput = Omit<Invoice, 'id' | 'created_at' | 'created_by' | 'client' | 'items'>;
export type InvoiceItemInput = Omit<InvoiceItem, 'id' | 'invoice_id'>;
export type CompanySettingsInput = Omit<CompanySettings, 'id'>;

// Calculated invoice totals
export interface InvoiceCalculation {
  subtotal: number;      // Poreska osnovica (bez PDV-a)
  vatAmount: number;     // Iznos PDV-a
  total: number;         // Ukupno sa PDV-om
  itemCalculations: ItemCalculation[];
}

export interface ItemCalculation {
  baseAmount: number;    // Količina * Cena
  discountAmount: number;// Iznos rabata
  netAmount: number;     // Osnovica nakon rabata
  vatAmount: number;     // Iznos PDV-a
  total: number;         // Ukupno sa PDV-om
}
