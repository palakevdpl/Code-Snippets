import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-image-show',
  standalone: true, // Standalone component declaration
  imports: [], // No additional imports required for this component
  templateUrl: './image-show.component.html', // Path to the component's HTML template
  styleUrls: ['./image-show.component.scss'], // Path to the component's styles (note the plural correction to styleUrls)
})
export class ImageShowComponent implements OnInit {
  imgSrc = ''; // Variable to hold the image source passed through the dialog data

  // Constructor to inject dependencies (DialogRef and data)
  constructor(
    public dialogRef: MatDialogRef<ImageShowComponent>, // Reference to the dialog, used to close it
    @Inject(MAT_DIALOG_DATA) public data: any // Injected dialog data containing the image source
  ) {
    this.imgSrc = data; // Assign the image source passed through data
  }

  // ngOnInit lifecycle hook, runs when the component is initialized
  ngOnInit(): void {
    // Add classes to the element with id 'removeScroll' to hide scroll and set full viewport height
    $('#removeScroll').addClass('overflow-hidden vh-100');
  }

  // Method to handle closing of the modal dialog
  onClose() {
    this.dialogRef.close(); // Close the dialog when called

    // Remove the classes from the element with id 'removeScroll' to restore scrolling and height
    $('#removeScroll').removeClass('overflow-hidden vh-100');
  }
}
