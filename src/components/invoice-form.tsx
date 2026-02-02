'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Client, Product, Invoice, InvoiceItem, InvoiceItemInput } from '@/lib/types';
import { calculateInvoice, formatCurrency, getTodayISO, getCurrentYear } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ClientSelect } from '@/components/client-select';

interface InvoiceFormProps {
  invoice?: Invoice & { items: InvoiceItem[] };
}

type InvoiceItemForm = Omit<InvoiceItemInput, 'sort_order'> & { tempId: string };

export function InvoiceForm({ invoice }: InvoiceFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!invoice;

  const [products, setProducts] = useState<Product[]>([]);
  const [, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    client_id: invoice?.client_id || '',
    invoice_number: invoice?.invoice_number || 1,
    invoice_year: invoice?.invoice_year || getCurrentYear(),
    issue_date: invoice?.issue_date || getTodayISO(),
    issue_place: invoice?.issue_place || 'Malo Srediste',
    traffic_date: invoice?.traffic_date || getTodayISO(),
    traffic_place: invoice?.traffic_place || 'Vrsac',
    due_date: invoice?.due_date || '',
    payment_method: invoice?.payment_method || 'virmanom',
    status: invoice?.status || 'draft',
  });

  const [items, setItems] = useState<InvoiceItemForm[]>(() => {
    if (invoice?.items?.length) {
      return invoice.items.map((item) => ({
        tempId: item.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent,
        vat_rate: item.vat_rate,
      }));
    }
    return [createEmptyItem()];
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  function createEmptyItem(): InvoiceItemForm {
    return {
      tempId: crypto.randomUUID(),
      product_id: null,
      product_name: '',
      quantity: 1,
      unit: '0.75',
      unit_price: 0,
      discount_percent: 0,
      vat_rate: 20,
    };
  }

  useEffect(() => {
    async function loadData() {
      try {
        // Load products
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .order('name');
        setProducts(productsData || []);

        // Get next invoice number if creating new
        if (!isEditing) {
          const { data: nextNum } = await supabase
            .rpc('get_next_invoice_number', { p_year: getCurrentYear() });
          setFormData((prev) => ({ ...prev, invoice_number: nextNum || 1 }));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, [isEditing, supabase]);

  function handleClientChange(clientId: string | null, client: Client | null) {
    setSelectedClient(client);
    setFormData((prev) => ({ ...prev, client_id: clientId || '' }));
    if (errors.client_id) {
      setErrors((prev) => ({ ...prev, client_id: '' }));
    }
  }

  function handleProductSelect(index: number, productId: string) {
    const product = products.find((p) => p.id === productId);
    if (product) {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        product_id: productId,
        product_name: product.name,
        unit: product.unit,
        unit_price: product.default_price || 0,
        vat_rate: product.vat_rate,
      };
      setItems(newItems);
    }
  }

  function handleItemChange(index: number, field: keyof InvoiceItemForm, value: string | number) {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  }

  function addItem() {
    setItems([...items, createEmptyItem()]);
  }

  function removeItem(index: number) {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!formData.client_id) {
      newErrors.client_id = 'Klijent je obavezan';
    }

    if (!formData.issue_date) {
      newErrors.issue_date = 'Datum izdavanja je obavezan';
    }

    const validItems = items.filter((item) => item.product_name.trim());
    if (validItems.length === 0) {
      newErrors.items = 'Dodajte bar jednu stavku';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const validItems = items.filter((item) => item.product_name.trim());

      if (isEditing) {
        // Update invoice
        const { error: invoiceError } = await supabase
          .from('invoices')
          .update({
            client_id: formData.client_id,
            issue_date: formData.issue_date,
            issue_place: formData.issue_place,
            traffic_date: formData.traffic_date || null,
            traffic_place: formData.traffic_place || null,
            due_date: formData.due_date || null,
            payment_method: formData.payment_method,
            status: formData.status,
          })
          .eq('id', invoice.id);

        if (invoiceError) throw invoiceError;

        // Delete old items and insert new ones
        await supabase.from('invoice_items').delete().eq('invoice_id', invoice.id);

        const { error: itemsError } = await supabase.from('invoice_items').insert(
          validItems.map((item, index) => ({
            invoice_id: invoice.id,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit: item.unit,
            unit_price: item.unit_price,
            discount_percent: item.discount_percent,
            vat_rate: item.vat_rate,
            sort_order: index,
          }))
        );

        if (itemsError) throw itemsError;
      } else {
        // Create new invoice
        const { data: newInvoice, error: invoiceError } = await supabase
          .from('invoices')
          .insert({
            invoice_number: formData.invoice_number,
            invoice_year: formData.invoice_year,
            client_id: formData.client_id,
            issue_date: formData.issue_date,
            issue_place: formData.issue_place,
            traffic_date: formData.traffic_date || null,
            traffic_place: formData.traffic_place || null,
            due_date: formData.due_date || null,
            payment_method: formData.payment_method,
            status: formData.status,
          })
          .select()
          .single();

        if (invoiceError) throw invoiceError;

        // Insert items
        const { error: itemsError } = await supabase.from('invoice_items').insert(
          validItems.map((item, index) => ({
            invoice_id: newInvoice.id,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit: item.unit,
            unit_price: item.unit_price,
            discount_percent: item.discount_percent,
            vat_rate: item.vat_rate,
            sort_order: index,
          }))
        );

        if (itemsError) throw itemsError;
      }

      router.push('/invoices');
      router.refresh();
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Greska pri cuvanju fakture');
    } finally {
      setLoading(false);
    }
  }

  const calculation = calculateInvoice(items.filter((item) => item.product_name.trim()));

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Ucitavanje...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client and Invoice Details */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Podaci o fakturi</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ClientSelect
              value={formData.client_id}
              onChange={handleClientChange}
              error={errors.client_id}
            />

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="invoice_number"
                  label="Broj fakture"
                  type="number"
                  value={formData.invoice_number}
                  onChange={(e) =>
                    setFormData({ ...formData, invoice_number: parseInt(e.target.value) || 1 })
                  }
                  disabled={isEditing}
                />
                <Input
                  id="invoice_year"
                  label="Godina"
                  type="number"
                  value={formData.invoice_year}
                  onChange={(e) =>
                    setFormData({ ...formData, invoice_year: parseInt(e.target.value) })
                  }
                  disabled={isEditing}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              id="issue_date"
              label="Datum izdavanja *"
              type="date"
              value={formData.issue_date}
              onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
              error={errors.issue_date}
            />
            <Input
              id="issue_place"
              label="Mesto izdavanja"
              value={formData.issue_place}
              onChange={(e) => setFormData({ ...formData, issue_place: e.target.value })}
            />
            <Select
              id="payment_method"
              label="Nacin placanja"
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              options={[
                { value: 'virmanom', label: 'Virmanom' },
                { value: 'gotovinom', label: 'Gotovinom' },
                { value: 'karticom', label: 'Karticom' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              id="traffic_date"
              label="Datum prometa"
              type="date"
              value={formData.traffic_date || ''}
              onChange={(e) => setFormData({ ...formData, traffic_date: e.target.value })}
            />
            <Input
              id="traffic_place"
              label="Mesto prometa"
              value={formData.traffic_place || ''}
              onChange={(e) => setFormData({ ...formData, traffic_place: e.target.value })}
            />
            <Input
              id="due_date"
              label="Rok placanja (valuta)"
              type="date"
              value={formData.due_date || ''}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>

          <Select
            id="status"
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'sent' | 'paid' })}
            options={[
              { value: 'draft', label: 'Nacrt' },
              { value: 'sent', label: 'Poslato' },
              { value: 'paid', label: 'Placeno' },
            ]}
          />
        </CardContent>
      </Card>

      {/* Invoice Items */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Stavke</h2>
            <Button type="button" variant="secondary" size="sm" onClick={addItem}>
              + Dodaj stavku
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {errors.items && (
            <p className="mb-4 text-sm text-red-600">{errors.items}</p>
          )}

          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={item.tempId}
                className="p-4 border border-gray-200 rounded-lg space-y-4"
              >
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-500">
                    Stavka {index + 1}
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Ukloni
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Proizvod
                    </label>
                    <select
                      value={item.product_id || ''}
                      onChange={(e) => handleProductSelect(index, e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Izaberi proizvod</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <Input
                      label="Naziv"
                      value={item.product_name}
                      onChange={(e) => handleItemChange(index, 'product_name', e.target.value)}
                      placeholder="Naziv proizvoda"
                    />
                  </div>

                  <Input
                    label="Jedinica"
                    value={item.unit}
                    onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                  />

                  <Input
                    label="Kolicina"
                    type="number"
                    step="0.001"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input
                    label="Cena (RSD)"
                    type="number"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) =>
                      handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)
                    }
                  />

                  <Input
                    label="Rabat (%)"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={item.discount_percent}
                    onChange={(e) =>
                      handleItemChange(index, 'discount_percent', parseFloat(e.target.value) || 0)
                    }
                  />

                  <Input
                    label="PDV (%)"
                    type="number"
                    value={item.vat_rate}
                    onChange={(e) =>
                      handleItemChange(index, 'vat_rate', parseInt(e.target.value) || 20)
                    }
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ukupno
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-medium">
                      {formatCurrency(calculation.itemCalculations[index]?.total || 0)} RSD
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardContent>
          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Poreska osnovica:</span>
                <span className="font-medium">{formatCurrency(calculation.subtotal)} RSD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">PDV:</span>
                <span className="font-medium">{formatCurrency(calculation.vatAmount)} RSD</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Ukupno:</span>
                <span>{formatCurrency(calculation.total)} RSD</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Otkazi
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Cuvanje...' : isEditing ? 'Sacuvaj izmene' : 'Kreiraj fakturu'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
