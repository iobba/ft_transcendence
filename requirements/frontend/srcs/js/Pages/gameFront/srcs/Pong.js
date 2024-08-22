import * as THREE from "three";
import { OrbitControls } from "OrbitControls";
import { TextGeometry } from "TextGeometry";
import { FontLoader } from "FontLoader";
import { GLTFLoader } from "GLTFLoader";
import * as constants from "./constants.js";
import Coords from "./constants.js";
import notiWin from "./notiWin.js";
import control from "./control.js";

let coords;

class Pong {
  constructor(nbrOfPlayers, remote, parent) {
    this.nbrOfPlayers = nbrOfPlayers;
    coords = Coords(nbrOfPlayers);
    this.remote = remote;
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.parent = parent;
    this.renderer.setSize(parent.offsetWidth, parent.offsetHeight);
    parent.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.is_game_over = false;
    this.onGameEnd = null;
    this.players = null;
    this.counter = 0;
  }

  setup() {
    this.addCamera();
    this.addOrbitControl();
    this.addLight();
    this.addArena();
    this.addWalls();
    this.addPads();
    this.addBall();
    this.resize();
    this.resizeHandler();
    this.displayScore("bottom");
    this.displayScore("top");
    this.addScene();
    this.animate();
    if (this.remote === false) {
      control(this.parent, this.players[0], "#" + constants.PADS_COLOR["top"].toString(16), "start", "top", "left")
      control(this.parent, this.players[1], "#" + constants.PADS_COLOR["bottom"].toString(16), "end", "top", "a")
      this.addEventListener();
    }
  }

  animate() {
    this.renderer.render(this.scene, this.camera);
    this.controls.update();
    if (this.remote === false) {
      if (this.is_game_over === false) {
        this.moveBall();
        this.movePads("top");
        this.movePads("bottom");
        if (this.nbrOfPlayers > 2) {
          this.movePads("left");
          this.movePads("right");
        }
        this.checkForWinner()
      }
    }
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  resizeHandler() {
    this.camera.aspect = this.parent.offsetWidth / this.parent.offsetHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.parent.offsetWidth, this.parent.offsetHeight);
  }
  resize() {
    window.addEventListener("resize", () => this.resizeHandler());
  }

  addOrbitControl() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  addLight() {
    this.dirLight = new THREE.DirectionalLight(...constants.DIRECT_LIGHT_PROPS);
    this.dirLight.position.set(...constants.DIRECT_LIGHT_POS);
    this.ambientLight = new THREE.AmbientLight(
      ...constants.AMBIENT_LIGHT_PROPS
    );
    this.scene.add(this.dirLight, this.ambientLight);
  }

  addCamera() {
    this.camera = new THREE.PerspectiveCamera(...constants.CAMERA_PROPS);
    this.camera.position.set(...constants.CAMERA_POS);
    this.camera.lookAt(0, 0, 0);
    this.scene.add(this.camera);
  }

  addScene() {
    const loader = new GLTFLoader();
    loader.load(
      constants.SKY_MODEL_PATH,
      (gltf) => {
        this.scene.add(gltf.scene);
        gltf.scene.scale.set(4, 4, 4);
      },
      undefined,
      (error) => {
        console.log("model failed to load")
        return;
      }
    );
  }
  addArena() {
    this.arena = new THREE.Mesh(
      new THREE.BoxGeometry(...Object.values(coords.ARENA_DIMS)),
      new THREE.MeshStandardMaterial({ color: constants.ARENA_COLOR })
    );
    this.arena.position.y = coords.ARENA_Y_POS;
    this.scene.add(this.arena);

    let points = [];
    let vect = new THREE.Vector3(
      coords.ARENA_DIMS.x / 2 - 2,
      coords.ARENA_Y_POS + coords.ARENA_DIMS.y / 2 + 0.1,
      coords.ARENA_DIMS.z / 2 - 2
    );
    points.push(vect);
    points.push(new THREE.Vector3(vect.x, vect.y, -vect.z));
    points.push(new THREE.Vector3(-vect.x, vect.y, -vect.z));
    points.push(new THREE.Vector3(-vect.x, vect.y, vect.z));
    points.push(new THREE.Vector3(vect.x, vect.y, vect.z));
    let line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial()
    );
    this.scene.add(line);

