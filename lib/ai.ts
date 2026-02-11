import OpenAI from "openai";
import { repurposedContentSchema } from "./validators";
import type { RepurposedContent, ExtractedContent, ToneOption, LengthOption, PlatformOption, AudienceOption } from "@/types";

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENAI_API_KEY || "",
});

const TONE_INSTRUCTIONS: Record<ToneOption, string> = {
    professional:
        "Write in a polished, authoritative professional tone. Focus on expertise, insights, and business value. Avoid slang.",
    bold: "Write in a bold, provocative, attention-grabbing tone. Use strong opinions, hot takes, and challenge conventional wisdom. Be contrarian but substantive.",
    analytical:
        "Write in a data-driven, analytical tone. Focus on frameworks, mental models, evidence-based insights, and logical reasoning. Be precise and structured.",
    casual:
        "Write in a friendly, conversational, and relatable tone. Use simple language, humor if appropriate, and speak directly to the reader like a peer.",
};

const AUDIENCE_INSTRUCTIONS: Record<AudienceOption, string> = {
    B2B: "Target a business audience (engineers, executives, founders). Focus on ROI, efficiency, scalability, and strategic value.",
    B2C: "Target a general consumer audience. Focus on lifestyle, personal benefits, emotional connection, and ease of use.",
    general: "Target a broad, general audience. Avoid jargon, keep concepts accessible, and focus on clear communication.",
};

const LENGTH_INSTRUCTIONS: Record<LengthOption, string> = {
    short:
        "Keep all content concise. LinkedIn posts under 600 characters. Twitter hooks under 200 characters. YouTube description under 150 words.",
    medium:
        "Use medium-length content. LinkedIn posts 800-1200 characters. Twitter hooks 200-280 characters. YouTube description 150-250 words.",
    long: "Create detailed, long-form content. LinkedIn posts 1200-2000 characters. Twitter hooks can use full 280 characters. YouTube description 250-350 words.",
};

function buildSystemPrompt(tone: ToneOption, length: LengthOption, platforms: PlatformOption[], audience: AudienceOption): string {
    const platformInstructions: string[] = [];

    if (platforms.includes("linkedin")) {
        platformInstructions.push(`"linkedin": { "educational": "LinkedIn post with educational angle", "controversial": "LinkedIn post with contrarian/controversial take", "personal": "LinkedIn post with personal story hook" }`);
    }
    if (platforms.includes("twitter")) {
        platformInstructions.push(`"twitter_hooks": ["Curiosity-driven tweet", "Bold claim tweet", "Data-backed insight tweet"]`);
    }
    if (platforms.includes("seo")) {
        platformInstructions.push(`"meta_description": "SEO meta description, strictly under 160 characters"`);
    }
    if (platforms.includes("youtube")) {
        platformInstructions.push(`"youtube": { "title": "High CTR YouTube title", "description": "YouTube description 150-300 words" }`);
    }

    return `You are an elite content strategist and social media expert.
You transform blog posts into high-performing platform-native content.

CRITICAL RULES:
- Avoid generic AI tone at all costs
- Write like a real human who actively posts on LinkedIn and X (Twitter)
- Create strong hooks that stop the scroll
- Avoid clichés like "game-changer", "unlock", "dive in", "in today's world"
- Avoid emojis unless they feel completely natural
- Create tension, curiosity, or insight in every piece
- Each piece must feel native to its platform
- Use the provided metadata (Author, Date, Site Name, Keywords) to contextualize the content.
- If the author is known, mimic their potential voice or credit them appropriately where natural.

TONE: ${TONE_INSTRUCTIONS[tone]}

AUDIENCE: ${AUDIENCE_INSTRUCTIONS[audience]}

LENGTH: ${LENGTH_INSTRUCTIONS[length]}

OUTPUT FORMAT:
You MUST return valid JSON with ONLY these keys populated (based on requested platforms):
{
  ${platformInstructions.join(",\n  ")}
}
`;
}

function buildUserPrompt(content: ExtractedContent, platforms: PlatformOption[]): string {
    const tasks: string[] = [];
    if (platforms.includes("linkedin")) {
        tasks.push(`1. Three LinkedIn posts:
   - Educational angle: teach the reader something valuable from the blog
   - Contrarian/controversial take: challenge a common belief related to the topic
   - Personal story hook: frame it as a personal insight or lesson learned`);
    }
    if (platforms.includes("twitter")) {
        tasks.push(`2. Three Twitter/X thread opening tweets:
   - Curiosity-driven: make people want to read more
   - Bold claim: make a strong statement that demands attention
   - Data-backed insight: lead with a compelling stat or finding from the content`);
    }
    if (platforms.includes("seo")) {
        tasks.push(`3. One SEO-optimized meta description (strictly under 160 characters). Use the target keywords if they are relevant.`);
    }
    if (platforms.includes("youtube")) {
        tasks.push(`4. One YouTube video:
   - Title: optimized for high CTR, use power words
   - Description: 150-300 words, include key points and a call to action. Mention the original article source if relevant.`);
    }

    return `BLOG METADATA:
Title: ${content.title}
Site Name: ${content.siteName || "Unknown"}
Author: ${content.author || "Unknown"}
Published Date: ${content.date || "Unknown"}
Keywords: ${content.keywords?.join(", ") || "None"}

BLOG EXCERPT:
${content.excerpt}

BLOG CONTENT:
${content.content}

TASK:
Generate platform-native content from this blog post, using the metadata to add context and authority:

${tasks.join("\n\n")}

Return ONLY the JSON object, no other text.`;
}

