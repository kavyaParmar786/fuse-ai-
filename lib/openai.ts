// ─────────────────────────────────────────────────────────────
//  AI Image Generation — Hugging Face Inference API (FREE)
//
//  Model: stabilityai/stable-diffusion-xl-base-1.0
//  Free tier: unlimited with a free HF account
//  Sign up:   https://huggingface.co/settings/tokens
//  Set env:   HUGGINGFACE_API_KEY=hf_xxxxxxxx
// ─────────────────────────────────────────────────────────────

const STYLE_PROMPTS: Record<string, string> = {
  cute:      'kawaii style, soft pastel colors, round shapes, big sparkly eyes, adorable, fluffy, chibi',
  cyberpunk: 'neon lights, dark background, chrome accents, glitch effects, holographic, electric blue and magenta',
  neon:      'glowing neon outlines, black background, vibrant fluorescent colors, retrowave, 80s synthwave',
  horror:    'dark and eerie, dripping shadows, cracked texture, gothic, sinister, moonlit fog, unsettling',
  minimal:   'flat design, monochrome, clean lines, geometric shapes, negative space, Swiss minimalism',
}

const BASE_PROMPT =
  'single emoji sticker, transparent background, centered, ultra detailed, ' +
  'high quality digital art, vibrant, expressive, no text, no watermark'

export function buildPrompt(emojis: string[], userPrompt: string, style: string): string {
  const emojiList = emojis.join(' and ')
  const styleDesc = STYLE_PROMPTS[style] ?? ''
  const userDesc  = userPrompt?.trim() ?? ''

  return [
    BASE_PROMPT,
    `Creative fusion of ${emojiList} into one single new emoji character.`,
    userDesc  ? `Details: ${userDesc}.`     : '',
    styleDesc ? `Style: ${styleDesc}.`      : '',
    'Sticker art, isolated character, no background.',
  ]
    .filter(Boolean)
    .join(' ')
}

export async function generateFusionImage(prompt: string): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY

  if (!apiKey) {
    // No key — return a nice deterministic placeholder so the app still works
    console.warn('HUGGINGFACE_API_KEY not set — using placeholder image')
    return placeholderImage(prompt)
  }

  // Try primary model first, fall back to lighter model if cold-start timeout
  const models = [
    'stabilityai/stable-diffusion-xl-base-1.0',
    'runwayml/stable-diffusion-v1-5',
  ]

  for (const model of models) {
    try {
      const res = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              width: 512,
              height: 512,
              num_inference_steps: 30,
              guidance_scale: 7.5,
            },
            options: {
              wait_for_model: true, // wait instead of 503-ing on cold start
            },
          }),
        }
      )

      if (!res.ok) {
        const text = await res.text()
        console.warn(`Model ${model} failed (${res.status}):`, text)
        continue // try next model
      }

      // HF returns raw image bytes
      const buffer = await res.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      const contentType = res.headers.get('content-type') ?? 'image/png'

      // Return as data URL — works with Next.js <Image unoptimized>
      return `data:${contentType};base64,${base64}`
    } catch (err) {
      console.warn(`Model ${model} threw:`, err)
      continue
    }
  }

  // All models failed — return placeholder
  console.error('All HF models failed, using placeholder')
  return placeholderImage(prompt)
}

// Deterministic placeholder using DiceBear (no API key needed)
function placeholderImage(seed: string): string {
  const encoded = encodeURIComponent(seed.slice(0, 30))
  return `https://api.dicebear.com/8.x/shapes/svg?seed=${encoded}&size=512&backgroundColor=0d0d1a,1a0d2e&shape1Color=00f5ff,8b5cf6,ec4899&shape2Color=8b5cf6,ec4899,fbbf24`
}
