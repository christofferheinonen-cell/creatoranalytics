import Link from "next/link"

interface SetupStep {
  label: string
  done: boolean
  href: string
}

interface SetupProgressProps {
  steps: SetupStep[]
}

function GaugeMeter({ percent }: { percent: number }) {
  const n = 33
  const ticks = []
  for (let i = 0; i < n; i++) {
    const frac = i / (n - 1)
    const on = frac <= percent / 100
    ticks.push({
      deg: -90 + frac * 180,
      len: on ? 22 : 14,
      color: on ? "#abc4ff" : "#e6ecf8",
    })
  }

  const doneCount = Math.round((percent / 100) * n)

  return (
    <div className="flex justify-center mt-[14px]">
      <div className="relative" style={{ width: "224px", height: "126px" }}>
        {ticks.map((t, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: "50%",
              bottom: 0,
              width: "3px",
              height: "112px",
              marginLeft: "-1.5px",
              transformOrigin: "50% 100%",
              transform: `rotate(${t.deg}deg)`,
            }}
          >
            <div
              style={{
                width: "3px",
                height: `${t.len}px`,
                borderRadius: "99px",
                background: t.color,
              }}
            />
          </div>
        ))}
        <div
          className="absolute left-0 right-0 bottom-0 flex items-end justify-center gap-[2px]"
        >
          <span className="text-[44px] font-bold tracking-[-0.045em] leading-none text-cr-black">
            {Math.round(percent)}
          </span>
          <span className="text-[18px] font-semibold text-cr-text-3 mb-1">%</span>
        </div>
      </div>
    </div>
  )
}

export function SetupProgress({ steps }: SetupProgressProps) {
  const doneCount = steps.filter((s) => s.done).length
  const percent = steps.length > 0 ? (doneCount / steps.length) * 100 : 0

  return (
    <div
      className="flex flex-col"
      style={{ border: "1px solid #edf2fb", borderRadius: "26px", padding: "20px" }}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-[16px] font-bold tracking-[-0.02em] text-cr-black m-0">
            Your setup
          </h3>
          <p className="text-[13px] text-cr-text-3 mt-[5px] mb-0">Current plan: Starter</p>
        </div>
      </div>

      <GaugeMeter percent={percent} />
      <p className="text-center text-[13px] text-cr-text-3 mt-[10px]">
        {doneCount} of {steps.length} setup steps complete
      </p>

      <div
        className="flex flex-col gap-[2px] mt-[14px]"
        style={{ borderTop: "1px solid #f2f5fb", paddingTop: "10px" }}
      >
        {steps.map((step) => (
          <div key={step.label} className="flex items-center gap-[10px] py-2">
            {step.done ? (
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" fill="#abc4ff" />
                <path
                  d="m6.4 10.2 2.4 2.4 4.8-5"
                  stroke="#0b0b0f"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#dde4f2" strokeWidth="1.6">
                <circle cx="10" cy="10" r="8.2" />
              </svg>
            )}
            <span
              className={
                step.done
                  ? "text-[13.5px] text-cr-text-4 line-through"
                  : "text-[13.5px] font-semibold text-cr-black"
              }
            >
              {step.label}
            </span>
            {!step.done && (
              <Link
                href={step.href}
                className="ml-auto text-[12.5px] font-semibold text-cr-black hover:bg-cr-blue-100 transition-colors"
                style={{
                  border: "1px solid #dfe6f4",
                  borderRadius: "99px",
                  padding: "4px 11px",
                }}
              >
                Start
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
