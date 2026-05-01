const fs = require('fs');
const path = require('path');

const ch1Themes = [
      {
        "id": "theme_1_1",
        "title": "Overwhelmed by Emotions",
        "emoji": "😟",
        "micro_theme": "Fear and confusion can take over",
        "shlokas": ["1.28", "1.29"],
        "story": {
          "title": "The Big Stage Fright",
          "content": "A child named Rohan was so excited for the school talent show. But right before stepping on stage, he looked at the huge crowd and completely froze! Fear and confusion took over, just like how Arjuna felt when he saw everyone lined up to fight.",
          "moral": "It is completely normal to feel overwhelmed by big emotions when facing something scary."
        },
        "activity": "Draw a face showing what 'overwhelmed' looks like, and another showing 'calm'."
      },
      {
        "id": "theme_1_2",
        "title": "Physical Signs of Fear",
        "emoji": "😰",
        "micro_theme": "Fear affects body and mind",
        "shlokas": ["1.29", "1.30"],
        "story": {
          "title": "The Shaking Knees",
          "content": "Before his big math exam, Sam's hands got sweaty and his knees literally started shaking. He felt so weak he sat down. When we are extremely nervous, our body reacts! Arjuna's bow even slipped from his hands because he was so nervous.",
          "moral": "Your body reacts to your thoughts. Calming your mind will calm your body."
        },
        "activity": "When you feel nervous, where do you feel it in your body? (Tummy? Hands?)"
      },
      {
        "id": "theme_1_3",
        "title": "Losing Clarity",
        "emoji": "❓",
        "micro_theme": "Confusion makes decisions hard",
        "shlokas": ["1.30", "1.31"],
        "story": {
          "title": "The Ice Cream Dilemma",
          "content": "Mia was at the ice cream shop. There were 50 flavors! Her mind got so confused she just couldn't pick. The longer she looked, the harder it got. When our mind is confused, even simple decisions seem impossible.",
          "moral": "When you are confused, take a deep breath and keep things simple."
        },
        "activity": "What do you do when you can't decide between two fun things?"
      },
      {
        "id": "theme_1_4",
        "title": "Avoiding Responsibility",
        "emoji": "⚖️",
        "micro_theme": "Running away from duty",
        "shlokas": ["1.31", "1.32"],
        "story": {
          "title": "The Messy Room",
          "content": "Leo's mom told him to clean his very messy room. Instead, Leo said, 'I don't even care about having a clean room anymore!' and tried to avoid doing it. Running away from duty doesn't fix the problem; it just leaves the room messy.",
          "moral": "We must face our responsibilities, even when they seem hard or unpleasant."
        },
        "activity": "Name one chore you don't like doing, but you know you have to."
      },
      {
        "id": "theme_1_5",
        "title": "Emotional Attachment",
        "emoji": "💔",
        "micro_theme": "Attachment affects decisions",
        "shlokas": ["1.33", "1.34"],
        "story": {
          "title": "The Spelling Bee",
          "content": "Tina had to compete against her best friend in the final round of the spelling bee. She didn't want to spell the word right because she didn't want her friend to lose. Her attachment to her friend clouded her judgment of simply doing her best.",
          "moral": "Sometimes our love for others makes it hard to do what we are supposed to do."
        },
        "activity": "Is it better to let your friend win, or for both of you to do your absolute best?"
      },
      {
        "id": "theme_1_6",
        "title": "Conflict of Relationships",
        "emoji": "🤝",
        "micro_theme": "Hard choices with loved ones",
        "shlokas": ["1.34", "1.35"],
        "story": {
          "title": "The Broken Vase",
          "content": "Jay saw his older brother accidentally break a vase. His mother asked who did it. Jay loved his brother, but he knew lying was wrong. Choosing between doing what is right and protecting someone you love is a very hard choice.",
          "moral": "Always choose truth and duty, even when it involves people you care about."
        },
        "activity": "What would you do if your friend asked you to keep a secret that wasn't safe?"
      },
      {
        "id": "theme_1_7",
        "title": "Refusing to Act",
        "emoji": "🚫",
        "micro_theme": "Saying no to responsibility",
        "shlokas": ["1.35", "1.36"],
        "story": {
          "title": "Giving Up Early",
          "content": "When Neha saw the huge puzzle with 1000 pieces, she just sat on the floor and said, 'I am not doing this!' She gave up before she even tried placing one piece. Refusing to act guarantees you will never finish.",
          "moral": "You can't succeed if you refuse to even start."
        },
        "activity": "Think of a time you wanted to give up before trying. How did you push through?"
      },
      {
        "id": "theme_1_8",
        "title": "Fear of Consequences",
        "emoji": "⚠️",
        "micro_theme": "Overthinking outcomes",
        "shlokas": ["1.36", "1.37"],
        "story": {
          "title": "The Nervous Goalie",
          "content": "Max was the goalie for his soccer team. He was terrified of missing the ball and making his team lose. Because he was so focused on the fear of making a mistake, he wasn't paying attention to the game!",
          "moral": "Focusing too much on 'what if things go wrong' stops you from doing things right."
        },
        "activity": "Say out loud: 'I am not afraid of making mistakes, I learn from them!'"
      },
      {
        "id": "theme_1_9",
        "title": "Thinking Too Much",
        "emoji": "🌪️",
        "micro_theme": "Overthinking leads to stress",
        "shlokas": ["1.38", "1.39"],
        "story": {
          "title": "The Scary Shadows",
          "content": "At night, Lily saw a weird shadow on her wall. She started imagining it was a monster, then a dragon, then aliens! She overthought it so much she couldn't sleep. Her dad turned on the light—it was just a jacket. Overthinking creates stress that isn't real.",
          "moral": "Don't let your imagination create problems that aren't there."
        },
        "activity": "When you start overthinking, name 3 things you can see in the room to ground yourself."
      },
      {
        "id": "theme_1_10",
        "title": "Confused Judgment",
        "emoji": "🧠",
        "micro_theme": "Confusion clouds right thinking",
        "shlokas": ["1.40", "1.41"],
        "story": {
          "title": "The Mixed-Up Map",
          "content": "Aya tried to read a map while riding a bumpy, fast train. Everything looked blurry and she got totally confused about where to go. When our mind is bumpy with emotions, our judgment gets blurry and we can't tell right from wrong.",
          "moral": "Calm your mind first, then decide what is right."
        },
        "activity": "Take a deep breath and count to 5. Notice how your mind slows down."
      },
      {
        "id": "theme_1_11",
        "title": "Negative Thinking Spiral",
        "emoji": "📉",
        "micro_theme": "One negative thought leads to another",
        "shlokas": ["1.41", "1.42"],
        "story": {
          "title": "The Bad Day Trap",
          "content": "Sam spilled his juice. Then he thought, 'Today is terrible.' Because he was grumpy, he forgot his homework. Then he thought, 'I am the worst!' One bad thought led to another until he was stuck in a spiral of worry.",
          "moral": "Stop the spiral! One bad thing doesn't mean everything is bad."
        },
        "activity": "If you have a bad thought, how can you change it into a good thought immediately?"
      },
      {
        "id": "theme_1_12",
        "title": "Fear of Loss",
        "emoji": "🌀",
        "micro_theme": "Fear of losing everything",
        "shlokas": ["1.42", "1.43"],
        "story": {
          "title": "The Block Tower",
          "content": "Zara built a tall block tower. She was so afraid of it falling over that she wouldn't let anyone come near her, and she stopped having fun building it. Fear of losing something ruins the joy of having it.",
          "moral": "Don't let the fear of losing stop you from enjoying what you have."
        },
        "activity": "Think of a time you lost a game but still had fun playing."
      },
      {
        "id": "theme_1_13",
        "title": "Losing Confidence",
        "emoji": "😔",
        "micro_theme": "Giving up mentally",
        "shlokas": ["1.44", "1.45"],
        "story": {
          "title": "The Steep Hill",
          "content": "Ravi was riding his bike up a hill. It looked so steep! Before he even tried pedaling hard, his mind said 'I can't do this,' and he put his feet down. He gave up in his mind before his legs even got tired.",
          "moral": "Your mind gives up way before your body does. Stay confident!"
        },
        "activity": "Stand up tall like a superhero and say, 'I can do hard things!'"
      },
      {
        "id": "theme_1_14",
        "title": "Complete Withdrawal",
        "emoji": "🪑",
        "micro_theme": "Shutting down and quitting",
        "shlokas": ["1.46", "1.47"],
        "story": {
          "title": "Sitting Out",
          "content": "In gym class, the teacher announced a complicated new game. Instead of trying to learn it, Maya just went and sat on the bench. She completely shut down. Arjuna did the same thing when he sat down in his chariot and dropped his bow.",
          "moral": "It is okay to ask for help when things are hard, but completely quitting helps no one."
        },
        "activity": "When you want to quit, who can you ask for help instead?"
      }
];

