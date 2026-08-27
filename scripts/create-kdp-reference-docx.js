#!/usr/bin/env node
/**
 * Generate scripts/kdp-reference.docx — 6×9 portrait Pandoc reference template.
 *
 * Usage: node scripts/create-kdp-reference-docx.js
 */

const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  convertInchesToTwip,
} = require('docx');

const OUT = path.join(__dirname, 'kdp-reference.docx');

const TRIM_W = 6;
const TRIM_H = 9;
const FONT = 'Georgia';
const BODY = 24; // 12pt

async function main() {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT, size: BODY },
        },
      },
      paragraphStyles: [
        {
          id: 'Title',
          name: 'Title',
          basedOn: 'Normal',
          run: { size: 56, bold: true, font: FONT },
          paragraph: { spacing: { before: 240, after: 120 }, alignment: AlignmentType.CENTER },
        },
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 32, bold: true, font: FONT },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 28, bold: true, font: FONT },
          paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 1 },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: convertInchesToTwip(TRIM_W),
              height: convertInchesToTwip(TRIM_H),
            },
            margin: {
              top: convertInchesToTwip(0.5),
              bottom: convertInchesToTwip(0.5),
              left: convertInchesToTwip(0.625),
              right: convertInchesToTwip(0.625),
            },
          },
        },
        children: [
          new Paragraph({
            heading: HeadingLevel.TITLE,
            children: [new TextRun({ text: 'Gita Grove KDP Reference', font: FONT, size: 56, bold: true })],
          }),
          new Paragraph({
            spacing: { after: 200 },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: '6" × 9" portrait · Seeds default trim · Delete this page after styling',
                italics: true,
                size: 20,
                font: FONT,
                color: '666666',
              }),
            ],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [new TextRun({ text: 'Heading 1', font: FONT, size: 32, bold: true })],
          }),
          new Paragraph({
            children: [new TextRun({ text: 'Normal body text — Georgia 12pt.', font: FONT, size: BODY })],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: 'Heading 2', font: FONT, size: 28, bold: true })],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Stacked story spread: 1:1 art (~4.75") top, text band bottom.',
                font: FONT,
                size: BODY,
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync(OUT, buf);
  console.log('Created:', OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
