import Phaser from 'phaser'
import ScrollableArea from './ScrollableArea'
import Parser from '../utils/stringParser'

export default class extends Phaser.Sprite {
  constructor ({ game, x, y, dialogSteps }) {
    super(game, x, y, null)

    this.dialogSteps = dialogSteps
    this.dialogHeight = 0
    this.currentStepIndex = -1
    this.bg = this.game.add.sprite(x, y, 'main_dialog_bg')

    this.scroller = game.add.existing(
      new ScrollableArea(game, 0, y + 35, 380, 263, {}, this.mouseWheelHandler.bind(this))
    )
    this.scroller.start()

    this.isDragReleased = Array(dialogSteps.length).fill(false)

    this.scrollLinePosition = { x: 403, y: 44, h: 252 }

    this.scrollLine = game.add.tileSprite(
      x + this.scrollLinePosition.x,
      y + this.scrollLinePosition.y,
      10,
      this.scrollLinePosition.h,
      'scroll_line'
    )
    this.scrollUp = game.add.button(
      x + this.scrollLinePosition.x + 5,
      y + this.scrollLinePosition.y - 8,
      'scroll_up',
      () => {
        this.scrollUpHandler()
      }
    )
    this.scrollUp.anchor.setTo(0.5, 0.5)
    this.scrollDown = game.add.button(
      x + this.scrollLinePosition.x + 5,
      y + this.scrollLinePosition.y + this.scrollLinePosition.h + 8,
      'scroll_down',
      () => {
        this.scrollDownHandler()
      }
    )
    this.scrollDown.anchor.setTo(0.5, 0.5)

    this.scrollTick = game.add.image(
      x + this.scrollLinePosition.x + 5,
      y + this.scrollLinePosition.y + 8,
      'scroll_tick'
    )
    this.scrollTick.anchor.setTo(0.5, 0.5)
    this.scrollTick.visible = false
  }

  update () {}

  // shows next dialog phrase
  showNext () {
    this.currentStepIndex++

    const currentStep = this.dialogSteps[this.currentStepIndex]

    const stepText = currentStep.text

    // initial text to create array of strings
    const initialText = this.game.make.text(this.x + 55, this.dialogHeight, stepText, {
      font: '18px Arial',
      fill: '#16bee7',
      wordWrap: true,
      wordWrapWidth: 325
    })

    // making the array to print
    const strings = initialText.precalculateWordWrap(stepText)
    const parsedStrings = Parser.parse(stepText, strings.map(s => s.trim()), currentStep.highlight)

    // adding strings one by one
    parsedStrings.forEach((string, index) => {
      let dx = 0
      if (string.left) {
        const textColor = '#16bee7'
        const leftText = this.game.make.text(this.x + 55, this.dialogHeight, string.left, {
          font: '18px Arial',
          fill: textColor
        })
        this.scroller.addChild(leftText)
        dx = leftText.getBounds().width
      }

      // highlighed part of the string
      if (string.middle) {
        // const highlightedText = this.game.make.text(this.x + 55 + dx, this.dialogHeight, string.middle, {
        //   font: '18px Arial',
        //   fill: '#16bee7',
        //   backgroundColor: '#185965'
        // })
        // highlightedText.inputEnabled = true
        // highlightedText.stepNumber = this.currentStepIndex

        // highlightedText.events.onInputUp.add(() => {
        //   if (!this.isDragReleased[highlightedText.stepNumber]) {
        //     this.createDragText(highlightedText)
        //   }
        // })
        // this.scroller.addChild(highlightedText)

        const highlightedText2 = this.game.make.text(this.x + 55 + dx, this.dialogHeight, string.middle, {
          font: '18px Arial',
          fill: '#16bee7',
          backgroundColor: '#185965'
        })
        highlightedText2.inputEnabled = true
        highlightedText2.input.useHandCursor = true
        highlightedText2.input.enableDrag(true)
        highlightedText2.stepNumber = this.currentStepIndex
        highlightedText2.events.onDragStart.add(() => {
          console.log('yay2!')
        })

        this.scroller.addChild(highlightedText2)
        dx += highlightedText2.getBounds().width
      }

      // the rest of the string
      if (string.right) {
        const rightText = this.game.make.text(this.x + 55 + dx, this.dialogHeight, string.right, {
          font: '18px Arial',
          fill: '#16bee7'
        })
        this.scroller.addChild(rightText)
      }

      // adding string height to current dialog height
      // less space leads to highlight overlaps and double event firing
      this.dialogHeight += 26
    })

    // adding space after the phrase
    this.dialogHeight += 20

    // scrolling down to the bottom
    if (this.dialogHeight > 280) {
      this.scroller.scrollTo(0, this.y - this.dialogHeight + 318, 350)
      setTimeout(() => {
        this.recalculateScrollTick()
      }, 395) // a little timeout, because tick should be positioned when scroll completes
    }
  }

