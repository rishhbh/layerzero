import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { EmptyState } from '../components/EmptyState';
import api from '../lib/api';
import { toast } from 'sonner';
import {
  Search,
  Globe,
  FileText,
  Download,
  Copy,
  Check,
  RefreshCw,
  Clock,
  ArrowLeft,
  X,
  FileCode,
  Layers,
  Sparkles,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { marked } from 'marked';
import type { SummaryItem } from '../types/summary';
import { cn } from '../lib/utils';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const MODEL_NAMES: Record<string, string> = {
  gemini: 'Gemini 3.5 Flash',
  groq: 'Groq GPT-OSS-120B',
  sarvam: 'Sarvam 30B',
  gemma: 'Gemma 4',
};

function wordCount(md: string): number {
  if (!md) return 0;
  const text = md
    .replace(/`{3}[\s\S]*?`{3}/g, ' ')
    .replace(/[#>*_`[\]()!-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text ? text.split(' ').length : 0;
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  } catch {
    return dateString;
  }
}

function getExcerpt(md: string, maxLength = 100): string {
  if (!md) return '';
  const plain = md
    .replace(/`{3}[\s\S]*?`{3}/g, ' ')
    .replace(/[#>*_`[\]()!-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > maxLength ? plain.slice(0, maxLength) + '…' : plain;
}

export const History: React.FC = () => {
  const [summaries, setSummaries] = useState<SummaryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'url' | 'pdf' | 'docx'>('all');
  const [searchParams, setSearchParams] = useSearchParams();

  const activeId = searchParams.get('id');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.get('/summaries');
      const items: SummaryItem[] = res.data?.summaries || [];
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSummaries(items);
    } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      if (err.response?.status === 404) {
        setSummaries([]);
      } else {
        toast.error(err.response?.data?.message || err.message || 'Failed to load summary history');
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadSummaries = async () => {
      try {
        const res = await api.get('/summaries');
        if (!isMounted) return;
        const items: SummaryItem[] = res.data?.summaries || [];
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setSummaries(items);
      } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
        if (!isMounted) return;
        if (err.response?.status === 404) {
          setSummaries([]);
        } else {
          toast.error(err.response?.data?.message || err.message || 'Failed to load summary history');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSummaries();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered summaries based on search and source type
  const filteredSummaries = useMemo(() => {
    return summaries.filter((item) => {
      const matchesSource =
        sourceFilter === 'all' || item.sourceType.toLowerCase() === sourceFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.finalSummary?.toLowerCase().includes(q) ||
        item.client?.toLowerCase().includes(q);
      return matchesSource && matchesSearch;
    });
  }, [summaries, sourceFilter, searchQuery]);

  // Determine currently selected summary
  const selectedSummary = useMemo(() => {
    if (activeId) {
      const found = summaries.find((s) => s._id === activeId);
      if (found) return found;
    }
    // Default to the first filtered item on desktop if nothing explicitly selected
    return filteredSummaries.length > 0 ? filteredSummaries[0] : null;
  }, [summaries, filteredSummaries, activeId]);

  useDocumentTitle(activeId && selectedSummary ? `${selectedSummary.title} · History` : 'Summary History');

  const selectSummary = (id: string) => {
    setSearchParams({ id });
  };

  const clearSelection = () => {
    setSearchParams({});
  };

  const copyToClipboard = async (summary: SummaryItem) => {
    if (!summary.finalSummary) return;
    try {
      await navigator.clipboard.writeText(summary.finalSummary);
      setCopiedId(summary._id);
      toast.success('Summary copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadSummary = async (summary: SummaryItem) => {
    if (!summary.finalSummary) return;
    try {
      const html = await marked(summary.finalSummary);
      const plain = html.replace(/<[^>]*>/g, '').replace(/\n{3,}/g, '\n\n');

      const doc = new jsPDF();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFontSize(14);
      doc.text(summary.title || 'Layerzero Summary', 15, 18);

      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      const meta = `${summary.sourceType.toUpperCase()} · ${MODEL_NAMES[summary.client] || summary.client} · ${formatDate(summary.createdAt)}`;
      doc.text(meta, 15, 25);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(plain, 180);
      let cursorY = 35;
      const lineHeight = 5.5;

      for (let i = 0; i < lines.length; i++) {
        if (cursorY + lineHeight > pageHeight - 15) {
          doc.addPage();
          cursorY = 20;
        }
        doc.text(lines[i], 15, cursorY);
        cursorY += lineHeight;
      }

      const safeFilename = (summary.title || 'summary')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 40)
        .replace(/^-|-$/g, '');

      doc.save(`${safeFilename || 'layerzero-summary'}.pdf`);
      toast.success('Summary exported as PDF');
    } catch {
      toast.error('Failed to export PDF');
    }
  };

  const counts = useMemo(() => {
    return {
      all: summaries.length,
      url: summaries.filter((s) => s.sourceType === 'url').length,
      pdf: summaries.filter((s) => s.sourceType === 'pdf').length,
      docx: summaries.filter((s) => s.sourceType === 'docx').length,
    };
  }, [summaries]);

  const renderSourceIcon = (sourceType: string, className = 'h-3.5 w-3.5') => {
    switch (sourceType) {
      case 'url':
        return <Globe className={className} />;
      case 'pdf':
        return <FileText className={className} />;
      case 'docx':
        return <FileCode className={className} />;
      default:
        return <FileText className={className} />;
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16 md:py-20">
      {/* 01 / HEADER */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="kicker mb-4">03 / ARCHIVE · SUMMARY HISTORY</p>
          <h1 className="text-3xl md:text-5xl font-heading font-medium tracking-tight text-foreground mb-2">
            Summary History
          </h1>
          <p className="text-muted-foreground text-base font-sans">
            Search, review, and export all your previously generated document and web summaries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className="font-mono text-[10px] uppercase tracking-[0.18em] h-9"
          >
            <RefreshCw
              className={cn('mr-1.5 h-3.5 w-3.5', isRefreshing && 'animate-spin')}
            />
            {isRefreshing ? 'Refreshing…' : 'Refresh'}
          </Button>

          <Link to="/dashboard/url">
            <Button size="sm" className="font-mono text-[10px] uppercase tracking-[0.18em] h-9">
              + New Summary ↗
            </Button>
          </Link>
        </div>
      </div>

      <div className="border-t border-border pt-8">
        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-4">
              <LoadingSkeleton rows={4} />
              <LoadingSkeleton rows={4} />
            </div>
            <div className="lg:col-span-7">
              <LoadingSkeleton rows={8} />
            </div>
          </div>
        ) : summaries.length === 0 ? (
          /* Zero Summaries Overall */
          <div className="py-12 border border-dashed border-border rounded-[4px]">
            <EmptyState
              title="No summaries in your archive yet"
              description="Summaries you generate from web articles or uploaded documents will automatically appear here."
              icon={<Layers className="h-6 w-6 text-muted-foreground" />}
            />
            <div className="flex items-center justify-center gap-4 mt-6">
              <Link to="/dashboard/url">
                <Button variant="outline" className="font-mono text-[11px] uppercase tracking-[0.18em]">
                  <Globe className="mr-2 h-3.5 w-3.5" /> Summarize URL
                </Button>
              </Link>
              <Link to="/dashboard/doc">
                <Button className="font-mono text-[11px] uppercase tracking-[0.18em]">
                  <FileText className="mr-2 h-3.5 w-3.5" /> Summarize Document
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {/* Search and Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-8 pb-6 border-b border-border">
              {/* Search Box */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search title, content, or engine…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9 h-10 text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Source Type Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                {(
                  [
                    { key: 'all', label: 'All', count: counts.all },
                    { key: 'url', label: 'URL', count: counts.url },
                    { key: 'pdf', label: 'PDF', count: counts.pdf },
                    { key: 'docx', label: 'DOCX', count: counts.docx },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setSourceFilter(tab.key)}
                    className={cn(
                      'px-3 py-1.5 rounded-[4px] font-mono text-[10px] uppercase tracking-[0.15em] transition-colors border flex items-center gap-1.5 whitespace-nowrap cursor-pointer',
                      sourceFilter === tab.key
                        ? 'bg-foreground text-background border-foreground font-semibold'
                        : 'bg-surface text-muted-foreground border-border hover:text-foreground hover:border-input'
                    )}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={cn(
                        'text-[9px] px-1 py-0.2 rounded',
                        sourceFilter === tab.key
                          ? 'bg-background/20 text-background'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Empty search results state */}
            {filteredSummaries.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-border rounded-[4px]">
                <EmptyState
                  title="No matching summaries found"
                  description="Try adjusting your search query or clear the filter to see more summaries."
                  icon={<Search className="h-6 w-6 text-muted-foreground" />}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSourceFilter('all');
                  }}
                  className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em]"
                >
                  Reset Search & Filters
                </Button>
              </div>
            ) : (
              /* Master - Detail Grid */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: List of Summaries */}
                <div
                  className={cn(
                    'lg:col-span-5 flex flex-col space-y-3',
                    // On mobile, hide list if viewing a specific summary detail
                    activeId ? 'hidden lg:flex' : 'flex'
                  )}
                >
                  <div className="flex items-center justify-between pb-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      ARCHIVE · {filteredSummaries.length}{' '}
                      {filteredSummaries.length === 1 ? 'ENTRY' : 'ENTRIES'}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                      NEWEST FIRST
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
                    {filteredSummaries.map((item) => {
                      const isSelected = selectedSummary?._id === item._id;
                      return (
                        <div
                          key={item._id}
                          onClick={() => selectSummary(item._id)}
                          className={cn(
                            'p-4 rounded-[4px] border transition-all cursor-pointer text-left relative group',
                            isSelected
                              ? 'bg-surface border-accent shadow-sm ring-1 ring-accent/30'
                              : 'bg-surface border-border hover:border-foreground/30 hover:bg-muted/30'
                          )}
                        >
                          {isSelected && (
                            <span className="absolute left-0 top-3 bottom-3 w-[3px] bg-accent rounded-r" />
                          )}

                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                              {renderSourceIcon(item.sourceType)}
                              {item.sourceType}
                            </span>
                            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatRelativeTime(item.createdAt)}
                            </span>
                          </div>

                          <h3 className="font-heading text-lg font-medium tracking-tight text-foreground line-clamp-2 mb-1 group-hover:text-foreground">
                            {item.title || 'Untitled Summary'}
                          </h3>

                          <p className="text-xs text-muted-foreground font-sans line-clamp-2 leading-relaxed mb-3">
                            {getExcerpt(item.finalSummary, 120)}
                          </p>

                          <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[10px] font-mono text-muted-foreground">
                            <span className="uppercase tracking-[0.15em]">
                              {MODEL_NAMES[item.client] || item.client}
                            </span>
                            <span className="tracking-[0.1em]">
                              {wordCount(item.finalSummary).toLocaleString()} words
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: Full Summary Viewer / Reader */}
                <div
                  className={cn(
                    'lg:col-span-7 bg-surface rounded-[4px] border border-border p-6 md:p-8',
                    // On mobile, show only if activeId is set or if on desktop
                    !activeId ? 'hidden lg:block' : 'block'
                  )}
                >
                  {selectedSummary ? (
                    <div>
                      {/* Mobile Back Button */}
                      <div className="lg:hidden mb-6 pb-4 border-b border-border">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearSelection}
                          className="font-mono text-[10px] uppercase tracking-[0.18em] -ml-2 text-muted-foreground hover:text-foreground"
                        >
                          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to History List
                        </Button>
                      </div>

                      {/* Top Action Bar */}
                      <div className="flex items-baseline justify-between gap-4 mb-6">
                        <p className="kicker">02 / ARCHIVE ENTRY</p>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => copyToClipboard(selectedSummary)}
                            className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5"
                            title="Copy Markdown"
                          >
                            {copiedId === selectedSummary._id ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-accent" />
                                <span className="text-accent">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" /> Copy
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => downloadSummary(selectedSummary)}
                            className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5"
                            title="Download PDF"
                          >
                            <Download className="h-3.5 w-3.5" /> Export PDF ↗
                          </button>
                        </div>
                      </div>

                      {/* Summary Title */}
                      <h2 className="text-2xl md:text-3xl font-heading font-medium tracking-tight text-foreground mb-6">
                        {selectedSummary.title || 'Untitled Summary'}
                      </h2>

                      {/* Metadata Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-border mb-8">
                        <div>
                          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mb-1">
                            Source
                          </span>
                          <span className="text-xs font-mono uppercase text-foreground inline-flex items-center gap-1">
                            {renderSourceIcon(selectedSummary.sourceType, 'h-3 w-3')}
                            {selectedSummary.sourceType}
                          </span>
                        </div>
                        <div>
                          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mb-1">
                            Engine
                          </span>
                          <span className="text-xs text-foreground">
                            {MODEL_NAMES[selectedSummary.client] || selectedSummary.client}
                          </span>
                        </div>
                        <div>
                          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mb-1">
                            Date
                          </span>
                          <span
                            className="text-xs text-foreground"
                            title={formatDateTime(selectedSummary.createdAt)}
                          >
                            {formatDate(selectedSummary.createdAt)}
                          </span>
                        </div>
                        <div>
                          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mb-1">
                            Word Count
                          </span>
                          <span className="text-xs text-foreground">
                            {wordCount(selectedSummary.finalSummary).toLocaleString()} words
                          </span>
                        </div>
                      </div>

                      {/* Content Renderer */}
                      <div className="min-h-[250px]">
                        <MarkdownRenderer content={selectedSummary.finalSummary} />
                      </div>

                      <div className="rule my-8" />

                      {/* Archive Card Footer */}
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
                          {wordCount(selectedSummary.finalSummary).toLocaleString()} WORDS
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-accent" /> LAYERZERO / ARCHIVE
                        </span>
                      </div>
                    </div>
                  ) : (
                    <EmptyState
                      title="No summary selected"
                      description="Choose a summary from the list on the left to read its full compressed version."
                      icon={<Layers className="h-6 w-6 text-muted-foreground" />}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
