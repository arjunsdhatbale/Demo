import { Component } from '@angular/core';

import { OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProductService } from '../services/product.service';
import { ProductStore } from '../../../store/product.store';
import { Product } from '../models/product.model';
import { Select } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';

const MOCK_PRODUCTS: Product[] = [
  {
    id: 101,
    name: 'Logitech MX Master 3S',
    description: 'Advanced Wireless Mouse with quiet clicks and 8K DPI sensor',
    price: 8999,
    stock: 24,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100&auto=format&fit=crop&q=60',
    status: 'ACTIVE',
    createdAt: '2025-01-10',
    updatedAt: '2025-02-14'
  },
  {
    id: 102,
    name: 'Mechanical Gaming Keyboard',
    description: 'RGB Backlit Hot-swappable mechanical keyboard',
    price: 5499,
    stock: 12,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100&auto=format&fit=crop&q=60',
    status: 'ACTIVE',
    createdAt: '2025-01-12',
    updatedAt: '2025-02-15'
  },
  {
    id: 103,
    name: 'Ergonomic Office Chair',
    description: 'High-back mesh chair with lumbar support',
    price: 14999,
    stock: 5,
    category: 'Furniture',
    imageUrl: 'https://images.unsplash.com/photo-1580481077195-c9f1388efd38?w=100&auto=format&fit=crop&q=60',
    status: 'ACTIVE',
    createdAt: '2025-01-15',
    updatedAt: '2025-02-10'
  },
  {
    id: 104,
    name: 'Sony WH-1000XM5 Headphones',
    description: 'Industry-leading noise cancelling wireless headphones',
    price: 26990,
    stock: 0,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&auto=format&fit=crop&q=60',
    status: 'OUT_OF_STOCK',
    createdAt: '2025-01-18',
    updatedAt: '2025-02-18'
  },
  {
    id: 105,
    name: 'Standing Desk Converter',
    description: 'Adjustable height sit-to-stand dual monitor riser',
    price: 11499,
    stock: 8,
    category: 'Furniture',
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=100&auto=format&fit=crop&q=60',
    status: 'ACTIVE',
    createdAt: '2025-01-20',
    updatedAt: '2025-02-12'
  },
  {
    id: 106,
    name: 'USB-C Multiport Adapter',
    description: '7-in-1 Hub with 4K HDMI, 100W PD, and SD Card Reader',
    price: 2499,
    stock: 3,
    category: 'Accessories',
    imageUrl: '',
    status: 'INACTIVE',
    createdAt: '2025-01-22',
    updatedAt: '2025-02-05'
  }
];

const MOCK_CATEGORIES = ['Electronics', 'Furniture', 'Accessories'];

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    Select,
    ToastModule,
    ConfirmDialogModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private productStore = inject(ProductStore);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  products = this.productStore.products;
  loading = this.productStore.loading;
  categories = this.productStore.categories;

  selectedCategory = '';
  searchKeyword = '';

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.productStore.setLoading(true);
    this.productService.getAllProducts().subscribe({
      next: (res) => {
        if (res && res.data) {
          this.productStore.setProducts(res.data);
        } else {
          this.productStore.setProducts([]);
        }
        this.productStore.setLoading(false);
      },
      error: () => {
        // Fallback to demo mock data so the PrimeNG Table is fully testable offline
        this.productStore.setProducts(MOCK_PRODUCTS);
        this.productStore.setLoading(false);
      }
    });
  }

  loadCategories(): void {
    this.productService.getAllCategories().subscribe({
      next: (res) => {
        if (res && res.data && res.data.length > 0) {
          this.productStore.setCategories(res.data);
        } else {
          this.productStore.setCategories(MOCK_CATEGORIES);
        }
      },
      error: () => {
        this.productStore.setCategories(MOCK_CATEGORIES);
      }
    });
  }


  onCategoryChange(): void {
    if (this.selectedCategory) {
      this.productStore.setLoading(true);
      this.productService.getProductsByCategory(this.selectedCategory).subscribe({
        next: (res) => {
          this.productStore.setProducts(res.data);
          this.productStore.setLoading(false);
        },
        error: () => this.productStore.setLoading(false)
      });
    } else {
      this.loadProducts();
    }
  }
onSearch(): void {
    if (this.searchKeyword.trim()) {
      this.productService.searchProducts(this.searchKeyword).subscribe({
        next: (res) => this.productStore.setProducts(res.data),
        error: () => {}
      });
    } else {
      this.loadProducts();
    }
  }

  navigateToCreate(): void {
    this.router.navigate(['/products/create']);
  }

 navigateToEdit(product: Product): void {
    this.productStore.setSelectedProduct(product);
    this.router.navigate(['/products/edit', product.id]);
  }

  navigateToDetail(product: Product): void {
    this.router.navigate(['/products/detail', product.id]);
  }

  confirmDelete(product: Product): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${product.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteProduct(product.id)
    });


  }

deleteProduct(id: number): void {
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.productStore.removeProduct(id);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Product deleted successfully'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete product'
        });
      }
    });
  }


  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    const map: Record<string, 'success' | 'warn' | 'danger' | 'info'> = {
      ACTIVE:       'success',
      INACTIVE:     'warn',
      OUT_OF_STOCK: 'danger'
    };
    return map[status] || 'info';
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.searchKeyword    = '';
    this.loadProducts();
  }



}
