const notifier = require('node-notifier')

function alramAfterDelay() {
  console.log('alramAfterDelay 함수가 호출되었습니다.')
  // 알림 메시지 표시
  notifier.notify({
    title: `운동 시작 알림`,
    message: `왼쪽부터 운동을 시작합니다.`,
    sound: true,
  })

  setTimeout(() => {
    leftTimeAfterDelay(1)
  }, 5000)
}

const MaxCnt = 4
function leftTimeAfterDelay(cnt) {
  setTimeout(() => {
    rightTimeAfterDelay(cnt)
  }, 180000)

  console.log(`leftTimeAfterDelay: ${cnt} `)
  // 알림 메시지 표시
  notifier.notify({
    title: `왼쪽 운동 시작`,
    message: `왼쪽 시작 - ${cnt}번째.`,
    sound: true,
  })

  setTimeout(() => {
    notifier.notify({
      title: `왼쪽 휴식 시작`,
      message: `왼쪽 휴식 - ${cnt}번째.`,
      sound: true,
    })
  }, 120000)
}

function rightTimeAfterDelay(cnt) {
  if (cnt <= MaxCnt) {
    setTimeout(() => {
      leftTimeAfterDelay(cnt + 1)
    }, 180000)
  }
  console.log(`rightTimeAfterDelay: ${cnt} `)
  // 알림 메시지 표시
  notifier.notify({
    title: `오른쪽 운동 시작`,
    message: `오른쪽 시작 - ${cnt}번째.`,
    sound: true,
  })

  setTimeout(() => {
    if (cnt >= MaxCnt) {
      notifier.notify({
        title: `운동 종료 알림`,
        message: `운동을 종료합니다.`,
        sound: true,
      })
      console.log('운동 종료')
    } else {
      notifier.notify({
        title: `오른쪽 휴식 시작`,
        message: `오른쪽 휴식 - ${cnt}번째.`,
        sound: true,
      })
    }
  }, 120000)
}

module.exports = { alramAfterDelay }
