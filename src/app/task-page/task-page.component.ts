import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TASKS } from 'src/app/constants/mock';
import { ITask } from 'src/app/models/details.model';
import { Status } from 'src/app/models/share.model';
import { TaskDetailsComponent } from '../task-details/task-details.component';

@Component({
  selector: 'app-task-page',
  templateUrl: './task-page.component.html',
  styleUrls: ['./task-page.component.scss'],
})
export class TaskPageComponent {
  statuses = Status;
  title = 'task-list-app';
  tasks = TASKS;
  searchTerm: string = '';
  allTasks: ITask[] = TASKS;
  selectedSort: 'Title' | 'Date Newest' | 'Date Oldest' | 'Status' = 'Title';
  currentPage = 1;
  itemsPerPage = 3;

  ngOnInit(): void {
    this.setSort(this.selectedSort);
  }
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

  setSort(sortBy: 'Title' | 'Date Newest' | 'Date Oldest' | 'Status'): void {
    this.selectedSort = sortBy;

    const comparators: Record<string, (a: ITask, b: ITask) => number> = {
      Title: (a, b) => a.taskTitle.localeCompare(b.taskTitle),
      'Date Newest': (a, b) =>
        b.createdDate!.getTime() - a.createdDate!.getTime(),
      'Date Oldest': (a, b) =>
        a.createdDate!.getTime() - b.createdDate!.getTime(),
      Status: (a, b) => a.status.localeCompare(b.status),
    };

    const comparator = comparators[sortBy];
    if (comparator) {
      this.tasks.sort(comparator);
    }

    this.currentPage = 1;
  }

  onSearchTermChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm = value.toLowerCase().trim();

    if (!this.searchTerm) {
      this.tasks = [...this.allTasks];
    } else {
      this.tasks = this.allTasks.filter(
        (task) =>
          task.taskTitle.toLowerCase().includes(this.searchTerm) ||
          task.status.toLowerCase().includes(this.searchTerm)
      );
    }

    this.currentPage = 1;
    console.log('Search term', this.searchTerm);
  }
}
