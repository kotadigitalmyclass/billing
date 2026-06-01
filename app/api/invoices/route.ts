import { connectDB } from '@/lib/mongodb';
import InvoiceModel from '@/models/Invoice';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const invoices = await InvoiceModel.find().sort({ createdAt: -1 });
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    const invoice = new InvoiceModel({
      ...body,
      invoiceNumber: body.invoiceNumber || `INV-${Date.now()}`,
    });

    const savedInvoice = await invoice.save();
    return NextResponse.json(savedInvoice, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
