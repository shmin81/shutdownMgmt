const { exec } = require('child_process')
const notifier = require('node-notifier')

let shutdownID = -1
let shutdownID10 = -1
let shutdownID5 = -1
let shutdownID3 = -1
let shutdownID1 = -1

let updatedTime = new Date().getTime()
let shutdownSeconds = 0
function getRemainedSeconds() {
  let currentTime = new Date().getTime() // milliseconds
  let diffTime = currentTime - updatedTime
  let diffTimeSec = Math.floor(diffTime / 1000)
  //console.log(`diffTimeSec: ${diffTimeSec}, ${currentTime} - ${updatedTime} milliseconds`)
  if (diffTimeSec < 1) {
    diffTimeSec = 1
  }
  //console.log(`getRemainedSeconds: ${shutdownSeconds} - ${diffTimeSec} seconds`)
  const remainedSeconds = shutdownSeconds - diffTimeSec > 0 ? shutdownSeconds - diffTimeSec : 0
  return remainedSeconds
}

function checkShutdownCmd() {
  let shutdownCommand = ''
  const platform = process.platform

  if (platform === 'win32') {
    shutdownCommand = 'shutdown.exe /s /f /t 1'
  } else if (platform === 'linux') {
    shutdownCommand = 'sudo shutdown -h +0.1'
  } else if (platform === 'darwin') {
    shutdownCommand = 'sudo shutdown -h +1'
  } else {
    console.error('지원되지 않는 운영 체제입니다.')
  }
  return shutdownCommand
}

function shutdownSoon() {
  console.log('shutdownSoon 함수가 호출되었습니다.')
  // 알림 메시지 표시
  notifier.notify({
    title: `종료 알림`,
    message: `이 PC는 곧 자동으로 종료합니다.`,
    sound: true,
  })

  let shutdownCommand = checkShutdownCmd()

  exec(shutdownCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('Error:', error.message)
      return
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`)
      return
    }
    console.log(`Stdout: ${stdout}`)
  })
}

function shutdownAfterDelay(minutes) {
  console.log(`shutdownAfterDelay: ${minutes} minutes`)
  if (shutdownID !== -1) {
    clearTimeout(shutdownID)
  }
  if (shutdownID10 !== -1) {
    clearTimeout(shutdownID10)
  }
  if (shutdownID5 !== -1) {
    clearTimeout(shutdownID5)
  }
  if (shutdownID3 !== -1) {
    clearTimeout(shutdownID3)
  }
  if (shutdownID1 !== -1) {
    clearTimeout(shutdownID1)
  }

  shutdownSeconds = minutes * 60
  const milliseconds = shutdownSeconds * 1000
  shutdownID = setTimeout(() => {
    //console.log('shutdown.exe /s /f /t 1')
    let shutdownCommand = checkShutdownCmd()
    console.log(`shutdownCommand: ${shutdownCommand}`)
    //exec('shutdown.exe /s /f /t 1', (error, stdout, stderr) => {
    exec(shutdownCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('Error:', error.message)
        return
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`)
        return
      }
      console.log(`Stdout: ${stdout}`)
    })
  }, milliseconds)

  updatedTime = new Date().getTime()

  if (minutes >= 10) {
    shutdownID10 = setTimeout(() => {
      shutdownInfoAfterDelay(10)
      shutdownID10 = -1
    }, milliseconds - 10 * 60 * 1000)
  } else {
    shutdownID10 = -1
  }
  if (minutes >= 5) {
    shutdownID5 = setTimeout(() => {
      shutdownInfoAfterDelay(5)
      shutdownID5 = -1
    }, milliseconds - 5 * 60 * 1000)
  } else {
    shutdownID5 = -1
  }
  if (minutes >= 3) {
    shutdownID3 = setTimeout(() => {
      shutdownInfoAfterDelay(3)
      shutdownID3 = -1
    }, milliseconds - 3 * 60 * 1000)
  } else {
    shutdownID3 = -1
  }
  if (minutes >= 1) {
    shutdownID1 = setTimeout(() => {
      shutdownInfoAfterDelay(1)
      shutdownID1 = -1
    }, milliseconds - 1 * 60 * 1000)
  } else {
    shutdownID1 = -1
  }
}

function shutdownInfoAfterDelay(minutes) {
  console.log(`shutdownInfoAfterDelay: ${minutes} minutes`)
  // 알림 메시지 표시
  notifier.notify({
    title: `${minutes} 분 알림`,
    message: `${minutes} 분 후에 이 PC는 자동으로 종료합니다.`,
    sound: true,
  })
}

module.exports = { shutdownAfterDelay, shutdownSoon, getRemainedSeconds }
