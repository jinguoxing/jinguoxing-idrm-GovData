// ==========================================
// Batch Confirmation Tab Component
// ==========================================
// Location: Extracted from tt5.tsx:6443-6672

import React from 'react';
import { Box } from 'lucide-react';

interface BatchConfirmationTabProps {
    results: any[];
    setResults: (results: any[]) => void;
    selectedItems: Set<string>;
    setSelectedItems: (items: Set<string>) => void;
    filter: { type?: string; confidence?: string; needsConfirm?: boolean; hasConflict?: boolean };
    setFilter: (filter: any) => void;
    onGenerateBusinessObject?: (result: any) => void;
}

export const BatchConfirmationTab: React.FC<BatchConfirmationTabProps> = ({
    results,
    setResults,
    selectedItems,
    setSelectedItems,
    filter,
    setFilter,
    onGenerateBusinessObject
}) => {
    const filteredResults = results.filter((r: any) => {
        if (filter.needsConfirm && !r.needsConfirmation) return false;
        if (filter.hasConflict && !r.hasConflict) return false;
        if (filter.confidence === 'high' && r.objectSuggestion.confidence < 0.8) return false;
        if (filter.confidence === 'medium' && (r.objectSuggestion.confidence < 0.6 || r.objectSuggestion.confidence >= 0.8)) return false;
        if (filter.confidence === 'low' && r.objectSuggestion.confidence >= 0.6) return false;
        return true;
    });

    const toggleItem = (id: string) => {
        const newSet = new Set(selectedItems);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedItems(newSet);
    };

    const toggleAll = () => {
        if (selectedItems.size === filteredResults.length) {
            setSelectedItems(new Set());
        } else {
            // 只选择高置信度且无冲突的项
            const highConfidenceNoConflict = filteredResults
                .filter((r: any) => r.objectSuggestion.confidence >= 0.8 && !r.hasConflict)
                .map((r: any) => r.id);
            setSelectedItems(new Set(highConfidenceNoConflict));
        }
    };

    const handleBatchAction = (action: 'accept' | 'reject') => {
        if (selectedItems.size === 0) return;
        if (!confirm(`确定要${action === 'accept' ? '接受' : '拒绝'} ${selectedItems.size} 项识别结果吗？`)) return;
        
        const now = new Date().toLocaleString('zh-CN');
        const currentUser = '当前用户'; // 实际应该从用户上下文获取
        
        setResults((prev: any[]) => prev.map((r: any) => {
            if (selectedItems.has(r.id)) {
                const auditTrail = {
                    recordBy: currentUser,
                    recordTime: now,
                    action: action,
                    basis: 'batch', // 批量操作
                    source: r.objectSuggestion?.source || 'AI + 规则'
                };
                return {
                    ...r,
                    objectSuggestion: { 
                        ...r.objectSuggestion, 
                        status: action === 'accept' ? 'accepted' : 'rejected',
                        auditTrail: auditTrail
                    },
                    needsConfirmation: false
                };
            }
            return r;
        }));
        setSelectedItems(new Set());
        alert(`已${action === 'accept' ? '接受' : '拒绝'} ${selectedItems.size} 项结果`);
    };

    return (
        <div className="h-full flex flex-col p-6 gap-4">
            {/* 筛选区 */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center gap-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-600">类型：</label>
                    <select
                        value={filter.type || 'all'}
                        onChange={(e) => setFilter({ ...filter, type: e.target.value === 'all' ? undefined : e.target.value })}
                        className="border border-slate-300 rounded px-3 py-1 text-sm"
                    >
                        <option value="all">全部</option>
                        <option value="table">表对象</option>
                        <option value="field">字段</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-600">置信度：</label>
                    <select
                        value={filter.confidence || 'all'}
                        onChange={(e) => setFilter({ ...filter, confidence: e.target.value === 'all' ? undefined : e.target.value })}
                        className="border border-slate-300 rounded px-3 py-1 text-sm"
                    >
                        <option value="all">全部</option>
                        <option value="high">高 (≥80%)</option>
                        <option value="medium">中 (60-80%)</option>
                        <option value="low">低 (&lt;60%)</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={filter.needsConfirm || false}
                        onChange={(e) => setFilter({ ...filter, needsConfirm: e.target.checked ? true : undefined })}
                        className="w-4 h-4 rounded border-slate-300"
                    />
                    <label className="text-sm text-slate-600">仅显示需确认</label>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={filter.hasConflict || false}
                        onChange={(e) => setFilter({ ...filter, hasConflict: e.target.checked ? true : undefined })}
                        className="w-4 h-4 rounded border-slate-300"
                    />
                    <label className="text-sm text-slate-600">仅显示冲突</label>
                </div>
            </div>

            {/* 表格 */}
            <div className="flex-1 bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={selectedItems.size === filteredResults.length && filteredResults.length > 0}
                                onChange={toggleAll}
                                className="w-4 h-4 rounded border-slate-300"
                            />
                            <span className="text-sm text-slate-600">全选（仅高置信度无冲突项）</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleBatchAction('accept')}
                                disabled={selectedItems.size === 0}
                                className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                批量接受 ({selectedItems.size})
                            </button>
                            <button
                                onClick={() => handleBatchAction('reject')}
                                disabled={selectedItems.size === 0}
                                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                批量拒绝 ({selectedItems.size})
                            </button>
                            {onGenerateBusinessObject && (
                                <button
                                    onClick={() => {
                                        if (selectedItems.size === 0) {
                                            alert('请先选择要生成业务对象的识别结果');
                                            return;
                                        }
                                        if (selectedItems.size === 1) {
                                            const result = results.find((r: any) => selectedItems.has(r.id));
                                            if (result) onGenerateBusinessObject(result);
                                        } else {
                                            alert(`批量生成功能：将为 ${selectedItems.size} 个识别结果分别生成业务对象。\n提示：目前仅支持单个生成，请逐个选择生成。`);
                                            const firstResult = results.find((r: any) => selectedItems.has(r.id));
                                            if (firstResult) onGenerateBusinessObject(firstResult);
                                        }
                                    }}
                                    disabled={selectedItems.size === 0}
                                    className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <Box size={16} /> 批量生成业务对象 ({selectedItems.size})
                                </button>
                            )}
                            <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50">
                                导出
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 sticky top-0">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">勾选</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">类型</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">表名</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">建议内容</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">置信度</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">状态</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredResults.map((result: any) => {
                                const isHighConfidenceNoConflict = result.objectSuggestion.confidence >= 0.8 && !result.hasConflict;
                                const isSelected = selectedItems.has(result.id);
                                return (
                                    <tr key={result.id} className={isSelected ? 'bg-emerald-50' : 'hover:bg-slate-50'}>
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleItem(result.id)}
                                                disabled={!isHighConfidenceNoConflict}
                                                className="w-4 h-4 rounded border-slate-300"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">表对象</span>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-sm">{result.tableName}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-sm">{result.objectSuggestion.name}</div>
                                            <div className="text-xs text-slate-500">{result.tableComment}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 bg-slate-200 rounded-full h-2">
                                                    <div
                                                        className="bg-emerald-500 h-2 rounded-full"
                                                        style={{ width: `${result.objectSuggestion.confidence * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-slate-600">{Math.round(result.objectSuggestion.confidence * 100)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {result.hasConflict && <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">冲突</span>}
                                            {result.needsConfirmation && <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded ml-1">待确认</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button className="text-blue-600 text-sm hover:underline">查看</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
