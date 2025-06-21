import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Transaction, NewTransactionData } from '../../types';

export const useGetTransactions = () => {
    return useQuery<Transaction[], Error>({
        queryKey: ['transactions'],
        queryFn: async () => {
            const res = await fetch(import.meta.env.VITE_API_URL + '/api/transactions', { credentials: 'include' });
            if (!res.ok) {
                const error = await res.json().catch(() => ({ message: 'Ошибка загрузки' }));
                throw new Error(error.message || 'Failed to fetch');
            }
            return res.json();
        },
        initialData: [],
    });
};


export const useTransactionsManager = () => {
    const queryClient = useQueryClient();

    const createTransaction = useMutation({
        mutationFn: async (data: NewTransactionData): Promise<Transaction> => {
            const payload = { ...data, date: `${data.date}T00:00:00Z` };
            const res = await fetch(import.meta.env.VITE_API_URL+'/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({ message: 'Ошибка создания' }));
                throw new Error(err.message || 'Failed to create');
            }
            return res.json();
        },
        onSuccess: (newTx) => {
            queryClient.setQueryData<Transaction[]>(['transactions'], (old) => [newTx, ...(old ?? [])]);
        },
        onError: (error) => {console.log(error)}
    });

    // Обновление
    const updateTransaction = useMutation({
        mutationFn: async (tx: Transaction) => {
            const payload = {
                description: tx.description,
                amount: tx.amount,
                category: tx.category,
                date: `${tx.date.slice(0, 10)}T00:00:00Z`,
                type: tx.type,
            };
            const res = await fetch(import.meta.env.VITE_API_URL+`/api/transactions/${tx.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({ message: 'Ошибка обновления' }));
                throw new Error(err.message || 'Failed to update');
            }
            return res.json(); // { success, message }
        },
        onSuccess: (_, updatedTx) => {
            queryClient.setQueryData<Transaction[]>(['transactions'], (old = []) =>
                old.map((tx) => (tx.id === updatedTx.id ? { ...updatedTx } : tx))
            );
        },
    });

    // Удаление
    const deleteTransaction = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(import.meta.env.VITE_API_URL+`/api/transactions/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({ message: 'Ошибка удаления' }));
                throw new Error(err.message || 'Failed to delete');
            }
        },
        onSuccess: (_, id) => {
            queryClient.setQueryData<Transaction[]>(['transactions'], (old = []) =>
                old.filter((tx) => tx.id !== id)
            );
        },
    });

    return {
        createTransaction,
        updateTransaction,
        deleteTransaction,
    };
};
