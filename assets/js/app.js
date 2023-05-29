import { songs } from './playlist.js'
const $ = document.querySelector.bind(document),
  $$ = document.querySelectorAll.bind(document),
  cd = $('.cd'),
  heading = $('header h2'),
  singerTitle = $('header h4'),
  cdThumb = $('.cd-thumb'),
  audio = $('#audio'),
  playBtn = $('.btn-toggle-play'),
  player = $('.player'),
  nextBtn = $('.btn-next'),
  prevBtn = $('.btn-prev'),
  randomBtn = $('.btn-random'),
  repeatBtn = $('.btn-repeat'),
  playlist = $('.playlist'),
  progressArea = $(".progress-area")

const app = {
  isPaused: false,
  isRandom: false,
  currentIndex: 0,
  playedSongs: [],
  songs: songs,

  loadSongDurations: function () {
    this.songs.forEach(song => {
      const audio = new Audio(song.path)
      audio.addEventListener('loadedmetadata', () => {
        song.duration = audio.duration
        this.render()
      })
    })
  },

  render: function () {
    const htmls = [`<div class="up-next">Playlist (${this.songs.length} songs)</div>`]
    htmls.push(...this.songs.map((song, index) => {
      const duration = song.duration ? this.formatTime(song.duration) : '--:--'
      return ` 
        <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}"> 
          <div class="song-info">
            <div class="thumb" style="background-image: url('${song.image}')"></div> 
            <div class="body"> 
              <h3 class="title">${song.name}</h3> 
              <p class="author">${song.singer}</p>
            </div> 
            <div class="option active"> 
              <p class="song-duration">${duration}</p> 
            </div> 
          </div>
          <div class="lyrics ${index === this.currentIndex ? 'active' : ''}"></div>
        </div>
      `
    }))
    playlist.innerHTML = htmls.join("\n")

    // Xóa nội dung lời bài hát của tất cả các phần tử .lyrics
    const lyricsElements = $$('.lyrics')
    lyricsElements.forEach(element => {
      element.innerHTML = ''
    })
    // Đọc nội dung file lời bài hát và cập nhật cho thẻ div
    const currentSong = this.songs[this.currentIndex]
    if (currentSong.lyrics) {
      fetch(currentSong.lyrics)
        .then(response => response.text())
        .then(text => {
          // Thay thế ký tự xuống dòng bằng thẻ <br>
          const formattedText = text.replace(/\n/g, '<br>')
          $('.lyrics.active').innerHTML = formattedText
        })
    }

    // Lấy thông tin bài hát đang active
    const activeSongNode = $('.song.active')

    // Set Tiêu Đề Website Thành Tên Bài Hát Hiện Tại
    document.title = `${this.currentSong.name} - ${this.currentSong.singer}`

    // Kiểm tra xem bài hát hiện tại có lyrics hay không
    if (currentSong.lyrics) {
      // Nếu có lyrics, đọc nội dung file lời bài hát và cập nhật cho thẻ div
      fetch(currentSong.lyrics)
        .then(response => response.text())
        .then(text => {
          // Thay thế ký tự xuống dòng bằng thẻ <br>
          const formattedText = text.replace(/\n/g, '<br>')
          activeSongNode.querySelector('.lyrics').classList.add('active')
          activeSongNode.querySelector('.lyrics').style.textAlign = 'center'
          activeSongNode.querySelector('.lyrics').style.height = '33px'
          activeSongNode.querySelector('.lyrics').innerHTML = `Show Lyrics<br>${formattedText}`
        })
    } else {
      // Nếu không có lyrics, gỡ bỏ class active khỏi .lyrics
      activeSongNode.querySelector('.lyrics').classList.remove('active')
    }

    // Xử Lý Khi Bài Hát Không Có Ảnh Album Dashboard
    const cdThumbImg = $('.cd-thumb img')
    const currentSongAlbumImage = this.songs[this.currentIndex]
    if (currentSongAlbumImage.image) {
      cdThumbImg.style.display = 'none'
    } else {
      cdThumbImg.style.display = 'block'
    }

    // // Xử Lý Khi Ảnh Album Ở Playlist Của Song Không Tồn Tại
    // const defaultCdThumbImage = './assets/img/album-art/default-album-art.jpg'
    // const cdThumb = $('.cd-thumb img')
    // const songThumb = $('.song .thumb')

    // if (currentSong.image) {
    //   cdThumb.src = currentSong.image
    //   cdThumb.style.display = 'none'
    //   songThumb.style.backgroundImage = `url('${currentSong.image}')`
    //   songThumb.style.backgroundSize = 'cover'
    //   songThumb.style.backgroundPosition = '100% 100%'
    // } else {
    //   cdThumb.src = defaultCdThumbImage
    //   cdThumb.style.display = 'block'
    //   songThumb.style.backgroundImage = `url('${defaultCdThumbImage}')`
    // }
  },

  formatTime: function (time) {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  },

  loadCurrentSong: function () {
    // this.updateActiveSong()
    heading.textContent = this.currentSong.name
    singerTitle.textContent = this.currentSong.singer
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
    audio.src = this.currentSong.path

    // Xử Lý Khi Bài Hát Không Có Ảnh Album
    const cdThumbImg = $('.cd-thumb img')
    const currentSongAlbumImage = this.songs[this.currentIndex]
    if (currentSongAlbumImage.image) {
      cdThumbImg.style.display = 'none'
    } else {
      cdThumbImg.style.display = 'block'
    }

    // Xử Lý Khi Bài Hát Không Có Lyrics Thì Ẩn Nút Lời Bài Hát Trèn Dashboard
    if (!this.currentSong.lyrics) {
      $('.lyrics-show-btn').style.width = 'none'
    } else {
      $('.lyrics-btn').style.display = 'flex'
    }

    // Set Tiêu Đề Website Thành Tên Bài Hát Hiện Tại
    document.title = `${this.currentSong.name} - ${this.currentSong.singer}`
  },
  handleEvent: function (e) {
    // Hiển thị tổng thời gian bài hát trước khi đếm ngược (Playing)
    audio.addEventListener('loadedmetadata', function () {
      const duration = audio.duration
      const minutes = Math.floor(duration / 60)
      const seconds = Math.floor(duration % 60)
      const formattedDuration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

      // Lấy phần tử .song-duration của bài hát đang active
      const songDurationElement = document.querySelector('.song.active .song-duration')
      if (songDurationElement) {
        songDurationElement.textContent = formattedDuration
      }
    })

    // Đếm ngược thời gian bài hát ở Playlist
    audio.addEventListener('timeupdate', function () {
      const duration = audio.duration
      const currentTime = audio.currentTime
      const timeLeft = duration - currentTime
      const minutes = Math.floor(timeLeft / 60)
      const seconds = Math.floor(timeLeft % 60)
      const formattedTimeLeft = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      // Lấy phần tử .song-duration của bài hát đang active
      const songDurationElement = document.querySelector('.song.active .song-duration')
      if (songDurationElement) {
        songDurationElement.textContent = formattedTimeLeft
      }
    })

    const _this = this
    // Xử Lý Khi Click Nút Play / Pause
    playBtn.onclick = function () {
      !_this.isPaused ? audio.play() : audio.pause()
    }

    // Xử Lý Khi CLick và cdThumb sẽ Play / Pause
    cdThumb.onclick = function (event) {
      !_this.isPaused ? audio.play() : audio.pause()
      event.preventDefault()
    }

    // Xử Lý Khi Play / Pause
    let songThumbAnimate // Khai báo biến songThumbAnimate ở global scope
    let songThumbAnimateTime = 0 // Khai báo biến để lưu trữ thời gian của animate

    audio.onplay = function () {
      _this.isPaused = true
      player.classList.add('playing')
      cd.classList.add('cd-play')
      progressArea.classList.add('area-play')
      const songThumb = $('.song.active .thumb')
      if (!songThumbAnimate || songThumbAnimate.target !== songThumb) {
        if (songThumbAnimate) {
          songThumbAnimate.cancel()
        }
        songThumbAnimate = songThumb.animate(
          [{ transform: 'rotate(360deg)' }],
          {
            duration: 3100,
            iterations: Infinity,
          }
        )
        songThumbAnimate.currentTime = songThumbAnimateTime // Khôi phục thời gian animate
      } else {
        const currentTime = songThumbAnimate.currentTime
        songThumbAnimate.play()
        songThumbAnimate.currentTime = currentTime
      }
    }

    audio.onpause = function () {
      _this.isPaused = false
      player.classList.remove('playing')
      cd.classList.remove('cd-play')
      progressArea.classList.remove('area-play')
      if (songThumbAnimate) {
        songThumbAnimateTime = songThumbAnimate.currentTime // Lưu trữ thời gian animate
        songThumbAnimate.pause()
      }
    }

    const progressBar = $('.progress-bar')
    const musicCurrentTime = $('.current-time')
    const musicDuration = $('.max-duration')

    // Cập nhật thanh progress-bar theo thời gian hiện tại của bài hát
    audio.addEventListener('timeupdate', (e) => {
      const currentTime = e.target.currentTime
      const duration = e.target.duration
      const progressPercent = (currentTime / duration) * 100
      progressBar.style.width = `${progressPercent}%`

      // Cập nhật tổng thời lượng bài hát
      if (!isNaN(duration)) {
        let totalMin = Math.floor(duration / 60)
        let totalSec = Math.floor(duration % 60)
        if (totalMin < 10) {
          totalMin = `0${totalMin}`
        }
        if (totalSec < 10) {
          totalSec = `0${totalSec}`
        }
        musicDuration.innerText = `${totalMin}:${totalSec}`
      }

      // Cập nhật thời gian hiện tại của bài hát
      let currentMin = Math.floor(currentTime / 60)
      let currentSec = Math.floor(currentTime % 60)
      if (currentMin < 10) {
        currentMin = `0${currentMin}`
      }
      if (currentSec < 10) {
        currentSec = `0${currentSec}`
      }
      musicCurrentTime.innerText = `${currentMin}:${currentSec}`
    })

    // Cập nhật tổng thời lượng bài hát khi metadata được tải về
    audio.addEventListener('loadedmetadata', (e) => {
      const duration = e.target.duration

      // Cập nhật tổng thời lượng bài hát
      if (!isNaN(duration)) {
        let totalMin = Math.floor(duration / 60)
        let totalSec = Math.floor(duration % 60)
        if (totalMin < 10) {
          totalMin = `0${totalMin}`
        }
        if (totalSec < 10) {
          totalSec = `0${totalSec}`
        }
        musicDuration.innerText = `${totalMin}:${totalSec}`
      }
    })

    // Cập nhật thời gian còn lại của bài hát trong sự kiện timeupdate
    audio.addEventListener('timeupdate', function () {
      const duration = audio.duration
      if (!isNaN(duration)) {
        const currentTime = audio.currentTime
        const timeLeft = duration - currentTime
        const minutes = Math.floor(timeLeft / 60)
        const seconds = Math.floor(timeLeft % 60)
        const formattedTimeLeft = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        // Cập nhật thời gian còn lại vào phần tử hiển thị tổng thời lượng của bài hát
        musicDuration.innerText = formattedTimeLeft
      } else {
        // Hiển thị giá trị mặc định hoặc không hiển thị gì cả
        musicDuration.innerText = '--:--'
      }
    })

    // Cho phép người dùng tua bài hát bằng cách kéo thanh progress-bar
    progressBar.parentElement.onclick = function (e) {
      const width = this.offsetWidth
      const clickedWidth = e.offsetX
      const progressPercent = (clickedWidth / width) * 100
      const seekTime = (audio.duration / 100) * progressPercent
      audio.currentTime = seekTime
    }

    // Bắt đầu kéo thanh progress-bar
    let isProgressDragging = false

    function handleProgressMouseDown(e) {
      e.preventDefault()
      isProgressDragging = true
      updateProgress(e)
    }

    function handleProgressMouseMove(e) {
      e.preventDefault()
      if (isProgressDragging) {
        updateProgress(e)
      }
    }

    function handleProgressMouseUp() {
      isProgressDragging = false
    }

    progressBar.parentElement.addEventListener('mousedown', handleProgressMouseDown)
    progressBar.parentElement.addEventListener('touchstart', handleProgressMouseDown)

    progressBar.parentElement.addEventListener('mousemove', handleProgressMouseMove)
    progressBar.parentElement.addEventListener('touchmove', handleProgressMouseMove)

    document.addEventListener('mouseup', handleProgressMouseUp)
    document.addEventListener('touchend', handleProgressMouseUp)

    // Cập nhật tiến độ của bài hát khi kéo thanh progress-bar
    function updateProgress(e) {
      const width = progressBar.parentElement.offsetWidth
      let clientX = e.clientX
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX
      }
      const clickedWidth = clientX - progressBar.parentElement.getBoundingClientRect().left
      const progressPercent = (clickedWidth / width) * 100
      const seekTime = (audio.duration / 100) * progressPercent
      audio.currentTime = seekTime
    }

    // Xử Lý Khi Click Next Song
    nextBtn.onclick = function () {
      // Cuộn danh sách phát để đưa bài hát đang phát lên giữa
      const activeSongNode = $('.song.active')
      if (activeSongNode) {
        const activeSongNodeOffsetTop = activeSongNode.offsetTop
        const activeSongNodeHeight = activeSongNode.offsetHeight
        const playlistNodeHeight = playlist.offsetHeight
        const scrollOffset =
          activeSongNodeOffsetTop -
          (playlistNodeHeight - activeSongNodeHeight) / 2 +
          72
        playlist.scrollTo({ top: scrollOffset, behavior: 'smooth' })
      }

      if (_this.isRandom) {
        _this.playRandomSong()
        !_this.isPaused ? audio.pause() : audio.play()
        if (songThumbAnimate) {
          songThumbAnimate.currentTime = 0
          songThumbAnimate.cancel()
        }
        _this.updateActiveSong()

        // Lấy thông tin bài hát đang active
        const activeSongNode = $('.song.active')
        const currentIndex = activeSongNode.dataset.index
        const currentSong = _this.songs[currentIndex]

        // Xóa nội dung lời bài hát của tất cả các phần tử .lyrics
        const lyricsElements = $$('.lyrics')
        lyricsElements.forEach(element => {
          element.innerHTML = ''
          element.style.height = ''
          element.classList.remove('active')
        })

        // Đọc nội dung file lời bài hát và cập nhật cho thẻ div
        if (currentSong.lyrics) {
          fetch(currentSong.lyrics)
            .then(response => response.text())
            .then(text => {
              // Thay thế ký tự xuống dòng bằng thẻ <br>
              const formattedText = text.replace(/\n/g, '<br>')
              activeSongNode.querySelector('.lyrics').innerHTML = `Show Lyrics<br>${formattedText}`
              activeSongNode.querySelector('.lyrics').style.height = '33px'
              activeSongNode.querySelector('.lyrics').style.textAlign = 'center'
              activeSongNode.querySelector('.lyrics').classList.add('active')
            })
        }
        // Cuộn danh sách phát để đưa bài hát đang phát lên giữa
        if (activeSongNode) {
          const activeSongNodeOffsetTop = activeSongNode.offsetTop
          const activeSongNodeHeight = activeSongNode.offsetHeight
          const playlistNodeHeight = playlist.offsetHeight
          const scrollOffset =
            activeSongNodeOffsetTop -
            (playlistNodeHeight - activeSongNodeHeight) / 2 + 15
          playlist.scrollTo({ top: scrollOffset, behavior: 'smooth' })
        }
      } else {
        _this.nextSong()
        if (songThumbAnimate) {
          songThumbAnimate.currentTime = 0
          songThumbAnimate.cancel()
        }
        _this.updateActiveSong()

        // Lấy thông tin bài hát đang active
        const activeSongNode = $('.song.active')
        const currentIndex = activeSongNode.dataset.index
        const currentSong = _this.songs[currentIndex]

        // Xóa nội dung lời bài hát của tất cả các phần tử .lyrics
        const lyricsElements = $$('.lyrics')
        lyricsElements.forEach(element => {
          element.innerHTML = ''
          element.style.height = ''
          element.classList.remove('active')
        })

        // Đọc nội dung file lời bài hát và cập nhật cho thẻ div
        if (currentSong.lyrics) {
          fetch(currentSong.lyrics)
            .then(response => response.text())
            .then(text => {
              // Thay thế ký tự xuống dòng bằng thẻ <br>
              const formattedText = text.replace(/\n/g, '<br>')
              activeSongNode.querySelector('.lyrics').innerHTML = `Show Lyrics<br>${formattedText}`
              activeSongNode.querySelector('.lyrics').style.height = '33px'
              activeSongNode.querySelector('.lyrics').style.textAlign = 'center'
              activeSongNode.querySelector('.lyrics').classList.add('active')
            })
        }
      }
    }

    // Xử Lý Khi Click Prev Song
    prevBtn.onclick = function () {
      // Cuộn danh sách phát để đưa bài hát đang phát lên giữa
      const activeSongNode = $('.song.active')
      if (activeSongNode) {
        const activeSongNodeOffsetTop = activeSongNode.offsetTop
        const activeSongNodeHeight = activeSongNode.offsetHeight
        const playlistNodeHeight = playlist.offsetHeight
        const scrollOffset =
          activeSongNodeOffsetTop -
          (playlistNodeHeight - activeSongNodeHeight) / 2 - 80
        playlist.scrollTo({ top: scrollOffset, behavior: 'smooth' })
      }

      if (_this.isRandom) {
        _this.playRandomSong()
        // progress.value = 0
        !_this.isPaused ? audio.pause() : audio.play()
        if (songThumbAnimate) {
          songThumbAnimate.currentTime = 0
          songThumbAnimate.cancel()
        }
        _this.updateActiveSong()

        // Lấy thông tin bài hát đang active
        const activeSongNode = $('.song.active')
        const currentIndex = activeSongNode.dataset.index
        const currentSong = _this.songs[currentIndex]

        // Xóa nội dung lời bài hát của tất cả các phần tử .lyrics
        const lyricsElements = $$('.lyrics')
        lyricsElements.forEach(element => {
          element.innerHTML = ''
          element.style.height = ''
          element.classList.remove('active')
        })

        // Đọc nội dung file lời bài hát và cập nhật cho thẻ div
        if (currentSong.lyrics) {
          fetch(currentSong.lyrics)
            .then(response => response.text())
            .then(text => {
              // Thay thế ký tự xuống dòng bằng thẻ <br>
              const formattedText = text.replace(/\n/g, '<br>')
              activeSongNode.querySelector('.lyrics').innerHTML = `Show Lyrics<br>${formattedText}`
              activeSongNode.querySelector('.lyrics').style.height = '33px'
              activeSongNode.querySelector('.lyrics').style.textAlign = 'center'
              activeSongNode.querySelector('.lyrics').classList.add('active')
            })
        }
        // Cuộn danh sách phát để đưa bài hát đang phát lên giữa
        if (activeSongNode) {
          const activeSongNodeOffsetTop = activeSongNode.offsetTop
          const activeSongNodeHeight = activeSongNode.offsetHeight
          const playlistNodeHeight = playlist.offsetHeight
          const scrollOffset =
            activeSongNodeOffsetTop -
            (playlistNodeHeight - activeSongNodeHeight) / 2 + 15
          playlist.scrollTo({ top: scrollOffset, behavior: 'smooth' })
        }
      } else {
        _this.prevSong()
        if (songThumbAnimate) {
          songThumbAnimate.currentTime = 0
          songThumbAnimate.cancel()
        }
        _this.updateActiveSong()

        // Lấy thông tin bài hát đang active
        const activeSongNode = $('.song.active')
        const currentIndex = activeSongNode.dataset.index
        const currentSong = _this.songs[currentIndex]

        // Xóa nội dung lời bài hát của tất cả các phần tử .lyrics
        const lyricsElements = $$('.lyrics')
        lyricsElements.forEach(element => {
          element.innerHTML = ''
          element.style.height = ''
          element.classList.remove('active')
        })

        // Đọc nội dung file lời bài hát và cập nhật cho thẻ div
        if (currentSong.lyrics) {
          fetch(currentSong.lyrics)
            .then(response => response.text())
            .then(text => {
              // Thay thế ký tự xuống dòng bằng thẻ <br>
              const formattedText = text.replace(/\n/g, '<br>')
              activeSongNode.querySelector('.lyrics').innerHTML = `Show Lyrics<br>${formattedText}`
              activeSongNode.querySelector('.lyrics').style.height = '33px'
              activeSongNode.querySelector('.lyrics').style.textAlign = 'center'
              activeSongNode.querySelector('.lyrics').classList.add('active')
            })
        }
      }
    }

    // Xử Lý Khi On / Off Random
    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom
      randomBtn.classList.toggle('active', _this.isRandom)
    }

    // Xử Lý Khi On / Off repeat
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat
      repeatBtn.classList.toggle('active', _this.isRepeat)
    }

    // Xử Lý Khi Bài Hát Phát Hết Đến Cuối
    audio.addEventListener('ended', function () {
      if (_this.isRepeat) {
        audio.play()
      } else {
        nextBtn.click()// Gọi hàm render
        _this.render()
        setTimeout(function () {
          audio.play()
        }, 1000)
      }
    })

    playlist.onclick = function (e) {
      if (e.target.classList.contains('lyrics')) {

        const lyricsElement = e.target
        const lyricsContainer = lyricsElement.parentNode
        const isExpanded = lyricsContainer.classList.contains('expanded')

        if (isExpanded) {
          lyricsContainer.classList.remove('expanded')
          lyricsElement.style.height = ''
          lyricsElement.style.textAlign = 'center'
          lyricsElement.innerHTML = 'Show Lyrics'

        } else {
          const songNode = lyricsElement.closest('.song')
          const currentSongIndex = songNode.dataset.index
          const currentSong = _this.songs[currentSongIndex]
          // const currentSongName = currentSong.name

          if (currentSong.lyrics) {
            fetch(currentSong.lyrics)
              .then(response => response.text())
              .then(text => {
                const formattedText = text.replace(/\n/g, '<br>')
                lyricsElement.innerHTML = `<b>Lời bài hát:</b> <b>${_this.currentSong.name}</b><br><br>${formattedText}`
                lyricsElement.style.height = lyricsElement.scrollHeight + 'px'
                lyricsElement.style.textAlign = 'left'
                lyricsContainer.classList.add('expanded')
              })
          } else {
            lyricsElement.innerHTML = 'Lời bài hát không khả dụng!'
          }
        }
      } else if (e.target.closest('.song')) {
        const songNode = e.target.closest('.song')
        const index = songNode.dataset.index
        if (index === _this.currentIndex) {
          if (e.target.closest('.song-info')) {
            if (audio.paused) {
              audio.play()
            } else {
              audio.pause()
            }
          }
        } else {
          _this.currentIndex = index
          _this.loadCurrentSong()
          audio.play()

          // Thêm class active vào bài hát đang phát và gỡ bỏ active khỏi bài hát trước đó
          const activeSongNode = $('.song.active')
          if (activeSongNode) {
            activeSongNode.classList.remove('active')
            // Gỡ bỏ class active khỏi .lyrics của bài hát trước đó
            activeSongNode.querySelector('.lyrics').classList.remove('active')
          }
          songNode.classList.add('active')

          // Xóa nội dung lời bài hát của tất cả các phần tử .lyrics
          const lyricsElements = $$('.lyrics')
          lyricsElements.forEach(element => {
            element.innerHTML = ''
            element.style.height = ''
          })

          // Căn giữa nội dung lyrics khi click vào bài hát lần đầu tiên
          const lyricsNode = songNode.querySelector('.lyrics')
          lyricsNode.style.textAlign = 'center'

          // Đọc nội dung file lời bài hát và cập nhật cho thẻ div
          const currentSong = _this.songs[_this.currentIndex]
          if (currentSong.lyrics) {
            fetch(currentSong.lyrics)
              .then(response => response.text())
              .then(text => {
                // Thay thế ký tự xuống dòng bằng thẻ <br>
                const formattedText = text.replace(/\n/g, '<br>')
                songNode.querySelector('.lyrics').innerHTML = `Show Lyrics<br>${formattedText}`
                songNode.querySelector('.lyrics').style.height = '33px'
                // Thêm class active vào .lyrics của bài hát đang phát
                songNode.querySelector('.lyrics').classList.add('active')
              })
          }
          // Cuộn danh sách phát để đưa bài hát đang phát lên giữa
          const activeSongNodeOffsetTop = songNode.offsetTop
          const activeSongNodeHeight = songNode.offsetHeight
          const playlistNodeHeight = playlist.offsetHeight
          const scrollOffset =
            activeSongNodeOffsetTop -
            (playlistNodeHeight - activeSongNodeHeight) / 2 +
            18
          playlist.scrollTo({ top: scrollOffset, behavior: 'smooth' })
        }
      }
    }

    // XỬ LÝ TĂNG GIẢM VOLUME
    const audioElement = $('audio')
    const volumeControl = $('.progress-vol-area')
    const progressVolBar = $('.progress-vol-bar')
    let isVolDragging = false

    function handleMouseDown(event) {
      event.preventDefault()
      isVolDragging = true
      updateVolume(event)
    }

    function handleMouseMove(event) {
      event.preventDefault()
      if (isVolDragging) {
        updateVolume(event)
      }
    }

    function handleMouseUp() {
      isVolDragging = false
    }

    volumeControl.addEventListener('mousedown', handleMouseDown)
    volumeControl.addEventListener('touchstart', handleMouseDown)

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('touchmove', handleMouseMove)

    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchend', handleMouseUp)

    function updateVolume(e) {
      const volumeControlRect = volumeControl.getBoundingClientRect()
      let clientX = e.clientX
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX
      }
      const position = clientX - volumeControlRect.left
      const totalWidth = volumeControl.offsetWidth
      let volume = position / totalWidth
      volume = Math.max(0, volume)
      volume = Math.min(1, volume)
      audioElement.volume = volume
      progressVolBar.style.width = volume * 100 + '%'
    }
    audioElement.volume = 0.3
    progressVolBar.style.width = '30%'

    // Xử Lý Khi Click Vào Nút Lời bài Hát Trên Dashboard
    const lyricsShowBtn = $('.lyrics-show-btn')
    lyricsShowBtn.addEventListener('click', function () {
      const activeSongNode = $('.song.active')
      if (activeSongNode) {
        activeSongNode.scrollIntoView({ block: 'center' })
      }
    })

    // Xử Lý Khi Click Vào Mũi Tên Để Cuộn Lên Đầu Trang (Dashboard)
    const scrollTopBtn = $('.scroll-top-btn')
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })

    // Xử Lý Khi Cuộn Lên 300px Thì Mới Hiển Thị Nút Scroll To Top
    const scrollThreshold = 400 // Khoảng cách cuộn tối thiểu để hiển thị nút scroll-top-btn
    window.addEventListener('scroll', function () {
      if (window.scrollY >= scrollThreshold) {
        scrollTopBtn.style.display = 'block'
      } else {
        scrollTopBtn.style.display = 'none'
      }
    })

    // // Xử Lý Khi Ảnh Album Art Không Tồn Tại
    // const currentSong = _this.songs[_this.currentIndex]
    // const currentSongImage = currentSong.image || './assets/img/album-art/default-album-art.jpg'
    // const albumArtElement = $('.cd-thumb img')
    // albumArtElement.src = currentSongImage
  },
  updateActiveSong: function () {
    const songs = $$('.song')
    songs.forEach((song, index) => {
      if (index === this.currentIndex) {
        song.classList.add('active')
      } else {
        song.classList.remove('active')
      }
    })
  },
  nextSong: function () {
    this.currentIndex++
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0
    }
    this.loadCurrentSong()
    !this.isPaused ? audio.pause() : audio.play()
    audio.currentTime = 0
  },
  prevSong: function () {
    this.currentIndex--
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1
    }
    this.loadCurrentSong()
    !this.isPaused ? audio.pause() : audio.play()
  },
  playRandomSong: function () {
    if (this.playedSongs.length === this.songs.length) {
      this.playedSongs = []
    }
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * this.songs.length)
    } while (this.playedSongs.includes(newIndex))
    this.playedSongs.push(newIndex)
    this.currentIndex = newIndex
    this.loadCurrentSong()
  },

  defineProperties: function () {
    Object.defineProperty(this, 'currentSong', {
      get: function () {
        return this.songs[this.currentIndex]
      }
    })
  },
  start: function () {
    this.defineProperties()
    this.loadCurrentSong()
    this.handleEvent()
    this.loadSongDurations()
    this.render()
  }
}
app.start()