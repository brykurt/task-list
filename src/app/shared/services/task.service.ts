import { Injectable, computed, signal } from '@angular/core';
import { ITask } from '../models/details.model';
import { TASKS } from '../constants/mock';

export type SortOption = 'Title' | 'Date Newest' | 'Date Oldest' | 'Status';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private allTasksSig = signal<ITask[]>(TASKS);
  private searchTermSig = signal<string>('');
  private selectedSortSig = signal<SortOption>('Title');

  readonly allTasks = this.allTasksSig.asReadonly();
  readonly searchTerm = this.searchTermSig.asReadonly();
  readonly selectedSort = this.selectedSortSig.asReadonly();

  readonly filteredTasks = computed(() => {
    const tasks = this.allTasksSig();
    const term = this.searchTermSig().toLowerCase().trim();

    if (!term) {
      return tasks;
    }

    return tasks.filter(
      (task) =>
        task.taskTitle.toLowerCase().includes(term) ||
        task.status.toLowerCase().includes(term)
    );
  });

  readonly sortedTasks = computed(() => {
    const tasks = [...this.filteredTasks()];
    const sortBy = this.selectedSortSig();

    const comparators: Record<SortOption, (a: ITask, b: ITask) => number> = {
      Title: (a, b) => a.taskTitle.localeCompare(b.taskTitle),
      'Date Newest': (a, b) =>
        b.createdDate!.getTime() - a.createdDate!.getTime(),
      'Date Oldest': (a, b) =>
        a.createdDate!.getTime() - b.createdDate!.getTime(),
      Status: (a, b) => a.status.localeCompare(b.status),
    };

    const comparator = comparators[sortBy];
    return comparator ? tasks.sort(comparator) : tasks;
  });

  readonly visibleTasks = computed(() =>
    this.sortedTasks().filter((task) => !task.isDeleted)
  );

  addTask(task: ITask): void {
    const newTask: ITask = {
      ...task,
      isDeleted: task.isDeleted ?? false,
    };
    this.allTasksSig.update((tasks) => [...tasks, newTask]);
  }

  updateTask(originalTask: ITask, updatedData: Partial<ITask>): void {
    this.allTasksSig.update((tasks) =>
      tasks.map((t) =>
        t === originalTask
          ? {
              ...t,
              ...updatedData,
              isDeleted: updatedData.isDeleted ?? t.isDeleted ?? false,
            }
          : t
      )
    );
  }

  setSearchTerm(term: string): void {
    this.searchTermSig.set(term.toLowerCase().trim());
  }

  setSort(sortBy: SortOption): void {
    this.selectedSortSig.set(sortBy);
  }

  getTasks(): ITask[] {
    return this.allTasksSig();
  }
}
