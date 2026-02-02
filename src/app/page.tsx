'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Invoice } from '@/lib/types';
import { formatDate, formatInvoiceNumber, translateStatus } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalClients: 0,
    totalProducts: 0,
    unpaidInvoices: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadDashboard() {
      try {
        // Load recent invoices with client info
        const { data: invoices } = await supabase
          .from('invoices')
          .select('*, client:clients(*)')
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentInvoices(invoices || []);

        // Load stats
        const [invoiceCount, clientCount, productCount, unpaidCount] = await Promise.all([
          supabase.from('invoices').select('id', { count: 'exact', head: true }),
          supabase.from('clients').select('id', { count: 'exact', head: true }),
          supabase.from('products').select('id', { count: 'exact', head: true }),
          supabase.from('invoices').select('id', { count: 'exact', head: true }).neq('status', 'paid'),
        ]);

        setStats({
          totalInvoices: invoiceCount.count || 0,
          totalClients: clientCount.count || 0,
          totalProducts: productCount.count || 0,
          unpaidInvoices: unpaidCount.count || 0,
        });
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [supabase]);

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
        <h1 className="text-2xl font-bold text-gray-900">Pocetna</h1>
        <Link href="/invoices/new">
          <Button>Nova faktura</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Ukupno faktura</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalInvoices}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Neplacene fakture</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.unpaidInvoices}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Klijenti</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalClients}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Proizvodi</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalProducts}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Poslednje fakture</h2>
            <Link href="/invoices" className="text-sm text-indigo-600 hover:text-indigo-500">
              Pogledaj sve
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recentInvoices.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Nema faktura. <Link href="/invoices/new" className="text-indigo-600 hover:text-indigo-500">Kreirajte prvu fakturu</Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Broj</TableHead>
                  <TableHead>Klijent</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {formatInvoiceNumber(invoice.invoice_number, invoice.invoice_year)}
                    </TableCell>
                    <TableCell>{invoice.client?.name || '-'}</TableCell>
                    <TableCell>{formatDate(invoice.issue_date)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Pogledaj
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/invoices/new">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-4">
              <div className="p-2 bg-indigo-100 rounded-lg mr-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Nova faktura</p>
                <p className="text-sm text-gray-500">Kreiraj novu fakturu</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/clients/new">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-4">
              <div className="p-2 bg-green-100 rounded-lg mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Novi klijent</p>
                <p className="text-sm text-gray-500">Dodaj novog klijenta</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/products">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-4">
              <div className="p-2 bg-purple-100 rounded-lg mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Proizvodi</p>
                <p className="text-sm text-gray-500">Upravljaj proizvodima</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
