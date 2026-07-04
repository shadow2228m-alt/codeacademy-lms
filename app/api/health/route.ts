export const dynamic = 'force-dynamic'
export async function GET(){
  return Response.json({
    ok: true,
    service: 'CodeAcademy LMS',
    version: '2.0.0-phase2',
    modules: [
      'createQuizTransaction',
      'submitAndGradeQuiz',
      'upsertStudentAnswer',
      'getLeaderboard',
      'gemini_ai_grader'
    ],
    timestamp: new Date().toISOString()
  })
}
