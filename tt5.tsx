import React, { useState, useEffect, useRef, useMemo } from 'react';
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
    ChevronDown, ChevronUp, GripVertical, Folder, Check, MessageCircle, ToggleLeft, ToggleRight,
    PanelLeftClose, PanelLeftOpen, Key, Building2, EyeOff, Hash, Type as TypeIcon, Calendar
} from 'lucide-react';

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
    { id: 'AS_001', name: '新生儿 (Newborn)', type: 'Business Object', code: 'biz_newborn', owner: '卫健委业务处', quality: 98, status: 'published', tags: ['核心对象', '出生一件事', 'L1'], desc: '自然人出生登记的核心业务对象', stats: '5 字段 4 映射' },
    { id: 'AS_002', name: '出生医学证明', type: 'Business Object', code: 'biz_birth_cert', owner: '医院管理处', quality: 85, status: 'draft', tags: ['证照', '出生一件事'], desc: '出生医学证明相关业务对象', stats: '0 字段 0 映射' },
    { id: 'AS_003', name: '订单 (Order)', type: 'Business Object', code: 'biz_order', owner: '电商运营', quality: 92, status: 'published', tags: ['核心对象', '电商', 'L1'], desc: '电商订单核心业务对象', stats: '8 字段 6 映射' },
    { id: 'AS_004', name: 't_pop_base_info_2024', type: 'Physical Table', code: 't_pop_base_info_2024', owner: 'DBA Team', quality: 100, status: 'active', tags: ['人口库', '基础表'], desc: '人口基础信息表（2024年度）', stats: '7 字段 4 映射' },
    { id: 'AS_005', name: 't_order_main', type: 'Physical Table', code: 't_order_main', owner: 'DBA Team', quality: 95, status: 'active', tags: ['订单库', '核心表', '高频访问'], desc: '订单主表，存储订单核心信息', stats: '12 字段 6 映射' },
    { id: 'AS_006', name: 't_user_info', type: 'Physical Table', code: 't_user_info', owner: 'DBA Team', quality: 90, status: 'active', tags: ['用户库', '基础表', '敏感数据'], desc: '用户基础信息表', stats: '15 字段 3 映射' },
    { id: 'AS_007', name: '新生儿 → t_pop_base_info', type: 'Mapping', code: 'map_newborn_pop', owner: 'System', quality: 100, status: 'active', tags: ['核心映射', '已验证'], desc: '新生儿业务对象与人口表的映射关系', stats: '4 字段' },
    { id: 'AS_008', name: '订单 → t_order_main', type: 'Mapping', code: 'map_order_main', owner: 'System', quality: 100, status: 'active', tags: ['核心映射', '已验证', '高性能'], desc: '订单业务对象与订单主表的映射关系', stats: '6 字段' },
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

