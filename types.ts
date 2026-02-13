
export enum IncidentCategory {
  VIOLENCE = 'Bạo lực học đường',
  INFRASTRUCTURE = 'Cơ sở vật chất',
  HEALTH = 'Sức khỏe & Vệ sinh',
  HARASSMENT = 'Quấy rối/Ứng xử',
  OTHERS = 'Vấn đề khác'
}

export enum IncidentStatus {
  PENDING = 'Chờ xử lý',
  PROCESSING = 'Đang xử lý',
  RESOLVED = 'Đã giải quyết'
}

export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  PRINCIPAL = 'PRINCIPAL'
}

export interface IncidentReport {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  location: string;
  classGroup: string;
  timestamp: number;
  status: IncidentStatus;
  anonymous: boolean;
  studentName?: string;    // Tên học sinh (nếu không ẩn danh)
  studentContact?: string; // Liên hệ (nếu không ẩn danh)
  aiAnalysis?: AIAnalysis;
  trackingCode?: string;   // Mã tra cứu dành cho học sinh
  adminReply?: string;     // Lời nhắn phản hồi từ giáo viên
}

export interface AIAnalysis {
  urgency: 'Thấp' | 'Trung bình' | 'Cao' | 'Khẩn cấp';
  summary: string;
  suggestedAction: string;
  educationalNote: string;
}
