import ParentPage from "./ParentPage.js";
import global from "../index.js";
import SinglePageApp from "../SinglePageApp.js";

export default class SignUpPage extends ParentPage {

  constructor() {
    super('Sign Up');
    this.locationList = [`Sign Up`];
    this.hasAToken = false;
    this.needToken = false;
  }

  /**
    * create card body 
    */
  createCardBody() {
    return `
      <form id="sign-up-form">
        <div class="row mb-3">
          <div class="col">
            <div class="form-floating">
              <input type="text" class="form-control" id="sign-up-fname" name="sign-up-fname" placeholder="First name">
              <label for="sign-up-fname">First name</label>
            </div>
          </div>
          <div class="col">
            <div class="form-floating">
              <input type="text" class="form-control" id="sign-up-lname" name="sign-up-lname" placeholder="Last name">
              <label for="sign-up-lname">Last name</label>
            </div>
          </div>
        </div>
        <div class="input-group mb-3">
          <span class="input-group-text">@</span>
          <div class="form-floating">
            <input type="text" class="form-control" id="sign-up-name" name="sign-up-name" placeholder="Username">
            <label for="sign-up-name">Username</label>
          </div>
        </div>
        <div class="form-floating mb-3">
          <input type="password" class="form-control" id="sign-up-password" name="sign-up-password" placeholder="Password">
          <label for="sign-up-password">Password</label>
          <div id="passwordHelpBlock" class="form-text">
            Your password must be 8-20 characters long, contain upper and lower letters and numbers, and special characters.
          </div>
        </div>
        <div class="form-floating mb-3">
          <input type="password" class="form-control" id="sign-up-cpassword" name="sign-up-cpassword" placeholder="Password">
          <label for="sign-up-cpassword">Confirm Password</label>
        </div>
        <div class="d-flex align-items-center justify-content-between flex-wrap">
          <div class="mb-3">
            <button type="submit" class="btn btn-primary">Sign up</button>
            <a href="${this.api_42}" type="button" class="btn btn-outline-primary">42 intra</a>
          </div>
          <p>Have an account? <a href="/sign-in" local-link>Sign in</a></p>
        </div>
        
      </form>
    `;
  }

  async signUpFormSubmit(event) {

    let userData = {};
    event.preventDefault();
    for (let item of event?.target) {
      userData[item.name] = item.value;
    }

    let username = userData['sign-up-name'];
    let firstname = userData['sign-up-fname'];
    let lastname = userData['sign-up-lname'];
    let password = userData['sign-up-password'];
    let cpassword = userData['sign-up-cpassword'];

    if (password != cpassword) {
      ParentPage.appendAlert(`Confirm password is diff!`);
      return;
    }

    this.request.body = JSON.stringify({
      query: `mutation ($username: String!, $password: String!, $fname: String!, $lname: String!)
              {
                createProfile(username: $username, firstName: $fname, lastName: $lname, password: $password) {
                  success
                  message
                  token
                }
              }`,
      variables: {
        username: `${username}`,
        password: `${password}`,
        fname: `${firstname}`,
        lname: `${lastname}`,
      },
    });

    let responce = await fetch(this.back_api, this.request);

    if (responce?.ok) {
      let jsonBody = await responce?.json();

      if (jsonBody?.data?.createProfile?.success === true) {
        console.log("valid code", jsonBody?.data?.createProfile?.message);
        ParentPage.setCookie('token', jsonBody?.data?.createProfile?.token, { "Expires": new Date(Date.now() + 24 * (60 * 60 * 1000)) })
        await SinglePageApp.refresh(false);
        await global.singlePageApp.navigateTo('/home');
        ParentPage.appendAlert(`${jsonBody?.data?.createProfile?.message}`, "success");
      }
      else {
        ParentPage.appendAlert(`failed to sign up ${jsonBody?.data?.createProfile?.message}`);
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
    let login = document.getElementById('sign-up-form');

    if (login) {
      login.addEventListener('submit', (event) => {
        event.preventDefault();
        this.signUpFormSubmit(event);
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
