import environment from "../environment.js";

export default class ParentPage {

  constructor(title) {
    this.title = title;
    this.events = new Array(); // save the event ant remove them after
    this.locationList = ['home', 'profile'];
    this.hasAToken = true;
    this.needToken = true;
    this.back_api = "/api/users";
    this.api_42 = environment.INTRA_API;
    this.request = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "",
    }
    this.data = {};
  }

  /**
   * render the content of the page
   */

  async renderPage() {

    document.title = this.title;
    // check if the user is login
    await this.hasValidToken();

    await this.requestData();

    return (this.globaleCard());
  }

  /**
   * request Data
   */

  async requestData() { }

  /**
   * check if the user is log in 
   */

  async hasValidToken() {

    this.request.body = JSON.stringify({
      query: `mutation ($token: String!) {
                validateToken(token: $token) {
                  success
                } 
              }`,
      variables: {
        token: `${ParentPage.getCookie("token")}`
      },
    });

    let responce = await fetch(this.back_api, this.request);

    if (responce?.ok) {
      let jsonBody = await responce?.json();

      if (jsonBody?.data?.validateToken?.success === true) {
        console.log("valid token");
        this.hasAToken = true;
      }
      else {
        console.log("not valid token");
        this.hasAToken = false;
      }

    }
    else
      throw { message: `backend failed ${responce.status}` };

    if (this.needToken && !this.hasAToken)
      throw { message: "need a token to get data", redirect: true, redirectTo: "/sign-in" };
    if (!this.needToken && this.hasAToken)
      throw { message: "the user is already has a token", redirect: true, redirectTo: "/home", type: "success" };
  }

  /**
   * create the globale card 
   */
  globaleCard() {

    let card = document.createElement('div');

    if (this.hasAToken) {
      card.style.width = '90vw';
      card.style.height = '90vh';
    }
    else {
      card.style.width = 'auto';
      card.style.height = 'auto';
    }

    card.className = 'card shadow-lg p-1 mb-5 bg-body rounded';

    card.style.minWidth = '300px';
    card.style.minHeight = '200px';
    card.style.maxWidth = '1500px';

    let cardHeader = document.createElement('div');
    let cardBody = document.createElement('div');

    cardHeader.classList = 'card-header';
    cardBody.classList = 'card-body';
    // cardBody.setAttribute('id', 'content');

    if (this.hasAToken) {
      cardHeader.classList = 'card-header d-flex justify-content-between align-items-center';
      cardHeader.innerHTML = this.createNav();
    }
    else {
      cardHeader.innerText = this.locationList[0];
    }

    cardBody.innerHTML = this.createCardBody();

    card.appendChild(cardHeader);

    card.appendChild(cardBody);

    return card;
  }

  /**
   * create card body 
   */
  createCardBody() {
    let div = document.createElement('div');

    div.innerText = 'there is no content';

    div.classList = 'd-flex justify-content-center align-items-center';

    div.style.width = '100%';

    div.style.height = '100%';

    return div.outerHTML;
  }


  /**
   * create the nav 
   */
  createNav() {
    let domList = [];

    this.createBreadcrumb(domList);

    this.createDropdown(domList);

    return domList.join('');
  }

  /**
   * create drop down search and nav
   */
  createDropdown(domList = []) {

    domList.push(`<div class="d-flex gap-3 align-items-center">`);

    this.createSearchModal(domList);

    this.createDropList(domList);

    domList.push(`</div>`);

    return domList;
  }

  /**
   * create search in nav
   */
  createDropList(domList = []) {
    domList.push(`
    <div class="dropdown">
      <button class="d-flex align-items-center hidden-arrow btn btn-primary"
        type="button" data-bs-toggle="dropdown" aria-expanded="false">
        <i class="bi bi-list"></i>
      </button>
      <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdownMenuAvatar">
        <li>
          <a class="dropdown-item" href="/home" local-link>Home</a>
        </li>
        <li>
          <a class="dropdown-item" href="/profile" local-link>My profile</a>
        </li>
        <li>
          <a class="dropdown-item" href="/game" local-link>game</a>
        </li>
        <li>
          <a class="dropdown-item" href="/leaderbord" local-link>Leaderbord</a>
        </li>
        <li>
          <a class="dropdown-item" href="/setting" local-link>Settings</a>
        </li>
        <li>
          <a class="dropdown-item" href="/logout" local-link>Logout</a>
        </li>
      </ul>
    </div>
		`);
  }

  /**
   * create search in nav
   */
  createSearchModal(domList = []) {
    domList.push(`
    <button id="searchbutton" type="button" class="rounded-circle btn btn-primary" data-bs-toggle="modal" data-bs-target="#searchModal">
      <i class="bi bi-search"></i>
		</button>

    <!--Modal -->
    <div class="modal fade" id="searchModal" tabindex="-1" aria-labelledby="searchModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="searchModalLabel">Search</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="form-floating mb-3">
              <input type="search" class="form-control" id="searchBox" name="searchBox" placeholder="name@example.com">
                <label for="searchBox">Search</label>
            </div>

            <div id="searchResult" class="d-flex align-items-center gap-2 flex-column" style="min-height: 500px; max-height: 500px; overflow: auto;">
              
              </div>

            </div>
          </div>
        </div>
      </div>
`);

    return domList;

  }

  /**
   * create a user search card 
   */
  createSearchCard(link, firstName, lastName, userName) {
    let searchCard = document.createElement('a');
    let nameCard = document.createElement('div');
    let userCard = document.createElement('div');

    searchCard.classList = 'btn btn-primary d-flex align-items-center justify-content-around flex-wrap';
    searchCard.style.width = '96%';
    searchCard.style.minHeight = '50px';
    searchCard.href = `/user?id=${link}`;
    searchCard.setAttribute('local-link', '');

    nameCard.innerText = `${firstName} ${lastName}`;
    nameCard.style.textDecoration = 'none';

    userCard.innerText = `@${userName}`;
    userCard.className = 'opacity-75';
    userCard.style.textDecoration = 'none';

    searchCard.appendChild(nameCard);
    searchCard.appendChild(userCard);

    return searchCard;
  }
  /**
   * create a breadcrumb
   */
  createBreadcrumb(domList = []) {

    domList.push(`
    <nav style = "--bs-breadcrumb-divider: '>';" aria - label="breadcrumb">
      <ol class="breadcrumb">
        `);

    let index = 0;
    while (index < this.locationList.length - 1) {
      domList.push(`<li class="breadcrumb-item"><a href="${this.locationList[index]}" local-link>${this.locationList[index]}</a></li>`);
      index++;
    }

    domList.push(`
        <li class="breadcrumb-item active" aria-current="page">${this.locationList[index]}</li>
      </ol>
		</nav >
      `);

    return domList;
  }

  async getUsersForSearch() {
    this.request.body = JSON.stringify({
      query: `query {
                profiles {
                  id
                  username
                  firstName
                  lastName
                }
              }`,
      variables: {
      },
    });


    let responce = await fetch(this.back_api, this.request);

    if (responce?.ok) {
      let jsonBody = await responce?.json();

      if (jsonBody?.data?.profiles) {
        return jsonBody?.data?.profiles?.map((item) => {
          if (!item)
            return item;
          return item;
        });
      }
      else
        ParentPage.appendAlert(`backend failed to get search users :(`);
    }
    else
      ParentPage.appendAlert(`backend failed ${responce.status} `);

    return [];
  }

  async inputSearchHandle(e) {
    let username = e?.target?.value?.toLowerCase();

    let matchedUsers = this.UsersSearch?.filter((item) => {
      let key = item?.username?.substring(0, username?.length)?.toLowerCase();
      return key === username;
    });

    if (matchedUsers?.length === 0 || !matchedUsers) {
      this.searchResultid.innerHTML = 'No result!!!';
      return;
    }

    this.searchResultid.innerHTML = '';

    let count = 15;
    for (let item of matchedUsers) {
      if (!count--)
        break;
      this.searchResultid.appendChild(
        this.createSearchCard(item?.id, item?.firstName, item?.lastName, item?.username));
    }

  }

  /**
   * addEventListener all
   */
  async addEventListener() {
    if (this.needToken) {
      this.searchResultid = document.getElementById('searchResult');
      if (this.searchResultid) {
        this.UsersSearch = await this.getUsersForSearch();
        document?.getElementById('searchBox')?.addEventListener('keyup', (e) => { e?.preventDefault(); this.inputSearchHandle(e) });
        document?.getElementById('searchbutton')?.addEventListener('click', async () => {
          this.UsersSearch = await this.getUsersForSearch();
          await this.inputSearchHandle({ target: { value: "" } });
        });
      }
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

  /**
   * removeEventListener all
   */
  removeEventListener() {

  }

  /**
  * returns the cookie with the given name,
  * or undefined if not found
  */
  static getCookie(name) {
    let matches = document.cookie.match(new RegExp(
      "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
  }

  /**
   * set cookie
   */
  static setCookie(name, value, attributes = {}) {

    attributes = {
      path: '/',
      // add other defaults here if necessary
      ...attributes
    };

    if (attributes.expires instanceof Date) {
      attributes.expires = attributes.expires.toUTCString();
    }

    let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

    for (let attributeKey in attributes) {
      updatedCookie += "; " + attributeKey;
      let attributeValue = attributes[attributeKey];
      if (attributeValue !== true) {
        updatedCookie += "=" + attributeValue;
      }
    }

    document.cookie = updatedCookie;
  }

  // setCookie('user_token', 'John', {secure: true, 'max-age': 60 * 60 * 48});

  /**
   * remove a cookie
  */
  static deleteCookie(name) {
    ParentPage.setCookie(name, "", {
      'max-age': -1
    })
  }
  /**
   * get var value from query
   */

  static getQeruy(name) {
    console.log(location.search);

    const urlParams = new URLSearchParams(location.search);

    if (!urlParams.has(name))
      return;

    return urlParams.get(name);
  }

  static appendAlert(message, type = 'danger') {
    const alertPlaceholder = document.getElementById('liveAlertPlaceholder')
    const wrapper = document.createElement('div')
    wrapper.innerHTML = [
      `<div class="alert alert-${type} alert-dismissible" role="alert">`,
      `   <div> ${message}</div> `,
      '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
      '</div>'
    ].join('')


    wrapper.style.transition = "1s";
    alertPlaceholder.append(wrapper)

    setTimeout(function () {
      wrapper.style.opacity = "0.2";
    }, 4000);

    setTimeout(function () {
      alertPlaceholder.removeChild(wrapper);
    }, 5000);
  }

  static eventsData(EventTarget, type, listener) {
    if (!new.target)
      return new ParentPage.eventsData(EventTarget, type, listener);
    this.EventTarget = EventTarget;
    this.type = type;
    this.listener = listener;
  }


}
