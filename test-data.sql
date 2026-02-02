-- Test Data for Vinarija Fakturisanje
-- Run this in Supabase SQL Editor after running supabase-schema.sql

-- ============================================
-- INSERT TEST CLIENTS
-- ============================================

INSERT INTO clients (name, pib, mb, address, city, delivery_location, email, phone) VALUES
  ('Restoran Kod Milana', '123456789', '12345678', 'Knez Mihailova 15', '11000 Beograd', 'Magacin', 'milan@restoran.rs', '011/123-4567'),
  ('Vinoteka Beograd', '234567891', '23456789', 'Terazije 25', '11000 Beograd', NULL, 'info@vinoteka.rs', '011/234-5678'),
  ('Hotel Grand', '345678912', '34567890', 'Bulevar Kralja Aleksandra 100', '11000 Beograd', 'Recepcija', 'nabavka@hotelgrand.rs', '011/345-6789'),
  ('Kafana Stara Vodenica', '456789123', '45678901', 'Skadarska 20', '11000 Beograd', NULL, 'kafana@vodenica.rs', '011/456-7890'),
  ('Market Domaci Ukusi', '567891234', '56789012', 'Cara Dusana 50', '21000 Novi Sad', 'Skladiste', 'market@domaciukusi.rs', '021/567-8901'),
  ('Restoran Dva Jelena', '678912345', '67890123', 'Skadarska 32', '11000 Beograd', NULL, 'info@dvajelena.rs', '011/678-9012'),
  ('Wine Bar Sommelier', '789123456', '78901234', 'Strahinjica Bana 5', '11000 Beograd', NULL, 'sommelier@winebar.rs', '011/789-0123'),
  ('Supermarket Maxi', '891234567', '89012345', 'Autoput 15', '11000 Beograd', 'Rampa 3', 'nabavka@maxi.rs', '011/890-1234'),
  ('Restoran Tri Sesira', '912345678', '90123456', 'Skadarska 29', '11000 Beograd', NULL, 'info@trisesira.rs', '011/901-2345'),
  ('Caffe Central', '112233445', '11223344', 'Trg Republike 5', '11000 Beograd', NULL, 'central@caffe.rs', '011/112-2334');

-- ============================================
-- INSERT TEST PRODUCTS
-- ============================================

INSERT INTO products (name, unit, default_price, vat_rate) VALUES
  ('Kosava Crveno 0.75L', '0.75', 999.00, 20),
  ('Kosava Belo 0.75L', '0.75', 999.00, 20),
  ('Roze Vino 0.75L', '0.75', 899.00, 20),
  ('Domace Crveno 1L', '1', 400.00, 20),
  ('Domace Belo 1L', '1', 400.00, 20),
  ('Berba Kasna 0.75L', '0.75', 1499.00, 20),
  ('Cabernet Sauvignon 0.75L', '0.75', 1299.00, 20),
  ('Merlot 0.75L', '0.75', 1199.00, 20);

-- ============================================
-- CREATE INVOICES WITH ITEMS
-- Using DO block to handle the dynamic IDs
-- ============================================

DO $$
DECLARE
  client_ids UUID[];
  product_ids UUID[];
  inv_id UUID;
  inv_num INTEGER := 1;
