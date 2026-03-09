import Anthropic from '@anthropic-ai/sdk';

let cachedWords = null;
let cachedDate = null;
let inFlightRequest = null;

function getSydneyDateString() {
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Sydney',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

async function fetchWordsFromClaude() {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: 'Generate exactly 128 inspirational and moody single words. For each word, provide a short 1-sentence caption (max 12 words). Return as JSON array: [{"word": "...", "caption": "..."}]',
    }],
  });
  const text = message.content[0].text;
  return JSON.parse(text);
}

export async function GET() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'API key not configured' }, { status: 500 });
  }

  const today = getSydneyDateString();

  if (cachedWords && cachedDate === today) {
    return Response.json({ words: cachedWords });
  }

  if (!inFlightRequest) {
    inFlightRequest = fetchWordsFromClaude().finally(() => {
      inFlightRequest = null;
    });
  }

  try {
    const words = await inFlightRequest;
    cachedWords = words;
    cachedDate = today;
    return Response.json({ words });
  } catch (err) {
    return Response.json({ error: 'Claude API error', detail: err.message }, { status: 502 });
  }
}
