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
import { IdentificationResultView } from './src/components/semantic-layer/views/discovery';
import { BusinessGoalsView, BusinessModelingView, ScenarioOrchestrationView } from './src/components/semantic-layer/views/business';
import { DataCatalogView, TermManagementView, TagManagementView } from './src/components/semantic-layer/views/governance';

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
            title: '数据治理',
            color: 'text-indigo-400',
            items: [
                { id: 'term_management', label: '术语管理', icon: Book },
                { id: 'tag_management', label: '标签管理', icon: Tag },
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
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [expandedTableId, setExpandedTableId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBatchAnalyzing, setIsBatchAnalyzing] = useState(false);
    const [filterState, setFilterState] = useState({
        semanticStatus: 'all', // 'all' | 'enriched' | 'not_enriched'
        sortBy: 'name', // 'name' | 'semantic' | 'rows' | 'updated'
        sortOrder: 'asc' // 'asc' | 'desc'
    });
    const [selectedComparisonTables, setSelectedComparisonTables] = useState<Set<string>>(new Set());
    const [showFieldSemantics, setShowFieldSemantics] = useState<Record<string, boolean>>({});
    const [fieldSemanticEdit, setFieldSemanticEdit] = useState<Record<string, any>>({});
    const [showComparisonPanel, setShowComparisonPanel] = useState(false);
    const [showGenerationWizard, setShowGenerationWizard] = useState(false);
    const [wizardTable, setWizardTable] = useState<any>(null);
    const [wizardSemantic, setWizardSemantic] = useState<any>(null);
    const [isQuickGenerating, setIsQuickGenerating] = useState(false);
    
    // 将table和semantic转换为identificationResult格式
    const convertToIdentificationResult = (table: any, semantic: any) => {
        return {
            id: table.id || `IR_${Date.now()}`,
            tableName: table.name,
            tableComment: table.comment || '',
            sourceId: table.sourceId || '',
            objectSuggestion: {
                name: semantic.businessName || table.comment || table.name,
                confidence: semantic.confidence || 0,
                risk: semantic.riskLevel || 'low',
                status: 'pending',
                source: 'AI + 规则'
            },
            fieldSuggestions: semantic.coreFields?.map((cf: any) => ({
                field: cf.field,
                semanticRole: cf.semanticType || '属性',
                aiExplanation: cf.reason || '',
                confidence: semantic.confidence || 0.8,
                status: 'accepted'
            })) || []
        };
    };

    // 字段名转驼峰
    const convertToCamelCase = (fieldName: string) => {
        const parts = fieldName.split('_');
        if (parts.length === 1) return fieldName;
        return parts[0] + parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
    };

    // 一键生成业务对象（跳过向导，直接生成）
    const handleQuickGenerate = async (table: any, semantic: any) => {
        if (!table || !semantic) return;
        
        setIsQuickGenerating(true);
        
        // 快速生成配置（使用默认值）
        const businessName = (semantic.businessName || table.comment || table.name).replace(/（业务视图）/, '');
        const tableName = table.name.replace(/^t_/, '');
        const code = `biz_${tableName}`;
        
        // 字段映射
        const fieldMappings = (semantic.coreFields || [])
            .filter((cf: any) => {
                const fieldLower = cf.field.toLowerCase();
                if (fieldLower.includes('create') || fieldLower.includes('update')) {
                    return false; // 跳过时间戳字段
                }
                return true;
            })
            .map((cf: any) => ({
                field: cf.field,
                businessName: convertToCamelCase(cf.field),
                businessType: 'String', // 默认类型
                businessDesc: cf.reason || ''
            }));

        // 模拟生成过程
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 创建业务对象
        const newBO = {
            id: `BO_${Date.now()}`,
            name: businessName,
            code: code,
            domain: semantic.clusterSuggestion || 'AI生成',
            owner: '待认领',
            status: 'draft',
            version: 'v1.0',
            description: semantic.description || `从表 ${table.name} 生成的业务对象`,
            sourceTables: [table.name],
            fields: fieldMappings.map((f: any, i: number) => ({
                id: `f_${i}`,
                name: f.businessName,
                code: f.field,
                type: f.businessType,
                length: '-',
                required: false,
                desc: f.businessDesc
            }))
        };
        
        setBusinessObjects([...businessObjects, newBO]);
        setIsQuickGenerating(false);
        
        // 提示用户
        const result = confirm(`业务对象"${newBO.name}"生成成功！\n\n是否查看详情？`);
        if (result) {
            setActiveModule('td_modeling');
            // 通过事件传递新创建的BO ID
            setTimeout(() => {
                const event = new CustomEvent('selectBusinessObject', { detail: { id: newBO.id } });
                window.dispatchEvent(event);
            }, 100);
        }
    };
    
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

    // Prepare Right List Data with enhanced filtering and sorting
    const tableList = useMemo(() => {
        let filtered = [...scanAssets];
        
        // Node filter
        if (selectedNode) {
            if (viewMode === 'source') {
                const validDsIdsByType = dataSources.filter((ds: any) => ds.type === selectedNode).map((ds: any) => ds.id);
                if (validDsIdsByType.length > 0) {
                     filtered = filtered.filter((t: any) => validDsIdsByType.includes(t.sourceId));
                } else {
                     filtered = filtered.filter((t: any) => t.sourceId === selectedNode);
                }
            } else {
                filtered = filtered.filter((t: any) => {
                    const cluster = t.semanticProfile?.clusterSuggestion || getSimpleClusterName(t.name);
                    return cluster === selectedNode;
                });
            }
        }
        
        // Search filter
        if (searchTerm) {
            filtered = filtered.filter((t: any) => 
                t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                (t.comment || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (t.semanticProfile?.businessName || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Semantic status filter
        if (filterState.semanticStatus === 'enriched') {
            filtered = filtered.filter((t: any) => t.isSemanticEnriched);
        } else if (filterState.semanticStatus === 'not_enriched') {
            filtered = filtered.filter((t: any) => !t.isSemanticEnriched);
        }
        
        // Sorting
        filtered.sort((a: any, b: any) => {
            let aVal: any, bVal: any;
            switch (filterState.sortBy) {
                case 'name':
                    aVal = a.name.toLowerCase();
                    bVal = b.name.toLowerCase();
                    break;
                case 'semantic':
                    aVal = a.isSemanticEnriched ? 1 : 0;
                    bVal = b.isSemanticEnriched ? 1 : 0;
                    break;
                case 'rows':
                    aVal = parseInt(a.rows?.replace(/[^\d]/g, '') || '0');
                    bVal = parseInt(b.rows?.replace(/[^\d]/g, '') || '0');
                    break;
                case 'updated':
                    aVal = new Date(a.updateTime || 0).getTime();
                    bVal = new Date(b.updateTime || 0).getTime();
                    break;
                default:
                    return 0;
            }
            
            if (aVal < bVal) return filterState.sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return filterState.sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        
        return filtered;
    }, [selectedNode, viewMode, scanAssets, dataSources, searchTerm, filterState]);

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
                // 模拟AI分析结果（增强版）
                const result = {
                    businessName: `${table.comment || table.name}（业务视图）`,
                    description: `这是对表 ${table.name} 的模拟分析结果。根据表名和字段结构，AI 识别出这是一个${table.comment || '业务实体'}表，包含${table.columns.length}个字段。`,
                    scenarios: table.name.includes('order') ? ["订单管理", "交易流程"] : 
                               table.name.includes('user') ? ["用户管理", "账户服务"] : 
                               ["业务场景1", "业务场景2"],
                    tags: table.name.includes('dict') ? ["字典表", "基础数据"] : 
                          table.name.includes('record') ? ["记录表", "明细数据"] : 
                          ["业务标签1", "业务标签2"],
                    coreFields: table.columns.slice(0, 3).map((col: any) => {
                        let reason = "字段";
                        let semanticType = "Field";
                        if (col.name.toLowerCase().includes('id') && col.name.toLowerCase() !== 'id') {
                            reason = "关联字段";
                            semanticType = "FK";
                        } else if (col.name.toLowerCase() === 'id' || col.name.toLowerCase().includes('_id')) {
                            reason = "主键字段";
                            semanticType = "PK";
                        } else if (col.type.toLowerCase().includes('time') || col.type.toLowerCase().includes('date')) {
                            reason = "时间字段";
                            semanticType = "EventTime";
                        }
                        return { field: col.name, reason, semanticType };
                    }),
                    clusterSuggestion: getSimpleClusterName(table.name),
                    confidence: 0.85 + Math.random() * 0.1, // 0.85-0.95
                    riskLevel: Math.random() > 0.7 ? 'medium' : 'low',
                    fieldSemantics: table.columns.map((col: any) => {
                        let semanticRole = '属性';
                        if (col.name.toLowerCase().includes('id')) semanticRole = '标识';
                        if (col.type.toLowerCase().includes('time') || col.type.toLowerCase().includes('date')) semanticRole = '时间戳';
                        if (col.name.toLowerCase().includes('status')) semanticRole = '状态';
                        return {
                            field: col.name,
                            semanticRole,
                            confidence: 0.75 + Math.random() * 0.2,
                            source: 'AI'
                        };
                    })
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
                description: `这是对表 ${table.name} 的模拟AI分析结果。在实际环境中，这里会包含详细的语义分析。根据表结构分析：\n1. 表名和注释反映了业务含义\n2. 字段命名遵循常见规范\n3. 数据类型和约束提供了语义线索`,
                scenarios: table.name.includes('order') ? ["订单管理", "交易流程"] : 
                           table.name.includes('user') ? ["用户管理", "账户服务"] : 
                           ["业务场景1", "业务场景2"],
                tags: table.name.includes('dict') ? ["字典表", "基础数据"] : 
                      table.name.includes('record') ? ["记录表", "明细数据"] : 
                      ["业务标签1", "业务标签2"],
                coreFields: table.columns.slice(0, 3).map((col: any) => {
                    let reason = "字段";
                    let semanticType = "Field";
                    if (col.name.toLowerCase().includes('id') && col.name.toLowerCase() !== 'id') {
                        reason = "关联字段";
                        semanticType = "FK";
                    } else if (col.name.toLowerCase() === 'id' || (col.name.toLowerCase().endsWith('_id') && !col.name.toLowerCase().includes('user_id'))) {
                        reason = "主键字段";
                        semanticType = "PK";
                    } else if (col.type.toLowerCase().includes('time') || col.type.toLowerCase().includes('date')) {
                        reason = "时间字段";
                        semanticType = "EventTime";
                    }
                    return { field: col.name, reason, semanticType };
                }),
                clusterSuggestion: getSimpleClusterName(table.name),
                confidence: 0.85 + Math.random() * 0.1,
                riskLevel: Math.random() > 0.7 ? 'medium' : 'low',
                fieldSemantics: table.columns.map((col: any) => {
                    let semanticRole = '属性';
                    if (col.name.toLowerCase().includes('id')) semanticRole = '标识';
                    if (col.type.toLowerCase().includes('time') || col.type.toLowerCase().includes('date')) semanticRole = '时间戳';
                    if (col.name.toLowerCase().includes('status')) semanticRole = '状态';
                    return {
                        field: col.name,
                        semanticRole,
                        confidence: 0.75 + Math.random() * 0.2,
                        source: 'AI'
                    };
                }),
                reasoning: `基于以下线索进行语义分析：\n1. 表名 "${table.name}" 和注释 "${table.comment || '无'}" 提供了业务上下文\n2. 字段命名模式反映了数据模型设计规范\n3. 数据类型和约束暗示了字段的业务含义`,
                relatedTables: scanAssets
                    .filter((t: any) => t.id !== table.id && (
                        t.name.toLowerCase().includes(table.name.toLowerCase().split('_')[0]) ||
                        t.semanticProfile?.clusterSuggestion === getSimpleClusterName(table.name)
                    ))
                    .slice(0, 3)
                    .map((t: any) => ({ id: t.id, name: t.name, relation: '同集群' }))
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
                          <div className="text-lg font-bold text-slate-700 leading-none">
                              {scanAssets.filter((a: any) => a.isSemanticEnriched).length}
                      </div>
                          <div className="text-[10px] text-slate-400">
                              {scanAssets.length > 0 ? Math.round(scanAssets.filter((a: any) => a.isSemanticEnriched).length / scanAssets.length * 100) : 0}%
                  </div>
                      </div>
                  </div>
                  <div className="bg-white border border-emerald-100 rounded-lg px-4 py-2 flex items-center gap-3 shadow-sm">
                      <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md"><Network size={16}/></div>
                      <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">聚类数量</div>
                          <div className="text-lg font-bold text-slate-700 leading-none">
                              {new Set(scanAssets.map((a: any) => 
                                  a.semanticProfile?.clusterSuggestion || getSimpleClusterName(a.name)
                              )).size}
                          </div>
                      </div>
                  </div>
                  {selectedComparisonTables.size > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center gap-3 shadow-sm">
                          <div className="p-1.5 bg-blue-100 text-blue-600 rounded-md"><Layers size={16}/></div>
                          <div>
                              <div className="text-[10px] text-blue-600 uppercase font-bold">对比中</div>
                              <div className="text-lg font-bold text-blue-700 leading-none">{selectedComparisonTables.size}</div>
                          </div>
                      </div>
                  )}
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
                    {/* Enhanced Header with Filters */}
                    <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                        <div className="flex justify-between items-center mb-3">
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
                            <div className="flex items-center gap-2">
                                {selectedComparisonTables.size > 0 && (
                                    <button
                                        onClick={() => {
                                            const comparisonTables = scanAssets.filter((t: any) => selectedComparisonTables.has(t.id));
                                            if (comparisonTables.length >= 2) {
                                                // 显示对比面板
                                                setShowComparisonPanel(true);
                                            } else {
                                                alert('请至少选择2张表进行对比');
                                            }
                                        }}
                                        className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-200 flex items-center gap-1"
                                    >
                                        <Layers size={14} /> 对比 ({selectedComparisonTables.size})
                                    </button>
                                )}
                                <button
                                    onClick={() => setSelectedComparisonTables(new Set())}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                        selectedComparisonTables.size > 0 
                                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                            : 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400'
                                    }`}
                                    disabled={selectedComparisonTables.size === 0}
                                >
                                    清空对比
                                </button>
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
                                <button
                                    onClick={() => setActiveModule('bu_identification')}
                                    className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg hover:bg-emerald-200 flex items-center gap-1"
                                >
                                    <FileCheck size={14} /> 识别结果确认
                                </button>
                            </div>
                        </div>
                        {/* Enhanced Filters */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-slate-600">语义化状态：</label>
                                <select
                                    value={filterState.semanticStatus}
                                    onChange={(e) => setFilterState({...filterState, semanticStatus: e.target.value})}
                                    className="border border-slate-300 rounded px-2 py-1 text-xs"
                                >
                                    <option value="all">全部</option>
                                    <option value="enriched">已语义化</option>
                                    <option value="not_enriched">未语义化</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-slate-600">排序：</label>
                                <select
                                    value={filterState.sortBy}
                                    onChange={(e) => setFilterState({...filterState, sortBy: e.target.value})}
                                    className="border border-slate-300 rounded px-2 py-1 text-xs"
                                >
                                    <option value="name">表名</option>
                                    <option value="semantic">语义化状态</option>
                                    <option value="rows">数据量</option>
                                    <option value="updated">更新时间</option>
                                </select>
                                <button
                                    onClick={() => setFilterState({...filterState, sortOrder: filterState.sortOrder === 'asc' ? 'desc' : 'asc'})}
                                    className="p-1 text-slate-500 hover:text-slate-700"
                                    title={filterState.sortOrder === 'asc' ? '升序' : '降序'}
                                >
                                    {filterState.sortOrder === 'asc' ? '↑' : '↓'}
                                </button>
                            </div>
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
                                        <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
                                            <input 
                                                type="checkbox" 
                                                checked={isSelected} 
                                                onChange={() => toggleSelection(table.id)}
                                                className="w-4 h-4 rounded border-slate-300 text-pink-600 focus:ring-pink-500 cursor-pointer"
                                                title="批量分析"
                                            />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const newSet = new Set(selectedComparisonTables);
                                                    if (newSet.has(table.id)) {
                                                        newSet.delete(table.id);
                                                    } else {
                                                        if (newSet.size >= 3) {
                                                            alert('最多可同时对比3张表');
                                                            return;
                                                        }
                                                        newSet.add(table.id);
                                                    }
                                                    setSelectedComparisonTables(newSet);
                                                }}
                                                className={`p-1 rounded transition-colors ${
                                                    selectedComparisonTables.has(table.id)
                                                        ? 'bg-blue-100 text-blue-600'
                                                        : 'text-slate-400 hover:bg-slate-100'
                                                }`}
                                                title={selectedComparisonTables.has(table.id) ? '取消对比' : '加入对比（最多3张）'}
                                            >
                                                <Layers size={14} />
                                            </button>
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

                                        <div className="w-8 flex justify-end shrink-0 gap-1">
                                            {table.isSemanticEnriched && (
                                                <BrainCircuit size={16} className="text-emerald-500" title="已语义化" />
                                            )}
                                            {selectedComparisonTables.has(table.id) && (
                                                <Layers size={14} className="text-blue-500" title="已选中对比" />
                                            )}
                                            <ChevronDown size={16} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    {isExpanded && (
                                        <div className="border-t border-slate-100 bg-slate-50/50 p-4 animate-fade-in">
                                            <div className="flex gap-6 flex-col lg:flex-row">
                                                {/* 1. Physical Schema with Field Semantics */}
                                                <div className="flex-1 bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col h-[300px]">
                                                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-500 uppercase flex justify-between items-center">
                                                        <span>物理字段 ({table.columns.length})</span>
                                                        <div className="flex items-center gap-2">
                                                            {table.semanticProfile && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setShowFieldSemantics({
                                                                            ...showFieldSemantics,
                                                                            [table.id]: !showFieldSemantics[table.id]
                                                                        });
                                                                    }}
                                                                    className={`text-xs px-2 py-1 rounded transition-colors ${
                                                                        showFieldSemantics[table.id]
                                                                            ? 'bg-purple-100 text-purple-700'
                                                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                                    }`}
                                                                >
                                                                    {showFieldSemantics[table.id] ? '隐藏语义' : '显示语义'}
                                                                </button>
                                                            )}
                                                        <Code size={12}/>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                                                        <table className="w-full text-xs text-left">
                                                            <thead className="bg-white text-slate-400 sticky top-0 shadow-sm z-10">
                                                                <tr>
                                                                    <th className="px-4 py-2 bg-slate-50/90 backdrop-blur">Name</th>
                                                                    <th className="px-4 py-2 bg-slate-50/90 backdrop-blur">Type</th>
                                                                    <th className="px-4 py-2 bg-slate-50/90 backdrop-blur">Comment</th>
                                                                    {showFieldSemantics[table.id] && (
                                                                        <th className="px-4 py-2 bg-slate-50/90 backdrop-blur">语义角色</th>
                                                                    )}
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-100">
                                                                {table.columns.map((col: any, idx: number) => {
                                                                    const fieldSemantic = table.semanticProfile?.fieldSemantics?.find((fs: any) => fs.field === col.name);
                                                                    const isEditing = fieldSemanticEdit[`${table.id}_${col.name}`];
                                                                    return (
                                                                    <tr key={idx} className="hover:bg-slate-50 group">
                                                                        <td className="px-4 py-2 font-mono text-slate-700 font-medium group-hover:text-blue-600 transition-colors">{col.name}</td>
                                                                        <td className="px-4 py-2 text-slate-400 flex items-center gap-1.5">
                                                                            {getFieldTypeIcon(col.type)}
                                                                            {col.type}
                                                                        </td>
                                                                            <td className="px-4 py-2 text-slate-500 truncate max-w-[120px]" title={col.comment}>{col.comment || '-'}</td>
                                                                            {showFieldSemantics[table.id] && (
                                                                                <td className="px-4 py-2">
                                                                                    {isEditing ? (
                                                                                        <input
                                                                                            type="text"
                                                                                            defaultValue={fieldSemantic?.semanticRole || ''}
                                                                                            onBlur={(e) => {
                                                                                                const newSemantics = {
                                                                                                    ...fieldSemanticEdit,
                                                                                                    [`${table.id}_${col.name}`]: false
                                                                                                };
                                                                                                if (e.target.value.trim()) {
                                                                                                    // 保存字段语义
                                                                                                    const updatedAssets = scanAssets.map((t: any) => {
                                                                                                        if (t.id === table.id) {
                                                                                                            const fieldSemantics = t.semanticProfile?.fieldSemantics || [];
                                                                                                            const existingIndex = fieldSemantics.findIndex((fs: any) => fs.field === col.name);
                                                                                                            const newFieldSemantic = {
                                                                                                                field: col.name,
                                                                                                                semanticRole: e.target.value.trim(),
                                                                                                                confidence: 1.0,
                                                                                                                source: 'manual'
                                                                                                            };
                                                                                                            if (existingIndex >= 0) {
                                                                                                                fieldSemantics[existingIndex] = newFieldSemantic;
                                                                                                            } else {
                                                                                                                fieldSemantics.push(newFieldSemantic);
                                                                                                            }
                                                                                                            return {
                                                                                                                ...t,
                                                                                                                semanticProfile: {
                                                                                                                    ...t.semanticProfile,
                                                                                                                    fieldSemantics
                                                                                                                }
                                                                                                            };
                                                                                                        }
                                                                                                        return t;
                                                                                                    });
                                                                                                    setScanAssets(updatedAssets);
                                                                                                }
                                                                                                setFieldSemanticEdit(newSemantics);
                                                                                            }}
                                                                                            className="w-full px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                                            placeholder="输入语义角色..."
                                                                                            autoFocus
                                                                                        />
                                                                                    ) : (
                                                                                        <div className="flex items-center gap-1 group/item">
                                                                                            {fieldSemantic ? (
                                                                                                <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                                                                                                    {fieldSemantic.semanticRole}
                                                                                                </span>
                                                                                            ) : (
                                                                                                <span className="text-xs text-slate-400">-</span>
                                                                                            )}
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    setFieldSemanticEdit({
                                                                                                        ...fieldSemanticEdit,
                                                                                                        [`${table.id}_${col.name}`]: true
                                                                                                    });
                                                                                                }}
                                                                                                className="opacity-0 group-hover/item:opacity-100 text-blue-500 hover:text-blue-700"
                                                                                                title="编辑语义"
                                                                                            >
                                                                                                <Edit size={12} />
                                                                                            </button>
                                                                                        </div>
                                                                                    )}
                                                                                </td>
                                                                            )}
                                                                    </tr>
                                                                    );
                                                                })}
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
                                                                        <div className="flex items-center justify-between mb-1">
                                                                            <div className="text-[10px] uppercase text-purple-400 font-bold tracking-wider">建议业务名称</div>
                                                                            {semantic.confidence && (
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="flex items-center gap-1">
                                                                                        <div className="w-16 bg-slate-200 rounded-full h-1.5">
                                                                                            <div
                                                                                                className="bg-purple-500 h-1.5 rounded-full"
                                                                                                style={{ width: `${semantic.confidence * 100}%` }}
                                                                                            ></div>
                                                                                        </div>
                                                                                        <span className="text-[10px] text-slate-500">
                                                                                            {Math.round(semantic.confidence * 100)}%
                                                                                        </span>
                                                                                    </div>
                                                                                    {semantic.riskLevel && semantic.riskLevel !== 'low' && (
                                                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                                                                            semantic.riskLevel === 'high' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                                                                        }`}>
                                                                                            {semantic.riskLevel === 'high' ? '高风险' : '中风险'}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        {editMode ? (
                                                                            <input className="w-full border border-purple-200 rounded p-1 text-sm font-bold text-slate-800" value={editableResult.businessName} onChange={e => setEditableResult({...editableResult, businessName: e.target.value})} />
                                                                        ) : <div className="text-base font-bold text-slate-800">{semantic.businessName}</div>}
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <div className="text-[10px] uppercase text-purple-400 font-bold tracking-wider mb-1">业务描述</div>
                                                                        {editMode ? (
                                                                            <textarea rows={2} className="w-full border border-purple-200 rounded p-1 text-xs" value={editableResult.description} onChange={e => setEditableResult({...editableResult, description: e.target.value})} />
                                                                        ) : <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2 rounded border border-slate-100 whitespace-pre-line">{semantic.description}</p>}
                                                                    </div>
                                                                    
                                                                    {/* AI 推理过程 */}
                                                                    {semantic.reasoning && !editMode && (
                                                                        <div>
                                                                            <div className="text-[10px] uppercase text-purple-400 font-bold tracking-wider mb-1">AI 推理过程</div>
                                                                            <div className="p-2 bg-purple-50 rounded border border-purple-100 text-xs text-slate-700 whitespace-pre-line">
                                                                                {semantic.reasoning}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* 业务场景和标签 */}
                                                                    {(semantic.scenarios || semantic.tags) && !editMode && (
                                                                        <div className="space-y-2">
                                                                            {semantic.scenarios && semantic.scenarios.length > 0 && (
                                                                        <div>
                                                                            <div className="text-[10px] uppercase text-purple-400 font-bold tracking-wider mb-1">适用场景</div>
                                                                            <div className="flex flex-wrap gap-1">
                                                                                {semantic.scenarios.map((scenario: string, idx: number) => (
                                                                                    <span key={idx} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                                                                        {scenario}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                            )}
                                                                            {semantic.tags && semantic.tags.length > 0 && (
                                                                        <div>
                                                                            <div className="text-[10px] uppercase text-purple-400 font-bold tracking-wider mb-1">业务标签</div>
                                                                            <div className="flex flex-wrap gap-1">
                                                                                {semantic.tags.map((tag: string, idx: number) => (
                                                                                    <span key={idx} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                                                                        {tag}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {editMode && (editableResult.scenarios || editableResult.tags) && (
                                                                        <div className="space-y-2">
                                                                            <div>
                                                                                <div className="text-[10px] uppercase text-purple-400 font-bold tracking-wider mb-1">适用场景</div>
                                                                                <textarea 
                                                                                    rows={1}
                                                                                    className="w-full border border-purple-200 rounded p-1 text-xs"
                                                                                    value={editableResult.scenarios?.join(', ') || ''}
                                                                                    onChange={e => setEditableResult({
                                                                                        ...editableResult, 
                                                                                        scenarios: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                                                                                    })}
                                                                                    placeholder="场景1, 场景2..."
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <div className="text-[10px] uppercase text-purple-400 font-bold tracking-wider mb-1">业务标签</div>
                                                                                <textarea 
                                                                                    rows={1}
                                                                                    className="w-full border border-purple-200 rounded p-1 text-xs"
                                                                                    value={editableResult.tags?.join(', ') || ''}
                                                                                    onChange={e => setEditableResult({
                                                                                        ...editableResult, 
                                                                                        tags: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                                                                                    })}
                                                                                    placeholder="标签1, 标签2..."
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    )}

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
                                                                    
                                                                    {/* 相关表推荐 */}
                                                                    {semantic.relatedTables && semantic.relatedTables.length > 0 && !editMode && (
                                                                        <div>
                                                                            <div className="text-[10px] uppercase text-purple-400 font-bold tracking-wider mb-1">相关表推荐</div>
                                                                            <div className="space-y-1">
                                                                                {semantic.relatedTables.map((rt: any, idx: number) => (
                                                                                    <div key={idx} className="flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-200 text-xs">
                                                                                        <span className="font-mono text-slate-700">{rt.name}</span>
                                                                                        <span className="text-slate-500">{rt.relation}</span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {!editMode && (
                                                                        <div className="space-y-2">
                                                                            {/* 根据置信度显示不同的按钮 */}
                                                                            {(() => {
                                                                                const confidence = semantic.confidence || 0;
                                                                                if (confidence > 0.9) {
                                                                                    // 高置信度：显示"一键生成"按钮（绿色，推荐）
                                                                                    return (
                                                                                        <button 
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                handleQuickGenerate(table, semantic);
                                                                                            }}
                                                                                            className="w-full py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-emerald-700 flex items-center justify-center gap-2"
                                                                                        >
                                                                                            <Zap size={14}/> 一键生成业务对象
                                                                                        </button>
                                                                                    );
                                                                                } else if (confidence >= 0.7) {
                                                                                    // 中置信度：显示"快速生成"按钮（蓝色）
                                                                                    return (
                                                                                        <button 
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                setShowGenerationWizard(true);
                                                                                                setWizardTable(table);
                                                                                                setWizardSemantic(semantic);
                                                                                            }}
                                                                                            className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-blue-700 flex items-center justify-center gap-2"
                                                                                        >
                                                                                            <Zap size={14}/> 快速生成业务对象
                                                                                        </button>
                                                                                    );
                                                                                } else {
                                                                                    // 低置信度：显示"生成业务对象向导"按钮（紫色）
                                                                                    return (
                                                                                        <button 
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                setShowGenerationWizard(true);
                                                                                                setWizardTable(table);
                                                                                                setWizardSemantic(semantic);
                                                                                            }}
                                                                                            className="w-full py-2 bg-purple-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-purple-700 flex items-center justify-center gap-2"
                                                                                        >
                                                                                            <Box size={14}/> 生成业务对象向导
                                                                                        </button>
                                                                                    );
                                                                                }
                                                                            })()}
                                                                            {/* 提示信息 */}
                                                                            {(() => {
                                                                                const confidence = semantic.confidence || 0;
                                                                                if (confidence > 0.9) {
                                                                                    return (
                                                                                        <p className="text-[10px] text-emerald-600 text-center">置信度较高，可直接生成</p>
                                                                                    );
                                                                                } else if (confidence >= 0.7) {
                                                                                    return (
                                                                                        <p className="text-[10px] text-blue-600 text-center">置信度中等，建议快速生成</p>
                                                                                    );
                                                                                } else {
                                                                                    return (
                                                                                        <p className="text-[10px] text-slate-500 text-center">置信度较低，建议使用向导</p>
                                                                                    );
                                                                                }
                                                                            })()}
                                                                            {/* 辅助按钮 */}
                                                                            <div className="flex gap-2">
                                                                        <button 
                                                                            onClick={() => {
                                                                                        setActiveModule('bu_identification');
                                                                            }}
                                                                                    className="flex-1 px-3 py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg shadow-sm hover:bg-emerald-700 flex items-center justify-center gap-1"
                                                                                    title="进入识别结果确认"
                                                                        >
                                                                                    <FileCheck size={14} />
                                                                        </button>
                                                                            </div>
                                                                        </div>
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
            
            {/* 表对比面板 */}
            {showComparisonPanel && selectedComparisonTables.size >= 2 && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowComparisonPanel(false)}>
                    <div className="bg-white rounded-xl shadow-2xl w-[90vw] h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Layers className="text-blue-500" size={20} />
                                表语义对比分析
                            </h3>
                            <button
                                onClick={() => setShowComparisonPanel(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-6">
                            <div className="grid grid-cols-3 gap-4">
                                {Array.from(selectedComparisonTables).map((tableId) => {
                                    const table = scanAssets.find((t: any) => t.id === tableId);
                                    if (!table) return null;
                                    return (
                                        <div key={tableId} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                                            <div className="font-bold text-slate-800 mb-2">{table.name}</div>
                                            <div className="text-xs text-slate-500 mb-3">{table.comment || '暂无注释'}</div>
                                            {table.semanticProfile ? (
                                                <div className="space-y-2">
                                                    <div>
                                                        <div className="text-xs text-slate-400 mb-1">业务名称</div>
                                                        <div className="text-sm font-medium text-slate-700">{table.semanticProfile.businessName}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-slate-400 mb-1">置信度</div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 bg-slate-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-purple-500 h-2 rounded-full"
                                                                    style={{ width: `${(table.semanticProfile.confidence || 0) * 100}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs text-slate-600">
                                                                {Math.round((table.semanticProfile.confidence || 0) * 100)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-slate-400 mb-1">聚类</div>
                                                        <div className="text-xs text-slate-600">{table.semanticProfile.clusterSuggestion}</div>
                                                    </div>
                                                    {table.semanticProfile.scenarios && (
                                                        <div>
                                                            <div className="text-xs text-slate-400 mb-1">场景</div>
                                                            <div className="flex flex-wrap gap-1">
                                                                {table.semanticProfile.scenarios.map((s: string, i: number) => (
                                                                    <span key={i} className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                                                                        {s}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-xs text-slate-400 text-center py-4">
                                                    未进行语义分析
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {/* 相似度分析 */}
                            <div className="mt-6 border-t border-slate-200 pt-6">
                                <h4 className="text-sm font-bold text-slate-700 mb-3">相似度分析</h4>
                                <div className="bg-slate-50 rounded-lg p-4">
                                    <div className="text-xs text-slate-600">
                                        {(() => {
                                            const tables = Array.from(selectedComparisonTables).map(id => scanAssets.find((t: any) => t.id === id));
                                            const clusters = tables.map((t: any) => t?.semanticProfile?.clusterSuggestion || getSimpleClusterName(t?.name || ''));
                                            const sameCluster = new Set(clusters).size === 1;
                                            return sameCluster 
                                                ? '✓ 这些表属于同一业务聚类，语义相似度较高'
                                                : '这些表分布在不同的业务聚类中，建议分别分析';
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* 生成业务对象向导 */}
            {showGenerationWizard && wizardTable && wizardSemantic && (
                <GenerateBusinessObjectWizard
                    isOpen={showGenerationWizard}
                    onClose={() => {
                        setShowGenerationWizard(false);
                        setWizardTable(null);
                        setWizardSemantic(null);
                    }}
                    identificationResult={convertToIdentificationResult(wizardTable, wizardSemantic)}
                    dataSource={dataSources.find((ds: any) => ds.id === wizardTable.sourceId)}
                    businessObjects={businessObjects}
                    setBusinessObjects={setBusinessObjects}
                    setActiveModule={setActiveModule}
                />
            )}
            
            {/* 一键生成加载提示 */}
            {isQuickGenerating && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mb-4"></div>
                            <h4 className="text-lg font-bold text-slate-800 mb-2">正在一键生成业务对象...</h4>
                            <p className="text-sm text-slate-500">请稍候</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// NOTE: BusinessModelingView has been extracted to src/components/semantic-layer/views/business/BusinessModelingView.tsx
// Old definition removed - using imported component instead


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
// NOTE: BusinessGoalsView has been extracted to src/components/semantic-layer/views/business/BusinessGoalsView.tsx
// Old definition removed - using imported component instead


// NOTE: ScenarioOrchestrationView has been extracted to src/components/semantic-layer/views/business/ScenarioOrchestrationView.tsx
// Old definition removed - using imported component instead

// NOTE: DataCatalogView has been extracted to src/components/semantic-layer/views/governance/DataCatalogView.tsx
// Old definition removed - using imported component instead
// NOTE: TermManagementView has been extracted to src/components/semantic-layer/views/governance/TermManagementView.tsx
// Old definition removed - using imported component instead

// NOTE: TagManagementView has been extracted to src/components/semantic-layer/views/governance/TagManagementView.tsx
// Old definition removed - using imported component instead

// ==========================================
// 生成业务对象向导组件 (3步向导)
// ==========================================
const GenerateBusinessObjectWizard = ({ 
    isOpen, 
    onClose, 
    identificationResult, 
    dataSource,
    businessObjects,
    setBusinessObjects,
    setActiveModule 
}: any) => {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [nameError, setNameError] = useState('');
    const [codeError, setCodeError] = useState('');
    const [fieldMappings, setFieldMappings] = useState<any[]>([]);
    const [options, setOptions] = useState({
        publishImmediately: false,
        createMapping: true,
        sendNotification: false
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState('');
    const [generatedBOId, setGeneratedBOId] = useState<string | null>(null);

    // ... more state and functions ...

    // 验证步骤1
    const validateStep1 = () => {
        let valid = true;
        if (!name.trim()) {
            setNameError('业务对象名称不能为空');
            valid = false;
        } else if (businessObjects.some((bo: any) => bo.name === name && bo.id !== generatedBOId)) {
            setNameError('业务对象名称已存在');
            valid = false;
        } else {
            setNameError('');
        }
        
        if (!code.trim()) {
            setCodeError('业务对象编码不能为空');
            valid = false;
        } else if (!/^[a-z][a-z0-9_]*$/.test(code)) {
            setCodeError('编码只能包含小写字母、数字和下划线，且必须以字母开头');
            valid = false;
        } else if (businessObjects.some((bo: any) => bo.code === code && bo.id !== generatedBOId)) {
            setCodeError('业务对象编码已存在');
            valid = false;
        } else {
            setCodeError('');
        }
        
        return valid;
    };

    // 下一步
    const handleNext = () => {
        if (step === 1) {
            if (!validateStep1()) return;
            setStep(2);
        } else if (step === 2) {
            if (fieldMappings.filter((f: any) => f.selected).length === 0) {
                alert('至少需要选择一个字段');
                return;
            }
            setStep(3);
        }
    };

    // 上一步
    const handlePrev = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    // 确认生成
    const handleConfirm = async () => {
        if (!validateStep1()) return;
        
        setIsGenerating(true);
        setGenerationProgress([
            { step: '创建业务对象定义', status: 'processing' },
            { step: '创建业务属性', status: 'pending' },
            { step: '建立字段映射关系', status: 'pending' },
            { step: '创建数据血缘', status: 'pending' },
            { step: '记录操作日志', status: 'pending' }
        ]);

        // 模拟生成过程
        const selectedFields = fieldMappings.filter((f: any) => f.selected);
        
        // 步骤1：创建业务对象定义
        await new Promise(resolve => setTimeout(resolve, 500));
        setGenerationProgress(prev => prev.map((p, i) => i === 0 ? { ...p, status: 'done' } : i === 1 ? { ...p, status: 'processing' } : p));
        
        // 步骤2：创建业务属性
        await new Promise(resolve => setTimeout(resolve, 600));
        setGenerationProgress(prev => prev.map((p, i) => i === 1 ? { ...p, status: 'done' } : i === 2 ? { ...p, status: 'processing' } : p));
        
        // 步骤3：建立字段映射关系
        await new Promise(resolve => setTimeout(resolve, 500));
        setGenerationProgress(prev => prev.map((p, i) => i === 2 ? { ...p, status: 'done' } : i === 3 ? { ...p, status: 'processing' } : p));
        
        // 步骤4：创建数据血缘
        await new Promise(resolve => setTimeout(resolve, 400));
        setGenerationProgress(prev => prev.map((p, i) => i === 3 ? { ...p, status: 'done' } : i === 4 ? { ...p, status: 'processing' } : p));
        
        // 步骤5：记录操作日志
        await new Promise(resolve => setTimeout(resolve, 300));
        setGenerationProgress(prev => prev.map((p, i) => i === 4 ? { ...p, status: 'done' } : p));

        // 创建业务对象
        const newBO = {
            id: `BO_${Date.now()}`,
            name: name,
            code: code,
            domain: options.domain || 'AI生成',
            owner: '待认领',
            status: options.publishImmediately ? 'published' : 'draft',
            version: 'v1.0',
            description: description,
            sourceTables: [identificationResult.tableName],
            fields: selectedFields.map((f: any, i: number) => ({
                id: `f_${i}`,
                name: f.businessName,
                code: f.field,
                type: f.businessType,
                length: '-',
                required: f.semanticRole === '标识',
                desc: f.businessDesc
            }))
        };
        
        setBusinessObjects([...businessObjects, newBO]);
        setGeneratedBOId(newBO.id);
        
        await new Promise(resolve => setTimeout(resolve, 300));
        setIsGenerating(false);
    };

    // 查看详情（跳转到业务对象建模页）
    const handleViewDetail = () => {
        setActiveModule('td_modeling');
        // 通过事件或全局状态传递生成的BO ID，让建模页自动选中
        setTimeout(() => {
            const event = new CustomEvent('selectBusinessObject', { detail: { id: generatedBOId } });
            window.dispatchEvent(event);
        }, 100);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-[90vw] max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* 头部 */}
                <div className="p-6 border-b border-slate-200 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Box className="text-purple-500" size={24} />
                            从识别结果生成业务对象
                        </h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                    </div>
                    {/* 步骤指示器 */}
                    <div className="flex items-center gap-2 mt-4">
                        {[1, 2, 3].map((s) => (
                            <React.Fragment key={s}>
                                <div className={`flex items-center gap-2 ${step >= s ? 'text-purple-600' : 'text-slate-400'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                        step > s ? 'bg-purple-600 border-purple-600 text-white' :
                                        step === s ? 'border-purple-600 bg-purple-50 text-purple-600' :
                                        'border-slate-300 bg-white text-slate-400'
                                    }`}>
                                        {step > s ? <Check size={18} /> : s}
                                    </div>
                                    <span className="text-sm font-medium">
                                        {s === 1 ? '基本信息' : s === 2 ? '字段映射' : '生成选项'}
                                    </span>
                                </div>
                                {s < 3 && <ChevronRight size={16} className="text-slate-300" />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* 内容区域 */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isGenerating ? (
                        // 生成中状态
                        <div className="space-y-4">
                            <div className="text-center py-8">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4"></div>
                                <h4 className="text-lg font-bold text-slate-800 mb-2">正在生成业务对象...</h4>
                                <p className="text-sm text-slate-500">预计剩余时间: {Math.max(0, (generationProgress.filter(p => p.status !== 'done').length - 1) * 0.5).toFixed(1)}秒</p>
                            </div>
                            <div className="space-y-2">
                                {generationProgress.map((p, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                        {p.status === 'done' && <CheckCircle className="text-emerald-500" size={20} />}
                                        {p.status === 'processing' && <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>}
                                        {p.status === 'pending' && <div className="w-5 h-5 border-2 border-slate-300 rounded-full"></div>}
                                        <span className={`text-sm ${p.status === 'done' ? 'text-slate-600' : p.status === 'processing' ? 'text-purple-600 font-medium' : 'text-slate-400'}`}>
                                            {p.step}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : generatedBOId ? (
                        // 生成成功状态
                        <div className="text-center py-8">
                            <CheckCircle className="text-emerald-500 mx-auto mb-4" size={64} />
                            <h4 className="text-xl font-bold text-slate-800 mb-2">业务对象生成成功！</h4>
                            <div className="bg-slate-50 rounded-lg p-4 mt-4 text-left max-w-md mx-auto space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-600">业务对象:</span>
                                    <span className="text-sm font-medium text-slate-800">{name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-600">业务属性:</span>
                                    <span className="text-sm font-medium text-slate-800">{fieldMappings.filter((f: any) => f.selected).length} 个</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-600">字段映射:</span>
                                    <span className="text-sm font-medium text-slate-800">{fieldMappings.filter((f: any) => f.selected).length} 条</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-600">数据血缘:</span>
                                    <span className="text-sm font-medium text-emerald-600">已建立</span>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-center mt-6">
                                <button
                                    onClick={handleViewDetail}
                                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                                >
                                    查看详情
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium"
                                >
                                    关闭
                                </button>
                            </div>
                        </div>
                    ) : (
                        // 步骤内容
                        <>
                            {step === 1 && (
                                <div className="space-y-4">
                                    <h4 className="text-lg font-bold text-slate-800 mb-4">步骤1：基本信息确认</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">业务对象名称 *</label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => { setName(e.target.value); setNameError(''); }}
                                                className={`w-full px-3 py-2 border rounded-lg ${nameError ? 'border-red-300' : 'border-slate-300'}`}
                                                placeholder="请输入业务对象名称"
                                            />
                                            {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">业务对象编码 *</label>
                                            <input
                                                type="text"
                                                value={code}
                                                onChange={(e) => { setCode(e.target.value.toLowerCase()); setCodeError(''); }}
                                                className={`w-full px-3 py-2 border rounded-lg font-mono text-sm ${codeError ? 'border-red-300' : 'border-slate-300'}`}
                                                placeholder="biz_xxx"
                                            />
                                            {codeError && <p className="text-xs text-red-500 mt-1">{codeError}</p>}
                                            <p className="text-xs text-slate-500 mt-1">编码只能包含小写字母、数字和下划线，且必须以字母开头</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">业务描述</label>
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                placeholder="请输入业务描述"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">来源表</label>
                                            <input
                                                type="text"
                                                value={identificationResult?.tableName || ''}
                                                disabled
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {step === 2 && (
                                <div className="space-y-4">
                                    <h4 className="text-lg font-bold text-slate-800 mb-4">步骤2：字段映射预览</h4>
                                    <div className="text-sm text-slate-600 mb-3">
                                        已选择: <span className="font-medium text-purple-600">{fieldMappings.filter((f: any) => f.selected).length}</span> 个字段
                                    </div>
                                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-3 py-2 text-left w-12">
                                                        <input
                                                            type="checkbox"
                                                            checked={fieldMappings.every((f: any) => f.selected)}
                                                            onChange={(e) => setFieldMappings(fieldMappings.map((f: any) => ({ ...f, selected: e.target.checked })))}
                                                            className="w-4 h-4"
                                                        />
                                                    </th>
                                                    <th className="px-3 py-2 text-left">物理字段</th>
                                                    <th className="px-3 py-2 text-left">语义角色</th>
                                                    <th className="px-3 py-2 text-left">业务属性名</th>
                                                    <th className="px-3 py-2 text-left">业务类型</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {fieldMappings.map((mapping: any, idx: number) => (
                                                    <tr key={idx} className={`border-t border-slate-100 ${!mapping.selected ? 'opacity-50' : ''}`}>
                                                        <td className="px-3 py-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={mapping.selected}
                                                                onChange={(e) => {
                                                                    const newMappings = [...fieldMappings];
                                                                    newMappings[idx].selected = e.target.checked;
                                                                    setFieldMappings(newMappings);
                                                                }}
                                                                className="w-4 h-4"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 font-mono text-slate-700">{mapping.field}</td>
                                                        <td className="px-3 py-2">
                                                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                                                                {mapping.semanticRole}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <input
                                                                type="text"
                                                                value={mapping.businessName}
                                                                onChange={(e) => {
                                                                    const newMappings = [...fieldMappings];
                                                                    newMappings[idx].businessName = e.target.value;
                                                                    setFieldMappings(newMappings);
                                                                }}
                                                                className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <select
                                                                value={mapping.businessType}
                                                                onChange={(e) => {
                                                                    const newMappings = [...fieldMappings];
                                                                    newMappings[idx].businessType = e.target.value;
                                                                    setFieldMappings(newMappings);
                                                                }}
                                                                className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                                                            >
                                                                <option value="String">String</option>
                                                                <option value="Integer">Integer</option>
                                                                <option value="Long">Long</option>
                                                                <option value="Decimal">Decimal</option>
                                                                <option value="Date">Date</option>
                                                                <option value="DateTime">DateTime</option>
                                                                <option value="Boolean">Boolean</option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                            
                            {step === 3 && (
                                <div className="space-y-4">
                                    <h4 className="text-lg font-bold text-slate-800 mb-4">步骤3：生成选项</h4>
                                    <div className="space-y-4">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={options.publishImmediately}
                                                onChange={(e) => setOptions({ ...options, publishImmediately: e.target.checked })}
                                                className="mt-1 w-4 h-4"
                                            />
                                            <div>
                                                <div className="font-medium text-slate-700">立即发布业务对象</div>
                                                <div className="text-xs text-slate-500 mt-1">生成后状态为"已发布"，否则为"草稿"</div>
                                            </div>
                                        </label>
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={options.createMapping}
                                                onChange={(e) => setOptions({ ...options, createMapping: e.target.checked })}
                                                className="mt-1 w-4 h-4"
                                            />
                                            <div>
                                                <div className="font-medium text-slate-700">创建物理表到业务对象的映射关系</div>
                                                <div className="text-xs text-slate-500 mt-1">在映射工作台中自动创建映射记录</div>
                                            </div>
                                        </label>
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={options.sendNotification}
                                                onChange={(e) => setOptions({ ...options, sendNotification: e.target.checked })}
                                                className="mt-1 w-4 h-4"
                                            />
                                            <div>
                                                <div className="font-medium text-slate-700">发送通知给相关人员</div>
                                                <div className="text-xs text-slate-500 mt-1">通知业务负责人新业务对象已创建</div>
                                            </div>
                                        </label>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">生成位置（业务域）</label>
                                            <input
                                                type="text"
                                                value={options.domain}
                                                onChange={(e) => setOptions({ ...options, domain: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                placeholder="可选，留空则在默认域"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* 底部按钮 */}
                {!isGenerating && !generatedBOId && (
                    <div className="p-6 border-t border-slate-200 flex justify-between flex-shrink-0">
                        <button
                            onClick={step === 1 ? onClose : handlePrev}
                            className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                        >
                            {step === 1 ? '取消' : '← 上一步'}
                        </button>
                        <button
                            onClick={step === 3 ? handleConfirm : handleNext}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                        >
                            {step === 3 ? '确认生成' : '下一步 →'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 视图: 识别结果确认 (Bottom-up 识别模块) ---
// NOTE: This component has been extracted to src/components/semantic-layer/views/discovery/IdentificationResultView.tsx
// Old definition removed - using imported component instead

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
        <div className="h-full flex flex-col p-6 gap-6 overflow-hidden">
            {/* 统计卡片 */}
            <div className="bg-white border border-slate-200 rounded-lg p-3 flex-shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">总表数：</span>
                        <span className="text-lg font-bold text-slate-800">{stats.total}</span>
                    </div>
                    <div className="h-6 w-px bg-slate-300"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-emerald-600">已接受：</span>
                        <span className="text-lg font-bold text-emerald-700">{stats.accepted}</span>
                    </div>
                    <div className="h-6 w-px bg-slate-300"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-yellow-600">待确认：</span>
                        <span className="text-lg font-bold text-yellow-700">{stats.pending}</span>
                    </div>
                    <div className="h-6 w-px bg-slate-300"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-orange-600">冲突项：</span>
                        <span className="text-lg font-bold text-orange-700">{stats.conflicts}</span>
                    </div>
                    <div className="h-6 w-px bg-slate-300"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-600">平均置信度：</span>
                        <span className="text-lg font-bold text-blue-700">{stats.avgConfidence}%</span>
                    </div>
                </div>
            </div>

            {/* 快速操作区 */}
            <div className="bg-white border border-slate-200 rounded-lg p-3 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-700 whitespace-nowrap">快速操作：</span>
                    <button
                        onClick={onNavigateToComparison}
                        className="px-4 py-2 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-2 text-sm font-medium text-emerald-700"
                    >
                        <FileCheck size={16} />
                        <span>识别结果对比</span>
                    </button>
                    <button
                        onClick={onNavigateToBatch}
                        className="px-4 py-2 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm font-medium text-blue-700"
                    >
                        <CheckSquare size={16} />
                        <span>批量确认</span>
                    </button>
                    <button
                        onClick={onNavigateToConflict}
                        className="px-4 py-2 bg-orange-50 border border-orange-300 rounded-lg hover:bg-orange-100 transition-colors flex items-center gap-2 text-sm font-medium text-orange-700"
                    >
                        <AlertTriangle size={16} />
                        <span>冲突解释</span>
                    </button>
                </div>
            </div>

            {/* 识别结果列表预览 */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col flex-1 min-h-0">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
                    <h3 className="text-lg font-bold text-slate-800">识别结果预览</h3>
                </div>
                <div className="flex-1 overflow-auto min-h-0">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">表名</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">对象建议</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">置信度</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">状态</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {results.map((result: any) => (
                                <tr key={result.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-mono text-sm whitespace-nowrap">{result.tableName}</td>
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
                                            <span className="text-xs text-slate-600 whitespace-nowrap">
                                                {Math.round((result.objectSuggestion?.confidence || 0) * 100)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {result.hasConflict && (
                                                <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">冲突</span>
                                            )}
                                            {result.needsConfirmation && (
                                                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">待确认</span>
                                            )}
                                            {result.objectSuggestion?.status === 'accepted' && (
                                                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">已接受</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={onNavigateToComparison}
                                            className="text-blue-600 text-sm hover:underline whitespace-nowrap"
                                        >
                                            查看详情
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// 子组件1: 识别结果对比页
const IdentificationComparisonTab = ({ results, setResults, dataSources, onNavigateToBatch, onNavigateToConflict, onGenerateBusinessObject }: any) => {
    const [selectedTableId, setSelectedTableId] = useState<string | null>(results[0]?.id || null);
    const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
    const [highlightedField, setHighlightedField] = useState<string | null>(null);
    const [filter, setFilter] = useState({ needsConfirm: false, hasConflict: false, sortBy: 'confidence' });
    const [showWhyExplanation, setShowWhyExplanation] = useState<Record<string, boolean>>({});
    const [showCandidateSuggestions, setShowCandidateSuggestions] = useState<Record<string, boolean>>({});
    const [candidateSuggestions, setCandidateSuggestions] = useState<Record<string, any[]>>({});
    const [isLoadingCandidates, setIsLoadingCandidates] = useState<Record<string, boolean>>({});
    
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
                                    {/* 生成业务对象按钮 */}
                                    {onGenerateBusinessObject && (
                                        <div className="mt-3 pt-3 border-t border-slate-200">
                                            <button
                                                onClick={() => onGenerateBusinessObject(selectedResult)}
                                                className="w-full py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                                            >
                                                <Box size={16} /> 生成业务对象
                                            </button>
                                        </div>
                                    )}
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

                                {/* 候选建议（辅助功能） */}
                                <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Sparkles size={16} className="text-purple-500" />
                                            <h4 className="text-sm font-bold text-slate-700">AI 候选建议</h4>
                                            <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded">辅助功能</span>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (showCandidateSuggestions[selectedResult.id]) {
                                                    setShowCandidateSuggestions({ ...showCandidateSuggestions, [selectedResult.id]: false });
                                                } else {
                                                    setIsLoadingCandidates({ ...isLoadingCandidates, [selectedResult.id]: true });
                                                    // 模拟AI分析过程
                                                    await new Promise(resolve => setTimeout(resolve, 1000));
                                                    // 生成候选建议
                                                    const suggestions = [
                                                        {
                                                            id: `CAND_${selectedResult.id}_1`,
                                                            suggestedName: `${selectedResult.objectSuggestion.name}记录`,
                                                            confidence: (selectedResult.objectSuggestion.confidence + 0.05),
                                                            reason: `基于当前识别结果"${selectedResult.objectSuggestion.name}"的进一步优化建议`,
                                                            alternativeNames: [
                                                                `${selectedResult.objectSuggestion.name}明细`,
                                                                `${selectedResult.objectSuggestion.name}信息`,
                                                                `${selectedResult.objectSuggestion.name}数据`
                                                            ]
                                                        }
                                                    ];
                                                    setCandidateSuggestions({ ...candidateSuggestions, [selectedResult.id]: suggestions });
                                                    setIsLoadingCandidates({ ...isLoadingCandidates, [selectedResult.id]: false });
                                                    setShowCandidateSuggestions({ ...showCandidateSuggestions, [selectedResult.id]: true });
                                                }
                                            }}
                                            className="text-xs px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-1"
                                        >
                                            {isLoadingCandidates[selectedResult.id] ? (
                                                <>
                                                    <RefreshCw size={12} className="animate-spin" /> 分析中...
                                                </>
                                            ) : showCandidateSuggestions[selectedResult.id] ? (
                                                '收起建议'
                                            ) : (
                                                <>
                                                    <Cpu size={12} /> 查看候选建议
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    {showCandidateSuggestions[selectedResult.id] && candidateSuggestions[selectedResult.id] && (
                                        <div className="space-y-3 mt-3">
                                            {candidateSuggestions[selectedResult.id].map((candidate: any) => (
                                                <div key={candidate.id} className="bg-white rounded-lg border border-purple-200 p-3">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex-1">
                                                            <h5 className="text-sm font-bold text-slate-800 mb-1">{candidate.suggestedName}</h5>
                                                            <p className="text-xs text-slate-600 mb-2">{candidate.reason}</p>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-slate-500">置信度:</span>
                                                                <div className="w-20 bg-slate-200 rounded-full h-1.5">
                                                                    <div
                                                                        className="bg-purple-500 h-1.5 rounded-full"
                                                                        style={{ width: `${candidate.confidence * 100}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-xs text-purple-600 font-medium">
                                                                    {Math.round(candidate.confidence * 100)}%
                                                                </span>
                                                            </div>
                                                            {candidate.alternativeNames && candidate.alternativeNames.length > 0 && (
                                                                <div className="mt-2">
                                                                    <div className="text-xs text-slate-500 mb-1">备选名称:</div>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {candidate.alternativeNames.map((name: string, idx: number) => (
                                                                            <span key={idx} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                                                                {name}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
                                                        <button
                                                            onClick={() => {
                                                                if (onGenerateBusinessObject) {
                                                                    // 使用候选建议生成业务对象
                                                                    const enhancedResult = {
                                                                        ...selectedResult,
                                                                        objectSuggestion: {
                                                                            ...selectedResult.objectSuggestion,
                                                                            name: candidate.suggestedName
                                                                        }
                                                                    };
                                                                    onGenerateBusinessObject(enhancedResult);
                                                                }
                                                            }}
                                                            className="flex-1 py-1.5 bg-purple-600 text-white text-xs font-medium rounded hover:bg-purple-700 flex items-center justify-center gap-1"
                                                        >
                                                            <Box size={12} /> 采用此建议生成
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setCandidateSuggestions({
                                                                    ...candidateSuggestions,
                                                                    [selectedResult.id]: candidateSuggestions[selectedResult.id].filter((c: any) => c.id !== candidate.id)
                                                                });
                                                            }}
                                                            className="px-3 py-1.5 border border-slate-300 text-slate-600 text-xs rounded hover:bg-slate-50"
                                                        >
                                                            忽略
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-xs text-slate-500 mt-2">
                                        💡 提示：候选建议是AI生成的辅助推荐，您可以采纳或忽略
                                    </p>
                                </div>
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
const BatchConfirmationTab = ({ results, setResults, selectedItems, setSelectedItems, filter, setFilter, onGenerateBusinessObject }: any) => {
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
                            {onGenerateBusinessObject && (
                                <button
                                    onClick={() => {
                                        if (selectedItems.size === 0) {
                                            alert('请先选择要生成业务对象的识别结果');
                                            return;
                                        }
                                        if (selectedItems.size === 1) {
                                            const result = results.find((r: any) => selectedItems.has(r.id));
                                            if (result) onGenerateBusinessObject(result);
                                        } else {
                                            alert(`批量生成功能：将为 ${selectedItems.size} 个识别结果分别生成业务对象。\n提示：目前仅支持单个生成，请逐个选择生成。`);
                                            const firstResult = results.find((r: any) => selectedItems.has(r.id));
                                            if (firstResult) onGenerateBusinessObject(firstResult);
                                        }
                                    }}
                                    disabled={selectedItems.size === 0}
                                    className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <Box size={16} /> 批量生成业务对象 ({selectedItems.size})
                                </button>
                            )}
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
const ConflictExplanationTab = ({ results, setResults, selectedConflict, setSelectedConflict, onNavigateToComparison, onGenerateBusinessObject }: any) => {
    const [selectedDecision, setSelectedDecision] = useState<'rule' | 'ai' | 'manual' | null>(null);
    const [manualSemanticRole, setManualSemanticRole] = useState('');
    const [decisionNote, setDecisionNote] = useState('');
    const [decisionHistory, setDecisionHistory] = useState<Record<string, any>>({});
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
    
    // 当切换冲突项时，重置决策状态
    useEffect(() => {
        if (currentConflict) {
            const conflictKey = `${currentConflict.tableId}_${currentConflict.field}`;
            const history = decisionHistory[conflictKey];
            if (history) {
                setSelectedDecision(history.decision);
                setManualSemanticRole(history.manualRole || '');
                setDecisionNote(history.note || '');
            } else {
                setSelectedDecision(null);
                setManualSemanticRole('');
                setDecisionNote('');
            }
        }
    }, [selectedConflict, decisionHistory]);
    
    // 计算推荐结果
    const getRecommendedDecision = (conflict: any) => {
        if (!conflict || !conflict.ruleJudgment) return 'ai';
        const aiConfidence = conflict.confidence || 0;
        const ruleConfidence = conflict.ruleJudgment.ruleConfidence || 0;
        // 如果AI置信度高于规则置信度5%以上，推荐AI，否则推荐规则
        return aiConfidence > ruleConfidence + 0.05 ? 'ai' : 'rule';
    };
    
    const recommendedDecision = currentConflict ? getRecommendedDecision(currentConflict) : 'ai';
    
    // 确认决策
    const handleConfirmDecision = () => {
        if (!currentConflict || !selectedDecision) {
            alert('请先选择决策方案');
            return;
        }
        
        if (selectedDecision === 'manual' && !manualSemanticRole.trim()) {
            alert('手动指定时，请填写语义角色');
            return;
        }
        
        const now = new Date().toLocaleString('zh-CN');
        const currentUser = '当前用户';
        const conflictKey = `${currentConflict.tableId}_${currentConflict.field}`;
        
        // 确定最终的语义角色
        let finalSemanticRole = currentConflict.semanticRole;
        if (selectedDecision === 'rule' && currentConflict.ruleJudgment) {
            finalSemanticRole = currentConflict.ruleJudgment.ruleResult;
        } else if (selectedDecision === 'manual') {
            finalSemanticRole = manualSemanticRole.trim();
        }
        
        // 更新识别结果
        setResults((prev: any[]) => prev.map((r: any) => {
            if (r.id === currentConflict.tableId) {
                return {
                    ...r,
                    fieldSuggestions: r.fieldSuggestions.map((f: any) => {
                        if (f.field === currentConflict.field) {
                            const auditTrail = {
                                recordBy: currentUser,
                                recordTime: now,
                                action: 'accept',
                                basis: selectedDecision === 'rule' ? 'rule' : selectedDecision === 'ai' ? 'ai' : 'manual',
                                originalAI: currentConflict.semanticRole,
                                originalRule: currentConflict.ruleJudgment?.ruleResult,
                                decision: selectedDecision,
                                note: decisionNote.trim() || undefined
                            };
                            return {
                                ...f,
                                semanticRole: finalSemanticRole,
                                status: 'accepted',
                                conflict: false, // 解决冲突
                                auditTrail: auditTrail
                            };
                        }
                        return f;
                    }),
                    hasConflict: r.fieldSuggestions.some((f: any) => 
                        f.field !== currentConflict.field && f.conflict
                    ) // 检查是否还有其他冲突
                };
            }
            return r;
        }));
        
        // 记录决策历史
        setDecisionHistory((prev: any) => ({
            ...prev,
            [conflictKey]: {
                decision: selectedDecision,
                manualRole: manualSemanticRole.trim(),
                note: decisionNote.trim(),
                timestamp: now,
                finalRole: finalSemanticRole
            }
        }));
        
        alert(`已确认决策：${selectedDecision === 'rule' ? '采用规则' : selectedDecision === 'ai' ? '采用AI' : '手动指定'} - ${finalSemanticRole}`);
        
        // 清空表单
        setSelectedDecision(null);
        setManualSemanticRole('');
        setDecisionNote('');
        
        // 如果有下一个冲突，自动切换到下一个
        const currentIndex = conflicts.findIndex((c: any) => `${c.tableId}_${c.field}` === conflictKey);
        if (currentIndex < conflicts.length - 1) {
            setSelectedConflict(`${conflicts[currentIndex + 1].tableId}_${conflicts[currentIndex + 1].field}`);
        } else if (currentIndex === conflicts.length - 1 && conflicts.length > 1) {
            setSelectedConflict(`${conflicts[0].tableId}_${conflicts[0].field}`);
        }
    };

    return (
        <div className="h-full flex flex-col p-6 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4 flex-shrink-0">
                <h3 className="text-lg font-bold text-slate-800 mb-4">冲突与解释</h3>
                <p className="text-sm text-slate-600">这是语义平台区别于普通自动建模工具的关键页面</p>
            </div>

            <div className="flex-1 flex gap-4 overflow-hidden">
                {/* 左栏：规则判断 */}
                <div className="w-80 bg-white border border-slate-200 rounded-lg flex flex-col overflow-hidden flex-shrink-0">
                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-700">规则判断</h4>
                        <span className="text-xs text-slate-500">共 {conflicts.length} 项冲突</span>
                    </div>
                    {currentConflict && currentConflict.ruleJudgment ? (
                        <div className="p-4 border-b border-slate-200 bg-blue-50 flex-shrink-0">
                            <div className="text-xs text-slate-600 mb-3 font-medium">当前冲突的规则判断：</div>
                            <div className="space-y-2 mb-3">
                                {currentConflict.ruleJudgment.rules.map((rule: any, idx: number) => (
                                    <div key={idx} className="p-2.5 bg-white rounded border border-blue-200 shadow-sm">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs font-mono text-blue-600 font-medium">{rule.id}</span>
                                            <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                                权重 {Math.round(rule.weight * 100)}%
                                            </span>
                                        </div>
                                        <div className="text-xs font-semibold text-slate-700 mb-1">{rule.name}</div>
                                        <div className="text-xs text-slate-600 mb-1.5 leading-relaxed">{rule.reason}</div>
                                        <div className="text-xs text-blue-600 font-medium">→ {rule.result}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-3 bg-white rounded border-2 border-blue-400 shadow-sm">
                                <div className="text-xs text-slate-600 mb-1.5 font-medium">规则综合判断：</div>
                                <div className="text-base font-bold text-blue-700 mb-1">{currentConflict.ruleJudgment.ruleResult}</div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full transition-all"
                                            style={{ width: `${currentConflict.ruleJudgment.ruleConfidence * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs text-slate-600 font-medium">
                                        {Math.round(currentConflict.ruleJudgment.ruleConfidence * 100)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                            当前冲突项暂无规则判断数据
                        </div>
                    )}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {conflicts.length === 0 ? (
                            <div className="text-center text-sm text-slate-400 py-8">
                                暂无冲突项
                            </div>
                        ) : (
                            conflicts.map((conflict: any, idx: number) => {
                                const conflictKey = `${conflict.tableId}_${conflict.field}`;
                                const history = decisionHistory[conflictKey];
                                const isSelected = selectedConflict === conflictKey;
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedConflict(conflictKey)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                            isSelected
                                                ? 'bg-orange-50 border-orange-400 shadow-sm'
                                                : 'bg-slate-50 border-slate-200 hover:border-orange-300 hover:shadow'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-1">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm text-slate-800 truncate">{conflict.tableName}</div>
                                                <div className="font-mono text-xs text-slate-600 truncate">{conflict.field}</div>
                                            </div>
                                            {history && (
                                                <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" title="已决策" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            {conflict.ruleJudgment && (
                                                <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                                                    规则: {conflict.ruleJudgment.ruleResult}
                                                </span>
                                            )}
                                            <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">
                                                AI: {conflict.semanticRole}
                                            </span>
                                        </div>
                                        {history && (
                                            <div className="mt-2 pt-2 border-t border-slate-200 text-xs text-slate-500">
                                                已决策: {history.finalRole}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* 中栏：AI 判断与对比 */}
                <div className="flex-1 bg-white border border-slate-200 rounded-lg flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50">
                        <h4 className="text-sm font-bold text-slate-700">AI 判断与对比</h4>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        {currentConflict ? (
                            <div className="space-y-6">
                                {/* 对比展示 */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* 规则判断 */}
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="text-xs text-blue-600 font-bold mb-2 uppercase">规则判断</div>
                                        {currentConflict.ruleJudgment ? (
                                            <>
                                                <div className="text-lg font-bold text-blue-700 mb-2">
                                                    {currentConflict.ruleJudgment.ruleResult}
                                                </div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="flex-1 bg-blue-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-500 h-2 rounded-full"
                                                            style={{ width: `${(currentConflict.ruleJudgment.ruleConfidence || 0) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs text-blue-600 font-medium">
                                                        {Math.round((currentConflict.ruleJudgment.ruleConfidence || 0) * 100)}%
                                                    </span>
                                                </div>
                                                <div className="text-xs text-blue-600 mt-2">
                                                    基于 {currentConflict.ruleJudgment.rules.length} 条规则
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-sm text-slate-400">暂无规则判断</div>
                                        )}
                                    </div>
                                    {/* AI判断 */}
                                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                        <div className="text-xs text-purple-600 font-bold mb-2 uppercase">AI 判断</div>
                                        <div className="text-lg font-bold text-purple-700 mb-2">
                                            {currentConflict.semanticRole}
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="flex-1 bg-purple-200 rounded-full h-2">
                                                <div
                                                    className="bg-purple-500 h-2 rounded-full"
                                                    style={{ width: `${currentConflict.confidence * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-purple-600 font-medium">
                                                {Math.round(currentConflict.confidence * 100)}%
                                            </span>
                                        </div>
                                        <div className="text-xs text-purple-600 mt-2">
                                            基于 AI 语义分析
                                        </div>
                                    </div>
                                </div>
                                
                                {/* 原文引用 */}
                                <div>
                                    <div className="text-xs uppercase text-slate-400 font-bold mb-2">原文引用</div>
                                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-500 w-16">表名：</span>
                                                <code className="flex-1 font-mono text-sm text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                                                    {currentConflict.tableName}
                                                </code>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-500 w-16">字段：</span>
                                                <code className="flex-1 font-mono text-sm text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                                                    {currentConflict.field}
                                                </code>
                                            </div>
                                            {currentConflict.objectSuggestion && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-slate-500 w-16">对象：</span>
                                                    <span className="flex-1 text-sm text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                                                        {currentConflict.objectSuggestion.name}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* AI 推理说明 */}
                                <div>
                                    <div className="text-xs uppercase text-slate-400 font-bold mb-2">AI 推理说明</div>
                                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                        <div className="text-sm text-slate-700 mb-3 font-medium">{currentConflict.aiExplanation}</div>
                                        {currentConflict.aiJudgment && (
                                            <>
                                                <div className="pt-3 border-t border-purple-200">
                                                    <div className="text-xs font-semibold text-purple-700 mb-2">详细分析：</div>
                                                    <div className="text-xs text-slate-700 leading-relaxed mb-3">
                                                        {currentConflict.aiJudgment.detailedExplanation}
                                                    </div>
                                                </div>
                                                <div className="pt-3 border-t border-purple-200">
                                                    <div className="text-xs font-semibold text-purple-700 mb-2">推理依据：</div>
                                                    <div className="text-xs text-slate-700 leading-relaxed">
                                                        {currentConflict.aiJudgment.reasoning}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                
                                {/* 规则详情（如果存在） */}
                                {currentConflict.ruleJudgment && currentConflict.ruleJudgment.rules.length > 0 && (
                                    <div>
                                        <div className="text-xs uppercase text-slate-400 font-bold mb-2">规则详情</div>
                                        <div className="space-y-2">
                                            {currentConflict.ruleJudgment.rules.map((rule: any, idx: number) => (
                                                <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-mono text-blue-600 font-medium">{rule.id}</span>
                                                        <span className="text-xs text-slate-500">权重 {Math.round(rule.weight * 100)}%</span>
                                                    </div>
                                                    <div className="text-xs font-semibold text-slate-700 mb-1">{rule.name}</div>
                                                    <div className="text-xs text-slate-600 leading-relaxed">{rule.reason}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
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
                                {/* 推荐结果 */}
                                <div>
                                    <div className="text-xs uppercase text-slate-400 font-bold mb-2">系统推荐</div>
                                    {recommendedDecision === 'rule' && currentConflict.ruleJudgment ? (
                                        <div className="p-3 bg-blue-50 border-2 border-blue-400 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded font-medium">推荐</span>
                                                <span className="font-bold text-blue-700">{currentConflict.ruleJudgment.ruleResult}</span>
                                            </div>
                                            <div className="text-xs text-blue-600 mt-1">
                                                规则置信度 ({Math.round((currentConflict.ruleJudgment.ruleConfidence || 0) * 100)}%) 
                                                高于 AI ({Math.round(currentConflict.confidence * 100)}%)
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-3 bg-purple-50 border-2 border-purple-400 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded font-medium">推荐</span>
                                                <span className="font-bold text-purple-700">{currentConflict.semanticRole}</span>
                                            </div>
                                            <div className="text-xs text-purple-600 mt-1">
                                                AI 置信度 ({Math.round(currentConflict.confidence * 100)}%) 
                                                {currentConflict.ruleJudgment 
                                                    ? `高于规则 (${Math.round((currentConflict.ruleJudgment.ruleConfidence || 0) * 100)}%)`
                                                    : '无规则判断'}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* 选择方案 */}
                                <div>
                                    <div className="text-xs uppercase text-slate-400 font-bold mb-2">选择方案</div>
                                    <div className="space-y-2">
                                        <button 
                                            onClick={() => setSelectedDecision('rule')}
                                            disabled={!currentConflict.ruleJudgment}
                                            className={`w-full p-3 text-left border-2 rounded-lg transition-all ${
                                                selectedDecision === 'rule'
                                                    ? 'border-blue-500 bg-blue-100 shadow-sm'
                                                    : 'border-blue-300 bg-blue-50 hover:bg-blue-100'
                                            } ${!currentConflict.ruleJudgment ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                    selectedDecision === 'rule' ? 'border-blue-500 bg-blue-500' : 'border-blue-300'
                                                }`}>
                                                    {selectedDecision === 'rule' && <CheckCircle size={12} className="text-white" />}
                                                </div>
                                                <span className="font-medium text-sm text-slate-800">采用规则</span>
                                            </div>
                                            <div className="text-xs text-slate-500 ml-6">
                                                {currentConflict.ruleJudgment 
                                                    ? `使用规则判断: ${currentConflict.ruleJudgment.ruleResult} (${Math.round((currentConflict.ruleJudgment.ruleConfidence || 0) * 100)}%)`
                                                    : '暂无规则判断'}
                                            </div>
                                        </button>
                                        <button 
                                            onClick={() => setSelectedDecision('ai')}
                                            className={`w-full p-3 text-left border-2 rounded-lg transition-all ${
                                                selectedDecision === 'ai'
                                                    ? 'border-purple-500 bg-purple-100 shadow-sm'
                                                    : 'border-purple-300 bg-purple-50 hover:bg-purple-100'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                    selectedDecision === 'ai' ? 'border-purple-500 bg-purple-500' : 'border-purple-300'
                                                }`}>
                                                    {selectedDecision === 'ai' && <CheckCircle size={12} className="text-white" />}
                                                </div>
                                                <span className="font-medium text-sm text-slate-800">采用 AI</span>
                                                {recommendedDecision === 'ai' && (
                                                    <span className="text-xs bg-purple-500 text-white px-1.5 py-0.5 rounded">推荐</span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-500 ml-6">
                                                使用 AI 判断: {currentConflict.semanticRole} ({Math.round(currentConflict.confidence * 100)}%)
                                            </div>
                                        </button>
                                        <button 
                                            onClick={() => setSelectedDecision('manual')}
                                            className={`w-full p-3 text-left border-2 rounded-lg transition-all ${
                                                selectedDecision === 'manual'
                                                    ? 'border-slate-500 bg-slate-100 shadow-sm'
                                                    : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                    selectedDecision === 'manual' ? 'border-slate-500 bg-slate-500' : 'border-slate-300'
                                                }`}>
                                                    {selectedDecision === 'manual' && <CheckCircle size={12} className="text-white" />}
                                                </div>
                                                <span className="font-medium text-sm text-slate-800">手动指定</span>
                                            </div>
                                            <div className="text-xs text-slate-500 ml-6">自定义语义角色</div>
                                        </button>
                                    </div>
                                </div>
                                
                                {/* 手动指定输入 */}
                                {selectedDecision === 'manual' && (
                                    <div>
                                        <div className="text-xs uppercase text-slate-400 font-bold mb-2">自定义语义角色</div>
                                        <input
                                            type="text"
                                            value={manualSemanticRole}
                                            onChange={(e) => setManualSemanticRole(e.target.value)}
                                            className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                                            placeholder="例如：支付行为、状态对象等"
                                        />
                                        <div className="text-xs text-slate-400 mt-1">
                                            请填写合适的语义角色名称
                                        </div>
                                    </div>
                                )}
                                
                                {/* 决策说明 */}
                                <div>
                                    <div className="text-xs uppercase text-slate-400 font-bold mb-2">决策说明（可选）</div>
                                    <textarea
                                        value={decisionNote}
                                        onChange={(e) => setDecisionNote(e.target.value)}
                                        className="w-full p-3 border border-slate-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-400"
                                        rows={3}
                                        placeholder="填写决策依据、备注信息等..."
                                    ></textarea>
                                </div>
                                
                                {/* 确认按钮 */}
                                <button 
                                    onClick={handleConfirmDecision}
                                    disabled={!selectedDecision || (selectedDecision === 'manual' && !manualSemanticRole.trim())}
                                    className={`w-full py-2.5 text-white text-sm font-medium rounded-lg transition-all ${
                                        selectedDecision && (selectedDecision !== 'manual' || manualSemanticRole.trim())
                                            ? 'bg-emerald-600 hover:bg-emerald-700 shadow-sm hover:shadow'
                                            : 'bg-slate-300 cursor-not-allowed'
                                    }`}
                                >
                                    确认决策
                                </button>
                                
                                {/* 生成业务对象按钮 - 冲突解决后显示 */}
                                {onGenerateBusinessObject && decisionHistory[`${currentConflict.tableId}_${currentConflict.field}`] && (
                                    <div className="pt-4 border-t border-slate-200">
                                        <button
                                            onClick={() => {
                                                const result = results.find((r: any) => r.id === currentConflict.tableId);
                                                if (result) onGenerateBusinessObject(result);
                                            }}
                                            className="w-full py-2.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 shadow-sm hover:shadow flex items-center justify-center gap-2"
                                        >
                                            <Box size={16} /> 生成业务对象
                                        </button>
                                        <p className="text-xs text-slate-500 text-center mt-2">冲突已解决，可以生成业务对象</p>
                                    </div>
                                )}
                                
                                {/* 已决策历史（如果有） */}
                                {decisionHistory[`${currentConflict.tableId}_${currentConflict.field}`] && (
                                    <div className="pt-4 border-t border-slate-200">
                                        <div className="text-xs uppercase text-slate-400 font-bold mb-2">决策历史</div>
                                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                            <div className="text-xs text-green-700">
                                                <div className="font-medium mb-1">已决策: {decisionHistory[`${currentConflict.tableId}_${currentConflict.field}`].finalRole}</div>
                                                <div className="text-slate-600">
                                                    方案: {
                                                        decisionHistory[`${currentConflict.tableId}_${currentConflict.field}`].decision === 'rule' ? '采用规则' :
                                                        decisionHistory[`${currentConflict.tableId}_${currentConflict.field}`].decision === 'ai' ? '采用AI' : '手动指定'
                                                    }
                                                </div>
                                                {decisionHistory[`${currentConflict.tableId}_${currentConflict.field}`].note && (
                                                    <div className="text-slate-600 mt-1">
                                                        说明: {decisionHistory[`${currentConflict.tableId}_${currentConflict.field}`].note}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
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
                    businessObjects={businessObjects}
                    setBusinessObjects={setBusinessObjects}
                    GenerateBusinessObjectWizard={GenerateBusinessObjectWizard}
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
            case 'term_management':
                return <TermManagementView />;
            case 'tag_management':
                return <TagManagementView />;
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