import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import Navbar from "@/components/ui/navbar";
import PackCard from "@/components/ui/packcard";
import { Plus } from "lucide-react";

export default function App() {
    const navigate = useNavigate();

    const [packs, setPacks] = useState<any[]>([]);
    const [newPackName, setNewPackName] = useState("");
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("packmc_packs") || "[]");
        setPacks(stored);
    }, []);

    function createPack() {
        if (!newPackName.trim()) return;
        const id = crypto.randomUUID();
        const updatedPacks = [...packs, { id, name: newPackName.trim(), edited: new Date().toISOString() }];
        localStorage.setItem("packmc_packs", JSON.stringify(updatedPacks));
        setPacks(updatedPacks);
        setNewPackName("");
        setCreating(false);
        navigate(`/pack/${id}`);
    }

    function timeAgo(isoString: string) {
        const now = new Date();
        const edited = new Date(isoString);
        const diffInSeconds = Math.floor((now.getTime() - edited.getTime()) / 1000);

        let timeAgo = "";
        if (diffInSeconds < 60) {
            timeAgo = `${diffInSeconds} seconds ago`;
        } else if (diffInSeconds < 3600) {
            timeAgo = `${Math.floor(diffInSeconds / 60)} minutes ago`;
        } else if (diffInSeconds < 86400) {
            timeAgo = `${Math.floor(diffInSeconds / 3600)} hours ago`;
        } else if (diffInSeconds < 2592000) {
            timeAgo = `${Math.floor(diffInSeconds / 86400)} days ago`;
        } else if (diffInSeconds < 31536000) {
            timeAgo = `${Math.floor(diffInSeconds / 2592000)} months ago`;
        } else {
            timeAgo = `${Math.floor(diffInSeconds / 31536000)} years ago`;
        }

        return timeAgo;
    }

    return (
        <section className="fixed top-0 left-0 w-full h-screen bg-background flex flex-col">
            <Navbar
                ButtonText={<><Plus /> Create New Pack</>}
                ButtonAction={() => setCreating(true)}
                RootText="PackMC"
                RootLink="/app"
            />
            <div className="m-14">
                <div className="mb-12">
                    <span className="text-7xl font-bold text-text-primary-secondary drop-shadow-[0_0_8px_rgba(204,151,255,0.2)]">
                        Projects
                    </span>
                </div>
                <div>
                    {packs.length === 0 ? (
                        <div className="w-full h-48 rounded-md border-2 border-dashed border-neutral-800 flex items-center justify-center">
                            <span className="text-sm text-neutral-500">No packs yet. Create your first one!</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-38">
                            {packs.map((pack) => (
                                <PackCard
                                    key={pack.id}
                                    id={pack.id}
                                    name={pack.name}
                                    edited={timeAgo(pack.edited)}
                                    assets={pack.assets || 0}
                                    onDelete={() => {
                                        const updatedPacks = packs.filter((p) => p.id !== pack.id);
                                        setPacks(updatedPacks);
                                        localStorage.setItem("packmc_packs", JSON.stringify(updatedPacks));
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Dialog open={creating} onOpenChange={(v) => {setCreating(v); if (!v) setNewPackName("")}}>
                <DialogContent className=
                    "bg-card rounded-lg shadow-md border border-outlined-button-stroke/30"
                    showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle className="text-text-primary-secondary">Create New Pack</DialogTitle>
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
                        className="w-full px-4 py-2 border border-outlined-button-stroke bg-input-background rounded-md text-text-muted-secondary focus:outline-none focus:ring-2 focus:ring-button-primary focus:border-transparent"
                    />
                    <DialogFooter>
                        <Button onClick={() => setCreating(false)} className="bg-outlined-button-background text-outlined-button-text border border-outlined-button-stroke/30 hover:bg-outlined-button-background-hover h-9">
                            Cancel
                        </Button>
                        <Button onClick={createPack} className="bg-button-primary text-button-text-primary h-9 hover:bg-button-primary-hover cursor-pointer">
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </section>
    );
}