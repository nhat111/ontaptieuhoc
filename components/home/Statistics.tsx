const STATS = [
  { icon: '❓', value: '10,000+', label: 'Câu hỏi' },
  { icon: '📚', value: '500+',    label: 'Bài học' },
  { icon: '🎓', value: '7',       label: 'Lớp học' },
  { icon: '📐', value: '10',      label: 'Môn học' },
  { icon: '👨‍🎓', value: '50,000+', label: 'Học sinh' },
]

export function Statistics() {
  return (
    <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
          {STATS.map(s => (
            <div key={s.label} className="group">
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className="text-3xl font-extrabold">{s.value}</div>
              <div className="text-indigo-200 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
