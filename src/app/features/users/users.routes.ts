// features/users/users.routes.ts
import { Routes } from '@angular/router';

export const userRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
        import('./user-list/user-list/user-list.component').then(m => m.UserListComponent)
  },
  {
    path: 'bulk-upload',
    loadComponent: () =>
      import('./user-bulk-upload/user-bulk-upload.component').then(m => m.UserBulkUploadComponent)
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./user-form/user-form/user-form.component').then(m => m.UserFormComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./user-form/user-form/user-form.component').then(m => m.UserFormComponent)
  },
  {
    path: 'detail/:id',
    loadComponent: () =>
      import('./user-detail/user-detail/user-detail.component').then(m => m.UserDetailComponent)
  }
];