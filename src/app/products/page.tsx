'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Product, ProductInput } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const supabase = createClient();

  const [formData, setFormData] = useState<ProductInput>({
    name: '',
    unit: '0.75',
    default_price: null,
    vat_rate: 20,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      unit: '0.75',
      default_price: null,
      vat_rate: 20,
    });
    setEditingProduct(null);
    setShowForm(false);
  }

  function startEdit(product: Product) {
    setFormData({
      name: product.name,
      unit: product.unit,
      default_price: product.default_price,
      vat_rate: product.vat_rate,
    });
    setEditingProduct(product);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Naziv je obavezan');
      return;
    }

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', editingProduct.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert(formData);
        if (error) throw error;
      }

      await loadProducts();
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Greska pri cuvanju proizvoda');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Da li ste sigurni da zelite da obrisete ovaj proizvod?')) {
      return;
    }

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Greska pri brisanju proizvoda');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Ucitavanje...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Proizvodi</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>Novi proizvod</Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">
              {editingProduct ? 'Izmeni proizvod' : 'Novi proizvod'}
            </h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="name"
                label="Naziv *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="npr. Kosava crveno vino"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  id="unit"
                  label="Jedinica/Zapremina"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="npr. 0.75, 1, lit"
                />

                <Input
                  id="default_price"
                  label="Podrazumevana cena (RSD)"
                  type="number"
                  step="0.01"
                  value={formData.default_price || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      default_price: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  placeholder="npr. 999.00"
                />

                <Input
                  id="vat_rate"
                  label="PDV stopa (%)"
                  type="number"
                  value={formData.vat_rate}
                  onChange={(e) =>
                    setFormData({ ...formData, vat_rate: parseInt(e.target.value) || 20 })
                  }
                  placeholder="20"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Otkazi
                </Button>
                <Button type="submit">
                  {editingProduct ? 'Sacuvaj izmene' : 'Dodaj proizvod'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {products.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Nema proizvoda.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Naziv</TableHead>
                  <TableHead>Jedinica</TableHead>
                  <TableHead>Cena</TableHead>
                  <TableHead>PDV</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.unit}</TableCell>
                    <TableCell>
                      {product.default_price
                        ? `${formatCurrency(product.default_price)} RSD`
                        : '-'}
                    </TableCell>
                    <TableCell>{product.vat_rate}%</TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => startEdit(product)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Izmeni
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Obrisi
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
