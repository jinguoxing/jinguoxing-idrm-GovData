// ==========================================
// Conflict Detection View (SG-02)
// ==========================================
// Location: tt5.tsx:7733-7822

import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { ModuleType } from '../../types';

interface ConflictDetectionViewProps {
    setActiveModule: (module: ModuleType) => void;
}

interface Conflict {
    id: string;
    severity: 'High' | 'Medium' | 'Low';
    type: string;
    title: string;
    desc: string;
    objectName: string;
    assetName: string;
    detectedAt: string;
    status: 'Open' | 'Resolved' | 'Ignored';
}

export const ConflictDetectionView: React.FC<ConflictDetectionViewProps> = ({ setActiveModule }) => {
    const mockConflicts: Conflict[] = [
        {
            id: 'CF_001',
            severity: 'High',
            type: 'Mapping Missing',
            title: "属性 '血型' 缺失映射",
            desc: "业务对象 '新生儿' 定义了必填属性 '血型'，但在绑定的物理表 't_pop_base_info' 中未找到对应的映射字段。",
            objectName: '新生儿 (Newborn)',
            assetName: 't_pop_base_info',
            detectedAt: '2024-05-20 10:05',
            status: 'Open'
        },
        {
            id: 'CF_002',
            severity: 'Medium',
            type: 'Type Mismatch',
            title: "属性 '出生体重' 类型不兼容",
            desc: "业务定义为 'Decimal(4,2)'，物理字段 'weight_kg' 为 'String'。可能导致数值计算错误。",
            objectName: '新生儿 (Newborn)',
            assetName: 't_pop_base_info',
            detectedAt: '2024-05-19 16:30',
            status: 'Open'
        },
        {
            id: 'CF_003',
            severity: 'Low',
            type: 'Schema Drift',
            title: "物理表新增字段未映射",
            desc: "物理表 't_pop_base_info' 新增了字段 'is_twins' (是否双胞胎)，建议补充到业务对象定义中。",
            objectName: '新生儿 (Newborn)',
            assetName: 't_pop_base_info',
            detectedAt: '2024-05-21 09:00',
            status: 'Open'
        }
    ];

    const [conflicts, setConflicts] = useState<Conflict[]>(mockConflicts);

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">冲突检测与治理</h2>
                    <p className="text-slate-500 mt-1">自动检测业务对象与物理表之间的映射冲突</p>
                </div>
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 flex items-center gap-2 hover:bg-slate-50">
                    <RefreshCw size={16} /> 重新检测
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-slate-800">检测结果</h3>
                </div>
                {conflicts.map((conflict) => (
                    <div key={conflict.id} className="p-6 border-b border-slate-100 flex justify-between items-start hover:bg-slate-50">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-xs font-bold border px-2 py-0.5 rounded ${
                                    conflict.severity === 'High' ? 'text-red-600 border-red-200 bg-red-50' :
                                    conflict.severity === 'Medium' ? 'text-orange-600 border-orange-200 bg-orange-50' :
                                    'text-slate-600 border-slate-200 bg-slate-50'
                                }`}>
                                    {conflict.severity}
                                </span>
                                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                    {conflict.type}
                                </span>
                                <h4 className="font-bold text-sm text-slate-800">{conflict.title}</h4>
                            </div>
                            <p className="text-sm text-slate-600 mb-3">{conflict.desc}</p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span>对象: <strong>{conflict.objectName}</strong></span>
                                <span>资产: <strong>{conflict.assetName}</strong></span>
                                <span>检测时间: {conflict.detectedAt}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setActiveModule('mapping')}
                            className="text-purple-600 text-sm font-bold hover:underline ml-4"
                        >
                            去修复
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ConflictDetectionView;
