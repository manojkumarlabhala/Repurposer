import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function stripHtmlTags(html: string): string {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<nav[\s\S]*?<\/nav>/gi, "")
        .replace(/<footer[\s\S]*?<\/footer>/gi, "")
        .replace(/<form[\s\S]*?<\/form>/gi, "")
        .replace(/<header[\s\S]*?<\/header>/gi, "")
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/<aside[\s\S]*?<\/aside>/gi, "")
        .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, " ")
        .trim();
}

export function htmlToMarkdown(html: string): string {
    let md = html;

    md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n# $1\n");
    md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n## $1\n");
    md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n### $1\n");
    md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n#### $1\n");
    md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, "\n##### $1\n");
    md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, "\n###### $1\n");

    md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**");
    md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**");
    md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*");
    md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*");

    md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");
    md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n");
    md = md.replace(/<br\s*\/?>/gi, "\n");
    md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n$1\n");
    md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, "\n> $1\n");
    md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`");
    md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, "\n```\n$1\n```\n");

    md = stripHtmlTags(md);
    md = md.replace(/\n{3,}/g, "\n\n");

    return md.trim();
}

export function trimToWordCount(text: string, maxWords: number = 6000): string {
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "...";
}

export function countWords(text: string): number {
    return text.split(/\s+/).filter(Boolean).length;
}
