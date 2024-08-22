import global from "../index.js";
import ParentPage from "./ParentPage.js";

export default class SettingPage extends ParentPage {

  constructor() {
    super('Setting');
    this.locationList = [`home`, `setting`];
    this.hasAToken = true;
    this.needToken = true;
  }

  /**
    * create card body 
    */
  createCardBody() {
    return `
      <div class="accordion" id="accordionExample">
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
              Public Info
            </button>
          </h2>
          <div id="collapseOne" class="accordion-collapse collapse show" data-bs-parent="#accordionExample">
            <div class="accordion-body">
              <form id="change-info-form">
              
                <div class="row mb-3">
                  <div class="col">
                    <div class="form-floating">
                      <input type="text" class="form-control" id="change-info-fname" name="change-info-fname" placeholder="First name" value="${this?.data?.firstName}">
                      <label for="change-info-fname">First name</label>
                    </div>
                  </div>
                  <div class="col">
                    <div class="form-floating">
                      <input type="text" class="form-control" id="change-info-lname" name="change-info-lname" placeholder="Last name"  value="${this?.data?.lastName}">
                      <label for="change-info-lname">Last name</label>
                    </div>
                  </div>
                </div>
                <div class="input-group mb-3">
                  <span class="input-group-text">@</span>
                  <div class="form-floating">
                    <input type="text" class="form-control" id="change-info-name" name="change-info-name" placeholder="Username"  value="${this?.data?.username}">
                    <label for="change-info-name">Username</label>
                  </div>
                </div>
                <div class="input-group mb-3">
                  <span class="input-group-text">About</span>
                  <div class="form-floating">
                    <textarea class="form-control" aria-label="With textarea" id="change-info-bio" name="change-info-bio" placeholder="Bio" >${this?.data?.bio}</textarea>
                    <label for="change-info-bio">Bio</label>
                  </div>
                </div>
                <div class="d-flex justify-content-center" > 
                  <button type="submit" class="mb-3 btn btn-primary">Save changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
              Photo profile
            </button>
          </h2>
          <div id="collapseTwo" class="accordion-collapse collapse" data-bs-parent="#accordionExample">
            <div class="accordion-body">
              
              <form id="change-image-form" class="needs-validation">
                
                <div class="input-group mb-3">
                  <input type="file" class="form-control" id="change-image-img" name="change-image-img" accept="image/*">
                  <label class="input-group-text" for="change-image-img">Upload</label>
                </div>

                <div class="d-flex justify-content-center" > 
                  <button type="submit" class="mb-3 btn btn-primary">Save New Image</button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
              My Password
            </button>
          </h2>
          <div id="collapseThree" class="accordion-collapse collapse" data-bs-parent="#accordionExample">
            <div class="accordion-body">
              
              <form id="change-password-form">
                
                <div class="form-floating mb-3">
                  <input type="password" class="form-control" id="password-old" name="password-old" placeholder="Password">
                  <label for="password-old">Old Password</label>
                </div>
                <div class="form-floating mb-3">
                  <input type="password" class="form-control" id="password-new" name="password-new" placeholder="Password">
                  <label for="password-new">New Password</label>
                  <div id="passwordHelpBlock" class="form-text">
                    Your password must be 8-20 characters long, contain upper and lower letters and numbers, and special characters.
                  </div>
                </div>
                <div class="form-floating mb-3">
                  <input type="password" class="form-control" id="password-cnew" name="password-cnew" placeholder="Password">
                  <label for="password-cnew">Confirm New Password</label>
                </div>
                <div class="d-flex justify-content-center" > 
                  <button type="submit" class="mb-3 btn btn-primary">Save New Password</button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
              Two-factor Authentication (2FA)
            </button>
          </h2>
          <div id="collapseFour" class="accordion-collapse collapse" data-bs-parent="#accordionExample">
            <div class="accordion-body">
              <p>
								Two-factor Authentication (2FA) is <span id="2fa-status"  class="text-${this?.data?.is2faEnabled ? 'success' : 'danger'}">${this?.data?.is2faEnabled ? 'Activate' : 'Disable'}</span> 
              </p>
              <button id="2fa-button" type="button" class="btn btn-primary mb-3" style="min-width: 150px;" data-bs-toggle="modal" data-bs-target="#activate-2fa"  ${this?.data?.is2faEnabled ? 'disabled' : ''}>Activate 2FA</button>
              <button id="2fa-disable" type="button" class="btn btn-secondary mb-3" style="min-width: 150px;" ${this?.data?.is2faEnabled ? '' : 'disabled'}>Disable 2FA</button>

              <!-- Modal -->
              <div class="modal fade" id="activate-2fa" tabindex="-1" aria-labelledby="activate-2fa" aria-hidden="true">
                <div class="modal-dialog">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h1 class="modal-title fs-5" id="exampleModalLabel">Enable (2FA)</h1>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <form id="2fa-form">
                      <div class="modal-body">
                        <div class="d-flex justify-content-center mb-3">
                          <img id="2fa-img" src="" class="rounded img-thumbnail" style="min-width: 200px; max-width: 200px; min-height: 200px; max-height: 200px;" alt="...">
                        </div>
                        <div class="form-floating">
                          <input type="text" class="form-control" id="valid-code" name="valid-code" placeholder="Secret Word">
                          <label for="valid-code">Code XXX-XXX</label>
                        </div>
                      </div>
                      <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="submit" class="btn btn-primary" id="enable2fa">Enable 2FA</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }


  /**
   * addEventListener all
   */
  async addEventListener() {
    super.addEventListener();
    this.faImg = document.getElementById('2fa-img');
    this.fabutton = document.getElementById('2fa-button');
    this.faForm = document.getElementById('2fa-form');
    this.faStatus = document.getElementById('2fa-status');
    this.faDisable = document.getElementById('2fa-disable');
    this.enable2fa = document.getElementById('enable2fa');
    if (this.enable2fa && this.faDisable && this.faImg && this.fabutton && this.faForm && this.faStatus) {
      this.fabutton.addEventListener('click', async () => {


        this.request.body = JSON.stringify({
          query: `
mutation ($token: String!) {
  enable2fa(token: $token) {
    success
    message
    qrCode
  }
}`,
          variables: {
            token: `${ParentPage.getCookie('token')}`
          },
        });

        let responce = await fetch(this.back_api, this.request);

        if (responce?.ok) {
          let jsonBody = await responce?.json();

          if (jsonBody?.data?.enable2fa?.success === true) {
            console.log(jsonBody?.data?.enable2fa?.message);
            this.faImg.setAttribute('src', `${jsonBody?.data?.enable2fa?.qrCode}`);
          }
          else {
            ParentPage.appendAlert(`failed to get QrCode ${jsonBody?.data?.enable2fa?.message}`);
          }
        }
        else
          ParentPage.appendAlert(`backend failed ${responce.status}`);


      });

      this.faForm.addEventListener('submit', (event) => {
        event.preventDefault();
        this.faFormSubmit(event);
      })

      this.faDisable.addEventListener('click', async () => {


        this.request.body = JSON.stringify({
          query: `
mutation ($token: String!) {
  disable2fa(token: $token) {
    success
    message
  }
}`,
          variables: {
            token: `${ParentPage.getCookie('token')}`
          },
        });

        let responce = await fetch(this.back_api, this.request);

        if (responce?.ok) {
          let jsonBody = await responce?.json();

          if (jsonBody?.data?.disable2fa?.success === true) {
            ParentPage.appendAlert(`${jsonBody?.data?.disable2fa?.message}`, 'success');
            this.faStatus.textContent = `Disable`;
            this.faStatus.className = `text-danger`;
            this.fabutton.removeAttribute('disabled');
            this.faDisable.setAttribute('disabled', '');
            this.enable2fa.removeAttribute('disabled');
          }
          else {
            ParentPage.appendAlert(`${jsonBody?.data?.disable2fa?.message}`);
          }
        }
        else
          ParentPage.appendAlert(`backend failed ${responce.status}`);


      });

    }

    this.changePassForm = document.getElementById('change-password-form');

    if (this.changePassForm) {
      this.changePassForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        let userData = {};
        for (let item of event?.target) {
          userData[item.name] = item.value;
        }

        let oldPassword = userData['password-old'];
        let newPassword = userData['password-new'];
        let cNewPassword = userData['password-cnew'];


        this.request.body = JSON.stringify({
          query: `
mutation ($token: String!, $oldPassword: String!, $newPassword: String!, $cNewPassword: String!) {
  changePassword(token: $token, old: $oldPassword, new1: $newPassword, new2: $cNewPassword) {
    success
    message
  }
}`,
          variables: {
            token: `${ParentPage.getCookie('token')}`,
            oldPassword: `${oldPassword}`,
            newPassword: `${newPassword}`,
            cNewPassword: `${cNewPassword}`,
          },
        });

        console.log(this.request.body);

        let responce = await fetch(this.back_api, this.request);

        if (responce?.ok) {
          let jsonBody = await responce?.json();

          if (jsonBody?.data?.changePassword?.success === true) {
            ParentPage.appendAlert(`${jsonBody?.data?.changePassword?.message}`, "success");
          }
          else {
            ParentPage.appendAlert(`${jsonBody?.data?.changePassword?.message}`);
          }
        }
        else {
          ParentPage.appendAlert(`backend failed ${responce.status}`);
        }

      });
    }

    let changeInfo = document.getElementById('change-info-form');

    if (changeInfo) {
      changeInfo.addEventListener('submit', (event) => {
        event.preventDefault();
        this.changeInfoFormSubmit(event);
      });

    }

    let changePhoto = document.getElementById('change-image-form');
    if (changePhoto) {
      changePhoto.addEventListener('submit', function (event) {
        event.preventDefault();
        const fileInput = document.getElementById('change-image-img');
        const file = fileInput?.files[0];

        if (file) {
          const reader = new FileReader();

          reader.addEventListener("load", async (e) => {
            const avatar = e.target.result;

            let back_api = '/api/users';
            let request = {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                query: `
mutation ($token: String!, $avatar: String!) {
  updateProfile(token: $token, avatar: $avatar) {
    success
    message
  }
}`,
                variables: {
                  token: `${ParentPage.getCookie('token')}`,
                  "avatar": `${avatar}`,
                },
              })
            };

            try {
              let responce = await fetch(back_api, request);


              if (responce?.ok) {
                let jsonBody = await responce?.json();

                if (jsonBody?.data?.updateProfile?.success === true) {
                  ParentPage.appendAlert(`${jsonBody?.data?.updateProfile?.message}`, "success");
                }
                else {
                  ParentPage.appendAlert(`${jsonBody?.data?.updateProfile?.message}`);
                }
              }
              else {
                if (responce?.status == 413)
                  ParentPage.appendAlert(`file too large > 1MB`);
                else
                  ParentPage.appendAlert(`backend failed ${responce.status}`);
              }
            } catch (err) {
              console.log(err.message);
            }
          });

          reader.addEventListener('error', (e) => {
            ParentPage.appendAlert(`Error reading file ${e}`);
          });

          reader.readAsDataURL(file);
        } else {
          ParentPage.appendAlert('Please select a file.');
        }
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

  async faFormSubmit(event) {

    let userData = {};
    for (let item of event?.target) {
      userData[item.name] = item.value;
    }

    let code = userData['valid-code'];

    this.request.body = JSON.stringify({
      query: `
mutation ($token: String!, $code: String!) {
  verify2fa(code: $code, token: $token) {
    success
    message
  }
}`,
      variables: {
        code: `${code}`,
        token: `${ParentPage.getCookie('token')}`
      },
    });

    let responce = await fetch(this.back_api, this.request);

    if (responce?.ok) {
      let jsonBody = await responce?.json();
      console.log(jsonBody);
      if (jsonBody?.data?.verify2fa?.success === true) {
        ParentPage.appendAlert(`${jsonBody?.data?.verify2fa?.message}`, "success");
        this.faStatus.textContent = `activate`;
        this.faStatus.className = `text-success`;
        this.faDisable.removeAttribute('disabled');
        this.fabutton.setAttribute('disabled', '');
        this.enable2fa.setAttribute('disabled', '');

      }
      else {
        ParentPage.appendAlert(`failed to activate ${jsonBody?.data?.verify2fa?.message}`);
      }
    }
    else
      ParentPage.appendAlert(`backend failed ${responce.status}`);
  }

  async changeInfoFormSubmit(event) {

    let userData = {};
    for (let item of event?.target) {
      userData[item.name] = item.value;
    }

    let firstName = userData['change-info-fname'];
    let lastName = userData['change-info-lname'];
    let username = userData['change-info-name'];
    let bio = userData['change-info-bio'];

    let usernameChange = ["$username: String!, ", "username: $username, "];
    if (username === this?.data?.username) {
      usernameChange = ["", ""];
    }

    this.request.body = JSON.stringify({
      query: `
mutation ($token: String!, $firstName: String!, $lastName: String!, ${usernameChange[0]} $bio: String!) {
  updateProfile(token: $token, firstName: $firstName, lastName: $lastName, ${usernameChange[1]} bio: $bio ) {
    success
    message
  }
}`,
      variables: {
        token: `${ParentPage.getCookie('token')}`,
        "firstName": `${firstName}`,
        "lastName": `${lastName}`,
        "username": `${username}`,
        "bio": `${bio}`,
      },
    });

    let responce = await fetch(this.back_api, this.request);

    if (responce?.ok) {
      let jsonBody = await responce?.json();

      if (jsonBody?.data?.updateProfile?.success === true) {
        ParentPage.appendAlert(`${jsonBody?.data?.updateProfile?.message}`, "success");
        this.data.username = `${username}`;
      }
      else {
        ParentPage.appendAlert(`${jsonBody?.data?.updateProfile?.message}`);
      }
    }
    else
      ParentPage.appendAlert(`backend failed ${responce.status}`);
  }

  async changePhotoFormSubmit(avatar) {


    this.request.body = JSON.stringify({
      query: `
mutation ($token: String!, $avatar: String!) {
  updateProfile(token: $token, avatar: $firstName) {
    success
    message
  }
}`,
      variables: {
        token: `${ParentPage.getCookie('token')}`,
        "avatar": `${avatar}`,
      },
    });
    let responce = await fetch(this.back_api, this.request);

    console.log("after fetch");

    if (responce?.ok) {
      let jsonBody = await responce?.json();

      if (jsonBody?.data?.updateProfile?.success === true) {
        ParentPage.appendAlert(`${jsonBody?.data?.updateProfile?.message}`, "success");
      }
      else {
        ParentPage.appendAlert(`${jsonBody?.data?.updateProfile?.message}`);
      }
    }
    else {
      console.log(responce?.status);
      if (responce?.status == 413)
        ParentPage.appendAlert(`file too large > 1MB`);
      else
        ParentPage.appendAlert(`backend failed ${responce.status}`);
    }
  }




  /**
   * removeEventListener all
   */
  removeEventListener() {
    super.removeEventListener();

  }


  async requestData() {

    this.request.body = JSON.stringify({
      query: `query ($token: String!) {
  userByToken(token: $token) {
    id
    profile {
      id
      username
      firstName
      lastName
      bio
      is2faEnabled
    }
  } 
} `,
      variables: {
        token: `${ParentPage.getCookie('token')}`
      },
    });


    let responce = await fetch(this.back_api, this.request);

    if (responce?.ok) {
      let jsonBody = await responce?.json();

      if (jsonBody?.data?.userByToken?.profile) {
        this.data = jsonBody?.data?.userByToken?.profile;
      }
      else {
        console.log(jsonBody);
        throw { message: `backend failed`, redirect: true, redirectTo: '/home' };
      }
    }
    else {

      throw { message: `backend failed ${responce.status} ` };
    }


  }



}
