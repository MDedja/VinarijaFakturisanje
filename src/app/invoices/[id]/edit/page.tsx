'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Invoice, InvoiceItem } from '@/lib/types';
import { InvoiceForm } from '@/components/invoice-form';

export default function EditInvoicePage() {
  const params = useParams();
  const [invoice, setInvoice] = useState<(Invoice & { items: InvoiceItem[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadInvoice() {
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select('*, client:clients(*), items:invoice_items(*)')
          .eq('id', params.id)
          .single();

        if (error) throw error;

        // Sort items by sort_order
        if (data) {
          data.items = (data.items || []).sort(
            (a: InvoiceItem, b: InvoiceItem) => a.sort_order - b.sort_order
          );
          setInvoice(data);
        }
      } catch (error) {
        console.error('Error loading invoice:', error);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadInvoice();
    }
  }, [params.id, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Ucitavanje...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Faktura nije pronadjena</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Izmeni fakturu</h1>
      <InvoiceForm invoice={invoice} />
    </div>
  );
}
