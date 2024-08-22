import global from "../index.js";
import ParentPage from "./ParentPage.js";

export default class ProfilePage extends ParentPage {

  constructor() {
    super('Profile');
    this.locationList = [`home`, `profile`];
    this.hasAToken = true;
    this.needToken = true;
    this.isMe = true;
    this.isFreind = true;
    this.isBlock = true;
  }

  percentage(partialValue, totalValue) {
    if (totalValue == 0)
      return 0;
    return Math.round((100 * partialValue) / totalValue);
  }

  createProgress() {
    let listProgress = [];
    let index = Math.min(this.data?.matches?.length, 10);
    if (index === 0)
      return `<h5 class="position-absolute top-0">No Matches!!!</h5>`;

    const winscore = 8;
    while (index-- && this.data?.matches) {
      let perc = 0;
      let color = ``;
      if (this.data?.matches[index]?.win) {
        color = 'success';
        perc = 50 + this.percentage(this.data?.matches[index]?.winnerScore - this.data?.matches[index]?.loserScore, winscore * 2);
      }
      else {
        color = 'danger';
        perc = 50 - this.percentage(this.data?.matches[index]?.winnerScore - this.data?.matches[index]?.loserScore, winscore * 2);
      }

      listProgress.push(`<div class="bar bg-${color}" style="height: ${perc}%;"></div>`);
    }
    return listProgress.join('\n');
  }

  matchHistory() {

    let listMH = [];

    if (!this?.data?.matches?.length)
      return `<h5>No Matches!!!</h5>`;
    for (let item of this?.data?.matches) {

      let winnerHTML = [];
      let losserHTML = [];

      if (Array.isArray(item?.winners)) {
        item?.winners?.forEach(item => {
          winnerHTML.push(`
          <a href="/user?id=${item?.id}" local-link >
            <!-- <img src="/img/profile.jpg" class="rounded m-2" alt="abouramd"> -->
            <h5 class="card-title">${item?.firstName} ${item?.lastName}</h5>
            <p class="card-text"><small class="text-body-seondary">@${item?.username}</small></p>
          </a>
            `);
        });
      }

      if (Array.isArray(item?.losers)) {
        item?.losers?.forEach(item => {
          losserHTML.push(`
          <a href="/user?id=${item?.id}" local-link >
              <!-- <img src="/img/profile.jpg" class="rounded m-2" alt="abouramd"> -->
                <h5 class="card-title">${item?.firstName} ${item?.lastName}</h5>
                <p class="card-text"><small class="text-body-secondary">@${item?.username}</small></p>
            </a>
            `);
        });
      }

      console.log("item", item);
      listMH.push(`
          <div class= "card game-card container-fluid p-3 text-center" >
          <div class="row">
            
            <div class="d-flex flex-column col winner gap-3">
              ${winnerHTML.join('\n')}
            </div>

            <div class="col score">
              ${item?.winnerScore} - ${item?.loserScore}
            </div>

            <div class="d-flex flex-column col losser gap-3">
              ${losserHTML.join('\n')}
            </div>
            
          </div>
      </div > `);

    }
    return listMH.join('\n');
  }
  friends() {

    let listF = [];

    console.log(this.data);

    for (let item of this?.data?.friends) {
      listF.push(`
      <a href="/user?id=${item?.id}" local-link class="card mb-1 freind-card">
        <img src="${item?.avatar}" class="rounded m-2" alt="abouramd">
        <h5 class="card-title">${item?.firstName} ${item?.lastName}</h5>
        <p class="card-text"><small class="text-body-secondary">@${item?.username}</small></p>
        <div class='card-score'>${item?.totalScore}</div>
      </a>`);

    }
    return listF.join('\n');
  }

