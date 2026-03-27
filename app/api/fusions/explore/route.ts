import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user ? (session.user as any).id : null

    const { searchParams } = new URL(req.url)
    const filter = searchParams.get('filter') ?? 'trending'

    const orderCol = filter === 'trending' ? 'like_count' : 'created_at'

    const { data, error } = await supabaseAdmin
      .from('fusions')
      .select('*, users:user_id(name, image)')
      .eq('is_public', true)
      .order(orderCol, { ascending: false })
      .limit(40)

    if (error) throw error

    // Get user's likes
    let likedSet = new Set<string>()
    if (userId) {
      const { data: userLikes } = await supabaseAdmin
        .from('likes')
        .select('fusion_id')
        .eq('user_id', userId)
      likedSet = new Set(userLikes?.map((l: any) => l.fusion_id) ?? [])
    }

    const fusions = (data ?? []).map((f: any) => ({
      id: f.id,
      imageUrl: f.image_url,
      emojis: f.emojis,
      style: f.style,
      prompt: f.prompt,
      likeCount: f.like_count,
      liked: likedSet.has(f.id),
      createdAt: f.created_at,
      user: f.users,
    }))

    return NextResponse.json({ fusions })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
