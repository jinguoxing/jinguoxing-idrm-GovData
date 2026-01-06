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
  MoreHorizontal,
  Activity,
  Scan,
  Cpu,
  ShieldCheck,
  Zap,
  RefreshCw,
  BoxSelect
} from "lucide-react";

// Types
interface Fact { id: string; content: string; type: string; source: string; status: string; confidence?: number; }
interface BusinessObject { id: string; name: string; type: string; description: string; status: string; attributes: string[]; }
interface Scenario { id: string; name: string; description: string; involvedObjects: string[]; steps: any[]; }
interface SystemMapping { id: string; objectId: string; objectName: string; system: string; physicalTable: string; ownerDepartment: string; status: string; lastSync: string; }

const App = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);

  // Sidebar Menu Configuration
  const menuGroups = [
    {
      title: "概览",
      color: "text-slate-400",
      items: [
        { id: "dashboard", label: "控制台 Dashboard", icon: <Activity size={18} />, code: "" }
      ]
    },
    {
      title: "业务建模",
      color: "text-blue-400",
      items: [
        { id: "l0", label: "业务梳理", icon: <FileText size={18} />, code: "TD-01" },
        { id: "l1", label: "业务对象建模", icon: <BoxSelect size={18} />, code: "TD-03" },
        { id: "l2", label: "场景编排", icon: <Layers size={18} />, code: "TD-04" }
      ]
    },
    {
      title: "数据发现",
      color: "text-emerald-400",
      items: [
        { id: "bu01", label: "数据源管理", icon: <Database size={18} />, code: "BU-01" },
        { id: "bu02", label: "资产扫描", icon: <Scan size={18} />, code: "BU-02" },
        { id: "bu04", label: "候选生成", icon: <Cpu size={18} />, code: "BU-04" }
      ]
    },
    {
      title: "SG 语义治理中心",
      color: "text-purple-400",
      items: [
        { id: "l3", label: "映射工作台", icon: <GitMerge size={18} />, code: "SG-01" },
        { id: "sg02", label: "冲突检测", icon: <ShieldCheck size={18} />, code: "SG-02" },
        { id: "sg04", label: "统一元数据", icon: <TableIcon size={18} />, code: "SG-04" }
      ]
    },
    {
      title: "EE 服务执行",
      color: "text-orange-400",
      items: [
        { id: "ee05", label: "API 网关", icon: <Server size={18} />, code: "EE-05" },
        { id: "ee06", label: "缓存策略", icon: <RefreshCw size={18} />, code: "EE-06" }
      ]
    }
  ];

  // Mock Data
  const facts: Fact[] = [
    { id: "F001", content: "客户下单购买商品", type: "行为", source: "订单系统文档", status: "confirmed", confidence: 0.98 },
    { id: "F002", content: "商品库存扣减", type: "状态", source: "库存规则 V1.0", status: "confirmed", confidence: 0.95 },
  ];

  const objects: BusinessObject[] = [
    { id: "BO01", name: "客户订单", type: "EVENT", description: "记录客户的交易行为核心单据", status: "stable", attributes: ["订单号", "下单时间"] },
  ];

  const Sidebar = () => (
    <div className="w-72 bg-[#0b1120] text-slate-300 flex flex-col h-full flex-shrink-0">
      <div className="p-6 flex items-center space-x-3 text-white">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold">SM</div>
        <span className="font-semibold text-lg tracking-tight">语义建模平台</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-10 custom-scrollbar">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="mb-6">
            <h3 className={`text-[11px] font-bold uppercase tracking-widest px-3 mb-3 ${group.color}`}>
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all group ${
                    activeTab === item.id 
                      ? "bg-slate-800/50 text-white ring-1 ring-slate-700 shadow-lg" 
                      : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={activeTab === item.id ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"}>
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.code && (
                    <span className={`text-[10px] font-mono opacity-60 ${activeTab === item.id ? "text-blue-300" : ""}`}>
                      ({item.code})
                    </span>
                  )}
                  {item.id === "dashboard" && activeTab === "dashboard" && <ChevronRight size={14} className="text-slate-500" />}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-[#0f172a] border-t border-slate-800/50">
        <button className="w-full flex items-center space-x-3 px-3 py-2 text-slate-400 hover:text-white transition-colors text-sm">
          <Settings size={18} />
          <span>系统设置</span>
        </button>
      </div>
    </div>
  );

  // Components for Views (Simplified placeholders for new tabs)
  const PlaceholderView = ({ title, icon }: { title: string; icon: React.ReactNode }) => (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50">
      <div className="p-6 bg-white rounded-full shadow-sm mb-4">
        {React.cloneElement(icon as React.ReactElement, { size: 48, className: "text-slate-300" })}
      </div>
      <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
      <p className="mt-2 text-slate-500">该功能模块正在接入中...</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 z-10">
          <div className="flex items-center text-slate-400 text-sm">
             <span className="hover:text-slate-600 cursor-pointer">平台核心</span>
             <ChevronRight size={14} className="mx-2" />
             <span className="text-slate-800 font-medium uppercase">
               {activeTab.toUpperCase()}
             </span>
          </div>
          
          <div className="flex items-center space-x-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="搜索资产或任务..." 
                  className="pl-9 pr-4 py-1.5 bg-slate-100 border-transparent rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all w-64" 
                />
             </div>
             <button onClick={() => setShowAIPanel(!showAIPanel)} className={`p-2 rounded-full transition-colors ${showAIPanel ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}>
                <Bot size={20} />
             </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative">
          {activeTab === 'dashboard' && <div className="p-8">Dashboard Content Here</div>}
          {activeTab === 'l0' && <div className="p-8">L0 Facts Review View</div>}
          {activeTab === 'l1' && <div className="p-8">L1 Business Objects View</div>}
          {activeTab === 'l2' && <div className="p-8">L2 Scenarios View</div>}
          {activeTab === 'l3' && <div className="p-8">L3 Mappings View</div>}
          
          {/* Handle newly added categories */}
          {activeTab === 'bu01' && <PlaceholderView title="数据源管理 (BU-01)" icon={<Database />} />}
          {activeTab === 'bu02' && <PlaceholderView title="资产扫描 (BU-02)" icon={<Scan />} />}
          {activeTab === 'bu04' && <PlaceholderView title="候选生成 (BU-04)" icon={<Cpu />} />}
          {activeTab === 'sg02' && <PlaceholderView title="冲突检测 (SG-02)" icon={<ShieldCheck />} />}
          {activeTab === 'sg04' && <PlaceholderView title="统一元数据 (SG-04)" icon={<TableIcon />} />}
          {activeTab === 'ee05' && <PlaceholderView title="API 网关 (EE-05)" icon={<Server />} />}
          {activeTab === 'ee06' && <PlaceholderView title="缓存策略 (EE-06)" icon={<RefreshCw />} />}
        </main>
      </div>

      {showAIPanel && (
        <div className="w-80 bg-white border-l border-slate-200 shadow-xl flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="font-bold flex items-center space-x-2">
              <Bot size={18} className="text-blue-600" />
              <span>AI 建模助理</span>
            </span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
             <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-800 leading-relaxed">
               您好！我是您的语义建模助理。您可以点击左侧导航栏开始业务事实梳理 (TD-01) 或资产扫描 (BU-02)。
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const root = createRoot(document.getElementById("root"));
root.render(<App />);
