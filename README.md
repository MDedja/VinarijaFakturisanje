# Vinarija Kula Vetrova - Sistem za Fakturisanje

Web aplikacija za kreiranje i upravljanje fakturama za Vinariju Kula Vetrova.

## Funkcionalnosti

- Upravljanje klijentima (PIB, MB, naziv, adresa)
- Katalog proizvoda (vina)
- Kreiranje i izmena faktura
- Automatski redni broj faktura (X/GODINA)
- PDF export faktura
- Visekorisnicki pristup sa autentifikacijom
- PDV obracun (20%)

## Tehnoloski Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Baza**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **PDF**: @react-pdf/renderer

## Instalacija

### 1. Kloniraj projekat i instaliraj zavisnosti

```bash
npm install
```

### 2. Podesi Supabase

1. Kreiraj novi projekat na [supabase.com](https://supabase.com)
2. U SQL Editor pokreni sadrzaj fajla `supabase-schema.sql`
3. Kopiraj `SUPABASE_URL` i `ANON_KEY` iz Settings > API

### 3. Konfigurisi environment varijable

Izmeni `.env.local` fajl:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tvoj-projekat.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tvoj-anon-key
```

### 4. Pokreni development server

```bash
npm run dev
```

Otvori [http://localhost:3000](http://localhost:3000)

## Struktura Projekta

```
/src
  /app
    /page.tsx              # Dashboard
    /login/page.tsx        # Login stranica
    /invoices              # Fakture (lista, nova, pregled, izmena)
    /clients               # Klijenti (lista, novi, izmena)
    /products              # Proizvodi
    /settings              # Podesavanja firme
    /api/invoices/[id]/pdf # PDF generisanje
  /components
    /ui                    # Reusable UI komponente
    /invoice-form.tsx      # Forma za fakturu
    /invoice-pdf.tsx       # PDF template
    /client-select.tsx     # Dropdown za izbor klijenta
  /lib
    /supabase.ts           # Supabase klijent
    /utils.ts              # Helper funkcije
    /types.ts              # TypeScript tipovi
```

## Koristenje

1. **Registracija**: Kreiraj nalog na `/login`
2. **Podesavanja firme**: Unesi podatke firme u Settings
3. **Dodaj klijente**: Kreiraj klijente sa PIB/MB
4. **Dodaj proizvode**: Unesi proizvode (vina) sa cenama
5. **Kreiraj fakture**: Nova faktura > izaberi klijenta > dodaj stavke
6. **Preuzmi PDF**: Pogledaj fakturu i preuzmi PDF

## Deploy na Vercel

1. Push projekat na GitHub
2. Importuj na [vercel.com](https://vercel.com)
3. Dodaj environment varijable
4. Deploy!

## Napomene

- Supabase free tier: 500MB baza, 50,000 auth korisnika
- Vercel free tier: 100GB bandwidth mesecno
- PDF ukljucuje sve potrebne podatke za fakturisanje u Srbiji
