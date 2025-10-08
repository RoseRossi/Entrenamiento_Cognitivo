// Central configuration for Juego3 (Memory Game)
// Update these values to change game behavior without editing the main component

const JUEGO3_CONFIG = {
    // Level progression settings
    START_LEVEL: 1,              // Starting level
    MAX_LEVEL: 7,                // Maximum level (12 words)

    // Word count per level
    MIN_WORDS: 6,                // Words at level 1
    MAX_WORDS: 12,               // Words at max level
    WORDS_PER_LEVEL: 1,          // How many words to add per level (6, 7, 8, 9, 10, 11, 12)

    // Word display timing (in milliseconds)
    INITIAL_DISPLAY_TIME: 2000,  // Initial time to display each word (2 seconds)
    MIN_DISPLAY_TIME: 500,       // Minimum time to display each word (0.5 seconds)
    TIME_DECREASE_PER_LEVEL: 214, // How much to decrease time per level (~214ms per level to reach 500ms at level 7)

    // Selection phase timing (in seconds)
    INITIAL_SELECTION_TIMER: 25, // Initial time to select words (25 seconds)
    MIN_SELECTION_TIMER: 10,     // Minimum time to select words (10 seconds)
    SELECTION_TIME_DECREASE_PER_LEVEL: 2.14, // How much to decrease selection time per level (~2.14s per level)

    // Progression rules
    PASS_THRESHOLD: 0.5,         // Need 50% correct to pass to next level
    ROUNDS_PER_LEVEL: 3,         // Number of rounds to show words before selection

    // Distractor words pool
    DISTRACTOR_POOL_SIZE: 12,    // Number of distractor words available
    TOTAL_WORD_SEA: 24,          // Total words to show in selection (original + distractors)

    // Scoring
    FAIL_ON_TIMER_EXPIRY: true,  // If true, game ends when selection timer runs out
};

export default JUEGO3_CONFIG;
