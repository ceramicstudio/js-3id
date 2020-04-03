const style = require('style-loader!../../style.scss')

const capitalizeFirst = string => string.charAt(0).toUpperCase() + string.slice(1)

const template = (data, content) => `
  <div class=${style.card}>
    <div class=${style.controls}>
      <img src='https://i.imgur.com/uRCbJMP.png' class='${style.controls_logo}' />

      <div class='${style.close}' onClick="hideIframe()">
        <div class='${style.close_line} ${style.flip}'></div>
        <div class='${style.close_line}'></div>
      </div>
    </div>

    <div class='${style.content}'>
      <div class='${style.header}'>
        <div class='${style.headerLogo}'></div>
        <div class='${style.headerText}'>
          <div class='${style.primary}'> 
            ${data.request.origin} 
          </div>
          <p class='${style.sub}'> wants to access your data </p>
        </div>

        <div class='${style.promptText}'>
          <div class='${style.subText}'>
            <p>
            <span>${capitalizeFirst(data.request.origin)}</span> uses 3ID to give you privacy and control over your data.  
            This app wants to access: 3Box, Gitcoin, MyFollowing, DappHero, WeirdSpace, SpaceInvaders, MyNotes.
            </p>
          </div>
        </div>
      </div>
      <div class='${style.promptBox}'>
        ${content}
      </div>
    </div>
  </div>
  <div class='${style.onClickOutside}' id='onClickOutside' onClick="handleOpenWalletOptions()"></div>
`

// ${data.name ? profile(data) : ``}

const profile = (data) => `
  <div class='${style.headerProfile}'>
    <img class='${style.img}' src='${data.imgUrl}'> </img>
    <div class='${style.name}'> ${data.name} </div>
  </div>
`

export default template