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
    BrainCircuit, Gauge, FileDigit, List, Bot, Send, MessageSquare, BadgeCheck,
    ChevronDown, ChevronUp, GripVertical, Folder, Check
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
        sourceId: 'DS_001',
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
        sourceId: 'DS_001',
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
        sourceId: 'DS_001',
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
        sourceId: 'DS_002',
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
// 5. 功能视图组件 (Feature Views)
// ==========================================

// --- 视图: 数据语义理解 (BU-03) ---
const DataSemanticUnderstandingView = ({ setActiveModule, businessObjects, setBusinessObjects, dataSources, scanAssets, setScanAssets }) => {
    const [selectedTableId, setSelectedTableId] = useState(scanAssets[0]?.id);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [expandedSources, setExpandedSources] = useState(new Set(dataSources.map(ds => ds.id)));
    const [expandedTypes, setExpandedTypes] = useState(new Set(dataSources.map(ds => ds.type)));
    const [searchTerm, setSearchTerm] = useState("");
    
    // Enrich mock assets with sourceId if not present (handled in global mock data, ensuring here)
    const selectedTable = scanAssets.find(t => t.id === selectedTableId);
    const selectedDataSource = dataSources.find(ds => ds.id === selectedTable?.sourceId);

    // State for the AI result being viewed/edited
    // If the table already has a semantic profile (saved), load it. Otherwise, use temporary AI result.
    const [currentResult, setCurrentResult] = useState<any>(null);
    const [editMode, setEditMode] = useState(false);
    const [editableResult, setEditableResult] = useState<any>(null);

    // Effect: When table selection changes, load existing semantic data if present
    useEffect(() => {
        if (selectedTable?.semanticProfile) {
            setCurrentResult(selectedTable.semanticProfile);
            setEditableResult(selectedTable.semanticProfile);
            setEditMode(false); // Default to view mode for saved assets
        } else {
            setCurrentResult(null);
            setEditableResult(null);
            setEditMode(true);
        }
    }, [selectedTableId, selectedTable]);

    const toggleType = (type) => {
        const newSet = new Set(expandedTypes);
        if (newSet.has(type)) newSet.delete(type);
        else newSet.add(type);
        setExpandedTypes(newSet);
    };

    const toggleSource = (sourceId) => {
        const newExpanded = new Set(expandedSources);
        if (newExpanded.has(sourceId)) {
            newExpanded.delete(sourceId);
        } else {
            newExpanded.add(sourceId);
        }
        setExpandedSources(newExpanded);
    };

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
            setCurrentResult(result);
            setEditableResult(result); // Populate editable form
            setEditMode(true); // Switch to edit mode for review
        } catch (error) {
            console.error("AI Analysis Failed", error);
            alert("AI 分析请求失败，请检查 API Key 或网络连接。");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSaveToMetadata = () => {
        if (!editableResult || !selectedTable) return;

        // Save logic: update scanAssets state with new semanticProfile
        const updatedAssets = scanAssets.map(asset => {
            if (asset.id === selectedTableId) {
                return {
                    ...asset,
                    semanticProfile: editableResult, // Persist the edited result
                    isSemanticEnriched: true
                };
            }
            return asset;
        });

        setScanAssets(updatedAssets);
        setCurrentResult(editableResult);
        setEditMode(false);
        alert(`成功！表 ${selectedTable.name} 的业务语义已更新并保存至物理元数据。`);
    };

    const handleApplyToModel = () => {
        if (!currentResult || !selectedTable) return;
        
        // This function creates a NEW Business Object based on the semantic data
        const mapSqlTypeToBusinessType = (sqlType) => {
             const lower = sqlType.toLowerCase();
             if (lower.includes('char') || lower.includes('text')) return 'String';
             if (lower.includes('int') || lower.includes('bigint')) return 'Integer';
             if (lower.includes('date') || lower.includes('time')) return 'DateTime';
             if (lower.includes('decimal') || lower.includes('numeric')) return 'Decimal';
             return 'String';
        };

        const newBO = {
            id: `BO_AI_${Date.now()}`,
            name: currentResult.businessName,
            code: `biz_${selectedTable.name.replace(/^t_/, '')}`,
            domain: currentResult.scenarios?.[0] || 'AI Generated',
            owner: 'AI Assistant',
            status: 'draft',
            version: 'v0.1',
            description: currentResult.description,
            sourceTables: [selectedTable.name],
            fields: selectedTable.columns.map((col, idx) => {
                const isCore = currentResult.coreFields?.find(cf => cf.field === col.name);
                return {
                    id: `f_${Date.now()}_${idx}`,
                    name: col.comment || col.name,
                    code: col.name,
                    type: mapSqlTypeToBusinessType(col.type),
                    length: '-',
                    required: false,
                    desc: isCore ? isCore.reason : col.comment
                };
            })
        };

        setBusinessObjects(prev => [newBO, ...prev]);
        alert(`已基于语义分析生成业务对象：${newBO.name}`);
        setActiveModule('td_modeling');
    };

    // Prepare data for tree view
    const filteredAssets = scanAssets.filter(asset => 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        asset.comment.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sourcesWithTables = dataSources.map(ds => {
        const tables = filteredAssets.filter(asset => asset.sourceId === ds.id);
        return { ...ds, tables };
    }).filter(ds => ds.tables.length > 0 || searchTerm === "");

    const groupedTreeData = Object.entries(
        sourcesWithTables.reduce((acc, ds) => {
            if (!acc[ds.type]) acc[ds.type] = [];
            acc[ds.type].push(ds);
            return acc;
        }, {})
    ).map(([type, sources]) => ({ type, sources }));

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center shrink-0">
               <div>
                 <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <BrainCircuit className="text-pink-500" /> 数据语义理解
                 </h2>
                 <p className="text-sm text-slate-500 mt-1">基于 AI 大模型，深度解析物理资产的业务含义，并回写至技术元数据。</p>
               </div>
               <div className="flex gap-4">
                  <StatCard label="待分析表" value={scanAssets.filter(a => !a.isSemanticEnriched).length} trend="Pending" icon={Database} color="blue" />
                  <StatCard label="已智能解析" value={scanAssets.filter(a => a.isSemanticEnriched).length} trend="Saved" icon={Sparkles} color="purple" />
               </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Left: Tree View of Data Sources & Tables */}
                <div className="w-80 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input 
                                type="text" 
                                placeholder="搜索数据源或表..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20" 
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {groupedTreeData.map(group => (
                            <div key={group.type} className="border-b border-slate-100 last:border-0">
                                {/* Type Header */}
                                <div 
                                    onClick={() => toggleType(group.type)}
                                    className="flex items-center justify-between px-4 py-2.5 bg-slate-50/80 cursor-pointer hover:bg-slate-100 transition-colors border-b border-slate-50"
                                >
                                     <div className="flex items-center gap-2">
                                         <Layers size={14} className="text-slate-400" />
                                         <span className="font-bold text-xs text-slate-600 uppercase tracking-wide">{group.type}</span>
                                     </div>
                                     {expandedTypes.has(group.type) ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                                </div>

                                {expandedTypes.has(group.type) && (
                                    <div>
                                        {group.sources.map(ds => (
                                            <div key={ds.id} className="border-b border-slate-50 last:border-0">
                                                <div 
                                                    onClick={() => toggleSource(ds.id)}
                                                    className="flex items-center justify-between px-4 py-2 pl-8 cursor-pointer hover:bg-slate-50 transition-colors group"
                                                >
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <Database size={14} className="text-blue-500 flex-shrink-0" />
                                                        <span className="text-sm text-slate-700 truncate" title={ds.name}>{ds.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 rounded-full">{ds.tables.length}</span>
                                                        {expandedSources.has(ds.id) ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                                                    </div>
                                                </div>

                                                {expandedSources.has(ds.id) && (
                                                    <div className="bg-slate-50/30 pb-2">
                                                        {ds.tables.map(t => (
                                                            <div 
                                                                key={t.id} 
                                                                onClick={() => setSelectedTableId(t.id)}
                                                                className={`pl-14 pr-4 py-2 cursor-pointer flex items-center justify-between group transition-all ${
                                                                    selectedTableId === t.id 
                                                                    ? 'bg-pink-50 border-r-2 border-pink-500 text-pink-700' 
                                                                    : 'hover:bg-slate-100 border-r-2 border-transparent text-slate-600'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <Table size={14} className={selectedTableId === t.id ? 'text-pink-500' : 'text-slate-400'} />
                                                                    <span className={`text-sm truncate ${selectedTableId === t.id ? 'font-medium' : ''}`} title={t.name}>{t.name}</span>
                                                                </div>
                                                                {t.isSemanticEnriched ? (
                                                                     <BrainCircuit size={14} className="text-emerald-500 flex-shrink-0" title="已语义化" />
                                                                ) : null}
                                                            </div>
                                                        ))}
                                                        {ds.tables.length === 0 && (
                                                            <div className="pl-14 pr-4 py-2 text-xs text-slate-400 italic">未找到匹配的表</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {groupedTreeData.length === 0 && (
                             <div className="p-8 text-center text-slate-400 text-sm">
                                <Database size={32} className="mx-auto mb-2 opacity-20" />
                                未找到匹配的数据资产
                             </div>
                        )}
                    </div>
                </div>

                {/* Right: Analysis Panel */}
                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                    {/* Top Action Bar */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center shrink-0">
                         <div className="flex flex-col gap-1">
                             <div className="flex items-center text-xs text-slate-500 mb-1">
                                 <Database size={12} className="mr-1"/>
                                 <span>{selectedDataSource?.name || 'Unknown Source'}</span>
                                 <ChevronRight size={10} className="mx-1"/>
                                 <span className="font-bold text-slate-700">{selectedTable?.name || 'No Table Selected'}</span>
                             </div>
                             <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-slate-100 rounded-lg"><Table size={18} className="text-slate-600"/></div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 leading-none">{selectedTable?.name}</h3>
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        Rows: {selectedTable?.rows} • Updated: {selectedTable?.updateTime} • {selectedTable?.comment || '无注释'}
                                    </p>
                                </div>
                             </div>
                         </div>
                         <button 
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !selectedTable}
                            className={`px-5 py-2.5 rounded-lg text-white font-medium flex items-center gap-2 shadow-sm transition-all ${
                                isAnalyzing || !selectedTable 
                                ? 'bg-slate-400 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:shadow-pink-200'
                            }`}
                         >
                            {isAnalyzing ? <RefreshCw size={18} className="animate-spin"/> : <Sparkles size={18} />}
                            {isAnalyzing ? 'AI 重新分析' : 'AI 语义理解'}
                         </button>
                    </div>

                    <div className="flex-1 flex gap-4 overflow-hidden">
                        {/* Schema View */}
                        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
                             {/* ... Schema Table same as before ... */}
                            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 font-bold text-sm text-slate-700 flex items-center justify-between">
                                <span>物理元数据 (Schema)</span>
                                <span className="text-xs font-normal text-slate-400">{selectedTable?.columns.length || 0} columns</span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-0 custom-scrollbar">
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
                                {!selectedTable && (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                        <Move size={32} className="mb-2 opacity-20"/>
                                        <p className="text-sm">请从左侧选择一个数据表</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* AI Result View (Editable) */}
                        <div className="flex-1 bg-gradient-to-br from-white to-purple-50 border border-purple-100 rounded-xl shadow-sm flex flex-col overflow-hidden relative">
                             <div className="px-4 py-3 border-b border-purple-100 bg-purple-50/50 font-bold text-sm text-purple-800 flex items-center justify-between">
                                <div className="flex items-center gap-2"><BrainCircuit size={16}/> 语义理解结果</div>
                                {currentResult && !editMode && (
                                    <button onClick={() => setEditMode(true)} className="text-xs text-purple-600 underline">编辑内容</button>
                                )}
                             </div>
                             
                             {editableResult ? (
                                 <div className="flex-1 overflow-y-auto p-5 space-y-5 animate-fade-in custom-scrollbar">
                                     <div>
                                         <label className="text-xs font-bold text-purple-400 uppercase tracking-wider">建议业务名称</label>
                                         {editMode ? (
                                             <input 
                                                value={editableResult.businessName}
                                                onChange={(e) => setEditableResult({...editableResult, businessName: e.target.value})}
                                                className="w-full mt-1 px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:border-purple-500 text-slate-800 font-bold"
                                             />
                                         ) : (
                                             <div className="text-xl font-bold text-slate-800 mt-1">{editableResult.businessName}</div>
                                         )}
                                     </div>
                                     
                                     <div>
                                         <label className="text-xs font-bold text-purple-400 uppercase tracking-wider">业务含义描述</label>
                                         {editMode ? (
                                             <textarea
                                                value={editableResult.description}
                                                onChange={(e) => setEditableResult({...editableResult, description: e.target.value})}
                                                rows={3}
                                                className="w-full mt-1 px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm text-slate-600"
                                             />
                                         ) : (
                                             <p className="text-sm text-slate-600 mt-1 leading-relaxed bg-white/50 p-3 rounded-lg border border-purple-100">
                                                 {editableResult.description}
                                             </p>
                                         )}
                                     </div>

                                     <div>
                                         <label className="text-xs font-bold text-purple-400 uppercase tracking-wider">适用场景 & 标签</label>
                                         {editMode ? (
                                             <div className="mt-1 space-y-2">
                                                 <input 
                                                    value={editableResult.scenarios?.join(', ')}
                                                    onChange={(e) => setEditableResult({...editableResult, scenarios: e.target.value.split(',').map(s=>s.trim())})}
                                                    placeholder="场景 (逗号分隔)"
                                                    className="w-full px-3 py-2 border border-purple-200 rounded-lg text-xs"
                                                 />
                                             </div>
                                         ) : (
                                             <div className="flex flex-wrap gap-2 mt-2">
                                                 {editableResult.scenarios?.map(s => (
                                                     <span key={s} className="px-2.5 py-1 bg-white border border-purple-200 text-purple-700 text-xs rounded-full shadow-sm">{s}</span>
                                                 ))}
                                             </div>
                                         )}
                                     </div>

                                     <div className="bg-purple-50/50 rounded-lg p-3 border border-purple-100">
                                          <label className="text-xs font-bold text-purple-400 uppercase tracking-wider">核心字段识别</label>
                                          <ul className="mt-2 space-y-2">
                                              {editableResult.coreFields?.map((f, i) => (
                                                  <li key={i} className="text-xs flex gap-2 items-start">
                                                      <span className="font-mono font-bold text-slate-700 bg-white border border-purple-100 px-1 rounded">{f.field}</span>
                                                      <span className="text-slate-500">- {f.reason}</span>
                                                  </li>
                                              ))}
                                          </ul>
                                     </div>

                                     <div className="pt-4 border-t border-purple-100 flex flex-col gap-2">
                                         {editMode ? (
                                            <button 
                                                onClick={handleSaveToMetadata}
                                                className="w-full py-2.5 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 shadow-sm transition-colors flex items-center justify-center gap-2 font-bold"
                                            >
                                                <Check size={16} /> 确认并回写元数据 (Confirm & Save)
                                            </button>
                                         ) : (
                                            <div className="flex items-center gap-2 justify-center text-xs text-emerald-600 bg-emerald-50 py-2 rounded-lg border border-emerald-100 mb-2">
                                                <CheckCircle size={14} /> 已保存至物理元数据
                                            </div>
                                         )}
                                         
                                         <button 
                                            onClick={handleApplyToModel}
                                            className="w-full py-2 bg-white border border-purple-200 text-purple-700 rounded-lg text-sm hover:bg-purple-50 shadow-sm transition-colors flex items-center justify-center gap-2"
                                         >
                                             <Box size={16} /> 基于此生成业务对象 (Create BO)
                                         </button>
                                     </div>
                                 </div>
                             ) : (
                                 <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                                     <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 text-purple-400">
                                         <Sparkles size={32} />
                                     </div>
                                     <p className="text-sm">点击上方“AI 语义理解”按钮<br/>AI 将自动分析表结构并生成业务解释</p>
                                 </div>
                             )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 6. Main App Component
// ==========================================

const SemanticLayerApp = () => {
    const [activeModule, setActiveModule] = useState('bu_semantics');
    const [showAssistant, setShowAssistant] = useState(false);
    
    // State lifting for mock data to be shared across views
    const [businessObjects, setBusinessObjects] = useState(mockBusinessObjects);
    const [dataSources, setDataSources] = useState(mockDataSources);
    const [scanAssets, setScanAssets] = useState(mockScanAssets);

    // Prepare context data for AI
    const contextData = {
        businessObjects,
        dataSources,
        candidates: mockAICandidates,
        scanAssets
    };

    const renderContent = () => {
        switch (activeModule) {
            case 'bu_semantics':
                return (
                    <DataSemanticUnderstandingView 
                        setActiveModule={setActiveModule}
                        businessObjects={businessObjects}
                        setBusinessObjects={setBusinessObjects}
                        dataSources={dataSources}
                        scanAssets={scanAssets}
                        setScanAssets={setScanAssets}
                    />
                );
            case 'dashboard':
                return (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8">
                        <Activity size={48} className="mb-4 opacity-50" />
                        <h2 className="text-xl font-bold text-slate-700">Dashboard</h2>
                        <p className="mt-2 text-center">Welcome to SemanticLink Enterprise Platform.<br/>Please navigate to "Data Semantic Understanding" to try the AI features.</p>
                    </div>
                );
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8">
                         <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                             <Settings size={32} />
                         </div>
                         <h3 className="text-slate-700 font-bold text-lg">Module: {activeModule}</h3>
                         <p>This module is not yet implemented in this preview.</p>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-600">
            <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
            
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <Header 
                    activeModule={activeModule} 
                    showAssistant={showAssistant} 
                    setShowAssistant={setShowAssistant} 
                />
                
                <main className="flex-1 overflow-hidden p-6 relative z-0">
                    {renderContent()}
                </main>
                
                {/* AI Assistant Overlay/Panel */}
                <div className={`absolute top-0 right-0 h-full z-30 pointer-events-none`}>
                   <div className={`h-full bg-white shadow-2xl transition-transform duration-300 transform ${showAssistant ? 'translate-x-0' : 'translate-x-full'} pointer-events-auto`}>
                       <AIAssistantPanel 
                           visible={true} // Visibility handled by parent container transform
                           onClose={() => setShowAssistant(false)}
                           activeModule={activeModule}
                           contextData={contextData}
                       />
                   </div>
                </div>
            </div>
        </div>
    );
};

export default SemanticLayerApp;