'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Client } from '@/lib/types';
import { ClientForm } from '@/components/client-form';

export default function EditClientPage() {
  const params = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadClient() {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        setClient(data);
      } catch (error) {
        console.error('Error loading client:', error);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadClient();
    }
  }, [params.id, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Ucitavanje...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Klijent nije pronadjen</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Izmeni klijenta</h1>
      <ClientForm client={client} />
    </div>
  );
}
