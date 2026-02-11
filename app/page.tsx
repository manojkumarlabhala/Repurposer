"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, Zap, AlertCircle, RotateCcw } from "lucide-react";
import { UrlForm } from "@/components/UrlForm";
import { ResultSection } from "@/components/ResultSection";
import { ContentLoader } from "@/components/Loader";
import { HistoryList } from "@/components/HistoryList";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import type { RepurposedContent, ToneOption, LengthOption, PlatformOption, ApiResponse, AudienceOption, HistoryItem } from "@/types";

const LOCAL_STORAGE_KEY = "repurposer_last_output";
const HISTORY_STORAGE_KEY = "repurposer_history";

async function repurposeContent(params: {
    url: string;
    tone: ToneOption;
    length: LengthOption;
    platforms: PlatformOption[];
    audience: AudienceOption;
}): Promise<RepurposedContent> {
    const response = await fetch("/api/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
    });

    const data: ApiResponse = await response.json();

    if (!data.success) {
        throw new Error(data.error || "Something went wrong");
    }

    return data.data;
}

export default function HomePage() {
    const [result, setResult] = useState<RepurposedContent | null>(null);
    const [stage, setStage] = useState<"idle" | "extracting" | "generating">("idle");
    const [lastUrl, setLastUrl] = useState<string>("");
    const [lastTone, setLastTone] = useState<ToneOption>("professional");
    const [lastAudience, setLastAudience] = useState<AudienceOption>("general");
    const [lastLength, setLastLength] = useState<LengthOption>("medium");
    const [lastPlatforms, setLastPlatforms] = useState<PlatformOption[]>(["linkedin", "twitter", "seo", "youtube"]);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const { toast } = useToast();

    const mutation = useMutation({
        mutationFn: repurposeContent,
        onMutate: () => {
            setStage("extracting");
            setResult(null);
            // Transition to "generating" stage after a few seconds
            setTimeout(() => setStage("generating"), 3000);
        },
        onSuccess: (data) => {
            setResult(data);
            saveToLocalStorage(data, lastUrl);
            addToHistory(data, lastUrl, lastTone, lastLength, lastPlatforms, lastAudience);
            toast({
                title: "Content generated!",
                description: "Your blog has been repurposed into platform-native content",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
        onSettled: () => {
            setStage("idle");
        },
    });

    // Load last output and history from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.data) {
                    setResult(parsed.data);
                    setLastUrl(parsed.url || "");
                }
            }

            const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }
        } catch {
            // Ignore localStorage errors
        }
    }, []);

    const saveToLocalStorage = useCallback(
        (data: RepurposedContent, url: string) => {
            try {
                localStorage.setItem(
                    LOCAL_STORAGE_KEY,
                    JSON.stringify({ data, url, timestamp: Date.now() })
                );
            } catch {
                // Ignore
            }
        },
        []
    );

    const addToHistory = (
        data: RepurposedContent,
        url: string,
        tone: ToneOption,
        length: LengthOption,
        platforms: PlatformOption[],
        audience: AudienceOption
    ) => {
        const newItem: HistoryItem = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            url,
            originalTitle: data.youtube?.title || url, // Fallback if no title
            repurposedContent: data,
            requestData: { url, tone, length, platforms, audience },
        };

        const newHistory = [newItem, ...history].slice(0, 50); // Keep last 50
        setHistory(newHistory);
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem(HISTORY_STORAGE_KEY);
    };

    const deleteHistoryItem = (id: string) => {
        const newHistory = history.filter((item) => item.id !== id);
        setHistory(newHistory);
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
    };

    const restoreHistoryItem = (item: HistoryItem) => {
        setResult(item.repurposedContent);
        setLastUrl(item.url);
        setLastTone(item.requestData.tone);
        setLastLength(item.requestData.length);
        setLastPlatforms(item.requestData.platforms || []);
        setLastAudience(item.requestData.audience);
        toast({
            title: "History Restored",
            description: "Loaded content from history",
        });
    };

    const handleSubmit = (url: string, tone: ToneOption, length: LengthOption, platforms: PlatformOption[], audience: AudienceOption) => {
        setLastUrl(url);
        setLastTone(tone);
        setLastLength(length);
        setLastPlatforms(platforms);
        setLastAudience(audience);
        mutation.mutate({ url, tone, length, platforms, audience });
    };

    const handleRegenerate = () => {
        if (lastUrl) {
            mutation.mutate({ url: lastUrl, tone: lastTone, length: lastLength, platforms: lastPlatforms, audience: lastAudience });
        }
    };

    return (
        <div className="min-h-screen gradient-mesh">
            {/* Decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500/10 rounded-full blur-[128px] animate-float" />
                <div
                    className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-[128px] animate-float"
                    style={{ animationDelay: "3s" }}
                />
            </div>

            <div className="relative z-10">


                {/* Header */}
                {/* App Controls / Toolbar */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs text-green-500 font-medium">AI Online</span>
                        </div>
                    </div>

                    <HistoryList
                        currentHistory={history}
                        onSelect={restoreHistoryItem}
                        onClearHistory={clearHistory}
                        onDeleteItem={deleteHistoryItem}
                    />
                </div>

                {/* Main Content */}
                <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Hero Section */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                            <Sparkles className="h-4 w-4" />
                            AI-Powered Content Engine
                        </div>
                        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
                            <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                                Transform Any Blog Into
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                                Social Media Gold
                            </span>
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                            Paste a blog URL and get LinkedIn posts, Twitter hooks, SEO descriptions,
                            and YouTube content — all customized to your preferred tone.
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="max-w-2xl mx-auto mb-16">
                        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 sm:p-8 shadow-xl shadow-black/5">
                            <UrlForm onSubmit={handleSubmit} isLoading={mutation.isPending} />
                        </div>
                    </div>

                    {/* Error Display */}
                    {mutation.isError && !mutation.isPending && (
                        <div className="max-w-2xl mx-auto mb-8 animate-fade-in">
                            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6 flex items-start gap-4">
                                <div className="rounded-full bg-red-500/10 p-2 mt-0.5">
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-red-500 mb-1">Something went wrong</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {mutation.error?.message || "An unexpected error occurred"}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRegenerate}
                                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                >
                                    <RotateCcw className="h-4 w-4 mr-1" />
                                    Retry
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {mutation.isPending && (
                        <ContentLoader stage={stage === "idle" ? "extracting" : stage} />
                    )}

                    {/* Results */}
                    {result && !mutation.isPending && (
                        <div className="space-y-6">
                            <ResultSection data={result} />

                            {/* Regenerate Button */}
                            <div className="flex justify-center pt-4">
                                <Button
                                    onClick={handleRegenerate}
                                    variant="outline"
                                    className="gap-2 border-primary/30 hover:bg-primary/10"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    Regenerate Content
                                </Button>
                            </div>
                        </div>
                    )}
                </main>


            </div>
        </div>
    );
}
