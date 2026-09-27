import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { CartService } from '../services/cart.service';
import { CartItem } from '../models/order.model';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarModule,
    ButtonModule,
    BadgeModule,
    TooltipModule
  ],
  templateUrl: './cart-drawer.component.html',
  styleUrl: './cart-drawer.component.scss'
})
export class CartDrawerComponent {
  public cartService = inject(CartService);

  get isVisible(): boolean {
    return this.cartService.drawerVisible();
  }

  set isVisible(val: boolean) {
    if (!val) {
      this.cartService.closeDrawer();
    }
  }

  increaseQty(item: CartItem) {
    if (item.quantity < item.product.stock) {
      this.cartService.updateQuantity(item.product.id, item.quantity + 1);
    }
  }

  decreaseQty(item: CartItem) {
    this.cartService.updateQuantity(item.product.id, item.quantity - 1);
  }

  removeItem(item: CartItem) {
    this.cartService.removeFromCart(item.product.id);
  }

  clearCart() {
    this.cartService.clearCart();
  }

  proceedToCheckout() {
    this.cartService.openCheckout();
  }
}
