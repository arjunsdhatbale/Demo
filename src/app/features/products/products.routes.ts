// features/products/products.routes.ts
import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';

export const productRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./product-list/product-list.component').then(m => m.ProductListComponent)
  },
  {
    path: 'bulk-upload',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./product-bulk-upload/product-bulk-upload.component').then(m => m.ProductBulkUploadComponent)
  },
  {
    path: 'create',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./product-form/product-form.component').then(m => m.ProductFormComponent)
  },
  {
    path: 'edit/:id',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./product-form/product-form.component').then(m => m.ProductFormComponent)
  }
];