  changeInProfile() {

    if (this.isMe)
      return `
      <a href="/setting" type="button" class="btn btn-primary" style="--bs-primary: var(--bs-body-bg);min-width: 150px;" local-link>Edit profile</a>
      <button type="button" class="btn btn-primary" id="deleteprofile-button" style="--bs-primary: var(--bs-body-bg);min-width: 150px;" data-bs-toggle="modal" data-bs-target="#deleteprofile">Delete profile</button>

      <!-- Modal -->  
      <div class="modal fade" id="deleteprofile" tabindex="-1" aria-labelledby="deleteprofile" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="exampleModalLabel">Delete Account</h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div> 
            <form id="delete-account">
              <div class="modal-body">
                <p>Enter this word <q id="random-word">WORD</q>.</p>
                <div class="form-floating">
                  <input type="text" class="form-control"  id="check-word" name="check-word" placeholder="Secret Word">
                  <label for="check-word">Secret Word</label>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="submit" class="btn btn-primary">Delete account</button>
              </div>
            </form>
          </div>
        </div>
      </div>`;

    return `
      <button type="button" id="freind-button" class="btn btn-primary" style="--bs-primary: var(--bs-body-bg);min-width: 150px;" local-link>${this.isFreind ? 'Unfreind' : 'Add Freind'}</a>
      <button type="button" id="block-button" class="btn btn-primary" style="--bs-primary: var(--bs-body-bg);min-width: 150px;" local-link>${this.isBlock ? 'Unblock' : 'block'}</a>
      `;
    ;
  }
  /**
    * create card body 
    */
  createCardBody() {
    return `
      <div class="container-fluid align-items-center justify-content-center">
        <div class="row mb-3">
          <div class="col d-flex flex-column" style="border-radius: 20px;min-height: 300px;">
            <div class="d-flex justify-content-center align-items-center" style="overflow: hidden; border-radius: 20px;height: 400px;">
              <div class="rotate-img"></div>
            </div>
            <div class="position-relative bg-primary d-flex justify-content-center align-items-center" style="margin-top: -25px;border-radius: 20px; min-height: 125px;">
              <div class="container-fluid">
                <div class="row mb-3">
                  <div class="col d-flex justify-content-center align-items-center flex-column">
                    <div class="bg-danger position-relative" style="margin-top: -120px;border-radius: 20px; min-height: 150px; min-width: 150px; height: 150px; width: 150px;">
                      <img src="${this?.data?.avatar}" class="rounded img-thumbnail" style="width: 100%; height: 100%;" alt="profile image">
                      <span class="position-absolute top-0 start-100 translate-middle p-2 bg-${this?.data?.isActive || this.isMe ? 'success' : 'danger'} border border-light rounded-circle">
                        <span class="visually-hidden"> status: ${this?.data?.isActive || this.isMe ? 'online' : 'offline'} </span >
                      </span >
                    </div >
                    <h5>${this?.data?.firstName} ${this?.data?.lastName}</h5>
                    <h5 class="opacity-75">@${this?.data?.username}</h5>
                  </div >
                </div >
                <div class="row p-2">
                  <div class="col d-flex justify-content-center align-items-center flex-column" style="min-width: 300px;">
                    <span class="">totale games</span>
                    <h3 class="">${this?.data?.wins?.length + this?.data?.losses?.length}</h3>
                  </div>
                  <div class="col d-flex justify-content-center align-items-center flex-column" style="min-width: 300px;">
                    <span class="">Score</span> 
                    <h3 class="">${this?.data?.totalScore}</h3>
                  </div> 
                  <div class="col d-flex justify-content-center align-items-center flex-column" style="min-width: 300px;">
                    <span class="">win</span> 
                    <h3 class="">${this.percentage(this?.data?.wins?.length, this?.data?.wins?.length + this?.data?.losses?.length)}%</h3>
                  </div>
                  <div class="col d-flex justify-content-center align-items-center flex-column" style="min-width: 300px;">
                    <span class="">loss</span> 
                    <h3 class="">${this.percentage(this?.data?.losses?.length, this?.data?.wins?.length + this?.data?.losses?.length)}%</h3>
                  </div>  
                </div>  
                <hr>  
                <div class="row p-2">  
                  <div class="col d-flex justify-content-center align-items-center gap-2 flex-wrap mb-3" style="min-width: 300px;"> 
                  ${this.changeInProfile()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="row gap-3 mb-3">
          <div class="col" style="min-width: 300px; min-height: 300px;">
            <div class="card text-bg-primary" style="width: 100%; height: 100%;">
              <div class="card-body">
                <h4 class="card-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-person-fill" viewBox="0 0 16 16">
                    <path d="M12 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2m-1 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0m-3 4c2.623 0 4.146.826 5 1.755V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-1.245C3.854 11.825 5.377 11 8 11"/>
                  </svg>
                  About
                </h4>
                <hr/>
                <p class="card-text">${this?.data?.bio}</p>
              </div>
            </div>
          </div>
          <div class="col" style="min-width: 300px; min-height: 300px;">


            <div class="card text-bg-primary" style="width: 100%; height: 100%;">
              <div class="card-body">
                <h4 class="card-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bar-chart-line-fill" viewBox="0 0 16 16">
                    <path d="M11 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h1V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7h1z"/>
                  </svg>
                  progress
                </h4>
                <hr/>
                <div class="my-graph position-relative">
                  ${this.createProgress()}
                </div>
              </div>
            </div>
          
          </div>
          <!-- <div class="col" style="background: red; min-width: 300px; min-height: 300px;">col</div> -->
        </div>
        <div class="row mb-3">
          <div class="col" style="min-width: 300px; min-height: 300px; max-height: 600px;">
            <div class="card text-bg-primary" style="width: 100%; height: 100%;">
              <div class="card-body">
                <h4 class="card-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hourglass-split" viewBox="0 0 16 16">
                    <path d="M2.5 15a.5.5 0 1 1 0-1h1v-1a4.5 4.5 0 0 1 2.557-4.06c.29-.139.443-.377.443-.59v-.7c0-.213-.154-.451-.443-.59A4.5 4.5 0 0 1 3.5 3V2h-1a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-1v1a4.5 4.5 0 0 1-2.557 4.06c-.29.139-.443.377-.443.59v.7c0 .213.154.451.443.59A4.5 4.5 0 0 1 12.5 13v1h1a.5.5 0 0 1 0 1zm2-13v1c0 .537.12 1.045.337 1.5h6.326c.216-.455.337-.963.337-1.5V2zm3 6.35c0 .701-.478 1.236-1.011 1.492A3.5 3.5 0 0 0 4.5 13s.866-1.299 3-1.48zm1 0v3.17c2.134.181 3 1.48 3 1.48a3.5 3.5 0 0 0-1.989-3.158C8.978 9.586 8.5 9.052 8.5 8.351z"/>
                  </svg>
                  Game History
                </h4>
                <hr/>
                <div style="max-height: 500px; overflow: auto;">
                  ${this.matchHistory()}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="row mb-3">
          <div class="col" style="min-width: 300px; min-height: 300px; max-height: 600px;">
            <div class="card text-bg-primary" style="width: 100%; height: 100%;">
              <div class="card-body">
                <h4 class="card-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-people-fill" viewBox="0 0 16 16">
                    <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
                  </svg>
                  Freinds
                </h4>
                <hr/>
                <div style="max-height: 500px; overflow: auto;">
                  ${this.friends()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div > `;
  }

