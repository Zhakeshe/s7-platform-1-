"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LogOut, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Profile {
    name: string;
    email: string;
    avatar: string;
    xp?: number;
}

interface MenuItem {
    label: string;
    value?: string;
    href: string;
    icon: React.ReactNode;
    external?: boolean;
}

const SAMPLE_PROFILE_DATA: Profile = {
    name: "Пользователь",
    email: "user@example.com",
    avatar: "/logo-s7.png",
    xp: 0,
};

interface ProfileDropdownProps extends React.HTMLAttributes<HTMLDivElement> {
    data?: Profile;
    onLogout?: () => void;
}

export default function ProfileDropdown({
    data = SAMPLE_PROFILE_DATA,
    onLogout,
    className,
    ...props
}: ProfileDropdownProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const menuItems: MenuItem[] = [
        {
            label: "Профиль",
            href: "/profile",
            icon: <User className="w-4 h-4" />,
        },
    ];

    return (
        <div className={cn("relative", className)} {...props}>
            <DropdownMenu onOpenChange={setIsOpen}>
                <div className="group relative">
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="flex items-center gap-4 p-3 rounded-2xl bg-[#16161c] border border-[#2a2a35] hover:bg-[#1b1b22] transition-all duration-200 focus:outline-none text-white"
                        >
                            <div className="text-left flex-1">
                                <div className="text-sm font-medium tracking-tight leading-tight">
                                    {data.name}
                                </div>
                                <div className="text-xs text-white/60 tracking-tight leading-tight">{data.email}</div>
                                {typeof data.xp === 'number' && (
                                  <div className="mt-1 text-[11px] text-[#00a3ff]">XP: {data.xp}</div>
                                )}
                            </div>
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full p-0.5 bg-[#2a2a35]">
                                  <div className="w-full h-full rounded-full overflow-hidden bg-[#0f0f14]">
                                    <Image src={data.avatar} alt={data.name} width={36} height={36} className="w-full h-full object-cover rounded-full" />
                                  </div>
                                </div>
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        sideOffset={4}
                        className="w-64 p-2 bg-[#16161c] border border-[#2a2a35] rounded-2xl shadow-lg text-white origin-top-right"
                    >
                        <div className="px-2 pb-2">
                          <div className="text-sm font-medium">{data.name}</div>
                          <div className="text-xs text-white/60">{data.email}</div>
                          {typeof data.xp === 'number' && (
                            <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-[#0f0f14] border border-[#2a2a35] px-2 py-0.5 text-[11px] text-[#00a3ff]">XP: {data.xp}</div>
                          )}
                        </div>
                        <div className="space-y-1">
                            {menuItems.map((item) => (
                                <DropdownMenuItem key={item.label} asChild>
                                    <Link
                                        href={item.href}
                                        className="flex items-center p-3 hover:bg-[#1b1b22] rounded-xl transition-all cursor-pointer border border-transparent"
                                    >
                                        <div className="flex items-center gap-2 flex-1">
                                            {item.icon}
                                            <span className="text-sm font-medium whitespace-nowrap">
                                                {item.label}
                                            </span>
                                        </div>
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </div>

                        <DropdownMenuSeparator className="my-3 bg-[#2a2a35]" />

                        <DropdownMenuItem asChild>
                            <button
                                type="button"
                                onClick={onLogout}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#1b1b22] cursor-pointer transition-colors"
                            >
                                <LogOut className="w-4 h-4 text-red-400" />
                                <span className="text-sm font-medium text-red-400">Выйти</span>
                            </button>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </div>
            </DropdownMenu>
        </div>
    );
}
