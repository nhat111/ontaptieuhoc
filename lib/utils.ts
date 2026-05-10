import type { Difficulty } from './types'

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function difficultyLabel(d: Difficulty): string {
  return { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' }[d]
}

export function difficultyColor(d: Difficulty): string {
  return {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-700',
  }[d]
}

export const SUBJECT_COLORS: Record<string, string> = {
  blue:    'bg-blue-100 text-blue-700 border-blue-200',
  yellow:  'bg-yellow-100 text-yellow-700 border-yellow-200',
  green:   'bg-green-100 text-green-700 border-green-200',
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  red:     'bg-red-100 text-red-700 border-red-200',
  orange:  'bg-orange-100 text-orange-700 border-orange-200',
  teal:    'bg-teal-100 text-teal-700 border-teal-200',
  purple:  'bg-purple-100 text-purple-700 border-purple-200',
  indigo:  'bg-indigo-100 text-indigo-700 border-indigo-200',
  pink:    'bg-pink-100 text-pink-700 border-pink-200',
}

export const GRADE_COLORS: Record<number, string> = {
  6:  'from-indigo-500 to-indigo-600',
  7:  'from-purple-500 to-purple-600',
  8:  'from-blue-500 to-blue-600',
  9:  'from-teal-500 to-teal-600',
  10: 'from-green-500 to-green-600',
  11: 'from-orange-500 to-orange-600',
  12: 'from-red-500 to-red-600',
}

export function getGradeColor(orderIndex: number): string {
  return GRADE_COLORS[orderIndex] ?? 'from-gray-500 to-gray-600'
}
