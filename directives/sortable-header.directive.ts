import { Directive, EventEmitter, Input, Output, HostBinding } from '@angular/core';

export interface SortEvent {
  column: string;
  columnKey: string;
  direction: SortDirection;
}

export type SortColumn = string;
export type SortDirection = 'asc' | 'desc' | '';
const rotate: { [key: string]: SortDirection } = {
  asc: 'desc',
  desc: '',
  '': 'asc',
};

@Directive({
  selector: '[appSortableHeader]',
  host: {
    '[class.asc]': 'direction === "asc"',
    '[class.desc]': 'direction === "desc"',
    '(click)': 'rotate()',
  },
})
export class SortableHeaderDirective {
  @Input() sortable: SortColumn = '';

  @Input() sortName: SortColumn = '';

  @Input() direction: SortDirection = '';

  @HostBinding('class.sortable-header') get valid() {
    return true;
  }

  @Output() sort = new EventEmitter<SortEvent>();

  rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({
      column: this.sortable,
      columnKey: this.sortName,
      direction: this.direction,
    });
  }

  setManually(direction: SortDirection) {
    this.direction = direction;
    this.sort.emit({
      column: this.sortable,
      columnKey: this.sortName,
      direction: this.direction,
    });
  }
}
