import { Injectable, signal, computed, inject } from '@angular/core';
import { User } from '../../features/users/models/user.model';
import { UserService } from '../../features/users/services/user.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CurrentUserService {
  private userService = inject(UserService);
  private authService = inject(AuthService);

  private _manualUser = signal<User | null>(null);
  private _availableUsers = signal<User[]>([]);

  currentUser = computed<User>(() => {
    // If an explicit switch occurred (e.g. by admin)
    const manual = this._manualUser();
    if (manual) return manual;

    // Use current authenticated user from AuthService
    const auth = this.authService.currentUser();
    if (auth) {
      const isAdminRole = auth.roles?.some(r => r.toUpperCase().includes('ADMIN'));
      const role = isAdminRole ? 'ADMIN' : 'USER';
      const nameParts = (auth.username || '').split('@')[0];
      return {
        id: auth.userId || 1,
        firstName: auth.firstName || nameParts || 'User',
        lastName: auth.lastName || '',
        email: auth.email || auth.username || '',
        phone: '',
        role: role,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    return {
      id: 1,
      firstName: 'Guest',
      lastName: '',
      email: '',
      phone: '',
      role: 'USER',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  availableUsers = computed(() => this._availableUsers());

  isAdmin = computed(() => {
    if (this._manualUser()) {
      return this._manualUser()?.role === 'ADMIN';
    }
    return this.authService.isAdmin();
  });

  displayName = computed(() => {
    const u = this.currentUser();
    return u ? `${u.firstName} ${u.lastName}`.trim() : 'Guest';
  });

  constructor() {
    if (this.authService.isAdmin()) {
      this.loadUsers();
    }
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        if (res.data && res.data.length > 0) {
          this._availableUsers.set(res.data);
        }
      },
      error: (err) => console.warn('Could not load users for user switcher:', err)
    });
  }

  switchUser(user: User) {
    this._manualUser.set(user);
  }

  switchUserById(userId: number) {
    const user = this._availableUsers().find(u => u.id === userId);
    if (user) {
      this._manualUser.set(user);
    }
  }
}
