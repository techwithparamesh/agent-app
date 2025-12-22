import { DocsContent } from "@/pages/dashboard/docs";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function PublicDocs() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <DocsContent />
      </main>
      <Footer />
    </div>
  );
}
