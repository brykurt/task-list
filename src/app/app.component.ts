import { Component } from '@angular/core';
import { Status } from './models/share.model';
import { ITask } from './models/details.model';
import { MatDialog } from '@angular/material/dialog';
import { TaskDetailsComponent } from './task-details/task-details.component';
import { TASKS } from './constants/mock';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  statuses = Status;
  title = 'task-list-app';
  tasks = TASKS;

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
    const dialogRef = this.dialog.open(TaskDetailsComponent, {
      data: task,
      panelClass: 'task-details-dialog',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: ITask) => {
      if (result) {
        const selectedTask = this.tasks?.find((t) => t === task);
        if (selectedTask) {
          selectedTask.taskTitle = result.taskTitle;
          selectedTask.description = result.description;
          selectedTask.status = result.status;
        }
      }
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
