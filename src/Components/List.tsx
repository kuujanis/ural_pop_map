import React, { useState, useMemo, type Dispatch, type SetStateAction, useCallback } from 'react';
import './List.css'
import type { TProperties } from '../types';

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

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPage(Number(e.target.value));
  },[]);

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
      <div className="table-title">Список территориальных образований</div>
      <div className="list-table">

          <div className={'table-row table-header'}>
            <div 
              onClick={() => handleSort('name')}
            >
              Название{renderSortIndicator('name')}
            </div>
            <div 
              onClick={() => handleSort('type')}
            >
              Тип{renderSortIndicator('type')}
            </div>
            <div 
              onClick={() => handleSort('region')}
            >
              Субъект Федерации{renderSortIndicator('region')}
            </div>
            <div 
              onClick={() => handleSort('pop_t_cens')}
            >
              Население, чел.{renderSortIndicator('pop_t_cens')}
            </div>
            <div 
              onClick={() => handleSort('urb')}
            >
              Урбанизация, %{renderSortIndicator('urb')}
            </div>
            <div 
              onClick={() => handleSort('pop_density')}
            >
              Плотность населения, чел./км2{renderSortIndicator('pop_density')}
            </div>
            <div 
              onClick={() => handleSort('area_km2')}
            >
              Площадь, км2{renderSortIndicator('area_km2')}
            </div>
          </div>
        <div className='item-rows'>
          {currentItems.map((item) => (
            <div className="table-row" key={item.properties.fid} onClick={() => {setSelectProperties(item.properties)}}>
              <div>{item.properties.name}</div>
              <div>{item.properties.type}</div>
              <div>{item.properties.region}</div>
              <div>{item.properties.pop_t_cens}</div>
              <div>{(item.properties.urb*100).toFixed()}</div>
              <div>{item.properties.pop_density.toFixed(1)}</div>
              <div>{item.properties.area_km2.toFixed()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            Первая
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
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Последняя
          </button>
        </div>
      )}

      {/* Page info */}
      <div className="page-info">
        Страница <input 
          type="number" 
          value={currentPage}
          max={totalPages}
          min={1}
          onInput={handleInput}
          className='page-input'
        /> из {totalPages} 
      </div>
    </div>
  );
};
