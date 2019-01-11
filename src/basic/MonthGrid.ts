import DayGrid from './DayGrid'

export default class MonthGrid extends DayGrid {

  constructor(view) {
    super(view)
  }

  renderDates(dateProfile) {
    this.dateProfile = dateProfile
    this.updateDayTable('month')
    this.renderGrid()
  }

}
