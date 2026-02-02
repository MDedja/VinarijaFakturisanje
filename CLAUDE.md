# Vinarija Kula Vetrova - Sistem za Fakturisanje

## Pregled Projekta

Web aplikacija za kreiranje i upravljanje fakturama za Vinariju Kula Vetrova. Aplikacija omogucava kompletno upravljanje klijentima, proizvodima (vinima), fakturama sa automatskim numerisanjem, PDF export i detaljne izvestaje.

## Tehnoloski Stack

| Komponenta | Tehnologija | Verzija |
|------------|-------------|---------|
| Framework | Next.js (App Router) | 14.x |
| Jezik | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| Baza podataka | Supabase (PostgreSQL) | - |
| Autentifikacija | Supabase Auth | - |
| PDF generisanje | @react-pdf/renderer | 4.x |

## Struktura Projekta

```
/src
  /app                          # Next.js App Router stranice
    /page.tsx                   # Dashboard - statistike i poslednje fakture
    /login/page.tsx             # Login/Registracija stranica
    /invoices
      /page.tsx                 # Lista svih faktura
      /new/page.tsx             # Kreiranje nove fakture
      /[id]/page.tsx            # Pregled fakture
      /[id]/edit/page.tsx       # Izmena fakture
    /clients
      /page.tsx                 # Lista klijenata
      /new/page.tsx             # Novi klijent
      /[id]/page.tsx            # Izmena klijenta
    /products/page.tsx          # Lista i upravljanje proizvodima
    /reports/page.tsx           # Izvestaji sa filterima
    /settings/page.tsx          # Podesavanja firme
    /api/invoices/[id]/pdf      # API ruta za PDF generisanje

  /components
    /ui                         # Reusable UI komponente
      /button.tsx               # Button komponenta
      /input.tsx                # Input sa labelom i error prikazom
      /select.tsx               # Select dropdown
      /card.tsx                 # Card, CardHeader, CardContent, CardFooter
      /table.tsx                # Table komponente
      /badge.tsx                # Status badge
    /auth-provider.tsx          # Auth context provider
    /navigation.tsx             # Glavna navigacija
    /client-form.tsx            # Forma za klijenta
    /client-select.tsx          # Autocomplete za izbor klijenta
    /invoice-form.tsx           # Kompleksna forma za fakturu
    /invoice-pdf.tsx            # PDF template za fakturu

  /lib
    /supabase.ts                # Browser Supabase klijent
    /supabase-server.ts         # Server-side Supabase klijent
    /types.ts                   # TypeScript tipovi za sve entitete
    /utils.ts                   # Helper funkcije (formatiranje, kalkulacije)

  /middleware.ts                # Auth middleware za zastitu ruta
```

## Baza Podataka (Supabase)

### Tabele

#### `clients` - Klijenti
```sql
- id: UUID (PK)
- name: TEXT (naziv firme)
- pib: TEXT (9 cifara)
- mb: TEXT (maticni broj, 8 cifara)
- address: TEXT
- city: TEXT
- delivery_location: TEXT (mesto isporuke)
- email: TEXT
- phone: TEXT
- created_at: TIMESTAMP
- created_by: UUID (FK -> auth.users)
```

#### `products` - Proizvodi (vina)
```sql
- id: UUID (PK)
- name: TEXT (naziv vina)
- unit: TEXT (zapremina: '0.75', '1', itd.)
- default_price: DECIMAL(10,2)
- vat_rate: INTEGER (PDV stopa, default 20)
- created_at: TIMESTAMP
```

#### `invoices` - Fakture
```sql
- id: UUID (PK)
- invoice_number: INTEGER (redni broj)
- invoice_year: INTEGER (godina)
- client_id: UUID (FK -> clients)
- issue_date: DATE (datum izdavanja)
- issue_place: TEXT (mesto izdavanja)
- traffic_date: DATE (datum prometa)
- traffic_place: TEXT (mesto prometa)
- due_date: DATE (rok placanja)
- payment_method: TEXT ('virmanom', 'gotovinom', 'karticom')
- status: TEXT ('draft', 'sent', 'paid')
- created_at: TIMESTAMP
- created_by: UUID (FK -> auth.users)
- UNIQUE(invoice_number, invoice_year)
```

#### `invoice_items` - Stavke fakture
```sql
- id: UUID (PK)
- invoice_id: UUID (FK -> invoices, CASCADE DELETE)
- product_id: UUID (FK -> products, nullable)
- product_name: TEXT (snapshot naziva)
- quantity: DECIMAL(10,3)
- unit: TEXT
- unit_price: DECIMAL(10,2)
- discount_percent: DECIMAL(5,2) (rabat)
- vat_rate: INTEGER (PDV stopa)
- sort_order: INTEGER
```

#### `company_settings` - Podesavanja firme
```sql
- id: UUID (PK)
- owner_name: TEXT (Marija Dedjanski PR)
- company_name: TEXT (Proizvodnja vina Vinarija Kula Vetrova)
- address: TEXT
- pib: TEXT
- mb: TEXT
- bank_account: TEXT
- bank_name: TEXT
- activity_code: TEXT (sifra delatnosti)
- phone: TEXT
- email: TEXT
```

### Funkcije

#### `get_next_invoice_number(p_year INTEGER)`
Vraca sledeci redni broj fakture za datu godinu.

### RLS (Row Level Security)
Sve tabele imaju RLS uklјucen. Autentifikovani korisnici mogu citati/pisati sve podatke.

## Kljucne Funkcionalnosti

### 1. Autentifikacija
- Email/password login preko Supabase Auth
- Middleware stiti sve rute osim `/login`
- AuthProvider cuva stanje ulogovanog korisnika

