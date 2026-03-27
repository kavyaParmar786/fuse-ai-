import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id as string
    const { searchParams } = new URL(req.url)
    const tab = searchParams.get('tab') ?? 'fusions'

    let fusionIds: string[] | null = null

    if (tab === 'liked') {
      const { data: likes } = await supabaseAdmin
        .from('likes')
        .select('fusion_id')
        .eq('user_id', userId)
      fusionIds = likes?.map((l: any) => l.fusion_id) ?? []
      if (fusionIds.length === 0) return NextResponse.json({ fusions: [] })
    }

    let query = supabaseAdmin
      .from('fusions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (fusionIds !== null) {
      query = query.in('id', fusionIds)
    } else {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query
    if (error) throw error

    const { data: userLikes } = await supabaseAdmin
      .from('likes')
      .select('fusion_id')
      .eq('user_id', userId)

    const likedSet = new Set(userLikes?.map((l: any) => l.fusion_id) ?? [])

    const fusions = (data ?? []).map((f: any) => ({
      id: f.id,
      imageUrl: f.image_url,
      emojis: f.emojis,
      style: f.style,
      prompt: f.prompt,
      liked: likedSet.has(f.id),
      createdAt: f.created_at,
    }))

    return NextResponse.json({ fusions })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
