import { Injectable } from '@angular/core';


import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserRequest, ApiResponse, UploadResponse, JobStatusResponse, RowError } from '../models/user.model';
import { environment } from '../../../../environments/environment';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  constructor() { }

  getAllUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(this.apiUrl);
  }

  getUserById(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/${id}`);
  }

  createUser(user: UserRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(this.apiUrl, user);
  }

  updateUser(id: number, user: UserRequest): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  searchUsers(keyword: string): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/search?keyword=${keyword}`);
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

  getFailedRows(jobId: string): Observable<ApiResponse<RowError[]>> {
    return this.http.get<ApiResponse<RowError[]>>(`${this.apiUrl}/upload/failed-rows/${jobId}`);
  }

  downloadSampleTemplate(): void {
    const sampleData = [
      {
        firstName: 'Rahul',
        lastName: 'Sharma',
        email: 'rahul.sharma@example.com',
        password: 'Password123',
        phone: '9876543210',
        role: 'USER'
      },
      {
        firstName: 'Priya',
        lastName: 'Verma',
        email: 'priya.verma@example.com',
        password: 'Password123',
        phone: '9123456780',
        role: 'ADMIN'
      },
      {
        firstName: 'Amit',
        lastName: 'Patel',
        email: 'amit.patel@example.com',
        password: 'Password123',
        phone: '9988776655',
        role: 'MANAGER'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    worksheet['!cols'] = [
      { wch: 15 },
      { wch: 15 },
      { wch: 28 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 }
    ];

    XLSX.writeFile(workbook, 'users_bulk_upload_sample.xlsx');
  }

}
