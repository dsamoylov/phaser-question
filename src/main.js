import 'pixi'
import 'p2'
import Phaser from 'phaser'

import BootState from './states/Boot'
import SplashState from './states/Splash'
import GameState from './states/GameState'

import config from './config'

class Game extends Phaser.Game {
  constructor () {
    super(config.gameWidth, config.gameHeight, Phaser.AUTO, 'content', null)

    this.state.add('Boot', BootState, false)
    this.state.add('Splash', SplashState, false)
    this.state.add('GameState', GameState, false)

    // with Cordova with need to wait that the device is ready so we will call the Boot state in another file
    if (!window.cordova) {
      this.state.start('Boot')
    }
  }
}

window.game = new Game()

// initial game resizing - works only on next tick, so setTimeout is needed
setTimeout(() => {
  window.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
  resizeGame()
}, 1)

if (window.cordova) {
  var app = {
    initialize: function () {
      document.addEventListener('deviceready', this.onDeviceReady.bind(this), false)
    },

    // deviceready Event Handler
    //
    onDeviceReady: function () {
      this.receivedEvent('deviceready')

      // When the device is ready, start Phaser Boot state.
      window.game.state.start('Boot')
    },

    receivedEvent: function (id) {
      console.log('Received Event: ' + id)
    }
  }

  app.initialize()
}

function resizeGame () {
  var widthToHeight = 4 / 3
  var newWidth = window.innerWidth
  var newHeight = window.innerHeight
  var newWidthToHeight = newWidth / newHeight
  if (newWidthToHeight > widthToHeight) {
    // screen is wider than needed
    newWidth = newHeight * widthToHeight
  } else {
    // screen is fine or higher than needed
    newHeight = newWidth / widthToHeight
  }

  var contentElement = document.getElementById('content')
  contentElement.style.width = newWidth + 'px'
  contentElement.style.height = newHeight + 'px'
}

window.addEventListener('resize', resizeGame, false)
window.addEventListener('orientationchange', resizeGame, false)
