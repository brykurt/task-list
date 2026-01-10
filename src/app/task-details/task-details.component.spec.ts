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
import { of } from 'rxjs';

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
    // Mock dialogRef returned by dialog.open()
    const dialogRefSpyObj = jasmine.createSpyObj({
      afterClosed: of({ taskTitle: 'Updated Task' }),
    });

    // Make MatDialog.open return the mock dialogRef
    dialogSpy.open.and.returnValue(dialogRefSpyObj as any);

    // Call the method
    component.openEditDialog();

    // Verify that MatDialog.open was called
    expect(dialogSpy.open).toHaveBeenCalled();

    // Verify that the component task was updated after dialog closed
    expect(component.data.taskTitle).toBe('Updated Task');
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
});
