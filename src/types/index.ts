export interface Submission {
  id: number;
  form_config_id: number | null;
  dynamic_data: Record<string, string | boolean | number> | null;
  submitted_at: string;
  form_config?: FormConfig | null;
  created_at: string;
  updated_at: string;
}

export interface SubmissionFormData {
  cf_turnstile_response?: string;
  [key: string]: string | boolean | number | undefined;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number;
  to?: number;
}

export interface SubmissionQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  form_slug?: string;
}

export interface SubmissionStats {
  today: number;
  this_week: number;
  this_month: number;
  total: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  two_factor_enabled?: boolean;
  created_at: string;
  updated_at: string;
}

export interface TwoFactorSetupResponse {
  secret: string;
  qr_code_url: string;
  backup_codes: string[];
}

export interface Login2FARequest {
  user_id: number;
  code: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface Login2FAPendingResponse {
  requires_2fa: true;
  user: { id: number; name: string; email: string };
}

export interface LoginHistoryEntry {
  id: number;
  ip_address: string;
  user_agent: string;
  login_at: string;
  success: boolean;
  failure_reason: string | null;
}

export interface PaginatedLoginHistoryResponse {
  data: LoginHistoryEntry[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ProfileUpdateRequest {
  name?: string;
  email?: string;
}

export interface PasswordUpdateRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface AuthUser {
  user: User;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface AdminUserFormData {
  name: string;
  email: string;
  role: string;
  password?: string;
  password_confirmation?: string;
}

export interface AppSettings {
  id: number;
  app_name: string;
  app_description: string | null;
  logo_path: string | null;
  logo_url: string | null;
  favicon_path?: string | null;
  favicon_url?: string | null;
  office_name: string | null;
  office_address: string | null;
  office_phone: string | null;
  office_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface SettingsFormData {
  app_name: string;
  app_description: string;
  office_name: string;
  office_address: string;
  office_phone: string;
  office_email: string;
}

export interface ReportDataPoint {
  date?: string;
  name?: string;
  count: number;
}

export interface AllReportData {
  submissionsOverTime: ReportDataPoint[];
  dynamicReports: Record<string, DynamicFieldReport>;
}

export interface PdfGenerationOptions {
  dateFrom: string;
  dateTo: string;
  appName: string;
  logoUrl: string | null;
  formTitle?: string;
  formDescription?: string;
  officeName?: string;
  officeAddress?: string;
}

export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'number'
  | 'tel'
  | 'select'
  | 'checkbox'
  | 'date'
  | 'time'
  | 'file_upload'
  | 'image_upload'
  | 'signature'
  | 'radio';

export interface SelectOption {
  value: string;
  label: string;
}

export interface ValidationRules {
  min_length?: number;
  max_length?: number;
  min_value?: number;
  max_value?: number;
  pattern?: string;
  pattern_message?: string;
  max_file_size?: number;
  allowed_extensions?: string[];
}

export type LogicOperator = 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';

export interface FieldCondition {
  field_id: string;
  operator: LogicOperator;
  value: string;
}

export interface ConditionalLogic {
  enabled: boolean;
  action: 'show' | 'hide';
  match_type: 'any' | 'all';
  conditions: FieldCondition[];
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  required: boolean;
  enabled?: boolean;
  is_unique?: boolean;
  placeholder?: string;
  help_text?: string;
  options?: SelectOption[];
  validation?: ValidationRules;
  order: number;
  layout_direction?: 'horizontal' | 'vertical';
  default_value?: string;
  conditional_logic?: ConditionalLogic;
}

export type FormStatus = 'published' | 'draft' | 'archived';

export interface UserInfo {
  id: number;
  name: string;
}

export interface FormConfig {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  status: FormStatus;

  fields: FormField[];
  response_count?: number;
  created_by: UserInfo | null;
  updated_by: UserInfo | null;
  created_at: string;
  updated_at: string;
}

export interface FormListItem {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  status: FormStatus;
  response_count: number;
  created_by: UserInfo | null;
  updated_by: UserInfo | null;
  created_at: string;
  updated_at: string;
}

export interface FormConfigFormData {
  title?: string;
  description?: string;
  status?: FormStatus;

  fields?: FormField[];
}

export interface CreateFormData {
  title: string;
  description?: string;
  status?: FormStatus;
  fields?: FormField[];
}

export interface DynamicFormData {
  [fieldId: string]: string | boolean | number;
}

export interface ChartFieldInfo {
  id: string;
  type: FormFieldType;
  label: string;
  options?: SelectOption[];
}

export interface DynamicFieldReport {
  field: ChartFieldInfo;
  data: ReportDataPoint[];
}

export const CHART_COMPATIBLE_TYPES: FormFieldType[] = ['select', 'checkbox', 'text', 'date', 'radio'];

export interface FileUploadResponse {
  id: number;
  original_name: string;
  mime_type: string;
  file_size: number;
  url: string;
}

export interface LookupMatch {
  id: number;
  submitted_at: string;
  summary: {
    name?: string;
    email?: string;
    date: string;
  };
  data: Record<string, string | boolean>;
}

export interface LookupResponse {
  matches: LookupMatch[];
}


