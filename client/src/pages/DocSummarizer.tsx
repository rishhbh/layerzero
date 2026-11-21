import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ModelSelector } from '../components/ModelSelector';
import { FileUpload } from '../components/FileUpload';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { EmptyState } from '../components/EmptyState';
import api from '../lib/api';
import { toast } from 'sonner';
import { Loader2, FileText, Download, History } from 'lucide-react';
import jsPDF from 'jspdf';
import { marked } from 'marked';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const MODEL_NAMES: Record<string, string> = {
  gemini: "Gemini 3.5 Flash Lite",
  groq: "Groq GPT-OSS-20B",
  sarvam: "Sarvam 30B",
  gemma: "Gemma 4",
};

function wordCount(md: string): number {
  const text = md
    .replace(/`{3}[\s\S]*?`{3}/g, ' ')
    .replace(/[#>*_`[\]()!-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text ? text.split(' ').length : 0;
}

const DocSummarizer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [client, setClient] = useState<string>('groq');
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryTitle, setSummaryTitle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useDocumentTitle(summaryTitle ? `${summaryTitle} · Doc Summarizer` : 'Document Summarizer');

  const onSubmit = async () => {
    if (!file) {
      toast.error("Please upload a document first");
      return;
    }

    setIsLoading(true);
    setSummary("");
    setSummaryTitle(null);

    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("client", client);

      const res = await api.post('/scrape/doc', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSummary(res.data.output || res.data.summary);
      setSummaryTitle(res.data.title || null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate summary");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadSummary = async (content: string, title?: string | null) => {
    const html = await marked(content);
    const plain = html.replace(/<[^>]*>/g, '').replace(/\n{3,}/g, '\n\n');

    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    let cursorY = 20;

    if (title) {
      doc.setFontSize(14);
      doc.text(title, 15, 18);
      cursorY = 28;
    }

    doc.setFontSize(10);
    const lines = doc.splitTextToSize(plain, 180);
    const lineHeight = 5.5;

    for (let i = 0; i < lines.length; i++) {
      if (cursorY + lineHeight > pageHeight - 15) {
        doc.addPage();
        cursorY = 20;
      }
      doc.text(lines[i], 15, cursorY);
      cursorY += lineHeight;
    }

    const safeFilename = title
      ? `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 35)}.pdf`
      : 'layerzero-summary.pdf';
    doc.save(safeFilename);
  };

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-16 md:py-20">
      {/* 01 / TOOL */}
      <div className="mb-12 flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="kicker mb-4">01 / TOOL · DOCUMENT EXTRACTION</p>
          <h1 className="text-3xl md:text-5xl font-heading font-medium tracking-tight text-foreground mb-2">Document Summarizer</h1>
          <p className="text-muted-foreground text-base font-sans">Upload PDF or DOCX files for intelligent summarization.</p>
        </div>
        <Link
          to="/dashboard/history"
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors border border-border px-3 py-2 rounded-[4px] flex items-center gap-1.5 bg-surface"
        >
          <History className="h-3.5 w-3.5" /> View History ↗
        </Link>
      </div>

      <div className="border-t border-border pt-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
          <div className="md:col-span-7">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mb-1">Source </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-foreground/70 block mb-2">Document File</span>
            <FileUpload onFileSelect={setFile} accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
          </div>

          <div className="md:col-span-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mb-1">Engine </span>
            <ModelSelector value={client} onChange={setClient} disabled={isLoading} />
          </div>
        </div>

        <div className="rule my-8" />

        <Button onClick={onSubmit} disabled={isLoading || !file} className="h-10 px-6">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Generating…' : 'Generate Summary ↗'}
        </Button>
      </div>

      {/* 02 / OUTPUT */}
      <div className="mt-20">
        <div className="flex items-baseline gap-4 mb-6">
          <p className="kicker">02 / Output</p>
          {summary && (
            <button
              onClick={() => summary && downloadSummary(summary, summaryTitle)}
              className="ml-auto font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> Export PDF ↗
            </button>
          )}
        </div>

        <div className="border-t border-border pt-8">
          {isLoading ? (
            <LoadingSkeleton rows={6} />
          ) : summary ? (
            <div>
              {summaryTitle && (
                <h2 className="text-2xl md:text-3xl font-heading font-medium tracking-tight text-foreground mb-6">
                  {summaryTitle}
                </h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 border-b border-border mb-8">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mb-1">Source</span>
                  <span className="text-sm text-foreground break-all">{file?.name}</span>
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mb-1">Model</span>
                  <span className="text-sm text-foreground">{MODEL_NAMES[client] || client}</span>
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mb-1">Output</span>
                  <span className="text-sm text-foreground">{wordCount(summary).toLocaleString()} words</span>
                </div>
              </div>
              <MarkdownRenderer content={summary} />
              <div className="rule my-8" />
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {wordCount(summary).toLocaleString()} WORDS
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">LAYERZERO / SUMMARY</span>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No summary generated"
              description="Upload a PDF or DOCX and select a model engine to generate a summary."
              icon={<FileText className="h-6 w-6 text-muted-foreground" />}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DocSummarizer;