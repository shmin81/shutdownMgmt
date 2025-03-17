const express = require('express')
const cors = require('cors')
const { shutdownAfterDelay, shutdownSoon, getRemainedSeconds } = require('./shutdown')

const app = express()
const port = 3333

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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)

  // 한국 시간으로 저녁 6시가 지났는지 확인하는 if 문 추가
  const now = new Date()
  console.log(`UTC ${now.getUTCHours()}시 ${now.getUTCMinutes()}분입니다.`)
  console.log(`Seoul ${now.getHours()}시 ${now.getMinutes()}분입니다.`)
  //const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000) // UTC+9 시간대
  if (now.getHours() >= 18) {
    console.log('한국 시간으로 저녁 6시가 지났습니다.')
    shutdownSoon()
  } else {
    console.log('한국 시간으로 아직 저녁 6시가 지나지 않았습니다.')
    shutdownAfterDelay(55)
  }
})
