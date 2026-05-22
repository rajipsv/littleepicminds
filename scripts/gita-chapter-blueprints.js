/**
 * Curriculum blueprints for Bhagavad Gita chapters 1–18.
 * Used by generate-gita-full-content.js to build themes + filler shlokas.
 */
module.exports = [
  { id: 1, title: 'Arjuna Visada Yoga', theme: 'Observing the Armies', skipThemes: true },
  { id: 2, title: 'Sankhya Yoga', theme: 'Transcendental Knowledge', skipThemes: true },
  {
    id: 3, title: 'Karma Yoga', theme: 'Path of Action',
    lessons: [
      { idea: 'doing your duty', ideaTe: 'మీ కర్తవ్యం చేయడం', moral: 'Do your best work without worrying only about prizes.', moralTe: 'బహుమతుల గురించి ఆందోళన చెందకుండా మీ పనిని బాగా చేయండి.' },
      { idea: 'setting a good example', ideaTe: 'మంచి ఆదర్శం ఉండటం', moral: 'Leaders teach others more by actions than by words.', moralTe: 'నాయకులు మాటల కంటే చర్యల ద్వారా ఎక్కువ నేర్పుతారు.' },
      { idea: 'selfless service', ideaTe: 'నిస్వార్థ సేవ', moral: 'Work done to help others brings real joy.', moralTe: 'ఇతరులకు సహాయం చేసే పని నిజమైన ఆనందాన్ని తెస్తుంది.' },
    ],
  },
  {
    id: 4, title: 'Jnana Karma Sanyasa Yoga', theme: 'Path of Knowledge',
    lessons: [
      { idea: 'wisdom and action together', ideaTe: 'జ్ఞానం మరియు చర్య కలిసి', moral: 'Knowing what is right helps you act with courage.', moralTe: 'ఏది సరైనదో తెలుసుకోవడం ధైర్యంగా పని చేయడానికి సహాయపడుతుంది.' },
      { idea: 'humility before teachers', ideaTe: 'గురువుల ముందు వినయం', moral: 'Ask questions and listen—wisdom grows in humble hearts.', moralTe: 'ప్రశ్నలు అడగండి మరియు వినండి—వినయమైన హృదయాలలో జ్ఞానం పెరుగుతుంది.' },
      { idea: 'seeing the divine in sacrifice', ideaTe: 'త్యాగంలో దైవాన్ని చూడటం', moral: 'When you offer your effort with love, it becomes sacred.', moralTe: 'మీ ప్రయత్నాన్ని ప్రేమతో అర్పించినప్పుడు, అది పవిత్రమవుతుంది.' },
    ],
  },
  {
    id: 5, title: 'Karma Sanyasa Yoga', theme: 'Action in Krishna Consciousness',
    lessons: [
      { idea: 'peace through balanced action', ideaTe: 'సమతుల్య చర్య ద్వారా శాంతి', moral: 'You can be active and peaceful at the same time.', moralTe: 'మీరు ఒకే సమయంలో చురుకుగా మరియు ప్రశాంతంగా ఉండవచ్చు.' },
      { idea: 'letting go of ego', ideaTe: 'అహంకారాన్ని వదిలివేయడం', moral: 'Praise and blame both pass away—stay steady.', moralTe: 'ప్రశంస మరియు నింద రెండూ గడిచిపోతాయి—స్థిరంగా ఉండండి.' },
      { idea: 'seeing equally', ideaTe: 'సమానంగా చూడటం', moral: 'Treat friends and strangers with the same kindness.', moralTe: 'స్నేహితులు మరియు అపరిచితులను ఒకే దయతో చూడండి.' },
    ],
  },
  {
    id: 6, title: 'Dhyana Yoga', theme: 'Path of Meditation',
    lessons: [
      { idea: 'training the mind', ideaTe: 'మనస్సును శిక్షణ ఇవ్వడం', moral: 'A calm mind is like a steady lamp in the wind.', moralTe: 'శాంతమైన మనస్సు గాలిలో స్థిరమైన దీపం లాంటిది.' },
      { idea: 'moderation in life', ideaTe: 'జీవితంలో మితత్వం', moral: 'Too much or too little of anything upsets balance.', moralTe: 'ఏదైనా ఎక్కువ లేదా తక్కువ సమతుల్యతను కలగలిపిస్తుంది.' },
      { idea: 'yoga as union', ideaTe: 'యోగం ఐక్యత', moral: 'Connecting with your inner self is the highest yoga.', moralTe: 'మీ అంతరాత్మతో అనుసంధానం చేయడమే అత్యున్నత యోగం.' },
    ],
  },
  {
    id: 7, title: 'Jnana Vijnana Yoga', theme: 'Knowledge of the Ultimate',
    lessons: [
      { idea: 'material and spiritual energy', ideaTe: 'భౌతిక మరియు ఆధ్యాత్మిక శక్తి', moral: 'The world runs on energy—remember the source behind it.', moralTe: 'ప్రపంచం శక్తిపై నడుస్తుంది—దాని వెనుక మూలాన్ని గుర్తు పెట్టుకోండి.' },
      { idea: 'four kinds of seekers', ideaTe: 'నాలుగు రకాల అన్వేషకులు', moral: 'People come to wisdom for different reasons—all can grow.', moralTe: 'ప్రజలు వివిధ కారణాల కోసం జ్ఞానాన్ని వెతుకుతారు—అందరూ ఎదగవచ్చు.' },
      { idea: 'surrender to the Supreme', ideaTe: 'పరమునికి లొంగడం', moral: 'When you trust the highest good, fear becomes smaller.', moralTe: 'మీరు అత్యున్నత మంచికి నమ్మకం పెట్టినప్పుడు, భయం చిన్నది అవుతుంది.' },
    ],
  },
  {
    id: 8, title: 'Akshara Brahma Yoga', theme: 'Path to the Eternal',
    lessons: [
      { idea: 'remembering what lasts', ideaTe: 'శాశ్వతమైనది గుర్తు పెట్టుకోవడం', moral: 'What is eternal matters more than what fades.', moralTe: 'శాశ్వతమైనది మాయమయ్యే దానికంటే ముఖ్యమైనది.' },
      { idea: 'thoughts at important moments', ideaTe: 'ముఖ్యమైన క్షణాలలో ఆలోచనలు', moral: 'What you hold in your heart shapes your path.', moralTe: 'మీ హృదయంలో ఉంచుకున్నది మీ మార్గాన్ని రూపొందిస్తుంది.' },
      { idea: 'discipline of practice', ideaTe: 'సాధన యొక్క క్రమశిక్షణ', moral: 'Daily small habits build a great life.', moralTe: 'రోజువారీ చిన్న అలవాట్లు గొప్ప జీవితాన్ని నిర్మిస్తాయి.' },
    ],
  },
  {
    id: 9, title: 'Raja Vidya Raja Guhya Yoga', theme: 'The Most Confidential Knowledge',
    lessons: [
      { idea: 'royal secret of devotion', ideaTe: 'భక్తి యొక్క రాజ రహస్యం', moral: 'Love offered sincerely is never too small.', moralTe: 'నిజాయితీగా అర్పించిన ప్రేమ ఎప్పుడూ చాలా చిన్నది కాదు.' },
      { idea: 'God cares for devotees', ideaTe: 'దైవం భక్తులను చూసుకోవడం', moral: 'You are never forgotten when you try to do good.', moralTe: 'మీరు మంచి చేయడానికి ప్రయత్నించినప్పుడు మిమ్మల్ని ఎప్పుడూ మరచిపోరు.' },
      { idea: 'simple offerings', ideaTe: 'సరళమైన అర్పణలు', moral: 'A leaf, a flower, or kind words can be a true gift.', moralTe: 'ఒక ఆకు, ఒక పువ్వు లేదా మంచి మాటలు నిజమైన బహుమతి అవుచ్చు.' },
    ],
  },
  {
    id: 10, title: 'Vibhuti Yoga', theme: 'The Infinite Glories of the Divine',
    lessons: [
      { idea: 'excellence everywhere', ideaTe: 'ప్రతిచోటా శ్రేష్ఠత', moral: 'The best in every field reflects something divine.', moralTe: 'ప్రతి రంగంలోని ఉత్తమమైనది ఏదో దివ్యత్వాన్ని ప్రతిబింబిస్తుంది.' },
      { idea: 'seeing greatness with wonder', ideaTe: 'ఆశ్చర్యంతో గొప్పతనం చూడటం', moral: 'Wonder keeps your heart humble and open.', moralTe: 'ఆశ్చర్యం మీ హృదయాన్ని వినయంగా మరియు తెరిచి ఉంచుతుంది.' },
      { idea: 'source of all power', ideaTe: 'అన్ని శక్తి యొక్క మూలం', moral: 'Strength, beauty, and wisdom all have one root.', moralTe: 'బలం, అందం మరియు జ్ఞానం అన్నింటికీ ఒకే మూలం ఉంది.' },
    ],
  },
  {
    id: 11, title: 'Viswarupa Darshana Yoga', theme: 'The Universal Form',
    lessons: [
      { idea: 'awe and humility', ideaTe: 'భయభక్తులు మరియు వినయం', moral: 'When you see how vast life is, ego becomes quiet.', moralTe: 'జీవితం ఎంత విశాలమైనదో చూసినప్పుడు, అహంకారం నిశ్శబ్దమవుతుంది.' },
      { idea: 'courage after vision', ideaTe: 'దర్శనం తర్వాత ధైర్యం', moral: 'True sight of truth can make you braver, not prouder.', moralTe: 'సత్యం యొక్క నిజమైన దృష్టి మిమ్మల్ని గర్వంగా కాక ధైర్యవంతులను చేస్తుంది.' },
      { idea: 'devotion in wonder', ideaTe: 'ఆశ్చర్యంలో భక్తి', moral: 'Love and respect grow when we see the whole picture.', moralTe: 'మనం పూర్తి చిత్రాన్ని చూసినప్పుడు ప్రేమ మరియు గౌరవం పెరుగుతాయి.' },
    ],
  },
  {
    id: 12, title: 'Bhakti Yoga', theme: 'The Path of Devotion',
    lessons: [
      { idea: 'many paths one goal', ideaTe: 'అనేక మార్గాలు ఒక లక్ష్యం', moral: 'Different people grow in different ways—kindness unites all.', moralTe: 'వివిధ ప్రజలు వివిధ మార్గాలలో ఎదుగుతారు—దయ అందరినీ కలుపుతుంది.' },
      { idea: 'qualities of a devotee', ideaTe: 'భక్తుని లక్షణాలు', moral: 'Forgiveness, gentleness, and honesty are signs of a strong heart.', moralTe: 'క్షమ, సౌమ్యత మరియు నిజాయితీ బలమైన హృదయం యొక్క గుర్తులు.' },
      { idea: 'fixing the mind on good', ideaTe: 'మనస్సును మంచిది మీద నిలపడం', moral: 'Where your mind rests, your life will follow.', moralTe: 'మీ మనస్సు ఎక్కడ నిలుస్తుందో, మీ జీవితం అక్కడికి వెళ్తుంది.' },
    ],
  },
  {
    id: 13, title: 'Kshetra Kshetrajna Vibhaga Yoga', theme: 'The Field and the Knower',
    lessons: [
      { idea: 'body as a field', ideaTe: 'శరీరం ఒక క్షేత్రం', moral: 'Your body is like a garden—you choose what grows in it.', moralTe: 'మీ శరీరం తోట లాంటిది—అందులో ఏమి పెరుగుతుందో మీరు ఎంచుకుంటారు.' },
      { idea: 'the knower within', ideaTe: 'లోపలి తెలిసినవాడు', moral: 'You are the one who watches thoughts come and go.', moralTe: 'ఆలోచనలు వచ్చి పోవడం మీరు చూసేవారు.' },
      { idea: 'humility and non-violence', ideaTe: 'వినయం మరియు అహింస', moral: 'Gentle strength is stronger than loud force.', moralTe: 'సౌమ్యమైన బలం బిగ్గరగా ఉపయోగించే బలం కంటే బలమైనది.' },
    ],
  },
  {
    id: 14, title: 'Gunatraya Vibhaga Yoga', theme: 'The Three Modes of Nature',
    lessons: [
      { idea: 'goodness passion and dullness', ideaTe: 'సత్త్వం రజస్సు తమస్సు', moral: 'Notice which mood guides you—then choose wisely.', moralTe: 'ఏ భావన మిమ్మల్ని నడిపిస్తుందో గమనించండి—ఆపై తెలివిగా ఎంచుకోండి.' },
      { idea: 'rising above moods', ideaTe: 'భావాలకు అతీతంగా', moral: 'You are more than a passing mood or habit.', moralTe: 'మీరు గడిచిపోయే భావన లేదా అలవాటు కంటే ఎక్కువ.' },
      { idea: 'food thoughts and habits', ideaTe: 'ఆహారం ఆలోచనలు అలవాట్లు', moral: 'What you eat and think slowly shapes who you become.', moralTe: 'మీరు తినేది మరియు ఆలోచించేది క్రమేణా మిమ్మల్ని రూపొందిస్తుంది.' },
    ],
  },
  { id: 15, title: 'Purushottama Yoga', theme: 'The Supreme Person', skipThemes: true },
  {
    id: 16, title: 'Daivasura Sampad Vibhaga Yoga', theme: 'Divine and Demoniac Natures',
    lessons: [
      { idea: 'divine qualities', ideaTe: 'దైవీ లక్షణాలు', moral: 'Fearlessness, purity, and compassion light up your path.', moralTe: 'నిర్భయత్వం, పవిత్రత మరియు కరుణ మీ మార్గాన్ని వెలిగిస్తాయి.' },
      { idea: 'demoniac tendencies', ideaTe: 'ఆసుర ధర్మాలు', moral: 'Anger, greed, and pride create trouble for everyone.', moralTe: 'కోపం, అసూయ మరియు అహంకారం అందరికీ ఇబ్బంది సృష్టిస్తాయి.' },
      { idea: 'choosing your camp', ideaTe: 'మీ వైపు ఎంచుకోవడం', moral: 'Small daily choices build a noble character.', moralTe: 'చిన్న రోజువారీ ఎంపికలు ఉన్నతమైన శీలాన్ని నిర్మిస్తాయి.' },
    ],
  },
  {
    id: 17, title: 'Shraddhatraya Vibhaga Yoga', theme: 'The Three Divisions of Faith',
    lessons: [
      { idea: 'faith shapes actions', ideaTe: 'శ్రద్ధ చర్యలను రూపొందిస్తుంది', moral: 'What you deeply believe shows in what you do.', moralTe: 'మీరు లోతుగా నమ్మేది మీరు చేసే పనిలో కనిపిస్తుంది.' },
      { idea: 'sattvic rajasic tamasic worship', ideaTe: 'మూడు రకాల శ్రద్ధ', moral: 'Offer your best with a pure heart, not for show.', moralTe: 'ప్రదర్శన కోసం కాక, పవిత్ర హృదయంతో మీ ఉత్తమమైనది అర్పించండి.' },
      { idea: 'OM Tat Sat', ideaTe: 'ఓం తత్ సత్', moral: 'Truth, discipline, and charity should begin with sincerity.', moralTe: 'సత్యం, క్రమశిక్షణ మరియు దానం నిజాయితీతో ప్రారంభించాలి.' },
    ],
  },
  {
    id: 18, title: 'Moksha Sanyasa Yoga', theme: 'Final Liberation',
    lessons: [
      { idea: 'types of renunciation', ideaTe: 'సన్యాస రకాలు', moral: 'Letting go of selfish desire frees your energy for good work.', moralTe: 'స్వార్థ కోరికలను వదిలివేయడం మంచి పనికి మీ శక్తిని విడుదల చేస్తుంది.' },
      { idea: 'five causes of action', ideaTe: 'చర్యకు ఐదు కారణాలు', moral: 'Understand why you act—then act with clarity.', moralTe: 'మీరు ఎందుకు పని చేస్తారో అర్థం చేసుకోండి—ఆపై స్పష్టతతో చేయండి.' },
      { idea: 'final teaching surrender', ideaTe: 'చివరి బోధన లొంగుబాటు', moral: 'Do your duty, love the good, and trust the highest—then be at peace.', moralTe: 'మీ కర్తవ్యం చేయండి, మంచిని ప్రేమించండి, పరముని నమ్మండి—ఆపై శాంతిగా ఉండండి.' },
    ],
  },
];
