// { id, username, avatar, score }

import global from "../../../index.js";

function notiWin(winner, losser, container, callback = () => global.singlePageApp.navigateTo('/game')) {
  let modal = document.createElement('div');

  modal.className = "modal fade show";
  modal.setAttribute('style', "display: block;");
  modal.setAttribute('tabindex', "-1");
  modal.setAttribute('aria-labelledby', "exampleModalLabel");
  modal.setAttribute('aria-hidden', "true");
  modal.setAttribute('role', "dialog");
  modal.setAttribute('tabindex', "-1");


  let winnerHTML = [];
  let winnerScore = 0;
  let losserHTML = [];
  let losserScore = 0;
  if (Array.isArray(winner)) {
    winner.forEach(item => {
      winnerHTML.push(`<div class="m-1"> @${item?.username} </div>`);
      winnerScore = item?.score;
    });
  }
  else {
    winnerHTML.push(`<div class="m-1"> @${winner?.username} </div>`);
    winnerScore = winner?.score;
  }

  if (Array.isArray(losser)) {
    losser.forEach(item => {
      losserHTML.push(`<div class="m-1"> @${item?.username} </div>`);
      losserScore = item?.score;
    });
  }
  else {
    losserHTML.push(`<div class="m-1"> @${losser?.username} </div>`);
    losserScore = losser?.score;
  }


  modal.innerHTML = (`
  <div class="modal-dialog">
    <div class="modal-content card text-center">
        <div class="card-header">
          <b>Match Result</b>
        </div>
        <div class="card-body">
          <div class="card-text d-flex mb-3 justify-content-between align-items-center gap-3">
              <div  style="width: 130px;">
                ${winnerHTML.join('\n')}
              </div>
              <div style="width: 100px; font-size: 2.5rem;"><strong class="text-success">${winnerScore}</strong>:<strong class="text-danger">${losserScore}</strong></div>
              <div style="width: 130px;">
                ${losserHTML.join('\n')}
              </div>
          </div>
        </div>
    </div>
  </div>
  `);

  container.appendChild(modal);

  let shadow = document.createElement('div');
  shadow.className = 'modal-backdrop fade show';
  container.appendChild(shadow);
  setTimeout(callback, 5000);
}

/*
notiWin({
  username: "abouramd",
  avatar: "https://image.lexica.art/full_jpg/a56cc359-8550-4666-af4f-40dbc502c054",
  score: 6
},
  {
    username: "iobba",
    avatar: "https://image.lexica.art/full_jpg/7515495b-982d-44d2-9931-5a8bbbf27532",
    score: 0
  },
  document.getElementById('body'));
  */

export default notiWin;
