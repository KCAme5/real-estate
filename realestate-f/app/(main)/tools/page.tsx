'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Calculator, TrendingUp, DollarSign, Calendar, Percent, ArrowLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface MortgageCalculation {
    monthlyPayment: number;
    totalPayment: number;
    totalInterest: number;
    principal: number;
    downPayment: number;
    loanAmount: number;
}

interface AmortizationRow {
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
}

export default function ToolsPage() {
    const [activeTab, setActiveTab] = useState<'mortgage' | 'affordability'>('mortgage');

    // Mortgage Calculator State
    const [propertyPrice, setPropertyPrice] = useState(5000000);
    const [downPayment, setDownPayment] = useState(1000000);
    const [interestRate, setInterestRate] = useState(11.5);
    const [loanTerm, setLoanTerm] = useState(20);
    const [amortizationData, setAmortizationData] = useState<AmortizationRow[]>([]);

    // Affordability Calculator State
    const [monthlyIncome, setMonthlyIncome] = useState(200000);
    const [otherDebts, setOtherDebts] = useState(50000);
    const [affInterestRate, setAffInterestRate] = useState(11.5);
    const [affLoanTerm, setAffLoanTerm] = useState(20);
    const [maxAffordable, setMaxAffordable] = useState(0);

    // Calculate Mortgage
    const calculateMortgage = (): MortgageCalculation => {
        const principal = propertyPrice;
        const loanAmount = principal - downPayment;
        const monthlyRate = interestRate / 100 / 12;
        const numberOfPayments = loanTerm * 12;

        if (monthlyRate === 0) {
            const monthlyPayment = loanAmount / numberOfPayments;
            return {
                monthlyPayment,
                totalPayment: monthlyPayment * numberOfPayments,
                totalInterest: 0,
                principal,
                downPayment,
                loanAmount,
            };
        }

        const monthlyPayment =
            (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

        const totalPayment = monthlyPayment * numberOfPayments;
        const totalInterest = totalPayment - loanAmount;

        return {
            monthlyPayment,
            totalPayment,
            totalInterest,
            principal,
            downPayment,
            loanAmount,
        };
    };

    // Generate Amortization Schedule
    const generateAmortization = () => {
        const calc = calculateMortgage();
        const monthlyRate = interestRate / 100 / 12;
        const numberOfPayments = loanTerm * 12;
        let balance = calc.loanAmount;
        const schedule: AmortizationRow[] = [];

        const monthlyPayment = calc.monthlyPayment;

        for (let i = 1; i <= numberOfPayments; i++) {
            const interestPayment = balance * monthlyRate;
            const principalPayment = monthlyPayment - interestPayment;
            balance -= principalPayment;

            // Only show every 6 months for readability, but include last month
            if (i % 6 === 0 || i === numberOfPayments) {
                schedule.push({
                    month: i,
                    payment: monthlyPayment,
                    principal: principalPayment,
                    interest: interestPayment,
                    balance: Math.max(0, balance),
                });
            }
        }

        setAmortizationData(schedule);
    };

    // Calculate Affordability
    const calculateAffordability = () => {
        const debtRatio = 0.28; // 28% of gross income can go to housing
        const maxMonthlyPayment = monthlyIncome * debtRatio;
        const availablePayment = maxMonthlyPayment - otherDebts;

        if (availablePayment <= 0) {
            setMaxAffordable(0);
            return;
        }

        // Use loan calculator formula in reverse
        const monthlyRate = affInterestRate / 100 / 12;
        const numberOfPayments = affLoanTerm * 12;

        if (monthlyRate === 0) {
            const maxLoan = availablePayment * numberOfPayments;
            // Assume 20% down payment
            setMaxAffordable(maxLoan / 0.8);
        } else {
            const maxLoan =
                (availablePayment * (Math.pow(1 + monthlyRate, numberOfPayments) - 1)) /
                (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments));
            // Assume 20% down payment
            setMaxAffordable(maxLoan / 0.8);
        }
    };

    const calc = calculateMortgage();

    // Effects to recalculate
    const handlePropertyPriceChange = (value: number) => {
        setPropertyPrice(value);
        // Cap down payment at 100% and minimum at 0
        setDownPayment(Math.min(value, Math.max(0, downPayment)));
    };

    const handleDownPaymentChange = (value: number) => {
        setDownPayment(Math.min(value, propertyPrice));
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            {/* Header */}
            <div className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/properties" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                            <ArrowLeft className="text-slate-400" size={20} />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <Calculator className="text-white" size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-white">Financial Tools</h1>
                                <p className="text-slate-400 text-sm">Calculate mortgages and affordability</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Tab Navigation */}
                <div className="flex gap-4 mb-10 border-b border-slate-800">
                    <button
                        onClick={() => setActiveTab('mortgage')}
                        className={`pb-4 px-2 font-bold text-sm uppercase tracking-wider transition-colors ${activeTab === 'mortgage'
                                ? 'text-blue-400 border-b-2 border-blue-500'
                                : 'text-slate-400 hover:text-slate-300'
                            }`}
                    >
                        <span className="flex items-center gap-2">
                            <Home size={16} />
                            Mortgage Calculator
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('affordability')}
                        className={`pb-4 px-2 font-bold text-sm uppercase tracking-wider transition-colors ${activeTab === 'affordability'
                                ? 'text-blue-400 border-b-2 border-blue-500'
                                : 'text-slate-400 hover:text-slate-300'
                            }`}
                    >
                        <span className="flex items-center gap-2">
                            <TrendingUp size={16} />
                            Affordability Calculator
                        </span>
                    </button>
                </div>

                {/* Mortgage Calculator Tab */}
                {activeTab === 'mortgage' && (
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Calculator Inputs */}
                        <div className="space-y-8">
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
                                <h2 className="text-xl font-black text-white">Loan Details</h2>

                                {/* Property Price */}
                                <div>
                                    <div className="flex justify-between items-end mb-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                                            Property Price (KES)
                                        </label>
                                        <span className="text-lg font-bold text-emerald-400">
                                            {propertyPrice.toLocaleString('en-KE')}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="500000"
                                        max="50000000"
                                        step="100000"
                                        value={propertyPrice}
                                        onChange={(e) => handlePropertyPriceChange(parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                                        <span>KES 500K</span>
                                        <span>KES 50M</span>
                                    </div>
                                </div>

                                {/* Down Payment */}
                                <div>
                                    <div className="flex justify-between items-end mb-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                                            Down Payment (KES)
                                        </label>
                                        <span className="text-lg font-bold text-emerald-400">
                                            {downPayment.toLocaleString('en-KE')} ({((downPayment / propertyPrice) * 100).toFixed(1)}%)
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max={propertyPrice}
                                        step="100000"
                                        value={downPayment}
                                        onChange={(e) => handleDownPaymentChange(parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                                        <span>0%</span>
                                        <span>100%</span>
                                    </div>
                                </div>

                                {/* Interest Rate */}
                                <div>
                                    <div className="flex justify-between items-end mb-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                                            Annual Interest Rate (%)
                                        </label>
                                        <span className="text-lg font-bold text-blue-400">{interestRate.toFixed(2)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="20"
                                        step="0.1"
                                        value={interestRate}
                                        onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                                        <span>1%</span>
                                        <span>20%</span>
                                    </div>
                                </div>

                                {/* Loan Term */}
                                <div>
                                    <div className="flex justify-between items-end mb-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                                            Loan Term (Years)
                                        </label>
                                        <span className="text-lg font-bold text-purple-400">{loanTerm} Years</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="40"
                                        step="1"
                                        value={loanTerm}
                                        onChange={(e) => setLoanTerm(parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                                        <span>1 Year</span>
                                        <span>40 Years</span>
                                    </div>
                                </div>

                                <button
                                    onClick={generateAmortization}
                                    className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors uppercase text-sm tracking-wider"
                                >
                                    Generate Amortization Schedule
                                </button>
                            </div>
                        </div>

                        {/* Results */}
                        <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-2xl p-6">
                                    <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-2">Monthly Payment</p>
                                    <p className="text-3xl font-black text-emerald-300">
                                        KES {Math.round(calc.monthlyPayment).toLocaleString('en-KE')}
                                    </p>
                                </div>
                                <div className="bg-blue-900/20 border border-blue-800/50 rounded-2xl p-6">
                                    <p className="text-xs font-black uppercase tracking-widest text-blue-400 mb-2">Loan Amount</p>
                                    <p className="text-3xl font-black text-blue-300">
                                        KES {Math.round(calc.loanAmount).toLocaleString('en-KE')}
                                    </p>
                                </div>
                                <div className="bg-purple-900/20 border border-purple-800/50 rounded-2xl p-6">
                                    <p className="text-xs font-black uppercase tracking-widest text-purple-400 mb-2">Total Interest</p>
                                    <p className="text-3xl font-black text-purple-300">
                                        KES {Math.round(calc.totalInterest).toLocaleString('en-KE')}
                                    </p>
                                </div>
                                <div className="bg-orange-900/20 border border-orange-800/50 rounded-2xl p-6">
                                    <p className="text-xs font-black uppercase tracking-widest text-orange-400 mb-2">Total Payment</p>
                                    <p className="text-3xl font-black text-orange-300">
                                        KES {Math.round(calc.totalPayment).toLocaleString('en-KE')}
                                    </p>
                                </div>
                            </div>

                            {/* Breakdown Chart */}
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Payment Breakdown</h3>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={[
                                        { name: 'Principal', value: calc.loanAmount, fill: '#3b82f6' },
                                        { name: 'Interest', value: calc.totalInterest, fill: '#ef4444' }
                                    ]}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="name" stroke="#64748b" />
                                        <YAxis stroke="#64748b" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}
                                            formatter={(v: any) => `KES ${Math.round(v).toLocaleString('en-KE')}`}
                                        />
                                        <Bar dataKey="value" radius={8}>
                                            {[{ value: calc.loanAmount, fill: '#3b82f6' }, { value: calc.totalInterest, fill: '#ef4444' }].map(
                                                (entry, i) => <Cell key={i} fill={entry.fill} />
                                            )}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Amortization Table */}
                            {amortizationData.length > 0 && (
                                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-x-auto max-h-80 overflow-y-auto">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Amortization Schedule</h3>
                                    <table className="w-full text-sm">
                                        <thead className="sticky top-0 bg-slate-900">
                                            <tr className="border-b border-slate-700">
                                                <th className="text-left py-2 px-2 text-xs text-slate-500 font-bold">Month</th>
                                                <th className="text-right py-2 px-2 text-xs text-slate-500 font-bold">Payment</th>
                                                <th className="text-right py-2 px-2 text-xs text-slate-500 font-bold">Principal</th>
                                                <th className="text-right py-2 px-2 text-xs text-slate-500 font-bold">Interest</th>
                                                <th className="text-right py-2 px-2 text-xs text-slate-500 font-bold">Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {amortizationData.map((row) => (
                                                <tr key={row.month} className="border-b border-slate-800 hover:bg-slate-800/50">
                                                    <td className="py-2 px-2 text-slate-300">{row.month}</td>
                                                    <td className="text-right py-2 px-2 text-slate-300">
                                                        {Math.round(row.payment).toLocaleString('en-KE')}
                                                    </td>
                                                    <td className="text-right py-2 px-2 text-emerald-400">
                                                        {Math.round(row.principal).toLocaleString('en-KE')}
                                                    </td>
                                                    <td className="text-right py-2 px-2 text-red-400">
                                                        {Math.round(row.interest).toLocaleString('en-KE')}
                                                    </td>
                                                    <td className="text-right py-2 px-2 text-blue-400">
                                                        {Math.round(row.balance).toLocaleString('en-KE')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Affordability Calculator Tab */}
                {activeTab === 'affordability' && (
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Calculator Inputs */}
                        <div className="space-y-8">
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
                                <h2 className="text-xl font-black text-white">Your Financial Profile</h2>

                                {/* Monthly Income */}
                                <div>
                                    <div className="flex justify-between items-end mb-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                                            Monthly Gross Income (KES)
                                        </label>
                                        <span className="text-lg font-bold text-emerald-400">
                                            {monthlyIncome.toLocaleString('en-KE')}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="50000"
                                        max="2000000"
                                        step="10000"
                                        value={monthlyIncome}
                                        onChange={(e) => setMonthlyIncome(parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                                        <span>KES 50K</span>
                                        <span>KES 2M</span>
                                    </div>
                                </div>

                                {/* Other Debts */}
                                <div>
                                    <div className="flex justify-between items-end mb-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                                            Monthly Other Debts (KES)
                                        </label>
                                        <span className="text-lg font-bold text-orange-400">
                                            {otherDebts.toLocaleString('en-KE')}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max={monthlyIncome * 0.5}
                                        step="5000"
                                        value={otherDebts}
                                        onChange={(e) => setOtherDebts(parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                                        <span>KES 0</span>
                                        <span>50% of Income</span>
                                    </div>
                                </div>

                                {/* Interest Rate */}
                                <div>
                                    <div className="flex justify-between items-end mb-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                                            Annual Interest Rate (%)
                                        </label>
                                        <span className="text-lg font-bold text-blue-400">{affInterestRate.toFixed(2)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="20"
                                        step="0.1"
                                        value={affInterestRate}
                                        onChange={(e) => setAffInterestRate(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                                        <span>1%</span>
                                        <span>20%</span>
                                    </div>
                                </div>

                                {/* Loan Term */}
                                <div>
                                    <div className="flex justify-between items-end mb-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                                            Loan Term (Years)
                                        </label>
                                        <span className="text-lg font-bold text-purple-400">{affLoanTerm} Years</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="40"
                                        step="1"
                                        value={affLoanTerm}
                                        onChange={(e) => setAffLoanTerm(parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                                        <span>1 Year</span>
                                        <span>40 Years</span>
                                    </div>
                                </div>

                                <button
                                    onClick={calculateAffordability}
                                    className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors uppercase text-sm tracking-wider"
                                >
                                    Calculate Max Affordability
                                </button>
                            </div>
                        </div>

                        {/* Results */}
                        <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
                                <h2 className="text-xl font-black text-white">Your Affordability</h2>

                                <div className="space-y-4">
                                    <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-4">
                                        <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-1">Max Home Price</p>
                                        <p className="text-4xl font-black text-emerald-300">
                                            KES {Math.round(maxAffordable).toLocaleString('en-KE')}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-2">
                                            Assuming 20% down payment and {affLoanTerm}-year loan
                                        </p>
                                    </div>

                                    <div className="space-y-3 pt-6 border-t border-slate-700">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Monthly Income:</span>
                                            <span className="font-bold text-white">KES {monthlyIncome.toLocaleString('en-KE')}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Housing Budget (28%):</span>
                                            <span className="font-bold text-emerald-400">KES {Math.round(monthlyIncome * 0.28).toLocaleString('en-KE')}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Other Debts:</span>
                                            <span className="font-bold text-orange-400">KES {otherDebts.toLocaleString('en-KE')}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-3 border-t border-slate-700">
                                            <span className="text-slate-400">Available Monthly:</span>
                                            <span className="font-bold text-blue-400">
                                                KES {Math.round(Math.max(0, monthlyIncome * 0.28 - otherDebts)).toLocaleString('en-KE')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-slate-800/50 rounded-xl p-4 mt-4">
                                        <p className="text-xs text-slate-400">
                                            <strong>How it works:</strong> We calculate the maximum home price based on your monthly income and existing debts using standard lending rules (housing budget = 28% of gross income).
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Reference */}
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Quick Reference</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Down Payment (20%):</span>
                                        <span className="font-bold text-white">KES {Math.round(maxAffordable * 0.2).toLocaleString('en-KE')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Loan Amount (80%):</span>
                                        <span className="font-bold text-white">KES {Math.round(maxAffordable * 0.8).toLocaleString('en-KE')}</span>
                                    </div>
                                    <div className="border-t border-slate-700 pt-3 mt-3 flex justify-between">
                                        <span className="text-slate-400">Est. Monthly Payment:</span>
                                        <span className="font-bold text-emerald-400">
                                            KES {Math.round(Math.max(0, monthlyIncome * 0.28 - otherDebts)).toLocaleString('en-KE')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
