// ==========================================
// Identification Comparison Tab Component
// ==========================================
// Location: Extracted from tt5.tsx:5906-6440

import React, { useState, useMemo } from 'react';
import {
    AlertTriangle, CheckCircle, Edit, XCircle, ArrowRight,
    CheckSquare, Sparkles, RefreshCw, Cpu, Box, MessageCircle
} from 'lucide-react';

interface IdentificationComparisonTabProps {
    results: any[];
    setResults: (results: any[]) => void;
    dataSources: any[];
    onNavigateToBatch: () => void;
    onNavigateToConflict: (conflictId?: string) => void;
    onGenerateBusinessObject?: (result: any) => void;
}

export const IdentificationComparisonTab: React.FC<IdentificationComparisonTabProps> = ({
    results,
    setResults,
    dataSources,
    onNavigateToBatch,
    onNavigateToConflict,
    onGenerateBusinessObject
}) => {
    const [selectedTableId, setSelectedTableId] = useState<string | null>(results[0]?.id || null);
    const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
    const [highlightedField, setHighlightedField] = useState<string | null>(null);
    const [filter, setFilter] = useState({ needsConfirm: false, hasConflict: false, sortBy: 'confidence' });
    const [showWhyExplanation, setShowWhyExplanation] = useState<Record<string, boolean>>({});
    const [showCandidateSuggestions, setShowCandidateSuggestions] = useState<Record<string, boolean>>({});
    const [candidateSuggestions, setCandidateSuggestions] = useState<Record<string, any[]>>({});
    const [isLoadingCandidates, setIsLoadingCandidates] = useState<Record<string, boolean>>({});
    
    // 应用筛选和排序
    const filteredAndSortedResults = useMemo(() => {
        let filtered = [...results];
        
        if (filter.needsConfirm) {
            filtered = filtered.filter((r: any) => r.needsConfirmation);
        }
        if (filter.hasConflict) {
            filtered = filtered.filter((r: any) => r.hasConflict);
        }
        
        // 按置信度排序
        if (filter.sortBy === 'confidence') {
            filtered.sort((a: any, b: any) => 
                (b.objectSuggestion?.confidence || 0) - (a.objectSuggestion?.confidence || 0)
            );
        }
        
        return filtered;
    }, [results, filter]);
    
    const selectedResult = filteredAndSortedResults.find((r: any) => r.id === selectedTableId) || filteredAndSortedResults[0];
    const dataSource = dataSources.find((ds: any) => ds.id === selectedResult?.sourceId);
    
    const handleAction = (resultId: string, action: 'accept' | 'reject' | 'edit', type: 'object' | 'field', fieldName?: string, basis?: 'rule' | 'ai') => {
        const now = new Date().toLocaleString('zh-CN');
        const currentUser = '当前用户'; // 实际应该从用户上下文获取
        
        setResults((prev: any[]) => prev.map((r: any) => {
            if (r.id !== resultId) return r;
            if (type === 'object') {
                const auditTrail = {
                    recordBy: currentUser,
                    recordTime: now,
                    action: action,
                    basis: basis || (r.objectSuggestion?.source?.includes('规则') ? 'rule' : 'ai'),
                    source: r.objectSuggestion?.source || 'AI + 规则'
                };
                return { 
                    ...r, 
                    objectSuggestion: { 
                        ...r.objectSuggestion, 
                        status: action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'pending',
                        auditTrail: action !== 'edit' ? auditTrail : r.objectSuggestion?.auditTrail
                    },
                    needsConfirmation: action === 'accept' ? false : r.needsConfirmation
                };
            } else {
                return {
                    ...r,
                    fieldSuggestions: r.fieldSuggestions.map((f: any) => {
                        if (f.field === fieldName) {
                            const auditTrail = {
                                recordBy: currentUser,
                                recordTime: now,
                                action: action,
                                basis: basis || (f.conflict ? 'manual' : 'ai'),
                                fieldConfidence: f.confidence
                            };
                            return {
                                ...f,
                                status: action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : f.status,
                                auditTrail: action !== 'edit' ? auditTrail : f.auditTrail
                            };
                        }
                        return f;
                    })
                };
            }
        }));
    };

    return (
        <div className="h-full flex flex-col p-6 gap-4">
            {/* 顶部控制栏 */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="text-sm text-slate-600">
                        <span className="font-medium">任务：</span>
                        <span>Bottom-up 识别任务</span>
                    </div>
                    <div className="h-4 w-px bg-slate-300"></div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={filter.needsConfirm}
                            onChange={(e) => setFilter({ ...filter, needsConfirm: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-300"
                        />
                        <label className="text-sm text-slate-600">仅显示需确认</label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={filter.hasConflict}
                            onChange={(e) => setFilter({ ...filter, hasConflict: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-300"
                        />
                        <label className="text-sm text-slate-600">仅显示冲突</label>
                    </div>
                    <div className="h-4 w-px bg-slate-300"></div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-600">排序：</label>
                        <select
                            value={filter.sortBy}
                            onChange={(e) => setFilter({ ...filter, sortBy: e.target.value })}
                            className="border border-slate-300 rounded px-2 py-1 text-sm"
                        >
                            <option value="confidence">按置信度</option>
                            <option value="name">按表名</option>
                        </select>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={onNavigateToBatch}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                    >
                        <CheckSquare size={16} /> 批量确认
                    </button>
                    <button 
                        onClick={() => onNavigateToConflict()}
                        className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 flex items-center gap-2"
                    >
                        <AlertTriangle size={16} /> 查看冲突
                    </button>
                </div>
            </div>

            {/* 主内容区 - 左右对照 */}
            <div className="flex-1 flex gap-4 overflow-hidden">
                {/* 左侧：数据来源结构 */}
                <div className="w-80 bg-white border border-slate-200 rounded-lg flex flex-col overflow-hidden flex-shrink-0">
                    <div className="p-3 border-b border-slate-200 bg-slate-50">
                        <h3 className="text-sm font-bold text-slate-700">数据来源结构</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {filteredAndSortedResults.map((result: any) => (
                            <div
                                key={result.id}
                                onClick={() => {
                                    setSelectedTableId(result.id);
                                    setHighlightedField(null);
                                }}
                                className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                                    selectedTableId === result.id
                                        ? 'bg-emerald-50 border-2 border-emerald-300'
                                        : 'bg-slate-50 border border-slate-200 hover:border-emerald-200'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <div className="font-medium text-sm text-slate-800">{result.tableName}</div>
                                    {result.hasConflict && <AlertTriangle size={14} className="text-orange-500" />}
                                </div>
                                <div className="text-xs text-slate-500">{result.tableComment}</div>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    {result.fieldSuggestions.map((f: any, idx: number) => (
                                        <div
                                            key={idx}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setHighlightedField(f.field);
                                                setExpandedFields(new Set([f.field]));
                                            }}
                                            className={`text-xs px-2 py-0.5 rounded cursor-pointer transition-all ${
                                                highlightedField === f.field && selectedTableId === result.id
                                                    ? 'ring-2 ring-emerald-400 ring-offset-1 bg-emerald-200 text-emerald-800'
                                                    : f.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                    f.conflict ? 'bg-orange-100 text-orange-700' :
                                                    'bg-slate-100 text-slate-600'
                                            }`}
                                        >
                                            {f.field}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 右侧：语义建议区 */}
                <div className="flex-1 bg-white border border-slate-200 rounded-lg flex flex-col overflow-hidden">
                    {selectedResult ? (
                        <>
                            {/* 表级对象建议卡片 */}
                            <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-blue-50">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-lg font-bold text-slate-800">{selectedResult.objectSuggestion.name}</h3>
                                            <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded">
                                                来源：{selectedResult.objectSuggestion.source}
                                            </span>
                                            {selectedResult.objectSuggestion.risk !== 'low' && (
                                                <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded">
                                                    风险
                                                </span>
                                            )}
                                        </div>
                                        <div className="mb-2">
                                            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                                                <span>置信度</span>
                                                <span className="font-medium">{Math.round(selectedResult.objectSuggestion.confidence * 100)}%</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-2">
                                                <div
                                                    className="bg-emerald-500 h-2 rounded-full transition-all"
                                                    style={{ width: `${selectedResult.objectSuggestion.confidence * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => handleAction(selectedResult.id, 'accept', 'object')}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="接受"
                                        >
                                            <CheckCircle size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleAction(selectedResult.id, 'edit', 'object')}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="编辑"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleAction(selectedResult.id, 'reject', 'object')}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="拒绝"
                                        >
                                            <XCircle size={18} />
                                        </button>
                                    </div>
                                    {/* 生成业务对象按钮 */}
                                    {onGenerateBusinessObject && (
                                        <div className="mt-3 pt-3 border-t border-slate-200">
                                            <button
                                                onClick={() => onGenerateBusinessObject(selectedResult)}
                                                className="w-full py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                                            >
                                                <Box size={16} /> 生成业务对象
                                            </button>
                                        </div>
                                    )}
                                    {selectedResult.objectSuggestion?.auditTrail && (
                                        <div className="mt-2 pt-2 border-t border-slate-200">
                                            <div className="text-xs text-slate-500">
                                                <span>确认人：{selectedResult.objectSuggestion.auditTrail.recordBy}</span>
                                                <span className="mx-2">|</span>
                                                <span>时间：{selectedResult.objectSuggestion.auditTrail.recordTime}</span>
                                                <span className="mx-2">|</span>
                                                <span>依据：{selectedResult.objectSuggestion.auditTrail.basis === 'rule' ? '规则' : selectedResult.objectSuggestion.auditTrail.basis === 'ai' ? 'AI' : '手动'}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 字段级语义分类列表 */}
                            <div className="flex-1 overflow-y-auto p-4">
                                <h4 className="text-sm font-bold text-slate-700 mb-3">字段语义分类</h4>
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">字段</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">语义角色</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">AI 解释</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">置信度</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {selectedResult.fieldSuggestions.map((field: any, idx: number) => {
                                            const isHighlighted = highlightedField === field.field;
                                            return (
                                                <tr 
                                                    key={idx} 
                                                    className={`hover:bg-slate-50 transition-colors ${
                                                        isHighlighted ? 'bg-emerald-50 ring-2 ring-emerald-300' : ''
                                                    }`}
                                                >
                                                    <td className={`px-4 py-2 font-mono text-sm ${isHighlighted ? 'font-bold text-emerald-800' : ''}`}>
                                                        {field.field}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-slate-700">{field.semanticRole}</td>
                                                    <td className="px-4 py-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-slate-600">{field.aiExplanation}</span>
                                                            <button
                                                                onClick={() => {
                                                                    setShowWhyExplanation((prev: any) => ({
                                                                        ...prev,
                                                                        [`${selectedResult.id}_${field.field}`]: !prev[`${selectedResult.id}_${field.field}`]
                                                                    }));
                                                                }}
                                                                className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                                                title="为什么这么判断"
                                                            >
                                                                <MessageCircle size={12} />
                                                                为什么
                                                            </button>
                                                        </div>
                                                        {showWhyExplanation[`${selectedResult.id}_${field.field}`] && (
                                                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-slate-700">
                                                                <div className="font-medium mb-1">AI 推理依据：</div>
                                                                <div className="leading-relaxed">
                                                                    字段名 "{field.field}" 在表 "{selectedResult.tableName}" 中，根据命名模式和业务上下文分析：
                                                                    <ul className="list-disc list-inside mt-1 space-y-1">
                                                                        <li>命名模式：{field.field.includes('time') ? '包含 "time"，表示时间相关字段' : '字段命名符合常见语义模式'}</li>
                                                                        <li>业务语义：结合表名 "{selectedResult.tableComment}"，判断为 {field.semanticRole}</li>
                                                                        <li>数据特征：置信度 {Math.round(field.confidence * 100)}%，基于字段类型和业务上下文综合判断</li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-20 bg-slate-200 rounded-full h-1.5">
                                                                <div
                                                                    className="bg-blue-500 h-1.5 rounded-full"
                                                                    style={{ width: `${field.confidence * 100}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs text-slate-500">{Math.round(field.confidence * 100)}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex gap-1">
                                                                {field.status !== 'accepted' && (
                                                                    <button
                                                                        onClick={() => handleAction(selectedResult.id, 'accept', 'field', field.field)}
                                                                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                                        title="接受"
                                                                    >
                                                                        <CheckCircle size={16} />
                                                                    </button>
                                                                )}
                                                                {field.conflict && (
                                                                    <button
                                                                        onClick={() => {
                                                                            onNavigateToConflict(`${selectedResult.id}_${field.field}`);
                                                                        }}
                                                                        className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                                                                        title="查看冲突"
                                                                    >
                                                                        <AlertTriangle size={16} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            {field.auditTrail && (
                                                                <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-1">
                                                                    <div>确认：{field.auditTrail.recordBy} | {field.auditTrail.recordTime}</div>
                                                                    <div>依据：{field.auditTrail.basis === 'rule' ? '规则' : field.auditTrail.basis === 'ai' ? 'AI' : '手动'}</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                {/* 状态/行为升级建议 */}
                                {selectedResult.upgradeSuggestions && selectedResult.upgradeSuggestions.length > 0 && (
                                    <div className="mt-6 p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg">
                                        <div className="flex items-center gap-2 mb-3">
                                            <AlertTriangle size={16} className="text-orange-500" />
                                            <h4 className="text-sm font-bold text-slate-700">升级建议</h4>
                                        </div>
                                        <div className="space-y-2">
                                            {selectedResult.upgradeSuggestions.map((upgrade: any, idx: number) => (
                                                <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
                                                    <div>
                                                        <span className="text-sm text-slate-700">「{upgrade.source}」</span>
                                                        <ArrowRight size={14} className="inline mx-2 text-slate-400" />
                                                        <span className="text-sm font-medium text-slate-800">{upgrade.target}</span>
                                                    </div>
                                                    <span className="text-xs text-slate-500">置信度: {Math.round(upgrade.confidence * 100)}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 候选建议（辅助功能） */}
                                <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Sparkles size={16} className="text-purple-500" />
                                            <h4 className="text-sm font-bold text-slate-700">AI 候选建议</h4>
                                            <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded">辅助功能</span>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (showCandidateSuggestions[selectedResult.id]) {
                                                    setShowCandidateSuggestions({ ...showCandidateSuggestions, [selectedResult.id]: false });
                                                } else {
                                                    setIsLoadingCandidates({ ...isLoadingCandidates, [selectedResult.id]: true });
                                                    // 模拟AI分析过程
                                                    await new Promise(resolve => setTimeout(resolve, 1000));
                                                    // 生成候选建议
                                                    const suggestions = [
                                                        {
                                                            id: `CAND_${selectedResult.id}_1`,
                                                            suggestedName: `${selectedResult.objectSuggestion.name}记录`,
                                                            confidence: (selectedResult.objectSuggestion.confidence + 0.05),
                                                            reason: `基于当前识别结果"${selectedResult.objectSuggestion.name}"的进一步优化建议`,
                                                            alternativeNames: [
                                                                `${selectedResult.objectSuggestion.name}明细`,
                                                                `${selectedResult.objectSuggestion.name}信息`,
                                                                `${selectedResult.objectSuggestion.name}数据`
                                                            ]
                                                        }
                                                    ];
                                                    setCandidateSuggestions({ ...candidateSuggestions, [selectedResult.id]: suggestions });
                                                    setIsLoadingCandidates({ ...isLoadingCandidates, [selectedResult.id]: false });
                                                    setShowCandidateSuggestions({ ...showCandidateSuggestions, [selectedResult.id]: true });
                                                }
                                            }}
                                            className="text-xs px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-1"
                                        >
                                            {isLoadingCandidates[selectedResult.id] ? (
                                                <>
                                                    <RefreshCw size={12} className="animate-spin" /> 分析中...
                                                </>
                                            ) : showCandidateSuggestions[selectedResult.id] ? (
                                                '收起建议'
                                            ) : (
                                                <>
                                                    <Cpu size={12} /> 查看候选建议
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    {showCandidateSuggestions[selectedResult.id] && candidateSuggestions[selectedResult.id] && (
                                        <div className="space-y-3 mt-3">
                                            {candidateSuggestions[selectedResult.id].map((candidate: any) => (
                                                <div key={candidate.id} className="bg-white rounded-lg border border-purple-200 p-3">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex-1">
                                                            <h5 className="text-sm font-bold text-slate-800 mb-1">{candidate.suggestedName}</h5>
                                                            <p className="text-xs text-slate-600 mb-2">{candidate.reason}</p>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-slate-500">置信度:</span>
                                                                <div className="w-20 bg-slate-200 rounded-full h-1.5">
                                                                    <div
                                                                        className="bg-purple-500 h-1.5 rounded-full"
                                                                        style={{ width: `${candidate.confidence * 100}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-xs text-purple-600 font-medium">
                                                                    {Math.round(candidate.confidence * 100)}%
                                                                </span>
                                                            </div>
                                                            {candidate.alternativeNames && candidate.alternativeNames.length > 0 && (
                                                                <div className="mt-2">
                                                                    <div className="text-xs text-slate-500 mb-1">备选名称:</div>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {candidate.alternativeNames.map((name: string, idx: number) => (
                                                                            <span key={idx} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                                                                {name}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
                                                        <button
                                                            onClick={() => {
                                                                if (onGenerateBusinessObject) {
                                                                    // 使用候选建议生成业务对象
                                                                    const enhancedResult = {
                                                                        ...selectedResult,
                                                                        objectSuggestion: {
                                                                            ...selectedResult.objectSuggestion,
                                                                            name: candidate.suggestedName
                                                                        }
                                                                    };
                                                                    onGenerateBusinessObject(enhancedResult);
                                                                }
                                                            }}
                                                            className="flex-1 py-1.5 bg-purple-600 text-white text-xs font-medium rounded hover:bg-purple-700 flex items-center justify-center gap-1"
                                                        >
                                                            <Box size={12} /> 采用此建议生成
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setCandidateSuggestions({
                                                                    ...candidateSuggestions,
                                                                    [selectedResult.id]: candidateSuggestions[selectedResult.id].filter((c: any) => c.id !== candidate.id)
                                                                });
                                                            }}
                                                            className="px-3 py-1.5 border border-slate-300 text-slate-600 text-xs rounded hover:bg-slate-50"
                                                        >
                                                            忽略
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-xs text-slate-500 mt-2">
                                        💡 提示：候选建议是AI生成的辅助推荐，您可以采纳或忽略
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-400">
                            请选择左侧表查看识别结果
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
