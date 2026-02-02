import { NextRequest, NextResponse } from 'next/server';
import type { ReactElement } from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { Resend } from 'resend';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { InvoicePDF } from '@/components/invoice-pdf';
import { InvoiceItem } from '@/lib/types';
import { formatInvoiceNumber } from '@/lib/utils';

const resend = new Resend(process.env.RESEND_API_KEY!);


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // Get logged in user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      return NextResponse.json(
        { error: 'Morate biti ulogovani' },
        { status: 401 }
      );
    }

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
      InvoicePDF({ invoice, company }) as ReactElement
    );

    // Create filename and email subject
    const invoiceNumber = formatInvoiceNumber(invoice.invoice_number, invoice.invoice_year);
    const filename = `faktura-${invoiceNumber.replace('/', '-')}.pdf`;
    const clientName = invoice.client?.name || 'Nepoznat klijent';

    // Send email
    const { error: emailError } = await resend.emails.send({
      from: 'Vinarija Kula Vetrova <fakture@resend.dev>',
      to: user.email,
      subject: `Faktura ${invoiceNumber} - ${clientName}`,
      html: `
        <h2>Faktura ${invoiceNumber}</h2>
        <p>U prilogu se nalazi faktura za klijenta <strong>${clientName}</strong>.</p>
        <br>
        <p>Pozdrav,<br>Vinarija Kula Vetrova</p>
      `,
      attachments: [
        {
          filename,
          content: Buffer.from(pdfBuffer).toString('base64'),
        },
      ],
    });

    if (emailError) {
      console.error('Error sending email:', emailError);
      return NextResponse.json(
        { error: 'Greska pri slanju emaila' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Email poslat na ${user.email}`
    });

  } catch (error) {
    console.error('Error sending invoice email:', error);
    return NextResponse.json(
      { error: 'Greska pri slanju emaila' },
      { status: 500 }
    );
  }
}
