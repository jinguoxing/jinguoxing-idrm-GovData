import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Layout,
  Database,
  BrainCircuit,
  GitMerge,
  Settings,
  CheckCircle,
  AlertCircle,
  FileText,
  ChevronRight,
  Plus,
  Search,
  User,
  Bot,
  ArrowRight,
  Layers,
  Box,
  Share2,
  Workflow,
  Table as TableIcon,
  Server,
  Building2,
  MoreHorizontal
} from "lucide-react";

// Types for our mock data
interface Fact {
  id: string;
  content: string;
  type: "主体" | "行为" | "状态";
  source: string;
  status: "confirmed" | "ai_suggested" | "pending";
  confidence?: number;
}

interface BusinessObject {
  id: string;
  name: string;
  type: "ENTITY" | "EVENT" | "SNAPSHOT";
  description: string;
  status: "stable" | "draft";
  attributes: string[];
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  involvedObjects: string[]; // Object IDs
  steps: { order: number; action: string; objectId?: string }[];
}

interface SystemMapping {
  id: string;
  objectId: string;
  objectName: string;
  system: string;
  physicalTable: string;
  ownerDepartment: string;
  status: "mapped" | "conflict" | "pending";
  lastSync: string;
}

const App = () => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "l0" | "l1" | "l2" | "l3">("dashboard");
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);

  // Mock Data for L0
  const [facts, setFacts] = useState<Fact[]>([
    { id: "F001", content: "客户下单购买商品", type: "行为", source: "订单系统文档", status: "confirmed", confidence: 0.98 },
    { id: "F002", content: "商品库存扣减", type: "状态", source: "库存规则 V1.0", status: "confirmed", confidence: 0.95 },
    { id: "F003", content: "会员等级提升", type: "状态", source: "会员权益说明", status: "ai_suggested", confidence: 0.85 },
    { id: "F004", content: "支付流水生成", type: "主体", source: "支付接口定义", status: "ai_suggested", confidence: 0.82 },
  ]);

  // Mock Data for L1
  const [objects, setObjects] = useState<BusinessObject[]>([
    { id: "BO01", name: "客户订单", type: "EVENT", description: "记录客户的交易行为核心单据", status: "stable", attributes: ["订单号", "下单时间", "总金额"] },
    { id: "BO02", name: "商品 SKU", type: "ENTITY", description: "最小库存单位", status: "stable", attributes: ["SKU编码", "名称", "规格"] },
    { id: "BO03", name: "会员账户快照", type: "SNAPSHOT", description: "每日日终会员资产状态", status: "draft", attributes: ["余额", "积分", "快照日期"] },
    { id: "BO04", name: "支付流水", type: "EVENT", description: "第三方支付系统的资金变动记录", status: "draft", attributes: ["流水号", "金额", "渠道"] },
  ]);

  // Mock Data for L2
  const [scenarios, setScenarios] = useState<Scenario[]>([
    { 
      id: "S001", 
      name: "C端下单全流程", 
      description: "用户从浏览商品到完成下单支付的全链路语义模型", 
      involvedObjects: ["BO01", "BO02", "BO04"],
      steps: [
        { order: 1, action: "用户选择商品", objectId: "BO02" },
        { order: 2, action: "创建待支付订单", objectId: "BO01" },
        { order: 3, action: "完成支付生成流水", objectId: "BO04" },
        { order: 4, action: "更新订单状态", objectId: "BO01" }
      ]
    },
    { 
      id: "S002", 
      name: "会员积分结算", 
      description: "日终根据交易情况计算会员积分变动", 
      involvedObjects: ["BO03", "BO01"],
      steps: [
        { order: 1, action: "汇总当日订单", objectId: "BO01" },
        { order: 2, action: "计算积分增量", objectId: "BO03" },
        { order: 3, action: "生成账户快照", objectId: "BO03" }
      ]
    }
  ]);

  // Mock Data for L3
  const [mappings, setMappings] = useState<SystemMapping[]>([
    { id: "M001", objectId: "BO01", objectName: "客户订单", system: "交易中心 (Trade)", physicalTable: "t_trade_order_master", ownerDepartment: "交易中台部", status: "mapped", lastSync: "2023-10-24" },
    { id: "M002", objectId: "BO02", objectName: "商品 SKU", system: "商品中心 (Item)", physicalTable: "t_item_sku_base", ownerDepartment: "供应链产研", status: "mapped", lastSync: "2023-10-23" },
    { id: "M003", objectId: "BO03", objectName: "会员账户快照", system: "会员系统 (Member)", physicalTable: "t_mb_asset_snapshot_daily", ownerDepartment: "用户增长部", status: "conflict", lastSync: "2023-10-20" },
    { id: "M004", objectId: "BO04", objectName: "支付流水", system: "支付网关 (Pay)", physicalTable: "未关联", ownerDepartment: "待定", status: "pending", lastSync: "-" },
  ]);

  // Sidebar Component
  const Sidebar = () => (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 flex-shrink-0">
      <div className="p-6 flex items-center space-x-3 text-white border-b border-slate-800">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">SM</div>
        <span className="font-semibold text-lg tracking-tight">语义建模平台</span>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        <NavItem 
          icon={<Layout size={20} />} 
          label="工作台概览" 
          active={activeTab === "dashboard"} 
          onClick={() => setActiveTab("dashboard")} 
        />
        <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">核心建模流程</div>
        <NavItem 
          icon={<FileText size={20} />} 
          label="L0 业务事实梳理" 
          active={activeTab === "l0"} 
          onClick={() => setActiveTab("l0")} 
        />
        <NavItem 
          icon={<Box size={20} />} 
          label="L1 业务对象建模" 
          active={activeTab === "l1"} 
          onClick={() => setActiveTab("l1")} 
        />
        <NavItem 
          icon={<Layers size={20} />} 
          label="L2 场景语义建模" 
          active={activeTab === "l2"} 
          onClick={() => setActiveTab("l2")} 
        />
        <NavItem 
          icon={<Share2 size={20} />} 
          label="L3 系统与部门映射" 
          active={activeTab === "l3"} 
          onClick={() => setActiveTab("l3")} 
        />
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center space-x-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
            EXP
          </div>
          <div>
            <div className="text-sm font-medium text-white">业务专家</div>
            <div className="text-xs text-slate-500">Admin</div>
          </div>
        </div>
        <button className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-sm transition-colors">
          <Settings size={16} />
          <span>平台设置</span>
        </button>
      </div>
    </div>
  );

  const NavItem = ({ icon, label, active, onClick, badge }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active 
          ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" 
          : "hover:bg-slate-800 text-slate-400 hover:text-white"
      }`}
    >
      <div className="flex items-center space-x-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge && <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">{badge}</span>}
      {active && <ChevronRight size={16} className="text-blue-200" />}
    </button>
  );

  // Dashboard View
  const DashboardView = () => (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">欢迎回来，业务专家</h1>
          <p className="text-slate-500 mt-1">这里是 Top-down + Bottom-up 双向语义建模控制台。</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm">
            <Database size={16} />
            <span>数据资产概览</span>
          </button>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-200">
            <Plus size={16} />
            <span>新建项目</span>
          </button>
        </div>
      </div>

      {/* Methodology Visualization */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
          <BrainCircuit className="w-5 h-5 mr-2 text-blue-600" />
          核心方法论流程
        </h2>
        <div className="relative">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
          
          <div className="grid grid-cols-4 gap-4 relative z-10">
            {[
              { code: "L0", title: "业务事实梳理", desc: "主体/行为/状态事实", color: "blue", action: () => setActiveTab("l0") },
              { code: "L1", title: "业务对象建模", desc: "Entity/Event/Snapshot", color: "indigo", action: () => setActiveTab("l1") },
              { code: "L2", title: "场景语义建模", desc: "业务场景语义对齐", color: "purple", action: () => setActiveTab("l2") },
              { code: "L3", title: "系统映射", desc: "落地到物理表与部门", color: "slate", action: () => setActiveTab("l3") },
            ].map((step, idx) => (
              <div onClick={step.action} key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group hover:border-blue-300">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold mb-3 bg-${step.color}-600`}>
                  {step.code}
                </div>
                <h3 className="font-bold text-slate-800">{step.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{step.desc}</p>
                {idx < 3 && (
                  <div className="absolute right-0 top-1/2 -mr-6 -mt-3 text-slate-300 hidden md:block">
                    <ArrowRight size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-blue-600">L0 业务事实</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">1,248</h3>
              <p className="text-xs text-slate-500 mt-1">待确认建议: 12</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <FileText size={24} />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-indigo-600">L1 业务对象</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">86</h3>
              <p className="text-xs text-slate-500 mt-1">本周新增: 4</p>
            </div>
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <Box size={24} />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-purple-600">AI 增强建议</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">98%</h3>
              <p className="text-xs text-slate-500 mt-1">采纳率</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              <Bot size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // L0 View
  const L0View = () => (
    <div className="p-6 h-full flex flex-col">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center">
            <span className="bg-blue-100 text-blue-700 text-sm font-bold px-2 py-1 rounded mr-3">L0</span>
            业务事实梳理
          </h2>
          <p className="text-sm text-slate-500 mt-1">支持业务事项定义、主体/行为/状态事实梳理。AI 自动识别事实候选。</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-sm">
          <Bot size={16} className="mr-2" />
          AI 自动扫描文档
        </button>
      </header>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Input Area */}
        <div className="w-1/3 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm h-full">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
            <h3 className="font-semibold text-slate-700">业务原始语料</h3>
            <span className="text-xs text-slate-400">支持 PDF/Word/Text</span>
          </div>
          <textarea 
            className="flex-1 p-4 resize-none focus:outline-none text-sm text-slate-600 leading-relaxed font-mono"
            placeholder="请在此输入业务描述文本，例如：当用户在APP端完成下单操作后，订单系统会生成一条待支付订单，同时锁定商品库存..."
            defaultValue={`当用户在APP端完成下单操作后，订单系统会生成一条待支付订单，同时锁定商品库存。
若用户在30分钟内完成支付，系统更新订单状态为已支付，并触发发货流程。
如果支付超时，系统自动取消订单并释放库存。`}
          ></textarea>
           <div className="p-3 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end">
             <button className="text-blue-600 text-sm font-medium hover:bg-blue-50 px-3 py-1 rounded">开始识别 &rarr;</button>
           </div>
        </div>

        {/* List Area */}
        <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm h-full overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-slate-700">识别结果 (Facts)</h3>
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{facts.length}</span>
            </div>
            <div className="flex space-x-2">
              <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400"><Search size={16}/></button>
              <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400"><Settings size={16}/></button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">事实内容</th>
                  <th className="px-4 py-3">类型</th>
                  <th className="px-4 py-3">来源</th>
                  <th className="px-4 py-3">AI 置信度</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {facts.map((fact) => (
                  <tr key={fact.id} className="hover:bg-blue-50/50 group">
                    <td className="px-4 py-3 font-mono text-slate-400 text-xs">{fact.id}</td>
                    <td className="px-4 py-3 text-slate-800 font-medium">{fact.content}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs border ${
                        fact.type === '主体' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                        fact.type === '行为' ? 'bg-green-50 text-green-600 border-green-100' :
                        'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {fact.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{fact.source}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{width: `${(fact.confidence || 0) * 100}%`}}></div>
                        </div>
                        <span className="text-xs text-slate-400">{Math.floor((fact.confidence || 0) * 100)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {fact.status === 'ai_suggested' ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button className="text-blue-600 hover:bg-blue-100 p-1 rounded" title="Confirm">
                            <CheckCircle size={16} />
                          </button>
                          <button className="text-red-400 hover:bg-red-50 p-1 rounded" title="Reject">
                            <AlertCircle size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 flex items-center justify-end">
                          <CheckCircle size={12} className="mr-1 text-slate-300" /> 已确认
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  // L1 View
  const L1View = () => (
    <div className="p-6 h-full flex flex-col">
       <header className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center">
            <span className="bg-indigo-100 text-indigo-700 text-sm font-bold px-2 py-1 rounded mr-3">L1</span>
            业务对象建模
          </h2>
          <p className="text-sm text-slate-500 mt-1">将 L0 确认的事实抽象为稳定业务对象，支持对象类型定义与关系管理。</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-sm">
          <Plus size={16} className="mr-2" />
          新建对象
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-6">
        {objects.map(obj => (
          <div key={obj.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow relative group">
            <div className="absolute top-4 right-4">
               <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider ${
                 obj.type === 'ENTITY' ? 'bg-blue-100 text-blue-700' :
                 obj.type === 'EVENT' ? 'bg-green-100 text-green-700' :
                 'bg-purple-100 text-purple-700'
               }`}>
                 {obj.type}
               </span>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-800">{obj.name}</h3>
              <p className="text-xs font-mono text-slate-400 mt-0.5">{obj.id}</p>
            </div>
            
            <p className="text-sm text-slate-600 mb-4 h-10 line-clamp-2">{obj.description}</p>
            
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-4">
              <span className="text-xs font-semibold text-slate-500 block mb-2">核心属性</span>
              <div className="flex flex-wrap gap-2">
                {obj.attributes.map((attr, idx) => (
                  <span key={idx} className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded">
                    {attr}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-100">
               <span className={`text-xs flex items-center ${
                 obj.status === 'stable' ? 'text-green-600' : 'text-amber-600'
               }`}>
                 <span className={`w-2 h-2 rounded-full mr-1.5 ${
                   obj.status === 'stable' ? 'bg-green-500' : 'bg-amber-500'
                 }`}></span>
                 {obj.status === 'stable' ? '已发布' : '草稿中'}
               </span>
               <button className="text-indigo-600 text-sm font-medium hover:underline">编辑详情</button>
            </div>
          </div>
        ))}
        
        {/* Add Card Placeholder */}
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors cursor-pointer min-h-[240px]">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
            <Plus size={24} />
          </div>
          <span className="font-medium">AI 生成对象草稿</span>
          <span className="text-xs mt-1">基于 L0 事实自动推荐</span>
        </div>
      </div>
    </div>
  );

  // L2 View
  const L2View = () => {
    const activeScenario = scenarios.find(s => s.id === selectedScenarioId) || scenarios[0];

    return (
      <div className="h-full flex flex-col p-6">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
              <span className="bg-purple-100 text-purple-700 text-sm font-bold px-2 py-1 rounded mr-3">L2</span>
              场景语义建模
            </h2>
            <p className="text-sm text-slate-500 mt-1">将 L1 对象按业务场景进行编排和对齐，形成完整的业务语境。</p>
          </div>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-sm">
            <Workflow size={16} className="mr-2" />
            新建场景
          </button>
        </header>

        <div className="flex flex-1 gap-6 overflow-hidden">
           {/* Scenario List */}
           <div className="w-72 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden flex-shrink-0">
             <div className="p-3 border-b border-slate-100 bg-slate-50 font-medium text-sm text-slate-700">场景列表</div>
             <div className="overflow-y-auto flex-1">
               {scenarios.map(s => (
                 <div 
                   key={s.id} 
                   onClick={() => setSelectedScenarioId(s.id)}
                   className={`p-4 border-b border-slate-50 cursor-pointer transition-colors ${
                     activeScenario.id === s.id ? 'bg-purple-50 border-purple-100' : 'hover:bg-slate-50'
                   }`}
                 >
                   <div className="font-semibold text-slate-800 text-sm mb-1">{s.name}</div>
                   <div className="text-xs text-slate-400 truncate">{s.description}</div>
                 </div>
               ))}
             </div>
           </div>

           {/* Canvas/Detail Area */}
           <div className="flex-1 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                   <h3 className="font-bold text-slate-800">{activeScenario.name}</h3>
                   <p className="text-xs text-slate-500">{activeScenario.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                   <span className="text-xs bg-white border border-slate-200 px-2 py-1 rounded text-slate-600">
                     关联对象: {activeScenario.involvedObjects.length}
                   </span>
                </div>
              </div>
              
              <div className="flex-1 p-8 bg-slate-50 overflow-y-auto">
                {/* Visual Flow Representation */}
                <div className="max-w-3xl mx-auto">
                   <div className="space-y-8 relative">
                     {/* Connecting Line */}
                     <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-200 z-0"></div>

                     {activeScenario.steps.map((step, idx) => {
                       const relatedObj = objects.find(o => o.id === step.objectId);
                       return (
                         <div key={idx} className="relative z-10 flex items-start group">
                            <div className="w-12 h-12 rounded-full bg-white border-4 border-purple-50 flex items-center justify-center font-bold text-purple-600 shadow-sm mr-4 flex-shrink-0">
                              {step.order}
                            </div>
                            <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm group-hover:border-purple-200 group-hover:shadow-md transition-all">
                               <div className="flex justify-between items-start mb-2">
                                  <span className="font-medium text-slate-800">{step.action}</span>
                                  {relatedObj && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                       relatedObj.type === 'EVENT' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                                    }`}>
                                      {relatedObj.id}
                                    </span>
                                  )}
                               </div>
                               {relatedObj ? (
                                 <div className="text-sm text-slate-500 flex items-center bg-slate-50 p-2 rounded">
                                    <Box size={14} className="mr-2 text-slate-400" />
                                    操作对象：<span className="font-medium text-slate-700 ml-1">{relatedObj.name}</span>
                                 </div>
                               ) : (
                                 <div className="text-sm text-slate-400 italic">未关联具体 L1 对象</div>
                               )}
                            </div>
                         </div>
                       );
                     })}

                     {/* Add Step Button */}
                     <div className="relative z-10 flex items-center ml-1">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 ml-1 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 cursor-pointer transition-colors">
                          <Plus size={20} />
                        </div>
                        <span className="ml-4 text-sm text-slate-400">添加流程步骤</span>
                     </div>
                   </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  // L3 View
  const L3View = () => (
    <div className="p-6 h-full flex flex-col">
       <header className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center">
            <span className="bg-slate-100 text-slate-700 text-sm font-bold px-2 py-1 rounded mr-3">L3</span>
            系统与部门映射
          </h2>
          <p className="text-sm text-slate-500 mt-1">解决多部门多系统的数据落地问题，管理语义对象的所有权与物理实现。</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm">
             同步数据源
          </button>
          <button className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-sm">
            <GitMerge size={16} className="mr-2" />
            自动映射
          </button>
        </div>
      </header>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col">
         {/* Filters */}
         <div className="p-3 border-b border-slate-200 flex space-x-4 bg-slate-50">
            <div className="flex items-center space-x-2 text-sm text-slate-600">
               <Server size={14} />
               <span>系统:</span>
               <select className="bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none">
                 <option>全部</option>
                 <option>交易中心</option>
                 <option>商品中心</option>
               </select>
            </div>
             <div className="flex items-center space-x-2 text-sm text-slate-600">
               <Building2 size={14} />
               <span>部门:</span>
               <select className="bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none">
                 <option>全部</option>
                 <option>交易中台部</option>
               </select>
            </div>
         </div>

         {/* Table */}
         <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                     <th className="px-6 py-3">L1 语义对象</th>
                     <th className="px-6 py-3">归属系统</th>
                     <th className="px-6 py-3">物理表名</th>
                     <th className="px-6 py-3">责任部门</th>
                     <th className="px-6 py-3">状态</th>
                     <th className="px-6 py-3">最近同步</th>
                     <th className="px-6 py-3 text-right">操作</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {mappings.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50 group">
                       <td className="px-6 py-4">
                          <div className="font-medium text-slate-800">{m.objectName}</div>
                          <div className="text-xs text-slate-400 font-mono">{m.objectId}</div>
                       </td>
                       <td className="px-6 py-4 text-slate-600">
                          {m.system}
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex items-center">
                             <TableIcon size={14} className="text-slate-400 mr-2" />
                             <span className="font-mono text-slate-600">{m.physicalTable}</span>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs">
                             {m.ownerDepartment}
                          </span>
                       </td>
                       <td className="px-6 py-4">
                          {m.status === 'mapped' && <span className="text-green-600 flex items-center text-xs"><CheckCircle size={14} className="mr-1"/> 已映射</span>}
                          {m.status === 'conflict' && <span className="text-red-500 flex items-center text-xs"><AlertCircle size={14} className="mr-1"/> 字段冲突</span>}
                          {m.status === 'pending' && <span className="text-amber-500 flex items-center text-xs"><MoreHorizontal size={14} className="mr-1"/> 待关联</span>}
                       </td>
                       <td className="px-6 py-4 text-slate-400 text-xs">{m.lastSync}</td>
                       <td className="px-6 py-4 text-right">
                          <button className="text-blue-600 hover:text-blue-800 font-medium text-xs">配置</button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );

  // AI Assistant Panel (Sidebar Right)
  const AIAgentPanel = () => (
    <div className={`w-80 bg-white border-l border-slate-200 shadow-xl flex flex-col transition-all duration-300 flex-shrink-0 ${showAIPanel ? 'mr-0' : '-mr-80 hidden'}`}>
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white">
        <div className="flex items-center space-x-2">
          <Bot className="text-indigo-600" size={20} />
          <span className="font-bold text-slate-800">AI 建模助手</span>
        </div>
        <button onClick={() => setShowAIPanel(false)} className="text-slate-400 hover:text-slate-600">
          <ChevronRight size={20} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Context Aware Suggestions based on Active Tab */}
        
        {activeTab === 'l0' && (
           <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded">L0 建议</span>
              <span className="text-xs text-slate-400">刚刚</span>
            </div>
            <p className="text-sm text-slate-700 mb-2">
              检测到新的 L0 事实 <span className="font-medium text-slate-900">“会员等级提升”</span>。
            </p>
            <div className="bg-slate-50 p-2 rounded text-xs text-slate-600 mb-2">
              建议创建关联 L1 事件对象：<br/>
              <strong>Event: 会员升级事件</strong>
            </div>
            <div className="flex space-x-2">
              <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-1.5 rounded">采纳并创建</button>
              <button className="px-3 bg-white border border-slate-200 text-slate-600 text-xs py-1.5 rounded hover:bg-slate-50">忽略</button>
            </div>
          </div>
        )}

        {activeTab === 'l2' && (
           <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
             <div className="flex items-center space-x-2 mb-2">
               <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded">L2 场景建议</span>
             </div>
             <p className="text-sm text-slate-700 mb-2">
               根据您现有的 L1 对象，建议补充以下场景：
             </p>
             <ul className="list-disc list-inside text-xs text-slate-600 mb-3 space-y-1">
               <li>逆向退款流程</li>
               <li>库存盘点流程</li>
             </ul>
             <button className="w-full bg-indigo-50 text-indigo-700 text-xs py-1.5 rounded hover:bg-indigo-100">一键生成草稿</button>
           </div>
        )}

        {activeTab === 'l3' && (
           <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
             <div className="flex items-center space-x-2 mb-2">
               <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded">映射冲突</span>
             </div>
             <p className="text-sm text-slate-700 mb-2">
               对象 <span className="font-medium">“会员账户快照”</span> 的字段 `balance` 与物理表 `t_mb_asset` 中的类型不一致 (Decimal vs Int)。
             </p>
             <button className="w-full bg-white border border-slate-200 text-slate-600 text-xs py-1.5 rounded hover:bg-slate-50">查看差异对比</button>
           </div>
        )}
        
        {/* General Helper */}
        {activeTab === 'dashboard' && (
          <div className="text-center py-6">
            <div className="bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bot className="text-indigo-500" />
            </div>
            <p className="text-sm text-slate-600">我是您的语义建模助手。<br/>请选择一个模块开始工作。</p>
          </div>
        )}

      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="relative">
          <input 
            type="text" 
            placeholder="向 AI 提问或发出指令..."
            className="w-full border border-slate-200 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          <button className="absolute right-2 top-2 text-indigo-600 hover:text-indigo-700">
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 z-10">
          <div className="flex items-center text-slate-400 text-sm">
             <span className="hover:text-slate-600 cursor-pointer">平台</span>
             <ChevronRight size={14} className="mx-2" />
             <span className="text-slate-800 font-medium">
               {activeTab === 'dashboard' ? '概览' : 
                activeTab === 'l0' ? 'L0 业务事实' :
                activeTab === 'l1' ? 'L1 业务对象' : 
                activeTab === 'l2' ? 'L2 场景建模' : 'L3 系统映射'}
             </span>
          </div>
          
          <div className="flex items-center space-x-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="搜索对象、事实或指标..." 
                  className="pl-9 pr-4 py-1.5 bg-slate-100 border-transparent rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all w-64" 
                />
             </div>
             {!showAIPanel && (
               <button 
                 onClick={() => setShowAIPanel(true)}
                 className="flex items-center space-x-1 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-indigo-100 transition-colors"
               >
                 <Bot size={16} />
                 <span>AI 助手</span>
               </button>
             )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50/50 relative">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'l0' && <L0View />}
          {activeTab === 'l1' && <L1View />}
          {activeTab === 'l2' && <L2View />}
          {activeTab === 'l3' && <L3View />}
        </main>
      </div>

      {/* AI Panel */}
      {showAIPanel && <AIAgentPanel />}
    </div>
  );
};

const root = createRoot(document.getElementById("root"));
root.render(<App />);
