const fs = require('fs');
const path = require('path');

const newCh1Themes = [
  {
    "title": "Observing the Situation",
    "emoji": "👀",
    "micro_theme": "Look carefully before acting",
    "shlokas": ["1.1", "1.2"],
    "story": {
      "title": "Before the Game Begins",
      "content": "A child was observing a playground before joining. It's always smart to see who is playing and what the rules are before jumping into the game.",
      "moral": "Look carefully before acting to make smart choices."
    },
    "activity": "Before starting your next game, take 10 seconds to observe everything around you."
  },
  {
    "title": "Strategic Thinking",
    "emoji": "🧠",
    "micro_theme": "Think before you act",
    "shlokas": ["1.2", "1.3"],
    "story": {
      "title": "The Master Plan",
      "content": "A child was planning before a big game. Instead of just running wildly, they thought of a plan to help their team win.",
      "moral": "Thinking before you act gives you a big advantage."
    },
    "activity": "What is one 'strategy' you use when playing your favorite game?"
  },
  {
    "title": "Recognizing Strengths",
    "emoji": "👥",
    "micro_theme": "Know who is strong and capable",
    "shlokas": ["1.3", "1.4"],
    "story": {
      "title": "The Dream Team",
      "content": "A child was identifying team strengths. They knew one friend was fast, another was strong, and another was smart. Together, they were an unbeatable team.",
      "moral": "Knowing what you and your friends are good at makes teamwork much easier."
    },
    "activity": "Name one thing you are really good at, and one thing your best friend is really good at."
  },
  {
    "title": "Team Awareness",
    "emoji": "🛡️",
    "micro_theme": "Everyone has a role",
    "shlokas": ["1.4", "1.5"],
    "story": {
      "title": "Playing Your Part",
      "content": "Each child in the team has a role. Some attack, some defend, and some pass the ball. If everyone tries to do the same thing, the team fails. But when everyone plays their role, the team wins.",
      "moral": "Every single person on a team is important and has a special job to do."
    },
    "activity": "If your family was a superhero team, what would your 'superpower' role be?"
  },
  {
    "title": "Comparing Teams",
    "emoji": "⚖️",
    "micro_theme": "Understanding both sides",
    "shlokas": ["1.5", "1.6"],
    "story": {
      "title": "Sizing Up the Challenge",
      "content": "A child was comparing two teams before the match. It's important to understand not just how strong your team is, but also what the other team is good at.",
      "moral": "Understanding both sides of a challenge helps you prepare better."
    },
    "activity": "Think of a challenge you have. What makes it hard, and what makes you strong enough to beat it?"
  },
  {
    "title": "Leadership & Pride",
    "emoji": "📣",
    "micro_theme": "Leaders guide and motivate",
    "shlokas": ["1.7", "1.8"],
    "story": {
      "title": "The Team Captain",
      "content": "The team captain was encouraging all the players. Even when they felt tired, the leader's words made them feel proud and strong again.",
      "moral": "A good leader doesn't just give orders; they motivate and inspire others."
    },
    "activity": "What is one nice thing you can say to encourage a friend today?"
  },
  {
    "title": "Listing Strengths",
    "emoji": "🧾",
    "micro_theme": "Focus on strengths, not fear",
    "shlokas": ["1.8", "1.9"],
    "story": {
      "title": "The Strength List",
      "content": "Instead of worrying about what could go wrong, a child started listing out loud what they were good at. 'I am fast, I practiced hard, and I have a great team!' Their fear disappeared.",
      "moral": "Focusing on your strengths pushes away your fears."
    },
    "activity": "Count on your fingers 3 things that make you a strong person."
  },
  {
    "title": "Getting Ready",
    "emoji": "🔔",
    "micro_theme": "Prepare before action",
    "shlokas": ["1.9", "1.10"],
    "story": {
      "title": "Lacing Up the Shoes",
      "content": "A child was getting ready for a big competition. They tied their shoes tight, drank water, and took deep breaths. Preparing well is half the victory.",
      "moral": "Taking time to prepare makes the actual task much easier."
    },
    "activity": "What is your routine to 'get ready' before you go to school or sleep?"
  },
  {
    "title": "Signal to Start",
    "emoji": "🎺",
    "micro_theme": "Everything begins with a signal",
    "shlokas": ["1.10", "1.11"],
    "story": {
      "title": "The Starting Bell",
      "content": "Everyone was waiting nervously. Then, the school bell rang to start the race! A clear signal helps everyone focus and start moving together.",
      "moral": "A clear starting signal turns nervous waiting into focused action."
    },
    "activity": "When you count '1, 2, 3, Go!', what do you usually do on 'Go'?"
  },
  {
    "title": "Energy & Excitement",
    "emoji": "🥁",
    "micro_theme": "High energy before action",
    "shlokas": ["1.12", "1.13"],
    "story": {
      "title": "The Roaring Crowd",
      "content": "There was huge excitement before the sports match. The drums were beating and the crowd was cheering. High energy helps wake up your body and mind for action.",
      "moral": "Excitement and high energy can give you the push you need to start."
    },
    "activity": "Do 5 jumping jacks right now to build some high energy!"
  },
  {
    "title": "Unity in Action",
    "emoji": "🎶",
    "micro_theme": "Doing things together creates strength",
    "shlokas": ["1.13", "1.14"],
    "story": {
      "title": "The Loud Cheer",
      "content": "The whole team cheered together at the exact same time. It sounded like thunder! When people do things together, they create a strength much bigger than any one person.",
      "moral": "Working together in unity creates incredible strength."
    },
    "activity": "Can you clap your hands in a steady rhythm for 10 seconds?"
  },
  {
    "title": "Confidence & Presence",
    "emoji": "🌟",
    "micro_theme": "Strong presence builds confidence",
    "shlokas": ["1.14", "1.15"],
    "story": {
      "title": "Stepping on Stage",
      "content": "A child walked confidently onto the stage. They stood tall and smiled. Even before they spoke a word, everyone believed in them because of their strong presence.",
      "moral": "Standing tall and confident helps you believe in yourself, and helps others believe in you too."
    },
    "activity": "Stand up straight, push your chest out slightly, and hold your head high!"
  },
  {
    "title": "Making Your Presence Known",
    "emoji": "🔊",
    "micro_theme": "Show up with confidence",
    "shlokas": ["1.15", "1.16"],
    "story": {
      "title": "The Bold Introduction",
      "content": "A new student walked into class and introduced themselves boldly with a clear, happy voice. Making your presence known with confidence makes people respect and welcome you.",
      "moral": "Don't hide your light! Show up confidently and let people know you are there."
    },
    "activity": "Introduce yourself to a wall in a loud, confident, and happy voice."
  },
  {
    "title": "Readiness for Action",
    "emoji": "🎯",
    "micro_theme": "Be ready when it’s your turn",
    "shlokas": ["1.16", "1.17"],
    "story": {
      "title": "Waiting for the Pitch",
      "content": "A child was waiting for their turn in a game. They held their bat ready, eyes on the ball, completely focused. Being ready means you don't waste time when your moment comes.",
      "moral": "Stay alert and focused so you are ready when it's your time to act."
    },
    "activity": "What do you do to stay patient and ready when you have to wait for your turn?"
  },
  {
    "title": "Facing the Situation",
    "emoji": "⚔️",
    "micro_theme": "Face challenges bravely",
    "shlokas": ["1.17", "1.18"],
    "story": {
      "title": "Stepping Forward",
      "content": "Instead of hiding in the back, the child stepped forward to play the hardest opponent. Facing a challenge bravely is the first step to overcoming it.",
      "moral": "Don't run away. Step forward and face your challenges with a brave heart."
    },
    "activity": "Name one thing you thought was too hard, but you tried it anyway."
  }
];

const apiThemesPath = path.join(__dirname, 'api/data/themes.json');
const themesData = JSON.parse(fs.readFileSync(apiThemesPath, 'utf8'));

// The existing chapter 1 themes start from 1.28.
// We need to merge these new themes (1.1 to 1.18) BEFORE the existing ones.
let existingCh1 = themesData.gita['1'] || [];

const combinedThemes = [...newCh1Themes, ...existingCh1];

// Re-assign IDs so they are beautifully sequential (theme_1_1, theme_1_2, ... theme_1_29)
combinedThemes.forEach((theme, index) => {
  theme.id = `theme_1_${index + 1}`;
});

themesData.gita['1'] = combinedThemes;

fs.writeFileSync(apiThemesPath, JSON.stringify(themesData, null, 2));

const backendThemesPath = path.join(__dirname, 'backend/data/themes.json');
fs.writeFileSync(backendThemesPath, JSON.stringify(themesData, null, 2));

console.log('Prepended themes to Chapter 1 successfully in both api and backend folders!');
