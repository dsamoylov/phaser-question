import Phaser from 'phaser'
import { centerGameObjects } from '../utils'

export default class extends Phaser.State {
  init () {}

  preload () {
    this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg')
    this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar')
    centerGameObjects([this.loaderBg, this.loaderBar])

    this.load.setPreloadSprite(this.loaderBar)

    this.load.image('main_dialog_bg', 'assets/images/main/dialog_bg.png')
    this.load.image('main_computer_bg', 'assets/images/main/computer_bg.png')

    this.load.image('scroll_line', 'assets/images/scroll/scroll_line.png')
    this.load.image('scroll_up', 'assets/images/scroll/scroll_up.png')
    this.load.image('scroll_down', 'assets/images/scroll/scroll_down.png')
    this.load.image('scroll_tick', 'assets/images/scroll/scroll_tick.png')
  }

  create () {
    this.state.start('GameState')
  }
}
