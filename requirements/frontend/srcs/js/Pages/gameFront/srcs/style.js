function addTournamentStyles() {
    const style = document.createElement('style');
    style.id = 'tournament-styles';
    style.innerHTML = `
        #content {
            background-color: #222;
            color: #f5f5f5;
            font-family: 'Roboto', sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }

        #tournament {
            width: 800px;
            background-color: #333;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        }

        .round {
            margin-bottom: 30px;
        }

        .round h2 {
            text-align: center;
            font-size: 26px;
            color: #ff9800;
            margin-bottom: 20px;
            text-transform: uppercase;
        }

        .matchup {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #444;
            border-radius: 8px;
            margin-bottom: 15px;
            padding: 15px 20px;
            transition: transform 0.3s ease;
        }

        .matchup:hover {
            transform: scale(1.05);
        }

        .player {
            width: 45%;
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            padding: 10px;
            background-color: #555;
            border-radius: 5px;
            transition: background-color 0.3s ease;
        }

        .player.player1 {
            background-color: #3f51b5;
        }

        .player.player2 {
            background-color: #e91e63;
        }

        .player:hover {
            background-color: #ff9800;
        }

        .vs {
            font-size: 18px;
            color: #ddd;
        }
    `;
    document.head.appendChild(style);
}

function removeTournamentStyles() {
    const style = document.getElementById('tournament-styles');
    if (style) {
        document.head.removeChild(style);
    }
}


export {
    addTournamentStyles,
    removeTournamentStyles,
}
