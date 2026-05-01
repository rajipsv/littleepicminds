const fs = require('fs');
const path = require('path');

const updatedCh1Start = [
  {
    "title": "Observing the Situation",
    "emoji": "👀",
    "micro_theme": "Look carefully before acting",
    "shlokas": ["1.1", "1.2"],
    "story": {
      "title": "Watching Before Joining",
      "content": "A child was observing a playground before joining. It's always smart to see who is playing and what the rules are before jumping into the game.",
      "moral": "Look carefully before acting to make smart choices."
    },
    "activity": "Before starting your next game, take 10 seconds to observe everything around you."
  },
  {
    "title": "Planning & Strategy",
    "emoji": "🧠",
    "micro_theme": "Think and plan before action",
    "shlokas": ["1.3", "1.4"],
    "story": {
      "title": "The Strategic Plan",
      "content": "A child was planning team strategy. Instead of just running wildly, they thought of a plan to help their team win.",
      "moral": "Thinking and planning before action gives you a big advantage."
    },
    "activity": "What is one 'strategy' you use when playing your favorite game?"
  },
  {
    "title": "Knowing Your Team",
    "emoji": "👥",
    "micro_theme": "Understand your strengths",
    "shlokas": ["1.5", "1.6"],
    "story": {
      "title": "Identifying Team Players",
      "content": "A child was identifying team players. They knew one friend was fast, another was strong, and another was smart. Together, they were an unbeatable team.",
      "moral": "Knowing what you and your friends are good at makes teamwork much easier."
    },
    "activity": "Name one thing you are really good at, and one thing your best friend is really good at."
  },
  {
    "title": "Leadership & Guidance",
    "emoji": "📣",
    "micro_theme": "Leaders guide the team",
    "shlokas": ["1.7", "1.8"],
    "story": {
      "title": "Motivating the Team",
      "content": "The team captain was motivating players. Even when they felt tired, the leader's words made them feel proud and strong again.",
      "moral": "A good leader doesn't just give orders; they motivate and inspire others."
    },
    "activity": "What is one nice thing you can say to encourage a friend today?"
  },
  {
    "title": "Confidence in Strength",
    "emoji": "🧾",
    "micro_theme": "Trust your preparation",
    "shlokas": ["1.9", "1.10"],
    "story": {
      "title": "Feeling Ready",
      "content": "Instead of worrying, a child was feeling ready before the match. They knew they had practiced hard and prepared well.",
      "moral": "Trusting your preparation pushes away your fears."
    },
    "activity": "Count on your fingers 3 things that make you a strong person."
  },
  {
    "title": "Preparing for Action",
    "emoji": "🔔",
    "micro_theme": "Get ready before starting",
    "shlokas": ["1.11", "1.12"],
    "story": {
      "title": "Final Preparation Moment",
      "content": "A child was in the final preparation moment before starting. They tied their shoes tight, drank water, and took deep breaths.",
      "moral": "Taking time to prepare makes the actual task much easier."
    },
    "activity": "What is your routine to 'get ready' before you go to school or sleep?"
  },
  {
    "title": "Energy & Excitement",
    "emoji": "🥁",
    "micro_theme": "Build energy together",
    "shlokas": ["1.13", "1.14"],
    "story": {
      "title": "The Team Cheer",
      "content": "There was huge excitement in the team cheer moment. High energy helps wake up your body and mind for action.",
      "moral": "Excitement and high energy can give you the push you need to start."
    },
    "activity": "Do 5 jumping jacks right now to build some high energy!"
  },
  {
    "title": "Showing Presence",
    "emoji": "🔊",
    "micro_theme": "Step forward with confidence",
    "shlokas": ["1.15", "1.16"],
    "story": {
      "title": "Entering the Stage Boldly",
      "content": "A child was entering the stage boldly. They stood tall and smiled. Even before they spoke a word, everyone believed in them.",
      "moral": "Standing tall and confident helps you believe in yourself, and helps others believe in you too."
    },
    "activity": "Stand up straight, push your chest out slightly, and hold your head high!"
  },
  {
    "title": "Readiness & Focus",
    "emoji": "🎯",
    "micro_theme": "Be ready when action begins",
    "shlokas": ["1.17", "1.18"],
    "story": {
      "title": "Waiting for Your Turn",
      "content": "A child was waiting for their turn in a game. They held their bat ready, eyes on the ball, completely focused.",
      "moral": "Stay alert and focused so you are ready when it's your time to act."
    },
    "activity": "What do you do to stay patient and ready when you have to wait for your turn?"
  },
  {
    "title": "Final Observation",
    "emoji": "👁️",
    "micro_theme": "Observe before taking action",
    "shlokas": ["1.19", "1.20"],
    "story": {
      "title": "Looking Before Making a Move",
      "content": "The child was looking before making a move. Instead of just running blindly, they checked the whole field one last time.",
      "moral": "Final observation ensures you have the full picture before you act."
    },
    "activity": "Before starting your next task, take one last look to make sure you have everything you need."
  }
];

const apiThemesPath = path.join(__dirname, 'api/data/themes.json');
const themesData = JSON.parse(fs.readFileSync(apiThemesPath, 'utf8'));

// We keep the "Arjuna's Confusion" themes which started fromverse 1.28
// In the current themesData.gita['1'], these are themes that were previously 16-29.
let existingCh1 = themesData.gita['1'] || [];
// Filter out themes that were for verses < 1.21 (the first 15 themes we added previously)
let confusionThemes = existingCh1.filter(t => {
  const firstShloka = t.shlokas[0];
  const verseNum = parseFloat(firstShloka.split('.')[1]);
  return verseNum >= 21;
});

const combinedThemes = [...updatedCh1Start, ...confusionThemes];

// Re-assign IDs
combinedThemes.forEach((theme, index) => {
  theme.id = `theme_1_${index + 1}`;
});

themesData.gita['1'] = combinedThemes;

fs.writeFileSync(apiThemesPath, JSON.stringify(themesData, null, 2));

const backendThemesPath = path.join(__dirname, 'backend/data/themes.json');
fs.writeFileSync(backendThemesPath, JSON.stringify(themesData, null, 2));

console.log('Updated Chapter 1 themes successfully!');
