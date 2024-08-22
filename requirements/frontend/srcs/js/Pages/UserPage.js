import ParentPage from "./ParentPage.js";
import ProfilePage from "./ProfilePage.js";

export default class UserPage extends ProfilePage {

  constructor() {
    super();
    this.title = 'User';
    this.locationList = [`home`, `user`];
    this.hasAToken = true;
    this.needToken = true;
    this.isMe = true;
    this.isFreind = true;
    this.isBlock = false;
  }

  checkIsMeOrIsFreind(id, freinds, block) {
    let qid = parseInt(ParentPage.getQeruy('id'));

    this.isMe = true;
    
    if (isNaN(qid))
      return;

    this.isMe = (!qid || id == qid);

    this.id = qid;

    if (this.isMe) {

      return;
    }

    this.isFreind = (!!freinds.find((e) => { return +e?.id === +qid; }));
    this.isBlock = (!!block.find((e) => { return +e?.id === +qid; }));
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
