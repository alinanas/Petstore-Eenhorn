import {Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { STATUSES } from '../../constants';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

export interface DialogData {
  status: string;
  name: string;
  photoUrls: string[];
}

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'addDialog.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatSelectModule,
  ],
})
export class AddPetDialog {
  statuses = STATUSES;
  
  constructor(
    public dialogRef: MatDialogRef<AddPetDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    @Inject(MAT_DIALOG_DATA) public title: DialogData,
  ) {}

  onNoClick(): void {
    this.dialogRef.close(null);
  }
}
