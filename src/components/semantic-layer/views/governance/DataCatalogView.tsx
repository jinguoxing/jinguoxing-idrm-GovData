// ==========================================
// Data Catalog View (SG-04)
// ==========================================
// Location: Extracted from tt5.tsx:3069-3938

import React, { useState } from 'react';
import {
    Database, FileText, Server, BarChart3, CheckCircle, Layers, Activity,
    Box, Search, Filter, Plus, List, Eye, X, ArrowRight, Lock, Star
} from 'lucide-react';
import { BookIcon } from '../../components/common';

export const DataCatalogView: React.FC = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAsset, setSelectedAsset] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
    const [showDetailPanel, setShowDetailPanel] = useState(false);

    // 模拟数据资产中心
    const mockCatalogAssets = [
        { 
            id: 'AS_001', 
            name: '新生儿基础信息资产', 
            type: 'Data Asset', 
            code: 'asset_newborn_basic', 
            owner: '卫健委数据中心', 
            quality: 98, 
            status: 'Published', 
            tags: ['核心资产', '人口数据', '实时更新'], 
            lastUpdate: '2024-05-20',
            description: '包含新生儿基础身份信息的核心数据资产，支持多维度查询和分析。',
            category: '人口库',
            dataVolume: '1.2M条',
            updateFreq: '实时',
            accessLevel: '内部',
            format: 'JSON/XML',
            lineage: ['t_pop_base_info', '新生儿业务对象'],
            applications: ['出生一件事', '人口统计', '健康档案'],
            fields: [
                { name: '姓名', type: 'String', sensitive: false },
                { name: '身份证号', type: 'String', sensitive: true },
                { name: '出生日期', type: 'Date', sensitive: false },
                { name: '性别', type: 'Enum', sensitive: false },
                { name: '出生地', type: 'String', sensitive: false }
            ]
        },
        { 
            id: 'AS_002', 
            name: '出生医学证明资产', 
            type: 'Document Asset', 
            code: 'asset_birth_certificate', 
            owner: '医院管理处', 
            quality: 92, 
            status: 'Published', 
            tags: ['电子证照', '法定文件', '业务关键'], 
            lastUpdate: '2024-05-18',
            description: '出生医学证明电子化资产，包含证明文件和相关元数据信息。',
            category: '证照库',
            dataVolume: '450K份',
            updateFreq: '准实时',
            accessLevel: '受限',
            format: 'PDF/JSON',
            lineage: ['t_med_birth_cert', '出生证明业务对象'],
            applications: ['证照申领', '户籍登记', '医保参保'],
            fields: [
                { name: '证明编号', type: 'String', sensitive: false },
                { name: '签发机构', type: 'String', sensitive: false },
                { name: '签发日期', type: 'Date', sensitive: false },
                { name: '新生儿信息', type: 'Object', sensitive: true },
                { name: '父母信息', type: 'Object', sensitive: true }
            ]
        },
        { 
            id: 'AS_003', 
            name: '疫苗接种记录资产', 
            type: 'Health Asset', 
            code: 'asset_vaccination_record', 
            owner: '疾控中心', 
            quality: 95, 
            status: 'Published', 
            tags: ['健康档案', '疫苗管理', '公共卫生'], 
            lastUpdate: '2024-05-21',
            description: '儿童疫苗接种历史记录资产，支持接种计划管理和统计分析。',
            category: '健康库',
            dataVolume: '3.2M条',
            updateFreq: '日更新',
            accessLevel: '内部',
            format: 'JSON',
            lineage: ['t_vaccination_record', '健康档案系统'],
            applications: ['疫苗管理', '健康档案', '统计分析'],
            fields: [
                { name: '接种记录ID', type: 'String', sensitive: false },
                { name: '疫苗类型', type: 'String', sensitive: false },
                { name: '接种日期', type: 'Date', sensitive: false },
                { name: '接种机构', type: 'String', sensitive: false },
                { name: '儿童信息', type: 'Object', sensitive: true }
            ]
        },
        { 
            id: 'AS_004', 
            name: '人口统计分析资产', 
            type: 'Analytics Asset', 
            code: 'asset_population_analytics', 
            owner: '大数据中心', 
            quality: 88, 
            status: 'Published', 
            tags: ['统计分析', '决策支持', '可视化'], 
            lastUpdate: '2024-05-19',
            description: '基于人口数据的统计分析资产，提供多维度分析和可视化报表。',
            category: '分析库',
            dataVolume: '预计算结果',
            updateFreq: '周更新',
            accessLevel: '公开',
            format: 'JSON/CSV',
            lineage: ['人口基础数据', '统计模型'],
            applications: ['决策支持', '报表系统', '数据大屏'],
            fields: [
                { name: '统计维度', type: 'String', sensitive: false },
                { name: '统计值', type: 'Number', sensitive: false },
                { name: '统计时间', type: 'Date', sensitive: false },
                { name: '地区编码', type: 'String', sensitive: false }
            ]
        },
        {
            id: 'AS_005',
            name: '身份验证服务资产',
            type: 'Service Asset',
            code: 'asset_identity_service',
            owner: '公安数据中心',
            quality: 99,
            status: 'Published',
            tags: ['身份认证', '安全服务', '实时验证'],
            lastUpdate: '2024-05-20',
            description: '提供身份证号码验证和人员身份认证的服务资产，确保数据访问安全。',
            category: '安全库',
            dataVolume: 'API调用',
            updateFreq: '实时',
            accessLevel: '受限',
            format: 'REST API',
            lineage: ['公安人口库', '身份认证系统'],
            applications: ['身份验证', '安全认证', '访问控制'],
            fields: [
                { name: '身份证号', type: 'String', sensitive: true },
                { name: '验证结果', type: 'Boolean', sensitive: false },
                { name: '验证时间', type: 'DateTime', sensitive: false },
                { name: '验证来源', type: 'String', sensitive: false }
            ]
        },
        {
            id: 'AS_006',
            name: '地址标准化资产',
            type: 'Reference Asset',
            code: 'asset_address_standard',
            owner: '地理信息中心',
            quality: 94,
            status: 'Published',
            tags: ['地址解析', '标准化', '地理编码'],
            lastUpdate: '2024-05-19',
            description: '提供地址信息标准化和地理编码的参考数据资产，支持地址匹配和纠错。',
            category: '参考库',
            dataVolume: '15.3M条',
            updateFreq: '月更新',
            accessLevel: '内部',
            format: 'JSON/GeoJSON',
            lineage: ['地址库', 'GIS系统'],
            applications: ['地址解析', '地图服务', '物流配送'],
            fields: [
                { name: '标准地址', type: 'String', sensitive: false },
                { name: '地理坐标', type: 'GeoPoint', sensitive: false },
                { name: '行政区划', type: 'String', sensitive: false },
                { name: '邮政编码', type: 'String', sensitive: false }
            ]
        },
        {
            id: 'AS_007',
            name: '数据质量监控资产',
            type: 'Quality Asset',
            code: 'asset_data_quality',
            owner: '数据治理团队',
            quality: 96,
            status: 'Published',
            tags: ['数据质量', '监控告警', '治理规则'],
            lastUpdate: '2024-05-21',
            description: '数据质量监控和评估资产，提供质量规则配置和异常检测能力。',
            category: '治理库',
            dataVolume: '质量报告',
            updateFreq: '实时监控',
            accessLevel: '内部',
            format: 'JSON/Report',
            lineage: ['所有数据源', '质量规则引擎'],
            applications: ['质量监控', '治理平台', '异常告警'],
            fields: [
                { name: '质量维度', type: 'String', sensitive: false },
                { name: '质量分数', type: 'Number', sensitive: false },
                { name: '检测时间', type: 'DateTime', sensitive: false },
                { name: '异常详情', type: 'Object', sensitive: false }
            ]
        },
        {
            id: 'AS_008',
            name: '业务流程编排资产',
            type: 'Process Asset',
            code: 'asset_workflow_orchestration',
            owner: '政务服务中心',
            quality: 90,
            status: 'Published',
            tags: ['业务流程', '一件事', '流程编排'],
            lastUpdate: '2024-05-18',
            description: '出生一件事等业务流程的编排资产，包含流程定义和执行模板。',
            category: '流程库',
            dataVolume: '流程定义',
            updateFreq: '按需更新',
            accessLevel: '内部',
            format: 'BPMN/JSON',
            lineage: ['业务系统', '流程引擎'],
            applications: ['流程编排', '一件事', '政务服务'],
            fields: [
                { name: '流程ID', type: 'String', sensitive: false },
                { name: '流程名称', type: 'String', sensitive: false },
                { name: '流程状态', type: 'Enum', sensitive: false },
                { name: '执行步骤', type: 'Array', sensitive: false }
            ]
        }
    ];

    const [assets, setAssets] = useState(mockCatalogAssets);

    const filterTabs = [
        { id: 'all', label: '全部资产', count: assets.length },
        { id: 'Data Asset', label: '数据资产', count: assets.filter(a => a.type === 'Data Asset').length },
        { id: 'Document Asset', label: '文档资产', count: assets.filter(a => a.type === 'Document Asset').length },
        { id: 'Service Asset', label: '服务资产', count: assets.filter(a => a.type === 'Service Asset').length },
        { id: 'Analytics Asset', label: '分析资产', count: assets.filter(a => a.type === 'Analytics Asset').length },
        { id: 'Reference Asset', label: '参考资产', count: assets.filter(a => a.type === 'Reference Asset').length },
        { id: 'Quality Asset', label: '质量资产', count: assets.filter(a => a.type === 'Quality Asset').length },
        { id: 'Process Asset', label: '流程资产', count: assets.filter(a => a.type === 'Process Asset').length },
        { id: 'Health Asset', label: '健康资产', count: assets.filter(a => a.type === 'Health Asset').length }
    ];

    const filteredAssets = assets.filter(asset => {
        const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesTab = activeTab === 'all' || asset.type === activeTab;
        return matchesSearch && matchesTab;
    });

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Data Asset': return <Database size={20} className="text-blue-600" />;
            case 'Document Asset': return <FileText size={20} className="text-emerald-600" />;
            case 'Service Asset': return <Server size={20} className="text-purple-600" />;
            case 'Analytics Asset': return <BarChart3 size={20} className="text-orange-600" />;
            case 'Reference Asset': return <BookIcon size={20} className="text-indigo-600" />;
            case 'Quality Asset': return <CheckCircle size={20} className="text-teal-600" />;
            case 'Process Asset': return <Layers size={20} className="text-pink-600" />;
            case 'Health Asset': return <Activity size={20} className="text-red-600" />;
            default: return <Box size={20} className="text-slate-600" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Data Asset': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Document Asset': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Service Asset': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Analytics Asset': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Reference Asset': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'Quality Asset': return 'bg-teal-100 text-teal-700 border-teal-200';
            case 'Process Asset': return 'bg-pink-100 text-pink-700 border-pink-200';
            case 'Health Asset': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const handleAssetSelect = (asset: any) => {
        setSelectedAsset(asset);
        if (viewMode === 'list') {
            setShowDetailPanel(true);
        }
    };

    const handleCloseDetail = () => {
        setSelectedAsset(null);
        setShowDetailPanel(false);
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Database size={24} className="text-blue-600" />
                        数据资产中心
                    </h2>
                    <p className="text-slate-500 mt-1">企业级数据资产统一管理和发现平台</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('card')}
                            className={`p-2 rounded-md transition-all ${
                                viewMode === 'card'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                            title="卡片视图"
                        >
                            <Box size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${
                                viewMode === 'list'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                            title="列表视图"
                        >
                            <List size={16} />
                        </button>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm shadow-blue-200">
                        <Plus size={16} /> 注册资产
                    </button>
                </div>
            </div>

            {/* 搜索和过滤 */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center bg-slate-200 rounded-lg p-1 gap-1">
                        {filterTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                                    activeTab === tab.id
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {tab.label}
                                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-xs">
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="搜索资产名称、编码或标签..."
                                className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 w-80 shadow-sm"
                            />
                        </div>
                        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded border border-slate-200 bg-white">
                            <Filter size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* 资产展示区域 */}
            <div className={`transition-all duration-300 ${showDetailPanel ? 'flex gap-6' : ''}`}>
                {/* 主内容区 */}
                <div className={`${showDetailPanel ? 'flex-1' : 'w-full'} transition-all duration-300`}>
                    {viewMode === 'card' ? (
                        /* 卡片视图 */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredAssets.map(asset => (
                                <div 
                                    key={asset.id} 
                                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                                    onClick={() => handleAssetSelect(asset)}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-lg ${getTypeColor(asset.type)}`}>
                                                {getTypeIcon(asset.type)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">
                                                    {asset.name}
                                                </h3>
                                                <p className="text-xs text-slate-400 font-mono">{asset.code}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                                                asset.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {asset.status}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <Star size={12} className="text-yellow-500" />
                                                <span className="text-xs font-bold text-slate-600">QS: {asset.quality}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                                        {asset.description}
                                    </p>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500">资产负责人:</span>
                                            <span className="font-medium text-slate-700">{asset.owner}</span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500">数据分类:</span>
                                            <span className="font-medium text-slate-700">{asset.category}</span>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500">数据量:</span>
                                            <span className="font-medium text-slate-700">{asset.dataVolume}</span>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500">更新频率:</span>
                                            <span className={`font-medium ${
                                                asset.updateFreq === '实时' ? 'text-emerald-600' : 
                                                asset.updateFreq === '准实时' ? 'text-orange-600' : 'text-slate-600'
                                            }`}>
                                                {asset.updateFreq}
                                            </span>
                                        </div>

                                        <div className="pt-2 border-t border-slate-100">
                                            <div className="flex flex-wrap gap-1">
                                                {asset.tags.map(tag => (
                                                    <span key={tag} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* 列表视图 */
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="text-left py-3 px-4 font-medium text-slate-700">资产名称</th>
                                            <th className="text-left py-3 px-4 font-medium text-slate-700">类型</th>
                                            <th className="text-left py-3 px-4 font-medium text-slate-700">负责人</th>
                                            <th className="text-left py-3 px-4 font-medium text-slate-700">分类</th>
                                            <th className="text-left py-3 px-4 font-medium text-slate-700">数据量</th>
                                            <th className="text-left py-3 px-4 font-medium text-slate-700">更新频率</th>
                                            <th className="text-left py-3 px-4 font-medium text-slate-700">访问级别</th>
                                            <th className="text-left py-3 px-4 font-medium text-slate-700">状态</th>
                                            <th className="text-left py-3 px-4 font-medium text-slate-700">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAssets.map(asset => (
                                            <tr key={asset.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${getTypeColor(asset.type)}`}>
                                                            {getTypeIcon(asset.type)}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-800">{asset.name}</div>
                                                            <div className="text-xs text-slate-500 font-mono">{asset.code}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(asset.type)}`}>
                                                        {asset.type}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-sm text-slate-600">{asset.owner}</td>
                                                <td className="py-4 px-4 text-sm text-slate-600">{asset.category}</td>
                                                <td className="py-4 px-4 text-sm text-slate-600">{asset.dataVolume}</td>
                                                <td className="py-4 px-4">
                                                    <span className={`text-sm font-medium ${
                                                        asset.updateFreq === '实时' ? 'text-emerald-600' : 
                                                        asset.updateFreq === '准实时' ? 'text-orange-600' : 'text-slate-600'
                                                    }`}>
                                                        {asset.updateFreq}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                        asset.accessLevel === '公开' ? 'bg-green-100 text-green-700' :
                                                        asset.accessLevel === '内部' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-orange-100 text-orange-700'
                                                    }`}>
                                                        {asset.accessLevel}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                        asset.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {asset.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAssetSelect(asset);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                        >
                                                            查看详情
                                                        </button>
                                                        <button className="text-emerald-600 hover:text-emerald-800 text-sm font-medium">
                                                            申请使用
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* 详情面板 - 仅在列表模式下显示 */}
                {showDetailPanel && selectedAsset && (
                    <div className="w-96 bg-white border border-slate-200 rounded-xl shadow-lg flex-shrink-0">
                        <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex justify-between items-center rounded-t-xl">
                            <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                <Eye size={16} />
                                资产详情
                            </h4>
                            <button 
                                onClick={handleCloseDetail}
                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded p-1 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        
                        <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                            {/* 基本信息 */}
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${getTypeColor(selectedAsset.type)}`}>
                                    {getTypeIcon(selectedAsset.type)}
                                </div>
                                <div className="flex-1">
                                    <h5 className="font-bold text-slate-800">{selectedAsset.name}</h5>
                                    <p className="text-sm text-slate-600 mt-1">{selectedAsset.description}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            selectedAsset.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {selectedAsset.status}
                                        </span>
                                        <span className="text-xs text-slate-400">•</span>
                                        <span className="text-xs text-slate-500">{selectedAsset.owner}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 资产属性 */}
                            <div className="grid grid-cols-1 gap-3 text-sm">
                                <div className="bg-slate-50 p-3 rounded">
                                    <div className="text-xs text-slate-500 mb-1">资产编码</div>
                                    <div className="font-mono text-slate-700">{selectedAsset.code}</div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded">
                                    <div className="text-xs text-slate-500 mb-1">数据分类</div>
                                    <div className="font-medium text-slate-700">{selectedAsset.category}</div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded">
                                    <div className="text-xs text-slate-500 mb-1">数据量</div>
                                    <div className="font-medium text-slate-700">{selectedAsset.dataVolume}</div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded">
                                    <div className="text-xs text-slate-500 mb-1">更新频率</div>
                                    <div className={`font-medium ${
                                        selectedAsset.updateFreq === '实时' ? 'text-emerald-600' : 
                                        selectedAsset.updateFreq === '准实时' ? 'text-orange-600' : 'text-slate-600'
                                    }`}>{selectedAsset.updateFreq}</div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded">
                                    <div className="text-xs text-slate-500 mb-1">访问级别</div>
                                    <div className={`font-medium ${
                                        selectedAsset.accessLevel === '公开' ? 'text-green-600' :
                                        selectedAsset.accessLevel === '内部' ? 'text-blue-600' :
                                        'text-orange-600'
                                    }`}>{selectedAsset.accessLevel}</div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded">
                                    <div className="text-xs text-slate-500 mb-1">数据格式</div>
                                    <div className="font-medium text-slate-700">{selectedAsset.format}</div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded">
                                    <div className="text-xs text-slate-500 mb-1">质量分数</div>
                                    <div className="font-bold text-slate-700">{selectedAsset.quality}/100</div>
                                </div>
                            </div>

                            {/* 字段信息 */}
                            {selectedAsset.fields && selectedAsset.fields.length > 0 && (
                                <div>
                                    <div className="text-sm font-bold text-slate-700 mb-2">字段信息 ({selectedAsset.fields.length})</div>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {selectedAsset.fields.map((field: any, index: number) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-slate-700">{field.name}</span>
                                                    {field.sensitive && (
                                                        <Lock size={12} className="text-orange-500" />
                                                    )}
                                                </div>
                                                <span className="text-slate-500">{field.type}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 应用场景 */}
                            {selectedAsset.applications && selectedAsset.applications.length > 0 && (
                                <div>
                                    <div className="text-sm font-bold text-slate-700 mb-2">应用场景</div>
                                    <div className="flex flex-wrap gap-1">
                                        {selectedAsset.applications.map((app: string) => (
                                            <span key={app} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                                                {app}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 标签 */}
                            {selectedAsset.tags && selectedAsset.tags.length > 0 && (
                                <div>
                                    <div className="text-sm font-bold text-slate-700 mb-2">资产标签</div>
                                    <div className="flex flex-wrap gap-1">
                                        {selectedAsset.tags.map((tag: string) => (
                                            <span key={tag} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 数据血缘 */}
                            {selectedAsset.lineage && selectedAsset.lineage.length > 0 && (
                                <div>
                                    <div className="text-sm font-bold text-slate-700 mb-2">数据血缘</div>
                                    <div className="space-y-1">
                                        {selectedAsset.lineage.map((item: string, index: number) => (
                                            <div key={index} className="flex items-center gap-2 text-xs p-2 bg-slate-50 rounded">
                                                <ArrowRight size={12} className="text-slate-400" />
                                                <span className="text-slate-600">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 操作按钮 */}
                            <div className="flex gap-2 pt-2 border-t border-slate-100">
                                <button className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                                    申请使用
                                </button>
                                <button className="flex-1 px-3 py-2 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors">
                                    下载样例
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {filteredAssets.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white rounded-xl border border-slate-200">
                    <Search size={48} className="mb-4 text-slate-200" />
                    <p className="text-lg font-medium">未找到匹配的资产</p>
                    <p className="text-sm mt-1">尝试调整搜索条件或筛选器</p>
                    <button
                        onClick={() => { setSearchTerm(''); setActiveTab('all'); }}
                        className="mt-4 text-sm text-blue-500 hover:underline"
                    >
                        清除所有筛选条件
                    </button>
                </div>
            )}

            {/* 卡片模式的资产详情模态框 */}
            {selectedAsset && viewMode === 'card' && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${getTypeColor(selectedAsset.type)}`}>
                                    {getTypeIcon(selectedAsset.type)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">{selectedAsset.name}</h3>
                                    <p className="text-sm text-slate-500">{selectedAsset.type}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleCloseDetail}
                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* 左侧：基本信息 */}
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-700 mb-2">资产信息</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-slate-500">资产编码:</span>
                                                <span className="ml-2 font-mono text-slate-700">{selectedAsset.code}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">负责人:</span>
                                                <span className="ml-2 text-slate-700">{selectedAsset.owner}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">数据分类:</span>
                                                <span className="ml-2 text-slate-700">{selectedAsset.category}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">数据量:</span>
                                                <span className="ml-2 text-slate-700">{selectedAsset.dataVolume}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">更新频率:</span>
                                                <span className={`ml-2 font-medium ${
                                                    selectedAsset.updateFreq === '实时' ? 'text-emerald-600' : 
                                                    selectedAsset.updateFreq === '准实时' ? 'text-orange-600' : 'text-slate-600'
                                                }`}>{selectedAsset.updateFreq}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">访问级别:</span>
                                                <span className={`ml-2 font-medium ${
                                                    selectedAsset.accessLevel === '公开' ? 'text-green-600' :
                                                    selectedAsset.accessLevel === '内部' ? 'text-blue-600' :
                                                    'text-orange-600'
                                                }`}>{selectedAsset.accessLevel}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">数据格式:</span>
                                                <span className="ml-2 text-slate-700">{selectedAsset.format}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">质量分数:</span>
                                                <span className="ml-2 font-bold text-slate-700">{selectedAsset.quality}/100</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-sm text-slate-700 mb-2">资产描述</h4>
                                        <p className="text-sm text-slate-600 leading-relaxed">{selectedAsset.description}</p>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-sm text-slate-700 mb-2">资产标签</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedAsset.tags.map((tag: string) => (
                                                <span key={tag} className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-sm">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* 右侧：详细信息 */}
                                <div className="space-y-4">
                                    {/* 字段信息 */}
                                    {selectedAsset.fields && selectedAsset.fields.length > 0 && (
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-700 mb-2">字段信息 ({selectedAsset.fields.length})</h4>
                                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                                {selectedAsset.fields.map((field: any, index: number) => (
                                                    <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-slate-700">{field.name}</span>
                                                            {field.sensitive && (
                                                                <Lock size={14} className="text-orange-500" />
                                                            )}
                                                        </div>
                                                        <span className="text-slate-500">{field.type}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 应用场景 */}
                                    {selectedAsset.applications && selectedAsset.applications.length > 0 && (
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-700 mb-2">应用场景</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedAsset.applications.map((app: string) => (
                                                    <span key={app} className="bg-blue-100 text-blue-700 text-sm px-2 py-1 rounded">
                                                        {app}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 数据血缘 */}
                                    {selectedAsset.lineage && selectedAsset.lineage.length > 0 && (
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-700 mb-2">数据血缘</h4>
                                            <div className="space-y-2">
                                                {selectedAsset.lineage.map((item: string, index: number) => (
                                                    <div key={index} className="flex items-center gap-2 text-sm">
                                                        <ArrowRight size={14} className="text-slate-400" />
                                                        <span className="text-slate-600">{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={handleCloseDetail}
                                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
                            >
                                关闭
                            </button>
                            <button className="px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors">
                                申请使用
                            </button>
                            <button className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
                                下载样例
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
