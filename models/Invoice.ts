import mongoose, { Schema, Document, Model } from "mongoose";

interface IItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  customerName: string;
  email?: string;
  address?: string;
  institution?: string;
  mobile?: string;
  amount: number;
  status: "Paid" | "Pending" | "Overdue" | "Cancelled";
  dueDate: Date;
  invoiceDate: Date;
  deliveryDate?: Date;
  depositDate?: Date;
  depositAmount: number;
  items: IItem[];
  notes?: string;
  paymentMode: "Cash" | "Online" | "Cheque";
  paidAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const itemSchema = new Schema<IItem>(
  {
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    rate: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true, trim: true },
    customerName: { type: String, required: true, trim: true },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
      default: "",
    },

    address: { type: String, default: "" },
    institution: { type: String, default: "" },
    mobile: { type: String, default: "" },

    amount: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ["Paid", "Pending", "Overdue", "Cancelled"],
      default: "Pending",
      index: true,
    },

    dueDate: { type: Date, required: true },
    invoiceDate: { type: Date, default: Date.now },

    deliveryDate: Date,
    depositDate: Date,

    depositAmount: { type: Number, default: 0 },

    items: {
      type: [itemSchema],
      default: [],
    },

    notes: { type: String, default: "" },

    paymentMode: {
      type: String,
      enum: ["Cash", "Online", "Cheque"],
      default: "Cash",
    },

    paidAt: Date,
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);


invoiceSchema.pre<IInvoice>("save", function (next) {
  if (this.items?.length) {
    this.amount = this.items.reduce((sum, item) => sum + item.amount, 0);
  }
  // next();
});


const InvoiceModel: Model<IInvoice> =
  mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", invoiceSchema);

export default InvoiceModel;