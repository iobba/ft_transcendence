def cal_coords(n):
    ARENA_DIMS = {"x": 15, "y": 1, "z": 25} if n == 2 else {"x": 25, "y": 1, "z": 25}

    coords = {
        "ARENA_DIMS": ARENA_DIMS
    }

    coords["ARENA_Y_POS"] = coords["ARENA_DIMS"]["y"] / 2

    T_B_WALL_DIM = {
        "x": coords["ARENA_DIMS"]["x"],
        "y": coords["ARENA_DIMS"]["y"] + 2,
        "z": 1
    }
    coords["T_B_WALL_DIM"] = T_B_WALL_DIM

    coords["T_B_WALL_Z_POS"] = coords["ARENA_DIMS"]["z"] / 2 + T_B_WALL_DIM["z"] / 2

    L_R_WALL_DIM = {
        "x": T_B_WALL_DIM["z"],
        "y": T_B_WALL_DIM["y"],
        "z": coords["ARENA_DIMS"]["z"] + T_B_WALL_DIM["z"] * 2
    }
    coords["L_R_WALL_DIM"] = L_R_WALL_DIM

    coords["L_R_WALL_X_POS"] = coords["ARENA_DIMS"]["x"] / 2 + L_R_WALL_DIM["x"] / 2

    coords["WALL_Y_POS"] = T_B_WALL_DIM["y"] / 2

    PAD_DIM = {
        "x": T_B_WALL_DIM["x"] / 4,
        "y": L_R_WALL_DIM["y"] - coords["ARENA_DIMS"]["y"],
        "z": T_B_WALL_DIM["z"]
    }
    coords["PAD_DIM"] = PAD_DIM

    coords["PAD_Y_POS"] = coords["ARENA_DIMS"]["y"] + PAD_DIM["y"] / 2

    coords["T_B_PAD_Z_POS"] = coords["ARENA_DIMS"]["z"] / 2 - PAD_DIM["z"] / 2

    coords["L_R_PAD_X_POS"] = coords["ARENA_DIMS"]["x"] / 2 - PAD_DIM["z"] / 2

    BALL_DIM = {
        "x": PAD_DIM["z"] / 2,
        "y": PAD_DIM["z"] / 2,
        "z": PAD_DIM["z"] / 2
    }
    coords["BALL_DIM"] = BALL_DIM

    return coords

