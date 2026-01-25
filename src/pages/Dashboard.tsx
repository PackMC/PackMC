import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const navigate = useNavigate();

    const [userEmail, setUserEmail] = useState<string | null>(null);

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

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/auth"); // redirect to login page
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome to your Dashboard!</h1>
        <p className="mb-6">Logged in as: {userEmail}</p>
        <Button onClick={handleLogout}>Logout</Button>
        </div>
    );
}
