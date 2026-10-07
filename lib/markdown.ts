/**
 * CinderPress Editorial Markdown Engine
 * Clean, safe Markdown parsing and typography utilities for longform journalism.
 */

export function calculateReadingTime(text: string, wordsPerMinute: number = 200): number {
  if (!text || !text.trim()) return 1;
  const wordCount = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function extractExcerpt(markdown: string, maxLength: number = 240): string {
  if (!markdown) return '';
  // Strip images, links, headers, code blocks, blockquotes, asterisks
  const plain = markdown
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*>\s*/gm, '')
    .replace(/[*_~]/g, '')
    .trim();

  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).trim() + '...';
}

export function renderMarkdown(markdown: string): string {
  if (!markdown) return '';

  // 1. Sanitize raw HTML tags to prevent XSS
  let html = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 2. Fenced code blocks
  html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_match, _lang, code) => {
    return `<pre class="my-6 p-4 rounded-xl bg-cinder-bone font-mono text-sm overflow-x-auto border border-cinder-border"><code>${code.trim()}</code></pre>`;
  });

  // 3. Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-cinder-bone font-mono text-xs border border-cinder-border">$1</code>');

  // 4. Headers
  html = html.replace(/^### (.*$)/gm, '<h3 class="font-serif text-xl font-bold mt-8 mb-4 text-cinder-ink">$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2 class="font-serif text-2xl font-bold mt-10 mb-4 text-cinder-ink pb-2 border-b border-cinder-border">$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1 class="font-serif text-3xl font-bold mt-12 mb-6 text-cinder-ink">$1</h1>');

  // 5. Blockquotes
  html = html.replace(/^\s*&gt;\s?(.*$)/gm, '<blockquote class="border-l-4 border-cinder-orange pl-4 py-1 my-6 italic font-serif text-lg text-cinder-charcoal bg-cinder-paper-soft rounded-r-lg">$1</blockquote>');

  // 6. Unordered Lists
  html = html.replace(/^\s*[-*]\s+(.*$)/gm, '<li class="ml-6 list-disc mb-1">$1</li>');
  html = html.replace(/((?:<li class="ml-6 list-disc mb-1">.*?<\/li>\s*)+)/gs, '<ul class="my-6 space-y-1 text-cinder-charcoal leading-relaxed">$1</ul>');

  // 7. Ordered Lists
  html = html.replace(/^\s*\d+\.\s+(.*$)/gm, '<li class="ml-6 list-decimal mb-1">$1</li>');
  html = html.replace(/((?:<li class="ml-6 list-decimal mb-1">.*?<\/li>\s*)+)/gs, '<ol class="my-6 space-y-1 text-cinder-charcoal leading-relaxed">$1</ol>');

  // 8. Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(?!\s)([^*\n]+?)(?<!\s)\*/g, '<em>$1</em>');

  // 9. Paragraphs: split double newlines
  const paragraphs = html.split(/\n{2,}/);
  const formatted = paragraphs.map((block) => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    // If already wrapped in block elements, return as is
    if (/^<(h[1-6]|ul|ol|pre|blockquote|div)/.test(trimmed)) {
      return trimmed;
    }
    return `<p class="my-5 leading-relaxed text-cinder-charcoal text-base md:text-lg font-serif">${trimmed.replace(/\n/g, '<br/>')}</p>`;
  });

  return formatted.filter(Boolean).join('\n\n');
}
