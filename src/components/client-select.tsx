'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { Client } from '@/lib/types';

interface ClientSelectProps {
  value: string | null;
  onChange: (clientId: string | null, client: Client | null) => void;
  error?: string;
}

export function ClientSelect({ value, onChange, error }: ClientSelectProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadClients() {
      const { data } = await supabase.from('clients').select('*').order('name');
      setClients(data || []);

      if (value && data) {
        const client = data.find((c) => c.id === value);
        if (client) {
          setSelectedClient(client);
          setSearch(client.name);
        }
      }
    }

    loadClients();
  }, [value, supabase]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (selectedClient) {
          setSearch(selectedClient.name);
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedClient]);

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.pib.includes(search)
  );

  function handleSelect(client: Client) {
    setSelectedClient(client);
    setSearch(client.name);
    setIsOpen(false);
    onChange(client.id, client);
  }

  function handleClear() {
    setSelectedClient(null);
    setSearch('');
    onChange(null, null);
  }

  return (
    <div className="w-full" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Klijent *
      </label>
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            if (!e.target.value) {
              handleClear();
            }
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Pretrazi po nazivu ili PIB-u..."
          className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
            error ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {selectedClient && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {isOpen && filteredClients.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {filteredClients.map((client) => (
              <li
                key={client.id}
                onClick={() => handleSelect(client)}
                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50 ${
                  selectedClient?.id === client.id ? 'bg-indigo-50' : ''
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{client.name}</span>
                  <span className="text-gray-500 text-xs">
                    PIB: {client.pib} | MB: {client.mb}
                  </span>
                </div>
                {selectedClient?.id === client.id && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {selectedClient && (
        <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
          <p><strong>Adresa:</strong> {selectedClient.address || '-'}</p>
          <p><strong>Grad:</strong> {selectedClient.city || '-'}</p>
          {selectedClient.delivery_location && (
            <p><strong>Mesto isporuke:</strong> {selectedClient.delivery_location}</p>
          )}
        </div>
      )}
    </div>
  );
}
