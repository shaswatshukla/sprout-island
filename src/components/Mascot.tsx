export type Pose = 'idle' | 'cheer' | 'think';

const limb = { stroke: 'var(--pip-dark)', strokeWidth: 8, strokeLinecap: 'round' as const, fill: 'none' };
const line = { stroke: 'var(--ink)', strokeWidth: 4, strokeLinecap: 'round' as const, fill: 'none' };

/** Pip, the original sprout mascot. */
export function Mascot({ pose = 'idle', size = 96 }: { pose?: Pose; size?: number }) {
  return (
    <svg className={`mascot mascot-${pose}`} width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      <path d="M60 36 V24" stroke="var(--leaf)" strokeWidth="5" strokeLinecap="round" />
      <path d="M60 26 C60 12 72 6 88 8 C86 22 74 28 60 26 Z" fill="var(--leaf)" />
      <path d="M60 28 C58 18 48 12 36 14 C38 24 48 30 60 28 Z" fill="var(--leaf)" opacity="0.8" />
      {pose === 'cheer' ? (
        <>
          <path d="M28 66 L12 44" {...limb} />
          <path d="M92 66 L108 44" {...limb} />
        </>
      ) : pose === 'think' ? (
        <>
          <path d="M26 78 L16 90" {...limb} />
          <path d="M92 76 Q100 92 78 92" {...limb} />
        </>
      ) : (
        <>
          <path d="M26 78 L16 90" {...limb} />
          <path d="M94 78 L104 90" {...limb} />
        </>
      )}
      <ellipse cx="60" cy="72" rx="38" ry="36" fill="var(--pip)" stroke="var(--pip-dark)" strokeWidth="4" />
      <circle cx="40" cy="82" r="6" fill="var(--cheek)" />
      <circle cx="80" cy="82" r="6" fill="var(--cheek)" />
      {pose === 'cheer' ? (
        <>
          <path d="M42 66 Q48 58 54 66" {...line} />
          <path d="M66 66 Q72 58 78 66" {...line} />
          <path d="M46 80 Q60 98 74 80 Z" fill="var(--ink)" />
        </>
      ) : pose === 'think' ? (
        <>
          <circle cx="51" cy="62" r="5" fill="var(--ink)" />
          <circle cx="75" cy="62" r="5" fill="var(--ink)" />
          <circle cx="66" cy="84" r="4" {...line} strokeWidth={3} />
        </>
      ) : (
        <>
          <circle cx="48" cy="66" r="5" fill="var(--ink)" />
          <circle cx="72" cy="66" r="5" fill="var(--ink)" />
          <path d="M50 80 Q60 90 70 80" {...line} />
        </>
      )}
    </svg>
  );
}
