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
                { id: 'bu_identification', label: '识别结果确认', icon: FileCheck },
                { id: 'bu_candidates', label: '候选生成 (BU-04)', icon: Sparkles },
            ]
        },
        {
            title: 'SG 语义治理中心',
            color: 'text-purple-400',
            items: [
                { id: 'mapping', label: '映射工作台 (SG-01)', icon: GitMerge },
                { id: 'governance', label: '冲突检测 (SG-02)', icon: Shield },
                { id: 'catalog', label: '数据资产中心 (SG-04)', icon: BookIcon },
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
            case 'bu_identification': return '识别结果确认';
            case 'bu_candidates': return '候选生成';
            case 'mapping': return '映射工作台';
            case 'governance': return '冲突检测与治理';
            case 'catalog': return '数据资产中心';
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

// --- 视图: 数据资产中心 (SG-04) ---
const DataCatalogView = () => {
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
                    <div className="w-96 bg-white border border-slate-200 rounded-xl shadow-lg flex-shrink-0" style={{
                        animation: 'slideInRight 0.3s ease-out'
                    }}>
                        <style jsx>{`
                            @keyframes slideInRight {
                                from {
                                    transform: translateX(100%);
                                    opacity: 0;
                                }
                                to {
                                    transform: translateX(0);
                                    opacity: 1;
                                }
                            }
                        `}</style>
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
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-fade-in-up">
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

// --- 视图: 识别结果确认 (Bottom-up 识别模块) ---
const IdentificationResultView = ({ setActiveModule, dataSources, scanAssets, setScanAssets }: any) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'comparison' | 'batch' | 'conflict'>('overview');
    
    // 模拟识别结果数据
    const [identificationResults, setIdentificationResults] = useState<any[]>([
        {
            id: 'IR_001',
            tableName: 'order_info',
            tableComment: '订单表',
            sourceId: 'DS_001',
            objectSuggestion: {
                name: '订单',
                confidence: 0.92,
                risk: 'low',
                status: 'pending',
                source: 'AI + 规则'
            },
            fieldSuggestions: [
                { field: 'order_id', semanticRole: '标识', aiExplanation: '主键', confidence: 0.95, status: 'accepted' },
                { field: 'order_status', semanticRole: '状态', aiExplanation: '枚举字段', confidence: 0.88, status: 'accepted' },
                { field: 'pay_time', semanticRole: '行为线索', aiExplanation: '支付发生', confidence: 0.75, status: 'warning', conflict: true },
                { field: 'create_time', semanticRole: '时间戳', aiExplanation: '创建时间', confidence: 0.90, status: 'accepted' },
                { field: 'user_id', semanticRole: '关联', aiExplanation: '用户外键', confidence: 0.85, status: 'accepted' },
            ],
            upgradeSuggestions: [
                { type: '状态', source: 'order_status', target: '状态对象', confidence: 0.82 },
                { type: '行为', source: 'pay_time', target: '支付行为', confidence: 0.75 }
            ],
            needsConfirmation: true,
            hasConflict: true
        },
        {
            id: 'IR_002',
            tableName: 't_pop_base_info',
            tableComment: '人口基础信息表',
            sourceId: 'DS_002',
            objectSuggestion: {
                name: '自然人',
                confidence: 0.88,
                risk: 'low',
                status: 'pending',
                source: 'AI + 规则'
            },
            fieldSuggestions: [
                { field: 'id', semanticRole: '标识', aiExplanation: '主键', confidence: 0.98, status: 'accepted' },
                { field: 'p_name', semanticRole: '属性', aiExplanation: '姓名', confidence: 0.92, status: 'accepted' },
                { field: 'id_card_num', semanticRole: '标识', aiExplanation: '身份证号', confidence: 0.95, status: 'accepted' },
                { field: 'birth_ts', semanticRole: '时间戳', aiExplanation: '出生时间', confidence: 0.90, status: 'accepted' },
                { field: 'weight_kg', semanticRole: '属性', aiExplanation: '体重', confidence: 0.82, status: 'accepted' },
                { field: 'hospital_id', semanticRole: '关联', aiExplanation: '医院外键', confidence: 0.78, status: 'pending' },
            ],
            upgradeSuggestions: [],
            needsConfirmation: false,
            hasConflict: false
        },
        {
            id: 'IR_003',
            tableName: 't_med_birth_cert',
            tableComment: '出生医学证明',
            sourceId: 'DS_001',
            objectSuggestion: {
                name: '出生医学证明',
                confidence: 0.95,
                risk: 'low',
                status: 'pending',
                source: 'AI + 规则'
            },
            fieldSuggestions: [
                { field: 'cert_id', semanticRole: '标识', aiExplanation: '证明编号', confidence: 0.96, status: 'accepted' },
                { field: 'baby_name', semanticRole: '属性', aiExplanation: '新生儿姓名', confidence: 0.93, status: 'accepted' },
                { field: 'issue_date', semanticRole: '时间戳', aiExplanation: '签发日期', confidence: 0.88, status: 'accepted' },
                { field: 'issue_org', semanticRole: '关联', aiExplanation: '签发机构', confidence: 0.85, status: 'accepted' },
            ],
            upgradeSuggestions: [
                { type: '事件', source: 'issue_date', target: '签发事件', confidence: 0.80 }
            ],
            needsConfirmation: false,
            hasConflict: false
        },
        {
            id: 'IR_004',
            tableName: 't_vac_record',
            tableComment: '疫苗接种记录',
            sourceId: 'DS_001',
            objectSuggestion: {
                name: '疫苗接种记录',
                confidence: 0.85,
                risk: 'medium',
                status: 'pending',
                source: 'AI + 规则'
            },
            fieldSuggestions: [
                { field: 'record_id', semanticRole: '标识', aiExplanation: '记录ID', confidence: 0.92, status: 'accepted' },
                { field: 'vac_code', semanticRole: '关联', aiExplanation: '疫苗编码', confidence: 0.80, status: 'pending' },
                { field: 'inject_time', semanticRole: '行为线索', aiExplanation: '接种时间', confidence: 0.75, status: 'warning', conflict: true },
                { field: 'dose_no', semanticRole: '属性', aiExplanation: '剂次', confidence: 0.82, status: 'accepted' },
                { field: 'person_id', semanticRole: '关联', aiExplanation: '人员ID', confidence: 0.88, status: 'accepted' },
            ],
            upgradeSuggestions: [
                { type: '行为', source: 'inject_time', target: '接种行为', confidence: 0.78 }
            ],
            needsConfirmation: true,
            hasConflict: true
        },
        {
            id: 'IR_005',
            tableName: 't_hosp_dict',
            tableComment: '医院字典表',
            sourceId: 'DS_001',
            objectSuggestion: {
                name: '医疗机构',
                confidence: 0.78,
                risk: 'low',
                status: 'pending',
                source: 'AI + 规则'
            },
            fieldSuggestions: [
                { field: 'hosp_code', semanticRole: '标识', aiExplanation: '医院编码', confidence: 0.90, status: 'accepted' },
                { field: 'hosp_name', semanticRole: '属性', aiExplanation: '医院名称', confidence: 0.88, status: 'accepted' },
                { field: 'hosp_level', semanticRole: '属性', aiExplanation: '医院等级', confidence: 0.72, status: 'pending', conflict: true },
                { field: 'address', semanticRole: '属性', aiExplanation: '地址', confidence: 0.85, status: 'accepted' },
            ],
            upgradeSuggestions: [
                { type: '状态', source: 'hosp_level', target: '等级状态', confidence: 0.70 }
            ],
            needsConfirmation: true,
            hasConflict: true
        },
        {
            id: 'IR_006',
            tableName: 'user_account',
            tableComment: '用户账户表',
            sourceId: 'DS_001',
            objectSuggestion: {
                name: '用户账户',
                confidence: 0.90,
                risk: 'low',
                status: 'pending',
                source: 'AI + 规则'
            },
            fieldSuggestions: [
                { field: 'user_id', semanticRole: '标识', aiExplanation: '用户ID', confidence: 0.95, status: 'accepted' },
                { field: 'username', semanticRole: '属性', aiExplanation: '用户名', confidence: 0.92, status: 'accepted' },
                { field: 'phone', semanticRole: '属性', aiExplanation: '手机号', confidence: 0.88, status: 'accepted' },
                { field: 'register_time', semanticRole: '时间戳', aiExplanation: '注册时间', confidence: 0.90, status: 'accepted' },
                { field: 'last_login_time', semanticRole: '行为线索', aiExplanation: '最后登录时间', confidence: 0.85, status: 'accepted' },
            ],
            upgradeSuggestions: [
                { type: '行为', source: 'last_login_time', target: '登录行为', confidence: 0.82 }
            ],
            needsConfirmation: false,
            hasConflict: false
        },
        {
            id: 'IR_007',
            tableName: 'payment_record',
            tableComment: '支付记录表',
            sourceId: 'DS_001',
            objectSuggestion: {
                name: '支付记录',
                confidence: 0.87,
                risk: 'medium',
                status: 'pending',
                source: 'AI + 规则'
            },
            fieldSuggestions: [
                { field: 'payment_id', semanticRole: '标识', aiExplanation: '支付ID', confidence: 0.94, status: 'accepted' },
                { field: 'order_id', semanticRole: '关联', aiExplanation: '订单ID', confidence: 0.90, status: 'accepted' },
                { field: 'amount', semanticRole: '属性', aiExplanation: '支付金额', confidence: 0.88, status: 'accepted' },
                { field: 'pay_time', semanticRole: '行为线索', aiExplanation: '支付时间', confidence: 0.82, status: 'pending', conflict: true },
                { field: 'pay_status', semanticRole: '状态', aiExplanation: '支付状态', confidence: 0.85, status: 'accepted' },
                { field: 'pay_method', semanticRole: '属性', aiExplanation: '支付方式', confidence: 0.80, status: 'pending' },
            ],
            upgradeSuggestions: [
                { type: '行为', source: 'pay_time', target: '支付行为', confidence: 0.85 },
                { type: '状态', source: 'pay_status', target: '支付状态对象', confidence: 0.80 }
            ],
            needsConfirmation: true,
            hasConflict: true
        },
        {
            id: 'IR_008',
            tableName: 't_newborn_screening',
            tableComment: '新生儿筛查记录',
            sourceId: 'DS_002',
            objectSuggestion: {
                name: '新生儿筛查',
                confidence: 0.82,
                risk: 'low',
                status: 'pending',
                source: 'AI'
            },
            fieldSuggestions: [
                { field: 'screening_id', semanticRole: '标识', aiExplanation: '筛查ID', confidence: 0.91, status: 'accepted' },
                { field: 'baby_id', semanticRole: '关联', aiExplanation: '新生儿ID', confidence: 0.88, status: 'accepted' },
                { field: 'screening_date', semanticRole: '时间戳', aiExplanation: '筛查日期', confidence: 0.86, status: 'accepted' },
                { field: 'screening_result', semanticRole: '状态', aiExplanation: '筛查结果', confidence: 0.79, status: 'pending' },
                { field: 'hospital_code', semanticRole: '关联', aiExplanation: '医院编码', confidence: 0.84, status: 'accepted' },
            ],
            upgradeSuggestions: [
                { type: '状态', source: 'screening_result', target: '筛查结果状态', confidence: 0.75 }
            ],
            needsConfirmation: true,
            hasConflict: false
        },
        {
            id: 'IR_009',
            tableName: 'product_info',
            tableComment: '商品信息表',
            sourceId: 'DS_001',
            objectSuggestion: {
                name: '商品',
                confidence: 0.93,
                risk: 'low',
                status: 'pending',
                source: 'AI + 规则'
            },
            fieldSuggestions: [
                { field: 'product_id', semanticRole: '标识', aiExplanation: '商品ID', confidence: 0.96, status: 'accepted' },
                { field: 'product_name', semanticRole: '属性', aiExplanation: '商品名称', confidence: 0.94, status: 'accepted' },
                { field: 'price', semanticRole: '属性', aiExplanation: '价格', confidence: 0.91, status: 'accepted' },
                { field: 'category_id', semanticRole: '关联', aiExplanation: '分类ID', confidence: 0.89, status: 'accepted' },
                { field: 'stock', semanticRole: '属性', aiExplanation: '库存', confidence: 0.87, status: 'accepted' },
                { field: 'create_time', semanticRole: '时间戳', aiExplanation: '创建时间', confidence: 0.90, status: 'accepted' },
            ],
            upgradeSuggestions: [],
            needsConfirmation: false,
            hasConflict: false
        },
        {
            id: 'IR_010',
            tableName: 't_health_exam',
            tableComment: '健康体检记录',
            sourceId: 'DS_002',
            objectSuggestion: {
                name: '健康体检',
                confidence: 0.79,
                risk: 'medium',
                status: 'pending',
                source: 'AI'
            },
            fieldSuggestions: [
                { field: 'exam_id', semanticRole: '标识', aiExplanation: '体检ID', confidence: 0.90, status: 'accepted' },
                { field: 'person_id', semanticRole: '关联', aiExplanation: '人员ID', confidence: 0.87, status: 'accepted' },
                { field: 'exam_date', semanticRole: '时间戳', aiExplanation: '体检日期', confidence: 0.85, status: 'accepted' },
                { field: 'exam_type', semanticRole: '属性', aiExplanation: '体检类型', confidence: 0.72, status: 'pending', conflict: true },
                { field: 'exam_result', semanticRole: '状态', aiExplanation: '体检结果', confidence: 0.68, status: 'pending', conflict: true },
                { field: 'hospital_id', semanticRole: '关联', aiExplanation: '医院ID', confidence: 0.83, status: 'accepted' },
            ],
            upgradeSuggestions: [
                { type: '状态', source: 'exam_result', target: '体检结果状态', confidence: 0.70 },
                { type: '状态', source: 'exam_type', target: '体检类型状态', confidence: 0.65 }
            ],
            needsConfirmation: true,
            hasConflict: true
        }
    ]);
    
    // 批量确认相关状态
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [filter, setFilter] = useState<{ needsConfirm?: boolean, hasConflict?: boolean, confidence?: string }>({});
    
    // 冲突解释相关状态
    const [selectedConflict, setSelectedConflict] = useState<string | null>(null);

    return (
        <div className="h-full flex flex-col bg-slate-50">
            {/* 顶部标题 */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <FileCheck className="text-emerald-500" size={24} /> 识别结果确认
                </h2>
                <p className="text-sm text-slate-500 mt-1">AI + 规则识别的结果是否符合业务认知</p>
            </div>

            {/* 标签页导航 */}
            <div className="bg-white border-b border-slate-200 px-6 flex-shrink-0">
                <div className="flex gap-1">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'overview'
                                ? 'border-emerald-500 text-emerald-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        识别任务概览
                    </button>
                    <button
                        onClick={() => setActiveTab('comparison')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'comparison'
                                ? 'border-emerald-500 text-emerald-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        识别结果对比
                    </button>
                    <button
                        onClick={() => setActiveTab('batch')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'batch'
                                ? 'border-emerald-500 text-emerald-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        批量确认
                    </button>
                    <button
                        onClick={() => setActiveTab('conflict')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'conflict'
                                ? 'border-emerald-500 text-emerald-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        冲突解释
                    </button>
                </div>
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-hidden">
                {activeTab === 'overview' && (
                    <IdentificationOverviewTab
                        results={identificationResults}
                        onNavigateToComparison={() => setActiveTab('comparison')}
                        onNavigateToBatch={() => setActiveTab('batch')}
                        onNavigateToConflict={() => setActiveTab('conflict')}
                    />
                )}
                {activeTab === 'comparison' && (
                    <IdentificationComparisonTab 
                        results={identificationResults}
                        setResults={setIdentificationResults}
                        dataSources={dataSources}
                        onNavigateToBatch={() => setActiveTab('batch')}
                        onNavigateToConflict={(conflictId?: string) => {
                            if (conflictId) setSelectedConflict(conflictId);
                            setActiveTab('conflict');
                        }}
                    />
                )}
                {activeTab === 'batch' && (
                    <BatchConfirmationTab
                        results={identificationResults}
                        setResults={setIdentificationResults}
                        selectedItems={selectedItems}
                        setSelectedItems={setSelectedItems}
                        filter={filter}
                        setFilter={setFilter}
                    />
                )}
                {activeTab === 'conflict' && (
                    <ConflictExplanationTab
                        results={identificationResults}
                        selectedConflict={selectedConflict}
                        setSelectedConflict={setSelectedConflict}
                        onNavigateToComparison={() => setActiveTab('comparison')}
                    />
                )}
            </div>
        </div>
    );
};

// 子组件0: 识别任务概览页
const IdentificationOverviewTab = ({ results, onNavigateToComparison, onNavigateToBatch, onNavigateToConflict }: any) => {
    const stats = {
        total: results.length,
        accepted: results.filter((r: any) => r.objectSuggestion?.status === 'accepted').length,
        pending: results.filter((r: any) => r.needsConfirmation).length,
        conflicts: results.filter((r: any) => r.hasConflict).length,
        avgConfidence: results.length > 0 
            ? Math.round(results.reduce((sum: number, r: any) => sum + (r.objectSuggestion?.confidence || 0), 0) / results.length * 100)
            : 0
    };

    return (
        <div className="h-full flex flex-col p-6 gap-6 overflow-y-auto">
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">总表数</div>
                    <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
                    <div className="text-xs text-slate-400 mt-1">已识别表对象</div>
                </div>
                <div className="bg-white border border-emerald-200 rounded-lg p-4 shadow-sm bg-emerald-50">
                    <div className="text-xs text-emerald-600 uppercase font-bold mb-1">已接受</div>
                    <div className="text-2xl font-bold text-emerald-700">{stats.accepted}</div>
                    <div className="text-xs text-emerald-500 mt-1">已确认识别结果</div>
                </div>
                <div className="bg-white border border-yellow-200 rounded-lg p-4 shadow-sm bg-yellow-50">
                    <div className="text-xs text-yellow-600 uppercase font-bold mb-1">待确认</div>
                    <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
                    <div className="text-xs text-yellow-500 mt-1">需要人工确认</div>
                </div>
                <div className="bg-white border border-orange-200 rounded-lg p-4 shadow-sm bg-orange-50">
                    <div className="text-xs text-orange-600 uppercase font-bold mb-1">冲突项</div>
                    <div className="text-2xl font-bold text-orange-700">{stats.conflicts}</div>
                    <div className="text-xs text-orange-500 mt-1">规则与AI不一致</div>
                </div>
                <div className="bg-white border border-blue-200 rounded-lg p-4 shadow-sm bg-blue-50">
                    <div className="text-xs text-blue-600 uppercase font-bold mb-1">平均置信度</div>
                    <div className="text-2xl font-bold text-blue-700">{stats.avgConfidence}%</div>
                    <div className="text-xs text-blue-500 mt-1">整体识别质量</div>
                </div>
            </div>

            {/* 快速操作区 */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">快速操作</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={onNavigateToComparison}
                        className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors text-left"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <FileCheck className="text-emerald-600" size={20} />
                            <span className="font-bold text-emerald-700">识别结果对比</span>
                        </div>
                        <p className="text-sm text-slate-600">查看并确认每张表的识别结果</p>
                    </button>
                    <button
                        onClick={onNavigateToBatch}
                        className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg hover:bg-blue-100 transition-colors text-left"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <CheckSquare className="text-blue-600" size={20} />
                            <span className="font-bold text-blue-700">批量确认</span>
                        </div>
                        <p className="text-sm text-slate-600">批量处理高置信度识别结果</p>
                    </button>
                    <button
                        onClick={onNavigateToConflict}
                        className="p-4 bg-orange-50 border-2 border-orange-300 rounded-lg hover:bg-orange-100 transition-colors text-left"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="text-orange-600" size={20} />
                            <span className="font-bold text-orange-700">冲突解释</span>
                        </div>
                        <p className="text-sm text-slate-600">处理规则与AI判断冲突</p>
                    </button>
                </div>
            </div>

            {/* 识别结果列表预览 */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-800">识别结果预览</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">表名</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">对象建议</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">置信度</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">状态</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {results.slice(0, 10).map((result: any) => (
                                <tr key={result.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-mono text-sm">{result.tableName}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-sm">{result.objectSuggestion?.name}</div>
                                        <div className="text-xs text-slate-500">{result.tableComment}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 bg-slate-200 rounded-full h-2">
                                                <div
                                                    className="bg-emerald-500 h-2 rounded-full"
                                                    style={{ width: `${(result.objectSuggestion?.confidence || 0) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-slate-600">
                                                {Math.round((result.objectSuggestion?.confidence || 0) * 100)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {result.hasConflict && (
                                            <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">冲突</span>
                                        )}
                                        {result.needsConfirmation && (
                                            <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded ml-1">待确认</span>
                                        )}
                                        {result.objectSuggestion?.status === 'accepted' && (
                                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded ml-1">已接受</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={onNavigateToComparison}
                                            className="text-blue-600 text-sm hover:underline"
                                        >
                                            查看详情
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {results.length > 10 && (
                    <div className="p-4 border-t border-slate-200 bg-slate-50 text-center">
                        <button
                            onClick={onNavigateToComparison}
                            className="text-blue-600 text-sm hover:underline"
                        >
                            查看全部 {results.length} 条记录 →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// 子组件1: 识别结果对比页
const IdentificationComparisonTab = ({ results, setResults, dataSources, onNavigateToBatch, onNavigateToConflict }: any) => {
    const [selectedTableId, setSelectedTableId] = useState<string | null>(results[0]?.id || null);
    const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
    const [highlightedField, setHighlightedField] = useState<string | null>(null);
    const [filter, setFilter] = useState({ needsConfirm: false, hasConflict: false, sortBy: 'confidence' });
    const [showWhyExplanation, setShowWhyExplanation] = useState<Record<string, boolean>>({});
    
    // 应用筛选和排序
    const filteredAndSortedResults = useMemo(() => {
        let filtered = [...results];
        
        if (filter.needsConfirm) {
            filtered = filtered.filter((r: any) => r.needsConfirmation);
        }
        if (filter.hasConflict) {
            filtered = filtered.filter((r: any) => r.hasConflict);
        }
        
        // 按置信度排序
        if (filter.sortBy === 'confidence') {
            filtered.sort((a: any, b: any) => 
                (b.objectSuggestion?.confidence || 0) - (a.objectSuggestion?.confidence || 0)
            );
        }
        
        return filtered;
    }, [results, filter]);
    
    const selectedResult = filteredAndSortedResults.find((r: any) => r.id === selectedTableId) || filteredAndSortedResults[0];
    const dataSource = dataSources.find((ds: any) => ds.id === selectedResult?.sourceId);
    
    const handleAction = (resultId: string, action: 'accept' | 'reject' | 'edit', type: 'object' | 'field', fieldName?: string, basis?: 'rule' | 'ai') => {
        const now = new Date().toLocaleString('zh-CN');
        const currentUser = '当前用户'; // 实际应该从用户上下文获取
        
        setResults((prev: any[]) => prev.map((r: any) => {
            if (r.id !== resultId) return r;
            if (type === 'object') {
                const auditTrail = {
                    recordBy: currentUser,
                    recordTime: now,
                    action: action,
                    basis: basis || (r.objectSuggestion?.source?.includes('规则') ? 'rule' : 'ai'),
                    source: r.objectSuggestion?.source || 'AI + 规则'
                };
                return { 
                    ...r, 
                    objectSuggestion: { 
                        ...r.objectSuggestion, 
                        status: action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'pending',
                        auditTrail: action !== 'edit' ? auditTrail : r.objectSuggestion?.auditTrail
                    },
                    needsConfirmation: action === 'accept' ? false : r.needsConfirmation
                };
            } else {
                return {
                    ...r,
                    fieldSuggestions: r.fieldSuggestions.map((f: any) => {
                        if (f.field === fieldName) {
                            const auditTrail = {
                                recordBy: currentUser,
                                recordTime: now,
                                action: action,
                                basis: basis || (f.conflict ? 'manual' : 'ai'),
                                fieldConfidence: f.confidence
                            };
                            return {
                                ...f,
                                status: action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : f.status,
                                auditTrail: action !== 'edit' ? auditTrail : f.auditTrail
                            };
                        }
                        return f;
                    })
                };
            }
        }));
    };

    return (
        <div className="h-full flex flex-col p-6 gap-4">
            {/* 顶部控制栏 */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="text-sm text-slate-600">
                        <span className="font-medium">任务：</span>
                        <span>Bottom-up 识别任务</span>
                    </div>
                    <div className="h-4 w-px bg-slate-300"></div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={filter.needsConfirm}
                            onChange={(e) => setFilter({ ...filter, needsConfirm: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-300"
                        />
                        <label className="text-sm text-slate-600">仅显示需确认</label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={filter.hasConflict}
                            onChange={(e) => setFilter({ ...filter, hasConflict: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-300"
                        />
                        <label className="text-sm text-slate-600">仅显示冲突</label>
                    </div>
                    <div className="h-4 w-px bg-slate-300"></div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-600">排序：</label>
                        <select
                            value={filter.sortBy}
                            onChange={(e) => setFilter({ ...filter, sortBy: e.target.value })}
                            className="border border-slate-300 rounded px-2 py-1 text-sm"
                        >
                            <option value="confidence">按置信度</option>
                            <option value="name">按表名</option>
                        </select>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={onNavigateToBatch}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                    >
                        <CheckSquare size={16} /> 批量确认
                    </button>
                    <button 
                        onClick={() => onNavigateToConflict()}
                        className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 flex items-center gap-2"
                    >
                        <AlertTriangle size={16} /> 查看冲突
                    </button>
                </div>
            </div>

            {/* 主内容区 - 左右对照 */}
            <div className="flex-1 flex gap-4 overflow-hidden">
                {/* 左侧：数据来源结构 */}
                <div className="w-80 bg-white border border-slate-200 rounded-lg flex flex-col overflow-hidden flex-shrink-0">
                    <div className="p-3 border-b border-slate-200 bg-slate-50">
                        <h3 className="text-sm font-bold text-slate-700">数据来源结构</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {filteredAndSortedResults.map((result: any) => (
                            <div
                                key={result.id}
                                onClick={() => {
                                    setSelectedTableId(result.id);
                                    setHighlightedField(null);
                                }}
                                className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                                    selectedTableId === result.id
                                        ? 'bg-emerald-50 border-2 border-emerald-300'
                                        : 'bg-slate-50 border border-slate-200 hover:border-emerald-200'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <div className="font-medium text-sm text-slate-800">{result.tableName}</div>
                                    {result.hasConflict && <AlertTriangle size={14} className="text-orange-500" />}
                                </div>
                                <div className="text-xs text-slate-500">{result.tableComment}</div>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    {result.fieldSuggestions.map((f: any, idx: number) => (
                                        <div
                                            key={idx}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setHighlightedField(f.field);
                                                setExpandedFields(new Set([f.field]));
                                            }}
                                            className={`text-xs px-2 py-0.5 rounded cursor-pointer transition-all ${
                                                highlightedField === f.field && selectedTableId === result.id
                                                    ? 'ring-2 ring-emerald-400 ring-offset-1 bg-emerald-200 text-emerald-800'
                                                    : f.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                    f.conflict ? 'bg-orange-100 text-orange-700' :
                                                    'bg-slate-100 text-slate-600'
                                            }`}
                                        >
                                            {f.field}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 右侧：语义建议区 */}
                <div className="flex-1 bg-white border border-slate-200 rounded-lg flex flex-col overflow-hidden">
                    {selectedResult ? (
                        <>
                            {/* 表级对象建议卡片 */}
                            <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-blue-50">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-lg font-bold text-slate-800">{selectedResult.objectSuggestion.name}</h3>
                                            <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded">
                                                来源：{selectedResult.objectSuggestion.source}
                                            </span>
                                            {selectedResult.objectSuggestion.risk !== 'low' && (
                                                <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded">
                                                    风险
                                                </span>
                                            )}
                                        </div>
                                        <div className="mb-2">
                                            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                                                <span>置信度</span>
                                                <span className="font-medium">{Math.round(selectedResult.objectSuggestion.confidence * 100)}%</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-2">
                                                <div
                                                    className="bg-emerald-500 h-2 rounded-full transition-all"
                                                    style={{ width: `${selectedResult.objectSuggestion.confidence * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => handleAction(selectedResult.id, 'accept', 'object')}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="接受"
                                        >
                                            <CheckCircle size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleAction(selectedResult.id, 'edit', 'object')}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="编辑"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleAction(selectedResult.id, 'reject', 'object')}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="拒绝"
                                        >
                                            <XCircle size={18} />
                                        </button>
                                    </div>
                                    {selectedResult.objectSuggestion?.auditTrail && (
                                        <div className="mt-2 pt-2 border-t border-slate-200">
                                            <div className="text-xs text-slate-500">
                                                <span>确认人：{selectedResult.objectSuggestion.auditTrail.recordBy}</span>
                                                <span className="mx-2">|</span>
                                                <span>时间：{selectedResult.objectSuggestion.auditTrail.recordTime}</span>
                                                <span className="mx-2">|</span>
                                                <span>依据：{selectedResult.objectSuggestion.auditTrail.basis === 'rule' ? '规则' : selectedResult.objectSuggestion.auditTrail.basis === 'ai' ? 'AI' : '手动'}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 字段级语义分类列表 */}
                            <div className="flex-1 overflow-y-auto p-4">
                                <h4 className="text-sm font-bold text-slate-700 mb-3">字段语义分类</h4>
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">字段</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">语义角色</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">AI 解释</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">置信度</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {selectedResult.fieldSuggestions.map((field: any, idx: number) => {
                                            const isHighlighted = highlightedField === field.field;
                                            return (
                                                <tr 
                                                    key={idx} 
                                                    className={`hover:bg-slate-50 transition-colors ${
                                                        isHighlighted ? 'bg-emerald-50 ring-2 ring-emerald-300' : ''
                                                    }`}
                                                >
                                                    <td className={`px-4 py-2 font-mono text-sm ${isHighlighted ? 'font-bold text-emerald-800' : ''}`}>
                                                        {field.field}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-slate-700">{field.semanticRole}</td>
                                                    <td className="px-4 py-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-slate-600">{field.aiExplanation}</span>
                                                            <button
                                                                onClick={() => {
                                                                    setShowWhyExplanation((prev: any) => ({
                                                                        ...prev,
                                                                        [`${selectedResult.id}_${field.field}`]: !prev[`${selectedResult.id}_${field.field}`]
                                                                    }));
                                                                }}
                                                                className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                                                title="为什么这么判断"
                                                            >
                                                                <MessageCircle size={12} />
                                                                为什么
                                                            </button>
                                                        </div>
                                                        {showWhyExplanation[`${selectedResult.id}_${field.field}`] && (
                                                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-slate-700">
                                                                <div className="font-medium mb-1">AI 推理依据：</div>
                                                                <div className="leading-relaxed">
                                                                    字段名 "{field.field}" 在表 "{selectedResult.tableName}" 中，根据命名模式和业务上下文分析：
                                                                    <ul className="list-disc list-inside mt-1 space-y-1">
                                                                        <li>命名模式：{field.field.includes('time') ? '包含 "time"，表示时间相关字段' : '字段命名符合常见语义模式'}</li>
                                                                        <li>业务语义：结合表名 "{selectedResult.tableComment}"，判断为 {field.semanticRole}</li>
                                                                        <li>数据特征：置信度 {Math.round(field.confidence * 100)}%，基于字段类型和业务上下文综合判断</li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-20 bg-slate-200 rounded-full h-1.5">
                                                                <div
                                                                    className="bg-blue-500 h-1.5 rounded-full"
                                                                    style={{ width: `${field.confidence * 100}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs text-slate-500">{Math.round(field.confidence * 100)}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex gap-1">
                                                                {field.status !== 'accepted' && (
                                                                    <button
                                                                        onClick={() => handleAction(selectedResult.id, 'accept', 'field', field.field)}
                                                                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                                        title="接受"
                                                                    >
                                                                        <CheckCircle size={16} />
                                                                    </button>
                                                                )}
                                                                {field.conflict && (
                                                                    <button
                                                                        onClick={() => {
                                                                            onNavigateToConflict(`${selectedResult.id}_${field.field}`);
                                                                        }}
                                                                        className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                                                                        title="查看冲突"
                                                                    >
                                                                        <AlertTriangle size={16} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            {field.auditTrail && (
                                                                <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-1">
                                                                    <div>确认：{field.auditTrail.recordBy} | {field.auditTrail.recordTime}</div>
                                                                    <div>依据：{field.auditTrail.basis === 'rule' ? '规则' : field.auditTrail.basis === 'ai' ? 'AI' : '手动'}</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                {/* 状态/行为升级建议 */}
                                {selectedResult.upgradeSuggestions && selectedResult.upgradeSuggestions.length > 0 && (
                                    <div className="mt-6 p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg">
                                        <div className="flex items-center gap-2 mb-3">
                                            <AlertTriangle size={16} className="text-orange-500" />
                                            <h4 className="text-sm font-bold text-slate-700">升级建议</h4>
                                        </div>
                                        <div className="space-y-2">
                                            {selectedResult.upgradeSuggestions.map((upgrade: any, idx: number) => (
                                                <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
                                                    <div>
                                                        <span className="text-sm text-slate-700">「{upgrade.source}」</span>
                                                        <ArrowRight size={14} className="inline mx-2 text-slate-400" />
                                                        <span className="text-sm font-medium text-slate-800">{upgrade.target}</span>
                                                    </div>
                                                    <span className="text-xs text-slate-500">置信度: {Math.round(upgrade.confidence * 100)}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-400">
                            请选择左侧表查看识别结果
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// 子组件2: 批量确认页
const BatchConfirmationTab = ({ results, setResults, selectedItems, setSelectedItems, filter, setFilter }: any) => {
    const filteredResults = results.filter((r: any) => {
        if (filter.needsConfirm && !r.needsConfirmation) return false;
        if (filter.hasConflict && !r.hasConflict) return false;
        if (filter.confidence === 'high' && r.objectSuggestion.confidence < 0.8) return false;
        if (filter.confidence === 'medium' && (r.objectSuggestion.confidence < 0.6 || r.objectSuggestion.confidence >= 0.8)) return false;
        if (filter.confidence === 'low' && r.objectSuggestion.confidence >= 0.6) return false;
        return true;
    });

    const toggleItem = (id: string) => {
        const newSet = new Set(selectedItems);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedItems(newSet);
    };

    const toggleAll = () => {
        if (selectedItems.size === filteredResults.length) {
            setSelectedItems(new Set());
        } else {
            // 只选择高置信度且无冲突的项
            const highConfidenceNoConflict = filteredResults
                .filter((r: any) => r.objectSuggestion.confidence >= 0.8 && !r.hasConflict)
                .map((r: any) => r.id);
            setSelectedItems(new Set(highConfidenceNoConflict));
        }
    };

    const handleBatchAction = (action: 'accept' | 'reject') => {
        if (selectedItems.size === 0) return;
        if (!confirm(`确定要${action === 'accept' ? '接受' : '拒绝'} ${selectedItems.size} 项识别结果吗？`)) return;
        
        const now = new Date().toLocaleString('zh-CN');
        const currentUser = '当前用户'; // 实际应该从用户上下文获取
        
        setResults((prev: any[]) => prev.map((r: any) => {
            if (selectedItems.has(r.id)) {
                const auditTrail = {
                    recordBy: currentUser,
                    recordTime: now,
                    action: action,
                    basis: 'batch', // 批量操作
                    source: r.objectSuggestion?.source || 'AI + 规则'
                };
                return {
                    ...r,
                    objectSuggestion: { 
                        ...r.objectSuggestion, 
                        status: action === 'accept' ? 'accepted' : 'rejected',
                        auditTrail: auditTrail
                    },
                    needsConfirmation: false
                };
            }
            return r;
        }));
        setSelectedItems(new Set());
        alert(`已${action === 'accept' ? '接受' : '拒绝'} ${selectedItems.size} 项结果`);
    };

    return (
        <div className="h-full flex flex-col p-6 gap-4">
            {/* 筛选区 */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center gap-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-600">类型：</label>
                    <select
                        value={filter.type || 'all'}
                        onChange={(e) => setFilter({ ...filter, type: e.target.value === 'all' ? undefined : e.target.value })}
                        className="border border-slate-300 rounded px-3 py-1 text-sm"
                    >
                        <option value="all">全部</option>
                        <option value="table">表对象</option>
                        <option value="field">字段</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-600">置信度：</label>
                    <select
                        value={filter.confidence || 'all'}
                        onChange={(e) => setFilter({ ...filter, confidence: e.target.value === 'all' ? undefined : e.target.value })}
                        className="border border-slate-300 rounded px-3 py-1 text-sm"
                    >
                        <option value="all">全部</option>
                        <option value="high">高 (≥80%)</option>
                        <option value="medium">中 (60-80%)</option>
                        <option value="low">低 (&lt;60%)</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={filter.needsConfirm || false}
                        onChange={(e) => setFilter({ ...filter, needsConfirm: e.target.checked ? true : undefined })}
                        className="w-4 h-4 rounded border-slate-300"
                    />
                    <label className="text-sm text-slate-600">仅显示需确认</label>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={filter.hasConflict || false}
                        onChange={(e) => setFilter({ ...filter, hasConflict: e.target.checked ? true : undefined })}
                        className="w-4 h-4 rounded border-slate-300"
                    />
                    <label className="text-sm text-slate-600">仅显示冲突</label>
                </div>
            </div>

            {/* 表格 */}
            <div className="flex-1 bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={selectedItems.size === filteredResults.length && filteredResults.length > 0}
                                onChange={toggleAll}
                                className="w-4 h-4 rounded border-slate-300"
                            />
                            <span className="text-sm text-slate-600">全选（仅高置信度无冲突项）</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleBatchAction('accept')}
                                disabled={selectedItems.size === 0}
                                className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                批量接受 ({selectedItems.size})
                            </button>
                            <button
                                onClick={() => handleBatchAction('reject')}
                                disabled={selectedItems.size === 0}
                                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                批量拒绝 ({selectedItems.size})
                            </button>
                            <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50">
                                导出
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 sticky top-0">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">勾选</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">类型</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">表名</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">建议内容</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">置信度</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">状态</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredResults.map((result: any) => {
                                const isHighConfidenceNoConflict = result.objectSuggestion.confidence >= 0.8 && !result.hasConflict;
                                const isSelected = selectedItems.has(result.id);
                                return (
                                    <tr key={result.id} className={isSelected ? 'bg-emerald-50' : 'hover:bg-slate-50'}>
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleItem(result.id)}
                                                disabled={!isHighConfidenceNoConflict}
                                                className="w-4 h-4 rounded border-slate-300"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">表对象</span>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-sm">{result.tableName}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-sm">{result.objectSuggestion.name}</div>
                                            <div className="text-xs text-slate-500">{result.tableComment}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 bg-slate-200 rounded-full h-2">
                                                    <div
                                                        className="bg-emerald-500 h-2 rounded-full"
                                                        style={{ width: `${result.objectSuggestion.confidence * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-slate-600">{Math.round(result.objectSuggestion.confidence * 100)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {result.hasConflict && <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">冲突</span>}
                                            {result.needsConfirmation && <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded ml-1">待确认</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button className="text-blue-600 text-sm hover:underline">查看</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// 子组件3: 冲突解释与校准页
const ConflictExplanationTab = ({ results, selectedConflict, setSelectedConflict, onNavigateToComparison }: any) => {
    // 规则判断数据映射
    const ruleJudgments: Record<string, any> = {
        'IR_001_pay_time': {
            rules: [
                { id: 'R001', name: '时间字段规则', reason: '字段名包含 "time" 且类型为 datetime', weight: 0.3, result: '时间戳' },
                { id: 'R002', name: '支付相关规则', reason: '字段名包含 "pay" 关键字', weight: 0.4, result: '支付属性' },
            ],
            ruleResult: '支付属性',
            ruleConfidence: 0.70
        },
        'IR_004_inject_time': {
            rules: [
                { id: 'R003', name: '行为时间规则', reason: '字段名包含 "inject" 和 "time"', weight: 0.5, result: '行为时间' },
                { id: 'R004', name: '医疗行为规则', reason: '表名包含 "vac" 且字段为时间类型', weight: 0.3, result: '医疗行为时间' },
            ],
            ruleResult: '行为时间',
            ruleConfidence: 0.80
        },
        'IR_005_hosp_level': {
            rules: [
                { id: 'R005', name: '等级字段规则', reason: '字段名包含 "level"', weight: 0.4, result: '等级属性' },
                { id: 'R006', name: '字典表规则', reason: '表名包含 "dict" 且字段为枚举类型', weight: 0.3, result: '字典值' },
            ],
            ruleResult: '等级属性',
            ruleConfidence: 0.70
        },
        'IR_007_pay_time': {
            rules: [
                { id: 'R007', name: '支付时间规则', reason: '字段名包含 "pay_time"', weight: 0.5, result: '支付时间属性' },
                { id: 'R008', name: '记录表时间规则', reason: '表名包含 "record" 且字段为时间类型', weight: 0.3, result: '记录时间' },
            ],
            ruleResult: '支付时间属性',
            ruleConfidence: 0.80
        },
        'IR_010_exam_type': {
            rules: [
                { id: 'R009', name: '类型字段规则', reason: '字段名包含 "type"', weight: 0.4, result: '类型属性' },
                { id: 'R010', name: '体检相关规则', reason: '表名包含 "exam" 且字段为枚举类型', weight: 0.3, result: '体检类型' },
            ],
            ruleResult: '类型属性',
            ruleConfidence: 0.70
        },
        'IR_010_exam_result': {
            rules: [
                { id: 'R011', name: '结果字段规则', reason: '字段名包含 "result"', weight: 0.4, result: '结果属性' },
                { id: 'R012', name: '状态字段规则', reason: '字段名包含 "result" 且可能为状态值', weight: 0.3, result: '状态属性' },
            ],
            ruleResult: '结果属性',
            ruleConfidence: 0.65
        }
    };

    // AI 判断详细数据映射
    const aiJudgments: Record<string, any> = {
        'IR_001_pay_time': {
            detailedExplanation: '根据字段名 "pay_time" 和上下文分析，该字段记录的是支付行为发生的时间点，属于行为线索类型。结合表名 "order_info" 和业务场景，判断为支付行为的时间戳。',
            reasoning: '字段命名模式：pay + time 组合通常表示支付行为的时间点；业务上下文：订单表中的支付时间字段；数据特征：datetime 类型，支持精确时间记录。'
        },
        'IR_004_inject_time': {
            detailedExplanation: '字段 "inject_time" 在疫苗接种记录表中，表示接种行为发生的时间。虽然包含时间信息，但更强调行为的发生，因此归类为行为线索而非单纯的时间戳。',
            reasoning: '医疗业务语义：疫苗接种是典型的医疗行为；字段语义：inject 表示动作，time 表示时间，组合表示行为时间；业务价值：可用于分析接种行为的时间分布。'
        },
        'IR_005_hosp_level': {
            detailedExplanation: '医院等级字段虽然看起来是属性，但在字典表中，等级通常有明确的枚举值（如一级、二级、三级），具有状态特征。建议升级为状态对象以便更好地管理状态流转。',
            reasoning: '字典表特征：表名包含 "dict"，通常存储枚举值；业务语义：医院等级是相对固定的状态值；扩展性：未来可能需要状态流转和版本管理。'
        },
        'IR_007_pay_time': {
            detailedExplanation: '支付记录表中的支付时间字段，记录的是支付行为发生的时间点。虽然可以视为时间戳，但结合业务场景，更应视为支付行为的组成部分。',
            reasoning: '业务场景：支付记录表专门记录支付行为；字段语义：pay_time 强调支付动作的时间；数据价值：可用于分析支付行为模式和趋势。'
        },
        'IR_010_exam_type': {
            detailedExplanation: '体检类型字段在健康体检记录中，表示体检的类别（如常规体检、专项体检等）。虽然可以视为属性，但类型值通常有固定的枚举范围，具有状态特征。',
            reasoning: '业务语义：体检类型是相对固定的分类；枚举特征：通常有预定义的类型列表；扩展需求：未来可能需要类型管理和分类规则。'
        },
        'IR_010_exam_result': {
            detailedExplanation: '体检结果字段表示体检的最终结果状态（如正常、异常等）。虽然可以视为属性，但结果值通常有明确的状态含义，建议升级为状态对象。',
            reasoning: '状态特征：体检结果有明确的状态值；业务价值：结果状态可能影响后续业务流程；管理需求：需要状态流转和结果追踪。'
        }
    };

    const conflicts = results
        .flatMap((r: any) => r.fieldSuggestions
            .filter((f: any) => f.conflict)
            .map((f: any) => ({ 
                ...f, 
                tableId: r.id, 
                tableName: r.tableName, 
                objectSuggestion: r.objectSuggestion,
                ruleJudgment: ruleJudgments[`${r.id}_${f.field}`],
                aiJudgment: aiJudgments[`${r.id}_${f.field}`]
            }))
        );

    const currentConflict = conflicts.find((c: any) => `${c.tableId}_${c.field}` === selectedConflict) || conflicts[0];

    return (
        <div className="h-full flex flex-col p-6 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4 flex-shrink-0">
                <h3 className="text-lg font-bold text-slate-800 mb-4">冲突与解释</h3>
                <p className="text-sm text-slate-600">这是语义平台区别于普通自动建模工具的关键页面</p>
            </div>

            <div className="flex-1 flex gap-4 overflow-hidden">
                {/* 左栏：规则判断 */}
                <div className="w-80 bg-white border border-slate-200 rounded-lg flex flex-col overflow-hidden flex-shrink-0">
                    <div className="p-4 border-b border-slate-200 bg-slate-50">
                        <h4 className="text-sm font-bold text-slate-700">规则判断</h4>
                    </div>
                    {currentConflict && currentConflict.ruleJudgment && (
                        <div className="p-4 border-b border-slate-200 bg-blue-50">
                            <div className="text-xs text-slate-600 mb-2">当前选中冲突的规则判断：</div>
                            <div className="space-y-2">
                                {currentConflict.ruleJudgment.rules.map((rule: any, idx: number) => (
                                    <div key={idx} className="p-2 bg-white rounded border border-blue-200">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-mono text-blue-600">{rule.id}</span>
                                            <span className="text-xs text-slate-500">权重: {Math.round(rule.weight * 100)}%</span>
                                        </div>
                                        <div className="text-xs font-medium text-slate-700 mb-1">{rule.name}</div>
                                        <div className="text-xs text-slate-600 mb-1">{rule.reason}</div>
                                        <div className="text-xs text-blue-600">结果: {rule.result}</div>
                                    </div>
                                ))}
                                <div className="mt-2 p-2 bg-white rounded border-2 border-blue-300">
                                    <div className="text-xs text-slate-600 mb-1">规则综合判断：</div>
                                    <div className="text-sm font-bold text-blue-700">{currentConflict.ruleJudgment.ruleResult}</div>
                                    <div className="text-xs text-slate-500 mt-1">置信度: {Math.round(currentConflict.ruleJudgment.ruleConfidence * 100)}%</div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {conflicts.map((conflict: any, idx: number) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedConflict(`${conflict.tableId}_${conflict.field}`)}
                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                    selectedConflict === `${conflict.tableId}_${conflict.field}`
                                        ? 'bg-orange-50 border-orange-300'
                                        : 'bg-slate-50 border-slate-200 hover:border-orange-200'
                                }`}
                            >
                                <div className="font-medium text-sm text-slate-800 mb-1">{conflict.tableName}.{conflict.field}</div>
                                <div className="text-xs text-slate-500 mb-2">规则与 AI 判断不一致</div>
                                {conflict.ruleJudgment && (
                                    <div className="text-xs text-blue-600">
                                        规则: {conflict.ruleJudgment.ruleResult}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 中栏：AI 判断 */}
                <div className="flex-1 bg-white border border-slate-200 rounded-lg flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50">
                        <h4 className="text-sm font-bold text-slate-700">AI 判断</h4>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        {currentConflict ? (
                            <div className="space-y-4">
                                <div>
                                    <div className="text-xs uppercase text-slate-400 font-bold mb-1">AI 分类结果</div>
                                    <div className="text-lg font-bold text-slate-800">{currentConflict.semanticRole}</div>
                                </div>
                                <div>
                                    <div className="text-xs uppercase text-slate-400 font-bold mb-1">置信度</div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-48 bg-slate-200 rounded-full h-3">
                                            <div
                                                className="bg-blue-500 h-3 rounded-full"
                                                style={{ width: `${currentConflict.confidence * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-slate-600">{Math.round(currentConflict.confidence * 100)}%</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs uppercase text-slate-400 font-bold mb-1">原文引用</div>
                                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                                        <div className="text-sm text-slate-700 mb-1">字段名：<code className="font-mono">{currentConflict.field}</code></div>
                                        <div className="text-sm text-slate-700">表名：<code className="font-mono">{currentConflict.tableName}</code></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs uppercase text-slate-400 font-bold mb-1">推理说明</div>
                                    <div className="p-3 bg-blue-50 rounded border border-blue-200 text-sm text-slate-700">
                                        <div className="mb-2">{currentConflict.aiExplanation}</div>
                                        {currentConflict.aiJudgment && (
                                            <>
                                                <div className="mt-3 pt-3 border-t border-blue-200">
                                                    <div className="font-medium mb-1">详细分析：</div>
                                                    <div className="text-xs leading-relaxed">{currentConflict.aiJudgment.detailedExplanation}</div>
                                                </div>
                                                <div className="mt-3 pt-3 border-t border-blue-200">
                                                    <div className="font-medium mb-1">推理依据：</div>
                                                    <div className="text-xs leading-relaxed">{currentConflict.aiJudgment.reasoning}</div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">
                                请选择左侧冲突项查看详情
                            </div>
                        )}
                    </div>
                </div>

                {/* 右栏：用户决策 */}
                <div className="w-80 bg-white border border-slate-200 rounded-lg flex flex-col overflow-hidden flex-shrink-0">
                    <div className="p-4 border-b border-slate-200 bg-slate-50">
                        <h4 className="text-sm font-bold text-slate-700">用户决策</h4>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {currentConflict ? (
                            <>
                                <div>
                                    <div className="text-xs uppercase text-slate-400 font-bold mb-2">推荐结果</div>
                                    <div className="p-3 bg-emerald-50 border-2 border-emerald-300 rounded-lg">
                                        <div className="font-bold text-emerald-700">{currentConflict.semanticRole}</div>
                                        <div className="text-xs text-emerald-600 mt-1">基于 AI 判断（置信度较高）</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs uppercase text-slate-400 font-bold mb-2">选择方案</div>
                                    <div className="space-y-2">
                                        <button className="w-full p-3 text-left border-2 border-blue-300 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                                            <div className="font-medium text-sm text-slate-800">采用规则</div>
                                            <div className="text-xs text-slate-500 mt-1">使用规则引擎的判断结果</div>
                                        </button>
                                        <button className="w-full p-3 text-left border-2 border-emerald-300 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                                            <div className="font-medium text-sm text-slate-800">采用 AI</div>
                                            <div className="text-xs text-slate-500 mt-1">使用 AI 的判断结果（推荐）</div>
                                        </button>
                                        <button className="w-full p-3 text-left border-2 border-slate-300 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                            <div className="font-medium text-sm text-slate-800">手动指定</div>
                                            <div className="text-xs text-slate-500 mt-1">自定义语义角色</div>
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs uppercase text-slate-400 font-bold mb-2">决策说明</div>
                                    <textarea
                                        className="w-full p-3 border border-slate-300 rounded-lg text-sm resize-none"
                                        rows={3}
                                        placeholder="可选：填写决策依据..."
                                    ></textarea>
                                </div>
                                <button className="w-full py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700">
                                    确认决策
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                                请选择冲突项进行决策
                            </div>
                        )}
                    </div>
                </div>
            </div>
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
    const [viewMode, setViewMode] = useState<'lineage' | 'impact' | 'dependency'>('lineage');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [zoomLevel, setZoomLevel] = useState(1);
    const [showMiniMap, setShowMiniMap] = useState(true);
    const [layoutMode, setLayoutMode] = useState<'horizontal' | 'vertical' | 'circular'>('horizontal');

    // 增强的血缘数据模拟
    const mockLineageData = {
        nodes: [
            { 
                id: 'DS_001', 
                label: '卫健委_前置库', 
                type: 'datasource',
                x: 100, 
                y: 200,
                description: 'MySQL数据库 - 主要存储医疗机构数据',
                status: 'active',
                owner: 'DBA团队',
                lastUpdate: '2024-05-21 10:30',
                records: '2.5M',
                size: '15.2GB',
                connections: 8,
                tags: ['MySQL', '生产环境', '核心数据源']
            },
            { 
                id: 'DS_002', 
                label: '公安人口库', 
                type: 'datasource',
                x: 100, 
                y: 350,
                description: 'Oracle数据库 - 全市人口基础信息',
                status: 'active',
                owner: '公安数据中心',
                lastUpdate: '2024-05-21 09:15',
                records: '8.7M',
                size: '45.8GB',
                connections: 12,
                tags: ['Oracle', '权威数据源', '实时同步']
            },
            { 
                id: 'TBL_001', 
                label: 't_pop_base_info', 
                type: 'table',
                x: 350, 
                y: 150,
                description: '人口基础信息表 - 新生儿核心数据',
                status: 'active',
                owner: 'DBA团队',
                lastUpdate: '2024-05-21 14:20',
                records: '1.2M',
                size: '8.5GB',
                columns: 15,
                tags: ['核心表', '高频访问', '实时更新']
            },
            { 
                id: 'TBL_002', 
                label: 't_med_birth_cert', 
                type: 'table',
                x: 350, 
                y: 250,
                description: '出生证明记录表 - 医学证明信息',
                status: 'active',
                owner: 'DBA团队',
                lastUpdate: '2024-05-21 13:45',
                records: '450K',
                size: '2.1GB',
                columns: 12,
                tags: ['证照表', '业务关键', '审计跟踪']
            },
            { 
                id: 'TBL_003', 
                label: 't_identity_verify', 
                type: 'table',
                x: 350, 
                y: 350,
                description: '身份验证记录表 - 验证日志',
                status: 'active',
                owner: '安全团队',
                lastUpdate: '2024-05-21 15:10',
                records: '3.2M',
                size: '1.8GB',
                columns: 8,
                tags: ['安全表', '日志记录', '合规要求']
            },
            { 
                id: 'BO_NEWBORN', 
                label: '新生儿业务对象', 
                type: 'object',
                x: 600, 
                y: 150,
                description: '新生儿核心业务对象 - 统一数据模型',
                status: 'active',
                owner: '业务架构师',
                lastUpdate: '2024-05-20 16:30',
                fields: 18,
                mappings: 4,
                version: 'v1.2.3',
                tags: ['核心对象', '标准化', '业务建模']
            },
            { 
                id: 'BO_CERT', 
                label: '出生证明业务对象', 
                type: 'object',
                x: 600, 
                y: 250,
                description: '出生医学证明业务对象 - 证照标准模型',
                status: 'active',
                owner: '业务架构师',
                lastUpdate: '2024-05-19 11:20',
                fields: 12,
                mappings: 2,
                version: 'v1.1.0',
                tags: ['证照对象', '法规遵循', '标准化']
            },
            { 
                id: 'SVC_001', 
                label: '新生儿查询服务', 
                type: 'service',
                x: 850, 
                y: 120,
                description: 'REST API - 新生儿信息查询服务',
                status: 'online',
                owner: 'API团队',
                lastUpdate: '2024-05-21 09:45',
                qps: 125,
                latency: '45ms',
                sla: '99.9%',
                tags: ['REST API', '高可用', '实时查询']
            },
            { 
                id: 'SVC_002', 
                label: '证明申领服务', 
                type: 'service',
                x: 850, 
                y: 220,
                description: 'REST API - 出生证明申领服务',
                status: 'online',
                owner: 'API团队',
                lastUpdate: '2024-05-20 14:15',
                qps: 45,
                latency: '120ms',
                sla: '99.5%',
                tags: ['REST API', '业务流程', '异步处理']
            },
            { 
                id: 'SVC_003', 
                label: '身份验证服务', 
                type: 'service',
                x: 850, 
                y: 320,
                description: 'gRPC API - 身份验证服务',
                status: 'online',
                owner: '安全团队',
                lastUpdate: '2024-05-21 08:30',
                qps: 280,
                latency: '25ms',
                sla: '99.95%',
                tags: ['gRPC', '安全认证', '高性能']
            },
            { 
                id: 'APP_001', 
                label: '出生一件事应用', 
                type: 'application',
                x: 1100, 
                y: 200,
                description: '前端应用 - 出生一件事办事平台',
                status: 'running',
                owner: '前端团队',
                lastUpdate: '2024-05-21 16:00',
                users: '15K',
                uptime: '99.8%',
                version: 'v2.1.5',
                tags: ['React应用', '用户门户', '移动适配']
            },
            { 
                id: 'APP_002', 
                label: '数据管理后台', 
                type: 'application',
                x: 1100, 
                y: 320,
                description: '管理后台 - 数据维护和监控平台',
                status: 'running',
                owner: '运维团队',
                lastUpdate: '2024-05-20 12:30',
                users: '200',
                uptime: '99.9%',
                version: 'v1.8.2',
                tags: ['Vue应用', '管理后台', '数据运维']
            }
        ],
        edges: [
            { from: 'DS_001', to: 'TBL_001', label: '包含', type: 'contains', strength: 'strong' },
            { from: 'DS_001', to: 'TBL_002', label: '包含', type: 'contains', strength: 'strong' },
            { from: 'DS_002', to: 'TBL_003', label: '包含', type: 'contains', strength: 'strong' },
            { from: 'TBL_001', to: 'BO_NEWBORN', label: '映射', type: 'mapping', strength: 'strong' },
            { from: 'TBL_002', to: 'BO_CERT', label: '映射', type: 'mapping', strength: 'strong' },
            { from: 'TBL_003', to: 'SVC_003', label: '直接调用', type: 'direct', strength: 'medium' },
            { from: 'BO_NEWBORN', to: 'SVC_001', label: '服务化', type: 'service', strength: 'strong' },
            { from: 'BO_CERT', to: 'SVC_002', label: '服务化', type: 'service', strength: 'strong' },
            { from: 'SVC_001', to: 'APP_001', label: '调用', type: 'invoke', strength: 'strong' },
            { from: 'SVC_002', to: 'APP_001', label: '调用', type: 'invoke', strength: 'strong' },
            { from: 'SVC_003', to: 'APP_001', label: '调用', type: 'invoke', strength: 'medium' },
            { from: 'SVC_001', to: 'APP_002', label: '调用', type: 'invoke', strength: 'weak' },
            { from: 'SVC_002', to: 'APP_002', label: '调用', type: 'invoke', strength: 'weak' },
            { from: 'SVC_003', to: 'APP_002', label: '调用', type: 'invoke', strength: 'medium' }
        ]
    };

    // 过滤节点和边
    const filteredNodes = mockLineageData.nodes.filter(node => {
        const matchesSearch = node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            node.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            node.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = filterType === 'all' || node.type === filterType;
        return matchesSearch && matchesType;
    });

    const filteredEdges = mockLineageData.edges.filter(edge => 
        filteredNodes.some(n => n.id === edge.from) && filteredNodes.some(n => n.id === edge.to)
    );

    const nodeTypes = [
        { id: 'all', label: '全部', count: mockLineageData.nodes.length },
        { id: 'datasource', label: '数据源', count: mockLineageData.nodes.filter(n => n.type === 'datasource').length },
        { id: 'table', label: '数据表', count: mockLineageData.nodes.filter(n => n.type === 'table').length },
        { id: 'object', label: '业务对象', count: mockLineageData.nodes.filter(n => n.type === 'object').length },
        { id: 'service', label: '服务', count: mockLineageData.nodes.filter(n => n.type === 'service').length },
        { id: 'application', label: '应用', count: mockLineageData.nodes.filter(n => n.type === 'application').length }
    ];

    const getNodeIcon = (type: string) => {
        switch (type) {
            case 'datasource': return <Database size={20} className="text-blue-600" />;
            case 'table': return <Table size={20} className="text-emerald-600" />;
            case 'object': return <Box size={20} className="text-purple-600" />;
            case 'service': return <Server size={20} className="text-orange-600" />;
            case 'application': return <Globe size={20} className="text-pink-600" />;
            default: return <FileText size={20} className="text-slate-600" />;
        }
    };

    const getNodeColor = (type: string) => {
        switch (type) {
            case 'datasource': return 'bg-blue-50 border-blue-300 text-blue-800 hover:bg-blue-100';
            case 'table': return 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100';
            case 'object': return 'bg-purple-50 border-purple-300 text-purple-800 hover:bg-purple-100';
            case 'service': return 'bg-orange-50 border-orange-300 text-orange-800 hover:bg-orange-100';
            case 'application': return 'bg-pink-50 border-pink-300 text-pink-800 hover:bg-pink-100';
            default: return 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100';
        }
    };

    const getEdgeColor = (type: string, strength: string) => {
        const baseColors = {
            contains: '#3b82f6',
            mapping: '#10b981',
            service: '#8b5cf6',
            invoke: '#f59e0b',
            direct: '#ef4444'
        };
        const opacity = strength === 'strong' ? '1' : strength === 'medium' ? '0.7' : '0.4';
        return `${baseColors[type as keyof typeof baseColors] || '#64748b'}${Math.round(parseFloat(opacity) * 255).toString(16)}`;
    };

    const getStatusIndicator = (status: string) => {
        switch (status) {
            case 'active':
            case 'online':
            case 'running':
                return <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>;
            case 'inactive':
            case 'offline':
            case 'stopped':
                return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
            case 'warning':
                return <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>;
            default:
                return <div className="w-2 h-2 bg-slate-400 rounded-full"></div>;
        }
    };

    return (
        <div className="h-full flex flex-col gap-6 p-6">
            {/* 页面头部 */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <GitBranch className="text-purple-500" /> 全链路血缘分析
                    </h2>
                    <p className="text-slate-500 mt-1">数据流向追踪和影响分析 - 可视化数据血缘关系</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm flex items-center gap-2 hover:bg-slate-50">
                        <Share2 size={16} /> 导出图片
                    </button>
                    <button className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm flex items-center gap-2 hover:bg-slate-50">
                        <RefreshCw size={16} /> 刷新血缘
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-blue-700">
                        <Network size={16} /> 影响分析
                    </button>
                </div>
            </div>

            {/* 控制面板 */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    {/* 视图模式切换 */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-slate-100 rounded-lg p-1">
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
                            <button
                                onClick={() => setViewMode('dependency')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                                    viewMode === 'dependency' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                依赖分析
                            </button>
                        </div>

                        {/* 布局模式 */}
                        <div className="flex items-center bg-slate-100 rounded-lg p-1">
                            <button
                                onClick={() => setLayoutMode('horizontal')}
                                className={`p-1.5 rounded-md transition-all ${
                                    layoutMode === 'horizontal' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                                title="水平布局"
                            >
                                <ArrowRight size={16} />
                            </button>
                            <button
                                onClick={() => setLayoutMode('vertical')}
                                className={`p-1.5 rounded-md transition-all ${
                                    layoutMode === 'vertical' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                                title="垂直布局"
                            >
                                <ChevronDown size={16} />
                            </button>
                            <button
                                onClick={() => setLayoutMode('circular')}
                                className={`p-1.5 rounded-md transition-all ${
                                    layoutMode === 'circular' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                                title="环形布局"
                            >
                                <RefreshCw size={16} />
                            </button>
                        </div>
                    </div>

                    {/* 搜索和筛选 */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-slate-100 rounded-lg p-1 gap-1">
                            {nodeTypes.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => setFilterType(type.id)}
                                    className={`px-2 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
                                        filterType === type.id
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    {type.label}
                                    <span className="bg-slate-200 text-slate-600 px-1 py-0.5 rounded text-xs">
                                        {type.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="搜索节点名称或标签..."
                                className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 w-64 shadow-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 统计概览 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">数据源</p>
                            <p className="text-xl font-bold text-blue-600">{mockLineageData.nodes.filter(n => n.type === 'datasource').length}</p>
                        </div>
                        <Database size={20} className="text-blue-500" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">业务对象</p>
                            <p className="text-xl font-bold text-purple-600">{mockLineageData.nodes.filter(n => n.type === 'object').length}</p>
                        </div>
                        <Box size={20} className="text-purple-500" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">API服务</p>
                            <p className="text-xl font-bold text-orange-600">{mockLineageData.nodes.filter(n => n.type === 'service').length}</p>
                        </div>
                        <Server size={20} className="text-orange-500" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">应用系统</p>
                            <p className="text-xl font-bold text-pink-600">{mockLineageData.nodes.filter(n => n.type === 'application').length}</p>
                        </div>
                        <Globe size={20} className="text-pink-500" />
                    </div>
                </div>
            </div>

            {/* 血缘图可视化区域 */}
            <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden relative min-h-[600px]">
                {/* 工具栏 */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 bg-white rounded-lg shadow-lg border border-slate-200 p-1">
                    <button 
                        onClick={() => setZoomLevel(Math.min(zoomLevel + 0.2, 2))}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded transition-colors" 
                        title="放大"
                    >
                        <ZoomIn size={18} />
                    </button>
                    <button 
                        onClick={() => setZoomLevel(Math.max(zoomLevel - 0.2, 0.5))}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded transition-colors" 
                        title="缩小"
                    >
                        <ZoomOut size={18} />
                    </button>
                    <button 
                        onClick={() => setZoomLevel(1)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded transition-colors" 
                        title="重置缩放"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <div className="h-px bg-slate-200 my-1"></div>
                    <button 
                        onClick={() => setShowMiniMap(!showMiniMap)}
                        className={`p-2 rounded transition-colors ${
                            showMiniMap ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
                        }`} 
                        title="小地图"
                    >
                        <Eye size={18} />
                    </button>
                    <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded transition-colors" title="导出SVG">
                        <Share2 size={18} />
                    </button>
                </div>

                {/* 图例 */}
                <div className="absolute top-4 right-4 z-20 bg-white rounded-lg shadow-lg border border-slate-200 p-3">
                    <h4 className="text-sm font-bold text-slate-700 mb-2">图例</h4>
                    <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                            <Database size={14} className="text-blue-600" />
                            <span>数据源</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Table size={14} className="text-emerald-600" />
                            <span>数据表</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Box size={14} className="text-purple-600" />
                            <span>业务对象</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Server size={14} className="text-orange-600" />
                            <span>API服务</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe size={14} className="text-pink-600" />
                            <span>应用系统</span>
                        </div>
                    </div>
                </div>

                {/* 小地图 */}
                {showMiniMap && (
                    <div className="absolute bottom-4 right-4 z-20 w-48 h-32 bg-white border border-slate-200 rounded-lg shadow-lg p-2">
                        <div className="text-xs text-slate-500 mb-1">导航</div>
                        <div className="w-full h-full bg-slate-50 rounded relative overflow-hidden">
                            {filteredNodes.map((node) => (
                                <div
                                    key={node.id}
                                    className={`absolute w-2 h-2 rounded-full ${
                                        node.type === 'datasource' ? 'bg-blue-500' :
                                        node.type === 'table' ? 'bg-emerald-500' :
                                        node.type === 'object' ? 'bg-purple-500' :
                                        node.type === 'service' ? 'bg-orange-500' :
                                        'bg-pink-500'
                                    }`}
                                    style={{ 
                                        left: `${(node.x / 1200) * 100}%`, 
                                        top: `${(node.y / 400) * 100}%` 
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* 主画布 */}
                <div className="flex-1 overflow-auto bg-slate-50" style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}>
                    <div className="relative w-full h-full min-w-[1400px] min-h-[800px] p-8">
                        {/* SVG连线层 */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                            {filteredEdges.map((edge, index) => {
                                const fromNode = filteredNodes.find(n => n.id === edge.from);
                                const toNode = filteredNodes.find(n => n.id === edge.to);
                                if (!fromNode || !toNode) return null;

                                const strokeColor = getEdgeColor(edge.type, edge.strength);
                                const strokeWidth = edge.strength === 'strong' ? 3 : edge.strength === 'medium' ? 2 : 1;

                                return (
                                    <g key={index}>
                                        <line
                                            x1={fromNode.x + 120}
                                            y1={fromNode.y + 50}
                                            x2={toNode.x}
                                            y2={toNode.y + 50}
                                            stroke={strokeColor}
                                            strokeWidth={strokeWidth}
                                            strokeDasharray={edge.type === 'invoke' ? '5,5' : 'none'}
                                            markerEnd="url(#arrowhead)"
                                            className="transition-all duration-300"
                                        />
                                        <text
                                            x={(fromNode.x + toNode.x + 120) / 2}
                                            y={(fromNode.y + toNode.y + 50) / 2 - 8}
                                            textAnchor="middle"
                                            className="text-xs fill-slate-600 font-medium"
                                            style={{ textShadow: '1px 1px 2px white' }}
                                        >
                                            {edge.label}
                                        </text>
                                    </g>
                                );
                            })}
                            <defs>
                                <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                                        refX="9" refY="3.5" orient="auto">
                                    <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                                </marker>
                            </defs>
                        </svg>

                        {/* 节点层 */}
                        {filteredNodes.map((node) => (
                            <div
                                key={node.id}
                                className={`absolute w-60 bg-white rounded-xl shadow-lg border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer z-20 ${
                                    selectedNode === node.id ? 'ring-4 ring-purple-500 ring-opacity-30 shadow-2xl' : ''
                                } ${getNodeColor(node.type)}`}
                                style={{ left: node.x, top: node.y }}
                                onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                            >
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3 flex-1">
                                            {getNodeIcon(node.type)}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-sm truncate">{node.label}</div>
                                                <div className="text-xs opacity-75 line-clamp-2 leading-relaxed">{node.description}</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            {getStatusIndicator(node.status)}
                                            <span className="text-xs font-medium capitalize px-2 py-0.5 bg-white bg-opacity-50 rounded">
                                                {node.type}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* 节点统计信息 */}
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        {node.records && (
                                            <div>
                                                <span className="text-slate-500">记录数:</span>
                                                <span className="ml-1 font-medium">{node.records}</span>
                                            </div>
                                        )}
                                        {node.qps && (
                                            <div>
                                                <span className="text-slate-500">QPS:</span>
                                                <span className="ml-1 font-medium">{node.qps}</span>
                                            </div>
                                        )}
                                        {node.size && (
                                            <div>
                                                <span className="text-slate-500">大小:</span>
                                                <span className="ml-1 font-medium">{node.size}</span>
                                            </div>
                                        )}
                                        {node.users && (
                                            <div>
                                                <span className="text-slate-500">用户:</span>
                                                <span className="ml-1 font-medium">{node.users}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* 标签 */}
                                    {node.tags && node.tags.length > 0 && (
                                        <div className="mt-3 pt-2 border-t border-white border-opacity-30">
                                            <div className="flex flex-wrap gap-1">
                                                {node.tags.slice(0, 3).map(tag => (
                                                    <span key={tag} className="bg-white bg-opacity-50 text-xs px-2 py-0.5 rounded">
                                                        {tag}
                                                    </span>
                                                ))}
                                                {node.tags.length > 3 && (
                                                    <span className="bg-white bg-opacity-50 text-xs px-2 py-0.5 rounded">
                                                        +{node.tags.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 增强的节点详情面板 */}
                {selectedNode && (
                    <div className="absolute left-4 bottom-4 w-96 bg-white border border-slate-200 rounded-xl shadow-2xl z-30 max-h-96 overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex justify-between items-center">
                            <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                <Eye size={16} />
                                节点详情
                            </h4>
                            <button 
                                onClick={() => setSelectedNode(null)}
                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded p-1 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        {(() => {
                            const node = filteredNodes.find(n => n.id === selectedNode);
                            if (!node) return null;
                            return (
                                <div className="p-4 space-y-4">
                                    {/* 基本信息 */}
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${getNodeColor(node.type).split(' ')[0]} ${getNodeColor(node.type).split(' ')[1]}`}>
                                            {getNodeIcon(node.type)}
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="font-bold text-slate-800">{node.label}</h5>
                                            <p className="text-sm text-slate-600 mt-1">{node.description}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                {getStatusIndicator(node.status)}
                                                <span className="text-xs text-slate-500 capitalize">{node.status}</span>
                                                <span className="text-xs text-slate-400">•</span>
                                                <span className="text-xs text-slate-500">{node.owner}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 详细属性 */}
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        {node.records && (
                                            <div className="bg-slate-50 p-2 rounded">
                                                <div className="text-xs text-slate-500">记录数</div>
                                                <div className="font-medium">{node.records}</div>
                                            </div>
                                        )}
                                        {node.size && (
                                            <div className="bg-slate-50 p-2 rounded">
                                                <div className="text-xs text-slate-500">存储大小</div>
                                                <div className="font-medium">{node.size}</div>
                                            </div>
                                        )}
                                        {node.qps && (
                                            <div className="bg-slate-50 p-2 rounded">
                                                <div className="text-xs text-slate-500">QPS</div>
                                                <div className="font-medium">{node.qps}</div>
                                            </div>
                                        )}
                                        {node.latency && (
                                            <div className="bg-slate-50 p-2 rounded">
                                                <div className="text-xs text-slate-500">延迟</div>
                                                <div className="font-medium">{node.latency}</div>
                                            </div>
                                        )}
                                        {node.users && (
                                            <div className="bg-slate-50 p-2 rounded">
                                                <div className="text-xs text-slate-500">用户数</div>
                                                <div className="font-medium">{node.users}</div>
                                            </div>
                                        )}
                                        {node.version && (
                                            <div className="bg-slate-50 p-2 rounded">
                                                <div className="text-xs text-slate-500">版本</div>
                                                <div className="font-medium">{node.version}</div>
                                            </div>
                                        )}
                                    </div>

                                    {/* 标签 */}
                                    {node.tags && node.tags.length > 0 && (
                                        <div>
                                            <div className="text-xs text-slate-500 mb-2">标签</div>
                                            <div className="flex flex-wrap gap-1">
                                                {node.tags.map(tag => (
                                                    <span key={tag} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 上游依赖 */}
                                    <div>
                                        <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                                            <ArrowRight size={12} className="rotate-180" />
                                            上游依赖 ({filteredEdges.filter(e => e.to === selectedNode).length})
                                        </div>
                                        <div className="space-y-1 max-h-24 overflow-y-auto">
                                            {filteredEdges
                                                .filter(e => e.to === selectedNode)
                                                .map((edge, i) => {
                                                    const fromNode = filteredNodes.find(n => n.id === edge.from);
                                                    return (
                                                        <div key={i} className="text-xs flex items-center gap-2 p-2 bg-slate-50 rounded hover:bg-slate-100 cursor-pointer transition-colors"
                                                             onClick={() => setSelectedNode(edge.from)}>
                                                            {fromNode && getNodeIcon(fromNode.type)}
                                                            <span className="flex-1">{fromNode?.label}</span>
                                                            <span className="text-slate-400 text-xs">{edge.label}</span>
                                                        </div>
                                                    );
                                                })
                                            }
                                            {filteredEdges.filter(e => e.to === selectedNode).length === 0 && (
                                                <div className="text-xs text-slate-400 italic">无上游依赖</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 下游影响 */}
                                    <div>
                                        <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                                            <ArrowRight size={12} />
                                            下游影响 ({filteredEdges.filter(e => e.from === selectedNode).length})
                                        </div>
                                        <div className="space-y-1 max-h-24 overflow-y-auto">
                                            {filteredEdges
                                                .filter(e => e.from === selectedNode)
                                                .map((edge, i) => {
                                                    const toNode = filteredNodes.find(n => n.id === edge.to);
                                                    return (
                                                        <div key={i} className="text-xs flex items-center gap-2 p-2 bg-slate-50 rounded hover:bg-slate-100 cursor-pointer transition-colors"
                                                             onClick={() => setSelectedNode(edge.to)}>
                                                            {toNode && getNodeIcon(toNode.type)}
                                                            <span className="flex-1">{toNode?.label}</span>
                                                            <span className="text-slate-400 text-xs">{edge.label}</span>
                                                        </div>
                                                    );
                                                })
                                            }
                                            {filteredEdges.filter(e => e.from === selectedNode).length === 0 && (
                                                <div className="text-xs text-slate-400 italic">无下游影响</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 操作按钮 */}
                                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                                        <button className="flex-1 px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                                            查看详情
                                        </button>
                                        <button className="flex-1 px-3 py-2 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors">
                                            影响分析
                                        </button>
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
            case 'bu_identification':
                return <IdentificationResultView 
                    setActiveModule={setActiveModule}
                    dataSources={dataSources}
                    scanAssets={scanAssets}
                    setScanAssets={setScanAssets}
                />;
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