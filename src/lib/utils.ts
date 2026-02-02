import { InvoiceCalculation, ItemCalculation } from './types';

// Format number as Serbian currency (RSD)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('sr-RS', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format date as Serbian format (DD.MM.YYYY)
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('sr-RS', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// Format invoice number (e.g., 6/2024)
export function formatInvoiceNumber(number: number, year: number): string {
  return `${number}/${year}`;
}

// Minimal type for invoice item calculation
interface InvoiceItemCalc {
  quantity: number;
  unit_price: number;
  discount_percent: number;
  vat_rate: number;
}

// Calculate single invoice item
export function calculateItem(item: InvoiceItemCalc): ItemCalculation {
  const baseAmount = item.quantity * item.unit_price;
  const discountAmount = baseAmount * (item.discount_percent / 100);
  const netAmount = baseAmount - discountAmount;
  const vatAmount = netAmount * (item.vat_rate / 100);
  const total = netAmount + vatAmount;

  return {
    baseAmount,
    discountAmount,
    netAmount,
    vatAmount,
    total,
  };
}

// Calculate invoice totals
export function calculateInvoice(items: InvoiceItemCalc[]): InvoiceCalculation {
  const itemCalculations = items.map(calculateItem);

  const subtotal = itemCalculations.reduce((sum, calc) => sum + calc.netAmount, 0);
  const vatAmount = itemCalculations.reduce((sum, calc) => sum + calc.vatAmount, 0);
  const total = itemCalculations.reduce((sum, calc) => sum + calc.total, 0);

  return {
    subtotal,
    vatAmount,
    total,
    itemCalculations,
  };
}

// Get today's date in ISO format (YYYY-MM-DD)
export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

// Get current year
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

// Convert number to words (Serbian)
export function numberToWords(num: number): string {
  // Simplified version - just format the number nicely
  const [whole, decimal] = num.toFixed(2).split('.');
  return `${formatCurrency(parseInt(whole))},${decimal} RSD`;
}

// Validate PIB (should be 9 digits)
export function isValidPIB(pib: string): boolean {
  return /^\d{9}$/.test(pib.replace(/\s/g, ''));
}

// Validate MB (should be 8 digits)
export function isValidMB(mb: string): boolean {
  return /^\d{8}$/.test(mb.replace(/\s/g, ''));
}

// Generate status badge color
export function getStatusColor(status: string): string {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'sent':
      return 'bg-blue-100 text-blue-800';
    case 'draft':
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Translate status to Serbian
export function translateStatus(status: string): string {
  switch (status) {
    case 'paid':
      return 'Plaćeno';
    case 'sent':
      return 'Poslato';
    case 'draft':
    default:
      return 'Nacrt';
  }
}

// Debounce function for search inputs
export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
