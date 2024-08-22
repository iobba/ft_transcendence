from .coords_calculator import cal_coords


class QuadGame():
    def __init__(self, game_id):
        self.coords = cal_coords(4)
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
            "right": {
                "score": 0,
                "pad": {
                    "position": {
                        "x": self.coords["L_R_PAD_X_POS"],
                        "z": 0,
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
            },
            "left": {
                "score": 0,
                "pad": {
                    "position": {
                        "x": -self.coords["L_R_PAD_X_POS"],
                        "z": 0,
                    },
                    "dir": 0,
                }
            },
        }
        self.constants = {
            "PAD_SPEED": 0.3,
        }
        self.winner_team = None
        self.loser_team = None
        self.counter = 0
        self.interrupted = False

    def set_teams(self, team1, team2):
        self.players["top"]["id"] = team1[0]["id"]
        self.players["top"]["channel"] = team1[0]["channel"]
        self.players["top"]["token"] = team1[0]["token"]
        self.players["top"]["username"] = team1[0]["username"]

        self.players["right"]["id"] = team1[1]["id"]
        self.players["right"]["channel"] = team1[1]["channel"]
        self.players["right"]["token"] = team1[1]["token"]
        self.players["right"]["username"] = team1[1]["username"]

        self.players["bottom"]["id"] = team2[0]["id"]
        self.players["bottom"]["channel"] = team2[0]["channel"]
        self.players["bottom"]["token"] = team2[0]["token"]
        self.players["bottom"]["username"] = team2[0]["username"]

        self.players["left"]["id"] = team2[1]["id"]
        self.players["left"]["channel"] = team2[1]["channel"]
        self.players["left"]["token"] = team2[1]["token"]
        self.players["left"]["username"] = team2[1]["username"]

        self.team1 = [self.players['top'], self.players['right']]
        self.team2 = [self.players['bottom'], self.players['left']]

    def check_for_winner(self):
        if self.players["top"]["score"] == 7:
            self.winner_team = [
                self.players["top"],
                self.players["right"]
            ]
            self.loser_team = [
                self.players["bottom"],
                self.players["left"]
            ]
            return True
        elif self.players["bottom"]["score"] == 7:
            self.winner_team = [
                self.players["bottom"],
                self.players["left"]
            ]
            self.loser_team = [
                self.players["top"],
                self.players["right"]
            ]
            return True
        return False

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

    def check_vert_pad_coll(self):
        xDist = None
        diff = None
        if self.ball["position"]["x"] < 0:
            xDist = abs(self.players["left"]["pad"]
                        ["position"]["x"] - self.ball["position"]["x"])
            diff = self.ball["position"]["x"] > self.players["left"]["pad"]["position"]["x"]
        else:
            xDist = abs(self.players["right"]["pad"]
                        ["position"]["x"] - self.ball["position"]["x"])
            diff = self.ball["position"]["x"] < self.players["right"]["pad"]["position"]["x"]
        xMaxDist = self.coords["PAD_DIM"]["z"] / 2 + self.coords["BALL_DIM"]["x"] / 2
        xColl = (xDist <= xMaxDist and xDist >= xMaxDist - 0.3) and diff

        zDist = None
        if self.ball["position"]["x"] < 0:
            zDist = abs(self.players["left"]["pad"]
                        ["position"]["z"] - self.ball["position"]["z"])
        else:
            zDist = abs(self.players["right"]["pad"]
                        ["position"]["z"] - self.ball["position"]["z"])
        zColl = zDist <= self.coords["PAD_DIM"]["x"] / \
            2 + self.coords["BALL_DIM"]["z"] / 2
        return xColl and zColl

    def move_top_pad(self, pad_new_pos, top_bottom_x_max, left_right_z_max):
        if pad_new_pos > 0:
            if left_right_z_max + self.players["right"]["pad"]["position"]["z"] >= self.coords["PAD_DIM"]["z"]:
                self.players["top"]["pad"]["position"]["x"] = min(
                    pad_new_pos, top_bottom_x_max)
            else:
                self.players["top"]["pad"]["position"]["x"] = min(
                    pad_new_pos, top_bottom_x_max - self.coords["PAD_DIM"]["z"])
        else:
            if left_right_z_max + self.players["left"]["pad"]["position"]["z"] >= self.coords["PAD_DIM"]["z"]:
                self.players["top"]["pad"]["position"]["x"] = max(
                    pad_new_pos, -top_bottom_x_max)
            else:
                self.players["top"]["pad"]["position"]["x"] = max(
                    pad_new_pos, -top_bottom_x_max + self.coords["PAD_DIM"]["z"])

    def move_bottom_pad(self, pad_new_pos, top_bottom_x_max, left_right_z_max):
        if pad_new_pos > 0:
            if left_right_z_max - self.players["right"]["pad"]["position"]["z"] >= self.coords["PAD_DIM"]["z"]:
                self.players["bottom"]["pad"]["position"]["x"] = min(
                    pad_new_pos, top_bottom_x_max)
            else:
                self.players["bottom"]["pad"]["position"]["x"] = min(
                    pad_new_pos, top_bottom_x_max - self.coords["PAD_DIM"]["z"])
        else:
            if left_right_z_max - self.players["left"]["pad"]["position"]["z"] >= self.coords["PAD_DIM"]["z"]:
                self.players["bottom"]["pad"]["position"]["x"] = max(
                    pad_new_pos, -top_bottom_x_max)
            else:
                self.players["bottom"]["pad"]["position"]["x"] = max(
                    pad_new_pos, -top_bottom_x_max + self.coords["PAD_DIM"]["z"])

    def move_right_pad(self, pad_new_pos, left_right_z_max, top_bottom_x_max):
        if pad_new_pos > 0:
            if top_bottom_x_max - self.players["bottom"]["pad"]["position"]["x"] >= self.coords["PAD_DIM"]["z"]:
                self.players["right"]["pad"]["position"]["z"] = min(
                    pad_new_pos, left_right_z_max)
            else:
                self.players["right"]["pad"]["position"]["z"] = min(
                    pad_new_pos, left_right_z_max - self.coords["PAD_DIM"]["z"])
        else:
            if top_bottom_x_max - self.players["top"]["pad"]["position"]["x"] >= self.coords["PAD_DIM"]["z"]:
                self.players["right"]["pad"]["position"]["z"] = max(
                    pad_new_pos, -left_right_z_max)
            else:
                self.players["right"]["pad"]["position"]["z"] = max(
                    pad_new_pos, -left_right_z_max + self.coords["PAD_DIM"]["z"])

    def move_left_pad(self, pad_new_pos, left_right_z_max, top_bottom_x_max):
        if pad_new_pos > 0:
            if top_bottom_x_max + self.players["bottom"]["pad"]["position"]["x"] >= self.coords["PAD_DIM"]["z"]:
                self.players["left"]["pad"]["position"]["z"] = min(
                    pad_new_pos, left_right_z_max)
            else:
                self.players["left"]["pad"]["position"]["z"] = min(
                    pad_new_pos, left_right_z_max - self.coords["PAD_DIM"]["z"])
        else:
            if top_bottom_x_max + self.players["top"]["pad"]["position"]["x"] >= self.coords["PAD_DIM"]["z"]:
                self.players["left"]["pad"]["position"]["z"] = max(
                    pad_new_pos, -left_right_z_max)
            else:
                self.players["left"]["pad"]["position"]["z"] = max(
                    pad_new_pos, -left_right_z_max + self.coords["PAD_DIM"]["z"])

    def update_pad_position(self, which):
        if not self.players[which]["pad"]["dir"]:
            return
        top_bottom_x_max = self.coords["ARENA_DIMS"]["x"] / \
            2 - self.coords["PAD_DIM"]["x"] / 2
        left_right_z_max = self.coords["ARENA_DIMS"]["z"] / \
            2 - self.coords["PAD_DIM"]["x"] / 2
        if which in ["top", "bottom"]:
            pad_new_pos = self.players[which]["pad"]["position"]["x"] + \
                self.players[which]["pad"]["dir"] * self.constants["PAD_SPEED"]
            if which == "top":
                self.move_top_pad(
                    pad_new_pos, top_bottom_x_max, left_right_z_max)
            else:
                self.move_bottom_pad(
                    pad_new_pos, top_bottom_x_max, left_right_z_max)
        else:
            pad_new_pos = self.players[which]["pad"]["position"]["z"] + \
                self.players[which]["pad"]["dir"] * self.constants["PAD_SPEED"]
            if which == "right":
                self.move_right_pad(
                    pad_new_pos, left_right_z_max, top_bottom_x_max)
            else:
                self.move_left_pad(
                    pad_new_pos, left_right_z_max, top_bottom_x_max)

    def update_ball_position(self):
        if self.check_hor_pad_coll():
            self.ball["dir"]["z"] = 1 if self.ball["position"]["z"] < 0 else -1
        if self.check_vert_pad_coll():
            self.ball["dir"]["x"] = 1 if self.ball["position"]["x"] < 0 else -1
        self.ball["position"]["x"] += self.ball["velocity"]["x"] * \
            self.ball["dir"]["x"]
        self.ball["position"]["z"] += self.ball["velocity"]["z"] * \
            self.ball["dir"]["z"]

    def update_hor_score(self):
        if self.ball["position"]["z"] < 0:
            # top wall is hit hence bottom player has scored
            self.players["bottom"]["score"] += 1
            self.players["left"]["score"] += 1
        else:
            self.players["top"]["score"] += 1
            self.players["right"]["score"] += 1

    def update_vert_score(self):
        if self.ball["position"]["x"] < 0:
            # left wall is hit hence right player has scored
            self.players["right"]["score"] += 1
            self.players["top"]["score"] += 1
        else:
            # right wall is hit hence left player has scored
            self.players["left"]["score"] += 1
            self.players["bottom"]["score"] += 1

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