import ParentPage from "./ParentPage.js";

export default class LeaderbordPage extends ParentPage {

  constructor() {
    super('Leaderboard');
    this.locationList = [`home`, `leaderboard`];
    this.hasAToken = true;
    this.needToken = true;
  }

  /**
    * create card body 
    */
  createCardBody() {
    return `
  <div class="container-fluid">
      
      <div class="row">
      
        <div class="col p-3 d-flex justify-content-center align-items-center flex-column flex-wrap">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#ffdf00" color="#ffdf00" style="color: #ffdf00; vertical-align: middle; margin-right: 0px; margin-left: 0px;" xmlns="http://www.w3.org/2000/svg"><path d="M2.3418 5.86914C2.3418 4.77051 3.08008 4.07617 4.23145 4.07617H5.83984C6.09473 3.14453 6.8418 2.6084 7.98438 2.6084H15.0156C16.1582 2.6084 16.9053 3.15332 17.1602 4.07617H18.7686C19.9199 4.07617 20.6582 4.77051 20.6582 5.86914C20.6582 9.34961 18.8477 11.7402 15.2881 12.8564C14.708 13.6123 14.0312 14.2451 13.3457 14.6758V18.0244H14.7256C16.0176 18.0244 16.7822 18.8242 16.7822 20.0811V21.6543C16.7822 22.2432 16.3252 22.6738 15.7627 22.6738H7.2373C6.6748 22.6738 6.21777 22.2432 6.21777 21.6543V20.0811C6.21777 18.8242 6.98242 18.0244 8.27441 18.0244H9.6543V14.6758C8.96875 14.2451 8.29199 13.6123 7.71191 12.8564C4.16113 11.7402 2.3418 9.34961 2.3418 5.86914ZM4.1875 6.2207C4.1875 8.00488 4.91699 9.38477 6.30566 10.2285C5.94531 9.38477 5.7168 8.43555 5.7168 7.44238V5.99219H4.40723C4.27539 5.99219 4.1875 6.08887 4.1875 6.2207ZM16.6943 10.2285C18.083 9.38477 18.8213 8.00488 18.8213 6.2207C18.8213 6.08887 18.7246 5.99219 18.5928 5.99219H17.2832V7.44238C17.2832 8.43555 17.0547 9.38477 16.6943 10.2285Z" fill="currentColor"></path></svg>
          <h1> leaderbord </h1>
        </div>
        
      </div>
      
      <div class="row">
      <div class="col leaderboard-leaders mb-5">
        <div class="LeaderboardPodium mb-5">
          <div class="leader">
            <div class="leader__info">
              <div class="leader__info__1">
                ${this.createPodiumCard(0)}
              </div>
            </div>
            <div class="LeaderboardPodium_cub LeaderboardPodium_cubLarge" data-rank="1" data-index="1">
              <div class="LeaderboardPodium_face LeaderboardPodium_ft"><span>1</span></div>
              <div class="LeaderboardPodium_face LeaderboardPodium_bk"></div>
              <div class="LeaderboardPodium_face LeaderboardPodium_rt"></div>
              <div class="LeaderboardPodium_face LeaderboardPodium_lt"></div>
              <div class="LeaderboardPodium_face LeaderboardPodium_bm"></div>
              <div class="LeaderboardPodium_face LeaderboardPodium_tp"></div>
            </div>
          </div>
          <div class="leader">
            <div class="leader__info">
              <div class="leader__info__2">
                ${this.createPodiumCard(1)}
              </div>
            </div>
            <div class="LeaderboardPodium_cub " data-rank="2" data-index="2">
              <div class="LeaderboardPodium_face LeaderboardPodium_ft"><span>2</span></div>
              <div class="LeaderboardPodium_face LeaderboardPodium_bk"></div>
              <div class="LeaderboardPodium_face LeaderboardPodium_rt"></div>
              <div class="LeaderboardPodium_face LeaderboardPodium_lt"></div>
              <div class="LeaderboardPodium_face LeaderboardPodium_bm"></div>
              <div class="LeaderboardPodium_face LeaderboardPodium_tp"></div>
              </div>
          </div>
          <div class="leader">
            <div class="leader__info">
              <div class="leader__info__3">
                ${this.createPodiumCard(2)}
              </div>
            </div>
            <div class="LeaderboardPodium_cub " data-rank="3" data-index="3">
              <div class="LeaderboardPodium_face LeaderboardPodium_ft"><span>3</span></div>
              <div class="LeaderboardPodium_face LeaderboardPodium_bk"></div>
              <div class="LeaderboardPodium_face LeaderboardPodium_rt"></div>
              <div class="LeaderboardPodium_face LeaderboardPodium_lt"></div>
              <div class="LeaderboardPodium_face LeaderboardPodium_bm"></div>
              <div class="LeaderboardPodium_face LeaderboardPodium_tp"></div>
              </div>
          </div>
      </div>
      
    </div>
    
    <div class="row m-0 p-0">
    
      <div class="col d-flex justify-content-center align-items-center overflow-x-auto gap-2 flex-column" >
        ${this.creatRankCards()}
         <!-- <a href="#1" type="button" class="leaderbord-card" local-link>
          <div>
            <img src="/img/profile.jpg" class="rounded-circle" height="50" width="50" loading="lazy"/>
          </div>
          
          <div>abdelhay bouramdane</div>
          
          <div class="opacity-75">#4</div>
        </a>--> 
        
      </div>
      
    </div>

  </div>
    `;
  }