    points = [];
    points.push(new THREE.Vector3(vect.x, vect.y, 0));
    points.push(new THREE.Vector3(-vect.x, vect.y, 0));
    line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial()
    );
    this.scene.add(line);
  }

  addWalls() {
    const wallMaterial = new THREE.MeshStandardMaterial(constants.WALL_PROPS);
    this.walls = {
      top: new THREE.Mesh(
        new THREE.BoxGeometry(
          coords.T_B_WALL_DIM.x,
          coords.T_B_WALL_DIM.y,
          coords.T_B_WALL_DIM.z
        ),
        wallMaterial
      ),
      right: new THREE.Mesh(
        new THREE.BoxGeometry(
          coords.L_R_WALL_DIM.x,
          coords.L_R_WALL_DIM.y,
          coords.L_R_WALL_DIM.z
        ),
        wallMaterial
      ),
      bottom: new THREE.Mesh(
        new THREE.BoxGeometry(
          coords.T_B_WALL_DIM.x,
          coords.T_B_WALL_DIM.y,
          coords.T_B_WALL_DIM.z
        ),
        wallMaterial
      ),
      left: new THREE.Mesh(
        new THREE.BoxGeometry(
          coords.L_R_WALL_DIM.x,
          coords.L_R_WALL_DIM.y,
          coords.L_R_WALL_DIM.z
        ),
        wallMaterial
      ),
    };
    this.walls.top.position.z = -coords.T_B_WALL_Z_POS;
    this.walls.bottom.position.z = coords.T_B_WALL_Z_POS;
    this.walls.left.position.x = -coords.L_R_WALL_X_POS;
    this.walls.right.position.x = coords.L_R_WALL_X_POS;
    Object.values(this.walls).map((wall) => {
      wall.position.y = coords.WALL_Y_POS;
      this.scene.add(wall);
    });
  }

  addPads() {
    const entries = Object.entries(constants.PADS_COLOR);
    this.pads = {};
    for (let i = 0; i < this.nbrOfPlayers; i++) {
      this.pads[entries[i][0]] = new THREE.Mesh(
        new THREE.BoxGeometry(...Object.values(coords.PAD_DIM)),
        new THREE.MeshStandardMaterial({ color: entries[i][1] })
      );
      this.pads[entries[i][0]].position.y = coords.PAD_Y_POS;
      this.pads[entries[i][0]].score = 0;
      this.pads[entries[i][0]].dir = 0;
      if (this.players)
        this.pads[entries[i][0]].player = this.players[i];
      this.scene.add(this.pads[entries[i][0]]);
    }
    this.pads.top.position.z = -coords.T_B_PAD_Z_POS;
    this.pads.bottom.position.z = coords.T_B_PAD_Z_POS;
    if (this.nbrOfPlayers > 2) {
      this.pads.left.position.x = -coords.L_R_PAD_X_POS;
      this.pads.right.position.x = coords.L_R_PAD_X_POS;
      this.pads.left.rotation.y = -(Math.PI / 2);
      this.pads.right.rotation.y = -(Math.PI / 2);
    }
  }

  addEventListener() {
    window.addEventListener("keydown", (e) => {
      if (e.which === 39) this.pads["top"].dir = 1;
      else if (e.which === 37) this.pads["top"].dir = -1;

      if (e.which === 68) this.pads["bottom"].dir = 1;
      else if (e.which === 65) this.pads["bottom"].dir = -1;

      if (this.nbrOfPlayers > 2) {
        if (e.which === 40) this.pads["left"].dir = 1;
        else if (e.which === 38) this.pads["left"].dir = -1;

        if (e.which === 83) this.pads["right"].dir = 1;
        else if (e.which === 87) this.pads["right"].dir = -1;
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.which === 39 || e.which === 37) this.pads["top"].dir = 0;
      if (e.which === 68 || e.which === 65) this.pads["bottom"].dir = 0;

      if (this.nbrOfPlayers > 2) {
        if (e.which === 40 || e.which === 38) this.pads["left"].dir = 0;
        if (e.which === 83 || e.which === 87) this.pads["right"].dir = 0;
      }
    });
  }

  displayScore(which) {
    if (this.pads[which].scoreMesh != undefined) {
      this.scene.remove(this.pads[which].scoreMesh);
    }
    let scoreText = this.pads[which].score.toString();
    let loader = new FontLoader();
    let textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    loader.load(constants.SCORE_FONT_PATH, (font) => {
      let textGeometry = new TextGeometry(scoreText, {
        font: font,
        size: 5,
        depth: 0.02,
      });
      this.pads[which].scoreMesh = new THREE.Mesh(textGeometry, textMaterial);
      this.scene.add(this.pads[which].scoreMesh);
      if (which == "top")
        this.pads[which].scoreMesh.position.set(
          0,
          coords.ARENA_Y_POS + coords.ARENA_DIMS.y / 2,
          -coords.ARENA_DIMS.z / 4 + 1.75
        );
      else
        this.pads[which].scoreMesh.position.set(
          -3.5,
          coords.ARENA_Y_POS + coords.ARENA_DIMS.y / 2,
          coords.ARENA_DIMS.z / 4 + 3.5
        );
      this.pads[which].scoreMesh.rotation.x = Math.PI * -0.5;
    });
  }

  checkHorPadColl() {
    let xDist;
    if (this.ball.position.z < 0)
      xDist = Math.abs(this.pads.top.position.x - this.ball.position.x);
    else xDist = Math.abs(this.pads.bottom.position.x - this.ball.position.x);
    const xColl = xDist <= coords.PAD_DIM.x / 2 + coords.BALL_DIM.x / 2;

    let zDist;
    let diff;
    if (this.ball.position.z < 0) {
      zDist = Math.abs(this.pads.top.position.z - this.ball.position.z);
      diff = this.pads.top.position.z < this.ball.position.z
    }
    else {
      zDist = Math.abs(this.pads.bottom.position.z - this.ball.position.z);
      diff = this.pads.bottom.position.z > this.ball.position.z;
    }
    const zMaxDist = coords.PAD_DIM.z / 2 + coords.BALL_DIM.z / 2
    const zColl = (zDist <= zMaxDist && zDist >= zMaxDist - 0.1) && diff;
    return xColl && zColl;
  }

  checkVerPadColl() {
    let xDist;
    let diff;
    if (this.ball.position.x < 0) {
      xDist = Math.abs(this.pads.left.position.x - this.ball.position.x);
      diff = this.ball.position.x > this.pads.left.position.x;
    }
    else {
      xDist = Math.abs(this.pads.right.position.x - this.ball.position.x);
      diff = this.ball.position.x < this.pads.right.position.x;
    }
    const xMaxDist = coords.PAD_DIM.z / 2 + coords.BALL_DIM.x / 2;
    const xColl = (xDist <= xMaxDist && xDist >= xMaxDist - 0.1) && diff;

    let zDist;
    if (this.ball.position.x < 0)
      zDist = Math.abs(this.pads.left.position.z - this.ball.position.z);
    else zDist = Math.abs(this.pads.right.position.z - this.ball.position.z);
    const zColl = zDist <= coords.PAD_DIM.x / 2 + coords.BALL_DIM.z / 2;
    return xColl && zColl;
  }

  checkHorWallColl() {
    let zDist;
    if (this.ball.position.z < 0)
      zDist = Math.abs(this.walls["top"].position.z - this.ball.position.z);
    else
      zDist = Math.abs(this.walls["bottom"].position.z - this.ball.position.z);
    if (zDist <= coords.T_B_WALL_DIM.z / 2 + coords.BALL_DIM.z / 2) {
      if (this.ball.position.z < 0) {
        // top wall is hit hence bottom player scored
        this.pads["bottom"].score += 1;
        this.displayScore("bottom");
      } else {
        // bottom wall is hit hence top player scored
        this.pads["top"].score += 1;
        this.displayScore("top");
      }
      if (this.nbrOfPlayers > 2) {
        // top and right vs bottom and left
        this.pads["right"].score = this.pads["top"].score;
        this.pads["left"].score = this.pads["bottom"].score;
      }
      return true;
    }
    return false;
  }

  checkVertWallColl() {
    let xDist;
    if (this.ball.position.x < 0)
      xDist = Math.abs(this.walls["left"].position.x - this.ball.position.x);
    else
      xDist = Math.abs(this.walls["right"].position.x - this.ball.position.x);
    if (xDist <= coords.L_R_WALL_DIM.x / 2 + coords.BALL_DIM.x / 2) {
      if (this.nbrOfPlayers > 2) {
        if (this.ball.position.x > 0) {
          // right wall is hit hence left player scored
          this.pads["left"].score += 1;
          this.pads["bottom"].score += 1;
          this.displayScore("bottom");
        } else {
          // left wall is hit hence right player scored
          this.pads["right"].score += 1;
          this.pads["top"].score += 1;
          this.displayScore("top");
        }
      }
      return true;
    }
    return false;
  }

  checkForWinner() {
    if (
      this.pads["top"].score === constants.WIN_SCORE ||
      this.pads["bottom"].score === constants.WIN_SCORE
    ) {
      let winner;
      let loser;
      if (this.pads["top"].score === constants.WIN_SCORE) {
        winner = {username: this.pads["top"].player, score: this.pads["top"].score};
        loser = { username: this.pads["bottom"].player, score: this.pads["bottom"].score };
      } else {
        winner = { username: this.pads["bottom"].player, score: this.pads["bottom"].score };
        loser = { username: this.pads["top"].player, score: this.pads["top"].score };
      }
      this.winner = winner.username;
      this.loser = loser.username;
      cancelAnimationFrame(this.animationId);
      this.is_game_over = true;
      if (this.onGameEnd) {
        notiWin(winner, loser, this.parent, this.onGameEnd);
      }
      else {
        notiWin(winner, loser, this.parent);
      }
    }
  }

  addBall() {
    this.ball = new THREE.Mesh(
      new THREE.BoxGeometry(
        coords.BALL_DIM.x,
        coords.BALL_DIM.y,
        coords.BALL_DIM.z
      ),
      new THREE.MeshStandardMaterial({ color: constants.BALL_COLOR })
    );
    this.ball.position.y = coords.ARENA_DIMS.y + coords.PAD_DIM.z / 2;
    this.scene.add(this.ball);
    this.ball.x_dir = 1;
    this.ball.z_dir = -1;
  }

  resetBall() {
    this.ball.position.x = this.ball.position.z = 0;
    this.counter++;
    const counter = this.counter % 4;
    switch (counter) {
      case 0:
        // Top-right corner
        this.ball.x_dir = 1;
        this.ball.z_dir = -1;
        console.log("Top-right corner")
        break;
      case 1:
        // Bottom-left corner
        this.ball.x_dir = -1;
        this.ball.z_dir = 1;
        console.log("Bottom-left corner")
        break;
      case 2:
        // Top-left corner
        this.ball.x_dir = -1;
        this.ball.z_dir = -1;
        console.log("Top-left corner")
        break;
      default:
        // Bottom-right corner
        this.ball.x_dir = 1;
        this.ball.z_dir = 1;
        console.log("Bottom-right corner")
        break;
    }
  }

  moveBall() {
    if (this.nbrOfPlayers > 2) {
      if (this.checkHorWallColl() || this.checkVertWallColl()) {
        return this.resetBall();
      }
      if (this.checkHorPadColl())
        this.ball.z_dir = this.ball.position.z < 0 ? 1 : -1;
      if (this.checkVerPadColl())
        this.ball.x_dir = this.ball.position.x < 0 ? 1 : -1;
    }
    else {
      if (this.checkHorWallColl()) {
        return this.resetBall();
      }
      if (this.checkVertWallColl())
        this.ball.x_dir = this.ball.position.x < 0 ? 1 : -1;
      if (this.checkHorPadColl())
        this.ball.z_dir = this.ball.position.z < 0 ? 1 : -1;
    }
    this.ball.position.x += this.ball.x_dir * constants.BALL_SPEED_X;
    this.ball.position.z += this.ball.z_dir * constants.BALL_SPEED_Z;
  }

  moveTopPad(padNewPos, topBottomXMax, leftRightZMax) {
    if (padNewPos > 0) {
      // ensure that the top pad dont move into the right pad
      if (this.nbrOfPlayers > 2) {
        if (leftRightZMax + this.pads["right"].position.z >= coords.PAD_DIM.z) {
          this.pads["top"].position.x = Math.min(padNewPos, topBottomXMax);
        } else {
          this.pads["top"].position.x = Math.min(
            padNewPos,
            topBottomXMax - coords.PAD_DIM.z
          );
        }
      }
      else {
        this.pads["top"].position.x = Math.min(padNewPos, topBottomXMax);
      }
    }
    else {
      if (this.nbrOfPlayers > 2) {
        if (leftRightZMax + this.pads["left"].position.z >= coords.PAD_DIM.z) {
          this.pads["top"].position.x = Math.max(padNewPos, -topBottomXMax);
        } else {
          this.pads["top"].position.x = Math.max(
            padNewPos,
            -topBottomXMax + coords.PAD_DIM.z
          );
        }
      }
      else {
        this.pads["top"].position.x = Math.max(padNewPos, -topBottomXMax);
      }
    }
  }

  moveBottomPad(padNewPos, topBottomXMax, leftRightZMax) {
    if (padNewPos > 0) {
      if (this.nbrOfPlayers > 2) {
        if (leftRightZMax - this.pads["right"].position.z >= coords.PAD_DIM.z) {
          this.pads["bottom"].position.x = Math.min(padNewPos, topBottomXMax);
        } else {
          this.pads["bottom"].position.x = Math.min(
            padNewPos,
            topBottomXMax - coords.PAD_DIM.z
          );
        }
      }
      else {
        this.pads["bottom"].position.x = Math.min(padNewPos, topBottomXMax);
      }
    } else {
      // ensure that the bottom pad dont move into the left pad
      if (this.nbrOfPlayers > 2) {
        if (leftRightZMax - this.pads["left"].position.z >= coords.PAD_DIM.z) {
          this.pads["bottom"].position.x = Math.max(padNewPos, -topBottomXMax);
        } else {
          this.pads["bottom"].position.x = Math.max(
            padNewPos,
            -topBottomXMax + coords.PAD_DIM.z
          );
        }
      } else {
        this.pads["bottom"].position.x = Math.max(padNewPos, -topBottomXMax);
      }
    }
  }

  moveRightPad(padNewPos, leftRightZMax, topBottomXMax) {
    if (padNewPos > 0) {
      // ensure that the right pad doesnt move into the bottom pad
      if (topBottomXMax - this.pads["bottom"].position.x >= coords.PAD_DIM.z) {
        this.pads["right"].position.z = Math.min(padNewPos, leftRightZMax);
      } else {
        this.pads["right"].position.z = Math.min(
          padNewPos,
          leftRightZMax - coords.PAD_DIM.z
        );
      }
    } else {
      // ensure that the right pad doesn't move into the top pad
      if (topBottomXMax - this.pads["top"].position.x >= coords.PAD_DIM.z) {
        this.pads["right"].position.z = Math.max(padNewPos, -leftRightZMax);
      } else {
        this.pads["right"].position.z = Math.max(
          padNewPos,
          -leftRightZMax + coords.PAD_DIM.z
        );
      }
    }
  }

  moveLeftPad(padNewPos, leftRightZMax, topBottomXMax) {
    if (padNewPos > 0) {
      // ensure that the left pad doesnt move into the bottom pad
      if (topBottomXMax + this.pads["bottom"].position.x >= coords.PAD_DIM.z) {
        this.pads["left"].position.z = Math.min(padNewPos, leftRightZMax);
      } else {
        this.pads["left"].position.z = Math.min(
          padNewPos,
          leftRightZMax - coords.PAD_DIM.z
        );
      }
    } else {
      // ensure that the left pad doesn't move into the top pad
      if (topBottomXMax + this.pads["top"].position.x >= coords.PAD_DIM.z) {
        this.pads["left"].position.z = Math.max(padNewPos, -leftRightZMax);
      } else {
        this.pads["left"].position.z = Math.max(
          padNewPos,
          -leftRightZMax + coords.PAD_DIM.z
        );
      }
    }
  }

  movePads(which) {
    if (!this.pads[which].dir) return;
    const topBottomXMax = coords.ARENA_DIMS.x / 2 - coords.PAD_DIM.x / 2;
    const leftRightZMax = coords.ARENA_DIMS.z / 2 - coords.PAD_DIM.x / 2;
    if (which === "top" || which === "bottom") {
      const padNewPos =
        this.pads[which].position.x +
        this.pads[which].dir * constants.PAD_SPEED;
      if (which === "top")
        this.moveTopPad(padNewPos, topBottomXMax, leftRightZMax);
      else this.moveBottomPad(padNewPos, topBottomXMax, leftRightZMax);
    } else {
      const padNewPos =
        this.pads[which].position.z +
        this.pads[which].dir * constants.PAD_SPEED;
      if (which === "right")
        this.moveRightPad(padNewPos, leftRightZMax, topBottomXMax);
      else this.moveLeftPad(padNewPos, leftRightZMax, topBottomXMax);
    }
  }

  updateBallPos(XPos, ZPos) {
    this.ball.position.x = XPos;
    this.ball.position.z = ZPos;
  }

  updateHorPadPos(which, PadPos) {
    this.pads[which].position.x = PadPos.x
  }

  updatePadPos(topPadPos, bottomPadPos) {
    this.pads.top.position.x = topPadPos;
    this.pads.bottom.position.x = bottomPadPos;
  }

  updateVertPadPos(which, padPos) {
    this.pads[which].position.z = padPos.z
  }

  updateScore(topScore, bottomScore) {
    this.pads.top.score = topScore;
    this.pads.bottom.score = bottomScore;
    this.displayScore("top");
    this.displayScore("bottom");
  }
}
export default Pong;
