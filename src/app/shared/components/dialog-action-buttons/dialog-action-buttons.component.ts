import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-dialog-action-buttons',
  templateUrl: './dialog-action-buttons.component.html',
  styleUrls: ['./dialog-action-buttons.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogActionButtonsComponent {
  @Input() primaryLabel = 'OK';
  @Input() secondaryLabel = 'Cancel';
  @Input() primaryColor: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() primaryType: 'button' | 'submit' = 'button';
  @Input() secondaryType: 'button' | 'submit' = 'button';
  @Input() primaryDisabled = false;
  @Input() secondaryDisabled = false;
  @Input() primaryAriaLabel?: string;
  @Input() secondaryAriaLabel?: string;

  @Output() primaryClick = new EventEmitter<void>();
  @Output() secondaryClick = new EventEmitter<void>();
}
