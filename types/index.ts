export interface ExtractedContent {
    title: string;
    content: string;
    wordCount: number;
    excerpt: string;
    author?: string;
    keywords?: string[];
    date?: string;
    siteName?: string;
}

export interface LinkedInContent {
    educational: string;
    controversial: string;
    personal: string;
}

export interface YouTubeContent {
    title: string;
    description: string;
}

export interface RepurposedContent {
    linkedin?: LinkedInContent;
    twitter_hooks?: [string, string, string];
    meta_description?: string;
    youtube?: YouTubeContent;
}


export type PlatformOption = "linkedin" | "twitter" | "youtube" | "seo";

export type ToneOption = "professional" | "bold" | "analytical";
export type LengthOption = "short" | "medium" | "long";
export type ModelOption =
    | "auto"
    | "google/gemini-2.0-flash-001"
    | "openai/gpt-4o"
    | "anthropic/claude-3.5-sonnet"
    | "google/gemini-2.0-flash-exp:free"
    | "meta-llama/llama-3-8b-instruct:free"
    | (string & {});

export interface ApiResponse {
    success: boolean;
    data: RepurposedContent;
    error?: string;
    stack?: string;
}

export interface RepurposeRequest {
    url: string;
    tone: ToneOption;
    length: LengthOption;
    platforms?: PlatformOption[];
}
