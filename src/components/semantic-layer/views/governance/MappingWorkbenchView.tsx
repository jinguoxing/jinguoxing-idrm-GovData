// ==========================================
// Mapping Workbench View (SG-01)
// ==========================================
// Location: tt5.tsx:2680-2790

import React, { useState } from 'react';
import { Box, GitMerge, Database, Plus, Link } from 'lucide-react';
import { BusinessObject } from '../../types';

interface MappingWorkbenchViewProps {
    businessObjects: BusinessObject[];
}

interface PhysicalTableField {
    name: string;
    type: string;
    key?: string;
}

interface PhysicalTable {
    id: string;
    name: string;
    source: string;
    scannedAt: string;
    rows: string;
    fields: PhysicalTableField[];
}

interface FieldMapping {
    boField: string;
    tblField: string;
    rule: string;
}

export const MappingWorkbenchView: React.FC<MappingWorkbenchViewProps> = ({ businessObjects }) => {
    const [selectedBO, setSelectedBO] = useState<BusinessObject | undefined>(businessObjects[0]);

    // 模拟物理表数据
    const mockPhysicalTable: PhysicalTable = {
        id: 'TBL_POP_BASE',
        name: 't_pop_base_info_2024',
        source: 'HOSP_DB_01 (MySQL)',
        scannedAt: '2024-05-20 10:00:00',
        rows: '1,204,500',
        fields: [
            { name: 'id', type: 'bigint', key: 'PK' },
            { name: 'p_name', type: 'varchar(50)' },
            { name: 'id_card_num', type: 'varchar(18)' },
            { name: 'birth_ts', type: 'datetime' },
            { name: 'weight_kg', type: 'decimal(4,2)' },
            { name: 'hospital_id', type: 'int' },
            { name: 'is_deleted', type: 'tinyint' }
        ]
    };

    // 模拟映射关系
    const mockMappings: FieldMapping[] = [
        { boField: '姓名', tblField: 'p_name', rule: 'Direct Copy' },
        { boField: '身份证号', tblField: 'id_card_num', rule: 'Direct Copy' },
        { boField: '出生时间', tblField: 'birth_ts', rule: 'Format: YYYY-MM-DD HH:mm:ss' },
        { boField: '出生体重', tblField: 'weight_kg', rule: 'Direct Copy' },
    ];

    return (
        <div className="h-full flex flex-col gap-6 p-6">
            <div className="bg-white border-b p-4 rounded-xl border border-slate-200">
                <h2 className="font-bold text-slate-800 text-xl mb-2">语义映射工作台</h2>
                <p className="text-slate-500">建立业务对象与物理表之间的字段映射关系</p>
            </div>

            <div className="flex-1 bg-slate-100 p-6 flex gap-8 rounded-xl">
                {/* 左侧：业务对象 */}
                <div className="flex-1 bg-white rounded-lg border p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-blue-900 flex items-center gap-2">
                            <Box size={20} className="text-blue-600" />
                            {selectedBO?.name || '选择业务对象'}
                        </h3>
                        <select
                            value={selectedBO?.id || ''}
                            onChange={(e) => setSelectedBO(businessObjects.find((bo) => bo.id === e.target.value))}
                            className="text-sm border border-slate-200 rounded px-2 py-1"
                        >
                            {businessObjects.map((bo) => (
                                <option key={bo.id} value={bo.id}>{bo.name}</option>
                            ))}
                        </select>
                    </div>
                    {selectedBO?.fields?.map((f) => (
                        <div key={f.id} className="p-2 border mb-2 rounded flex justify-between items-center hover:bg-blue-50">
                            <div>
                                <span className="font-medium">{f.name}</span>
                                <div className="text-xs text-slate-500">{f.code} ({f.type})</div>
                            </div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                    ))}
                </div>

                {/* 中间：映射关系 */}
                <div className="w-1/3 bg-white rounded-lg border p-4 shadow-sm">
                    <h3 className="font-bold text-slate-500 mb-4 text-center flex items-center justify-center gap-2">
                        <GitMerge size={20} className="text-purple-600" />
                        映射关系
                    </h3>
                    {mockMappings.map((m, i: number) => (
                        <div key={i} className="flex justify-between items-center text-sm p-2 border-b hover:bg-slate-50">
                            <span className="text-blue-700 font-medium">{m.boField}</span>
                            <Link size={12} className="text-purple-500" />
                            <span className="text-emerald-700 font-medium">{m.tblField}</span>
                        </div>
                    ))}
                    <div className="mt-4 pt-4 border-t">
                        <button className="w-full py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 flex items-center justify-center gap-2">
                            <Plus size={14} />
                            添加映射
                        </button>
                    </div>
                </div>

                {/* 右侧：物理表 */}
                <div className="flex-1 bg-white rounded-lg border p-4 shadow-sm">
                    <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                        <Database size={20} className="text-emerald-600" />
                        {mockPhysicalTable.name}
                    </h3>
                    <div className="text-xs text-slate-500 mb-4">
                        来源: {mockPhysicalTable.source} | 行数: {mockPhysicalTable.rows}
                    </div>
                    {mockPhysicalTable.fields.map((f, i: number) => (
                        <div key={i} className="p-2 border mb-2 rounded flex justify-between items-center hover:bg-emerald-50">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            <div className="flex-1 ml-3">
                                <span className="font-medium">{f.name}</span>
                                <div className="text-xs text-slate-500">
                                    {f.type} {f.key && <span className="bg-yellow-100 text-yellow-700 px-1 rounded">{f.key}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MappingWorkbenchView;
