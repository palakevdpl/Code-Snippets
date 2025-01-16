import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'emailMask',
  standalone: true
})
export class EmailMaskPipe implements PipeTransform {

  transform(email: string): string {
    if (!email) return email;

    const [localPart, domain] = email.split('@');

    const maskedLocal = localPart.length > 4 ?
      localPart.substring(0, 2) + '****' + localPart.substring(localPart.length - 1) :
      localPart;

    return `${maskedLocal}@${domain}`;
  }

}


