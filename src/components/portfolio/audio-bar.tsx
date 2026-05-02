export function AudioBar() {
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[1, 2, 3, 4, 5].map(i => (
        <div
          key={i}
          className={`audio-bar w-1 rounded-sm bg-indigo-600`}
          style={{
            height: `${[60, 100, 40, 80, 50][i - 1]}%`,
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  )
}
