"use client";

import { Linkedin, Twitter, Search, Youtube, Copy, Check } from "lucide-react";
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

    const copyAllContent = async () => {
        let allContent = "";

        if (data.linkedin) {
            allContent += `=== LINKEDIN POSTS ===\n\n📚 Educational:\n${data.linkedin.educational}\n\n🔥 Contrarian Take:\n${data.linkedin.controversial}\n\n💡 Personal Hook:\n${data.linkedin.personal}\n\n`;
        }

        if (data.twitter_hooks) {
            allContent += `=== TWITTER/X HOOKS ===\n\n1. ${data.twitter_hooks[0]}\n\n2. ${data.twitter_hooks[1]}\n\n3. ${data.twitter_hooks[2]}\n\n`;
        }

        if (data.meta_description) {
            allContent += `=== SEO META DESCRIPTION ===\n${data.meta_description}\n\n`;
        }

        if (data.youtube) {
            allContent += `=== YOUTUBE ===\n\nTitle: ${data.youtube.title}\n\nDescription:\n${data.youtube.description}`;
        }

        try {
            await navigator.clipboard.writeText(allContent.trim());
            setCopiedAll(true);
            toast({
                title: "All content copied!",
                description: "Everything has been copied to your clipboard",
            });
            setTimeout(() => setCopiedAll(false), 2000);
        } catch {
            toast({
                title: "Copy failed",
                description: "Please try copying individual sections",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="w-full space-y-6 animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                        Generated Content
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Click any copy button to copy to clipboard
                    </p>
                </div>
                <Button
                    onClick={copyAllContent}
                    variant="outline"
                    className="gap-2 border-primary/30 hover:bg-primary/10"
                >
                    {copiedAll ? (
                        <Check className="h-4 w-4 text-green-500" />
                    ) : (
                        <Copy className="h-4 w-4" />
                    )}
                    {copiedAll ? "Copied!" : "Copy All"}
                </Button>
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
