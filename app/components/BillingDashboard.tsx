"use client";

import React from "react";
import { Button } from "@heroui/react";
import {
  RefreshCcw, Plus, Download, Search,
  Eye, Pencil, Trash2, CheckCircle2,
  TrendingUp, AlertCircle, Clock, DollarSign,
  ArrowUpDown, ArrowUp, ArrowDown, Printer,
  Users, Package, BarChart3, CreditCard,
  FileText, ChevronUp, ChevronDown, Share2,
} from "lucide-react";
import InvoiceForm from "./InvoiceForm";
import Sidebar from "./Sidebar";
import { useToast } from "./Toast";

interface Invoice {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  institution?: string;
  address?: string;
  mobile?: string;
  amount: number;
  depositAmount?: number;
  status: "Paid" | "Pending" | "Overdue" | "Cancelled";
  dueDate: string;
  invoiceDate?: string;
  deliveryDate?: string;
  depositDate?: string;
  paymentMode: string;
  notes?: string;
  items?: { description: string; quantity: number; rate: number; amount: number }[];
  createdAt: string;
}

// ─── Status Badge ──────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cls = {
    Paid: "status-badge status-paid",
    Pending: "status-badge status-pending",
    Overdue: "status-badge status-overdue",
    Cancelled: "status-badge status-cancelled",
  }[status] ?? "status-badge status-pending";
  return (
    <span className={cls}>
      <span className="status-dot" />
      {status}
    </span>
  );
}

