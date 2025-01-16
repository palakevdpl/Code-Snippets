import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataGridService } from './data-grid.service';
import { SearchPipe } from './pipes/search.pipe';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [DataGridService, SearchPipe],
})
export class DataGridModule {}
