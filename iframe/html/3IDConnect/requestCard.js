const template = require('./template.js').default
const providerSelect = require('./providerSelect.js').default

const requestCard = (data, isMobile) => template(data, providerSelect(data, isMobile), isMobile)

export default requestCard
