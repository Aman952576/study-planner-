import { useState, useEffect } from 'react'

export default function ExamCountdown({ examKey, examName, accentColor = 'var(--accent)' }) {
  const storageKey = `st_exam_date_${examKey}`
  const [examDate, setExamDate] = useState(() => localStorage.getItem(storageKey) || '')
  const [now, setNow] = useState(Date.now())
  const [picking, setPicking] = useState(false)
  const [tempDate, setTempDate] = useState('')

  useEffect(() => {
    localStorage.setItem(storageKey, examDate)
  }, [examDate, storageKey])

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const confirmDate = () => {
    if (tempDate) {
      setExamDate(tempDate)
      setPicking(false)
    }
  }

  if (!examDate && !picking) {
    return (
      <div className="rounded-xl p-3 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <p className="text-[10px] font-semibold mb-1.5 truncate" style={{ color: 'var(--muted)' }}>{examName}</p>
        <p className="text-[10px] mb-2" style={{ color: 'var(--muted)' }}>No date set</p>
        <button onClick={() => setPicking(true)}
          className="w-full px-2 py-1.5 rounded-lg text-[10px] font-medium"
          style={{ background: 'var(--accent)', color: '#fff' }}>
          Set Exam Date
        </button>
      </div>
    )
  }

  if (picking) {
    return (
      <div className="rounded-xl p-3 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <p className="text-[10px] font-semibold mb-2 truncate" style={{ color: 'var(--muted)' }}>{examName}</p>
        <input type="date" value={tempDate} onChange={e => setTempDate(e.target.value)}
          className="w-full px-2 py-1.5 rounded-lg text-[10px] outline-none text-center mb-2"
          style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
        <div className="flex gap-1.5">
          <button onClick={() => { setPicking(false); setTempDate('') }}
            className="flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium"
            style={{ background: 'var(--input-bg)', color: 'var(--fg)' }}>Cancel</button>
          <button onClick={confirmDate}
            className="flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium"
            style={{ background: tempDate ? 'var(--accent)' : 'var(--input-bg)', color: tempDate ? '#fff' : 'var(--muted)' }}
            disabled={!tempDate}>Start</button>
        </div>
      </div>
    )
  }

  const target = new Date(examDate + 'T23:59:59').getTime()
  const diff = Math.max(0, target - now)

  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)

  return (
    <div className="rounded-xl p-3 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <p className="text-[10px] font-semibold mb-1.5 truncate" style={{ color: 'var(--muted)' }}>{examName}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-1 gap-y-0.5">
        <div className="flex flex-col items-center min-w-0">
          <p className="text-xs sm:text-sm font-medium font-mono leading-none" style={{ color: accentColor }}>{String(days).padStart(2, '0')}</p>
          <p className="text-[8px] leading-none mt-0.5" style={{ color: 'var(--muted)' }}>Days</p>
        </div>
        <div className="flex flex-col items-center min-w-0">
          <p className="text-xs sm:text-sm font-medium font-mono leading-none" style={{ color: accentColor }}>{String(hours).padStart(2, '0')}</p>
          <p className="text-[8px] leading-none mt-0.5" style={{ color: 'var(--muted)' }}>Hrs</p>
        </div>
        <div className="flex flex-col items-center min-w-0">
          <p className="text-xs sm:text-sm font-medium font-mono leading-none" style={{ color: accentColor }}>{String(minutes).padStart(2, '0')}</p>
          <p className="text-[8px] leading-none mt-0.5" style={{ color: 'var(--muted)' }}>Min</p>
        </div>
        <div className="flex flex-col items-center min-w-0">
          <p className="text-xs sm:text-sm font-medium font-mono leading-none" style={{ color: accentColor }}>{String(seconds).padStart(2, '0')}</p>
          <p className="text-[8px] leading-none mt-0.5" style={{ color: 'var(--muted)' }}>Sec</p>
        </div>
      </div>
      <div className="text-[9px] mt-1.5 flex justify-center gap-2" style={{ color: 'var(--muted)' }}>
        <button onClick={() => { setPicking(true); setTempDate(examDate) }} className="underline opacity-50 hover:opacity-100">Change</button>
        <button onClick={() => setExamDate('')} className="underline opacity-50 hover:opacity-100">Reset</button>
      </div>
    </div>
  )
}
