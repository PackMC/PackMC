import Login02 from "@/components/login/login-02";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Auth() {
    const navigate = useNavigate();

    useEffect(() => {
        // Get the logged-in user
        supabase.auth.getSession().then(({ data }) => {
            if (data.session?.user?.email) {
                navigate("/dashboard");
            }
        });
    }, [navigate]);

    return (
        <section className="fixed bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-background">
            <Login02 />
        </section>
    );
}
