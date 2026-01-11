import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';
import { ITask } from '../models/details.model';
import { Status } from '../models/share.model';

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should filter tasks by search term', () => {
    service.setSearchTerm('refactor');
    const filtered = service.filteredTasks();
    expect(filtered.length).toBeGreaterThan(0);
    expect(
      filtered.every((t) => t.taskTitle.toLowerCase().includes('refactor'))
    ).toBeTrue();
  });

  it('should return all tasks when search term is empty', () => {
    service.setSearchTerm('');
    const filtered = service.filteredTasks();
    expect(filtered.length).toBe(service.getTasks().length);
  });

  it('should sort tasks by title', () => {
    service.setSort('Title');
    const sorted = service.sortedTasks();
    for (let i = 1; i < sorted.length; i++) {
      expect(
        sorted[i - 1].taskTitle.localeCompare(sorted[i].taskTitle)
      ).toBeLessThanOrEqual(0);
    }
  });

  it('should add new task', () => {
    const initialLength = service.getTasks().length;
    const newTask: ITask = {
      taskTitle: 'Test Task',
      description: 'Test Description',
      status: Status.PENDING,
      createdDate: new Date(),
      creating: false,
      isDeleted: false,
    };
    service.addTask(newTask);
    expect(service.getTasks().length).toBe(initialLength + 1);
  });

  it('should update task', () => {
    const tasks = service.getTasks();
    const taskToUpdate = tasks[0];
    const originalTitle = taskToUpdate.taskTitle;
    service.updateTask(taskToUpdate, { taskTitle: 'Updated Title' });
    const updatedTasks = service.getTasks();
    const updated = updatedTasks[0];
    expect(updated.taskTitle).toBe('Updated Title');
    expect(updated.taskTitle).not.toBe(originalTitle);
  });

  it('should filter out deleted tasks in visibleTasks', () => {
    const tasks = service.getTasks();
    const taskToDelete = tasks[0];
    service.updateTask(taskToDelete, { isDeleted: true });
    const visible = service.visibleTasks();
    expect(visible.every((t) => !t.isDeleted)).toBeTrue();
  });
});
