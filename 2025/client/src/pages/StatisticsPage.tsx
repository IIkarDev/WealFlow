import React, {useState, useMemo, useEffect} from 'react';
import {motion, Variants} from 'framer-motion';
import Button from '../components/common/Button';
import StatCard from '../components/statistics/StatCard';
import ChartContainer from '../components/statistics/ChartContainer';
import type {TimeFrame} from '../types';
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    PiggyBank,
    CalendarDays,
    BarChartHorizontalBig,
    PieChartIcon
} from 'lucide-react';
import {format, endOfMonth, endOfYear, differenceInDays, subDays, startOfMonth, startOfYear} from 'date-fns';
import {useGetTransactions} from "../components/transactions/functions";
import {useQueryClient} from "@tanstack/react-query";

const StatisticsPage: React.FC = () => {
    const { data: transactions} = useGetTransactions();
    const queryClient = useQueryClient()
    useEffect(() => {
        queryClient.invalidateQueries({queryKey: ["transactions"]}).then(r => {})
    }, []);

    const [timeframe, setTimeframe] = useState<TimeFrame>('month');
    const [customRange, setCustomRange] = useState<{ start: Date | null, end: Date | null }>({start: null, end: null});

    const {startDate, endDate} = useMemo(() => {
        const now = new Date();
        switch (timeframe) {
            case 'week':
                return {startDate: subDays(now, 6), endDate: now};
            case 'month':
                return {startDate: startOfMonth(now), endDate: endOfMonth(now)};
            case 'year':
                return {startDate: startOfYear(now), endDate: endOfYear(now)};
            case 'custom':
                return {startDate: customRange.start || startOfMonth(now), endDate: customRange.end || endOfMonth(now)}; // Default custom to current month
            default:
                return {startDate: startOfMonth(now), endDate: endOfMonth(now)};
        }
    }, [timeframe, customRange]);

    const filteredTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= startDate && tDate <= endDate;
    });

    const totalIncome = filteredTransactions.filter(t => t.type).reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = filteredTransactions.filter(t => !t.type).reduce((sum, t) => sum + t.amount, 0);
    const netFlow = totalIncome - totalExpenses;

    const expensesByCategory = useMemo(() => {
        const map = filteredTransactions
            .filter(t => !t.type)
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);
        return Object.entries(map)
            .map(([name, value], index) => ({
                name,
                value,
                color: ['#ff7d00', '#00b8a9', '#6b5ca5', '#f24c4c', '#5d62b5', '#ffc107'][index % 6]
            }))
            .sort((a, b) => b.value - a.value).slice(0, 6); // Top 6
    }, [filteredTransactions]);

    const incomeBySource = useMemo(() => {
        const map = filteredTransactions
            .filter(t => t.type)
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);
        return Object.entries(map)
            .map(([name, value], index) => ({
                name,
                value,
                color: ['#20c997', '#3498db', '#9b59b6', '#e74c3c', '#f1c40f', '#1abc9c'][index % 6]
            }))
            .sort((a, b) => b.value - a.value).slice(0, 6); // Top 6
    }, [filteredTransactions]);

    const trendData = useMemo(() => { // Mock trend data
        return {
            incomeTrend: (Math.random() - 0.4) * 20, // -10% to +10%
            expenseTrend: (Math.random() - 0.6) * 15, // -10% to +5%
        }
    }, [timeframe, customRange]);


    const containerAnimation: Variants = {
        hidden: {opacity: 0},
        show: {opacity: 1, transition: {staggerChildren: 0.07}}
    };
    const itemAnimation: Variants = {
        hidden: {opacity: 0, y: 15},
        show: {opacity: 1, y: 0, transition: {type: "spring" as const, stiffness: 100, damping: 12}}
    };

    const handleTimeframeChange = (selectedTimeframe: TimeFrame) => {
        setTimeframe(selectedTimeframe);
        if (selectedTimeframe !== 'custom') {
            setCustomRange({start: null, end: null});
        }
    };

    return (
        <motion.div variants={containerAnimation} initial="hidden" animate="show" className="space-y-6 lg:space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Financial Statistics</h1>
                <div className="flex flex-wrap gap-2">
                    {(['week', 'month', 'year'] as TimeFrame[]).map(tf => (
                        <Button key={tf} variant={timeframe === tf ? 'primary' : 'outline'} size="sm"
                                onClick={() => handleTimeframeChange(tf)}>
                            {tf.charAt(0).toUpperCase() + tf.slice(1)}
                        </Button>
                    ))}
                    <Button variant={timeframe === 'custom' ? 'primary' : 'outline'} size="sm"
                            onClick={() => handleTimeframeChange('custom')} icon={<CalendarDays size={14}/>}>
                        Custom
                    </Button>
                </div>
            </div>

            {timeframe === 'custom' && (
                <motion.div variants={itemAnimation}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div>
                        <label htmlFor="startDate"
                               className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                        <input type="date" id="startDate" className="input mt-1"
                               value={customRange.start ? format(customRange.start, 'yyyy-MM-dd') : ''}
                               onChange={e => setCustomRange(prev => ({...prev, start: new Date(e.target.value)}))}/>
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End
                            Date</label>
                        <input type="date" id="endDate" className="input mt-1"
                               value={customRange.end ? format(customRange.end, 'yyyy-MM-dd') : ''}
                               onChange={e => setCustomRange(prev => ({...prev, end: new Date(e.target.value)}))}/>
                    </div>
                </motion.div>
            )}

            <motion.div variants={itemAnimation}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard title="Net Flow"
                          value={`${netFlow >= 0 ? '+' : '-'}$${Math.abs(netFlow).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                          })}`} icon={<Wallet size={24}/>} color="primary"
                          trend={{value: netFlow > 0 ? 5.2 : -3.1, isPositive: netFlow > 0}}/>
                <StatCard title="Total Income" value={`$${totalIncome.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`} icon={<TrendingUp size={24}/>} color="secondary"
                          trend={{value: trendData.incomeTrend, isPositive: trendData.incomeTrend >= 0}}/>
                <StatCard title="Total Expenses" value={`$${totalExpenses.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`} icon={<TrendingDown size={24}/>} color="accent"
                          trend={{value: trendData.expenseTrend, isPositive: trendData.expenseTrend >= 0}}/>
                <StatCard title="Savings Rate"
                          value={`${totalIncome > 0 ? ((netFlow / totalIncome) * 100).toFixed(1) : 0}%`}
                          icon={<PiggyBank size={24}/>} trend={{value: 12.7, isPositive: true}}/>
            </motion.div>

            <motion.div variants={itemAnimation} className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <ChartContainer title="Expenses by Category" data={expensesByCategory} type="pie"
                                icon={<PieChartIcon className="text-accent-500"/>}/>
                <ChartContainer title="Income by Source" data={incomeBySource} type="bar"
                                icon={<BarChartHorizontalBig className="text-secondary-500"/>}/>
            </motion.div>
        </motion.div>
    );
};

export default StatisticsPage;