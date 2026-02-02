'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Client } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const supabase = createClient();

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.pib.includes(search) ||
      client.mb.includes(search)
  );

  async function handleDelete(id: string) {
    if (!confirm('Da li ste sigurni da zelite da obrisete ovog klijenta?')) {
      return;
    }

    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
      setClients(clients.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Greska pri brisanju klijenta. Mozda ima povezane fakture.');
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
        <h1 className="text-2xl font-bold text-gray-900">Klijenti</h1>
        <Link href="/clients/new">
          <Button>Novi klijent</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <Input
            placeholder="Pretrazi po nazivu, PIB-u ili maticnom broju..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </CardHeader>
        <CardContent className="p-0">
          {filteredClients.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {search ? 'Nema rezultata pretrage.' : 'Nema klijenata.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Naziv</TableHead>
                  <TableHead>PIB</TableHead>
                  <TableHead>Maticni broj</TableHead>
                  <TableHead>Grad</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.pib}</TableCell>
                    <TableCell>{client.mb}</TableCell>
                    <TableCell>{client.city || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-end">
                        <Link
                          href={`/clients/${client.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Izmeni
                        </Link>
                        <button
                          onClick={() => handleDelete(client.id)}
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
