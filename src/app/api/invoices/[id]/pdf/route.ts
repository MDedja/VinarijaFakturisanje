import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { InvoicePDF } from '@/components/invoice-pdf';
import { InvoiceItem } from '@/lib/types';
import { formatInvoiceNumber } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // Get invoice with client and items
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, client:clients(*), items:invoice_items(*)')
      .eq('id', id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Faktura nije pronadjena' },
        { status: 404 }
      );
    }

    // Sort items by sort_order
    invoice.items = (invoice.items || []).sort(
      (a: InvoiceItem, b: InvoiceItem) => a.sort_order - b.sort_order
    );

    // Get company settings
    const { data: company, error: companyError } = await supabase
      .from('company_settings')
      .select('*')
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Podesavanja firme nisu pronadjena' },
        { status: 404 }
      );
    }

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      React.createElement(InvoicePDF, { invoice, company })
    );

    // Create filename
    const filename = `faktura-${formatInvoiceNumber(invoice.invoice_number, invoice.invoice_year).replace('/', '-')}.pdf`;

    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(pdfBuffer);

    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Greska pri generisanju PDF-a' },
      { status: 500 }
    );
  }
}
