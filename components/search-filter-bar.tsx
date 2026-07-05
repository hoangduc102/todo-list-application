'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FilterStatus, SortBy, SortOrder } from '@/lib/types/todo';

/** Map giá trị sort sang label tiếng Việt */
const SORT_LABELS: Record<SortBy, string> = {
  createdAt: 'Thời gian',
  priority: 'Ưu tiên',
  title: 'Tên A-Z',
};

interface SearchFilterBarProps {
  search: string;
  status: FilterStatus;
  sortBy: SortBy;
  sortOrder: SortOrder;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: FilterStatus) => void;
  onSortByChange: (sortBy: SortBy) => void;
  onSortOrderChange: (sortOrder: SortOrder) => void;
}

export function SearchFilterBar({
  search,
  status,
  sortBy,
  sortOrder,
  onSearchChange,
  onStatusChange,
  onSortByChange,
  onSortOrderChange,
}: SearchFilterBarProps) {
  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <Input
          placeholder="Tìm kiếm công việc..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-2">
        {/* Status filter tabs */}
        <div className="flex rounded-lg border bg-muted/50 p-0.5">
          {(
            [
              { value: 'all', label: 'Tất cả' },
              { value: 'active', label: 'Đang làm' },
              { value: 'completed', label: 'Hoàn thành' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.value}
              onClick={() => onStatusChange(tab.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                status === tab.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort by */}
        <Select value={sortBy} onValueChange={(val) => { if (val) onSortByChange(val as SortBy); }}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue>{SORT_LABELS[sortBy]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Thời gian</SelectItem>
            <SelectItem value="priority">Ưu tiên</SelectItem>
            <SelectItem value="title">Tên A-Z</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort order */}
        <button
          onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="flex items-center justify-center h-8 w-8 rounded-md border bg-background hover:bg-accent transition-colors"
          aria-label={sortOrder === 'asc' ? 'Sắp xếp giảm dần' : 'Sắp xếp tăng dần'}
          title={sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}
        >
          {sortOrder === 'asc' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 8 4-4 4 4" />
              <path d="M7 4v16" />
              <path d="M11 12h4" />
              <path d="M11 16h7" />
              <path d="M11 20h10" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 16 4 4 4-4" />
              <path d="M7 20V4" />
              <path d="M11 4h10" />
              <path d="M11 8h7" />
              <path d="M11 12h4" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
