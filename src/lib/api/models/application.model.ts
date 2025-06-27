export interface Application {
  id: string;
  name: string;
  code: string;
  basePath: string;
  url: string;
  description: string;
  isOnline: boolean;
  lastChecked: string;
  version: string | null;
  tags: string | null;
  owner: string | null;
}
