import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import {
  NgbDate,
  NgbCalendar,
  NgbDatepicker,
} from "@ng-bootstrap/ng-bootstrap";
import { UntypedFormControl } from "@angular/forms";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import * as moment from "moment";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { DonaryDateFormatPipe } from "src/app/commons/donary-date-format.pipe";
import { CommonHebrewEnglishCalendarService } from "../common-hebrew-english-calendar.service";
declare var $: any;
interface DateObject {
  day: number;
  month: number;
  year: number;
}

@Component({
  selector: "app-english-calendar",
  templateUrl: "./english-calendar.component.html",
  styleUrls: ["./english-calendar.component.scss"],
})
export class EnglishCalendarComponent implements OnInit {
  @ViewChild("dp", { static: true }) datepicker: NgbDatepicker;
  hoveredDate: NgbDate | null = null;

  @Input() selectedDateRange: any;
  @Input() pageName: any;
  @Input() class_id: string;
  @Output() valueChange = new EventEmitter<boolean>();
  @Input() isOneDate: boolean = false;
  @Output() clearForAllTime: EventEmitter<any> = new EventEmitter();
  @Input() isSchedule: boolean = false;

  fromDate: any;
  toDate: any;
  singleDateClicked = false;
  doubleDateClicked = false;
  startDateObject: DateObject;
  endDateObject: DateObject;

  id: string;
  minDate = undefined;

