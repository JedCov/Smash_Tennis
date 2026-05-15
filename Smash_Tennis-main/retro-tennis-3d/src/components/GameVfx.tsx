import { useEffect, useState } from 'react';

type BurstStyle = 'ready' | 'smash' | 'miss' | 'recover';

type BurstMessage = {
  id: number;
  text: string;
  style: BurstStyle;
};

const EVENT_DURATION_MS = 650;

export function GameVfx() {
  const [flashId, setFlashId] = useState(0);
  const [shakeId, setShakeId] = useState(0);
  const [burst, setBurst] = useState<BurstMessage | null>(null);

  useEffect(() => {
    let burstTimeout: number | undefined;

    const showBurst = (text: string, style: BurstStyle) => {
      setBurst({ id: Date.now(), text, style });
      window.clearTimeout(burstTimeout);
      burstTimeout = window.setTimeout(() => setBurst(null), EVENT_DURATION_MS);
    };

    const showFlash = () => setFlashId((currentId) => currentId + 1);
    const showShake = () => setShakeId((currentId) => currentId + 1);

    const handleSmashOpportunity = () => showBurst('SMASH READY', 'ready');
    const handleSmashActivated = () => showBurst('SMASH!', 'smash');
    const handleSmashMissed = () => showBurst('MISSED!', 'miss');
    const handleWeakReturn = () => showBurst('RECOVERED!', 'recover');
    const handleOverheadSmashVfx = () => {
      showFlash();
      showShake();
    };

    window.addEventListener('smash:opportunity', handleSmashOpportunity);
    window.addEventListener('smash:activated', handleSmashActivated);
    window.addEventListener('smash:missed', handleSmashMissed);
    window.addEventListener('smash:weak-return', handleWeakReturn);
    window.addEventListener('vfx:overhead-smash', handleOverheadSmashVfx);

    return () => {
      window.clearTimeout(burstTimeout);
      window.removeEventListener('smash:opportunity', handleSmashOpportunity);
      window.removeEventListener('smash:activated', handleSmashActivated);
      window.removeEventListener('smash:missed', handleSmashMissed);
      window.removeEventListener('smash:weak-return', handleWeakReturn);
      window.removeEventListener('vfx:overhead-smash', handleOverheadSmashVfx);
    };
  }, []);

  return (
    <div className="game-vfx" aria-hidden="true">
      {flashId > 0 && <div key={`flash-${flashId}`} className="game-vfx__flash" />}
      {shakeId > 0 && <div key={`shake-${shakeId}`} className="game-vfx__shake" />}
      {burst && (
        <div key={burst.id} className={`game-vfx__burst game-vfx__burst--${burst.style}`}>
          {burst.text}
        </div>
      )}
    </div>
  );
}
