import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Dot } from 'recharts';
import { calculateStats } from '../../utils/memoryAllocator';

export default function MemoryTimeline({ steps, currentStep, totalSize, onJumpToStep }) {
  const data = useMemo(() => {
    return steps.map((step, i) => {
      const stats = calculateStats(step.blocks, totalSize);
      return { stepIdx: i, used: stats.usedPercent, free: stats.freePercent, type: step.type };
    }).filter((d) => d.type !== 'scanning' && d.type !== 'scanning-fit');
  }, [steps, totalSize]);

  const currentX = data.reduce((best, d, i) => d.stepIdx <= currentStep ? i : best, 0);

  if (data.length < 2) return null;

  const CustomDot = (props) => {
    const { cx, cy, index } = props;
    const isActive = index === currentX;
    return <Dot cx={cx} cy={cy} r={isActive ? 6 : 3} fill={isActive ? '#6366f1' : 'transparent'} stroke={isActive ? '#6366f1' : 'transparent'} strokeWidth={2} />;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const d = data[label];
      return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs font-mono shadow-xl space-y-0.5">
          <p className="text-[10px] text-muted-foreground mb-1">Step {d?.stepIdx + 1} · click to jump</p>
          <p className="text-emerald-400">Used: {payload[0]?.value}%</p>
          <p className="text-muted-foreground">Free: {payload[1]?.value}%</p>
        </div>
      );
    }
    return null;
  };

  const handleClick = (chartData) => {
    if (!chartData?.activePayload || !onJumpToStep) return;
    const idx = chartData.activeTooltipIndex;
    if (idx != null && data[idx]) onJumpToStep(data[idx].stepIdx);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Allocation Timeline</h3>
        <span className="text-[10px] text-muted-foreground">click a point to jump</span>
      </div>
      <div className="h-28 cursor-pointer">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} onClick={handleClick}>
            <defs>
              <linearGradient id="colorUsed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
            <XAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} unit="%" />
            <Tooltip content={<CustomTooltip />} />
            {currentX >= 0 && (
              <ReferenceLine x={currentX} stroke="#6366f1" strokeWidth={1.5} strokeDasharray="4 2" opacity={0.6} />
            )}
            <Area type="monotone" dataKey="used" stroke="#6366f1" strokeWidth={2} fill="url(#colorUsed)"
              dot={<CustomDot />} activeDot={{ r: 5, fill: '#6366f1' }} />
            <Area type="monotone" dataKey="free" stroke="transparent" fill="transparent" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