  createPodiumCard(index) {

    if (index < 0 || index >= 3 || index >= this.data.length) return '';


    return `<a href="/user?id=${this.data[index].id}" alt="@${this.data[index].username}" style="text-decoration: none; display: flex; gap: 0.5rem; align-items: center; justify-content: flex-start; flex-direction: column;" local-link>
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="var(--clr-crown)" color="var(--clr-crown)" style="color: var(--clr-crown); vertical-align: middle; margin-right: 0px; margin-left: 0px;" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M4.075 15.407h15.891l1.05-4.235c1.225-.04 2.21-1.022 2.21-2.24 0-1.224-1.026-2.23-2.284-2.23-1.257 0-2.275 1.006-2.275 2.23 0 .293.05.56.15.812L16.5 11.351c-.198.137-.339.089-.447-.065L13.2 7.27a2.23 2.23 0 0 0 1.092-1.915c0-1.225-1.017-2.231-2.274-2.231-1.266 0-2.283 1.006-2.283 2.231a2.22 2.22 0 0 0 1.1 1.915l-2.83 3.983c-.107.146-.23.187-.43.057L5.21 9.671c.082-.235.124-.478.124-.738 0-1.225-1.018-2.231-2.275-2.231S.775 7.708.775 8.932c0 1.226 1 2.224 2.242 2.24l1.058 4.235Zm.39 1.566.314 1.241c.355 1.444 1.199 2.175 2.705 2.175h9.066c1.505 0 2.34-.723 2.705-2.175l.314-1.241H4.464Z"></path>
              </svg>
              <img src="${this.data[index].avatar}" class="rounded-circle" height="50" width="50" loading="lazy"/>
              <!-- <h5> ${this.data[index].firstName} ${this.data[index].lastName} </h5> -->
              <span class="opacity-75"> @${this.data[index].username} </span>
              <span class="opacity-75"> ${this.data[index].totalScore} </span>
            </a>`;
  }

  creatRankCards() {
    let rankList = new Array();
    for (let i = 3; i < this.data.length && i < 100; i++) {
      rankList.push(`
        <a href="/user?id=${this.data[i].id}" alt="@${this.data[i].username}" type="button" class="leaderbord-card" local-link>
          
          <div>
            <img src="${this.data[i].avatar}" class="rounded-circle" height="50" width="50" loading="lazy"/>
          </div>
          
          
          <div>
            ${this.data[i].firstName} ${this.data[i].lastName}
          </div>
          
          <div>
            ${this.data[i].totalScore}
          </div>
          
          <div class="opacity-75">#${i + 1}</div>
        </a>`);
    }
    return rankList.join('\n');
  }

  async requestData() {
    this.request.body = JSON.stringify({
      query: `query {
                profiles {
                  id
                  username
                  firstName
                  lastName
                  totalScore
                  avatar
                  wins 
                  losses 
                }
              }`,
      variables: {
      },
    });


    let responce = await fetch(this.back_api, this.request);

    if (responce?.ok) {
      let jsonBody = await responce?.json();

      if (jsonBody?.data?.profiles) {
        this.data = jsonBody?.data?.profiles.filter((item) => {
          return item?.wins.length + item.losses.length >= 2;
        });
        this.data.sort((a, b) => {
          if (a.totalScore != b.totalScore)
            return b.totalScore - a.totalScore;
          return b.wins - a.wins;
        });

        console.log(this.data);
      }
      else
        throw { message: `backend failed :(` };
    }
    else
      throw { message: `backend failed ${responce.status}` };

  }


  /**
   * addEventListener all
   */
  async addEventListener() {
    super.addEventListener();
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

  /**
   * removeEventListener all
   */
  removeEventListener() {
    super.removeEventListener();

  }

}