### 2. Fakture
- Automatski redni broj (format: X/YYYY)
- Dinamicko dodavanje stavki
- Automatski izracun: osnovica, rabat, PDV, ukupno
- Tri statusa: draft, sent, paid
- PDF export

### 3. Kalkulacije (src/lib/utils.ts)
```typescript
// Kalkulacija jedne stavke
calculateItem(item) -> {
  baseAmount,      // kolicina * cena
  discountAmount,  // iznos rabata
  netAmount,       // osnovica nakon rabata
  vatAmount,       // iznos PDV-a
  total            // ukupno sa PDV-om
}

// Kalkulacija cele fakture
calculateInvoice(items) -> {
  subtotal,        // ukupna osnovica
  vatAmount,       // ukupan PDV
  total,           // ukupno za uplatu
  itemCalculations // kalkulacije po stavkama
}
```

### 4. PDF Generisanje
- Server-side renderovanje preko API rute
- Koristi @react-pdf/renderer
- Font: Helvetica (built-in)
- Format: A4
- Sadrzi sve podatke po srpskim propisima

### 5. Izvestaji (/reports)
- Filtriranje po periodu (od-do)
- Ukupan prihod
- Prihod po mesecima (sa vizuelnim prikazom)
- Prihod po klijentu
- Prodaja po proizvodu
- Pregled po statusu faktura
- Neplaceni iznos

## Environment Varijable

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

## Pokretanje Lokalno

```bash
# Instalacija
npm install

# Development
npm run dev

# Build
npm run build

# Production
npm start
```

## Deployment

### 1. Supabase Setup (Baza Podataka)

1. Idi na [supabase.com](https://supabase.com) i kreiraj nalog
2. Klikni "New Project" i popuni:
   - Organization: (kreiraj novu ili izaberi postojecu)
   - Project name: `vinarija-fakturisanje`
   - Database password: (zapamti ovu lozinku)
   - Region: `Central EU (Frankfurt)` - najblize Srbiji
3. Sacekaj da se projekat kreira (~2 minuta)
4. Idi na **SQL Editor** (leva strana)
5. Kopiraj sadrzaj `supabase-schema.sql` i pokreni
6. (Opciono) Kopiraj sadrzaj `test-data.sql` za test podatke
7. Idi na **Settings > API** i kopiraj:
   - `Project URL` -> NEXT_PUBLIC_SUPABASE_URL
   - `anon public` key -> NEXT_PUBLIC_SUPABASE_ANON_KEY

### 2. Vercel Deployment (Hosting)

1. Push projekat na GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/USERNAME/vinarija-fakturisanje.git
   git push -u origin main
   ```

2. Idi na [vercel.com](https://vercel.com) i uloguj se sa GitHub nalogom

3. Klikni "Add New Project"

4. Importuj repozitorijum `vinarija-fakturisanje`

5. U "Environment Variables" dodaj:
   - `NEXT_PUBLIC_SUPABASE_URL` = (tvoj Supabase URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (tvoj Supabase anon key)

6. Klikni "Deploy"

7. Sacekaj ~2 minuta, dobices URL tipa: `https://vinarija-fakturisanje.vercel.app`

### 3. Custom Domen (Opciono)

1. U Vercel dashboard-u idi na projekat > Settings > Domains
2. Dodaj svoj domen (npr. `fakture.vinarija.rs`)
3. Podesi DNS kod svog registra:
   - A record: `76.76.21.21`
   - CNAME: `cname.vercel-dns.com`

### Besplatni Limiti

| Servis | Besplatno | Dovoljno za |
|--------|-----------|-------------|
| Supabase | 500MB baza, 50k auth korisnika | Mali biznis |
| Vercel | 100GB bandwidth/mesec | ~10,000 poseta |

### Azuriranje Produkcije

```bash
# Lokalne izmene
git add .
git commit -m "Opis izmena"
git push

# Vercel automatski radi redeploy nakon push-a
```

## Vazni Fajlovi

- `supabase-schema.sql` - SQL za kreiranje tabela u Supabase
- `test-data.sql` - SQL za ubacivanje test podataka (44 fakture kroz 2024.)
- `.env.local.example` - Primer environment varijabli

## Napomene za Razvoj

### Dodavanje nove stranice
1. Kreiraj fajl u `/src/app/[naziv]/page.tsx`
2. Dodaj link u `/src/components/navigation.tsx`

### Dodavanje novog polja u tabelu
1. Azuriraj SQL u `supabase-schema.sql`
2. Pokreni ALTER TABLE u Supabase SQL Editor
3. Azuriraj tip u `/src/lib/types.ts`
4. Azuriraj forme i prikaze

### Stilizovanje
- Koristi Tailwind klase
- UI komponente su u `/src/components/ui/`
- Boje: indigo (primary), gray (neutral), green/yellow/red (status)

### Supabase Query Primeri
```typescript
// Fetch sa JOIN-om
const { data } = await supabase
  .from('invoices')
  .select('*, client:clients(*), items:invoice_items(*)')
  .eq('id', id)
  .single();

// Insert sa RETURNING
const { data, error } = await supabase
  .from('invoices')
  .insert({ ... })
  .select()
  .single();

// Count
const { count } = await supabase
  .from('invoices')
  .select('id', { count: 'exact', head: true });

// RPC (stored function)
const { data } = await supabase
  .rpc('get_next_invoice_number', { p_year: 2024 });
```

## Poznati Problemi / TODO

- [ ] PDF: Srpska slova (č, ć, š, ž) - potreban custom font
- [ ] Email slanje faktura
- [ ] Export u Excel
- [ ] Vise korisnika sa razlicitim ulogama
- [ ] Backup podataka
