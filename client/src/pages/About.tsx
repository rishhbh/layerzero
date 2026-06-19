import React, { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Layers, Shield, Zap } from 'lucide-react';

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
    <div className="container mx-auto px-4 py-16 max-w-4xl animate-blur-fade-in">
      <ScrollSection delayClass="delay-50">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-4">About LayerZero</h1>
          <p className="text-lg text-muted-foreground">The hybrid AI summarization platform built for modern workflows.</p>
        </div>
      </ScrollSection>

      <div className="space-y-12">
        <ScrollSection>
          <section>
            <h2 className="text-2xl font-heading font-bold mb-4 flex items-center">
              <Layers className="mr-2 text-primary" /> What LayerZero Does
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              LayerZero is a unified platform for extracting, processing, and summarizing vast amounts of textual data. Whether you're dealing with dense PDF reports, lengthy DOCX files, or sprawling web articles, LayerZero strips away the noise and provides concise, structured, and accurate summaries.
            </p>
          </section>
        </ScrollSection>

        <ScrollSection>
          <section>
            <h2 className="text-2xl font-heading font-bold mb-4 flex items-center">
              <Zap className="mr-2 text-primary" /> Why Hybrid AI?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              We believe in picking the model that fits the task. Choose the inference engine that matches your requirements: maximum reasoning power (Gemini), fast open-source inference (Cerebras), complete privacy (Gemma, local-only), or native multilingual support (Sarvam).
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <ScrollSection delayClass="delay-50">
                <Card className="rounded-none glass-surface-interactive interactive-item-large">
                  <CardHeader>
                    <CardTitle className="text-xl font-heading">Gemini (Cloud)</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Google's Gemini Pro models offer massive context windows and state-of-the-art reasoning. Ideal for complex synthesis across large documents, extracting nuanced insights, and generating highly structured outputs.
                  </CardContent>
                </Card>
              </ScrollSection>

              <ScrollSection delayClass="delay-100">
                <Card className="rounded-none glass-surface-interactive interactive-item-large">
                  <CardHeader>
                    <CardTitle className="text-xl font-heading">GPT OSS 120B (Cerebras)</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    OpenAI's open-weight 120B parameter model, served at exceptional speed through Cerebras' inference hardware. A fast, capable, open-source middle ground between Gemini's polish and Gemma's privacy.
                  </CardContent>
                </Card>
              </ScrollSection>

              <ScrollSection delayClass="delay-150">
                <Card className="rounded-none glass-surface-interactive interactive-item-large">
                  <CardHeader>
                    <CardTitle className="text-xl font-heading">Gemma (Local)</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Run powerful lightweight open models directly on your hardware. Zero data transmission means absolute privacy. Perfect for confidential financial reports, personal data, or proprietary source code.
                  </CardContent>
                </Card>
              </ScrollSection>

              <ScrollSection delayClass="delay-200">
                <Card className="rounded-none glass-surface-interactive interactive-item-large">
                  <CardHeader>
                    <CardTitle className="text-xl font-heading">Sarvam 30B</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Purpose-built for Hinglish and multilingual Indian-language workflows. Ideal when source content or desired output blends English with Hindi or other Indian languages, without losing natural phrasing.
                  </CardContent>
                </Card>
              </ScrollSection>
            </div>
          </section>
        </ScrollSection>

        <ScrollSection>
          <section>
            <h2 className="text-2xl font-heading font-bold mb-4 flex items-center">
              <Shield className="mr-2 text-primary" /> Architecture Overview
            </h2>
            <div className="bg-card border border-border rounded-none p-6 glass-surface">
              <ul className="space-y-4 text-sm text-muted-foreground list-disc list-inside">
                <li><strong className="text-foreground">Data Ingestion:</strong> Robust parsers for PDF, DOCX, and HTML DOM structures.</li>
                <li><strong className="text-foreground">Sanitization:</strong> Removal of boilerplate, ads, and irrelevant structural elements.</li>
                <li><strong className="text-foreground">Routing Layer:</strong> Secure dispatch across four AI providers — three cloud-hosted, one fully local.</li>
                <li><strong className="text-foreground">Generation:</strong> Markdown-formatted responses returned from the selected model and rendered on the client.</li>
              </ul>
            </div>
          </section>
        </ScrollSection>
      </div>
    </div>
  );
};

export default About;
