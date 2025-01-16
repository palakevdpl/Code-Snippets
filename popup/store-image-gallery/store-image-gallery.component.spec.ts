import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreImageGalleryComponent } from './store-image-gallery.component';

describe('StoreImageGalleryComponent', () => {
  let component: StoreImageGalleryComponent;
  let fixture: ComponentFixture<StoreImageGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreImageGalleryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StoreImageGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
