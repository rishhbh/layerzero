import { useEffect } from 'react';

const APP_NAME = 'layerzero';

/**
 * Sets the document.title for the current page.
 * @param title - The page-specific title (e.g. "URL Summarizer", "Summary History").
 * @param exact - If true, sets the title directly without appending "— layerzero".
 */
export function useDocumentTitle(title?: string, exact = false) {
  useEffect(() => {
    if (!title) {
      document.title = 'layerzero — Technical Publication for AI Summarization';
      return;
    }
    document.title = exact ? title : `${title} — ${APP_NAME}`;
  }, [title, exact]);
}

export default useDocumentTitle;
