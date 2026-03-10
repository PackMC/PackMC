import React from 'react';

import { Button } from '@/components/ui/button';

import {
    SunMediumIcon as SunIcon,
    MoonIcon as MoonIcon,
    LogoutIcon as LogOutIcon,
    UserIcon as UserIcon,
} from "@/components/icons";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,

  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from "react-router-dom";

export default function Navbar({ ButtonText, ButtonAction, ButtonActionType, RootText, RootLink, RootIcon, Path, userEmail }: { ButtonText?: string, ButtonAction?: string | (() => void), ButtonActionType?: "navigate" | "function", RootText?: string, RootLink?: string, RootIcon?: React.ReactNode, Path?: string, userEmail?: string}) {
    const [dark, setDark] = useState(false);
    const parts = Path?.split("/").filter(Boolean) ?? [];
    const username = userEmail?.split("@")[0] ?? "User";
    const navigate = useNavigate();

    const toggle = () => {
        document.documentElement.classList.toggle("dark");
        setDark(!dark);
    };
    
    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/auth"); // redirect to login page
    };

    return (
        <div className="sticky top-4 z-50 mx-4 bg-secondary/50 p-4 rounded-md flex items-center">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        {RootIcon}
                        <BreadcrumbLink href={RootLink}>{RootText}</BreadcrumbLink>
                    </BreadcrumbItem>

                    {parts.map((part) => {
                        return (
                            <BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbPage>{part}</BreadcrumbPage>
                            </BreadcrumbItem>
                        );
                    })}

                </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto flex items-center gap-2">
                <div className="opacity-70 hover:opacity-100 transition backdrop-blur-sm rounded-full">
                    <Button variant="ghost" className='cursor-pointer' size="icon" onClick={toggle}>
                        {dark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
                    </Button>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Button variant="ghost" className="cursor-pointer"  size="icon">
                            <UserIcon size={18} className='opacity-70 hover:opacity-100 transition backdrop-blur-sm rounded-full'/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>
                            {username}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator /> 
                        <DropdownMenuItem variant="destructive" className='cursor-pointer' onClick={handleLogout}>
                            <LogOutIcon />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <div>
                    <Button size="sm" className="cursor-pointer" onClick={() => {
                        if (ButtonActionType === "navigate") {
                            navigate(ButtonAction as string ?? "/");
                        } else if (ButtonActionType === "function") {
                            (ButtonAction as (() => void))();
                        } else {
                            navigate(ButtonAction as string ?? "/");
                        }}
                    }>{ButtonText}</Button>
                </div>
            </div>
        </div>
    );
}