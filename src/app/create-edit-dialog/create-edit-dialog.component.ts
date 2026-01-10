import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IDialogData, Status } from '../interfaces/dialog.model';
import {
  Form,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-create-edit-dialog',
  templateUrl: './create-edit-dialog.component.html',
  styleUrls: ['./create-edit-dialog.component.scss'],
})
export class CreateEditDialogComponent implements OnInit {
  form: FormGroup = new FormGroup({});
  statusOptions = [
    { displayValue: Status.PENDING },
    { displayValue: Status.IN_PROGRESS },
    { displayValue: Status.DONE },
  ];
  constructor(
    public dialogRef: MatDialogRef<CreateEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDialogData,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      taskTitle: new FormControl(
        this.data.creating ? '' : this.data.taskTitle,
        [Validators.required]
      ),
      description: new FormControl(
        this.data.creating ? '' : this.data.description
      ),
      status: new FormControl(
        this.data.creating ? 'PENDING' : this.data.status,
        [Validators.required]
      ),
    });
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
