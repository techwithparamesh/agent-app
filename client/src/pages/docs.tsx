import { DocsContent } from "@/pages/dashboard/docs";
import Navbar from "@/components/navbar";

export default function PublicDocs() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <DocsContent />
      </div>
    </div>
  );
}
