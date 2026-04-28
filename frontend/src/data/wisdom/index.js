import { gitaWisdom } from './gita';
import { hanumanWisdom } from './hanuman';
import { ramayanaWisdom } from './ramayana';

export const getWisdom = (scripture, text, isTe, dynamicLib = []) => {
  const lib = scripture === 'hanuman' ? [...hanumanWisdom, ...ramayanaWisdom] : gitaWisdom;
  
  // Combine all libraries, prioritizing Dynamic Wisdom first
  const fullLib = [...dynamicLib, ...lib];
  
  // Also add common verse keywords
  const commonKeywords = [
    {
      keywords: ['verse', 'shloka', 'explain', 'detail', 'meaning', 'tell me about', 'శ్లోకం', 'పద్యం', 'అర్థం'],
      en: "Every verse in our scriptures is like a treasure box of wisdom! If you look at the translation and 'Child Meaning' below the verse, you can find its deep secrets. Which part would you like to explore together?",
      te: "మన గ్రంథాలలోని ప్రతి పద్యం జ్ఞానపు నిధి వంటిది! పద్యం కింద ఉన్న 'పిల్లల కోసం' అనే భాగాన్ని చూస్తే మీకు మరిన్ని రహసైల్యాలు తెలుస్తాయి."
    }
  ];

  const finalLib = [...fullLib, ...commonKeywords];
  const lowerText = text.toLowerCase();

  for (const entry of finalLib) {
    // entry.keywords could be string[] or just string if from DB
    const keywords = Array.isArray(entry.keywords) ? entry.keywords : (entry.keywords?.split(',') || []);
    if (keywords.some(k => lowerText.includes(k.trim().toLowerCase()))) {
      return isTe ? (entry.answer_te || entry.te) : (entry.answer_en || entry.en);
    }
  }

  return null;
};