const ch15Themes = [
      {
        "id": "theme_15_1",
        "title": "The Tree of Life",
        "emoji": "🌳",
        "micro_theme": "Life is like a growing tree",
        "shlokas": ["15.1", "15.2"],
        "story": {
          "title": "The Upside-Down Tree",
          "content": "Imagine a magical tree where the roots are in the sky and the branches grow downwards! The roots in the sky represent our connection to the divine, and the branches spreading out are the world we live in. We are all leaves on this giant, magical tree of life.",
          "moral": "We are connected to something much higher, even if we are busy playing in the branches."
        },
        "activity": "Draw an upside-down tree! Put the roots at the top of your paper."
      },
      {
        "id": "theme_15_2",
        "title": "Detach from Illusion",
        "emoji": "✂️",
        "micro_theme": "Cut unnecessary attachments",
        "shlokas": ["15.2", "15.3"],
        "story": {
          "title": "The Heavy Backpack",
          "content": "Rahul went hiking but filled his backpack with rocks just because they looked shiny. Soon, he was too tired to climb. His guide told him to empty the rocks so he could reach the top. To grow, we have to cut our attachment to heavy, unnecessary things.",
          "moral": "Letting go of distractions and silly attachments makes your journey much lighter."
        },
        "activity": "What is one 'heavy rock' (like playing too many video games) you can put down?"
      },
      {
        "id": "theme_15_3",
        "title": "Search for Truth",
        "emoji": "🔍",
        "micro_theme": "Look for what is real",
        "shlokas": ["15.3", "15.4"],
        "story": {
          "title": "The Treasure Hunt",
          "content": "Ahaana had a map to a hidden treasure. Many people told her to stop and just play in the mud, but she kept searching for the real treasure. Seeking the ultimate truth is like a great treasure hunt for your soul.",
          "moral": "Never stop searching for what is truly real and important in life."
        },
        "activity": "If you could ask the smartest person in the universe one question, what would it be?"
      },
      {
        "id": "theme_15_4",
        "title": "Reaching the Highest Goal",
        "emoji": "🌟",
        "micro_theme": "Purity leads to higher understanding",
        "shlokas": ["15.4", "15.5"],
        "story": {
          "title": "The Clean Mirror",
          "content": "Aria wanted to see the stars in her mirror, but it was covered in dust. She cleaned it wiping away the dirt, and finally saw a perfect reflection of the night sky! When we clean our minds from pride and anger, we reflect the highest truth.",
          "moral": "A pure, clean mind can understand the highest goals in the universe."
        },
        "activity": "Name one good habit that helps keep your mind 'clean' and happy."
      },
      {
        "id": "theme_15_5",
        "title": "Inner Light",
        "emoji": "☀️",
        "micro_theme": "Real light is inside you",
        "shlokas": ["15.6", "15.7"],
        "story": {
          "title": "The Glowing Heart",
          "content": "The sun lights up the day, and the moon lights up the night. But there is a place that doesn't need the sun or moon to be bright—the spiritual world! That same pure, glowing light is deep inside your heart right now.",
          "moral": "You don't need outside things to shine; your soul is naturally bright."
        },
        "activity": "Close your eyes and picture a warm, glowing sun right in the center of your chest."
      },
      {
        "id": "theme_15_6",
        "title": "Soul's Journey",
        "emoji": "🌱",
        "micro_theme": "Soul continues its journey",
        "shlokas": ["15.7", "15.8"],
        "story": {
          "title": "The Traveler",
          "content": "Imagine a traveler moving from one city to another, taking a little suitcase with them. The soul is just like that traveler! When one adventure (life) ends, the soul travels to a new body to start a brand new adventure.",
          "moral": "Life is an ongoing journey of learning for your soul."
        },
        "activity": "If your soul is a traveler, what is one good thing you want to pack in your suitcase?"
      },
      {
        "id": "theme_15_7",
        "title": "Carrying Impressions",
        "emoji": "🌬️",
        "micro_theme": "We carry habits and impressions",
        "shlokas": ["15.8", "15.9"],
        "story": {
          "title": "The Wind and the Flowers",
          "content": "When the wind blows over a rose garden, it carries the sweet smell of roses everywhere it goes. Our soul is like the wind. It carries the 'smell' of our good habits and bad habits from one life to the next.",
          "moral": "Make sure you surround yourself with good habits, so your soul carries a sweet fragrance!"
        },
        "activity": "What 'sweet fragrance' (good habit) are you known for? (Being kind, helpful?)"
      },
      {
        "id": "theme_15_8",
        "title": "Seeing with Awareness",
        "emoji": "👁️",
        "micro_theme": "Not everyone understands deeply",
        "shlokas": ["15.10", "15.11"],
        "story": {
          "title": "The Magic Painting",
          "content": "Two kids looked at a painting. One just saw splashes of paint. The other kid looked closer and realized it was a beautiful picture of a galaxy! People who don't pay attention miss the magic of the soul, but those with awareness see it clearly.",
          "moral": "Look at the world with deep awareness, not just with your eyes."
        },
        "activity": "Look at something in your room very closely. What is a detail you never noticed before?"
      },
      {
        "id": "theme_15_9",
        "title": "Energy in Everything",
        "emoji": "🔥",
        "micro_theme": "Life energy is everywhere",
        "shlokas": ["15.12", "15.13"],
        "story": {
          "title": "The Power of the Sun",
          "content": "Where does the energy in your food come from? The sun! The Divine energy is in the sun making plants grow, and it is in the earth holding everything together. That same amazing energy is keeping you alive right now.",
          "moral": "Everything in nature is powered by the same incredible, divine energy."
        },
        "activity": "Next time you eat a vegetable, thank the sun and the earth for giving it energy!"
      },
      {
        "id": "theme_15_10",
        "title": "Nourishment & Growth",
        "emoji": "🌿",
        "micro_theme": "What we consume shapes us",
        "shlokas": ["15.13", "15.14"],
        "story": {
          "title": "The Engine's Fuel",
          "content": "A car needs good fuel to run properly. In our bodies, a special divine fire (digestion) helps process the food we eat to give us strength! What we put into our bodies—good food, and good thoughts—shapes who we become.",
          "moral": "Nourish your body with healthy food, and your mind with positive thoughts."
        },
        "activity": "What is your favorite healthy food that gives you energy?"
      },
      {
        "id": "theme_15_11",
        "title": "Source of Memory & Knowledge",
        "emoji": "🧠",
        "micro_theme": "Understanding comes from within",
        "shlokas": ["15.14", "15.15"],
        "story": {
          "title": "The Quiet Whisper",
          "content": "When Leo couldn't remember the answer to a test, he closed his eyes and got very quiet. Suddenly, the answer popped into his head! The divine is seated in all our hearts, helping us remember, learn, and understand.",
          "moral": "True knowledge and memory come from the spark of the divine inside you."
        },
        "activity": "Close your eyes and listen carefully. What is the quietest sound you can hear right now?"
      },
      {
        "id": "theme_15_12",
        "title": "Temporary vs Permanent",
        "emoji": "⚖️",
        "micro_theme": "Some things change, some don't",
        "shlokas": ["15.16", "15.17"],
        "story": {
          "title": "The Sandcastle and the Ocean",
          "content": "A sandcastle looks great, but it washes away with the tide—it is temporary. But the ocean itself is always there—it is permanent. In our world, bodies and toys change, but the highest truth and the soul are permanent, like the ocean.",
          "moral": "Learn to tell the difference between things that change and things that last forever."
        },
        "activity": "Name one thing that changes (like the weather) and one thing that doesn't (like your family's love)."
      },
      {
        "id": "theme_15_13",
        "title": "The Supreme Reality",
        "emoji": "🌟",
        "micro_theme": "There is something higher than all",
        "shlokas": ["15.17", "15.18"],
        "story": {
          "title": "The King of the Castle",
          "content": "In a great kingdom, there are many workers, knights, and builders, but above all of them is the wise, caring King who watches over everything. In the universe, beyond all changing things and unchanging souls, is the Supreme Reality holding everything in love.",
          "moral": "There is a supreme, loving force that connects and supports the entire universe."
        },
        "activity": "Look up at the sky and imagine how huge the universe is!"
      },
      {
        "id": "theme_15_14",
        "title": "True Understanding",
        "emoji": "🏆",
        "micro_theme": "Knowing truth brings wisdom",
        "shlokas": ["15.18", "15.19"],
        "story": {
          "title": "The Puzzle Complete",
          "content": "For a long time, Maya had pieces of a puzzle. It was confusing! But when she finally put the last piece in, she saw the whole beautiful picture. Knowing the Supreme Reality is like finishing the puzzle of life—suddenly, everything makes sense.",
          "moral": "When you truly understand life's biggest truths, you act with pure wisdom."
        },
        "activity": "What is one 'big truth' you have learned from the Bhagavad Gita so far?"
      },
      {
        "id": "theme_15_15",
        "title": "Final Wisdom",
        "emoji": "📘",
        "micro_theme": "Understanding life leads to fulfillment",
        "shlokas": ["15.19", "15.20"],
        "story": {
          "title": "The Happy Heart",
          "content": "After learning all about the tree of life, the soul's journey, and the energy in everything, a young boy felt completely at peace. He wasn't worried about small things anymore. He had found the secret knowledge that makes a heart truly full and content.",
          "moral": "Understanding these spiritual truths brings perfect peace and joy to your life."
        },
        "activity": "Smile the biggest smile you can, knowing that the universe is a beautiful, magical place!"
      }
];

const apiThemesPath = path.join(__dirname, 'api/data/themes.json');
const themesData = JSON.parse(fs.readFileSync(apiThemesPath, 'utf8'));

themesData.gita['1'] = ch1Themes;
themesData.gita['15'] = ch15Themes;

fs.writeFileSync(apiThemesPath, JSON.stringify(themesData, null, 2));

const backendThemesPath = path.join(__dirname, 'backend/data/themes.json');
fs.writeFileSync(backendThemesPath, JSON.stringify(themesData, null, 2));

console.log('Themes updated successfully in both api and backend folders!');
