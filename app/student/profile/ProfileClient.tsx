'use client'
import { useState, useTransition, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'

const INTEREST_SUGGESTIONS = [
  'Python', 'JavaScript', 'Data Science', 'Machine Learning',
  'Web Development', 'Algorithms', 'Databases', 'Cybersecurity',
]

interface Props {
  initialName: string
  initialBio: string
  initialInterests: string[]
  initialAvatarUrl: string | null
  userId: string
}

export default function ProfileClient({
  initialName,
  initialBio,
  initialInterests,
  initialAvatarUrl,
  userId,
}: Props) {
  const [name, setName] = useState(initialName)
  const [bio, setBio] = useState(initialBio || '')
  const [interests, setInterests] = useState<string[]>(initialInterests || [])
  const [interestInput, setInterestInput] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialAvatarUrl)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  // رفع الصورة الشخصية
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setMsg({ text: '❌ الصورة أكبر من 5MB', ok: false }); return }
    if (!file.type.startsWith('image/')) { setMsg({ text: '❌ يُسمح فقط بملفات الصور', ok: false }); return }

    // معاينة فورية
    const reader = new FileReader()
    reader.onloadend = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${userId}/avatar.${ext}`
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      setAvatarUrl(publicUrl)
      setMsg({ text: '✅ تم رفع الصورة', ok: true })
    } catch (e: any) {
      setMsg({ text: '❌ فشل رفع الصورة: ' + e.message, ok: false })
    } finally {
      setUploading(false)
    }
  }

  // الاهتمامات
  const addInterest = (tag: string) => {
    const clean = tag.trim()
    if (!clean || interests.includes(clean) || interests.length >= 8) return
    setInterests(prev => [...prev, clean])
    setInterestInput('')
  }

  const removeInterest = (tag: string) => setInterests(prev => prev.filter(i => i !== tag))

  // حفظ الملف الشخصي
  const save = useCallback(() => {
    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.from('student_profiles').update({
        full_name: name.trim(),
        bio: bio.trim() || null,
        interests,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      }).eq('user_id', userId)
      setMsg(error
        ? { text: '❌ ' + error.message, ok: false }
        : { text: '✅ تم حفظ الملف الشخصي', ok: true }
      )
    })
  }, [name, bio, interests, avatarUrl, userId])

  const initials = name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '؟'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-5 border-t border-zinc-800 pt-5 space-y-5"
    >
      {/* الصورة الشخصية */}
      <div className="flex flex-col items-center gap-3">
        <div
          className="relative w-24 h-24 rounded-2xl overflow-hidden cursor-pointer group border-2 border-zinc-700 hover:border-cyan-500/50 transition"
          onClick={() => fileRef.current?.click()}
        >
          {avatarPreview ? (
            <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center text-2xl font-black text-black">
              {initials}
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
            {uploading ? '⏳ يرفع…' : '📷 تغيير'}
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        <p className="text-[11px] text-zinc-500">اضغط على الصورة لتغييرها (حد أقصى 5MB)</p>
      </div>

      {/* الاسم */}
      <div>
        <label className="text-xs text-zinc-400 block mb-1.5">الاسم الكامل</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full bg-black/40 border border-zinc-800 rounded-xl px-3 py-2 text-sm focus:border-cyan-500/60 outline-none transition"
        />
      </div>

      {/* السيرة الذاتية */}
      <div>
        <label className="text-xs text-zinc-400 block mb-1.5">نبذة عنك (Bio)</label>
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value)}
          rows={3}
          maxLength={300}
          placeholder="أخبر زملاءك عن نفسك…"
          className="w-full bg-black/40 border border-zinc-800 rounded-xl px-3 py-2 text-sm resize-none focus:border-cyan-500/60 outline-none transition"
        />
        <div className="text-[10px] text-zinc-600 text-left">{bio.length}/300</div>
      </div>

      {/* الاهتمامات */}
      <div>
        <label className="text-xs text-zinc-400 block mb-1.5">الاهتمامات (حتى 8)</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          <AnimatePresence>
            {interests.map(tag => (
              <motion.span
                key={tag}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold"
              >
                {tag}
                <button onClick={() => removeInterest(tag)} className="text-cyan-500 hover:text-red-400 transition text-[10px]">✕</button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
        <div className="flex gap-2">
          <input
            value={interestInput}
            onChange={e => setInterestInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addInterest(interestInput) } }}
            placeholder="اكتب اهتماماً واضغط Enter"
            className="flex-1 bg-black/40 border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:border-cyan-500/60 outline-none transition"
          />
          <button
            onClick={() => addInterest(interestInput)}
            className="px-3 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs hover:bg-cyan-500/25 transition"
          >+</button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {INTEREST_SUGGESTIONS.filter(s => !interests.includes(s)).map(s => (
            <button
              key={s}
              onClick={() => addInterest(s)}
              className="text-[11px] px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-400 hover:border-cyan-500/40 hover:text-cyan-300 transition"
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      {/* زر الحفظ */}
      <button
        disabled={isPending || uploading}
        onClick={save}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black font-black text-sm hover:opacity-90 transition disabled:opacity-50"
      >
        {isPending ? 'يحفظ…' : '💾 حفظ الملف الشخصي'}
      </button>

      {/* رسالة النتيجة */}
      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-xs rounded-lg px-3 py-2 text-center font-bold ${msg.ok ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300' : 'bg-red-950/40 border border-red-500/30 text-red-300'}`}
          >
            {msg.text}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
