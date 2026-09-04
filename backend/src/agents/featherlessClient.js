import { config } from '../config.js';

/**
 * Robust caller for Featherless AI using Qwen2.5-7B-Instruct.
 * Enforces custom User-Agent to satisfy Cloudflare security checks.
 */
export async function callFeatherless({ messages, temperature = 0.3, max_tokens = 1000, jsonMode = false, timeoutMs = 9000 }) {
  const url = `${config.featherless.baseUrl}/chat/completions`;

  const payload = {
    model: config.featherless.model,
    messages,
    temperature,
    max_tokens
  };

  if (jsonMode) {
    // Encourage model to return valid JSON
    payload.response_format = { type: 'json_object' };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.featherless.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': config.featherless.userAgent
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeoutMs)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Featherless API Error (${response.status}):`, errText);
      throw new Error(`Featherless API HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    return content;
  } catch (error) {
    console.error('Failed to communicate with Featherless AI:', error.message);
    throw error;
  }
}

/**
 * Extracts and safely parses JSON from an LLM response string.
 */
export function extractJsonFromText(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    // Try finding json block inside markdown ```json ... ```
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch (err) {}
    }

    // Try finding between first { and last }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(text.substring(firstBrace, lastBrace + 1));
      } catch (err) {}
    }

    // Try finding between first [ and last ]
    const firstSquare = text.indexOf('[');
    const lastSquare = text.lastIndexOf(']');
    if (firstSquare !== -1 && lastSquare !== -1 && lastSquare > firstSquare) {
      try {
        return JSON.parse(text.substring(firstSquare, lastSquare + 1));
      } catch (err) {}
    }

    throw new Error('Unable to parse JSON from AI response: ' + text.substring(0, 150));
  }
}
