"use client";

import Link from "next/link";
import { Github } from "lucide-react";

export function SiteHeader() {
    return (
        <header className="border-b border-border/40 bg-background/60 backdrop-blur-xl sticky top-0 z-50 w-full">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Branding */}
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 bg-clip-text text-transparent animate-gradient-x">
                            Repurposer
                        </h1>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex items-center gap-6">
                    <Link href="/privacy" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Privacy
                    </Link>
                    <Link href="/terms" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Terms
                    </Link>
                    <a
                        href="https://github.com/manojkumarlabhala/Repurposer"
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Github className="h-5 w-5" />
                        <span className="sr-only">GitHub</span>
                    </a>
                </nav>
            </div>
        </header>
    );
}
