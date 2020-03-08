const style = require('style-loader!./style.less')

const requestTemplate = (data) => `
  ${header(data)}
  <div id='${style.requestBox}'>
    <div id='${style.requestHeader}'>
      <span> This allows ${data.request.origin} to read and write data to the following locations </span>
    </div>
    <div id='${style.requestSpaces}'
      ${spaces(data.request.spaces)}
    </div>
    <div id='${style.buttonFooter}'>
      <button id="accept" type="button" class="btn btn-primary">Yes</button>
      <button id="decline" type="button" class="btn btn-primary">No</button>
    </div>
  </div>
`

const spaces = (spaces) => {
  console.log(spaces)
  return spaces.map(spaceLine).reduce((acc, val) => acc + val, ``)
}

const spaceLine = (spaceName) => `
  <div class='${style.spaceLine}'>
    <div class='${style.spaceName}'>
      ${spaceName}
    </div>
    <div class='${style.access}'>
      <span> Allowed </span>
    </div>
  </div>
`

const header = (data) => `
  <div id='${style.page}'>
    <h3> Request </h3>
    <div class='${style.requestOrigin}'>
      ${data.request.origin}
    </div>
    </div class='${style.subHeader}'>
      <span> wants to request access to your 3ID </span>
    </div>
  </div>
`


export default requestTemplate
