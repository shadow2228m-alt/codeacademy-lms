'use client'

export default function LeaderboardNeon({ rows }:{ rows: Array<{ rank:number, full_name:string, computed_xp:number, active_daily_streak:number, avatar_url?:string|null }>}) {
  return (
    <div className="rounded-[28px] border border-cyan-500/25 bg-gradient-to-b from-[#0a0f1d]/90 to-[#060912]/95 p-6 shadow-[0_0_60px_rgba(0,255,255,0.08)]" dir="rtl">
      <h3 className="text-2xl font-black text-center mb-6 text-cyan-100" style={{textShadow:'0 0 20px rgba(0,255,255,0.45)'}}>
        لوحة المتصدرين التنافسية • Neon RTL
      </h3>
      <div className="space-y-3">
        {rows.map(r=>(
          <div key={r.rank}
            className="flex items-center justify-between px-5 py-4 rounded-2xl border border-zinc-800 bg-black/30 hover:border-cyan-400/40 transition"
            style={{boxShadow: r.rank<=3 ? '0 0 22px rgba(0,255,255,0.12)' : 'none'}}>
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${r.rank===1?'bg-amber-400 text-black': r.rank===2?'bg-zinc-300 text-black': r.rank===3?'bg-orange-400 text-black':'bg-zinc-800 text-cyan-300'}`}>
                {r.rank}
              </div>
              <div>
                <div className="font-bold">{r.full_name}</div>
                <div className="text-xs text-zinc-400">streak 🔥 {r.active_daily_streak} يوم</div>
              </div>
            </div>
            <div className="text-left">
              <div className="text-cyan-300 font-extrabold text-lg" style={{textShadow:'0 0 10px rgba(0,255,255,.4)'}}>{r.computed_xp.toLocaleString('ar-EG')} XP</div>
              <div className="text-[11px] text-zinc-500">XP = E×100 + ΣS + C×50</div>
            </div>
          </div>
        ))}
        {rows.length===0 && <div className="text-center text-zinc-500 py-10">لا توجد بيانات بعد</div>}
      </div>
    </div>
  )
}
