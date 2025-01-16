import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfPageComponent } from './pdf-page.component';

describe('PdfPageComponent', () => {
  let component: PdfPageComponent;
  let fixture: ComponentFixture<PdfPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PdfPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
