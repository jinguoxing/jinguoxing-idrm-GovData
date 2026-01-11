// ==========================================
// Asset Scanning View (BU-02)
// ==========================================
// Location: tt5.tsx:9500-9666

import React, { useState } from 'react';
import { Scan, Sparkles, X, Table } from 'lucide-react';
import { ModuleType } from '../../types';

interface AssetScanningViewProps {
    setActiveModule: (module: ModuleType) => void;
}

interface ScanAssetColumn {
    name: string;
    type: string;
    comment: string;
}

interface ScanAsset {
    id: string;
    name: string;
    comment: string;
    rows: string;
    updateTime: string;
    status: 'normal' | 'new' | 'changed';
    columns: ScanAssetColumn[];
}

export const AssetScanningView: React.FC<AssetScanningViewProps> = ({ setActiveModule }) => {
    const [selectedTables, setSelectedTables] = useState<string[]>([]);
    const [viewingTable, setViewingTable] = useState<ScanAsset | null>(null);

    // 模拟数据
    const mockScanAssets: ScanAsset[] = [
        {
            id: 'TBL_001',
            name: 't_pop_base_info',
            comment: '人口基础信息表',
            rows: '1.2M',
            updateTime: '2024-05-20 10:00',
            status: 'normal',
            columns: [
                { name: 'id', type: 'bigint', comment: '主键' },
                { name: 'name', type: 'varchar(50)', comment: '姓名' },
                { name: 'id_card', type: 'varchar(18)', comment: '身份证号' },
                { name: 'dob', type: 'datetime', comment: '出生日期' }
            ]
        },
        {
            id: 'TBL_002',
            name: 't_med_birth_cert',
            comment: '出生证明记录',
            rows: '450K',
            updateTime: '2024-05-19 15:30',
            status: 'new',
            columns: [
                { name: 'cert_id', type: 'varchar(32)', comment: '证明编号' },
                { name: 'baby_name', type: 'varchar(50)', comment: '新生儿姓名' },
                { name: 'issue_date', type: 'datetime', comment: '签发日期' }
            ]
        }
    ];

    const handleGenerateCandidates = () => {
        if (selectedTables.length === 0) {
            alert("请先选择至少一个物理表进行分析。");
            return;
        }
        alert(`正在对 ${selectedTables.length} 个表进行 AI 语义分析...`);
        setActiveModule('bu_candidates');
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">资产扫描中心</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
                    <Scan size={16} /> 开始扫描
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">扫描结果</h3>
                    {selectedTables.length > 0 && (
                        <button
                            onClick={handleGenerateCandidates}
                            className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded flex items-center gap-1 animate-pulse"
                        >
                            <Sparkles size={12} /> 为 {selectedTables.length} 个表生成候选
                        </button>
                    )}
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="px-6 py-3 w-10">
                                <input type="checkbox" />
                            </th>
                            <th className="px-6 py-3">物理表名</th>
                            <th className="px-6 py-3">中文注释</th>
                            <th className="px-6 py-3">数据量</th>
                            <th className="px-6 py-3">扫描状态</th>
                            <th className="px-6 py-3 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockScanAssets.map((asset) => (
                            <tr key={asset.id} className="border-b hover:bg-slate-50">
                                <td className="px-6 py-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedTables.includes(asset.name)}
                                        onChange={() => {
                                            setSelectedTables(prev =>
                                                prev.includes(asset.name)
                                                    ? prev.filter(n => n !== asset.name)
                                                    : [...prev, asset.name]
                                            );
                                        }}
                                    />
                                </td>
                                <td className="px-6 py-4 font-mono font-medium text-slate-700">{asset.name}</td>
                                <td className="px-6 py-4 text-slate-600">{asset.comment}</td>
                                <td className="px-6 py-4 text-slate-500 font-mono">{asset.rows}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded text-xs ${
                                        asset.status === 'new' ? 'bg-blue-100 text-blue-700' :
                                        asset.status === 'changed' ? 'bg-orange-100 text-orange-700' :
                                        'text-slate-500'
                                    }`}>
                                        {asset.status === 'new' ? 'New' : asset.status === 'changed' ? 'Changed' : 'Synced'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                                        onClick={() => setViewingTable(asset)}
                                    >
                                        详情
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Table Details Modal */}
            {viewingTable && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end">
                    <div className="w-[500px] h-full bg-white shadow-2xl animate-slide-in-right flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 mb-1">{viewingTable.name}</h3>
                                <p className="text-sm text-slate-500">{viewingTable.comment}</p>
                            </div>
                            <button onClick={() => setViewingTable(null)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div>
                                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                    <Table size={16} /> 字段结构
                                </h4>
                                <div className="border border-slate-200 rounded-lg overflow-hidden">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-slate-50 text-slate-500">
                                            <tr>
                                                <th className="px-3 py-2">字段名</th>
                                                <th className="px-3 py-2">类型</th>
                                                <th className="px-3 py-2">注释</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {viewingTable.columns?.map((col, i: number) => (
                                                <tr key={i}>
                                                    <td className="px-3 py-2 font-mono text-slate-700">{col.name}</td>
                                                    <td className="px-3 py-2 text-slate-500">{col.type}</td>
                                                    <td className="px-3 py-2 text-slate-600">{col.comment}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssetScanningView;
