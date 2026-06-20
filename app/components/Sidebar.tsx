"use client";

import React from "react";
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  BarChart3,
  CreditCard,
  Download,
  X,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingCount: number;
}

const navItems = [
  { id: "dashboard", label: "Dashboard",  icon: LayoutDashboard },
  { id: "invoices",  label: "Invoices",   icon: FileText },
  { id: "customers", label: "Customers",  icon: Users },
  { id: "inventory", label: "Inventory",  icon: Package },
];

const reportItems = [
  { id: "analytics", label: "Analytics",    icon: BarChart3 },
  { id: "payments",  label: "Payments",     icon: CreditCard },
  { id: "export",    label: "Export Data",  icon: Download },
];

export default function Sidebar({ isOpen, onClose, activeTab, onTabChange, pendingCount }: SidebarProps) {
  const router = useRouter();
  const handleNav = (id: string) => {
    onTabChange(id);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Logo */}
        <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <FileText size={18} color="white" />
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: 14, color: "#0f172a", lineHeight: 1.2 }}>Aaradhya</p>
                <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>Fancy Dresses</p>
              </div>
            </div>
            {/* Close btn for mobile */}
            <button
              onClick={onClose}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#94a3b8", padding: 4, borderRadius: 6,
                display: "flex", alignItems: "center",
              }}
              className="lg-hidden"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 8px", marginBottom: 6 }}>
            Menu
          </p>

          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${activeTab === id ? "active" : ""}`}
              onClick={() => handleNav(id)}
            >
              <Icon size={16} />
              <span style={{ flex: 1 }}>{label}</span>
              {id === "invoices" && pendingCount > 0 && (
                <span style={{
                  background: "#ef4444", color: "white",
                  fontSize: 10, fontWeight: 700,
                  padding: "1px 6px", borderRadius: 999,
                  minWidth: 18, textAlign: "center",
                }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}

          <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", padding: "14px 8px 6px", marginTop: 6 }}>
            Reports
          </p>

          {reportItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${activeTab === id ? "active" : ""}`}
              onClick={() => handleNav(id)}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontSize: 13, fontWeight: 700, flexShrink: 0,
              }}>A</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>Admin</p>
                <p style={{ fontSize: 11, color: "#94a3b8" }}>Billing Manager</p>
              </div>
            </div>
            <button
              onClick={async () => {
                await authClient.signOut();
                router.push('/login');
              }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#ef4444", padding: 6, borderRadius: 6,
                display: "flex", alignItems: "center",
              }}
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
