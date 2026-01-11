// ==========================================
// API Gateway View (EE-05)
// ==========================================
// Location: tt5.tsx:8652-8975

import React, { useState } from 'react';
import { Server, Plus, CheckCircle, Activity, Timer, AlertTriangle, Settings, X } from 'lucide-react';

interface ApiService {
    id: string;
    name: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    objectName: string;
    status: 'Online' | 'Offline' | 'Maintenance';
    qps: number;
    latency: string;
    errorRate: string;
    version: string;
    description: string;
    auth: string;
    rateLimit: string;
    lastDeploy: string;
}

export const ApiGatewayView: React.FC = () => {
    const [selectedApi, setSelectedApi] = useState<ApiService | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 模拟API服务数据
    const mockApiServices: ApiService[] = [
        {
            id: 'API_001',
            name: '查询新生儿详情',
            method: 'GET',
            path: '/api/v1/newborn/{id}',
            objectName: '新生儿 (Newborn)',
            status: 'Online',
            qps: 120,
            latency: '45ms',
            errorRate: '0.02%',
            version: 'v1.2',
            description: '根据新生儿ID查询详细信息',
            auth: 'Bearer Token',
            rateLimit: '1000/hour',
            lastDeploy: '2024-05-20 14:30'
        },
        {
            id: 'API_002',
            name: '创建出生证明申领',
            method: 'POST',
            path: '/api/v1/birth-cert/apply',
            objectName: '出生医学证明',
            status: 'Online',
            qps: 45,
            latency: '120ms',
            errorRate: '0.15%',
            version: 'v1.0',
            description: '提交出生医学证明申领请求',
            auth: 'API Key',
            rateLimit: '100/hour',
            lastDeploy: '2024-05-18 09:15'
        },
        {
            id: 'API_003',
            name: '人口基础信息同步',
            method: 'POST',
            path: '/api/v1/sync/population',
            objectName: '新生儿 (Newborn)',
            status: 'Offline',
            qps: 0,
            latency: '-',
            errorRate: '-',
            version: 'v0.9',
            description: '批量同步人口基础信息数据',
            auth: 'OAuth 2.0',
            rateLimit: '50/hour',
            lastDeploy: '2024-05-15 16:45'
        },
        {
            id: 'API_004',
            name: '疫苗接种记录查询',
            method: 'GET',
            path: '/api/v1/vaccination/{childId}',
            objectName: '疫苗接种记录',
            status: 'Online',
            qps: 78,
            latency: '65ms',
            errorRate: '0.08%',
            version: 'v1.1',
            description: '查询儿童疫苗接种历史记录',
            auth: 'Bearer Token',
            rateLimit: '500/hour',
            lastDeploy: '2024-05-19 11:20'
        }
    ];

    const [apis, setApis] = useState<ApiService[]>(mockApiServices);

    const getMethodColor = (method: string) => {
        switch (method) {
            case 'GET': return 'bg-blue-100 text-blue-700';
            case 'POST': return 'bg-emerald-100 text-emerald-700';
            case 'PUT': return 'bg-orange-100 text-orange-700';
            case 'DELETE': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Online': return 'bg-emerald-100 text-emerald-700';
            case 'Offline': return 'bg-red-100 text-red-700';
            case 'Maintenance': return 'bg-orange-100 text-orange-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Server className="text-orange-500" /> API 服务网关
                    </h2>
                    <p className="text-slate-500 mt-1">统一API服务管理和监控平台</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm shadow-blue-200"
                >
                    <Plus size={16} /> 发布服务
                </button>
            </div>

            {/* 统计概览 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">在线服务</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">
                                {apis.filter(api => api.status === 'Online').length}
                            </h3>
                        </div>
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border-emerald-200">
                            <CheckCircle size={20} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">总QPS</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">
                                {apis.reduce((sum, api) => sum + api.qps, 0)}
                            </h3>
                        </div>
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border-blue-200">
                            <Activity size={20} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">平均延迟</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">67ms</h3>
                        </div>
                        <div className="p-2 rounded-lg bg-purple-50 text-purple-600 border-purple-200">
                            <Timer size={20} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">错误率</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">0.08%</h3>
                        </div>
                        <div className="p-2 rounded-lg bg-orange-50 text-orange-600 border-orange-200">
                            <AlertTriangle size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* API列表 */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-slate-800">API 服务列表</h3>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-3">服务名称</th>
                            <th className="px-6 py-3">Method</th>
                            <th className="px-6 py-3">路径</th>
                            <th className="px-6 py-3">状态</th>
                            <th className="px-6 py-3">QPS</th>
                            <th className="px-6 py-3">延迟</th>
                            <th className="px-6 py-3">错误率</th>
                            <th className="px-6 py-3 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {apis.map(api => (
                            <tr key={api.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                    <div>
                                        <div className="font-bold text-slate-800">{api.name}</div>
                                        <div className="text-xs text-slate-500">{api.version}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${getMethodColor(api.method)}`}>
                                        {api.method}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-mono text-slate-600">{api.path}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(api.status)}`}>
                                        {api.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-mono">{api.qps}</td>
                                <td className="px-6 py-4 font-mono">{api.latency}</td>
                                <td className="px-6 py-4 font-mono">{api.errorRate}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setSelectedApi(api)}
                                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                                        >
                                            详情
                                        </button>
                                        <button className="text-slate-400 hover:text-slate-600">
                                            <Settings size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* API详情模态框 */}
            {selectedApi && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div className="flex items-center gap-3">
                                <Server size={20} className="text-orange-600" />
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">{selectedApi.name}</h3>
                                    <p className="text-sm text-slate-500">{selectedApi.description}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedApi(null)}
                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-bold text-sm text-slate-700 mb-3">基本信息</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Method:</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${getMethodColor(selectedApi.method)}`}>
                                                {selectedApi.method}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Path:</span>
                                            <span className="font-mono text-slate-700">{selectedApi.path}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Version:</span>
                                            <span className="text-slate-700">{selectedApi.version}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Auth:</span>
                                            <span className="text-slate-700">{selectedApi.auth}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-slate-700 mb-3">运行状态</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Status:</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(selectedApi.status)}`}>
                                                {selectedApi.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">QPS:</span>
                                            <span className="font-mono text-slate-700">{selectedApi.qps}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Latency:</span>
                                            <span className="font-mono text-slate-700">{selectedApi.latency}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Error Rate:</span>
                                            <span className="font-mono text-slate-700">{selectedApi.errorRate}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-sm text-slate-700 mb-3">配置信息</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-500">Rate Limit:</span>
                                        <span className="ml-2 text-slate-700">{selectedApi.rateLimit}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Last Deploy:</span>
                                        <span className="ml-2 text-slate-700">{selectedApi.lastDeploy}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedApi(null)}
                                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
                            >
                                关闭
                            </button>
                            <button className="px-4 py-2 text-sm text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors">
                                编辑配置
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApiGatewayView;
