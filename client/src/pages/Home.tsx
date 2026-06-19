import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Layers, Zap, Shield, Globe, FileText, Cpu, Sparkles, Languages } from 'lucide-react';
import { cn } from '../lib/utils';

const ScrollSection: React.FC<{ children: React.ReactNode, delayClass?: string }> = ({ children, delayClass = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${isVisible ? 'is-visible' : ''} ${delayClass}`}
    >
      {children}
    </div>
  );
};

const Home: React.FC = () => {
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--x', `${x}px`);
    e.currentTarget.style.setProperty('--y', `${y}px`);
  };

  return (
    <div className="flex flex-col animate-blur-fade-in">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden flex flex-col items-center justify-center text-center px-4">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.03] rounded-none blur-[120px] -z-10" />
        
        <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-none text-sm font-medium mb-8 animate-badge-pulse">
          <Zap className="h-4 w-4" />
          <span className="font-heading">LayerZero v1.0 is now live</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tighter max-w-4xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 mb-6">
          Hybrid AI summarization powered by cloud and local language models.
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
          Extract, process, and summarize content from the web or documents using cloud models (Gemini, Cerebras), local inference (Gemma), or multilingual pipelines (Sarvam). Secure, fast, and developer-focused.
        </p>
        
        <div className="flex items-center space-x-4">
          <Button 
            asChild 
            size="lg" 
            className="h-12 px-8 text-base rounded-none spotlight-card"
            onMouseMove={handleMouseMove}
          >
            <Link to="/register">Get Started</Link>
          </Button>
          <Button 
            asChild 
            variant="outline" 
            size="lg" 
            className="h-12 px-8 text-base bg-background/50 backdrop-blur rounded-none spotlight-card"
            onMouseMove={handleMouseMove}
          >
            <Link to="/about">Learn More</Link>
          </Button>
        </div>
        
        <div className="mt-16 pt-8 border-t border-border w-full max-w-3xl flex justify-center space-x-12 text-sm font-medium text-muted-foreground">
          <div className="flex items-center"><FileText className="mr-2 h-4 w-4" /> PDF & DOCX</div>
          <div className="flex items-center"><Globe className="mr-2 h-4 w-4" /> URLs</div>
          <div className="flex items-center"><Cpu className="mr-2 h-4 w-4" /> 4 AI Models</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card/30 border-y border-border px-4">
        <div className="container mx-auto max-w-6xl">
          <ScrollSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Powerful Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to process large context sizes effectively.</p>
            </div>
          </ScrollSection>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Globe className="h-6 w-6 text-primary" />}
              title="Website Summarization"
              description="Extract clean text content from any URL, removing clutter, ads, and navigation elements automatically."
              delayClass="delay-50"
            />
            <FeatureCard 
              icon={<FileText className="h-6 w-6 text-primary" />}
              title="Document Summarization"
              description="Upload PDF or DOCX files directly. We parse the document structure and summarize complex information."
              delayClass="delay-100"
            />
            <FeatureCard 
              icon={<Layers className="h-6 w-6 text-primary" />}
              title="Gemini Integration"
              description="Leverage Google's powerful Gemini Pro models for high-quality, nuanced summaries of large texts."
              delayClass="delay-150"
            />
            <FeatureCard 
              icon={<Sparkles className="h-6 w-6 text-primary" />}
              title="GPT OSS via Cerebras"
              description="Fast, open-source 120B inference served through Cerebras hardware — a powerful cloud option outside the Gemini ecosystem."
              delayClass="delay-200"
            />
            <FeatureCard 
              icon={<Cpu className="h-6 w-6 text-primary" />}
              title="Gemma Local Inference"
              description="Use on-device/local Gemma models for privacy-focused summarization without sending data to the cloud."
              delayClass="delay-250"
            />
            <FeatureCard 
              icon={<Languages className="h-6 w-6 text-primary" />}
              title="Sarvam Multilingual"
              description="Native Hinglish and multilingual support for users who think and write across English and Indian languages."
              delayClass="delay-300"
            />
            <FeatureCard 
              icon={<Shield className="h-6 w-6 text-primary" />}
              title="Secure Authentication"
              description="Enterprise-grade security protecting your data and your summary history."
              delayClass="delay-350"
            />
            <FeatureCard 
              icon={<Zap className="h-6 w-6 text-primary" />}
              title="Hybrid Architecture"
              description="Seamlessly switch between cloud and local inference based on your privacy requirements."
              delayClass="delay-400"
            />
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <ScrollSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">A modern, efficient pipeline for content processing.</p>
            </div>
          </ScrollSection>
          
          <ScrollSection delayClass="delay-100">
            <div className="relative rounded-none p-8 md:p-12 glass-surface">
              <div className="flex flex-col items-center space-y-8 relative z-10">
                <div className="bg-background border border-border rounded-none p-4 w-48 text-center font-medium shadow-sm">
                  Raw Content (URL/PDF)
                </div>
                <div className="h-8 w-px bg-primary relative animate-slow-pulse">
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-2 bg-primary rotate-45 transform origin-top-left border-r border-b border-primary" />
                </div>
                <div className="bg-background border border-border rounded-none p-4 w-48 text-center font-medium shadow-sm">
                  Extraction & Parsing
                </div>
                <div className="h-8 w-px bg-primary relative animate-slow-pulse">
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-2 bg-primary rotate-45 transform origin-top-left border-r border-b border-primary" />
                </div>
                <div className="flex flex-wrap gap-4 justify-center w-full max-w-2xl">
                  <div className="bg-background/85 border border-border rounded-none p-4 w-36 text-center font-medium glass-surface hover:scale-105 transition-transform duration-200">
                    Gemini (Cloud)
                  </div>
                  <div className="bg-background/85 border border-border rounded-none p-4 w-36 text-center font-medium glass-surface hover:scale-105 transition-transform duration-200">
                    Cerebras (Cloud)
                  </div>
                  <div className="bg-background/85 border border-border rounded-none p-4 w-36 text-center font-medium glass-surface hover:scale-105 transition-transform duration-200">
                    Gemma (Local)
                  </div>
                  <div className="bg-background/85 border border-border rounded-none p-4 w-36 text-center font-medium glass-surface hover:scale-105 transition-transform duration-200">
                    Sarvam (Cloud)
                  </div>
                </div>
                <div className="h-8 w-px bg-primary relative animate-slow-pulse">
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-2 bg-primary rotate-45 transform origin-top-left border-r border-b border-primary" />
                </div>
                <div className="bg-primary/10 border border-primary/30 text-primary rounded-none p-4 w-56 text-center font-bold">
                  Markdown Summary
                </div>
              </div>
            </div>
          </ScrollSection>
        </div>
      </section>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delayClass?: string;
}

const FeatureCard = ({ icon, title, description, delayClass }: FeatureCardProps) => {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--x', `${x}px`);
    e.currentTarget.style.setProperty('--y', `${y}px`);
  };

  return (
    <ScrollSection delayClass={delayClass}>
      <div 
        onMouseMove={handleMouseMove}
        className={cn(
          "p-6 border border-border bg-background rounded-none hover:border-primary transition-all duration-200 hover:scale-102 ease-out group spotlight-card",
        )}
      >
        <div className="w-12 h-12 bg-primary/10 rounded-none flex items-center justify-center mb-4 group-hover:scale-105 group-hover:bg-primary/20 group-hover:text-primary transition-all duration-200">
          {icon}
        </div>
        <h3 className="text-xl font-heading font-semibold mb-2 text-foreground relative z-10">{title}</h3>
        <p className="text-muted-foreground leading-relaxed relative z-10">{description}</p>
      </div>
    </ScrollSection>
  );
};

export default Home;
