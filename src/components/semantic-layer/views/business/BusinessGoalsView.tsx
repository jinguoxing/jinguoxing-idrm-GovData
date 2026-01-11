// ==========================================
// Business Goals View (TD-01)
// ==========================================
// Location: tt5.tsx:2793-3062

import React, { useState } from 'react';
import {
    Upload, Plus, ChevronRight, Play, Edit, Trash2, X,
    FileText, Box, Layers, ArrowRight
} from 'lucide-react';
import { ModuleType } from '../../types';

interface BusinessGoalsViewProps {
    setActiveModule: (module: ModuleType) => void;
}

interface Goal {
    id: string;
    title: string;
    type: string;
    priority: 'High' | 'Medium' | 'Low';
    status: string;
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

export const BusinessGoalsView: React.FC<BusinessGoalsViewProps> = ({ setActiveModule }) => {
    const [goals, setGoals] = useState<Goal[]>([
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
        const goalData: Goal = {
            id: `G_${Date.now()}`,
            ...newGoal,
            priority: newGoal.priority as 'High' | 'Medium' | 'Low',
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

export default BusinessGoalsView;
