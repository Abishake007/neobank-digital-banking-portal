import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit {

  users: any[] = [];
  loading = true;
  error = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getAllUsers().subscribe({
      next: data => {
        this.users = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Access denied or failed to load users';
        this.loading = false;
      }
    });
  }
}