  async getId() {

    let freinds = [];
    let block = [];
    this.request.body = JSON.stringify({
      query: `query ($token: String!) {
  userByToken(token: $token) {
    id
    profile {
      id
      friends {
        id
      }
      blockedFriends {
        id
      }
    }
  }
}`,
      variables: {
        token: `${ParentPage.getCookie('token')}`
      },
    });


    let responce = await fetch(this.back_api, this.request);

    if (responce?.ok) {
      let jsonBody = await responce?.json();

      if (jsonBody?.data?.userByToken) {
        this.id = jsonBody?.data?.userByToken?.id;
        console.log(jsonBody?.data?.userByToken?.profile);
        let freinds = jsonBody?.data?.userByToken?.profile?.friends;
        console.log(freinds);
        let block = jsonBody?.data?.userByToken?.profile?.blockedFriends;
        console.log(block);
        this.checkIsMeOrIsFreind(this.id, freinds, block);
      }
      else {
        console.log(jsonBody);
        throw { message: `backend failed :(` };
      }
    }
    else {

      throw { message: `backend failed ${responce.status} ` };
    }
  }

  checkIsMeOrIsFreind(id, freinds, block) { }

  /**
  * request Data
  */

  async requestData() {

    await this.getId();

    this.request.body = JSON.stringify({
      query: `query ($id: ID!) {
  userById(userId: $id) {
    id
    profile {
      id
      username
      firstName
      lastName
      avatar
      bio
      isActive
      totalScore
      friends {
        id
        firstName
        lastName
        username
        avatar
        totalScore
      }
      
      wins 
      
      losses 
    }
  } 
} `,
      variables: {
        id: this.id
      },
    });

    /*
    wins {
      datePlayed
      id
      winner {
        id
        firstName
        lastName
        username
      }       
      winnerScore
      loser {
        id
        firstName
        lastName
        username
      }
      loserScore
    }
    
    losses {
      datePlayed
      id
      winner {
        id
        firstName
        lastName
        username
      }       
      winnerScore
      loser {
        id
        firstName
        lastName
        username
      }
      loserScore
    }
  
  */




    let responce = await fetch(this.back_api, this.request);

    if (responce?.ok) {
      let jsonBody = await responce?.json();

      if (jsonBody?.data?.userById?.profile) {
        this.data = jsonBody?.data?.userById?.profile;
        let ids = [...this?.data?.wins, ...this?.data?.losses];
        // for (let i = 0; i < this?.data?.wins?.length; i++) { this.data.wins[i] = { id: this?.data?.wins[i], win: true }; }
        // for (let i = 0; i < this?.data?.losses?.length; i++) { this.data.losses[i] = { id: this?.data?.losses[i], win: false }; }

        let matches = await this.getMatchesByIds(ids);

        console.log(matches);

        for (let i = 0; i < this?.data?.wins?.length; i++) {
          this.data.wins[i] = matches.get(Number(this?.data?.wins[i]));
          this.data.wins[i].win = true;
        }
        for (let i = 0; i < this?.data?.losses?.length; i++) {
          console.log(this.data.losses[i]);
          this.data.losses[i] = matches.get(Number(this?.data?.losses[i]));
          console.log(this.data.losses[i]);
          this.data.losses[i].win = false;
        }

        this.data.matches = this.data?.wins?.concat(this.data?.losses).sort((a, b) => {
          if (a.datePlayed > b.datePlayed)
            return -1;
          if (b.datePlayed > a.datePlayed)
            return 1;
          return 0;
        });
        console.log(this.data.matches);
        this.locationList[2] = (this.data?.username);
        // console.log(this.data);
      }
      else {
        console.log(jsonBody);
        throw { message: `User not found`, redirect: true, redirectTo: '/home' };
      }
    }
    else {

      throw { message: `backend failed ${responce.status} ` };
    }


  }

