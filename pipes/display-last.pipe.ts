import { Pipe, PipeTransform } from '@angular/core';

/**
 * Display only last value from string, default last 4
 *
 *  ie.  value | displayLast,
 * ie.   value | displayLast: 5
 */
@Pipe({
  name: 'displayLast',
})
export class DisplayLastPipe implements PipeTransform {
  transform(value: string | null, fromLast = 4): string {
    if (!value) {
      return '';
    }
    return value.substring(value.length - fromLast);
  }
}
