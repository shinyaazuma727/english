import styles from "./TreeIllustration.module.css";

type CanopyCircle = { cx: number; cy: number; r: number };

type StageConfig = {
  seed: boolean;
  trunkHeight: number;
  trunkWidth: number;
  canopy: CanopyCircle[];
  sprout: boolean;
  flowers: number;
};

const GROUND_Y = 168;

const STAGE_CONFIG: StageConfig[] = [
  { seed: true, trunkHeight: 0, trunkWidth: 0, canopy: [], sprout: false, flowers: 0 },
  { seed: false, trunkHeight: 18, trunkWidth: 5, canopy: [], sprout: true, flowers: 0 },
  {
    seed: false,
    trunkHeight: 40,
    trunkWidth: 6,
    canopy: [{ cx: 100, cy: 118, r: 22 }],
    sprout: false,
    flowers: 0,
  },
  {
    seed: false,
    trunkHeight: 55,
    trunkWidth: 8,
    canopy: [
      { cx: 100, cy: 103, r: 28 },
      { cx: 78, cy: 112, r: 17 },
      { cx: 122, cy: 112, r: 17 },
    ],
    sprout: false,
    flowers: 0,
  },
  {
    seed: false,
    trunkHeight: 68,
    trunkWidth: 10,
    canopy: [
      { cx: 100, cy: 88, r: 36 },
      { cx: 70, cy: 100, r: 23 },
      { cx: 130, cy: 100, r: 23 },
      { cx: 100, cy: 62, r: 20 },
    ],
    sprout: false,
    flowers: 0,
  },
  {
    seed: false,
    trunkHeight: 68,
    trunkWidth: 10,
    canopy: [
      { cx: 100, cy: 88, r: 36 },
      { cx: 70, cy: 100, r: 23 },
      { cx: 130, cy: 100, r: 23 },
      { cx: 100, cy: 62, r: 20 },
    ],
    sprout: false,
    flowers: 9,
  },
];

const FLOWER_POSITIONS = [
  { x: 78, y: 78 },
  { x: 122, y: 78 },
  { x: 100, y: 58 },
  { x: 62, y: 96 },
  { x: 138, y: 96 },
  { x: 90, y: 108 },
  { x: 112, y: 108 },
  { x: 100, y: 92 },
  { x: 84, y: 66 },
];

type TreeIllustrationProps = {
  stage: number;
  progress: number;
};

export function TreeIllustration({ stage, progress }: TreeIllustrationProps) {
  const config = STAGE_CONFIG[Math.min(stage, STAGE_CONFIG.length - 1)];
  const ringRadius = 92;
  const circumference = 2 * Math.PI * ringRadius;
  const clampedProgress = Math.max(0, Math.min(1, progress));

  return (
    <div className={styles.wrap}>
      <svg className={styles.ring} viewBox="0 0 200 200" aria-hidden="true">
        <circle
          cx="100"
          cy="100"
          r={ringRadius}
          fill="none"
          stroke="var(--color-surface)"
          strokeWidth="8"
        />
        <circle
          cx="100"
          cy="100"
          r={ringRadius}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clampedProgress)}
          transform="rotate(-90 100 100)"
        />
      </svg>

      <svg key={stage} className={styles.tree} viewBox="0 0 200 180" role="img" aria-label="学習の木">
        <ellipse cx="100" cy={GROUND_Y + 4} rx="46" ry="6" fill="var(--color-surface)" />

        {config.seed && <ellipse cx="100" cy={GROUND_Y - 3} rx="7" ry="5" fill="var(--color-tree-trunk)" />}

        {!config.seed && config.trunkHeight > 0 && (
          <rect
            x={100 - config.trunkWidth / 2}
            y={GROUND_Y - config.trunkHeight}
            width={config.trunkWidth}
            height={config.trunkHeight}
            rx={config.trunkWidth / 2}
            fill="var(--color-tree-trunk)"
          />
        )}

        {config.sprout && (
          <>
            <ellipse cx="90" cy={GROUND_Y - 16} rx="9" ry="5" fill="var(--color-correct)" transform="rotate(-25 90 152)" />
            <ellipse cx="110" cy={GROUND_Y - 16} rx="9" ry="5" fill="var(--color-correct)" transform="rotate(25 110 152)" />
          </>
        )}

        {config.canopy.map((circle, index) => (
          <circle key={index} cx={circle.cx} cy={circle.cy} r={circle.r} fill="var(--color-correct)" />
        ))}

        {config.flowers > 0 &&
          FLOWER_POSITIONS.slice(0, config.flowers).map((pos, index) => (
            <circle key={index} cx={pos.x} cy={pos.y} r="4" fill="var(--color-tree-flower)" />
          ))}
      </svg>
    </div>
  );
}
