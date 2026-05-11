import useTimer from '../../hooks/useTimer';

const Timer = ({ totalSeconds, storageKey, onExpire }) => {
  const { formatted, isWarning, isDanger } = useTimer(totalSeconds, storageKey, onExpire);

  const cls = isDanger ? 'danger' : isWarning ? 'warning' : '';

  return (
    <div className={`timer ${cls}`}>
      <span>⏱</span>
      <span>{formatted}</span>
    </div>
  );
};

export default Timer;
