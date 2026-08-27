const {
  Paragraph,
  TextRun,
  PageBreak,
  AlignmentType,
  convertInchesToTwip,
  BorderStyle,
} = require('docx');
const { KDP } = require('./constants');

function parseInline(text, opts = {}) {
  const runs = [];
  const re = opts.allowCode ? /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g : /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      runs.push(new TextRun({ text: text.slice(last, m.index), font: KDP.bodyFont, size: KDP.bodySize }));
    }
    const token = m[0];
    if (token.startsWith('**')) {
      runs.push(new TextRun({ text: token.slice(2, -2), bold: true, font: KDP.bodyFont, size: KDP.bodySize }));
    } else if (token.startsWith('`')) {
      runs.push(new TextRun({ text: token.slice(1, -1), font: 'Consolas', size: KDP.bodySize }));
    } else {
      runs.push(new TextRun({ text: token.slice(1, -1), italics: true, font: KDP.bodyFont, size: KDP.bodySize }));
    }
    last = m.index + token.length;
  }
  if (last < text.length) {
    runs.push(new TextRun({ text: text.slice(last), font: KDP.bodyFont, size: KDP.bodySize }));
  }
  if (runs.length === 0) {
    runs.push(new TextRun({ text: text || ' ', font: KDP.bodyFont, size: KDP.bodySize }));
  }
  return runs;
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 120, before: opts.before ?? 0 },
    alignment: opts.center ? AlignmentType.CENTER : opts.right ? AlignmentType.RIGHT : undefined,
    indent: opts.indent ? { left: convertInchesToTwip(opts.indent) } : undefined,
    children: typeof text === 'string' ? parseInline(text) : text,
  });
}

function pb() {
  return new Paragraph({ children: [new PageBreak()] });
}

function imagePromptZone(beat, prompt) {
  const border = {
    top: { style: BorderStyle.DASHED, size: 6, color: '666666' },
    bottom: { style: BorderStyle.DASHED, size: 6, color: '666666' },
    left: { style: BorderStyle.DASHED, size: 6, color: '666666' },
    right: { style: BorderStyle.DASHED, size: 6, color: '666666' },
  };
  const promptText =
    prompt || `[Add imagePrompt in *.story.json for "${beat}"]`;
  return [
    para(`Image prompt — ${beat}`, { center: true, before: 80 }),
    new Paragraph({
      spacing: { after: 80, before: 40 },
      alignment: AlignmentType.LEFT,
      indent: { left: convertInchesToTwip(0.2), right: convertInchesToTwip(0.2) },
      border,
      children: [
        new TextRun({
          text: promptText,
          italics: true,
          size: 20,
          font: KDP.bodyFont,
          color: '333333',
        }),
      ],
    }),
    para(`${KDP.artZoneInches}" × ${KDP.artZoneInches}" · ≥1425×1425 px at 300 DPI · paste generated art above text`, {
      center: true,
      after: 100,
    }),
  ];
}

function artPlaceholder(label, opts = {}) {
  const border = {
    top: { style: BorderStyle.DASHED, size: 6, color: 'AAAAAA' },
    bottom: { style: BorderStyle.DASHED, size: 6, color: 'AAAAAA' },
    left: { style: BorderStyle.DASHED, size: 6, color: 'AAAAAA' },
    right: { style: BorderStyle.DASHED, size: 6, color: 'AAAAAA' },
  };
  const sizeNote = opts.fullPage
    ? 'Full-page · B&W line art or color frontispiece'
    : `${KDP.artZoneInches}" × ${KDP.artZoneInches}" · ≥1425×1425 px at 300 DPI`;
  return [
    para(`[Art placeholder — ${label}]`, { center: true, before: opts.fullPage ? 1200 : 80 }),
    new Paragraph({
      spacing: { after: 100 },
      alignment: AlignmentType.CENTER,
      border: opts.fullPage ? undefined : border,
      children: [
        new TextRun({
          text: sizeNote,
          italics: true,
          size: 18,
          font: KDP.bodyFont,
          color: '888888',
        }),
      ],
    }),
  ];
}

function stackedStoryPage(beat, textParagraphs, pageNote, imagePrompt) {
  const blocks = [];
  if (pageNote) {
    blocks.push(
      new Paragraph({
        spacing: { after: 40 },
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({ text: pageNote, size: 18, font: KDP.bodyFont, color: 'AAAAAA', italics: true }),
        ],
      })
    );
  }
  blocks.push(...imagePromptZone(beat, imagePrompt));
  for (const t of textParagraphs) {
    if (!t.trim()) continue;
    blocks.push(para(t));
  }
  blocks.push(pb());
  return blocks;
}

function textTopicPage(beat, textParagraphs, pageNote) {
  const blocks = [];
  if (pageNote) {
    blocks.push(
      new Paragraph({
        spacing: { after: 40 },
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({ text: pageNote, size: 18, font: KDP.bodyFont, color: 'AAAAAA', italics: true }),
        ],
      })
    );
  }
  if (beat) {
    blocks.push(
      new Paragraph({
        spacing: { before: 120, after: 200 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: beat, font: KDP.bodyFont, size: 28, bold: true })],
      })
    );
  }
  for (const t of textParagraphs) {
    if (!t.trim()) continue;
    blocks.push(para(t));
  }
  blocks.push(pb());
  return blocks;
}

function bodyToPageLines(body) {
  const lines = [];
  const raw = body.split(/\r?\n/);
  let quoteBuf = [];

  const flushQuote = () => {
    if (quoteBuf.length) {
      lines.push(quoteBuf.join(' '));
      quoteBuf = [];
    }
  };

  for (const line of raw) {
    if (line.startsWith('> ')) {
      quoteBuf.push(line.replace(/^>\s?/, ''));
      continue;
    }
    flushQuote();
    const t = line.trim();
    if (!t || t === '---') continue;
    if (/^\*\*Art tease:/i.test(t)) continue;
    if (/^\*\*(?:Image prompt|Art prompt):\*\*/i.test(t)) continue;
    if (/^<!-- generated from/i.test(t)) continue;
    if (/^\[QR placeholder/i.test(t)) {
      lines.push(t);
      continue;
    }
    lines.push(t);
  }
  flushQuote();
  return lines;
}

module.exports = {
  parseInline,
  para,
  pb,
  imagePromptZone,
  artPlaceholder,
  stackedStoryPage,
  textTopicPage,
  bodyToPageLines,
};
