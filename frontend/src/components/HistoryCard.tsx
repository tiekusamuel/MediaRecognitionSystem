import React from 'react';
import { FaFilm, FaMusic, FaTrash, FaEye } from 'react-icons/fa';
import type { HistoryItem } from '../services/historyService';

interface HistoryCardProps {
  item: HistoryItem;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

/**
 * History item card component
 */
const HistoryCard: React.FC<HistoryCardProps> = ({ item, onDelete, onView }) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 90) return 'success';
    if (confidence >= 70) return 'warning';
    return 'danger';
  };

  return (
    <div className="card mb-3 shadow-sm">
      <div className="row g-0">
        {/* Thumbnail */}
        <div className="col-md-2">
          <img
            src={item.thumbnail || '/placeholder.png'}
            
            alt={item.title}
            className="img-fluid rounded-start h-100 object-fit-cover"
            style={{ minHeight: '120px' }}
          />
          
        </div>

        {/* Content */}
        <div className="col-md-10">
          <div className="card-body">
            <div className="row align-items-center">
              {/* Title and Type */}
              <div className="col-md-6">
                <div className="d-flex align-items-center mb-2">
                  {item.type === 'movie' ? (
                    <FaFilm className="text-primary me-2" />
                  ) : (
                    <FaMusic className="text-success me-2" />
                  )}
                  <h5 className="card-title mb-0">{item.title}</h5>
                </div>
                <small className="text-muted">
                  <span className="badge bg-secondary me-2">
                    {item.type.toUpperCase()}
                  </span>
                  {formatDate(item.recognitionDate)}
                </small>
              </div>

              {/* Confidence */}
              <div className="col-md-3 text-center">
                <div className="mb-1">
                  <small className="text-muted d-block">Confidence</small>
                  <span className={`badge bg-${getConfidenceColor(item.confidence)} fs-6`}>
                    {item.confidence}%
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="col-md-3 text-end">
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => onView(item.id)}
                  title="View Details"
                >
                  <FaEye />
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => onDelete(item.id)}
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryCard;