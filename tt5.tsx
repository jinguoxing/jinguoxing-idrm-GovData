import React, { useState, useEffect, useRef } from 'react';
import {
    Layout, Database, GitMerge, Server, Layers,
    Search, AlertCircle, CheckCircle, ArrowRight,
    FileText, Settings, Activity, Cpu, Link,
    Code, RefreshCw, ChevronRight, PieChart, Shield,
    Plus, Upload, FileCheck, TrendingUp, MoreHorizontal, X,
    Trash2, Edit, Play, Filter, Box, Table, Share2, Save,
    GitCommit, Zap, MousePointer, Move, ZoomIn, ZoomOut,
    HardDrive, Wifi, Lock, Eye, Sparkles, Scan, FileJson, ArrowUpRight,
    Sliders, CheckSquare, XCircle, AlertTriangle, FileWarning, Hammer,
    Book, Tag, User, Clock, Star, Terminal, Globe, Copy,
    Thermometer, Timer, BarChart3, Eraser, GitBranch, Network,
    BrainCircuit, Gauge, FileDigit, List, Bot, Send, MessageSquare, BadgeCheck
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// ==========================================
// 1. 模拟数据 (Mock Data)
// ==========================================

// TD: 业务梳理数据
const mockBusinessGoals = [
    {
        id: 'G_001',
        title: '出生一件事高效办成',
        type: '改革事项',
        priority: 'High',
        status: 'modeling',
        progress: 65,
        owner: '卫健委 / 数局',
        lastUpdate: '2024-05-20',
        description: '整合出生医学证明、户口登记、医保参保等多个事项，实现“一表申请、一网通办”。',
        relatedObjects: ['新生儿', '出生医学证明', '户籍信息'],
        stages: { policy: true, object: true, scenario: false }
    },
    {
        id: 'G_002',
        title: '企业开办全流程优化',
        type: '改革事项',
        priority: 'Medium',
        status: 'planning',
        progress: 15,
        owner: '市场监管局',
        lastUpdate: '2024-05-18',
        description: '压缩企业开办时间至0.5个工作日，涉及工商、税务、社保等数据打通。',
        relatedObjects: [],
        stages: { policy: true, object: false, scenario: false }
    },
    {
        id: 'G_003',
        title: '公共数据归集管理办法',
        type: '政策文件',
        priority: 'Low',
        status: 'implemented',
        progress: 100,
        owner: '大数据中心',
        lastUpdate: '2024-01-10',
        description: '规范全市公共数据归集、共享、开放及安全管理活动。',
        relatedObjects: ['数据目录', '归集任务'],
        stages: { policy: true, object: true, scenario: true }
    }
];

// TD: 业务对象
const mockBusinessObjects = [
    {
        id: 'BO_NEWBORN',
        name: '新生儿 (Newborn)',
        code: 'biz_newborn',
        domain: '出生一件事',
        owner: '卫健委业务处',
        status: 'published',
        version: 'v1.2',
        description: '自然人出生登记的核心业务对象，记录新生儿基础身份信息。',
        // 关联的源表（模拟数据）
        sourceTables: ['t_pop_base_info'],
        fields: [
            { id: 'f1', name: '姓名', code: 'name', type: 'String', length: '50', required: true, desc: '新生儿正式登记姓名' },
            { id: 'f2', name: '身份证号', code: 'id_card', type: 'String', length: '18', required: true, desc: '全区统一身份标识' },
            { id: 'f3', name: '出生时间', code: 'birth_date', type: 'DateTime', length: '-', required: true, desc: '精确到分' },
            { id: 'f4', name: '血型', code: 'blood_type', type: 'Enum', length: '2', required: false, desc: 'ABO血型标准' },
            { id: 'f5', name: '出生体重', code: 'weight', type: 'Decimal', length: '4,2', required: false, desc: '单位：kg' },
        ]
    },
    {
        id: 'BO_CERT',
        name: '出生医学证明',
        code: 'biz_birth_cert',
        domain: '出生一件事',
        owner: '医院管理处',
        status: 'draft',
        version: 'v0.9',
        description: '证明婴儿出生状态、血亲关系以及申报国籍、户籍取得公民身份的法定医学证明。',
        sourceTables: ['t_med_birth_cert'],
        fields: [
            { id: 'f1', name: '证明编号', code: 'cert_no', type: 'String', length: '20', required: true, desc: '全局唯一流水号' },
            { id: 'f2', name: '签发机构', code: 'issue_org', type: 'String', length: '100', required: true, desc: '助产机构名称' },
            { id: 'f3', name: '签发日期', code: 'issue_date', type: 'Date', length: '-', required: true, desc: '-' },
        ]
    }
];

// TD: 场景编排数据
const mockScenarios = [
    {
        id: 'SC_001',
        name: '出生医学证明申领流程',
        status: 'active',
        description: '新生儿出生后，由医院发起信息登记，监护人确认申领，最终系统自动签发电子证照。',
        nodes: [
            { id: 'n1', type: 'start', label: '出生登记', objectId: 'BO_NEWBORN', status: 'done' },
            { id: 'n2', type: 'action', label: '监护人申领', objectId: null, status: 'done' },
            { id: 'n3', type: 'object', label: '生成证明', objectId: 'BO_CERT', status: 'process' },
            { id: 'n4', type: 'end', label: '归档完成', objectId: null, status: 'pending' },
        ],
        edges: [
            { from: 'n1', to: 'n2', label: '触发' },
            { from: 'n2', to: 'n3', label: '提交申请' },
            { from: 'n3', to: 'n4', label: '自动归档' },
        ]
    },
    {
        id: 'SC_002',
        name: '新生儿落户办理',
        status: 'draft',
        description: '基于出生医学证明和监护人户口簿，办理新生儿户口登记。',
        nodes: [
            { id: 'n1', type: 'start', label: '获取证明', objectId: 'BO_CERT', status: 'pending' },
            { id: 'n2', type: 'object', label: '户籍登记', objectId: null, status: 'pending' }
        ],
        edges: [
            { from: 'n1', to: 'n2', label: '作为依据' }
        ]
    }
];

// BU: 数据源
const mockDataSources = [
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
    },
    {
        id: 'DS_003',
        name: '电子证照_归集库',
        type: 'PostgreSQL',
        host: '192.168.100.20',
        port: 5432,
        dbName: 'cert_archive',
        status: 'error',
        lastScan: '2024-05-18 09:30',
        tableCount: 0,
        desc: '连接超时，请检查防火墙设置'
    }
];

// BU: 扫描到的资产列表
const mockScanAssets = [
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
    },
    {
        id: 'TBL_003',
        name: 't_hosp_dict',
        comment: '医院字典表',
        rows: '200',
        updateTime: '2024-01-01 00:00',
        status: 'normal',
        columns: [
            { name: 'hosp_code', type: 'varchar(20)', comment: '医院编码' },
            { name: 'hosp_name', type: 'varchar(100)', comment: '医院名称' }
        ]
    },
    {
        id: 'TBL_004',
        name: 't_vac_record',
        comment: '疫苗接种记录',
        rows: '3.5M',
        updateTime: '2024-05-20 09:45',
        status: 'changed',
        columns: [
            { name: 'record_id', type: 'bigint', comment: '记录ID' },
            { name: 'vac_code', type: 'varchar(20)', comment: '疫苗编码' },
            { name: 'inject_time', type: 'datetime', comment: '接种时间' }
        ]
    },
];

// BU: 物理表
const mockPhysicalTables = [
    {
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
    }
];

// SG: 映射关系
const mockMappings = [
    { boField: '姓名', tblField: 'p_name', rule: 'Direct Copy' },
    { boField: '身份证号', tblField: 'id_card_num', rule: 'Direct Copy' },
    { boField: '出生时间', tblField: 'birth_ts', rule: 'Format: YYYY-MM-DD HH:mm:ss' },
    { boField: '出生体重', tblField: 'weight_kg', rule: 'Direct Copy' },
];

// BU: AI 候选推荐
const mockAICandidates = [
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
        id: 'AI_004',
        sourceTable: 't_newborn_archive_2023',
        suggestedName: '新生儿 (Newborn)',
        confidence: 0.78,
        reason: '历史归档表，结构与主表一致。建议作为历史分区或独立快照对象。',
        scores: { nameMatch: 70, fieldMatch: 95, dataSample: 60 },
        mappedFields: 5,
        status: 'pending',
        previewFields: []
    },
    {
        id: 'AI_003',
        sourceTable: 'sys_log_2024',
        suggestedName: '系统日志',
        confidence: 0.45,
        reason: '技术属性字段较多，业务语义不明显，建议忽略。',
        scores: { nameMatch: 40, fieldMatch: 30, dataSample: 50 },
        mappedFields: 0,
        status: 'ignored',
        previewFields: []
    }
];

// SG: 冲突检测数据
const mockConflicts = [
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

// SG: 统一元数据 (Catalog)
const mockCatalogAssets = [
    { id: 'AS_001', name: '新生儿 (Newborn)', type: 'Business Object', code: 'biz_newborn', owner: '卫健委业务处', quality: 98, status: 'Active', tags: ['核心', '人口', 'L1'], lastUpdate: '2024-05-20' },
    { id: 'AS_002', name: '出生医学证明', type: 'Business Object', code: 'biz_birth_cert', owner: '医院管理处', quality: 85, status: 'Draft', tags: ['证照', 'L1'], lastUpdate: '2024-05-18' },
    { id: 'AS_003', name: 't_pop_base_info', type: 'Physical Table', code: 'hosp_db.t_pop_base', owner: 'DBA Team', quality: 100, status: 'Active', tags: ['MySQL', 'Raw'], lastUpdate: '2024-05-21' },
    { id: 'AS_004', name: 't_med_birth_cert', type: 'Physical Table', code: 'hosp_db.t_cert', owner: 'DBA Team', quality: 92, status: 'Active', tags: ['MySQL', 'Raw'], lastUpdate: '2024-05-21' },
];

// EE: API 网关
const mockApiServices = [
    {
        id: 'API_001',
        name: '查询新生儿详情',
        method: 'GET',
        path: '/api/v1/newborn/{id}',
        objectName: '新生儿 (Newborn)',
        status: 'Online',
        qps: 120,
        latency: '45ms',
        errorRate: '0.02%'
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
        errorRate: '0.15%'
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
        errorRate: '-'
    },
];

// EE: 缓存策略
const mockCachePolicies = [
    { id: 'CP_001', name: '高频代码表缓存', target: 'Dictionaries', type: 'Local', ttl: '24h', eviction: 'LFU', status: 'Active' },
    { id: 'CP_002', name: '新生儿实时查询', target: 'Newborn (Single)', type: 'Redis', ttl: '5m', eviction: 'LRU', status: 'Active' },
    { id: 'CP_003', name: '统计报表预计算', target: 'Reports', type: 'Redis Cluster', ttl: '1h', eviction: 'FIFO', status: 'Inactive' },
];

const mockCacheKeys = [
    { key: 'bo:newborn:nb_123456', size: '2.4KB', created: '10:00:05', expires: '10:05:05', hits: 145 },
    { key: 'dict:hosp_level', size: '15KB', created: '08:00:00', expires: 'Tomorrow', hits: 5200 },
    { key: 'api:query:birth_cert:list', size: '450KB', created: '10:02:30', expires: '10:03:30', hits: 12 },
];

// SG: 血缘数据
const mockLineage = {
    nodes: [
        { id: 'DS_001', label: '卫健委_前置库 (MySQL)', type: 'source' },
        { id: 'TBL_001', label: 't_pop_base_info', type: 'table' },
        { id: 'BO_NEWBORN', label: '新生儿 (Newborn)', type: 'object' },
        { id: 'API_001', label: '查询新生儿详情 (API)', type: 'api' },
        { id: 'API_003', label: '人口基础信息同步 (API)', type: 'api' }
    ],
    edges: [
        { from: 'DS_001', to: 'TBL_001' },
        { from: 'TBL_001', to: 'BO_NEWBORN' },
        { from: 'BO_NEWBORN', to: 'API_001' },
        { from: 'BO_NEWBORN', to: 'API_003' }
    ]
};

// ==========================================
// 2. 辅助小组件 (Utility Components)
// ==========================================

const StatCard = ({ label, value, trend, icon: Icon, color }) => {
    const colorMap = {
        blue: "text-blue-600 bg-blue-50 border-blue-200",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-200",
        purple: "text-purple-600 bg-purple-50 border-purple-200",
        orange: "text-orange-600 bg-orange-50 border-orange-200",
        red: "text-red-600 bg-red-50 border-red-200",
    };

    return (
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
                </div>
                <div className={`p-2 rounded-lg ${colorMap[color] || colorMap.blue}`}>
                    <Icon size={20} />
                </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
                {trend && (
                    <span className={`${trend === 'Healthy' || trend.includes('+') ? 'text-emerald-600' : 'text-slate-500'} font-bold bg-slate-50 px-1.5 py-0.5 rounded mr-2`}>
                        {trend}
                    </span>
                )}
                <span className="text-slate-400">vs last check</span>
            </div>
        </div>
    );
};

const StepItem = ({ status, text }) => (
    <div className="flex items-center gap-3">
        {status === 'done' ? (
            <div className="min-w-[20px] h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle size={12} />
            </div>
        ) : (
            <div className="min-w-[20px] h-5 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin"></div>
        )}
        <span className={`text-sm ${status === 'done' ? 'text-slate-600' : 'text-slate-800 font-medium'}`}>{text}</span>
    </div>
);

const BookIcon = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
);

const ScoreBar = ({ label, score }) => (
    <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500 w-24 text-right">{label}</span>
        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${score > 80 ? 'bg-emerald-500' : score > 50 ? 'bg-orange-400' : 'bg-red-400'}`} style={{ width: `${score}%` }}></div>
        </div>
        <span className="text-xs font-mono font-bold text-slate-700 w-8">{score}</span>
    </div>
);

// ==========================================
// 3. 布局组件 (Layout Components)
// ==========================================

const Sidebar = ({ activeModule, setActiveModule }) => {
    const menus = [
        { title: '概览', items: [{ id: 'dashboard', label: '控制台 Dashboard', icon: Activity }] },
        {
            title: '业务建模',
            color: 'text-blue-400',
            items: [
                { id: 'td_goals', label: '业务梳理 (TD-01)', icon: FileText },
                { id: 'td_modeling', label: '业务对象建模 (TD-03)', icon: Box },
                { id: 'td_scenario', label: '场景编排 (TD-04)', icon: Layers },
            ]
        },
        {
            title: '数据发现',
            color: 'text-emerald-400',
            items: [
                { id: 'bu_connect', label: '数据源管理 (BU-01)', icon: Database },
                { id: 'bu_discovery', label: '资产扫描 (BU-02)', icon: Scan },
                { id: 'bu_semantics', label: '数据语义理解 (BU-03)', icon: BrainCircuit },
                { id: 'bu_candidates', label: '候选生成 (BU-04)', icon: Sparkles },
            ]
        },
        {
            title: 'SG 语义治理中心',
            color: 'text-purple-400',
            items: [
                { id: 'mapping', label: '映射工作台 (SG-01)', icon: GitMerge },
                { id: 'governance', label: '冲突检测 (SG-02)', icon: Shield },
                { id: 'catalog', label: '统一元数据 (SG-04)', icon: BookIcon },
                { id: 'lineage', label: '全链路血缘 (SG-05)', icon: GitBranch },
            ]
        },
        {
            title: 'EE 服务执行',
            color: 'text-orange-400',
            items: [
                { id: 'ee_api', label: 'API 网关 (EE-05)', icon: Server },
                { id: 'ee_cache', label: '缓存策略 (EE-06)', icon: RefreshCw },
            ]
        },
    ];

    return (
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shadow-xl z-20 flex-shrink-0">
            <div className="h-16 flex items-center px-6 border-b border-slate-800">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <Link className="text-white" size={18} />
                </div>
                <div>
                    <h1 className="font-bold text-white tracking-tight">SemanticLink</h1>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Enterprise Edition</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
                {menus.map((group, idx) => (
                    <div key={idx} className="mb-6 px-4">
                        <h3 className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${group.color || 'text-slate-500'}`}>
                            {group.title}
                        </h3>
                        <div className="space-y-1">
                            {group.items.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveModule(item.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 ${activeModule === item.id
                                            ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                                            : 'hover:bg-slate-800/50 hover:text-white'
                                        }`}
                                >
                                    <item.icon size={16} strokeWidth={1.5} />
                                    <span>{item.label}</span>
                                    {activeModule === item.id && <ChevronRight size={14} className="ml-auto opacity-50" />}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white">
                        JD
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-white">John Doe</div>
                        <div className="text-xs text-slate-500">Chief Data Architect</div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

const Header = ({ activeModule, showAssistant, setShowAssistant }) => {
    const getTitle = (id) => {
        switch (id) {
            case 'td_goals': return '业务梳理';
            case 'td_modeling': return '业务对象建模';
            case 'td_scenario': return '场景编排';
            case 'bu_connect': return '数据源管理';
            case 'bu_discovery': return '资产扫描';
            case 'bu_semantics': return '数据语义理解';
            case 'bu_candidates': return '候选生成';
            case 'mapping': return '映射工作台';
            case 'governance': return '冲突检测与治理';
            case 'catalog': return '统一元数据目录';
            case 'ee_api': return 'API 服务网关';
            case 'ee_cache': return '缓存策略配置';
            case 'lineage': return '全链路血缘分析';
            default: return id.replace('_', ' ');
        }
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10 flex-shrink-0">
            <div className="flex items-center text-sm breadcrumbs text-slate-500">
                <span>Platform</span>
                <ChevronRight size={14} className="mx-2" />
                <span className="font-medium text-slate-800 capitalize">{getTitle(activeModule)}</span>
            </div>
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setShowAssistant(!showAssistant)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                        showAssistant 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <Bot size={16} />
                    <span className="text-sm font-medium">AI 建模助手</span>
                </button>
                <div className="h-6 w-px bg-slate-200"></div>
                <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 relative">
                    <AlertCircle size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>
                <button className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 shadow-sm shadow-blue-200 transition-colors">
                    发布版本 (v1.0.4)
                </button>
            </div>
        </header>
    );
};

// ==========================================
// 4. AI Assistant Component
// ==========================================

const AIAssistantPanel = ({ visible, onClose, activeModule, contextData }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initial greeting based on context
    useEffect(() => {
        if (visible && messages.length === 0) {
           // No default message, rely on the empty state placeholder
        }
    }, [visible]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMsg = { role: 'user', text: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            let systemPrompt = `You are an expert Data Architect and Semantic Modeling Assistant for an enterprise platform. 
            The user is currently in the module: ${activeModule}.
            Your goal is to help them with data modeling, resolving conflicts, or understanding the system.
            
            Current Mock Data Context Summary:
            - Business Objects Count: ${contextData.businessObjects?.length || 0}
            - Data Sources: ${contextData.dataSources?.length || 0}
            - Pending Candidates: ${contextData.candidates?.length || 0}
            
            Be concise, professional, and helpful. Use Markdown for formatting.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: [
                    { role: 'user', parts: [{ text: `[System Context: ${systemPrompt}] User Question: ${inputValue}` }] }
                ]
            });

            const aiMsg = { role: 'model', text: response.text };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error connecting to the AI service. Please check your API key." }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!visible) return null;

    return (
        <div className="w-96 bg-white border-l border-slate-200 flex flex-col h-full shadow-xl transition-all duration-300 z-30">
            {/* Header */}
            <div className="h-14 border-b border-slate-200 flex items-center justify-between px-4 bg-slate-50/50">
                <div className="flex items-center gap-2 text-indigo-700">
                    <Bot size={20} />
                    <span className="font-bold text-sm">AI 建模助手</span>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-200">
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-60">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-500">
                            <Bot size={32} />
                        </div>
                        <h3 className="text-slate-800 font-bold mb-2">我是您的语义建模助手。</h3>
                        <p className="text-sm text-slate-500">请选择一个模块开始工作，或直接向我提问关于数据建模、冲突解决的问题。</p>
                        <div className="mt-6 text-xs text-slate-400 bg-white p-3 rounded border border-slate-200">
                            试着问：
                            <ul className="mt-2 space-y-1 text-left list-disc list-inside">
                                <li>如何解决新生儿对象的字段冲突？</li>
                                <li>帮我生成一个疫苗接种的业务对象草稿</li>
                                <li>解释当前的缓存策略</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div 
                                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                                    msg.role === 'user' 
                                    ? 'bg-blue-600 text-white rounded-br-none' 
                                    : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'
                                }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                            <RefreshCw size={14} className="animate-spin text-indigo-500" />
                            <span className="text-xs text-slate-500">AI 思考中...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200">
                <div className="relative">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="向 AI 提问或发出指令..."
                        className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
                    />
                    <button 
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                        className={`absolute right-2 top-2 p-1.5 rounded-lg transition-colors ${
                            inputValue.trim() && !isLoading
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm' 
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        <ArrowRight size={16} />
                    </button>
                </div>
                <div className="text-[10px] text-center text-slate-400 mt-2">
                    AI 生成的内容可能不准确，请人工核实。
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 5. 功能视图组件 (Feature Views) - (Existing Components Kept As Is)
// ==========================================

// --- 视图: 数据语义理解 (BU-03) ---
const DataSemanticUnderstandingView = () => {
    const [selectedTableId, setSelectedTableId] = useState(mockScanAssets[0]?.id);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResults, setAnalysisResults] = useState({}); // Map of tableId -> result

    const selectedTable = mockScanAssets.find(t => t.id === selectedTableId);

    const handleAnalyze = async () => {
        if (!selectedTable) return;
        setIsAnalyzing(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
            作为一个资深数据架构师，请分析以下数据库物理表的语义，将其转化为业务更容易理解的描述。
            
            表名: ${selectedTable.name}
            原始注释: ${selectedTable.comment}
            字段列表:
            ${selectedTable.columns.map(c => `- ${c.name} (${c.type}): ${c.comment}`).join('\n')}
            
            请输出 JSON 格式，包含以下字段:
            - businessName: 建议的中文业务名称
            - description: 详细的业务含义描述 (50字左右)
            - scenarios: 适用的业务场景列表 (数组)
            - tags: 业务标签 (数组)
            - coreFields: 核心业务字段说明 (数组，包含 {field, reason})
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: { responseMimeType: 'application/json' }
            });
            
            const result = JSON.parse(response.text);
            setAnalysisResults(prev => ({ ...prev, [selectedTableId]: result }));
        } catch (error) {
            console.error("AI Analysis Failed", error);
            alert("AI 分析请求失败，请检查 API Key 或网络连接。");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const currentResult = analysisResults[selectedTableId];

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center shrink-0">
               <div>
                 <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <BrainCircuit className="text-pink-500" /> 数据语义理解
                 </h2>
                 <p className="text-sm text-slate-500 mt-1">基于 AI 大模型，深度解析物理资产的业务含义，辅助建模。</p>
               </div>
               <div className="flex gap-4">
                  <StatCard label="待分析表" value={mockScanAssets.length - Object.keys(analysisResults).length} trend="Pending" icon={Database} color="blue" />
                  <StatCard label="已智能解析" value={Object.keys(analysisResults).length} trend="+1" icon={Sparkles} color="purple" />
               </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Left: Table List */}
                <div className="w-80 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input type="text" placeholder="搜索物理表..." className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {mockScanAssets.map(t => (
                            <div 
                                key={t.id} 
                                onClick={() => setSelectedTableId(t.id)}
                                className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${selectedTableId === t.id ? 'bg-pink-50 border-l-4 border-l-pink-500' : 'border-l-4 border-l-transparent'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-slate-700 text-sm truncate w-40" title={t.name}>{t.name}</span>
                                    {analysisResults[t.id] && <BadgeCheck className="text-emerald-500" size={16} />}
                                </div>
                                <div className="text-xs text-slate-500 truncate">{t.comment || '无注释'}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Analysis Panel */}
                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                    {/* Top Action Bar */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center shrink-0">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg"><Table size={20} className="text-slate-600"/></div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">{selectedTable?.name}</h3>
                                <p className="text-xs text-slate-500">Rows: {selectedTable?.rows} • Updated: {selectedTable?.updateTime}</p>
                            </div>
                         </div>
                         <button 
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className={`px-5 py-2.5 rounded-lg text-white font-medium flex items-center gap-2 shadow-sm transition-all ${isAnalyzing ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:shadow-pink-200'}`}
                         >
                            {isAnalyzing ? <RefreshCw size={18} className="animate-spin"/> : <Sparkles size={18} />}
                            {isAnalyzing ? 'AI 正在语义分析中...' : '开始语义理解'}
                         </button>
                    </div>

                    <div className="flex-1 flex gap-4 overflow-hidden">
                        {/* Schema View */}
                        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 font-bold text-sm text-slate-700">物理元数据 (Schema)</div>
                            <div className="flex-1 overflow-y-auto p-0">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 sticky top-0">
                                        <tr><th className="px-4 py-2 font-medium">字段名</th><th className="px-4 py-2 font-medium">类型</th><th className="px-4 py-2 font-medium">原始注释</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {selectedTable?.columns.map((c, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 font-mono text-slate-700">{c.name}</td>
                                                <td className="px-4 py-3 text-slate-500 text-xs">{c.type}</td>
                                                <td className="px-4 py-3 text-slate-600">{c.comment}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* AI Result View */}
                        <div className="flex-1 bg-gradient-to-br from-white to-purple-50 border border-purple-100 rounded-xl shadow-sm flex flex-col overflow-hidden relative">
                             <div className="px-4 py-3 border-b border-purple-100 bg-purple-50/50 font-bold text-sm text-purple-800 flex items-center gap-2">
                                <BrainCircuit size={16}/> AI 语义理解结果
                             </div>
                             
                             {currentResult ? (
                                 <div className="flex-1 overflow-y-auto p-5 space-y-5 animate-fade-in">
                                     <div>
                                         <label className="text-xs font-bold text-purple-400 uppercase tracking-wider">建议业务名称</label>
                                         <div className="text-xl font-bold text-slate-800 mt-1">{currentResult.businessName}</div>
                                     </div>
                                     
                                     <div>
                                         <label className="text-xs font-bold text-purple-400 uppercase tracking-wider">业务含义描述</label>
                                         <p className="text-sm text-slate-600 mt-1 leading-relaxed bg-white/50 p-3 rounded-lg border border-purple-100">
                                             {currentResult.description}
                                         </p>
                                     </div>

                                     <div>
                                         <label className="text-xs font-bold text-purple-400 uppercase tracking-wider">适用场景</label>
                                         <div className="flex flex-wrap gap-2 mt-2">
                                             {currentResult.scenarios?.map(s => (
                                                 <span key={s} className="px-2.5 py-1 bg-white border border-purple-200 text-purple-700 text-xs rounded-full shadow-sm">{s}</span>
                                             ))}
                                         </div>
                                     </div>

                                     <div>
                                          <label className="text-xs font-bold text-purple-400 uppercase tracking-wider">关键业务字段</label>
                                          <ul className="mt-2 space-y-2">
                                              {currentResult.coreFields?.map((f, i) => (
                                                  <li key={i} className="text-xs flex gap-2 items-start">
                                                      <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1 rounded">{f.field}</span>
                                                      <span className="text-slate-500">- {f.reason}</span>
                                                  </li>
                                              ))}
                                          </ul>
                                     </div>

                                     <div className="pt-4 border-t border-purple-100">
                                         <button className="w-full py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 shadow-sm transition-colors">
                                             确认并保存语义信息
                                         </button>
                                     </div>
                                 </div>
                             ) : (
                                 <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                                     <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 text-purple-400">
                                         <Sparkles size={32} />
                                     </div>
                                     <p className="text-sm">点击上方“开始语义理解”按钮<br/>AI 将自动分析表结构并生成业务解释</p>
                                 </div>
                             )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 视图 1: 仪表盘 Dashboard ---
const DashboardView = ({ setActiveModule }) => (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard label="L1 业务对象" value="142" trend="+3" icon={Layout} color="blue" />
            <StatCard label="已扫描物理表" value="8,920" trend="+12" icon={Database} color="emerald" />
            <StatCard label="已对齐映射" value="89" trend="65%" icon={GitMerge} color="purple" />
            <StatCard label="API 服务调用" value="1.2M" trend="High" icon={Server} color="orange" />
        </div>

        {/* 核心架构可视化卡片 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">语义层构建流水线</h2>
                    <p className="text-slate-500 text-sm">业务模型与技术实现的融合状态</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1">
                        <Activity size={12} /> System Healthy
                    </span>
                </div>
            </div>

            <div className="flex items-stretch gap-8">
                {/* 左侧 TD 流 */}
                <div className="flex-1 bg-blue-50/50 rounded-xl border border-blue-100 p-5 relative overflow-hidden group hover:border-blue-300 transition-colors cursor-pointer" onClick={() => setActiveModule('td_modeling')}>
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Layout size={80} className="text-blue-500" />
                    </div>
                    <h3 className="text-blue-900 font-bold mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span> 业务意图
                    </h3>
                    <div className="space-y-3 relative z-10">
                        <StepItem status="done" text="A1. 政策文件解析 (出生一件事)" />
                        <StepItem status="done" text="A2. L1 业务对象定义 (142个)" />
                        <StepItem status="process" text="A4. 场景语义编排" />
                    </div>
                </div>

                {/* 中间 汇聚流 */}
                <div className="w-48 flex flex-col justify-center items-center relative">
                    <div className="absolute inset-x-0 top-1/2 h-0.5 bg-slate-200 -z-10"></div>
                    <div className="bg-white p-4 rounded-full border-2 border-purple-100 shadow-lg mb-4 hover:scale-110 transition-transform cursor-pointer z-10" onClick={() => setActiveModule('mapping')}>
                        <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                            <GitMerge size={32} />
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-slate-800">语义对齐</div>
                        <div className="text-xs text-slate-500 mt-1">冲突检测中...</div>
                        <div className="mt-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <AlertCircle size={10} /> 14 个待解决冲突
                        </div>
                    </div>
                </div>

                {/* 右侧 BU 流 */}
                <div className="flex-1 bg-emerald-50/50 rounded-xl border border-emerald-100 p-5 relative overflow-hidden group hover:border-emerald-300 transition-colors cursor-pointer" onClick={() => setActiveModule('bu_discovery')}>
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Database size={80} className="text-emerald-500" />
                    </div>
                    <h3 className="text-emerald-900 font-bold mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> 技术实现
                    </h3>
                    <div className="space-y-3 relative z-10">
                        <StepItem status="done" text="B1. 挂载卫健委前置机 (MySQL)" />
                        <StepItem status="done" text="B2. 自动元数据采集" />
                        <StepItem status="done" text="B4. 候选对象生成 (AI 识别)" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// --- 视图: 业务梳理 (TD-01) ---
const BusinessGoalsView = ({ setActiveModule }) => {
    const [goals, setGoals] = useState(mockBusinessGoals);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    const [newGoal, setNewGoal] = useState({
        title: '',
        type: '改革事项',
        priority: 'Medium',
        owner: '',
        description: ''
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const filterTabs = [
        { id: 'all', label: '全部' },
        { id: 'planning', label: '规划中' },
        { id: 'modeling', label: '建模中' },
        { id: 'implemented', label: '已落地' },
    ];

    const handleSave = () => {
        if (!newGoal.title) return;

        if (editMode && currentId) {
            setGoals(goals.map(g => g.id === currentId ? {
                ...g,
                ...newGoal,
                lastUpdate: new Date().toISOString().split('T')[0]
            } : g));
        } else {
            const goalData = {
                id: `G_${Date.now()}`,
                ...newGoal,
                status: 'planning',
                progress: 0,
                lastUpdate: new Date().toISOString().split('T')[0],
                relatedObjects: [],
                stages: { policy: false, object: false, scenario: false }
            };
            setGoals([goalData, ...goals]);
        }

        setIsModalOpen(false);
        setNewGoal({ title: '', type: '改革事项', priority: 'Medium', owner: '', description: '' });
        setEditMode(false);
        setCurrentId(null);
    };

    const handleCreateOpen = () => {
        setEditMode(false);
        setCurrentId(null);
        setNewGoal({ title: '', type: '改革事项', priority: 'Medium', owner: '', description: '' });
        setIsModalOpen(true);
    };

    const handleEdit = (goal) => {
        setEditMode(true);
        setCurrentId(goal.id);
        setNewGoal({
            title: goal.title,
            type: goal.type,
            priority: goal.priority,
            owner: goal.owner,
            description: goal.description
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (confirm('确定要删除此梳理事项吗？')) {
            setGoals(goals.filter(g => g.id !== id));
        }
    };

    const handleContinue = () => {
        setActiveModule('td_modeling');
    }

    const filteredGoals = goals.filter(goal => {
        const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            goal.owner.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || goal.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto animate-fade-in relative">
            {/* 补充统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <StatCard label="梳理事项总数" value={goals.length} trend="+12%" icon={List} color="blue" />
                <StatCard label="本周新增" value={2} trend="Active" icon={Plus} color="emerald" />
                <StatCard label="建模完成率" value="65%" trend="+5%" icon={CheckCircle} color="purple" />
                <StatCard label="涉及部门" value="5" trend="" icon={User} color="orange" />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">业务梳理</h2>
                    <p className="text-slate-500 mt-1">定义企业核心改革事项与政策文件，驱动自顶向下的数据建模。</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                        <Upload size={16} /> 导入政策文件
                    </button>
                    <button
                        onClick={handleCreateOpen}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                    >
                        <Plus size={16} /> 新建梳理事项
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <h3 className="font-bold text-slate-800 shrink-0">梳理清单</h3>
                        <div className="flex items-center bg-slate-200 rounded-lg p-1 gap-1">
                            {filterTabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setFilterStatus(tab.id)}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${filterStatus === tab.id
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="搜索事项名称或部门..."
                                className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 w-64 shadow-sm"
                            />
                        </div>
                        <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded border border-slate-200 bg-white">
                            <Filter size={16} />
                        </button>
                    </div>
                </div>

                <div className="divide-y divide-slate-100 flex-1">
                    {filteredGoals.length > 0 ? (
                        filteredGoals.map((goal) => (
                            <div key={goal.id} className="p-6 hover:bg-slate-50 transition-colors group relative">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className={`w-2.5 h-2.5 rounded-full ${goal.priority === 'High' ? 'bg-red-500 shadow-red-200 shadow-sm' :
                                                goal.priority === 'Medium' ? 'bg-orange-500 shadow-orange-200 shadow-sm' : 'bg-blue-500 shadow-blue-200 shadow-sm'
                                            }`}></span>
                                        <h4 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-2">
                                            {goal.title}
                                            <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all -ml-1" />
                                        </h4>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-medium border border-slate-200 text-slate-500 bg-white uppercase tracking-wide">
                                            {goal.type}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={handleContinue}
                                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                                        >
                                            <Play size={12} fill="currentColor" /> 继续梳理
                                        </button>
                                        <button
                                            onClick={() => handleEdit(goal)}
                                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(goal.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-slate-500 text-sm mb-5 max-w-3xl leading-relaxed pl-5 border-l-2 border-transparent group-hover:border-slate-200 transition-colors">
                                    {goal.description}
                                </p>

                                <div className="flex items-center justify-between pl-5">
                                    <div className="flex items-center gap-8">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-400 mr-1 font-medium">当前阶段:</span>

                                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${goal.stages?.policy ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-400'}`}>
                                                <FileText size={12} />
                                                <span className="text-xs">政策拆解</span>
                                            </div>
                                            <ArrowRight size={12} className="text-slate-300" />

                                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${goal.stages?.object ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-400'}`}>
                                                <Layout size={12} />
                                                <span className="text-xs">对象定义</span>
                                            </div>
                                            <ArrowRight size={12} className="text-slate-300" />

                                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${goal.stages?.scenario ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-400'}`}>
                                                <Layers size={12} />
                                                <span className="text-xs">场景编排</span>
                                            </div>
                                        </div>

                                        <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
                                            <span className="text-slate-300">|</span>
                                            <span className="text-slate-400">牵头部门:</span>
                                            <span>{goal.owner || '待定'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 w-32">
                                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${goal.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'
                                                    }`}
                                                style={{ width: `${goal.progress}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-mono font-medium text-slate-400 w-8 text-right">
                                            {goal.progress}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                            <Search size={48} className="mb-4 text-slate-200" />
                            <p>未找到匹配的梳理事项</p>
                            <button
                                onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
                                className="mt-2 text-sm text-blue-500 hover:underline"
                            >
                                清除筛选条件
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800">
                                {editMode ? '编辑梳理事项' : '新建业务梳理事项'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">事项名称 <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={newGoal.title}
                                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    placeholder="例如：残疾人服务一件事"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">类型</label>
                                    <select
                                        value={newGoal.type}
                                        onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    >
                                        <option value="改革事项">改革事项</option>
                                        <option value="政策文件">政策文件</option>
                                        <option value="重点任务">重点任务</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">优先级</label>
                                    <select
                                        value={newGoal.priority}
                                        onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    >
                                        <option value="High">High (高)</option>
                                        <option value="Medium">Medium (中)</option>
                                        <option value="Low">Low (低)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">牵头部门</label>
                                <input
                                    type="text"
                                    value={newGoal.owner}
                                    onChange={(e) => setNewGoal({ ...newGoal, owner: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    placeholder="例如：民政局"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
                                <textarea
                                    value={newGoal.description}
                                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm h-24 resize-none"
                                    placeholder="请输入事项的详细背景或目标..."
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!newGoal.title}
                                className={`px-4 py-2 text-sm text-white rounded-md transition-colors shadow-sm ${!newGoal.title ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
                            >
                                {editMode ? '保存修改' : '创建事项'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- 视图: 业务对象建模 (TD-03) ---
const BusinessModelingView = ({ businessObjects, setBusinessObjects }) => {
    const [selectedId, setSelectedId] = useState(businessObjects[0]?.id);
    const [activeTab, setActiveTab] = useState('structure');

    const activeObject = businessObjects.find(bo => bo.id === selectedId) || businessObjects[0];

    const handleDeleteField = (fieldId) => {
        if (!confirm('确定删除该属性吗？')) return;
        const updatedBO = {
            ...activeObject,
            fields: activeObject.fields.filter(f => f.id !== fieldId)
        };
        setBusinessObjects(businessObjects.map(bo => bo.id === activeObject.id ? updatedBO : bo));
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
        setBusinessObjects(businessObjects.map(bo => bo.id === activeObject.id ? updatedBO : bo));
    };

    return (
        <div className="flex h-full flex-col gap-6">
            {/* 补充统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 shrink-0">
                <StatCard label="业务对象总数" value={businessObjects.length} trend="+2" icon={Box} color="blue" />
                <StatCard label="已发布" value={businessObjects.filter(b => b.status === 'published').length} trend="Active" icon={CheckCircle} color="emerald" />
                <StatCard label="草稿中" value={businessObjects.filter(b => b.status === 'draft').length} trend="Pending" icon={Edit} color="orange" />
                <StatCard label="平均属性数" value="4.5" trend="" icon={List} color="purple" />
            </div>

            <div className="flex h-full gap-6 overflow-hidden">
                {/* Left: List */}
                <div className="w-64 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-800">业务对象列表</h3>
                        <button className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                            <Plus size={18} />
                        </button>
                    </div>
                    <div className="p-3 border-b border-slate-100">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input type="text" placeholder="搜索对象..." className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-400 transition-colors" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {businessObjects.map(bo => (
                            <div
                                key={bo.id}
                                onClick={() => setSelectedId(bo.id)}
                                className={`p-3 rounded-lg cursor-pointer transition-all border ${selectedId === bo.id
                                        ? 'bg-blue-50 border-blue-200 shadow-sm'
                                        : 'hover:bg-slate-50 border-transparent hover:border-slate-100'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`font-bold text-sm ${selectedId === bo.id ? 'text-blue-800' : 'text-slate-700'}`}>{bo.name}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${bo.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                        }`}>{bo.status === 'published' ? '已发布' : '草稿'}</span>
                                </div>
                                <div className="text-xs text-slate-400 font-mono mb-1">{bo.code}</div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                    <span className="bg-slate-100 px-1 rounded">{bo.version}</span>
                                    <span>{bo.fields.length} 属性</span>
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
                                <h2 className="text-xl font-bold text-slate-800">{activeObject.name}</h2>
                                <span className="text-sm font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                    {activeObject.code}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 max-w-2xl">{activeObject.description}</p>
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
                        <button
                            onClick={() => setActiveTab('preview')}
                            className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'preview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            数据预览 (Preview)
                        </button>
                    </div>

                    <div className="flex-1 bg-slate-50 p-6 overflow-y-auto">
                        {activeTab === 'structure' && (
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
                                        {activeObject.fields.map((field, idx) => (
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
                                    <div className="absolute left-1/4 top-1/2 -translate-y-1/2 bg-blue-100 border border-blue-300 text-blue-800 px-4 py-2 rounded-lg shadow-sm font-bold z-10">
                                        {activeObject.name}
                                    </div>
                                    <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-32 h-0.5 bg-slate-300"></div>
                                    <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white px-2 text-xs text-slate-400">1 : N</div>
                                    <div className="absolute right-1/4 top-1/2 -translate-y-1/2 bg-white border border-slate-300 text-slate-600 px-4 py-2 rounded-lg shadow-sm border-dashed">
                                        关联对象...
                                    </div>
                                </div>
                                <p className="mt-4 text-sm text-slate-500">可视化关系编辑器 (开发中)</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ScenarioOrchestrationView = () => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">场景编排 (Scenario Orchestration)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockScenarios.map(scenario => (
                <div key={scenario.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-lg">{scenario.name}</h3>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">{scenario.status}</span>
                    </div>
                    <p className="text-slate-500 text-sm mb-4">{scenario.description}</p>
                    <div className="space-y-2">
                        {scenario.nodes.map((node, i) => (
                            <div key={node.id} className="flex items-center text-sm">
                                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs mr-3">{i+1}</span>
                                <span className="font-medium">{node.label}</span>
                                {node.objectId && <span className="ml-2 text-xs bg-blue-50 text-blue-600 px-1 rounded">{node.objectId}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const DataSourceManagementView = ({ dataSources }) => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold text-slate-800">数据源管理</h2>
             <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">新建连接</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dataSources.map(ds => (
                <div key={ds.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${ds.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <h3 className="font-bold text-lg mb-1">{ds.name}</h3>
                    <div className="text-xs text-slate-400 font-mono mb-4">{ds.type} • {ds.host}</div>
                    <div className="flex justify-between items-center text-sm text-slate-500">
                        <span>{ds.dbName}</span>
                        <span>{ds.tableCount} tables</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const AssetScanningView = ({ candidates }) => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">资产扫描</h2>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                        <th className="px-6 py-3">资产名称</th>
                        <th className="px-6 py-3">类型</th>
                        <th className="px-6 py-3">数据量</th>
                        <th className="px-6 py-3">最后更新</th>
                        <th className="px-6 py-3">状态</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {mockScanAssets.map(asset => (
                        <tr key={asset.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-700">{asset.name}</td>
                            <td className="px-6 py-4 text-slate-500">Physical Table</td>
                            <td className="px-6 py-4 text-slate-500">{asset.rows}</td>
                            <td className="px-6 py-4 text-slate-500">{asset.updateTime}</td>
                            <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">{asset.status}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const CandidateGenerationView = ({ candidates }) => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">候选生成 (AI Recommendations)</h2>
        <div className="grid grid-cols-1 gap-4">
            {candidates.map(candidate => (
                <div key={candidate.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg text-slate-800">{candidate.suggestedName}</h3>
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">From: {candidate.sourceTable}</span>
                        </div>
                        <p className="text-slate-600 text-sm mb-3">{candidate.reason}</p>
                        <div className="flex gap-4">
                            <ScoreBar label="名称匹配" score={candidate.scores.nameMatch} />
                            <ScoreBar label="字段匹配" score={candidate.scores.fieldMatch} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                         <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm shadow-sm">采纳建议</button>
                         <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm">忽略</button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const MappingStudioView = () => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">映射工作台</h2>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                 <div className="w-1/3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                     <div className="font-bold text-blue-900 mb-2">业务对象: 新生儿</div>
                     <div className="space-y-2">
                         {mockBusinessObjects[0].fields.map(f => (
                             <div key={f.id} className="text-sm p-2 bg-white rounded border border-blue-200 flex justify-between">
                                 <span>{f.name}</span>
                                 <span className="text-xs text-slate-400">{f.type}</span>
                             </div>
                         ))}
                     </div>
                 </div>
                 <div className="text-slate-400"><GitMerge size={32} /></div>
                 <div className="w-1/3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                     <div className="font-bold text-emerald-900 mb-2">物理表: t_pop_base_info</div>
                     <div className="space-y-2">
                         {mockPhysicalTables[0].fields.map(f => (
                             <div key={f.name} className="text-sm p-2 bg-white rounded border border-emerald-200 flex justify-between">
                                 <span>{f.name}</span>
                                 <span className="text-xs text-slate-400">{f.type}</span>
                             </div>
                         ))}
                     </div>
                 </div>
             </div>
        </div>
    </div>
);

const ConflictDetectionView = () => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">冲突检测</h2>
        <div className="space-y-4">
            {mockConflicts.map(conflict => (
                <div key={conflict.id} className="bg-white p-4 rounded-xl border border-l-4 border-slate-200 shadow-sm flex items-start gap-4" style={{borderLeftColor: conflict.severity === 'High' ? '#ef4444' : '#f97316'}}>
                    <div className="mt-1 text-slate-500"><AlertTriangle size={20} /></div>
                    <div>
                        <h3 className="font-bold text-slate-800">{conflict.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">{conflict.desc}</p>
                        <div className="mt-2 flex gap-2 text-xs">
                            <span className="bg-slate-100 px-2 py-1 rounded">Object: {conflict.objectName}</span>
                            <span className="bg-slate-100 px-2 py-1 rounded">Asset: {conflict.assetName}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const DataCatalogView = () => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">统一元数据目录</h2>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
             <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                        <th className="px-6 py-3">名称</th>
                        <th className="px-6 py-3">类型</th>
                        <th className="px-6 py-3">所有者</th>
                        <th className="px-6 py-3">质量分</th>
                        <th className="px-6 py-3">状态</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {mockCatalogAssets.map(asset => (
                        <tr key={asset.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-700">
                                <div>{asset.name}</div>
                                <div className="text-xs text-slate-400">{asset.code}</div>
                            </td>
                            <td className="px-6 py-4 text-slate-500">{asset.type}</td>
                            <td className="px-6 py-4 text-slate-500">{asset.owner}</td>
                            <td className="px-6 py-4 text-slate-500">{asset.quality}</td>
                            <td className="px-6 py-4"><span className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs">{asset.status}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const DataLineageView = () => (
    <div className="h-full flex flex-col">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">全链路血缘</h2>
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center p-10">
            <div className="flex items-center gap-8">
                {mockLineage.nodes.map((node, i) => (
                    <React.Fragment key={node.id}>
                        <div className="flex flex-col items-center gap-2">
                             <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white ${
                                 node.type === 'source' ? 'bg-slate-500' : 
                                 node.type === 'table' ? 'bg-emerald-500' :
                                 node.type === 'object' ? 'bg-blue-500' : 'bg-purple-500'
                             }`}>
                                 {node.type === 'source' && <Server size={24} />}
                                 {node.type === 'table' && <Database size={24} />}
                                 {node.type === 'object' && <Box size={24} />}
                                 {node.type === 'api' && <Globe size={24} />}
                             </div>
                             <div className="text-xs text-center font-medium text-slate-600 w-24">{node.label}</div>
                        </div>
                        {i < mockLineage.nodes.length - 1 && (
                            <div className="h-px bg-slate-300 w-16"></div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    </div>
);

const ApiGatewayView = () => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">API 网关</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockApiServices.map(api => (
                <div key={api.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`px-2 py-1 text-xs font-bold rounded ${api.method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{api.method}</div>
                        <div className={`w-2 h-2 rounded-full ${api.status === 'Online' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                    </div>
                    <h3 className="font-bold text-slate-800 truncate" title={api.name}>{api.name}</h3>
                    <div className="text-xs text-slate-500 font-mono mb-4 truncate">{api.path}</div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-slate-100 pt-4">
                        <div>
                            <div className="text-slate-400">QPS</div>
                            <div className="font-bold">{api.qps}</div>
                        </div>
                        <div>
                            <div className="text-slate-400">Latency</div>
                            <div className="font-bold">{api.latency}</div>
                        </div>
                        <div>
                            <div className="text-slate-400">Errors</div>
                            <div className="font-bold">{api.errorRate}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const CacheStrategyView = () => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">缓存策略</h2>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                        <th className="px-6 py-3">策略名称</th>
                        <th className="px-6 py-3">目标对象</th>
                        <th className="px-6 py-3">类型</th>
                        <th className="px-6 py-3">TTL</th>
                        <th className="px-6 py-3">淘汰策略</th>
                        <th className="px-6 py-3">状态</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {mockCachePolicies.map(cp => (
                        <tr key={cp.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-700">{cp.name}</td>
                            <td className="px-6 py-4 text-slate-500">{cp.target}</td>
                            <td className="px-6 py-4 text-slate-500">{cp.type}</td>
                            <td className="px-6 py-4 text-slate-500">{cp.ttl}</td>
                            <td className="px-6 py-4 text-slate-500">{cp.eviction}</td>
                            <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs ${cp.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>{cp.status}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

// ==========================================
// 4. 主应用程序
// ==========================================

export default function SemanticLayerApp() {
    const [activeModule, setActiveModule] = useState('dashboard');
    const [businessObjects, setBusinessObjects] = useState(mockBusinessObjects);
    const [dataSources, setDataSources] = useState(mockDataSources);
    const [selectedBO, setSelectedBO] = useState(mockBusinessObjects[0]);
    const [showRuleEditor, setShowRuleEditor] = useState(null);
    const [candidates, setCandidates] = useState(mockAICandidates);
    const [showAssistant, setShowAssistant] = useState(false); // Default hidden

    const renderContent = () => {
        switch (activeModule) {
            case 'dashboard': return <DashboardView setActiveModule={setActiveModule} />;
            case 'td_goals': return <BusinessGoalsView setActiveModule={setActiveModule} />;
            case 'td_modeling': return <BusinessModelingView businessObjects={businessObjects} setBusinessObjects={setBusinessObjects} />;
            case 'td_scenario': return <ScenarioOrchestrationView businessObjects={businessObjects} />;
            case 'bu_connect': return <DataSourceManagementView dataSources={dataSources} setDataSources={setDataSources} />;
            case 'bu_discovery': return <AssetScanningView setActiveModule={setActiveModule} candidates={candidates} />;
            case 'bu_semantics': return <DataSemanticUnderstandingView />;
            case 'bu_candidates': return <CandidateGenerationView businessObjects={businessObjects} setBusinessObjects={setBusinessObjects} candidates={candidates} setCandidates={setCandidates} />;
            case 'mapping': return <MappingStudioView selectedBO={selectedBO} />;
            case 'governance': return <ConflictDetectionView setActiveModule={setActiveModule} />;
            case 'catalog': return <DataCatalogView />;
            case 'ee_api': return <ApiGatewayView />;
            case 'ee_cache': return <CacheStrategyView />;
            case 'lineage': return <DataLineageView />;
            default: return <DashboardView setActiveModule={setActiveModule} />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
            <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
            <div className="flex-1 flex flex-col min-w-0">
                <Header activeModule={activeModule} showAssistant={showAssistant} setShowAssistant={setShowAssistant} />
                <div className="flex-1 flex overflow-hidden relative">
                    <main className="flex-1 overflow-auto p-6 relative">
                        {renderContent()}
                    </main>
                    <AIAssistantPanel 
                        visible={showAssistant} 
                        onClose={() => setShowAssistant(false)} 
                        activeModule={activeModule}
                        contextData={{ businessObjects, dataSources, candidates }}
                    />
                </div>
            </div>
        </div>
    );
}