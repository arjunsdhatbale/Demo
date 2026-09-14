import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { UserService } from '../../services/user.service';
import { UserStore } from '../../../../store/user.store';
import { User } from '../../models/user.model';
 

const MOCK_USERS: User[] = [
  {
    id: 1,
    firstName: 'Arjun',
    lastName: 'Dhatbale',
    email: 'arjun@example.com',
    phone: '+91 9876543210',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: '2025-01-01',
    updatedAt: '2025-02-01'
  },
  {
    id: 2,
    firstName: 'Sarah',
    lastName: 'Connor',
    email: 'sarah.connor@example.com',
    phone: '+1 415 555 2671',
    role: 'MANAGER',
    status: 'ACTIVE',
    createdAt: '2025-01-15',
    updatedAt: '2025-02-10'
  },
  {
    id: 3,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 202 555 0192',
    role: 'USER',
    status: 'INACTIVE',
    createdAt: '2025-01-20',
    updatedAt: '2025-02-12'
  },
  {
    id: 4,
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 9123456780',
    role: 'MANAGER',
    status: 'ACTIVE',
    createdAt: '2025-01-25',
    updatedAt: '2025-02-15'
  },
  {
    id: 5,
    firstName: 'Michael',
    lastName: 'Scott',
    email: 'michael.scott@example.com',
    phone: '+1 570 555 0144',
    role: 'USER',
    status: 'BLOCKED',
    createdAt: '2025-02-01',
    updatedAt: '2025-02-18'
  }
];

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private userStore = inject(UserStore);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  users = this.userStore.users;
  loading = this.userStore.loading;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userStore.setLoading(true);
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        if (res && res.data) {
          this.userStore.setUsers(res.data);
        } else {
          this.userStore.setUsers([]);
        }
        this.userStore.setLoading(false);
      },
      error: () => {
        // Fallback to demo mock data for offline testing
        this.userStore.setUsers(MOCK_USERS);
        this.userStore.setLoading(false);
      }
    });
  }



  navigateToCreate(): void {
    this.router.navigate(['/users/create']);
  }

  navigateToEdit(user: User): void {
    this.userStore.setSelectedUser(user);
    this.router.navigate(['/users/edit', user.id]);
  }

confirmDelete(user: User): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${user.firstName} ${user.lastName}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteUser(user.id)
    });
  }

  deleteUser(id: number): void {
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.userStore.removeUser(id);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User deleted' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete user' });
      }
    });
  }

  getStatusSeverity(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'success',
      INACTIVE: 'warn',
      BLOCKED: 'danger'
    };
    return map[status] || 'info';
  }

  navigateToDetail(user: User): void {
  this.router.navigate(['/users/detail', user.id]);
}
}
