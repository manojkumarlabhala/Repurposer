"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Globe, Brain, Sparkles } from "lucide-react";

interface LoaderProps {
    stage: "extracting" | "generating" | "idle";
}

const stages = [
    {
        key: "extracting",
        label: "Extracting blog content",
        sublabel: "Fetching and parsing the article...",
        icon: Globe,
    },
    {
        key: "generating",
        label: "Generating content with AI",
        sublabel: "Creating platform-optimized versions...",
        icon: Brain,
    },
    {
        key: "done",
        label: "Almost there!",
        sublabel: "Finalizing your content...",
        icon: Sparkles,
    },
];

export function ContentLoader({ stage }: LoaderProps) {
    const currentIndex = stage === "extracting" ? 0 : stage === "generating" ? 1 : 0;

    return (
        <div className="w-full max-w-3xl mx-auto space-y-8 animate-fade-in">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mb-6">
                {stages.map((s, i) => {
                    const Icon = s.icon;
                    const isActive = i === currentIndex;
                    const isComplete = i < currentIndex;

                    return (
                        <div key={s.key} className="flex items-center gap-2">
                            <div
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-500 ${isActive
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                                        : isComplete
                                            ? "bg-primary/20 text-primary"
                                            : "bg-muted text-muted-foreground"
                                    }`}
                            >
                                {isActive ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Icon className="h-4 w-4" />
                                )}
                                <span className="hidden sm:inline">{s.label}</span>
                            </div>
                            {i < stages.length - 1 && (
                                <div
                                    className={`w-8 h-0.5 rounded-full transition-colors duration-500 ${isComplete ? "bg-primary" : "bg-muted"
                                        }`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Animated sublabel */}
            <p className="text-center text-sm text-muted-foreground animate-pulse">
                {stages[currentIndex].sublabel}
            </p>

            {/* Skeleton Cards */}
            <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 space-y-3"
                        style={{ animationDelay: `${i * 150}ms` }}
                    >
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-8 w-16 rounded-md" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/6" />
                    </div>
                ))}
            </div>
        </div>
    );
}