const StatCard = ({ label, value, trend, icon: Icon, color }: any) => {
    const colorMap: any = {
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

const StepItem = ({ status, text }: any) => (
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

const BookIcon = ({ size, className }: any) => (
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

const ScoreBar = ({ label, score }: any) => (
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

const Sidebar = ({ activeModule, setActiveModule, isCollapsed, setIsCollapsed }: any) => {
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
                { id: 'bu_semantics', label: '逻辑视图 (BU-03)', icon: BrainCircuit },
                { id: 'bu_candidates', label: '候选生成 (BU-04)', icon: Sparkles },
            ]
        },
        {
            title: 'SG 语义治理中心',
            color: 'text-purple-400',
            items: [
                { id: 'mapping', label: '映射工作台 (SG-01)', icon: GitMerge },
                { id: 'governance', label: '冲突检测 (SG-02)', icon: Shield },
                { id: 'catalog', label: '数据服务超市 (SG-04)', icon: BookIcon },
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
        <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shadow-xl z-20 flex-shrink-0 transition-all duration-300`}>
            {/* Header */}
            <div className="h-16 flex items-center px-4 border-b border-slate-800 justify-between overflow-hidden">
                <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''}`}>
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Link className="text-white" size={18} />
                    </div>
                    {!isCollapsed && (
                        <div className="ml-3 animate-fade-in whitespace-nowrap">
                            <h1 className="font-bold text-white tracking-tight">SemanticLink</h1>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Enterprise Edition</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 custom-scrollbar overflow-x-hidden">
                {menus.map((group, idx) => (
                    <div key={idx} className={`mb-6 ${isCollapsed ? 'px-2' : 'px-4'}`}>
                        {!isCollapsed ? (
                            <h3 className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${group.color || 'text-slate-500'} animate-fade-in`}>
                                {group.title}
                            </h3>
                        ) : (
                            <div className="h-4"></div> /* Spacer when collapsed */
                        )}
                        <div className="space-y-1">
                            {group.items.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveModule(item.id)}
                                    title={isCollapsed ? item.label : ''}
                                    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2 rounded-md text-sm transition-all duration-200 ${activeModule === item.id
                                            ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                                            : 'hover:bg-slate-800/50 hover:text-white'
                                        }`}
                                >
                                    <item.icon size={20} strokeWidth={1.5} className={activeModule === item.id && isCollapsed ? group.color?.replace('text-', 'text-') : ''} />
                                    {!isCollapsed && <span className="animate-fade-in whitespace-nowrap">{item.label}</span>}
                                    {!isCollapsed && activeModule === item.id && <ChevronRight size={14} className="ml-auto opacity-50" />}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer with Toggle & Profile */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex flex-col gap-4">
                 <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="flex items-center justify-center p-2 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors"
                    title={isCollapsed ? "展开菜单" : "收起菜单"}
                >
                    {isCollapsed ? <PanelLeftOpen size={20} /> : <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider"><PanelLeftClose size={16} /> <span>收起菜单</span></div>}
                </button>

                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white flex-shrink-0">
                        JD
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 animate-fade-in min-w-0">
                            <div className="text-sm font-medium text-white truncate">John Doe</div>
                            <div className="text-xs text-slate-500 truncate">Chief Data Architect</div>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

const Header = ({ activeModule, showAssistant, setShowAssistant }: any) => {
    const getTitle = (id: any) => {
        switch (id) {
            case 'td_goals': return '业务梳理';
            case 'td_modeling': return '业务对象建模';
            case 'td_scenario': return '场景编排';
            case 'bu_connect': return '数据源管理';
            case 'bu_discovery': return '资产扫描';
            case 'bu_semantics': return '逻辑视图';
            case 'bu_candidates': return '候选生成';
            case 'mapping': return '映射工作台';
            case 'governance': return '冲突检测与治理';
            case 'catalog': return '数据服务超市';
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

const AIAssistantPanel = ({ visible, onClose, activeModule, contextData }: any) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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

        // 模拟AI响应
        setTimeout(() => {
            const mockResponse = "这是一个模拟的AI响应。在实际环境中，这里会调用真正的AI服务来分析您的问题。";
            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                text: mockResponse, 
                sender: 'ai', 
                timestamp: new Date().toLocaleTimeString() 
            }]);
            setIsLoading(false);
        }, 1000);
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

// --- 视图: 数据语义理解 (BU-03) ---
const DataSemanticUnderstandingView = ({ setActiveModule, businessObjects, setBusinessObjects, dataSources, scanAssets, setScanAssets }: any) => {
    const [viewMode, setViewMode] = useState<'source' | 'cluster'>('source');
    const [selectedNode, setSelectedNode] = useState<string | null>(null); // 'DS_ID' or 'ClusterName' or 'Type' or null (for all)
    const [expandedTableId, setExpandedTableId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBatchAnalyzing, setIsBatchAnalyzing] = useState(false);
    
    // Helper to get cluster name
    const getSimpleClusterName = (tableName: string) => {
        const lower = tableName.toLowerCase();
        if (lower.includes('newborn') || lower.includes('birth') || lower.includes('pop')) return '出生一件事 (Birth Event)';
        if (lower.includes('vac')) return '疫苗管理 (Vaccine)';
        if (lower.includes('hosp') || lower.includes('dict')) return '基础资源 (Resources)';
        if (lower.includes('order')) return '电商业务 (E-commerce)';
        if (lower.includes('user')) return '用户中心 (User Center)';
        return '未分类 (Uncategorized)';
    };

    // Prepare Left Tree Data
    const treeData = useMemo(() => {
        if (viewMode === 'source') {
            // Group by DB Type -> Data Sources
            const grouped = dataSources.reduce((acc: any, ds: any) => {
                if (!acc[ds.type]) acc[ds.type] = [];
                acc[ds.type].push(ds);
                return acc;
            }, {});
            return Object.entries(grouped).map(([type, dss]) => ({
                id: type,
                label: type,
                type: 'root',
                children: (dss as any[]).map(ds => ({ id: ds.id, label: ds.name, type: 'node' }))
            }));
        } else {
            // Group by Cluster -> Tables (Count)
            // Need to scan all assets to find unique clusters
            const clusters = new Set<string>();
            scanAssets.forEach((t: any) => {
                const cluster = t.semanticProfile?.clusterSuggestion || getSimpleClusterName(t.name);
                clusters.add(cluster);
            });
            return Array.from(clusters).map(cluster => ({
                id: cluster,
                label: cluster,
                type: 'node'
            }));
        }
    }, [viewMode, dataSources, scanAssets]);

    // Prepare Right List Data
    const tableList = useMemo(() => {
        let filtered = scanAssets;
        if (selectedNode) {
            if (viewMode === 'source') {
                // Check if selectedNode is a Type (root) or specific DS (node)
                // Filter by Type
                const validDsIdsByType = dataSources.filter((ds: any) => ds.type === selectedNode).map((ds: any) => ds.id);
                
                if (validDsIdsByType.length > 0) {
                     filtered = filtered.filter((t: any) => validDsIdsByType.includes(t.sourceId));
                } else {
                     // Filter by Source ID
                     filtered = filtered.filter((t: any) => t.sourceId === selectedNode);
                }
            } else {
                // Cluster mode
                filtered = filtered.filter((t: any) => {
                    const cluster = t.semanticProfile?.clusterSuggestion || getSimpleClusterName(t.name);
                    return cluster === selectedNode;
                });
            }
        }
        
        if (searchTerm) {
            filtered = filtered.filter((t: any) => 
                t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                t.comment.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return filtered;
    }, [selectedNode, viewMode, scanAssets, dataSources, searchTerm]);

    // Selection Logic
    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleAll = () => {
        if (selectedIds.size === tableList.length && tableList.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(tableList.map((t: any) => t.id)));
        }
    };

    // AI Semantic Logic (Embedded in Table Row)
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editableResult, setEditableResult] = useState<any>(null);
    const [aiVisibleTableId, setAiVisibleTableId] = useState<string | null>(null); // Controls collapse of AI section

    const runBatchAnalysis = async () => {
        if (selectedIds.size === 0) return;
        setIsBatchAnalyzing(true);
        
        // Filter tables that need analysis (selected)
        const targets = scanAssets.filter((t: any) => selectedIds.has(t.id));
        
        // const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // 模拟批量分析
        setTimeout(() => {
            alert(`已完成对 ${targets.length} 个表的批量AI分析（模拟）`);
            setIsBatchAnalyzing(false);
        }, 2000);
        
        // Deep copy assets to modify locally then update state
        let updatedAssets = [...scanAssets];

        for (const table of targets) {
             // Optional: Skip if already enriched, or allow re-analysis. Let's allow re-analysis but log it.
             try {
                // 模拟AI分析结果
                const result = {
                    businessName: `${table.comment || table.name}（业务视图）`,
                    description: `这是对表 ${table.name} 的模拟分析结果`,
                    scenarios: ["场景1", "场景2"],
                    tags: ["标签1", "标签2"],
                    coreFields: [
                        { field: "id", reason: "主键字段", semanticType: "PK" },
                        { field: "create_time", reason: "创建时间", semanticType: "EventTime" }
                    ],
                    clusterSuggestion: "基础数据"
                };
                
                // Update local array
                const index = updatedAssets.findIndex(a => a.id === table.id);
                if (index !== -1) {
                    updatedAssets[index] = {
                        ...updatedAssets[index],
                        semanticProfile: result,
                        isSemanticEnriched: true
                    };
                }
                // Update state incrementally to show progress visual (optional, but good UX)
                setScanAssets([...updatedAssets]);
             } catch (e) {
                 console.error("Batch error for " + table.name, e);
             }
        }
        
        setIsBatchAnalyzing(false);
        setSelectedIds(new Set()); // Clear selection after done
        alert(`批量分析完成！已处理 ${targets.length} 张表。`);
    };

    const handleAnalyze = async (table: any) => {
        setIsAnalyzing(true);
        setAiVisibleTableId(table.id); // Auto-expand AI section
        
        // 模拟AI分析
        setTimeout(() => {
            const mockResult = {
                businessName: `${table.comment || table.name}（业务视图）`,
                description: `这是对表 ${table.name} 的模拟AI分析结果。在实际环境中，这里会包含详细的语义分析。`,
                scenarios: ["场景1", "场景2"],
                tags: ["标签1", "标签2"],
                coreFields: [
                    { field: "id", reason: "主键字段", semanticType: "PK" },
                    { field: "create_time", reason: "创建时间", semanticType: "EventTime" }
                ],
                clusterSuggestion: "基础数据"
            };
            
            setEditableResult(mockResult);
            setEditMode(true);
            setIsAnalyzing(false);
        }, 1500);
    };

    const handleSaveAI = (tableId: string) => {
        if (!editableResult) return;
        const updatedAssets = scanAssets.map((asset: any) => {
            if (asset.id === tableId) {
                return {
                    ...asset,
                    semanticProfile: editableResult,
                    isSemanticEnriched: true
                };
            }
            return asset;
        });
        setScanAssets(updatedAssets);
        setEditMode(false);
        setEditableResult(null);
    };

    // Helper for semantic icons
    const getSemanticIcon = (type?: string) => {
        if (type === 'PK') return <Key size={12} className="text-amber-500 flex-shrink-0" />;
        if (type === 'EventTime') return <Clock size={12} className="text-blue-500 flex-shrink-0" />;
        return null;
    };

    const getFieldTypeIcon = (type: string) => {
        const t = type.toLowerCase();
        if (t.includes('int') || t.includes('decimal') || t.includes('numeric')) return <Hash size={12} className="text-blue-500"/>;
        if (t.includes('date') || t.includes('time')) return <Calendar size={12} className="text-orange-500"/>;
        return <TypeIcon size={12} className="text-slate-400"/>;
    }

    return (
        <div className="space-y-4 h-full flex flex-col">
            <div className="flex justify-between items-end shrink-0 px-1">
               <div>
                 <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <BrainCircuit className="text-pink-500" size={24} /> 逻辑视图
                 </h2>
                 <p className="text-xs text-slate-500 mt-1 ml-8">深度解析物理资产的业务含义，建立物理到逻辑的映射。</p>
               </div>
               <div className="flex gap-4">
                  <div className="bg-white border border-blue-100 rounded-lg px-4 py-2 flex items-center gap-3 shadow-sm">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md"><Database size={16}/></div>
                      <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">总表数</div>
                          <div className="text-lg font-bold text-slate-700 leading-none">{scanAssets.length}</div>
                      </div>
                  </div>
                  <div className="bg-white border border-purple-100 rounded-lg px-4 py-2 flex items-center gap-3 shadow-sm">
                      <div className="p-1.5 bg-purple-50 text-purple-600 rounded-md"><Sparkles size={16}/></div>
                      <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">已语义化</div>
                          <div className="text-lg font-bold text-slate-700 leading-none">{scanAssets.filter((a: any) => a.isSemanticEnriched).length}</div>
                      </div>
                  </div>
               </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Left: Navigation Tree */}
                <div className="w-72 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden shrink-0">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <div className="flex bg-slate-200 p-0.5 rounded-lg mb-3">
                            <button 
                                onClick={() => { setViewMode('source'); setSelectedNode(null); }}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1 ${viewMode === 'source' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Database size={12} /> 数据源视图
                            </button>
                            <button 
                                onClick={() => { setViewMode('cluster'); setSelectedNode(null); }}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1 ${viewMode === 'cluster' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Folder size={12} /> 聚类视图
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input 
                                type="text" 
                                placeholder="搜索表..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20" 
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div 
                            onClick={() => setSelectedNode(null)}
                            className={`px-4 py-2.5 cursor-pointer text-sm font-medium border-b border-slate-50 flex items-center gap-2 ${selectedNode === null ? 'bg-pink-50 text-pink-700' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Layers size={14}/> 全部资产 ({scanAssets.length})
                        </div>
                        {viewMode === 'source' ? (
                            treeData.map((node: any) => (
                                <div key={node.id}>
                                    <div 
                                        onClick={() => setSelectedNode(node.id)}
                                        className={`px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors ${selectedNode === node.id ? 'text-pink-600 bg-pink-50/50' : 'text-slate-500'}`}
                                    >
                                        <Server size={12} /> {node.label}
                                    </div>
                                    <div>
                                        {node.children.map((child: any) => (
                                            <div 
                                                key={child.id}
                                                onClick={() => setSelectedNode(child.id)}
                                                className={`pl-8 pr-4 py-2 cursor-pointer text-sm flex items-center gap-2 transition-colors ${selectedNode === child.id ? 'bg-pink-50 text-pink-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                                            >
                                                <Database size={14} className={selectedNode === child.id ? 'text-pink-500' : 'text-slate-400'} />
                                                <span className="truncate">{child.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            treeData.map((node: any) => (
                                <div 
                                    key={node.id}
                                    onClick={() => setSelectedNode(node.id)}
                                    className={`px-4 py-2.5 cursor-pointer text-sm flex items-center justify-between transition-colors border-b border-slate-50 ${selectedNode === node.id ? 'bg-pink-50 text-pink-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Folder size={14} className={selectedNode === node.id ? 'text-pink-500' : 'text-slate-400'} />
                                        <span className="truncate">{node.label}</span>
                                    </div>
                                    <ChevronRight size={14} className="text-slate-300" />
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Table List & Details */}
                <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 pl-2">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 rounded border-slate-300 text-pink-600 focus:ring-pink-500 cursor-pointer"
                                    checked={selectedIds.size === tableList.length && tableList.length > 0}
                                    onChange={toggleAll}
                                />
                                <span className="text-sm text-slate-500 font-medium">全选</span>
                            </div>
                            <div className="h-4 w-px bg-slate-300 mx-2"></div>
                            <div className="text-sm text-slate-500">
                                显示 <b>{tableList.length}</b> 张表 {selectedNode ? `(筛选: ${viewMode === 'source' ? dataSources.find((d:any)=>d.id===selectedNode)?.name || selectedNode : selectedNode})` : ''}
                            </div>
                        </div>
                        <div>
                            {selectedIds.size > 0 && (
                                <button 
                                    onClick={runBatchAnalysis}
                                    disabled={isBatchAnalyzing}
                                    className={`px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow-purple-200 transition-all flex items-center gap-2 ${isBatchAnalyzing ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}`}
                                >
                                    {isBatchAnalyzing ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                    {isBatchAnalyzing ? `正在批量分析...` : `批量 AI 语义解析 (${selectedIds.size})`}
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                        {tableList.map((table: any) => {
                            const isExpanded = expandedTableId === table.id;
                            const dataSource = dataSources.find((ds: any) => ds.id === table.sourceId);
                            const semantic = editableResult && isExpanded && editMode ? editableResult : table.semanticProfile; // Use editable if in editing mode
                            const isAiVisible = aiVisibleTableId === table.id;
                            const isSelected = selectedIds.has(table.id);

                            return (
                                <div key={table.id} className={`border rounded-xl transition-all ${isExpanded ? 'border-pink-200 shadow-md bg-white' : 'border-slate-200 hover:shadow-sm bg-white'}`}>
                                    {/* Table Header Row (Flexbox) */}
                                    <div 
                                        className={`p-4 flex items-center gap-4 cursor-pointer transition-colors ${isSelected ? 'bg-pink-50/30' : ''}`}
                                        onClick={() => setExpandedTableId(isExpanded ? null : table.id)}
                                    >
                                        <div onClick={(e) => e.stopPropagation()} className="flex items-center">
                                            <input 
                                                type="checkbox" 
                                                checked={isSelected} 
                                                onChange={() => toggleSelection(table.id)}
                                                className="w-4 h-4 rounded border-slate-300 text-pink-600 focus:ring-pink-500 cursor-pointer"
                                            />
                                        </div>

                                        <div className={`p-2 rounded-lg shrink-0 ${isExpanded ? 'bg-pink-100 text-pink-600' : 'bg-slate-100 text-slate-500'}`}>
                                            <Table size={20} />
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-slate-800 text-sm truncate">{table.name}</div>
                                            <div className="text-xs text-slate-400 truncate mt-0.5">{table.comment || '暂无注释'}</div>
                                        </div>

                                        <div className="w-32 hidden md:block">
                                            <div className="text-xs text-slate-500 flex items-center gap-1" title="Data Source">
                                                <Database size={12} className="text-slate-400"/> 
                                                <span className="truncate">{dataSource?.name}</span>
                                            </div>
                                        </div>

                                        <div className="w-24 hidden lg:block text-right">
                                            <div className="text-xs text-slate-600 font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 inline-block">
                                                {table.rows} rows
                                            </div>
                                        </div>

                                        <div className="w-28 hidden xl:block text-right text-xs text-slate-400">
                                            {table.updateTime}
                                        </div>

                                        <div className="w-8 flex justify-end shrink-0">
                                            {table.isSemanticEnriched && <BrainCircuit size={16} className="text-emerald-500 mr-2" title="已语义化" />}
                                            <ChevronDown size={16} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    {isExpanded && (
                                        <div className="border-t border-slate-100 bg-slate-50/50 p-4 animate-fade-in">
                                            <div className="flex gap-6 flex-col lg:flex-row">
                                                {/* 1. Physical Schema */}
                                                <div className="flex-1 bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col h-[300px]">
                                                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-500 uppercase flex justify-between items-center">
                                                        <span>物理字段 ({table.columns.length})</span>
                                                        <Code size={12}/>
                                                    </div>
                                                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                                                        <table className="w-full text-xs text-left">
                                                            <thead className="bg-white text-slate-400 sticky top-0 shadow-sm z-10">
                                                                <tr>
                                                                    <th className="px-4 py-2 bg-slate-50/90 backdrop-blur">Name</th>
                                                                    <th className="px-4 py-2 bg-slate-50/90 backdrop-blur">Type</th>
                                                                    <th className="px-4 py-2 bg-slate-50/90 backdrop-blur">Comment</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-100">
                                                                {table.columns.map((col: any, idx: number) => (
                                                                    <tr key={idx} className="hover:bg-slate-50 group">
                                                                        <td className="px-4 py-2 font-mono text-slate-700 font-medium group-hover:text-blue-600 transition-colors">{col.name}</td>
                                                                        <td className="px-4 py-2 text-slate-400 flex items-center gap-1.5">
                                                                            {getFieldTypeIcon(col.type)}
                                                                            {col.type}
                                                                        </td>
                                                                        <td className="px-4 py-2 text-slate-500 truncate max-w-[120px]" title={col.comment}>{col.comment}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                {/* 2. AI Semantic Section */}
                                                <div className="flex-1 flex flex-col gap-2">
                                                    {/* Collapsible Header */}
                                                    <div 
                                                        onClick={() => setAiVisibleTableId(isAiVisible ? null : table.id)}
                                                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all select-none ${
                                                            isAiVisible 
                                                            ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 shadow-sm' 
                                                            : 'bg-white border-slate-200 hover:border-purple-300'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2 font-bold text-sm text-purple-900">
                                                            <Sparkles size={16} className={isAiVisible ? "text-purple-600" : "text-slate-400"} />
                                                            AI 语义理解
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {isAnalyzing && <RefreshCw size={14} className="animate-spin text-purple-500" />}
                                                            {isAiVisible ? <ChevronUp size={16} className="text-purple-400"/> : <ChevronDown size={16} className="text-slate-400"/>}
                                                        </div>
                                                    </div>

                                                    {/* AI Content Body */}
                                                    {isAiVisible && (
                                                        <div className="bg-white border border-purple-100 rounded-lg p-4 shadow-sm animate-fade-in relative h-[244px] flex flex-col">
                                                            {(!semantic && !isAnalyzing) ? (
                                                                <div className="flex-1 flex flex-col items-center justify-center text-center">
                                                                    <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mb-3">
                                                                        <Sparkles size={24} className="text-purple-300" />
                                                                    </div>
                                                                    <p className="text-xs text-slate-400 mb-4">AI 尚未介入分析</p>
                                                                    <button 
                                                                        onClick={(e) => { e.stopPropagation(); handleAnalyze(table); }}
                                                                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow-purple-200 transition-all hover:scale-105"
                                                                    >
                                                                        开始深度语义解析
                                                                    </button>
                                                                </div>
                                                            ) : isAnalyzing ? (
                                                                <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 text-xs">
                                                                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-purple-400" />
                                                                    正在解析表结构与注释...
                                                                </div>
                                                            ) : (
                                                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                                                                    {/* Action Buttons */}
                                                                    <div className="absolute top-4 right-4 flex gap-2 z-10 bg-white pl-2">
                                                                        {!editMode && (
                                                                            <button onClick={() => { setEditableResult(semantic); setEditMode(true); }} className="text-slate-400 hover:text-blue-600"><Edit size={14}/></button>
                                                                        )}
                                                                        {editMode && (
                                                                            <button onClick={() => handleSaveAI(table.id)} className="text-emerald-500 hover:text-emerald-700 font-bold text-xs flex items-center gap-1"><Save size={14}/> 保存</button>
                                                                        )}
                                                                    </div>

                                                                    <div>
                                                                        <div className="text-[10px] uppercase text-purple-400 font-bold tracking-wider mb-1">建议业务名称</div>
                                                                        {editMode ? (
                                                                            <input className="w-full border border-purple-200 rounded p-1 text-sm font-bold text-slate-800" value={editableResult.businessName} onChange={e => setEditableResult({...editableResult, businessName: e.target.value})} />
                                                                        ) : <div className="text-base font-bold text-slate-800">{semantic.businessName}</div>}
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <div className="text-[10px] uppercase text-purple-400 font-bold tracking-wider mb-1">业务描述</div>
                                                                        {editMode ? (
                                                                            <textarea rows={2} className="w-full border border-purple-200 rounded p-1 text-xs" value={editableResult.description} onChange={e => setEditableResult({...editableResult, description: e.target.value})} />
                                                                        ) : <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2 rounded border border-slate-100">{semantic.description}</p>}
                                                                    </div>

                                                                    <div>
                                                                        <div className="text-[10px] uppercase text-purple-400 font-bold tracking-wider mb-1">核心字段识别</div>
                                                                        <div className="space-y-1">
                                                                            {(editMode ? editableResult : semantic).coreFields?.map((cf: any, i: number) => (
                                                                                <div key={i} className="flex items-center gap-2 text-xs bg-purple-50 p-1.5 rounded border border-purple-100">
                                                                                    {getSemanticIcon(cf.semanticType)}
                                                                                    <span className="font-mono font-bold text-slate-700">{cf.field}</span>
                                                                                    <span className="text-slate-300">|</span>
                                                                                    {editMode ? (
                                                                                        <input className="flex-1 bg-transparent border-b border-purple-200 focus:outline-none" value={cf.reason} onChange={(e) => {
                                                                                            const newFields = [...editableResult.coreFields];
                                                                                            newFields[i].reason = e.target.value;
                                                                                            setEditableResult({...editableResult, coreFields: newFields});
                                                                                        }}/>
                                                                                    ) : <span className="text-slate-500 flex-1">{cf.reason}</span>}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {!editMode && (
                                                                        <button 
                                                                            onClick={() => {
                                                                                // Logic to create BO directly (simplified here)
                                                                                alert("Generating BO from " + semantic.businessName);
                                                                                setActiveModule('td_modeling');
                                                                            }}
                                                                            className="w-full py-2 bg-purple-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-purple-700 flex items-center justify-center gap-2 mt-2"
                                                                        >
                                                                            <Box size={14}/> 生成业务对象
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 视图: 业务对象建模 (TD-03) ---
const BusinessModelingView = ({ businessObjects, setBusinessObjects }: any) => {
    const [selectedId, setSelectedId] = useState(businessObjects[0]?.id);
    const [activeTab, setActiveTab] = useState('structure');

    const activeObject = businessObjects.find((bo: any) => bo.id === selectedId) || businessObjects[0];

    const handleDeleteField = (fieldId: string) => {
        if (!confirm('确定删除该属性吗？')) return;
        const updatedBO = {
            ...activeObject,
            fields: activeObject.fields.filter((f: any) => f.id !== fieldId)
        };
        setBusinessObjects(businessObjects.map((bo: any) => bo.id === activeObject.id ? updatedBO : bo));
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
        setBusinessObjects(businessObjects.map((bo: any) => bo.id === activeObject.id ? updatedBO : bo));
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
                        {businessObjects.map((bo: any) => (
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
                                        {(activeObject.fields || []).map((field: any, idx: number) => (
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

// --- 视图: 候选生成 (BU-04) ---
const CandidateGenerationView = ({ businessObjects, setBusinessObjects }: any) => {
    const [viewingCandidate, setViewingCandidate] = useState<any>(null);
    const [editName, setEditName] = useState('');
    const [nameError, setNameError] = useState('');
    const [minConfidence, setMinConfidence] = useState(50);
    const [isProcessing, setIsProcessing] = useState(false);

    // 模拟候选数据
    const mockCandidates = [
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
            id: 'AI_003',
            sourceTable: 't_newborn_archive_2023',
            suggestedName: '新生儿归档',
            confidence: 0.78,
            reason: '历史归档表，结构与主表一致。建议作为历史分区或独立快照对象。',
            scores: { nameMatch: 70, fieldMatch: 95, dataSample: 60 },
            mappedFields: 5,
            status: 'pending',
            previewFields: []
        }
    ];

    const [candidates, setCandidates] = useState(mockCandidates);

    const checkNameConflict = (name: string) => businessObjects.some((bo: any) => bo.name === name);
    
    const openCandidateDetail = (candidate: any) => { 
        setViewingCandidate(candidate); 
        setEditName(candidate.suggestedName); 
        setNameError(checkNameConflict(candidate.suggestedName) ? '名称已存在，请修改' : ''); 
    };
    
    const handleNameChange = (newName: string) => { 
        setEditName(newName); 
        setNameError(checkNameConflict(newName) ? '名称已存在' : ''); 
    };

    const handleConfirmAccept = () => {
        if (!viewingCandidate || nameError) return;
        const newBO = { 
            id: `BO_${Date.now()}`, 
            name: editName, 
            code: `biz_${viewingCandidate.sourceTable.replace('t_', '')}`, 
            domain: 'AI生成', 
            owner: '待认领', 
            status: 'draft', 
            version: 'v0.1', 
            description: 'AI生成的业务对象', 
            fields: viewingCandidate.previewFields.map((f: any, i: number) => ({ 
                id: `f_${i}`, 
                name: f.attr, 
                code: f.col, 
                type: 'String', 
                length: '-', 
                required: false, 
                desc: 'AI 自动映射' 
            })) 
        };
        setBusinessObjects([...businessObjects, newBO]);
        setCandidates(candidates.filter((c: any) => c.id !== viewingCandidate.id));
        setViewingCandidate(null);
        alert(`成功创建业务对象：${newBO.name}`);
    };

    const handleReject = (id: string) => { 
        setCandidates(candidates.filter((c: any) => c.id !== id)); 
        setViewingCandidate(null); 
    };

    const handleRunAI = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            alert('AI 分析完成，发现 2 个新候选！');
        }, 1500);
    };

    const filteredCandidates = candidates.filter((c: any) => (c.confidence * 100) >= minConfidence);

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Sparkles className="text-purple-500" /> 智能候选生成
                    </h2>
                    <p className="text-slate-500 mt-1">AI驱动的业务对象推荐与语义分析</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleRunAI}
                        disabled={isProcessing}
                        className={`flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm shadow-purple-200 ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isProcessing ? <RefreshCw size={16} className="animate-spin" /> : <Cpu size={16} />}
                        {isProcessing ? 'AI 分析中...' : '运行 AI 识别'}
                    </button>
                </div>
            </div>

            {/* 置信度过滤器 */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                        <Sliders size={16} />
                        置信度过滤:
                    </span>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={minConfidence}
                        onChange={(e) => setMinConfidence(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <span className="text-sm font-bold text-purple-700 min-w-[3rem] text-right">{minConfidence}%</span>
                </div>
                <div className="text-xs text-slate-400">
                    显示 {filteredCandidates.length} / {candidates.length} 个候选
                </div>
            </div>

            {/* 候选列表 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCandidates.map((candidate: any) => {
                    const isConflict = checkNameConflict(candidate.suggestedName);
                    return (
                        <div key={candidate.id} className={`bg-white p-5 rounded-xl border shadow-sm ${isConflict ? 'border-orange-300' : 'border-purple-100'}`}>
                            <div className="flex justify-between mb-2">
                                <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-bold">
                                    {candidate.sourceTable}
                                </span>
                                <span className="text-emerald-600 font-bold text-xs">
                                    {Math.round(candidate.confidence * 100)}%
                                </span>
                            </div>
                            <h3 className="font-bold text-lg mb-2 truncate" title={candidate.suggestedName}>
                                {candidate.suggestedName}
                            </h3>
                            {isConflict && (
                                <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded mb-2 flex items-center gap-1">
                                    <AlertTriangle size={12} /> 名称冲突，需人工介入
                                </div>
                            )}
                            <p className="text-xs text-slate-500 mb-4 h-10 overflow-hidden">
                                {candidate.reason}
                            </p>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => openCandidateDetail(candidate)} 
                                    className="flex-1 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50"
                                >
                                    审核
                                </button>
                                {!isConflict && (
                                    <button 
                                        onClick={() => { 
                                            setViewingCandidate(candidate); 
                                            setEditName(candidate.suggestedName); 
                                            handleConfirmAccept(); 
                                        }} 
                                        className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                                    >
                                        采纳
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 候选详情模态框 */}
            {viewingCandidate && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-3xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800">候选详情审核</h3>
                            <button onClick={() => setViewingCandidate(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 flex gap-6">
                            <div className="flex-1 space-y-6">
                                <div className="flex gap-4 items-end">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">物理源表</label>
                                        <div className="p-2 bg-slate-50 border rounded text-sm font-mono text-slate-600">
                                            {viewingCandidate.sourceTable}
                                        </div>
                                    </div>
                                    <ArrowRight className="mb-2 text-purple-300" />
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-purple-600 uppercase mb-1">建议业务对象名称</label>
                                        <input 
                                            type="text" 
                                            value={editName} 
                                            onChange={(e) => handleNameChange(e.target.value)} 
                                            className={`w-full border p-2 rounded text-sm font-bold text-slate-800 ${nameError ? 'border-red-500 bg-red-50' : 'border-purple-300'}`} 
                                        />
                                        {nameError && <div className="text-red-500 text-xs mt-1">{nameError}</div>}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-sm text-slate-700 mb-2">字段映射预览</h4>
                                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 text-slate-500 font-medium text-xs uppercase">
                                                <tr>
                                                    <th className="px-3 py-2">物理字段</th>
                                                    <th className="px-3 py-2">推测属性</th>
                                                    <th className="px-3 py-2">置信度</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {viewingCandidate.previewFields.map((f: any, i: number) => (
                                                    <tr key={i}>
                                                        <td className="px-3 py-2 font-mono text-slate-600">{f.col}</td>
                                                        <td className="px-3 py-2 font-medium">{f.attr}</td>
                                                        <td className="px-3 py-2 text-xs">
                                                            <span className={`px-2 py-0.5 rounded ${
                                                                f.conf === 'High' ? 'bg-emerald-100 text-emerald-700' :
                                                                f.conf === 'Medium' ? 'bg-orange-100 text-orange-700' :
                                                                'bg-slate-100 text-slate-600'
                                                            }`}>
                                                                {f.conf}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className="w-64 bg-slate-50 p-4 rounded-lg border border-slate-200 h-fit">
                                <h4 className="font-bold text-sm text-slate-700 mb-4 flex items-center gap-2">
                                    <BrainCircuit size={16} className="text-purple-500" /> AI 置信度分析
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-slate-500">综合置信度</span>
                                            <span className="font-bold text-emerald-600">
                                                {Math.round(viewingCandidate.confidence * 100)}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div 
                                                style={{ width: `${viewingCandidate.confidence * 100}%` }} 
                                                className="h-full bg-emerald-500"
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-3 rounded border border-slate-200 text-xs text-slate-500 leading-relaxed">
                                        <strong>AI 建议：</strong><br />
                                        {viewingCandidate.reason}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                            <button 
                                onClick={() => handleReject(viewingCandidate.id)} 
                                className="text-red-600 text-sm hover:underline"
                            >
                                拒绝并忽略
                            </button>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setViewingCandidate(null)} 
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded"
                                >
                                    取消
                                </button>
                                <button 
                                    onClick={handleConfirmAccept} 
                                    disabled={!!nameError} 
                                    className={`px-4 py-2 text-white rounded flex items-center gap-2 ${nameError ? 'bg-purple-300' : 'bg-purple-600 hover:bg-purple-700'}`}
                                >
                                    <CheckCircle size={16} /> 确认创建
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- 视图: 映射工作台 (SG-01) ---
const MappingWorkbenchView = ({ businessObjects }: any) => {
    const [selectedBO, setSelectedBO] = useState(businessObjects[0]);
    
    // 模拟物理表数据
    const mockPhysicalTable = {
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
    const mockMappings = [
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
                            onChange={(e) => setSelectedBO(businessObjects.find((bo: any) => bo.id === e.target.value))}
                            className="text-sm border border-slate-200 rounded px-2 py-1"
                        >
                            {businessObjects.map((bo: any) => (
                                <option key={bo.id} value={bo.id}>{bo.name}</option>
                            ))}
                        </select>
                    </div>
                    {selectedBO?.fields?.map((f: any) => (
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
                    {mockMappings.map((m: any, i: number) => (
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
                    {mockPhysicalTable.fields.map((f: any, i: number) => (
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

// --- 视图: 业务梳理 (TD-01) ---
const BusinessGoalsView = ({ setActiveModule }: any) => {
    const [goals, setGoals] = useState([
        {
            id: 'G_001',
            title: '出生一件事高效办成',
            type: '改革事项',
            priority: 'High',
            status: 'modeling',
            progress: 65,
            owner: '卫健委 / 数局',
            lastUpdate: '2024-05-20',
            description: '整合出生医学证明、户口登记、医保参保等多个事项，实现"一表申请、一网通办"。',
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
        }
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newGoal, setNewGoal] = useState({
        title: '',
        type: '改革事项',
        priority: 'Medium',
        owner: '',
        description: ''
    });

    const handleSave = () => {
        if (!newGoal.title) return;
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
        setIsModalOpen(false);
        setNewGoal({ title: '', type: '改革事项', priority: 'Medium', owner: '', description: '' });
    };

    const handleContinue = () => {
        setActiveModule('td_modeling');
    };

    return (
        <div className="space-y-6 p-6">
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
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                    >
                        <Plus size={16} /> 新建梳理事项
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800">梳理清单</h3>
                </div>

                <div className="divide-y divide-slate-100">
                    {goals.map((goal) => (
                        <div key={goal.id} className="p-6 hover:bg-slate-50 transition-colors group relative">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <span className={`w-2.5 h-2.5 rounded-full ${
                                        goal.priority === 'High' ? 'bg-red-500 shadow-red-200 shadow-sm' :
                                        goal.priority === 'Medium' ? 'bg-orange-500 shadow-orange-200 shadow-sm' : 
                                        'bg-blue-500 shadow-blue-200 shadow-sm'
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
                                    <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded">
                                        <Edit size={16} />
                                    </button>
                                    <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
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
                                            <Box size={12} />
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
                                            className={`h-full rounded-full ${goal.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                            style={{ width: `${goal.progress}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs font-mono font-medium text-slate-400 w-8 text-right">
                                        {goal.progress}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 新建事项模态框 */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800">新建业务梳理事项</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    事项名称 <span className="text-red-500">*</span>
                                </label>
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
                                className={`px-4 py-2 text-sm text-white rounded-md transition-colors shadow-sm ${
                                    !newGoal.title ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                                }`}
                            >
                                创建事项
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- 视图: 场景编排 (TD-04) ---
const ScenarioOrchestrationView = ({ businessObjects }: any) => {
    const [activeScenarioId, setActiveScenarioId] = useState('SC_001');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newScenario, setNewScenario] = useState({
        name: '',
        description: '',
        involvedObjects: []
    });

    // 模拟场景数据
    const mockScenarios = [
        {
            id: 'SC_001',
            name: '出生医学证明申领流程',
            status: 'active',
            description: '新生儿出生后，由医院发起信息登记，监护人确认申领，最终系统自动签发电子证照。',
            involvedObjects: ['新生儿 (Newborn)', '出生医学证明'],
            nodes: [
                { id: 'n1', type: 'start', label: '出生登记', objectId: 'BO_NEWBORN', status: 'done', x: 100, y: 100 },
                { id: 'n2', type: 'action', label: '监护人申领', objectId: null, status: 'done', x: 300, y: 100 },
                { id: 'n3', type: 'object', label: '生成证明', objectId: 'BO_CERT', status: 'process', x: 500, y: 100 },
                { id: 'n4', type: 'end', label: '归档完成', objectId: null, status: 'pending', x: 700, y: 100 },
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
            involvedObjects: ['出生医学证明'],
            nodes: [
                { id: 'n1', type: 'start', label: '获取证明', objectId: 'BO_CERT', status: 'pending', x: 100, y: 100 },
                { id: 'n2', type: 'object', label: '户籍登记', objectId: null, status: 'pending', x: 300, y: 100 }
            ],
            edges: [
                { from: 'n1', to: 'n2', label: '作为依据' }
            ]
        },
        {
            id: 'SC_003',
            name: '疫苗接种管理',
            status: 'draft',
            description: '新生儿疫苗接种计划制定和执行跟踪。',
            involvedObjects: ['新生儿 (Newborn)'],
            nodes: [
                { id: 'n1', type: 'start', label: '制定计划', objectId: 'BO_NEWBORN', status: 'pending', x: 100, y: 100 },
                { id: 'n2', type: 'action', label: '接种提醒', objectId: null, status: 'pending', x: 300, y: 100 },
                { id: 'n3', type: 'end', label: '记录完成', objectId: null, status: 'pending', x: 500, y: 100 }
            ],
            edges: [
                { from: 'n1', to: 'n2', label: '生成' },
                { from: 'n2', to: 'n3', label: '执行' }
            ]
        }
    ];

    const [scenarios, setScenarios] = useState(mockScenarios);
    const activeScenario = scenarios.find(s => s.id === activeScenarioId) || scenarios[0];

    const handleSaveScenario = () => {
        if (!newScenario.name) return;
        const scenarioData = {
            id: `SC_${Date.now()}`,
            ...newScenario,
            status: 'draft',
            nodes: [
                { id: 'n1', type: 'start', label: '开始', objectId: null, status: 'pending', x: 100, y: 100 }
            ],
            edges: []
        };
        setScenarios([...scenarios, scenarioData]);
        setIsModalOpen(false);
        setNewScenario({ name: '', description: '', involvedObjects: [] });
    };

    return (
        <div className="flex h-full flex-col gap-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Layers className="text-purple-500" /> 场景编排
                    </h2>
                    <p className="text-slate-500 mt-1">可视化业务流程设计和对象关联编排</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-sm shadow-purple-200"
                >
                    <Plus size={16} /> 新建场景
                </button>
            </div>

            <div className="flex h-full gap-6 overflow-hidden">
                {/* 左侧：场景列表 */}
                <div className="w-64 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden shrink-0">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-800">业务场景列表</h3>
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {scenarios.length} 个
                        </span>
                    </div>
                    <div className="p-3 border-b border-slate-100">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input 
                                type="text" 
                                placeholder="搜索场景..." 
                                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-400 transition-colors" 
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {scenarios.map(sc => (
                            <div
                                key={sc.id}
                                onClick={() => setActiveScenarioId(sc.id)}
                                className={`p-3 rounded-lg cursor-pointer transition-all border ${activeScenarioId === sc.id
                                        ? 'bg-purple-50 border-purple-200 shadow-sm'
                                        : 'hover:bg-slate-50 border-transparent hover:border-slate-100'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`font-bold text-sm truncate ${activeScenarioId === sc.id ? 'text-purple-800' : 'text-slate-700'}`}>
                                        {sc.name}
                                    </span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${sc.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                        {sc.status === 'active' ? '生效' : '草稿'}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-400 line-clamp-2 mb-2">{sc.description}</div>
                                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                    <Box size={10} />
                                    <span>{sc.involvedObjects.length} 个对象</span>
                                    <span className="mx-1">•</span>
                                    <span>{sc.nodes.length} 个节点</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 中间：编排画布 */}
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl shadow-inner flex flex-col overflow-hidden relative">
                    {/* 工具栏 */}
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 bg-white rounded-lg shadow-sm border border-slate-200 p-1">
                        <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded" title="选择模式">
                            <MousePointer size={18} />
                        </button>
                        <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded" title="移动画布">
                            <Move size={18} />
                        </button>
                        <div className="h-px bg-slate-200 my-1"></div>
                        <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded" title="放大">
                            <ZoomIn size={18} />
                        </button>
                        <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded" title="缩小">
                            <ZoomOut size={18} />
                        </button>
                    </div>

                    {/* 操作按钮 */}
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg shadow-sm hover:bg-slate-50">
                            <Play size={14} className="text-emerald-500" /> 模拟运行
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg shadow-sm hover:bg-purple-700 shadow-purple-200">
                            <Save size={14} /> 保存场景
                        </button>
                    </div>

                    {/* 画布内容 */}
                    <div className="flex-1 overflow-auto flex items-center justify-center p-10">
                        <div className="flex items-center gap-8">
                            {activeScenario.nodes.map((node, idx) => {
                                const matchedBO = businessObjects.find((bo: any) => bo.id === node.objectId);
                                const isLast = idx === activeScenario.nodes.length - 1;
                                const edge = activeScenario.edges.find((e: any) => e.from === node.id);

                                return (
                                    <React.Fragment key={node.id}>
                                        <div className={`relative w-48 bg-white rounded-xl shadow-lg border-2 transition-transform hover:-translate-y-1 cursor-pointer ${
                                            node.type === 'start' ? 'border-blue-400' :
                                            node.type === 'end' ? 'border-slate-400' :
                                            node.type === 'object' ? 'border-purple-400' : 'border-orange-400'
                                        }`}>
                                            <div className={`px-4 py-2 rounded-t-lg border-b text-xs font-bold uppercase tracking-wider flex justify-between items-center ${
                                                node.type === 'start' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                                                node.type === 'end' ? 'bg-slate-50 border-slate-100 text-slate-600' :
                                                node.type === 'object' ? 'bg-purple-50 border-purple-100 text-purple-600' : 'bg-orange-50 border-orange-100 text-orange-600'
                                            }`}>
                                                <span>{node.type}</span>
                                                {node.status === 'done' && <CheckCircle size={14} className="text-emerald-500" />}
                                                {node.status === 'process' && <RefreshCw size={14} className="text-blue-500 animate-spin-slow" />}
                                            </div>

                                            <div className="p-4">
                                                <div className="font-bold text-slate-800 mb-1">{node.label}</div>
                                                {matchedBO ? (
                                                    <div className="flex items-center gap-1.5 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded w-fit mb-2">
                                                        <Box size={12} /> {matchedBO.name}
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-slate-400 italic mb-2">无关联对象</div>
                                                )}
                                            </div>

                                            <div className="px-4 py-2 border-t border-slate-100 flex justify-end gap-2">
                                                <Settings size={14} className="text-slate-400 cursor-pointer hover:text-slate-600" />
                                                <MoreHorizontal size={14} className="text-slate-400 cursor-pointer hover:text-slate-600" />
                                            </div>
                                        </div>

                                        {!isLast && (
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm relative top-3 z-10">
                                                    {edge?.label || 'next'}
                                                </div>
                                                <div className="w-16 h-0.5 bg-slate-300 relative">
                                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-slate-300 rotate-45"></div>
                                                </div>
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}

                            <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-400 cursor-pointer transition-colors bg-white/50">
                                <Plus size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 右侧：对象库 */}
                <div className="w-60 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden shrink-0">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                            <Box size={16} className="text-purple-500" />
                            业务对象库
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-1">拖拽对象至画布以建立关联</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {businessObjects.map((bo: any) => (
                            <div key={bo.id} className="p-3 bg-white border border-slate-200 rounded shadow-sm cursor-grab hover:border-purple-300 hover:shadow-md transition-all group active:cursor-grabbing">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-xs text-slate-700">{bo.name}</span>
                                    <Link size={12} className="text-slate-300 group-hover:text-purple-500" />
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono truncate">{bo.code}</div>
                                <div className="text-[10px] text-slate-500 mt-1">
                                    {bo.fields?.length || 0} 属性 • {bo.status}
                                </div>
                            </div>
                        ))}
                        
                        <div className="p-2 border-t border-slate-100 mt-4">
                            <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">流程节点组件</div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-2 bg-slate-50 border border-slate-200 rounded text-center text-xs text-slate-600 hover:border-blue-400 cursor-pointer">
                                    开始
                                </div>
                                <div className="p-2 bg-slate-50 border border-slate-200 rounded text-center text-xs text-slate-600 hover:border-orange-400 cursor-pointer">
                                    动作
                                </div>
                                <div className="p-2 bg-slate-50 border border-slate-200 rounded text-center text-xs text-slate-600 hover:border-slate-400 cursor-pointer">
                                    结束
                                </div>
                                <div className="p-2 bg-slate-50 border border-slate-200 rounded text-center text-xs text-slate-600 hover:border-green-400 cursor-pointer">
                                    判断
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 新建场景模态框 */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800">新建业务场景</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    场景名称 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newScenario.name}
                                    onChange={(e) => setNewScenario({ ...newScenario, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                    placeholder="例如：企业开办一件事"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">场景描述</label>
                                <textarea
                                    value={newScenario.description}
                                    onChange={(e) => setNewScenario({ ...newScenario, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm h-24 resize-none"
                                    placeholder="请描述业务场景的流程和目标..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">涉及对象</label>
                                <div className="border border-slate-300 rounded-md p-2 max-h-32 overflow-y-auto">
                                    {businessObjects.map((bo: any) => (
                                        <label key={bo.id} className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded text-sm">
                                            <input
                                                type="checkbox"
                                                checked={newScenario.involvedObjects.includes(bo.name)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setNewScenario({
                                                            ...newScenario,
                                                            involvedObjects: [...newScenario.involvedObjects, bo.name]
                                                        });
                                                    } else {
                                                        setNewScenario({
                                                            ...newScenario,
                                                            involvedObjects: newScenario.involvedObjects.filter(name => name !== bo.name)
                                                        });
                                                    }
                                                }}
                                                className="rounded"
                                            />
                                            <span>{bo.name}</span>
                                        </label>
                                    ))}
                                </div>
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
                                onClick={handleSaveScenario}
                                disabled={!newScenario.name}
                                className={`px-4 py-2 text-sm text-white rounded-md transition-colors shadow-sm ${
                                    !newScenario.name ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'
                                }`}
                            >
                                创建场景
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- 视图: 数据服务超市 (SG-04) ---
const DataCatalogView = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAsset, setSelectedAsset] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

    // 模拟数据服务超市
    const mockCatalogAssets = [
        { 
            id: 'AS_001', 
            name: '新生儿信息查询服务', 
            type: 'Data Service', 
            code: 'svc_newborn_query', 
            owner: '卫健委数据中心', 
            quality: 98, 
            status: 'Online', 
            tags: ['实时查询', '高频', 'REST API'], 
            lastUpdate: '2024-05-20',
            description: '提供新生儿基础信息的实时查询服务，支持按身份证号、姓名等条件查询。',
            price: '¥0.05/次',
            calls: '12.5K/月',
            sla: '99.9%',
            responseTime: '45ms',
            lineage: ['新生儿业务对象', 't_pop_base_info']
        },
        { 
            id: 'AS_002', 
            name: '出生证明电子签发服务', 
            type: 'Data Service', 
            code: 'svc_birth_cert_issue', 
            owner: '医院管理处', 
            quality: 92, 
            status: 'Online', 
            tags: ['电子证照', '业务流程', 'SOAP'], 
            lastUpdate: '2024-05-18',
            description: '提供出生医学证明的电子签发服务，支持批量处理和状态跟踪。',
            price: '¥2.00/次',
            calls: '3.2K/月',
            sla: '99.5%',
            responseTime: '120ms',
            lineage: ['出生医学证明', 't_med_birth_cert']
        },
        { 
            id: 'AS_003', 
            name: '人口统计分析服务', 
            type: 'Analytics Service', 
            code: 'svc_pop_analytics', 
            owner: '大数据中心', 
            quality: 95, 
            status: 'Online', 
            tags: ['统计分析', '报表', 'GraphQL'], 
            lastUpdate: '2024-05-21',
            description: '提供人口数据的统计分析服务，支持多维度分析和可视化报表生成。',
            price: '¥10.00/次',
            calls: '850/月',
            sla: '99.8%',
            responseTime: '200ms',
            lineage: ['人口基础数据', '统计模型']
        },
        { 
            id: 'AS_004', 
            name: '疫苗接种记录服务', 
            type: 'Data Service', 
            code: 'svc_vaccine_record', 
            owner: '疾控中心', 
            quality: 88, 
            status: 'Online', 
            tags: ['健康档案', '实时同步', 'REST API'], 
            lastUpdate: '2024-05-19',
            description: '提供疫苗接种记录的查询和更新服务，支持接种计划管理。',
            price: '¥0.08/次',
            calls: '8.7K/月',
            sla: '99.2%',
            responseTime: '65ms',
            lineage: ['疫苗接种表', '健康档案系统']
        },
        {
            id: 'AS_005',
            name: '身份验证服务',
            type: 'Security Service',
            code: 'svc_identity_verify',
            owner: '公安数据中心',
            quality: 99,
            status: 'Online',
            tags: ['身份认证', '安全', 'OAuth2'],
            lastUpdate: '2024-05-20',
            description: '提供身份证号码验证和人员身份认证服务，确保数据访问安全。',
            price: '¥0.15/次',
            calls: '25.6K/月',
            sla: '99.95%',
            responseTime: '30ms',
            lineage: ['公安人口库', '身份认证系统']
        },
        {
            id: 'AS_006',
            name: '出生一件事编排服务',
            type: 'Workflow Service',
            code: 'svc_birth_workflow',
            owner: '政务服务中心',
            quality: 90,
            status: 'Online',
            tags: ['业务编排', '一件事', '流程引擎'],
            lastUpdate: '2024-05-18',
            description: '整合出生医学证明、户口登记、医保参保等多个事项的一站式服务编排。',
            price: '¥5.00/次',
            calls: '1.2K/月',
            sla: '99.0%',
            responseTime: '500ms',
            lineage: ['多个业务系统', '流程引擎']
        },
        {
            id: 'AS_007',
            name: '数据质量监控服务',
            type: 'Quality Service',
            code: 'svc_data_quality',
            owner: '数据治理团队',
            quality: 96,
            status: 'Online',
            tags: ['数据质量', '监控告警', 'WebSocket'],
            lastUpdate: '2024-05-21',
            description: '提供实时数据质量监控和异常告警服务，支持自定义质量规则。',
            price: '¥50.00/月',
            calls: '实时监控',
            sla: '99.7%',
            responseTime: '实时',
            lineage: ['所有数据源', '质量规则引擎']
        },
        {
            id: 'AS_008',
            name: '地址标准化服务',
            type: 'Data Service',
            code: 'svc_address_standard',
            owner: '地理信息中心',
            quality: 94,
            status: 'Online',
            tags: ['地址解析', '标准化', 'REST API'],
            lastUpdate: '2024-05-19',
            description: '提供地址信息的标准化和地理编码服务，支持模糊匹配和纠错。',
            price: '¥0.12/次',
            calls: '15.3K/月',
            sla: '99.6%',
            responseTime: '80ms',
            lineage: ['地址库', 'GIS系统']
        }
    ];

    const [assets, setAssets] = useState(mockCatalogAssets);

    const filterTabs = [
        { id: 'all', label: '全部服务', count: assets.length },
        { id: 'Data Service', label: '数据服务', count: assets.filter(a => a.type === 'Data Service').length },
        { id: 'Analytics Service', label: '分析服务', count: assets.filter(a => a.type === 'Analytics Service').length },
        { id: 'Security Service', label: '安全服务', count: assets.filter(a => a.type === 'Security Service').length },
        { id: 'Workflow Service', label: '流程服务', count: assets.filter(a => a.type === 'Workflow Service').length },
        { id: 'Quality Service', label: '质量服务', count: assets.filter(a => a.type === 'Quality Service').length }
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
            case 'Data Service': return <Server size={20} className="text-blue-600" />;
            case 'Analytics Service': return <BarChart3 size={20} className="text-emerald-600" />;
            case 'Security Service': return <Shield size={20} className="text-red-600" />;
            case 'Workflow Service': return <Layers size={20} className="text-purple-600" />;
            case 'Quality Service': return <CheckCircle size={20} className="text-orange-600" />;
            default: return <Globe size={20} className="text-slate-600" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Data Service': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Analytics Service': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Security Service': return 'bg-red-100 text-red-700 border-red-200';
            case 'Workflow Service': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Quality Service': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Globe size={24} className="text-blue-600" />
                        数据服务超市
                    </h2>
                    <p className="text-slate-500 mt-1">企业级数据服务统一发布和订阅平台</p>
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
                        <Plus size={16} /> 发布服务
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
                                placeholder="搜索服务名称、编码或标签..."
                                className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 w-80 shadow-sm"
                            />
                        </div>
                        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded border border-slate-200 bg-white">
                            <Filter size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* 服务展示区域 */}
            {viewMode === 'card' ? (
                /* 卡片视图 */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAssets.map(asset => (
                        <div 
                            key={asset.id} 
                            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                            onClick={() => setSelectedAsset(asset)}
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
                                        asset.status === 'Online' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
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
                                    <span className="text-slate-500">服务提供方:</span>
                                    <span className="font-medium text-slate-700">{asset.owner}</span>
                                </div>
                                
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">调用价格:</span>
                                    <span className="font-medium text-emerald-600">{asset.price}</span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">月调用量:</span>
                                    <span className="font-medium text-slate-700">{asset.calls}</span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">SLA保障:</span>
                                    <span className={`font-medium ${
                                        parseFloat(asset.sla) >= 99.5 ? 'text-emerald-600' : 'text-orange-600'
                                    }`}>
                                        {asset.sla}
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
                                    <th className="text-left py-3 px-4 font-medium text-slate-700">服务名称</th>
                                    <th className="text-left py-3 px-4 font-medium text-slate-700">类型</th>
                                    <th className="text-left py-3 px-4 font-medium text-slate-700">提供方</th>
                                    <th className="text-left py-3 px-4 font-medium text-slate-700">价格</th>
                                    <th className="text-left py-3 px-4 font-medium text-slate-700">调用量</th>
                                    <th className="text-left py-3 px-4 font-medium text-slate-700">SLA</th>
                                    <th className="text-left py-3 px-4 font-medium text-slate-700">响应时间</th>
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
                                        <td className="py-4 px-4 text-sm font-medium text-emerald-600">{asset.price}</td>
                                        <td className="py-4 px-4 text-sm text-slate-600">{asset.calls}</td>
                                        <td className="py-4 px-4">
                                            <span className={`text-sm font-medium ${
                                                parseFloat(asset.sla) >= 99.5 ? 'text-emerald-600' : 'text-orange-600'
                                            }`}>
                                                {asset.sla}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-slate-600">{asset.responseTime}</td>
                                        <td className="py-4 px-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                asset.status === 'Online' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {asset.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedAsset(asset);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    查看
                                                </button>
                                                <button className="text-emerald-600 hover:text-emerald-800 text-sm font-medium">
                                                    订阅
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

            {filteredAssets.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white rounded-xl border border-slate-200">
                    <Search size={48} className="mb-4 text-slate-200" />
                    <p className="text-lg font-medium">未找到匹配的服务</p>
                    <p className="text-sm mt-1">尝试调整搜索条件或筛选器</p>
                    <button
                        onClick={() => { setSearchTerm(''); setActiveTab('all'); }}
                        className="mt-4 text-sm text-blue-500 hover:underline"
                    >
                        清除所有筛选条件
                    </button>
                </div>
            )}

            {/* 服务详情模态框 */}
            {selectedAsset && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
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
                                onClick={() => setSelectedAsset(null)}
                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <h4 className="font-bold text-sm text-slate-700 mb-2">服务信息</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-500">服务编码:</span>
                                        <span className="ml-2 font-mono text-slate-700">{selectedAsset.code}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">服务提供方:</span>
                                        <span className="ml-2 text-slate-700">{selectedAsset.owner}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">调用价格:</span>
                                        <span className="ml-2 font-bold text-emerald-600">{selectedAsset.price}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">月调用量:</span>
                                        <span className="ml-2 text-slate-700">{selectedAsset.calls}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">SLA保障:</span>
                                        <span className={`ml-2 font-bold ${
                                            parseFloat(selectedAsset.sla) >= 99.5 ? 'text-emerald-600' : 'text-orange-600'
                                        }`}>{selectedAsset.sla}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">响应时间:</span>
                                        <span className="ml-2 text-slate-700">{selectedAsset.responseTime}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">质量分:</span>
                                        <span className="ml-2 font-bold text-slate-700">{selectedAsset.quality}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">最后更新:</span>
                                        <span className="ml-2 text-slate-700">{selectedAsset.lastUpdate}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-sm text-slate-700 mb-2">服务描述</h4>
                                <p className="text-sm text-slate-600 leading-relaxed">{selectedAsset.description}</p>
                            </div>

                            <div>
                                <h4 className="font-bold text-sm text-slate-700 mb-2">服务标签</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedAsset.tags.map((tag: string) => (
                                        <span key={tag} className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-sm">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

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
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedAsset(null)}
                                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
                            >
                                关闭
                            </button>
                            <button className="px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors">
                                订阅服务
                            </button>
                            <button className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
                                查看API文档
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- 视图: 冲突检测 (SG-02) ---
const ConflictDetectionView = ({ setActiveModule }: any) => {
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

    const [conflicts, setConflicts] = useState(mockConflicts);

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

// --- 视图: 全链路血缘 (SG-05) ---
const DataLineageView = ({ businessObjects }: any) => {
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'impact' | 'lineage'>('lineage');

    // 模拟血缘数据
    const mockLineageData = {
        nodes: [
            { 
                id: 'DS_001', 
                label: '卫健委_前置库', 
                type: 'datasource',
                x: 100, 
                y: 200,
                description: 'MySQL数据库',
                status: 'active'
            },
            { 
                id: 'TBL_001', 
                label: 't_pop_base_info', 
                type: 'table',
                x: 300, 
                y: 150,
                description: '人口基础信息表',
                status: 'active'
            },
            { 
                id: 'TBL_002', 
                label: 't_med_birth_cert', 
                type: 'table',
                x: 300, 
                y: 250,
                description: '出生证明记录表',
                status: 'active'
            },
            { 
                id: 'BO_NEWBORN', 
                label: '新生儿 (Newborn)', 
                type: 'object',
                x: 500, 
                y: 150,
                description: '业务对象',
                status: 'active'
            },
            { 
                id: 'BO_CERT', 
                label: '出生医学证明', 
                type: 'object',
                x: 500, 
                y: 250,
                description: '业务对象',
                status: 'active'
            },
            { 
                id: 'API_001', 
                label: '查询新生儿详情', 
                type: 'api',
                x: 700, 
                y: 150,
                description: 'REST API服务',
                status: 'active'
            },
            { 
                id: 'API_002', 
                label: '出生证明申领', 
                type: 'api',
                x: 700, 
                y: 250,
                description: 'REST API服务',
                status: 'active'
            },
            { 
                id: 'APP_001', 
                label: '出生一件事应用', 
                type: 'application',
                x: 900, 
                y: 200,
                description: '前端应用',
                status: 'active'
            }
        ],
        edges: [
            { from: 'DS_001', to: 'TBL_001', label: '包含' },
            { from: 'DS_001', to: 'TBL_002', label: '包含' },
            { from: 'TBL_001', to: 'BO_NEWBORN', label: '映射' },
            { from: 'TBL_002', to: 'BO_CERT', label: '映射' },
            { from: 'BO_NEWBORN', to: 'API_001', label: '服务' },
            { from: 'BO_CERT', to: 'API_002', label: '服务' },
            { from: 'API_001', to: 'APP_001', label: '调用' },
            { from: 'API_002', to: 'APP_001', label: '调用' }
        ]
    };

    const getNodeIcon = (type: string) => {
        switch (type) {
            case 'datasource': return <Database size={20} className="text-blue-600" />;
            case 'table': return <Table size={20} className="text-emerald-600" />;
            case 'object': return <Box size={20} className="text-purple-600" />;
            case 'api': return <Server size={20} className="text-orange-600" />;
            case 'application': return <Globe size={20} className="text-pink-600" />;
            default: return <FileText size={20} className="text-slate-600" />;
        }
    };

    const getNodeColor = (type: string) => {
        switch (type) {
            case 'datasource': return 'bg-blue-50 border-blue-300 text-blue-800';
            case 'table': return 'bg-emerald-50 border-emerald-300 text-emerald-800';
            case 'object': return 'bg-purple-50 border-purple-300 text-purple-800';
            case 'api': return 'bg-orange-50 border-orange-300 text-orange-800';
            case 'application': return 'bg-pink-50 border-pink-300 text-pink-800';
            default: return 'bg-slate-50 border-slate-300 text-slate-800';
        }
    };

    return (
        <div className="h-full flex flex-col gap-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <GitBranch className="text-purple-500" /> 全链路血缘分析
                    </h2>
                    <p className="text-slate-500 mt-1">数据流向追踪和影响分析</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center bg-slate-200 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('lineage')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                                viewMode === 'lineage' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            血缘视图
                        </button>
                        <button
                            onClick={() => setViewMode('impact')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                                viewMode === 'impact' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            影响分析
                        </button>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-blue-700">
                        <Network size={16} /> 影响分析
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-inner flex flex-col overflow-hidden relative">
                {/* 工具栏 */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 bg-white rounded-lg shadow-sm border border-slate-200 p-1">
                    <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded" title="适应画布">
                        <ZoomIn size={18} />
                    </button>
                    <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded" title="重置视图">
                        <RefreshCw size={18} />
                    </button>
                    <div className="h-px bg-slate-200 my-1"></div>
                    <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded" title="导出图片">
                        <Share2 size={18} />
                    </button>
                </div>

                {/* 血缘图 */}
                <div className="flex-1 overflow-auto p-8 bg-slate-50">
                    <div className="relative w-full h-full min-h-[600px]">
                        {/* 渲染连线 */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            {mockLineageData.edges.map((edge, index) => {
                                const fromNode = mockLineageData.nodes.find(n => n.id === edge.from);
                                const toNode = mockLineageData.nodes.find(n => n.id === edge.to);
                                if (!fromNode || !toNode) return null;

                                return (
                                    <g key={index}>
                                        <line
                                            x1={fromNode.x + 96}
                                            y1={fromNode.y + 40}
                                            x2={toNode.x}
                                            y2={toNode.y + 40}
                                            stroke="#94a3b8"
                                            strokeWidth="2"
                                            markerEnd="url(#arrowhead)"
                                        />
                                        <text
                                            x={(fromNode.x + toNode.x + 96) / 2}
                                            y={(fromNode.y + toNode.y + 40) / 2 - 5}
                                            textAnchor="middle"
                                            className="text-xs fill-slate-500 bg-white"
                                        >
                                            {edge.label}
                                        </text>
                                    </g>
                                );
                            })}
                            <defs>
                                <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                                        refX="9" refY="3.5" orient="auto">
                                    <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                                </marker>
                            </defs>
                        </svg>

                        {/* 渲染节点 */}
                        {mockLineageData.nodes.map((node) => (
                            <div
                                key={node.id}
                                className={`absolute w-48 bg-white rounded-xl shadow-lg border-2 transition-all hover:-translate-y-1 cursor-pointer ${
                                    selectedNode === node.id ? 'ring-2 ring-purple-500 ring-opacity-50' : ''
                                } ${getNodeColor(node.type)}`}
                                style={{ left: node.x, top: node.y }}
                                onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                            >
                                <div className="p-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        {getNodeIcon(node.type)}
                                        <div>
                                            <div className="font-bold text-sm">{node.label}</div>
                                            <div className="text-xs opacity-75">{node.description}</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="capitalize">{node.type}</span>
                                        <span className={`px-2 py-0.5 rounded ${
                                            node.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {node.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 节点详情面板 */}
                {selectedNode && (
                    <div className="absolute right-4 top-4 w-80 bg-white border border-slate-200 rounded-lg shadow-lg p-4 z-20">
                        <div className="flex justify-between items-start mb-3">
                            <h4 className="font-bold text-slate-800">节点详情</h4>
                            <button 
                                onClick={() => setSelectedNode(null)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        {(() => {
                            const node = mockLineageData.nodes.find(n => n.id === selectedNode);
                            if (!node) return null;
                            return (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        {getNodeIcon(node.type)}
                                        <span className="font-medium">{node.label}</span>
                                    </div>
                                    <div className="text-sm text-slate-600">{node.description}</div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span className="text-slate-500">类型:</span>
                                            <span className="ml-1 capitalize">{node.type}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">状态:</span>
                                            <span className="ml-1">{node.status}</span>
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t border-slate-100">
                                        <div className="text-xs text-slate-500 mb-2">上游依赖:</div>
                                        <div className="space-y-1">
                                            {mockLineageData.edges
                                                .filter(e => e.to === selectedNode)
                                                .map((edge, i) => {
                                                    const fromNode = mockLineageData.nodes.find(n => n.id === edge.from);
                                                    return (
                                                        <div key={i} className="text-xs flex items-center gap-1">
                                                            <ArrowRight size={12} className="text-slate-400" />
                                                            <span>{fromNode?.label}</span>
                                                        </div>
                                                    );
                                                })
                                            }
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t border-slate-100">
                                        <div className="text-xs text-slate-500 mb-2">下游影响:</div>
                                        <div className="space-y-1">
                                            {mockLineageData.edges
                                                .filter(e => e.from === selectedNode)
                                                .map((edge, i) => {
                                                    const toNode = mockLineageData.nodes.find(n => n.id === edge.to);
                                                    return (
                                                        <div key={i} className="text-xs flex items-center gap-1">
                                                            <ArrowRight size={12} className="text-slate-400" />
                                                            <span>{toNode?.label}</span>
                                                        </div>
                                                    );
                                                })
                                            }
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 视图: API 网关 (EE-05) ---
const ApiGatewayView = () => {
    const [selectedApi, setSelectedApi] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 模拟API服务数据
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

    const [apis, setApis] = useState(mockApiServices);

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

// --- 视图: 缓存策略 (EE-06) ---
const CacheStrategyView = () => {
    const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 模拟缓存策略数据
    const mockCachePolicies = [
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
        },
        {
            id: 'CP_004',
            name: 'API响应缓存',
            target: 'API Responses',
            type: 'CDN',
            ttl: '15m',
            eviction: 'TTL',
            status: 'Active',
            hitRate: '92.1%',
            size: '89MB',
            keys: 12800,
            description: 'API接口响应的CDN缓存'
        }
    ];

    // 模拟缓存键值数据
    const mockCacheKeys = [
        { key: 'bo:newborn:nb_123456', size: '2.4KB', created: '10:00:05', expires: '10:05:05', hits: 145, type: 'Redis' },
        { key: 'dict:hosp_level', size: '15KB', created: '08:00:00', expires: 'Tomorrow', hits: 5200, type: 'Local' },
        { key: 'api:query:birth_cert:list', size: '450KB', created: '10:02:30', expires: '10:03:30', hits: 12, type: 'Redis' },
        { key: 'report:monthly:births', size: '1.2MB', created: '09:00:00', expires: '10:00:00', hits: 89, type: 'Redis Cluster' },
    ];

    const [policies, setPolicies] = useState(mockCachePolicies);
    const [cacheKeys, setCacheKeys] = useState(mockCacheKeys);

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Local': return 'bg-blue-100 text-blue-700';
            case 'Redis': return 'bg-red-100 text-red-700';
            case 'Redis Cluster': return 'bg-purple-100 text-purple-700';
            case 'CDN': return 'bg-emerald-100 text-emerald-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-emerald-100 text-emerald-700';
            case 'Inactive': return 'bg-slate-100 text-slate-700';
            case 'Error': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <RefreshCw className="text-emerald-500" /> 缓存策略管理
                    </h2>
                    <p className="text-slate-500 mt-1">统一缓存策略配置和性能监控</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm shadow-blue-200"
                >
                    <Plus size={16} /> 新增策略
                </button>
            </div>

            {/* 统计概览 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">缓存命中率</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">91.9%</h3>
                        </div>
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border-emerald-200">
                            <Zap size={20} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs">
                        <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded mr-2">+2.1%</span>
                        <span className="text-slate-400">vs last week</span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">总缓存大小</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">247MB</h3>
                        </div>
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border-blue-200">
                            <HardDrive size={20} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">活跃策略</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">
                                {policies.filter(p => p.status === 'Active').length}
                            </h3>
                        </div>
                        <div className="p-2 rounded-lg bg-purple-50 text-purple-600 border-purple-200">
                            <Settings size={20} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">缓存键数量</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">
                                {policies.reduce((sum, p) => sum + p.keys, 0).toLocaleString()}
                            </h3>
                        </div>
                        <div className="p-2 rounded-lg bg-orange-50 text-orange-600 border-orange-200">
                            <Key size={20} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 缓存策略列表 */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-slate-800">缓存策略</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {policies.map(policy => (
                            <div key={policy.id} className="p-4 hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedPolicy(policy)}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-slate-800">{policy.name}</h4>
                                        <p className="text-xs text-slate-500">{policy.description}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(policy.status)}`}>
                                        {policy.status}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-500">类型:</span>
                                        <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${getTypeColor(policy.type)}`}>
                                            {policy.type}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">TTL:</span>
                                        <span className="ml-2 font-mono text-slate-700">{policy.ttl}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">命中率:</span>
                                        <span className="ml-2 font-bold text-emerald-600">{policy.hitRate}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">大小:</span>
                                        <span className="ml-2 font-mono text-slate-700">{policy.size}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 缓存键监控 */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">实时缓存键</h3>
                        <button className="text-xs text-blue-600 hover:underline">刷新</button>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                        {cacheKeys.map((item, index) => (
                            <div key={index} className="p-4 hover:bg-slate-50">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-mono text-sm text-slate-800 truncate" title={item.key}>
                                            {item.key}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${getTypeColor(item.type)}`}>
                                                {item.type}
                                            </span>
                                            <span className="text-xs text-slate-500">Size: {item.size}</span>
                                        </div>
                                    </div>
                                    <div className="text-right text-xs text-slate-500 ml-2">
                                        <div>Hits: {item.hits}</div>
                                        <div>Expires: {item.expires}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 策略详情模态框 */}
            {selectedPolicy && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div className="flex items-center gap-3">
                                <RefreshCw size={20} className="text-emerald-600" />
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">{selectedPolicy.name}</h3>
                                    <p className="text-sm text-slate-500">{selectedPolicy.description}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedPolicy(null)}
                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-bold text-sm text-slate-700 mb-3">基本配置</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">缓存类型:</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${getTypeColor(selectedPolicy.type)}`}>
                                                {selectedPolicy.type}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">目标对象:</span>
                                            <span className="text-slate-700">{selectedPolicy.target}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">TTL:</span>
                                            <span className="font-mono text-slate-700">{selectedPolicy.ttl}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">淘汰策略:</span>
                                            <span className="text-slate-700">{selectedPolicy.eviction}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-slate-700 mb-3">性能指标</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">状态:</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(selectedPolicy.status)}`}>
                                                {selectedPolicy.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">命中率:</span>
                                            <span className="font-bold text-emerald-600">{selectedPolicy.hitRate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">缓存大小:</span>
                                            <span className="font-mono text-slate-700">{selectedPolicy.size}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">键数量:</span>
                                            <span className="font-mono text-slate-700">{selectedPolicy.keys.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-sm text-slate-700 mb-3">性能图表</h4>
                                <div className="h-32 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center">
                                    <div className="text-slate-400 text-center">
                                        <BarChart3 size={32} className="mx-auto mb-2" />
                                        <p className="text-sm">缓存性能监控图表</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedPolicy(null)}
                                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
                            >
                                关闭
                            </button>
                            <button className="px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors">
                                编辑策略
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- 视图: 数据源管理 (BU-01) ---
const DataSourceManagementView = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDS, setNewDS] = useState({ name: '', type: 'MySQL', host: '', port: '', dbName: '' });

    // 模拟数据源
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
        }
    ];

    const [dataSources, setDataSources] = useState(mockDataSources);

    const handleCreate = () => {
        if (!newDS.name) return;
        setDataSources([...dataSources, { 
            id: `DS_${Date.now()}`, 
            ...newDS, 
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
                {dataSources.map((ds: any) => (
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

// --- 视图: 资产扫描 (BU-02) ---
const AssetScanningView = ({ setActiveModule }: any) => {
    const [selectedTables, setSelectedTables] = useState<string[]>([]);
    const [viewingTable, setViewingTable] = useState<any>(null);

    // 模拟数据
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
                                            {viewingTable.columns?.map((col: any, i: number) => (
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

const PlaceholderView = ({ title }: { title: string }) => (
    <div className="h-full flex flex-col items-center justify-center p-8">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-400">
            <Hammer size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-700 mb-2">{title}</h2>
        <p className="text-slate-500 max-w-md text-center">
            The {title} module is currently under development. Please proceed to the <span className="font-bold text-slate-700">Logic View (BU-03)</span> for the implemented demo features.
        </p>
    </div>
);

const SemanticLayerApp = () => {
    const [activeModule, setActiveModule] = useState('bu_semantics'); // Default to the implemented view
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [showAssistant, setShowAssistant] = useState(false);
    
    // Global State
    const [businessObjects, setBusinessObjects] = useState(mockBusinessObjects);
    const [dataSources, setDataSources] = useState(mockDataSources);
    const [scanAssets, setScanAssets] = useState(mockScanAssets);

    const contextData = {
        businessObjects,
        dataSources,
        candidates: mockAICandidates,
        scanAssets
    };

    const renderContent = () => {
        switch (activeModule) {
            case 'bu_semantics':
                return <DataSemanticUnderstandingView 
                    setActiveModule={setActiveModule}
                    businessObjects={businessObjects}
                    setBusinessObjects={setBusinessObjects}
                    dataSources={dataSources}
                    scanAssets={scanAssets}
                    setScanAssets={setScanAssets}
                />;
            case 'td_modeling': 
                return <BusinessModelingView 
                    businessObjects={businessObjects} 
                    setBusinessObjects={setBusinessObjects} 
                />;
            case 'bu_discovery': 
                return <AssetScanningView setActiveModule={setActiveModule} />;
            case 'bu_candidates': 
                return <CandidateGenerationView 
                    businessObjects={businessObjects} 
                    setBusinessObjects={setBusinessObjects} 
                />;
            case 'mapping': 
                return <MappingWorkbenchView businessObjects={businessObjects} />;
            case 'bu_connect': 
                return <DataSourceManagementView />;
            case 'td_goals': 
                return <BusinessGoalsView setActiveModule={setActiveModule} />;
            case 'governance': 
                return <ConflictDetectionView setActiveModule={setActiveModule} />;
            case 'td_scenario': 
                return <ScenarioOrchestrationView businessObjects={businessObjects} />;
            case 'catalog': 
                return <DataCatalogView />;
            case 'lineage': 
                return <DataLineageView businessObjects={businessObjects} />;
            case 'ee_api': 
                return <ApiGatewayView />;
            case 'ee_cache': 
                return <CacheStrategyView />;
            case 'dashboard': return <PlaceholderView title="Dashboard" />;
            default: return <PlaceholderView title="Module" />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
            <Sidebar 
                activeModule={activeModule} 
                setActiveModule={setActiveModule} 
                isCollapsed={isSidebarCollapsed} 
                setIsCollapsed={setIsSidebarCollapsed} 
            />
            
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50 relative transition-all duration-300">
                <Header 
                    activeModule={activeModule} 
                    showAssistant={showAssistant} 
                    setShowAssistant={setShowAssistant} 
                />
                
                <main className="flex-1 overflow-hidden relative p-4">
                    <div className="w-full h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative flex flex-col">
                         {renderContent()}
                    </div>
                    
                    {/* AI Assistant Floating Panel */}
                    <div className={`absolute top-4 right-4 bottom-4 w-96 z-40 transform transition-transform duration-300 ${showAssistant ? 'translate-x-0' : 'translate-x-[120%]'}`}>
                         <AIAssistantPanel 
                            visible={showAssistant} 
                            onClose={() => setShowAssistant(false)}
                            activeModule={activeModule}
                            contextData={contextData}
                         />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SemanticLayerApp;