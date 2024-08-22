import Pong from "./Pong.js";
import ParentPage from "../../ParentPage.js";


let players;
let first_round_matches;
let second_round_matches;
let results;
let current_round;

const registerPlayer = () => {
  if (players.length === 4) {
    return ParentPage.appendAlert("you can't have more than four players, but you can start the tournament");
  }
  const playerNameInput = document.getElementById('playerName');
  const playerName = playerNameInput.value.trim();
  if (playerName) {
    if (players.includes(playerName)) {
      return ParentPage.appendAlert("player name already exists");
    }
    if (playerName.length > 10) {
      return ParentPage.appendAlert("player alias can't be longer than 10 characters");
    }
    players.push(playerName);
    updatePlayerList();
    playerNameInput.value = '';
  }
}

const updatePlayerList = () => {
  const playerList = document.getElementById('playerList');
  playerList.innerHTML = '';
  players.forEach((player, index) => {
    const li = document.createElement('li');
    li.textContent = `${index + 1}. ${player}`;
    li.className = "list-group-item";
    playerList.appendChild(li);
  });
}

const planFirstRoundMatches = () => {
  if (players.length < 4) {
    return ParentPage.appendAlert("you must have four players before starting");
  }
  first_round_matches = [];
  for (let i = 0; i < players.length; i += 2) {
    if (i + 1 < players.length) {
      first_round_matches.push([players[i], players[i + 1]]);
    }
  }
  displayTournamentBracket(() => {
    startMatch(first_round_matches, 0);
  });
  document.querySelector("#round-1").children[1].children[0].innerText = first_round_matches[0][0];
  document.querySelector("#round-1").children[1].children[1].innerText = first_round_matches[0][1];
  document.querySelector("#round-1").children[2].children[0].innerText = first_round_matches[1][0];
  document.querySelector("#round-1").children[2].children[1].innerText = first_round_matches[1][1];
}

const startMatch = (matches, match_index) => {
  console.log(matches, match_index, current_round);
  const startCurrentMatch = () => {
    document.querySelector('#content').innerHTML = ''
    const match = new Pong(2, false, document.querySelector('#content'));
    match.players = matches[match_index];
    match.onGameEnd = () => {
      // all matches of a round have eneded
      if (current_round === 0) {
        second_round_matches[0][match_index] = match.winner;
        second_round_matches[1][match_index] = match.loser;
      }
      else {
        results[match_index][0] = match.winner;
        results[match_index][1] = match.loser;
      }
      if (match_index === 1) {
        if (current_round === 1) {
          displayTournamentBracket(null);
          return;
        }
        match_index = 0;
        current_round += 1;
        displayTournamentBracket(() => {
          startMatch(second_round_matches, 0);
        });
        return;
      }
      startMatch(matches, match_index + 1);
    };
    match.setup();
  };
  displayCurrentMatch(matches[match_index], startCurrentMatch);
}

const displayCurrentMatch = (match, eventHandler) => {
  document.querySelector("#content").innerHTML = `
        <div class="matchup d-flex align-items-center flex-column">
            <div class="round-data d-flex justify-content-around">
                <div class="player player1">${match[0]}</div>
                <div class="vs">VS</div>
                <div class="player player2">${match[1]}</div>   
            </div>
            <button class="btn btn-primary" id="startMatchBtn">Start Match</button>
        </div>
    `;
  document.querySelector('#startMatchBtn').addEventListener('click', eventHandler);
}

const displayTournamentBracket = (eventHandler = null) => {
  document.querySelector('#content').innerHTML = `
    <div class="bracket d-flex flex-column align-items-center gap-2" style="overflow-y: auto;min-width: 100%; min-height:100%; max-height:100%; height:100%;">
        <div class="d-flex justify-content-around gap-2" style="width: 100%; flex-wrap: wrap;">
            <!-- First Round -->
            <div class="round round-1 d-flex flex-column gap-3" id="round-1">
                <div class="round-title">First Round</div>
                <div class="matchup">
                    <div class="team">${first_round_matches[0][0]}</div>
                    <div class="team">${first_round_matches[0][1]}</div>
                </div>
                <div class="matchup">
                    <div class="team">${first_round_matches[1][0]}</div>
                    <div class="team">${first_round_matches[1][1]}</div>
                </div>
            </div>

            <!-- Second Round -->
            <div class="round round-2 d-flex flex-column gap-3" id="round-2">
                <div class="round-title">Second Round</div>
                <div class="matchup">
                    <div class="team empty">${second_round_matches[0][0]}</div>
                    <div class="team empty">${second_round_matches[0][1]}</div>
                </div>
                <div class="matchup">
                    <div class="team empty">${second_round_matches[1][0]}</div>
                    <div class="team empty">${second_round_matches[1][1]}</div>
                </div>
            </div>

            <!-- Results -->
            <div class="round round-3 d-flex flex-column gap-3" id="results">
                <div class="round-title">Final Results</div>
                <div class="matchup">
                    <div class="team empty">${results[0][0]}</div>
                    <div class="team empty">${results[0][1]}</div>
                    <div class="team empty">${results[1][0]}</div>
                    <div class="team empty">${results[1][1]}</div>
                </div>
            </div>
        </div>
        <!-- Start Round -->
        ${eventHandler ? '<button id="startRoundBtn" class="btn btn-primary">Start Round</button>' : ''}
    </div>
    `;
  if (eventHandler)
    document.querySelector('#startRoundBtn').addEventListener('click', eventHandler);
}

const displayRegisterForm = () => {
  document.querySelector("#content").innerHTML = `
    <div id="registration" class="d-flex flex-column gap-2">
        <h2>Register Players</h2>
        <div class="form-floating">
            <input type="text" id="playerName" placeholder="Enter player alias" class="form-control">
            <label for="playerName">player alias</label>
        </div>
        <button class="btn btn-primary" style="width: 100%" id="registerBtn">Register</button>
        <ul class="list-group" id="playerList"></ul>
        <button class="btn btn-primary" style="width: 100%" id="startTournamentBtn" id="startTournamentButton">Start Tournament</button>
    </div>
    `;
  document.querySelector("#registerBtn").addEventListener("click", registerPlayer);
  document.querySelector("#startTournamentBtn").addEventListener("click", planFirstRoundMatches);
}

const localTournament = () => {
  players = [];
  first_round_matches = [['Player 1', 'Player 2'], ['Player 3', 'Player 4']];
  second_round_matches = [['Winner of Match 1', 'Winner of Match 2'], ['Loser of Match 1', 'Loser of Match 2']];
  results = [['Winner of Final', 'Runner Up'], ['3rd Place', '4th Place']];
  current_round = 0;
  displayRegisterForm();
};

export { localTournament }; 
