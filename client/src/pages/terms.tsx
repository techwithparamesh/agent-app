import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16">
        <section className="py-24 bg-gradient-to-b from-muted/50 to-background">
          <div className="container mx-auto max-w-4xl px-6">
            <Badge variant="secondary" className="mb-6">Legal</Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Terms of Service
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto max-w-4xl px-6">
            <Card>
              <CardContent className="p-8 prose prose-neutral dark:prose-invert max-w-none">
                <h2>1. Acceptance of Terms</h2>
                <p>
                  By accessing or using AgentForge's services, you agree to be bound by these Terms of Service
                  and all applicable laws and regulations. If you do not agree with any of these terms,
                  you are prohibited from using our services.
                </p>

                <h2>2. Use License</h2>
                <p>
                  Permission is granted to use our services for personal or commercial purposes in accordance
                  with your subscription plan. This license does not include:
                </p>
                <ul>
                  <li>Modifying or copying our materials except as permitted</li>
                  <li>Using materials for any commercial purpose not authorized</li>
                  <li>Attempting to reverse engineer any software</li>
                  <li>Removing any copyright or proprietary notations</li>
                  <li>Transferring materials to another person or "mirroring" them</li>
                </ul>

                <h2>3. Service Description</h2>
                <p>
                  AgentForge provides AI-powered chatbot and automation services for businesses.
                  We reserve the right to modify, suspend, or discontinue any aspect of our services
                  at any time without prior notice.
                </p>

                <h2>4. User Responsibilities</h2>
                <p>You are responsible for:</p>
                <ul>
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Ensuring your use complies with applicable laws</li>
                  <li>Not using the service for any illegal or unauthorized purpose</li>
                  <li>Not transmitting malicious code or interfering with the service</li>
                </ul>

                <h2>5. Payment Terms</h2>
                <p>
                  Paid subscriptions are billed in advance on a monthly or annual basis.
                  All fees are non-refundable except as required by law. We may change
                  our fees upon 30 days' notice.
                </p>

                <h2>6. Limitation of Liability</h2>
                <p>
                  AgentForge shall not be liable for any indirect, incidental, special, consequential,
                  or punitive damages, including loss of profits, data, or goodwill, resulting from
                  your use of the service.
                </p>

                <h2>7. Termination</h2>
                <p>
                  We may terminate or suspend your account and access to the service immediately,
                  without prior notice, for any reason, including breach of these Terms.
                </p>

                <h2>8. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these terms at any time. We will notify users of
                  any material changes via email or through the service. Continued use of the
                  service after changes constitutes acceptance.
                </p>

                <h2>9. Contact Us</h2>
                <p>
                  If you have questions about these Terms, please contact us at{" "}
                  <a href="mailto:legal@agentforge.ai" className="text-primary hover:underline">
                    legal@agentforge.ai
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
