const express = require('express')

const router = express.Router()

// GET / 라우터
router.get('/', (req, res, next) => {
  res.render('play', { title: '동영상 재생' })
})

module.exports = router
