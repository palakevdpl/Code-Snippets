import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { ExcutiveSummaryService } from '../../../service/excutive-summary.service';
import { DatePipe } from '@angular/common';

// SVG icon for date
const DATE_ICON = `
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.5 8.33335H2.5M13.3333 1.66669V5.00002M6.66667 1.66669V5.00002M6.5 18.3334H13.5C14.9001 18.3334 15.6002 18.3334 16.135 18.0609C16.6054 17.8212 16.9878 17.4387 17.2275 16.9683C17.5 16.4336 17.5 15.7335 17.5 14.3334V7.33335C17.5 5.93322 17.5 5.23316 17.2275 4.69838C16.9878 4.22797 16.6054 3.84552 16.135 3.60584C15.6002 3.33335 14.9001 3.33335 13.5 3.33335H6.5C5.09987 3.33335 4.3998 3.33335 3.86502 3.60584C3.39462 3.84552 3.01217 4.22797 2.77248 4.69838C2.5 5.23316 2.5 5.93322 2.5 7.33335V14.3334C2.5 15.7335 2.5 16.4336 2.77248 16.9683C3.01217 17.4387 3.39462 17.8212 3.86502 18.0609C4.3998 18.3334 5.09987 18.3334 6.5 18.3334Z" stroke="#344054" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`;

@Component({
  selector: 'app-archive-date-picker',
  standalone: true, // Standalone component
  imports: [SharedModule, MatIconModule], // Import shared modules
  providers: [ExcutiveSummaryService, DatePipe], // Service and pipe providers
  templateUrl: './archive-date-picker.component.html', // Template for the component
  styleUrls: ['./archive-date-picker.component.scss'], // Style sheet for the component
})
export class ArchiveDatePicker implements OnInit {
  // FormGroup to handle date range form with required validators
  range: FormGroup = new FormGroup({
    start: new FormControl('', [Validators.required]), // Start date control with required validation
    end: new FormControl('', [Validators.required]),   // End date control with required validation
  });

  // Object to hold user details from localStorage
  userDetails: any = {};
  isRequest = false; // Flag to track the request status
  currentDate: Date = new Date(); // Current date initialization

  // Minimum and maximum date logic for date picker
  minDate = this.subtractYears(new Date(), 2); // Minimum date is 2 years ago
  maxDate = this.subtractMonths(new Date(), 3); // Maximum date is 3 months ago

  // Method to subtract years from a given date
  subtractYears(date: Date, years: number): Date {
    const newDate = new Date(date);
    newDate.setFullYear(date.getFullYear() - years); // Subtract years
    return newDate;
  }

  // Method to subtract months from a given date
  subtractMonths(date: Date, months: number): Date {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() - months); // Subtract months
    return newDate;
  }

  // Constructor to inject necessary services and register the custom icon
  constructor(
    iconRegistry: MatIconRegistry, // Icon registry for custom SVG icons
    sanitizer: DomSanitizer,       // Sanitizer to bypass security and use raw HTML
    public http: HttpClient,       // HttpClient to handle HTTP requests
    public excutiveService: ExcutiveSummaryService, // Service to get archive data
    public datePipe: DatePipe,     // DatePipe to format date strings
    public dialogRef: MatDialogRef<ArchiveDatePicker>, // Dialog reference to close the dialog
    @Inject(MAT_DIALOG_DATA) public data: any       // Injected dialog data
  ) {
    // Registering custom SVG icon for date
    iconRegistry.addSvgIconLiteral(
      'date',
      sanitizer.bypassSecurityTrustHtml(DATE_ICON)
    );
  }

  // Lifecycle hook to execute on component initialization
  ngOnInit(): void {
    // Retrieve and parse user data from localStorage
    let userData: any = localStorage.getItem('userToken');
    this.userDetails = JSON.parse(userData); // Parse and store user details
  }

  // Method to close the dialog and go back
  goBack() {
    this.dialogRef.close(); // Close the dialog
  }

  // Method to format date using DatePipe
  formatDate(dateStr: string): string {
    try {
      const formattedDate = this.datePipe.transform(dateStr, 'yyyy-MM-dd'); // Format date
      if (!formattedDate) throw new Error('Invalid date'); // Error handling for invalid dates
      return formattedDate;
    } catch (error: any) {
      console.error(error.message); // Log the error message
      return 'Invalid date'; // Return 'Invalid date' string on error
    }
  }

  submitAttempt = false; // Flag to track form submission attempt

  // Method to handle form submission
  submitForm() {
    this.submitAttempt = true; // Mark submission attempt
    if (this.range.invalid) {
      this.range.markAllAsTouched(); // Mark all form controls as touched to show validation errors
    } else {
      this.getArchiveData(); // Fetch archived data if the form is valid
    }
  }

  // Method to fetch archive data from the service
  getArchiveData() {
    this.isRequest = true; // Set request flag to true
    const stdt = this.range.controls['start'].value; // Get start date from the form
    const eddt = this.range.controls['end'].value;   // Get end date from the form
    const dt = {
      id: 0,
      cliendId: JSON.stringify(this.userDetails.clientId), // Convert clientId to string
      startDate: this.formatDate(stdt), // Format start date
      endDate: this.formatDate(eddt),   // Format end date
      creationDate: this.datePipe.transform(new Date(), 'YYYY-MM-dd'), // Set creation date
      updateDate: this.datePipe.transform(new Date(), 'YYYY-MM-dd'),   // Set update date
      clientCode: this.userDetails.clientCode, // Client code from user details
      isXmlProcessed: 0, // Initial value for XML processing flag
    };

    // Call the service to get archived data
    this.excutiveService.getArchivedData(dt).subscribe((data: any) => {
      this.isRequest = false; // Reset request flag
      if (data.success) {
        this.dialogRef.close(true); // Close dialog on success with true
      } else {
        this.dialogRef.close(false); // Close dialog on failure with false
      }
    });
  }
}
