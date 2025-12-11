import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, MessageSquare, Phone, MapPin, Send, HelpCircle, Clock } from "lucide-react";

const contactMethods = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Our team typically responds within 24 hours",
    value: "digitalagency4us@gmail.com",
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Available Monday to Saturday, 8am-8pm",
    value: "Start a conversation",
  },
  {
    icon: Phone,
    title: "Phone",
    description: "Enterprise customers only",
    value: "9059576080",
  },
];

const faqs = [
  {
    question: "How quickly can I get started?",
    answer: "You can create your first AI agent in under 5 minutes. Our guided setup walks you through every step.",
  },
  {
    question: "Do you offer custom integrations?",
    answer: "Yes, our Enterprise plan includes custom integrations. Contact sales to discuss your specific requirements.",
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use industry-standard encryption and are SOC 2 compliant. Your data is never shared or used for training.",
  },
  {
    question: "Can I migrate from another platform?",
    answer: "Yes, we offer migration assistance for customers switching from other chatbot platforms. Contact our support team for help.",
  },
];

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message sent!",
      description: "We'll get back to you as soon as possible.",
    });
    
    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-24 bg-gradient-to-b from-muted/50 to-background">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="secondary" className="mb-6">Contact Us</Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6" data-testid="text-contact-title">
                Get in Touch
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-12 -mt-12">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {contactMethods.map((method, index) => (
                <Card key={index}>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <method.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{method.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
                    <p className="text-sm font-medium text-primary">{method.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & FAQ */}
        <section className="py-12">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card>
                <CardContent className="p-8">
                  <h2 className="font-display text-2xl font-bold mb-6">Send us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          data-testid="input-contact-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          data-testid="input-contact-email"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Select
                        value={formData.subject}
                        onValueChange={(value) => setFormData({ ...formData, subject: value })}
                      >
                        <SelectTrigger data-testid="select-contact-subject">
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="sales">Sales Question</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us how we can help..."
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        data-testid="textarea-contact-message"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                      data-testid="button-contact-submit"
                    >
                      {isSubmitting ? (
                        "Sending..."
                      ) : (
                        <>
                          Send Message
                          <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* FAQ */}
              <div>
                <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
                  <HelpCircle className="h-6 w-6 text-primary" />
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <h3 className="font-semibold mb-2">{faq.question}</h3>
                        <p className="text-sm text-muted-foreground">{faq.answer}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="mt-8 bg-muted/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Response Time</h3>
                        <p className="text-sm text-muted-foreground">
                          Our support team typically responds within 24 hours during business days. For urgent matters, please use our live chat during business hours.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
