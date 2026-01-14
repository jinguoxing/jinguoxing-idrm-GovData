// ==========================================
// Identification Result View (BU-05)
// ==========================================
// Location: Extracted from tt5.tsx:5762-6159
// Main component for identification result confirmation

import React, { useState } from 'react';
import { FileCheck } from 'lucide-react';
import { IdentificationOverviewTab } from './IdentificationOverviewTab';
import { IdentificationComparisonTab } from './IdentificationComparisonTab';
import { BatchConfirmationTab } from './BatchConfirmationTab';
import { ConflictExplanationTab } from './ConflictExplanationTab';

// Temporary inline components until full extraction is complete
// These will be moved to separate files

interface IdentificationResultViewProps {
    setActiveModule: (module: string) => void;
    dataSources: any[];
    scanAssets: any[];
    setScanAssets: (assets: any[]) => void;
    businessObjects: any[];
    setBusinessObjects: (objects: any[]) => void;
    GenerateBusinessObjectWizard?: React.ComponentType<any>; // Passed from parent
}

export const IdentificationResultView: React.FC<IdentificationResultViewProps> = ({
    setActiveModule,
    dataSources,
    scanAssets,
    setScanAssets,
    businessObjects,
    setBusinessObjects,
    GenerateBusinessObjectWizard
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'comparison' | 'batch' | 'conflict'>('overview');
    
    // 模拟识别结果数据 - 完整数据列表
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
    
    // 生成向导相关状态
    const [showGenerationWizard, setShowGenerationWizard] = useState(false);
    const [wizardResult, setWizardResult] = useState<any>(null);

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
                        onGenerateBusinessObject={(result: any) => {
                            setWizardResult(result);
                            setShowGenerationWizard(true);
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
                        onGenerateBusinessObject={(result: any) => {
                            setWizardResult(result);
                            setShowGenerationWizard(true);
                        }}
                    />
                )}
                {activeTab === 'conflict' && (
                    <ConflictExplanationTab
                        results={identificationResults}
                        setResults={setIdentificationResults}
                        selectedConflict={selectedConflict}
                        setSelectedConflict={setSelectedConflict}
                        onNavigateToComparison={() => setActiveTab('comparison')}
                        onGenerateBusinessObject={(result: any) => {
                            setWizardResult(result);
                            setShowGenerationWizard(true);
                        }}
                    />
                )}
            </div>
            
            {/* 生成业务对象向导 */}
            {showGenerationWizard && wizardResult && GenerateBusinessObjectWizard && (
                <GenerateBusinessObjectWizard
                    isOpen={showGenerationWizard}
                    onClose={() => {
                        setShowGenerationWizard(false);
                        setWizardResult(null);
                    }}
                    identificationResult={wizardResult}
                    dataSource={dataSources.find((ds: any) => ds.id === wizardResult.sourceId)}
                    businessObjects={businessObjects}
                    setBusinessObjects={setBusinessObjects}
                    setActiveModule={setActiveModule}
                />
            )}
        </div>
    );
};
