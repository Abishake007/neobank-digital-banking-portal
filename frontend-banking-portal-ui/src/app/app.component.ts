import { Component, OnInit, OnDestroy, AfterViewInit, inject } from '@angular/core';
import { Router, NavigationEnd, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { LoaderService } from './services/loader.service';
import { AlertService, AlertState } from './services/alert.service';
import { ActivityNotification, ActivityNotificationService } from './services/activity-notification.service';

declare var bootstrap: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  styleUrls: ['./app.component.css'],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {

  showNavbar = true;
  readonly currentYear = new Date().getFullYear();

  public loaderService = inject(LoaderService);
  public alertService = inject(AlertService);
  alertState: AlertState | null = null;
  notifications: ActivityNotification[] = [];
  unreadNotificationCount = 0;
  private notificationTimer?: ReturnType<typeof setInterval>;
  constructor(
    public authService: AuthService,
    private router: Router,
    public themeService: ThemeService,
    private notificationService: ActivityNotificationService
  ) {
    this.alertService.state$.subscribe(state => this.alertState = state);
    // Hide navbar on login page
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showNavbar = !event.url.includes('/login');
        this.closeMobileNavbar();
        if (this.authService.isLoggedIn()) this.refreshNotifications();
      }
    });
  }

  // ⭐ DARK MODE INIT
  ngOnInit(): void {
    this.themeService.initTheme();
    this.refreshNotifications();
    this.notificationTimer = setInterval(() => this.refreshNotifications(), 60000);
  }

  ngOnDestroy(): void {
    if (this.notificationTimer) clearInterval(this.notificationTimer);
  }

  refreshNotifications(): void {
    if (!this.authService.isLoggedIn()) {
      this.notifications = [];
      this.unreadNotificationCount = 0;
      return;
    }
    this.notificationService.list().subscribe({ next: list => this.notifications = list, error: () => undefined });
    this.notificationService.unreadCount().subscribe({ next: result => this.unreadNotificationCount = result.count, error: () => undefined });
  }

  private closeMobileNavbar(): void {
    if (typeof window === 'undefined' || !window.matchMedia('(max-width: 991.98px)').matches) return;

    const navbar = document.getElementById('bankNavbar');
    if (navbar?.classList.contains('show') && typeof bootstrap !== 'undefined') {
      bootstrap.Collapse.getOrCreateInstance(navbar).hide();
    }
  }

  markNotificationRead(notification: ActivityNotification): void {
    if (notification.read) return;
    this.notificationService.markRead(notification.id).subscribe({
      next: () => this.refreshNotifications(),
      error: () => undefined
    });
  }

  markAllNotificationsRead(): void {
    this.notificationService.markAllRead().subscribe({
      next: () => this.refreshNotifications(),
      error: () => undefined
    });
  }

  // ⭐ TOOLTIP INIT
  ngAfterViewInit(): void {
    const tooltipTriggerList =
      [].slice.call(document.querySelectorAll('[data-bs-tooltip="tooltip"]'));

    tooltipTriggerList.forEach((el: any) => {
      new bootstrap.Tooltip(el);
    });
  }

  login() {
    this.router.navigate(['/login']);
  }

  logout() {
    this.authService.logout();
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
