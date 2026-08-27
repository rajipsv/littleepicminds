/**
 * Build a KDP-oriented DOCX from parsed Grove manuscript sections.
 * Trim: 8.5" × 8.5" square (Seeds default). Margins suit interior text layout;
 * adjust in Word before upload if your KDP template differs.
 */

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

const KDP = {
  trimInches: 8.5,
  marginsInches: { top: 0.5, bottom: 0.5, left: 0.625, right: 0.625 },
  bodyFont: 'Georgia',
  bodySize: 24, // half-points → 12pt
  headingSize: 28,
};

function parseInline(text) {
  const runs = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      runs.push(new TextRun({ text: text.slice(last, m.index), font: KDP.bodyFont, size: KDP.bodySize }));
    }
    const token = m[0];
    if (token.startsWith('**')) {
      runs.push(
        new TextRun({
          text: token.slice(2, -2),
          bold: true,
          font: KDP.bodyFont,
          size: KDP.bodySize,
        })
      );
    } else if (token.startsWith('*')) {
      runs.push(
        new TextRun({
          text: token.slice(1, -1),
          italics: true,
          font: KDP.bodyFont,
          size: KDP.bodySize,
        })
      );
    } else {
      runs.push(new TextRun({ text: token.slice(1, -1), font: 'Consolas', size: KDP.bodySize }));
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

function paragraphFromLine(line, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    alignment: opts.center ? AlignmentType.CENTER : undefined,
    children: parseInline(line),
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
        children: parseInline(line),
      })
  );
}

/**
 * @param {string} md raw manuscript markdown
 * @returns {{ title: string, adventureId: string, sections: Array<{name: string, body: string}> }}
 */
function parseManuscriptMarkdown(md) {
  const titleMatch = md.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : 'Gita Grove Manuscript';
  const idMatch = md.match(/`?(gv\d+_a\d+)`?/i);
  const adventureId = idMatch ? idMatch[1].toLowerCase() : 'gv00_a0';

  const parts = md.split(/\n(?=## )/);
  const sections = [];
  for (const part of parts) {
    const head = part.match(/^## (.+?)(?:\r?\n|$)/);
    if (!head) continue;
    const name = head[1].trim();
    const body = part.replace(/^## .+?\r?\n?/, '').trim();
    if (body) sections.push({ name, body });
  }
  return { title, adventureId, sections };
}

function bodyToParagraphs(body, sectionName) {
  const out = [];
  const lines = body.split(/\r?\n/);
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
        if (cells.length) {
          out.push(paragraphFromLine(cells.join(' — '), { center: false }));
        }
      }
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      out.push(paragraphFromLine(line));
      i++;
      continue;
    }
    if (line.trim() === '') {
      i++;
      continue;
    }
    out.push(paragraphFromLine(line));
    i++;
  }

  if (/^Story$/i.test(sectionName)) {
    out.unshift(
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: '[Production: flow story spreads to pages 3–15 per page map]',
            italics: true,
            size: 20,
            font: KDP.bodyFont,
            color: '666666',
          }),
        ],
      })
    );
  }
  return out;
}

async function buildKdpDocx(parsed) {
  const children = [];

  children.push(
    heading(parsed.title, HeadingLevel.TITLE),
    paragraphFromLine(`Adventure ${parsed.adventureId}`, { center: true }),
    paragraphFromLine('Little Epic Minds · Gita Grove', { center: true }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `KDP interior draft · ${KDP.trimInches}" × ${KDP.trimInches}" square trim · B&W interior + separate cover`,
          italics: true,
          size: 20,
          font: KDP.bodyFont,
        }),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  for (const section of parsed.sections) {
    if (/^Change log$/i.test(section.name)) continue;
    if (/^Art briefs/i.test(section.name)) {
      children.push(heading(section.name, HeadingLevel.HEADING_1));
      children.push(
        paragraphFromLine('[Art briefs omitted from KDP text export — see source markdown for illustrators]')
      );
      children.push(new Paragraph({ children: [new PageBreak()] }));
      continue;
    }

    children.push(heading(section.name, HeadingLevel.HEADING_1));
    children.push(...bodyToParagraphs(section.body, section.name));
    children.push(new Paragraph({ children: [new PageBreak()] }));
  }

  children.push(
    heading('KDP upload checklist', HeadingLevel.HEADING_1),
    paragraphFromLine('☐ Set trim size 8.5 × 8.5 in (21.59 × 21.59 cm) in KDP print settings'),
    paragraphFromLine('☐ Verify margins after art placement (gutter if page count > 40)'),
    paragraphFromLine('☐ Upload cover as separate PDF (not this file)'),
    paragraphFromLine('☐ Proof interior in KDP previewer before publish'),
    paragraphFromLine('☐ ISBN / copyright page added if required for your edition')
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: convertInchesToTwip(KDP.trimInches),
              height: convertInchesToTwip(KDP.trimInches),
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
                    text: parsed.adventureId,
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

module.exports = { parseManuscriptMarkdown, buildKdpDocx, KDP };
