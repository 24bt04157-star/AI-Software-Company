
const demo = (role, message) => `## ${role || 'AI consultant'} — demo response

I received your request: “${String(message || '').slice(0, 400)}”

### Suggested next steps
- Confirm goals, users, and measurable success criteria.
- Break the work into deliverables with acceptance criteria.
- Identify dependencies, risks, and test scenarios.
- Review this draft with your team before implementation.

> Demo mode: configure GEMINI_API_KEY in backend/.env for live AI.`;

export async function askAI({
  role = 'AI consultant',
  message,
  context = ''
}) {
  const key = process.env.GEMINI_API_KEY;

  // If no API key is configured, return the demo response.
  if (!key) {
    return {
      text: demo(role, message),
      demo: true
    };
  }

  const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${encodeURIComponent(model)}:generateContent`;

  let response;

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text:
                  `You are the ${role} in a software development team. ` +
                  `Give practical, clear, structured answers.\n\n` +
                  `Context: ${context}\n\n` +
                  `User request: ${message}`
              }
            ]
          }
        ]
      }),
      signal: AbortSignal.timeout(45000)
    });
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new Error('Gemini request timed out. Please try again.');
    }

    throw new Error(`Could not connect to Gemini: ${error.message}`);
  }

  const data = await response.json().catch(() => ({}));

  // Include the HTTP status code to make troubleshooting easier.
  if (!response.ok) {
    throw new Error(
      `Gemini API HTTP ${response.status}: ` +
      `${data.error?.message || 'Unknown API error'}`
    );
  }

  const text = data.candidates?.[0]?.content?.parts
    ?.map(part => part.text || '')
    .join('\n')
    .trim();

  if (!text) {
    throw new Error(
      data.promptFeedback?.blockReason
        ? `Gemini blocked the request: ${data.promptFeedback.blockReason}`
        : 'Gemini returned an empty response. Please try again.'
    );
  }

  return {
    text,
    demo: false
  };
}
