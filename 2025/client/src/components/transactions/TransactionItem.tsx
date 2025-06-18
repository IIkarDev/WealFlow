import React from 'react';
import type { Transaction } from "../../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
 // Adjusted path if App.tsx is at root
import { Edit, Trash2, Loader2 } from "lucide-react";
import { format } from 'date-fns';
import {BASE_URL} from "@/App";
import {useTransactionsManager} from "@/components/transactions/functions";

interface TransactionItemProps {
    transaction: Transaction;
    allowActions: boolean;
    onEdit: (transaction: Transaction) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onEdit, allowActions }) => {
    const { deleteTransaction, isPending } = useTransactionsManager();

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this transaction?")) {
            deleteTransaction.mutate(transaction.id);
        }
    };

    const formattedDate = transaction.date ? format(new Date(transaction.date), 'MMM d, yyyy') : 'N/A';

    return (
        <tr
            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 group"
        >
            <td className="pl-8 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {formattedDate}
            </td>
            <td className="pr-8 pl-6 py-4 whitespace-nowrap text-sm font-medium  max-w-0.5 truncate text-gray-900 dark:text-white">
                {transaction.description}
            </td>
            <td className={`pr-10 pl-${allowActions?16:20} py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400`}>
                {transaction.category}
            </td>
            <td className={`pl-14 pr-4 py-4 whitespace-nowrap text-sm font-medium`}>
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
            <td className="pl-0 pr-2 py-4 whitespace-nowrap text-center text-sm">
              <span
                className={`px-2 py-0.5 inline-flex text-md leading-5 font-semibold rounded-full ${
                  transaction.type
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                }`}
              >
                {transaction.type ? 'Income' : 'Expense'}
              </span>
            </td>
            {allowActions && <td className="pr-12 py-4  whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(transaction)}
                        disabled={isPending}
                        className="p-1.5 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-gray-700 disabled:opacity-50"
                        aria-label="Edit transaction"
                    >
                        <Edit size={20} />
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isPending}
                        className="p-1.5 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 rounded-md hover:bg-red-100 dark:hover:bg-gray-700 disabled:opacity-50"
                        aria-label="Delete transaction"
                    >
                        {isPending ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                    </button>
                </div>
            </td>}
        </tr>
    );
};
export default TransactionItem;
