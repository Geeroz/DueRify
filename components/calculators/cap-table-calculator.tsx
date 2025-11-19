'use client'

import { useState, useEffect } from 'react'
import { saveToLocalStorage, loadFromLocalStorage } from '@/lib/local-storage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Plus, Trash2, Download, Building2, TrendingUp, Edit2, Check, X } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

interface Shareholder {
  id: string;
  name: string;
  type: 'founder' | 'investor' | 'employee' | 'advisor';
  shares: number;
  pricePerShare: number;
  investment: number;
  percentage: number;
}

interface FundingRound {
  id: string;
  name: string;
  date: string;
  preMoney: number;
  raised: number;
  postMoney: number;
  pricePerShare: number;
}

interface DilutionRound {
  name: string;
  preMoney: number;
  investment: number;
  newShares: number;
  postMoney: number;
}

const COLORS = {
  founder: '#3B82F6',
  investor: '#10B981',
  employee: '#F59E0B',
  advisor: '#8B5CF6'
};

const STORAGE_KEY = 'duerify-cap-table-data'

interface SavedData {
  shareholders: Shareholder[]
  fundingRounds: FundingRound[]
  companyShares: number
  currentOwnership: number
  equityThreshold: number
  numRounds: number
  dilutionRounds: DilutionRound[]
}

