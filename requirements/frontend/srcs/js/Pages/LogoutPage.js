import SinglePageApp from "../SinglePageApp.js";
import ParentPage from "./ParentPage.js";

export default class LogoutPage extends ParentPage {

  constructor(singlePageApp) {
    super('LogOut');
    this.locationList = [`LogOut`];
    this.hasAToken = true;
    this.needToken = true;
  }

  /**
   * create the globale card 
   */
  globaleCard() {
    // clear the web site from token

    // setCookie('user_token', 'John', {secure: true, 'max-age': 60 * 60 * 48});
    ParentPage.deleteCookie('token');
    SinglePageApp.refresh(false);
    throw { redirect: true, redirectTo: "/sign-in", message: "logout from your account", type: "success" };
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
