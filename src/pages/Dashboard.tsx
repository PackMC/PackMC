import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { HomeIcon } from "@/components/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import Navbar from "@/components/ui/navbar";

export default function Dashboard() {
    const navigate = useNavigate();

    const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
    const [packs, setPacks] = useState<any[]>([]);
    const [newPackName, setNewPackName] = useState("");
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        // Get the logged-in user
        supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user?.email) {
            setUserEmail(data.session.user.email);
        } else {
            navigate("/auth");
        }
        });
        const stored = JSON.parse(localStorage.getItem("packmc_packs") || "[]");
        setPacks(stored);
    }, []);

    function createPack() {
        if (!newPackName.trim()) return;
        const id = crypto.randomUUID();
        const updatedPacks = [...packs, { id, name: newPackName.trim() }];
        localStorage.setItem("packmc_packs", JSON.stringify(updatedPacks));
        setPacks(updatedPacks);
        setNewPackName("");
        setCreating(false);
        navigate(`/pack/${id}`);
    }

    return (
        <section className="fixed top-0 left-0 w-full h-screen bg-background flex flex-col">
            <Navbar
                ButtonText="New Pack"
                ButtonAction={() => setCreating(true)}
                ButtonActionType="function"
                RootText="Dashboard"
                RootLink="/dashboard"
                RootIcon={<HomeIcon size={18}/>}
                userEmail={userEmail}
            />

            <div className="flex-1 overflow-y-auto p-6">
                {packs.length === 0 ? (
                    <p className="text-center text-zinc-400 mt-12">No packs yet. Click "New Pack" to create one!</p>
                ) : (
                    <div className="grid gap-0"
                        style={{
                            gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))`
                        }}>
                        {packs.map(pack => (
                            <div
                                key={pack.id}
                                onClick={() => navigate(`/pack/${pack.id}`)}
                                className="p-4 bg-neutral-900 border-2 border-zinc-800 rounded-md cursor-pointer hover:transform hover:scale-[1.02] transition-transform"
                            >
                                <h2 className="text-lg font-semibold">{pack.name}</h2>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Dialog open={creating} onOpenChange={(v) => {setCreating(v); if (!v) setNewPackName("")}}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Pack</DialogTitle>
                    </DialogHeader>
                    <input
                        autoFocus
                        type="text"
                        value={newPackName}
                        onChange={(e) => setNewPackName(e.target.value)}
                        placeholder="Pack Name..."
                        onKeyDown={(e) => {
                            if (e.key === "Enter") createPack();
                            if (e.key === "Escape") setCreating(false)
                        }}
                        className="p-2 rounded-md bg-neutral-900 border-2 border-zinc-800 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-primary w-full mb-4"
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreating(false)}>
                            Cancel
                        </Button>
                        <Button onClick={createPack}>
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </section>
    );
}