import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import type {NewTransactionData, Transaction} from "@/types";

export function fetchTransactions() {
    const {data: transactions, isLoading: isLoadingTransactions} = useQuery<Transaction[], Error>({
        queryKey: ["transactions"],
        queryFn: async () => {
            const response = await fetch("/api/transactions", {
                credentials: 'include',
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

    const queryClient = useQueryClient()
    queryClient.invalidateQueries({queryKey: ['transactions']});

    return {transactions, isLoadingTransactions};
}
export const useCreateTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation<
        Transaction, // Expected response type from backend after creation
        Error,
        NewTransactionData // Data sent to the mutation function
    >({
        mutationFn: async (newTransaction: NewTransactionData) => {
            // Convert YYYY-MM-DD to YYYY-MM-DDTHH:00:00:00Z for Go backend
            const payload = {
                ...newTransaction,
                date: `${newTransaction.date}T00:00:00Z`,
            };
            const response = await fetch("/api/transactions", {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to create transaction and parse error response' }));
                throw new Error(errorData.message || `Failed to create transaction. Status: ${response.status}`);
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
        onError: (error) => {
            console.error("Error creating transaction:", error.message);
            alert(`Error creating transaction: ${error.message}`);
        }
    });
};
export const useUpdateTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation<
        // Go backend returns a success message, not the updated object for PATCH
        { success: boolean; message: string },
        Error,
        Transaction // Full transaction object with ID needed for URL and body
    >({
        mutationFn: async (transactionToUpdate: Transaction) => {
            // For PATCH, Go backend expects a map of fields to update.
            // We send the relevant parts. Date needs to be YYYY-MM-DDTHH:00:00:00Z.
            console.log(transactionToUpdate);
            const payload = {
                description: transactionToUpdate.description,
                amount: transactionToUpdate.amount,
                category: transactionToUpdate.category,
                date: `${transactionToUpdate.date.slice(0,10)}T00:00:00Z`, // Ensure date is YYYY-MM-DD then convert
                type: transactionToUpdate.type,
            };
            const response = await fetch(`${"/api/transactions"}/${transactionToUpdate.id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload), // Go parses this into map[string]interface{}
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to update transaction and parse error response' }));
                throw new Error(errorData.message || `Failed to update transaction. Status: ${response.status}`);
            }
            return response.json(); // Go backend returns {success: boolean, message: string}
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
        onError: (error) => {
            console.error("Error updating transaction:", error.message);
            alert(`Error updating transaction: ${error.message}`);
        }
    });
};
export const useDeleteTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["deleteTransaction"],
        mutationFn: async (transactionId: string) => {
            const response = await fetch(`${"/api/transactions"}/${transactionId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({message: 'Failed to delete transaction and parse error response'}));
                throw new Error(errorData.message || `Failed to delete transaction. Status: ${response.status}`);
            }
            // For 204 No Content, response.json() will fail.
            if (response.status === 204) {
                return;
            }
            return response.json(); // Or handle other success statuses if API returns data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["transactions"]});
        },
        onError: (error: Error) => {
            console.error("Error deleting transaction:", error.message);
            alert(`Error deleting transaction: ${error.message}`);
        },
    });
};




