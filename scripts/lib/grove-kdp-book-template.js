/**
 * Front / back matter template derived from ch2slk47_6_9_v2.pdf
 * (6×9 KDP reference in gita-grove-authoring).
 *
 * Structure:
 *   1 Title · 2 Copyright · 3 Dedication · 4 Illustration · 5 Acknowledgments
 *   … body pages …
 *   last About the Author
 */

const BOOK_TEMPLATE = {
  referencePdf: 'gita-grove-authoring/ch2slk47_6_9_v2.pdf',
  seriesTitle: 'GITA GROVE',
  authorName: 'Rajeswari Ponnuru',
  copyrightHolder: 'Rajeswari Ponnuru',
  imprint: 'Little Epic Minds',

  dedication: {
    heading: 'DEDICATION',
    paragraphs: [
      'I would like to express my sincere gratitude to my parents,',
      'Srinivasa Rao Ponnuru and Ramadevi Ponnuru',
      '',
      'for their unwavering support, encouragement, and belief in my abilities. Their',
      'guidance and sacrifices have played a vital role in my life.',
    ],
  },

  acknowledgments: {
    romanNumeral: 'i',
    heading: 'ACKNOWLEDGMENTS',
    paragraphs: [
      'I would like to lovingly thank my dear children for their patience,',
      'understanding, and constant encouragement while I worked on this book.',
      '',
      'Your smiles, questions, and curiosity inspire me every day.',
      'Thank you for giving me the time and space to create, and for being my',
      'greatest motivation.',
    ],
  },

  aboutAuthor: {
    heading: 'ABOUT THE AUTHOR',
    paragraphs: [
      'Rajeswari Ponnuru is an author focused on presenting classical teachings in an accessible format for children. Drawing inspiration from the Bhagavad Gita and practical life experiences, she develops stories that integrate ethical values with everyday situations.',
      '',
      'Through the Gita Grove series, she aims to support character development and thoughtful decision-making in young readers — pairing timeless wisdom with meadow adventures children can feel in their own hearts.',
    ],
  },

  illustrationPageNote: 'Full-page illustration (optional) — frontispiece before story',
};

module.exports = { BOOK_TEMPLATE };
