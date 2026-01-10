import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { CreateEditDialogComponent } from '../create-edit-dialog/create-edit-dialog.component';
import { DialogTitle } from '../models/share.model';
import { ITask } from '../models/details.model';

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

  openDialog() {
    const dialogRef = this.dialog.open(CreateEditDialogComponent, {
      data: {
        dialogTitle: DialogTitle.EDIT,
        creating: false,
      },
      panelClass: 'dialog-content',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
