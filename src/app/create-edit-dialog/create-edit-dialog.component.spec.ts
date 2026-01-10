import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CreateEditDialogComponent } from './create-edit-dialog.component';
import { Status } from '../models/share.model';

describe('CreateEditDialogComponent', () => {
  let component: CreateEditDialogComponent;
  let fixture: ComponentFixture<CreateEditDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateEditDialogComponent],
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDialogModule,
        MatButtonModule,
        BrowserAnimationsModule,
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: { close: jasmine.createSpy('close') },
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            creating: true,
            taskTitle: '',
            description: '',
            status: Status.PENDING,
            dialogTitle: 'Create Task',
          },
        },
      ],
    });
    fixture = TestBed.createComponent(CreateEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should call ngOnInit', () => {
    const spy = spyOn(component, 'ngOnInit');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close dialog without returning data when onClose is called', () => {
    component.onClose();
    expect(component.dialogRef.close).toHaveBeenCalledWith();
  });

  it('should close dialog with form value when form is valid', () => {
    component.form.patchValue({
      taskTitle: 'Test Task',
      description: 'Test Description',
      status: Status.IN_PROGRESS,
    });

    component.onSave();

    expect(component.dialogRef.close).toHaveBeenCalledWith(
      jasmine.objectContaining({
        taskTitle: 'Test Task',
        description: 'Test Description',
        status: Status.IN_PROGRESS,
      })
    );
  });

  it('should mark all fields as touched when form is invalid', () => {
    const markAllAsTouchedSpy = spyOn(component.form, 'markAllAsTouched');
    component.form.patchValue({
      taskTitle: '',
      description: '',
      status: '',
    });
    component.onSave();
    expect(markAllAsTouchedSpy).toHaveBeenCalled();
    expect(component.dialogRef.close).not.toHaveBeenCalled();
  });
});