  // create text for dragging to the green or red zone
  createDragText (highlightedText) {
    this.isDragReleased[highlightedText.stepNumber] = true
    const highDragText = this.game.add.text(
      this.game.input.x,
      this.game.input.y,
      this.dialogSteps[highlightedText.stepNumber].dragText,
      {
        font: '14px Arial',
        fill: '#bfedf5'
      }
    )
    highDragText.lineSpacing = -8
    highDragText.inputEnabled = true
    highDragText.input.useHandCursor = true
    highDragText.input.enableDrag(true)
    highDragText.anchor.setTo(0.5, 0.5)
    highDragText.setShadow(0, 0, 'rgb(0, 0, 0)', 4)
    highDragText.events.onDragStart.add(() => {
      console.log('yay!')
    })
    highDragText.events.onDragStop.add(() => {
      // check if it's in the yes or no zone
      this.dragStopHandler(highDragText, highlightedText)
    })
  }

  // phrase stopped dragging
  dragStopHandler (highDragText, highlightedText) {
    const droppedInRedGreenZone = this.checkRedGreenZone(highDragText)
    if (!droppedInRedGreenZone) {
      // destroy draggable text and reset the flag
      this.isDragReleased[highlightedText.stepNumber] = false
      highDragText.destroy()
    } else {
      if (droppedInRedGreenZone === 'red') {
        this.isDragReleased[highlightedText.stepNumber] = 'red'
        highDragText.addColor('#300', 0)
        highDragText.setShadow(0, 0, '#000', 0)
      } else {
        this.isDragReleased[highlightedText.stepNumber] = 'green'
        highDragText.addColor('#030', 0)
        highDragText.setShadow(0, 0, '#000', 0)
      }
    }
  }

  // check if the text object contains within the red or green zone bounds
  // return 'green', 'red', or false
  checkRedGreenZone (highDragText) {
    const textBounds = highDragText.getBounds()
    const greenZoneBounds = new Phaser.Rectangle(500, 90, 177, 125)
    const redZoneBounds = new Phaser.Rectangle(500, 206, 177, 127)
    if (Phaser.Rectangle.containsRect(textBounds, greenZoneBounds)) return 'green'
    if (Phaser.Rectangle.containsRect(textBounds, redZoneBounds)) return 'red'
    return false
  }

  getDragData () {
    return this.isDragReleased
  }

  scrollUpHandler () {
    // if not at the top
    if (this.scroller.y < this.scroller._y) {
      const scrollStep = 100
      this.scroller.scrollTo(
        this.scroller.x,
        // if there is more than scrollStep pixels remain, scroll by scrollStep pixels
        // scroll just to top otherwise
        this.scroller._y - this.scroller.y > scrollStep ? this.scroller.y + scrollStep : this.scroller._y,
        350
      )
      for (let i = 1; i <= 12; i++) {
        setTimeout(() => {
          this.recalculateScrollTick()
        }, i * 30) // a little timeout, because tick should be positioned when scroll completes
      }
    }
  }

  scrollDownHandler () {
    // if not at the bottom already
    const delta = this.scroller.getBounds().height - (this.scroller._h + this.scroller._y - this.scroller.y)
    if (delta > 0) {
      const scrollStep = 100
      this.scroller.scrollTo(
        this.scroller.x,
        // if there is more than scrollStep pixels remain, scroll by scrollStep pixels
        // scroll just to bottom otherwise
        delta > scrollStep ? this.scroller.y - scrollStep : this.scroller.y - delta,
        350
      )
      for (let i = 1; i <= 12; i++) {
        setTimeout(() => {
          this.recalculateScrollTick()
        }, i * 30) // a little timeout, because tick should be positioned when scroll completes
      }
    }
  }

  recalculateScrollTick () {
    const deltaTop = this.scroller._y - this.scroller.y
    const deltaBtm = this.scroller.getBounds().height - (this.scroller._h + this.scroller._y - this.scroller.y)

    if (deltaBtm < 0) {
      this.scrollTick.visible = false
    } else {
      const percent = deltaTop / (deltaBtm + deltaTop)
      this.scrollTick.visible = true
      this.scrollTick.y = this.y + this.scrollLinePosition.y + 8 + percent * (this.scrollLinePosition.h - 15)
    }
  }

  mouseWheelHandler () {
    for (let i = 1; i <= 10; i++) {
      setTimeout(() => {
        this.recalculateScrollTick()
      }, i * 150) // a little timeout, because tick should be positioned when scroll completes
    }
  }
}
