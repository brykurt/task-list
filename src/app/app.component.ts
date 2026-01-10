import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateEditDialogComponent } from './create-edit-dialog/create-edit-dialog.component';
import { DialogTitle } from './interfaces/dialog.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'task-list-app';
  constructor(public dialog: MatDialog) {}

  openDialog() {
    const dialogRef = this.dialog.open(CreateEditDialogComponent, {
      data: {
        dialogTitle: DialogTitle.CREATE,
        creating: true,
      },
      panelClass: 'dialog-content',
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Result', result);
      console.log('The dialog was closed');
    });
  }
}
