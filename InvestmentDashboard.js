import React, { useState, useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Calendar, Percent, Receipt } from 'lucide-react';

const InvestmentDashboard = () => {
  // Initial state
  const [myTFSA, setMyTFSA] = useState(71000);
  const [myFHSA, setMyFHSA] = useState(37318);
  const [myRRSP, setMyRRSP] = useState(71804);
  const [nonReg, setNonReg] = useState(20202);
  const [crypto, setCrypto] = useState(554);
  const [partnerTFSA, setPartnerTFSA] = useState(0);
  
  // Contribution settings
  const [myTFSAContrib, setMyTFSAContrib] = useState(7000);
  const [partnerTFSAContrib, setPartnerTFSAContrib] = useState(7000);
  const [rrspContrib, setRRSPContrib] = useState(18000);
  const [nonRegContrib, setNonRegContrib] = useState(0);
  const [cryptoContrib, setCryptoContrib] = useState(0);
  
  // Monthly expenses
  const [monthlyExpense, setMonthlyExpense] = useState(5000);
  
  // Projection settings
  const [growthRate, setGrowthRate] = useState(7);
  const [inflationRate, setInflationRate] = useState(3);
  const [years, setYears] = useState(10);
  const [downPayment, setDownPayment] = useState(100000);
  const [downPaymentYear, setDownPaymentYear] = useState(2026);
  
  // Calculate projections
  const projections = useMemo(() => {
    const data = [];
    let currentYear = 2025;
    const baseAnnualExpense = monthlyExpense * 12;
    let currentAnnualExpense = baseAnnualExpense;
    
    // Initial balances
    let balances = {
      myTFSA,
      myFHSA,
      myRRSP,
      nonReg,
      crypto,
      partnerTFSA
    };
    
    const initialTotal = Object.values(balances).reduce((a, b) => a + b, 0);
    
    // Add initial year
    data.push({
      year: currentYear,
      'My TFSA': Math.round(balances.myTFSA),
      'My FHSA': Math.round(balances.myFHSA),
      'My RRSP': Math.round(balances.myRRSP),
      'Non-Registered': Math.round(balances.nonReg),
      'Crypto': Math.round(balances.crypto),
      'Partner TFSA': Math.round(balances.partnerTFSA),
      'Total': Math.round(initialTotal),
      'Investment Returns': 0,
      'ROI %': 0,
      'Adjusted Annual Expense': Math.round(currentAnnualExpense),
      'Years of Expenses': initialTotal > 0 ? (initialTotal / currentAnnualExpense).toFixed(1) : 0
    });
    
    // Project future years
    for (let i = 1; i <= years; i++) {
      currentYear++;
      
      // Apply inflation to expenses
      currentAnnualExpense *= (1 + inflationRate / 100);
      
      const previousTotal = Object.values(balances).reduce((a, b) => a + b, 0);
      
      // Apply growth to all accounts
      balances.myTFSA *= (1 + growthRate / 100);
      balances.myFHSA *= (1 + growthRate / 100);
      balances.myRRSP *= (1 + growthRate / 100);
      balances.nonReg *= (1 + growthRate / 100);
      balances.crypto *= (1 + growthRate / 100);
      balances.partnerTFSA *= (1 + growthRate / 100);
      
      const afterGrowthTotal = Object.values(balances).reduce((a, b) => a + b, 0);
      const yearlyReturns = afterGrowthTotal - previousTotal;
      
      // Handle down payment in March (represented as the year)
      if (currentYear === downPaymentYear) {
        let remaining = downPayment;
        
        // First withdraw from FHSA
        if (balances.myFHSA > 0) {
          const fhsaWithdraw = Math.min(balances.myFHSA, remaining);
          balances.myFHSA -= fhsaWithdraw;
          remaining -= fhsaWithdraw;
        }
        
        // Then withdraw from RRSP
        if (remaining > 0 && balances.myRRSP > 0) {
          const rrspWithdraw = Math.min(balances.myRRSP, remaining);
          balances.myRRSP -= rrspWithdraw;
          remaining -= rrspWithdraw;
        }
        
        // Set FHSA to 0 permanently
        balances.myFHSA = 0;
      }
      
      // Add contributions (after down payment if applicable)
      balances.myTFSA += myTFSAContrib;
      balances.partnerTFSA += partnerTFSAContrib;
      balances.myRRSP += rrspContrib;
      balances.nonReg += nonRegContrib;
      balances.crypto += cryptoContrib;
      
      const currentTotal = Object.values(balances).reduce((a, b) => a + b, 0);
      const roiPercent = previousTotal > 0 ? (yearlyReturns / previousTotal) * 100 : 0;
      const yearsOfExpenses = currentTotal > 0 ? (currentTotal / currentAnnualExpense).toFixed(1) : 0;
      
      data.push({
        year: currentYear,
        'My TFSA': Math.round(balances.myTFSA),
        'My FHSA': Math.round(balances.myFHSA),
        'My RRSP': Math.round(balances.myRRSP),
        'Non-Registered': Math.round(balances.nonReg),
        'Crypto': Math.round(balances.crypto),
        'Partner TFSA': Math.round(balances.partnerTFSA),
        'Total': Math.round(currentTotal),
        'Investment Returns': Math.round(yearlyReturns),
        'ROI %': roiPercent.toFixed(2),
        'Adjusted Annual Expense': Math.round(currentAnnualExpense),
        'Years of Expenses': yearsOfExpenses
      });
    }
    
    return data;
  }, [myTFSA, myFHSA, myRRSP, nonReg, crypto, partnerTFSA, myTFSAContrib, partnerTFSAContrib, rrspContrib, nonRegContrib, cryptoContrib, growthRate, inflationRate, years, downPayment, downPaymentYear, monthlyExpense]);
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const finalTotal = projections[projections.length - 1]?.Total || 0;
  const initialTotal = projections[0]?.Total || 0;
  const totalGrowth = finalTotal - initialTotal;
  const totalContributions = (myTFSAContrib + partnerTFSAContrib + rrspContrib + nonRegContrib + cryptoContrib) * years;
  const totalReturns = projections.slice(1).reduce((sum, row) => sum + (row['Investment Returns'] || 0), 0);
  const finalAnnualExpense = projections[projections.length - 1]?.['Adjusted Annual Expense'] || (monthlyExpense * 12);
  const finalYearsOfExpenses = finalTotal / finalAnnualExpense;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-800">Family Investment Portfolio Dashboard</h1>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm opacity-90">Current Total</span>
              </div>
              <div className="text-2xl font-bold">{formatCurrency(initialTotal)}</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm opacity-90">Projected Total</span>
              </div>
              <div className="text-2xl font-bold">{formatCurrency(finalTotal)}</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="w-5 h-5" />
                <span className="text-sm opacity-90">Total Returns</span>
              </div>
              <div className="text-2xl font-bold">{formatCurrency(totalReturns)}</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5" />
                <span className="text-sm opacity-90">Contributions</span>
              </div>
              <div className="text-2xl font-bold">{formatCurrency(totalContributions)}</div>
            </div>
            
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="w-5 h-5" />
                <span className="text-sm opacity-90">Years of Expenses</span>
              </div>
              <div className="text-2xl font-bold">{finalYearsOfExpenses.toFixed(1)} yrs</div>
              <div className="text-xs opacity-75 mt-1">at {formatCurrency(finalAnnualExpense)}/yr</div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Initial Balances */}
            <div className="bg-slate-50 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Initial Balances (Sept 2025)</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-1 block">My TFSA</label>
                  <input type="number" value={myTFSA} onChange={(e) => setMyTFSA(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-1 block">My FHSA</label>
                  <input type="number" value={myFHSA} onChange={(e) => setMyFHSA(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-1 block">My RRSP</label>
                  <input type="number" value={myRRSP} onChange={(e) => setMyRRSP(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-1 block">Non-Registered</label>
                  <input type="number" value={nonReg} onChange={(e) => setNonReg(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-1 block">Crypto</label>
                  <input type="number" value={crypto} onChange={(e) => setCrypto(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-1 block">Partner TFSA</label>
                  <input type="number" value={partnerTFSA} onChange={(e) => setPartnerTFSA(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>
            </div>
            
            {/* Annual Contributions & Settings */}
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Annual Contributions</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1 block">My TFSA</label>
                    <input type="number" value={myTFSAContrib} onChange={(e) => setMyTFSAContrib(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1 block">Partner TFSA</label>
                    <input type="number" value={partnerTFSAContrib} onChange={(e) => setPartnerTFSAContrib(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1 block">RRSP (Combined)</label>
                    <input type="number" value={rrspContrib} onChange={(e) => setRRSPContrib(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1 block">Non-Registered</label>
                    <input type="number" value={nonRegContrib} onChange={(e) => setNonRegContrib(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1 block">Crypto</label>
                    <input type="number" value={cryptoContrib} onChange={(e) => setCryptoContrib(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Projection Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1 block">
                      Monthly Expenses: {formatCurrency(monthlyExpense)}
                    </label>
                    <input type="number" value={monthlyExpense} onChange={(e) => setMonthlyExpense(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    <div className="text-xs text-slate-500 mt-1">Annual: {formatCurrency(monthlyExpense * 12)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1 block">
                      Annual Growth Rate: {growthRate}%
                    </label>
                    <input type="range" min="0" max="20" step="0.5" value={growthRate}
                      onChange={(e) => setGrowthRate(Number(e.target.value))}
                      className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer" />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <button onClick={() => setGrowthRate(7)} className="hover:text-blue-600">7%</button>
                      <button onClick={() => setGrowthRate(10)} className="hover:text-blue-600">10%</button>
                      <button onClick={() => setGrowthRate(15)} className="hover:text-blue-600">15%</button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1 block">
                      Annual Inflation Rate: {inflationRate}%
                    </label>
                    <input type="range" min="0" max="10" step="0.5" value={inflationRate}
                      onChange={(e) => setInflationRate(Number(e.target.value))}
                      className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer" />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <button onClick={() => setInflationRate(2)} className="hover:text-orange-600">2%</button>
                      <button onClick={() => setInflationRate(3)} className="hover:text-orange-600">3%</button>
                      <button onClick={() => setInflationRate(4)} className="hover:text-orange-600">4%</button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1 block">
                      Years to Project: {years}
                    </label>
                    <input type="range" min="1" max="30" value={years}
                      onChange={(e) => setYears(Number(e.target.value))}
                      className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1 block">Down Payment Amount</label>
                    <input type="number" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1 block">Down Payment Year</label>
                    <input type="number" value={downPaymentYear} onChange={(e) => setDownPaymentYear(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Total Portfolio Chart */}
          <div className="bg-slate-50 rounded-xl p-5 mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Total Portfolio Value Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={projections}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="year" stroke="#64748b" />
                <YAxis stroke="#64748b" tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(val) => formatCurrency(val)} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }} />
                <Line type="monotone" dataKey="Total" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Investment Returns Chart */}
          <div className="bg-slate-50 rounded-xl p-5 mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Annual Investment Returns</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projections.slice(1)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="year" stroke="#64748b" />
                <YAxis stroke="#64748b" tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(val) => formatCurrency(val)} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="Investment Returns" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Stacked Area Chart */}
          <div className="bg-slate-50 rounded-xl p-5 mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Account Growth Breakdown</h3>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={projections}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="year" stroke="#64748b" />
                <YAxis stroke="#64748b" tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(val) => formatCurrency(val)} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }} />
                <Legend />
                <Area type="monotone" dataKey="My TFSA" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                <Area type="monotone" dataKey="Partner TFSA" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" />
                <Area type="monotone" dataKey="My RRSP" stackId="1" stroke="#10b981" fill="#10b981" />
                <Area type="monotone" dataKey="My FHSA" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                <Area type="monotone" dataKey="Non-Registered" stackId="1" stroke="#ef4444" fill="#ef4444" />
                <Area type="monotone" dataKey="Crypto" stackId="1" stroke="#ec4899" fill="#ec4899" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          {/* Data Table */}
          <div className="bg-slate-50 rounded-xl p-5 overflow-x-auto">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Projection Details</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-300">
                  <th className="text-left py-2 px-3 font-semibold text-slate-700">Year</th>
                  <th className="text-right py-2 px-3 font-semibold text-slate-700">My TFSA</th>
                  <th className="text-right py-2 px-3 font-semibold text-slate-700">Partner TFSA</th>
                  <th className="text-right py-2 px-3 font-semibold text-slate-700">My RRSP</th>
                  <th className="text-right py-2 px-3 font-semibold text-slate-700">My FHSA</th>
                  <th className="text-right py-2 px-3 font-semibold text-slate-700">Non-Reg</th>
                  <th className="text-right py-2 px-3 font-semibold text-slate-700">Crypto</th>
                  <th className="text-right py-2 px-3 font-semibold text-slate-700 bg-blue-100">Total</th>
                  <th className="text-right py-2 px-3 font-semibold text-slate-700 bg-green-100">Returns</th>
                  <th className="text-right py-2 px-3 font-semibold text-slate-700 bg-green-100">ROI %</th>
                  <th className="text-right py-2 px-3 font-semibold text-slate-700 bg-orange-100">Adjusted Expense</th>
                  <th className="text-right py-2 px-3 font-semibold text-slate-700 bg-pink-100">Years of Expenses</th>
                </tr>
              </thead>
              <tbody>
                {projections.map((row, idx) => (
                  <tr key={idx} className={`border-b border-slate-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50`}>
                    <td className="py-2 px-3 font-medium">{row.year}</td>
                    <td className="text-right py-2 px-3">{formatCurrency(row['My TFSA'])}</td>
                    <td className="text-right py-2 px-3">{formatCurrency(row['Partner TFSA'])}</td>
                    <td className="text-right py-2 px-3">{formatCurrency(row['My RRSP'])}</td>
                    <td className="text-right py-2 px-3">{formatCurrency(row['My FHSA'])}</td>
                    <td className="text-right py-2 px-3">{formatCurrency(row['Non-Registered'])}</td>
                    <td className="text-right py-2 px-3">{formatCurrency(row['Crypto'])}</td>
                    <td className="text-right py-2 px-3 font-bold bg-blue-50">{formatCurrency(row['Total'])}</td>
                    <td className="text-right py-2 px-3 bg-green-50 font-medium">{formatCurrency(row['Investment Returns'])}</td>
                    <td className="text-right py-2 px-3 bg-green-50">{row['ROI %']}%</td>
                    <td className="text-right py-2 px-3 bg-orange-50">{formatCurrency(row['Adjusted Annual Expense'])}</td>
                    <td className="text-right py-2 px-3 bg-pink-50 font-medium">{row['Years of Expenses']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentDashboard;
