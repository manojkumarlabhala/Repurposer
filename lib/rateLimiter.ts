interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const MAX_REQUESTS = 10;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function cleanupExpiredEntries() {
    const now = Date.now();
    const keysToDelete: string[] = [];
    rateLimitStore.forEach((entry, key) => {
        if (now > entry.resetTime) {
            keysToDelete.push(key);
        }
    });
    keysToDelete.forEach((key) => rateLimitStore.delete(key));
}


export function getClientIp(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }

    const realIp = request.headers.get("x-real-ip");
    if (realIp) {
        return realIp.trim();
    }

    return "unknown";
}

export function checkRateLimit(ip: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
} {
    cleanupExpiredEntries();

    const now = Date.now();
    const entry = rateLimitStore.get(ip);

    if (!entry || now > entry.resetTime) {
        rateLimitStore.set(ip, {
            count: 1,
            resetTime: now + WINDOW_MS,
        });
        return {
            allowed: true,
            remaining: MAX_REQUESTS - 1,
            resetTime: now + WINDOW_MS,
        };
    }

    if (entry.count >= MAX_REQUESTS) {
        return {
            allowed: false,
            remaining: 0,
            resetTime: entry.resetTime,
        };
    }

    entry.count++;
    return {
        allowed: true,
        remaining: MAX_REQUESTS - entry.count,
        resetTime: entry.resetTime,
    };
}

// In-memory analytics counter
let totalRequests = 0;
let successfulRequests = 0;

export function incrementAnalytics(success: boolean) {
    totalRequests++;
    if (success) successfulRequests++;
}

export function getAnalytics() {
    return { totalRequests, successfulRequests };
}
