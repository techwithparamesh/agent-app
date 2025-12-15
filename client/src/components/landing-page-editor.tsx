import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ColorPicker } from "@/components/ui/color-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Type,
  Palette,
  Layout,
  Download,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  Save,
  Eye,
  Code,
  Sparkles,
  Plus,
  Trash2,
  GripVertical,
  ExternalLink,
  Image,
  FileImage,
  FileCode,
  ChevronDown,
} from "lucide-react";
import type { GeneratedPage } from "@shared/schema";

interface LandingPageEditorProps {
  page: GeneratedPage;
  onSave: (updates: any) => void;
  onClose: () => void;
}

interface EditorState {
  title: string;
  heroHeadline: string;
  heroSubheadline: string;
  urgencyBadge: string;
  trustBadge: string;
  problemStatement: string;
  solutionStatement: string;
  ctaPrimaryText: string;
  ctaPrimaryUrl: string;
  ctaSecondaryText: string;
  ctaSecondaryUrl: string;
  features: { icon: string; title: string; description: string }[];
  testimonials: { quote: string; name: string; role: string }[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  showUrgencyBar: boolean;
  showProblemSolution: boolean;
  showTestimonials: boolean;
  showPricing: boolean;
  pricing: {
    planName: string;
    originalPrice: string;
    salePrice: string;
    discount: string;
  };
  guarantee: string;
}

const EMOJIS = ["🚀", "⚡", "💎", "🎯", "🔥", "✨", "💰", "🛡️", "📈", "🎨", "🔧", "⭐", "🏆", "💪", "🌟"];

export function LandingPageEditor({ page, onSave, onClose }: LandingPageEditorProps) {
  const { toast } = useToast();
  const [zoom, setZoom] = useState(50);
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [history, setHistory] = useState<EditorState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Parse initial state from page data
  const parseInitialState = (): EditorState => {
    const features = page.features || [];
    const colorScheme = page.colorScheme || {};
    
    // Try to extract content from HTML if available
    let heroHeadline = page.heroText || "Transform Your Business";
    let heroSubheadline = page.subheadline || "";
    let urgencyBadge = "🔥 Limited Time Offer";
    let trustBadge = "⭐ Trusted by 500+ Customers";
    let problemStatement = "";
    let solutionStatement = "";
    let ctaPrimaryText = "Get Started Now";
    let ctaPrimaryUrl = "#";
    let ctaSecondaryText = "Learn More";
    let ctaSecondaryUrl = "#";
    
    // Parse from HTML content if available
    if (page.htmlContent) {
      const html = page.htmlContent;
      
      // Extract headline
      const h1Match = html.match(/<h1[^>]*class="animate-fade-in[^"]*"[^>]*>([^<]+)</);
      if (h1Match) heroHeadline = h1Match[1].trim();
      
      // Extract urgency bar
      const urgencyMatch = html.match(/<div class="urgency-bar">([^<]+)</);
      if (urgencyMatch) urgencyBadge = urgencyMatch[1].trim();
      
      // Extract trust badge
      const trustMatch = html.match(/<div class="trust-badge[^"]*">([^<]+)</);
      if (trustMatch) trustBadge = trustMatch[1].trim();
    }

    return {
      title: page.title || "Landing Page",
      heroHeadline,
      heroSubheadline,
      urgencyBadge,
      trustBadge,
      problemStatement,
      solutionStatement,
      ctaPrimaryText,
      ctaPrimaryUrl,
      ctaSecondaryText,
      ctaSecondaryUrl,
      features: features.length > 0 ? features.map((f: any) => ({
        icon: f.icon || "✅",
        title: f.title || "",
        description: f.description || "",
      })) : [
        { icon: "🚀", title: "Feature One", description: "Description of feature one" },
        { icon: "⚡", title: "Feature Two", description: "Description of feature two" },
        { icon: "💎", title: "Feature Three", description: "Description of feature three" },
      ],
      testimonials: [
        { quote: "Amazing product! Highly recommend.", name: "John Doe", role: "CEO, Company" },
        { quote: "Best investment we ever made.", name: "Jane Smith", role: "Founder, Startup" },
      ],
      colors: {
        primary: colorScheme.primary || "#6366f1",
        secondary: colorScheme.secondary || "#8b5cf6",
        accent: colorScheme.accent || "#f59e0b",
        background: colorScheme.background || "#0f172a",
      },
      showUrgencyBar: true,
      showProblemSolution: true,
      showTestimonials: true,
      showPricing: true,
      pricing: {
        planName: "Premium Package",
        originalPrice: "$999",
        salePrice: "$499",
        discount: "50% OFF",
      },
      guarantee: "30-Day Money-Back Guarantee",
    };
  };

  const [editorState, setEditorState] = useState<EditorState>(parseInitialState);

  const updateState = (updates: Partial<EditorState>) => {
    const newState = { ...editorState, ...updates };
    setEditorState(newState);
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setEditorState(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setEditorState(history[historyIndex + 1]);
    }
  };

  const addFeature = () => {
    updateState({
      features: [...editorState.features, { icon: "✅", title: "New Feature", description: "Feature description" }],
    });
  };

  const removeFeature = (index: number) => {
    const newFeatures = [...editorState.features];
    newFeatures.splice(index, 1);
    updateState({ features: newFeatures });
  };

  const updateFeature = (index: number, updates: Partial<typeof editorState.features[0]>) => {
    const newFeatures = [...editorState.features];
    newFeatures[index] = { ...newFeatures[index], ...updates };
    updateState({ features: newFeatures });
  };

  const addTestimonial = () => {
    updateState({
      testimonials: [...editorState.testimonials, { quote: "New testimonial", name: "Customer", role: "Title" }],
    });
  };

  const removeTestimonial = (index: number) => {
    const newTestimonials = [...editorState.testimonials];
    newTestimonials.splice(index, 1);
    updateState({ testimonials: newTestimonials });
  };

  const updateTestimonial = (index: number, updates: Partial<typeof editorState.testimonials[0]>) => {
    const newTestimonials = [...editorState.testimonials];
    newTestimonials[index] = { ...newTestimonials[index], ...updates };
    updateState({ testimonials: newTestimonials });
  };

  // Generate HTML content
  const generatedHtml = useMemo(() => {
    const { colors, title, heroHeadline, heroSubheadline, urgencyBadge, trustBadge, 
            ctaPrimaryText, ctaPrimaryUrl, ctaSecondaryText, ctaSecondaryUrl, 
            features, testimonials, showUrgencyBar, showProblemSolution, showTestimonials, 
            showPricing, pricing, guarantee, problemStatement, solutionStatement } = editorState;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${heroSubheadline}">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #e2e8f0; background: ${colors.background}; }
    
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes glow { 0%, 100% { box-shadow: 0 0 20px ${colors.primary}40; } 50% { box-shadow: 0 0 40px ${colors.primary}60; } }
    .animate-fade-in { animation: fadeInUp 0.8s ease-out forwards; }
    .animate-glow { animation: glow 2s ease-in-out infinite; }
    
    .nav { position: fixed; top: 0; left: 0; right: 0; padding: 1rem 2rem; background: ${colors.background}ee; backdrop-filter: blur(20px); z-index: 100; border-bottom: 1px solid #1e293b; }
    .nav-content { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
    .nav-logo { font-weight: 800; font-size: 1.5rem; color: #fff; text-decoration: none; }
    .nav-logo span { color: ${colors.primary}; }
    .nav-cta { background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}); color: #000; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 700; }
    
    .urgency-bar { background: linear-gradient(90deg, ${colors.primary}, ${colors.accent}); color: #000; text-align: center; padding: 0.75rem; font-weight: 700; position: fixed; top: 65px; left: 0; right: 0; z-index: 99; }
    
    .hero { padding: ${showUrgencyBar ? '200px' : '160px'} 20px 100px; text-align: center; background: radial-gradient(ellipse at top, ${colors.primary}15 0%, transparent 50%); }
    .hero-content { max-width: 900px; margin: 0 auto; }
    .trust-badge { display: inline-flex; background: #1e293b; padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.875rem; color: ${colors.accent}; margin-bottom: 1.5rem; border: 1px solid #334155; }
    .hero h1 { font-size: clamp(2.5rem, 6vw, 4rem); margin-bottom: 1.5rem; font-weight: 800; background: linear-gradient(135deg, #fff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero p { font-size: 1.25rem; color: #94a3b8; max-width: 650px; margin: 0 auto 2.5rem; }
    
    .cta-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
    .cta-btn { padding: 16px 36px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 1.1rem; transition: all 0.3s; }
    .cta-primary { background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}); color: #000; box-shadow: 0 8px 30px ${colors.primary}50; }
    .cta-secondary { background: #1e293b; color: #fff; border: 2px solid #334155; }
    
    .section-header { text-align: center; margin-bottom: 4rem; }
    .section-badge { display: inline-block; background: ${colors.primary}20; color: ${colors.primary}; padding: 0.5rem 1.25rem; border-radius: 50px; font-size: 0.875rem; font-weight: 600; margin-bottom: 1rem; }
    .section-title { font-size: 2.5rem; font-weight: 800; color: #fff; margin-bottom: 1rem; }
    
    .problem-solution { padding: 100px 20px; max-width: 1000px; margin: 0 auto; }
    .problem-box, .solution-box { padding: 3rem; border-radius: 20px; margin-bottom: 2rem; }
    .problem-box { background: linear-gradient(135deg, #7f1d1d20, #1e293b); border: 1px solid #7f1d1d40; }
    .problem-box h2 { color: #fca5a5; margin-bottom: 1rem; }
    .solution-box { background: linear-gradient(135deg, ${colors.primary}15, #1e293b); border: 1px solid ${colors.primary}30; }
    .solution-box h2 { color: ${colors.primary}; margin-bottom: 1rem; }
    
    .benefits { padding: 80px 20px; max-width: 1200px; margin: 0 auto; }
    .benefits-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
    .benefit { background: linear-gradient(135deg, #1e293b, #0f172a); padding: 2rem; border-radius: 16px; border: 1px solid #334155; transition: all 0.3s; }
    .benefit:hover { border-color: ${colors.primary}50; transform: translateY(-5px); }
    .benefit-icon { font-size: 2.5rem; margin-bottom: 1rem; }
    .benefit h3 { font-size: 1.25rem; margin-bottom: 0.75rem; color: #fff; }
    .benefit p { color: #64748b; }
    
    .testimonials { padding: 100px 20px; }
    .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; max-width: 1200px; margin: 0 auto; }
    .testimonial { background: #1e293b; padding: 2rem; border-radius: 16px; border: 1px solid #334155; }
    .testimonial-text { font-size: 1.05rem; color: #e2e8f0; margin-bottom: 1.5rem; font-style: italic; }
    .testimonial-author { display: flex; align-items: center; gap: 1rem; }
    .testimonial-avatar { width: 50px; height: 50px; background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #000; font-weight: 700; }
    .testimonial-name { font-weight: 700; color: #fff; }
    .testimonial-role { font-size: 0.875rem; color: #64748b; }
    
    .pricing { padding: 100px 20px; }
    .pricing-card { max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: 24px; padding: 3rem; border: 2px solid ${colors.primary}50; position: relative; overflow: hidden; }
    .pricing-badge { position: absolute; top: 1.5rem; right: -2rem; background: linear-gradient(135deg, ${colors.primary}, ${colors.accent}); color: #000; padding: 0.5rem 3rem; font-weight: 700; transform: rotate(45deg); }
    .pricing-name { font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
    .pricing-original { font-size: 1.25rem; color: #64748b; text-decoration: line-through; }
    .pricing-price { font-size: 4rem; font-weight: 800; color: ${colors.primary}; margin: 1rem 0; }
    .pricing-features { list-style: none; margin-bottom: 2rem; }
    .pricing-features li { padding: 0.75rem 0; border-bottom: 1px solid #334155; color: #e2e8f0; }
    .pricing-features li::before { content: '✓'; color: ${colors.primary}; margin-right: 0.75rem; font-weight: 700; }
    .pricing-cta { width: 100%; padding: 1.25rem; background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}); color: #000; font-weight: 700; border: none; border-radius: 12px; cursor: pointer; text-decoration: none; display: block; text-align: center; }
    
    .guarantee { max-width: 600px; margin: 3rem auto 0; text-align: center; padding: 1.5rem; background: #1e293b50; border-radius: 12px; }
    .guarantee-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
    .guarantee-text { color: #94a3b8; }
    
    .final-cta { padding: 100px 20px; text-align: center; background: linear-gradient(180deg, ${colors.background}, ${colors.primary}10); }
    .final-cta h2 { font-size: 2.5rem; font-weight: 800; color: #fff; margin-bottom: 1rem; }
    .final-cta p { color: #94a3b8; margin-bottom: 2rem; }
    
    .footer { background: ${colors.background}; color: #64748b; padding: 3rem 2rem; text-align: center; border-top: 1px solid #1e293b; }
  </style>
</head>
<body>
  <nav class="nav">
    <div class="nav-content">
      <a href="#" class="nav-logo">${title}<span>.</span></a>
      <a href="${ctaPrimaryUrl}" class="nav-cta">${ctaPrimaryText} →</a>
    </div>
  </nav>

  ${showUrgencyBar ? `<div class="urgency-bar">${urgencyBadge}</div>` : ''}

  <section class="hero">
    <div class="hero-content">
      <div class="trust-badge animate-fade-in">${trustBadge}</div>
      <h1 class="animate-fade-in">${heroHeadline}</h1>
      <p class="animate-fade-in">${heroSubheadline}</p>
      <div class="cta-buttons animate-fade-in">
        <a href="${ctaPrimaryUrl}" class="cta-btn cta-primary animate-glow">${ctaPrimaryText} →</a>
        <a href="${ctaSecondaryUrl}" class="cta-btn cta-secondary">${ctaSecondaryText}</a>
      </div>
    </div>
  </section>

  ${showProblemSolution && (problemStatement || solutionStatement) ? `
  <section class="problem-solution">
    ${problemStatement ? `<div class="problem-box"><h2>😤 The Problem</h2><p>${problemStatement}</p></div>` : ''}
    ${solutionStatement ? `<div class="solution-box"><h2>✨ The Solution</h2><p>${solutionStatement}</p></div>` : ''}
  </section>
  ` : ''}

  <section class="benefits">
    <div class="section-header">
      <span class="section-badge">Why Choose Us</span>
      <h2 class="section-title">Everything You Need to Succeed</h2>
    </div>
    <div class="benefits-grid">
      ${features.map(f => `
        <div class="benefit">
          <div class="benefit-icon">${f.icon}</div>
          <h3>${f.title}</h3>
          <p>${f.description}</p>
        </div>
      `).join('')}
    </div>
  </section>

  ${showTestimonials && testimonials.length > 0 ? `
  <section class="testimonials">
    <div class="section-header">
      <span class="section-badge">Testimonials</span>
      <h2 class="section-title">What Our Clients Say</h2>
    </div>
    <div class="testimonials-grid">
      ${testimonials.map(t => `
        <div class="testimonial">
          <p class="testimonial-text">"${t.quote}"</p>
          <div class="testimonial-author">
            <div class="testimonial-avatar">${t.name.charAt(0)}</div>
            <div>
              <div class="testimonial-name">${t.name}</div>
              <div class="testimonial-role">${t.role}</div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  </section>
  ` : ''}

  ${showPricing ? `
  <section class="pricing">
    <div class="section-header">
      <span class="section-badge">Special Offer</span>
      <h2 class="section-title">Limited Time Pricing</h2>
    </div>
    <div class="pricing-card">
      <div class="pricing-badge">${pricing.discount}</div>
      <div class="pricing-name">${pricing.planName}</div>
      <div class="pricing-original">${pricing.originalPrice}</div>
      <div class="pricing-price">${pricing.salePrice}</div>
      <ul class="pricing-features">
        ${features.slice(0, 5).map(f => `<li>${f.title}</li>`).join('')}
      </ul>
      <a href="${ctaPrimaryUrl}" class="pricing-cta">${ctaPrimaryText} →</a>
    </div>
    <div class="guarantee">
      <div class="guarantee-icon">🛡️</div>
      <p class="guarantee-text">${guarantee}</p>
    </div>
  </section>
  ` : ''}

  <section class="final-cta">
    <h2>Ready to Get Started?</h2>
    <p>Join hundreds of satisfied customers who transformed their business.</p>
    <a href="${ctaPrimaryUrl}" class="cta-btn cta-primary animate-glow">${ctaPrimaryText} →</a>
  </section>

  <footer class="footer">
    <p>© ${new Date().getFullYear()} ${title}. All rights reserved.</p>
  </footer>
</body>
</html>`;
  }, [editorState]);

  const handleSave = () => {
    onSave({
      title: editorState.title,
      heroText: editorState.heroHeadline,
      subheadline: editorState.heroSubheadline,
      features: editorState.features,
      colorScheme: editorState.colors,
      htmlContent: generatedHtml,
    });
  };

  const downloadHtml = () => {
    const blob = new Blob([generatedHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${editorState.title || "landing-page"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAsImage = async (format: "png" | "jpg") => {
    toast({
      title: "Generating image...",
      description: "Please wait while we capture the landing page.",
    });

    try {
      // Create a hidden iframe to render the HTML
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.left = "-9999px";
      iframe.style.width = "1440px";
      iframe.style.height = "3000px";
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      // Write the HTML content to the iframe
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error("Could not access iframe document");
      
      iframeDoc.open();
      iframeDoc.write(generatedHtml);
      iframeDoc.close();

      // Wait for content to load (fonts, images, etc.)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Use html2canvas to capture the iframe content
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(iframeDoc.body, {
        width: 1440,
        height: iframeDoc.body.scrollHeight,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: editorState.colors.background,
        logging: false,
      });

      // Remove the iframe
      document.body.removeChild(iframe);

      // Convert to desired format and download
      const mimeType = format === "png" ? "image/png" : "image/jpeg";
      const quality = format === "jpg" ? 0.9 : undefined;
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${editorState.title || "landing-page"}.${format}`;
          a.click();
          URL.revokeObjectURL(url);
          toast({
            title: "Download complete!",
            description: `Your landing page has been saved as ${format.toUpperCase()}.`,
          });
        }
      }, mimeType, quality);
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Download failed",
        description: "Could not generate image. Try downloading as HTML instead.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col">
      {/* Top Toolbar */}
      <div className="border-b bg-card px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <span className="font-semibold">Landing Page Editor</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
            <Undo className="h-4 w-4 mr-1" /> Undo
          </Button>
          <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
            <Redo className="h-4 w-4 mr-1" /> Redo
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === "preview" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("preview")}
            >
              <Eye className="h-4 w-4 mr-1" /> Preview
            </Button>
            <Button
              variant={viewMode === "code" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("code")}
            >
              <Code className="h-4 w-4 mr-1" /> Code
            </Button>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setZoom(Math.max(25, zoom - 10))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm w-12 text-center">{zoom}%</span>
            <Button variant="ghost" size="icon" onClick={() => setZoom(Math.min(100, zoom + 10))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" /> Download
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => downloadAsImage("png")}>
                <FileImage className="h-4 w-4 mr-2" />
                Download as PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadAsImage("jpg")}>
                <Image className="h-4 w-4 mr-2" />
                Download as JPG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={downloadHtml}>
                <FileCode className="h-4 w-4 mr-2" />
                Download as HTML
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" /> Save Changes
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-96 border-r bg-card overflow-hidden flex flex-col">
          <Tabs defaultValue="content" className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-3 m-2">
              <TabsTrigger value="content" className="text-xs">
                <Type className="h-4 w-4 mr-1" /> Content
              </TabsTrigger>
              <TabsTrigger value="colors" className="text-xs">
                <Palette className="h-4 w-4 mr-1" /> Colors
              </TabsTrigger>
              <TabsTrigger value="layout" className="text-xs">
                <Layout className="h-4 w-4 mr-1" /> Layout
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              {/* Content Tab */}
              <TabsContent value="content" className="m-0 p-4 space-y-6">
                {/* Hero Section */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Hero Section</Label>
                  <div className="space-y-2">
                    <Label className="text-xs">Brand/Title</Label>
                    <Input
                      value={editorState.title}
                      onChange={(e) => updateState({ title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Headline</Label>
                    <Textarea
                      value={editorState.heroHeadline}
                      onChange={(e) => updateState({ heroHeadline: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Subheadline</Label>
                    <Textarea
                      value={editorState.heroSubheadline}
                      onChange={(e) => updateState({ heroSubheadline: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>

                <Separator />

                {/* Badges */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Badges</Label>
                  <div className="space-y-2">
                    <Label className="text-xs">Urgency Banner</Label>
                    <Input
                      value={editorState.urgencyBadge}
                      onChange={(e) => updateState({ urgencyBadge: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Trust Badge</Label>
                    <Input
                      value={editorState.trustBadge}
                      onChange={(e) => updateState({ trustBadge: e.target.value })}
                    />
                  </div>
                </div>

                <Separator />

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Call to Action</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Primary Button</Label>
                      <Input
                        value={editorState.ctaPrimaryText}
                        onChange={(e) => updateState({ ctaPrimaryText: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Primary URL</Label>
                      <Input
                        value={editorState.ctaPrimaryUrl}
                        onChange={(e) => updateState({ ctaPrimaryUrl: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Secondary Button</Label>
                      <Input
                        value={editorState.ctaSecondaryText}
                        onChange={(e) => updateState({ ctaSecondaryText: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Secondary URL</Label>
                      <Input
                        value={editorState.ctaSecondaryUrl}
                        onChange={(e) => updateState({ ctaSecondaryUrl: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Features */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Features/Benefits</Label>
                    <Button variant="outline" size="sm" onClick={addFeature}>
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  {editorState.features.map((feature, index) => (
                    <Card key={index} className="p-3">
                      <div className="flex items-start gap-2">
                        <div className="flex flex-col gap-2 flex-1">
                          <div className="flex gap-2">
                            <select
                              value={feature.icon}
                              onChange={(e) => updateFeature(index, { icon: e.target.value })}
                              className="w-16 h-9 border rounded-md bg-background px-2"
                            >
                              {EMOJIS.map((emoji) => (
                                <option key={emoji} value={emoji}>{emoji}</option>
                              ))}
                            </select>
                            <Input
                              value={feature.title}
                              onChange={(e) => updateFeature(index, { title: e.target.value })}
                              placeholder="Feature title"
                              className="flex-1"
                            />
                          </div>
                          <Textarea
                            value={feature.description}
                            onChange={(e) => updateFeature(index, { description: e.target.value })}
                            placeholder="Description"
                            rows={2}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={() => removeFeature(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                <Separator />

                {/* Testimonials */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Testimonials</Label>
                    <Button variant="outline" size="sm" onClick={addTestimonial}>
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  {editorState.testimonials.map((testimonial, index) => (
                    <Card key={index} className="p-3">
                      <div className="flex items-start gap-2">
                        <div className="flex flex-col gap-2 flex-1">
                          <Textarea
                            value={testimonial.quote}
                            onChange={(e) => updateTestimonial(index, { quote: e.target.value })}
                            placeholder="Testimonial quote"
                            rows={2}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={testimonial.name}
                              onChange={(e) => updateTestimonial(index, { name: e.target.value })}
                              placeholder="Name"
                            />
                            <Input
                              value={testimonial.role}
                              onChange={(e) => updateTestimonial(index, { role: e.target.value })}
                              placeholder="Title/Company"
                            />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={() => removeTestimonial(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                <Separator />

                {/* Pricing */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Pricing</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Plan Name</Label>
                      <Input
                        value={editorState.pricing.planName}
                        onChange={(e) => updateState({ pricing: { ...editorState.pricing, planName: e.target.value } })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Discount Badge</Label>
                      <Input
                        value={editorState.pricing.discount}
                        onChange={(e) => updateState({ pricing: { ...editorState.pricing, discount: e.target.value } })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Original Price</Label>
                      <Input
                        value={editorState.pricing.originalPrice}
                        onChange={(e) => updateState({ pricing: { ...editorState.pricing, originalPrice: e.target.value } })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Sale Price</Label>
                      <Input
                        value={editorState.pricing.salePrice}
                        onChange={(e) => updateState({ pricing: { ...editorState.pricing, salePrice: e.target.value } })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Guarantee Text</Label>
                    <Input
                      value={editorState.guarantee}
                      onChange={(e) => updateState({ guarantee: e.target.value })}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Colors Tab */}
              <TabsContent value="colors" className="m-0 p-4 space-y-4">
                <ColorPicker
                  label="Background Color"
                  value={editorState.colors.background}
                  onChange={(color) => updateState({ colors: { ...editorState.colors, background: color } })}
                />
                <ColorPicker
                  label="Primary Color"
                  value={editorState.colors.primary}
                  onChange={(color) => updateState({ colors: { ...editorState.colors, primary: color } })}
                />
                <ColorPicker
                  label="Secondary Color"
                  value={editorState.colors.secondary}
                  onChange={(color) => updateState({ colors: { ...editorState.colors, secondary: color } })}
                />
                <ColorPicker
                  label="Accent Color"
                  value={editorState.colors.accent}
                  onChange={(color) => updateState({ colors: { ...editorState.colors, accent: color } })}
                />

                <Separator />

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Color Presets</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateState({
                        colors: { primary: "#6366f1", secondary: "#8b5cf6", accent: "#f59e0b", background: "#0f172a" }
                      })}
                    >
                      Purple Night
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateState({
                        colors: { primary: "#ef4444", secondary: "#dc2626", accent: "#fbbf24", background: "#1f2937" }
                      })}
                    >
                      Red Hot
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateState({
                        colors: { primary: "#10b981", secondary: "#059669", accent: "#06b6d4", background: "#0f172a" }
                      })}
                    >
                      Ocean Green
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateState({
                        colors: { primary: "#3b82f6", secondary: "#2563eb", accent: "#22c55e", background: "#0f172a" }
                      })}
                    >
                      Blue Sky
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateState({
                        colors: { primary: "#ec4899", secondary: "#db2777", accent: "#8b5cf6", background: "#0f0f0f" }
                      })}
                    >
                      Pink Glow
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateState({
                        colors: { primary: "#f97316", secondary: "#ea580c", accent: "#fbbf24", background: "#18181b" }
                      })}
                    >
                      Sunset
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Layout Tab */}
              <TabsContent value="layout" className="m-0 p-4 space-y-4">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Section Visibility</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Urgency Banner</Label>
                      <Switch
                        checked={editorState.showUrgencyBar}
                        onCheckedChange={(checked) => updateState({ showUrgencyBar: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Problem/Solution</Label>
                      <Switch
                        checked={editorState.showProblemSolution}
                        onCheckedChange={(checked) => updateState({ showProblemSolution: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Testimonials</Label>
                      <Switch
                        checked={editorState.showTestimonials}
                        onCheckedChange={(checked) => updateState({ showTestimonials: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Pricing Section</Label>
                      <Switch
                        checked={editorState.showPricing}
                        onCheckedChange={(checked) => updateState({ showPricing: checked })}
                      />
                    </div>
                  </div>
                </div>

                {editorState.showProblemSolution && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Problem/Solution</Label>
                      <div className="space-y-2">
                        <Label className="text-xs">Problem Statement</Label>
                        <Textarea
                          value={editorState.problemStatement}
                          onChange={(e) => updateState({ problemStatement: e.target.value })}
                          placeholder="What problem does your audience face?"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Solution Statement</Label>
                        <Textarea
                          value={editorState.solutionStatement}
                          onChange={(e) => updateState({ solutionStatement: e.target.value })}
                          placeholder="How do you solve their problem?"
                          rows={3}
                        />
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Canvas/Preview Area */}
        <div className="flex-1 bg-muted/30 overflow-auto">
          {viewMode === "preview" ? (
            <div className="p-8 flex justify-center">
              <div
                className="bg-white shadow-2xl rounded-lg overflow-hidden"
                style={{
                  width: `${zoom}%`,
                  maxWidth: "1400px",
                }}
              >
                <iframe
                  srcDoc={generatedHtml}
                  className="w-full border-0"
                  style={{ height: "800px" }}
                  title="Landing Page Preview"
                />
              </div>
            </div>
          ) : (
            <div className="p-4">
              <pre className="bg-card p-4 rounded-lg overflow-auto text-xs font-mono max-h-[calc(100vh-120px)]">
                <code>{generatedHtml}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
