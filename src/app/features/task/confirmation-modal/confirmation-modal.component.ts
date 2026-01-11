import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss'],
})
export class ConfirmationModalComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmationModalComponent>) {}

  onClose(confirm: boolean): void {
    this.dialogRef.close(confirm);
  }
}
