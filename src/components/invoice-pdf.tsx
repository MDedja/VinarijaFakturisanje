import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import { Invoice, InvoiceItem, CompanySettings, Client } from '@/lib/types';
import { formatDate, formatInvoiceNumber, formatCurrency, calculateInvoice } from '@/lib/utils';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 30,
    backgroundColor: '#ffffff',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#333',
  },
  companyName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  companySubname: {
    fontSize: 12,
    marginBottom: 4,
  },
  companyAddress: {
    fontSize: 10,
    marginBottom: 8,
  },
  companyDetails: {
    fontSize: 9,
    color: '#444',
  },
  mainSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  leftColumn: {
    width: '45%',
  },
  rightColumn: {
    width: '45%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  invoiceTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 15,
  },
  phone: {
    fontSize: 10,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    width: 100,
    color: '#666',
  },
  detailValue: {
    flex: 1,
    fontFamily: 'Helvetica-Bold',
  },
  clientName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  clientDetail: {
    fontSize: 10,
    marginBottom: 2,
  },
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingVertical: 6,
    fontFamily: 'Helvetica-Bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 6,
  },
  colNum: { width: '5%', textAlign: 'center' },
  colDesc: { width: '25%', paddingLeft: 4 },
  colUnit: { width: '8%', textAlign: 'center' },
  colQty: { width: '8%', textAlign: 'right' },
  colPrice: { width: '12%', textAlign: 'right' },
  colDiscount: { width: '8%', textAlign: 'right' },
  colBase: { width: '12%', textAlign: 'right' },
  colVat: { width: '8%', textAlign: 'right' },
  colTotal: { width: '14%', textAlign: 'right', paddingRight: 4 },
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  summaryBox: {
    width: 250,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 2,
    borderTopColor: '#333',
    marginTop: 4,
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
  },
  footer: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  footerNote: {
    fontSize: 9,
    color: '#666',
    marginBottom: 4,
  },
  signatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    paddingTop: 20,
  },
  signatureBox: {
    width: '40%',
    textAlign: 'center',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    marginTop: 40,
    paddingTop: 5,
    fontSize: 10,
  },
});

interface InvoicePDFProps {
  invoice: Invoice & { items: InvoiceItem[]; client: Client };
  company: CompanySettings;
}

export function InvoicePDF({ invoice, company }: InvoicePDFProps) {
  const calculation = calculateInvoice(invoice.items);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header - Company Info */}
        <View style={styles.header}>
          <Text style={styles.companyName}>{company.owner_name}</Text>
          <Text style={styles.companySubname}>{company.company_name}</Text>
          <Text style={styles.companyAddress}>{company.address}</Text>
          <Text style={styles.companyDetails}>
            PIB: {company.pib} | Tekuci racun: {company.bank_account} ({company.bank_name}) | MB: {company.mb} | Sifra delatnosti: {company.activity_code}
          </Text>
        </View>

        {/* Main Section - Invoice Details and Client */}
        <View style={styles.mainSection}>
          <View style={styles.leftColumn}>
            <Text style={styles.phone}>Mob: {company.phone}</Text>
            <Text style={styles.invoiceTitle}>
              RACUN BR: {formatInvoiceNumber(invoice.invoice_number, invoice.invoice_year)}
            </Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Datum izdavanja:</Text>
              <Text style={styles.detailValue}>{formatDate(invoice.issue_date)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mesto izdavanja:</Text>
              <Text style={styles.detailValue}>{invoice.issue_place}</Text>
            </View>
            {invoice.traffic_date && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Datum prometa:</Text>
                <Text style={styles.detailValue}>{formatDate(invoice.traffic_date)}</Text>
              </View>
            )}
            {invoice.traffic_place && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Mesto prometa:</Text>
                <Text style={styles.detailValue}>{invoice.traffic_place}</Text>
              </View>
            )}
            {invoice.due_date && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Datum valute:</Text>
                <Text style={styles.detailValue}>{formatDate(invoice.due_date)}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Nacin placanja:</Text>
              <Text style={styles.detailValue}>{invoice.payment_method}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Poziv na broj:</Text>
              <Text style={styles.detailValue}>
                {formatInvoiceNumber(invoice.invoice_number, invoice.invoice_year)}
              </Text>
            </View>
          </View>

          <View style={styles.rightColumn}>
            <Text style={styles.clientName}>{invoice.client.name}</Text>
            <Text style={styles.clientDetail}>{invoice.client.address}</Text>
            <Text style={styles.clientDetail}>{invoice.client.city}</Text>
            <Text style={styles.clientDetail}>
              PIB: {invoice.client.pib} MB: {invoice.client.mb}
            </Text>
            {invoice.client.delivery_location && (
              <Text style={styles.clientDetail}>
                Mesto isp: {invoice.client.delivery_location}
              </Text>
            )}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colNum}>R.br</Text>
            <Text style={styles.colDesc}>OPIS</Text>
            <Text style={styles.colUnit}>Jed.</Text>
            <Text style={styles.colQty}>Kol.</Text>
            <Text style={styles.colPrice}>Cena</Text>
            <Text style={styles.colDiscount}>Rabat</Text>
            <Text style={styles.colBase}>Osnovica</Text>
            <Text style={styles.colVat}>PDV</Text>
            <Text style={styles.colTotal}>Ukupno</Text>
          </View>

          {invoice.items.map((item, index) => {
            const calc = calculation.itemCalculations[index];
            return (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.colNum}>{index + 1}</Text>
                <Text style={styles.colDesc}>{item.product_name}</Text>
                <Text style={styles.colUnit}>{item.unit}</Text>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={styles.colPrice}>{formatCurrency(item.unit_price)}</Text>
                <Text style={styles.colDiscount}>{item.discount_percent}%</Text>
                <Text style={styles.colBase}>{formatCurrency(calc.netAmount)}</Text>
                <Text style={styles.colVat}>{item.vat_rate}%</Text>
                <Text style={styles.colTotal}>{formatCurrency(calc.total)}</Text>
              </View>
            );
          })}
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text>Poreska osnovica:</Text>
              <Text>{formatCurrency(calculation.subtotal)} RSD</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>PDV (20%):</Text>
              <Text>{formatCurrency(calculation.vatAmount)} RSD</Text>
            </View>
            <View style={styles.summaryTotal}>
              <Text>Ukupno za uplatu:</Text>
              <Text>{formatCurrency(calculation.total)} RSD</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerNote}>
            PDV obracunat na osnovu clana 5 zakona o PDV-u.
          </Text>
          {invoice.due_date && (
            <Text style={styles.footerNote}>
              Rok placanja: {formatDate(invoice.due_date)}
            </Text>
          )}
          <Text style={styles.footerNote}>
            Racun je uradjen na racunaru i punovazan bez pecata i potpisa.
          </Text>
        </View>

        {/* Signatures */}
        <View style={styles.signatures}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>Fakturisao</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>Robu primio</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
