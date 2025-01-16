import { Clipboard } from '@angular/cdk/clipboard';
import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appBlockCutCopyPaste]',
})
export class BlockCutCopyPasteDirective {
  constructor() {}

  @HostListener('paste', ['$event']) blockPaste(e: KeyboardEvent) {
    e.preventDefault();
  }

  @HostListener('copy', ['$event']) blockCopy(e: KeyboardEvent) {
    e.preventDefault();
  }

  @HostListener('cut', ['$event']) blockCut(e: KeyboardEvent) {
    e.preventDefault();
  }
}

@Directive({
  selector: '[appAllowCopyData]',
})
export class AllowCopyDirective {
  @Input() toCopy!: string | null | any;
  constructor(private cb: Clipboard) {}

  @HostListener('click', ['$event']) click(event: KeyboardEvent) {
    // console.log('copy');
    // this.cb.copy(this.toCopy || '');

    event.preventDefault();
    let listener = (e: ClipboardEvent) => {
      let clipboard = e.clipboardData || (<any>window).clipboardData;
      clipboard.setData('text', this.toCopy || '');
      e.preventDefault();
    };
    document.addEventListener('copy', listener, false);
    document.execCommand('copy');
    document.removeEventListener('copy', listener, false);
  }
}
