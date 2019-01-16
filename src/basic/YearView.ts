import * as $ from 'jquery'
import { defineView } from '../ViewRegistry'
import View from '../View'
import Scroller from '../common/Scroller'
import MonthGrid from './MonthGrid'
import {
  uncompensateScroll,
  compensateScroll,
  subtractInnerElHeight,
  distributeHeight,
  undistributeHeight
} from '../util'

export default class YearView extends View {
  monthGrid: any
  scroller: any
  monthGridClass: any

  initialize() {
    // called once when the view is instantiated, when the user switches to the view.
    // initialize member variables or do other setup tasks.

    this.monthGrid = this.instantiateMonthGrid()

    this.addChild(this.monthGrid)

    this.scroller = new Scroller({
      overflowX: 'hidden',
      overflowY: 'auto'
    })
  }

  // Generates the MonthGrid object this view needs. Draws from this.monthGridClass
  instantiateMonthGrid() {
    // generate a subclass on the fly with BasicView-specific behavior
    // TODO: cache this subclass
    let subclass: any = makeMonthGridSubclass(this.monthGridClass)

    return new subclass(this)
  }

  renderSkeleton() {
    let monthGridContainerEl
    let monthGridEl

    this.el.addClass('fc-basic-view').html(this.renderSkeletonHtml())

    this.scroller.render()

    monthGridContainerEl = this.scroller.el.addClass('fc-day-grid-container')
    monthGridEl = $('<div class="fc-day-grid" />').appendTo(monthGridContainerEl)

    this.el.find('.fc-body > tr > td').append(monthGridContainerEl)

    this.monthGrid.headContainerEl = this.el.find('.fc-head-container')
    this.monthGrid.setElement(monthGridEl)
  }


  unrenderSkeleton() {
    this.monthGrid.removeElement()
    this.scroller.destroy()
  }

  // Builds the HTML skeleton for the view.
  // The day-grid component will render inside of a container defined by this HTML.
  renderSkeletonHtml() {
    let theme = this.calendar.theme

    return '' +
      '<table class="' + theme.getClass('tableGrid') + '">' +
        (this.opt('columnHeader') ?
          '<thead class="fc-head">' +
            '<tr>' +
              '<td class="fc-head-container ' + theme.getClass('widgetHeader') + '">&nbsp;</td>' +
            '</tr>' +
          '</thead>' :
          ''
          ) +
        '<tbody class="fc-body">' +
          '<tr>' +
            '<td class="' + theme.getClass('widgetContent') + '"></td>' +
          '</tr>' +
        '</tbody>' +
      '</table>'
  }

  // Refreshes the horizontal dimensions of the view
  updateSize(totalHeight, isAuto, isResize) {
    let eventLimit = this.opt('eventLimit')
    let headRowEl = this.monthGrid.headContainerEl.find('.fc-row')
    let scrollerHeight
    let scrollbarWidths

    // hack to give the view some height prior to monthGrid's columns being rendered
    // TODO: separate setting height from scroller VS monthGrid.
    if (!this.monthGrid.rowEls) {
      if (!isAuto) {
        scrollerHeight = this.computeScrollerHeight(totalHeight)
        this.scroller.setHeight(scrollerHeight)
      }
      return
    }

    super.updateSize(totalHeight, isAuto, isResize)

    // reset all heights to be natural
    this.scroller.clear()
    uncompensateScroll(headRowEl)

    this.monthGrid.removeSegPopover() // kill the "more" popover if displayed

    // is the event limit a constant level number?
    if (eventLimit && typeof eventLimit === 'number') {
      this.monthGrid.limitRows(eventLimit) // limit the levels first so the height can redistribute after
    }

    // distribute the height to the rows
    // (totalHeight is a "recommended" value if isAuto)
    scrollerHeight = this.computeScrollerHeight(totalHeight)
    this.setGridHeight(scrollerHeight, isAuto)

    // is the event limit dynamically calculated?
    if (eventLimit && typeof eventLimit !== 'number') {
      this.monthGrid.limitRows(eventLimit) // limit the levels after the grid's row heights have been set
    }

    if (!isAuto) { // should we force dimensions of the scroll container?

      this.scroller.setHeight(scrollerHeight)
      scrollbarWidths = this.scroller.getScrollbarWidths()

      if (scrollbarWidths.left || scrollbarWidths.right) { // using scrollbars?

        compensateScroll(headRowEl, scrollbarWidths)

        // doing the scrollbar compensation might have created text overflow which created more height. redo
        scrollerHeight = this.computeScrollerHeight(totalHeight)
        this.scroller.setHeight(scrollerHeight)
      }

      // guarantees the same scrollbar widths
      this.scroller.lockOverflow(scrollbarWidths)
    }
  }

  // Sets the height of just the DayGrid component in this view
  setGridHeight(height, isAuto) {
    if (isAuto) {
      undistributeHeight(this.monthGrid.rowEls) // let the rows be their natural height with no expanding
    } else {
      distributeHeight(this.monthGrid.rowEls, height, true) // true = compensate for height-hogging rows
    }
  }


  // given a desired total height of the view, returns what the height of the scroller should be
  computeScrollerHeight(totalHeight) {
    return totalHeight -
      subtractInnerElHeight(this.el, this.scroller.el) // everything that's NOT the scroller
  }
}

defineView('year', {
  class: YearView,
  duration: { month: 12 }
}) // register our class with the view system

YearView.prototype.monthGridClass = MonthGrid

// customize the rendering behavior of BasicView's monthGrid
function makeMonthGridSubclass(SuperClass) {

  return class SubClass extends SuperClass {

    // Generates the HTML that will go before the day-of week header cells
    renderHeadIntroHtml() {
      return ''
    }

    // Generates the HTML that goes before the day bg cells for each day-row
    renderBgIntroHtml() {
      return ''
    }

  }
}


