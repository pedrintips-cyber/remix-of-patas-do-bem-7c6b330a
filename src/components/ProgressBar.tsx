interface ProgressBarProps {
  current: number;
  goal: number;
  height?: string;
  showLabel?: boolean;
}

const ProgressBar = ({ current, goal, height = 'h-3', showLabel = true }: ProgressBarProps) => {
  const percentage = Math.min(Math.round((current / goal) * 100), 100);

  return (
    <div className="w-full">
      <div className={`w-full overflow-hidden rounded-full bg-accent ${height}`}>
        <div
          className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold text-primary">{percentage}%</span>
          <span>R$ {current.toLocaleString('pt-BR')} / R$ {goal.toLocaleString('pt-BR')}</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
