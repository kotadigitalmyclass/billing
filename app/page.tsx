'use client';

import BillingDashboard from './components/BillingDashboard';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <BillingDashboard />
    </div>
  );
}
