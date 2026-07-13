import React, { useEffect, useState } from 'react';
import { FaHistory, FaSearch, FaFilter, FaTrash } from 'react-icons/fa';
import historyService from '../services/historyService';
import type { HistoryItem, HistoryFilters } from '../services/historyService';
import HistoryCard from '../components/HistoryCard';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Recognition history page
 */
const History: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<HistoryFilters>({
    type: 'all',
    search: '',
    page: 1,
    pageSize: 10,
    sortBy: 'date',
    sortOrder: 'desc',
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadHistory();
  }, [filters]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await historyService.getHistory(filters);
      setHistory(response.items);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
      console.log(response.items);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setFilters({ ...filters, search: searchTerm, page: 1 });
  };

  const handleFilterType = (type: 'all' | 'movie' | 'music') => {
    setFilters({ ...filters, type, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await historyService.deleteHistoryItem(id);
        loadHistory();
      } catch (error) {
        console.error('Failed to delete history item:', error);
        alert('Failed to delete item. Please try again.');
      }
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
      try {
        await historyService.clearHistory();
        loadHistory();
      } catch (error) {
        console.error('Failed to clear history:', error);
        alert('Failed to clear history. Please try again.');
      }
    }
  };

  const handleView = (id: string) => {
    console.log('View details for:', id);
    // Navigate to detail view or show modal
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="display-5 fw-bold mb-2">
              <FaHistory className="me-3 text-info" />
              Recognition History
            </h1>
            <p className="lead text-muted">
              Browse and manage your recognition history ({totalCount} items)
            </p>
          </div>
          {history.length > 0 && (
            <button className="btn btn-outline-danger" onClick={handleClearAll}>
              <FaTrash className="me-2" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            {/* Search */}
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by title..."
                  value={filters.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Filter by Type */}
            <div className="col-md-6">
              <div className="btn-group w-100" role="group">
                <button
                  type="button"
                  className={`btn ${filters.type === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleFilterType('all')}
                >
                  <FaFilter className="me-2" />
                  All
                </button>
                <button
                  type="button"
                  className={`btn ${filters.type === 'movie' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleFilterType('movie')}
                >
                  Movies
                </button>
                <button
                  type="button"
                  className={`btn ${filters.type === 'music' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleFilterType('music')}
                >
                  Music
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && <LoadingSpinner message="Loading history..." />}

      {/* History List */}
      {!loading && history.length > 0 && (
        <>
          <div className="mb-4">
            {history.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                onDelete={handleDelete}
                onView={handleView}
              />
              
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav>
              <ul className="pagination justify-content-center">
                <li className={`page-item ${filters.page === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(filters.page! - 1)}
                    disabled={filters.page === 1}
                  >
                    Previous
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <li key={page} className={`page-item ${filters.page === page ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(page)}>
                      {page}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${filters.page === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(filters.page! + 1)}
                    disabled={filters.page === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && history.length === 0 && (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <FaHistory className="text-muted mb-3" size={64} />
            <h4 className="text-muted mb-3">No history found</h4>
            <p className="text-muted mb-4">
              {filters.search || filters.type !== 'all'
                ? 'No items match your search criteria. Try adjusting your filters.'
                : "You haven't recognized any movies or music yet."}
            </p>
            {!filters.search && filters.type === 'all' && (
              <div className="d-flex gap-2 justify-content-center">
                <a href="/movie" className="btn btn-primary">
                  Recognize Movie
                </a>
                <a href="/music" className="btn btn-success">
                  Recognize Music
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default History;