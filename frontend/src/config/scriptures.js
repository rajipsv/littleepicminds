/** Scripture cards on home + coming-soon route guard. */
export const SCRIPTURES = [
  {
    id: 'gita',
    title: 'Bhagavad Gita',
    color: 'bg-kid-primary',
    desc: 'The Song of God',
    isAvailable: true,
  },
  {
    id: 'hanuman',
    title: 'Hanuman Chalisa',
    color: 'bg-kid-accent',
    desc: 'Hymn to Hanuman',
    isAvailable: false,
  },
  {
    id: 'ramayana',
    title: 'Ramayana',
    color: 'bg-kid-secondary',
    desc: 'The Epic of Rama',
    isAvailable: false,
  },
];

export const COMING_SOON_SCRIPTURES = {
  hanuman: {
    emoji: '🐒',
    title: 'Hanuman Chalisa',
    titleTe: 'హనుమాన్ చాలీసా',
    messageEn:
      'Hanuman Chalisa is coming soon to littleEpicMinds. We are crafting a beautiful, child-friendly chanting experience for you!',
    messageTe:
      'హనుమాన్ చాలీసా త్వరలో littleEpicMindsలో వస్తుంది. పిల్లలకు అనుకూలమైన అద్భుత అనుభవం తయారు చేస్తున్నాము!',
  },
  ramayana: {
    emoji: '📖',
    title: 'Ramayana',
    titleTe: 'రామాయణం',
    messageEn:
      'The Epic of Rama is coming soon to littleEpicMinds. We are crafting a beautiful, child-friendly experience just for you!',
    messageTe:
      'రామాయణం త్వరలో littleEpicMindsలో వస్తుంది. పిల్లలకు అనుకూలమైన అద్భుత అనుభవం తయారు చేస్తున్నాము!',
  },
};

export function isScriptureAvailable(id) {
  return SCRIPTURES.find((s) => s.id === id)?.isAvailable ?? false;
}
