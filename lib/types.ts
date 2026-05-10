export interface Grade {
  id: string
  name: string
  slug: string
  order_index: number
  created_at: string
}

export interface Subject {
  id: string
  name: string
  slug: string
  icon: string
  color: string
  order_index: number
  created_at: string
}

export interface Lesson {
  id: string
  title: string
  slug: string
  description: string | null
  grade_id: string
  subject_id: string
  thumbnail: string | null
  order_index: number
  created_at: string
  grade?: Grade
  subject?: Subject
  question_count?: number
}

export interface Question {
  id: string
  lesson_id: string
  type: 'single' | 'multiple'
  difficulty: 'easy' | 'medium' | 'hard'
  content: string
  explanation: string | null
  image_url: string | null
  order_index: number
  created_at: string
  options?: Option[]
}

export interface Option {
  id: string
  question_id: string
  label: string
  content: string
  is_correct: boolean
}

export interface QuizResult {
  id: string
  user_id: string | null
  lesson_id: string
  score: number
  total_questions: number
  answers: AnswerRecord[]
  created_at: string
  lesson?: Lesson & { grade?: Grade; subject?: Subject }
}

export interface AnswerRecord {
  question_id: string
  selected: string[]
  is_correct: boolean
}

export type Difficulty = 'easy' | 'medium' | 'hard'
export type QuestionType = 'single' | 'multiple'

export interface QuizState {
  answers: Record<string, string[]>
  currentIndex: number
  isSubmitted: boolean
  timeLeft: number
  showConfirm: boolean
}
