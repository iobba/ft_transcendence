import ParentPage from "./ParentPage.js";
import gameModeSelector from "./gameFront/srcs/main.js";
import webSocket from "./gameFront/srcs/webSocket.js";

export default class GamePage extends ParentPage {

  constructor(singlePageApp) {
    super('Game', singlePageApp);
    this.locationList = [`home`, `game`];
    this.hasAToken = true;
    this.needToken = true;
  }

  /**
    * create card body 
    */
  createCardBody() {
    return `
  <div id="content" class="position-relative d-flex justify-content-center align-items-center overflow-hidden rounded-5" style="min-width: 100%; min-height:100%; max-height:100%; height:100%">
  </div>`;
  }


  /**
   * addEventListener all
   */
  async addEventListener() {
    super.addEventListener();
    gameModeSelector();
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
    let len = webSocket.length;
    for (let i = 0; i < len; i++) {
      const ws = webSocket.pop();
      ws.close();
      console.log("close web socket");
    }
    console.log("quit game page")

  }
}
