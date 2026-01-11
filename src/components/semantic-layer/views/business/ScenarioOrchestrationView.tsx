// ==========================================
// Scenario Orchestration View (TD-04)
// ==========================================
// Location: tt5.tsx:3065-3438

import React, { useState } from 'react';
import {
    Layers, Plus, Search, Box, MousePointer, Move, ZoomIn, ZoomOut,
    Play, Save, Settings, MoreHorizontal, CheckCircle, RefreshCw, X, Link
} from 'lucide-react';
import { BusinessObject } from '../../types';

interface ScenarioOrchestrationViewProps {
    businessObjects: BusinessObject[];
}

interface ScenarioNode {
    id: string;
    type: 'start' | 'end' | 'action' | 'object';
    label: string;
    objectId: string | null;
    status: 'done' | 'process' | 'pending';
    x: number;
    y: number;
}

interface ScenarioEdge {
    from: string;
    to: string;
    label: string;
}

interface Scenario {
    id: string;
    name: string;
    status: 'active' | 'draft';
    description: string;
    involvedObjects: string[];
    nodes: ScenarioNode[];
    edges: ScenarioEdge[];
}

export const ScenarioOrchestrationView: React.FC<ScenarioOrchestrationViewProps> = ({ businessObjects }) => {
    const [activeScenarioId, setActiveScenarioId] = useState('SC_001');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newScenario, setNewScenario] = useState({
        name: '',
        description: '',
        involvedObjects: [] as string[]
    });

    // 模拟场景数据
    const mockScenarios: Scenario[] = [
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

    const [scenarios, setScenarios] = useState<Scenario[]>(mockScenarios);
    const activeScenario = scenarios.find(s => s.id === activeScenarioId) || scenarios[0];

    const handleSaveScenario = () => {
        if (!newScenario.name) return;
        const scenarioData: Scenario = {
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
                                const matchedBO = businessObjects.find((bo) => bo.id === node.objectId);
                                const isLast = idx === activeScenario.nodes.length - 1;
                                const edge = activeScenario.edges.find((e) => e.from === node.id);

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
                        {businessObjects.map((bo) => (
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
                                    {businessObjects.map((bo) => (
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

export default ScenarioOrchestrationView;