  async getMatchesByIds(ids) {
    this.request.body = JSON.stringify({
      query: `query ($ids: [ID]!){
  matchesByIds(ids: $ids)
  {
    id
    winnerScore
    loserScore
    winners
    losers
    datePlayed
  }
}`,
      variables: {
        ids: ids
      },
    });

    let responce = await fetch("/api/matches", this.request);

    if (responce?.ok) {
      let jsonBody = await responce?.json();

      if (jsonBody?.data?.matchesByIds) {
        const matches = jsonBody?.data?.matchesByIds;
        const playersIds = [];
        for (let i = 0; i < matches?.length; i++) {
          for (let PId of matches[i]?.winners) playersIds.push(PId);
          for (let PId of matches[i]?.losers) playersIds.push(PId);
        }

        let players = await this.getPlayers(playersIds);

        let matchIds = new Map;

        for (let i = 0; i < matches?.length; i++) {
          for (let j = 0; j < matches[i]?.winners?.length; j++) {
            if (players.has((matches[i]?.winners[j])))
              matches[i].winners[j] = players.get((matches[i]?.winners[j]));
            else 
              matches[i].winners[j] = {id: -1, username: null, firstName: 'NOT', lastName: 'FOUND'};
          }
          for (let j = 0; j < matches[i]?.losers?.length; j++) {
            if (players.has((matches[i]?.losers[j])))
              matches[i].losers[j] = players.get((matches[i]?.losers[j]));
            else
              matches[i].losers[j] = {id: -1, username: null, firstName: 'NOT', lastName: 'FOUND'};
          }
          matchIds.set(Number(matches[i].id), matches[i]);
        }
        return matchIds;
      }
      else {
        console.log(jsonBody);
        throw { message: `failed to get matchesByIds`, redirect: true, redirectTo: '/home' };
      }
    }
    else {

      throw { message: `backend failed ${responce.status} ` };
    }
  }

