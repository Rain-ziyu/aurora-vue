<template>
    <div id="app">
      <div>Multi Resolution</div>
      <div class="test-player-wrap">
        <vue3-video-player @play="playFunc" @ended="playEnded" :src="source" title="Smartisan TNT" :view-core="viewCore.bind(null, 'video1')"
        :cover="cover" :barrageConfig="{barrageList: barrages}" :logo="logo" resolution="720p">
        </vue3-video-player>
      </div>


      <div>HLS/m3u8 直播推流</div>
      <div class="test-player-wrap">
        <vue3-video-player :core="HLSCore" :src="liveArrSource" title="test" :view-core="viewCore.bind(null, 'video3')">
        </vue3-video-player>
        <button style="margin: 20px;" @click="pip('video3')">pip</button>
      </div>
    </div>
  </template>
  
  <script>
  import HLSCore from '@cloudgeek/playcore-hls'
  
  const videoSource = [
    {
      src: 'https://static.smartisanos.cn/common/video/smartisan-tnt-jianguo.mp4',
      resolution: '240p'
    },
    {
      src: 'https://static.smartisanos.cn/common/video/smartisan-tnt-jianguo.mp4',
      resolution: '360p'
    }, {
      src: 'https://static.smartisanos.cn/common/video/smartisan-tnt-jianguo.mp4',
      resolution: '720p'
    }, {
      src: 'https://static.smartisanos.cn/common/video/smartisan-tnt-jianguo.mp4',
      resolution: '1080p'
    }
  ]
  


  
  const liveArrSource = [
    { src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8', resolution: '1080p' }
  ]

  
  const cover = 'https://static.smartisanos.cn/pr/assets/images/smartisan-tnt-jianguo.190162f215c4f5f2aaabf38e5782b3af.jpg'
  
  export default {
    name: 'app',
    data () {
      return {
        players: {},
        HLSCore,
        liveArrSource,
        source: videoSource,
        cover: cover,
        logo: require('@/assets/logo.png'),
        barrages: []
      }
    },
    methods: {
      viewCore (id, player) {
        console.log(id, player)
        this.players[id] = player
      },

      pip (id) {
        this.players && this.players[id] && this.players[id].requestPictureInPicture()
      },
      playFunc () {
        console.log('play!!!!')
      },
      playEnded (e) {
        console.log(e)
        if (e.target === document.pictureInPictureElement) {
          document.exitPictureInPicture()
        }
      },
      autoPlay (b) {
        console.log('auto play change to ' + b)
      }
    },
    created () {
      const arr = [
        'vue3 video player',
        'awesome 棒棒棒',
        '6000 units 6000弹幕',
        'test 测试一下吧',
        '60 FPS',
        'test in fullscreen mode 全屏模式试一试'
      ]
      const temp = []
      for (let i = 0; i < 6; i++) {
        for (let index = 0; index < 1000; index++) {
          const time = parseInt(Math.random() * 408927)
          if (index % 4 === 0) {
            temp.push({
              type: 0,
              content: arr[parseInt(Math.random() * arr.length)],
              avatar: 'https://api.multiavatar.com/LarchLiu.png',
              username: 'LarchLiu' + time,
              time: parseFloat(time / 1000)
            })
          } else if (index % 4 === 1) {
            temp.push({
              type: 3,
              content: arr[parseInt(Math.random() * arr.length)],
              time: parseFloat(time / 1000)
            })
          } else if (index % 4 === 2) {
            temp.push({
              type: 1,
              content: arr[parseInt(Math.random() * arr.length)],
              time: parseFloat(time / 1000)
            })
          } else {
            temp.push({
              type: 2,
              content: arr[parseInt(Math.random() * arr.length)],
              time: parseFloat(time / 1000),
              color: parseInt(Math.random() * 16777215)
            })
          }
        }
      }
      this.barrages = temp.sort((a, b) => { return a.time - b.time })
    }
  }
  </script>
  
  <style scoped>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 30px;
  }
  #app .vue-core-video-player-containers {
    margin: 30px auto;
  }
  #app .test-player-wrap {
    width: 720px;
    position: relative;
    margin: 30px auto;
  }
  
  @media all and (max-width: 768px) {
    #app .test-player-wrap {
      width: 100%;
      height: auto;
    }
  }
  </style>