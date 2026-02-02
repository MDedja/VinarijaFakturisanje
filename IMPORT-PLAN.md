# Plan za Import Istorijskih Faktura

## Pregled

Potrebno je uneti ~300 istorijskih faktura iz PDF formata u aplikaciju. PDF-ovi su generisani iz Excel-a (tekst se moze izvuci).

## Izabrano Resenje: Claude API

Skripta koja automatski:
1. Procita sve PDF-ove iz foldera
2. Izvuce tekst iz svakog PDF-a
3. Posalje tekst Claude API-ju da izvuce strukturirane podatke
4. Unese podatke u Supabase bazu

### Procenjena cena
- ~300 faktura
- Claude Haiku model (najjeftiniji, dovoljan za ekstrakciju)
- **Ukupno: ~$0.50 - $1.00**

## Potrebno Pre Pokretanja

### 1. Claude API Key
1. Idi na [console.anthropic.com](https://console.anthropic.com)
2. Registruj se / uloguj se
3. Idi na **API Keys** > **Create Key**
4. Dodaj credits ($5 minimum za pocetak)
5. Kopiraj API key (pocinje sa `sk-ant-...`)

### 2. Folder sa PDF Fakturama
- Pripremi folder sa svim PDF fakturama
- Zapamti putanju (npr. `C:\Fakture\2024\` ili gde god su)

### 3. Primer Fakture
- Imaj spremnu putanju do jedne fakture da vidimo format
- Na osnovu toga prilagodjavamo ekstrakciju

## Struktura Podataka za Import

Svaka faktura treba da ima:

```
- invoice_number (broj fakture)
- invoice_year (godina)
- client_name, client_pib, client_mb, client_address, client_city
- issue_date (datum izdavanja)
- issue_place (mesto izdavanja)
- traffic_date (datum prometa)
- traffic_place (mesto prometa)
- due_date (rok placanja)
- payment_method (nacin placanja)
- items[] (stavke):
  - product_name
  - quantity
  - unit
  - unit_price
  - discount_percent
  - vat_rate
```

## Koraci za Implementaciju

1. [ ] Dobiti Claude API key
2. [ ] Pripremiti folder sa PDF-ovima
3. [ ] Pokazati primer jedne fakture (putanja do PDF-a)
4. [ ] Napraviti import skriptu
5. [ ] Testirati na 2-3 fakture
6. [ ] Pokrenuti za sve fakture

## Alternative (ako ne zelimo API troskove)

### CSV Import
- Napravimo Excel template
- Rucno popunis podatke
- Import iz CSV-a u bazu

### Rucni unos kroz Claude Chat
- Kopiras tekst iz PDF-a u chat
- Claude izvuce podatke
- Rucno uneses u aplikaciju

---

## Sledeci Korak

Kada budes na drugom racunaru, javi mi:
1. Putanju do foldera sa PDF fakturama
2. Putanju do jednog primera fakture

I nastavicemo sa implementacijom!
