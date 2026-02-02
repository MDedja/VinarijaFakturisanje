'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Client, ClientInput } from '@/lib/types';
import { isValidPIB, isValidMB } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ClientFormProps {
  client?: Client;
}

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!client;

  const [formData, setFormData] = useState<ClientInput>({
    name: client?.name || '',
    pib: client?.pib || '',
    mb: client?.mb || '',
    address: client?.address || '',
    city: client?.city || '',
    delivery_location: client?.delivery_location || '',
    email: client?.email || '',
    phone: client?.phone || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ClientInput, string>>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const newErrors: Partial<Record<keyof ClientInput, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Naziv je obavezan';
    }

    if (!formData.pib.trim()) {
      newErrors.pib = 'PIB je obavezan';
    } else if (!isValidPIB(formData.pib)) {
      newErrors.pib = 'PIB mora imati 9 cifara';
    }

    if (!formData.mb.trim()) {
      newErrors.mb = 'Maticni broj je obavezan';
    } else if (!isValidMB(formData.mb)) {
      newErrors.mb = 'Maticni broj mora imati 8 cifara';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('clients')
          .update(formData)
          .eq('id', client.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('clients').insert(formData);

        if (error) throw error;
      }

      router.push('/clients');
      router.refresh();
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Greska pri cuvanju klijenta');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field: keyof ClientInput, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">
            {isEditing ? 'Izmeni klijenta' : 'Novi klijent'}
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            id="name"
            label="Naziv firme *"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            placeholder="npr. Piatakia Doo"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="pib"
              label="PIB *"
              value={formData.pib}
              onChange={(e) => handleChange('pib', e.target.value)}
              error={errors.pib}
              placeholder="9 cifara"
              maxLength={9}
            />

            <Input
              id="mb"
              label="Maticni broj *"
              value={formData.mb}
              onChange={(e) => handleChange('mb', e.target.value)}
              error={errors.mb}
              placeholder="8 cifara"
              maxLength={8}
            />
          </div>

          <Input
            id="address"
            label="Adresa"
            value={formData.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="npr. Bulevar Vudroa Vilsona 14"
          />

          <Input
            id="city"
            label="Grad"
            value={formData.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="npr. 11000 Beograd"
          />

          <Input
            id="delivery_location"
            label="Mesto isporuke"
            value={formData.delivery_location || ''}
            onChange={(e) => handleChange('delivery_location', e.target.value)}
            placeholder="npr. Piatakia Galerija"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="email"
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="email@primer.com"
            />

            <Input
              id="phone"
              label="Telefon"
              value={formData.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="npr. 011/123-4567"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Otkazi
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Cuvanje...' : isEditing ? 'Sacuvaj izmene' : 'Dodaj klijenta'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
