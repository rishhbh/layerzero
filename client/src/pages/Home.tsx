import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Layers, Zap, Shield, Globe, FileText, Cpu } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden flex flex-col items-center justify-center text-center px-4">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10" />
        
        <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
          <Zap className="h-4 w-4" />
          <span>LayerZero v1.0 is now live</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter max-w-4xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 mb-6">
          Hybrid AI summarization powered by cloud and local language models.
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
          Extract, process, and summarize content from the web or documents using Gemini and local Gemma inference. Secure, fast, and developer-focused.
        </p>
        
        <div className="flex items-center space-x-4">
          <Button asChild size="lg" className="h-12 px-8 text-base">
            <Link to="/register">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base bg-background/50 backdrop-blur">
            <Link to="/about">Learn More</Link>
          </Button>
        </div>
        
        <div className="mt-16 pt-8 border-t border-border w-full max-w-3xl flex justify-center space-x-12 text-sm font-medium text-muted-foreground">
          <div className="flex items-center"><FileText className="mr-2 h-4 w-4" /> PDF & DOCX</div>
          <div className="flex items-center"><Globe className="mr-2 h-4 w-4" /> URLs</div>
          <div className="flex items-center"><Cpu className="mr-2 h-4 w-4" /> Gemini & Gemma</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card/30 border-y border-border px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to process large context sizes effectively.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Globe className="h-6 w-6 text-primary" />}
              title="Website Summarization"
              description="Extract clean text content from any URL, removing clutter, ads, and navigation elements automatically."
            />
            <FeatureCard 
              icon={<FileText className="h-6 w-6 text-primary" />}
              title="Document Summarization"
              description="Upload PDF or DOCX files directly. We parse the document structure and summarize complex information."
            />
            <FeatureCard 
              icon={<Layers className="h-6 w-6 text-primary" />}
              title="Gemini Integration"
              description="Leverage Google's powerful Gemini Pro models for high-quality, nuanced summaries of large texts."
            />
            <FeatureCard 
              icon={<Cpu className="h-6 w-6 text-primary" />}
              title="Gemma Local Inference"
              description="Use on-device/local Gemma models for privacy-focused summarization without sending data to the cloud."
            />
            <FeatureCard 
              icon={<Shield className="h-6 w-6 text-primary" />}
              title="Secure Authentication"
              description="Enterprise-grade security protecting your data and your summary history."
            />
            <FeatureCard 
              icon={<Zap className="h-6 w-6 text-primary" />}
              title="Hybrid Architecture"
              description="Seamlessly switch between cloud and local inference based on your privacy requirements."
            />
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">A modern, efficient pipeline for content processing.</p>
          </div>
          
          <div className="relative border border-border bg-card/50 rounded-2xl p-8 md:p-12 backdrop-blur-sm">
            <div className="flex flex-col items-center space-y-8 relative z-10">
              <div className="bg-background border border-border rounded-xl p-4 w-48 text-center font-medium shadow-sm">
                Raw Content (URL/PDF)
              </div>
              <div className="h-8 w-px bg-primary relative">
                <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-2 bg-primary rotate-45 transform origin-top-left border-r border-b border-primary" />
              </div>
              <div className="bg-background border border-border rounded-xl p-4 w-48 text-center font-medium shadow-sm">
                Extraction & Parsing
              </div>
              <div className="h-8 w-px bg-primary relative">
                <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-2 bg-primary rotate-45 transform origin-top-left border-r border-b border-primary" />
              </div>
              <div className="flex space-x-8">
                <div className="bg-background border-2 border-primary/50 text-primary rounded-xl p-4 w-40 text-center font-medium shadow-sm">
                  Gemini (Cloud)
                </div>
                <div className="bg-background border border-border rounded-xl p-4 w-40 text-center font-medium shadow-sm text-muted-foreground">
                  Gemma (Local)
                </div>
              </div>
              <div className="h-8 w-px bg-primary relative">
                <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-2 bg-primary rotate-45 transform origin-top-left border-r border-b border-primary" />
              </div>
              <div className="bg-primary/10 border border-primary/30 text-primary rounded-xl p-4 w-56 text-center font-bold shadow-lg">
                Markdown Summary
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="p-6 border border-border bg-background rounded-xl hover:border-primary/50 transition-colors group">
    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

export default Home;
