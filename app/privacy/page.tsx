import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | Repurposer AI",
    description: "Privacy policy and data handling practices for Repurposer AI.",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background gradient-mesh">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h1 className="text-4xl font-bold tracking-tight mb-8 bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                    Privacy Policy
                </h1>

                <div className="prose prose-invert max-w-none text-muted-foreground">
                    <p className="text-lg text-foreground mb-6">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">1. Information We Collect</h2>
                        <p className="mb-4">
                            We collect information that you provide directly to us when using the Repurposer AI service. This includes:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>URLs and content you submit for repurposing</li>
                            <li>Usage data and generation preferences</li>
                            <li>Browser type and device information</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">2. How We Use Your Information</h2>
                        <p className="mb-4">
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Provide, maintain, and improve our services</li>
                            <li>Process your content generation requests via AI models</li>
                            <li>Analyze usage patterns to enhance user experience</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">3. Data Storage</h2>
                        <p className="mb-4">
                            Your generation history is stored locally on your device via LocalStorage. We do not permanently store your generated content on our servers.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">4. Third-Party Services</h2>
                        <p className="mb-4">
                            We use third-party AI providers (such as OpenAI/OpenRouter) to process your content. Your text data is sent to these providers solely for the purpose of generation and is subject to their respective privacy policies.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">5. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at support@repurposer.ai.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
