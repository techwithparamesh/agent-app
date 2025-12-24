import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16">
        <section className="py-24 bg-gradient-to-b from-muted/50 to-background">
          <div className="container mx-auto max-w-4xl px-6">
            <Badge variant="secondary" className="mb-6">Legal</Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Privacy Policy
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
                <h2>1. Information We Collect</h2>
                <p>
                  We collect information you provide directly to us, such as when you create an account,
                  use our services, or contact us for support. This includes:
                </p>
                <ul>
                  <li>Account information (name, email address, password)</li>
                  <li>Business information (company name, website URL)</li>
                  <li>Usage data (how you interact with our services)</li>
                  <li>Communication data (support requests, feedback)</li>
                </ul>

                <h2>2. How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul>
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send technical notices, updates, and support messages</li>
                  <li>Respond to your comments, questions, and requests</li>
                  <li>Monitor and analyze trends, usage, and activities</li>
                </ul>

                <h2>3. Information Sharing</h2>
                <p>
                  We do not sell, trade, or otherwise transfer your personal information to third parties
                  except to provide our services or as required by law. We may share information with:
                </p>
                <ul>
                  <li>Service providers who assist in our operations</li>
                  <li>Professional advisors (lawyers, accountants)</li>
                  <li>Law enforcement when required by law</li>
                </ul>

                <h2>4. Data Security</h2>
                <p>
                  We implement appropriate security measures to protect your personal information,
                  including encryption, secure servers, and regular security audits. However, no
                  method of transmission over the Internet is 100% secure.
                </p>

                <h2>5. Your Rights</h2>
                <p>You have the right to:</p>
                <ul>
                  <li>Access, update, or delete your personal information</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Request a copy of your data</li>
                  <li>Lodge a complaint with a supervisory authority</li>
                </ul>

                <h2>6. Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy, please contact us at{" "}
                  <a href="mailto:privacy@agentforge.ai" className="text-primary hover:underline">
                    privacy@agentforge.ai
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
