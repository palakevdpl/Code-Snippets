import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pdf-page',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './pdf-page.component.html',
  styleUrl: './pdf-page.component.scss',
})
export class PdfPageComponent {
  @Input() projectDetails: any = {};
  @Input() tableData: any[] = [];
  @Input() heading: any[] = [];
  @Input() colName: string[] = [];
  @Input() titleName: string = '';
}
