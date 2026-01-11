# Semantic Layer 模块化拆分说明

## 概述

原始文件 `tt5.tsx` (9798行) 已被重构为模块化结构。

## 已完成的模块

### 1. 类型定义 ([`types/index.ts`](types/index.ts))
包含所有 TypeScript 接口和类型定义：
- `BusinessGoal`, `BusinessObject`, `Scenario`
- `DataSource`, `ScanAsset`, `PhysicalTable`
- `AICandidate`, `Conflict`, `CatalogAsset`
- `ApiService`, `CachePolicy`, `LineageData`
- `ModuleType`, 组件 Props 类型

### 2. 常量数据 ([`constants/mockData.ts`](constants/mockData.ts))
包含所有模拟数据常量：
- `mockBusinessGoals` - 业务梳理数据
- `mockBusinessObjects` - 业务对象
- `mockScenarios` - 场景编排数据
- `mockDataSources` - 数据源
- `mockScanAssets` - 扫描资产
- `mockAICandidates` - AI候选推荐
- `mockConflicts` - 冲突检测数据
- `mockCatalogAssets` - 统一元数据
- `mockApiServices` - API网关服务
- `mockCachePolicies`, `mockCacheKeys` - 缓存策略
- `mockLineage` - 血缘数据

### 3. 通用组件 ([`components/common.tsx`](components/common.tsx))
- `StatCard` - 统计卡片组件
- `StepItem` - 步骤项组件
- `BookIcon` - 书本图标组件
- `ScoreBar` - 评分条组件

### 4. 布局组件 ([`components/layout.tsx`](components/layout.tsx))
- `Sidebar` - 侧边栏导航
- `Header` - 顶部导航栏
- `AIAssistantPanel` - AI助手面板

### 5. 业务模块视图 ([`views/business/`](views/business/))
| 视图名称 | 文件 | 说明 |
|---------|------|------|
| 业务梳理 (TD-01) | [`BusinessGoalsView.tsx`](views/business/BusinessGoalsView.tsx) | ✅ 已提取 |
| 业务对象建模 (TD-03) | [`BusinessModelingView.tsx`](views/business/BusinessModelingView.tsx) | ✅ 已提取 |
| 场景编排 (TD-04) | [`ScenarioOrchestrationView.tsx`](views/business/ScenarioOrchestrationView.tsx) | ✅ 已提取 |

### 6. 数据发现模块视图 ([`views/discovery/`](views/discovery/))
| 视图名称 | 文件 | 说明 |
|---------|------|------|
| 数据源管理 (BU-01) | [`DataSourceManagementView.tsx`](views/discovery/DataSourceManagementView.tsx) | ✅ 已提取 |
| 资产扫描 (BU-02) | [`AssetScanningView.tsx`](views/discovery/AssetScanningView.tsx) | ✅ 已提取 |
| 候选生成 (BU-04) | [`CandidateGenerationView.tsx`](views/discovery/CandidateGenerationView.tsx) | ✅ 已提取 |

### 7. 数据治理模块视图 ([`views/governance/`](views/governance/))
| 视图名称 | 文件 | 说明 |
|---------|------|------|
| 映射工作台 (SG-01) | [`MappingWorkbenchView.tsx`](views/governance/MappingWorkbenchView.tsx) | ✅ 已提取 |
| 冲突检测 (SG-02) | [`ConflictDetectionView.tsx`](views/governance/ConflictDetectionView.tsx) | ✅ 已提取 |

### 8. 数据服务模块视图 ([`views/service/`](views/service/))
| 视图名称 | 文件 | 说明 |
|---------|------|------|
| API 网关 (EE-05) | [`ApiGatewayView.tsx`](views/service/ApiGatewayView.tsx) | ✅ 已提取 |
| 缓存策略 (EE-06) | [`CacheStrategyView.tsx`](views/service/CacheStrategyView.tsx) | ✅ 已提取 |

### 9. 主应用 ([`SemanticLayerApp.tsx`](SemanticLayerApp.tsx))
重构后的主应用组件，包含：
- 模块化的状态管理
- 视图路由逻辑
- 布局组件集成

## 待拆分的视图组件

以下视图组件仍需从 `tt5.tsx` 中提取到独立文件：

### 数据发现模块 (Discovery) - 剩余视图
| 视图名称 | 组件名 | 原始位置 | 目标路径 |
|---------|--------|----------|----------|
| 逻辑视图 | `DataSemanticUnderstandingView` | tt5.tsx:837 | `views/discovery/DataSemanticUnderstandingView.tsx` |
| 识别结果确认 | `IdentificationResultView` | tt5.tsx:5762 | `views/discovery/IdentificationResultView.tsx` |

### 数据治理模块 (Governance) - 剩余视图
| 视图名称 | 组件名 | 原始位置 | 目标路径 |
|---------|--------|----------|----------|
| 数据资产中心 | `DataCatalogView` | tt5.tsx:3441 | `views/governance/DataCatalogView.tsx` |
| 术语管理 | `TermManagementView` | tt5.tsx:4313 | `views/governance/TermManagementView.tsx` | ✅ 已提取 |
| 标签管理 | `TagManagementView` | tt5.tsx:4749 | `views/governance/TagManagementView.tsx` | ✅ 已提取 |
| 全链路血缘 | `DataLineageView` | tt5.tsx:7825 | `views/governance/DataLineageView.tsx` |

## 使用方法

```tsx
// 导入主应用组件
import SemanticLayerApp from '@/components/semantic-layer';

// 使用组件
function App() {
    return <SemanticLayerApp />;
}

// 带配置
function App() {
    return (
        <SemanticLayerApp
            defaultModule="bu_semantics"
            showAssistantByDefault={false}
            sidebarCollapsedByDefault={false}
        />
    );
}
```

## 目录结构

```
src/components/semantic-layer/
├── index.tsx                    # 导出入口
├── SemanticLayerApp.tsx         # 主应用组件
├── types/
│   └── index.ts                 # 类型定义
├── constants/
│   └── mockData.ts              # 模拟数据
├── components/
│   ├── common.tsx               # 通用组件
│   └── layout.tsx               # 布局组件
└── views/
    ├── business/                # 业务建模模块 (TD)
    │   ├── index.ts
    │   ├── BusinessGoalsView.tsx
    │   ├── BusinessModelingView.tsx
    │   └── ScenarioOrchestrationView.tsx
    ├── discovery/               # 数据发现模块 (BU)
    │   ├── index.ts
    │   ├── DataSourceManagementView.tsx
    │   ├── AssetScanningView.tsx
    │   └── CandidateGenerationView.tsx
    ├── governance/              # 数据治理模块 (SG)
    │   ├── index.ts
    │   ├── MappingWorkbenchView.tsx
    │   └── ConflictDetectionView.tsx
    └── service/                 # 数据服务模块 (EE)
        ├── index.ts
        ├── ApiGatewayView.tsx
        └── CacheStrategyView.tsx
```

## 完成进度

- ✅ 类型定义模块
- ✅ 常量数据模块
- ✅ 通用组件模块
- ✅ 布局组件模块
- ✅ 业务模块视图 (3/3)
- ✅ 数据发现模块视图 (3/5)
- ✅ 数据治理模块视图 (4/6)
- ✅ 数据服务模块视图 (2/2)

**总计：14/18 个视图组件已提取**
