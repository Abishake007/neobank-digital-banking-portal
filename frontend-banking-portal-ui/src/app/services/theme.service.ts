import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'banking-theme';

  initTheme() {
    const savedTheme = localStorage.getItem(this.THEME_KEY) || 'light';
    document.body.setAttribute('data-theme', savedTheme);
  }

  toggleTheme() {
    const current = document.body.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';

    document.body.setAttribute('data-theme', next);
    localStorage.setItem(this.THEME_KEY, next);
  }

  isDark(): boolean {
    return document.body.getAttribute('data-theme') === 'dark';
  }
}
