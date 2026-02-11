"use client";

import { useState } from "react";
import { Link as LinkIcon, Sparkles, Zap, BarChart3, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { ToneOption, LengthOption, PlatformOption } from "@/types";

interface UrlFormProps {
    onSubmit: (url: string, tone: ToneOption, length: LengthOption, platforms: PlatformOption[]) => void;
    isLoading: boolean;
}

export function UrlForm({ onSubmit, isLoading }: UrlFormProps) {
    const [url, setUrl] = useState("");
    const [tone, setTone] = useState<ToneOption>("professional");
    const [length, setLength] = useState<LengthOption>("medium");
    const [platforms, setPlatforms] = useState<PlatformOption[]>(["linkedin", "twitter", "seo", "youtube"]);
    const [error, setError] = useState("");

    const handlePlatformToggle = (platform: PlatformOption) => {
        setPlatforms(current =>
            current.includes(platform)
                ? current.length > 1 ? current.filter(p => p !== platform) : current
                : [...current, platform]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!url.trim()) {
            setError("Please enter a blog URL");
            return;
        }

        let normalizedUrl = url.trim();
        if (!/^https?:\/\//i.test(normalizedUrl)) {
            normalizedUrl = "https://" + normalizedUrl;
        }

        try {
            new URL(normalizedUrl);
        } catch {
            setError("Please enter a valid URL");
            return;
        }

        const hostname = new URL(normalizedUrl).hostname.toLowerCase();
        if (
            hostname === "localhost" ||
            hostname === "127.0.0.1" ||
            hostname.startsWith("192.168.") ||
            hostname.startsWith("10.") ||
            hostname.startsWith("172.")
        ) {
            setError("Private or internal URLs are not allowed");
            return;
        }

        onSubmit(normalizedUrl, tone, length, platforms);
    };

    const toneIcons: Record<ToneOption, React.ReactNode> = {
        professional: <Sparkles className="h-4 w-4" />,
        bold: <Zap className="h-4 w-4" />,
        analytical: <BarChart3 className="h-4 w-4" />,
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* URL Input */}
            <div className="space-y-2">
                <Label htmlFor="url-input" className="text-sm font-medium text-foreground/90">
                    Blog URL
                </Label>
                <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="url-input"
                        type="text"
                        placeholder="https://example.com/blog-post"
                        value={url}
                        onChange={(e) => {
                            setUrl(e.target.value);
                            if (error) setError("");
                        }}
                        disabled={isLoading}
                        className="pl-10 h-12 text-base bg-background/90 backdrop-blur-sm border-border/60 focus:border-primary/50 focus:bg-background"
                    />
                </div>
                {error && (
                    <p className="text-sm text-red-500 flex items-center gap-1 animate-fade-in">
                        <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                        {error}
                    </p>
                )}
            </div>

            {/* Platform Selection */}
            <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground/90">Target Platforms</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(["linkedin", "twitter", "seo", "youtube"] as PlatformOption[]).map((platform) => (
                        <div
                            key={platform}
                            onClick={() => !isLoading && handlePlatformToggle(platform)}
                            className={`
                                cursor-pointer rounded-lg border p-3 flex items-center justify-between transition-all
                                ${platforms.includes(platform)
                                    ? "bg-primary/10 border-primary/50 text-foreground"
                                    : "bg-background/50 border-border/50 text-muted-foreground hover:bg-background/80"}
                                ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                            `}
                        >
                            <span className="capitalize font-medium">{platform === "seo" ? "SEO" : platform}</span>
                            {platforms.includes(platform) && (
                                <div className="h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                    <Check className="h-3 w-3" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Options Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground/90 flex items-center gap-2">
                        {toneIcons[tone]}
                        Tone
                    </Label>
                    <Select
                        value={tone}
                        onValueChange={(v) => setTone(v as ToneOption)}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="bg-background/90 backdrop-blur-sm border-border/60">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="bold">Bold & Provocative</SelectItem>
                            <SelectItem value="analytical">Analytical</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground/90">
                        Content Length
                    </Label>
                    <Select
                        value={length}
                        onValueChange={(v) => setLength(v as LengthOption)}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="bg-background/90 backdrop-blur-sm border-border/60">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="short">Short & Punchy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="long">Long & Detailed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 disabled:opacity-50 disabled:shadow-none"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Repurpose Content
                    </>
                )}
            </Button>
        </form>
    );
}
