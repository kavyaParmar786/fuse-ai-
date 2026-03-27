import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { buildPrompt, generateFusionImage } from '@/lib/openai'
import { supabaseAdmin } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any)?.id || null
    const { emojis, prompt, style } = await req.json()

    if (!Array.isArray(emojis) || emojis.length < 2 || emojis.length > 5) {
      return NextResponse.json({ error: 'Select 2–5 emojis' }, { status: 400 })
    }

    // Build enhanced AI prompt
    const aiPrompt = buildPrompt(emojis, prompt ?? '', style ?? '')

    // Generate image
    let imageUrl: string
    try {
      imageUrl = await generateFusionImage(aiPrompt)
    } catch (aiErr: any) {
      console.error('AI error:', aiErr)
      // Fallback placeholder during development (no API key needed)
      imageUrl = `https://api.dicebear.com/8.x/shapes/svg?seed=${encodeURIComponent(emojis.join(''))}&size=512&backgroundColor=0d0d1a`
    }

    // Persist to Supabase
const id = uuidv4()

let fusionData = null

try {
  const { data, error } = await supabaseAdmin
    .from('fusions')
    .insert({
      id,
      user_id: userId || "temp-user", // fallback fix
      emojis,
      prompt: prompt ?? null,
      style: style ?? null,
      ai_prompt: aiPrompt,
      image_url: imageUrl,
      like_count: 0,
      is_public: true,
    })
    .select()
    .single()

  if (error) {
    console.error('Supabase error:', error)
  } else {
    fusionData = data
  }
} catch (dbErr) {
  console.error("DB crash:", dbErr)
}
return NextResponse.json({
  fusion: {
    id: fusionData?.id || id,
    imageUrl: imageUrl,
    emojis,
    prompt,
    style,
    liked: false,
  },
})
  } catch (err: any) {
    console.error('Fuse error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 })
  }
}
