import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Select } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

import { ProductService } from '../../products/services/product.service';
import { Product } from '../../products/models/product.model';
import { CartService } from '../services/cart.service';

interface SortOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TagModule,
    BadgeModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    Select,
    ToastModule,
    TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './product-catalog.component.html',
  styleUrl: './product-catalog.component.scss'
})
export class ProductCatalogComponent implements OnInit {
  private productService = inject(ProductService);
  public cartService = inject(CartService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  products = signal<Product[]>([]);
  categories = signal<string[]>([]);
  loading = signal<boolean>(false);

  searchKeyword = '';
  selectedCategory: string | null = null;
  selectedSort: string = 'newest';

  // Track selected quantity per product card
  productQuantities: { [key: number]: number } = {};

  sortOptions: SortOption[] = [
    { label: 'Newest Arrivals', value: 'newest' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Product Name: A - Z', value: 'name_asc' }
  ];

  filteredProducts = computed(() => {
    let list = [...this.products()];

    // Search filter
    if (this.searchKeyword.trim()) {
      const q = this.searchKeyword.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (this.selectedCategory) {
      list = list.filter(p => p.category === this.selectedCategory);
    }

    // Sort
    switch (this.selectedSort) {
      case 'price_asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        list.sort((a, b) => b.id - a.id);
        break;
    }

    return list;
  });

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getAllProducts().subscribe({
      next: (res) => {
        if (res.data) {
          this.products.set(res.data);
          // Initialize quantities
          res.data.forEach(p => {
            this.productQuantities[p.id] = 1;
          });
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching products:', err);
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Fetch Failed',
          detail: 'Could not load products. Please check if the backend is running.'
        });
      }
    });
  }

  loadCategories(): void {
    this.productService.getAllCategories().subscribe({
      next: (res) => {
        if (res.data) {
          this.categories.set(res.data);
        }
      },
      error: (err) => console.error('Error fetching categories:', err)
    });
  }

  getQuantity(productId: number): number {
    return this.productQuantities[productId] || 1;
  }

  increaseQuantity(product: Product): void {
    const current = this.getQuantity(product.id);
    if (current < product.stock) {
      this.productQuantities[product.id] = current + 1;
    }
  }

  decreaseQuantity(product: Product): void {
    const current = this.getQuantity(product.id);
    if (current > 1) {
      this.productQuantities[product.id] = current - 1;
    }
  }

  addToCart(product: Product): void {
    if (product.stock <= 0 || product.status !== 'ACTIVE') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Out of Stock',
        detail: `${product.name} is currently out of stock.`
      });
      return;
    }

    const qty = this.getQuantity(product.id);
    this.cartService.addToCart(product, qty);

    this.messageService.add({
      severity: 'success',
      summary: 'Added to Cart',
      detail: `${qty}x ${product.name} added to your shopping cart!`
    });
  }

  buyNow(product: Product): void {
    if (product.stock <= 0 || product.status !== 'ACTIVE') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Out of Stock',
        detail: `${product.name} is not available.`
      });
      return;
    }

    const qty = this.getQuantity(product.id);
    this.cartService.addToCart(product, qty);
    this.cartService.openCheckout();
  }

  clearFilters(): void {
    this.searchKeyword = '';
    this.selectedCategory = null;
    this.selectedSort = 'newest';
  }

  getStockBadgeSeverity(product: Product): 'success' | 'warn' | 'danger' {
    if (product.status === 'OUT_OF_STOCK' || product.stock === 0) return 'danger';
    if (product.stock <= 5) return 'warn';
    return 'success';
  }

  getStockBadgeLabel(product: Product): string {
    if (product.status === 'OUT_OF_STOCK' || product.stock === 0) return 'Out of Stock';
    if (product.stock <= 5) return `Only ${product.stock} left`;
    return 'In Stock';
  }

  navigateToOrders(): void {
    this.router.navigate(['/orders']);
  }
}