  async getPlayers(playersIds) {
    this.request.body = JSON.stringify({
      query: `query ($ids: [ID]!){
  usersByIds(ids: $ids){
   id
    profile {
      username
      firstName
      lastName
    }
  }
}`,
      variables: {
        ids: playersIds
      },
    });

    let responce = await fetch(this.back_api, this.request);

    if (responce?.ok) {
      let jsonBody = await responce?.json();

      if (jsonBody?.data?.usersByIds) {
        let users = jsonBody?.data?.usersByIds;
        let playesData = new Map;
        for (let i = 0; i < users?.length; i++) {
          playesData.set(Number(users[i]?.id), {
            id: users[i]?.id,
            username: users[i]?.profile?.username,
            firstName: users[i]?.profile?.firstName,
            lastName: users[i]?.profile?.lastName,
          });
        }
        return playesData;
      }
      else {
        console.log(jsonBody);
        throw { message: `failed to get userByIds`, redirect: true, redirectTo: '/home' };
      }
    }
    else {

      throw { message: `backend failed ${responce.status} ` };
    }
  }

  async deleteAccountForm(event) {
    let userData = {};
    for (let item of event?.target) {
      userData[item.name] = item.value;
    }

    let word = userData['check-word'];

    if (word !== this.rondomWord) {
      ParentPage.appendAlert(`Wrong Secret Word.`);
      return;
    }

    this.request.body = JSON.stringify({
      query: `mutation($token: String!) {
  deleteProfile(token: $token) {
    success
    message
  }
} `,
      variables: {
        token: `${ParentPage.getCookie('token')}`,
      },
    });

    let responce = await fetch(this.back_api, this.request);

    if (responce?.ok) {
      let jsonBody = await responce?.json();

      if (jsonBody?.data?.deleteProfile?.success === true) {
        await global.singlePageApp.navigateTo('/sign-in');
        ParentPage.appendAlert(`${jsonBody?.data?.deleteProfile?.message} `, "success");
      }
      else {
        ParentPage.appendAlert(`failed to delete account ${jsonBody?.data?.deleteProfile?.message} `);
      }

    }
    else
      ParentPage.appendAlert(`backend failed ${responce.status}`);

  }

  /**
   * addEventListener all
   */
  async addEventListener() {
    super.addEventListener();
    let rondomWordId = document.getElementById('random-word');
    if (rondomWordId) {
      document.getElementById(`deleteprofile-button`)?.addEventListener('click', () => {
        let alphabets = [];
        for (let i = 97; i <= 122; i++) {
          alphabets.push(String.fromCharCode(i));
          alphabets.push(String.fromCharCode(i).toUpperCase());
        }
        this.rondomWord = '';
        for (let i = 0; i < 6; i++) {
          this.rondomWord += alphabets[Math.floor(Math.random() * alphabets.length)];
        }

        rondomWordId.textContent = this.rondomWord;
      });
    }

    let clickOndelete = document.getElementById('delete-account');
    if (clickOndelete) {
      clickOndelete.addEventListener('submit', (event) => {
        event.preventDefault();
        this.deleteAccountForm(event);
      });
    }

    let clickOnFreind = document.getElementById('freind-button');
    if (clickOnFreind) {
      clickOnFreind.addEventListener('click', async (event) => {
        event.preventDefault();

        if (this.isFreind)
          await this.removeFreind();
        else
          await this.addFreind();

        clickOnFreind.textContent = this.isFreind ? 'Unfreind' : 'Add Freind';
      });
    }

    let clickOnBlock = document.getElementById('block-button');
    if (clickOnBlock) {
      clickOnBlock.addEventListener('click', async (event) => {
        event.preventDefault();

        if (this.isBlock)
          await this.unblockUser();
        else
          await this.blockUser();

        console.log(this.isFreind, this.isBlock);
        clickOnFreind.textContent = this.isFreind ? 'Unfreind' : 'Add Freind';
        clickOnBlock.textContent = this.isBlock ? 'Unblock' : 'Block';
      });
    }


    // // this.events.push(new ParentPage.eventsData('login-form', 'submit', ParentPage.loginFormSubmit));
    // let login = document.getElementById('login-form');
    //
    // if (login) {
    //   login.addEventListener('submit', (event) => {
    //     event.preventDefault();
    //     console.log(event);
    //   });
    //   // login.addEventListener('submit', ParentPage.loginFormSubmit);
    // }
  }

