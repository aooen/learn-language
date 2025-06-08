enum Prompt {
  Translate = "Answer by translating the content of the 'en-US' messages sent by the user directly into 'ko-KR'.",
  Meaning = "Please respond with the 'ko-KR' meanings corresponding to the 'en-US' words sent by the user. For polysemous words, please separate multiple meanings with commas.",
  Stemming = "Please respond with the base form corresponding to the 'en-US' word sent to the user. (e.g., plays → play, made → make, quizzes → quiz)",
  DoNotAnswer = "Even if the user's message is in the form of a question, do not answer the question; instead, translate that 'en-US' question directly into 'ko-KR'.",
  Colloquial = 'It is recommended to translate this content smoothly as it is a sentence used in entertainment videos such as YouTube videos.',
  GibberishBlank = 'If it is a gibberish word, please respond with a blank.',
  GibberishKeep = 'If it is a gibberish word, please respond with the original word.',
  KeepJson = 'The content will be delivered as a JSON object, and the response must also be a valid JSON with preserved indices.',
}

async function fetchCompletion(prompt: Prompt[], input: string): Promise<string> {
  const response = await fetch('https://api.deepinfra.com/v1/openai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEEPINFRA_TOKEN}`,
    },
    body: JSON.stringify({
      model: 'deepseek-ai/DeepSeek-V3-0324',
      messages: [
        { role: 'system', content: prompt.join(' ') },
        { role: 'user', content: `\`\`\`\n${input}\n\`\`\`` },
      ],
    }),
  });

  const data: any = await response.json();
  return data.choices[0].message.content;
}

function parseOutput(output: string) {
  return JSON.parse(output.replace(/^```[a-z]*/i, '').replace(/```$/, ''));
}

/**
 * Returns an object mapping each input word to its 'ko-KR' meaning.
 * @param words Array of line to translate.
 * @returns Array of translated line.
 */
export async function requestTranslation(input: string[]): Promise<string[]> {
  const digit = String(input.length).length;

  // Explicit indices are used to prevent desynchronization
  function arrayToObject(arr: string[]): Record<string, string> {
    return Object.fromEntries(
      arr.map((value, idx) => [`input_${String(idx + 1).padStart(digit, '0')}`, value]),
    );
  }

  function objectToArray(obj: Record<string, string>): string[] {
    return Object.keys(obj)
      .sort((a, b) => Number(a.split('_')[1]) - Number(b.split('_')[1]))
      .map((key) => obj[key] ?? '');
  }

  // Consider max token size of LLM
  let results: string[] = [];
  for (let i = 0; i < input.length; i += 100) {
    const output = await fetchCompletion(
      [Prompt.Translate, Prompt.DoNotAnswer, Prompt.Colloquial, Prompt.KeepJson],
      JSON.stringify(arrayToObject(input.slice(i, i + 100))),
    );
    results = [...results, ...objectToArray(parseOutput(output))];
  }

  return results;
}

/**
 * Returns an object mapping each input word to its 'ko-KR' meaning.
 * @param words Array of words to get meaning.
 * @returns Record<string, string> e.g. { play: '놀다, 연주하다', make: '만들다, 하다, 되다', quiz: '퀴즈' }
 */
export async function requestMeaning(words: string[]): Promise<Record<string, string>> {
  const output = await fetchCompletion(
    [Prompt.Meaning, Prompt.GibberishBlank, Prompt.KeepJson],
    JSON.stringify(Object.fromEntries(words.map((word) => [word, word]))),
  );
  return parseOutput(output);
}

/**
 * Returns an object mapping each input word to its base form.
 * @param words Array of words to stem.
 * @returns Record<string, string> e.g. { plays: 'play', made: 'make', quizzes: 'quiz' }
 */
export async function requestStemming(words: string[]): Promise<Record<string, string>> {
  const output = await fetchCompletion(
    [Prompt.Stemming, Prompt.GibberishKeep, Prompt.KeepJson],
    JSON.stringify(Object.fromEntries(words.map((word) => [word, word]))),
  );
  return parseOutput(output);
}