BEGIN
  -- Get client IDs
  SELECT ARRAY_AGG(id ORDER BY name) INTO client_ids FROM clients WHERE pib IN (
    '123456789', '234567891', '345678912', '456789123', '567891234',
    '678912345', '789123456', '891234567', '912345678', '112233445'
  );

  -- Get product IDs
  SELECT ARRAY_AGG(id ORDER BY name) INTO product_ids FROM products WHERE name IN (
    'Kosava Crveno 0.75L', 'Kosava Belo 0.75L', 'Roze Vino 0.75L',
    'Domace Crveno 1L', 'Domace Belo 1L', 'Berba Kasna 0.75L',
    'Cabernet Sauvignon 0.75L', 'Merlot 0.75L'
  );

  -- JANUARY 2024
  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[1], '2024-01-05', 'Malo Srediste', '2024-01-05', 'Beograd', '2024-01-20', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Kosava Crveno 0.75L', 12, '0.75', 999.00, 0, 20, 0),
    (inv_id, 'Kosava Belo 0.75L', 6, '0.75', 999.00, 0, 20, 1);
  inv_num := inv_num + 1;

  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[2], '2024-01-12', 'Malo Srediste', '2024-01-12', 'Beograd', '2024-01-27', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Berba Kasna 0.75L', 24, '0.75', 1499.00, 5, 20, 0);
  inv_num := inv_num + 1;

  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[3], '2024-01-20', 'Malo Srediste', '2024-01-20', 'Beograd', '2024-02-04', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Kosava Crveno 0.75L', 48, '0.75', 999.00, 10, 20, 0),
    (inv_id, 'Roze Vino 0.75L', 24, '0.75', 899.00, 10, 20, 1);
  inv_num := inv_num + 1;

  -- FEBRUARY 2024
  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[4], '2024-02-02', 'Malo Srediste', '2024-02-02', 'Beograd', '2024-02-17', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Domace Crveno 1L', 20, '1', 400.00, 0, 20, 0),
    (inv_id, 'Domace Belo 1L', 15, '1', 400.00, 0, 20, 1);
  inv_num := inv_num + 1;

  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[5], '2024-02-14', 'Malo Srediste', '2024-02-14', 'Novi Sad', '2024-03-01', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Cabernet Sauvignon 0.75L', 36, '0.75', 1299.00, 5, 20, 0);
  inv_num := inv_num + 1;

  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[1], '2024-02-28', 'Malo Srediste', '2024-02-28', 'Beograd', '2024-03-14', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Kosava Crveno 0.75L', 18, '0.75', 999.00, 0, 20, 0);
  inv_num := inv_num + 1;

  -- MARCH 2024
  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[6], '2024-03-05', 'Malo Srediste', '2024-03-05', 'Beograd', '2024-03-20', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Kosava Crveno 0.75L', 24, '0.75', 999.00, 0, 20, 0),
    (inv_id, 'Kosava Belo 0.75L', 24, '0.75', 999.00, 0, 20, 1);
  inv_num := inv_num + 1;

  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[7], '2024-03-15', 'Malo Srediste', '2024-03-15', 'Beograd', '2024-03-30', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Berba Kasna 0.75L', 12, '0.75', 1499.00, 0, 20, 0),
    (inv_id, 'Merlot 0.75L', 18, '0.75', 1199.00, 0, 20, 1);
  inv_num := inv_num + 1;

  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[8], '2024-03-22', 'Malo Srediste', '2024-03-22', 'Beograd', '2024-04-06', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Domace Crveno 1L', 100, '1', 400.00, 15, 20, 0),
    (inv_id, 'Domace Belo 1L', 100, '1', 400.00, 15, 20, 1);
  inv_num := inv_num + 1;

  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[2], '2024-03-28', 'Malo Srediste', '2024-03-28', 'Beograd', '2024-04-12', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Cabernet Sauvignon 0.75L', 12, '0.75', 1299.00, 0, 20, 0);
  inv_num := inv_num + 1;

  -- APRIL 2024
  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[9], '2024-04-05', 'Malo Srediste', '2024-04-05', 'Beograd', '2024-04-20', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Kosava Crveno 0.75L', 36, '0.75', 999.00, 5, 20, 0),
    (inv_id, 'Roze Vino 0.75L', 18, '0.75', 899.00, 5, 20, 1);
  inv_num := inv_num + 1;

  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[10], '2024-04-12', 'Malo Srediste', '2024-04-12', 'Beograd', '2024-04-27', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Kosava Belo 0.75L', 12, '0.75', 999.00, 0, 20, 0);
  inv_num := inv_num + 1;

  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[3], '2024-04-20', 'Malo Srediste', '2024-04-20', 'Beograd', '2024-05-05', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Berba Kasna 0.75L', 48, '0.75', 1499.00, 10, 20, 0);
  inv_num := inv_num + 1;

  -- MAY 2024
  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[1], '2024-05-03', 'Malo Srediste', '2024-05-03', 'Beograd', '2024-05-18', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Kosava Crveno 0.75L', 24, '0.75', 999.00, 0, 20, 0),
    (inv_id, 'Kosava Belo 0.75L', 12, '0.75', 999.00, 0, 20, 1);
  inv_num := inv_num + 1;

  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[4], '2024-05-10', 'Malo Srediste', '2024-05-10', 'Beograd', '2024-05-25', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Domace Crveno 1L', 30, '1', 400.00, 0, 20, 0);
  inv_num := inv_num + 1;

  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[5], '2024-05-18', 'Malo Srediste', '2024-05-18', 'Novi Sad', '2024-06-02', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Cabernet Sauvignon 0.75L', 48, '0.75', 1299.00, 10, 20, 0),
    (inv_id, 'Merlot 0.75L', 24, '0.75', 1199.00, 10, 20, 1);
  inv_num := inv_num + 1;

  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[6], '2024-05-25', 'Malo Srediste', '2024-05-25', 'Beograd', '2024-06-09', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Roze Vino 0.75L', 36, '0.75', 899.00, 0, 20, 0);
  inv_num := inv_num + 1;

  -- JUNE 2024
  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[7], '2024-06-05', 'Malo Srediste', '2024-06-05', 'Beograd', '2024-06-20', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Berba Kasna 0.75L', 18, '0.75', 1499.00, 0, 20, 0);
  inv_num := inv_num + 1;

  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[8], '2024-06-12', 'Malo Srediste', '2024-06-12', 'Beograd', '2024-06-27', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Domace Crveno 1L', 150, '1', 400.00, 20, 20, 0),
    (inv_id, 'Domace Belo 1L', 150, '1', 400.00, 20, 20, 1);
  inv_num := inv_num + 1;

  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[2], '2024-06-20', 'Malo Srediste', '2024-06-20', 'Beograd', '2024-07-05', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Kosava Crveno 0.75L', 36, '0.75', 999.00, 5, 20, 0);
  inv_num := inv_num + 1;

  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[9], '2024-06-28', 'Malo Srediste', '2024-06-28', 'Beograd', '2024-07-13', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Kosava Belo 0.75L', 24, '0.75', 999.00, 0, 20, 0),
    (inv_id, 'Roze Vino 0.75L', 24, '0.75', 899.00, 0, 20, 1);
  inv_num := inv_num + 1;

  -- JULY 2024
  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[3], '2024-07-05', 'Malo Srediste', '2024-07-05', 'Beograd', '2024-07-20', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Cabernet Sauvignon 0.75L', 60, '0.75', 1299.00, 10, 20, 0),
    (inv_id, 'Merlot 0.75L', 36, '0.75', 1199.00, 10, 20, 1);
  inv_num := inv_num + 1;

  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[1], '2024-07-15', 'Malo Srediste', '2024-07-15', 'Beograd', '2024-07-30', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Kosava Crveno 0.75L', 18, '0.75', 999.00, 0, 20, 0);
  inv_num := inv_num + 1;

  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[10], '2024-07-22', 'Malo Srediste', '2024-07-22', 'Beograd', '2024-08-06', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Roze Vino 0.75L', 24, '0.75', 899.00, 0, 20, 0);
  inv_num := inv_num + 1;

  -- AUGUST 2024
  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[4], '2024-08-02', 'Malo Srediste', '2024-08-02', 'Beograd', '2024-08-17', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Domace Crveno 1L', 40, '1', 400.00, 0, 20, 0);
  inv_num := inv_num + 1;

  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[6], '2024-08-10', 'Malo Srediste', '2024-08-10', 'Beograd', '2024-08-25', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Kosava Crveno 0.75L', 48, '0.75', 999.00, 5, 20, 0),
    (inv_id, 'Kosava Belo 0.75L', 24, '0.75', 999.00, 5, 20, 1);
  inv_num := inv_num + 1;

  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[5], '2024-08-20', 'Malo Srediste', '2024-08-20', 'Novi Sad', '2024-09-04', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Cabernet Sauvignon 0.75L', 72, '0.75', 1299.00, 15, 20, 0);
  inv_num := inv_num + 1;

  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[7], '2024-08-28', 'Malo Srediste', '2024-08-28', 'Beograd', '2024-09-12', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Berba Kasna 0.75L', 24, '0.75', 1499.00, 0, 20, 0);
  inv_num := inv_num + 1;

  -- SEPTEMBER 2024
  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[8], '2024-09-05', 'Malo Srediste', '2024-09-05', 'Beograd', '2024-09-20', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Domace Crveno 1L', 200, '1', 400.00, 20, 20, 0),
    (inv_id, 'Domace Belo 1L', 200, '1', 400.00, 20, 20, 1);
  inv_num := inv_num + 1;

  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[2], '2024-09-12', 'Malo Srediste', '2024-09-12', 'Beograd', '2024-09-27', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Kosava Crveno 0.75L', 24, '0.75', 999.00, 0, 20, 0);
  inv_num := inv_num + 1;

  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[9], '2024-09-20', 'Malo Srediste', '2024-09-20', 'Beograd', '2024-10-05', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Roze Vino 0.75L', 36, '0.75', 899.00, 0, 20, 0);
  inv_num := inv_num + 1;

  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[3], '2024-09-28', 'Malo Srediste', '2024-09-28', 'Beograd', '2024-10-13', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Berba Kasna 0.75L', 36, '0.75', 1499.00, 5, 20, 0),
    (inv_id, 'Merlot 0.75L', 24, '0.75', 1199.00, 5, 20, 1);
  inv_num := inv_num + 1;

  -- OCTOBER 2024
  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[1], '2024-10-03', 'Malo Srediste', '2024-10-03', 'Beograd', '2024-10-18', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Kosava Crveno 0.75L', 30, '0.75', 999.00, 0, 20, 0),
    (inv_id, 'Kosava Belo 0.75L', 18, '0.75', 999.00, 0, 20, 1);
  inv_num := inv_num + 1;

  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[4], '2024-10-10', 'Malo Srediste', '2024-10-10', 'Beograd', '2024-10-25', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Domace Crveno 1L', 50, '1', 400.00, 0, 20, 0);
  inv_num := inv_num + 1;

  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[10], '2024-10-18', 'Malo Srediste', '2024-10-18', 'Beograd', '2024-11-02', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Roze Vino 0.75L', 18, '0.75', 899.00, 0, 20, 0);
  inv_num := inv_num + 1;

  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[6], '2024-10-25', 'Malo Srediste', '2024-10-25', 'Beograd', '2024-11-09', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Cabernet Sauvignon 0.75L', 36, '0.75', 1299.00, 0, 20, 0);
  inv_num := inv_num + 1;

  -- NOVEMBER 2024
  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[7], '2024-11-05', 'Malo Srediste', '2024-11-05', 'Beograd', '2024-11-20', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Berba Kasna 0.75L', 30, '0.75', 1499.00, 0, 20, 0);
  inv_num := inv_num + 1;

  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[5], '2024-11-12', 'Malo Srediste', '2024-11-12', 'Novi Sad', '2024-11-27', 'virmanom', 'paid')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Cabernet Sauvignon 0.75L', 60, '0.75', 1299.00, 10, 20, 0),
    (inv_id, 'Merlot 0.75L', 48, '0.75', 1199.00, 10, 20, 1);
  inv_num := inv_num + 1;

  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[2], '2024-11-20', 'Malo Srediste', '2024-11-20', 'Beograd', '2024-12-05', 'virmanom', 'sent')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Kosava Crveno 0.75L', 48, '0.75', 999.00, 5, 20, 0);
  inv_num := inv_num + 1;

  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[3], '2024-11-28', 'Malo Srediste', '2024-11-28', 'Beograd', '2024-12-13', 'virmanom', 'sent')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Berba Kasna 0.75L', 72, '0.75', 1499.00, 10, 20, 0);
  inv_num := inv_num + 1;

  -- DECEMBER 2024
  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[1], '2024-12-02', 'Malo Srediste', '2024-12-02', 'Beograd', '2024-12-17', 'virmanom', 'sent')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Kosava Crveno 0.75L', 36, '0.75', 999.00, 0, 20, 0),
    (inv_id, 'Kosava Belo 0.75L', 24, '0.75', 999.00, 0, 20, 1),
    (inv_id, 'Roze Vino 0.75L', 18, '0.75', 899.00, 0, 20, 2);
  inv_num := inv_num + 1;

  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[8], '2024-12-08', 'Malo Srediste', '2024-12-08', 'Beograd', '2024-12-23', 'virmanom', 'sent')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Domace Crveno 1L', 300, '1', 400.00, 25, 20, 0),
    (inv_id, 'Domace Belo 1L', 200, '1', 400.00, 25, 20, 1);
  inv_num := inv_num + 1;

  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[9], '2024-12-15', 'Malo Srediste', '2024-12-15', 'Beograd', '2024-12-30', 'virmanom', 'draft')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Berba Kasna 0.75L', 48, '0.75', 1499.00, 5, 20, 0),
    (inv_id, 'Cabernet Sauvignon 0.75L', 24, '0.75', 1299.00, 5, 20, 1);
  inv_num := inv_num + 1;

  INSERT INTO invoices (invoice_number, invoice_year, client_id, issue_date, issue_place, traffic_date, traffic_place, due_date, payment_method, status)
  VALUES (inv_num, 2024, client_ids[4], '2024-12-20', 'Malo Srediste', '2024-12-20', 'Beograd', '2025-01-04', 'virmanom', 'draft')
  RETURNING id INTO inv_id;
  INSERT INTO invoice_items (invoice_id, product_name, quantity, unit, unit_price, discount_percent, vat_rate, sort_order) VALUES
    (inv_id, 'Domace Crveno 1L', 60, '1', 400.00, 0, 20, 0);

  RAISE NOTICE 'Successfully created % invoices', inv_num;
END $$;

-- ============================================
-- Summary:
-- - 10 test clients
-- - 8 test products
-- - 44 invoices across all 12 months of 2024
-- - Mix of paid, sent, and draft statuses
-- - Various discount levels (0%, 5%, 10%, 15%, 20%, 25%)
-- ============================================
