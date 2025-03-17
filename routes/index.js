const express = require('express')
const os = require('os')

const router = express.Router()

// Function to get the server's IP address
function getServerIp() {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return '127.0.0.1'
}

// GET / 라우터
router.get('/', (req, res, next) => {
  const serverIp = getServerIp()
  res.render('index', { title: 'PC Shutdown Manager', server_ip: serverIp })
})

module.exports = router
