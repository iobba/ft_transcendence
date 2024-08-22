import Pong from  "./Pong.js";
import { StatusCode, gameEvents } from "./events.js";
import webSocket from "./webSocket.js";
import notiWin from "./notiWin.js";
import {PADS_COLOR} from "./constants.js";
import control from "./control.js";
import ParentPage from "../../ParentPage.js";

const URL = `wss://${location.host}/ws/duo-game`
let ws;
let pong;


const duoPong = () => {
    ws = new WebSocket(URL);
    webSocket.push(ws);
    ws.onerror = (event) => handleSocketError(event);
    ws.onclose = (event) => handleSocketClosure(event);
    ws.onopen = () => handleSocketOpen();
    ws.onmessage = (event) => handleMessages(event); 
}

const handleSocketOpen = () => {
    document.querySelector("#content").innerHTML = "";
    pong = new Pong(2, true, document.querySelector("#content"));
    pong.setup();
}

const handleMessages = (event) => {
    const data = JSON.parse(event.data)
    const type = data.type

    switch (type) {
        case gameEvents.START:
            const pad = data.pad;
            pong.players = data.players;
            control(pong.parent, "", "#" + PADS_COLOR[pad].toString(16))
            addEventListener("keydown", keyEventListener);
            break;
        case gameEvents.BALL_UPDATE:
            pong.updateBallPos(data.ballXPos, data.ballZPos);
            break;
        case gameEvents.PAD_UPDATE:
            const position = data.position;
            const which = data.which;
            pong.updateHorPadPos(which, position);
            break;
        case gameEvents.SCORE_UPDATE:
            pong.updateBallPos(data.ballXPos, data.ballZPos);
            pong.updateScore(data.score.top, data.score.bottom);
            break;
        case gameEvents.GAME_OVER:
            removeEventListener("keydown", keyEventListener);
            notiWin(data.winner, data.loser, pong.parent);
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
        ws.send(JSON.stringify({
            type: gameEvents.R_KEY_PRESSED,
        }))
    else if (e.which === 37)
        ws.send(JSON.stringify({
            type: gameEvents.L_KEY_PRESSED,
        }))
}


const displayText = (text) => {
    // TODO:
    console.log(text);
};

export { duoPong }