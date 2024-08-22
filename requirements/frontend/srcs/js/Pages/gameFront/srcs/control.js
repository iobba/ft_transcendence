

function control(parent, name, color, v = 'start', h = 'top', dir = 'left') {

  let dirs = {
    'left': `<img style="width: 40px; height: 40px" src="/img/arrow-left.png">
      <img style="width: 40px; height: 40px" src="/img/arrow-right.png">`,
    'up': `<img style="width: 40px; height: 40px" src="/img/arrow-up.png">
      <img style="width: 40px; height: 40px" src="/img/arrow-down.png">`,
    'a': `<img style="width: 40px; height: 40px" src="/img/letter-a.png">
      <img style="width: 40px; height: 40px" src="/img/letter-d.png">`,
    'w': `<img style="width: 40px; height: 40px" src="/img/letter-w.png">
      <img style="width: 40px; height: 40px" src="/img/letter-s.png">`
  };

  let div = document.createElement('div');

  div.className = `d-flex flex-column justify-content-around align-items-center position-absolute rounded-3 m-3 ${h}-0 ${v}-0`;
  div.setAttribute('style', `background: ${color}; width: 100px; height: 70px`);

  div.innerHTML = `
  <div class="d-flex justify-content-around align-items-center" style="text-overflow: ellipsis; max-width: 100%; overflow: hidden" >
    ${name}
  </div>
  <div class="d-flex justify-content-around align-items-center" style="width: 100%;">
    ${dirs[dir]}
  </div>
 `;

  parent.appendChild(div);
}



export default control;
