import React, { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Layers, Zap, Server } from 'lucide-react';

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

const About: React.FC = () => {
  return (
    <div className="container mx-auto px-6 md:px-12 py-16 md:py-24 max-w-5xl text-foreground font-sans">
      <ScrollSection delayClass="delay-50">
        <div className="text-left mb-16 relative border-b border-border pb-12">
          <div className="gradient-orb gradient-orb-mint w-[300px] h-[300px] top-[-50px] left-[10%] -z-0" />
          <span className="inline-block px-3.5 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-semibold uppercase tracking-wider mb-4">Platform Documentation</span>
          <h1 className="text-4xl md:text-6xl font-heading font-light tracking-tight text-foreground mb-4">About layerzero</h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl font-sans leading-relaxed">
            A hybrid AI summarization architecture built for quiet, high-density editorial workflows.
          </p>
        </div>
      </ScrollSection>

      <div className="space-y-12 text-left">
        <ScrollSection>
          <section className="editorial-card p-8 md:p-10 bg-card border border-border rounded-2xl">
            <h2 className="text-2xl md:text-3xl font-heading font-light text-foreground mb-4 flex items-center">
              <Layers className="mr-3 text-foreground h-6 w-6" /> What layerzero Does
            </h2>
            <p className="text-muted-foreground leading-relaxed font-sans text-base">
              layerzero is a unified platform for extracting, processing, and summarizing vast amounts of textual data. Whether dealing with dense PDF reports, lengthy DOCX files, or web articles, layerzero strips away noise and provides concise, structured, and accurate summaries.
            </p>
          </section>
        </ScrollSection>

        <ScrollSection>
          <section>
            <h2 className="text-2xl md:text-3xl font-heading font-light text-foreground mb-4 flex items-center">
              <Zap className="mr-3 text-foreground h-6 w-6" /> Hybrid AI Inference
            </h2>
            <p className="text-muted-foreground leading-relaxed font-sans text-base mb-8 max-w-3xl">
              We believe in picking the model that fits the task. Choose the inference engine that matches your requirements: maximum reasoning power (Gemini), fast open-source inference (Groq), complete privacy (Gemma, local-only), or native multilingual support (Sarvam).
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <ScrollSection delayClass="delay-50">
                <Card className="rounded-2xl bg-card border-border hover:border-input transition-all p-2">
                  <CardHeader>
                    <CardTitle className="text-xl font-heading font-light text-foreground">Gemini (Cloud)</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground font-sans leading-relaxed">
                    Google's Gemini Pro models offer massive context windows and state-of-the-art reasoning. Ideal for complex synthesis across large documents and structural outputs.
                  </CardContent>
                </Card>
              </ScrollSection>

              <ScrollSection delayClass="delay-100">
                <Card className="rounded-2xl bg-card border-border hover:border-input transition-all p-2">
                  <CardHeader>
                    <CardTitle className="text-xl font-heading font-light text-foreground">GPT OSS 120B (Groq)</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground font-sans leading-relaxed">
                    OpenAI's open-weight 120B parameter model served at speed via Groq LPU hardware. A fast open-source middle ground between cloud polish and local privacy.
                  </CardContent>
                </Card>
              </ScrollSection>

              <ScrollSection delayClass="delay-150">
                <Card className="rounded-2xl bg-card border-border hover:border-input transition-all p-2">
                  <CardHeader>
                    <CardTitle className="text-xl font-heading font-light text-foreground">Gemma (Local)</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground font-sans leading-relaxed">
                    Run lightweight open models directly on your hardware. Zero data transmission means absolute privacy for confidential financial reports or personal data.
                  </CardContent>
                </Card>
              </ScrollSection>

              <ScrollSection delayClass="delay-200">
                <Card className="rounded-2xl bg-card border-border hover:border-input transition-all p-2">
                  <CardHeader>
                    <CardTitle className="text-xl font-heading font-light text-foreground">Sarvam 30B</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground font-sans leading-relaxed">
                    Purpose-built for Hinglish and multilingual Indian-language workflows. Ideal when source content blends English with Hindi or Indian regional phrasing.
                  </CardContent>
                </Card>
              </ScrollSection>
            </div>
          </section>
        </ScrollSection>

        <ScrollSection>
          <section className="editorial-card p-8 md:p-10 bg-card border border-border rounded-2xl">
            <h2 className="text-2xl md:text-3xl font-heading font-light text-foreground mb-6 flex items-center">
              <Server className="mr-3 text-foreground h-6 w-6" /> System Pipeline & Infrastructure
            </h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3.5 text-sm text-muted-foreground font-sans">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground shrink-0 mt-2" />
                <div className="flex-1 leading-relaxed">
                  <span className="font-semibold text-foreground mr-1.5">Data Ingestion & Parsing:</span>
                  <span>High-performance parsers for PDF, DOCX, and HTML DOM structures with boilerplate removal.</span>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 text-sm text-muted-foreground font-sans">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground shrink-0 mt-2" />
                <div className="flex-1 leading-relaxed">
                  <span className="font-semibold text-foreground mr-1.5">Rate Limiting:</span>
                  <span>Granular API rate limiting using express-rate-limit and Upstash Redis IP throttling to protect model quotas.</span>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 text-sm text-muted-foreground font-sans">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground shrink-0 mt-2" />
                <div className="flex-1 leading-relaxed">
                  <span className="font-semibold text-foreground mr-1.5">Multi-Tier Caching:</span>
                  <span>Upstash Redis distributed caching layer for instant responses on repeated summarization requests.</span>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 text-sm text-muted-foreground font-sans">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground shrink-0 mt-2" />
                <div className="flex-1 leading-relaxed">
                  <span className="font-semibold text-foreground mr-1.5">Routing Layer:</span>
                  <span>Dynamic SSE streaming dispatcher across 4 AI providers (Gemini, Groq, Sarvam, Gemma).</span>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 text-sm text-muted-foreground font-sans">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground shrink-0 mt-2" />
                <div className="flex-1 leading-relaxed">
                  <span className="font-semibold text-foreground mr-1.5">CI/CD & Cloud Infrastructure:</span>
                  <span>Continuous integration and automated deployment pipeline hosted on AWS with Docker containerization.</span>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 text-sm text-muted-foreground font-sans">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground shrink-0 mt-2" />
                <div className="flex-1 leading-relaxed">
                  <span className="font-semibold text-foreground mr-1.5">Client Generation & Export:</span>
                  <span>Interactive markdown streaming with client-side PDF export generation.</span>
                </div>
              </div>
            </div>
          </section>
        </ScrollSection>
      </div>
    </div>
  );
};

export default About;
