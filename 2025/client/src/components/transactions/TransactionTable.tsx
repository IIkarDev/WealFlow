import React, { useState } from 'react';
import type { Transaction } from '@/types';
import Button from '@/components/common/Button';
import { Search, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import TransactionItem from "./TransactionItem"; // Assuming TransactionItem is in the same folder

interface TransactionTableProps {
  transactions: Transaction[];
  onEditTransaction: (transaction: Transaction) => void;
  isLoading?: boolean; // Optional: for showing a loading state for the whole table
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onEditTransaction, isLoading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction | null; direction: 'ascending' | 'descending' }>({ key: 'date', direction: 'descending' });

  const handleSort = (key: keyof Transaction) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedTransactions = React.useMemo(() => {
    let sortableItems = [...transactions];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key!];
        const valB = b[sortConfig.key!];

        let comparison = 0;
        if (valA > valB) {
          comparison = 1;
        } else if (valA < valB) {
          comparison = -1;
        }
        return sortConfig.direction === 'ascending' ? comparison : comparison * -1;
      });
    }
    return sortableItems;
  }, [transactions, sortConfig]);

  const filteredTransactions = sortedTransactions.filter((transaction) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const matchesSearch =
      transaction.description.toLowerCase().includes(lowerSearchTerm) ||
      transaction.category.toLowerCase().includes(lowerSearchTerm) ||
      transaction.amount.toString().includes(lowerSearchTerm);

    const matchesFilter =
      filterType === 'all' || (filterType === 'income' && transaction.type) || (filterType === 'expense' && !transaction.type);

    return matchesSearch && matchesFilter;
  });

  const SortIcon: React.FC<{ columnKey: keyof Transaction }> = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronDown size={14} className="ml-1 opacity-50" />;
    }
    return sortConfig.direction === 'ascending' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />;
  };


  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              placeholder="Search transactions..."
              className="input pl-10 w-full" // Ensure input takes full width of its container
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex space-x-2">
            <Button
              variant={filterType === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
            >
              All
            </Button>
            <Button
              variant={filterType === 'income' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterType('income')}
            >
              Income
            </Button>
            <Button
              variant={filterType === 'expense' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterType('expense')}
            >
              Expense
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <svg className="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-2">Loading transactions...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                {([
                  { key: 'date', label: 'Date' },
                  { key: 'description', label: 'Description' },
                  { key: 'category', label: 'Category' },
                  { key: 'amount', label: 'Amount' },
                  { key: 'type', label: 'Type' },
                ] as { key: keyof Transaction; label: string }[]).map((header) => (
                  <th
                    key={header.key}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50"
                    onClick={() => handleSort(header.key)}
                  >
                    <div className="flex items-center">
                      {header.label} <SortIcon columnKey={header.key} />
                    </div>
                  </th>
                ))}
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    onEdit={onEditTransaction}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center justify-center">
                        <AlertCircle size={32} className="mb-2 text-gray-400 dark:text-gray-500"/>
                        <span>No transactions found.</span>
                        {searchTerm && <span className="text-xs">Try adjusting your search or filters.</span>}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};


