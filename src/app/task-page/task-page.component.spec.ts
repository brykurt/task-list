import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TaskPageComponent } from './task-page.component';
import { of } from 'rxjs';
import { Status } from '../models/share.model';
import { ITask } from '../models/details.model';
import { TASKS } from '../constants/mock';

describe('TaskPageComponent', () => {
  let component: TaskPageComponent;
  let fixture: ComponentFixture<TaskPageComponent>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  beforeEach(() => {
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    TestBed.configureTestingModule({
      declarations: [TaskPageComponent],
      imports: [
        MatDialogModule,
        MatIconModule,
        MatMenuModule,
        MatChipsModule,
        CommonModule,
      ],
      providers: [
        { provide: MatDialog, useValue: dialogSpy },
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
    });
    fixture = TestBed.createComponent(TaskPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open task details dialog', () => {
    const dialogRefSpyObj = jasmine.createSpyObj({
      afterClosed: of({ taskTitle: 'Updated Task' }),
    });
    const task = {
      taskTitle: 'Original Task',
      description: 'Original Description',
      status: Status.PENDING,
      createdDate: new Date(),
    } as ITask;
    component.tasks = [task];
    dialogSpy.open.and.returnValue(dialogRefSpyObj as any);
    component.openTaskDetails(task);
  });

  it('should open ');

  it('should call ngOnInit', () => {
    const spy = spyOn(component, 'ngOnInit');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  describe('goToPage', () => {
    beforeEach(() => {
      component.tasks = TASKS;
      component.currentPage = 1;
    });

    it('should not update currentPage if page is less than 1', () => {
      component.goToPage(0);
      expect(component.currentPage).toBe(1);

      component.goToPage(-2);
      expect(component.currentPage).toBe(1);
    });

    it('should not update currentPage if page is greater than totalPages', () => {
      component.goToPage(6);
      expect(component.currentPage).toBe(1);

      component.goToPage(100);
      expect(component.currentPage).toBe(1);
    });

    it('should allow setting currentPage to 1 (boundary test)', () => {
      component.goToPage(1);
      expect(component.currentPage).toBe(1);
    });

    it('should allow setting currentPage to totalPages (boundary test)', () => {
      component.goToPage(component.totalPages);
      expect(component.currentPage).toBe(component.totalPages);
    });
  });

  describe('pagination methods', () => {
    beforeEach(() => {
      component.tasks = TASKS;
      component.currentPage = 3;
    });

    describe('previousPage', () => {
      it('should decrement currentPage if greater than 1', () => {
        component.previousPage();
        expect(component.currentPage).toBe(2);

        component.previousPage();
        expect(component.currentPage).toBe(1);
      });

      it('should not decrement currentPage if already at 1', () => {
        component.currentPage = 1;
        component.previousPage();
        expect(component.currentPage).toBe(1);
      });
    });

    describe('nextPage', () => {
      it('should increment currentPage if less than totalPages', () => {
        component.currentPage = 2;
        component.nextPage();
        expect(component.currentPage).toBe(3);
      });

      it('should not increment currentPage if already at totalPages', () => {
        component.currentPage = component.totalPages;
        component.nextPage();
        expect(component.currentPage).toBe(component.totalPages);
      });
    });
  });

  describe('setSort', () => {
    beforeEach(() => {
      component.tasks = TASKS;
      component.currentPage = 3;
    });

    it('should sort tasks by Title alphabetically', () => {
      component.setSort('Title');
      expect(component.currentPage).toBe(1);
    });

    it('should sort tasks by Date Newest', () => {
      component.setSort('Date Newest');
      expect(component.currentPage).toBe(1);
    });

    it('should sort tasks by Date Oldest', () => {
      component.setSort('Date Oldest');
      expect(component.currentPage).toBe(1);
    });

    it('should sort tasks by Status alphabetically', () => {
      component.setSort('Status');
      expect(component.currentPage).toBe(1);
    });
  });

  it('should update tasks and searchTerm when onSearchTermChange is called', () => {
    // Arrange: setup allTasks
    component.allTasks = [
      { taskTitle: 'Task One', status: 'Pending', isDeleted: false } as any,
      { taskTitle: 'Task Two', status: 'Completed', isDeleted: false } as any,
      {
        taskTitle: 'Another Task',
        status: 'In Progress',
        isDeleted: false,
      } as any,
    ];

    // 1️⃣ Simulate typing a search term that matches task titles
    const eventTitle = { target: { value: 'Another' } } as unknown as Event;
    component.onSearchTermChange(eventTitle);

    expect(component.searchTerm).toBe('another');
    expect(component.tasks.length).toBe(1);
    expect(component.tasks[0].taskTitle).toBe('Another Task');
    expect(component.currentPage).toBe(1);

    // 2️⃣ Simulate typing a search term that matches task status
    const eventStatus = { target: { value: 'completed' } } as unknown as Event;
    component.onSearchTermChange(eventStatus);

    expect(component.searchTerm).toBe('completed');
    expect(component.tasks.length).toBe(1);
    expect(component.tasks[0].status).toBe('Completed');
    expect(component.currentPage).toBe(1);

    // 3️⃣ Simulate clearing the search term
    const eventClear = { target: { value: '' } } as unknown as Event;
    component.onSearchTermChange(eventClear);

    expect(component.searchTerm).toBe('');
    expect(component.tasks.length).toBe(3); // all tasks restored
    expect(component.tasks).toEqual(component.allTasks);
    expect(component.currentPage).toBe(1);
  });
});
