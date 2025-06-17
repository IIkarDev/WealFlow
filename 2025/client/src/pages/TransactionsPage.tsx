
import React, {useEffect, useState} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';
import Button from '@/components/common/Button';
import {TransactionTable} from '@/components/transactions/TransactionTable';
import TransactionForm from '@/components/transactions/TransactionForm';
import type { Transaction, NewTransactionData } from '@/types';
import { BASE_URL } from "@/App"; // Adjusted path
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {fetchTransactions, useCreateTransaction, useUpdateTransaction} from "@/components/transactions/functions";

const TransactionsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const {data: transactions, isLoading: isLoadingTransactions} = useQuery<Transaction[], Error>({
    queryKey: ["transactions"],
    queryFn: async () => {
      const response = await fetch("/api/transactions", {
        credentials: 'include'// Критично для сессий на основе cookie
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({message: 'Failed to fetch transactions and parse error response'}));
        throw new Error(errorData.message || `Failed to fetch transactions. Status: ${response.status}`);
      }
      // Dates from backend are expected to be ISO strings parsable by new Date()
      return response.json();
    },
    initialData: [],
  });

  queryClient.invalidateQueries({queryKey: ["transactions"]})

  const { mutate: createTransactionMutate, isPending: isCreatingTransaction } = useCreateTransaction()

  const { mutate: updateTransactionMutate, isPending: isUpdatingTransaction } = useUpdateTransaction()

  const handleSuccess = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleFormSubmit = (transactionData: NewTransactionData) => {
    if (editingTransaction) {
      updateTransactionMutate({ ...transactionData, id: editingTransaction.id }, { onSuccess: handleSuccess });
    } else {
      createTransactionMutate(transactionData, { onSuccess: handleSuccess });
    }
  };
  const handleOpenAddForm = () => {
    setEditingTransaction(null);
    setShowForm(true);
  };

  const handleEditTransactionClick = (transaction: Transaction) => {
    // transaction.date from backend is likely full ISO. Form expects YYYY-MM-DD.
    // TransactionForm's useEffect already handles initialData.date.slice(0,10)
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const isSubmittingForm = isCreatingTransaction || isUpdatingTransaction;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Transactions</h1>
        <Button
          variant="primary"
          icon={isSubmittingForm ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
          onClick={handleOpenAddForm}
          disabled={isSubmittingForm || isLoadingTransactions} // Also disable if transactions are loading initially
        >
          Add Transaction
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            key="transaction-form"
            initial={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: '1.5rem', marginBottom: '1.5rem' }}
            exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <TransactionForm
              onSubmit={handleFormSubmit}
              onCancel={handleCancelForm}
              initialData={editingTransaction || undefined} // Date here is passed as is
              isEditing={!!editingTransaction}
              isSubmitting={isSubmittingForm}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <TransactionTable
        transactions={transactions || []}
        onEditTransaction={handleEditTransactionClick}
        isLoading={isLoadingTransactions}
      />
    </div>
  );
};

export default TransactionsPage;
