function addSlashIfNotPresent(str) {
  if (!str.endsWith('/')) {
    str += '/'
  }
  return str
}

module.exports = {
  addSlashIfNotPresent
}
