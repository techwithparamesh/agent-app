import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { PosterEditor } from "@/components/poster-editor";
import type { GeneratedPoster } from "@shared/schema";
import {
  Image,
  Sparkles,
  Loader2,
  Download,
  Eye,
  Trash2,
  Clock,
  Globe,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Edit,
  Pencil,
  FileImage,
  FileCode,
  ChevronDown,
} from "lucide-react";

const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: Instagram },
  { id: "facebook", name: "Facebook", icon: Facebook },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin },
  { id: "twitter", name: "Twitter/X", icon: Twitter },
];

const SIZES: Record<string, { id: string; name: string; dimensions: string }[]> = {
  instagram: [
    { id: "post", name: "Square Post", dimensions: "1080×1080" },
    { id: "story", name: "Story/Reel", dimensions: "1080×1920" },
    { id: "landscape", name: "Landscape", dimensions: "1080×566" },
  ],
  facebook: [
    { id: "post", name: "Post", dimensions: "1200×630" },
    { id: "cover", name: "Cover Photo", dimensions: "820×312" },
    { id: "story", name: "Story", dimensions: "1080×1920" },
  ],
  linkedin: [
    { id: "post", name: "Post", dimensions: "1200×627" },
    { id: "cover", name: "Banner", dimensions: "1584×396" },
  ],
  twitter: [
    { id: "post", name: "Post", dimensions: "1200×675" },
    { id: "header", name: "Header", dimensions: "1500×500" },
  ],
};

