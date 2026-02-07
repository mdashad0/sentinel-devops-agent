"use client";

import { AlertTriangle, CheckCircle, Info, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActivityItem {
    id: number;
    message: string;
    type: 'alert' | 'info' | 'action';
    severity: 'critical' | 'warning' | 'info';
    timestamp: string;
}

interface AlertFeedProps {
    activities: ActivityItem[];
}

export function AlertFeed({ activities }: AlertFeedProps) {
    if (!activities || activities.length === 0) {
        return (
            <div className="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity deployed.</p>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Live Activity Feed
                </h3>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                {activities.map((item) => (
                    <div
                        key={item.id}
                        className={cn(
                            "flex gap-3 p-3 rounded-lg border text-sm transition-all animate-in slide-in-from-left-2 duration-300",
                            item.severity === 'critical' ? "bg-red-500/10 border-red-500/20 text-red-100" :
                                item.severity === 'warning' ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-100" :
                                    "bg-muted/50 border-border text-foreground"
                        )}
                    >
                        <div className="mt-0.5 shrink-0">
                            {item.severity === 'critical' ? <AlertTriangle className="h-4 w-4 text-red-500" /> :
                                item.severity === 'warning' ? <AlertTriangle className="h-4 w-4 text-yellow-500" /> :
                                    item.type === 'action' ? <CheckCircle className="h-4 w-4 text-green-500" /> :
                                        <Info className="h-4 w-4 text-blue-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="leading-relaxed break-words">{item.message}</p>
                            <p className="text-[10px] opacity-60 mt-1 font-mono">
                                {new Date(item.timestamp).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
