import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/Providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: {
        default: "Blog Content Repurposer | AI-Powered Content Transformation",
        template: "%s | Blog Content Repurposer",
    },
    description: "Transform any blog post into viral LinkedIn posts, Twitter hooks, SEO meta descriptions, and YouTube scripts with AI-powered content repurposing.",
    keywords: [
        "blog repurposing",
        "content repurposing ai",
        "turn blog into linkedin post",
        "blog to twitter thread",
        "generative ai for marketing",
        "content strategy tool",
        "seo meta description generator"
    ],
    authors: [{ name: "Repurposer AI Team" }],
    creator: "Repurposer AI",
    publisher: "Repurposer AI",
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    openGraph: {
        title: "Blog Content Repurposer",
        description: "Transform blog posts into platform-native social media content with AI.",
        url: "/",
        siteName: "Blog Content Repurposer",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Blog Content Repurposer",
        description: "Transform blog posts into platform-native social media content with AI.",
        creator: "@repurposer_ai",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    icons: {
        icon: "/favicon.ico",
        apple: "/apple-touch-icon.png",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className={inter.className}>
                <Providers>
                    {children}
                </Providers>
                <Toaster />
            </body>
        </html>
    );
}
