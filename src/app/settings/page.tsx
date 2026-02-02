'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { CompanySettings, CompanySettingsInput } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SettingsPage() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const supabase = createClient();

  const [formData, setFormData] = useState<CompanySettingsInput>({
    owner_name: '',
    company_name: '',
    address: '',
    pib: '',
    mb: '',
    bank_account: '',
    bank_name: '',
    activity_code: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data, error } = await supabase
          .from('company_settings')
          .select('*')
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setSettings(data);
          setFormData({
            owner_name: data.owner_name,
            company_name: data.company_name,
            address: data.address || '',
            pib: data.pib,
            mb: data.mb,
            bank_account: data.bank_account || '',
            bank_name: data.bank_name || '',
            activity_code: data.activity_code || '',
            phone: data.phone || '',
            email: data.email || '',
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!formData.owner_name.trim() || !formData.company_name.trim() || !formData.pib.trim() || !formData.mb.trim()) {
      setMessage({ type: 'error', text: 'Molimo popunite obavezna polja (naziv, PIB, MB)' });
      return;
    }

    setSaving(true);

    try {
      if (settings) {
        // Update existing
        const { error } = await supabase
          .from('company_settings')
          .update(formData)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('company_settings')
          .insert(formData);

        if (error) throw error;
      }

      setMessage({ type: 'success', text: 'Podesavanja su uspesno sacuvana' });
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Greska pri cuvanju podesavanja' });
    } finally {
      setSaving(false);
    }
  }

  function handleChange(field: keyof CompanySettingsInput, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Ucitavanje...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Podesavanja firme</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Podaci o firmi</h2>
            <p className="text-sm text-gray-500">
              Ovi podaci ce se prikazivati na fakturama
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {message && (
              <div
                className={`p-4 rounded-md ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                {message.text}
              </div>
            )}

            <Input
              id="owner_name"
              label="Naziv vlasnika/preduzetnika *"
              value={formData.owner_name}
              onChange={(e) => handleChange('owner_name', e.target.value)}
              placeholder="npr. Marija Dedjanski PR"
            />

            <Input
              id="company_name"
              label="Naziv firme/delatnosti *"
              value={formData.company_name}
              onChange={(e) => handleChange('company_name', e.target.value)}
              placeholder="npr. Proizvodnja vina Vinarija Kula Vetrova"
            />

            <Input
              id="address"
              label="Adresa"
              value={formData.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="npr. Balojska bb, Malo Srediste 26334"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="pib"
                label="PIB *"
                value={formData.pib}
                onChange={(e) => handleChange('pib', e.target.value)}
                placeholder="9 cifara"
                maxLength={9}
              />

              <Input
                id="mb"
                label="Maticni broj *"
                value={formData.mb}
                onChange={(e) => handleChange('mb', e.target.value)}
                placeholder="8 cifara"
                maxLength={8}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="bank_account"
                label="Tekuci racun"
                value={formData.bank_account || ''}
                onChange={(e) => handleChange('bank_account', e.target.value)}
                placeholder="npr. 325-9500500382945-35"
              />

              <Input
                id="bank_name"
                label="Naziv banke"
                value={formData.bank_name || ''}
                onChange={(e) => handleChange('bank_name', e.target.value)}
                placeholder="npr. OTP banka"
              />
            </div>

            <Input
              id="activity_code"
              label="Sifra delatnosti"
              value={formData.activity_code || ''}
              onChange={(e) => handleChange('activity_code', e.target.value)}
              placeholder="npr. 1102"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="phone"
                label="Telefon"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="npr. 065/ 814 78 00"
              />

              <Input
                id="email"
                label="Email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@primer.com"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? 'Cuvanje...' : 'Sacuvaj podesavanja'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
