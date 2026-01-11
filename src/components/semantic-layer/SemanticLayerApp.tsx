// ==========================================
// Semantic Layer Application - Main Component
// ==========================================
// This is a refactored version that organizes the views into separate modules
// The original tt5.tsx contains all views inline - this demonstrates the modular structure

import React, { useState, useEffect } from 'react';
import { Sidebar, Header, AIAssistantPanel } from './components/layout';
import { ModuleType, BusinessObject, DataSource, ScanAsset } from './types';
import { mockBusinessObjects, mockDataSources, mockScanAssets, mockAICandidates } from './constants/mockData';

// Import view components from modularized files
import { BusinessGoalsView, BusinessModelingView, ScenarioOrchestrationView } from './views/business';
import { DataSourceManagementView, AssetScanningView, CandidateGenerationView } from './views/discovery';
import { MappingWorkbenchView, ConflictDetectionView, TermManagementView, TagManagementView } from './views/governance';
import { ApiGatewayView, CacheStrategyView } from './views/service';

// TODO: Extract remaining views from tt5.tsx into separate files

// Placeholder component for views not yet extracted
const PlaceholderView = ({ title, description }: { title: string; description?: string }) => (
    <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-700 mb-2">{title}</h2>
        <p className="text-slate-500 max-w-md text-center">
            {description || `The ${title} module needs to be extracted from the original tt5.tsx file.`}
        </p>
        <p className="text-sm text-slate-400 mt-4">
            Located in original file: tt5.tsx (line {title === '业务梳理' ? '2793' : 'N/A'})
        </p>
    </div>
);

interface SemanticLayerAppProps {
    /**
     * Default active module when the app loads
     * @default 'bu_semantics'
     */
    defaultModule?: ModuleType;
    /**
     * Whether to show the AI assistant by default
     * @default false
     */
    showAssistantByDefault?: boolean;
    /**
     * Whether the sidebar should be collapsed by default
     * @default false
     */
    sidebarCollapsedByDefault?: boolean;
}

/**
 * Main Semantic Layer Application Component
 *
 * This is the entry point for the Semantic Layer application.
 * It manages global state and renders the appropriate view based on the active module.
 */
export const SemanticLayerApp: React.FC<SemanticLayerAppProps> = ({
    defaultModule = 'bu_semantics',
    showAssistantByDefault = false,
    sidebarCollapsedByDefault = false,
}) => {
    const [activeModule, setActiveModule] = useState<ModuleType>(defaultModule);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(sidebarCollapsedByDefault);
    const [showAssistant, setShowAssistant] = useState(showAssistantByDefault);

    // Global State
    const [businessObjects, setBusinessObjects] = useState<BusinessObject[]>(mockBusinessObjects);
    const [dataSources, setDataSources] = useState<DataSource[]>(mockDataSources);
    const [scanAssets, setScanAssets] = useState<ScanAsset[]>(mockScanAssets);

    const contextData = {
        businessObjects,
        dataSources,
        candidates: mockAICandidates,
        scanAssets
    };

    /**
     * Renders the appropriate view based on the active module
     */
    const renderContent = () => {
        // Modularized views - imported from separate files
        switch (activeModule) {
            // Business Module (TD)
            case 'td_goals':
                return <BusinessGoalsView setActiveModule={setActiveModule} />;
            case 'td_modeling':
                return <BusinessModelingView businessObjects={businessObjects} setBusinessObjects={setBusinessObjects} />;
            case 'td_scenario':
                return <ScenarioOrchestrationView businessObjects={businessObjects} />;

            // Discovery Module (BU)
            case 'bu_connect':
                return <DataSourceManagementView />;
            case 'bu_discovery':
                return <AssetScanningView setActiveModule={setActiveModule} />;
            case 'bu_candidates':
                return <CandidateGenerationView businessObjects={businessObjects} setBusinessObjects={setBusinessObjects} />;

            // Governance Module (SG)
            case 'mapping':
                return <MappingWorkbenchView businessObjects={businessObjects} />;
            case 'governance':
                return <ConflictDetectionView setActiveModule={setActiveModule} />;

            // Service Module (EE)
            case 'ee_api':
                return <ApiGatewayView />;
            case 'ee_cache':
                return <CacheStrategyView />;

            // Views not yet extracted - showing placeholders with source location
            case 'bu_semantics':
                return <PlaceholderView title="逻辑视图 (BU-03)" description="DataSemanticUnderstandingView - 位于 tt5.tsx:837" />;
            case 'bu_identification':
                return <PlaceholderView title="识别结果确认" description="IdentificationResultView - 位于 tt5.tsx:5762" />;
            case 'asset_center':
                return <PlaceholderView title="资产中心" description="AssetCenterView - 位于 tt5.tsx" />;
            case 'catalog':
                return <PlaceholderView title="数据资产中心 (SG-04)" description="DataCatalogView - 位于 tt5.tsx:3441" />;
            case 'lineage':
                return <PlaceholderView title="全链路血缘 (SG-05)" description="DataLineageView - 位于 tt5.tsx:7825" />;
            case 'term_management':
                return <TermManagementView />;
            case 'tag_management':
                return <TagManagementView />;
            case 'dashboard':
                return <PlaceholderView title="Dashboard" description="控制台 - 待实现" />;
            default:
                return <PlaceholderView title="Module" />;
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
