import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { ModelSelector } from '../components/ModelSelector';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { EmptyState } from '../components/EmptyState';
import api from '../lib/api';
import { toast } from 'sonner';
import { Loader2, Globe, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { marked } from 'marked';

const urlSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL" }),
  client: z.string().min(1, { message: "Please select a model" }),
});

type UrlFormValues = z.infer<typeof urlSchema>;

const UrlSummarizer: React.FC = () => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<UrlFormValues>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      client: 'groq'
    }
  });

  const onSubmit = async (data: UrlFormValues) => {
    setIsLoading(true);
    setSummary("");

    try {
      const res = await api.post('/scrape/web', {
        url: data.url,
        client: data.client,
      });
      setSummary(res.data.output);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate summary");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadSummary = async (summary: string) => {
    const html = await marked(summary);
    const plain = html
      .replace(/<[^>]*>/g, '')
      .replace(/\n{3,}/g, '\n\n');

    const doc = new jsPDF();
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(plain, 180);
    doc.text(lines, 15, 20);
    doc.save('layerzero-summary.pdf');
  };

  return (
    <div className="space-y-8 animate-blur-fade-in font-sans">
      <div>
        <h1 className="text-3xl md:text-4xl font-heading font-light tracking-tight text-foreground mb-2">URL Summarizer</h1>
        <p className="text-muted-foreground text-base font-sans">Extract and summarize content from any web page.</p>
      </div>

      <Card className="rounded-2xl border-border bg-card">
        <CardContent className="pt-6 md:pt-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="url" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Website URL</Label>
              <Input
                id="url"
                placeholder="https://example.com/article"
                {...register('url')}
                disabled={isLoading}
                className="rounded-lg"
              />
              {errors.url && (
                <p className="text-sm text-red-600 font-medium pl-2 border-l-2 border-red-600 mt-1">
                  {errors.url.message}
                </p>
              )}
            </div>

            <ModelSelector
              // eslint-disable-next-line react-hooks/incompatible-library
              value={watch('client')}
              onChange={(val) => setValue('client', val)}
              disabled={isLoading}
            />
            {errors.client && (
              <p className="text-sm text-red-600 font-medium pl-2 border-l-2 border-red-600 mt-1">
                {errors.client.message}
              </p>
            )}

            <Button type="submit" disabled={isLoading} className="w-full md:w-auto rounded-full bg-primary text-primary-foreground hover:opacity-90">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Summary
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8">
        <div className="flex flex-row justify-between items-center mb-4">
          <h2 className="text-2xl font-heading font-light text-foreground">Response</h2>
          {summary && (
            <Button
              className="rounded-full px-4 py-2 font-sans font-medium cursor-pointer bg-primary text-primary-foreground flex gap-2 hover:opacity-90 transition-colors"
              onClick={() => summary && downloadSummary(summary)}
            >
              <Download size={18} /> Export PDF
            </Button>
          )}
        </div>
        <Card className="rounded-2xl border-border bg-card">
          <CardContent className="pt-6 md:pt-8">
            {isLoading ? (
              <LoadingSkeleton rows={5} />
            ) : summary ? (
              <MarkdownRenderer content={summary} />
            ) : (
              <EmptyState
                title="No summary generated"
                description="Enter a URL and select a model to generate a summary."
                icon={<Globe className="h-6 w-6 text-muted-foreground" />}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UrlSummarizer;
