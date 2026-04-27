module.exports = {
        seeds: [
            { question: "How many teams are ready at the start?", options: ["2 (✌️)", "10 (🔟)", "5 (🖐️)"], correct: 0 },
            { question: "Who is the friend that helps the king?", options: ["Sanjaya (🗣️)", "A Lion (🦁)", "A Bird (🐦)"], correct: 0 },
            { question: "Where is the match taking place?", options: ["A Field (🌳)", "A Swimming Pool (🏊)", "The Moon (🌙)"], correct: 0 }
        ],
        seekers: [
            { type: "mcq", question: "What is the 'holy field' called?", options: ["Kurukshetra", "Ayodhya", "Dwaraka"], correct: 0 },
            { type: "fill", question: "The king's name who is blind but wants to know about the war is __________.", answer: "Dhritarashtra" },
            { type: "mcq", question: "Who went to see Dronacharya to discuss strategy?", options: ["Arjuna", "Duryodhana", "Bhishma"], correct: 1 },
            { type: "fill", question: "Krishna is acting as the __________ for Arjuna.", answer: "charioteer" },
            { type: "mcq", question: "Why was Arjuna feeling sad?", options: ["He lost his way", "He didn't want to fight his family", "He was hungry"], correct: 1 }
        ],
        warriors: [
            { type: "short", question: "Explain why the battlefield is called 'Dharmakshetra'.", keywords: ["righteousness", "duty", "dharma", "truth"] },
            { type: "short", question: "Describe Duryodhana's state of mind when he approached his guru.", keywords: ["anxious", "strategy", "pride", "fear"] },
            { type: "short", question: "What is the role of Sanjaya in the Bhagavad Gita?", keywords: ["vision", "narrator", "divine eye", "dhritarashtra"] },
            { type: "essay", question: "In your own words, describe why it was difficult for Arjuna to start the battle and what this teaches us about making hard choices.", keywords: ["family", "duty", "dharma", "confused", "values", "right"] }
        ]
    };