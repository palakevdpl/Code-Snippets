import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { debounceTime, delay, switchMap, tap } from 'rxjs/operators';
import { BaseState, SearchResult } from 'src/app/models/panels';
import { DataExportService } from '@services/data-export.service';
import { SortColumn, SortDirection } from './directive/sortable-header.directive';
import { SearchPipe } from './pipes/search.pipe';

const compare = (v1: string | number | Date, v2: string | number | Date) => (v1 < v2 ? -1 : v1 > v2 ? 1 : 0);

export function sort(list: any[], column: SortColumn, direction: string): any[] {
  if (direction === '' || column === '') {
    return list;
  }

  return [...list].sort((a, b) => {
    let res = null;
    if (column == 'transDate') res = compare(new Date(a[column]), new Date(b[column]));
    else res = compare(a[column], b[column]);

    return direction === 'asc' ? res : -res;
  });
}

export interface QueryFilter {
  [key: string]: Array<any>;
}

interface State extends BaseState {
  queryFilter: QueryFilter;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}

export interface TableHeader {
  colName: string;
  sortName: string;
  formateValue?: Function;
}

@Injectable()
export class DataGridService<T> extends DataExportService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _headers$ = new BehaviorSubject<TableHeader[]>([]);
  private _rows$ = new BehaviorSubject<T[]>([]);
  private _total$ = new BehaviorSubject<number>(0);

  private _isPagination = true;
  private arrayList: Array<T> = [];

  private _state: State = {
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: '',
    sortDirection: '',
    queryFilter: {},
  };

  constructor(private pipe: SearchPipe) {
    super();
    this._search$
      .pipe(
        tap(() => this._loading$.next(true)),
        debounceTime(200),
        switchMap(() => this._search()),
        delay(200),
        tap(() => this._loading$.next(false))
      )
      .subscribe((result) => {
        this._rows$.next(result.rows);
        this._total$.next(result.total);
      });

    this._search$.next();
  }

  set ListData(list: Array<T>) {
    this.arrayList = list;
    this._search$.next();
  }

  set AddListDataItem(item: T) {
    this.arrayList.unshift(item);
    this._search$.next();
  }

  set TableHeaders(list: Array<TableHeader>) {
    this._headers$.next(list);
  }

  set Pagination(val: boolean) {
    this._isPagination = val;
  }

  get rows$() {
    return this._rows$.asObservable();
  }

  get headers$() {
    return this._headers$.asObservable();
  }

  get total$() {
    return this._total$.asObservable();
  }

  get loading$() {
    return this._loading$.asObservable();
  }

  get page() {
    return this._state.page;
  }

  set page(page: number) {
    this._set({ page });
  }

  get pageSize() {
    return this._state.pageSize;
  }

  set pageSize(pageSize: number) {
    this._set({ pageSize, page: 1 });
  }

  get searchTerm() {
    return this._state.searchTerm;
  }

  set searchTerm(searchTerm: string) {
    this._set({ searchTerm });
  }

  set sortColumn(sortColumn: SortColumn) {
    this._set({ sortColumn });
  }

  set sortDirection(sortDirection: SortDirection) {
    this._set({ sortDirection });
  }

  set queryFilter(queryFilter: QueryFilter) {
    this._set({ queryFilter });
  }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this._search$.next();
  }

  private _applyPagination(list: T[]): Observable<SearchResult<T>> {
    const { page, pageSize } = this._state;
    const total = list.length;
    const rows = list.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
    return of({ rows, total });
  }

  private _searchAndSort(): Array<T> {
    const { searchTerm, sortColumn, sortDirection } = this._state;

    const list = this.getMainList();

    // 1. sort
    const sortedList = sort(list, sortColumn, sortDirection);

    // 2. Search
    const result: Array<T> = this.pipe.transform(sortedList, searchTerm);
    return result;
  }

  private _search(): Observable<SearchResult<T>> {
    // For View Apply search and sort
    const rows = this._searchAndSort();

    // 3. pagination
    if (this._isPagination) {
      return this._applyPagination(rows);
    }

    return of({ rows, total: rows.length });
  }

  private applyQuery(list: T[]) {
    const { queryFilter } = this._state;

    Object.keys(queryFilter).forEach((key: string) => {
      if (key && queryFilter[key] && queryFilter[key].length !== 0) {
        list = list.filter((i: any) => {
          if (!i[key]) {
            return true;
          }
          return queryFilter[key].includes(i[key]) ? true : false;
        });
      }
    });

    return list;
  }

  /**
   * Check and filter transactions filter
   * @returns Array
   */
  private getMainList() {
    const { queryFilter } = this._state;

    let data = this.arrayList;
    if (queryFilter) {
      return this.applyQuery(data);
    }

    return data;
  }

  /**
   * Set Currency Columns for Cell Format
   * @param arr
   */
  setCurrencyColumns(arr: Array<string>) {
    this.currencyColumn = arr;
  }

  /**
   * Set Columns and create row objects
   * @param list
   * @returns
   */
  private setColumns(list: Array<T>) {
    const data: Array<any> = [];
    Object.values(list).forEach((item: any) => {
      let row: any = {};
      this.headers$.subscribe((val) => {
        for (let index = 0; index < val.length; index++) {
          const element = val[index];
          if (element.formateValue) {
            row[element.colName] = element.formateValue(item);
          } else {
            row[element.colName] = item[element.sortName];
          }
        }
      });

      data.push(row);
    });

    return data;
  }

  exportProcess(fileName = 'export', list: any[] = [], listPassed: boolean = false) {
    let listData;
    if (listPassed) listData = list;
    else listData = this._searchAndSort();

    if (listData.length === 0) {
      return;
    }

    const data = this.setColumns(listData);

    this.fileName = fileName;
    this.exportData(data);
  }
}
