const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  PageBreak,
  AlignmentType,
  convertInchesToTwip,
  Footer,
  Header,
} = require('docx');
const { KDP } = require('./constants');
const { parseInline, imagePromptZone } = require('./render-blocks');

function paragraphFromLine(line, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    alignment: opts.center ? AlignmentType.CENTER : undefined,
    children: parseInline(line, { allowCode: true }),
  });
}

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, font: KDP.bodyFont, size: KDP.headingSize })],
  });
}

function blockquoteLines(lines) {
  return lines.map(
    (line) =>
      new Paragraph({
        indent: { left: convertInchesToTwip(0.35) },
        spacing: { after: 80 },
        children: parseInline(line, { allowCode: true }),
      })
  );
}

function renderStorySectionDraft(adventure) {
  const out = [
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: '[Stacked layout: image prompt zone + story text per page from *.story.json]',
          italics: true,
          size: 20,
          font: KDP.bodyFont,
          color: '666666',
        }),
      ],
    }),
  ];

  for (const page of adventure.pageSections.filter((p) => p.isStory)) {
    out.push(...imagePromptZone(page.beat, page.imagePrompt));
    out.push(heading(page.beat, HeadingLevel.HEADING_2));
    for (const line of (page.body || page.text || '').split(/\r?\n/)) {
      if (!line.trim()) continue;
      out.push(paragraphFromLine(line));
    }
  }
  return out;
}

function bodyToParagraphs(body, sectionName, layout, adventure) {
  const out = [];
  const lines = body.split(/\r?\n/);
  const isStory = /^Story$/i.test(sectionName.trim());

  if (layout === 'stacked' && isStory) {
    return renderStorySectionDraft(adventure);
  }

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '---') {
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      out.push(heading(line.replace(/^###\s+/, ''), HeadingLevel.HEADING_2));
      i++;
      continue;
    }
    if (line.startsWith('> ')) {
      const quote = [];
      while (i < lines.length && (lines[i].startsWith('> ') || lines[i].trim() === '')) {
        if (lines[i].startsWith('> ')) quote.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      out.push(...blockquoteLines(quote));
      continue;
    }
    if (line.startsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      for (const tl of tableLines) {
        if (/^\|[\s-:|]+\|$/.test(tl.trim())) continue;
        const cells = tl
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim())
          .filter(Boolean);
        if (cells.length) out.push(paragraphFromLine(cells.join(' — ')));
      }
      continue;
    }
    if (/^\d+\.\s/.test(line) || line.trim()) {
      if (line.trim()) out.push(paragraphFromLine(line));
    }
    i++;
  }
  return out;
}

async function renderDraftDocx(adventure, options = {}) {
  const layout = options.layout || 'default';
  const children = [];

  children.push(
    heading(adventure.title, HeadingLevel.TITLE),
    paragraphFromLine(`Adventure ${adventure.adventureId}`, { center: true }),
    paragraphFromLine('Little Epic Minds · Gita Grove', { center: true }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `KDP interior draft · ${KDP.trimWidthInches}" × ${KDP.trimHeightInches}" portrait · B&W interior + separate cover`,
          italics: true,
          size: 20,
          font: KDP.bodyFont,
        }),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  for (const section of adventure.sections) {
    if (/^Change log$/i.test(section.name)) continue;
    if (/^Art briefs/i.test(section.name)) {
      children.push(heading(section.name, HeadingLevel.HEADING_1));
      children.push(
        paragraphFromLine('[Art briefs omitted from KDP text export — see source markdown for illustrators]')
      );
      children.push(new Paragraph({ children: [new PageBreak()] }));
      continue;
    }
    if (/^Story$/i.test(section.name) && layout === 'stacked') {
      children.push(heading(section.name, HeadingLevel.HEADING_1));
      children.push(...renderStorySectionDraft(adventure));
      children.push(new Paragraph({ children: [new PageBreak()] }));
      continue;
    }
    if (/^Story$/i.test(section.name)) {
      children.push(heading(section.name, HeadingLevel.HEADING_1));
      children.push(
        paragraphFromLine('[Story lives in *.story.json — run npm run grove:compile to preview in markdown]')
      );
      children.push(new Paragraph({ children: [new PageBreak()] }));
      continue;
    }

    children.push(heading(section.name, HeadingLevel.HEADING_1));
    children.push(...bodyToParagraphs(section.body, section.name, layout, adventure));
    children.push(new Paragraph({ children: [new PageBreak()] }));
  }

  children.push(
    heading('KDP upload checklist', HeadingLevel.HEADING_1),
    paragraphFromLine('☐ Set trim size 6 × 9 in (15.24 × 22.86 cm) in KDP print settings'),
    paragraphFromLine('☐ Interior ink: Black & white · Paper: White · Cover: full-color PDF (separate)'),
    paragraphFromLine('☐ Story pages: 1:1 art (~4.75") in top zone, text in bottom band'),
    paragraphFromLine('☐ Verify margins after art placement (gutter if page count > 40)'),
    paragraphFromLine('☐ Optional: Amazon Endure font to reduce page count'),
    paragraphFromLine('☐ Save as PDF with embedded fonts; proof in KDP previewer before publish')
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: convertInchesToTwip(KDP.trimWidthInches),
              height: convertInchesToTwip(KDP.trimHeightInches),
            },
            margin: {
              top: convertInchesToTwip(KDP.marginsInches.top),
              bottom: convertInchesToTwip(KDP.marginsInches.bottom),
              left: convertInchesToTwip(KDP.marginsInches.left),
              right: convertInchesToTwip(KDP.marginsInches.right),
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: adventure.adventureId,
                    size: 18,
                    font: KDP.bodyFont,
                    color: '888888',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Little Epic Minds',
                    size: 18,
                    font: KDP.bodyFont,
                    color: '888888',
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}

module.exports = { renderDraftDocx };
