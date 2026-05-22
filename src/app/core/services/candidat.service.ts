import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CandidatProfile, Cv, LettreMotivation } from '../../shared/models/types';

@Injectable({ providedIn: 'root' })
export class CandidatService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<CandidatProfile> {
    return this.http.get<CandidatProfile>(`${this.baseUrl}/candidats/profile`);
  }

  updateProfile(payload: Partial<CandidatProfile>): Observable<CandidatProfile> {
    return this.http.put<CandidatProfile>(`${this.baseUrl}/candidats/profile`, payload);
  }

  uploadCv(file: File): Observable<Cv> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Cv>(`${this.baseUrl}/candidats/cv`, formData);
  }

  addLettre(contenu: string): Observable<LettreMotivation> {
    return this.http.post<LettreMotivation>(`${this.baseUrl}/candidats/lettre`, { contenu });
  }
}
