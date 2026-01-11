// ==========================================
// Cache Strategy View (EE-06)
// ==========================================
// Location: tt5.tsx:8978-9313

import React, { useState } from 'react';
import { RefreshCw, Plus, Database, Settings, X } from 'lucide-react';

interface CachePolicy {
    id: string;
    name: string;
    target: string;
    type: string;
    ttl: string;
    eviction: string;
    status: 'Active' | 'Inactive';
    hitRate: string;
    size: string;
    keys: number;
    description: string;
}

interface CacheKey {
    key: string;
    size: string;
    created: string;
    expires: string;
    hits: number;
}

export const CacheStrategyView: React.FC = () => {
    const [selectedPolicy, setSelectedPolicy] = useState<CachePolicy | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 模拟缓存策略数据
    const mockCachePolicies: CachePolicy[] = [
        {
            id: 'CP_001',
            name: '高频代码表缓存',
            target: 'Dictionaries',
            type: 'Local',
            ttl: '24h',
            eviction: 'LFU',
            status: 'Active',
            hitRate: '98.5%',
            size: '2.4MB',
            keys: 1250,
            description: '字典表和代码表的本地缓存策略'
        },
        {
            id: 'CP_002',
            name: '新生儿实时查询',
            target: 'Newborn (Single)',
            type: 'Redis',
            ttl: '5m',
            eviction: 'LRU',
            status: 'Active',
            hitRate: '85.2%',
            size: '156MB',
            keys: 45600,
            description: '新生儿单条记录查询的Redis缓存'
        },
        {
            id: 'CP_003',
            name: '统计报表预计算',
            target: 'Reports',
            type: 'Redis Cluster',
            ttl: '1h',
            eviction: 'FIFO',
            status: 'Inactive',
            hitRate: '0%',
            size: '0MB',
            keys: 0,
            description: '报表数据的预计算缓存策略'
        }
    ];

    const mockCacheKeys: CacheKey[] = [
        { key: 'bo:newborn:nb_123456', size: '2.4KB', created: '10:00:05', expires: '10:05:05', hits: 145 },
        { key: 'dict:hosp_level', size: '15KB', created: '08:00:00', expires: 'Tomorrow', hits: 5200 },
        { key: 'api:query:birth_cert:list', size: '450KB', created: '10:02:30', expires: '10:03:30', hits: 12 },
    ];

    const [policies, setPolicies] = useState<CachePolicy[]>(mockCachePolicies);

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <RefreshCw className="text-orange-500" /> 缓存策略配置
                    </h2>
                    <p className="text-slate-500 mt-1">管理和监控多级缓存策略</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm shadow-blue-200"
                >
                    <Plus size={16} /> 新建策略
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 左侧：策略列表 */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-slate-800">缓存策略列表</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {policies.map((policy) => (
                            <div
                                key={policy.id}
                                onClick={() => setSelectedPolicy(policy)}
                                className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${selectedPolicy?.id === policy.id ? 'bg-blue-50' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-slate-800">{policy.name}</h4>
                                        <p className="text-xs text-slate-500">{policy.description}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        policy.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        {policy.status}
                                    </span>
                                </div>
                                <div className="grid grid-cols-4 gap-4 text-xs">
                                    <div>
                                        <span className="text-slate-500">类型:</span>
                                        <span className="ml-1 text-slate-700">{policy.type}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">TTL:</span>
                                        <span className="ml-1 text-slate-700">{policy.ttl}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">淘汰:</span>
                                        <span className="ml-1 text-slate-700">{policy.eviction}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">命中率:</span>
                                        <span className="ml-1 font-bold text-emerald-600">{policy.hitRate}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 右侧：策略详情 */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                    {selectedPolicy ? (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg text-slate-800">{selectedPolicy.name}</h3>
                                <button className="text-slate-400 hover:text-slate-600">
                                    <Settings size={18} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-500">目标对象:</span>
                                        <div className="font-medium text-slate-800 mt-1">{selectedPolicy.target}</div>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">缓存类型:</span>
                                        <div className="font-medium text-slate-800 mt-1">{selectedPolicy.type}</div>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">TTL:</span>
                                        <div className="font-medium text-slate-800 mt-1">{selectedPolicy.ttl}</div>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">淘汰策略:</span>
                                        <div className="font-medium text-slate-800 mt-1">{selectedPolicy.eviction}</div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <span className="text-slate-500 text-sm">缓存状态:</span>
                                    <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                                        <div>
                                            <span className="text-slate-500">大小:</span>
                                            <span className="ml-2 font-medium">{selectedPolicy.size}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">Keys:</span>
                                            <span className="ml-2 font-medium">{selectedPolicy.keys.toLocaleString()}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">命中率:</span>
                                            <span className="ml-2 font-bold text-emerald-600">{selectedPolicy.hitRate}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 py-12">
                            <Database size={48} className="mb-4" />
                            <p>选择一个策略查看详情</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 当前缓存Keys */}
            {selectedPolicy && selectedPolicy.status === 'Active' && (
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-slate-800">当前缓存 Keys (Top 3)</h3>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3">Cache Key</th>
                                <th className="px-6 py-3">Size</th>
                                <th className="px-6 py-3">Created</th>
                                <th className="px-6 py-3">Expires</th>
                                <th className="px-6 py-3">Hits</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {mockCacheKeys.map((cacheKey, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono text-slate-600">{cacheKey.key}</td>
                                    <td className="px-6 py-4">{cacheKey.size}</td>
                                    <td className="px-6 py-4">{cacheKey.created}</td>
                                    <td className="px-6 py-4">{cacheKey.expires}</td>
                                    <td className="px-6 py-4 font-bold text-emerald-600">{cacheKey.hits}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CacheStrategyView;
