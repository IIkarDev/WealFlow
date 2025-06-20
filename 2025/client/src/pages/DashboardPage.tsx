import React, {useEffect, useState} from 'react';
import {motion, Variants} from 'framer-motion';
import {ListChecks, PiggyBank, PlusCircle, TrendingDown, TrendingUp, Wallet} from 'lucide-react';
import StatCard from '../components/statistics/StatCard';
import ChartContainer from '../components/statistics/ChartContainer';
import {TransactionTable} from '../components/transactions/TransactionTable';
import type {ChartData, Transaction} from '../types';
import {Link, useNavigate} from 'react-router-dom';
import Button from '../components/common/Button';
import {useQueryClient} from "@tanstack/react-query";
import {useGetTransactions} from "../components/transactions/functions";


const DashboardPage: React.FC = () =>{
    const { data: transactions} = useGetTransactions()
    const safeTransactions = transactions || [];
    const queryClient = useQueryClient()
    useEffect(() => {
        queryClient.invalidateQueries({queryKey: ["transactions"]}).then(r => {})
    });

    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

    const filteredTransactions = safeTransactions.filter((transaction) => {
        return filterType === 'all' || (filterType === 'income' && transaction.type) || (filterType === 'expense' && !transaction.type);
    }).slice(0, 5);

    const totalIncome = filteredTransactions.filter(t => t.type).reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = safeTransactions.filter(t => !t.type).reduce((sum, t) => sum + t.amount, 0);
    const totalBalance = totalIncome - totalExpenses;

    // Expenses by Category for Pie Chart
    const expensesByCategoryMap = safeTransactions
        .filter(t => !t.type)
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

    const expensesByCategory: ChartData[] = Object.entries(expensesByCategoryMap)
        .map(([name, value], index) => ({
            name,
            value,
            color: ['#ff7d00', '#00b8a9', '#6b5ca5', '#f24c4c', '#5d62b5', '#ffc107', '#20c997'][index % 7],
        }))
        .sort((a, b) => b.value - a.value) // Sort for better pie chart visualization
        .slice(0, 5);

    // Monthly Overview for Bar Chart (mocked for simplicity)
    const monthlyOverview: ChartData[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => ({
        name: month,
        value: Math.floor(Math.random() * 3000) + 1000,
        color: '#ff7d00',
    }));
    monthlyOverview[3].value = totalIncome; // Make April's income reflect current mock data somewhat

    const containerAnimation: Variants = {
        hidden: {opacity: 0},
        show: {
            opacity: 1,
            transition: {staggerChildren: 0.07, delayChildren: 0.1},
        },
    };

    const itemAnimation: Variants = {
        hidden: {opacity: 0, y: 15},
        show: {opacity: 1, y: 0, transition: {type: "spring" as const, stiffness: 100, damping: 12}},
    };

    const navigate = useNavigate();

    return (
        <motion.div
            variants={containerAnimation}
            initial="hidden"
            animate="show"
            className="space-y-6 lg:space-y-8"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <Link to="/transactions">
                    <Button variant="primary" icon={<PlusCircle size={18}/>}>
                        New Transaction
                    </Button>
                </Link>
            </div>

            <motion.div variants={itemAnimation}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    title="Total Balance"
                    value={`$${totalBalance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}`}
                    icon={<Wallet size={24}/>}
                    color="primary"
                    trend={{value: totalBalance > 3000 ? 8.5 : -2.1, isPositive: totalBalance > 3000}}
                />
                <StatCard
                    title="Total Income (June)"
                    value={`$${totalIncome.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}`}
                    icon={<TrendingUp size={24}/>}
                    color="secondary"
                    trend={{value: 4.2, isPositive: true}}
                />
                <StatCard
                    title="Total Expenses (June)"
                    value={`$${totalExpenses.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}`}
                    icon={<TrendingDown size={24}/>}
                    color="accent"
                    trend={{value: 2.3, isPositive: false}}
                />
                <StatCard
                    title="Savings Rate"
                    value={`${totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0}%`}
                    icon={<PiggyBank size={24}/>}
                    trend={{value: 12.7, isPositive: true}}
                />
            </motion.div>

            <motion.div variants={itemAnimation} className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
                <div className="lg:col-span-3">
                    <ChartContainer
                        title="Expenses by Category"
                        data={expensesByCategory}
                        type="pie"
                    />
                </div>
                <div className="lg:col-span-2">
                    <ChartContainer
                        title="Monthly Income Overview"
                        data={monthlyOverview}
                        type="bar"
                    />
                </div>
            </motion.div>

            <motion.div variants={itemAnimation}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Recent Transactions
                    </h2>
                        <div className="flex">
                            <div className="space-x-2">
                                <Button
                                    variant={filterType === 'all' ? 'primary' : 'outline'}
                                    size="md"
                                    onClick={() => setFilterType('all')}
                                >
                                    All
                                </Button>
                                <Button
                                    variant={filterType === 'income' ? 'primary' : 'outline'}
                                    size="md"
                                    onClick={() => setFilterType('income')}
                                >
                                    Income
                                </Button>
                                <Button
                                    variant={filterType === 'expense' ? 'primary' : 'outline'}
                                    size="md"
                                    onClick={() => setFilterType('expense')}
                                >
                                    Expense
                                </Button>
                            </div>
                    <Link to="/transactions"
                          className="ml-8 text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium flex items-center">
                        View All <ListChecks size={16} className="ml-1"/>
                    </Link>
                        </div>
                </div>
                <TransactionTable
                    transactions={filteredTransactions}
                    onEditTransaction={() => {
                        navigate('/transactions', {state: {edit: true}});
                    }}
                    allowActions={false}
                />
            </motion.div>
        </motion.div>
    );
};

export default DashboardPage;