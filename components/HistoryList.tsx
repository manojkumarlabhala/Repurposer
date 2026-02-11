"use client";

import { useState, useEffect } from "react";
import { History, Clock, Trash2, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetDescription,
} from "@/components/ui/sheet";
import type { HistoryItem } from "@/types";

interface HistoryListProps {
    onSelect: (item: HistoryItem) => void;
    currentHistory: HistoryItem[];
    onClearHistory: () => void;
    onDeleteItem: (id: string) => void;
    className?: string;
}

export function HistoryList({ onSelect, currentHistory, onClearHistory, onDeleteItem, className }: HistoryListProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
        }).format(date);
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                        "rounded-full h-10 w-10 bg-background/80 backdrop-blur-md border border-white/10 shadow-lg hover:bg-accent",
                        className
                    )}
                >
                    <History className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-background/95 backdrop-blur-xl border-r border-white/10">
                <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center justify-between text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400">
                        <span className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-indigo-400" />
                            History
                        </span>
                        {currentHistory.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClearHistory}
                                className="text-muted-foreground hover:text-red-400 h-8 px-2 text-xs"
                            >
                                Clear All
                            </Button>
                        )}
                    </SheetTitle>
                </SheetHeader>

                <SheetDescription className="sr-only">
                    View and restore your previously generated content.
                </SheetDescription>

                <ScrollArea className="h-[calc(100vh-120px)] pr-4">
                    {currentHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm text-center">
                            <History className="h-8 w-8 mb-2 opacity-20" />
                            <p>No history yet.</p>
                            <p className="text-xs opacity-60">Generate content to see it here.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {currentHistory.map((item) => (
                                <div
                                    key={item.id}
                                    className="group relative rounded-lg border border-white/5 bg-white/5 p-4 hover:bg-white/10 transition-all duration-200 cursor-pointer"
                                    onClick={() => {
                                        onSelect(item);
                                        setIsOpen(false);
                                    }}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-medium text-sm line-clamp-1 text-foreground/90 pr-6">
                                            {item.originalTitle || item.url}
                                        </h4>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteItem(item.id);
                                            }}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                        <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                                            {item.requestData.audience}
                                        </span>
                                        <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                                            {item.requestData.tone}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground/60">
                                        <span>{formatDate(item.date)}</span>
                                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
