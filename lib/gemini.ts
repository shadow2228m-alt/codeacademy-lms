// CodeAcademy Core AI Grading Engine - Gemini Integration
import { GeminiGradeResult, Question } from './types'

const GEMINI_SYSTEM_PROMPT = `You are the CodeAcademy Core AI Grading Engine. Your sole responsibility is to evaluate student Python code submissions against strict logic criteria. You must analyze code compilation safety, algorithmic correctness, and syntax optimization.

Output Formatting Constraint:
You must respond with EXACTLY ONE VALID JSON OBJECT. Do not include any conversational text, introductions, or markdown formatting blocks like \`\`\`json ... \`\`\`.

The JSON structure must exactly match this template:
{
  "score_awarded": 8,
  "is_correct": true,
  "arabic_critique": "كودك ممتاز ومكتوب بكفاءة عالية، ولكن يفضل استخدام أسماء متغيرات تعبر عن محتواها البرمجي."
}
Arabic feedback ONLY. score_awarded is Integer out of max_points.`

export async function gradeEssayCodeWithGemini(params: {
  question_text: string
  student_code: string
  max_points: number
  evaluation_meta?: Question['evaluation_meta']
}): Promise<GeminiGradeResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY missing')

  const metaRules = []
  if (params.evaluation_meta?.require_for_loop) metaRules.push('- يجب أن يحتوي الكود على حلقة for.')
  if (params.evaluation_meta?.require_function_name) metaRules.push(`- يجب تعريف دالة باسم: ${params.evaluation_meta.require_function_name}`)
  if (params.evaluation_meta?.max_chars) metaRules.push(`- الحد الأقصى للأحرف: ${params.evaluation_meta.max_chars}`)

  const userPrompt = `
السؤال:
${params.question_text}

كود الطالب (Python):
${params.student_code}

الدرجة القصوى: ${params.max_points}
${metaRules.join('\n')}

قيم: الصحة المنطقية، السلامة، تحسين الصياغة.
أعد JSON فقط مطابق القالب.
`.trim()

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { role: 'system', parts: [{ text: GEMINI_SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 512,
          responseMimeType: 'application/json'
        }
      }),
      cache: 'no-store'
    }
  )

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Gemini API error: ${res.status} ${txt}`)
  }

  const data = await res.json()
  let raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}'
  // Strip markdown fences deterministically
  raw = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
  // Extract first {...}
  const match = raw.match(/\{[\s\S]*\}/)
  if (match) raw = match[0]

  let parsed: GeminiGradeResult
  try {
    parsed = JSON.parse(raw)
  } catch {
    // fallback safe grade
    parsed = {
      score_awarded: Math.floor(params.max_points * 0.4),
      is_correct: false,
      arabic_critique: 'تعذر تحليل الكود آلياً بشكل كامل. تم منح درجة جزئية. راجع المنطق وبنية الدوال.'
    }
  }

  // Clamp
  parsed.score_awarded = Math.max(0, Math.min(params.max_points, Number(parsed.score_awarded) || 0))
  parsed.is_correct = Boolean(parsed.is_correct)
  if (!parsed.arabic_critique) {
    parsed.arabic_critique = parsed.is_correct ? 'إجابة صحيحة، أحسنت.' : 'تحتاج مراجعة المنطق البرمجي.'
  }
  return parsed
}
