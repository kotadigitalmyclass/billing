"use client";

import React from "react";
import { Button } from "@heroui/react";
import {
  FileText, User, Package, CreditCard, StickyNote,
  Plus, Trash2, Save, X, AlertCircle,
} from "lucide-react";

interface Item {
  id: number;
  description: string;
  quantity: string;
  rate: string;
  amount: string;
}

interface ExistingInvoice {
  _id?: string;
  invoiceNumber?: string;
  customerName?: string;
  institution?: string;
  address?: string;
  mobile?: string;
  invoiceDate?: string;
  dueDate?: string;
  deliveryDate?: string;
  depositDate?: string;
  depositAmount?: number;
  status?: string;
  paymentMode?: string;
  notes?: string;
  items?: { description: string; quantity: number; rate: number; amount: number }[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceCreated: (data: any) => void;
  existingInvoice?: ExistingInvoice | null;
}

const fmtDate = (d?: string | null) => (d ? new Date(d).toISOString().split("T")[0] : "");

export default function InvoiceForm({ isOpen, onClose, onInvoiceCreated, existingInvoice }: Props) {
  const isEdit = !!existingInvoice?._id;

  const [invoiceNo, setInvoiceNo]       = React.useState(existingInvoice?.invoiceNumber ?? "");
  const [invoiceDate, setInvoiceDate]   = React.useState(fmtDate(existingInvoice?.invoiceDate));
  const [dueDate, setDueDate]           = React.useState(fmtDate(existingInvoice?.dueDate));
  const [deliveryDate, setDeliveryDate] = React.useState(fmtDate(existingInvoice?.deliveryDate));
  const [depositDate, setDepositDate]   = React.useState(fmtDate(existingInvoice?.depositDate));
  const [status, setStatus]             = React.useState(existingInvoice?.status ?? "Pending");
  const [paymentMode, setPaymentMode]   = React.useState(existingInvoice?.paymentMode ?? "Cash");
  const [customerName, setCustomerName] = React.useState(existingInvoice?.customerName ?? "");
  const [mobile, setMobile]             = React.useState(existingInvoice?.mobile ?? "");
  const [address, setAddress]           = React.useState(existingInvoice?.address ?? "");
  const [institution, setInstitution]   = React.useState(existingInvoice?.institution ?? "");
  const [depositAmount, setDepositAmount] = React.useState(existingInvoice?.depositAmount ? String(existingInvoice.depositAmount) : "");
  const [notes, setNotes]               = React.useState(existingInvoice?.notes ?? "");
  const [loading, setLoading]           = React.useState(false);
  const [errors, setErrors]             = React.useState<Record<string, string>>({});

  const [items, setItems] = React.useState<Item[]>(
    existingInvoice?.items?.length
      ? existingInvoice.items.map((it, i) => ({
          id: i + 1,
          description: it.description,
          quantity: String(it.quantity),
          rate: String(it.rate),
          amount: String(it.amount),
        }))
      : [{ id: 1, description: "", quantity: "1", rate: "", amount: "" }]
  );

  const total = items.reduce((s, it) => s + Number(it.amount || 0), 0);
  const balance = total - Number(depositAmount || 0);

  const updateItem = (id: number, field: string, value: string) => {
    setItems(prev => prev.map(it => {
      if (it.id !== id) return it;
      const updated = { ...it, [field]: value };
      if (field === "quantity" || field === "rate") {
        updated.amount = String(Math.round(Number(updated.quantity || 0) * Number(updated.rate || 0)));
      }
      return updated;
    }));
  };

  const addItem = () => {
    const id = Math.max(...items.map(i => i.id), 0) + 1;
    setItems(prev => [...prev, { id, description: "", quantity: "1", rate: "", amount: "" }]);
  };

  const removeItem = (id: number) => { if (items.length > 1) setItems(prev => prev.filter(i => i.id !== id)); };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!invoiceNo.trim()) e.invoiceNo = "Required";
    if (!customerName.trim()) e.customerName = "Required";
    if (!dueDate) e.dueDate = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onInvoiceCreated({
        invoiceNumber: invoiceNo.trim(),
        customerName: customerName.trim(),
        institution: institution.trim(),
        address: address.trim(),
        mobile: mobile.trim(),
        invoiceDate: invoiceDate ? new Date(invoiceDate).toISOString() : undefined,
        dueDate: new Date(dueDate).toISOString(),
        deliveryDate: deliveryDate ? new Date(deliveryDate).toISOString() : undefined,
        depositDate: depositDate ? new Date(depositDate).toISOString() : undefined,
        depositAmount: Number(depositAmount) || 0,
        amount: total,
        status,
        paymentMode,
        notes: notes.trim(),
        items: items.map(it => ({
          description: it.description,
          quantity: Number(it.quantity) || 0,
          rate: Number(it.rate) || 0,
          amount: Number(it.amount) || 0,
        })),
      });
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal-box modal-lg"
        style={{ display: "flex", flexDirection: "column", maxHeight: "92vh", margin: "auto" }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FileText size={18} color="#3b82f6" />
            <div>
              <h2 style={{ fontWeight: 800, fontSize: 16, margin: 0, color: "#0f172a" }}>
                {isEdit ? `Edit Invoice` : "Create New Invoice"}
              </h2>
              {isEdit && <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{existingInvoice?.invoiceNumber}</p>}
            </div>
          </div>
          <Button variant="ghost" isIconOnly size="sm" onPress={onClose}>
            <X size={16} />
          </Button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px", background: "#f8fafc" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, minHeight: "min-content" }}>
            {/* Section 1: Invoice Info */}
          <div className="f-section">
            <div className="f-section-header">
              <FileText size={14} color="#64748b" />
              Invoice Information
            </div>
            <div className="f-section-body">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
                <Fld label="Invoice No. *" error={errors.invoiceNo}>
                  <input className={`f-input ${errors.invoiceNo ? "error" : ""}`} value={invoiceNo}
                    onChange={e => { setInvoiceNo(e.target.value); setErrors(p => ({ ...p, invoiceNo: "" })); }}
                    placeholder="INV-001" />
                </Fld>
                <Fld label="Invoice Date">
                  <input className="f-input" type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
                </Fld>
                <Fld label="Due Date *" error={errors.dueDate}>
                  <input className={`f-input ${errors.dueDate ? "error" : ""}`} type="date" value={dueDate}
                    onChange={e => { setDueDate(e.target.value); setErrors(p => ({ ...p, dueDate: "" })); }} />
                </Fld>
                <Fld label="Status">
                  <select className="f-input f-select" value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </Fld>
              </div>
            </div>
          </div>

          {/* Section 2: Customer */}
          <div className="f-section">
            <div className="f-section-header">
              <User size={14} color="#64748b" />
              Customer Details
            </div>
            <div className="f-section-body">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                <Fld label="Customer Name *" error={errors.customerName}>
                  <input className={`f-input ${errors.customerName ? "error" : ""}`} value={customerName}
                    onChange={e => { setCustomerName(e.target.value); setErrors(p => ({ ...p, customerName: "" })); }}
                    placeholder="Full name" />
                </Fld>
                <Fld label="Mobile Number">
                  <input className="f-input" type="tel" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="98XXXXXXXX" />
                </Fld>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Fld label="Institution / School / Event (Optional)">
                    <input className="f-input" value={institution} onChange={e => setInstitution(e.target.value)} placeholder="e.g. DAV Public School" />
                  </Fld>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Fld label="Full Address">
                    <textarea className="f-input" value={address} onChange={e => setAddress(e.target.value)}
                      placeholder="Enter complete address..." rows={2} style={{ resize: "vertical", minHeight: 60 }} />
                  </Fld>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Items */}
          <div className="f-section">
            <div className="f-section-header" style={{ justifyContent: "space-between" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Package size={14} color="#64748b" />
                Rental Items
              </span>
              <Button variant="outline" size="sm" onPress={addItem}>
                <Plus size={12} /> Add Item
              </Button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="inv-table" style={{ marginBottom: 0, minWidth: 600 }}>
                <thead>
                  <tr>
                    <th style={{ cursor: "default", width: 36 }}>#</th>
                    <th style={{ cursor: "default" }}>Description</th>
                    <th style={{ cursor: "default", width: 80, textAlign: "center" }}>Qty</th>
                    <th style={{ cursor: "default", width: 110, textAlign: "right" }}>Rate (₹)</th>
                    <th style={{ cursor: "default", width: 110, textAlign: "right" }}>Amount (₹)</th>
                    <th style={{ cursor: "default", width: 36 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.id} style={{ background: "white" }}>
                      <td style={{ color: "#94a3b8", fontSize: 12, textAlign: "center" }}>{idx + 1}</td>
                      <td>
                        <input className="f-input" style={{ fontSize: 13, padding: "7px 10px" }}
                          value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)}
                          placeholder="Item / Dress name" />
                      </td>
                      <td>
                        <input className="f-input" type="number" min="1" style={{ fontSize: 13, padding: "7px 8px", textAlign: "center" }}
                          value={item.quantity} onChange={e => updateItem(item.id, "quantity", e.target.value)} placeholder="1" />
                      </td>
                      <td>
                        <input className="f-input" type="number" min="0" style={{ fontSize: 13, padding: "7px 8px", textAlign: "right" }}
                          value={item.rate} onChange={e => updateItem(item.id, "rate", e.target.value)} placeholder="500" />
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 800, color: "#2563eb", fontSize: 14, padding: "12px 16px" }}>
                        ₹{Number(item.amount || 0).toLocaleString()}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <Button variant="ghost" isIconOnly size="sm" onPress={() => removeItem(item.id)} isDisabled={items.length === 1}>
                          <Trash2 size={13} color={items.length === 1 ? "#cbd5e1" : "#ef4444"} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, background: "#f8fafc" }}>
              <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>Total:</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: "#2563eb" }}>₹{total.toLocaleString()}</span>
            </div>
          </div>

          {/* Section 4: Payment */}
          <div className="f-section">
            <div className="f-section-header">
              <CreditCard size={14} color="#64748b" />
              Payment & Deposit
            </div>
            <div className="f-section-body">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: 14 }}>
                <Fld label="Payment Mode">
                  <select className="f-input f-select" value={paymentMode} onChange={e => setPaymentMode(e.target.value)}>
                    <option value="Cash">Cash</option>
                    <option value="Online">Online Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </Fld>
                <Fld label="Deposit Amount (₹)">
                  <input className="f-input" type="number" min="0" value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)} placeholder="e.g. 500" />
                </Fld>
                <Fld label="Delivery Date">
                  <input className="f-input" type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
                </Fld>
                <Fld label="Deposit Date">
                  <input className="f-input" type="date" value={depositDate} onChange={e => setDepositDate(e.target.value)} />
                </Fld>
              </div>

              {Number(depositAmount) > 0 && (
                <div style={{
                  marginTop: 14, padding: "12px 16px", borderRadius: 10, border: "1.5px solid",
                  background: balance > 0 ? "#fffbeb" : "#f0fdf4",
                  borderColor: balance > 0 ? "#fde68a" : "#bbf7d0",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: balance > 0 ? "#a16207" : "#15803d", marginBottom: 3 }}>
                      Balance Due
                    </p>
                    <p style={{ fontSize: 20, fontWeight: 900, color: balance > 0 ? "#d97706" : "#16a34a" }}>
                      ₹{balance.toLocaleString()}
                    </p>
                  </div>
                  <AlertCircle size={24} color={balance > 0 ? "#f59e0b" : "#22c55e"} />
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Notes */}
          <div className="f-section">
            <div className="f-section-header">
              <StickyNote size={14} color="#64748b" />
              Notes & Remarks
            </div>
            <div className="f-section-body">
              <textarea className="f-input" value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Additional notes, conditions, or remarks..." rows={3} style={{ resize: "vertical" }} />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                <div style={{ border: "2px dashed #e2e8f0", borderRadius: 12, padding: "14px 24px", textAlign: "center", width: 200 }}>
                  <p style={{ fontWeight: 800, fontSize: 13, color: "#0f172a", marginBottom: 28 }}>Aaradhya Fancy Dresses</p>
                  <div style={{ height: 1, background: "#e2e8f0", marginBottom: 6 }} />
                  <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Authorized Signature
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div style={{ flex: 1, fontSize: 12, color: "#94a3b8" }}>
            {items.length} item{items.length !== 1 ? "s" : ""} · <strong style={{ color: "#2563eb" }}>₹{total.toLocaleString()}</strong>
          </div>
          <Button variant="outline" onPress={onClose}>Cancel</Button>
          <Button variant="primary" onPress={handleSubmit} isDisabled={loading}>
            {loading
              ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span> Saving...</>
              : <><Save size={14} /> {isEdit ? "Update Invoice" : "Save Invoice"}</>
            }
          </Button>
        </div>
      </div>
    </div>
  );
}

function Fld({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label className="f-label">
        {label}
        {error && <span style={{ color: "#ef4444", marginLeft: 5, fontWeight: 600, textTransform: "none", fontSize: 11 }}>{error}</span>}
      </label>
      {children}
    </div>
  );
}
