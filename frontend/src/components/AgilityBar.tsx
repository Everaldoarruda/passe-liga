function barColor(agility: number) {
  if (agility >= 80) return 'bg-green-600';
  if (agility <= 30) return 'bg-red-500';
  return 'bg-gray-400';
}

function AgilityBar({ agility }: { agility: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 text-right">{agility}</span>
      <div className="h-1 w-10 rounded bg-gray-200">
        <div className={`h-1 rounded ${barColor(agility)}`} style={{ width: `${agility}%` }} />
      </div>
    </div>
  );
}

export default AgilityBar;
