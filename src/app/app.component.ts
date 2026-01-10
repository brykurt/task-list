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
  title = 'task-list-app';
  tasks: ITask[] = [
    {
      taskTitle: 'Fix login bug',
      status: Status.DONE,
      description:
        'Users are unable to log in when entering correct credentials',
      createdDate: new Date('2024-03-15T14:05:00'),
      creating: false,
      isDeleted: false,
    },
    {
      taskTitle: 'Implement search',
      status: Status.IN_PROGRESS,
      description: 'Add search functionality to task list',
      createdDate: new Date('2024-03-14T10:30:00'),
      creating: false,
      isDeleted: false,
    },
    {
      taskTitle: 'Update documentation',
      status: Status.PENDING,
      description: 'Update API documentation',
      createdDate: new Date('2024-03-13T09:00:00'),
      creating: false,
      isDeleted: true,
    },
  ];

  currentPage = 1;
  itemsPerPage = 2;

  get totalPages(): number {
    return Math.ceil(this.tasks.length / this.itemsPerPage);
  }

  get paginatedTasks(): ITask[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.tasks.slice(startIndex, endIndex);
  }

  constructor(public dialog: MatDialog) {}

  openTaskDetails(task: ITask): void {
    this.dialog.open(TaskDetailsComponent, {
      data: task,
      panelClass: 'task-details-dialog',
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
