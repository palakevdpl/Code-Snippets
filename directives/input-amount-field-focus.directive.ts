import { Directive, ElementRef, HostListener, OnInit, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appInputAmountFieldFocus]',
})
export class InputAmountFieldFocusDirective implements OnInit {
  constructor(@Optional() private ngControl: NgControl, private elementHost: ElementRef<HTMLInputElement>) {}

  ngOnInit(): void {
    if (this.ngControl) {
      this.ngControl.control?.valueChanges.subscribe((val) => {
        this.toSetCursor(val);
      });
    }
  }

  @HostListener('input')
  inputEvent(): void {
    const inputValue = this.elementHost.nativeElement.value;
    const term = Number(inputValue.replace(/,/g, ''));
    const toFix = term.toFixed(2);

    this.ngControl.control?.setValue(toFix, { emitEvent: true });
  }

  @HostListener('focusin')
  setInputFocus(): void {
    setTimeout(() => {
      const v = this.elementHost.nativeElement.value;
      this.toSetCursor(v);
    }, 300);
  }

  toSetCursor(value: any) {
    if (value && value !== '') {
      const startAt = value.length;
      const endAt = value.length - 3 < 0 ? 2 : value.length - 3;
      this.elementHost.nativeElement.setSelectionRange(startAt, endAt, 'backward');
    }
  }
}
