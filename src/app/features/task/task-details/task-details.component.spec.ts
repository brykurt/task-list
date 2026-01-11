import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskDetailsComponent } from './task-details.component';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { DialogTitle, Status } from 'src/app/shared/models/share.model';

describe('TaskDetailsComponent', () => {
  let component: TaskDetailsComponent;
  let fixture: ComponentFixture<TaskDetailsComponent>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    const dialogSpyObj = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      declarations: [TaskDetailsComponent],
      imports: [
        MatDialogModule,
        MatButtonModule,
        BrowserAnimationsModule,
        MatIconModule,
        MatChipsModule,
        CommonModule,
      ],
      providers: [
        { provide: MatDialog, useValue: dialogSpyObj },
        {
          provide: MatDialogRef,
          useValue: { close: jasmine.createSpy('close') },
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            taskTitle: 'Test Task',
            description: 'Test Description',
            status: 'Pending',
            creating: false,
            createdDate: new Date(),
          },
        },
      ],
    }).compileComponents();

    dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    fixture = TestBed.createComponent(TaskDetailsComponent);
    component = fixture.componentInstance;

    // Optionally set an initial task for editing
    component.data = { taskTitle: 'Original Task' } as any;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should close the dialog', () => {
    component.closeDialog();
    expect(component.dialogRef.close).toHaveBeenCalled();
  });

  it('should update the data when openEditDialog is closed', () => {
    // Set initial component data
    component.data = {
      taskTitle: 'Original Task',
      description: 'Original Description',
      status: Status.PENDING,
      isDeleted: false,
      creating: false,
    };

    // Mock dialogRef to return updated task data
    const dialogRefSpyObj = jasmine.createSpyObj({
      afterClosed: of({
        taskTitle: 'Updated Task',
        description: 'Updated Description',
        status: Status.DONE,
      }),
    });

    dialogSpy.open.and.returnValue(dialogRefSpyObj as any);

    component.openEditDialog();

    expect(dialogSpy.open).toHaveBeenCalledWith(
      jasmine.any(Function), // the dialog component
      jasmine.objectContaining({
        data: {
          dialogTitle: DialogTitle.EDIT,
          taskTitle: 'Original Task',
          description: 'Original Description',
          status: Status.PENDING,
          creating: false,
        },
        panelClass: 'dialog-content',
        disableClose: true,
      })
    );

    // Verify component properties were updated
    expect(component.taskTitle).toBe('Updated Task');
    expect(component.description).toBe('Updated Description');
    expect(component.status).toBe(Status.DONE);
  });

  it('should delete the data when confirmed', () => {
    const dialogRefSpyObj = jasmine.createSpyObj({
      afterClosed: of(true),
    });
    dialogSpy.open.and.returnValue(dialogRefSpyObj as any);
    component.openDeleteDialog();
    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('should handle openEditDialog closing with no data', () => {
    // Mock dialogRef with afterClosed returning null
    const dialogRefSpyObj = jasmine.createSpyObj({
      afterClosed: of(null),
    });
    dialogSpy.open.and.returnValue(dialogRefSpyObj as any);

    const originalTask = { ...component.data };

    component.openEditDialog();

    expect(dialogSpy.open).toHaveBeenCalled();
    // Task should remain unchanged
    expect(component.data).toEqual(originalTask);
  });

  it('should handle error when openEditDialog throws', () => {
    const consoleErrorSpy = spyOn(console, 'error');
    dialogSpy.open.and.throwError('Dialog open error');

    component.openEditDialog();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error opening edit dialog:',
      jasmine.any(Error)
    );
  });

  it('should handle error in openEditDialog afterClosed subscription', () => {
    const consoleErrorSpy = spyOn(console, 'error');
    const dialogRefSpyObj = jasmine.createSpyObj('MatDialogRef', [
      'afterClosed',
    ]);

    dialogRefSpyObj.afterClosed.and.returnValue(
      throwError(() => new Error('Edit dialog subscription error'))
    );
    dialogSpy.open.and.returnValue(dialogRefSpyObj);

    component.openEditDialog();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error editing task:',
      jasmine.any(Error)
    );
  });

  it('should handle error when openDeleteDialog throws', () => {
    const consoleErrorSpy = spyOn(console, 'error');
    dialogSpy.open.and.throwError('Delete dialog error');

    component.openDeleteDialog();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error opening delete dialog:',
      jasmine.any(Error)
    );
  });

  it('should handle error in openDeleteDialog afterClosed subscription', () => {
    const consoleErrorSpy = spyOn(console, 'error');
    const dialogRefSpyObj = jasmine.createSpyObj('MatDialogRef', [
      'afterClosed',
    ]);

    dialogRefSpyObj.afterClosed.and.returnValue(
      throwError(() => new Error('Delete dialog subscription error'))
    );
    dialogSpy.open.and.returnValue(dialogRefSpyObj);

    component.openDeleteDialog();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error deleting task:',
      jasmine.any(Error)
    );
  });
});
