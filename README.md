# AI-Powered Blog Content Repurposer

Transform any blog post into high-performing LinkedIn posts, Twitter/X hooks, SEO meta descriptions, and YouTube content using AI.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=flat-square&logo=tailwind-css)

## Features

- **Blog Content Extraction** — Dual-layer extraction engine (Readability + Cheerio fallback)
- **AI-Powered Repurposing** — Generates platform-native content via OpenRouter
- **LinkedIn Posts** — Educational, contrarian, and personal story variations
- **Twitter/X Hooks** — Curiosity-driven, bold claim, and data-backed insights
- **SEO Meta Description** — Under 160 characters with character counter
- **YouTube Content** — High-CTR title and optimized description
- **Tone Selector** — Professional, Bold, or Analytical
- **Length Selector** — Short, Medium, or Long
- **Copy to Clipboard** — One-click copy with toast notifications
- **Dark Mode** — Beautiful dark-first design
- **Rate Limiting** — 10 requests/hour per IP
- **SSRF Protection** — Blocks private/internal URLs
- **localStorage** — Persists last generated output
- **Mobile Responsive** — Works on all screen sizes

## Tech Stack

| Category    | Technology                                        |
| ----------- | ------------------------------------------------- |
| Framework   | Next.js 14 (App Router)                           |
| Language    | TypeScript                                        |
| Styling     | Tailwind CSS + shadcn/ui                          |
| AI          | OpenAI SDK → OpenRouter                           |
| Extraction  | jsdom + @mozilla/readability + cheerio            |
| Validation  | Zod                                               |
| Icons       | Lucide React                                      |
| Deployment  | Vercel                                            |

## Getting Started

### Prerequisites

- Node.js 18+ 
- An [OpenRouter](https://openrouter.ai/) API key

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd assignment

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your OpenRouter API key
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
OPENAI_API_KEY=your_openrouter_api_key_here
```

Get your API key from [OpenRouter](https://openrouter.ai/keys).

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Deployment to Vercel

### One-Click Deploy

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Add the `OPENAI_API_KEY` environment variable in Settings → Environment Variables
4. Click Deploy

### CLI Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable
vercel env add OPENAI_API_KEY
```

## Project Structure

```
├── app/
│   ├── api/repurpose/route.ts   # API endpoint
│   ├── globals.css               # Global styles + theme
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page
├── components/
│   ├── ui/                       # shadcn/ui primitives
│   ├── ContentCard.tsx           # Content display card
│   ├── CopyButton.tsx            # Clipboard copy button
│   ├── Loader.tsx                # Multi-stage loading skeleton
│   ├── ResultSection.tsx         # Tabbed results display
│   └── UrlForm.tsx               # URL input form
├── lib/
│   ├── ai.ts                     # OpenRouter AI integration
│   ├── extractor.ts              # Content extraction engine
│   ├── rateLimiter.ts            # Rate limiting middleware
│   ├── utils.ts                  # Utility functions
│   └── validators.ts             # Zod validation schemas
├── types/
│   └── index.ts                  # TypeScript interfaces
├── next.config.js
├── tailwind.config.ts
├── package.json
├── vercel.json
└── README.md
```

## Testing

1. Start the dev server: `npm run dev`
2. Open `http://localhost:3000`
3. Enter a blog URL (e.g., `https://blog.samaltman.com/what-i-wish-someone-had-told-me`)
4. Select tone and length preferences
5. Click "Repurpose Content"
6. Verify all tabs (LinkedIn, Twitter, SEO, YouTube) show generated content
7. Test copy buttons and toast notifications
8. Test with invalid URLs to verify error handling
9. Resize browser to test responsive layout

## API Reference

### POST `/api/repurpose`

**Request Body:**
```json
{
  "url": "https://example.com/blog-post",
  "tone": "professional",
  "length": "medium"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "linkedin": {
      "educational": "...",
      "controversial": "...",
      "personal": "..."
    },
    "twitter_hooks": ["...", "...", "..."],
    "meta_description": "...",
    "youtube": {
      "title": "...",
      "description": "..."
    }
  }
}
```

**Error Response (4xx/5xx):**
```json
{
  "success": false,
  "error": "Readable error message"
}
```

## License

MIT
