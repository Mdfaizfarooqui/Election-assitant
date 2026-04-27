// Election stages data
export const stages = [
  {
    id: 0,
    icon: '📝',
    title: 'Voter Registration',
    desc: 'Learn who can vote, how to register, and key deadlines.',
    prompts: [
      'Who is eligible to vote?',
      'How do I register to vote?',
      'What is the registration deadline?',
      'Can I vote without registering?',
    ],
  },
  {
    id: 1,
    icon: '🏛️',
    title: 'Candidate Filing',
    desc: 'Discover how candidates officially enter the race.',
    prompts: [
      'How does someone become a candidate?',
      'What are filing requirements?',
      'What is the filing deadline?',
      'Can an independent run for office?',
    ],
  },
  {
    id: 2,
    icon: '🗳️',
    title: 'Primary Elections',
    desc: 'Understand how parties select their official nominees.',
    prompts: [
      'What is a primary election?',
      'Difference between open and closed primaries?',
      'What is a caucus?',
      'Who can vote in primaries?',
    ],
  },
  {
    id: 3,
    icon: '📣',
    title: 'Campaigning',
    desc: 'See how candidates reach voters through debates and outreach.',
    prompts: [
      'How are campaigns funded?',
      'What are campaign finance rules?',
      'How do presidential debates work?',
      'What is a political ad?',
    ],
  },
  {
    id: 4,
    icon: '🗺️',
    title: 'Election Day',
    desc: 'Everything you need to know about casting your vote.',
    prompts: [
      'What ID do I need to vote?',
      'What are polling hours?',
      'Can I vote by mail?',
      'What is early voting?',
    ],
  },
  {
    id: 5,
    icon: '🔢',
    title: 'Vote Counting',
    desc: 'Learn how ballots are counted and verified.',
    prompts: [
      'How are votes counted?',
      'What is an absentee ballot count?',
      'How long does counting take?',
      'What is a recount?',
    ],
  },
  {
    id: 6,
    icon: '✅',
    title: 'Certification',
    desc: 'The official process for confirming election results.',
    prompts: [
      'What is certification of results?',
      'Who certifies election results?',
      'Can results be challenged?',
      'What is the Electoral College?',
    ],
  },
  {
    id: 7,
    icon: '🤝',
    title: 'Inauguration',
    desc: 'The formal transfer of power to the elected official.',
    prompts: [
      'What happens at an inauguration?',
      'When does inauguration occur?',
      'What is the oath of office?',
      'What is a transition period?',
    ],
  },
];

// System prompt for Gemini
export const SYSTEM_PROMPT = `You are ElectIQ, a friendly and knowledgeable AI assistant specializing in the democratic election process. Your role is to help users understand elections — from voter registration to inauguration — in a clear, non-partisan, and accessible way.

Guidelines:
- Be factual, concise, and non-partisan. Do not favor any political party or candidate.
- Use simple language. Avoid jargon; if you must use a term, explain it.
- When discussing processes, use numbered steps where helpful.
- Relate answers to the US election process by default, but clarify if discussing another country's system.
- If a question is outside elections/democracy, politely redirect the user back to election topics.
- Use emojis sparingly to make responses friendly but not overwhelming.
- Keep responses focused and under 300 words unless the topic truly requires more detail.`;
