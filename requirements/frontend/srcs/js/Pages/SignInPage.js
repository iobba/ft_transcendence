import ParentPage from "./ParentPage.js";
import global from "../index.js";
import SinglePageApp from "../SinglePageApp.js";

export default class SignInPage extends ParentPage {

  constructor() {
    super('Sign In');
    this.locationList = [`Sign In`];
    this.hasAToken = false;
    this.needToken = false;
  }

  /**
    * create card body 
    */
  createCardBody() {
    return `
      <form id="login-form">
        
        <div class="input-group mb-3">
          <span class="input-group-text">@</span>
          <div class="form-floating">
            <input type="text" class="form-control" id="login-user" name="login-user" placeholder="Username" required>
            <label for="login-user">Username</label>
          </div>
        </div>
        <div class="form-floating mb-3">
          <input type="password" class="form-control" id="login-password" name="login-password" placeholder="Password" required>
          <label for="login-password">Password</label>
          <div id="passwordHelpBlock" class="form-text">
            Your password must be 8-20 characters long, contain upper and lower letters and numbers, and special characters.
          </div>
        </div>
        <div id="2FA-input" class="form-floating mb-3" style="display: none;" >
          <input type="text" class="form-control" id="login-2fa" name="login-2fa" placeholder="2FA Code">
          <label for="login-2fa">2FA Code</label> 
          <div id="passwordHelpBlock" class="form-text">
            2FA is enabled, Your 2FA code must be 6 characters long.
          </div>
        </div>

        <div class="d-flex align-items-center justify-content-between flex-wrap">
          <div class="mb-3">
            <button type="submit" class="btn btn-primary">Sign in</button>
            <a href="${this.api_42}" type="button" class="btn btn-outline-primary">42 intra</a>
          </div>
          <p>Create your account <a href="/sign-up" local-link>Sign up</a></p>
        </div>
        
      </form>
    `;
  }



  async loginFormSubmit(event) {

    let userData = {};
    event.preventDefault();
    for (let item of event?.target) {
      userData[item.name] = item.value;
    }

    let username = userData['login-user'];
    let password = userData['login-password'];
    let code = userData['login-2fa'];


    this.request.body = JSON.stringify({
      query: `mutation ($username: String!,$password: String!, $code: String)
              {
                loginCheck(username: $username, password: $password, code: $code) {
                  success
                  message
                  token
                }
              }`,
      variables: {
        username: `${username}`,
        password: `${password}`,
        code: `${code}`,
      },
    });

    console.log(this.request.body);

    let responce = await fetch(this.back_api, this.request);

    if (responce?.ok) {
      let jsonBody = await responce?.json();

      if (jsonBody?.data?.loginCheck?.success === true) {
        if (jsonBody?.data?.loginCheck?.token) {
          console.log("valid data", jsonBody?.data?.loginCheck?.message);
          ParentPage.setCookie('token', jsonBody?.data?.loginCheck?.token, { "Expires": new Date(Date.now() + 24 * (60 * 60 * 1000)) })
          await SinglePageApp.refresh(false);
          await global.singlePageApp.navigateTo('/home');
          ParentPage.appendAlert(`${jsonBody?.data?.loginCheck?.message}`, "success");
        }
        else {
          console.log("2fa enable");
          ParentPage.appendAlert(`You need to enter 2FA`);

          document.getElementById('2FA-input').style.display = "block";
          document.getElementById('login-user').setAttribute('disabled', '');
          document.getElementById('login-password').setAttribute('disabled', '');


          // await this.loginFormSubmit2fa(username, password, prompt('Enter 2fa code'))
        }
      }
      else {
        ParentPage.appendAlert(`failed to login ${jsonBody?.data?.loginCheck?.message}`);
      }

    }
    else
      ParentPage.appendAlert(`backend failed ${responce.status}`);
  }
  /*
    async loginFormSubmit2fa(username, password, code) {
  
  
  
      this.request.body = JSON.stringify({
        query: `mutation ($username: String!,$password: String!, $code: String)
                {
                  loginCheck(username: $username, password: $password, code: $code) {
                    success
                    message
                    token
                  }
                }`,
        variables: {
          username: `${username}`,
          password: `${password}`,
          code: `${code}`,
        },
      });
  
      console.log(this.request.body);
  
      let responce = await fetch(this.back_api, this.request);
  
      if (responce?.ok) {
        let jsonBody = await responce?.json();
  
        if (jsonBody?.data?.loginCheck?.success === true) {
          console.log("valid data", jsonBody?.data?.loginCheck?.message);
          ParentPage.setCookie('token', jsonBody?.data?.loginCheck?.token, { "Expires": new Date(Date.now() + 7 * 24 * (60 * 60 * 1000)) })
          await global.singlePageApp.navigateTo('/home');
          ParentPage.appendAlert(`${jsonBody?.data?.loginCheck?.message}`, "success");
        }
        else {
          ParentPage.appendAlert(`failed to login ${jsonBody?.data?.loginCheck?.message}`);
        }
  
      }
      else
        throw { message: `backend failed ${responce.status}` };
    }
  */
  /**
   * addEventListener all
   */
  async addEventListener() {
    super.addEventListener();
    let login = document.getElementById('login-form');

    if (login) {
      login.addEventListener('submit', (event) => {
        event.preventDefault();
        this.loginFormSubmit(event);
      });
    }
  }

  /**
   * removeEventListener all
   */
  removeEventListener() {
    super.removeEventListener();

  }
}
