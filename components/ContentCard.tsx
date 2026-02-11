"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/CopyButton";

interface ContentCardProps {
    title: string;
    content: string;
    badge?: string;
    showCharCount?: boolean;
    maxChars?: number;
}

export function ContentCard({
    title,
    content,
    badge,
    showCharCount = false,
    maxChars,
}: ContentCardProps) {
    const charCount = content.length;
    const isOverLimit = maxChars ? charCount > maxChars : false;

    return (
        <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-semibold">{title}</CardTitle>
                        {badge && (
                            <Badge variant="secondary" className="text-[10px] px-2 py-0">
                                {badge}
                            </Badge>
                        )}
                    </div>
                    <CopyButton text={content} label={title} />
                </div>
                {showCharCount && (
                    <div className="flex items-center gap-2 mt-1">
                        <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${isOverLimit
                                        ? "bg-red-500"
                                        : charCount > (maxChars || 160) * 0.8
                                            ? "bg-yellow-500"
                                            : "bg-green-500"
                                    }`}
                                style={{
                                    width: `${Math.min((charCount / (maxChars || 160)) * 100, 100)}%`,
                                }}
                            />
                        </div>
                        <span
                            className={`text-xs font-mono ${isOverLimit ? "text-red-500" : "text-muted-foreground"
                                }`}
                        >
                            {charCount}/{maxChars || 160}
                        </span>
                    </div>
                )}
            </CardHeader>
            <CardContent className="relative">
                <div className="rounded-lg bg-muted/30 p-4 text-sm leading-relaxed whitespace-pre-wrap break-words font-normal text-foreground/90">
                    {content}
                </div>
            </CardContent>
        </Card>
    );
}