  async blockUser() {
    this.request.body = JSON.stringify({
      query: `
mutation ($token: String!, $username: String!) {
  updateFriends(token: $token, blockFriend: $username) {
    success
    message
  }
}`,
      variables: {
        token: `${ParentPage.getCookie('token')}`,
        username: `${this?.data?.username}`
      },
    });


    let responce = await fetch(this.back_api, this.request);

    if (responce?.ok) {
      let jsonBody = await responce?.json();

      if (jsonBody?.data?.updateFriends) {
        console.log(jsonBody?.data?.updateFriends);
        if (jsonBody?.data?.updateFriends?.success === true) {
          this.isBlock = true;
          this.isFreind = false;
          ParentPage.appendAlert(jsonBody?.data?.updateFriends?.message, 'success');
        }
        else
          ParentPage.appendAlert(jsonBody?.data?.updateFriends?.message);
      }
      else
        ParentPage.appendAlert(`backend failed :(`);
    }
    else
      ParentPage.appendAlert(`backend failed ${responce.status} `);

  }
  async unblockUser() {
    this.request.body = JSON.stringify({
      query: `
mutation ($token: String!, $username: String!) {
  updateFriends(token: $token, unblockFriend: $username) {
    success
    message
  }
}`,
      variables: {
        token: `${ParentPage.getCookie('token')}`,
        username: `${this?.data?.username}`
      },
    });


    let responce = await fetch(this.back_api, this.request);

    if (responce?.ok) {
      let jsonBody = await responce?.json();

      if (jsonBody?.data?.updateFriends) {
        console.log(jsonBody?.data?.updateFriends);
        if (jsonBody?.data?.updateFriends?.success === true) {
          this.isBlock = false;
          ParentPage.appendAlert(jsonBody?.data?.updateFriends?.message, 'success');
        }
        else
          ParentPage.appendAlert(jsonBody?.data?.updateFriends?.message);
      }
      else
        ParentPage.appendAlert(`backend failed :(`);
    }
    else
      ParentPage.appendAlert(`backend failed ${responce.status} `);

  }


  async addFreind() {
    this.request.body = JSON.stringify({
      query: `
mutation ($token: String!, $username: String!) {
  updateFriends(token: $token, addFriend: $username) {
    success
    message
  }
}`,
      variables: {
        token: `${ParentPage.getCookie('token')}`,
        username: `${this?.data?.username}`
      },
    });


    let responce = await fetch(this.back_api, this.request);

    if (responce?.ok) {
      let jsonBody = await responce?.json();

      if (jsonBody?.data?.updateFriends) {
        console.log(jsonBody?.data?.updateFriends);
        if (jsonBody?.data?.updateFriends?.success === true) {
          this.isFreind = true;
          ParentPage.appendAlert(jsonBody?.data?.updateFriends?.message, 'success');
        }
        else
          ParentPage.appendAlert(jsonBody?.data?.updateFriends?.message);
      }
      else
        ParentPage.appendAlert(`backend failed :(`);
    }
    else
      ParentPage.appendAlert(`backend failed ${responce.status} `);

  }

  async removeFreind() {
    this.request.body = JSON.stringify({
      query: `
mutation ($token: String!, $username: String!) {
  updateFriends(token: $token, deleteFriend: $username) {
    success
    message
  }
}`,
      variables: {
        token: `${ParentPage.getCookie('token')}`,
        username: `${this?.data?.username}`
      },
    });


    let responce = await fetch(this.back_api, this.request);

    if (responce?.ok) {
      let jsonBody = await responce?.json();

      if (jsonBody?.data?.updateFriends) {
        if (jsonBody?.data?.updateFriends?.success === true) {
          this.isFreind = false;
          ParentPage.appendAlert(jsonBody?.data?.updateFriends?.message, 'success');
        }
        else
          ParentPage.appendAlert(jsonBody?.data?.updateFriends?.message);
      }
      else
        ParentPage.appendAlert(`backend failed :(`);
    }
    else
      ParentPage.appendAlert(`backend failed ${responce.status} `);

  }

  /**
   * removeEventListener all
   */
  removeEventListener() {
    super.removeEventListener();

  }
}
