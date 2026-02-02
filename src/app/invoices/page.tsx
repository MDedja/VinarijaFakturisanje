'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Invoice } from '@/lib/types';
import { formatDate, formatInvoiceNumber, translateStatus } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const supabase = createClient();

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, client:clients(*)')
        .order('invoice_year', { ascending: false })
        .order('invoice_number', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
      formatInvoiceNumber(invoice.invoice_number, invoice.invoice_year).includes(search);

    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  async function handleDelete(id: string) {
    if (!confirm('Da li ste sigurni da zelite da obrisete ovu fakturu?')) {
      return;
    }

    try {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
      setInvoices(invoices.filter((i) => i.id !== id));
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Greska pri brisanju fakture');
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">{translateStatus(status)}</Badge>;
      case 'sent':
        return <Badge variant="warning">{translateStatus(status)}</Badge>;
      default:
        return <Badge variant="default">{translateStatus(status)}</Badge>;
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Fakture</h1>
        <Link href="/invoices/new">
          <Button>Nova faktura</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Pretrazi po klijentu ili broju fakture..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Svi statusi' },
                { value: 'draft', label: 'Nacrt' },
                { value: 'sent', label: 'Poslato' },
                { value: 'paid', label: 'Placeno' },
              ]}
              className="w-40"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredInvoices.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {search || statusFilter !== 'all' ? 'Nema rezultata pretrage.' : 'Nema faktura.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Broj</TableHead>
                  <TableHead>Klijent</TableHead>
                  <TableHead>Datum izdavanja</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {formatInvoiceNumber(invoice.invoice_number, invoice.invoice_year)}
                    </TableCell>
                    <TableCell>{invoice.client?.name || '-'}</TableCell>
                    <TableCell>{formatDate(invoice.issue_date)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-end">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Pogledaj
                        </Link>
                        <Link
                          href={`/invoices/${invoice.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Izmeni
                        </Link>
                        <button
                          onClick={() => handleDelete(invoice.id)}
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
