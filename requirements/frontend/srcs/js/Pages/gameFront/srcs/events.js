export const gameEvents = Object.freeze({
    START: "start",
    BALL_UPDATE: "ball pos update",
    PAD_UPDATE: "pad pos update",
    SCORE_UPDATE: "score value update",
    L_KEY_PRESSED: "left key pressed",
    R_KEY_PRESSED: "right key pressed",
    U_KEY_PRESSED: "up key pressed",
    D_KEY_PRESSED: "down key pressed",
    GAME_OVER: "game over",
    WINNER: "winner",
    LOSER: "loser",
});

export const StatusCode = Object.freeze({
    INVALID_TOKEN: 4001,
    TOKEN_NOT_PROVIDED: 4002,
    FAILED_TO_FETCH_USER: 4003,
    IN_WAITING_QUEUE: 4004,
    HAS_RUNNING_GAME: 4005,
    UNAUTHENTICATED: 4006,
    ALREADY_JOINED: 4007,
    GAME_OVER: 4008,
});