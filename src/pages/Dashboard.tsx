import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

import Navbar from "@/components/ui/navbar";

import {
  HomeIcon,
} from "@/components/icons";

export default function Dashboard() {
    const navigate = useNavigate();

    const [userEmail, setUserEmail] = useState<string | undefined>(undefined);

    useEffect(() => {
        // Get the logged-in user
        supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user?.email) {
            setUserEmail(data.session.user.email);
        } else {
            navigate("/auth");
        }
        });
    }, []);

    return (
        <section>
            <Navbar ButtonText="Export Pack" RootText="Dashboard" RootLink="/dashboard" RootIcon={<HomeIcon size={18}/>} userEmail={userEmail} />
            <div className="min-h-screen flex flex-col items-center justify-center p-6">
                <h1 className="text-2xl font-bold mb-4">Welcome to your Dashboard!</h1>
            </div>
        </section>
    );
}
