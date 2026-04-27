module.exports = {
        seeds: [
            { question: "What does Krishna tell Arjuna to be?", options: ["Brave (🦁)", "Sleepy (😴)", "Angry (💢)"], correct: 0 },
            { question: "Is our soul like old clothes?", options: ["Yes (👗)", "No (❌)"], correct: 0 },
            { question: "Can the soul be cut by a sword?", options: ["No (🚫)", "Yes (🗡️)"], correct: 0 }
        ],
        seekers: [
            { type: "mcq", question: "Krishna says the soul never __________.", options: ["Changes", "Dies", "Moves"], correct: 1 },
            { type: "fill", question: "Arjuna is a member of the __________ caste (warriors).", answer: "Kshatriya" },
            { type: "mcq", question: "What should we focus on according to verse 2.47?", options: ["The prize", "The work itself", "Winning"], correct: 1 },
            { type: "fill", question: "Krishna tells Arjuna that he is mourning for things not worthy of __________.", answer: "grief" },
            { type: "mcq", question: "The name 'Madhusudana' means slayer of __________.", options: ["Dragons", "Madhu (the demon)", "Ego"], correct: 1 }
        ],
        warriors: [
            { type: "short", question: "What is the fundamental difference between the body and the soul as explained in Chapter 2?", keywords: ["permanent", "temporary", "soul", "body", "deathless"] },
            { type: "short", question: "Summarize the concept of 'Nishkama Karma'.", keywords: ["desireless", "fruit", "action", "attachment", "result"] },
            { type: "short", question: "How does Krishna define a person of 'steady wisdom' (Sthitaprajna)?", keywords: ["balance", "calm", "senses", "stable", "mind"] },
            { type: "essay", question: "Discuss the relevance of verse 2.47 ('Karmanye vadhikaraste...') in a modern student's life. How can focusing on the effort rather than the result help with stress?", keywords: ["process", "stress", "anxiety", "effort", "outcome", "control"] }
        ]
    };