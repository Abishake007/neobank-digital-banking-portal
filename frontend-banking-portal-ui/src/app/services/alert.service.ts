import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AlertKind = 'success' | 'error' | 'info';
export interface AlertState {
  kind: AlertKind;
  message: string;
  confirm: boolean;
  resolve?: (value: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  private readonly stateSubject = new BehaviorSubject<AlertState | null>(null);
  readonly state$ = this.stateSubject.asObservable();

  show(message: string, kind: AlertKind = 'info'): void {
    this.stateSubject.next({ message, kind, confirm: false });
  }

  confirm(message: string): Promise<boolean> {
    return new Promise(resolve => {
      this.stateSubject.next({ message, kind: 'info', confirm: true, resolve });
    });
  }

  close(accepted = true): void {
    const current = this.stateSubject.value;
    current?.resolve?.(accepted);
    this.stateSubject.next(null);
  }
}
