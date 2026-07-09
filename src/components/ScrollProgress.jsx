import { useScrollProgress } from '../hooks/useScrollProgress.js';

export default function ScrollProgress() {
  const progress = useScrollProgress();
  return <div className="scroll-progress" style={{ width: `${progress}%` }} aria-hidden="true" />;
}