export async function generateRepurposedContent(
    extractedContent: ExtractedContent,
    tone: ToneOption = "professional",
    length: LengthOption = "medium",
    platforms: PlatformOption[] = ["linkedin", "twitter", "youtube", "seo"],
    audience: AudienceOption = "general"
): Promise<RepurposedContent> {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not configured. Please set it in your environment variables.");
    }

    console.log(`API Key Check: Present (Length: ${process.env.OPENAI_API_KEY.length})`);

    const primaryModel = process.env.AI_MODEL_PRIMARY || "google/gemini-2.0-flash-001";
    const fallbackModel = process.env.AI_MODEL_FALLBACK;

    console.log(`Generating content with model: ${primaryModel} (Platforms: ${platforms.join(", ")}, Fallback: ${fallbackModel || "None"})`);

    try {
        return await callAI(primaryModel, tone, length, extractedContent, platforms, audience);
    } catch (error) {
        if (fallbackModel && primaryModel !== fallbackModel) {
            console.warn(`Primary model ${primaryModel} failed. Switching to fallback ${fallbackModel}. Error:`, error);
            try {
                return await callAI(fallbackModel, tone, length, extractedContent, platforms, audience);
            } catch (fallbackError) {
                console.error(`Fallback model ${fallbackModel} also failed.`, fallbackError);
                throw fallbackError; // Throw the fallback error if both fail
            }
        }
        throw error;
    }
}

async function callAI(
    model: string,
    tone: ToneOption,
    length: LengthOption,
    extractedContent: ExtractedContent,
    platforms: PlatformOption[],
    audience: AudienceOption
): Promise<RepurposedContent> {
    try {
        const completion = await openai.chat.completions.create({
            model: model,
            messages: [
                { role: "system", content: buildSystemPrompt(tone, length, platforms, audience) },
                { role: "user", content: buildUserPrompt(extractedContent, platforms) },
            ],
            response_format: { type: "json_object" },
            temperature: 0.8,
            max_tokens: 4000,
        });

        const responseText = completion.choices[0]?.message?.content;

        if (!responseText) {
            throw new Error("AI returned an empty response");
        }

        let parsed: unknown;
        try {
            parsed = JSON.parse(responseText);
        } catch {
            throw new Error("AI returned invalid JSON");
        }

        const validated = repurposedContentSchema.safeParse(parsed);

        if (!validated.success) {
            console.error(`AI output validation failed for model ${model}:`, validated.error.errors);
            // Try to salvage by filling requested missing fields
            const raw = parsed as Record<string, unknown>;
            const fallback: RepurposedContent = {};

            if (platforms.includes("linkedin")) {
                fallback.linkedin = {
                    educational: getNestedString(raw, "linkedin", "educational") || "Content generation incomplete",
                    controversial: getNestedString(raw, "linkedin", "controversial") || "Content generation incomplete",
                    personal: getNestedString(raw, "linkedin", "personal") || "Content generation incomplete",
                };
            }
            if (platforms.includes("twitter")) {
                fallback.twitter_hooks = [
                    getArrayString(raw, "twitter_hooks", 0) || "Content generation incomplete",
                    getArrayString(raw, "twitter_hooks", 1) || "Content generation incomplete",
                    getArrayString(raw, "twitter_hooks", 2) || "Content generation incomplete",
                ] as [string, string, string];
            }
            if (platforms.includes("seo")) {
                fallback.meta_description =
                    typeof raw.meta_description === "string"
                        ? raw.meta_description.slice(0, 160)
                        : "Content generation incomplete";
            }
            if (platforms.includes("youtube")) {
                fallback.youtube = {
                    title: getNestedString(raw, "youtube", "title") || "Content generation incomplete",
                    description: getNestedString(raw, "youtube", "description") || "Content generation incomplete",
                };
            }

            return fallback;
        }

        return validated.data;
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes("API key")) {
                throw new Error("Invalid API key. Please check your OPENAI_API_KEY / OpenRouter key.");
            }
            if (error.message.includes("rate limit")) {
                throw new Error("AI rate limit exceeded. Please try again in a few minutes.");
            }
        }
        throw error;
    }
}

function getNestedString(obj: Record<string, unknown>, key1: string, key2: string): string | null {
    const nested = obj[key1];
    if (nested && typeof nested === "object" && nested !== null) {
        const val = (nested as Record<string, unknown>)[key2];
        if (typeof val === "string") return val;
    }
    return null;
}

function getArrayString(obj: Record<string, unknown>, key: string, index: number): string | null {
    const arr = obj[key];
    if (Array.isArray(arr) && typeof arr[index] === "string") {
        return arr[index];
    }
    return null;
}
