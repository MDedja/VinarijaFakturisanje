import { InvoiceForm } from '@/components/invoice-form';

export default function NewInvoicePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nova faktura</h1>
      <InvoiceForm />
    </div>
  );
}
