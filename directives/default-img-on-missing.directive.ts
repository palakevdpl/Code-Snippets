import { Directive, ElementRef, HostListener } from '@angular/core';
import { Assets } from '@enum/Assets';

@Directive({
  selector: 'img[appDefaultImgOnMissing]',
})
export class DefaultImgOnMissingDirective {
  constructor(private el: ElementRef) {}

  @HostListener('error')
  private onError() {
    this.el.nativeElement.src = Assets.PROFILE_IMAGE;
  }
}
