import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IDialogData, Status } from 'src/app/shared/models/share.model';
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
        this.data.creating ? Status.PENDING : this.data.status,
        [Validators.required]
      ),
    });
  }

  onSave(): void {
    try {
      if (this.form.valid) {
        const formValue = this.form.value;
        const result = {
          ...formValue,
          createdDate: new Date(),
        };
        this.dialogRef.close(result);
      } else {
        this.form.markAllAsTouched();
      }
    } catch (error) {
      console.error('Error saving task:', error);
      this.form.setErrors({ saveError: true });
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
