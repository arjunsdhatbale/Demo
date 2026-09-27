import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../../products/models/product.model';
import { CartItem } from '../models/order.model';

const CART_STORAGE_KEY = 'demo_shopping_cart';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private _items = signal<CartItem[]>(this.loadCartFromStorage());
  private _drawerVisible = signal<boolean>(false);
  private _checkoutVisible = signal<boolean>(false);

  items = computed(() => this._items());
  drawerVisible = computed(() => this._drawerVisible());
  checkoutVisible = computed(() => this._checkoutVisible());

  totalItems = computed(() =>
    this._items().reduce((total, item) => total + item.quantity, 0)
  );

  totalPrice = computed(() =>
    this._items().reduce((total, item) => total + (item.product.price * item.quantity), 0)
  );

  isEmpty = computed(() => this._items().length === 0);

  constructor() {}

  openDrawer() {
    this._drawerVisible.set(true);
  }

  closeDrawer() {
    this._drawerVisible.set(false);
  }

  toggleDrawer() {
    this._drawerVisible.set(!this._drawerVisible());
  }

  openCheckout() {
    this._drawerVisible.set(false);
    this._checkoutVisible.set(true);
  }

  closeCheckout() {
    this._checkoutVisible.set(false);
  }

  addToCart(product: Product, quantity: number = 1) {
    if (!product || product.stock <= 0) return;

    this._items.update((current) => {
      const index = current.findIndex(i => i.product.id === product.id);
      if (index > -1) {
        const existing = current[index];
        const newQty = Math.min(existing.quantity + quantity, product.stock);
        const updated = [...current];
        updated[index] = { ...existing, quantity: newQty };
        return updated;
      } else {
        const validQty = Math.min(quantity, product.stock);
        return [...current, { product, quantity: validQty }];
      }
    });

    this.saveCartToStorage();
  }

  updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    this._items.update((current) =>
      current.map(item => {
        if (item.product.id === productId) {
          const maxAllowed = item.product.stock;
          return { ...item, quantity: Math.min(quantity, maxAllowed) };
        }
        return item;
      })
    );

    this.saveCartToStorage();
  }

  removeFromCart(productId: number) {
    this._items.update((current) => current.filter(i => i.product.id !== productId));
    this.saveCartToStorage();
  }

  clearCart() {
    this._items.set([]);
    this.saveCartToStorage();
  }

  private saveCartToStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this._items()));
      } catch (e) {
        console.error('Error saving cart to localStorage', e);
      }
    }
  }

  private loadCartFromStorage(): CartItem[] {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.error('Error reading cart from localStorage', e);
      }
    }
    return [];
  }
}
