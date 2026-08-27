const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  convertInchesToTwip,
  Footer,
  PageNumber,
} = require('docx');
const { BOOK_TEMPLATE: T } = require('../grove-kdp-book-template');
const { KDP } = require('./constants');
const {
  para,
  pb,
  artPlaceholder,
  stackedStoryPage,
  textTopicPage,
  bodyToPageLines,
} = require('./render-blocks');

function buildFrontMatter(adventure) {
  const year = new Date().getFullYear();
  const subtitle = (adventure.adventureTitle || adventure.title).toUpperCase();
  const blocks = [];

  blocks.push(
    new Paragraph({
      spacing: { before: 2200, after: 200 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: T.seriesTitle, font: KDP.bodyFont, size: 44, bold: true })],
    }),
    new Paragraph({
      spacing: { after: 400 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: subtitle, font: KDP.bodyFont, size: 32, bold: true })],
    }),
    new Paragraph({
      spacing: { before: 600, after: 200 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: T.authorName, font: KDP.bodyFont, size: 28 })],
    }),
    pb()
  );

  blocks.push(
    para(`Copyright © ${year} ${T.copyrightHolder}`, { center: true, before: 3200 }),
    para('All rights reserved.', { center: true }),
    para('ISBN:', { center: true, before: 200 }),
    pb()
  );

  blocks.push(
    new Paragraph({
      spacing: { before: 1400, after: 300 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: T.dedication.heading, font: KDP.bodyFont, size: 28, bold: true })],
    })
  );
  for (const line of T.dedication.paragraphs) {
    if (!line) blocks.push(para(' ', { center: true, after: 80 }));
    else blocks.push(para(line, { center: true, after: 80 }));
  }
  blocks.push(pb());

  blocks.push(...artPlaceholder(T.illustrationPageNote, { fullPage: true }));
  blocks.push(pb());

  blocks.push(
    new Paragraph({
      spacing: { before: 200, after: 80 },
      children: [new TextRun({ text: T.acknowledgments.romanNumeral, font: KDP.bodyFont, size: 22, italics: true })],
    }),
    new Paragraph({
      spacing: { after: 300 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: T.acknowledgments.heading, font: KDP.bodyFont, size: 28, bold: true })],
    })
  );
  for (const line of T.acknowledgments.paragraphs) {
    if (!line) blocks.push(para(' ', { center: true, after: 80 }));
    else blocks.push(para(line, { center: true, after: 80, indent: 0.15 }));
  }
  blocks.push(pb());

  return blocks;
}

function buildBodyPages(adventure, options = {}) {
  const includeBackMatter = options.includeBackMatter === true;
  const blocks = [];

  blocks.push(
    ...textTopicPage(
      'Title',
      [
        adventure.adventureTitle,
        adventure.bookLine || '',
        `${adventure.location || 'Blossom Meadow'} · ${adventure.grovePower || ''}`,
      ],
      'Page 1'
    )
  );

  const castLine = adventure.cast
    ? `Today you'll meet ${adventure.lead || 'Kiki'} and friends: ${adventure.cast.split('(')[0].trim()}.`
    : `Meet ${adventure.lead || 'Kiki the myna bird'} — quick, bright, and always first to the fun.`;
  blocks.push(
    ...textTopicPage(
      'Meet the friends',
      [
        castLine,
        'Spring Fair is tomorrow in Gita Grove!',
        'Hammers, ribbons, and a great drum wait under a red cloth. Everyone is getting ready — but someone small might need a friend first.',
      ],
      'Page 2'
    )
  );

  for (const page of adventure.pageSections) {
    if (!page.isStory && !includeBackMatter) continue;
    const lines = bodyToPageLines(page.body || page.text || '');
    const content = lines.length ? lines : ['[Page content]'];
    const pageNote = `Page ${page.pageNumber}`;
    if (page.isStory) {
      blocks.push(...stackedStoryPage(page.beat, content, pageNote, page.imagePrompt));
    } else {
      blocks.push(...textTopicPage(page.beat, content, pageNote));
    }
  }

  return blocks;
}

function buildAboutAuthor() {
  const blocks = [
    new Paragraph({
      spacing: { before: 400, after: 300 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: T.aboutAuthor.heading, font: KDP.bodyFont, size: 28, bold: true })],
    }),
  ];
  for (const line of T.aboutAuthor.paragraphs) {
    if (!line) blocks.push(para(' ', { after: 80 }));
    else blocks.push(para(line, { indent: 0.25, after: 120 }));
  }
  return blocks;
}

async function renderBookDocx(adventure, options = {}) {
  const children = [
    ...buildFrontMatter(adventure),
    ...buildBodyPages(adventure, options),
    ...buildAboutAuthor(),
  ];

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
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `${T.imprint} · `, size: 18, font: KDP.bodyFont, color: '888888' }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 18, font: KDP.bodyFont, color: '888888' }),
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

module.exports = { renderBookDocx, buildFrontMatter, buildBodyPages, buildAboutAuthor };
