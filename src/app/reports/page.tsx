'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ReportData {
  totalRevenue: number;
  totalInvoices: number;
  paidInvoices: number;
  unpaidAmount: number;
  revenueByClient: { client_name: string; total: number; count: number }[];
  revenueByProduct: { product_name: string; total: number; quantity: number }[];
  revenueByMonth: { month: string; total: number; count: number }[];
  topClients: { client_name: string; total: number }[];
  statusSummary: { status: string; count: number; total: number }[];
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setMonth(0, 1); // January 1st of current year
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [data, setData] = useState<ReportData | null>(null);
  const supabase = createClient();

  async function loadReports() {
    setLoading(true);
    try {
      // Get all invoices in date range with items
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select(`
          *,
          client:clients(name),
          items:invoice_items(*)
        `)
        .gte('issue_date', dateFrom)
        .lte('issue_date', dateTo)
        .order('issue_date', { ascending: false });

      if (error) throw error;

      // Calculate totals
      let totalRevenue = 0;
      let paidRevenue = 0;
      const clientMap = new Map<string, { total: number; count: number }>();
      const productMap = new Map<string, { total: number; quantity: number }>();
      const monthMap = new Map<string, { total: number; count: number }>();
      const statusMap = new Map<string, { count: number; total: number }>();

      for (const invoice of invoices || []) {
        // Calculate invoice total
        let invoiceTotal = 0;
        for (const item of invoice.items || []) {
          const baseAmount = item.quantity * item.unit_price;
          const discountAmount = baseAmount * (item.discount_percent / 100);
          const netAmount = baseAmount - discountAmount;
          const vatAmount = netAmount * (item.vat_rate / 100);
          const itemTotal = netAmount + vatAmount;
          invoiceTotal += itemTotal;

          // Product stats
          const productKey = item.product_name;
          const productStats = productMap.get(productKey) || { total: 0, quantity: 0 };
          productStats.total += itemTotal;
          productStats.quantity += item.quantity;
          productMap.set(productKey, productStats);
        }

        totalRevenue += invoiceTotal;

        if (invoice.status === 'paid') {
          paidRevenue += invoiceTotal;
        }

        // Client stats
        const clientName = invoice.client?.name || 'Nepoznat';
        const clientStats = clientMap.get(clientName) || { total: 0, count: 0 };
        clientStats.total += invoiceTotal;
        clientStats.count += 1;
        clientMap.set(clientName, clientStats);

        // Month stats
        const monthKey = invoice.issue_date.substring(0, 7); // YYYY-MM
        const monthStats = monthMap.get(monthKey) || { total: 0, count: 0 };
        monthStats.total += invoiceTotal;
        monthStats.count += 1;
        monthMap.set(monthKey, monthStats);

        // Status stats
        const statusStats = statusMap.get(invoice.status) || { count: 0, total: 0 };
        statusStats.count += 1;
        statusStats.total += invoiceTotal;
        statusMap.set(invoice.status, statusStats);
      }

      // Convert maps to arrays and sort
      const revenueByClient = Array.from(clientMap.entries())
        .map(([client_name, stats]) => ({ client_name, ...stats }))
        .sort((a, b) => b.total - a.total);

      const revenueByProduct = Array.from(productMap.entries())
        .map(([product_name, stats]) => ({ product_name, ...stats }))
        .sort((a, b) => b.total - a.total);

      const revenueByMonth = Array.from(monthMap.entries())
        .map(([month, stats]) => ({ month, ...stats }))
        .sort((a, b) => a.month.localeCompare(b.month));

      const statusSummary = Array.from(statusMap.entries())
        .map(([status, stats]) => ({ status, ...stats }));

      setData({
        totalRevenue,
        totalInvoices: invoices?.length || 0,
        paidInvoices: invoices?.filter(i => i.status === 'paid').length || 0,
        unpaidAmount: totalRevenue - paidRevenue,
        revenueByClient,
        revenueByProduct,
        revenueByMonth,
        topClients: revenueByClient.slice(0, 5),
        statusSummary,
      });
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  const translateStatus = (status: string) => {
    switch (status) {
      case 'paid': return 'Placeno';
      case 'sent': return 'Poslato';
      case 'draft': return 'Nacrt';
      default: return status;
    }
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec'];
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Izvestaji</h1>
      </div>

      {/* Date Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Od datuma</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Do datuma</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-40"
              />
            </div>
            <Button onClick={loadReports} disabled={loading}>
              {loading ? 'Ucitavanje...' : 'Primeni'}
            </Button>
            <div className="ml-auto text-sm text-gray-500">
              Period: {formatDate(dateFrom)} - {formatDate(dateTo)}
            </div>
          </div>
        </CardContent>
      </Card>

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-5">
                <p className="text-sm font-medium text-gray-500">Ukupan prihod</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {formatCurrency(data.totalRevenue)} RSD
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5">
                <p className="text-sm font-medium text-gray-500">Broj faktura</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{data.totalInvoices}</p>
                <p className="text-sm text-gray-500">{data.paidInvoices} placenih</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5">
                <p className="text-sm font-medium text-gray-500">Neplaceno</p>
                <p className="mt-1 text-2xl font-bold text-red-600">
                  {formatCurrency(data.unpaidAmount)} RSD
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5">
                <p className="text-sm font-medium text-gray-500">Prosek po fakturi</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {formatCurrency(data.totalInvoices > 0 ? data.totalRevenue / data.totalInvoices : 0)} RSD
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Revenue */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Prihod po mesecima</h2>
            </CardHeader>
            <CardContent>
              {data.revenueByMonth.length === 0 ? (
                <p className="text-gray-500">Nema podataka za izabrani period</p>
              ) : (
                <div className="space-y-3">
                  {data.revenueByMonth.map((month) => {
                    const percentage = data.totalRevenue > 0
                      ? (month.total / data.totalRevenue) * 100
                      : 0;
                    return (
                      <div key={month.month}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{formatMonth(month.month)}</span>
                          <span>{formatCurrency(month.total)} RSD ({month.count} faktura)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Client */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Prihod po klijentu</h2>
              </CardHeader>
              <CardContent>
                {data.revenueByClient.length === 0 ? (
                  <p className="text-gray-500">Nema podataka</p>
                ) : (
                  <div className="space-y-3">
                    {data.revenueByClient.map((client, index) => (
                      <div key={client.client_name} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="w-6 text-sm text-gray-400">{index + 1}.</span>
                          <span className="font-medium">{client.client_name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{formatCurrency(client.total)} RSD</span>
                          <span className="text-sm text-gray-500 ml-2">({client.count} fakt.)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Revenue by Product */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Prodaja po proizvodu</h2>
              </CardHeader>
              <CardContent>
                {data.revenueByProduct.length === 0 ? (
                  <p className="text-gray-500">Nema podataka</p>
                ) : (
                  <div className="space-y-3">
                    {data.revenueByProduct.map((product, index) => (
                      <div key={product.product_name} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="w-6 text-sm text-gray-400">{index + 1}.</span>
                          <span className="font-medium">{product.product_name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{formatCurrency(product.total)} RSD</span>
                          <span className="text-sm text-gray-500 ml-2">({product.quantity} kom)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Status Summary */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Pregled po statusu</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {data.statusSummary.map((status) => (
                  <div
                    key={status.status}
                    className={`p-4 rounded-lg ${
                      status.status === 'paid'
                        ? 'bg-green-50'
                        : status.status === 'sent'
                        ? 'bg-yellow-50'
                        : 'bg-gray-50'
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-500">
                      {translateStatus(status.status)}
                    </p>
                    <p className="mt-1 text-xl font-bold">{status.count} faktura</p>
                    <p className="text-sm text-gray-600">{formatCurrency(status.total)} RSD</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
