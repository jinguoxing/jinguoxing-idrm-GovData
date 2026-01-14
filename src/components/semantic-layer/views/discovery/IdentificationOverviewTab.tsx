// ==========================================
// Identification Overview Tab Component
// ==========================================
// Location: Extracted from tt5.tsx:6162-6299

import React from 'react';
import { FileCheck, CheckSquare, AlertTriangle } from 'lucide-react';

interface IdentificationOverviewTabProps {
    results: any[];
    onNavigateToComparison: () => void;
    onNavigateToBatch: () => void;
    onNavigateToConflict: () => void;
}

export const IdentificationOverviewTab: React.FC<IdentificationOverviewTabProps> = ({
    results,
    onNavigateToComparison,
    onNavigateToBatch,
    onNavigateToConflict
}) => {
    const stats = {
        total: results.length,
        accepted: results.filter((r: any) => r.objectSuggestion?.status === 'accepted').length,
        pending: results.filter((r: any) => r.needsConfirmation).length,
        conflicts: results.filter((r: any) => r.hasConflict).length,
        avgConfidence: results.length > 0 
            ? Math.round(results.reduce((sum: number, r: any) => sum + (r.objectSuggestion?.confidence || 0), 0) / results.length * 100)
            : 0
    };

    return (
        <div className="h-full flex flex-col p-6 gap-6 overflow-hidden">
            {/* 统计卡片 */}
            <div className="bg-white border border-slate-200 rounded-lg p-3 flex-shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">总表数：</span>
                        <span className="text-lg font-bold text-slate-800">{stats.total}</span>
                    </div>
                    <div className="h-6 w-px bg-slate-300"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-emerald-600">已接受：</span>
                        <span className="text-lg font-bold text-emerald-700">{stats.accepted}</span>
                    </div>
                    <div className="h-6 w-px bg-slate-300"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-yellow-600">待确认：</span>
                        <span className="text-lg font-bold text-yellow-700">{stats.pending}</span>
                    </div>
                    <div className="h-6 w-px bg-slate-300"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-orange-600">冲突项：</span>
                        <span className="text-lg font-bold text-orange-700">{stats.conflicts}</span>
                    </div>
                    <div className="h-6 w-px bg-slate-300"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-600">平均置信度：</span>
                        <span className="text-lg font-bold text-blue-700">{stats.avgConfidence}%</span>
                    </div>
                </div>
            </div>

            {/* 快速操作区 */}
            <div className="bg-white border border-slate-200 rounded-lg p-3 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-700 whitespace-nowrap">快速操作：</span>
                    <button
                        onClick={onNavigateToComparison}
                        className="px-4 py-2 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-2 text-sm font-medium text-emerald-700"
                    >
                        <FileCheck size={16} />
                        <span>识别结果对比</span>
                    </button>
                    <button
                        onClick={onNavigateToBatch}
                        className="px-4 py-2 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm font-medium text-blue-700"
                    >
                        <CheckSquare size={16} />
                        <span>批量确认</span>
                    </button>
                    <button
                        onClick={onNavigateToConflict}
                        className="px-4 py-2 bg-orange-50 border border-orange-300 rounded-lg hover:bg-orange-100 transition-colors flex items-center gap-2 text-sm font-medium text-orange-700"
                    >
                        <AlertTriangle size={16} />
                        <span>冲突解释</span>
                    </button>
                </div>
            </div>

            {/* 识别结果列表预览 */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col flex-1 min-h-0">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
                    <h3 className="text-lg font-bold text-slate-800">识别结果预览</h3>
                </div>
                <div className="flex-1 overflow-auto min-h-0">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">表名</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">对象建议</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">置信度</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">状态</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {results.map((result: any) => (
                                <tr key={result.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-mono text-sm whitespace-nowrap">{result.tableName}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-sm">{result.objectSuggestion?.name}</div>
                                        <div className="text-xs text-slate-500">{result.tableComment}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 bg-slate-200 rounded-full h-2">
                                                <div
                                                    className="bg-emerald-500 h-2 rounded-full"
                                                    style={{ width: `${(result.objectSuggestion?.confidence || 0) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-slate-600 whitespace-nowrap">
                                                {Math.round((result.objectSuggestion?.confidence || 0) * 100)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {result.hasConflict && (
                                                <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">冲突</span>
                                            )}
                                            {result.needsConfirmation && (
                                                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">待确认</span>
                                            )}
                                            {result.objectSuggestion?.status === 'accepted' && (
                                                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">已接受</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={onNavigateToComparison}
                                            className="text-blue-600 text-sm hover:underline whitespace-nowrap"
                                        >
                                            查看详情
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
