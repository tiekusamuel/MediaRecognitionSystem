import api from './api';

// Interfaces
export interface HistoryItem {
  id: string;
  type: 'movie' | 'music';
  title: string;
  thumbnail: string;
  confidence: number;
  recognitionDate: string;
  details?: any;
}


export interface HistoryResponse {
  items: HistoryItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface HistoryFilters {
  type?: 'movie' | 'music' | 'all';
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'date' | 'confidence' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// History service functions
const historyService = {
  /**
   * Get recognition history with filters
   */
  getHistory: async (filters?: HistoryFilters): Promise<HistoryResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.type && filters.type !== 'all') {
      params.append('type', filters.type);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.page) {
      params.append('page', filters.page.toString());
    }
    if (filters?.pageSize) {
      params.append('pageSize', filters.pageSize.toString());
    }
    if (filters?.sortBy) {
      params.append('sortBy', filters.sortBy);
    }
    if (filters?.sortOrder) {
      params.append('sortOrder', filters.sortOrder);
    }

    const response = await api.get<HistoryResponse>(`/history?${params.toString()}`);
    return response.data;
  },

  /**
   * Get single history item details
   */
  getHistoryItem: async (id: string): Promise<HistoryItem> => {
    const response = await api.get<HistoryItem>(`/history/${id}`);
    return response.data;
  },

  /**
   * Delete history item
   */
  deleteHistoryItem: async (id: string): Promise<void> => {
    await api.delete(`/history/${id}`);
  },

  /**
   * Delete multiple history items
   */
  deleteMultipleItems: async (ids: string[]): Promise<void> => {
    await api.post('/history/delete-multiple', { ids });
  },

  /**
   * Clear all history
   */
  clearHistory: async (): Promise<void> => {
    await api.delete('/history/clear');
  },
};

export default historyService;