'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Invoice, InvoiceItem, CompanySettings } from '@/lib/types';
import {
  formatDate,
  formatInvoiceNumber,
  formatCurrency,
  calculateInvoice,
  translateStatus,
} from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function InvoiceDetailPage() {
  const params = useParams();
  const [invoice, setInvoice] = useState<(Invoice & { items: InvoiceItem[] }) | null>(null);
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      try {
        const [invoiceRes, companyRes] = await Promise.all([
          supabase
            .from('invoices')
            .select('*, client:clients(*), items:invoice_items(*)')
            .eq('id', params.id)
            .single(),
          supabase.from('company_settings').select('*').single(),
        ]);

        if (invoiceRes.data) {
          // Sort items by sort_order
          invoiceRes.data.items = (invoiceRes.data.items || []).sort(
            (a: InvoiceItem, b: InvoiceItem) => a.sort_order - b.sort_order
          );
          setInvoice(invoiceRes.data);
        }

        if (companyRes.data) {
          setCompany(companyRes.data);
        }
      } catch (error) {
        console.error('Error loading invoice:', error);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadData();
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

  const calculation = calculateInvoice(invoice.items);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Faktura {formatInvoiceNumber(invoice.invoice_number, invoice.invoice_year)}
          </h1>
          <div className="mt-1">{getStatusBadge(invoice.status)}</div>
        </div>
        <div className="flex gap-3">
          <Link href={`/invoices/${invoice.id}/edit`}>
            <Button variant="secondary">Izmeni</Button>
          </Link>
          <Link href={`/api/invoices/${invoice.id}/pdf`} target="_blank">
            <Button>Preuzmi PDF</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Info */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Izdavac</h2>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            {company ? (
              <>
                <p className="font-medium">{company.owner_name}</p>
                <p>{company.company_name}</p>
                <p>{company.address}</p>
                <p>PIB: {company.pib} | MB: {company.mb}</p>
                {company.bank_account && (
                  <p>
                    Tekuci racun: {company.bank_account} ({company.bank_name})
                  </p>
                )}
              </>
            ) : (
              <p className="text-gray-500">Podaci o firmi nisu podeseni</p>
            )}
          </CardContent>
        </Card>

        {/* Client Info */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Kupac</h2>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            {invoice.client ? (
              <>
                <p className="font-medium">{invoice.client.name}</p>
                <p>{invoice.client.address}</p>
                <p>{invoice.client.city}</p>
                <p>PIB: {invoice.client.pib} | MB: {invoice.client.mb}</p>
                {invoice.client.delivery_location && (
                  <p>Mesto isporuke: {invoice.client.delivery_location}</p>
                )}
              </>
            ) : (
              <p className="text-gray-500">-</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Detalji fakture</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Datum izdavanja</p>
              <p className="font-medium">{formatDate(invoice.issue_date)}</p>
            </div>
            <div>
              <p className="text-gray-500">Mesto izdavanja</p>
              <p className="font-medium">{invoice.issue_place || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Datum prometa</p>
              <p className="font-medium">
                {invoice.traffic_date ? formatDate(invoice.traffic_date) : '-'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Mesto prometa</p>
              <p className="font-medium">{invoice.traffic_place || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Rok placanja</p>
              <p className="font-medium">
                {invoice.due_date ? formatDate(invoice.due_date) : '-'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Nacin placanja</p>
              <p className="font-medium">{invoice.payment_method}</p>
            </div>
            <div>
              <p className="text-gray-500">Poziv na broj</p>
              <p className="font-medium">
                {formatInvoiceNumber(invoice.invoice_number, invoice.invoice_year)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Items */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Stavke</h2>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">R.br</TableHead>
                <TableHead>Opis</TableHead>
                <TableHead className="text-right">Jed.</TableHead>
                <TableHead className="text-right">Kol.</TableHead>
                <TableHead className="text-right">Cena</TableHead>
                <TableHead className="text-right">Rabat</TableHead>
                <TableHead className="text-right">Osnovica</TableHead>
                <TableHead className="text-right">PDV</TableHead>
                <TableHead className="text-right">Ukupno</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item, index) => {
                const calc = calculation.itemCalculations[index];
                return (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell className="text-right">{item.unit}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.unit_price)}
                    </TableCell>
                    <TableCell className="text-right">{item.discount_percent}%</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(calc.netAmount)}
                    </TableCell>
                    <TableCell className="text-right">{item.vat_rate}%</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(calc.total)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
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
                <span className="text-gray-500">PDV (20%):</span>
                <span className="font-medium">{formatCurrency(calculation.vatAmount)} RSD</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Ukupno za uplatu:</span>
                <span>{formatCurrency(calculation.total)} RSD</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-gray-500 space-y-1">
        <p>PDV obracunat na osnovu clana 5 zakona o PDV-u.</p>
        <p>Racun je uradjen na racunaru i punovazan bez pecata i potpisa.</p>
      </div>
    </div>
  );
}
