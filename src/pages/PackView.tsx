import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

import Navbar from "@/components/ui/navbar";
import TextureCards from "@/components/ui/texturecards/TextureCards";

import textures from "@/data/minecraft_textures_index.json";

import {
  HomeIcon,
} from "@/components/icons";

export default function PackView() {
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
        <section className="fixed top-0 left-0 w-full h-screen bg-background flex flex-col">
            <Navbar ButtonText="Export Pack" RootText="Dashboard" RootLink="/dashboard" RootIcon={<HomeIcon size={18}/>} userEmail={userEmail} />
            <div className="w-full flex-1 overflow-hidden p-4 pt-8">
                <TextureCards textures={textures} />
            </div>
        </section>
    );
}
