import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user ? (session.user as any).id : null

    const { data: fusion, error } = await supabaseAdmin
      .from('fusions')
      .select('*, users:user_id(name, image)')
      .eq('id', params.id)
      .single()

    if (error || !fusion) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    let liked = false
    if (userId) {
      const { data: like } = await supabaseAdmin
        .from('likes')
        .select('id')
        .eq('user_id', userId)
        .eq('fusion_id', params.id)
        .single()
      liked = !!like
    }

    return NextResponse.json({
      fusion: {
        id: fusion.id,
        imageUrl: fusion.image_url,
        emojis: fusion.emojis,
        prompt: fusion.prompt,
        style: fusion.style,
        likeCount: fusion.like_count,
        liked,
        createdAt: fusion.created_at,
        user: fusion.users,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
