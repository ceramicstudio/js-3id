const template = require('./template.js').default
const providerSelect = require('./providerSelect.js').default

const requestCard = (data) => template(data, providerSelect(data))

export default requestCard
