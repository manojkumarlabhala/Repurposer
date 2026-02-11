"use client";

import { Linkedin, Twitter, Search, Youtube, Copy, Check, Download, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentCard } from "@/components/ContentCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import type { RepurposedContent } from "@/types";

interface ResultSectionProps {
    data: RepurposedContent;
}

export function ResultSection({ data }: ResultSectionProps) {
    const [copiedAll, setCopiedAll] = useState(false);
    const { toast } = useToast();

    // Determine available platforms
    const availablePlatforms = [];
    if (data.linkedin) availablePlatforms.push("linkedin");
    if (data.twitter_hooks) availablePlatforms.push("twitter");
    if (data.meta_description) availablePlatforms.push("seo");
    if (data.youtube) availablePlatforms.push("youtube");

    const defaultTab = availablePlatforms[0] || "linkedin";

    const formatRepurposedContent = (data: RepurposedContent, format: "markdown" | "text") => {
        let output = "";
        const timestamp = new Date().toLocaleString();

        if (format === "markdown") {
            output += `# Repurposed Content\n\nGenerated on: ${timestamp}\n\n---\n\n`;

            if (data.linkedin) {
                output += `## LinkedIn Posts\n\n### 📚 Educational\n${data.linkedin.educational}\n\n### 🔥 Contrarian\n${data.linkedin.controversial}\n\n### 💡 Personal Hook\n${data.linkedin.personal}\n\n---\n\n`;
            }

            if (data.twitter_hooks) {
                output += `## Twitter/X Hooks\n\n${data.twitter_hooks.map((hook, i) => `${i + 1}. ${hook}`).join("\n\n")}\n\n---\n\n`;
            }

            if (data.meta_description) {
                output += `## SEO Meta Description\n\n${data.meta_description}\n\n---\n\n`;
            }

            if (data.youtube) {
                output += `## YouTube Video Content\n\n**Title:** ${data.youtube.title}\n\n**Description:**\n${data.youtube.description}\n\n---\n\n`;
            }
        } else {
            output += `REPURPOSED CONTENT\nGenerated on: ${timestamp}\n\n`;

            if (data.linkedin) {
                output += `=== LINKEDIN POSTS ===\n\n[EDUCATIONAL]\n${data.linkedin.educational}\n\n[CONTRARIAN]\n${data.linkedin.controversial}\n\n[PERSONAL]\n${data.linkedin.personal}\n\n`;
            }

            if (data.twitter_hooks) {
                output += `=== TWITTER/X HOOKS ===\n\n${data.twitter_hooks.map((hook, i) => `${i + 1}. ${hook}`).join("\n\n")}\n\n`;
            }

            if (data.meta_description) {
                output += `=== SEO META DESCRIPTION ===\n${data.meta_description}\n\n`;
            }

            if (data.youtube) {
                output += `=== YOUTUBE VIDEO ===\n\nTITLE: ${data.youtube.title}\n\nDESCRIPTION:\n${data.youtube.description}\n\n`;
            }
        }

        return output.trim();
    };

    const copyAllContent = async () => {
        const markdown = formatRepurposedContent(data, "markdown");

        try {
            await navigator.clipboard.writeText(markdown);
            setCopiedAll(true);
            toast({
                title: "Copied as Markdown!",
                description: "All content has been formatted and copied to your clipboard.",
            });
            setTimeout(() => setCopiedAll(false), 2000);
        } catch (error) {
            toast({
                title: "Copy failed",
                description: "Please try copying individual sections",
                variant: "destructive",
            });
        }
    };

    const downloadContent = (format: "markdown" | "text") => {
        const content = formatRepurposedContent(data, format);
        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `repurposed-content-${new Date().toISOString().slice(0, 10)}.${format === "markdown" ? "md" : "txt"}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
            title: `Downloaded as ${format.toUpperCase()}`,
            description: `The file has been saved to your downloads folder.`,
        });
    };

    return (
        <div className="w-full space-y-6 animate-slide-up">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                        Generated Content
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Export all content or copy individual sections
                    </p>
                </div>
                {/* Export Buttons */}
                <div className="flex items-center gap-2">
                    <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50">
                        <Button
                            onClick={() => downloadContent("text")}
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-2 px-3 hover:bg-background"
                            title="Download as Text"
                        >
                            <FileText className="h-4 w-4" />
                            <span className="text-xs font-medium">TXT</span>
                        </Button>
                        <Button
                            onClick={() => downloadContent("markdown")}
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-2 px-3 hover:bg-background text-primary"
                            title="Download as Markdown"
                        >
                            <Download className="h-4 w-4" />
                            <span className="text-xs font-medium">MD</span>
                        </Button>
                    </div>
                    <Button
                        onClick={copyAllContent}
                        variant="outline"
                        size="sm"
                        className="h-10 gap-2 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all"
                    >
                        {copiedAll ? (
                            <Check className="h-4 w-4 text-green-500 animate-in zoom-in" />
                        ) : (
                            <Copy className="h-4 w-4" />
                        )}
                        <span className="font-semibold">{copiedAll ? "Copied!" : "Copy All (MD)"}</span>
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList
                    className="w-full h-12 bg-muted/50 backdrop-blur-sm grid"
                    style={{ gridTemplateColumns: `repeat(${availablePlatforms.length}, 1fr)` }}
                >
                    {data.linkedin && (
                        <TabsTrigger value="linkedin" className="gap-2 data-[state=active]:shadow-md">
                            <Linkedin className="h-4 w-4" />
                            <span className="hidden sm:inline">LinkedIn</span>
                        </TabsTrigger>
                    )}
                    {data.twitter_hooks && (
                        <TabsTrigger value="twitter" className="gap-2 data-[state=active]:shadow-md">
                            <Twitter className="h-4 w-4" />
                            <span className="hidden sm:inline">Twitter</span>
                        </TabsTrigger>
                    )}
                    {data.meta_description && (
                        <TabsTrigger value="seo" className="gap-2 data-[state=active]:shadow-md">
                            <Search className="h-4 w-4" />
                            <span className="hidden sm:inline">SEO</span>
                        </TabsTrigger>
                    )}
                    {data.youtube && (
                        <TabsTrigger value="youtube" className="gap-2 data-[state=active]:shadow-md">
                            <Youtube className="h-4 w-4" />
                            <span className="hidden sm:inline">YouTube</span>
                        </TabsTrigger>
                    )}
                </TabsList>

                {/* LinkedIn */}
                {data.linkedin && (
                    <TabsContent value="linkedin" className="space-y-4">
                        <ContentCard
                            title="Educational Post"
                            content={data.linkedin.educational}
                            badge="Educational"
                        />
                        <ContentCard
                            title="Contrarian Take"
                            content={data.linkedin.controversial}
                            badge="Controversial"
                        />
                        <ContentCard
                            title="Personal Story Hook"
                            content={data.linkedin.personal}
                            badge="Personal"
                        />
                    </TabsContent>
                )}

                {/* Twitter */}
                {data.twitter_hooks && (
                    <TabsContent value="twitter" className="space-y-4">
                        <ContentCard
                            title="Curiosity Hook"
                            content={data.twitter_hooks[0]}
                            badge="Curiosity"
                        />
                        <ContentCard
                            title="Bold Claim"
                            content={data.twitter_hooks[1]}
                            badge="Bold"
                        />
                        <ContentCard
                            title="Data-Backed Insight"
                            content={data.twitter_hooks[2]}
                            badge="Data"
                        />
                    </TabsContent>
                )}

                {/* SEO */}
                {data.meta_description && (
                    <TabsContent value="seo" className="space-y-4">
                        <ContentCard
                            title="Meta Description"
                            content={data.meta_description}
                            badge="SEO"
                            showCharCount
                            maxChars={160}
                        />
                    </TabsContent>
                )}

                {/* YouTube */}
                {data.youtube && (
                    <TabsContent value="youtube" className="space-y-4">
                        <ContentCard
                            title="Video Title"
                            content={data.youtube.title}
                            badge="High CTR"
                        />
                        <ContentCard
                            title="Video Description"
                            content={data.youtube.description}
                            badge="Description"
                        />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
