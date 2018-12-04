import Phaser from 'phaser'
import Dialog from '../sprites/Dialog'

export default class extends Phaser.State {
  init () {}
  preload () {}

  create () {
    this.computer = this.game.add.sprite(425, 10, 'case_computer_bg')
    this.game.add.existing(this.computer)
    this.dialogSteps = [
      {
        text:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. '
      },
      {
        text:
          'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        highlight: 'quis nostrud',
        dragText: 'quis\nnostrud\nexercitation'
      },
      {
        text: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
        highlight: 'reprehenderit',
        dragText: 'reprehenderit\nin voluptate'
      },
      {
        text:
          'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        highlight: 'sint occaecat cupidatat non proident',
        dragText: 'occaecat\ncupidatat'
      }
    ]

    this.dialog = new Dialog({
      game: this.game,
      x: 0,
      y: 40,
      dialogSteps: this.dialogSteps
    })

    this.dialogSteps.forEach((_, index) => {
      setTimeout(() => {
        this.dialog.showNext()
      }, index * 350)
    })
  }

  render () {}
}
