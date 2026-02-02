/**
 * Subscription & Pricing Management (Combined)
 * Admin can edit pricing and features - reflects everywhere
 */

import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Textarea } from '@/shared/components/ui/textarea';
import { useThemeStore } from '@/core/stores/admin/themeStore';
import { usePricingStore, PricingPlan } from '@/core/stores/admin/pricingStore';
import {
  DollarSign,
  Check,
  X,
  Edit,
  Save,
  Plus,
  Trash2,
  AlertTriangle,
  TrendingUp,
  Users,
  CreditCard,
  Star,
  RefreshCw,
} from 'lucide-react';

export const SubscriptionManagementV2: React.FC = () => {
  const { theme } = useThemeStore();
  const { plans, updatePlanPrice, updatePlanDescription, updatePlanName, addFeature, removeFeature, updateFeature, resetToDefaults } = usePricingStore();
  
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'monthly' | 'yearly' | 'description' | 'name' | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<any>(null);
  
  const [editingFeature, setEditingFeature] = useState<{ planId: string; featureId: string } | null>(null);
  const [tempFeatureText, setTempFeatureText] = useState('');
  const [addingFeatureTo, setAddingFeatureTo] = useState<string | null>(null);
  const [newFeatureText, setNewFeatureText] = useState('');

  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const mutedColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const cardBg = theme === 'dark' ? 'bg-[#1A1A2E] border-white/10' : 'bg-white border-gray-200';
  const inputBg = theme === 'dark' ? 'bg-[#0E0E1F] border-[#2A2A3E] text-white placeholder:text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  // Edit price
  const handleEditPrice = (planId: string, field: 'monthly' | 'yearly', currentPrice: number) => {
    setEditingPlan(planId);
    setEditingField(field);
    setTempValue(currentPrice.toString());
  };

  const handleSavePrice = (planId: string, field: 'monthly' | 'yearly') => {
    const newPrice = parseFloat(tempValue);
    if (isNaN(newPrice) || newPrice < 0) {
      alert('Please enter a valid price');
      return;
    }

    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    const oldPrice = field === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;

    setPendingUpdate({
      type: 'price',
      planId,
      field,
      oldPrice,
      newPrice,
    });
    setShowConfirmation(true);
  };

  // Edit description
  const handleEditDescription = (planId: string, currentDesc: string) => {
    setEditingPlan(planId);
    setEditingField('description');
    setTempValue(currentDesc);
  };

  const handleSaveDescription = (planId: string) => {
    setPendingUpdate({
      type: 'description',
      planId,
      oldValue: plans.find(p => p.id === planId)?.description,
      newValue: tempValue,
    });
    setShowConfirmation(true);
  };

  // Edit name
  const handleEditName = (planId: string, currentName: string) => {
    setEditingPlan(planId);
    setEditingField('name');
    setTempValue(currentName);
  };

  const handleSaveName = (planId: string) => {
    setPendingUpdate({
      type: 'name',
      planId,
      oldValue: plans.find(p => p.id === planId)?.name,
      newValue: tempValue,
    });
    setShowConfirmation(true);
  };

  // Edit feature
  const handleEditFeature = (planId: string, featureId: string, currentText: string) => {
    setEditingFeature({ planId, featureId });
    setTempFeatureText(currentText);
  };

  const handleSaveFeature = (planId: string, featureId: string) => {
    if (!tempFeatureText.trim()) {
      alert('Feature text cannot be empty');
      return;
    }
    updateFeature(planId, featureId, tempFeatureText);
    setEditingFeature(null);
    setTempFeatureText('');
  };

  // Add feature
  const handleAddFeature = (planId: string) => {
    if (!newFeatureText.trim()) {
      alert('Feature text cannot be empty');
      return;
    }
    addFeature(planId, newFeatureText);
    setNewFeatureText('');
    setAddingFeatureTo(null);
  };

  // Confirm update
  const handleConfirmUpdate = () => {
    if (!pendingUpdate) return;

    if (pendingUpdate.type === 'price') {
      const fieldKey = pendingUpdate.field === 'monthly' ? 'monthlyPrice' : 'yearlyPrice';
      updatePlanPrice(pendingUpdate.planId, fieldKey, pendingUpdate.newPrice);
    } else if (pendingUpdate.type === 'description') {
      updatePlanDescription(pendingUpdate.planId, pendingUpdate.newValue);
    } else if (pendingUpdate.type === 'name') {
      updatePlanName(pendingUpdate.planId, pendingUpdate.newValue);
    }

    setShowConfirmation(false);
    setPendingUpdate(null);
    setEditingPlan(null);
    setEditingField(null);
    setTempValue('');
  };

  const handleCancelEdit = () => {
    setEditingPlan(null);
    setEditingField(null);
    setTempValue('');
    setEditingFeature(null);
    setTempFeatureText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${textColor}`}>Subscription & Pricing Management</h1>
          <p className={`mt-1 ${mutedColor}`}>
            Edit pricing and features - changes reflect everywhere in the app
          </p>
        </div>
        <Button
          onClick={resetToDefaults}
          variant="outline"
          className={theme === 'dark' ? 'border-white/20 text-white' : 'border-gray-300 text-gray-900'}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>
      </div>

      {/* Alert */}
      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'}`}>
        <div className="flex items-start gap-2">
          <AlertTriangle className={`w-5 h-5 mt-0.5 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700'}`} />
          <div>
            <p className={`font-semibold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700'}`}>
              Live Updates - Changes Reflect Everywhere
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-600'}`}>
              Any changes you make here will instantly update pricing on the marketing page, app, and all user-facing areas.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`${cardBg} p-6`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <Users className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <Badge className={theme === 'dark' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-50 text-green-700 border-green-200'}>
              <TrendingUp className="w-3 h-3 mr-1" />
              12%
            </Badge>
          </div>
          <p className={`text-2xl font-bold ${textColor}`}>1,234</p>
          <p className={`text-sm ${mutedColor}`}>Total Subscribers</p>
        </Card>

        <Card className={`${cardBg} p-6`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'}`}>
              <DollarSign className={`w-5 h-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <Badge className={theme === 'dark' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-50 text-green-700 border-green-200'}>
              <TrendingUp className="w-3 h-3 mr-1" />
              18%
            </Badge>
          </div>
          <p className={`text-2xl font-bold ${textColor}`}>$48,630</p>
          <p className={`text-sm ${mutedColor}`}>Monthly Revenue</p>
        </Card>

        <Card className={`${cardBg} p-6`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-violet-500/20' : 'bg-violet-100'}`}>
              <CreditCard className={`w-5 h-5 ${theme === 'dark' ? 'text-violet-400' : 'text-violet-600'}`} />
            </div>
            <Badge className={theme === 'dark' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200'}>
              Pro
            </Badge>
          </div>
          <p className={`text-2xl font-bold ${textColor}`}>$38</p>
          <p className={`text-sm ${mutedColor}`}>Avg Revenue/User</p>
        </Card>

        <Card className={`${cardBg} p-6`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
              <Star className={`w-5 h-5 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`} />
            </div>
            <Badge className={theme === 'dark' ? 'bg-violet-500/20 text-violet-400 border-violet-500/30' : 'bg-violet-50 text-violet-700 border-violet-200'}>
              Most Popular
            </Badge>
          </div>
          <p className={`text-2xl font-bold ${textColor}`}>Pro</p>
          <p className={`text-sm ${mutedColor}`}>Top Plan</p>
        </Card>
      </div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isEditingMonthly = editingPlan === plan.id && editingField === 'monthly';
          const isEditingYearly = editingPlan === plan.id && editingField === 'yearly';
          const isEditingDesc = editingPlan === plan.id && editingField === 'description';
          const isEditingName = editingPlan === plan.id && editingField === 'name';

          return (
            <Card
              key={plan.id}
              className={`${cardBg} p-6 ${plan.popular ? 'ring-2 ring-blue-500' : ''} relative`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
                  Most Popular
                </Badge>
              )}

              {/* Plan Name */}
              <div className="mb-4">
                {isEditingName ? (
                  <div className="space-y-2">
                    <Input
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className={inputBg}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveName(plan.id)}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className={theme === 'dark' ? 'border-white/20 text-white' : 'border-gray-300 text-gray-900'}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`p-3 rounded-lg cursor-pointer transition-all ${hoverBg} group`}
                    onClick={() => handleEditName(plan.id, plan.name)}
                  >
                    <h3 className={`text-2xl font-bold ${textColor} group-hover:${textColor}`}>
                      {plan.name}
                    </h3>
                    <Edit className={`w-3 h-3 ${mutedColor} opacity-0 group-hover:opacity-100 mt-1`} />
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-4">
                {isEditingDesc ? (
                  <div className="space-y-2">
                    <Textarea
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className={inputBg}
                      rows={3}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveDescription(plan.id)}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className={theme === 'dark' ? 'border-white/20 text-white' : 'border-gray-300 text-gray-900'}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`p-3 rounded-lg cursor-pointer transition-all ${hoverBg} group`}
                    onClick={() => handleEditDescription(plan.id, plan.description)}
                  >
                    <p className={`text-sm ${mutedColor} group-hover:${textColor}`}>
                      {plan.description}
                    </p>
                    <Edit className={`w-3 h-3 ${mutedColor} opacity-0 group-hover:opacity-100 mt-1`} />
                  </div>
                )}
              </div>

              {/* Monthly Price */}
              <div className="mb-3">
                <label className={`text-xs ${mutedColor} mb-1 block`}>Monthly Price</label>
                {isEditingMonthly ? (
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <DollarSign className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${mutedColor}`} />
                      <Input
                        type="number"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className={`pl-9 ${inputBg}`}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSavePrice(plan.id, 'monthly');
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSavePrice(plan.id, 'monthly')}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      className={theme === 'dark' ? 'border-white/20 text-white' : 'border-gray-300 text-gray-900'}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${hoverBg}`}
                    onClick={() => handleEditPrice(plan.id, 'monthly', plan.monthlyPrice)}
                  >
                    <div className="flex items-baseline gap-1">
                      <span className={`text-3xl font-bold ${textColor}`}>
                        ${plan.monthlyPrice}
                      </span>
                      <span className={mutedColor}>/mo</span>
                    </div>
                    <Edit className={`w-4 h-4 ${mutedColor}`} />
                  </div>
                )}
              </div>

              {/* Yearly Price */}
              <div className="mb-6">
                <label className={`text-xs ${mutedColor} mb-1 block`}>Yearly Price</label>
                {isEditingYearly ? (
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <DollarSign className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${mutedColor}`} />
                      <Input
                        type="number"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className={`pl-9 ${inputBg}`}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSavePrice(plan.id, 'yearly');
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSavePrice(plan.id, 'yearly')}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      className={theme === 'dark' ? 'border-white/20 text-white' : 'border-gray-300 text-gray-900'}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${hoverBg}`}
                    onClick={() => handleEditPrice(plan.id, 'yearly', plan.yearlyPrice)}
                  >
                    <div className="flex items-baseline gap-1">
                      <span className={`text-3xl font-bold ${textColor}`}>
                        ${plan.yearlyPrice}
                      </span>
                      <span className={mutedColor}>/yr</span>
                    </div>
                    <Edit className={`w-4 h-4 ${mutedColor}`} />
                  </div>
                )}
                <p className={`text-xs ${mutedColor} mt-1 text-right`}>
                  Save ${(plan.monthlyPrice * 12 - plan.yearlyPrice).toFixed(0)}/year
                </p>
              </div>

              {/* Features */}
              <div className={`border-t pt-4 ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className={`text-sm font-semibold ${textColor}`}>Features</p>
                  <Button
                    size="sm"
                    onClick={() => setAddingFeatureTo(plan.id)}
                    className={`${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </div>

                {/* Add Feature */}
                {addingFeatureTo === plan.id && (
                  <div className="mb-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <Input
                      value={newFeatureText}
                      onChange={(e) => setNewFeatureText(e.target.value)}
                      placeholder="Enter feature text..."
                      className={`mb-2 ${inputBg}`}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddFeature(plan.id);
                        if (e.key === 'Escape') setAddingFeatureTo(null);
                      }}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAddFeature(plan.id)}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Save className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAddingFeatureTo(null)}
                        className={theme === 'dark' ? 'border-white/20 text-white' : 'border-gray-300 text-gray-900'}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Feature List */}
                <ul className="space-y-2 max-h-64 overflow-y-auto">
                  {plan.features.filter(f => f.enabled).map((feature) => (
                    <li key={feature.id} className="group">
                      {editingFeature?.planId === plan.id && editingFeature?.featureId === feature.id ? (
                        <div className="space-y-2">
                          <Input
                            value={tempFeatureText}
                            onChange={(e) => setTempFeatureText(e.target.value)}
                            className={inputBg}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveFeature(plan.id, feature.id);
                              if (e.key === 'Escape') setEditingFeature(null);
                            }}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveFeature(plan.id, feature.id)}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              <Save className="w-3 h-3 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingFeature(null)}
                              className={theme === 'dark' ? 'border-white/20 text-white' : 'border-gray-300 text-gray-900'}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className={`flex items-start gap-2 p-2 rounded ${hoverBg}`}>
                          <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                          <span className={`text-sm flex-1 ${mutedColor}`}>{feature.text}</span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                            <button
                              onClick={() => handleEditFeature(plan.id, feature.id, feature.text)}
                              className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-white/10 text-blue-400' : 'hover:bg-gray-200 text-blue-600'}`}
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeFeature(plan.id, feature.id)}
                              className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-white/10 text-red-400' : 'hover:bg-gray-200 text-red-600'}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && pendingUpdate && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowConfirmation(false)}
        >
          <Card
            className={`${cardBg} p-6 max-w-md w-full`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-6">
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-50'}`}>
                <AlertTriangle className={`w-6 h-6 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`} />
              </div>
              <div>
                <h2 className={`text-xl font-semibold ${textColor}`}>Confirm Change</h2>
                <p className={`text-sm ${mutedColor} mt-1`}>
                  This will update the {pendingUpdate.type} everywhere in the app
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-lg mb-6 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
              {pendingUpdate.type === 'price' ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={mutedColor}>Plan:</span>
                    <span className={`font-semibold ${textColor}`}>
                      {plans.find(p => p.id === pendingUpdate.planId)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={mutedColor}>Type:</span>
                    <span className={`font-semibold ${textColor}`}>
                      {pendingUpdate.field === 'monthly' ? 'Monthly' : 'Yearly'}
                    </span>
                  </div>
                  <div className={`border-t pt-2 ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                    <div className="flex justify-between">
                      <span className={mutedColor}>Old:</span>
                      <span className={textColor}>${pendingUpdate.oldPrice}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className={mutedColor}>New:</span>
                      <span className={`font-bold text-lg ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                        ${pendingUpdate.newPrice}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={mutedColor}>Plan:</span>
                    <span className={`font-semibold ${textColor}`}>
                      {plans.find(p => p.id === pendingUpdate.planId)?.name}
                    </span>
                  </div>
                  <div className={`border-t pt-2 ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                    <p className={`text-sm ${mutedColor} mb-1`}>New Description:</p>
                    <p className={`text-sm ${textColor}`}>{pendingUpdate.newValue}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className={`flex-1 ${theme === 'dark' ? 'border-white/20 text-white' : 'border-gray-300 text-gray-900'}`}
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-blue-500 to-violet-500 text-white"
                onClick={handleConfirmUpdate}
              >
                Confirm
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};