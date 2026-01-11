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
import { Status } from 'src/app/shared/models/share.model';
import { DialogActionButtonsComponent } from 'src/app/shared/components/dialog-action-buttons/dialog-action-buttons.component';

describe('CreateEditDialogComponent', () => {
  let component: CreateEditDialogComponent;
  let fixture: ComponentFixture<CreateEditDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateEditDialogComponent, DialogActionButtonsComponent],
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values when creating is true', () => {
    component.ngOnInit();

    expect(component.form.value).toEqual({
      taskTitle: '',
      description: '',
      status: Status.PENDING,
    });

    // Validators
    expect(component.form.controls['taskTitle'].valid).toBeFalse();
    expect(component.form.controls['status'].valid).toBeTrue(); // has default PENDING
  });

  it('should initialize form with existing data when creating is false', () => {
    // Override MAT_DIALOG_DATA
    component.data = {
      creating: false,
      taskTitle: 'Existing Task',
      description: 'Existing Description',
      status: Status.IN_PROGRESS,
    };

    component.ngOnInit();

    expect(component.form.value).toEqual({
      taskTitle: 'Existing Task',
      description: 'Existing Description',
      status: Status.IN_PROGRESS,
    });

    // Validators
    expect(component.form.controls['taskTitle'].valid).toBeTrue();
    expect(component.form.controls['status'].valid).toBeTrue();
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

  it('should handle error when onSave fails', () => {
    const consoleErrorSpy = spyOn(console, 'error');
    const dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);
    dialogRefMock.close.and.throwError('Dialog close error');
    component.dialogRef = dialogRefMock;

    component.form.patchValue({
      taskTitle: 'Test Task',
      description: 'Test Description',
      status: Status.IN_PROGRESS,
    });

    component.onSave();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error saving task:',
      jasmine.any(Error)
    );
  });
});
