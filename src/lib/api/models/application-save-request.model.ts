export interface ApplicationSaveRequest {
  id: string;
  name: string;
  code: string;
  basePath: string;
  url: string;
  description?: string | null;
  isOnline: boolean;
  lastChecked: string;
  version?: string | null;
  tags?: string | null;
  owner?: string | null;
}
