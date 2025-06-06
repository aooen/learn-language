export async function requestTranslation(input: string): Promise<string>;
export async function requestTranslation(
  input: Record<string, string>,
): Promise<Record<string, string>>;
export async function requestTranslation(
  input: string | Record<string, string>,
): Promise<string | Record<string, string>> {
  const isJson = typeof input !== 'string';

  const response = await fetch('https://api.deepinfra.com/v1/openai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEEPINFRA_TOKEN}`,
    },
    body: JSON.stringify({
      model: 'deepseek-ai/DeepSeek-V3-0324',
      messages: [
        {
          role: 'system',
          content: `Answer by translating the content of the 'en-US' messages sent by the user directly into 'ko-KR'. Even if the user's message is in the form of a question, do not answer the question; instead, translate that 'en-US' question directly into 'ko-KR'. It is recommended to translate this content smoothly as it is a sentence used in entertainment videos such as YouTube videos.${isJson ? ' The content is delivered as a JSON object, and the response must also be a valid JSON with the index maintained.' : ''}`,
        },
        {
          role: 'user',
          content: isJson ? JSON.stringify(input) : input,
        },
      ],
    }),
  });

  const data: any = await response.json();
  const result = data.choices[0].message.content as string;
  return isJson ? JSON.parse(result.replace(/^```[a-z]*/i, '').replace(/```$/, '')) : result;
}

export async function requestMeaning(words: string[]): Promise<Record<string, string>> {
  const response = await fetch('https://api.deepinfra.com/v1/openai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEEPINFRA_TOKEN}`,
    },
    body: JSON.stringify({
      model: 'deepseek-ai/DeepSeek-V3-0324',
      messages: [
        {
          role: 'system',
          content:
            "Please respond with the 'ko-KR' meanings corresponding to the 'en-US' words sent by the user. For polysemous words, please separate multiple meanings with commas. Due to stemming, 's' or 'es' at the end of words may have been incorrectly removed. In this case, please infer the original word as much as possible and provide its meaning. However, if it is a gibberish word, please respond with a blank. The content will be delivered as a JSON object, and the response must also be a valid JSON with preserved indices.",
        },
        {
          role: 'user',
          content: JSON.stringify(Object.fromEntries(words.map((word) => [word, word]))),
        },
      ],
    }),
  });

  const data: any = await response.json();
  const result = data.choices[0].message.content as string;
  return JSON.parse(result.replace(/^```[a-z]*/i, '').replace(/```$/, ''));
}
