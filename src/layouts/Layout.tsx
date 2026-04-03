import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { Outlet, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  SunMediumIcon as Sun,
  MoonIcon as Moon
} from "@/components/icons";

export default function Layout() {
  const location = useLocation();
  const isLanding = location.pathname === "/" || location.pathname === "/auth";
  const isEditor = location.pathname === "/editor";

  return (
    <section>
        <Outlet />
        <SpeedInsights />
        <Analytics />
    </section>
  );
}
