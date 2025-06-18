import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Loader2 } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import type { Transaction, NewTransactionData } from '../../types';

interface TransactionFormProps {
  onSubmit: (transaction: NewTransactionData) => void;
  onCancel: () => void;
  initialData?: Transaction; // For editing
  isEditing?: boolean;
  isSubmitting?: boolean; // For loading state
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
  isSubmitting = false,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<boolean>(false); // false for expense, true for income
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description);
      setAmount(initialData.amount.toString());
      setCategory(initialData.category);
      setDate(initialData.date.slice(0,10)); // Ensure date is in YYYY-MM-DD format
      setType(initialData.type);
    } else {
      // Reset form for new transaction
      setDescription('');
      setAmount('');
      setCategory('');
      setDate(new Date().toISOString().slice(0, 10));
      setType(false); // Default to expense
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!amount) newErrors.amount = 'Amount is required';
    else if (isNaN(Number(amount)) || Number(amount) <= 0) newErrors.amount = 'Amount must be a positive number';
    if (!category.trim()) newErrors.category = 'Category is required';
    if (!date) newErrors.date = 'Date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;
    
    onSubmit({
      description,
      amount: parseFloat(amount),
      category,
      date,
      type,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Description"
          type="text"
          id="description"
          placeholder="E.g., Grocery shopping, Salary"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          disabled={isSubmitting}
        />
        
        <Input
          label="Amount"
          type="number"
          id="amount"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
          min="0.01"
          step="0.01"
          disabled={isSubmitting}
        />
        
        <div>
          <label className="label mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
          <div className="flex space-x-4">
            {(['Expense', 'Income'] as const).map((optionType) => (
              <label key={optionType} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value={optionType}
                  checked={type === (optionType === 'Income')}
                  onChange={() => setType(optionType === 'Income')}
                  className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-offset-gray-800"
                  disabled={isSubmitting}
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{optionType}</span>
              </label>
            ))}
          </div>
        </div>
        
        <Input
          label="Category"
          type="text"
          id="category"
          placeholder="E.g., Food, Transportation, Salary"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          error={errors.category}
          disabled={isSubmitting}
        />
        
        <Input
          label="Date"
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          error={errors.date}
          disabled={isSubmitting}
        />
        
        <div className="flex justify-end space-x-3 pt-2">
          <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            isLoading={isSubmitting}
            icon={isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16}/>}
          >
            {isEditing ? 'Update' : 'Add'} Transaction
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default TransactionForm;
