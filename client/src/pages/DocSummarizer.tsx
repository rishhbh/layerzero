import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ModelSelector } from '../components/ModelSelector';
import { FileUpload } from '../components/FileUpload';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { EmptyState } from '../components/EmptyState';
import api from '../lib/api';
import { toast } from 'sonner';
import { Loader2, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import { marked } from 'marked';
import { Download } from 'lucide-react';


const DocSummarizer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [client, setClient] = useState<string>('cerebras');
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async () => {
    if (!file) {
      toast.error("Please upload a document first");
      return;
    }

    setIsLoading(true);
    setSummary("");

    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("client", client);

      const res = await api.post('/scrape/doc', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSummary(res.data.summary);
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
    <div className="space-y-8 animate-blur-fade-in">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight mb-2">Document Summarizer</h1>
        <p className="text-muted-foreground">Upload PDF or DOCX files for intelligent summarization.</p>
      </div>

      <Card className="rounded-none">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <FileUpload
              onFileSelect={setFile}
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />

            <ModelSelector
              value={client}
              onChange={setClient}
              disabled={isLoading}
            />

            <Button onClick={onSubmit} disabled={isLoading || !file} className="w-full md:w-auto cursor-pointer rounded-none">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Summary
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <div className='flex flex-row justify-between items-center mb-4'>
          <h2 className="text-xl font-heading font-bold">Response</h2>
          <Button
            className='rounded-none px-3 py-2 font-heading font-medium cursor-pointer bg-primary text-primary-foreground flex gap-2 hover:opacity-90 transition-opacity'
            onClick={() => summary && downloadSummary(summary)}
          >
            <Download size={20} />Export
          </Button>
        </div>
        <Card className="rounded-none">
          <CardContent className="pt-6">
            {isLoading ? (
              <LoadingSkeleton rows={5} />
            ) : summary ? (
              <MarkdownRenderer content={summary} />
            ) : (
              <EmptyState
                title="No summary generated"
                description="Upload a document and select a model to generate a summary."
                icon={<FileText className="h-6 w-6" />}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocSummarizer;
