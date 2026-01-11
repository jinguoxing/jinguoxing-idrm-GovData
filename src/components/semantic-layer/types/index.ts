// ==========================================
// Types for Semantic Layer Application
// ==========================================

// Business Goal Types
export interface BusinessGoal {
    id: string;
    title: string;
    type: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'modeling' | 'planning' | 'implemented';
    progress: number;
    owner: string;
    lastUpdate: string;
    description: string;
    relatedObjects: string[];
    stages: {
        policy: boolean;
        object: boolean;
        scenario: boolean;
    };
}

// Business Object Types
export interface BusinessObject {
    id: string;
    name: string;
    code: string;
    domain: string;
    owner: string;
    status: 'published' | 'draft' | 'archived';
    version: string;
    description: string;
    sourceTables: string[];
    fields: BusinessObjectField[];
}

export interface BusinessObjectField {
    id: string;
    name: string;
    code: string;
    type: string;
    length: string;
    required: boolean;
    desc: string;
}

// Scenario Types
export interface Scenario {
    id: string;
    name: string;
    status: 'active' | 'draft' | 'archived';
    description: string;
    nodes: ScenarioNode[];
    edges: ScenarioEdge[];
}

export interface ScenarioNode {
    id: string;
    type: 'start' | 'end' | 'action' | 'object';
    label: string;
    objectId: string | null;
    status: 'done' | 'process' | 'pending';
}

export interface ScenarioEdge {
    from: string;
    to: string;
    label: string;
}

// Data Source Types
export interface DataSource {
    id: string;
    name: string;
    type: string;
    host: string;
    port: number;
    dbName: string;
    status: 'connected' | 'scanning' | 'error' | 'disconnected';
    lastScan: string;
    tableCount: number;
    desc: string;
}

// Scan Asset Types
export interface ScanAsset {
    id: string;
    sourceId: string;
    name: string;
    comment: string;
    rows: string;
    updateTime: string;
    status: 'normal' | 'new' | 'changed' | 'error';
    columns: ScanAssetColumn[];
}

export interface ScanAssetColumn {
    name: string;
    type: string;
    comment: string;
}

// Physical Table Types
export interface PhysicalTable {
    id: string;
    name: string;
    source: string;
    scannedAt: string;
    rows: string;
    fields: PhysicalTableField[];
}

export interface PhysicalTableField {
    name: string;
    type: string;
    key?: string;
}

// Mapping Types
export interface Mapping {
    boField: string;
    tblField: string;
    rule: string;
}

// AI Candidate Types
export interface AICandidate {
    id: string;
    sourceTable: string;
    suggestedName: string;
    confidence: number;
    reason: string;
    scores: {
        nameMatch: number;
        fieldMatch: number;
        dataSample: number;
    };
    mappedFields: number;
    status: 'pending' | 'accepted' | 'ignored';
    previewFields: AIPreviewField[];
}

export interface AIPreviewField {
    col: string;
    type: string;
    attr: string;
    conf: 'High' | 'Medium' | 'Low';
}

// Conflict Types
export interface Conflict {
    id: string;
    severity: 'High' | 'Medium' | 'Low';
    type: string;
    title: string;
    desc: string;
    objectName: string;
    assetName: string;
    detectedAt: string;
    status: 'Open' | 'Resolved' | 'Ignored';
}

// Catalog Asset Types
export interface CatalogAsset {
    id: string;
    name: string;
    type: 'Business Object' | 'Physical Table' | 'Mapping';
    code: string;
    owner: string;
    quality: number;
    status: string;
    tags: string[];
    desc: string;
    stats: string;
}

// API Service Types
export interface ApiService {
    id: string;
    name: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    objectName: string;
    status: 'Online' | 'Offline';
    qps: number;
    latency: string;
    errorRate: string;
}

// Cache Policy Types
export interface CachePolicy {
    id: string;
    name: string;
    target: string;
    type: string;
    ttl: string;
    eviction: string;
    status: 'Active' | 'Inactive';
}

export interface CacheKey {
    key: string;
    size: string;
    created: string;
    expires: string;
    hits: number;
}

// Lineage Types
export interface LineageNode {
    id: string;
    label: string;
    type: 'source' | 'table' | 'object' | 'api';
}

export interface LineageEdge {
    from: string;
    to: string;
}

export interface LineageData {
    nodes: LineageNode[];
    edges: LineageEdge[];
}

// Module Types
export type ModuleType =
    | 'td_goals'
    | 'td_modeling'
    | 'td_scenario'
    | 'bu_discovery'
    | 'bu_identification'
    | 'bu_semantic'
    | 'sg_mapping'
    | 'sg_conflict'
    | 'sg_catalog'
    | 'sg_term'
    | 'sg_tag'
    | 'sg_lineage'
    | 'ee_gateway'
    | 'ee_cache';

// Component Props Types
export interface SidebarProps {
    activeModule: ModuleType | null;
    setActiveModule: (module: ModuleType) => void;
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

export interface HeaderProps {
    activeModule: ModuleType | null;
    showAssistant: boolean;
    setShowAssistant: (show: boolean) => void;
}

export interface AIAssistantPanelProps {
    visible: boolean;
    onClose: () => void;
    activeModule: ModuleType | null;
    contextData?: any;
}

export interface StatCardProps {
    label: string;
    value: string | number;
    trend?: string;
    icon: any;
    color: 'blue' | 'emerald' | 'purple' | 'orange' | 'red';
}

export interface StepItemProps {
    status: 'done' | 'process' | 'pending';
    text: string;
}

export interface ScoreBarProps {
    label: string;
    score: number;
}
