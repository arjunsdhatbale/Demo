// features/products/products.routes.ts
import { Routes } from '@angular/router';

export const productRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./product-list/product-list.component').then(m => m.ProductListComponent)
  },
  {
    path: 'bulk-upload',
    loadComponent: () =>
      import('./product-bulk-upload/product-bulk-upload.component').then(m => m.ProductBulkUploadComponent)
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./product-form/product-form.component').then(m => m.ProductFormComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./product-form/product-form.component').then(m => m.ProductFormComponent)
  }
//   {
//     path: 'detail/:id',
//     loadComponent: () =>
//       import('./product-detail/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
//   }
];