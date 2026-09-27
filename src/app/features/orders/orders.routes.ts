import { Routes } from '@angular/router';

export const orderRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./order-list/order-list.component').then(m => m.OrderListComponent)
  },
  {
    path: 'shop',
    loadComponent: () =>
      import('./product-catalog/product-catalog.component').then(m => m.ProductCatalogComponent)
  }
];
