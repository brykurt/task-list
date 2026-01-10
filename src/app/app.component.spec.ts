import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { CreateEditDialogComponent } from './create-edit-dialog/create-edit-dialog.component';
import { MatIcon, MatIconModule } from '@angular/material/icon';

describe('AppComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MatDialogModule,
        BrowserAnimationsModule,
        MatIconModule,
      ],
      declarations: [AppComponent, CreateEditDialogComponent],
    })
  );

  it('should go to next page', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.nextPage();
  });
});
