export const HALF_PI = Math.PI / 2

/** ------------------ PATHS --------------------- **/

export const SKY_MODEL_PATH = "/js/Pages/gameFront/models/sky/scene.gltf"

export const SCORE_FONT_PATH = "/js/Pages/gameFront/fonts/Sedgwick Ave_Regular.json"

/** ------------------ KEYS -------------------- **/

export const ARROW_KEYS= Object.freeze({
    up : 38,
    down: 40,
    lower: 37,
    upper: 39
})

export const CHAR_KEYS = Object.freeze({
    up : 87,
    down: 83,
    lower: 65,
    upper: 68
})


/** ------------------ Basic scene setup -------------------- **/


export const CAMERA_PROPS = [
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000 
]

export const CAMERA_POS = [10, 10, 20]

export const DIRECT_LIGHT_PROPS = [0xffffff, 0.5]

export const AMBIENT_LIGHT_PROPS = [0xffffff, 0.5]
   
export const DIRECT_LIGHT_POS = [3, 5, 8]



/** ------------------ COLORS -------------------- **/

export const ARENA_COLOR = 0xc17850

export const WALL_PROPS = {
    color: 0xffffff,
    opacity: 0.8,
    transparent: true,
}

export const PADS_COLOR = Object.freeze({
    top: 0xa93226,
    bottom: 0x1a5276,
    left: 0x196F3D,
    right:  0xE0FC2E
})

export const BALL_COLOR = 0x196f3d


/** ----------------- SPEEDS ------------------------- **/
export const BALL_SPEED_X = 0.05
export const BALL_SPEED_Z = 0.1
export const PAD_SPEED = 0.2
export const WIN_SCORE = 7

/** ------------------ ARENA && its objects coords -------------------- **/

export default (n) => {
    const ARENA_DIMS = n === 2 ? {x: 15, y: 1, z: 25} : {x:25, y: 1, z: 25}

    let coords = {
        ARENA_DIMS
    }

    coords.ARENA_Y_POS = coords.ARENA_DIMS.y / 2
    
    coords.T_B_WALL_DIM = Object.freeze({
        x: coords.ARENA_DIMS.x,
        y: coords.ARENA_DIMS.y + 2,
        z: 1
    })
    
    coords.T_B_WALL_Z_POS = coords.ARENA_DIMS.z / 2 + coords.T_B_WALL_DIM.z / 2
    
    
    coords.L_R_WALL_DIM = Object.freeze({
        x: coords.T_B_WALL_DIM.z,
        y: coords.T_B_WALL_DIM.y,
        z: coords.ARENA_DIMS.z + coords.T_B_WALL_DIM.z * 2
    })
    
    coords.L_R_WALL_X_POS = coords.ARENA_DIMS.x / 2 + coords.L_R_WALL_DIM.x / 2
    
    coords.WALL_Y_POS = coords.T_B_WALL_DIM.y / 2

    coords.PAD_DIM = Object.freeze({
        x: coords.T_B_WALL_DIM.x / 4,
        y: coords.L_R_WALL_DIM.y - coords.ARENA_DIMS.y,
        z: coords.T_B_WALL_DIM.z
    })
    
    coords.PAD_Y_POS = coords.ARENA_DIMS.y + coords.PAD_DIM.y / 2
    
    coords.T_B_PAD_Z_POS = coords.ARENA_DIMS.z / 2 - coords.PAD_DIM.z / 2
    
    coords.L_R_PAD_X_POS = coords.ARENA_DIMS.x / 2 - coords.PAD_DIM.z / 2
    
    coords.BALL_DIM = Object.freeze({
        x: coords.PAD_DIM.z / 2,
        y: coords.PAD_DIM.z / 2,
        z: coords.PAD_DIM.z / 2
    })

    return coords
}