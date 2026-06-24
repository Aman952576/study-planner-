import { useState, useEffect } from 'react'

export default function LiveClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const hh = String(time.getHours()).padStart(2, '0')
  const mm = String(time.getMinutes()).padStart(2, '0')
  const ss = String(time.getSeconds()).padStart(2, '0')

  return (
    <div className="rounded-xl p-3 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <p className="text-[10px] font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>LIVE CLOCK</p>
      <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-mono font-medium tracking-wider leading-tight" style={{ color: 'var(--fg)' }}>
        {hh}:{mm}:<span style={{ color: 'var(--accent)' }}>{ss}</span>
      </p>
      <p className="text-[10px] mt-1.5" style={{ color: 'var(--muted)' }}>
        {days[time.getDay()]}, {months[time.getMonth()]} {time.getDate()}, {time.getFullYear()}
      </p>
    </div>
  )
}
