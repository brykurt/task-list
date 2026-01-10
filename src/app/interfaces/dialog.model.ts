export interface IDialogData {
  dialogTitle: DialogTitle;
  taskTitle: string;
  description: string;
  status: Status;
  creating: boolean;
}

export enum DialogTitle {
  EDIT = 'Edit Task',
  CREATE = 'Create Task',
}

export enum Status {
  DONE = 'Done',
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
}

export interface IStatusOptions {
  displayValue: Status;
}
