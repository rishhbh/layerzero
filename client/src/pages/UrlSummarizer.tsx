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
import { Loader2, Globe } from 'lucide-react';

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
      client: 'gemini'
    }
  });

  const onSubmit = async (data: UrlFormValues) => {
    setIsLoading(true);
    setSummary(null);
    try {
      // Using api.post directly with the payload object
      const res = await api.post('/scrape/web', {
        url: data.url, 
        client: data.client 
      });
      
      // Ensure summary is always a string to prevent React crashes
      const summaryContent = res.data.output || res.data.summary || res.data.content || res.data;
      setSummary(typeof summaryContent === 'string' ? summaryContent : JSON.stringify(summaryContent, null, 2));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to generate summary");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">URL Summarizer</h1>
        <p className="text-muted-foreground">Extract and summarize content from any web page.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                placeholder="https://example.com/article"
                {...register('url')}
                disabled={isLoading}
              />
              {errors.url && <p className="text-sm text-red-500">{errors.url.message}</p>}
            </div>
            
            <ModelSelector
              value={watch('client')}
              onChange={(val) => setValue('client', val)}
              disabled={isLoading}
            />
            {errors.client && <p className="text-sm text-red-500">{errors.client.message}</p>}

            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Summary
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Response</h2>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <LoadingSkeleton rows={5} />
            ) : summary ? (
              <MarkdownRenderer content={summary} />
            ) : (
              <EmptyState
                title="No summary generated"
                description="Enter a URL and select a model to generate a summary."
                icon={<Globe className="h-6 w-6" />}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UrlSummarizer;
