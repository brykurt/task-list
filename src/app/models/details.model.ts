import { IDialogData } from './share.model';

export interface ITask extends IDialogData {
  createdDate: Date;
  isDeleted: boolean;
}
