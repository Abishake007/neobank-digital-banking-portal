import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../api.config';

export interface ActivityNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  read: boolean;
}

@Injectable({ providedIn: 'root' })
export class ActivityNotificationService {
  private readonly baseUrl = `${API_BASE_URL}/api/notifications`;

  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<ActivityNotification[]>(this.baseUrl);
  }

  unreadCount() {
    return this.http.get<{ count: number }>(`${this.baseUrl}/unread-count`);
  }

  markRead(id: number) {
    return this.http.post<void>(`${this.baseUrl}/${id}/read`, {});
  }

  markAllRead() {
    return this.http.post<void>(`${this.baseUrl}/read-all`, {});
  }
}
