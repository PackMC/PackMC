
import { Button } from '@/components/ui/button';
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

export default function Navbar({ ButtonText, ButtonAction, RootText, RootLink, NavigateText }: { ButtonText?: ReactNode, ButtonAction?: string | (() => void), RootText?: string, RootLink?: string, NavigateText?: string }) {
    const navigate = useNavigate();

    return (
        <div className="w-full h-16 px-4 flex items-center justify-between drop-shadow-xl drop-shadow-text-primary/10 bg-background">
            <span className="font-bold text-xl text-text-primary" onClick={() => navigate(RootLink || "/")}>
                {RootText}
            </span>
            <div className="flex items-center gap-6">
                <span className="text-text-muted-secondary">
                    {NavigateText}
                </span>
                <Button variant="default" size="lg" onClick={typeof ButtonAction === "function" ? ButtonAction : () => navigate(ButtonAction as string)} className=" bg-button-primary text-button-text-primary h-9 hover:bg-button-primary-hover cursor-pointer">
                    {ButtonText}
                </Button>
            </div>
        </div>
    );
}