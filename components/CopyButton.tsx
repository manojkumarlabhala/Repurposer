"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface CopyButtonProps {
    text: string;
    label?: string;
}

export function CopyButton({ text, label = "Copy" }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast({
                title: "Copied!",
                description: `${label} copied to clipboard`,
            });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.opacity = "0";
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setCopied(true);
            toast({
                title: "Copied!",
                description: `${label} copied to clipboard`,
            });
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
        >
            {copied ? (
                <Check className="h-4 w-4 text-green-500 transition-all" />
            ) : (
                <Copy className="h-4 w-4 transition-all" />
            )}
            <span className="ml-1.5 text-xs">{copied ? "Copied" : label}</span>
        </Button>
    );
}
