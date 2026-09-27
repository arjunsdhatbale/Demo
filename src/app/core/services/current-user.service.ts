import { Injectable, signal, computed, inject } from '@angular/core';
import { User } from '../../features/users/models/user.model';
import { UserService } from '../../features/users/services/user.service';

@Injectable({
  providedIn: 'root'
})
export class CurrentUserService {
  private userService = inject(UserService);

  // Default to Arjun Dhatbale (ADMIN)
  private _currentUser = signal<User>({
    id: 1,
    firstName: 'Arjun',
    lastName: 'Dhatbale',
    email: 'arjun@example.com',
    phone: '9876543210',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  private _availableUsers = signal<User[]>([]);

  currentUser = computed(() => this._currentUser());
  availableUsers = computed(() => this._availableUsers());
  isAdmin = computed(() => this._currentUser()?.role === 'ADMIN');
  displayName = computed(() => {
    const u = this._currentUser();
    return u ? `${u.firstName} ${u.lastName}` : 'Guest';
  });

  constructor() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        if (res.data && res.data.length > 0) {
          this._availableUsers.set(res.data);
          // If current user is not in the list, default to the first one or keep Arjun if matching
          const found = res.data.find(u => u.id === this._currentUser().id);
          if (found) {
            this._currentUser.set(found);
          } else {
            this._currentUser.set(res.data[0]);
          }
        }
      },
      error: (err) => console.warn('Could not load users for user switcher:', err)
    });
  }

  switchUser(user: User) {
    this._currentUser.set(user);
  }

  switchUserById(userId: number) {
    const user = this._availableUsers().find(u => u.id === userId);
    if (user) {
      this._currentUser.set(user);
    }
  }
}
