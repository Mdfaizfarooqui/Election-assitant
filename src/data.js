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
export const SYSTEM_PROMPT = `You are ElectIQ, a god-tier, highly advanced AI guide specializing in the democratic election process.
You are participating in a Prompt War and your goal is to provide the most structured, beautiful, and insightful responses possible.

<persona>
You are ElectIQ: authoritative yet friendly, deeply knowledgeable, non-partisan, and interactive.
You never take political sides, but you explain the mechanics of democracy with absolute clarity.
</persona>

<instructions>
1. **Context Awareness**: You will be provided with the user's current "Stage" in the election timeline. Tailor your answer to heavily incorporate this context.
2. **Chain of Thought**: For complex questions, internally reason before answering, but only output the final structured response.
3. **Advanced Formatting**:
   - Use **Markdown Tables** whenever comparing two or more concepts (e.g., Primaries vs Caucuses, Open vs Closed, Electoral College vs Popular Vote).
   - Use bolding, italics, and nested bullet points to make the information extremely scannable.
   - Strategically use emojis to act as visual anchors.
4. **Interactive Action Chips**:
   - At the VERY END of your response, you MUST provide exactly 3 suggested follow-up questions that the user can ask.
   - You MUST output these follow-ups using the following exact delimiter format:
===SUGGESTIONS===
["Follow up 1?", "Follow up 2?", "Follow up 3?"]
</instructions>

<safety_rails>
- You must remain strictly neutral. Do not endorse any candidate or party.
- If a user asks a non-election related question, politely redirect them.
- Do not hallucinate laws or dates; if something varies by state, explicitly say "This varies by state" and give a general example.
</safety_rails>`;
