import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  SunMediumIcon as Sun,
  MoonIcon as Moon
} from "@/components/icons";

export default function Layout() {
  const [dark, setDark] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === "/";

  const toggle = () => {
    document.documentElement.classList.toggle("dark");
    setDark(!dark);
  };

  return (
    <section className="h-screen overflow-y-scroll
      [&::-webkit-scrollbar]:w-1
      [&::-webkit-scrollbar-thumb]:rounded-full
      [&::-webkit-scrollbar-track]:bg-transparent
      [&::-webkit-scrollbar-track]:rounded-full
      scrollbar-thin
      scrollbar-thumb-rounded-full
      scrollbar-track-transparent
      scrollbar-track-rounded-full
      dark:[&::-webkit-scrollbar-thumb]:bg-gradient-to-b
      dark:[&::-webkit-scrollbar-thumb]:from-primary
      dark:[&::-webkit-scrollbar-thumb]:to-primary/40
      dark:scrollbar-thumb-gradient-to-b
      dark:scrollbar-thumb-from-primary
      dark:scrollbar-thumb-to-primary/40
      [&::-webkit-scrollbar-thumb]:bg-gradient-to-b
      [&::-webkit-scrollbar-thumb]:from-neutral-600
      [&::-webkit-scrollbar-thumb]:to-neutral-400/40
      scrollbar-thumb-gradient-to-b
      scrollbar-thumb-from-primary
      scrollbar-thumb-to-primary/40
    ">

        {isLanding && (
            <div className="fixed bottom-5 right-5 z-50 opacity-40 hover:opacity-100 transition backdrop-blur-sm bg-black/20 rounded-full">
            <Button variant="ghost" size="icon" onClick={toggle}>
                {dark ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            </div>
        )}

        <Outlet />
        <SpeedInsights />
        <Analytics />

        <footer className="text-gray-400 py-6 mt-12">
        <div className="bottom-0 left-0 w-full flex justify-center items-center space-y-4 flex-col">
            <p className="text-sm">
            PackMC © {new Date().getFullYear()}. All rights reserved.
            </p>
        </div>
        </footer>
    </section>
  );
}