export default function PostersPage() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [generationMode, setGenerationMode] = useState<"prompt" | "website">("prompt");
  const [platform, setPlatform] = useState("instagram");
  const [size, setSize] = useState("post");
  const [selectedPoster, setSelectedPoster] = useState<GeneratedPoster | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const { data: posters, isLoading } = useQuery<GeneratedPoster[]>({
    queryKey: ["/api/posters"],
    refetchOnMount: "always",
    staleTime: 0,
  });

  const generateMutation = useMutation({
    mutationFn: async (data: { prompt?: string; websiteUrl?: string; platform: string; size: string }) => {
      const response = await apiRequest("POST", "/api/posters/generate", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw { ...errorData, status: response.status };
      }
      return response.json();
    },
    onSuccess: (poster) => {
      queryClient.invalidateQueries({ queryKey: ["/api/posters"] });
      setSelectedPoster(poster);
      setPrompt("");
      setWebsiteUrl("");
      toast({
        title: "Poster generated!",
        description: "Your promotional poster has been created successfully.",
      });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in again.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate poster. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/posters/${id}`);
      if (!response.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posters"] });
      setSelectedPoster(null);
      toast({
        title: "Poster deleted",
        description: "The poster has been removed.",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const response = await apiRequest("PUT", `/api/posters/${id}`, updates);
      if (!response.ok) throw new Error("Failed to update");
      return response.json();
    },
    onSuccess: (updatedPoster) => {
      queryClient.invalidateQueries({ queryKey: ["/api/posters"] });
      setSelectedPoster(updatedPoster);
      setShowEditor(false);
      toast({
        title: "Poster updated!",
        description: "Your changes have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEditorSave = (updates: any) => {
    if (selectedPoster) {
      updateMutation.mutate({ id: selectedPoster.id, updates });
    }
  };

  const handleGenerate = () => {
    if (generationMode === "prompt" && !prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a description for your poster.",
        variant: "destructive",
      });
      return;
    }

    if (generationMode === "website" && !websiteUrl.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a website URL.",
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate({
      prompt: generationMode === "prompt" ? prompt : undefined,
      websiteUrl: generationMode === "website" ? websiteUrl : undefined,
      platform,
      size,
    });
  };

  const downloadPoster = (poster: GeneratedPoster, format: "svg" | "png" | "jpg") => {
    if (!poster.svgContent) return;

    if (format === "svg") {
      const blob = new Blob([poster.svgContent], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${poster.title || "poster"}-${poster.platform}-${poster.size}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Convert SVG to PNG or JPG
      const svgBlob = new Blob([poster.svgContent], { type: "image/svg+xml" });
      const url = URL.createObjectURL(svgBlob);
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        // Use higher resolution for better quality
        const scale = 2;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0);
          const mimeType = format === "png" ? "image/png" : "image/jpeg";
          const quality = format === "jpg" ? 0.92 : undefined;
          canvas.toBlob((blob) => {
            if (blob) {
              const imageUrl = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = imageUrl;
              a.download = `${poster.title || "poster"}-${poster.platform}-${poster.size}.${format}`;
              a.click();
              URL.revokeObjectURL(imageUrl);
            }
          }, mimeType, quality);
        }
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  };

  const getPlatformIcon = (platformId: string) => {
    const platform = PLATFORMS.find((p) => p.id === platformId);
    if (!platform) return Globe;
    return platform.icon;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Image className="h-8 w-8 text-primary" />
            Promotional Posters
          </h1>
          <p className="text-muted-foreground mt-2">
            Create stunning promotional posters for Instagram, Facebook, LinkedIn & Twitter
          </p>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Generator */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Create New Poster
              </CardTitle>
              <CardDescription>
                Generate eye-catching promotional posters with AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Platform Selection */}
              <div className="space-y-3">
                <Label>Platform</Label>
                <div className="grid grid-cols-4 gap-2">
                  {PLATFORMS.map((p) => {
                    const Icon = p.icon;
                    return (
                      <Button
                        key={p.id}
                        variant={platform === p.id ? "default" : "outline"}
                        className="flex flex-col h-auto py-3 gap-1"
                        onClick={() => {
                          setPlatform(p.id);
                          setSize(SIZES[p.id]?.[0]?.id || "post");
                        }}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs">{p.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Size Selection */}
              <div className="space-y-2">
                <Label>Size</Label>
                <Select value={size} onValueChange={setSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZES[platform]?.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} ({s.dimensions})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Generation Mode Tabs */}
              <Tabs value={generationMode} onValueChange={(v) => setGenerationMode(v as "prompt" | "website")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="prompt">
                    <Sparkles className="h-4 w-4 mr-2" />
                    From Prompt
                  </TabsTrigger>
                  <TabsTrigger value="website">
                    <Globe className="h-4 w-4 mr-2" />
                    From Website
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="prompt" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Describe your poster</Label>
                    <Textarea
                      placeholder="E.g., Black Friday sale poster for electronics store, 50% off all items, modern dark theme with orange accents..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="website" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Website URL</Label>
                    <Input
                      placeholder="https://example.com"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      We'll extract your brand info to create a matching poster
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="w-full btn-shine"
                size="lg"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Poster
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Preview
              </CardTitle>
              <CardDescription>
                {selectedPoster ? `${selectedPoster.platform} ${selectedPoster.size}` : "Select a poster to preview"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedPoster?.svgContent ? (
                <div className="space-y-4">
                  <div 
                    className="border rounded-lg overflow-hidden bg-muted flex items-center justify-center p-2"
                  >
                    <div
                      dangerouslySetInnerHTML={{ __html: selectedPoster.svgContent }}
                      className="w-full flex items-center justify-center"
                      style={{
                        maxHeight: "400px",
                      }}
                    />
                  </div>
                  <div className="text-center text-sm text-muted-foreground">
                    {selectedPoster.headline && <p className="font-semibold text-foreground">{selectedPoster.headline}</p>}
                    {selectedPoster.platform} • {selectedPoster.size}
                  </div>
                  
                  {/* Edit Button - Prominent */}
                  <Button
                    onClick={() => setShowEditor(true)}
                    className="w-full btn-shine"
                    size="lg"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Poster (Text, Colors, Shapes)
                  </Button>
                  
                  {/* Download Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full" size="lg">
                        <Download className="mr-2 h-4 w-4" />
                        Download Poster
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-48">
                      <DropdownMenuItem onClick={() => downloadPoster(selectedPoster, "png")}>
                        <FileImage className="h-4 w-4 mr-2" />
                        Download as PNG
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => downloadPoster(selectedPoster, "jpg")}>
                        <Image className="h-4 w-4 mr-2" />
                        Download as JPG
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => downloadPoster(selectedPoster, "svg")}>
                        <FileCode className="h-4 w-4 mr-2" />
                        Download as SVG
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => selectedPoster && deleteMutation.mutate(selectedPoster.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Poster
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Image className="h-16 w-16 mb-4 opacity-20" />
                  <p>No poster selected</p>
                  <p className="text-sm">Generate or select a poster to preview</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Saved Posters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Your Posters
            </CardTitle>
            <CardDescription>
              All your generated promotional posters
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-lg" />
                ))}
              </div>
            ) : posters && posters.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {posters.map((poster) => {
                  const PlatformIcon = getPlatformIcon(poster.platform || "instagram");
                  return (
                    <div
                      key={poster.id}
                      role="button"
                      tabIndex={0}
                      className={`group relative border rounded-lg overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary hover:shadow-lg ${
                        selectedPoster?.id === poster.id ? "ring-2 ring-primary bg-accent/10" : ""
                      }`}
                      onClick={() => setSelectedPoster(poster)}
                      onKeyDown={(e) => e.key === 'Enter' && setSelectedPoster(poster)}
                    >
                      {poster.svgContent ? (
                        <div 
                          className="aspect-square bg-muted flex items-center justify-center overflow-hidden"
                          style={{ minHeight: "150px", maxHeight: "200px" }}
                        >
                          <div 
                            dangerouslySetInnerHTML={{ __html: poster.svgContent }}
                            className="w-full h-full flex items-center justify-center poster-thumbnail"
                            style={{ pointerEvents: "none" }}
                          />
                        </div>
                      ) : (
                        <div className="aspect-square bg-muted flex items-center justify-center" style={{ minHeight: "150px" }}>
                          <Image className="h-8 w-8 opacity-20" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-8">
                        <div className="flex items-center gap-2">
                          <PlatformIcon className="h-4 w-4 text-white" />
                          <span className="text-xs text-white capitalize">
                            {poster.platform} • {poster.size}
                          </span>
                        </div>
                        {(poster.headline || poster.title) && (
                          <p className="text-sm font-medium text-white truncate mt-1">
                            {poster.headline || poster.title}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="secondary"
                        className="absolute top-2 right-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {new Date(poster.createdAt!).toLocaleDateString()}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Image className="h-16 w-16 mb-4 opacity-20" />
                <p className="font-medium">No posters yet</p>
                <p className="text-sm">Generate your first promotional poster above</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Poster Editor Modal */}
      {showEditor && selectedPoster && (
        <PosterEditor
          poster={selectedPoster}
          onSave={handleEditorSave}
          onClose={() => setShowEditor(false)}
        />
      )}
    </DashboardLayout>
  );
}