// ─── WhatsApp Share ────────────────────────────────────────────
function shareOnWhatsApp(invoice: Invoice) {
  const itemsText = (invoice.items || [])
    .map(it => `  • ${it.description} × ${it.quantity} = ₹${it.amount.toLocaleString()}`)
    .join("\n");

  const text = `🏪 *Aaradhya Fancy Dresses*
📄 *Invoice:* ${invoice.invoiceNumber}
👤 *Customer:* ${invoice.customerName}${invoice.mobile ? `\n📞 +91 ${invoice.mobile}` : ""}
💰 *Amount:* ₹${invoice.amount.toLocaleString()}${invoice.depositAmount ? `\n💳 Deposit: ₹${invoice.depositAmount.toLocaleString()}` : ""}
📊 *Status:* ${invoice.status}
📅 *Due:* ${new Date(invoice.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
💳 *Payment:* ${invoice.paymentMode}
${itemsText ? `\n*Items:*\n${itemsText}` : ""}
${invoice.notes ? `\n📝 *Notes:* ${invoice.notes}` : ""}`;

  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

// ─── Confirm Dialog ────────────────────────────────────────────
function ConfirmModal({ isOpen, onConfirm, onCancel }: {
  isOpen: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal-box modal-sm">
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Trash2 size={18} color="#ef4444" />
            <span style={{ fontWeight: 700, fontSize: 15 }}>Delete Invoice?</span>
          </div>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>
            This action cannot be undone. The invoice will be permanently deleted.
          </p>
        </div>
        <div className="modal-footer">
          <Button variant="outline" onPress={onCancel}>Cancel</Button>
          <Button variant="danger" onPress={onConfirm}>Delete</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Invoice View Modal ────────────────────────────────────────
function InvoiceViewModal({ invoice, onClose, onEdit, onStatusChange }: {
  invoice: Invoice; onClose: () => void; onEdit: () => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  const handlePrint = () => {
    const w = window.open("", "_blank", "width=850,height=680");
    if (!w) return;
    w.document.write(`<html><head><title>Invoice ${invoice.invoiceNumber}</title>
    <style>
      body{font-family:sans-serif;color:#0f172a;padding:36px;font-size:13px}
      .hdr{display:flex;justify-content:space-between;margin-bottom:28px;padding-bottom:20px;border-bottom:2px solid #e2e8f0}
      h1{margin:0 0 4px;font-size:20px}
      table{width:100%;border-collapse:collapse;margin-top:20px}
      th{background:#f8fafc;padding:9px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#64748b;border-bottom:2px solid #e2e8f0}
      td{padding:9px 12px;border-bottom:1px solid #f1f5f9;font-size:13px}
      .total{text-align:right;font-size:18px;font-weight:900;color:#2563eb;margin-top:14px}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px}
      .lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;margin-bottom:3px}
      .val{font-size:13px;font-weight:600}
      .sig{border-top:2px dashed #e2e8f0;margin-top:50px;padding-top:10px;text-align:right;font-size:11px;color:#64748b}
      @media print{body{padding:16px}}
    </style></head><body>
    <div class="hdr"><div><h1>Aaradhya Fancy Dresses</h1><p style="color:#94a3b8;margin:0">Tax Invoice</p></div>
    <div style="text-align:right"><div style="font-weight:700;color:#2563eb;font-size:15px">${invoice.invoiceNumber}</div>
    <div style="color:#94a3b8">Date: ${new Date(invoice.invoiceDate || invoice.createdAt).toLocaleDateString("en-IN")}</div>
    <div style="color:#94a3b8">Due: ${new Date(invoice.dueDate).toLocaleDateString("en-IN")}</div></div></div>
    <div class="grid"><div><div class="lbl">Billed To</div><div class="val">${invoice.customerName}</div>
    ${invoice.institution ? `<div style="color:#64748b">${invoice.institution}</div>` : ""}
    ${invoice.mobile ? `<div style="color:#64748b">+91 ${invoice.mobile}</div>` : ""}
    ${invoice.address ? `<div style="color:#64748b;white-space:pre-line;margin-top:4px">${invoice.address}</div>` : ""}
    </div><div><div class="lbl">Payment Mode</div><div class="val">${invoice.paymentMode}</div>
    ${invoice.depositAmount ? `<div class="lbl" style="margin-top:10px">Deposit Paid</div><div class="val">₹${invoice.depositAmount.toLocaleString()}</div>` : ""}
    </div></div>
    <table><thead><tr><th>#</th><th>Description</th><th>Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr></thead><tbody>
    ${(invoice.items || []).map((it, i) => `<tr><td>${i + 1}</td><td>${it.description}</td><td>${it.quantity}</td><td style="text-align:right">₹${it.rate.toLocaleString()}</td><td style="text-align:right">₹${it.amount.toLocaleString()}</td></tr>`).join("")}
    </tbody></table>
    <div class="total">Total: ₹${invoice.amount.toLocaleString()}</div>
    ${invoice.notes ? `<div style="margin-top:20px;padding:12px;background:#f8fafc;border-radius:8px;color:#64748b"><strong>Notes:</strong> ${invoice.notes}</div>` : ""}
    <div class="sig">Authorized Signature — Aaradhya Fancy Dresses</div>
    </body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-lg" style={{ display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FileText size={18} color="#3b82f6" />
            <div>
              <p style={{ fontWeight: 800, fontSize: 16, color: "#0f172a", margin: 0 }}>
                {invoice.invoiceNumber}
              </p>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>Invoice Details</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <StatusBadge status={invoice.status} />
            <Button variant="ghost" isIconOnly onPress={onClose} size="sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 18 }}>
            {/* Customer */}
            <div style={{ background: "#f8fafc", borderRadius: 10, padding: "14px 16px", border: "1px solid #e2e8f0" }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94a3b8", marginBottom: 8 }}>Billed To</p>
              <p style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 4 }}>{invoice.customerName}</p>
              {invoice.institution && <p style={{ fontSize: 12, color: "#64748b" }}>🏫 {invoice.institution}</p>}
              {invoice.mobile && <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>📞 +91 {invoice.mobile}</p>}
              {invoice.address && <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, lineHeight: 1.5, whiteSpace: "pre-line" }}>{invoice.address}</p>}
            </div>

            {/* Dates & Payment */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Due Date", value: new Date(invoice.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
                ...(invoice.deliveryDate ? [{ label: "Delivery Date", value: new Date(invoice.deliveryDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) }] : []),
                { label: "Payment Mode", value: invoice.paymentMode },
                ...(invoice.depositAmount && invoice.depositAmount > 0 ? [{ label: "Deposit Paid", value: `₹${invoice.depositAmount.toLocaleString()}` }] : []),
              ].map(({ label, value }) => (
                <div key={label} style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 14px", border: "1px solid #e2e8f0" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94a3b8", marginBottom: 3 }}>{label}</p>
                  <p style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Items table */}
          {invoice.items && invoice.items.length > 0 && (
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
              <div style={{ padding: "11px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 8 }}>
                <Package size={14} color="#64748b" />
                <span style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>Rental Items</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="inv-table">
                  <thead>
                    <tr>
                      <th style={{ cursor: "default" }}>#</th>
                      <th style={{ cursor: "default" }}>Description</th>
                      <th style={{ cursor: "default", textAlign: "center" }}>Qty</th>
                      <th style={{ cursor: "default", textAlign: "right" }}>Rate (₹)</th>
                      <th style={{ cursor: "default", textAlign: "right" }}>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, i) => (
                      <tr key={i}>
                        <td style={{ color: "#94a3b8", fontSize: 12 }}>{i + 1}</td>
                        <td style={{ fontWeight: 500, fontSize: 13 }}>{item.description}</td>
                        <td style={{ textAlign: "center", fontSize: 13 }}>{item.quantity}</td>
                        <td style={{ textAlign: "right", color: "#64748b", fontSize: 13 }}>₹{item.rate.toLocaleString()}</td>
                        <td style={{ textAlign: "right", fontWeight: 700, color: "#2563eb", fontSize: 14 }}>₹{item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: "12px 16px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>Grand Total:</span>
                <span style={{ fontSize: 22, fontWeight: 900, color: "#2563eb" }}>₹{invoice.amount.toLocaleString()}</span>
              </div>
            </div>
          )}

          {invoice.notes && (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#92400e", lineHeight: 1.6 }}>
              <strong>Notes:</strong> {invoice.notes}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ gap: 8 }}>
          <Button variant="outline" onPress={handlePrint}>
            <Printer size={14} />
            Print / PDF
          </Button>
          <Button variant="outline" onPress={() => shareOnWhatsApp(invoice)}>
            <Share2 size={14} color="#25D366" />
            WhatsApp
          </Button>
          {invoice.status !== "Paid" && (
            <Button variant="secondary" onPress={() => { onStatusChange(invoice._id, "Paid"); onClose(); }}>
              <CheckCircle2 size={14} />
              Mark as Paid
            </Button>
          )}
          <Button variant="secondary" onPress={onEdit}>
            <Pencil size={14} />
            Edit Invoice
          </Button>
          <Button variant="outline" onPress={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Tab ─────────────────────────────────────────────
function DashboardTab({ invoices, onCreateNew }: { invoices: Invoice[]; onCreateNew: () => void }) {
  const total   = invoices.reduce((s, i) => s + i.amount, 0);
  const paid    = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const pending = invoices.filter(i => i.status === "Pending").reduce((s, i) => s + i.amount, 0);
  const overdue = invoices.filter(i => i.status === "Overdue").reduce((s, i) => s + i.amount, 0);

  const recent = [...invoices].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="tab-content">
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard icon={<DollarSign size={20} color="#3b82f6" />} label="Total Revenue" value={`₹${total.toLocaleString()}`} sub={`${invoices.length} invoices`} accent="#eff6ff" border="#bfdbfe" textColor="#1d4ed8" />
        <StatCard icon={<CheckCircle2 size={20} color="#16a34a" />} label="Collected" value={`₹${paid.toLocaleString()}`} sub={`${invoices.filter(i => i.status === "Paid").length} paid`} accent="#f0fdf4" border="#bbf7d0" textColor="#15803d" />
        <StatCard icon={<Clock size={20} color="#ca8a04" />} label="Pending" value={`₹${pending.toLocaleString()}`} sub={`${invoices.filter(i => i.status === "Pending").length} invoices`} accent="#fefce8" border="#fde68a" textColor="#a16207" />
        <StatCard icon={<AlertCircle size={20} color="#dc2626" />} label="Overdue" value={`₹${overdue.toLocaleString()}`} sub={`${invoices.filter(i => i.status === "Overdue").length} invoices`} accent="#fef2f2" border="#fecaca" textColor="#b91c1c" />
      </div>

      {/* Recent invoices */}
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Recent Invoices</span>
          <Button variant="outline" size="sm" onPress={onCreateNew}>
            <Plus size={13} /> New Invoice
          </Button>
        </div>
        {recent.length === 0 ? (
          <div className="empty-state">
            <FileText size={40} color="#cbd5e1" />
            <p style={{ marginTop: 12, color: "#94a3b8", fontSize: 14 }}>No invoices yet</p>
            <div style={{ marginTop: 14 }}>
              <Button variant="primary" onPress={onCreateNew}><Plus size={14} /> Create Invoice</Button>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="desktop-table" style={{ overflowX: "auto" }}>
              <table className="inv-table">
                <thead>
                  <tr>
                    <th style={{ cursor: "default" }}>Invoice #</th>
                    <th style={{ cursor: "default" }}>Customer</th>
                    <th style={{ cursor: "default" }}>Amount</th>
                    <th style={{ cursor: "default" }}>Status</th>
                    <th style={{ cursor: "default" }}>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(inv => (
                    <tr key={inv._id} className={inv.status === "Overdue" ? "row-overdue" : ""}>
                      <td style={{ fontWeight: 700, color: "#3b82f6", fontSize: 13 }}>{inv.invoiceNumber}</td>
                      <td style={{ fontWeight: 500, fontSize: 13 }}>{inv.customerName}</td>
                      <td style={{ fontWeight: 700, fontSize: 14 }}>₹{inv.amount.toLocaleString()}</td>
                      <td><StatusBadge status={inv.status} /></td>
                      <td style={{ fontSize: 13, color: "#64748b" }}>{new Date(inv.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="mobile-cards">
              {recent.map(inv => (
                <div key={inv._id} className="mobile-card" style={inv.status === "Overdue" ? { borderColor: "#fca5a5", background: "#fff5f5" } : {}}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, color: "#3b82f6", fontSize: 12 }}>{inv.invoiceNumber}</span>
                    <StatusBadge status={inv.status} />
                  </div>
                  <p style={{ fontWeight: 600, fontSize: 14, color: "#0f172a", marginBottom: 4 }}>{inv.customerName}</p>
                  <p style={{ fontWeight: 900, fontSize: 16, color: "#0f172a", marginBottom: 4 }}>₹{inv.amount.toLocaleString()}</p>
                  <p style={{ fontSize: 12, color: "#94a3b8" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ marginRight: 3, verticalAlign: "middle" }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    {new Date(inv.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, accent, border, textColor }: any) {
  return (
    <div className="stat-card" style={{ background: accent, borderColor: border }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ background: "white", borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${border}` }}>
          {icon}
        </div>
      </div>
      <p style={{ fontSize: 22, fontWeight: 900, color: textColor, lineHeight: 1, marginBottom: 4 }}>{value}</p>
      <p style={{ fontSize: 12, color: textColor, opacity: 0.8, fontWeight: 600, marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 11, color: textColor, opacity: 0.6 }}>{sub}</p>
    </div>
  );
}

// ─── Customers Tab ─────────────────────────────────────────────
function CustomersTab({ invoices }: { invoices: Invoice[] }) {
  const customers = React.useMemo(() => {
    const map: Record<string, { name: string; institution: string; mobile: string; count: number; total: number; lastInvoice: string }> = {};
    for (const inv of invoices) {
      const k = inv.customerName.toLowerCase();
      if (!map[k]) map[k] = { name: inv.customerName, institution: inv.institution || "", mobile: inv.mobile || "", count: 0, total: 0, lastInvoice: inv.createdAt };
      map[k].count++;
      map[k].total += inv.amount;
      if (new Date(inv.createdAt) > new Date(map[k].lastInvoice)) map[k].lastInvoice = inv.createdAt;
    }
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [invoices]);

  return (
    <div className="tab-content">
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
          <Users size={16} color="#3b82f6" />
          <span style={{ fontWeight: 700, fontSize: 14 }}>All Customers ({customers.length})</span>
        </div>
        {customers.length === 0 ? (
          <div className="empty-state">
            <Users size={40} color="#cbd5e1" />
            <p style={{ marginTop: 12, color: "#94a3b8", fontSize: 14 }}>No customers yet</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="desktop-table" style={{ overflowX: "auto" }}>
              <table className="inv-table">
                <thead>
                  <tr>
                    <th style={{ cursor: "default" }}>Customer Name</th>
                    <th style={{ cursor: "default" }}>Institution</th>
                    <th style={{ cursor: "default" }}>Mobile</th>
                    <th style={{ cursor: "default" }}>Orders</th>
                    <th style={{ cursor: "default" }}>Total Billed</th>
                    <th style={{ cursor: "default" }}>Last Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: "#0f172a", fontSize: 13 }}>{c.name}</td>
                      <td style={{ fontSize: 12, color: "#64748b" }}>{c.institution || "—"}</td>
                      <td style={{ fontSize: 12, color: "#64748b" }}>{c.mobile ? `+91 ${c.mobile}` : "—"}</td>
                      <td style={{ fontWeight: 600, fontSize: 13 }}>{c.count}</td>
                      <td style={{ fontWeight: 700, color: "#2563eb", fontSize: 14 }}>₹{c.total.toLocaleString()}</td>
                      <td style={{ fontSize: 12, color: "#64748b" }}>{new Date(c.lastInvoice).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="mobile-cards">
              {customers.map((c, i) => (
                <div key={i} className="mini-card">
                  <p style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 6 }}>{c.name}</p>
                  {c.institution && <p style={{ fontSize: 12, color: "#64748b", marginBottom: 3 }}>{c.institution}</p>}
                  <div className="mini-divider" />
                  <div className="mini-row">
                    <span className="mini-label">Orders</span>
                    <span className="mini-value">{c.count}</span>
                  </div>
                  <div className="mini-row">
                    <span className="mini-label">Total Billed</span>
                    <span className="mini-value" style={{ color: "#2563eb", fontWeight: 800 }}>₹{c.total.toLocaleString()}</span>
                  </div>
                  <div className="mini-row">
                    <span className="mini-label">Mobile</span>
                    <span className="mini-value" style={{ color: "#64748b", fontWeight: 400 }}>{c.mobile ? `+91 ${c.mobile}` : "—"}</span>
                  </div>
                  <div className="mini-row">
                    <span className="mini-label">Last Invoice</span>
                    <span className="mini-value" style={{ color: "#64748b", fontWeight: 400 }}>{new Date(c.lastInvoice).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Inventory Tab ─────────────────────────────────────────────
function InventoryTab({ invoices }: { invoices: Invoice[] }) {
  const items = React.useMemo(() => {
    const map: Record<string, { name: string; timesRented: number; totalRevenue: number }> = {};
    for (const inv of invoices) {
      for (const item of inv.items || []) {
        const k = item.description.toLowerCase().trim();
        if (!map[k]) map[k] = { name: item.description, timesRented: 0, totalRevenue: 0 };
        map[k].timesRented += item.quantity;
        map[k].totalRevenue += item.amount;
      }
    }
    return Object.values(map).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [invoices]);

  return (
    <div className="tab-content">
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
          <Package size={16} color="#3b82f6" />
          <span style={{ fontWeight: 700, fontSize: 14 }}>Inventory / Items ({items.length})</span>
        </div>
        {items.length === 0 ? (
          <div className="empty-state">
            <Package size={40} color="#cbd5e1" />
            <p style={{ marginTop: 12, color: "#94a3b8", fontSize: 14 }}>No items found — add items in invoices</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="desktop-table" style={{ overflowX: "auto" }}>
              <table className="inv-table">
                <thead>
                  <tr>
                    <th style={{ cursor: "default" }}>#</th>
                    <th style={{ cursor: "default" }}>Item / Dress Name</th>
                    <th style={{ cursor: "default" }}>Times Rented</th>
                    <th style={{ cursor: "default" }}>Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td style={{ color: "#94a3b8", fontSize: 12 }}>{i + 1}</td>
                      <td style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{item.name}</td>
                      <td style={{ fontSize: 13, fontWeight: 600 }}>{item.timesRented} qty</td>
                      <td style={{ fontWeight: 700, color: "#2563eb", fontSize: 14 }}>₹{item.totalRevenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="mobile-cards">
              {items.map((item, i) => (
                <div key={i} className="mini-card">
                  <div className="mini-row" style={{ marginBottom: 2 }}>
                    <span style={{ color: "#94a3b8", fontSize: 12 }}>#{i + 1}</span>
                  </div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 8 }}>{item.name}</p>
                  <div className="mini-divider" />
                  <div className="mini-row">
                    <span className="mini-label">Times Rented</span>
                    <span className="mini-value">{item.timesRented} qty</span>
                  </div>
                  <div className="mini-row">
                    <span className="mini-label">Total Revenue</span>
                    <span className="mini-value" style={{ color: "#2563eb", fontWeight: 800 }}>₹{item.totalRevenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Analytics Tab ─────────────────────────────────────────────
function AnalyticsTab({ invoices }: { invoices: Invoice[] }) {
  const byStatus = ["Paid", "Pending", "Overdue", "Cancelled"].map(s => ({
    label: s,
    count: invoices.filter(i => i.status === s).length,
    amount: invoices.filter(i => i.status === s).reduce((sum, i) => sum + i.amount, 0),
  }));

  const byPayment = ["Cash", "Online", "Cheque"].map(p => ({
    label: p,
    count: invoices.filter(i => i.paymentMode === p).length,
    amount: invoices.filter(i => i.paymentMode === p).reduce((sum, i) => sum + i.amount, 0),
  }));

  const total = invoices.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="tab-content">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
        {/* By Status */}
        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
            <BarChart3 size={15} color="#3b82f6" />
            <span style={{ fontWeight: 700, fontSize: 13 }}>Revenue by Status</span>
          </div>
          <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
            {byStatus.map(({ label, count, amount }) => {
              const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
              const barColor = label === "Paid" ? "#22c55e" : label === "Pending" ? "#eab308" : label === "Overdue" ? "#ef4444" : "#94a3b8";
              return (
                <div key={label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{label} ({count})</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>₹{amount.toLocaleString()}</span>
                  </div>
                  <div style={{ height: 6, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 999, transition: "width 0.6s ease" }} />
                  </div>
                  <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{pct}% of total</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Payment Mode */}
        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
            <CreditCard size={15} color="#3b82f6" />
            <span style={{ fontWeight: 700, fontSize: 13 }}>Revenue by Payment Mode</span>
          </div>
          <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
            {byPayment.map(({ label, count, amount }) => {
              const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
              const colors = { Cash: "#3b82f6", Online: "#8b5cf6", Cheque: "#f59e0b" };
              return (
                <div key={label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{label} ({count})</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>₹{amount.toLocaleString()}</span>
                  </div>
                  <div style={{ height: 6, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: (colors as any)[label] || "#94a3b8", borderRadius: 999, transition: "width 0.6s ease" }} />
                  </div>
                  <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{pct}% of total</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp size={15} color="#3b82f6" />
            <span style={{ fontWeight: 700, fontSize: 13 }}>Summary</span>
          </div>
          <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Total Invoices",     value: invoices.length.toString() },
              { label: "Total Revenue",      value: `₹${total.toLocaleString()}` },
              { label: "Collection Rate",    value: total > 0 ? `${Math.round((invoices.filter(i => i.status === "Paid").reduce((s, i) => s + i.amount, 0) / total) * 100)}%` : "0%" },
              { label: "Avg Invoice Value",  value: invoices.length > 0 ? `₹${Math.round(total / invoices.length).toLocaleString()}` : "₹0" },
              { label: "Overdue Invoices",   value: invoices.filter(i => i.status === "Overdue").length.toString() },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Payments Tab ──────────────────────────────────────────────
function PaymentsTab({ invoices }: { invoices: Invoice[] }) {
  const paid = invoices.filter(i => i.status === "Paid").sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

  return (
    <div className="tab-content">
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CreditCard size={16} color="#3b82f6" />
            <span style={{ fontWeight: 700, fontSize: 14 }}>Collected Payments ({paid.length})</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>
            Total: ₹{paid.reduce((s, i) => s + i.amount, 0).toLocaleString()}
          </span>
        </div>
        {paid.length === 0 ? (
          <div className="empty-state">
            <CreditCard size={40} color="#cbd5e1" />
            <p style={{ marginTop: 12, color: "#94a3b8", fontSize: 14 }}>No payments collected yet</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="desktop-table" style={{ overflowX: "auto" }}>
              <table className="inv-table">
                <thead>
                  <tr>
                    <th style={{ cursor: "default" }}>Invoice #</th>
                    <th style={{ cursor: "default" }}>Customer</th>
                    <th style={{ cursor: "default" }}>Amount</th>
                    <th style={{ cursor: "default" }}>Deposit</th>
                    <th style={{ cursor: "default" }}>Payment Mode</th>
                    <th style={{ cursor: "default" }}>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paid.map(inv => (
                    <tr key={inv._id}>
                      <td style={{ fontWeight: 700, color: "#3b82f6", fontSize: 13 }}>{inv.invoiceNumber}</td>
                      <td style={{ fontWeight: 500, fontSize: 13 }}>{inv.customerName}</td>
                      <td style={{ fontWeight: 700, color: "#15803d", fontSize: 14 }}>₹{inv.amount.toLocaleString()}</td>
                      <td style={{ fontSize: 13, color: "#64748b" }}>{inv.depositAmount ? `₹${inv.depositAmount.toLocaleString()}` : "—"}</td>
                      <td style={{ fontSize: 12, color: "#64748b" }}>{inv.paymentMode}</td>
                      <td style={{ fontSize: 12, color: "#64748b" }}>{new Date(inv.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="mobile-cards">
              {paid.map(inv => (
                <div key={inv._id} className="mini-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, color: "#3b82f6", fontSize: 12 }}>{inv.invoiceNumber}</span>
                    <span style={{ fontWeight: 700, color: "#15803d", fontSize: 14 }}>₹{inv.amount.toLocaleString()}</span>
                  </div>
                  <p style={{ fontWeight: 600, fontSize: 13, color: "#0f172a", marginBottom: 6 }}>{inv.customerName}</p>
                  <div className="mini-divider" />
                  <div className="mini-row">
                    <span className="mini-label">Deposit</span>
                    <span className="mini-value">{inv.depositAmount ? `₹${inv.depositAmount.toLocaleString()}` : "—"}</span>
                  </div>
                  <div className="mini-row">
                    <span className="mini-label">Payment Mode</span>
                    <span className="mini-value" style={{ color: "#64748b", fontWeight: 500 }}>{inv.paymentMode}</span>
                  </div>
                  <div className="mini-row">
                    <span className="mini-label">Due Date</span>
                    <span className="mini-value" style={{ color: "#64748b", fontWeight: 500 }}>{new Date(inv.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Export Tab ────────────────────────────────────────────────
function ExportTab({ invoices }: { invoices: Invoice[] }) {
  const { toast } = useToast();

  const exportAll = () => {
    const headers = ["Invoice #", "Customer", "Institution", "Mobile", "Amount", "Deposit", "Status", "Due Date", "Payment Mode", "Notes", "Created At"];
    const rows = invoices.map(inv => [
      inv.invoiceNumber, inv.customerName, inv.institution || "", inv.mobile || "",
      inv.amount, inv.depositAmount || 0, inv.status,
      new Date(inv.dueDate).toLocaleDateString("en-IN"),
      inv.paymentMode, inv.notes || "",
      new Date(inv.createdAt).toLocaleDateString("en-IN"),
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `invoices_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast("All invoices exported!", "success");
  };

  const exportPaid = () => {
    const paid = invoices.filter(i => i.status === "Paid");
    const headers = ["Invoice #", "Customer", "Amount", "Deposit", "Payment Mode", "Due Date"];
    const rows = paid.map(inv => [inv.invoiceNumber, inv.customerName, inv.amount, inv.depositAmount || 0, inv.paymentMode, new Date(inv.dueDate).toLocaleDateString("en-IN")]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `paid_invoices_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast("Paid invoices exported!", "success");
  };

  const exportOverdue = () => {
    const overdue = invoices.filter(i => i.status === "Overdue" || i.status === "Pending");
    const headers = ["Invoice #", "Customer", "Mobile", "Amount", "Status", "Due Date"];
    const rows = overdue.map(inv => [inv.invoiceNumber, inv.customerName, inv.mobile || "", inv.amount, inv.status, new Date(inv.dueDate).toLocaleDateString("en-IN")]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `pending_invoices_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast("Pending/Overdue invoices exported!", "success");
  };

  return (
    <div className="tab-content">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
        {[
          { title: "All Invoices", desc: `Export all ${invoices.length} invoices as CSV`, action: exportAll, count: invoices.length, color: "#eff6ff", border: "#bfdbfe", icon: <Download size={20} color="#3b82f6" /> },
          { title: "Paid Invoices", desc: `Export ${invoices.filter(i => i.status === "Paid").length} paid invoices`, action: exportPaid, count: invoices.filter(i => i.status === "Paid").length, color: "#f0fdf4", border: "#bbf7d0", icon: <CheckCircle2 size={20} color="#16a34a" /> },
          { title: "Pending & Overdue", desc: `Export ${invoices.filter(i => i.status === "Pending" || i.status === "Overdue").length} pending/overdue invoices`, action: exportOverdue, count: invoices.filter(i => i.status === "Pending" || i.status === "Overdue").length, color: "#fef2f2", border: "#fecaca", icon: <AlertCircle size={20} color="#dc2626" /> },
        ].map(({ title, desc, action, count, color, border, icon }) => (
          <div key={title} style={{ background: color, border: `1px solid ${border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ marginBottom: 12 }}>{icon}</div>
            <h3 style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 6 }}>{title}</h3>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16, lineHeight: 1.5 }}>{desc}</p>
            <Button variant="outline" onPress={action} isDisabled={count === 0}>
              <Download size={13} /> Export CSV
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Invoices Tab ──────────────────────────────────────────────
function InvoicesTab({ invoices, onRefresh, onCreateNew, loading }: {
  invoices: Invoice[]; onRefresh: () => void; onCreateNew: () => void; loading: boolean;
  }) {
  const { toast } = useToast();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [sortField, setSortField] = React.useState("createdAt");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [viewInvoice, setViewInvoice] = React.useState<Invoice | null>(null);
  const [editInvoice, setEditInvoice] = React.useState<Invoice | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const handleSort = (f: string) => {
    if (sortField === f) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(f); setSortDir("asc"); }
  };

  const filtered = React.useMemo(() => {
    let arr = invoices.filter(inv => {
      const ms = !statusFilter || inv.status === statusFilter;
      const q = search.toLowerCase();
      const mq = !q || inv.customerName.toLowerCase().includes(q) || inv.invoiceNumber.toLowerCase().includes(q) || (inv.mobile || "").includes(q);
      return ms && mq;
    });
    return [...arr].sort((a, b) => {
      let av: any = a[sortField as keyof Invoice] ?? "";
      let bv: any = b[sortField as keyof Invoice] ?? "";
      if (sortField === "dueDate" || sortField === "createdAt") { av = new Date(av as string).getTime(); bv = new Date(bv as string).getTime(); }
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [invoices, search, statusFilter, sortField, sortDir]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (res.ok) { toast(`Status updated to ${status}`, "success"); onRefresh(); }
      else toast("Failed to update status", "error");
    } catch { toast("Failed to update status", "error"); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
      if (res.ok) { toast("Invoice deleted", "info"); onRefresh(); }
      else toast("Failed to delete", "error");
    } catch { toast("Failed to delete", "error"); }
    setDeleteId(null);
  };

  const handleSave = async (formData: any) => {
    try {
      const url = editInvoice ? `/api/invoices/${editInvoice._id}` : "/api/invoices";
      const method = editInvoice ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (res.ok) {
        toast(editInvoice ? "Invoice updated!" : "Invoice created!", "success");
        setFormOpen(false); setEditInvoice(null); onRefresh();
      } else toast("Failed to save invoice", "error");
    } catch { toast("Failed to save invoice", "error"); }
  };

  const exportCSV = () => {
    const headers = ["Invoice #", "Customer", "Amount", "Status", "Due Date", "Payment Mode"];
    const rows = filtered.map(inv => [inv.invoiceNumber, inv.customerName, inv.amount, inv.status, new Date(inv.dueDate).toLocaleDateString("en-IN"), inv.paymentMode]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `invoices_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast("Exported!", "success");
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown size={10} style={{ marginLeft: 4, opacity: 0.4 }} />;
    return sortDir === "asc" ? <ArrowUp size={10} style={{ marginLeft: 4, color: "#3b82f6" }} /> : <ArrowDown size={10} style={{ marginLeft: 4, color: "#3b82f6" }} />;
  };

  return (
    <>
      <div className="tab-content">
        {/* Filters bar */}
        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 14px", marginBottom: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {/* Search */}
          <div className="search-wrap" style={{ flex: "1 1 200px", minWidth: 0 }}>
            <Search size={14} className="search-icon" />
            <input className="f-input" placeholder="Search invoice, customer, mobile..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* Status filter chips */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["", "Paid", "Pending", "Overdue", "Cancelled"].map(s => (
              <button
                key={s || "all"}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: "5px 12px", borderRadius: 999, border: "1.5px solid", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                  background: statusFilter === s ? (s === "Paid" ? "#dcfce7" : s === "Pending" ? "#fef9c3" : s === "Overdue" ? "#fee2e2" : s === "Cancelled" ? "#f1f5f9" : "#eff6ff") : "white",
                  borderColor: statusFilter === s ? (s === "Paid" ? "#86efac" : s === "Pending" ? "#fde047" : s === "Overdue" ? "#fca5a5" : s === "Cancelled" ? "#cbd5e1" : "#bfdbfe") : "#e2e8f0",
                  color: statusFilter === s ? (s === "Paid" ? "#15803d" : s === "Pending" ? "#a16207" : s === "Overdue" ? "#b91c1c" : s === "Cancelled" ? "#64748b" : "#2563eb") : "#64748b",
                }}
              >
                {s || "All"}
                <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.7 }}>
                  ({s ? invoices.filter(i => i.status === s).length : invoices.length})
                </span>
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
            <Button variant="outline" size="sm" onPress={onRefresh} style={{ minWidth: 0 }}>
              <RefreshCcw size={13} />
              <span className="hide-xs" style={{ marginLeft: 3 }}>Refresh</span>
            </Button>
            <Button variant="outline" size="sm" onPress={exportCSV} style={{ minWidth: 0 }}>
              <Download size={13} />
              <span className="hide-xs" style={{ marginLeft: 3 }}>Export</span>
            </Button>
            <Button variant="primary" size="sm" onPress={() => { setEditInvoice(null); setFormOpen(true); }} style={{ minWidth: 0 }}>
              <Plus size={13} />
              <span className="hide-xs" style={{ marginLeft: 3 }}>New Invoice</span>
            </Button>
          </div>
        </div>

        {/* Result count */}
        <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>
          Showing <strong style={{ color: "#374151" }}>{filtered.length}</strong> of {invoices.length} invoices
        </p>

        {/* Desktop Table */}
        <div className="table-wrap" style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="inv-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("invoiceNumber")}>Invoice # <SortIcon field="invoiceNumber" /></th>
                  <th onClick={() => handleSort("customerName")}>Customer <SortIcon field="customerName" /></th>
                  <th onClick={() => handleSort("amount")}>Amount <SortIcon field="amount" /></th>
                  <th>Status</th>
                  <th onClick={() => handleSort("dueDate")}>Due Date <SortIcon field="dueDate" /></th>
                  <th>Payment</th>
                  <th style={{ textAlign: "right", cursor: "default" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j}><div className="skeleton" style={{ height: 14, width: "75%" }} /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7}>
                    <div className="empty-state">
                      <FileText size={44} color="#cbd5e1" />
                      <p style={{ marginTop: 12, fontWeight: 600, color: "#374151", fontSize: 15 }}>No invoices found</p>
                      <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
                        {search || statusFilter ? "Try adjusting your search or filters" : "Create your first invoice"}
                      </p>
                      {!search && !statusFilter && (
                        <div style={{ marginTop: 14 }}>
                          <Button variant="primary" size="sm" onPress={() => { setEditInvoice(null); setFormOpen(true); }}>
                            <Plus size={13} /> Create Invoice
                          </Button>
                        </div>
                      )}
                    </div>
                  </td></tr>
                ) : (
                  filtered.map(inv => (
                    <tr key={inv._id} className={inv.status === "Overdue" ? "row-overdue" : ""}>
                      <td>
                        <button
                          style={{ fontWeight: 700, color: "#3b82f6", fontSize: 13, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                          onClick={() => setViewInvoice(inv)}
                        >
                          {inv.invoiceNumber}
                        </button>
                      </td>
                      <td>
                        <p style={{ fontWeight: 600, fontSize: 13, color: "#0f172a", marginBottom: 1 }}>{inv.customerName}</p>
                        {inv.institution && <p style={{ fontSize: 11, color: "#94a3b8" }}>{inv.institution}</p>}
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, fontSize: 14 }}>₹{inv.amount.toLocaleString()}</span>
                        {inv.depositAmount && inv.depositAmount > 0 ? (
                          <p style={{ fontSize: 11, color: "#16a34a", marginTop: 1 }}>↳ ₹{inv.depositAmount.toLocaleString()} deposit</p>
                        ) : null}
                      </td>
                      <td>
                        <select
                          value={inv.status}
                          onChange={e => handleStatusChange(inv._id, e.target.value)}
                          className={`status-select sel-${inv.status.toLowerCase()}`}
                        >
                          <option value="Paid">Paid</option>
                          <option value="Pending">Pending</option>
                          <option value="Overdue">Overdue</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td style={{ fontSize: 12, color: inv.status === "Overdue" ? "#dc2626" : "#64748b", fontWeight: 500 }}>
                        {new Date(inv.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td style={{ fontSize: 12, color: "#64748b" }}>{inv.paymentMode}</td>
                      <td>
                        <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                          <Button variant="ghost" size="sm" isIconOnly onPress={() => setViewInvoice(inv)}>
                            <Eye size={14} />
                          </Button>
                          <Button variant="ghost" size="sm" isIconOnly onPress={() => { setEditInvoice(inv); setFormOpen(true); }}>
                            <Pencil size={14} />
                          </Button>
                          <Button variant="ghost" size="sm" isIconOnly onPress={() => setDeleteId(inv._id)}>
                            <Trash2 size={14} color="#ef4444" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="card-list">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="mobile-card">
                <div className="skeleton" style={{ height: 16, width: "55%", marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 13, width: "75%", marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 13, width: "40%" }} />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <FileText size={36} color="#cbd5e1" />
              <p style={{ marginTop: 10, color: "#94a3b8", fontSize: 13 }}>No invoices found</p>
            </div>
          ) : (
            filtered.map(inv => (
              <div key={inv._id} className={`mobile-card ${inv.status === "Overdue" ? "overdue-card" : ""}`}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <p style={{ fontWeight: 700, color: "#3b82f6", fontSize: 12, marginBottom: 2 }}>{inv.invoiceNumber}</p>
                    <p style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>{inv.customerName}</p>
                    {inv.institution && <p style={{ fontSize: 11, color: "#94a3b8" }}>{inv.institution}</p>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: 900, fontSize: 16, color: "#0f172a" }}>₹{inv.amount.toLocaleString()}</p>
                    <StatusBadge status={inv.status} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, fontSize: 11, color: "#94a3b8", marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    {new Date(inv.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                    {inv.paymentMode}
                  </span>
                  {inv.mobile && <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    {inv.mobile}
                  </span>}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Button variant="outline" size="sm" onPress={() => setViewInvoice(inv)} style={{ flex: 1 }}>View</Button>
                  <button className="card-whatsapp-btn" onClick={() => shareOnWhatsApp(inv)}>
                    <Share2 size={11} /> Share
                  </button>
                  <Button variant="outline" size="sm" onPress={() => { setEditInvoice(inv); setFormOpen(true); }} style={{ flex: 1 }}>Edit</Button>
                  <Button variant="danger" size="sm" onPress={() => setDeleteId(inv._id)} style={{ flex: 1 }}>Delete</Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {viewInvoice && (
        <InvoiceViewModal
          invoice={viewInvoice}
          onClose={() => setViewInvoice(null)}
          onEdit={() => { setViewInvoice(null); setEditInvoice(viewInvoice); setFormOpen(true); }}
          onStatusChange={async (id, status) => { await handleStatusChange(id, status); setViewInvoice(null); }}
        />
      )}
      {formOpen && (
        <InvoiceForm
          isOpen={formOpen}
          onClose={() => { setFormOpen(false); setEditInvoice(null); }}
          onInvoiceCreated={handleSave}
          existingInvoice={editInvoice}
        />
      )}
      <ConfirmModal isOpen={!!deleteId} onConfirm={() => deleteId && handleDelete(deleteId)} onCancel={() => setDeleteId(null)} />
    </>
  );
}

// ─── Main BillingDashboard ─────────────────────────────────────
export default function BillingDashboard() {
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => { fetchInvoices(); }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/invoices");
      setInvoices(await res.json());
    } catch { toast("Failed to load invoices", "error"); }
    finally { setLoading(false); }
  };

  const handleCreateSave = async (formData: any) => {
    try {
      const res = await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (res.ok) { toast("Invoice created!", "success"); setCreateOpen(false); fetchInvoices(); }
      else toast("Failed to create invoice", "error");
    } catch { toast("Failed to create invoice", "error"); }
  };

  const pendingCount = invoices.filter(i => i.status === "Pending" || i.status === "Overdue").length;

  const tabTitles: Record<string, string> = {
    dashboard: "Dashboard", invoices: "Invoices", customers: "Customers",
    inventory: "Inventory", analytics: "Analytics", payments: "Payments", export: "Export Data",
  };

  return (
    <div className="app-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingCount={pendingCount}
      />

      <div className="main-content">
        {/* Top bar */}
        <div className="page-header no-print">
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center", padding: 4, borderRadius: 6, flexShrink: 0 }}
            aria-label="Menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontWeight: 800, fontSize: 16, color: "#0f172a", margin: 0 }} className="page-title">{tabTitles[activeTab]}</h1>
            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }} className="page-date">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <Button variant="primary" size="sm" onPress={() => { setCreateOpen(true); }}>
            <Plus size={14} />
            <span className="hide-xs">New Invoice</span>
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === "dashboard" && <DashboardTab invoices={invoices} onCreateNew={() => { setActiveTab("invoices"); setCreateOpen(true); }} />}
        {activeTab === "invoices"  && <InvoicesTab invoices={invoices} onRefresh={fetchInvoices} onCreateNew={() => setCreateOpen(true)} loading={loading} />}
        {activeTab === "customers" && <CustomersTab invoices={invoices} />}
        {activeTab === "inventory" && <InventoryTab invoices={invoices} />}
        {activeTab === "analytics" && <AnalyticsTab invoices={invoices} />}
        {activeTab === "payments"  && <PaymentsTab invoices={invoices} />}
        {activeTab === "export"    && <ExportTab invoices={invoices} />}
      </div>

      {/* Quick create form from header button */}
      {createOpen && (
        <InvoiceForm
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          onInvoiceCreated={handleCreateSave}
          existingInvoice={null}
        />
      )}
    </div>
  );
}
