// ==========================================
// Data Source Management View (BU-01)
// ==========================================
// Location: tt5.tsx:9316-9497

import React, { useState } from 'react';
import { Plus, Zap, Edit, Trash2 } from 'lucide-react';
import { ModuleType } from '../../types';

interface DataSourceManagementViewProps {
    // No props required for this view
}

interface DataSource {
    id: string;
    name: string;
    type: string;
    host: string;
    port: number;
    dbName: string;
    status: 'connected' | 'scanning' | 'error';
    lastScan: string;
    tableCount: number;
    desc: string;
}

export const DataSourceManagementView: React.FC<DataSourceManagementViewProps> = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDS, setNewDS] = useState({ name: '', type: 'MySQL', host: '', port: '', dbName: '' });

    // 模拟数据源
    const mockDataSources: DataSource[] = [
        {
            id: 'DS_001',
            name: '卫健委_前置库_01',
            type: 'MySQL',
            host: '192.168.10.55',
            port: 3306,
            dbName: 'hosp_pre_db',
            status: 'connected',
            lastScan: '2024-05-20 14:00',
            tableCount: 142,
            desc: '医院端数据同步前置库'
        },
        {
            id: 'DS_002',
            name: '市人口库_主库',
            type: 'Oracle',
            host: '10.2.5.101',
            port: 1521,
            dbName: 'orcl_pop_master',
            status: 'scanning',
            lastScan: 'Scanning...',
            tableCount: 89,
            desc: '全市全员人口基础信息库'
        }
    ];

    const [dataSources, setDataSources] = useState<DataSource[]>(mockDataSources);

    const handleCreate = () => {
        if (!newDS.name) return;
        const portNum = parseInt(newDS.port) || 3306;
        setDataSources([...dataSources, {
            id: `DS_${Date.now()}`,
            ...newDS,
            port: portNum,
            status: 'connected',
            lastScan: 'Never',
            tableCount: 0,
            desc: '新建数据源'
        }]);
        setIsModalOpen(false);
        setNewDS({ name: '', type: 'MySQL', host: '', port: '', dbName: '' });
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">数据源管理</h2>
                    <p className="text-slate-500 mt-1">连接和管理各种数据库系统</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus size={16} /> 新建连接
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dataSources.map((ds) => (
                    <div key={ds.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-xs">
                                {ds.type.substring(0, 2)}
                            </div>
                            <div>
                                <div className="font-bold text-slate-800">{ds.name}</div>
                                <div className={`text-xs flex items-center gap-1 ${
                                    ds.status === 'connected' ? 'text-emerald-600' :
                                    ds.status === 'scanning' ? 'text-orange-600' : 'text-red-600'
                                }`}>
                                    <span className={`w-2 h-2 rounded-full ${
                                        ds.status === 'connected' ? 'bg-emerald-500' :
                                        ds.status === 'scanning' ? 'bg-orange-500' : 'bg-red-500'
                                    }`}></span>
                                    {ds.status}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm text-slate-500">
                            <div className="flex justify-between">
                                <span>Host:</span>
                                <span className="font-mono">{ds.host}:{ds.port}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tables:</span>
                                <span className="font-bold">{ds.tableCount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Last Scan:</span>
                                <span className="text-xs">{ds.lastScan}</span>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t flex justify-between items-center">
                            <button className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded">
                                <Zap size={12} /> 测试连接
                            </button>
                            <div className="flex gap-3">
                                <button className="text-slate-400 hover:text-slate-600">
                                    <Edit size={14} />
                                </button>
                                <button className="text-slate-400 hover:text-red-600">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 新建连接模态框 */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4">
                        <h3 className="font-bold text-lg">新建数据源连接</h3>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="连接名称"
                                value={newDS.name}
                                className="w-full border border-slate-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={e => setNewDS({ ...newDS, name: e.target.value })}
                            />
                            <select
                                value={newDS.type}
                                onChange={e => setNewDS({ ...newDS, type: e.target.value })}
                                className="w-full border border-slate-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="MySQL">MySQL</option>
                                <option value="Oracle">Oracle</option>
                                <option value="PostgreSQL">PostgreSQL</option>
                                <option value="SQL Server">SQL Server</option>
                            </select>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Host"
                                    value={newDS.host}
                                    className="w-full border border-slate-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onChange={e => setNewDS({ ...newDS, host: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Port"
                                    value={newDS.port}
                                    className="w-full border border-slate-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onChange={e => setNewDS({ ...newDS, port: e.target.value })}
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="数据库名"
                                value={newDS.dbName}
                                className="w-full border border-slate-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={e => setNewDS({ ...newDS, dbName: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleCreate}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                保存
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataSourceManagementView;
