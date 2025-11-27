import React, { useState, useMemo, type Dispatch, type SetStateAction } from 'react';
import './List.css'
import type { TProperties } from './types';

// Define the item type
interface ListItem {
    properties:TProperties,
}

// Sorting options
type SortField = 'fid' | 'name' | 'type' | 'area_km2' | 'region' | 'pop_density' | 'pop_u_cens' | 'pop_r_cens' | 'pop_t_cens' | 'urb';
type SortDirection = 'asc' | 'desc';

// Props for the component
interface SortablePaginatedListProps {
  items: ListItem[];
  setSelectProperties: Dispatch<SetStateAction<TProperties|null>>;
  itemsPerPage?: number;
}

export const List: React.FC<SortablePaginatedListProps> = ({
  items,
  setSelectProperties,
  itemsPerPage = 10
}) => {
  // State for sorting and pagination
  const [sortField, setSortField] = useState<SortField>('fid');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Sort and paginate the items
  const { totalPages, currentItems } = useMemo(() => {
    // Sort items
    const sorted = [...items].sort((a, b) => {
      const aValue: string|number = a['properties'][sortField];
      const bValue: string|number = b['properties'][sortField];

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    // Calculate pagination
    const totalPages = Math.ceil(sorted.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = sorted.slice(startIndex, endIndex);

    return { sortedItems: sorted, totalPages, currentItems };
  }, [items, sortField, sortDirection, currentPage, itemsPerPage]);

  // Handle sort change
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Render sort indicator
  const renderSortIndicator = (field: SortField) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="sortable-paginated-list">
      {/* Table with sortable headers */}
      <table className="list-table">
        <thead>
          <tr>
            <th 
              onClick={() => handleSort('name')}
              className="sortable-header"
            >
              Название{renderSortIndicator('name')}
            </th>
            <th 
              onClick={() => handleSort('type')}
              className="sortable-header"
            >
              Тип{renderSortIndicator('type')}
            </th>
            <th 
              onClick={() => handleSort('region')}
              className="sortable-header"
            >
              Субъект Федерации{renderSortIndicator('region')}
            </th>
            <th 
              onClick={() => handleSort('pop_t_cens')}
              className="sortable-header"
            >
              Население, чел.{renderSortIndicator('pop_t_cens')}
            </th>
            <th 
              onClick={() => handleSort('urb')}
              className="sortable-header"
            >
              Урбанизация, %{renderSortIndicator('urb')}
            </th>
            <th 
              onClick={() => handleSort('pop_density')}
              className="sortable-header"
            >
              Плотность населения, чел./км2{renderSortIndicator('pop_density')}
            </th>
            <th 
              onClick={() => handleSort('area_km2')}
              className="sortable-header"
            >
              Площадь, км2{renderSortIndicator('area_km2')}
            </th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item) => (
            <tr key={item.properties.fid} onClick={() => {setSelectProperties(item.properties)}}>
              <td>{item.properties.name}</td>
              <td>{item.properties.type}</td>
              <td>{item.properties.region}</td>
              <td>{item.properties.pop_t_cens}</td>
              <td>{(item.properties.urb*100).toFixed()}</td>
              <td>{item.properties.pop_density.toFixed(1)}</td>
              <td>{item.properties.area_km2.toFixed()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            Previous
          </button>

          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`pagination-button ${currentPage === page ? 'active' : ''}`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}

      {/* Page info */}
      <div className="page-info">
        Page {currentPage} of {totalPages} 
        ({items.length} total items)
      </div>
    </div>
  );
};
