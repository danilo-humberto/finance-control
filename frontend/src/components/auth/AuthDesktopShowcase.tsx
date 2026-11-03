import { ShieldCheck } from 'lucide-react';

const chartBars = [
  { month: 'Ago', income: 48, expense: 32 },
  { month: 'Set', income: 76, expense: 56 },
  { month: 'Out', income: 62, expense: 42 },
  { month: 'Nov', income: 86, expense: 52 },
  { month: 'Dez', income: 44, expense: 60 },
];

const categories = ['Mercado', 'Assinaturas', 'Parcela 03/10'];

export function AuthDesktopShowcase() {
  return (
    <aside
      aria-hidden="true"
      className="relative hidden select-none flex-col items-center justify-center lg:flex"
    >
      {/* Ambient emerald glow behind the floating cards */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#19d86b]/15 blur-[110px]" />
      <div className="pointer-events-none absolute right-8 top-1/3 h-[260px] w-[260px] rounded-full bg-emerald-400/10 blur-[90px]" />

      {/* Floating Overlapping Cards Stage */}
      <div className="relative h-[470px] w-[520px] xl:w-[560px]">
        {/* Card 1: Top-Left "Fatura Atual" */}
        <div className="absolute left-0 top-0 z-10 w-[340px] rounded-[1.35rem] border border-white/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl xl:w-[360px]">
          <div className="flex items-center justify-between">
            <span className="text-[0.95rem] font-medium text-white/90">
              Fatura Atual
            </span>
            {/* Dual overlapping card circles icon */}
            <div className="flex items-center">
              <span className="h-5 w-5 rounded-full bg-white/30" />
              <span className="-ml-2 h-5 w-5 rounded-full bg-white/50" />
            </div>
          </div>

          <p className="mt-5 text-[2rem] font-bold leading-none tracking-tight text-white">
            R$ 3.420,50
          </p>

          {/* Progress Bar */}
          <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-white/15">
            <div className="h-full w-[56%] rounded-full bg-[#24e578] shadow-[0_0_14px_rgba(36,229,120,0.75)]" />
          </div>

          <p className="mt-2.5 text-[0.76rem] text-white/55">
            Progresso de R$ 5.000,00
          </p>
        </div>

        {/* Card 2: Overlapping Right "Receitas vs Despesas" Chart */}
        <div className="absolute right-0 top-[105px] z-30 w-[265px] rounded-[1.35rem] border border-white/20 bg-[linear-gradient(145deg,rgba(24,42,33,0.82),rgba(11,20,16,0.9))] p-5 shadow-[0_28px_70px_rgba(0,0,0,0.75)] backdrop-blur-2xl xl:w-[280px]">
          {/* Legend */}
          <div className="flex items-center gap-4 text-[0.8rem] font-medium">
            <span className="flex items-center gap-1.5 text-white/90">
              <span className="h-2.5 w-2.5 rounded-full bg-[#24e578] shadow-[0_0_8px_#24e578]" />
              Receitas
            </span>
            <span className="flex items-center gap-1.5 text-white/65">
              <span className="h-2.5 w-2.5 rounded-full bg-[#64748b]" />
              Despesas
            </span>
          </div>

          {/* Chart Plot Area */}
          <div className="relative mt-4 flex h-[148px] gap-2">
            {/* Y-Axis Labels */}
            <div className="flex flex-col justify-between pb-5 text-[0.65rem] text-white/45">
              <span>15</span>
              <span>10</span>
              <span>10</span>
              <span>0</span>
            </div>

            {/* Grid + Bars + SVG Overlay Lines */}
            <div className="relative flex-1 pb-5">
              {/* Horizontal Guide Lines */}
              <div className="pointer-events-none absolute inset-x-0 top-1 bottom-5 flex flex-col justify-between">
                <div className="h-px w-full bg-white/10" />
                <div className="h-px w-full bg-white/10" />
                <div className="h-px w-full bg-white/10" />
                <div className="h-px w-full bg-white/10" />
              </div>

              {/* SVG Trend Polyline (matching the mockup's connecting lines) */}
              <svg
                viewBox="0 0 200 110"
                className="pointer-events-none absolute inset-x-0 top-0 h-[120px] w-full overflow-visible"
                preserveAspectRatio="none"
              >
                {/* Expense secondary line */}
                <polyline
                  fill="none"
                  stroke="rgba(148, 163, 184, 0.45)"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="22,82 62,56 102,68 142,58 182,52"
                />
                {/* Income emerald line */}
                <polyline
                  fill="none"
                  stroke="rgba(36, 229, 120, 0.75)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="14,65 54,36 94,50 134,26 174,68"
                />
              </svg>

              {/* Bars */}
              <div className="relative z-10 flex h-full items-end justify-between px-1.5">
                {chartBars.map((bar) => (
                  <div
                    key={bar.month}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div className="flex h-[115px] items-end gap-1">
                      <div
                        style={{ height: `${bar.income}%` }}
                        className="w-2.5 rounded-t-full bg-gradient-to-t from-[#10b981] to-[#34f586] shadow-[0_0_12px_rgba(36,229,120,0.45)]"
                      />
                      <div
                        style={{ height: `${bar.expense}%` }}
                        className="w-2.5 rounded-t-full bg-gradient-to-t from-[#475569] to-[#64748b]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* X-Axis Labels */}
              <div className="mt-1.5 flex justify-between px-1 text-[0.62rem] text-white/50">
                {chartBars.map((bar) => (
                  <span key={bar.month} className="w-7 text-center">
                    {bar.month}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Bottom-Left "Transações / Categorizados" */}
        <div className="absolute bottom-2 left-6 z-20 w-[395px] rounded-[1.35rem] border border-white/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl xl:w-[415px]">
          <p className="text-[0.95rem] font-medium text-white/85">
            Transações
          </p>

          <p className="mt-9 text-[0.9rem] font-medium text-white/85">
            Categorizados
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            {categories.map((category) => (
              <span
                key={category}
                className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-[0.8rem] font-medium text-white/85 shadow-inner"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Floating Security Badge */}
      <div className="relative z-10 mt-6 inline-flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/[0.03] px-5 py-2.5 text-[0.8rem] text-white/70 shadow-lg backdrop-blur-md">
        <ShieldCheck className="h-4 w-4 text-white/80" />
        <span>Dados criptografados ponta a ponta</span>
      </div>
    </aside>
  );
}
