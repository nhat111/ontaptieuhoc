'use client'

import katex from 'katex'

interface Props {
  content: string
  className?: string
  block?: boolean
}

function renderKatex(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex, { displayMode, throwOnError: false, strict: false })
  } catch {
    return latex
  }
}

type Segment =
  | { type: 'text';   value: string }
  | { type: 'inline'; value: string }
  | { type: 'block';  value: string }

function parse(content: string): Segment[] {
  const segments: Segment[] = []
  const re = /\$\$[\s\S]+?\$\$|\$[^$\n]+?\$/g
  let last = 0
  let m: RegExpExecArray | null

  while ((m = re.exec(content)) !== null) {
    if (m.index > last) segments.push({ type: 'text', value: content.slice(last, m.index) })
    const raw = m[0]
    if (raw.startsWith('$$')) segments.push({ type: 'block',  value: raw.slice(2, -2).trim() })
    else                      segments.push({ type: 'inline', value: raw.slice(1, -1).trim() })
    last = re.lastIndex
  }
  if (last < content.length) segments.push({ type: 'text', value: content.slice(last) })
  return segments
}

export function MathRenderer({ content, className, block }: Props) {
  if (!content) return null

  if (block) {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: renderKatex(content, true) }}
      />
    )
  }

  const segments = parse(content)

  return (
    <span className={className}>
      {segments.map((seg, i) => {
        if (seg.type === 'text')
          return <span key={i}>{seg.value}</span>
        if (seg.type === 'block')
          return (
            <span
              key={i}
              className="block my-2 overflow-x-auto text-center"
              dangerouslySetInnerHTML={{ __html: renderKatex(seg.value, true) }}
            />
          )
        return (
          <span
            key={i}
            dangerouslySetInnerHTML={{ __html: renderKatex(seg.value, false) }}
          />
        )
      })}
    </span>
  )
}
