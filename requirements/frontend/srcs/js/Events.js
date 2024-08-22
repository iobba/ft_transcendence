export default class Events {

  constructor() {
    // this.cursorFollow();
    // this.changePage();
  }





  /**
   * cursor effect follow 
   */

  cursorFollow() {
    this.cursor = document.getElementById("cursor");

    // follow cursor on mousemove
    document.addEventListener("mousemove", (e) => {

      if (!this.cursor)
        return;

      let x = e.pageX;
      let y = e.pageY;

      this.cursor.style.top = y + "px";
      this.cursor.style.left = x + "px";
      this.cursor.style.display = "block";
    });

    // cursor effects when mouseout
    document.addEventListener("mouseout", () => {

      if (!this.cursor)
        return;

      this.cursor.style.display = "none";
      // console.log("mouse out");
    });
  }
}
