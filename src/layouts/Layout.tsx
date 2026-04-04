import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <section>
        <Outlet />
        <SpeedInsights />
        <Analytics />
    </section>
  );
}
