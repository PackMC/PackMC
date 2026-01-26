import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";


import {
    HomeIcon
} from "@/components/icons";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

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
        <section>
                <div className="fixed top-4 left-4 right-4 bg-secondary/50 p-4 rounded-md flex items-center">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <HomeIcon size={16} />
                                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="ml-auto">
                        <Button size="sm">Export</Button>
                    </div>
                </div>
                <div className="min-h-screen flex flex-col items-center justify-center p-6">
                <h1 className="text-2xl font-bold mb-4">Welcome to your Dashboard!</h1>
                <p className="mb-6">Logged in as: {userEmail}</p>
                <Button onClick={handleLogout}>Logout</Button>
            </div>
        </section>
    );
}
