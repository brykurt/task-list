import { Component } from '@angular/core';
import { Status } from './models/share.model';
import { ITask } from './models/details.model';
import { MatDialog } from '@angular/material/dialog';
import { TaskDetailsComponent } from './task-details/task-details.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  statuses = Status;
  title = 'task-list-app';
  tasks: ITask[] = [
    {
      taskTitle: 'Refactor auth service',
      status: Status.IN_PROGRESS,
      description: 'Clean up and optimize authentication service logic',
      createdDate: new Date('2024-03-12T11:15:00'),
      creating: false,
      isDeleted: false,
    },
    {
      taskTitle: 'Design dashboard UI',
      status: Status.PENDING,
      description: 'Create wireframes for the new dashboard',
      createdDate: new Date('2024-03-11T16:45:00'),
      creating: false,
      isDeleted: false,
    },
    {
      taskTitle: 'Fix pagination issue',
      status: Status.DONE,
      description: 'Pagination breaks when deleting tasks',
      createdDate: new Date('2024-03-10T13:20:00'),
      creating: false,
      isDeleted: false,
    },
    {
      taskTitle: 'Add unit tests',
      status: Status.IN_PROGRESS,
      description: 'Write unit tests for task service',
      createdDate: new Date('2024-03-09T09:40:00'),
      creating: false,
      isDeleted: false,
    },
    {
      taskTitle: 'Optimize database queries',
      status: Status.PENDING,
      description: 'Improve performance of task queries',
      createdDate: new Date('2024-03-08T14:10:00'),
      creating: false,
      isDeleted: false,
    },
    {
      taskTitle: 'Remove deprecated endpoints',
      status: Status.DONE,
      description: 'Clean up deprecated API endpoints',
      createdDate: new Date('2024-03-07T10:00:00'),
      creating: false,
      isDeleted: true,
    },
    {
      taskTitle: 'Implement task filters',
      status: Status.IN_PROGRESS,
      description: 'Allow filtering tasks by status',
      createdDate: new Date('2024-03-06T15:25:00'),
      creating: false,
      isDeleted: false,
    },
    {
      taskTitle: 'Improve error handling',
      status: Status.PENDING,
      description: 'Display user-friendly error messages',
      createdDate: new Date('2024-03-05T11:50:00'),
      creating: false,
      isDeleted: false,
    },
    {
      taskTitle: 'Update dependencies',
      status: Status.DONE,
      description: 'Update Angular and Material dependencies',
      createdDate: new Date('2024-03-04T17:30:00'),
      creating: false,
      isDeleted: false,
    },
    {
      taskTitle: 'Add dark mode',
      status: Status.PENDING,
      description: 'Implement dark mode theme toggle',
      createdDate: new Date('2024-03-03T08:15:00'),
      creating: false,
      isDeleted: false,
    },
  ];

  currentPage = 1;
  itemsPerPage = 3;

  get totalPages(): number {
    return Math.ceil(
      this.tasks.filter((task) => !task.isDeleted).length / this.itemsPerPage
    );
  }

  get paginatedTasks(): ITask[] {
    const visibleTasks = this.tasks.filter((task) => !task.isDeleted);

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    return visibleTasks.slice(startIndex, endIndex);
  }

  constructor(public dialog: MatDialog) {}

  openTaskDetails(task: ITask): void {
    this.dialog.open(TaskDetailsComponent, {
      data: task,
      panelClass: 'task-details-dialog',
      disableClose: true,
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
}
