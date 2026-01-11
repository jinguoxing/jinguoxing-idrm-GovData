// ==========================================
// Business Modeling View (TD-03)
// ==========================================
// Location: tt5.tsx:2137-2352

import React, { useState, useEffect } from 'react';
import { Plus, Share2, Save, CheckCircle, Edit, Trash2, Box } from 'lucide-react';
import { BusinessObject } from '../../types';

interface BusinessModelingViewProps {
    businessObjects: BusinessObject[];
    setBusinessObjects: React.Dispatch<React.SetStateAction<BusinessObject[]>>;
}

export const BusinessModelingView: React.FC<BusinessModelingViewProps> = ({
    businessObjects,
    setBusinessObjects
}) => {
    const [selectedId, setSelectedId] = useState<string>(businessObjects[0]?.id || '');
    const [activeTab, setActiveTab] = useState<'structure' | 'relation'>('structure');
    const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);

    const activeObject = businessObjects.find((bo) => bo.id === selectedId) || businessObjects[0];

    // 监听业务对象选择事件（用于从生成向导跳转过来时自动选中）
    useEffect(() => {
        const handleSelectBusinessObject = (e: Event) => {
            const customEvent = e as CustomEvent<{ id: string }>;
            const id = customEvent.detail?.id;
            if (id && businessObjects.find((bo) => bo.id === id)) {
                setSelectedId(id);
                setNewlyCreatedId(id);
                // 3秒后移除"新创建"标识
                setTimeout(() => setNewlyCreatedId(null), 3000);
            }
        };
        window.addEventListener('selectBusinessObject', handleSelectBusinessObject);
        return () => window.removeEventListener('selectBusinessObject', handleSelectBusinessObject);
    }, [businessObjects]);

    const handleDeleteField = (fieldId: string) => {
        if (!confirm('确定删除该属性吗？')) return;
        const updatedBO = {
            ...activeObject,
            fields: activeObject.fields.filter((f) => f.id !== fieldId)
        };
        setBusinessObjects(businessObjects.map((bo) => bo.id === activeObject.id ? updatedBO : bo));
    };

    const handleAddField = () => {
        const newField = {
            id: `f_${Date.now()}`,
            name: '新属性',
            code: 'new_field',
            type: 'String',
            length: '50',
            required: false,
            desc: '描述...'
        };
        const updatedBO = {
            ...activeObject,
            fields: [...activeObject.fields, newField]
        };
        setBusinessObjects(businessObjects.map((bo) => bo.id === activeObject.id ? updatedBO : bo));
    };

    return (
        <div className="flex h-full flex-col gap-6 p-6">
            <div className="flex h-full gap-6 overflow-hidden">
                {/* Left: List */}
                <div className="w-64 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-800">业务对象列表</h3>
                        <button className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                            <Plus size={18} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {businessObjects.map((bo) => (
                            <div
                                key={bo.id}
                                onClick={() => setSelectedId(bo.id)}
                                className={`p-3 rounded-lg cursor-pointer transition-all border ${selectedId === bo.id
                                        ? 'bg-blue-50 border-blue-200 shadow-sm'
                                        : 'hover:bg-slate-50 border-transparent hover:border-slate-100'
                                    }`}
                            >
                                {newlyCreatedId === bo.id && (
                                    <div className="mb-2">
                                        <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded animate-pulse">
                                            新创建
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`font-bold text-sm ${selectedId === bo.id ? 'text-blue-800' : 'text-slate-700'}`}>{bo.name}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${bo.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                        }`}>{bo.status === 'published' ? '已发布' : '草稿'}</span>
                                </div>
                                <div className="text-xs text-slate-400 font-mono mb-1">{bo.code}</div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                    <span className="bg-slate-100 px-1 rounded">{bo.version}</span>
                                    <span>{bo.fields?.length || 0} 属性</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Modeling Canvas */}
                <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-xl font-bold text-slate-800">{activeObject?.name || '选择对象'}</h2>
                                <span className="text-sm font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                    {activeObject?.code || ''}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 max-w-2xl">{activeObject?.description || ''}</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50">
                                <Share2 size={14} /> 关系图谱
                            </button>
                            <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 shadow-sm shadow-blue-200">
                                <Save size={14} /> 保存模型
                            </button>
                        </div>
                    </div>

                    <div className="px-6 border-b border-slate-200 flex gap-6">
                        <button
                            onClick={() => setActiveTab('structure')}
                            className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'structure' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            数据结构 (Fields)
                        </button>
                        <button
                            onClick={() => setActiveTab('relation')}
                            className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'relation' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            关系图谱 (Relations)
                        </button>
                    </div>

                    <div className="flex-1 bg-slate-50 p-6 overflow-y-auto">
                        {activeTab === 'structure' && activeObject && (
                            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                                <div className="flex justify-between items-center p-4 border-b border-slate-100">
                                    <h4 className="font-bold text-slate-700 text-sm">属性列表</h4>
                                    <button
                                        onClick={handleAddField}
                                        className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:bg-blue-50 px-2 py-1 rounded"
                                    >
                                        <Plus size={14} /> 添加属性
                                    </button>
                                </div>
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                        <tr>
                                            <th className="px-4 py-3 w-12 text-center">#</th>
                                            <th className="px-4 py-3">属性名称</th>
                                            <th className="px-4 py-3">编码 (Code)</th>
                                            <th className="px-4 py-3">数据类型</th>
                                            <th className="px-4 py-3">长度</th>
                                            <th className="px-4 py-3 text-center">必填</th>
                                            <th className="px-4 py-3">业务描述</th>
                                            <th className="px-4 py-3 text-right">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {(activeObject.fields || []).map((field, idx: number) => (
                                            <tr key={field.id} className="hover:bg-blue-50/30 group">
                                                <td className="px-4 py-3 text-center text-slate-400 text-xs">{idx + 1}</td>
                                                <td className="px-4 py-3 font-medium text-slate-700">
                                                    {field.name}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-slate-500 text-xs">{field.code}</td>
                                                <td className="px-4 py-3">
                                                    <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-xs border border-slate-200">
                                                        {field.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 text-xs">{field.length}</td>
                                                <td className="px-4 py-3 text-center">
                                                    {field.required ? (
                                                        <div className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                                                            <CheckCircle size={10} />
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-300">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 text-xs max-w-xs truncate">{field.desc}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="text-slate-400 hover:text-blue-600">
                                                            <Edit size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteField(field.id)}
                                                            className="text-slate-400 hover:text-red-600"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'relation' && (
                            <div className="flex flex-col items-center justify-center h-full bg-white border border-slate-200 rounded-lg shadow-inner p-8">
                                <div className="relative w-full max-w-2xl h-64 border border-dashed border-slate-300 rounded bg-slate-50 flex items-center justify-center">
                                    <div className="text-slate-400 text-center">
                                        <Box size={48} className="mx-auto mb-4" />
                                        <p>关系图谱编辑器</p>
                                        <p className="text-sm mt-2">拖拽对象建立关联关系</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessModelingView;
