const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
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

// 클라이언트로 HTML 파일 제공
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'list.html'))
})

const confFile = path.join(__dirname, 'confFile.json')
const requestedMp4File = path.join(__dirname, 'requestedMp4.json')

// 요청 기록을 읽거나 초기화
let requestedMp4 = {}
if (fs.existsSync(requestedMp4File)) {
  requestedMp4 = JSON.parse(fs.readFileSync(requestedMp4File, 'utf8'))
} else {
  fs.writeFileSync(requestedMp4File, JSON.stringify(requestedMp4, null, 2))
}
let conf = { maxMp4Cnt: 2, mp4Root: 'C:/movies/' }
if (!fs.existsSync(confFile)) {
  console.log('confFile.json not found. Using default values.')
  fs.writeFileSync(confFile, JSON.stringify(conf, null, 2))
}
try {
  conf = JSON.parse(fs.readFileSync(confFile, 'utf8'))
} catch (err) {
  console.error('Error reading configuration file:', err)
  process.exit(1)
}

// 동영상 요청 수를 추적하는 변수
let requestedMp4Count = 0
app.get('/video/:name', (req, res) => {
  const fname = req.params.name.endsWith('.mp4') ? req.params.name : `${req.params.name}.mp4`
  const videoPath = path.join(conf.mp4Root, fname)

  console.log('Requested video:', fname)

  if (!fs.existsSync(videoPath)) {
    console.log('Video file not found:', videoPath)
    res.status(404).send('Video file not found.')
    return
  }

  const now = Date.now()

  // 요청 기록 확인
  if (requestedMp4[fname]) {
    const firstRequestTime = requestedMp4[fname]
    const elapsedMinutes = (now - firstRequestTime) / (1000 * 60)

    if (elapsedMinutes <= 30) {
      // 최초 요청 후, 30분 이내에 요청된 경우
      console.log(`Video ${fname} is being served. Elapsed time: ${elapsedMinutes.toFixed(2)} minutes.`)
      res.sendFile(videoPath)
      return
    } else if (elapsedMinutes > 60 * 12) {
      // 12시간 이상 지났다면 요청 기록 초기화 필요
      console.log(`Video ${fname} can be replayed. More than 24 hours have passed.`)
    } else {
      console.log(`Video ${fname} request denied. Elapsed time: ${elapsedMinutes.toFixed(2)} minutes.`)
      res.status(403).send('Access to this video has expired.')
      return
    }
  }
  if (requestedMp4Count >= conf.maxMp4Cnt) {
    console.log(`Video ${fname} request denied. Maximum request count reached.`)
    res.status(403).send('Maximum video request count reached.')
    return
  }
  requestedMp4Count++
  // 처음 요청 기록
  requestedMp4[fname] = now
  fs.writeFileSync(requestedMp4File, JSON.stringify(requestedMp4, null, 2))
  console.log(`First request for video ${fname} recorded.`)
  res.sendFile(videoPath)
})

app.get('/videoDone/:name', (req, res) => {
  const fname = req.params.name.endsWith('.mp4') ? req.params.name : `${req.params.name}.mp4`

  if (requestedMp4[fname]) {
    // 최초 요청 시간을 2시간 전으로 변경
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000 // 2시간 전
    requestedMp4[fname] = twoHoursAgo

    // 변경된 내용을 파일에 저장
    fs.writeFileSync(requestedMp4File, JSON.stringify(requestedMp4, null, 2))
    console.log(`Updated first request time for video ${fname} to 2 hours ago.`)
    res.send(`${fname} played.`)
  } else {
    console.log(`Video ${fname} not found in request records.`)
    res.status(404).send(`Video ${fname} not found in request records.`)
  }
})

app.get('/shutdown/:minutes', (req, res) => {
  const shutdownWaits = parseInt(req.params.minutes, 10)
  shutdownAfterDelay(shutdownWaits)
  res.send(`PC is shutting down after ${shutdownWaits} minutes.`)
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

// mp4 파일 목록을 반환하는 API
app.get('/api/videos', (req, res) => {
  fs.readdir(conf.mp4Root, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err)
      res.status(500).send('Failed to read video directory.')
      return
    }

    // .mp4 파일만 필터링
    const mp4Files = files.filter((file) => file.endsWith('.mp4'))
    res.json(mp4Files)
  })
})

// 정적 파일 제공
app.use(express.static(path.join(__dirname)))

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
