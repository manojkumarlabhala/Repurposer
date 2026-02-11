import { z } from "zod";

const BLOCKED_HOSTNAMES = [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "[::]",
    "[::1]",
    "10.",
    "172.16.",
    "172.17.",
    "172.18.",
    "172.19.",
    "172.20.",
    "172.21.",
    "172.22.",
    "172.23.",
    "172.24.",
    "172.25.",
    "172.26.",
    "172.27.",
    "172.28.",
    "172.29.",
    "172.30.",
    "172.31.",
    "192.168.",
    "169.254.",
];

function isPrivateUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        const hostname = parsed.hostname.toLowerCase();

        if (BLOCKED_HOSTNAMES.some((blocked) => hostname.startsWith(blocked) || hostname === blocked)) {
            return true;
        }

        if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.)/.test(hostname)) {
            return true;
        }

        if (hostname.endsWith(".local") || hostname.endsWith(".internal")) {
            return true;
        }

        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
            return true;
        }

        return false;
    } catch {
        return true;
    }
}

function normalizeUrl(url: string): string {
    let normalized = url.trim();
    if (!/^https?:\/\//i.test(normalized)) {
        normalized = "https://" + normalized;
    }
    return normalized;
}

export const urlInputSchema = z.object({
    url: z
        .string()
        .min(1, "URL is required")
        .transform(normalizeUrl)
        .refine(
            (url) => {
                try {
                    new URL(url);
                    return true;
                } catch {
                    return false;
                }
            },
            { message: "Invalid URL format" }
        )
        .refine((url) => !isPrivateUrl(url), {
            message: "Private or internal URLs are not allowed",
        }),
    tone: z.enum(["professional", "bold", "analytical", "casual"]).optional().default("professional"),
    audience: z.enum(["B2B", "B2C", "general"]).optional().default("general"),
    length: z.enum(["short", "medium", "long"]).optional().default("medium"),
    platforms: z.array(z.enum(["linkedin", "twitter", "youtube", "seo"])).optional().default(["linkedin", "twitter", "youtube", "seo"]),
});

export const repurposedContentSchema = z.object({
    linkedin: z.object({
        educational: z.string().min(1),
        controversial: z.string().min(1),
        personal: z.string().min(1),
    }).optional(),
    twitter_hooks: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1)]).optional(),
    meta_description: z.string().min(1).max(160).optional(),
    youtube: z.object({
        title: z.string().min(1),
        description: z.string().min(1),
    }).optional(),
});

export type UrlInput = z.infer<typeof urlInputSchema>;
export type RepurposedContentValidated = z.infer<typeof repurposedContentSchema>;
