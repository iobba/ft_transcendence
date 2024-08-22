import SinglePageApp from "../SinglePageApp.js";
import ParentPage from "./ParentPage.js";

export default class Login42Page extends ParentPage {

  constructor(singlePageApp) {
    super('42 login');
    this.locationList = [`42 code`];
    this.hasAToken = false;
    this.needToken = false;
  }


  async requestData() {
    this.request.body = JSON.stringify({
      query: `mutation ($code: String!) {
                createProfile42(code: $code) {
                  success
                  message
                  token
                }
              }`,
      variables: {
        code: `${ParentPage.getQeruy("code")}`
      },
    });

    console.log(this.request.body);

    let responce = await fetch(this.back_api, this.request);

    if (responce?.ok) {
      let jsonBody = await responce?.json();

      if (jsonBody?.data?.createProfile42?.success === true) {
        console.log("valid code", jsonBody?.data?.createProfile42?.message);
        ParentPage.setCookie('token', jsonBody?.data?.createProfile42?.token, { "Expires": new Date(Date.now() + 2 * (60 * 60 * 1000)) });
        SinglePageApp.refresh(false);
        throw { redirect: true, redirectTo: "/home", message: "you login with 42 code", type: "success" };
      }
      else {
        console.log("not valid code", jsonBody);
        throw { redirect: true, redirectTo: "/sign-in", message: "42 code is not valid!" };
      }

    }
    else
      throw { message: `backend failed ${responce.status}` };

    throw { redirect: true, redirectTo: "/home", message: "your login is valid" };
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
