import { Component, computed, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TASKS } from 'src/app/constants/mock';
import { ITask } from 'src/app/models/details.model';
import { DialogTitle, Status } from 'src/app/models/share.model';
import { TaskDetailsComponent } from '../task-details/task-details.component';
import { CreateEditDialogComponent } from '../create-edit-dialog/create-edit-dialog.component';
import { Dialog } from '@angular/cdk/dialog';

@Component({
  selector: 'app-task-page',
  templateUrl: './task-page.component.html',
  styleUrls: ['./task-page.component.scss'],
})
export class TaskPageComponent {
  statuses = Status;
  title = 'task-list-app';

  private tasksSig = signal<ITask[]>(TASKS);
  private allTasksSig = signal<ITask[]>(TASKS);
  private searchTermSig = signal<string>('');
  private selectedSortSig = signal<
    'Title' | 'Date Newest' | 'Date Oldest' | 'Status'
  >('Title');
  private currentPageSig = signal<number>(1);
  private itemsPerPageSig = signal<number>(3);

  get tasks(): ITask[] {
    return this.tasksSig();
  }
  set tasks(value: ITask[]) {
    this.tasksSig.set(value);
  }

  get allTasks(): ITask[] {
    return this.allTasksSig();
  }
  set allTasks(value: ITask[]) {
    this.allTasksSig.set(value);
  }

  get searchTerm(): string {
    return this.searchTermSig();
  }
  set searchTerm(value: string) {
    this.searchTermSig.set(value);
  }

  get selectedSort(): 'Title' | 'Date Newest' | 'Date Oldest' | 'Status' {
    return this.selectedSortSig();
  }
  set selectedSort(value: 'Title' | 'Date Newest' | 'Date Oldest' | 'Status') {
    this.selectedSortSig.set(value);
  }

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

  ngOnInit(): void {
    this.setSort(this.selectedSort);
  }
  private totalPagesSig = computed(() =>
    Math.ceil(
      this.tasksSig().filter((task) => !task.isDeleted).length /
        this.itemsPerPageSig()
    )
  );
  get totalPages(): number {
    return this.totalPagesSig();
  }

  private paginatedTasksSig = computed(() => {
    const visibleTasks = this.tasksSig().filter((task) => !task.isDeleted);
    const startIndex = (this.currentPageSig() - 1) * this.itemsPerPageSig();
    const endIndex = startIndex + this.itemsPerPageSig();
    return visibleTasks.slice(startIndex, endIndex);
  });
  get paginatedTasks(): ITask[] {
    return this.paginatedTasksSig();
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
        this.tasks = this.tasks.map((t) =>
          t === task
            ? {
                ...t,
                taskTitle: result.taskTitle,
                description: result.description,
                status: result.status,
              }
            : t
        );
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
      this.tasks = [...this.tasks].sort(comparator);
    }

    this.currentPage = 1;
  }

  onSearchTermChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm = value.toLowerCase().trim();

    if (!this.searchTerm) {
      this.tasks = [...this.allTasks];
    } else {
      const term = this.searchTerm;
      this.tasks = this.allTasks.filter(
        (task) =>
          task.taskTitle.toLowerCase().includes(term) ||
          task.status.toLowerCase().includes(term)
      );
    }

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
    dialogRef.afterClosed().subscribe((result: ITask) => {
      if (result) {
        const newTask: ITask = {
          ...result,
          isDeleted: result.isDeleted ?? false,
        };
        this.allTasks = [...this.allTasks, newTask];

        if (this.searchTerm) {
          const term = this.searchTerm;
          this.tasks = this.allTasks.filter(
            (task) =>
              task.taskTitle.toLowerCase().includes(term) ||
              task.status.toLowerCase().includes(term)
          );
        } else {
          this.tasks = [...this.allTasks];
        }
      }
    });
  }
}
