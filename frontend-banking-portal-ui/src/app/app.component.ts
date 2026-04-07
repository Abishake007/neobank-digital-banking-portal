import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { Router, NavigationEnd, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { LoaderService } from './services/loader.service';

declare var bootstrap: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule,CommonModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, AfterViewInit {

  showNavbar = true;

  public loaderService = inject(LoaderService);
  constructor(
    public authService: AuthService,
    private router: Router,
    public themeService: ThemeService
  ) {
    // Hide navbar on login page
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showNavbar = !event.url.includes('/login');
      }
    });
  }

  // ⭐ DARK MODE INIT
  ngOnInit(): void {
    this.themeService.initTheme();
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
