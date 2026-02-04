import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { CreateEditDialogComponent } from '../create-edit-dialog/create-edit-dialog.component';
import { DialogTitle, Status } from 'src/app/shared/models/share.model';
import { ITask } from 'src/app/shared/models/details.model';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.scss'],
})
export class TaskDetailsComponent {
  taskTitle = this.data.taskTitle;
  description = this.data.description;
  status = this.data.status;
  createdDate = this.data.createdDate;
  statuses = Status;
  constructor(
    public dialogRef: MatDialogRef<TaskDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ITask,
    public dialog: MatDialog
  ) {}

  openEditDialog() {
    try {
      const dialogRef = this.dialog.open(CreateEditDialogComponent, {
        data: {
          dialogTitle: DialogTitle.EDIT,
          taskTitle: this.data.taskTitle,
          description: this.data.description,
          status: this.data.status,
          creating: false,
        },
        panelClass: 'dialog-content',
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe({
        next: (result: ITask) => {
          if (result) {
            this.taskTitle = result.taskTitle;
            this.description = result.description;
            this.status = result.status;
          }
        },
        error: (error) => {
          console.error('Error editing task:', error);
        },
      });
    } catch (error) {
      console.error('Error opening edit dialog:', error);
    }
  }

  closeDialog() {
    this.dialogRef.close({
      taskTitle: this.taskTitle,
      description: this.description,
      status: this.status,
      isDeleted: false,
    });
  }

  openDeleteDialog() {
    try {
      const dialogRef = this.dialog.open(ConfirmationModalComponent);

      dialogRef.afterClosed().subscribe({
        next: (confirm: boolean) => {
          if (confirm) {
            this.data.isDeleted = true;
            this.dialogRef.close(this.data);
          }
        },
        error: (error) => {
          console.error('Error deleting task:', error);
        },
      });
    } catch (error) {
      console.error('Error opening delete dialog:', error);
    }
  }
}
