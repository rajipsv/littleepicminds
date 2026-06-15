/**
 * Pandit-curated 61 storybooks (Seeds + Seekers side-by-side per chapter).
 * No filler themes — UI shows only roadmap books.
 */
module.exports = {
  seeds: {
    meta: {
      version: 4,
      title: 'Little Epic Minds — Seeds curriculum (60 storybooks, 2 shlokas each)',
      seedsTotal: 60,
      idPrefix: 'sd',
      shlokasPerTheme: 2,
      source: 'Pandit roadmap — Wonder Skills (ages 5–7)',
    },
    chapters: {
      1: {
        title: 'The Courage to Start',
        themes: [
          { id: 'sd1_01', shlokas: ['1.1', '1.2'], theme: 'The Big Day', book: 1 },
          { id: 'sd1_02', shlokas: ['1.20', '1.21'], theme: 'The Inner Brave', book: 2 },
          { id: 'sd1_03', shlokas: ['1.28', '1.47'], theme: "It's Okay to be Nervous", book: 3 },
        ],
      },
      2: {
        title: 'The Secret of the Hero',
        themes: [
          { id: 'sd2_01', shlokas: ['2.18', '2.19'], theme: 'The Magic House', book: 4 },
          { id: 'sd2_02', shlokas: ['2.20', '2.21'], theme: 'The Never-Ending Light', book: 5 },
          { id: 'sd2_03', shlokas: ['2.22', '2.23'], theme: 'The Magic Wardrobe', book: 6 },
          { id: 'sd2_04', shlokas: ['2.13', '2.14'], theme: 'Summer and Winter', book: 7 },
          { id: 'sd2_05', shlokas: ['2.47', '2.48'], theme: 'The Best Effort', book: 8 },
          { id: 'sd2_06', shlokas: ['2.58', '2.59'], theme: 'The Wise Turtle', book: 9 },
          { id: 'sd2_07', shlokas: ['2.70', '2.71'], theme: "The Ocean's Peace", book: 10 },
        ],
      },
      3: {
        title: 'The Power of Helping',
        themes: [
          { id: 'sd3_01', shlokas: ['3.10', '3.11'], theme: 'The Magic of Sharing', book: 11 },
          { id: 'sd3_02', shlokas: ['3.20', '3.21'], theme: 'Be a Little Leader', book: 12 },
          { id: 'sd3_03', shlokas: ['3.35', '3.36'], theme: 'Being Myself', book: 13 },
          { id: 'sd3_04', shlokas: ['3.41', '3.42'], theme: 'The Smart Choices', book: 14 },
        ],
      },
      4: {
        title: 'The Power of Knowledge',
        themes: [
          { id: 'sd4_01', shlokas: ['4.7', '4.8'], theme: 'The Hero Returns', book: 15 },
          { id: 'sd4_02', shlokas: ['4.11', '4.12'], theme: 'The Mirror Secret', book: 16 },
          { id: 'sd4_03', shlokas: ['4.18', '4.20'], theme: 'The Happy Work', book: 17 },
          { id: 'sd4_04', shlokas: ['4.38', '4.39'], theme: 'Knowledge Cleans Everything', book: 18 },
        ],
      },
      5: {
        title: 'The Lotus Secret',
        themes: [
          { id: 'sd5_01', shlokas: ['5.10', '5.11'], theme: 'The Lotus Leaf', book: 19 },
          { id: 'sd5_02', shlokas: ['5.18', '5.19'], theme: 'One Light, Many Lamps', book: 20 },
          { id: 'sd5_03', shlokas: ['5.24', '5.26'], theme: 'The Secret Smile', book: 21 },
        ],
      },
      6: {
        title: 'The Superpower of Focus',
        themes: [
          { id: 'sd6_01', shlokas: ['6.5', '6.6'], theme: 'My Mind-Friend', book: 22 },
          { id: 'sd6_02', shlokas: ['6.18', '6.19'], theme: 'The Steady Candle', book: 23 },
          { id: 'sd6_03', shlokas: ['6.34', '6.35'], theme: 'Taming the Wind', book: 24 },
        ],
      },
      7: {
        title: 'The Magic in Everything',
        themes: [
          { id: 'sd7_01', shlokas: ['7.6', '7.7'], theme: 'The Pearl Necklace', book: 25 },
          { id: 'sd7_02', shlokas: ['7.8', '7.9'], theme: 'The Taste of Life', book: 26 },
          { id: 'sd7_03', shlokas: ['7.16', '7.17'], theme: 'The Best Friend', book: 27 },
        ],
      },
      8: {
        title: 'The Journey Home',
        themes: [
          { id: 'sd8_01', shlokas: ['8.5', '8.7'], theme: 'Thinking of Love', book: 28 },
          { id: 'sd8_02', shlokas: ['8.8', '8.14'], theme: 'The Bright Road', book: 29 },
        ],
      },
      9: {
        title: 'The King of Secrets',
        themes: [
          { id: 'sd9_01', shlokas: ['9.26', '9.27'], theme: 'The Simplest Gift', book: 30 },
          { id: 'sd9_02', shlokas: ['9.22', '9.31'], theme: 'Always Safe', book: 31 },
        ],
      },
      10: {
        title: 'The Hero in Everything',
        themes: [
          { id: 'sd10_01', shlokas: ['10.21', '10.41'], theme: 'The Best of the Best', book: 32 },
          { id: 'sd10_02', shlokas: ['10.27', '10.30'], theme: 'The Mightiest Friends', book: 33 },
          { id: 'sd10_03', shlokas: ['10.10', '10.11'], theme: 'The Inner Lamp', book: 34 },
          { id: 'sd10_04', shlokas: ['10.20', '10.39'], theme: 'The Secret Heart', book: 35 },
        ],
      },
      11: {
        title: 'The Universal Hero',
        themes: [
          { id: 'sd11_01', shlokas: ['11.8', '11.12'], theme: 'The Eyes of the World', book: 36 },
          { id: 'sd11_02', shlokas: ['11.32', '11.33'], theme: 'The Great Protector', book: 37 },
          { id: 'sd11_03', shlokas: ['11.54', '11.55'], theme: 'Just Love', book: 38 },
        ],
      },
      12: {
        title: 'The Heart of Love',
        themes: [
          { id: 'sd12_01', shlokas: ['12.2', '12.5'], theme: 'Talking to Love', book: 39 },
          { id: 'sd12_02', shlokas: ['12.8', '12.10'], theme: 'Do Your Best', book: 40 },
          { id: 'sd12_03', shlokas: ['12.13', '12.14'], theme: "Everyone's Friend", book: 41 },
        ],
      },
      13: {
        title: 'The Secret of the Garden',
        themes: [
          { id: 'sd13_01', shlokas: ['13.1', '13.2'], theme: 'The Magic Garden', book: 43 },
          { id: 'sd13_02', shlokas: ['13.7', '13.8'], theme: 'Planting Kindness', book: 44 },
          { id: 'sd13_03', shlokas: ['13.33', '13.34'], theme: 'The Bright Sun', book: 45 },
        ],
      },
      14: {
        title: 'The Three Colors of You',
        themes: [
          { id: 'sd14_01', shlokas: ['14.5', '14.6'], theme: 'The Red, Yellow, and Blue', book: 46 },
          { id: 'sd14_02', shlokas: ['14.11', '14.18'], theme: 'Choosing the Light', book: 47 },
          { id: 'sd14_03', shlokas: ['14.20', '14.26'], theme: 'Above the Colors', book: 48 },
        ],
      },
      15: {
        title: 'The Magic Upside-Down Tree',
        themes: [
          { id: 'sd15_01', shlokas: ['15.1', '15.3'], theme: 'The Sky-Root Tree', book: 49 },
          { id: 'sd15_02', shlokas: ['15.6', '15.12'], theme: 'The Sun Inside', book: 50 },
          { id: 'sd15_03', shlokas: ['15.15', '15.18'], theme: 'The Secret Guest', book: 51 },
        ],
      },
      16: {
        title: 'The Hero and the Grump',
        themes: [
          { id: 'sd16_01', shlokas: ['16.1', '16.3'], theme: "The Hero's Toolbox", book: 52 },
          { id: 'sd16_02', shlokas: ['16.4', '16.21'], theme: 'The Grumpy Clouds', book: 53 },
          { id: 'sd16_03', shlokas: ['16.23', '16.24'], theme: 'The Rule Book', book: 54 },
        ],
      },
      17: {
        title: 'The Three Ways of Living',
        themes: [
          { id: 'sd17_01', shlokas: ['17.8', '17.10'], theme: 'Yummy for the Tummy', book: 55 },
          { id: 'sd17_02', shlokas: ['17.15', '17.16'], theme: 'The Happy Tongue', book: 56 },
          { id: 'sd17_03', shlokas: ['17.20', '17.22'], theme: 'Giving with Love', book: 57 },
          { id: 'sd17_04', shlokas: ['17.23', '17.28'], theme: 'Om Tat Sat', book: 58 },
        ],
      },
      18: {
        title: 'The Grand Finale',
        themes: [
          { id: 'sd18_01', shlokas: ['18.37', '18.38'], theme: 'The Best Kind of Happy', book: 59 },
          { id: 'sd18_02', shlokas: ['18.45', '18.46'], theme: 'Your Special Path', book: 60 },
          { id: 'sd18_03', shlokas: ['18.61', '18.66'], theme: 'You are Never Alone', book: 61 },
        ],
      },
    },
  },

  seekers: {
    meta: {
      version: 4,
      title: 'Little Epic Minds — Seekers curriculum (60 storybooks, 2-4 shlokas each)',
      seekersTotal: 60,
      idPrefix: 'sk',
      shlokasPerTheme: '2-4',
      source: 'Pandit roadmap — Mind Skills (ages 8–10)',
    },
    chapters: {
      1: {
        title: 'The Courage to Start',
        themes: [
          { id: 'sk1_01', shlokas: ['1.1', '1.2', '1.3'], theme: "The Scout's Strategy", book: 1 },
          { id: 'sk1_02', shlokas: ['1.20', '1.21', '1.22'], theme: 'The Center Point', book: 2 },
          { id: 'sk1_03', shlokas: ['1.28', '1.29', '1.30'], theme: 'Mastering the Spin', book: 3 },
        ],
      },
      2: {
        title: 'The Science of Mastery',
        themes: [
          { id: 'sk2_01', shlokas: ['2.17', '2.18', '2.19'], theme: 'The Eternal Pilot', book: 4 },
          { id: 'sk2_02', shlokas: ['2.11', '2.22', '2.23'], theme: 'The Physics of Change', book: 5 },
          { id: 'sk2_03', shlokas: ['2.13', '2.14', '2.15'], theme: 'The Weather Observer', book: 6 },
          { id: 'sk2_04', shlokas: ['2.47', '2.48', '2.50'], theme: 'Skill in Action', book: 7 },
          { id: 'sk2_05', shlokas: ['2.62', '2.63', '2.64'], theme: 'The Ladder of Fall', book: 8 },
          { id: 'sk2_06', shlokas: ['2.58', '2.59', '2.60'], theme: 'The Master of Senses', book: 9 },
          { id: 'sk2_07', shlokas: ['2.70', '2.71', '2.72'], theme: 'The Peaceful Leader', book: 10 },
        ],
      },
      3: {
        title: 'The Power of Helping',
        themes: [
          { id: 'sk3_01', shlokas: ['3.10', '3.11', '3.12'], theme: 'The Law of Reciprocity', book: 11 },
          { id: 'sk3_02', shlokas: ['3.20', '3.21', '3.25'], theme: 'The Ripple Effect', book: 12 },
          { id: 'sk3_03', shlokas: ['3.35', '3.36', '3.37'], theme: 'The Integrity Code', book: 13 },
          { id: 'sk3_04', shlokas: ['3.40', '3.41', '3.42'], theme: 'The Hierarchy of Power', book: 14 },
        ],
      },
      4: {
        title: 'The Power of Knowledge',
        themes: [
          { id: 'sk4_01', shlokas: ['4.7', '4.8', '4.9'], theme: 'The Purpose of Birth', book: 15 },
          { id: 'sk4_02', shlokas: ['4.10', '4.11', '4.12'], theme: 'The Reciprocity Law', book: 16 },
          { id: 'sk4_03', shlokas: ['4.18', '4.19', '4.20', '4.22'], theme: 'Inner Peace in Action', book: 17 },
          { id: 'sk4_04', shlokas: ['4.38', '4.39', '4.41', '4.42'], theme: 'The Sword of Wisdom', book: 18 },
        ],
      },
      5: {
        title: 'The Lotus Secret',
        themes: [
          { id: 'sk5_01', shlokas: ['5.10', '5.11', '5.12'], theme: 'The Waterproof Mind', book: 19 },
          { id: 'sk5_02', shlokas: ['5.18', '5.19', '5.20'], theme: 'The Universal Vision', book: 20 },
          { id: 'sk5_03', shlokas: ['5.23', '5.24', '5.25', '5.26'], theme: 'The Inner Fortress', book: 21 },
        ],
      },
      6: {
        title: 'The Superpower of Focus',
        themes: [
          { id: 'sk6_01', shlokas: ['6.5', '6.6', '6.7'], theme: 'The Internal Ally', book: 22 },
          { id: 'sk6_02', shlokas: ['6.12', '6.18', '6.19'], theme: 'The Laser Beam', book: 23 },
          { id: 'sk6_03', shlokas: ['6.33', '6.34', '6.35', '6.36'], theme: 'The Habit Cycle', book: 24 },
        ],
      },
      7: {
        title: 'The Magic in Everything',
        themes: [
          { id: 'sk7_01', shlokas: ['7.4', '7.5', '7.7'], theme: 'The Invisible Thread', book: 25 },
          { id: 'sk7_02', shlokas: ['7.8', '7.9', '7.10', '7.11'], theme: 'The Essence of Being', book: 26 },
          { id: 'sk7_03', shlokas: ['7.16', '7.17', '7.18', '7.19'], theme: 'The Four Seekers', book: 27 },
        ],
      },
      8: {
        title: 'The Journey Home',
        themes: [
          { id: 'sk8_01', shlokas: ['8.5', '8.6', '8.7'], theme: 'The Final Impression', book: 28 },
          { id: 'sk8_02', shlokas: ['8.8', '8.12', '8.13', '8.14'], theme: 'The Master of Focus', book: 29 },
        ],
      },
      9: {
        title: 'The King of Secrets',
        themes: [
          { id: 'sk9_01', shlokas: ['9.26', '9.27', '9.28'], theme: 'The Heart of Action', book: 30 },
          { id: 'sk9_02', shlokas: ['9.22', '9.30', '9.31', '9.34'], theme: 'The Law of Protection', book: 31 },
        ],
      },
      10: {
        title: 'The Hero in Everything',
        themes: [
          { id: 'sk10_01', shlokas: ['10.21', '10.23', '10.41'], theme: 'Source of Brilliance', book: 32 },
          { id: 'sk10_02', shlokas: ['10.27', '10.30', '10.31'], theme: 'Force of Time', book: 33 },
          { id: 'sk10_03', shlokas: ['10.8', '10.9', '10.10', '10.11'], theme: 'Yoga of Intelligence', book: 34 },
          { id: 'sk10_04', shlokas: ['10.19', '10.20', '10.39', '10.42'], theme: 'The Soul Supports the World', book: 35 },
        ],
      },
      11: {
        title: 'The Universal Hero',
        themes: [
          { id: 'sk11_01', shlokas: ['11.8', '11.11', '11.12', '11.13'], theme: 'The Cosmic Vision', book: 36 },
          { id: 'sk11_02', shlokas: ['11.32', '11.33', '11.34'], theme: 'The Master of Time', book: 37 },
          { id: 'sk11_03', shlokas: ['11.53', '11.54', '11.55'], theme: 'The Path of Devotion', book: 38 },
        ],
      },
      12: {
        title: 'The Heart of Love',
        themes: [
          { id: 'sk12_01', shlokas: ['12.1', '12.2', '12.5'], theme: 'The Focused Heart', book: 39 },
          { id: 'sk12_02', shlokas: ['12.8', '12.9', '12.10', '12.11'], theme: 'The Ladder of Practice', book: 40 },
          { id: 'sk12_03', shlokas: ['12.13', '12.14', '12.15'], theme: 'The Balanced Leader', book: 41 },
        ],
      },
      13: {
        title: 'The Secret of the Garden',
        themes: [
          { id: 'sk13_01', shlokas: ['13.1', '13.2', '13.3'], theme: 'The Field and the Knower', book: 43 },
          { id: 'sk13_02', shlokas: ['13.7', '13.8', '13.9', '13.11'], theme: 'The 20 Gems of Wisdom', book: 44 },
          { id: 'sk13_03', shlokas: ['13.29', '13.30', '13.33', '13.34'], theme: 'The Observer', book: 45 },
        ],
      },
      14: {
        title: 'The Three Colors of You',
        themes: [
          { id: 'sk14_01', shlokas: ['14.5', '14.6', '14.7', '14.8'], theme: 'The Forces of Nature', book: 46 },
          { id: 'sk14_02', shlokas: ['14.11', '14.16', '14.17', '14.18'], theme: 'The Outcome of Habits', book: 47 },
          { id: 'sk14_03', shlokas: ['14.20', '14.24', '14.25', '14.26'], theme: 'The Master of Moods', book: 48 },
        ],
      },
      15: {
        title: 'The Magic Upside-Down Tree',
        themes: [
          { id: 'sk15_01', shlokas: ['15.1', '15.2', '15.3'], theme: 'The Tree of the World', book: 49 },
          { id: 'sk15_02', shlokas: ['15.6', '15.12', '15.13', '15.14'], theme: 'The Power Behind the Light', book: 50 },
          { id: 'sk15_03', shlokas: ['15.15', '15.18', '15.19'], theme: 'The Librarian of the Mind', book: 51 },
        ],
      },
      16: {
        title: 'The Hero and the Grump',
        themes: [
          { id: 'sk16_01', shlokas: ['16.1', '16.2', '16.3'], theme: 'The Divine Wealth', book: 52 },
          { id: 'sk16_02', shlokas: ['16.4', '16.12', '16.21'], theme: 'The Three Gates to Darkness', book: 53 },
          { id: 'sk16_03', shlokas: ['16.22', '16.23', '16.24'], theme: 'The Authority of Truth', book: 54 },
        ],
      },
      17: {
        title: 'The Three Ways of Living',
        themes: [
          { id: 'sk17_01', shlokas: ['17.7', '17.8', '17.9', '17.10'], theme: 'The Science of Food', book: 55 },
          { id: 'sk17_02', shlokas: ['17.14', '17.15', '17.16'], theme: 'The Tapas of Speech', book: 56 },
          { id: 'sk17_03', shlokas: ['17.20', '17.21', '17.22'], theme: 'The Art of Charity', book: 57 },
          { id: 'sk17_04', shlokas: ['17.23', '17.24', '17.25', '17.27'], theme: 'The Seal of Truth', book: 58 },
        ],
      },
      18: {
        title: 'The Grand Finale',
        themes: [
          { id: 'sk18_01', shlokas: ['18.36', '18.37', '18.38', '18.39'], theme: 'Bitter First, Sweet Later', book: 59 },
          { id: 'sk18_02', shlokas: ['18.45', '18.46', '18.47', '18.48'], theme: 'The Skillful Swadharma', book: 60 },
          { id: 'sk18_03', shlokas: ['18.61', '18.63', '18.65', '18.66'], theme: 'The Ultimate Promise', book: 61 },
        ],
      },
    },
  },
};
