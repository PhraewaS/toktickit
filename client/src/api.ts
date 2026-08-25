const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export interface ReferenceDataItem {
  id: number;
  name: string;
}

export type Category = ReferenceDataItem;
export type RelatedSystem = ReferenceDataItem;

export interface DevelopmentRequester {
  id: number;
  name: string;
  email: string;
}

export interface SystemStatus {
  online: boolean;
  categories: Category[];
}

interface DataResponse<T> {
  data: T;
}

async function fetchData<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const body = (await response.json()) as DataResponse<T>;
  return body.data;
}

export function developmentRequesterHeaders(requesterId: number): HeadersInit {
  return { "X-Development-Requester-Id": String(requesterId) };
}

export function fetchDevelopmentRequesters(): Promise<DevelopmentRequester[]> {
  return fetchData<DevelopmentRequester[]>("/api/development-requesters");
}

export function fetchCategories(): Promise<Category[]> {
  return fetchData<Category[]>("/api/categories");
}

export function fetchRelatedSystems(): Promise<RelatedSystem[]> {
  return fetchData<RelatedSystem[]>("/api/related-systems");
}

export async function checkSystem(): Promise<SystemStatus> {
  const healthResponse = await fetch(`${API_URL}/api/health`);
  if (!healthResponse.ok) {
    throw new Error("System is offline");
  }

  const categories = await fetchCategories();

  return { online: true, categories };
}
