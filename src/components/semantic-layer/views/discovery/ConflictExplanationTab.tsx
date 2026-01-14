// ==========================================
// Conflict Explanation Tab Component
// ==========================================
// Location: Extracted from tt5.tsx:6675-7334

import React, { useState, useEffect } from 'react';
import { CheckCircle, Box } from 'lucide-react';

interface ConflictExplanationTabProps {
    results: any[];
    setResults: (results: any[]) => void;
    selectedConflict: string | null;
    setSelectedConflict: (conflict: string | null) => void;
    onNavigateToComparison: () => void;
    onGenerateBusinessObject?: (result: any) => void;
}

export const ConflictExplanationTab: React.FC<ConflictExplanationTabProps> = ({
    results,
    setResults,
    selectedConflict,
    setSelectedConflict,
    onNavigateToComparison,
    onGenerateBusinessObject
}) => {
    const [selectedDecision, setSelectedDecision] = useState<'rule' | 'ai' | 'manual' | null>(null);
    const [manualSemanticRole, setManualSemanticRole] = useState('');
    const [decisionNote, setDecisionNote] = useState('');
    const [decisionHistory, setDecisionHistory] = useState<Record<string, any>>({});
    
    // 规则判断数据映射
    const ruleJudgments: Record<string, any> = {
        'IR_001_pay_time': {
            rules: [
                { id: 'R001', name: '时间字段规则', reason: '字段名包含 "time" 且类型为 datetime', weight: 0.3, result: '时间戳' },
                { id: 'R002', name: '支付相关规则', reason: '字段名包含 "pay" 关键字', weight: 0.4, result: '支付属性' },
            ],
            ruleResult: '支付属性',
            ruleConfidence: 0.70
        },
        'IR_004_inject_time': {
            rules: [
                { id: 'R003', name: '行为时间规则', reason: '字段名包含 "inject" 和 "time"', weight: 0.5, result: '行为时间' },
                { id: 'R004', name: '医疗行为规则', reason: '表名包含 "vac" 且字段为时间类型', weight: 0.3, result: '医疗行为时间' },
            ],
            ruleResult: '行为时间',
            ruleConfidence: 0.80
        },
        'IR_005_hosp_level': {
            rules: [
                { id: 'R005', name: '等级字段规则', reason: '字段名包含 "level"', weight: 0.4, result: '等级属性' },
                { id: 'R006', name: '字典表规则', reason: '表名包含 "dict" 且字段为枚举类型', weight: 0.3, result: '字典值' },
            ],
            ruleResult: '等级属性',
            ruleConfidence: 0.70
        },
        'IR_007_pay_time': {
            rules: [
                { id: 'R007', name: '支付时间规则', reason: '字段名包含 "pay_time"', weight: 0.5, result: '支付时间属性' },
                { id: 'R008', name: '记录表时间规则', reason: '表名包含 "record" 且字段为时间类型', weight: 0.3, result: '记录时间' },
            ],
            ruleResult: '支付时间属性',
            ruleConfidence: 0.80
        },
        'IR_010_exam_type': {
            rules: [
                { id: 'R009', name: '类型字段规则', reason: '字段名包含 "type"', weight: 0.4, result: '类型属性' },
                { id: 'R010', name: '体检相关规则', reason: '表名包含 "exam" 且字段为枚举类型', weight: 0.3, result: '体检类型' },
            ],
            ruleResult: '类型属性',
            ruleConfidence: 0.70
        },
        'IR_010_exam_result': {
            rules: [
                { id: 'R011', name: '结果字段规则', reason: '字段名包含 "result"', weight: 0.4, result: '结果属性' },
                { id: 'R012', name: '状态字段规则', reason: '字段名包含 "result" 且可能为状态值', weight: 0.3, result: '状态属性' },
            ],
            ruleResult: '结果属性',
            ruleConfidence: 0.65
        }
    };

    // AI 判断详细数据映射
    const aiJudgments: Record<string, any> = {
        'IR_001_pay_time': {
            detailedExplanation: '根据字段名 "pay_time" 和上下文分析，该字段记录的是支付行为发生的时间点，属于行为线索类型。结合表名 "order_info" 和业务场景，判断为支付行为的时间戳。',
            reasoning: '字段命名模式：pay + time 组合通常表示支付行为的时间点；业务上下文：订单表中的支付时间字段；数据特征：datetime 类型，支持精确时间记录。'
        },
        'IR_004_inject_time': {
            detailedExplanation: '字段 "inject_time" 在疫苗接种记录表中，表示接种行为发生的时间。虽然包含时间信息，但更强调行为的发生，因此归类为行为线索而非单纯的时间戳。',
            reasoning: '医疗业务语义：疫苗接种是典型的医疗行为；字段语义：inject 表示动作，time 表示时间，组合表示行为时间；业务价值：可用于分析接种行为的时间分布。'
        },
        'IR_005_hosp_level': {
            detailedExplanation: '医院等级字段虽然看起来是属性，但在字典表中，等级通常有明确的枚举值（如一级、二级、三级），具有状态特征。建议升级为状态对象以便更好地管理状态流转。',
            reasoning: '字典表特征：表名包含 "dict"，通常存储枚举值；业务语义：医院等级是相对固定的状态值；扩展性：未来可能需要状态流转和版本管理。'
        },
        'IR_007_pay_time': {
            detailedExplanation: '支付记录表中的支付时间字段，记录的是支付行为发生的时间点。虽然可以视为时间戳，但结合业务场景，更应视为支付行为的组成部分。',
            reasoning: '业务场景：支付记录表专门记录支付行为；字段语义：pay_time 强调支付动作的时间；数据价值：可用于分析支付行为模式和趋势。'
        },
        'IR_010_exam_type': {
            detailedExplanation: '体检类型字段在健康体检记录中，表示体检的类别（如常规体检、专项体检等）。虽然可以视为属性，但类型值通常有固定的枚举范围，具有状态特征。',
            reasoning: '业务语义：体检类型是相对固定的分类；枚举特征：通常有预定义的类型列表；扩展需求：未来可能需要类型管理和分类规则。'
        },
        'IR_010_exam_result': {
            detailedExplanation: '体检结果字段表示体检的最终结果状态（如正常、异常等）。虽然可以视为属性，但结果值通常有明确的状态含义，建议升级为状态对象。',
            reasoning: '状态特征：体检结果有明确的状态值；业务价值：结果状态可能影响后续业务流程；管理需求：需要状态流转和结果追踪。'
        }
    };

    const conflicts = results
        .flatMap((r: any) => r.fieldSuggestions
            .filter((f: any) => f.conflict)
            .map((f: any) => ({ 
                ...f, 
                tableId: r.id, 
                tableName: r.tableName, 
                objectSuggestion: r.objectSuggestion,
                ruleJudgment: ruleJudgments[`${r.id}_${f.field}`],
                aiJudgment: aiJudgments[`${r.id}_${f.field}`]
            }))
        );

    const currentConflict = conflicts.find((c: any) => `${c.tableId}_${c.field}` === selectedConflict) || conflicts[0];
    
    // 当切换冲突项时，重置决策状态
    useEffect(() => {
        if (currentConflict) {
            const conflictKey = `${currentConflict.tableId}_${currentConflict.field}`;
            const history = decisionHistory[conflictKey];
            if (history) {
                setSelectedDecision(history.decision);
                setManualSemanticRole(history.manualRole || '');
                setDecisionNote(history.note || '');
            } else {
                setSelectedDecision(null);
                setManualSemanticRole('');
                setDecisionNote('');
            }
        }
    }, [selectedConflict, decisionHistory, currentConflict]);
    
    // 计算推荐结果
    const getRecommendedDecision = (conflict: any) => {
        if (!conflict || !conflict.ruleJudgment) return 'ai';
        const aiConfidence = conflict.confidence || 0;
        const ruleConfidence = conflict.ruleJudgment.ruleConfidence || 0;
        // 如果AI置信度高于规则置信度5%以上，推荐AI，否则推荐规则
        return aiConfidence > ruleConfidence + 0.05 ? 'ai' : 'rule';
    };
    
    const recommendedDecision = currentConflict ? getRecommendedDecision(currentConflict) : 'ai';
    
    // 确认决策
    const handleConfirmDecision = () => {
        if (!currentConflict || !selectedDecision) {
            alert('请先选择决策方案');
            return;
        }
        
        if (selectedDecision === 'manual' && !manualSemanticRole.trim()) {
            alert('手动指定时，请填写语义角色');
            return;
        }
        
        const now = new Date().toLocaleString('zh-CN');
        const currentUser = '当前用户';
        const conflictKey = `${currentConflict.tableId}_${currentConflict.field}`;
        
        // 确定最终的语义角色
        let finalSemanticRole = currentConflict.semanticRole;
        if (selectedDecision === 'rule' && currentConflict.ruleJudgment) {
            finalSemanticRole = currentConflict.ruleJudgment.ruleResult;
        } else if (selectedDecision === 'manual') {
            finalSemanticRole = manualSemanticRole.trim();
        }
        
        // 更新识别结果
        setResults((prev: any[]) => prev.map((r: any) => {
            if (r.id === currentConflict.tableId) {
                return {
                    ...r,
                    fieldSuggestions: r.fieldSuggestions.map((f: any) => {
                        if (f.field === currentConflict.field) {
                            const auditTrail = {
                                recordBy: currentUser,
                                recordTime: now,
                                action: 'accept',
                                basis: selectedDecision === 'rule' ? 'rule' : selectedDecision === 'ai' ? 'ai' : 'manual',
                                originalAI: currentConflict.semanticRole,
                                originalRule: currentConflict.ruleJudgment?.ruleResult,
                                decision: selectedDecision,
                                note: decisionNote.trim() || undefined
                            };
                            return {
                                ...f,
                                semanticRole: finalSemanticRole,
                                status: 'accepted',
                                conflict: false, // 解决冲突
                                auditTrail: auditTrail
                            };
                        }
                        return f;
                    }),
                    hasConflict: r.fieldSuggestions.some((f: any) => 
                        f.field !== currentConflict.field && f.conflict
                    ) // 检查是否还有其他冲突
                };
            }
            return r;
        }));
        
        // 记录决策历史
        setDecisionHistory((prev: any) => ({
            ...prev,
            [conflictKey]: {
                decision: selectedDecision,
                manualRole: manualSemanticRole.trim(),
                note: decisionNote.trim(),
                timestamp: now,
                finalRole: finalSemanticRole
            }
        }));
        
        alert(`已确认决策：${selectedDecision === 'rule' ? '采用规则' : selectedDecision === 'ai' ? '采用AI' : '手动指定'} - ${finalSemanticRole}`);
        
        // 清空表单
        setSelectedDecision(null);
        setManualSemanticRole('');
        setDecisionNote('');
        
        // 如果有下一个冲突，自动切换到下一个
        const currentIndex = conflicts.findIndex((c: any) => `${c.tableId}_${c.field}` === conflictKey);
        if (currentIndex < conflicts.length - 1) {
            setSelectedConflict(`${conflicts[currentIndex + 1].tableId}_${conflicts[currentIndex + 1].field}`);
        } else if (currentIndex === conflicts.length - 1 && conflicts.length > 1) {
            setSelectedConflict(`${conflicts[0].tableId}_${conflicts[0].field}`);
        }
    };

    return (
        <div className="h-full flex flex-col p-6 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4 flex-shrink-0">
                <h3 className="text-lg font-bold text-slate-800 mb-4">冲突与解释</h3>
                <p className="text-sm text-slate-600">这是语义平台区别于普通自动建模工具的关键页面</p>
            </div>

            <div className="flex-1 flex gap-4 overflow-hidden">
                {/* 左栏：规则判断 */}
                <div className="w-80 bg-white border border-slate-200 rounded-lg flex flex-col overflow-hidden flex-shrink-0">
                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-700">规则判断</h4>
                        <span className="text-xs text-slate-500">共 {conflicts.length} 项冲突</span>
                    </div>
                    {currentConflict && currentConflict.ruleJudgment ? (
                        <div className="p-4 border-b border-slate-200 bg-blue-50 flex-shrink-0">
                            <div className="text-xs text-slate-600 mb-3 font-medium">当前冲突的规则判断：</div>
                            <div className="space-y-2 mb-3">
                                {currentConflict.ruleJudgment.rules.map((rule: any, idx: number) => (
                                    <div key={idx} className="p-2.5 bg-white rounded border border-blue-200 shadow-sm">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs font-mono text-blue-600 font-medium">{rule.id}</span>
                                            <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                                权重 {Math.round(rule.weight * 100)}%
                                            </span>
                                        </div>
                                        <div className="text-xs font-semibold text-slate-700 mb-1">{rule.name}</div>
                                        <div className="text-xs text-slate-600 mb-1.5 leading-relaxed">{rule.reason}</div>
                                        <div className="text-xs text-blue-600 font-medium">→ {rule.result}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-3 bg-white rounded border-2 border-blue-400 shadow-sm">
                                <div className="text-xs text-slate-600 mb-1.5 font-medium">规则综合判断：</div>
                                <div className="text-base font-bold text-blue-700 mb-1">{currentConflict.ruleJudgment.ruleResult}</div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full transition-all"
                                            style={{ width: `${currentConflict.ruleJudgment.ruleConfidence * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs text-slate-600 font-medium">
                                        {Math.round(currentConflict.ruleJudgment.ruleConfidence * 100)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                            当前冲突项暂无规则判断数据
                        </div>
                    )}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {conflicts.length === 0 ? (
                            <div className="text-center text-sm text-slate-400 py-8">
                                暂无冲突项
                            </div>
                        ) : (
                            conflicts.map((conflict: any, idx: number) => {
                                const conflictKey = `${conflict.tableId}_${conflict.field}`;
                                const history = decisionHistory[conflictKey];
                                const isSelected = selectedConflict === conflictKey;
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedConflict(conflictKey)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                            isSelected
                                                ? 'bg-orange-50 border-orange-400 shadow-sm'
                                                : 'bg-slate-50 border-slate-200 hover:border-orange-300 hover:shadow'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-1">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm text-slate-800 truncate">{conflict.tableName}</div>
                                                <div className="font-mono text-xs text-slate-600 truncate">{conflict.field}</div>
                                            </div>
                                            {history && (
                                                <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" title="已决策" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            {conflict.ruleJudgment && (
                                                <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                                                    规则: {conflict.ruleJudgment.ruleResult}
                                                </span>
                                            )}
                                            <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">
                                                AI: {conflict.semanticRole}
                                            </span>
                                        </div>
                                        {history && (
                                            <div className="mt-2 pt-2 border-t border-slate-200 text-xs text-slate-500">
                                                已决策: {history.finalRole}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* 中栏：AI 判断与对比 */}
                <div className="flex-1 bg-white border border-slate-200 rounded-lg flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50">
                        <h4 className="text-sm font-bold text-slate-700">AI 判断与对比</h4>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        {currentConflict ? (
                            <div className="space-y-6">
                                {/* 对比展示 */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* 规则判断 */}
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="text-xs text-blue-600 font-bold mb-2 uppercase">规则判断</div>
                                        {currentConflict.ruleJudgment ? (
                                            <>
                                                <div className="text-lg font-bold text-blue-700 mb-2">
                                                    {currentConflict.ruleJudgment.ruleResult}
                                                </div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="flex-1 bg-blue-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-500 h-2 rounded-full"
                                                            style={{ width: `${(currentConflict.ruleJudgment.ruleConfidence || 0) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs text-blue-600 font-medium">
                                                        {Math.round((currentConflict.ruleJudgment.ruleConfidence || 0) * 100)}%
                                                    </span>
                                                </div>
                                                <div className="text-xs text-blue-600 mt-2">
                                                    基于 {currentConflict.ruleJudgment.rules.length} 条规则
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-sm text-slate-400">暂无规则判断</div>
                                        )}
                                    </div>
                                    {/* AI判断 */}
                                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                        <div className="text-xs text-purple-600 font-bold mb-2 uppercase">AI 判断</div>
                                        <div className="text-lg font-bold text-purple-700 mb-2">
                                            {currentConflict.semanticRole}
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="flex-1 bg-purple-200 rounded-full h-2">
                                                <div
                                                    className="bg-purple-500 h-2 rounded-full"
                                                    style={{ width: `${currentConflict.confidence * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-purple-600 font-medium">
                                                {Math.round(currentConflict.confidence * 100)}%
                                            </span>
                                        </div>
                                        <div className="text-xs text-purple-600 mt-2">
                                            基于 AI 语义分析
                                        </div>
                                    </div>
                                </div>
                                
                                {/* 原文引用 */}
                                <div>
                                    <div className="text-xs uppercase text-slate-400 font-bold mb-2">原文引用</div>
                                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-500 w-16">表名：</span>
                                                <code className="flex-1 font-mono text-sm text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                                                    {currentConflict.tableName}
                                                </code>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-500 w-16">字段：</span>
                                                <code className="flex-1 font-mono text-sm text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                                                    {currentConflict.field}
                                                </code>
                                            </div>
                                            {currentConflict.objectSuggestion && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-slate-500 w-16">对象：</span>
                                                    <span className="flex-1 text-sm text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                                                        {currentConflict.objectSuggestion.name}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* AI 推理说明 */}
                                <div>
                                    <div className="text-xs uppercase text-slate-400 font-bold mb-2">AI 推理说明</div>
                                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                        <div className="text-sm text-slate-700 mb-3 font-medium">{currentConflict.aiExplanation}</div>
                                        {currentConflict.aiJudgment && (
                                            <>
                                                <div className="pt-3 border-t border-purple-200">
                                                    <div className="text-xs font-semibold text-purple-700 mb-2">详细分析：</div>
                                                    <div className="text-xs text-slate-700 leading-relaxed mb-3">
                                                        {currentConflict.aiJudgment.detailedExplanation}
                                                    </div>
                                                </div>
                                                <div className="pt-3 border-t border-purple-200">
                                                    <div className="text-xs font-semibold text-purple-700 mb-2">推理依据：</div>
                                                    <div className="text-xs text-slate-700 leading-relaxed">
                                                        {currentConflict.aiJudgment.reasoning}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                
                                {/* 规则详情（如果存在） */}
                                {currentConflict.ruleJudgment && currentConflict.ruleJudgment.rules.length > 0 && (
                                    <div>
                                        <div className="text-xs uppercase text-slate-400 font-bold mb-2">规则详情</div>
                                        <div className="space-y-2">
                                            {currentConflict.ruleJudgment.rules.map((rule: any, idx: number) => (
                                                <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-mono text-blue-600 font-medium">{rule.id}</span>
                                                        <span className="text-xs text-slate-500">权重 {Math.round(rule.weight * 100)}%</span>
                                                    </div>
                                                    <div className="text-xs font-semibold text-slate-700 mb-1">{rule.name}</div>
                                                    <div className="text-xs text-slate-600 leading-relaxed">{rule.reason}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">
                                请选择左侧冲突项查看详情
                            </div>
                        )}
                    </div>
                </div>

                {/* 右栏：用户决策 */}
                <div className="w-80 bg-white border border-slate-200 rounded-lg flex flex-col overflow-hidden flex-shrink-0">
                    <div className="p-4 border-b border-slate-200 bg-slate-50">
                        <h4 className="text-sm font-bold text-slate-700">用户决策</h4>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {currentConflict ? (
                            <>
                                {/* 推荐结果 */}
                                <div>
                                    <div className="text-xs uppercase text-slate-400 font-bold mb-2">系统推荐</div>
                                    {recommendedDecision === 'rule' && currentConflict.ruleJudgment ? (
                                        <div className="p-3 bg-blue-50 border-2 border-blue-400 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded font-medium">推荐</span>
                                                <span className="font-bold text-blue-700">{currentConflict.ruleJudgment.ruleResult}</span>
                                            </div>
                                            <div className="text-xs text-blue-600 mt-1">
                                                规则置信度 ({Math.round((currentConflict.ruleJudgment.ruleConfidence || 0) * 100)}%) 
                                                高于 AI ({Math.round(currentConflict.confidence * 100)}%)
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-3 bg-purple-50 border-2 border-purple-400 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded font-medium">推荐</span>
                                                <span className="font-bold text-purple-700">{currentConflict.semanticRole}</span>
                                            </div>
                                            <div className="text-xs text-purple-600 mt-1">
                                                AI 置信度 ({Math.round(currentConflict.confidence * 100)}%) 
                                                {currentConflict.ruleJudgment 
                                                    ? `高于规则 (${Math.round((currentConflict.ruleJudgment.ruleConfidence || 0) * 100)}%)`
                                                    : '无规则判断'}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* 选择方案 */}
                                <div>
                                    <div className="text-xs uppercase text-slate-400 font-bold mb-2">选择方案</div>
                                    <div className="space-y-2">
                                        <button 
                                            onClick={() => setSelectedDecision('rule')}
                                            disabled={!currentConflict.ruleJudgment}
                                            className={`w-full p-3 text-left border-2 rounded-lg transition-all ${
                                                selectedDecision === 'rule'
                                                    ? 'border-blue-500 bg-blue-100 shadow-sm'
                                                    : 'border-blue-300 bg-blue-50 hover:bg-blue-100'
                                            } ${!currentConflict.ruleJudgment ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                    selectedDecision === 'rule' ? 'border-blue-500 bg-blue-500' : 'border-blue-300'
                                                }`}>
                                                    {selectedDecision === 'rule' && <CheckCircle size={12} className="text-white" />}
                                                </div>
                                                <span className="font-medium text-sm text-slate-800">采用规则</span>
                                            </div>
                                            <div className="text-xs text-slate-500 ml-6">
                                                {currentConflict.ruleJudgment 
                                                    ? `使用规则判断: ${currentConflict.ruleJudgment.ruleResult} (${Math.round((currentConflict.ruleJudgment.ruleConfidence || 0) * 100)}%)`
                                                    : '暂无规则判断'}
                                            </div>
                                        </button>
                                        <button 
                                            onClick={() => setSelectedDecision('ai')}
                                            className={`w-full p-3 text-left border-2 rounded-lg transition-all ${
                                                selectedDecision === 'ai'
                                                    ? 'border-purple-500 bg-purple-100 shadow-sm'
                                                    : 'border-purple-300 bg-purple-50 hover:bg-purple-100'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                    selectedDecision === 'ai' ? 'border-purple-500 bg-purple-500' : 'border-purple-300'
                                                }`}>
                                                    {selectedDecision === 'ai' && <CheckCircle size={12} className="text-white" />}
                                                </div>
                                                <span className="font-medium text-sm text-slate-800">采用 AI</span>
                                                {recommendedDecision === 'ai' && (
                                                    <span className="text-xs bg-purple-500 text-white px-1.5 py-0.5 rounded">推荐</span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-500 ml-6">
                                                使用 AI 判断: {currentConflict.semanticRole} ({Math.round(currentConflict.confidence * 100)}%)
                                            </div>
                                        </button>
                                        <button 
                                            onClick={() => setSelectedDecision('manual')}
                                            className={`w-full p-3 text-left border-2 rounded-lg transition-all ${
                                                selectedDecision === 'manual'
                                                    ? 'border-slate-500 bg-slate-100 shadow-sm'
                                                    : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                    selectedDecision === 'manual' ? 'border-slate-500 bg-slate-500' : 'border-slate-300'
                                                }`}>
                                                    {selectedDecision === 'manual' && <CheckCircle size={12} className="text-white" />}
                                                </div>
                                                <span className="font-medium text-sm text-slate-800">手动指定</span>
                                            </div>
                                            <div className="text-xs text-slate-500 ml-6">自定义语义角色</div>
                                        </button>
                                    </div>
                                </div>
                                
                                {/* 手动指定输入 */}
                                {selectedDecision === 'manual' && (
                                    <div>
                                        <div className="text-xs uppercase text-slate-400 font-bold mb-2">自定义语义角色</div>
                                        <input
                                            type="text"
                                            value={manualSemanticRole}
                                            onChange={(e) => setManualSemanticRole(e.target.value)}
                                            className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                                            placeholder="例如：支付行为、状态对象等"
                                        />
                                        <div className="text-xs text-slate-400 mt-1">
                                            请填写合适的语义角色名称
                                        </div>
                                    </div>
                                )}
                                
                                {/* 决策说明 */}
                                <div>
                                    <div className="text-xs uppercase text-slate-400 font-bold mb-2">决策说明（可选）</div>
                                    <textarea
                                        value={decisionNote}
                                        onChange={(e) => setDecisionNote(e.target.value)}
                                        className="w-full p-3 border border-slate-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-400"
                                        rows={3}
                                        placeholder="填写决策依据、备注信息等..."
                                    ></textarea>
                                </div>
                                
                                {/* 确认按钮 */}
                                <button 
                                    onClick={handleConfirmDecision}
                                    disabled={!selectedDecision || (selectedDecision === 'manual' && !manualSemanticRole.trim())}
                                    className={`w-full py-2.5 text-white text-sm font-medium rounded-lg transition-all ${
                                        selectedDecision && (selectedDecision !== 'manual' || manualSemanticRole.trim())
                                            ? 'bg-emerald-600 hover:bg-emerald-700 shadow-sm hover:shadow'
                                            : 'bg-slate-300 cursor-not-allowed'
                                    }`}
                                >
                                    确认决策
                                </button>
                                
                                {/* 生成业务对象按钮 - 冲突解决后显示 */}
                                {onGenerateBusinessObject && decisionHistory[`${currentConflict.tableId}_${currentConflict.field}`] && (
                                    <div className="pt-4 border-t border-slate-200">
                                        <button
                                            onClick={() => {
                                                const result = results.find((r: any) => r.id === currentConflict.tableId);
                                                if (result) onGenerateBusinessObject(result);
                                            }}
                                            className="w-full py-2.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 shadow-sm hover:shadow flex items-center justify-center gap-2"
                                        >
                                            <Box size={16} /> 生成业务对象
                                        </button>
                                        <p className="text-xs text-slate-500 text-center mt-2">冲突已解决，可以生成业务对象</p>
                                    </div>
                                )}
                                
                                {/* 已决策历史（如果有） */}
                                {decisionHistory[`${currentConflict.tableId}_${currentConflict.field}`] && (
                                    <div className="pt-4 border-t border-slate-200">
                                        <div className="text-xs uppercase text-slate-400 font-bold mb-2">决策历史</div>
                                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                            <div className="text-xs text-green-700">
                                                <div className="font-medium mb-1">已决策: {decisionHistory[`${currentConflict.tableId}_${currentConflict.field}`].finalRole}</div>
                                                <div className="text-slate-600">
                                                    方案: {
                                                        decisionHistory[`${currentConflict.tableId}_${currentConflict.field}`].decision === 'rule' ? '采用规则' :
                                                        decisionHistory[`${currentConflict.tableId}_${currentConflict.field}`].decision === 'ai' ? '采用AI' : '手动指定'
                                                    }
                                                </div>
                                                {decisionHistory[`${currentConflict.tableId}_${currentConflict.field}`].note && (
                                                    <div className="text-slate-600 mt-1">
                                                        说明: {decisionHistory[`${currentConflict.tableId}_${currentConflict.field}`].note}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                                请选择冲突项进行决策
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
