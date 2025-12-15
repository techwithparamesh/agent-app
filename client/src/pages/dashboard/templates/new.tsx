import { useState } from "react";
import { useLocation, Link } from "wouter";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Sparkles,
  Bot,
  MessageCircle,
  HelpCircle,
  Settings2,
  Plus,
  X,
  Save,
  Eye,
  LayoutTemplate,
  CheckCircle2,
} from "lucide-react";

interface TemplateFormData {
  name: string;
  description: string;
  category: string;
  systemPrompt: string;
  toneOfVoice: string;
  purpose: string;
  welcomeMessage: string;
  suggestedQuestions: string[];
  tags: string[];
}

const categories = [
  { value: "Retail", label: "Retail & E-Commerce" },
  { value: "Support", label: "Customer Support" },
  { value: "Education", label: "Education & Training" },
  { value: "Real Estate", label: "Real Estate" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Hospitality", label: "Hospitality" },
  { value: "Automotive", label: "Automotive" },
  { value: "Business", label: "Business & B2B" },
  { value: "Human Resources", label: "Human Resources" },
  { value: "Finance", label: "Finance & Banking" },
  { value: "Legal", label: "Legal Services" },
  { value: "Other", label: "Other" },
];

const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "enthusiastic", label: "Enthusiastic" },
  { value: "empathetic", label: "Empathetic" },
];

const purposeOptions = [
  { value: "sales", label: "Sales - Convert visitors into customers" },
  { value: "support", label: "Support - Help customers with issues" },
  { value: "informational", label: "Informational - Provide information" },
  { value: "lead_generation", label: "Lead Generation - Collect leads" },
  { value: "booking", label: "Booking - Schedule appointments" },
  { value: "education", label: "Education - Teaching and tutoring" },
  { value: "hr", label: "HR - Recruiting and employee support" },
];

