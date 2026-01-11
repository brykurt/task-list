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
import { of, throwError } from 'rxjs';
import { DialogTitle, Status } from 'src/app/shared/models/share.model';
import { ITask } from 'src/app/shared/models/details.model';
import { TASKS } from 'src/app/shared/constants/mock';
import { CreateEditDialogComponent } from '../create-edit-dialog/create-edit-dialog.component';
import { TaskService } from 'src/app/shared/services/task.service';

describe('TaskPageComponent', () => {
  let component: TaskPageComponent;
  let fixture: ComponentFixture<TaskPageComponent>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let taskService: TaskService;

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
        // Provide TaskService fresh for each test, not as singleton
        { provide: TaskService, useClass: TaskService },
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
    taskService = TestBed.inject(TaskService);
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

    // Manually set the task in service for testing
    taskService['allTasksSig'].set([task]);

    dialogSpy.open.and.returnValue(dialogRefSpyObj as any);
    component.openTaskDetails(task);
  });

  it('should not modify task when details dialog returns no result', () => {
    const dialogRefSpyObj = jasmine.createSpyObj({
      afterClosed: of(undefined),
    });
    const task: ITask = {
      taskTitle: 'Original Task',
      description: 'Original Description',
      status: Status.PENDING,
      createdDate: new Date(),
      creating: false,
      isDeleted: false,
    } as ITask;

    taskService['allTasksSig'].set([task]);
    const before = JSON.stringify(taskService.visibleTasks());

    dialogSpy.open.and.returnValue(dialogRefSpyObj as any);
    component.openTaskDetails(task);

    const after = JSON.stringify(taskService.visibleTasks());
    expect(after).toBe(before);
  });

  it('should call ngOnInit', () => {
    const spy = spyOn(component, 'ngOnInit');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('should update only selected task and leave others unchanged', () => {
    const task1: ITask = {
      taskTitle: 'Task A',
      description: 'Desc A',
      status: Status.PENDING,
      createdDate: new Date(),
      creating: false,
      isDeleted: false,
    } as ITask;
    const task2: ITask = {
      taskTitle: 'Task B',
      description: 'Desc B',
      status: Status.IN_PROGRESS,
      createdDate: new Date(),
      creating: false,
      isDeleted: false,
    } as ITask;

    taskService['allTasksSig'].set([task1, task2]);

    const dialogRefSpyObj = jasmine.createSpyObj({
      afterClosed: of({
        taskTitle: 'Task A Updated',
        description: 'Desc A2',
        status: Status.DONE,
      } as Partial<ITask> as ITask),
    });

    dialogSpy.open.and.returnValue(dialogRefSpyObj as any);

    component.openTaskDetails(task1);

    const visibleTasks = taskService.visibleTasks();
    expect(visibleTasks.length).toBe(2);
    expect(visibleTasks[0].taskTitle).toBe('Task A Updated');
    expect(visibleTasks[0].description).toBe('Desc A2');
    expect(visibleTasks[0].status).toBe(Status.DONE);
    expect(visibleTasks[1].taskTitle).toBe('Task B');
    expect(visibleTasks[1].description).toBe('Desc B');
    expect(visibleTasks[1].status).toBe(Status.IN_PROGRESS);
  });

  it('should mark task as deleted when dialog returns isDeleted', () => {
    const task1: ITask = {
      taskTitle: 'Task A',
      description: 'Desc A',
      status: Status.PENDING,
      createdDate: new Date(),
      creating: false,
      isDeleted: false,
    } as ITask;
    const task2: ITask = {
      taskTitle: 'Task B',
      description: 'Desc B',
      status: Status.IN_PROGRESS,
      createdDate: new Date(),
      creating: false,
      isDeleted: false,
    } as ITask;

    taskService['allTasksSig'].set([task1, task2]);

    const dialogRefSpyObj = jasmine.createSpyObj({
      afterClosed: of({
        taskTitle: 'Task A',
        description: 'Desc A',
        status: Status.PENDING,
        isDeleted: true,
      } as ITask),
    });

    dialogSpy.open.and.returnValue(dialogRefSpyObj as any);

    component.openTaskDetails(task1);

    const updated = taskService
      .getTasks()
      .find((t) => t.taskTitle === 'Task A');
    expect(updated?.isDeleted).toBeTrue();
    expect(component.paginatedTasks.length).toBe(1);
    expect(component.paginatedTasks[0].taskTitle).toBe('Task B');
  });

  it('should reapply search filter when details dialog returns a result and searchTerm is set', () => {
    const task1: ITask = {
      taskTitle: 'Alpha Task',
      description: 'Desc A',
      status: Status.PENDING,
      createdDate: new Date(),
      creating: false,
      isDeleted: false,
    } as ITask;
    const task2: ITask = {
      taskTitle: 'Beta Task',
      description: 'Desc B',
      status: Status.DONE,
      createdDate: new Date(),
      creating: false,
      isDeleted: false,
    } as ITask;

    taskService['allTasksSig'].set([task1, task2]);
    taskService.setSearchTerm('beta');

    const dialogRefSpyObj = jasmine.createSpyObj({
      afterClosed: of({
        taskTitle: 'Alpha Task Updated',
        description: 'Desc A2',
        status: Status.IN_PROGRESS,
      } as Partial<ITask> as ITask),
    });

    dialogSpy.open.and.returnValue(dialogRefSpyObj as any);

    component.openTaskDetails(task1);

    const filteredTasks = taskService.visibleTasks();
    expect(filteredTasks.length).toBe(1);
    expect(filteredTasks[0].taskTitle).toBe('Beta Task');
  });

  it('should default isDeleted to false when details dialog omits it and task had no flag', () => {
    const task: ITask = {
      taskTitle: 'Flagless Task',
      description: 'No flag',
      status: Status.PENDING,
      createdDate: new Date(),
      creating: false,
    } as ITask;

    taskService['allTasksSig'].set([task]);

    const dialogRefSpyObj = jasmine.createSpyObj({
      afterClosed: of({
        taskTitle: 'Flagless Task Updated',
        description: 'Still no flag',
        status: Status.DONE,
        // omit isDeleted to hit nullish default
      } as Partial<ITask> as ITask),
    });

    dialogSpy.open.and.returnValue(dialogRefSpyObj as any);

    component.openTaskDetails(task);

    const updated = taskService.getTasks()[0];
    expect(updated.isDeleted).toBeFalse();
    expect(updated.taskTitle).toBe('Flagless Task Updated');
  });

  describe('goToPage', () => {
    beforeEach(() => {
      taskService['allTasksSig'].set(TASKS);
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
      taskService['allTasksSig'].set(TASKS);
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
      taskService['allTasksSig'].set(TASKS);
      component.currentPage = 3;
    });

    it('should sort tasks by Title alphabetically', () => {
      component.setSort('Title');
      expect(component.currentPage).toBe(1);
      const titles = taskService.visibleTasks().map((t) => t.taskTitle);
      expect(titles.slice(0, 5)).toEqual([
        'Add dark mode',
        'Add unit tests',
        'Design dashboard UI',
        'Fix pagination issue',
        'Implement task filters',
      ]);
    });

    it('should sort tasks by Date Newest', () => {
      component.setSort('Date Newest');
      expect(component.currentPage).toBe(1);
      const titles = taskService.visibleTasks().map((t) => t.taskTitle);
      expect(titles.slice(0, 5)).toEqual([
        'Refactor auth service',
        'Design dashboard UI',
        'Fix pagination issue',
        'Add unit tests',
        'Optimize database queries',
      ]);
    });

    it('should sort tasks by Date Oldest', () => {
      component.setSort('Date Oldest');
      expect(component.currentPage).toBe(1);
      const titles = taskService.visibleTasks().map((t) => t.taskTitle);
      // Note: 'Remove deprecated endpoints' is filtered out (isDeleted=true)
      expect(titles.slice(0, 5)).toEqual([
        'Add dark mode',
        'Update dependencies',
        'Improve error handling',
        'Implement task filters',
        'Optimize database queries',
      ]);
    });

    it('should sort tasks by Status alphabetically', () => {
      component.setSort('Status');
      expect(component.currentPage).toBe(1);
      const statuses = taskService.visibleTasks().map((t) => t.status);
      for (let i = 1; i < statuses.length; i++) {
        expect(statuses[i - 1].localeCompare(statuses[i])).toBeLessThanOrEqual(
          0
        );
      }
    });

    it('should ignore unknown sort key and only reset page', () => {
      taskService['allTasksSig'].set(TASKS);
      // Set a known sort first so we can verify it doesn't change
      component.setSort('Date Newest');
      component.currentPage = 3;

      // Get the tasks sorted by Date Newest
      const beforeFirstTitle = taskService.visibleTasks()[0].taskTitle;
      expect(beforeFirstTitle).toBe('Refactor auth service'); // Newest task

      // Try to set an unknown sort
      (component as any).setSort('Unknown');

      // Service should ignore unknown sort and keep last valid sort (Date Newest)
      const afterFirstTitle = taskService.visibleTasks()[0].taskTitle;
      expect(afterFirstTitle).toBe('Refactor auth service'); // Still sorted by Date Newest
      expect(component.currentPage).toBe(1); // Page should reset
    });
  });

  describe('itemsPerPage getter/setter', () => {
    beforeEach(() => {
      taskService['allTasksSig'].set(TASKS);
      component.currentPage = 1;
    });

    it('should expose itemsPerPage via getter and setter', () => {
      const initial = component.itemsPerPage;
      expect(initial).toBe(3);
      component.itemsPerPage = 2;
      expect(component.itemsPerPage).toBe(2);
    });

    it('should recompute totalPages and paginatedTasks when itemsPerPage changes', () => {
      expect(component.totalPages).toBe(3);

      component.itemsPerPage = 2;
      fixture.detectChanges();
      expect(component.totalPages).toBe(5);
      expect(component.paginatedTasks.length).toBe(2);

      component.itemsPerPage = 4;
      fixture.detectChanges();
      expect(component.totalPages).toBe(3);
      expect(component.paginatedTasks.length).toBe(4);
    });
  });

  it('should update tasks and searchTerm when onSearchTermChange is called', () => {
    taskService['allTasksSig'].set(TASKS);

    const eventTitle = {
      target: { value: 'Update Dependencies' },
    } as unknown as Event;
    component.onSearchTermChange(eventTitle);

    expect(component.searchTerm).toBe('update dependencies');
    expect(taskService.visibleTasks().length).toBe(1);
    expect(component.currentPage).toBe(1);

    const eventStatus = { target: { value: Status.DONE } } as unknown as Event;
    component.onSearchTermChange(eventStatus);

    expect(component.searchTerm).toBe('done');
    const doneTasks = taskService.visibleTasks();
    expect(doneTasks.length).toBeGreaterThan(0);
    expect(doneTasks.every((t) => t.status === Status.DONE)).toBeTrue();
    expect(component.currentPage).toBe(1);

    const eventClear = { target: { value: '' } } as unknown as Event;
    component.onSearchTermChange(eventClear);

    expect(component.searchTerm).toBe('');
    // visibleTasks filters out deleted tasks (9 visible out of 10 total)
    expect(taskService.visibleTasks().length).toBe(9);
    expect(component.currentPage).toBe(1);
  });

  it('should open create dialog and add new task on close', () => {
    const newTask: ITask = {
      taskTitle: 'New Task',
      description: 'New task description',
      status: Status.PENDING,
      isDeleted: false,
      creating: true,
      createdDate: new Date(),
    };

    const dialogRefSpyObj = jasmine.createSpyObj({
      afterClosed: of(newTask),
    });

    dialogSpy.open.and.returnValue(dialogRefSpyObj as any);
    const initialLength = taskService.getTasks().length; // All tasks including deleted
    const initialVisibleLength = taskService.visibleTasks().length; // Only non-deleted

    component.addTask();
    fixture.detectChanges(); // Trigger change detection

    expect(dialogSpy.open).toHaveBeenCalledWith(CreateEditDialogComponent, {
      data: {
        dialogTitle: DialogTitle.CREATE,
        taskTitle: '',
        description: '',
        status: Status.PENDING,
        creating: true,
      },
      panelClass: 'dialog-content',
      disableClose: true,
    });

    expect(taskService.getTasks().length).toBe(initialLength + 1);
    expect(taskService.getTasks()).toContain(newTask);
    expect(taskService.visibleTasks().length).toBe(initialVisibleLength + 1);
    expect(
      taskService.visibleTasks().some((t) => t.taskTitle === 'New Task')
    ).toBeTrue();
  });

  it('should not add task when create dialog returns no result', () => {
    const dialogRefSpyObj = jasmine.createSpyObj({
      afterClosed: of(undefined),
    });
    dialogSpy.open.and.returnValue(dialogRefSpyObj as any);
    const initialLength = taskService.getTasks().length;
    component.addTask();
    expect(taskService.getTasks().length).toBe(initialLength);
  });

  it('should add task and honor active search filter', () => {
    taskService['allTasksSig'].set(TASKS);
    const searchEvent = { target: { value: 'unique' } } as unknown as Event;
    component.onSearchTermChange(searchEvent);
    expect(taskService.visibleTasks().length).toBe(0);

    const matchingTask: ITask = {
      taskTitle: 'Unique Feature',
      description: 'Something unique',
      status: Status.PENDING,
      isDeleted: false,
      creating: true,
      createdDate: new Date(),
    };

    const dialogRefSpyObj = jasmine.createSpyObj({
      afterClosed: of(matchingTask),
    });
    dialogSpy.open.and.returnValue(dialogRefSpyObj as any);

    component.addTask();

    expect(
      taskService.getTasks().some((t) => t.taskTitle === 'Unique Feature')
    ).toBeTrue();
    expect(taskService.visibleTasks().length).toBe(1);
    expect(taskService.visibleTasks()[0].taskTitle).toBe('Unique Feature');
  });

  it('should default isDeleted to false when dialog omits it', () => {
    const dialogRefSpyObj = jasmine.createSpyObj({
      afterClosed: of({
        taskTitle: 'No Flag Task',
        description: 'Missing isDeleted',
        status: Status.PENDING,
        creating: true,
        createdDate: new Date(),
        // intentionally omit isDeleted to hit defaulting branch
      } as Partial<ITask> as ITask),
    });

    dialogSpy.open.and.returnValue(dialogRefSpyObj as any);
    const initialLength = taskService.getTasks().length;

    component.addTask();

    const added = taskService
      .getTasks()
      .find((t) => t.taskTitle === 'No Flag Task');
    expect(taskService.getTasks().length).toBe(initialLength + 1);
    expect(added?.isDeleted).toBeFalse();
  });

  it('should handle error when opening task details dialog throws', () => {
    const consoleErrorSpy = spyOn(console, 'error');
    dialogSpy.open.and.throwError('Dialog open error');

    const task: ITask = {
      taskTitle: 'Test Task',
      description: 'Test',
      status: Status.PENDING,
      createdDate: new Date(),
      creating: false,
      isDeleted: false,
    };

    component.openTaskDetails(task);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error opening task details:',
      jasmine.any(Error)
    );
  });

  it('should handle error in task details dialog afterClosed subscription', () => {
    const consoleErrorSpy = spyOn(console, 'error');
    const dialogRefSpyObj = jasmine.createSpyObj('MatDialogRef', [
      'afterClosed',
    ]);

    dialogRefSpyObj.afterClosed.and.returnValue(
      throwError(() => new Error('Dialog subscription error'))
    );
    dialogSpy.open.and.returnValue(dialogRefSpyObj);

    const task: ITask = {
      taskTitle: 'Test Task',
      description: 'Test',
      status: Status.PENDING,
      createdDate: new Date(),
      creating: false,
      isDeleted: false,
    };

    component.openTaskDetails(task);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error updating task:',
      jasmine.any(Error)
    );
  });

  it('should handle error when adding task (dialog afterClosed throws)', () => {
    const consoleErrorSpy = spyOn(console, 'error');
    const dialogRefSpyObj = jasmine.createSpyObj('MatDialogRef', [
      'afterClosed',
    ]);

    dialogRefSpyObj.afterClosed.and.returnValue(
      throwError(() => new Error('Add task error'))
    );
    dialogSpy.open.and.returnValue(dialogRefSpyObj);

    component.addTask();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error adding task:',
      jasmine.any(Error)
    );
  });

  it('should generate unique trackBy value using taskTitle and createdDate', () => {
    const date = new Date('2024-03-10T12:00:00');
    const task: ITask = {
      taskTitle: 'Test Task',
      description: 'Test',
      status: Status.PENDING,
      createdDate: date,
      creating: false,
      isDeleted: false,
    };

    const result = component.trackByTaskTitle(0, task);
    expect(result).toBe('Test Task' + date.getTime());
  });

  it('should handle trackBy with null createdDate', () => {
    const task: ITask = {
      taskTitle: 'Test Task',
      description: 'Test',
      status: Status.PENDING,
      createdDate: undefined,
      creating: false,
      isDeleted: false,
    };

    const result = component.trackByTaskTitle(0, task);
    expect(result).toBe('Test Task' + undefined);
  });

  it('should return visible tasks from get tasks() getter', () => {
    const testTask1: ITask = {
      taskTitle: 'Task 1',
      description: 'Description 1',
      status: Status.PENDING,
      createdDate: new Date(),
      creating: false,
      isDeleted: false,
    };
    const testTask2: ITask = {
      taskTitle: 'Task 2',
      description: 'Description 2',
      status: Status.DONE,
      createdDate: new Date(),
      creating: false,
      isDeleted: false,
    };
    const deletedTask: ITask = {
      taskTitle: 'Deleted Task',
      description: 'Should not be visible',
      status: Status.PENDING,
      createdDate: new Date(),
      creating: false,
      isDeleted: true,
    };

    taskService['allTasksSig'].set([testTask1, testTask2, deletedTask]);

    const tasks = component.tasks;
    expect(tasks.length).toBe(2);
    expect(tasks).toContain(testTask1);
    expect(tasks).toContain(testTask2);
    expect(tasks).not.toContain(deletedTask);
  });

  it('should return all tasks from get allTasks() getter', () => {
    const testTask1: ITask = {
      taskTitle: 'Task 1',
      description: 'Description 1',
      status: Status.PENDING,
      createdDate: new Date(),
      creating: false,
      isDeleted: false,
    };
    const testTask2: ITask = {
      taskTitle: 'Task 2',
      description: 'Description 2',
      status: Status.DONE,
      createdDate: new Date(),
      creating: false,
      isDeleted: false,
    };
    const deletedTask: ITask = {
      taskTitle: 'Deleted Task',
      description: 'Should be included in allTasks',
      status: Status.PENDING,
      createdDate: new Date(),
      creating: false,
      isDeleted: true,
    };

    taskService['allTasksSig'].set([testTask1, testTask2, deletedTask]);

    const allTasks = component.allTasks;
    expect(allTasks.length).toBe(3);
    expect(allTasks).toContain(testTask1);
    expect(allTasks).toContain(testTask2);
    expect(allTasks).toContain(deletedTask);
  });
});
