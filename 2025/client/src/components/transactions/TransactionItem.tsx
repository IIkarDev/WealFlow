import React from 'react';
import type { Transaction } from "../../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
; // Adjusted path if App.tsx is at root
import { Edit, Trash2, Loader2 } from "lucide-react";
import { format } from 'date-fns';
import {BASE_URL} from "@/App";
import {useDeleteTransaction} from "@/components/transactions/functions";

interface TransactionItemProps {
    transaction: Transaction;
    onEdit: (transaction: Transaction) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onEdit }) => {
    const queryClient = useQueryClient();

    const { mutate: deleteTransactionMutate, isPending: isDeleting } = useDeleteTransaction()

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this transaction?")) {
            deleteTransactionMutate(transaction.id);
        }
    };

    const formattedDate = transaction.date ? format(new Date(transaction.date), 'MMM d, yyyy') : 'N/A';

    return (
        <tr
            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 group"
        >
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {formattedDate}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {transaction.description}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {transaction.category}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <span
                className={
                  transaction.type // true for income
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }
              >
                {transaction.type ? '+' : '-'}${transaction.amount.toFixed(2)}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <span
                className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  transaction.type
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                }`}
              >
                {transaction.type ? 'Income' : 'Expense'}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(transaction)}
                        disabled={isDeleting}
                        className="p-1.5 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-gray-700 disabled:opacity-50"
                        aria-label="Edit transaction"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-1.5 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 rounded-md hover:bg-red-100 dark:hover:bg-gray-700 disabled:opacity-50"
                        aria-label="Delete transaction"
                    >
                        {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                </div>
            </td>
        </tr>
    );
};
export default TransactionItem;
