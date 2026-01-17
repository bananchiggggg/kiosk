
export interface VehicleRecord {
  "Гос. номер": string;
  "Марка/модель": string;
  "Владелец": string;
  [key: string]: string | number;
}

export interface ApiResponse {
  results?: VehicleRecord[];
  error?: string;
  code?: string;
}

export type AppStatus = 'IDLE' | 'LOADING' | 'SUCCESS' | 'NOT_FOUND' | 'ERROR' | 'UNAUTHORIZED' | 'CONFIG_ERROR';

export interface AppState {
  status: AppStatus;
  results: VehicleRecord[];
  errorMessage?: string;
}
