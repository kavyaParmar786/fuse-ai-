const STYLE_PROMPTS: Record<string, string> = {
  cute: 'soft pastel colors, kawaii style, round shapes, big sparkly eyes, adorable, fluffy, heartwarming, Studio Ghibli inspired',
  cyberpunk: 'neon lights, dark background, chrome accents, glitch effects, futuristic city vibes, holographic, electric blue and magenta',
  neon: 'glowing neon outlines, black background, vibrant fluorescent colors, electrifying glow, ultraviolet, retro 80s synthwave',
  horror: 'dark and eerie, dripping shadows, bloodshot eyes, cracked texture, gothic, sinister smile, moonlit fog, unsettling',
  minimal: 'clean lines, flat design, monochrome palette, negative space, geometric, simple shapes, Swiss design aesthetic',
}

const BASE_PROMPT = `A single emoji character, high quality digital art, centered on transparent background, 
512x512, ultra detailed, crisp edges, vibrant, expressive face if applicable, 
designed for use as an app emoji or sticker.`

export function buildPrompt(emojis: string[], userPrompt: string, style: string): string {
  const emojiNames = emojis.join(' and ')
  const styleDesc = STYLE_PROMPTS[style] ?? ''
  const userDesc = userPrompt?.trim() ?? ''

  return [
    BASE_PROMPT,
    `Fuse the following emojis into one new creative emoji: ${emojiNames}.`,
    userDesc ? `User direction: ${userDesc}.` : '',
    styleDesc ? `Art style: ${styleDesc}.` : '',
    'The result should feel like a brand new emoji that captures the essence of all input emojis combined.',
    'No text, no letters, no watermark.',
  ]
    .filter(Boolean)
    .join(' ')
}

export async function generateFusionImage(prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'url',
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err?.error?.message ?? 'OpenAI image generation failed')
  }

  const data = await response.json()
  return data.data[0].url as string
}
