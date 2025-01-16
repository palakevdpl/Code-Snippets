import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveDatePicker } from './archive-date-picker.component';

describe('ArchiveDatePicker', () => {
  let component: ArchiveDatePicker;
  let fixture: ComponentFixture<ArchiveDatePicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchiveDatePicker],
    }).compileComponents();

    fixture = TestBed.createComponent(ArchiveDatePicker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
