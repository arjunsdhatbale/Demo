import { Injectable } from '@angular/core';


import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import { Product, ProductRequest, ApiResponse, UploadResponse, JobStatusResponse, ProductRowError } from '../models/product.model';
import { environment } from '../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ProductService {


  private http   = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/products`;
  constructor() { }


  getAllProducts(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(this.apiUrl);
  }

  getProductById(id: number): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/${id}`);
  }

  getProductsByCategory(category: string): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/category/${category}`);
  }

  getAllCategories(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/categories`);
  }

  createProduct(product: ProductRequest): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(this.apiUrl, product);
  }

updateProduct(id: number, product: ProductRequest): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  searchProducts(keyword: string): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/search?keyword=${keyword}`);
  }

  // ── Excel Bulk Upload Endpoints ─────────────────────────────────────
  uploadExcel(file: File): Observable<ApiResponse<UploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<UploadResponse>>(`${this.apiUrl}/upload`, formData);
  }

  getJobStatus(jobId: string): Observable<ApiResponse<JobStatusResponse>> {
    return this.http.get<ApiResponse<JobStatusResponse>>(`${this.apiUrl}/upload/status/${jobId}`);
  }

  getFailedRows(jobId: string): Observable<ApiResponse<ProductRowError[]>> {
    return this.http.get<ApiResponse<ProductRowError[]>>(`${this.apiUrl}/upload/failed-rows/${jobId}`);
  }

  downloadSampleTemplate(): void {
    const sampleData = [
      {
        name: 'Wireless Bluetooth Earbuds',
        description: 'Noise cancelling in-ear wireless earbuds with 24hr battery',
        price: 3499.00,
        stock: 50,
        category: 'Electronics',
        imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df',
        status: 'ACTIVE'
      },
      {
        name: 'Smart Fitness Watch',
        description: 'Water-resistant fitness tracker with heart rate & SpO2 sensor',
        price: 4999.50,
        stock: 35,
        category: 'Electronics',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
        status: 'ACTIVE'
      },
      {
        name: 'Adjustable Laptop Stand',
        description: 'Ergonomic aluminum foldable laptop stand with heat dissipation',
        price: 1899.00,
        stock: 80,
        category: 'Accessories',
        imageUrl: '',
        status: 'ACTIVE'
      },
      {
        name: 'Mechanical RGB Keyboard',
        description: 'Hot-swappable tactile blue switches with per-key RGB backlighting',
        price: 5499.00,
        stock: 20,
        category: 'Electronics',
        imageUrl: '',
        status: 'ACTIVE'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

    worksheet['!cols'] = [
      { wch: 30 }, // name
      { wch: 45 }, // description
      { wch: 12 }, // price
      { wch: 10 }, // stock
      { wch: 18 }, // category
      { wch: 35 }, // imageUrl
      { wch: 12 }  // status
    ];

    XLSX.writeFile(workbook, 'products_bulk_upload_sample.xlsx');
  }

}
