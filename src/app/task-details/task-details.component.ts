import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { CreateEditDialogComponent } from '../create-edit-dialog/create-edit-dialog.component';
import { DialogTitle } from '../models/share.model';
import { ITask } from '../models/details.model';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.scss'],
})
export class TaskDetailsComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<TaskDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ITask,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {}

  openEditDialog() {
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

    dialogRef.afterClosed().subscribe((result: ITask) => {
      if (result) {
        this.data.taskTitle = result.taskTitle;
        this.data.description = result.description;
        this.data.status = result.status;
        this.dialogRef.close(this.data);
      }
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  openDeleteDialog() {
    const dialogRef = this.dialog.open(ConfirmationModalComponent);

    dialogRef.afterClosed().subscribe((confirm: boolean) => {
      if (confirm) {
        this.data.isDeleted = true;
        this.dialogRef.close(this.data);
      }
    });
  }
}
