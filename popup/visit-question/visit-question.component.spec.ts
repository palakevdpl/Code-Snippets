import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitQuestionComponent } from './visit-question.component';

describe('VisitQuestionComponent', () => {
  let component: VisitQuestionComponent;
  let fixture: ComponentFixture<VisitQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitQuestionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VisitQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