  convertedFromDate: any;
  convertedToDate: any | null = null;
  fromDateControl: UntypedFormControl;
  toDateControl: UntypedFormControl;
  monthNum: number = 2;
  constructor(
    public calendar: NgbCalendar,
    public hebrewEngishCalendarService: HebrewEngishCalendarService,
    public commonMethodService: CommonMethodService,
    public commonHebrewEnglishCalendarService: CommonHebrewEnglishCalendarService,
    private datePipe: DonaryDateFormatPipe
  ) {}
  ngOnInit() {
    if (this.commonMethodService.isScheduleCalendar && this.isSchedule) {
      const current = new Date();
      this.minDate = {
        year: current.getFullYear(),
        month: current.getMonth() + 1,
        day: current.getDate(),
      };
    }

    //code for by default 7 days started
    let today = this.calendar.getToday();
    let last7days = this.calendar.getPrev(today, "d", 6);
    this.fromDate = last7days;
    this.toDate = today;
    this.id = this.hebrewEngishCalendarService.id;
    this.hebrewEngishCalendarService.presetClickId = this.id;

    if (this.isOneDate) {
      this.monthNum = 1;
      this.fromDate = today;
    }

    if (this.class_id != null && this.class_id != undefined) {
      this.id = this.class_id;
    }

    this.updatePreviousDateSelection();
    //code for by default 7 days ended
    if (this.commonMethodService.isBackTranctionCliked) {
      if (this.selectedDateRange) {
        let selectedDateRange = moment(this.selectedDateRange).format(
          "MM/DD/YYYY"
        );
        let dplt = selectedDateRange.split("/");
        let date = {
          day: parseInt(dplt[1]),
          month: parseInt(dplt[0]),
          year: parseInt(dplt[2]),
        };
        this.fromDate = date;
        this.toDate = date;
      }
    }
    this.fromDateControl = new UntypedFormControl(
      this.dateConvert(this.fromDate)
    );
    this.toDateControl = new UntypedFormControl(this.dateConvert(this.toDate));

    this.fromDateControl.valueChanges.subscribe((value) => {
      this.convertedFromDate = value;
      this.hebrewEngishCalendarService.fromDate = this.convertedFromDate;
      this.onCustomRangeActiveCls();
    });

    this.toDateControl.valueChanges.subscribe((value) => {
      this.convertedToDate = value;
      this.hebrewEngishCalendarService.toDate = this.convertedToDate;
      this.onCustomRangeActiveCls();
    });
    this.commonHebrewEnglishCalendarService.setActiveButtonBasedOnDateRange(
      this.selectedDateRange,
      "e_cal"
    );
  }
  ngAfterViewInit() {
    this.id =
      this.commonHebrewEnglishCalendarService.setActiveButtonBasedOnDateRange(
        this.selectedDateRange,
        "e_cal"
      );

    $(".btn-menus").removeClass("active");
    $("#" + this.id).addClass("active");
    if (
      this.selectedDateRange &&
      !this.selectedDateRange.fromDate &&
      !this.selectedDateRange.toDate
    ) {
      this.clearForAllTime.emit(true);
    }
  }
  onDateSelection(date: NgbDate) {
    if (!this.singleDateClicked && this.doubleDateClicked) {
      this.toDate = null;
      this.doubleDateClicked = false;
    }
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
      this.singleDateClicked = false;
    } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
      this.toDate = date;
      this.singleDateClicked = false;
    } else {
      if (!this.isOneDate) {
        this.toDate = null;
      }
      this.fromDate = date;
    }
    if (
      this.fromDate &&
      !this.toDate &&
      this.hoveredDate &&
      date.equals(this.fromDate)
    ) {
      if (this.singleDateClicked) {
        this.toDate = this.fromDate;
        this.singleDateClicked = false;
        this.doubleDateClicked = true;
      } else {
        this.singleDateClicked = true;
      }
    }
    this.hebrewEngishCalendarService.fromDate = this.fromDate;
    this.hebrewEngishCalendarService.toDate = this.toDate;
    this.convertedFromDate = this.dateConvert(this.fromDate);
    this.convertedToDate = this.isOneDate
      ? null
      : this.dateConvert(this.toDate);
    this.onCustomRangeActiveCls();
    this.hebrewEngishCalendarService.engFromDateTodate = this.fromDate;
    if (!this.isOneDate) {
      if (this.fromDate && !this.toDate) {
        this.valueChange.emit(true);
      } else {
        this.valueChange.emit(false);
      }
    }
  }

  isHovered(date: NgbDate) {
    return (
      this.fromDate &&
      !this.toDate &&
      this.hoveredDate &&
      date.after(this.fromDate) &&
      date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  onThisWeek(event) {
    this.onActiveCls(event);
    let today = this.calendar.getToday();
    this.datepicker.navigateTo(this.calendar.getToday());
    let fromWeek = moment().startOf("week").toDate();
    let fweek = fromWeek.getDate();
    let endweek = moment().endOf("week").toDate();
    let lweek = endweek.getDate();
    let fmonth = fromWeek.getMonth() + 1;
    let lmonth = endweek.getMonth() + 1;
    this.fromDate = { year: today.year, month: fmonth, day: fweek };
    this.toDate = { year: today.year, month: lmonth, day: lweek };
  }
  navigate(number: number) {
    let { state } = this.datepicker;
    this.datepicker.navigateTo(
      this.calendar.getNext(state.firstDate, "m", number)
    );
  }
  onToday(event) {
    this.onActiveCls(event);
    this.datepicker.navigateTo(this.calendar.getToday());
    this.fromDate = this.calendar.getToday();
    this.toDate = this.calendar.getToday();
  }
  dateConvert(date) {
    if (date) {
      const d =
        this.addZeroBeforeSingleDigit(date.month) +
        "/" +
        this.addZeroBeforeSingleDigit(date.day) +
        "/" +
        date.year;

      return this.datePipe.transform(d, "short");
      return (
        this.addZeroBeforeSingleDigit(date.month) +
        "/" +
        this.addZeroBeforeSingleDigit(date.day) +
        "/" +
        date.year
      );
    }
  }
  onThisMonth(event) {
    this.onActiveCls(event);
    let today = this.calendar.getToday();
    this.datepicker.navigateTo(this.calendar.getToday());
    let lastDate = new Date(today.year, today.month, 0, 23, 59, 59);
    let ldate = lastDate.getDate();
    this.toDate = { year: today.year, month: today.month, day: ldate };
    this.fromDate = { year: today.year, month: today.month, day: 1 };
  }
  onLastMonth(event, number: number) {
    const today = this.calendar.getToday();
    const currentMonthFirstDate = new NgbDate(today.year, today.month, 1);
    this.onActiveCls(event);
    let date = this.calendar.getNext(currentMonthFirstDate, "m", number);
    let lastDate = new Date(date.year, date.month, 0, 23, 59, 59);
    let ldate = lastDate.getDate();
    this.toDate = { year: date.year, month: date.month, day: ldate };
    this.fromDate = date;
    this.datepicker.navigateTo(
      this.calendar.getNext(currentMonthFirstDate, "m", number)
    );
  }
  onNextMonth(event, number: number) {
    const today = this.calendar.getToday();
    const currentMonthFirstDate = new NgbDate(today.year, today.month, 1);
    this.onActiveCls(event);
    let { state } = this.datepicker;
    let date = this.calendar.getNext(currentMonthFirstDate, "m", number);
    let lastDate = new Date(date.year, date.month, 0, 23, 59, 59);
    let ldate = lastDate.getDate();
    this.toDate = { year: date.year, month: date.month, day: ldate };
    this.fromDate = date;
    this.datepicker.navigateTo(
      this.calendar.getNext(currentMonthFirstDate, "m", number)
    );
  }
  onLastYearNextYear(event, number: number) {
    const today = this.calendar.getToday();
    const currentMonthFirstDate = new NgbDate(today.year, today.month, 1);
    this.onActiveCls(event);
    let { state } = this.datepicker;
    let date = this.calendar.getNext(currentMonthFirstDate, "y", number);
    this.toDate = { year: date.year, month: 12, day: 31 };
    this.fromDate = { year: date.year, month: 1, day: 1 };
    this.datepicker.navigateTo(
      this.calendar.getNext(currentMonthFirstDate, "y", number)
    );
  }
  onThisYear(event) {
    this.onActiveCls(event);
    let today = this.calendar.getToday();
    this.datepicker.navigateTo(this.calendar.getToday());
    this.toDate = { year: today.year, month: 12, day: 31 };
    this.fromDate = { year: today.year, month: 1, day: 1 };
  }
  onLast7days(event) {
    this.onActiveCls(event);
    let today = this.calendar.getToday();
    let last7days = this.calendar.getPrev(today, "d", 6);
    this.fromDate = last7days;
    this.toDate = today;
    this.datepicker.navigateTo(this.calendar.getToday());
  }
  changeLang() {
    this.hebrewEngishCalendarService.isEngCal = true;
  }
  onActiveCls(event) {
    this.id = event.target.id;
    $(".btn-menus").removeClass("active");
    $("#" + this.id).addClass("active");
    this.hebrewEngishCalendarService.presetClickId = this.id;
    this.hebrewEngishCalendarService.id = this.id;
  }
  onNavigateToYear(number: number) {
    let { state } = this.datepicker;
    this.datepicker.navigateTo(
      this.calendar.getNext(state.firstDate, "y", number)
    );
  }
  onAllTime(event) {
    this.onActiveCls(event);
    this.fromDate = null;
    this.toDate = null;

    this.clearForAllTime.emit(true);
  }
  onCustomRange(event) {
    this.onActiveCls(event);
  }
  onCustomRangeActiveCls() {
    $(".btn-menus").removeClass("active");
    $("#id_CustomRange").addClass("active");
    this.hebrewEngishCalendarService.presetClickId = "id_CustomRange";
    this.hebrewEngishCalendarService.id = "id_CustomRange";
    this.hebrewEngishCalendarService.fromDate = this.convertedFromDate;
    this.hebrewEngishCalendarService.toDate = this.convertedToDate;
    if (this.isOneDate) {
      this.hebrewEngishCalendarService.presetClickId = "id_CustomRange_OneDate";
      this.hebrewEngishCalendarService.id = "id_CustomRange_OneDate";
    }
  }
  onNavigateToMonth(number: number) {
    let { state } = this.datepicker;
    this.datepicker.navigateTo(
      this.calendar.getNext(state.firstDate, "m", number)
    );
  }
  addZeroBeforeSingleDigit(item) {
    if (item <= 9) {
      return (item = "0" + item);
    }
    return item;
  }

  updatePreviousDateSelection() {
    if (
      this.selectedDateRange.startDate != null &&
      this.selectedDateRange.endDate != null
    ) {
      const startDate = new Date(this.selectedDateRange.startDate);
      const endDate = new Date(this.selectedDateRange.endDate);

      this.startDateObject = {
        day: startDate.getDate(),
        month: startDate.getMonth() + 1, // Month is zero-based, so add 1
        year: startDate.getFullYear(),
      };

      this.endDateObject = {
        day: endDate.getDate(),
        month: endDate.getMonth() + 1, // Month is zero-based, so add 1
        year: endDate.getFullYear(),
      };

      this.fromDate = this.startDateObject;
      this.toDate = this.endDateObject;
    } else if (
      this.selectedDateRange &&
      this.hebrewEngishCalendarService.isClicked == true &&
      !(!this.isOneDate && this.selectedDateRange.startDate == null)
    ) {
      this.hebrewEngishCalendarService.isClicked = false;
      const startDate = this.selectedDateRange.startDate
        ? new Date(this.selectedDateRange.startDate)
        : new Date(this.selectedDateRange);

      this.startDateObject = {
        day: startDate.getDate(),
        month: startDate.getMonth() + 1,
        year: startDate.getFullYear(),
      };
      this.fromDate = this.startDateObject;
      this.toDate = this.fromDate;
    } else {
      if (this.hebrewEngishCalendarService.engFromDateTodate) {
        this.fromDate = this.hebrewEngishCalendarService.engFromDateTodate;
        this.toDate = this.fromDate;
      }
    }

    this.convertedFromDate = this.dateConvert(this.fromDate);
    this.convertedToDate = this.dateConvert(this.toDate);
    this.datepicker.navigateTo(this.fromDate);
  }

  isOneDateRange(date: NgbDate) {
    return date.equals(this.fromDate);
  }

  isPastDate(date: NgbDate): boolean {
    if (this.commonMethodService.isScheduleCalendar && this.isSchedule) {
      let today = new NgbDate(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        new Date().getDate()
      );
      return date.before(today);
    }
  }

  ngOnDestroy() {
    this.commonMethodService.isScheduleCalendar = false;
  }

  isSameDay(startDate, endDate) {
    const today = moment();
    return (
      moment(startDate).isSame(today, "day") &&
      moment(endDate).isSame(today, "day")
    );
  }
  isThisWeek(fromDate, toDate) {
    const startOfWeek = moment().startOf("week");
    const endOfWeek = moment().endOf("week");
    return (
      moment(fromDate).isBetween(startOfWeek, endOfWeek, null, "[]") &&
      moment(toDate).isBetween(startOfWeek, endOfWeek, null, "[]")
    );
  }

  isLast7Days(fromDate, toDate) {
    const today = moment();
    const last7Days = moment().subtract(6, "days");
    return (
      moment(fromDate).isSameOrAfter(last7Days, "day") &&
      moment(toDate).isSameOrBefore(today, "day")
    );
  }

  isThisMonth(fromDate, toDate) {
    const fromMoment = moment(fromDate);
    const toMoment = moment(toDate);

    const startOfMonth = moment().startOf("month");
    const endOfMonth = moment().endOf("month");

    // Check if the fromDate and toDate are in the current month
    if (
      fromMoment.isSame(startOfMonth, "month") &&
      toMoment.isSame(endOfMonth, "month")
    ) {
      // Check if fromDate is the first day of the current month
      const isFirstDayOfMonth = fromMoment.isSame(startOfMonth, "day");
      // Check if toDate is the last day of the current month
      const isLastDayOfMonth = toMoment.isSame(endOfMonth, "day");
      if (isFirstDayOfMonth && isLastDayOfMonth) {
        return true;
      }
    }

    return false;
  }

  isLastMonth(fromDate, toDate) {
    const fromMoment = moment(fromDate);
    const toMoment = moment(toDate);

    const lastMonthStart = moment().subtract(1, "months").startOf("month");
    const lastMonthEnd = moment().subtract(1, "months").endOf("month");

    // Check if the fromDate and toDate are in the last month
    if (
      fromMoment.isSame(lastMonthStart, "month") &&
      toMoment.isSame(lastMonthEnd, "month")
    ) {
      // Check if fromDate is the first day of the last month
      const isFirstDayOfLastMonth = fromMoment.isSame(lastMonthStart, "day");
      // Check if toDate is the last day of the last month
      const isLastDayOfLastMonth = toMoment.isSame(lastMonthEnd, "day");
      if (isFirstDayOfLastMonth && isLastDayOfLastMonth) {
        return true;
      }
    }
  }

  Change(value) {
    this.valueChange.emit(value);
  }
}
