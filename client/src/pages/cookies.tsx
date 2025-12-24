import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16">
        <section className="py-24 bg-gradient-to-b from-muted/50 to-background">
          <div className="container mx-auto max-w-4xl px-6">
            <Badge variant="secondary" className="mb-6">Legal</Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Cookie Policy
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
                <h2>1. What Are Cookies</h2>
                <p>
                  Cookies are small text files that are placed on your device when you visit a website.
                  They help us provide you with a better experience by remembering your preferences
                  and understanding how you use our service.
                </p>

                <h2>2. Types of Cookies We Use</h2>
                
                <h3>Essential Cookies</h3>
                <p>
                  These cookies are necessary for the website to function properly. They enable basic
                  functions like page navigation, secure areas access, and session management.
                  The website cannot function properly without these cookies.
                </p>

                <h3>Functional Cookies</h3>
                <p>
                  These cookies enable enhanced functionality and personalization, such as remembering
                  your preferences, language settings, and login information.
                </p>

                <h3>Analytics Cookies</h3>
                <p>
                  We use analytics cookies to understand how visitors interact with our website.
                  This helps us improve our service and user experience. These cookies collect
                  information anonymously.
                </p>

                <h2>3. Third-Party Cookies</h2>
                <p>
                  Some cookies are placed by third-party services that appear on our pages.
                  We use the following third-party services:
                </p>
                <ul>
                  <li>Stripe - for payment processing</li>
                  <li>Analytics services - for usage statistics</li>
                </ul>

                <h2>4. Managing Cookies</h2>
                <p>
                  Most web browsers allow you to control cookies through their settings. You can:
                </p>
                <ul>
                  <li>Delete all cookies from your browser</li>
                  <li>Block all cookies by default</li>
                  <li>Allow cookies from specific websites</li>
                  <li>Delete cookies when you close your browser</li>
                </ul>
                <p>
                  Please note that disabling cookies may affect the functionality of our website.
                </p>

                <h2>5. Cookie Retention</h2>
                <p>
                  Session cookies are deleted when you close your browser. Persistent cookies
                  remain on your device for a set period or until you delete them:
                </p>
                <ul>
                  <li>Session cookies: Deleted on browser close</li>
                  <li>Authentication cookies: Up to 7 days</li>
                  <li>Preference cookies: Up to 1 year</li>
                  <li>Analytics cookies: Up to 2 years</li>
                </ul>

                <h2>6. Updates to This Policy</h2>
                <p>
                  We may update this Cookie Policy from time to time. We will notify you of any
                  changes by posting the new policy on this page and updating the "Last updated" date.
                </p>

                <h2>7. Contact Us</h2>
                <p>
                  If you have questions about our use of cookies, please contact us at{" "}
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
