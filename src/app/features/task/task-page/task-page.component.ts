import { Component, computed, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ITask } from 'src/app/shared/models/details.model';
import { DialogTitle, Status } from 'src/app/shared/models/share.model';
import { TaskDetailsComponent } from '../task-details/task-details.component';
import { CreateEditDialogComponent } from '../create-edit-dialog/create-edit-dialog.component';
import { TaskService, SortOption } from 'src/app/shared/services/task.service';

@Component({
  selector: 'app-task-page',
  templateUrl: './task-page.component.html',
  styleUrls: ['./task-page.component.scss'],
})
export class TaskPageComponent {
  statuses = Status;
  title = 'task-list-app';

  private currentPageSig = signal<number>(1);
  private itemsPerPageSig = signal<number>(3);

  get currentPage(): number {
    return this.currentPageSig();
  }
  set currentPage(value: number) {
    this.currentPageSig.set(value);
  }

  get itemsPerPage(): number {
    return this.itemsPerPageSig();
  }
  set itemsPerPage(value: number) {
    this.itemsPerPageSig.set(value);
  }

  get tasks(): ITask[] {
    return this.taskService.visibleTasks();
  }

  get allTasks(): ITask[] {
    return this.taskService.getTasks();
  }

  get searchTerm(): string {
    return this.taskService.searchTerm();
  }
  set searchTerm(value: string) {
    this.taskService.setSearchTerm(value);
  }

  get selectedSort(): SortOption {
    return this.taskService.selectedSort();
  }
  set selectedSort(value: SortOption) {
    this.taskService.setSort(value);
  }

  ngOnInit(): void {
    this.taskService.setSort(this.selectedSort);
  }

  private totalPagesSig = computed(() =>
    Math.ceil(this.taskService.visibleTasks().length / this.itemsPerPageSig())
  );
  get totalPages(): number {
    return this.totalPagesSig();
  }

  private paginatedTasksSig = computed(() => {
    const visibleTasks = this.taskService.visibleTasks();
    const startIndex = (this.currentPageSig() - 1) * this.itemsPerPageSig();
    const endIndex = startIndex + this.itemsPerPageSig();
    return visibleTasks.slice(startIndex, endIndex);
  });
  get paginatedTasks(): ITask[] {
    return this.paginatedTasksSig();
  }

  trackByTaskTitle(index: number, task: ITask): string {
    return task.taskTitle + task.createdDate?.getTime();
  }

  constructor(public dialog: MatDialog, private taskService: TaskService) {}

  openTaskDetails(task: ITask): void {
    try {
      const dialogRef = this.dialog.open(TaskDetailsComponent, {
        data: task,
        panelClass: 'task-details-dialog',
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe({
        next: (result: ITask) => {
          if (result) {
            this.taskService.updateTask(task, {
              taskTitle: result.taskTitle,
              description: result.description,
              status: result.status,
              isDeleted: result.isDeleted,
            });
          }
        },
        error: (error) => {
          console.error('Error updating task:', error);
        },
      });
    } catch (error) {
      console.error('Error opening task details:', error);
    }
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

  setSort(sortBy: SortOption): void {
    this.taskService.setSort(sortBy);
    this.currentPage = 1;
  }

  onSearchTermChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.taskService.setSearchTerm(value);
    this.currentPage = 1;
  }

  addTask(): void {
    const dialogRef = this.dialog.open(CreateEditDialogComponent, {
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
    dialogRef.afterClosed().subscribe({
      next: (result: ITask) => {
        if (result) {
          this.taskService.addTask(result);
        }
      },
      error: (error) => {
        console.error('Error adding task:', error);
      },
    });
  }
}
