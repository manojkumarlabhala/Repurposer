import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import * as cheerio from "cheerio";
import { stripHtmlTags, htmlToMarkdown, trimToWordCount, countWords } from "./utils";
import type { ExtractedContent } from "@/types";

const FETCH_TIMEOUT = 15000;
const MAX_CONTENT_LENGTH = 5 * 1024 * 1024; // 5MB
const MIN_CONTENT_WORDS = 500;
const MAX_WORDS = 6000;

const REMOVE_SELECTORS = [
    "script",
    "style",
    "nav",
    "footer",
    "header",
    "form",
    "iframe",
    "aside",
    ".comments",
    "#comments",
    ".sidebar",
    ".advertisement",
    ".ad",
    ".ads",
    '[role="banner"]',
    '[role="navigation"]',
    '[role="complementary"]',
    ".social-share",
    ".related-posts",
    ".newsletter",
    ".popup",
    ".modal",
];

async function fetchHtml(url: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
            },
            redirect: "follow",
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
            throw new Error("URL does not point to an HTML page");
        }

        const contentLength = response.headers.get("content-length");
        if (contentLength && parseInt(contentLength) > MAX_CONTENT_LENGTH) {
            throw new Error("Content too large (max 5MB)");
        }

        const html = await response.text();
        if (html.length > MAX_CONTENT_LENGTH) {
            throw new Error("Content too large (max 5MB)");
        }

        return html;
    } finally {
        clearTimeout(timeout);
    }
}

function cleanDom(doc: Document): void {
    REMOVE_SELECTORS.forEach((selector) => {
        try {
            doc.querySelectorAll(selector).forEach((el) => el.remove());
        } catch {
            // Ignore invalid selectors
        }
    });
}

function extractWithReadability(html: string, url: string): ExtractedContent | null {
    try {
        const dom = new JSDOM(html, { url });
        const doc = dom.window.document;

        cleanDom(doc);

        const reader = new Readability(doc);
        const article = reader.parse();

        if (!article || !article.textContent) {
            return null;
        }

        const plainText = article.textContent.replace(/\s+/g, " ").trim();
        const wordCount = countWords(plainText);

        if (wordCount < MIN_CONTENT_WORDS) {
            return null;
        }

        const markdown = htmlToMarkdown(article.content || "");
        const trimmedContent = trimToWordCount(markdown, MAX_WORDS);

        return {
            title: article.title || "Untitled",
            content: trimmedContent,
            wordCount: Math.min(wordCount, MAX_WORDS),
            excerpt: article.excerpt || plainText.slice(0, 200) + "...",
            author: article.byline || undefined,
        };
    } catch {
        return null;
    }
}

function extractWithCheerio(html: string): ExtractedContent | null {
    try {
        const $ = cheerio.load(html);

        REMOVE_SELECTORS.forEach((selector) => {
            $(selector).remove();
        });

        let title =
            $("h1").first().text().trim() ||
            $("title").text().trim() ||
            $('meta[property="og:title"]').attr("content") ||
            "Untitled";

        const excerpt =
            $('meta[name="description"]').attr("content") ||
            $('meta[property="og:description"]').attr("content") ||
            "";

        const author =
            $('meta[name="author"]').attr("content") ||
            $('[rel="author"]').text().trim() ||
            $(".author").first().text().trim() ||
            undefined;

        const contentSelectors = [
            "article",
            '[role="main"]',
            "main",
            ".post-content",
            ".entry-content",
            ".article-content",
            ".content",
            ".post-body",
            "#content",
        ];

        let contentHtml = "";
        for (const selector of contentSelectors) {
            const el = $(selector).first();
            if (el.length) {
                contentHtml = el.html() || "";
                break;
            }
        }

        if (!contentHtml) {
            contentHtml = $("body").html() || "";
        }

        const plainText = stripHtmlTags(contentHtml);
        const wordCount = countWords(plainText);

        if (wordCount < 100) {
            return null;
        }

        const markdown = htmlToMarkdown(contentHtml);
        const trimmedContent = trimToWordCount(markdown, MAX_WORDS);

        return {
            title: title.slice(0, 300),
            content: trimmedContent,
            wordCount: Math.min(wordCount, MAX_WORDS),
            excerpt: excerpt || plainText.slice(0, 200) + "...",
            author,
        };
    } catch {
        return null;
    }
}

export async function extractContent(url: string): Promise<ExtractedContent> {
    let html: string;

    try {
        html = await fetchHtml(url);
    } catch (error) {
        if (error instanceof Error) {
            if (error.name === "AbortError") {
                throw new Error("Request timed out. The URL took too long to respond.");
            }
            throw new Error(`Failed to fetch URL: ${error.message}`);
        }
        throw new Error("Failed to fetch the URL");
    }

    const $ = cheerio.load(html);

    // Extract metadata using Cheerio
    const metadata = {
        title:
            $('meta[property="og:title"]').attr("content") ||
            $("title").text().trim() ||
            $("h1").first().text().trim() ||
            "Untitled",
        siteName:
            $('meta[property="og:site_name"]').attr("content") ||
            $('meta[name="application-name"]').attr("content") ||
            undefined,
        date:
            $('meta[property="article:published_time"]').attr("content") ||
            $('meta[name="date"]').attr("content") ||
            $('time').first().attr('datetime') ||
            undefined,
        keywords:
            $('meta[name="keywords"]').attr("content")?.split(",").map(k => k.trim()) ||
            $('meta[property="article:tag"]').map((_, el) => $(el).attr("content")).get() ||
            undefined,
        author:
            $('meta[name="author"]').attr("content") ||
            $('meta[property="article:author"]').attr("content") ||
            $('[rel="author"]').text().trim() ||
            $(".author").first().text().trim() ||
            undefined,
        description:
            $('meta[name="description"]').attr("content") ||
            $('meta[property="og:description"]').attr("content") ||
            "",
    };

    // Step 1: Readability extraction
    const readabilityResult = extractWithReadability(html, url);
    if (readabilityResult && readabilityResult.wordCount >= MIN_CONTENT_WORDS) {
        return {
            ...readabilityResult,
            title: readabilityResult.title || metadata.title,
            author: readabilityResult.author || metadata.author,
            excerpt: readabilityResult.excerpt || metadata.description,
            keywords: metadata.keywords,
            date: metadata.date,
            siteName: metadata.siteName,
        };
    }

    // Step 2: Cheerio fallback
    const cheerioResult = extractWithCheerio(html);
    if (cheerioResult && cheerioResult.wordCount >= 100) {
        return {
            ...cheerioResult,
            title: cheerioResult.title || metadata.title,
            author: cheerioResult.author || metadata.author,
            keywords: metadata.keywords,
            date: metadata.date,
            siteName: metadata.siteName,
        };
    }

    // If Readability got something but less than MIN_CONTENT_WORDS, still use it
    if (readabilityResult) {
        return {
            ...readabilityResult,
            title: readabilityResult.title || metadata.title,
            author: readabilityResult.author || metadata.author,
            excerpt: readabilityResult.excerpt || metadata.description,
            keywords: metadata.keywords,
            date: metadata.date,
            siteName: metadata.siteName,
        };
    }

    throw new Error(
        "Could not extract meaningful content from this URL. The page might be dynamic or require JavaScript rendering."
    );
}