export default function CreateTemplatePage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [newQuestion, setNewQuestion] = useState("");
  const [newTag, setNewTag] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState<TemplateFormData>({
    name: "",
    description: "",
    category: "",
    systemPrompt: "",
    toneOfVoice: "friendly",
    purpose: "support",
    welcomeMessage: "",
    suggestedQuestions: [],
    tags: [],
  });

  const updateField = (field: keyof TemplateFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addQuestion = () => {
    if (newQuestion.trim() && formData.suggestedQuestions.length < 6) {
      updateField("suggestedQuestions", [...formData.suggestedQuestions, newQuestion.trim()]);
      setNewQuestion("");
    }
  };

  const removeQuestion = (index: number) => {
    updateField(
      "suggestedQuestions",
      formData.suggestedQuestions.filter((_, i) => i !== index)
    );
  };

  const addTag = () => {
    if (newTag.trim() && formData.tags.length < 5 && !formData.tags.includes(newTag.trim())) {
      updateField("tags", [...formData.tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (index: number) => {
    updateField(
      "tags",
      formData.tags.filter((_, i) => i !== index)
    );
  };

  const handleCreateAgent = () => {
    if (!formData.name || !formData.category || !formData.systemPrompt) {
      toast({
        title: "Missing required fields",
        description: "Please fill in name, category, and system prompt.",
        variant: "destructive",
      });
      return;
    }

    // Store template in sessionStorage and redirect to create agent
    sessionStorage.setItem("agentTemplate", JSON.stringify({
      name: formData.name,
      description: formData.description,
      systemPrompt: formData.systemPrompt,
      toneOfVoice: formData.toneOfVoice,
      purpose: formData.purpose,
      welcomeMessage: formData.welcomeMessage,
      suggestedQuestions: formData.suggestedQuestions,
      category: formData.category,
    }));

    toast({
      title: "Template ready!",
      description: "Redirecting to create your agent...",
    });

    setLocation("/dashboard/agents/new");
  };

  const handleSaveTemplate = () => {
    if (!formData.name || !formData.category || !formData.systemPrompt) {
      toast({
        title: "Missing required fields",
        description: "Please fill in name, category, and system prompt.",
        variant: "destructive",
      });
      return;
    }

    // For now, save to localStorage (in production, this would be an API call)
    const savedTemplates = JSON.parse(localStorage.getItem("customTemplates") || "[]");
    const newTemplate = {
      id: `custom_${Date.now()}`,
      ...formData,
      createdAt: new Date().toISOString(),
    };
    savedTemplates.push(newTemplate);
    localStorage.setItem("customTemplates", JSON.stringify(savedTemplates));

    toast({
      title: "Template saved!",
      description: "Your custom template has been saved successfully.",
    });

    setLocation("/dashboard/templates");
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard/templates">
            <Button variant="ghost" className="group">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Templates
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
              <Eye className="mr-2 h-4 w-4" />
              {showPreview ? "Hide Preview" : "Preview"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className={`${showPreview ? "lg:col-span-2" : "lg:col-span-3"} space-y-6`}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <LayoutTemplate className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="font-display text-2xl">Create Custom Template</CardTitle>
                    <CardDescription>
                      Design a reusable AI agent template for your specific use case
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Basic Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Template Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Customer Service Pro"
                        value={formData.name}
                        onChange={(e) => updateField("name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select value={formData.category} onValueChange={(v) => updateField("category", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Briefly describe what this template is for..."
                      rows={2}
                      value={formData.description}
                      onChange={(e) => updateField("description", e.target.value)}
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label>Tags (up to 5)</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" variant="outline" onClick={addTag} disabled={formData.tags.length >= 5}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="gap-1">
                            {tag}
                            <button onClick={() => removeTag(i)} className="ml-1 hover:text-destructive">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Agent Behavior */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <Settings2 className="h-4 w-4" />
                    Agent Behavior
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tone">Tone of Voice</Label>
                      <Select value={formData.toneOfVoice} onValueChange={(v) => updateField("toneOfVoice", v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {toneOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="purpose">Purpose</Label>
                      <Select value={formData.purpose} onValueChange={(v) => updateField("purpose", v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {purposeOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="systemPrompt">
                      System Prompt * <span className="text-xs text-muted-foreground">(Define AI behavior)</span>
                    </Label>
                    <Textarea
                      id="systemPrompt"
                      placeholder="You are a helpful assistant that... Define the AI's personality, knowledge boundaries, and behavior guidelines."
                      rows={6}
                      className="font-mono text-sm"
                      value={formData.systemPrompt}
                      onChange={(e) => updateField("systemPrompt", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Tip: Be specific about what the AI should and shouldn't do. Include industry-specific knowledge and response guidelines.
                    </p>
                  </div>
                </div>

                {/* Chat Experience */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Chat Experience
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="welcomeMessage">Welcome Message</Label>
                    <Textarea
                      id="welcomeMessage"
                      placeholder="Hi! 👋 How can I help you today?"
                      rows={2}
                      value={formData.welcomeMessage}
                      onChange={(e) => updateField("welcomeMessage", e.target.value)}
                    />
                  </div>

                  {/* Suggested Questions */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      Suggested Questions (up to 6)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a starter question..."
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addQuestion())}
                      />
                      <Button type="button" variant="outline" onClick={addQuestion} disabled={formData.suggestedQuestions.length >= 6}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {formData.suggestedQuestions.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {formData.suggestedQuestions.map((q, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                            <span className="flex-1 text-sm">"{q}"</span>
                            <button onClick={() => removeQuestion(i)} className="hover:text-destructive">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                  <Button variant="outline" className="flex-1" onClick={handleSaveTemplate}>
                    <Save className="mr-2 h-4 w-4" />
                    Save as Template
                  </Button>
                  <Button className="flex-1" onClick={handleCreateAgent}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create Agent Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Preview Card */}
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{formData.name || "Template Name"}</h4>
                        <Badge variant="outline" className="text-xs mt-1">
                          {formData.category || "Category"}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {formData.description || "Template description will appear here..."}
                    </p>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {formData.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Chat Preview */}
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <p className="text-xs font-medium text-muted-foreground mb-2">CHAT PREVIEW</p>
                    <div className="flex gap-2 items-start">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Bot className="h-3 w-3 text-primary-foreground" />
                      </div>
                      <div className="bg-background rounded-lg p-2 text-sm">
                        {formData.welcomeMessage || "Hi! 👋 How can I help you today?"}
                      </div>
                    </div>
                  </div>

                  {/* Questions Preview */}
                  {formData.suggestedQuestions.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">QUICK QUESTIONS</p>
                      <div className="flex flex-wrap gap-1">
                        {formData.suggestedQuestions.map((q, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {q.length > 25 ? q.slice(0, 25) + "..." : q}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
