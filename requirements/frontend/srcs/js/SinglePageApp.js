import Events from "./Events.js";
import ParentPage from "./Pages/ParentPage.js";
import SignInPage from "./Pages/SignInPage.js";
import SignUpPage from "./Pages/SignUpPage.js";
import StartPage from "./Pages/StartPage.js";
import HomePage from "./Pages/HomePage.js";
import Login42Page from "./Pages/Login42Page.js";
import SettingPage from "./Pages/SettingPage.js";
import ProfilePage from "./Pages/ProfilePage.js";
import LeaderbordPage from "./Pages/LeaderbordPage.js";
import GamePage from "./Pages/GamePage.js";
import LogoutPage from "./Pages/LogoutPage.js";
import UserPage from "./Pages/UserPage.js";


export default class SinglePageApp {



  constructor() {
    SinglePageApp.refresh();
    this.createRooting();
    this.renderBox = document.getElementById('render-box');
    this.animation = `
      <svg class="ping-pong" viewBox="0 0 128 128" width="128px" height="128px">
        <defs>
          <linearGradient id="ping-pong-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#000" />
            <stop offset="100%" stop-color="#fff" />
          </linearGradient>
          <mask id="ping-pong-mask">
            <rect x="0" y="0" width="128" height="128" fill="url(#ping-pong-grad)" />
          </mask>
        </defs>
        <g fill="var(--primary)">
          <g class="ping-pong__ball-x">
            <circle class="ping-pong__ball-y" r="10" />
          </g>
          <g class="ping-pong__paddle-x">
            <rect class="ping-pong__paddle-y" x="-30" y="-2" rx="1" ry="1" width="60" height="4" />
          </g>
        </g>
        <g fill="hsl(163,90%,40%)" mask="url(#ping-pong-mask)">
          <g class="ping-pong__ball-x">
            <circle class="ping-pong__ball-y" r="10" />
          </g>
          <g class="ping-pong__paddle-x">
            <rect class="ping-pong__paddle-y" x="-30" y="-2" rx="1" ry="1" width="60" height="4" />
          </g>
        </g>
      </svg>`;
    this.render();
    this.listenToChangePage();
    this.listenToBack();
    this.events = new Events();
  }


  /**
   * creat a map of roots for the web site
   */

  createRooting() {
    this.Roots = new Map(
      [
        ['/', new StartPage()],
        ['/sign-in', new SignInPage()],
        ['/sign-up', new SignUpPage()],
        ['/42login', new Login42Page()],
        ['/home', new HomePage()],
        ['/leaderbord', new LeaderbordPage()],
        ['/game', new GamePage()],
        ['/profile', new ProfilePage()],
        ['/setting', new SettingPage()],
        ['/user', new UserPage()],
        ['/logout', new LogoutPage()],
      ]
    );
  }

  /**
   * change the page to a new page
   */

  async navigateTo(newPath) {
    history.pushState(null, null, newPath);
    await this.render();
  }

  /**
   * listen for back in history 
   */

  listenToBack() {
    window.onpopstate = () => this.render();
  }

  /**
   * listen to click in local url to render data 
   */

  listenToChangePage() {
    document.addEventListener('click', (eventObj) => {
      let targetElement = eventObj?.target;

      while (targetElement && targetElement !== document?.body) {
        if (targetElement?.tagName?.toLowerCase() === 'a') {
          break;
        }

        targetElement = targetElement?.parentNode;
      }

      let attr = targetElement?.attributes;

      if (!attr || typeof attr != 'object')
        return;

      console.log('targetElement', targetElement);

      // console.log(attr);

      if ('local-link' in attr) {
        // Prevent the event from bubbling up the DOM tree
        eventObj.stopPropagation();
        eventObj.preventDefault();
        this.navigateTo(attr?.href?.value)
      }
    });
  }

  /**
   * render the content of the page 
   */

  async render() {

    // creat animation

    // remove back mask
    let elemment = document.getElementsByClassName('modal-backdrop');
    while (elemment.length > 0)
      elemment[0]?.parentNode?.removeChild(elemment[0]);

    this?.page?.removeEventListener();

    if (this.Roots.has(location.pathname)) {

      console.log('change to', location.pathname);

      this.renderBox.innerHTML = this.animation;
      this.page = this.Roots.get(location.pathname);
      try {
        let dom = (await this?.page?.renderPage());
        this.renderBox.innerHTML = '';
        this.renderBox.appendChild(dom);
        await this?.page?.addEventListener();
      }
      catch (e) {
        if (e?.redirect) {
          this.navigateTo(e?.redirectTo);
        }
        if (e?.type)
          ParentPage.appendAlert(e?.message, e?.type);
        else
          ParentPage.appendAlert(e?.message);
      }
    }
    else {
      this.page = null;
      this.renderBox.innerHTML = '<h1> NOT FOUND </h1>';
      console.log('NOT FOUND');
    }

  }

  static webSocket = null;

  static async refresh(callback = true) {
    console.log('refresh Token', new Date());
    let request = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `mutation ($token: String!) {
          refreshToken(token: $token) {
            message
            success
            token
          }
        }`,
        variables: {
          token: `${ParentPage.getCookie("token")}`
        },
      }),
    };

    try {

      let responce = await fetch('/api/users', request);

      let jsonBody = null;
      if (responce?.ok) {
        jsonBody = await responce?.json();
      }

      if (jsonBody && jsonBody?.data?.refreshToken?.success === true) {
        ParentPage.setCookie("token", jsonBody?.data?.refreshToken?.token, { "Expires": new Date(Date.now() + 24 * (60 * 60 * 1000)) });
        const tmpSocket = new WebSocket(`wss://${location.host}/ws/user-activity`);
        if (SinglePageApp.webSocket) {
          SinglePageApp.webSocket.close();
          SinglePageApp.webSocket = null;
        }
        SinglePageApp.webSocket = tmpSocket;
      }
      else if (SinglePageApp.webSocket) {
        SinglePageApp.webSocket.close();
        SinglePageApp.webSocket = null;
      }
    }
    catch (err) {
      console.log(err.message);
      if (SinglePageApp.webSocket) {
        SinglePageApp.webSocket.close();
        SinglePageApp.webSocket = null;
      }
    }
    if (callback)
      setTimeout(SinglePageApp.refresh, 60000);
  }

}
