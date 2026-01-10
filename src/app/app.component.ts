import { Component, OnInit } from '@angular/core';
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
export class AppComponent {}
