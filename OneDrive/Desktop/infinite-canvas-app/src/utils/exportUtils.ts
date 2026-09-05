import * as htmlToImage from 'html-to-image';

/**
 * Export the canvas viewport to a high-resolution PNG file.
 */
export const exportCanvasToPNG = async (viewportElement: HTMLElement | null) => {
  if (!viewportElement) return;
  try {
    const dataUrl = await htmlToImage.toPng(viewportElement, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: getComputedStyle(document.body).backgroundColor,
    });
    const link = document.createElement('a');
    link.download = `canvas-export-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('Failed to export canvas to PNG:', err);
  }
};

/**
 * Export the canvas viewport to an SVG vector file.
 */
export const exportCanvasToSVG = async (viewportElement: HTMLElement | null) => {
  if (!viewportElement) return;
  try {
    const dataUrl = await htmlToImage.toSvg(viewportElement, {
      backgroundColor: getComputedStyle(document.body).backgroundColor,
    });
    const link = document.createElement('a');
    link.download = `canvas-export-${Date.now()}.svg`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('Failed to export canvas to SVG:', err);
  }
};

/**
 * Export all canvas note elements to a Markdown document.
 */
export const exportCanvasToMarkdown = (elements: any[]) => {
  const lines: string[] = [
    '# Canvas Export',
    `> Exported on ${new Date().toLocaleString()}`,
    '',
  ];

  elements.forEach((el) => {
    if (el.type === 'note') {
      lines.push(`## ${el.title || 'Note'}`);
      if (el.content) lines.push(el.content);
      lines.push('');
    } else if (el.type === 'sticky') {
      lines.push(`### 📌 ${el.title || 'Sticky'}`);
      if (el.content) lines.push(`> ${el.content.replace(/\n/g, '\n> ')}`);
      lines.push('');
    } else if (el.type === 'code') {
      lines.push(`### Code: ${el.title || el.language || 'snippet'}`);
      lines.push(`\`\`\`${el.language || 'text'}`);
      if (el.content) lines.push(el.content);
      lines.push('```');
      lines.push('');
    } else if (el.type === 'checklist') {
      lines.push(`### ✅ ${el.title || 'Checklist'}`);
      (el.items || []).forEach((item: any) => {
        lines.push(`- [${item.done ? 'x' : ' '}] ${item.text}`);
      });
      lines.push('');
    } else if (el.type === 'math') {
      lines.push(`### Math: ${el.title || 'Equation'}`);
      lines.push(`$$${el.latex || ''}$$`);
      lines.push('');
    }
  });

  const md = lines.join('\n');
  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `canvas-notes-${Date.now()}.md`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
};
