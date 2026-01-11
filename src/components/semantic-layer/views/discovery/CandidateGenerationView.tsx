// ==========================================
// Candidate Generation View (BU-04)
// ==========================================
// Location: tt5.tsx:2355-2677

import React, { useState } from 'react';
import { Sparkles, RefreshCw, Cpu, Sliders, AlertTriangle, ArrowRight, X, CheckCircle, BrainCircuit } from 'lucide-react';
import { BusinessObject } from '../../types';

interface CandidateGenerationViewProps {
    businessObjects: BusinessObject[];
    setBusinessObjects: React.Dispatch<React.SetStateAction<BusinessObject[]>>;
}

interface PreviewField {
    col: string;
    type: string;
    attr: string;
    conf: 'High' | 'Medium' | 'Low';
}

interface Candidate {
    id: string;
    sourceTable: string;
    suggestedName: string;
    confidence: number;
    reason: string;
    scores: {
        nameMatch: number;
        fieldMatch: number;
        dataSample: number;
    };
    mappedFields: number;
    status: 'pending' | 'accepted' | 'ignored';
    previewFields: PreviewField[];
}

export const CandidateGenerationView: React.FC<CandidateGenerationViewProps> = ({
    businessObjects,
    setBusinessObjects
}) => {
    const [viewingCandidate, setViewingCandidate] = useState<Candidate | null>(null);
    const [editName, setEditName] = useState('');
    const [nameError, setNameError] = useState('');
    const [minConfidence, setMinConfidence] = useState(50);
    const [isProcessing, setIsProcessing] = useState(false);

    // 模拟候选数据
    const mockCandidates: Candidate[] = [
        {
            id: 'AI_001',
            sourceTable: 't_med_birth_cert',
            suggestedName: '出生医学证明记录',
            confidence: 0.92,
            reason: '表名包含 "birth_cert"，字段包含 "cert_no", "issue_date"，高度匹配业务语义。',
            scores: { nameMatch: 95, fieldMatch: 88, dataSample: 92 },
            mappedFields: 4,
            status: 'pending',
            previewFields: [
                { col: 'cert_id', type: 'varchar(32)', attr: '证明编号', conf: 'High' },
                { col: 'issue_time', type: 'datetime', attr: '签发时间', conf: 'Medium' },
                { col: 'baby_name', type: 'varchar(50)', attr: '新生儿姓名', conf: 'High' },
                { col: 'hosp_code', type: 'varchar(20)', attr: '机构编码', conf: 'Low' }
            ]
        },
        {
            id: 'AI_002',
            sourceTable: 't_vac_record',
            suggestedName: '疫苗接种明细',
            confidence: 0.85,
            reason: '表名 "vac" 缩写匹配 Vaccine，数据量级较大，判定为明细事实表。',
            scores: { nameMatch: 80, fieldMatch: 90, dataSample: 82 },
            mappedFields: 3,
            status: 'pending',
            previewFields: [
                { col: 'vac_code', type: 'varchar(20)', attr: '疫苗编码', conf: 'High' },
                { col: 'inject_date', type: 'datetime', attr: '接种时间', conf: 'High' },
                { col: 'dose_no', type: 'int', attr: '剂次', conf: 'High' }
            ]
        },
        {
            id: 'AI_003',
            sourceTable: 't_newborn_archive_2023',
            suggestedName: '新生儿归档',
            confidence: 0.78,
            reason: '历史归档表，结构与主表一致。建议作为历史分区或独立快照对象。',
            scores: { nameMatch: 70, fieldMatch: 95, dataSample: 60 },
            mappedFields: 5,
            status: 'pending',
            previewFields: []
        }
    ];

    const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);

    const checkNameConflict = (name: string) => businessObjects.some((bo) => bo.name === name);

    const openCandidateDetail = (candidate: Candidate) => {
        setViewingCandidate(candidate);
        setEditName(candidate.suggestedName);
        setNameError(checkNameConflict(candidate.suggestedName) ? '名称已存在，请修改' : '');
    };

    const handleNameChange = (newName: string) => {
        setEditName(newName);
        setNameError(checkNameConflict(newName) ? '名称已存在' : '');
    };

    const handleConfirmAccept = () => {
        if (!viewingCandidate || nameError) return;
        const newBO: BusinessObject = {
            id: `BO_${Date.now()}`,
            name: editName,
            code: `biz_${viewingCandidate.sourceTable.replace('t_', '')}`,
            domain: 'AI生成',
            owner: '待认领',
            status: 'draft',
            version: 'v0.1',
            description: 'AI生成的业务对象',
            sourceTables: [viewingCandidate.sourceTable],
            fields: viewingCandidate.previewFields.map((f, i: number) => ({
                id: `f_${i}`,
                name: f.attr,
                code: f.col,
                type: 'String',
                length: '-',
                required: false,
                desc: 'AI 自动映射'
            }))
        };
        setBusinessObjects([...businessObjects, newBO]);
        setCandidates(candidates.filter((c) => c.id !== viewingCandidate.id));
        setViewingCandidate(null);
        alert(`成功创建业务对象：${newBO.name}`);
    };

    const handleReject = (id: string) => {
        setCandidates(candidates.filter((c) => c.id !== id));
        setViewingCandidate(null);
    };

    const handleRunAI = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            alert('AI 分析完成，发现 2 个新候选！');
        }, 1500);
    };

    const filteredCandidates = candidates.filter((c) => (c.confidence * 100) >= minConfidence);

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Sparkles className="text-purple-500" /> 智能候选生成
                    </h2>
                    <p className="text-slate-500 mt-1">AI驱动的业务对象推荐与语义分析</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleRunAI}
                        disabled={isProcessing}
                        className={`flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm shadow-purple-200 ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isProcessing ? <RefreshCw size={16} className="animate-spin" /> : <Cpu size={16} />}
                        {isProcessing ? 'AI 分析中...' : '运行 AI 识别'}
                    </button>
                </div>
            </div>

            {/* 置信度过滤器 */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                        <Sliders size={16} />
                        置信度过滤:
                    </span>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={minConfidence}
                        onChange={(e) => setMinConfidence(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <span className="text-sm font-bold text-purple-700 min-w-[3rem] text-right">{minConfidence}%</span>
                </div>
                <div className="text-xs text-slate-400">
                    显示 {filteredCandidates.length} / {candidates.length} 个候选
                </div>
            </div>

            {/* 候选列表 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCandidates.map((candidate) => {
                    const isConflict = checkNameConflict(candidate.suggestedName);
                    return (
                        <div key={candidate.id} className={`bg-white p-5 rounded-xl border shadow-sm ${isConflict ? 'border-orange-300' : 'border-purple-100'}`}>
                            <div className="flex justify-between mb-2">
                                <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-bold">
                                    {candidate.sourceTable}
                                </span>
                                <span className="text-emerald-600 font-bold text-xs">
                                    {Math.round(candidate.confidence * 100)}%
                                </span>
                            </div>
                            <h3 className="font-bold text-lg mb-2 truncate" title={candidate.suggestedName}>
                                {candidate.suggestedName}
                            </h3>
                            {isConflict && (
                                <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded mb-2 flex items-center gap-1">
                                    <AlertTriangle size={12} /> 名称冲突，需人工介入
                                </div>
                            )}
                            <p className="text-xs text-slate-500 mb-4 h-10 overflow-hidden">
                                {candidate.reason}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openCandidateDetail(candidate)}
                                    className="flex-1 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50"
                                >
                                    审核
                                </button>
                                {!isConflict && (
                                    <button
                                        onClick={() => {
                                            setViewingCandidate(candidate);
                                            setEditName(candidate.suggestedName);
                                            handleConfirmAccept();
                                        }}
                                        className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                                    >
                                        采纳
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 候选详情模态框 */}
            {viewingCandidate && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-3xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800">候选详情审核</h3>
                            <button onClick={() => setViewingCandidate(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 flex gap-6">
                            <div className="flex-1 space-y-6">
                                <div className="flex gap-4 items-end">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">物理源表</label>
                                        <div className="p-2 bg-slate-50 border rounded text-sm font-mono text-slate-600">
                                            {viewingCandidate.sourceTable}
                                        </div>
                                    </div>
                                    <ArrowRight className="mb-2 text-purple-300" />
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-purple-600 uppercase mb-1">建议业务对象名称</label>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => handleNameChange(e.target.value)}
                                            className={`w-full border p-2 rounded text-sm font-bold text-slate-800 ${nameError ? 'border-red-500 bg-red-50' : 'border-purple-300'}`}
                                        />
                                        {nameError && <div className="text-red-500 text-xs mt-1">{nameError}</div>}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-sm text-slate-700 mb-2">字段映射预览</h4>
                                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 text-slate-500 font-medium text-xs uppercase">
                                                <tr>
                                                    <th className="px-3 py-2">物理字段</th>
                                                    <th className="px-3 py-2">推测属性</th>
                                                    <th className="px-3 py-2">置信度</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {viewingCandidate.previewFields.map((f, i: number) => (
                                                    <tr key={i}>
                                                        <td className="px-3 py-2 font-mono text-slate-600">{f.col}</td>
                                                        <td className="px-3 py-2 font-medium">{f.attr}</td>
                                                        <td className="px-3 py-2 text-xs">
                                                            <span className={`px-2 py-0.5 rounded ${
                                                                f.conf === 'High' ? 'bg-emerald-100 text-emerald-700' :
                                                                f.conf === 'Medium' ? 'bg-orange-100 text-orange-700' :
                                                                'bg-slate-100 text-slate-600'
                                                            }`}>
                                                                {f.conf}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className="w-64 bg-slate-50 p-4 rounded-lg border border-slate-200 h-fit">
                                <h4 className="font-bold text-sm text-slate-700 mb-4 flex items-center gap-2">
                                    <BrainCircuit size={16} className="text-purple-500" /> AI 置信度分析
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-slate-500">综合置信度</span>
                                            <span className="font-bold text-emerald-600">
                                                {Math.round(viewingCandidate.confidence * 100)}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div
                                                style={{ width: `${viewingCandidate.confidence * 100}%` }}
                                                className="h-full bg-emerald-500"
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-3 rounded border border-slate-200 text-xs text-slate-500 leading-relaxed">
                                        <strong>AI 建议：</strong><br />
                                        {viewingCandidate.reason}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                            <button
                                onClick={() => handleReject(viewingCandidate.id)}
                                className="text-red-600 text-sm hover:underline"
                            >
                                拒绝并忽略
                            </button>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setViewingCandidate(null)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleConfirmAccept}
                                    disabled={!!nameError}
                                    className={`px-4 py-2 text-white rounded flex items-center gap-2 ${nameError ? 'bg-purple-300' : 'bg-purple-600 hover:bg-purple-700'}`}
                                >
                                    <CheckCircle size={16} /> 确认创建
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CandidateGenerationView;
