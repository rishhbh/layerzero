import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Layers, Zap, Globe, FileText, Cpu, Sparkles, Languages, ArrowRight, CheckCircle2 } from 'lucide-react';

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
  const { loading } = useAuth();

  if (loading) return null;

  return (
    <div className="flex flex-col bg-background text-foreground font-sans">
      {/* Vertically Balanced Hero Section */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center py-10 md:py-16 overflow-hidden px-6 md:px-12 border-b border-border">
        {/* Soft Pastel Atmospheric Gradient Orbs */}
        <div className="gradient-orb gradient-orb-peach w-[400px] h-[400px] top-[-60px] left-[-60px] -z-0" />
        <div className="gradient-orb gradient-orb-sky w-[350px] h-[350px] top-[10%] right-[-40px] -z-0" />

        <div className="container mx-auto max-w-6xl relative z-10 my-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column: Headline & Action */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              <div className="inline-flex items-center space-x-2 bg-secondary text-secondary-foreground border border-border px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider mb-4 animate-badge-pulse">
                <Zap className="h-3.5 w-3.5" />
                <span>layerzero v1.0 is live</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-light tracking-tight text-foreground mb-4 leading-[1.1] max-w-2xl">
                Hybrid AI summarization for intelligent document & web workflows.
              </h1>
              
              <p className="text-sm md:text-base text-muted-foreground max-w-xl mb-6 leading-relaxed font-sans">
                Extract, process, and summarize complex content from web pages and documents using cloud models (Gemini, Cerebras), local privacy engines (Gemma), or native multilingual pipelines (Sarvam).
              </p>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto mb-8">
                <Button 
                  asChild 
                  size="lg" 
                  className="h-11 px-8 text-base rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-all"
                >
                  <Link to="/register" className="flex items-center justify-center space-x-2">
                    <span>Get Started</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg" 
                  className="h-11 px-8 text-base rounded-full border-input text-foreground hover:bg-secondary transition-all"
                >
                  <Link to="/about">Platform Architecture</Link>
                </Button>
              </div>

              <div className="pt-6 border-t border-border w-full flex flex-wrap gap-6 text-xs font-medium text-muted-foreground tracking-wider uppercase">
                <div className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-foreground" /> PDF & DOCX Parsing</div>
                <div className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-foreground" /> DOM Extraction</div>
                <div className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-foreground" /> 4 Model Engines</div>
              </div>
            </div>

            {/* Right Column: Compact Editorial Showcase Card */}
            <div className="lg:col-span-5 w-full">
              <div className="editorial-card p-6 bg-card border border-border rounded-2xl relative shadow-sm">
                <div className="gradient-orb gradient-orb-mint w-[180px] h-[180px] bottom-[-20px] right-[-20px] -z-0" />
                <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 rounded-full bg-[#16a34a]" />
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Live Engine Routing</span>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground">layerzero-core</span>
                </div>

                <div className="space-y-3 text-left">
                  <div className="p-3 rounded-xl bg-background border border-border">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-0.5">Provider</span>
                    <span className="text-xs font-heading font-medium text-foreground">Cerebras GPT-OSS-120B</span>
                  </div>

                  <div className="p-3 rounded-xl bg-background border border-border">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-0.5">Source Input</span>
                    <span className="text-xs font-sans text-muted-foreground line-clamp-1">Financial Analysis Report Q3 2026.pdf</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-secondary border border-border">
                    <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider block mb-1.5">Executive Summary</span>
                    <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                      Revenue grew 24% YoY driven by enterprise adoption. Margin expansion reached 32% with operational efficiency gains across all regional clusters.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-background border-b border-border px-6 md:px-12 relative overflow-hidden">
        <div className="gradient-orb gradient-orb-lavender w-[350px] h-[350px] bottom-0 right-0 -z-0" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <ScrollSection>
            <div className="text-left mb-12 max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">Capabilities</span>
              <h2 className="text-3xl md:text-4xl font-heading font-light text-foreground mb-3">Built for Editorial Precision</h2>
              <p className="text-muted-foreground text-sm md:text-base font-sans">A modular system for extracting, structuring, and synthesizing dense information.</p>
            </div>
          </ScrollSection>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            <FeatureCard 
              icon={<Globe className="h-5 w-5 text-foreground" />}
              title="Web Scraping & Parsing"
              description="Strips away noise, sidebars, and ads to extract clean editorial text from any website URL."
              delayClass="delay-50"
            />
            <FeatureCard 
              icon={<FileText className="h-5 w-5 text-foreground" />}
              title="Document Processing"
              description="Upload PDF or DOCX files directly. Structural parser maintains context across complex pages."
              delayClass="delay-100"
            />
            <FeatureCard 
              icon={<Layers className="h-5 w-5 text-foreground" />}
              title="Gemini 2.5 Flash"
              description="Cloud model optimized for deep context synthesis across extensive multi-page documents."
              delayClass="delay-150"
            />
            <FeatureCard 
              icon={<Sparkles className="h-5 w-5 text-foreground" />}
              title="Cerebras GPT-OSS-120B"
              description="Ultra-fast 120B open weights inference delivering instant synthesis at hardware scale."
              delayClass="delay-200"
            />
            <FeatureCard 
              icon={<Cpu className="h-5 w-5 text-foreground" />}
              title="Gemma Local Inference"
              description="On-device Gemma models for complete privacy without sending data outside your environment."
              delayClass="delay-250"
            />
            <FeatureCard 
              icon={<Languages className="h-5 w-5 text-foreground" />}
              title="Sarvam Multilingual"
              description="Native support for Hinglish and Indian regional languages without phrase loss."
              delayClass="delay-300"
            />
          </div>
        </div>
      </section>

      {/* Editorial Split CTA Section */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-background relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <ScrollSection>
            <div className="editorial-card p-8 md:p-12 bg-card border border-border rounded-2xl relative overflow-hidden text-left">
              <div className="gradient-orb gradient-orb-rose w-[300px] h-[300px] top-[-60px] right-[-60px] -z-0" />
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                <div className="lg:col-span-8">
                  <span className="inline-block px-3.5 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-semibold uppercase tracking-wider mb-3">Hybrid Engine</span>
                  <h2 className="text-3xl md:text-4xl font-heading font-light text-foreground mb-3">Experience layerzero</h2>
                  <p className="text-muted-foreground max-w-xl text-sm md:text-base font-sans leading-relaxed">
                    Seamless dispatch between local model execution and high-performance cloud providers tailored to your privacy requirements.
                  </p>
                </div>
                <div className="lg:col-span-4 flex lg:justify-end">
                  <Button asChild size="lg" className="rounded-full bg-primary text-primary-foreground hover:opacity-90 px-8 h-11 text-base">
                    <Link to="/register">Get Started Now</Link>
                  </Button>
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
  return (
    <ScrollSection delayClass={delayClass}>
      <div className="editorial-card p-6 bg-card border border-border rounded-2xl hover:border-input transition-all h-full flex flex-col justify-between">
        <div>
          <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center mb-4">
            {icon}
          </div>
          <h3 className="text-lg font-heading font-normal mb-2 text-foreground">{title}</h3>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-sans">{description}</p>
        </div>
      </div>
    </ScrollSection>
  );
};

export default Home;
