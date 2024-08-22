import ParentPage from "./ParentPage.js";

export default class StartPage extends ParentPage {

  constructor() {
    super('Welcome');
    this.locationList = [`Let's go`];
    this.hasAToken = false;
    this.needToken = false;
  }

  /**
    * create card body 
    */
  createCardBody() {
    return `
      <h5 class="card-title">Ping Pong Game</h5>
      <p class="card-text">The Ultimate Online Ping Pong Experience!</p>
      <a href="/sign-in" class="btn btn-primary" local-link>Sign in</a>
      <a href="/sign-up" class="btn btn-outline-primary" local-link>Sign up</a>
    `;;
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
