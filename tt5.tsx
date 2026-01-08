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
    ChevronDown, ChevronUp, GripVertical, Folder, Check, MessageCircle, ToggleLeft, ToggleRight,
    PanelLeftClose, PanelLeftOpen, Key
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

const SmartAskDataPanel = () => {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => scrollToBottom(), [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userText = input;
        setInput('');
        setMessages(prev => [...prev, { type: 'user', content: userText }]);
        setIsTyping(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            // Simulate Data Q&A context
            const systemInstruction = `You are a "Text-to-SQL" and "Data Analysis" assistant embedded in a semantic modeling platform. 
            The user will ask questions about business data (e.g., Newborns, Orders).
            Your goal is to:
            1. Interpret the user's intent.
            2. Generate a mock SQL query that would answer the question based on standard table names (e.g., t_pop_base_info, t_order_main).
            3. Provide a brief summary answer as if the query was executed.
            
            Format your response in Markdown. Use a code block for SQL.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: [{ role: 'user', parts: [{ text: `[Context: ${systemInstruction}] User Question: ${userText}` }] }]
            });

            setMessages(prev => [...prev, { type: 'bot', content: response.text }]);
        } catch (e) {
            setMessages(prev => [...prev, { type: 'bot', content: "Sorry, I couldn't process that query right now." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="w-80 border-l border-slate-200 bg-white flex flex-col h-full shadow-sm z-10">
            <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-gradient-to-r from-blue-50 to-white">
                <MessageCircle size={18} className="text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">智能问数 (Smart Q&A)</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="text-center text-slate-400 mt-10 px-4">
                        <Sparkles size={32} className="mx-auto mb-3 text-blue-300" />
                        <p className="text-sm font-medium text-slate-600">想知道什么数据？</p>
                        <p className="text-xs mt-1">试试问我：<br/>"查询上个月的新生儿数量"<br/>"按医院统计出生证明分布"</p>
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-sm ${
                            m.type === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'
                        }`}>
                            {m.type === 'bot' ? (
                                <div className="markdown-body" dangerouslySetInnerHTML={{__html: m.content.replace(/\n/g, '<br/>').replace(/```sql/g, '<pre class="bg-slate-100 p-2 rounded mt-1 border border-slate-200 font-mono text-[10px]">').replace(/```/g, '</pre>')}} />
                            ) : m.content}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-slate-200 px-3 py-2 rounded-2xl rounded-bl-none shadow-sm">
                            <RefreshCw size={12} className="animate-spin text-blue-500" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-slate-100 bg-white">
                <div className="relative">
                    <input 
                        className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="输入您的业务问题..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button 
                        onClick={handleSend}
                        className="absolute right-1 top-1 p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        <ArrowUpRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const DataCatalogView = () => {
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const stats = [
        { label: '总资产数', value: 8, icon: Layers, color: 'text-slate-600 bg-slate-100' },
        { label: '业务对象', value: 3, icon: Box, color: 'text-blue-600 bg-blue-50 border-blue-100' },
        { label: '物理表', value: 3, icon: Database, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
        { label: '映射关系', value: 2, icon: GitMerge, color: 'text-purple-600 bg-purple-50 border-purple-100' },
    ];

    const filterAssets = (assets: any) => {
        return assets.filter((asset: any) => {
            const matchesTab = 
                activeTab === 'All' ? true :
                activeTab === 'Business Object' ? asset.type === 'Business Object' :
                activeTab === 'Physical Table' ? asset.type === 'Physical Table' :
                activeTab === 'Mapping' ? asset.type === 'Mapping' : true;
            
            const matchesSearch = 
                asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                asset.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                asset.desc?.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesTab && matchesSearch;
        });
    };

    const getIcon = (type: any) => {
        switch(type) {
            case 'Business Object': return <Box size={20} className="text-blue-600" />;
            case 'Physical Table': return <Database size={20} className="text-emerald-600" />;
            case 'Mapping': return <GitMerge size={20} className="text-purple-600" />;
            default: return <FileText size={20} />;
        }
    };

    const getStatusColor = (status: any) => {
        switch(status?.toLowerCase()) {
            case 'published': return 'bg-emerald-100 text-emerald-700';
            case 'active': return 'bg-emerald-100 text-emerald-700';
            case 'draft': return 'bg-slate-100 text-slate-600';
            default: return 'bg-blue-100 text-blue-700';
        }
    };

    const getStatusText = (status: any) => {
        switch(status?.toLowerCase()) {
            case 'published': return '已发布';
            case 'active': return '活跃';
            case 'draft': return '草稿';
            default: return status;
        }
    };

    return (
        <div className="flex h-full">
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto p-2 pr-4 custom-scrollbar">
                {/* 1. Summary Cards */}
                <div className="grid grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <div key={i} className={`p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow`}>
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                                <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 2. Toolbar */}
                <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex gap-1">
                        {['All', 'Business Object', 'Physical Table', 'Mapping'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    activeTab === tab 
                                    ? 'bg-purple-50 text-purple-700' 
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {tab === 'All' ? '全部' : 
                                 tab === 'Business Object' ? '业务对象' :
                                 tab === 'Physical Table' ? '物理表' : '映射关系'}
                                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab ? 'bg-purple-200 text-purple-800' : 'bg-slate-200 text-slate-500'}`}>
                                    {tab === 'All' ? mockCatalogAssets.length : mockCatalogAssets.filter(a => a.type === tab).length}
                                </span>
                            </button>
                        ))}
                    </div>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                            type="text" 
                            placeholder="搜索资产名称、代码或描述..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        />
                    </div>
                </div>

                {/* 3. Asset Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
                    {filterAssets(mockCatalogAssets).map((asset: any) => (
                        <div key={asset.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col h-full">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${
                                        asset.type === 'Business Object' ? 'bg-blue-50' : 
                                        asset.type === 'Physical Table' ? 'bg-emerald-50' : 'bg-purple-50'
                                    }`}>
                                        {getIcon(asset.type)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{asset.name}</h3>
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getStatusColor(asset.status)}`}>
                                                {getStatusText(asset.status)}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-400 font-mono mt-0.5">{asset.code}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <p className="text-sm text-slate-600 mb-4 line-clamp-2 flex-grow">{asset.desc}</p>
                            
                            <div className="flex items-center gap-2 mb-4 text-xs text-slate-500 font-medium">
                                <span className="bg-slate-100 px-2 py-1 rounded">{asset.stats}</span>
                            </div>

                            <div className="flex flex-wrap gap-1 mt-auto pt-3 border-t border-slate-50">
                                {asset.tags.map((tag: any) => (
                                    <span key={tag} className="px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-500 text-[10px] rounded hover:bg-slate-100 transition-colors">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Smart Ask Data Panel */}
            <SmartAskDataPanel />
        </div>
    );
};

// --- 视图 1: 仪表盘 Dashboard ---
const DashboardView = ({ setActiveModule }: any) => (
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

const CandidateGenerationView = ({ candidates, setCandidates, setBusinessObjects, setActiveModule, setSelectedBO }: any) => {
    const [expandedId, setExpandedId] = useState(null);

    const toggleExpand = (id: any) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleAdopt = (cand: any) => {
        // Create new Business Object from Candidate
        const newBO = {
            id: `BO_${Date.now()}`,
            name: cand.suggestedName,
            code: `biz_${cand.sourceTable.replace(/^t_/, '')}`,
            domain: 'AI Discovered',
            owner: 'System',
            status: 'draft',
            version: 'v0.1',
            description: cand.reason,
            sourceTables: [cand.sourceTable],
            fields: cand.previewFields ? cand.previewFields.map((pf: any, idx: number) => ({
                id: `f_${Date.now()}_${idx}`,
                name: pf.attr,
                code: pf.col,
                type: pf.type.includes('int') ? 'Integer' : pf.type.includes('date') ? 'DateTime' : 'String',
                length: '-',
                required: false,
                desc: 'Auto-generated from ' + pf.col
            })) : []
        };

        // Update state
        setBusinessObjects((prev: any) => [newBO, ...prev]);
        setCandidates((prev: any) => prev.filter((c: any) => c.id !== cand.id));
        
        // Navigation
        setSelectedBO(newBO);
        setActiveModule('td_modeling');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">候选生成 (Candidates)</h2>
                    <p className="text-sm text-slate-500 mt-1">AI 推荐的潜在业务对象。</p>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
                {candidates.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed text-slate-400">
                        <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
                        <p>暂无新的候选对象</p>
                    </div>
                ) : candidates.map((cand: any) => (
                    <div key={cand.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4 transition-all hover:shadow-md">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-bold text-slate-800">{cand.suggestedName}</h3>
                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">{Math.round(cand.confidence * 100)}% Match</span>
                                </div>
                                <p className="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">{cand.reason}</p>
                                <div className="flex gap-4 text-sm text-slate-500 mb-4">
                                     <div>来源表: <span className="font-mono text-slate-700 bg-slate-100 px-1 rounded">{cand.sourceTable}</span></div>
                                     <div>映射字段: <span className="font-bold text-slate-700">{cand.mappedFields}</span></div>
                                </div>
                                 <div className="flex gap-2">
                                     <button 
                                        onClick={() => handleAdopt(cand)}
                                        className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-100 flex items-center gap-2"
                                     >
                                         <Plus size={14} /> 采纳并编辑
                                     </button>
                                     <button className="px-3 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50">忽略</button>
                                     <button
                                        onClick={() => toggleExpand(cand.id)}
                                        className="px-3 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 flex items-center gap-1 ml-auto md:ml-0"
                                     >
                                        {expandedId === cand.id ? '收起详情' : '查看详情'}
                                        {expandedId === cand.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                     </button>
                                 </div>
                            </div>
                            <div className="w-full md:w-64 border-l border-slate-100 pl-6 space-y-3 hidden md:block">
                                 <ScoreBar label="名称匹配" score={cand.scores.nameMatch} />
                                 <ScoreBar label="字段匹配" score={cand.scores.fieldMatch} />
                                 <ScoreBar label="数据采样" score={cand.scores.dataSample} />
                            </div>
                        </div>

                        {expandedId === cand.id && (
                            <div className="mt-4 pt-4 border-t border-slate-100 animate-fade-in">
                                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                    <Sparkles size={14} className="text-purple-500"/> AI 详细分析报告
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">字段映射预览</h5>
                                        <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                                            <table className="w-full text-xs text-left">
                                                <thead className="bg-slate-100 text-slate-500 font-medium">
                                                    <tr>
                                                        <th className="px-3 py-2">物理字段</th>
                                                        <th className="px-3 py-2">推断属性</th>
                                                        <th className="px-3 py-2 text-right">置信度</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200">
                                                    {cand.previewFields && cand.previewFields.length > 0 ? (
                                                        cand.previewFields.map((field: any, idx: number) => (
                                                            <tr key={idx}>
                                                                <td className="px-3 py-2 font-mono text-slate-600">{field.col} <span className="text-slate-400">({field.type})</span></td>
                                                                <td className="px-3 py-2 font-medium text-slate-800">{field.attr}</td>
                                                                <td className="px-3 py-2 text-right">
                                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                                                        field.conf === 'High' ? 'bg-green-100 text-green-700' :
                                                                        field.conf === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'
                                                                    }`}>{field.conf}</span>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr><td colSpan={3} className="px-3 py-2 text-center text-slate-400">暂无字段预览</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">推荐理由明细</h5>
                                        <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
                                            <li>根据表名 <b>{cand.sourceTable}</b> 推断业务对象可能为 <b>{cand.suggestedName}</b>。</li>
                                            <li>发现 <b>{cand.mappedFields}</b> 个关键字段高度匹配标准业务定义。</li>
                                            <li>数据采样分析显示内容特征符合该业务领域模型。</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const BusinessGoalsView = ({ setActiveModule }: any) => (
    <div className="space-y-6 animate-fade-in">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">业务梳理 (Business Goals)</h2>
            <p className="text-sm text-slate-500 mt-1">定义核心业务目标与改革事项。</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
            {mockBusinessGoals.map(goal => (
                <div key={goal.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                                goal.priority === 'High' ? 'bg-red-100 text-red-600' :
                                goal.priority === 'Medium' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                            }`}>{goal.priority} Priority</span>
                            <h3 className="text-lg font-bold text-slate-800 mt-2">{goal.title}</h3>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">{goal.id}</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">{goal.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-slate-100 pt-3">
                        <span className="flex items-center gap-1"><User size={12}/> {goal.owner}</span>
                        <span className="flex items-center gap-1"><Clock size={12}/> {goal.lastUpdate}</span>
                        <div className="ml-auto flex gap-2">
                             {goal.stages.policy && <BadgeCheck size={14} className="text-emerald-500" title="Policy Ready"/>}
                             {goal.stages.object && <Box size={14} className="text-emerald-500" title="Object Ready"/>}
                             {goal.stages.scenario && <Layers size={14} className={goal.stages.scenario ? "text-emerald-500" : "text-slate-300"} title="Scenario Ready"/>}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const BusinessModelingView = ({ businessObjects, setBusinessObjects, selectedBO, setSelectedBO }: any) => {
    const [editBO, setEditBO] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (selectedBO) {
            setEditBO({ ...selectedBO });
            setIsEditing(selectedBO.status === 'draft');
        } else if (businessObjects.length > 0) {
            setSelectedBO(businessObjects[0]);
        }
    }, [selectedBO, businessObjects]);

    const handleSave = () => {
        const newObjects = businessObjects.map((bo: any) => bo.id === editBO.id ? editBO : bo);
        setBusinessObjects(newObjects);
        setSelectedBO(editBO);
        alert("业务对象已保存！");
    };

    const handlePublish = () => {
        const publishedBO = { ...editBO, status: 'published' };
        const newObjects = businessObjects.map((bo: any) => bo.id === editBO.id ? publishedBO : bo);
        setBusinessObjects(newObjects);
        setSelectedBO(publishedBO);
        setIsEditing(false);
        alert("业务对象已发布！");
    };

    const handleFieldChange = (idx: number, field: string, value: any) => {
        const newFields = [...editBO.fields];
        newFields[idx] = { ...newFields[idx], [field]: value };
        setEditBO({ ...editBO, fields: newFields });
    };

    const handleAddField = () => {
        const newField = { 
            id: `f_new_${Date.now()}`, 
            name: '新属性', 
            code: 'new_attr', 
            type: 'String', 
            length: '-', 
            required: false, 
            desc: '-' 
        };
        setEditBO({ ...editBO, fields: [...editBO.fields, newField] });
    };

    const handleDeleteField = (idx: number) => {
        const newFields = editBO.fields.filter((_: any, i: number) => i !== idx);
        setEditBO({ ...editBO, fields: newFields });
    };

    if (!editBO) return <div className="p-6">Loading...</div>;

    return (
    <div className="space-y-6 h-full flex flex-col animate-fade-in">
        <div className="flex justify-between items-center shrink-0">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">业务对象建模 (Modeling)</h2>
                <p className="text-sm text-slate-500 mt-1">管理核心业务实体及其属性定义。</p>
            </div>
            <button 
                onClick={() => {
                    const newBO = {
                        id: `BO_${Date.now()}`,
                        name: '新业务对象',
                        code: 'biz_new',
                        domain: '未分类',
                        owner: '当前用户',
                        status: 'draft',
                        version: 'v0.1',
                        description: '请输入描述...',
                        fields: []
                    };
                    setBusinessObjects((prev: any) => [newBO, ...prev]);
                    setSelectedBO(newBO);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-blue-700"
            >
                <Plus size={16} /> 新建对象
            </button>
        </div>
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex">
            {/* Sidebar List */}
            <div className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col">
                <div className="p-4 border-b border-slate-200">
                    <input type="text" placeholder="搜索对象..." className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none" />
                </div>
                <div className="flex-1 overflow-y-auto">
                    {businessObjects.map((bo: any) => (
                        <div 
                            key={bo.id} 
                            onClick={() => setSelectedBO(bo)}
                            className={`p-3 border-b border-slate-100 cursor-pointer transition-colors ${selectedBO?.id === bo.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-white border-l-4 border-l-transparent'}`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="font-medium text-slate-700 truncate w-32">{bo.name}</div>
                                {bo.status === 'draft' && <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">Draft</span>}
                            </div>
                            <div className="text-xs text-slate-400 mt-1 truncate">{bo.code}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-white">
                 {/* Top Action Bar for Edit Mode */}
                 <div className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-slate-50/50">
                     <div className="text-xs text-slate-500 flex gap-4">
                         <span>Version: <b className="text-slate-700">{editBO.version}</b></span>
                         <span>Owner: <b className="text-slate-700">{editBO.owner}</b></span>
                         <span>Status: <span className={`font-bold ${editBO.status === 'published' ? 'text-green-600' : 'text-orange-500'}`}>{editBO.status.toUpperCase()}</span></span>
                     </div>
                     <div className="flex gap-2">
                         {isEditing ? (
                             <>
                                 <button onClick={handleSave} className="px-3 py-1.5 border border-blue-200 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 flex items-center gap-1">
                                     <Save size={14}/> 保存草稿
                                 </button>
                                 <button onClick={handlePublish} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-1">
                                     <Upload size={14}/> 发布对象
                                 </button>
                             </>
                         ) : (
                             <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 flex items-center gap-1">
                                 <Edit size={14}/> 编辑定义
                             </button>
                         )}
                     </div>
                 </div>

                 <div className="flex-1 overflow-y-auto p-8">
                    {/* Header Info */}
                    <div className="mb-8 grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">业务对象名称</label>
                            {isEditing ? (
                                <input 
                                    value={editBO.name} 
                                    onChange={(e) => setEditBO({...editBO, name: e.target.value})}
                                    className="text-2xl font-bold text-slate-800 bg-slate-50 border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:outline-none rounded-lg px-2 py-1 w-full -ml-2"
                                />
                            ) : (
                                <h1 className="text-2xl font-bold text-slate-800">{editBO.name}</h1>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">唯一编码 (Code)</label>
                            {isEditing ? (
                                <input 
                                    value={editBO.code} 
                                    onChange={(e) => setEditBO({...editBO, code: e.target.value})}
                                    className="font-mono text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded px-2 py-1 w-full focus:outline-none focus:border-blue-500"
                                />
                            ) : (
                                <div className="font-mono text-sm text-slate-600 bg-slate-50 px-2 py-1 rounded inline-block border border-slate-100">{editBO.code}</div>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">所属域</label>
                            <div className="text-sm text-slate-700">{editBO.domain}</div>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">描述</label>
                            {isEditing ? (
                                <textarea 
                                    value={editBO.description} 
                                    onChange={(e) => setEditBO({...editBO, description: e.target.value})}
                                    className="w-full text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-blue-500"
                                    rows={2}
                                />
                            ) : (
                                <p className="text-sm text-slate-600 leading-relaxed">{editBO.description}</p>
                            )}
                        </div>
                    </div>

                    {/* Fields Table */}
                    <div>
                        <div className="flex justify-between items-end mb-3">
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">属性定义 (Fields)</h3>
                            {isEditing && (
                                <button onClick={handleAddField} className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
                                    <Plus size={12}/> 添加属性
                                </button>
                            )}
                        </div>
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500">
                                    <tr>
                                        {isEditing && <th className="w-8 py-2"></th>}
                                        <th className="px-4 py-2 font-medium">名称</th>
                                        <th className="px-4 py-2 font-medium">编码</th>
                                        <th className="px-4 py-2 font-medium">类型</th>
                                        <th className="px-4 py-2 font-medium">描述</th>
                                        {isEditing && <th className="px-4 py-2 font-medium text-right">操作</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {editBO.fields.map((f: any, idx: number) => (
                                        <tr key={idx} className="group hover:bg-slate-50">
                                            {isEditing && (
                                                <td className="text-center text-slate-300 cursor-move"><GripVertical size={14} className="mx-auto"/></td>
                                            )}
                                            <td className="px-4 py-2">
                                                {isEditing ? (
                                                    <input 
                                                        value={f.name} 
                                                        onChange={(e) => handleFieldChange(idx, 'name', e.target.value)}
                                                        className="w-full bg-transparent focus:bg-white border-b border-transparent focus:border-blue-500 focus:outline-none px-1"
                                                    />
                                                ) : <span className="font-medium">{f.name}</span>}
                                            </td>
                                            <td className="px-4 py-2 font-mono text-slate-600">
                                                {isEditing ? (
                                                    <input 
                                                        value={f.code} 
                                                        onChange={(e) => handleFieldChange(idx, 'code', e.target.value)}
                                                        className="w-full bg-transparent focus:bg-white border-b border-transparent focus:border-blue-500 focus:outline-none px-1"
                                                    />
                                                ) : f.code}
                                            </td>
                                            <td className="px-4 py-2 text-blue-600">
                                                {isEditing ? (
                                                    <select 
                                                        value={f.type} 
                                                        onChange={(e) => handleFieldChange(idx, 'type', e.target.value)}
                                                        className="bg-transparent focus:bg-white border-b border-transparent focus:border-blue-500 focus:outline-none"
                                                    >
                                                        <option>String</option>
                                                        <option>Integer</option>
                                                        <option>Decimal</option>
                                                        <option>DateTime</option>
                                                        <option>Boolean</option>
                                                        <option>Enum</option>
                                                    </select>
                                                ) : f.type}
                                            </td>
                                            <td className="px-4 py-2 text-slate-500">
                                                {isEditing ? (
                                                    <input 
                                                        value={f.desc} 
                                                        onChange={(e) => handleFieldChange(idx, 'desc', e.target.value)}
                                                        className="w-full bg-transparent focus:bg-white border-b border-transparent focus:border-blue-500 focus:outline-none px-1"
                                                    />
                                                ) : f.desc}
                                            </td>
                                            {isEditing && (
                                                <td className="px-4 py-2 text-right">
                                                    <button onClick={() => handleDeleteField(idx)} className="text-slate-400 hover:text-red-500 p-1">
                                                        <Trash2 size={14}/>
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {editBO.fields.length === 0 && (
                                <div className="p-8 text-center text-slate-400 text-sm">暂无属性定义，请添加</div>
                            )}
                        </div>
                    </div>
                 </div>
            </div>
        </div>
    </div>
    );
};

const ScenarioOrchestrationView = ({ businessObjects }: any) => (
    <div className="space-y-6 animate-fade-in">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">场景编排 (Scenarios)</h2>
            <p className="text-sm text-slate-500 mt-1">定义业务流程与对象交互逻辑。</p>
        </div>
        <div className="space-y-4">
             {mockScenarios.map(sc => (
                 <div key={sc.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                          <div>
                              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                  <Layers size={18} className="text-indigo-500"/> {sc.name}
                              </h3>
                              <p className="text-sm text-slate-500 mt-1">{sc.description}</p>
                          </div>
                          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><Edit size={16}/></button>
                      </div>
                      
                      <div className="flex items-center gap-2 overflow-x-auto pb-2">
                          {sc.nodes.map((node, idx) => (
                              <React.Fragment key={node.id}>
                                  <div className={`px-4 py-2 rounded-lg border text-sm flex items-center gap-2 whitespace-nowrap ${
                                      node.status === 'done' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                      node.status === 'process' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-500'
                                  }`}>
                                      {node.type === 'start' && <Play size={12}/>}
                                      {node.type === 'end' && <CheckCircle size={12}/>}
                                      {node.label}
                                  </div>
                                  {idx < sc.nodes.length - 1 && (
                                      <ArrowRight size={14} className="text-slate-300 shrink-0"/>
                                  )}
                              </React.Fragment>
                          ))}
                      </div>
                 </div>
             ))}
        </div>
    </div>
);

const DataSourceManagementView = ({ dataSources, setDataSources }: any) => (
    <div className="space-y-6 animate-fade-in">
         <div className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">数据源管理 (Connect)</h2>
                <p className="text-sm text-slate-500 mt-1">配置物理数据库连接。</p>
            </div>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-emerald-700">
                <Plus size={16} /> 新增数据源
            </button>
        </div>
        <div className="grid grid-cols-1 gap-4">
            {dataSources.map((ds: any) => (
                <div key={ds.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 shrink-0">
                        {ds.type === 'MySQL' ? <Database size={24} className="text-blue-500"/> : 
                         ds.type === 'Oracle' ? <Database size={24} className="text-red-500"/> :
                         <Database size={24}/>}
                    </div>
                    <div className="flex-1 w-full text-center md:text-left">
                        <h3 className="font-bold text-slate-800 text-lg">{ds.name}</h3>
                        <div className="text-xs text-slate-500 font-mono mt-1">{ds.type} • {ds.host}:{ds.port} • {ds.dbName}</div>
                        <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                             <div className={`w-2 h-2 rounded-full ${ds.status === 'connected' ? 'bg-emerald-500' : ds.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                             <span className="text-xs text-slate-600 capitalize">{ds.status}</span>
                             {ds.status === 'error' && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={10}/> Connection Failed</span>}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><RefreshCw size={16}/></button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"><Settings size={16}/></button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const AssetScanningView = ({ setActiveModule, candidates, scanAssets }: any) => (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">资产扫描 (Discovery)</h2>
                <p className="text-sm text-slate-500 mt-1">自动扫描物理数据源，发现技术元数据。</p>
            </div>
            <div className="flex gap-2">
                 <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">配置规则</button>
                 <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-blue-700">
                    <RefreshCw size={16} /> 立即扫描
                 </button>
            </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
             <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-500 font-medium">
                     <tr>
                         <th className="px-6 py-3">物理表名</th>
                         <th className="px-6 py-3">注释</th>
                         <th className="px-6 py-3">数据行数</th>
                         <th className="px-6 py-3">更新时间</th>
                         <th className="px-6 py-3">状态</th>
                         <th className="px-6 py-3 text-right">操作</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                     {scanAssets.map((asset: any) => (
                         <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                             <td className="px-6 py-4 font-mono font-medium text-slate-700">
                                 {asset.name}
                                 {asset.isSemanticEnriched && <BrainCircuit size={14} className="text-emerald-500 inline ml-2" title="Semantic Info Added"/>}
                             </td>
                             <td className="px-6 py-4 text-slate-500">{asset.comment || '-'}</td>
                             <td className="px-6 py-4 text-slate-600">{asset.rows}</td>
                             <td className="px-6 py-4 text-slate-400 text-xs">{asset.updateTime}</td>
                             <td className="px-6 py-4">
                                 <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                     asset.status === 'new' ? 'bg-green-100 text-green-700' : 
                                     asset.status === 'changed' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'
                                 }`}>
                                     {asset.status.toUpperCase()}
                                 </span>
                             </td>
                             <td className="px-6 py-4 text-right">
                                 <button onClick={() => setActiveModule('bu_semantics')} className="text-blue-600 hover:text-blue-800 font-medium text-xs">语义解析</button>
                             </td>
                         </tr>
                     ))}
                 </tbody>
             </table>
        </div>
    </div>
);

const MappingStudioView = ({ selectedBO }: any) => (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
             <div>
                <h2 className="text-2xl font-bold text-slate-800">映射工作台 (Mapping)</h2>
                <p className="text-sm text-slate-500 mt-1">定义业务对象属性与物理表字段的映射关系。</p>
            </div>
            <div className="flex gap-2">
                 <span className="text-sm text-slate-500 self-center">当前对象: <b className="text-slate-800">{selectedBO?.name || '未选择'}</b></span>
            </div>
        </div>

        <div className="flex gap-8 items-start">
             {/* Source: Business Object */}
             <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                 <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Box size={18}/> 业务对象 (Logical)</h3>
                 <div className="space-y-2">
                     {selectedBO?.fields?.map((f: any) => (
                         <div key={f.id} className="p-3 border border-slate-200 rounded-lg bg-slate-50 flex justify-between items-center">
                             <div>
                                 <div className="font-bold text-sm text-slate-700">{f.name}</div>
                                 <div className="text-xs text-slate-400 font-mono">{f.code} ({f.type})</div>
                             </div>
                             <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                         </div>
                     ))}
                     {(!selectedBO?.fields || selectedBO.fields.length === 0) && <div className="text-center text-slate-400 py-4 text-sm">无属性定义</div>}
                 </div>
             </div>
             
             {/* Center: Mapping Lines (Visual representation simplified) */}
             <div className="w-16 flex flex-col items-center justify-center pt-20 gap-4 opacity-50">
                 <ArrowRight size={24} className="text-slate-400"/>
                 <GitMerge size={24} className="text-purple-400"/>
                 <ArrowRight size={24} className="text-slate-400"/>
             </div>

             {/* Target: Physical Table */}
             <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                 <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Database size={18}/> 物理表 (Physical)</h3>
                 {selectedBO?.sourceTables?.[0] ? (
                      <div className="space-y-2">
                         {/* Mocking mapping based on mockMappings or generic list if not exact match found easily */}
                         {mockPhysicalTables[0].fields.map((col, idx) => (
                             <div key={idx} className="p-3 border border-slate-200 rounded-lg bg-slate-50 flex justify-between items-center">
                                 <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                                 <div className="text-right">
                                     <div className="font-bold text-sm text-slate-700">{col.name}</div>
                                     <div className="text-xs text-slate-400 font-mono">{col.type}</div>
                                 </div>
                             </div>
                         ))}
                      </div>
                 ) : (
                     <div className="text-center text-slate-400 py-10 border-2 border-dashed border-slate-200 rounded-lg">
                         未绑定物理源表
                     </div>
                 )}
             </div>
        </div>

        {/* Mapping Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mt-6">
            <div className="px-6 py-4 border-b border-slate-100 font-bold text-slate-700">已定义映射规则</div>
            <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-500 font-medium">
                     <tr>
                         <th className="px-6 py-3">业务属性</th>
                         <th className="px-6 py-3">物理字段</th>
                         <th className="px-6 py-3">转换规则</th>
                         <th className="px-6 py-3 text-right">操作</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                     {mockMappings.map((m, i) => (
                         <tr key={i} className="hover:bg-slate-50">
                             <td className="px-6 py-3 font-medium text-slate-700">{m.boField}</td>
                             <td className="px-6 py-3 font-mono text-slate-600">{m.tblField}</td>
                             <td className="px-6 py-3"><span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs border border-blue-100">{m.rule}</span></td>
                             <td className="px-6 py-3 text-right text-slate-400 hover:text-red-500 cursor-pointer"><Trash2 size={16} /></td>
                         </tr>
                     ))}
                 </tbody>
            </table>
        </div>
    </div>
);

const ConflictDetectionView = ({ setActiveModule }: any) => (
    <div className="space-y-6 animate-fade-in">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">冲突检测 (Governance)</h2>
            <p className="text-sm text-slate-500 mt-1">检测业务定义与物理实现之间的差异与冲突。</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
             {mockConflicts.map(cf => (
                 <div key={cf.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex gap-4 hover:shadow-md transition-all">
                     <div className={`mt-1 ${
                         cf.severity === 'High' ? 'text-red-500' : 
                         cf.severity === 'Medium' ? 'text-orange-500' : 'text-blue-500'
                     }`}>
                         <AlertTriangle size={24} />
                     </div>
                     <div className="flex-1">
                         <div className="flex justify-between items-start">
                             <h3 className="font-bold text-slate-800 text-lg">{cf.title}</h3>
                             <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                 cf.severity === 'High' ? 'bg-red-100 text-red-700' : 
                                 cf.severity === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                             }`}>{cf.severity}</span>
                         </div>
                         <p className="text-sm text-slate-600 mt-1 mb-3">{cf.desc}</p>
                         <div className="flex items-center gap-4 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                             <span>对象: <b>{cf.objectName}</b></span>
                             <span>资产: <b>{cf.assetName}</b></span>
                             <span>检测时间: {cf.detectedAt}</span>
                         </div>
                     </div>
                     <div className="flex flex-col gap-2 justify-center">
                         <button onClick={() => setActiveModule('mapping')} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 whitespace-nowrap">去修复</button>
                         <button className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 whitespace-nowrap">忽略</button>
                     </div>
                 </div>
             ))}
        </div>
    </div>
);

const ApiGatewayView = () => (
    <div className="space-y-6 animate-fade-in">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">API 服务网关 (Gateway)</h2>
            <p className="text-sm text-slate-500 mt-1">管理基于语义模型自动生成的 API 服务。</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
             {mockApiServices.map(api => (
                 <div key={api.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-6">
                     <div className={`px-3 py-1.5 rounded-lg text-sm font-bold font-mono ${
                         api.method === 'GET' ? 'bg-blue-100 text-blue-700' : 
                         api.method === 'POST' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                     }`}>{api.method}</div>
                     <div className="flex-1">
                         <div className="font-bold text-slate-800">{api.name}</div>
                         <div className="text-xs text-slate-500 font-mono mt-1">{api.path}</div>
                     </div>
                     <div className="flex items-center gap-8 text-sm">
                         <div className="text-center">
                             <div className="text-slate-400 text-xs">QPS</div>
                             <div className="font-bold text-slate-700">{api.qps}</div>
                         </div>
                         <div className="text-center">
                             <div className="text-slate-400 text-xs">Latency</div>
                             <div className={`font-bold ${parseInt(api.latency) > 100 ? 'text-orange-500' : 'text-slate-700'}`}>{api.latency}</div>
                         </div>
                         <div className="text-center">
                             <div className="text-slate-400 text-xs">Error Rate</div>
                             <div className="font-bold text-slate-700">{api.errorRate}</div>
                         </div>
                         <div className={`px-2 py-1 rounded text-xs font-bold ${api.status === 'Online' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                             {api.status}
                         </div>
                     </div>
                     <div className="flex gap-2">
                         <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"><Terminal size={16}/></button>
                         <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Share2 size={16}/></button>
                     </div>
                 </div>
             ))}
        </div>
    </div>
);

const CacheStrategyView = () => (
    <div className="space-y-6 animate-fade-in">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">缓存策略配置 (Caching)</h2>
            <p className="text-sm text-slate-500 mt-1">配置语义层数据的缓存加速策略。</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-4">
                 <h3 className="font-bold text-slate-700 flex items-center gap-2"><Settings size={18}/> 策略定义</h3>
                 {mockCachePolicies.map(cp => (
                     <div key={cp.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                         <div className="flex justify-between items-center mb-2">
                             <div className="font-bold text-slate-700">{cp.name}</div>
                             <div className={`w-2 h-2 rounded-full ${cp.status === 'Active' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                         </div>
                         <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                             <div>Target: <span className="text-slate-700">{cp.target}</span></div>
                             <div>Type: <span className="text-slate-700">{cp.type}</span></div>
                             <div>TTL: <span className="text-slate-700">{cp.ttl}</span></div>
                             <div>Eviction: <span className="text-slate-700">{cp.eviction}</span></div>
                         </div>
                     </div>
                 ))}
             </div>

             <div className="space-y-4">
                 <h3 className="font-bold text-slate-700 flex items-center gap-2"><Activity size={18}/> 热门缓存 Key</h3>
                 <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                     <table className="w-full text-xs text-left">
                         <thead className="bg-slate-50 text-slate-500">
                             <tr>
                                 <th className="px-4 py-2">Key Pattern</th>
                                 <th className="px-4 py-2">Size</th>
                                 <th className="px-4 py-2">Hits</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                             {mockCacheKeys.map((k, i) => (
                                 <tr key={i}>
                                     <td className="px-4 py-2 font-mono text-slate-600 truncate max-w-[150px]" title={k.key}>{k.key}</td>
                                     <td className="px-4 py-2 text-slate-500">{k.size}</td>
                                     <td className="px-4 py-2 text-slate-700 font-medium">{k.hits}</td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             </div>
        </div>
    </div>
);

const DataLineageView = () => (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">全链路血缘 (Lineage)</h2>
            <p className="text-sm text-slate-500 mt-1">可视化数据从物理源到 API 服务的流转过程。</p>
        </div>
        
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm p-8 flex items-center justify-center overflow-auto relative">
            <div className="absolute top-4 right-4 flex gap-2">
                <button className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50"><ZoomIn size={16} /></button>
                <button className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50"><ZoomOut size={16} /></button>
            </div>
            
            {/* Simple static SVG visualization for lineage */}
            <svg width="800" height="400" viewBox="0 0 800 400" className="w-full h-full max-w-4xl">
                 <defs>
                     <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                         <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                     </marker>
                 </defs>
                 
                 {/* Links */}
                 <path d="M 150 200 L 300 200" stroke="#cbd5e1" strokeWidth="2" markerEnd="url(#arrowhead)" />
                 <path d="M 400 200 L 550 150" stroke="#cbd5e1" strokeWidth="2" markerEnd="url(#arrowhead)" />
                 <path d="M 400 200 L 550 250" stroke="#cbd5e1" strokeWidth="2" markerEnd="url(#arrowhead)" />

                 {/* Nodes */}
                 <g transform="translate(50, 170)">
                     <rect x="0" y="0" width="100" height="60" rx="6" fill="#ecfdf5" stroke="#10b981" strokeWidth="2"/>
                     <text x="50" y="35" textAnchor="middle" className="text-xs font-bold fill-emerald-800">MySQL 源</text>
                 </g>

                 <g transform="translate(300, 170)">
                     <rect x="0" y="0" width="100" height="60" rx="6" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2"/>
                     <text x="50" y="35" textAnchor="middle" className="text-xs font-bold fill-blue-800">物理表</text>
                 </g>

                 <g transform="translate(550, 120)">
                     <rect x="0" y="0" width="100" height="60" rx="6" fill="#f5f3ff" stroke="#8b5cf6" strokeWidth="2"/>
                     <text x="50" y="35" textAnchor="middle" className="text-xs font-bold fill-purple-800">业务对象</text>
                 </g>

                 <g transform="translate(550, 220)">
                     <rect x="0" y="0" width="100" height="60" rx="6" fill="#fff7ed" stroke="#f97316" strokeWidth="2"/>
                     <text x="50" y="35" textAnchor="middle" className="text-xs font-bold fill-orange-800">API 服务</text>
                 </g>
            </svg>
        </div>
    </div>
);

// --- 视图: 数据语义理解 (BU-03) ---
const DataSemanticUnderstandingView = ({ setActiveModule, businessObjects, setBusinessObjects, dataSources, scanAssets, setScanAssets }: any) => {
    const [selectedTableId, setSelectedTableId] = useState(scanAssets[0]?.id);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [expandedSources, setExpandedSources] = useState(new Set(dataSources.map((ds: any) => ds.id)));
    const [expandedTypes, setExpandedTypes] = useState(new Set(dataSources.map((ds: any) => ds.type)));
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<'source' | 'cluster'>('source');
    
    // Enrich mock assets with sourceId if not present (handled in global mock data, ensuring here)
    const selectedTable = scanAssets.find((t: any) => t.id === selectedTableId) as any;
    const selectedDataSource = dataSources.find((ds: any) => ds.id === selectedTable?.sourceId);

    // State for the AI result being viewed/edited
    interface SemanticProfile {
        businessName: string;
        description: string;
        scenarios: string[];
        coreFields: { 
            field: string; 
            reason: string;
            semanticType?: string; // 'PK', 'EventTime', 'Status', 'Measure', 'Dimension'
        }[];
        clusterSuggestion?: string;
        [key: string]: any;
    }

    const [currentResult, setCurrentResult] = useState<SemanticProfile | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [editableResult, setEditableResult] = useState<SemanticProfile | null>(null);

    // Effect: When table selection changes, load existing semantic data if present
    useEffect(() => {
        if (selectedTable?.semanticProfile) {
            setCurrentResult(selectedTable.semanticProfile);
            setEditableResult(selectedTable.semanticProfile);
            setEditMode(false); // Default to view mode for saved assets
        } else {
            setCurrentResult(null);
            setEditableResult({
                businessName: '',
                description: '',
                scenarios: [],
                coreFields: []
            });
            setEditMode(true);
        }
    }, [selectedTableId, selectedTable]);

    const toggleType = (type: any) => {
        const newSet = new Set(expandedTypes);
        if (newSet.has(type)) newSet.delete(type);
        else newSet.add(type);
        setExpandedTypes(newSet);
    };

    const toggleSource = (sourceId: any) => {
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
            ${selectedTable.columns.map((c: any) => `- ${c.name} (${c.type}): ${c.comment}`).join('\n')}
            
            请输出 JSON 格式，包含以下字段:
            - businessName: 建议的中文业务名称
            - description: 详细的业务含义描述 (50字左右)
            - scenarios: 适用的业务场景列表 (数组)
            - tags: 业务标签 (数组)
            - coreFields: 核心业务字段说明 (数组)。对象包含:
               - field: 字段名
               - reason: 识别原因
               - semanticType: 枚举值 ["PK", "EventTime", "Status", "Measure", "Dimension"]。PK=唯一标识/主键, EventTime=关键业务发生时间。
            - clusterSuggestion: 基于表名和内容的建议业务聚类名称 (例如: "出生一件事", "疫苗管理", "基础资源")
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: { responseMimeType: 'application/json' }
            });
            
            const result = JSON.parse(response.text as string);
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

    const toggleCoreField = (columnName: string, defaultReason: string) => {
        if (!editableResult) return;
        const exists = editableResult.coreFields?.find((cf: any) => cf.field === columnName);
        let newCoreFields;
        if (exists) {
            newCoreFields = editableResult.coreFields?.filter((cf: any) => cf.field !== columnName) || [];
        } else {
            newCoreFields = [...(editableResult.coreFields || []), { field: columnName, reason: defaultReason || '关键业务属性', semanticType: 'Dimension' }];
        }
        setEditableResult({ ...editableResult, coreFields: newCoreFields });
    };

    const updateCoreFieldReason = (columnName: string, newReason: string) => {
         if (!editableResult) return;
         const newCoreFields = editableResult.coreFields?.map((cf: any) => 
             cf.field === columnName ? { ...cf, reason: newReason } : cf
         ) || [];
         setEditableResult({ ...editableResult, coreFields: newCoreFields });
    };

    const handleSaveToMetadata = () => {
        if (!editableResult || !selectedTable) return;

        // Save logic: update scanAssets state with new semanticProfile
        const updatedAssets = scanAssets.map((asset: any) => {
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
        const mapSqlTypeToBusinessType = (sqlType: string) => {
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
            fields: selectedTable.columns.map((col: any, idx: number) => {
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

        setBusinessObjects((prev: any) => [newBO, ...prev]);
        alert(`已基于语义分析生成业务对象：${newBO.name}`);
        setActiveModule('td_modeling');
    };

    // Prepare data for tree view
    const filteredAssets = scanAssets.filter((asset: any) => 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        asset.comment.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sourcesWithTables = dataSources.map((ds: any) => {
        const tables = filteredAssets.filter((asset: any) => asset.sourceId === ds.id);
        return { ...ds, tables };
    }).filter((ds: any) => ds.tables.length > 0 || searchTerm === "");

    const groupedTreeData = Object.entries(
        sourcesWithTables.reduce((acc: any, ds: any) => {
            if (!acc[ds.type]) acc[ds.type] = [];
            acc[ds.type].push(ds);
            return acc;
        }, {} as Record<string, typeof sourcesWithTables>)
    ).map(([type, sources]) => ({ type, sources: sources as typeof sourcesWithTables }));

    // Helper to guess cluster based on name (mocking what AI might do globally)
    const getSimpleClusterName = (tableName: string) => {
        const lower = tableName.toLowerCase();
        if (lower.includes('newborn') || lower.includes('birth') || lower.includes('pop')) return '出生一件事 (Birth Event)';
        if (lower.includes('vac')) return '疫苗管理 (Vaccine)';
        if (lower.includes('hosp') || lower.includes('dict')) return '基础资源 (Resources)';
        if (lower.includes('order')) return '电商业务 (E-commerce)';
        if (lower.includes('user')) return '用户中心 (User Center)';
        return '未分类 (Uncategorized)';
    };

    // Flatten assets for cluster grouping logic
    const allTablesFlat = dataSources.flatMap((ds: any) => 
        scanAssets
            .filter((asset: any) => asset.sourceId === ds.id)
            .filter((asset: any) => 
                asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                asset.comment.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((t: any) => ({...t, sourceName: ds.name, type: ds.type}))
    );

    const groupedClusterData = Object.entries(
        allTablesFlat.reduce((acc: any, t: any) => {
            // Use saved cluster or heuristic
            const cluster = t.semanticProfile?.clusterSuggestion || getSimpleClusterName(t.name);
            if (!acc[cluster]) acc[cluster] = [];
            acc[cluster].push(t);
            return acc;
        }, {} as Record<string, typeof allTablesFlat>)
    ).map(([cluster, tables]) => ({ cluster, tables: tables as any[] }));

    // Helper for semantic icons
    const getSemanticIcon = (type?: string) => {
        if (type === 'PK') return <Key size={12} className="text-amber-500 flex-shrink-0" />;
        if (type === 'EventTime') return <Clock size={12} className="text-blue-500 flex-shrink-0" />;
        return null;
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center shrink-0">
               <div>
                 <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <BrainCircuit className="text-pink-500" /> 逻辑视图
                 </h2>
                 <p className="text-sm text-slate-500 mt-1">基于 AI 大模型，深度解析物理资产的业务含义，并回写至技术元数据。</p>
               </div>
               <div className="flex gap-4">
                  <StatCard label="待分析表" value={scanAssets.filter((a: any) => !a.isSemanticEnriched).length} trend="Pending" icon={Database} color="blue" />
                  <StatCard label="已智能解析" value={scanAssets.filter((a: any) => a.isSemanticEnriched).length} trend="Saved" icon={Sparkles} color="purple" />
               </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Left: Tree View of Data Sources & Tables */}
                <div className="w-80 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input 
                                type="text" 
                                placeholder="搜索数据源或表..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20" 
                            />
                        </div>
                        <div className="flex bg-slate-200 p-0.5 rounded-lg">
                            <button 
                                onClick={() => setViewMode('source')}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1 ${viewMode === 'source' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Database size={12} /> 按数据源
                            </button>
                            <button 
                                onClick={() => setViewMode('cluster')}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1 ${viewMode === 'cluster' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Folder size={12} /> 智能聚类
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {viewMode === 'source' ? (
                            groupedTreeData.map(group => (
                                <div key={group.type} className="border-b border-slate-100 last:border-0">
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
                            ))
                        ) : (
                            groupedClusterData.map(group => (
                                <div key={group.cluster} className="border-b border-slate-100 last:border-0">
                                    <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-50">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Folder size={14} className="text-indigo-400" />
                                            <span className="font-bold text-xs text-indigo-900 uppercase tracking-wide">{group.cluster}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-400 pl-6">{group.tables.length} tables found</div>
                                    </div>
                                    <div className="bg-slate-50/30 pb-2">
                                        {group.tables.map(t => (
                                            <div 
                                                key={t.id} 
                                                onClick={() => setSelectedTableId(t.id)}
                                                className={`pl-8 pr-4 py-2 cursor-pointer flex items-center justify-between group transition-all ${
                                                    selectedTableId === t.id 
                                                    ? 'bg-pink-50 border-r-2 border-pink-500 text-pink-700' 
                                                    : 'hover:bg-slate-100 border-r-2 border-transparent text-slate-600'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <Table size={14} className={selectedTableId === t.id ? 'text-pink-500' : 'text-slate-400'} />
                                                    <div className="min-w-0">
                                                        <div className={`text-sm truncate ${selectedTableId === t.id ? 'font-medium' : ''}`} title={t.name}>{t.name}</div>
                                                        <div className="text-[10px] text-slate-400 truncate">{t.sourceName}</div>
                                                    </div>
                                                </div>
                                                {t.isSemanticEnriched ? (
                                                    <BrainCircuit size={14} className="text-emerald-500 flex-shrink-0" title="已语义化" />
                                                ) : null}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                        {(viewMode === 'source' ? groupedTreeData : groupedClusterData).length === 0 && (
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
                                        {selectedTable?.columns.map((c: any, idx: number) => (
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
                                                value={editableResult?.businessName || ''}
                                                onChange={(e) => editableResult && setEditableResult({...editableResult, businessName: e.target.value})}
                                                className="w-full mt-1 px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:border-purple-500 text-slate-800 font-bold"
                                             />
                                         ) : (
                                             <div className="text-xl font-bold text-slate-800 mt-1">{editableResult?.businessName}</div>
                                         )}
                                     </div>

                                     {/* Cluster Suggestion Display */}
                                     {editableResult?.clusterSuggestion && !editMode && (
                                         <div className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded border border-indigo-100">
                                             <Folder size={12} /> 所属聚类: <b>{editableResult.clusterSuggestion}</b>
                                         </div>
                                     )}
                                     
                                     <div>
                                         <label className="text-xs font-bold text-purple-400 uppercase tracking-wider">业务含义描述</label>
                                         {editMode ? (
                                             <textarea
                                                value={editableResult?.description || ''}
                                                onChange={(e) => editableResult && setEditableResult({...editableResult, description: e.target.value})}
                                                rows={3}
                                                className="w-full mt-1 px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm text-slate-600"
                                             />
                                         ) : (
                                             <p className="text-sm text-slate-600 mt-1 leading-relaxed bg-white/50 p-3 rounded-lg border border-purple-100">
                                                 {editableResult?.description}
                                             </p>
                                         )}
                                     </div>

                                     <div>
                                         <label className="text-xs font-bold text-purple-400 uppercase tracking-wider">适用场景 & 标签</label>
                                         {editMode ? (
                                             <div className="mt-1 space-y-2">
                                                 <input 
                                                    value={editableResult?.scenarios?.join(', ') || ''}
                                                    onChange={(e) => editableResult && setEditableResult({...editableResult, scenarios: e.target.value.split(',').map(s=>s.trim())})}
                                                    placeholder="场景 (逗号分隔)"
                                                    className="w-full px-3 py-2 border border-purple-200 rounded-lg text-xs"
                                                 />
                                             </div>
                                         ) : (
                                             <div className="flex flex-wrap gap-2 mt-2">
                                                 {editableResult?.scenarios?.map(s => (
                                                     <span key={s} className="px-2.5 py-1 bg-white border border-purple-200 text-purple-700 text-xs rounded-full shadow-sm">{s}</span>
                                                 ))}
                                             </div>
                                         )}
                                     </div>

                                     <div className="bg-purple-50/50 rounded-lg p-3 border border-purple-100">
                                          <div className="flex justify-between items-center mb-2">
                                              <label className="text-xs font-bold text-purple-400 uppercase tracking-wider">核心字段识别 (Core Fields)</label>
                                              {editMode && (
                                                  <span className="text-[10px] text-purple-400">
                                                      {editableResult?.coreFields?.length}/{selectedTable?.columns.length} 已选
                                                  </span>
                                              )}
                                          </div>
                                          {editMode ? (
                                              <div className="max-h-60 overflow-y-auto pr-1 custom-scrollbar space-y-2">
                                                  {selectedTable?.columns.map((col: any) => {
                                                      const coreField = editableResult?.coreFields?.find((cf: any) => cf.field === col.name);
                                                      const isCore = !!coreField;
                                                      
                                                      return (
                                                          <div key={col.name} className={`p-2 rounded border transition-all ${isCore ? 'bg-white border-purple-200 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100 hover:bg-white/50'}`}>
                                                              <div className="flex items-center gap-2">
                                                                  <button 
                                                                      onClick={() => toggleCoreField(col.name, col.comment)}
                                                                      className={`w-8 h-4 rounded-full p-0.5 transition-colors relative flex-shrink-0 ${isCore ? 'bg-purple-500' : 'bg-slate-300'}`}
                                                                  >
                                                                      <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${isCore ? 'translate-x-4' : 'translate-x-0'}`} />
                                                                  </button>
                                                                  
                                                                  <span className={`text-xs font-mono truncate ${isCore ? 'font-bold text-purple-900' : 'text-slate-600'}`} title={col.name}>{col.name}</span>
                                                                  <span className="text-[10px] text-slate-400 truncate flex-1">{col.type}</span>
                                                                  {/* Semantic Type Icon in Edit Mode */}
                                                                  {isCore && getSemanticIcon(coreField?.semanticType)}
                                                              </div>
                                                              
                                                              {isCore && (
                                                                  <div className="mt-2 pl-10 space-y-2">
                                                                      <input 
                                                                          value={coreField?.reason || ''}
                                                                          onChange={(e) => updateCoreFieldReason(col.name, e.target.value)}
                                                                          className="w-full text-xs border-b border-purple-100 bg-transparent focus:border-purple-400 focus:outline-none text-slate-600 placeholder-purple-200"
                                                                          placeholder="输入识别原因..."
                                                                      />
                                                                  </div>
                                                              )}
                                                          </div>
                                                      );
                                                  })}
                                              </div>
                                          ) : (
                                              <ul className="mt-2 space-y-2">
                                                  {(editableResult as any)?.coreFields?.map((f: any, i: number) => (
                                                      <li key={i} className="text-xs flex gap-2 items-start">
                                                          {/* Icon for semantic type */}
                                                          <div className="mt-0.5">{getSemanticIcon(f.semanticType)}</div>
                                                          <span className="font-mono font-bold text-slate-700 bg-white border border-purple-100 px-1 rounded">{f.field}</span>
                                                          <span className="text-slate-500">- {f.reason}</span>
                                                      </li>
                                                  ))}
                                              </ul>
                                          )}
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

const SemanticLayerApp = () => {
    const [activeModule, setActiveModule] = useState('dashboard');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showAssistant, setShowAssistant] = useState(false);

    // Global Data State
    const [businessObjects, setBusinessObjects] = useState(mockBusinessObjects);
    const [dataSources, setDataSources] = useState(mockDataSources);
    const [scanAssets, setScanAssets] = useState(mockScanAssets);
    const [candidates, setCandidates] = useState(mockAICandidates);
    const [selectedBO, setSelectedBO] = useState<any>(null);

    // Render content based on active module
    const renderContent = () => {
        switch (activeModule) {
            case 'dashboard':
                return <DashboardView setActiveModule={setActiveModule} />;
            case 'td_goals':
                return <BusinessGoalsView setActiveModule={setActiveModule} />;
            case 'td_modeling':
                return <BusinessModelingView 
                        businessObjects={businessObjects} 
                        setBusinessObjects={setBusinessObjects}
                        selectedBO={selectedBO}
                        setSelectedBO={setSelectedBO}
                       />;
            case 'td_scenario':
                return <ScenarioOrchestrationView businessObjects={businessObjects} />;
            case 'bu_connect':
                return <DataSourceManagementView dataSources={dataSources} setDataSources={setDataSources} />;
            case 'bu_discovery':
                return <AssetScanningView 
                        setActiveModule={setActiveModule} 
                        candidates={candidates}
                        scanAssets={scanAssets}
                       />;
            case 'bu_candidates':
                return <CandidateGenerationView 
                        candidates={candidates} 
                        setCandidates={setCandidates} 
                        setBusinessObjects={setBusinessObjects}
                        setActiveModule={setActiveModule}
                        setSelectedBO={setSelectedBO}
                       />;
            case 'bu_semantics':
                return <DataSemanticUnderstandingView 
                         setActiveModule={setActiveModule}
                         businessObjects={businessObjects}
                         setBusinessObjects={setBusinessObjects}
                         dataSources={dataSources}
                         scanAssets={scanAssets}
                         setScanAssets={setScanAssets}
                       />;
            case 'mapping':
                return <MappingStudioView selectedBO={selectedBO} />;
            case 'governance':
                return <ConflictDetectionView setActiveModule={setActiveModule} />;
            case 'catalog':
                return <DataCatalogView />;
            case 'ee_api':
                return <ApiGatewayView />;
            case 'ee_cache':
                return <CacheStrategyView />;
            case 'lineage':
                return <DataLineageView />;
            default:
                return <div className="p-10 text-center text-slate-400">Module {activeModule} under construction</div>;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
            <Sidebar 
                activeModule={activeModule} 
                setActiveModule={setActiveModule} 
                isCollapsed={isCollapsed} 
                setIsCollapsed={setIsCollapsed} 
            />
            
            <div className="flex-1 flex flex-col min-w-0">
                <Header 
                    activeModule={activeModule} 
                    showAssistant={showAssistant} 
                    setShowAssistant={setShowAssistant} 
                />
                
                <main className="flex-1 overflow-y-auto p-6 relative custom-scrollbar">
                    {renderContent()}
                </main>
            </div>

            {/* AI Assistant Side Panel */}
            <div className={`fixed inset-y-0 right-0 transform transition-transform duration-300 ease-in-out z-50 shadow-2xl ${showAssistant ? 'translate-x-0' : 'translate-x-full'}`}>
                 <AIAssistantPanel 
                    visible={showAssistant} 
                    onClose={() => setShowAssistant(false)}
                    activeModule={activeModule}
                    contextData={{
                        businessObjects,
                        dataSources,
                        candidates
                    }}
                 />
            </div>
        </div>
    );
};

export default SemanticLayerApp;