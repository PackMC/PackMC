import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    SunMediumIcon as Sun,
    MoonIcon as Moon
} from "@/components/icons";

export default function Layout() {
    const [dark, setDark] = useState(false);

    const toggle = () => {
        document.documentElement.classList.toggle("dark");
        setDark(!dark);
    };

  return (
    <>
        <footer className="text-gray-600 py-6 mt-12">
            <div className="fixed bottom-0 left-0 w-full flex justify-center items-center space-y-4 flex-col">
                {/* Left: Copyright */}
                <p className="text-sm">
                PackMC © {(new Date().getFullYear())}. All rights reserved.
                </p>
            </div>
        </footer>
        <header className="fixed top-0 left-0 w-full flex justify-end items-center p-4 z-10">
            <Button variant="ghost" onClick={toggle}>
                {dark ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
        </header>
        <Outlet />   {/* renders the current page */}
        <SpeedInsights />
        <Analytics />
    </>
  );
}
