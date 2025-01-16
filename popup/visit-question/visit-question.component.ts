import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { Router } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module'; // Shared module containing common components/services
import { VisitsService } from '../../../service/visits.service'; // Service for visit-related API calls
import { SubSink } from 'subsink'; // Utility for managing multiple subscriptions
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DatePipe } from '@angular/common'; // Date formatting utility
import { LoaderComponent } from '../../common/loader/loader.component'; // Loader component
import { NoDataAvailableComponent } from '../../common/no-data-available/no-data-available.component'; // Component to show when no data is available
import { DomSanitizer } from '@angular/platform-browser'; // Sanitizer for handling dynamic HTML
import { MatIconRegistry, MatIconModule } from '@angular/material/icon'; // Material icon utilities
import { ImageShowComponent } from '../image-show/image-show.component'; // Component to show images in full size
import { MatDialog } from '@angular/material/dialog'; // Material dialog for modals

// Constants for custom SVG icons
const QUESTION_ICON = `
  <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- SVG paths for question icon -->
    <path d="..." stroke="currentColor" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`;

const IMAGE_ICON = `
  <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- SVG paths for image icon -->
    <path d="..." stroke="currentColor" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`;

@Component({
  selector: 'visit-question', // Component selector
  standalone: true, // Standalone component
  providers: [VisitsService], // Providing VisitsService at the component level
  imports: [
    SharedModule, // Shared module
    MatTabsModule, // Material tabs module
    MatIconModule, // Material icons module
    MatAccordion, // Material accordion for expansion panels
    MatExpansionModule, // Expansion module for accordion panels
    MatSlideToggleModule, // Slide toggle for toggling expansion state
    DatePipe, // Date formatting
    LoaderComponent, // Loader component
    NoDataAvailableComponent, // No data available component
    ImageShowComponent, // Component for showing full-size images
  ],
  templateUrl: './visit-question.component.html', // Template for the component
  styleUrl: './visit-question.component.scss', // Styles for the component
})
export class VisitQuestionComponent implements OnInit, OnDestroy {
  // Input properties to receive visit ID and store ID
  @Input() visitId: string = '';
  @Input() storeId: string = '';
  @Input() open: boolean = false;

  // Output event to notify parent component when data is loaded or when navigating back
  @Output() loadData = new EventEmitter<any>();

  visitedQuestion: any[] = []; // Array to hold visited questions
  visitedImages: any[] = []; // Array to hold visited images
  checked = true; // Boolean to track the checked state of the slide toggle
  isExpandedAll = true; // Flag to control whether all panels are expanded
  public sink = new SubSink(); // Utility to manage subscriptions
  projectDetails: any = {}; // Object to hold project details
  projNum = ''; // Holds project number
  isQuesLoading = false; // Loading flag for questions
  isImgLoading = false; // Loading flag for images

  // Constructor with dependency injection
  constructor(
    public datePipe: DatePipe,
    public router: Router, // Router for navigation
    public visitService: VisitsService, // Visit service to fetch data
    iconRegistry: MatIconRegistry, // Icon registry for registering custom icons
    sanitizer: DomSanitizer, // DomSanitizer to sanitize HTML content
    public dialog: MatDialog // MatDialog for opening modals
  ) {
    // Register custom SVG icons
    iconRegistry.addSvgIconLiteral(
      'question',
      sanitizer.bypassSecurityTrustHtml(QUESTION_ICON)
    );
    iconRegistry.addSvgIconLiteral(
      'image',
      sanitizer.bypassSecurityTrustHtml(IMAGE_ICON)
    );
  }

  // ngOnInit lifecycle hook to initialize component data
  ngOnInit(): void {
    // Get project details from localStorage
    var details: any = localStorage.getItem('projectDetails');
    this.projectDetails = JSON.parse(details);
    this.projNum = this.projectDetails.projectNumber;

    // Fetch questions on initialization
    this.sink.sink = this.getQuestionById();

    // Set initial states for expansion and toggle
    this.isExpandedAll = true;
    this.checked = true;
  }

  // ngOnDestroy lifecycle hook to clean up subscriptions
  ngOnDestroy(): void {
    this.sink.unsubscribe(); // Unsubscribe from all subscriptions
  }

  // Method to handle navigation back
  goBack() {
    this.visitService.isVisitOpen.next(false); // Notify that the visit is closed
    this.loadData.emit(false); // Emit an event to notify the parent component
  }

  // Method to fetch questions by visit ID
  getQuestionById() {
    setTimeout(() => {
      this.isQuesLoading = true; // Set loading flag to true
    }, 0);

    // Fetch questions from the visit service
    return this.visitService
      .getVisitQuestionById(this.visitId)
      .subscribe((v: any) => {
        this.isQuesLoading = false; // Set loading flag to false
        this.visitedQuestion = v.data !== null ? v.data : []; // Assign fetched data to visitedQuestion
      });
  }

  // Method to fetch images by visit ID and project number
  getImageById() {
    setTimeout(() => {
      this.isImgLoading = true; // Set loading flag to true
    }, 0);

    // Fetch images from the visit service
    return this.visitService
      .getImageByVisits(this.visitId, this.projNum)
      .subscribe((v: any) => {
        this.isImgLoading = false; // Set loading flag to false
        this.visitedImages = v.data !== null && v.data.length !== 0 ? v.data : []; // Assign fetched data to visitedImages
        console.log(this.visitedImages);
        this.visitedImages = this.visitedImages.map((d: any) => {
          return {
            ...d,
            visitDate: this.datePipe.transform(d.visitDate, "dd MMM yyyy"), // Format the date
          };
        });
      });
  }

  // Method to toggle the expansion of questions
  toggleQuestion(ev: any) {
    this.checked = ev.checked; // Update the checked state
    this.isExpandedAll = this.checked; // Set whether all panels are expanded
  }

  // Method to handle tab click events
  id = 0;
  tabClick(ev: MatTabChangeEvent) {
    if (ev.index === 0) {
      // Load questions if the first tab is selected
      this.id = 0;
      this.sink.sink = this.getQuestionById();
    }
    if (ev.index == 1) {
      // Load images if the second tab is selected
      this.id = 1;
      this.sink.sink = this.getImageById();
    }
  }

  // Method to track the opening of panels
  count = 0;
  checkOpen(i: any) {
    this.count = this.count + 1;
    if (this.count == i + 1) {
      this.checked = true; // Ensure that the checked state remains true
    }
  }

  // Method to track the closing of panels
  checkClose(i: number) {
    this.count = this.count - 1;
    if (this.count == 0) {
      this.checked = false; // Set checked to false if no panels are open
    }
  }

  // Method to handle image clicks and open the image modal
  imgSrc = '';
  onClick(event: any) {
    const imgElem = event.target;
    var target = event.target || event.srcElement || event.currentTarget;
    var srcAttr = target.attributes.src;
    this.imgSrc = srcAttr.nodeValue; // Get the source of the clicked image

    // Open the clicked image in a modal
    let dialogRef = this.dialog.open(ImageShowComponent, {
      width: '100vw', // Set modal width to full viewport width
      height: '100vh', // Set modal height to full viewport height
      data: this.imgSrc, // Pass the image source to the modal
      panelClass: 'image-popup', // Custom panel class for styling the modal
    });

    // Handle actions after the modal is closed
    dialogRef.afterClosed().subscribe((result) => { });
  }
}
