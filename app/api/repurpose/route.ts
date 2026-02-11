import { NextRequest, NextResponse } from "next/server";
import { urlInputSchema } from "@/lib/validators";
import { extractContent } from "@/lib/extractor";
import { generateRepurposedContent } from "@/lib/ai";
import { checkRateLimit, getClientIp, incrementAnalytics } from "@/lib/rateLimiter";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: "Invalid JSON in request body" },
                { status: 400 }
            );
        }

        // Validate input
        const validation = urlInputSchema.safeParse(body);
        if (!validation.success) {
            const errorMessage = validation.error.errors.map((e) => e.message).join(", ");
            return NextResponse.json(
                { success: false, error: errorMessage },
                { status: 400 }
            );
        }

        const { url, tone, length, platforms } = validation.data;

        // Rate limiting
        const clientIp = getClientIp(request);
        const rateLimit = checkRateLimit(clientIp);

        if (!rateLimit.allowed) {
            const resetMinutes = Math.ceil((rateLimit.resetTime - Date.now()) / 60000);
            return NextResponse.json(
                {
                    success: false,
                    error: `Rate limit exceeded. You can make 10 requests per hour. Try again in ${resetMinutes} minutes.`,
                },
                {
                    status: 429,
                    headers: {
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": rateLimit.resetTime.toString(),
                        "Retry-After": (resetMinutes * 60).toString(),
                    },
                }
            );
        }

        // Extract content
        let extractedContent;
        try {
            extractedContent = await extractContent(url);
        } catch (error) {
            incrementAnalytics(false);
            const message = error instanceof Error ? error.message : "Content extraction failed";
            return NextResponse.json(
                { success: false, error: message },
                { status: 422 }
            );
        }

        // Generate repurposed content
        let repurposedContent;
        try {
            repurposedContent = await generateRepurposedContent(extractedContent, tone, length, platforms);
        } catch (error) {
            incrementAnalytics(false);
            const message = error instanceof Error ? error.message : "AI content generation failed";
            return NextResponse.json(
                { success: false, error: message },
                { status: 500 }
            );
        }

        incrementAnalytics(true);

        return NextResponse.json(
            {
                success: true,
                data: repurposedContent,
            },
            {
                status: 200,
                headers: {
                    "X-RateLimit-Remaining": rateLimit.remaining.toString(),
                },
            }
        );
    } catch (error) {
        console.error("Critical error in /api/repurpose:", error);
        incrementAnalytics(false);
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
        return NextResponse.json(
            { success: false, error: errorMessage, stack: process.env.NODE_ENV === "development" ? (error as Error).stack : undefined },
            { status: 500 }
        );
    }
}
