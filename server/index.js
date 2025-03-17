const express = require('express')
const cors = require('cors')
const { shutdownAfterDelay, shutdownSoon, getRemainedSeconds } = require('./shutdown')
const { alramAfterDelay } = require('./fitnessAlarmTimer')

const app = express()
const port = 3333
let shutdownForBabyMode = true
let fitnessMode = false
const args = process.argv.slice(2)
if (args.length >= 1) {
  if (args[0].toLowerCase() == 'false') {
    shutdownForBabyMode = false
  } else if (args[0].toLowerCase() == 'true') {
    shutdownForBabyMode = true
  } else if (args[0].toLowerCase() == 'fitness') {
    shutdownForBabyMode = false
    fitnessMode = true
  } else {
    console.log('node  index.js  [ shutdownForBabyMode(default: true) ]')
    process.exit(0)
  }
}

app.use(cors())
app.use(express.json())

app.get('/shutdown/:minutes', (req, res) => {
  const shutdownWaits = parseInt(req.params.minutes, 10)
  shutdownAfterDelay(shutdownWaits)
  res.send(`PC is shutting down after ${shutdownWaits} minutes.`)
  //process.exit(shutdownWaits)
})

app.get('/shutdownRemainedMinutes', (req, res) => {
  const remainedSeconds = getRemainedSeconds() - 1
  const remainedMinutes = Math.floor(remainedSeconds / 60)
  const remainedSeconds2 = remainedSeconds % 60
  res.send(`PC is shutting down after ${remainedMinutes} minutes ${remainedSeconds2} seconds.`)
  //res.send(`PC is shutting down after ${remainedMinutes} minutes.`)
})

app.get('/fitnessAlarm', (req, res) => {
  alramAfterDelay()
  res.send(`starting fitnessAlarm.`)
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)

  // 한국 시간으로 저녁 6시가 지났는지 확인하는 if 문 추가
  const now = new Date()
  console.log(`UTC: ${now.getUTCHours()}시 ${now.getUTCMinutes()}분 입니다.`)
  console.log(`Local: ${now.getHours()}시 ${now.getMinutes()}분 입니다.`)

  if (shutdownForBabyMode && now.getHours() >= 18) {
    console.log('shutdownForBabyMode: true')
    shutdownSoon()
  } else {
    shutdownAfterDelay(55)
  }

  // for fitnessAlarmTimer test
  if (fitnessMode) {
    alramAfterDelay()
  }
})
