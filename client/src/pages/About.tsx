import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Layers, Shield, Zap } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">About LayerZero</h1>
        <p className="text-lg text-muted-foreground">The hybrid AI summarization platform built for modern workflows.</p>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Layers className="mr-2 text-primary" /> What LayerZero Does
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            LayerZero is a unified platform for extracting, processing, and summarizing vast amounts of textual data. Whether you're dealing with dense PDF reports, lengthy DOCX files, or sprawling web articles, LayerZero strips away the noise and provides concise, structured, and accurate summaries.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Zap className="mr-2 text-primary" /> Why Hybrid AI?
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            We believe that users shouldn't have to compromise between power and privacy. Our hybrid architecture allows you to choose the inference engine that best suits your current task. For general knowledge and highly complex reasoning, cloud models provide unmatched capabilities. For sensitive documents, local inference ensures your data never leaves your infrastructure.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Gemini (Cloud)</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Google's Gemini Pro models offer massive context windows and state-of-the-art reasoning. Ideal for complex synthesis across large documents, extracting nuanced insights, and generating highly structured outputs.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Gemma (Local)</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Run powerful lightweight open models directly on your hardware. Zero data transmission means absolute privacy. Perfect for confidential financial reports, personal data, or proprietary source code.
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Shield className="mr-2 text-primary" /> Architecture Overview
          </h2>
          <div className="bg-card border border-border rounded-xl p-6">
            <ul className="space-y-4 text-sm text-muted-foreground list-disc list-inside">
              <li><strong className="text-foreground">Data Ingestion:</strong> Robust parsers for PDF, DOCX, and HTML DOM structures.</li>
              <li><strong className="text-foreground">Sanitization:</strong> Removal of boilerplate, ads, and irrelevant structural elements.</li>
              <li><strong className="text-foreground">Routing Layer:</strong> Secure dispatch to either cloud APIs or local model endpoints.</li>
              <li><strong className="text-foreground">Generation:</strong> Markdown-formatted responses streamed back to the client in real-time.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
