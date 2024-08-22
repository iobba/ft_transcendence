import Pong from "./Pong.js";
import { gameEvents, StatusCode } from "./events.js";
import webSockets from "./webSocket.js";
import {PADS_COLOR} from "./constants.js";
import control from "./control.js";
import notiWin from "./notiWin.js";
import ParentPage from "../../ParentPage.js";

const URL = `wss://${location.host}/ws/quad-game`;
let ws;
let pong;


const quadPong = () => {
  ws = new WebSocket(URL);
  webSockets.push(ws);
  ws.onerror = (event) => handleSocketError(event);
  ws.onclose = (event) => handleSocketClosure(event);
  ws.onopen = () => handleSocketOpen();
  ws.onmessage = (event) => handleMessages(event); 
}

const handleSocketOpen = () => {
  document.querySelector("#content").innerHTML = "";
  pong = new Pong(4, true, document.querySelector("#content"));
  pong.setup();
}

const handleMessages = (event) => {
  const data = JSON.parse(event.data);
  const type = data.type;

  switch (type) {
    case gameEvents.START:
          const pad = data.pad;
          pong.players = data.players;
          const dir = (pad === "bottom" || pad === "top") ? 'left' : 'up';
          control(pong.parent, "", "#" + PADS_COLOR[pad].toString(16), 'start', 'top', dir);
          addEventListener("keydown", keyEventListener);
          break;
      case gameEvents.BALL_UPDATE:
          pong.updateBallPos(data.ballXPos, data.ballZPos)
          break;
      case gameEvents.PAD_UPDATE:
          const position = data.position
          const which = data.which
          if (which === "top" || which === "bottom")
            pong.updateHorPadPos(which, position);
          else
              pong.updateVertPadPos(which, position);
          break;
      case gameEvents.SCORE_UPDATE:
          const score = data.score;
          const ballPos = data.ballPos;
          pong.updateBallPos(ballPos.x, ballPos.z);
          pong.updateScore(score.top, score.bottom);
          break;
      case gameEvents.GAME_OVER:
          removeEventListener("keydown", keyEventListener);
          // TODO: notiWin should be updated to work for results of quad game
          notiWin(data.winnerTeam, data.loserTeam, pong.parent);
          break;
  }
};

const handleSocketError = (event) => {
  displayText("An error occurred: " + event.message);
  ws.close();
};

const handleSocketClosure = (event) => {
  if (event.code === StatusCode.ALREADY_JOINED)
      return ParentPage.appendAlert("You've already joined the game.");
  if (event.code === StatusCode.UNAUTHENTICATED)
      return ParentPage.appendAlert("You're not authenticated.");
  displayText("An error occurred")
};

const keyEventListener = (e) => {
  if (e.which === 39)
    ws.send(
      JSON.stringify({
        type: gameEvents.R_KEY_PRESSED,
      })
    );
  else if (e.which === 37)
    ws.send(
      JSON.stringify({
        type: gameEvents.L_KEY_PRESSED,
      })
    );
  else if (e.which === 38)
    ws.send(
      JSON.stringify({
        type: gameEvents.U_KEY_PRESSED,
      })
    );
  else if (e.which === 40)
    ws.send(
      JSON.stringify({
        type: gameEvents.D_KEY_PRESSED,
      })
    );

}


const displayText = (text) => {
  // TODO:
  console.log(text);
};
export { quadPong };
