import { formatCurrency } from "@/lib/utils"
import { DollarSign } from "lucide-react"

interface RevenuePillProps {
  totalRevenue: number
  transactionCount: number
}

export function RevenuePill({ totalRevenue, transactionCount }: RevenuePillProps) {
  return (
    <div
      className="flex items-center gap-[14px] text-white"
      style={{ background: "#0b0b0f", borderRadius: "99px", padding: "12px 18px" }}
    >
      <div
        className="w-[38px] h-[38px] rounded-full bg-cr-blue-600 flex items-center justify-center shrink-0"
      >
        <DollarSign className="h-[18px] w-[18px] text-cr-black" strokeWidth={1.7} />
      </div>
      <div className="min-w-0">
        <div className="text-[22px] font-bold tracking-[-0.03em] leading-tight">
          {formatCurrency(totalRevenue, "USD", true)}{" "}
          <span className="text-[13px] font-medium text-cr-text-4">revenue</span>
        </div>
        <div className="text-[12px] text-cr-text-4">
          Last 30 days, {transactionCount} transaction{transactionCount !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  )
}
