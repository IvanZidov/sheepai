/**
 * API Service for FastAPI Backend Calls
 * Handles company profile analysis and filter suggestions
 */

// Get API URL from environment or default to localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface CompanyProfileRequest {
  company_url: string;
  description: string;
}

export interface SuggestedFilters {
  categories: string[];
  min_priority: string;
  regions: string[];
  target_audiences: string[];
  industries: string[];
  threat_concerns: string[];
  technologies: string[];
  watch_companies: string[];
  watch_products: string[];
  keywords: string[];
  reasoning: string;
}

export interface CompanyProfile {
  name: string;
  tagline: string | null;
  industry: string;
  size: string | null;
  headquarters: string | null;
  regions_of_operation: string[];
  products_services: string[];
  target_customers: string[];
  tech_stack: string[];
}

export interface CompanyProfileResponse {
  profile: CompanyProfile;
  suggested_filters: SuggestedFilters;
  scraped_content_length: number;
}

export interface FilterOptions {
  categories: Array<{ value: string; name: string }>;
  priorities: Array<{ value: string; name: string }>;
  regions: Array<{ value: string; name: string; flag: string }>;
  industries: Array<{ value: string; name: string }>;
  company_sizes: Array<{ value: string; name: string }>;
  target_audiences: Array<{ value: string; name: string }>;
  threat_concerns: Array<{ value: string; name: string }>;
  technologies: Array<{ value: string; name: string }>;
}

/**
 * Analyze a company and get personalized filter suggestions
 */
export async function analyzeCompanyProfile(
  request: CompanyProfileRequest
): Promise<CompanyProfileResponse> {
  const response = await fetch(`${API_URL}/company/profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get only suggested filters (lightweight version)
 */
export async function suggestFilters(
  request: CompanyProfileRequest
): Promise<{ company_name: string; filters: SuggestedFilters }> {
  const response = await fetch(`${API_URL}/company/suggest-filters`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get all available filter options/taxonomy
 */
export async function getFilterOptions(): Promise<FilterOptions> {
  const response = await fetch(`${API_URL}/company/filter-options`);

  if (!response.ok) {
    throw new Error(`Failed to fetch filter options: ${response.status}`);
  }

  return response.json();
}

