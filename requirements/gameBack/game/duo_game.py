from .coords_calculator import cal_coords


class DuoGame():
    def __init__(self, game_id):
        self.coords = cal_coords(2)
        self.game_id = game_id
        self.started = False
        self.is_over = False
        self.ball = {
            "position": {
                "x": 0,
                "z": 0,
            },
            "velocity": {
                "x": 0.2,
                "z": 0.3,
            },
            "dir": {
                "x": 1,
                "z": 1,
            }
        }
        self.players = {
            "top": {
                "score": 0,
                "pad": {
                    "position": {
                        "x": 0,
                        "z": -self.coords["T_B_PAD_Z_POS"],
                    },
                    "dir": 0,
                }
            },
            "bottom": {
                "score": 0,
                "pad": {
                    "position": {
                        "x": 0,
                        "z": self.coords["T_B_PAD_Z_POS"],
                    },
                    "dir": 0,
                }
            }
        }
        self.constants = {
            "PAD_SPEED": 0.3,
        }
        self.winner = None
        self.loser = None
        self._type = None
        self.counter = 0
        self.interrupted = False

    def set_players(self, player1, player2):
        self.players["top"]["id"] = player1["id"]
        self.players["top"]["channel"] = player1["channel"]
        self.players["top"]["token"] = player1["token"]
        self.players["top"]["username"] = player1["username"]

        self.players["bottom"]["id"] = player2["id"]
        self.players["bottom"]["channel"] = player2["channel"]
        self.players["bottom"]["token"] = player2["token"]
        self.players["bottom"]["username"] = player2["username"]

    def check_hor_wall_coll(self):
        zdist = None
        if self.ball["position"]["z"] < 0:
            zdist = abs(-self.coords["T_B_WALL_Z_POS"] -
                        self.ball["position"]["z"])
        else:
            zdist = abs(self.coords["T_B_WALL_Z_POS"] -
                        self.ball["position"]["z"])
        if zdist <= (self.coords["T_B_WALL_DIM"]["z"] + self.coords["BALL_DIM"]["z"]) / 2:
            return True
        return False

    def check_vert_wall_coll(self):
        xDist = None
        if self.ball["position"]["x"] < 0:
            xDist = abs(-self.coords["L_R_WALL_X_POS"] -
                        self.ball["position"]["x"])
        else:
            xDist = abs(self.coords["L_R_WALL_X_POS"] -
                        self.ball["position"]["x"])
        if xDist <= self.coords["L_R_WALL_DIM"]["x"] / 2 + self.coords["BALL_DIM"]["x"] / 2:
            return True
        return False

    def check_hor_pad_coll(self):
        xDist = None
        if self.ball["position"]["z"] < 0:
            xDist = abs(self.players["top"]["pad"]["position"]
                        ["x"] - self.ball["position"]["x"])
        else:
            xDist = abs(self.players["bottom"]["pad"]
                        ["position"]["x"] - self.ball["position"]["x"])
        xColl = xDist <= self.coords["PAD_DIM"]["x"] / \
            2 + self.coords["BALL_DIM"]["x"] / 2
        
        zDist = None
        diff = None
        if self.ball["position"]["z"] < 0:
            zDist = abs(self.players["top"]["pad"]["position"]
                        ["z"] - self.ball["position"]["z"])
            diff = self.players["top"]["pad"]["position"]["z"] < self.ball["position"]["z"]
        else:
            zDist = abs(self.players["bottom"]["pad"]
                        ["position"]["z"] - self.ball["position"]["z"])
            diff = self.players["bottom"]["pad"]["position"]["z"] > self.ball["position"]["z"]
        zMaxDist = self.coords["PAD_DIM"]["z"] / 2 + self.coords["BALL_DIM"]["z"] / 2
        zColl = (zDist <= zMaxDist and zDist >= zMaxDist - 0.3) and diff
        return xColl and zColl

    def update_ball_position(self):
        if self.check_vert_wall_coll():
            self.ball["dir"]["x"] = 1 if self.ball["position"]["x"] < 0 else -1
        if self.check_hor_pad_coll():
            self.ball["dir"]["z"] = 1 if self.ball["position"]["z"] < 0 else -1
        self.ball["position"]["x"] += self.ball["velocity"]["x"] * \
            self.ball["dir"]["x"]
        self.ball["position"]["z"] += self.ball["velocity"]["z"] * \
            self.ball["dir"]["z"]

    def update_pad_position(self, which):
        pad_new_pos = self.players[which]["pad"]["position"]["x"] + \
            self.players[which]["pad"]["dir"] * self.constants["PAD_SPEED"]
        if pad_new_pos > 0:
            self.players[which]["pad"]["position"]["x"] = min(
                pad_new_pos, (self.coords["ARENA_DIMS"]["x"] / 2 - self.coords["PAD_DIM"]["x"] / 2))
        else:
            self.players[which]["pad"]["position"]["x"] = max(
                pad_new_pos, -(self.coords["ARENA_DIMS"]["x"] / 2 - self.coords["PAD_DIM"]["x"] / 2))

    def update_score(self):
        if self.ball["position"]["z"] < 0:
            self.players["bottom"]["score"] += 1
        else:
            self.players["top"]["score"] += 1

    def check_for_winner(self):
        if self.players["top"]["score"] == 7:
            self.winner = self.players["top"]
            self.loser = self.players["bottom"]
            return True
        elif self.players["bottom"]["score"] == 7:
            self.winner = self.players["bottom"]
            self.loser = self.players["top"]
            return True
        return False
    
    def reset_ball(self):
        self.ball["position"]["x"] = self.ball["position"]["z"] = 0
        self.counter += 1
        rem = self.counter % 4
        if rem == 0:
            #  Top-right corner
            self.ball["dir"]["x"] = 1
            self.ball["dir"]["z"] = -1
        elif rem == 1:
            # Bottom-left corner
            self.ball["dir"]["x"] = -1
            self.ball["dir"]["z"] = 1
        elif rem == 2:
            # Top-left corner
            self.ball["dir"]["x"] = -1
            self.ball["dir"]["z"] = -1
        else:
            # 
            self.ball["dir"]["x"] = 1
            self.ball["dir"]["z"] = 1
