import { Component, inject, OnInit, HostListener, computed } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'primeng/api';
import { SidebarModule } from 'primeng/sidebar';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { PopoverModule } from 'primeng/popover';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';

import { NotificationService } from '../../features/notifications/services/notification.service';
import { CartService } from '../../features/orders/services/cart.service';
import { CurrentUserService } from '../../core/services/current-user.service';
import { AuthService } from '../../core/services/auth.service';
import { CartDrawerComponent } from '../../features/orders/cart-drawer/cart-drawer.component';
import { CheckoutDialogComponent } from '../../features/orders/checkout-dialog/checkout-dialog.component';
import { PaymentDialogComponent } from '../../features/payments/payment-dialog/payment-dialog.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    SharedModule,
    SidebarModule,
    ToolbarModule,
    ButtonModule,
    AvatarModule,
    BadgeModule,
    PopoverModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    TagModule,
    CartDrawerComponent,
    CheckoutDialogComponent,
    PaymentDialogComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {

  private router = inject(Router);
  private notificationService = inject(NotificationService);
  public cartService = inject(CartService);
  public currentUserService = inject(CurrentUserService);
  public authService = inject(AuthService);

  sidebarVisible = true;
  isMobile = false;
  isDarkMode = false;
  navSearchText = '';

  notifications = this.notificationService.notifications;
  unreadCount = this.notificationService.unreadCount;

  menuItems = computed(() => {
    const isAdmin = this.authService.isAdmin();
    const items = [
      { label: 'Dashboard', route: '/dashboard', icon: 'pi pi-home', adminOnly: false, badge: false },
      { label: 'Storefront', route: '/shop', icon: 'pi pi-shopping-bag', adminOnly: false, badge: false },
      { label: 'Orders', route: '/orders', icon: 'pi pi-receipt', adminOnly: false, badge: false },
      { label: 'Payments', route: '/payments', icon: 'pi pi-credit-card', adminOnly: false, badge: false },
      { label: 'Products', route: '/products', icon: 'pi pi-box', adminOnly: false, badge: false },
      { label: 'Product Upload', route: '/products/bulk-upload', icon: 'pi pi-upload', adminOnly: true, badge: false },
      { label: 'Users', route: '/users', icon: 'pi pi-users', adminOnly: true, badge: false },
      { label: 'User Upload', route: '/users/bulk-upload', icon: 'pi pi-file-excel', adminOnly: true, badge: false },
      { label: 'Notifications', route: '/notifications', icon: 'pi pi-bell', adminOnly: false, badge: true }
    ];
    return items.filter(item => !item.adminOnly || isAdmin);
  });

  constructor() {
    this.notificationService.init();
  }

  ngOnInit() {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    if (typeof window !== 'undefined') {
      this.isMobile = window.innerWidth <= 992;
      if (this.isMobile) {
        this.sidebarVisible = false;
      } else {
        this.sidebarVisible = true;
      }
    }
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  toggleDarkMode() {
    const htmlElement = document.documentElement;
    htmlElement.classList.toggle('dark-mode');
    this.isDarkMode = htmlElement.classList.contains('dark-mode');
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  onNavItemClick(route: string) {
    this.navigateTo(route);
    if (this.isMobile) {
      this.sidebarVisible = false;
    }
  }

  markAllNotificationsRead() {
    this.notificationService.markAllRead();
  }

  onNavSearch() {
    if (this.navSearchText.trim()) {
      this.router.navigate(['/shop'], { queryParams: { q: this.navSearchText } });
    }
  }

  logout() {
    this.authService.logout();
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}
