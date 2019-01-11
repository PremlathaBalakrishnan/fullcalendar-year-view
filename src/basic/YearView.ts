import { defineView } from '../ViewRegistry'
import View from '../View'
import Scroller from '../common/Scroller'
import MonthGrid from './MonthGrid'

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


