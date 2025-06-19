import React, {useEffect, useState} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {Plus, Loader2} from 'lucide-react';
import Button from '../components/common/Button';
import {TransactionTable} from '../components/transactions/TransactionTable';
import TransactionForm from '../components/transactions/TransactionForm';
import type {Transaction, NewTransactionData} from '../types';
import {useGetTransactions, useTransactionsManager} from "../components/transactions/functions";
import {useQueryClient} from "@tanstack/react-query";

const TransactionsPage: React.FC = () => {
    const { data: transactions, isLoading} = useGetTransactions();
    const queryClient = useQueryClient()
    useEffect(() => {
        queryClient.invalidateQueries({queryKey: ["transactions"]}).then(r => {})
    }, []);

    const [showForm, setShowForm] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    const {
        createTransaction,
        updateTransaction,
        deleteTransaction
    } = useTransactionsManager();

    const handleFormSubmit = (transactionData: NewTransactionData) => {
        if (editingTransaction) {
            updateTransaction.mutate({...transactionData, id: editingTransaction.id}, {
                onSuccess: () => {
                    setEditingTransaction(null);
                    setShowForm(false);
                },
            });
        } else {
            createTransaction.mutate(transactionData, {
                onSuccess: () => {
                    setShowForm(false);
                },
            });
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Transactions</h1>
                <Button
                    variant="primary"
                    icon={isLoading ? <Loader2 size={18} className="animate-spin"/> : <Plus size={18}/>}
                    onClick={handleOpenAddForm}
                    disabled={isLoading} // Also disable if transactions are loading initially
                >
                    Add Transaction
                </Button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        key="transaction-form"
                        initial={{opacity: 0, height: 0, marginTop: 0, marginBottom: 0}}
                        animate={{opacity: 1, height: 'auto', marginTop: '1.5rem', marginBottom: '1.5rem'}}
                        exit={{opacity: 0, height: 0, marginTop: 0, marginBottom: 0}}
                        transition={{duration: 0.3}}
                        className="overflow-hidden"
                    >
                        <TransactionForm
                            onSubmit={handleFormSubmit}
                            onCancel={handleCancelForm}
                            initialData={editingTransaction || undefined} // Date here is passed as is
                            isEditing={!!editingTransaction}
                            isSubmitting={isLoading}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <TransactionTable
                transactions={transactions || []}
                onEditTransaction={handleEditTransactionClick}
                isLoading={isLoading}
                allowActions={true}
            />
        </div>
    );
};

export default TransactionsPage;
