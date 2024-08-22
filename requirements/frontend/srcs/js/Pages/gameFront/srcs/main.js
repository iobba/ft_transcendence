import { genElem } from "./utils.js";
import { duoPong } from "./remoteDuoPong.js";
import { quadPong } from "./remoteQuadPong.js";
import { soloPong } from "./localDuoPong.js";
import { localTournament } from "./localTournament.js";


const gameModeSelector = () => {
    const gameModeSelector = genElem("div", null,{id: "gameModeSelector", class: "d-flex flex-column gap-3"})
    gameModeSelector.append(
        genElem("div", "local duo Pong", {id: "solo-pong", class: "game-mode btn btn-primary"}),
        genElem("div", "remote duo Pong", {id: "duo-pong", class: "game-mode btn btn-primary"}),
        genElem("div", "remote quad Pong", {id: "quad-pong", class: "game-mode btn btn-primary"}),
        genElem("div", "tournament Pong", {id: "pong-local-tournament", class: "game-mode btn btn-primary"}),
    )
    document.querySelector("#content").append(gameModeSelector)
    document.querySelector("#solo-pong").addEventListener("click", soloPong)
    document.querySelector("#duo-pong").addEventListener("click", duoPong)
    document.querySelector("#quad-pong").addEventListener("click", quadPong)
    document.querySelector("#pong-local-tournament").addEventListener("click", localTournament)

}

export default gameModeSelector;