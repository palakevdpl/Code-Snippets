import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StoreService } from '../../../service/store.service'; // Service to fetch store data
import { DatePipe } from '@angular/common'; // Angular DatePipe for date formatting
import { LoaderComponent } from '../../common/loader/loader.component'; // Loader component to show loading state
import { NoDataAvailableComponent } from '../../common/no-data-available/no-data-available.component'; // Component to show when no data is available
import { VisitsService } from '../../../service/visits.service'; // Service for visit-related functionality
import { SubSink } from 'subsink'; // Utility for managing subscriptions
import { ImageShowComponent } from '../image-show/image-show.component'; // Component for showing the full image in a modal
import { MatDialog } from '@angular/material/dialog'; // Angular Material Dialog for modals

@Component({
  selector: 'store-image-gallery', // Selector for this component
  standalone: true, // Standalone component
  imports: [
    DatePipe, // Date formatting pipe
    LoaderComponent, // Loader component to show while fetching data
    NoDataAvailableComponent, // No data available component to show when there are no images
    ImageShowComponent, // Component to show images in full size
  ],
  providers: [StoreService, DatePipe, VisitsService], // Services provided at the component level
  templateUrl: './store-image-gallery.component.html', // Template for the component
  styleUrl: './store-image-gallery.component.scss', // Styles for the component
})
export class StoreImageGalleryComponent implements OnInit {
  @Input() storeId: string = ''; // Input property to receive the store ID
  @Input() projectId: string = ''; // Input property to receive the project ID
  @Output() loadData = new EventEmitter<any>(); // Output event emitter to notify parent component

  storeImageList: any[] = []; // Array to hold the list of images for the store
  isLoading = false; // Flag to indicate loading state
  public sink = new SubSink(); // Utility for managing multiple subscriptions

  // Constructor to inject required services
  constructor(
    public storeService: StoreService, // Store service to fetch images
    public visitService: VisitsService, // Visit service for additional functionality
    public dialog: MatDialog // MatDialog for displaying image modal
  ) { }

  // Lifecycle hook to initialize component and load images
  ngOnInit(): void {
    this.getImages(); // Fetch images when the component is initialized
  }

  // Lifecycle hook to clean up subscriptions when the component is destroyed
  ngOnDestroy(): void {
    this.sink.unsubscribe(); // Unsubscribe from all active subscriptions
  }

  // Method to fetch images from the store service
  getImages() {
    // Set loading state to true before starting the request
    setTimeout(() => {
      this.isLoading = true;
    }, 0);

    // Add the subscription to the sink to manage it
    this.sink.add(
      this.storeService
        .getImagesByStoreId(this.projectId, this.storeId) // Call service to get images by store ID
        .subscribe((v) => {
          this.isLoading = false; // Set loading state to false once data is fetched
          this.storeImageList = v.data; // Assign the fetched data to the image list
        })
    );
  }

  // Method to handle the back button and close the gallery
  goBack() {
    this.visitService.isVisitOpen.next(false); // Notify visit service to close the visit
    this.loadData.emit(false); // Emit an event to notify the parent component that the gallery is closed
  }

  imgSrc = ''; // Variable to store the source of the clicked image

  // Method to handle the click event on an image and open it in a modal
  onClick(event: any) {
    const imgElem = event.target; // Get the clicked image element
    var target = event.target || event.srcElement || event.currentTarget; // Get the event target (image)
    var srcAttr = target.attributes.src; // Get the `src` attribute of the image
    this.imgSrc = srcAttr.nodeValue; // Store the image source

    // Open the image in a modal dialog
    let dialogRef = this.dialog.open(ImageShowComponent, {
      width: '100vw', // Full-width modal
      height: '100vh', // Full-height modal
      data: this.imgSrc, // Pass the image source to the dialog
      panelClass: 'image-popup', // Custom class for modal styling
    });

    // Optional: Handle actions after the dialog is closed (if needed)
    dialogRef.afterClosed().subscribe((result) => { });
  }
}
