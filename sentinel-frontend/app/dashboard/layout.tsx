'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {


    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <Sidebar />
            <div className="flex-1 flex flex-col lg:pl-[280px] transition-all duration-300">
                <DashboardHeader />
                <main className="flex-1 p-4 lg:p-6 overflow-y-auto pt-16 lg:pt-6">
                    {children}
                </main>
            </div>

        </div>
    );
}
