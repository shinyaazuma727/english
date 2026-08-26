export const NEXT_DELAY_MS = 1000;
export const MASTERED_CORRECT_COUNT = 3;
export const MASTERED_REVIEW_RATIO = 0.25;
export const STORAGE_KEY = "kaku_words";
export const HISTORY_STORAGE_KEY = "kaku_history";
export const STATS_BATCH_SIZE = 10;
export const MAX_HISTORY_LENGTH = 2000;

// Phase2: tree growth is driven by cumulative answer count (blanks excluded).
export const LEARNING_STATS_STORAGE_KEY = "kaku_learning_stats";
export const TREE_GROWTH_STAGES = [0, 30, 100, 300, 700, 1500];
export const TREE_STAGE_LABELS = ["種", "芽", "小さな苗", "若木", "大きな木", "立派な木"];