export default function CapTableCalculator() {
  const [mounted, setMounted] = useState(false)
  const [shareholders, setShareholders] = useState<Shareholder[]>([
    {
      id: '1',
      name: 'Founder 1',
      type: 'founder',
      shares: 4000000,
      pricePerShare: 0.001,
      investment: 4000,
      percentage: 40
    },
    {
      id: '2',
      name: 'Founder 2',
      type: 'founder',
      shares: 3000000,
      pricePerShare: 0.001,
      investment: 3000,
      percentage: 30
    },
    {
      id: '3',
      name: 'Employee Pool',
      type: 'employee',
      shares: 2000000,
      pricePerShare: 0.001,
      investment: 2000,
      percentage: 20
    },
    {
      id: '4',
      name: 'Seed Investor',
      type: 'investor',
      shares: 1000000,
      pricePerShare: 1,
      investment: 1000000,
      percentage: 10
    }
  ]);

  const [fundingRounds, setFundingRounds] = useState<FundingRound[]>([
    {
      id: '1',
      name: 'Pre-Seed',
      date: '2024-01-01',
      preMoney: 1000000,
      raised: 250000,
      postMoney: 1250000,
      pricePerShare: 0.125
    }
  ]);

  const [newShareholder, setNewShareholder] = useState({
    name: '',
    type: 'investor' as const,
    shares: 0,
    pricePerShare: 0
  });

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedShareholder, setEditedShareholder] = useState<Shareholder | null>(null);

  // Dilution calculator state
  const [companyShares, setCompanyShares] = useState(10000000);
  const [currentOwnership, setCurrentOwnership] = useState(100);
  const [equityThreshold, setEquityThreshold] = useState(10);
  const [numRounds, setNumRounds] = useState(1);
  const [dilutionRounds, setDilutionRounds] = useState<DilutionRound[]>([
    { name: 'Round One', preMoney: 0, investment: 0, newShares: 0, postMoney: 0 }
  ]);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const saved = loadFromLocalStorage<SavedData | null>(STORAGE_KEY, null)
    if (saved) {
      setShareholders(saved.shareholders)
      setFundingRounds(saved.fundingRounds)
      setCompanyShares(saved.companyShares)
      setCurrentOwnership(saved.currentOwnership)
      setEquityThreshold(saved.equityThreshold)
      setNumRounds(saved.numRounds)
      setDilutionRounds(saved.dilutionRounds)
    }
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (mounted) {
      saveToLocalStorage<SavedData>(STORAGE_KEY, {
        shareholders,
        fundingRounds,
        companyShares,
        currentOwnership,
        equityThreshold,
        numRounds,
        dilutionRounds
      })
    }
  }, [mounted, shareholders, fundingRounds, companyShares, currentOwnership, equityThreshold, numRounds, dilutionRounds])

  const totalShares = shareholders.reduce((sum, s) => sum + s.shares, 0);

  const addShareholder = () => {
    if (!newShareholder.name || newShareholder.shares <= 0) return;

    const investment = newShareholder.shares * newShareholder.pricePerShare;
    const newTotal = totalShares + newShareholder.shares;
    
    // Recalculate all percentages
    const updatedShareholders = shareholders.map(s => ({
      ...s,
      percentage: Number(((s.shares / newTotal) * 100).toFixed(2))
    }));

    const newShareholderData: Shareholder = {
      id: Date.now().toString(),
      ...newShareholder,
      investment,
      percentage: Number(((newShareholder.shares / newTotal) * 100).toFixed(2))
    };

    setShareholders([...updatedShareholders, newShareholderData]);
    setNewShareholder({
      name: '',
      type: 'investor',
      shares: 0,
      pricePerShare: 0
    });
  };

  const removeShareholder = (id: string) => {
    const filtered = shareholders.filter(s => s.id !== id);
    const newTotal = filtered.reduce((sum, s) => sum + s.shares, 0);
    
    // Recalculate percentages
    const updated = filtered.map(s => ({
      ...s,
      percentage: Number(((s.shares / newTotal) * 100).toFixed(2))
    }));
    
    setShareholders(updated);
  };

  const startEditing = (shareholder: Shareholder) => {
    setEditingId(shareholder.id);
    setEditedShareholder({ ...shareholder });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedShareholder(null);
  };

  const saveEditing = () => {
    if (!editedShareholder) return;

    const updated = shareholders.map(s => {
      if (s.id === editedShareholder.id) {
        return {
          ...editedShareholder,
          investment: editedShareholder.shares * editedShareholder.pricePerShare
        };
      }
      return s;
    });

    // Recalculate percentages
    const total = updated.reduce((sum, s) => sum + s.shares, 0);
    const withPercentages = updated.map(s => ({
      ...s,
      percentage: Number(((s.shares / total) * 100).toFixed(2))
    }));

    setShareholders(withPercentages);
    setEditingId(null);
    setEditedShareholder(null);
  };

  const updateShareholder = (id: string, field: keyof Shareholder, value: any) => {
    const updated = shareholders.map(s => {
      if (s.id === id) {
        const updatedShareholder = { ...s, [field]: value };
        if (field === 'shares' || field === 'pricePerShare') {
          updatedShareholder.investment = updatedShareholder.shares * updatedShareholder.pricePerShare;
        }
        return updatedShareholder;
      }
      return s;
    });

    // Recalculate percentages
    const total = updated.reduce((sum, s) => sum + s.shares, 0);
    const withPercentages = updated.map(s => ({
      ...s,
      percentage: Number(((s.shares / total) * 100).toFixed(2))
    }));

    setShareholders(withPercentages);
  };

  const chartData = Object.entries(
    shareholders.reduce((acc, s) => {
      if (!acc[s.type]) acc[s.type] = 0;
      acc[s.type] += s.percentage;
      return acc;
    }, {} as Record<string, number>)
  ).map(([type, value]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1) + 's',
    value: Number(value.toFixed(2)),
    color: COLORS[type as keyof typeof COLORS]
  }));

  const totalInvestment = shareholders.reduce((sum, s) => sum + s.investment, 0);
  const fullyDilutedShares = totalShares;
  const currentValuation = fundingRounds[fundingRounds.length - 1]?.postMoney || 0;

  const exportCapTable = () => {
    const csv = [
      ['Name', 'Type', 'Shares', 'Price per Share', 'Investment', 'Ownership %'],
      ...shareholders.map(s => [
        s.name,
        s.type,
        s.shares,
        s.pricePerShare,
        s.investment,
        s.percentage + '%'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cap-table.csv';
    a.click();
  };

  const updateDilutionRound = (index: number, field: keyof DilutionRound, value: any) => {
    const updatedRounds = [...dilutionRounds];
    updatedRounds[index] = { ...updatedRounds[index], [field]: value };
    
    // Calculate post-money valuation
    if (field === 'preMoney' || field === 'investment') {
      updatedRounds[index].postMoney = updatedRounds[index].preMoney + updatedRounds[index].investment;
    }
    
    // Calculate new shares if investment and pre-money are set
    if (updatedRounds[index].preMoney > 0 && updatedRounds[index].investment > 0) {
      const ownershipPercentage = updatedRounds[index].investment / updatedRounds[index].postMoney;
      let totalSharesAfterPreviousRounds = companyShares;
      
      // Add shares from previous rounds
      for (let i = 0; i < index; i++) {
        totalSharesAfterPreviousRounds += dilutionRounds[i].newShares;
      }
      
      updatedRounds[index].newShares = Math.round((totalSharesAfterPreviousRounds * ownershipPercentage) / (1 - ownershipPercentage));
    }
    
    setDilutionRounds(updatedRounds);
  };

  const handleNumRoundsChange = (value: string) => {
    const newNumRounds = parseInt(value);
    setNumRounds(newNumRounds);
    
    const roundNames = ['Round One', 'Round Two', 'Round Three', 'Round Four'];
    const newRounds = Array(newNumRounds).fill(null).map((_, i) => 
      dilutionRounds[i] || { name: roundNames[i], preMoney: 0, investment: 0, newShares: 0, postMoney: 0 }
    );
    setDilutionRounds(newRounds);
  };

  const calculateDilution = () => {
    let currentShares = companyShares;
    let founderShares = companyShares * (currentOwnership / 100);
    const dilutionData = [{ round: 'Initial', ownership: currentOwnership, valuation: 0 }];
    
    dilutionRounds.forEach((round, index) => {
      if (round.investment > 0) {
        const newTotalShares = currentShares + round.newShares;
        const newOwnership = (founderShares / newTotalShares) * 100;
        dilutionData.push({
          round: round.name,
          ownership: newOwnership,
          valuation: round.postMoney
        });
        currentShares = newTotalShares;
      }
    });
    
    return dilutionData;
  };

  const dilutionData = calculateDilution();
  const valuationData = dilutionData.filter(d => d.valuation > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Cap Table & Dilution Calculator
        </CardTitle>
        <CardDescription>
          Manage your cap table and simulate funding round dilution
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">Current Cap Table</TabsTrigger>
            <TabsTrigger value="dilution">Dilution Simulator</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total Shares</p>
                  <p className="text-2xl font-bold">{totalShares.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total Investment</p>
                  <p className="text-2xl font-bold">${totalInvestment.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Shareholders</p>
                  <p className="text-2xl font-bold">{shareholders.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Current Valuation</p>
                  <p className="text-2xl font-bold">${currentValuation.toLocaleString()}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add Shareholder Form */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Shareholders</h3>
                  <Button onClick={exportCapTable} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export CSV
                  </Button>
                </div>

                {/* Add New Shareholder */}
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={newShareholder.name}
                          onChange={(e) => setNewShareholder({...newShareholder, name: e.target.value})}
                          placeholder="Name"
                        />
                      </div>
                      <div>
                        <Label>Type</Label>
                        <Select
                          value={newShareholder.type}
                          onValueChange={(value) => setNewShareholder({...newShareholder, type: value as any})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="founder">Founder</SelectItem>
                            <SelectItem value="investor">Investor</SelectItem>
                            <SelectItem value="employee">Employee</SelectItem>
                            <SelectItem value="advisor">Advisor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Shares</Label>
                        <Input
                          type="number"
                          value={newShareholder.shares || ''}
                          onChange={(e) => setNewShareholder({...newShareholder, shares: Number(e.target.value)})}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label>Price/Share</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newShareholder.pricePerShare || ''}
                          onChange={(e) => setNewShareholder({...newShareholder, pricePerShare: Number(e.target.value)})}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button onClick={addShareholder} className="w-full">
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Shareholders Table */}
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Shares</TableHead>
                          <TableHead>Price/Share</TableHead>
                          <TableHead>Investment</TableHead>
                          <TableHead>Ownership</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {shareholders.map((shareholder) => (
                          <TableRow key={shareholder.id}>
                            <TableCell>
                              {editingId === shareholder.id ? (
                                <Input
                                  value={editedShareholder?.name || ''}
                                  onChange={(e) => setEditedShareholder({...editedShareholder!, name: e.target.value})}
                                  className="h-8"
                                />
                              ) : (
                                shareholder.name
                              )}
                            </TableCell>
                            <TableCell>
                              {editingId === shareholder.id ? (
                                <Select
                                  value={editedShareholder?.type}
                                  onValueChange={(value) => setEditedShareholder({...editedShareholder!, type: value as any})}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="founder">Founder</SelectItem>
                                    <SelectItem value="investor">Investor</SelectItem>
                                    <SelectItem value="employee">Employee</SelectItem>
                                    <SelectItem value="advisor">Advisor</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium text-white`}
                                  style={{ backgroundColor: COLORS[shareholder.type] }}>
                                  {shareholder.type}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {editingId === shareholder.id ? (
                                <Input
                                  type="number"
                                  value={editedShareholder?.shares || ''}
                                  onChange={(e) => setEditedShareholder({...editedShareholder!, shares: Number(e.target.value)})}
                                  className="h-8 w-24"
                                />
                              ) : (
                                shareholder.shares.toLocaleString()
                              )}
                            </TableCell>
                            <TableCell>
                              {editingId === shareholder.id ? (
                                <Input
                                  type="number"
                                  step="0.001"
                                  value={editedShareholder?.pricePerShare || ''}
                                  onChange={(e) => setEditedShareholder({...editedShareholder!, pricePerShare: Number(e.target.value)})}
                                  className="h-8 w-20"
                                />
                              ) : (
                                `$${shareholder.pricePerShare.toFixed(3)}`
                              )}
                            </TableCell>
                            <TableCell>${shareholder.investment.toLocaleString()}</TableCell>
                            <TableCell>{shareholder.percentage}%</TableCell>
                            <TableCell>
                              {editingId === shareholder.id ? (
                                <div className="flex gap-1">
                                  <Button
                                    onClick={saveEditing}
                                    size="sm"
                                    variant="ghost"
                                    className="p-1"
                                  >
                                    <Check className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button
                                    onClick={cancelEditing}
                                    size="sm"
                                    variant="ghost"
                                    className="p-1"
                                  >
                                    <X className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex gap-1">
                                  <Button
                                    onClick={() => startEditing(shareholder)}
                                    size="sm"
                                    variant="ghost"
                                    className="p-1"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    onClick={() => removeShareholder(shareholder.id)}
                                    size="sm"
                                    variant="ghost"
                                    className="p-1"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {/* Ownership Chart */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Ownership by Type</h3>
                <Card>
                  <CardContent className="p-4">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ value }) => `${value}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Ownership Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Ownership Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {chartData.map((data) => (
                        <div key={data.name} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: data.color }}
                            />
                            <span className="text-sm">{data.name}</span>
                          </div>
                          <span className="text-sm font-medium">{data.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="dilution" className="space-y-6">
            {/* Company Situation */}
            <div>
              <h3 className="text-lg font-semibold mb-4">First, what's your company's situation?</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Company shares</Label>
                  <Input
                    type="number"
                    value={companyShares}
                    onChange={(e) => setCompanyShares(Number(e.target.value))}
                    placeholder="#"
                  />
                </div>
                <div>
                  <Label>Current ownership</Label>
                  <Input
                    type="number"
                    value={currentOwnership}
                    onChange={(e) => setCurrentOwnership(Number(e.target.value))}
                    placeholder="%"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label>Equity threshold</Label>
                  <Input
                    type="number"
                    value={equityThreshold}
                    onChange={(e) => setEquityThreshold(Number(e.target.value))}
                    placeholder="%"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>

            {/* Raise Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Next, enter raise details</h3>
              <div className="mb-4">
                <Label>Number of Rounds</Label>
                <Select value={numRounds.toString()} onValueChange={handleNumRoundsChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {dilutionRounds.slice(0, numRounds).map((round, index) => (
                  <div key={index} className="space-y-3">
                    <h4 className="font-medium text-center">{round.name}</h4>
                    <div>
                      <Label className="text-xs">Pre-money valuation</Label>
                      <Input
                        type="number"
                        value={round.preMoney}
                        onChange={(e) => updateDilutionRound(index, 'preMoney', Number(e.target.value))}
                        placeholder="$"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Investment in</Label>
                      <Input
                        type="number"
                        value={round.investment}
                        onChange={(e) => updateDilutionRound(index, 'investment', Number(e.target.value))}
                        placeholder="$"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">New shares issued</Label>
                      <Input
                        type="number"
                        value={round.newShares}
                        readOnly
                        placeholder="#"
                        className="bg-muted"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Valuation Chart */}
              <div>
                <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Valuation
                </h4>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={valuationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="round" />
                      <YAxis 
                        tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                      />
                      <Tooltip 
                        formatter={(value: number) => `$${(value / 1000000).toFixed(2)}M`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="valuation" 
                        stroke="#8B5CF6" 
                        strokeWidth={2}
                        dot={{ fill: '#8B5CF6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Ownership Chart */}
              <div>
                <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Ownership
                </h4>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dilutionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="round" />
                      <YAxis 
                        tickFormatter={(value) => `${value}%`}
                        domain={[0, 100]}
                      />
                      <Tooltip 
                        formatter={(value: number) => `${value.toFixed(2)}%`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="ownership" 
                        stroke="#EC4899" 
                        strokeWidth={2}
                        dot={{ fill: '#EC4899' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Dilution Summary</h4>
              <div className="space-y-2">
                {dilutionData.map((data, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{data.round}</span>
                    <span className="font-medium">{data.ownership.toFixed(2)}% ownership</span>
                  </div>
                ))}
              </div>
              {dilutionData[dilutionData.length - 1]?.ownership < equityThreshold && (
                <p className="text-sm text-red-600 mt-3">
                  ⚠️ Your ownership will fall below your {equityThreshold}% threshold
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}