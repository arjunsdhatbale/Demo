// src/app/features/products/product-bulk-upload/product-bulk-upload.component.ts
import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, interval, switchMap, takeWhile } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { ProductService } from '../services/product.service';
import { ProductStore } from '../../../store/product.store';
import { JobStatusResponse, ProductRowError } from '../models/product.model';

@Component({
  selector: 'app-product-bulk-upload',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ProgressBarModule,
    TableModule,
    TagModule,
    ToastModule,
    DividerModule
  ],
  providers: [MessageService],
  templateUrl: './product-bulk-upload.component.html',
  styleUrl: './product-bulk-upload.component.scss'
})
export class ProductBulkUploadComponent implements OnDestroy {
  private productService = inject(ProductService);
  private productStore = inject(ProductStore);
  private router = inject(Router);
  private messageService = inject(MessageService);

  selectedFile: File | null = null;
  isDragging = false;
  uploading = false;

  jobId: string | null = null;
  jobStatus: JobStatusResponse | null = null;
  failedRows: ProductRowError[] = [];
  progressPercent = 0;

  private pollSubscription: Subscription | null = null;

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid File',
        detail: 'Only Excel (.xlsx) files are supported by the backend.'
      });
      return;
    }

    this.selectedFile = file;
    this.resetJobState();
  }

  removeFile(): void {
    this.selectedFile = null;
    this.resetJobState();
  }

  private resetJobState(): void {
    this.jobId = null;
    this.jobStatus = null;
    this.failedRows = [];
    this.progressPercent = 0;
    this.stopPolling();
  }

  startUpload(): void {
    if (!this.selectedFile) return;

    this.uploading = true;
    this.failedRows = [];
    this.progressPercent = 5;

    this.productService.uploadExcel(this.selectedFile).subscribe({
      next: (res) => {
        if (res.data?.jobId) {
          this.jobId = res.data.jobId;
          this.messageService.add({
            severity: 'info',
            summary: 'Upload Started',
            detail: `Job ID: ${this.jobId}. Processing product batches asynchronously...`
          });
          this.startPolling(this.jobId);
        } else {
          this.uploading = false;
        }
      },
      error: (err) => {
        this.uploading = false;
        const msg = err.error?.message || err.error?.detail || 'Failed to upload file. Please check file format.';
        this.messageService.add({
          severity: 'error',
          summary: 'Upload Failed',
          detail: msg
        });
      }
    });
  }

  private startPolling(jobId: string): void {
    this.stopPolling();

    this.pollSubscription = interval(1000)
      .pipe(
        switchMap(() => this.productService.getJobStatus(jobId)),
        takeWhile((res) => {
          const status = res.data?.status;
          return status === 'PENDING' || status === 'IN_PROGRESS';
        }, true)
      )
      .subscribe({
        next: (res) => {
          if (!res.data) return;
          this.jobStatus = res.data;

          const total = res.data.totalRows;
          const processed = res.data.processedRows;

          if (total > 0) {
            this.progressPercent = Math.min(100, Math.round((processed / total) * 100));
          } else {
            this.progressPercent = 50;
          }

          if (res.data.status === 'COMPLETED') {
            this.uploading = false;
            this.progressPercent = 100;
            this.onJobCompleted(res.data);
          } else if (res.data.status === 'FAILED') {
            this.uploading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Processing Failed',
              detail: res.data.errorMessage || 'Job failed during batch execution.'
            });
          }
        },
        error: () => {
          this.uploading = false;
        }
      });
  }

  private onJobCompleted(status: JobStatusResponse): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Upload Complete',
      detail: `Processed ${status.processedRows} rows (${status.successfulRows} succeeded, ${status.failedRows} failed).`
    });

    // If there were failed rows, fetch detailed rejection reasons
    if (status.failedRows > 0 && this.jobId) {
      this.productService.getFailedRows(this.jobId).subscribe({
        next: (errRes) => {
          if (errRes.data) {
            this.failedRows = errRes.data;
          }
        }
      });
    }

    // Refresh ProductStore so products table immediately reflects newly imported products
    this.productService.getAllProducts().subscribe({
      next: (prodRes) => {
        if (prodRes.data) {
          this.productStore.setProducts(prodRes.data);
        }
      }
    });
  }

  private stopPolling(): void {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
      this.pollSubscription = null;
    }
  }

  downloadSample(): void {
    this.productService.downloadSampleTemplate();
    this.messageService.add({
      severity: 'info',
      summary: 'Template Downloaded',
      detail: 'Downloaded products_bulk_upload_sample.xlsx with required columns.'
    });
  }

  navigateBack(): void {
    this.router.navigate(['/products']);
  }

  getStatusSeverity(status: string | undefined): 'success' | 'info' | 'warn' | 'danger' {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'IN_PROGRESS': return 'info';
      case 'PENDING': return 'warn';
      case 'FAILED': return 'danger';
      default: return 'info';
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}
