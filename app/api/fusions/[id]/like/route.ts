import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = (session.user as any).id as string
    const fusionId = params.id

    const { data: existing } = await supabaseAdmin
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('fusion_id', fusionId)
      .single()

    if (existing) {
      await supabaseAdmin.from('likes').delete().eq('user_id', userId).eq('fusion_id', fusionId)
      await supabaseAdmin.from('fusions').update({ like_count: supabaseAdmin.rpc('greatest', { val: 0 }) })
      // Simple decrement
      const { data: f } = await supabaseAdmin.from('fusions').select('like_count').eq('id', fusionId).single()
      await supabaseAdmin.from('fusions').update({ like_count: Math.max(0, (f?.like_count ?? 1) - 1) }).eq('id', fusionId)
      return NextResponse.json({ liked: false })
    } else {
      await supabaseAdmin.from('likes').insert({ user_id: userId, fusion_id: fusionId })
      const { data: f } = await supabaseAdmin.from('fusions').select('like_count').eq('id', fusionId).single()
      await supabaseAdmin.from('fusions').update({ like_count: (f?.like_count ?? 0) + 1 }).eq('id', fusionId)
      return NextResponse.json({ liked: true })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
