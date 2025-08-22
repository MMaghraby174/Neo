import React, { useState, useEffect, useMemo } from 'react';

// --- MOCK DATA & HELPERS ---
const currentSpecialist = "Dr. Milad Mansoori";
const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

const reportTemplate = {
    biomarkers: [
        { id: 'b_hscrp', name: 'hs-CRP', value: '', unit: 'mg/L', range: { min: 0, max: 1.0 }, status: 'Not Tested', isVerified: false },
        { id: 'b_wbc', name: 'White Blood Cells', value: '', unit: 'x10E9/L', range: { min: 4.0, max: 11.0 }, status: 'Not Tested', isVerified: false },
        { id: 'b_ferritin', name: 'Ferritin', value: '', unit: 'ng/mL', range: { min: 30, max: 300 }, status: 'Not Tested', isVerified: false },
        { id: 'b_glucose', name: 'Glucose', value: '', unit: 'mg/dL', range: { min: 70, max: 100 }, status: 'Not Tested', isVerified: false },
        { id: 'b_hba1c', name: 'HbA1c', value: '', unit: '%', range: { min: 4.0, max: 5.6 }, status: 'Not Tested', isVerified: false },
    ],
    geneticTraits: [
        { id: 'g_painsens', title: 'Pain Sensitivity', gene: '', result: '', description: '', isVerified: false },
        { id: 'g_novelty', title: 'Novelty Seeking', gene: '', result: '', description: '', isVerified: false },
        { id: 'g_personality', title: 'Personality', gene: '', result: '', description: '', isVerified: false },
    ],
    summary: { content: "", isVerified: false }
};

const aiGeneratedData = {
    biomarkers: [
        { id: 'b_hscrp', value: 0.8, status: 'Optimal' },
        { id: 'b_wbc', value: 6.2, status: 'Optimal' },
        { id: 'b_ferritin', value: 150, status: 'Optimal' },
        { id: 'b_glucose', value: 84, status: 'Optimal' },
        { id: 'b_hba1c', value: 5.1, status: 'Optimal' },
    ],
    geneticTraits: [
        { id: 'g_painsens', gene: 'SCN9A', result: 'Higher Pain Threshold', description: 'You likely have a higher tolerance for pain.' },
        { id: 'g_novelty', gene: 'DRD4-Ex3', result: 'Prefers Familiarity', description: 'Genetic makeup suggests a preference for familiar experiences.' },
        { id: 'g_personality', gene: 'DRD4', result: 'Balanced Introvert/Extrovert', description: 'Adaptable in social situations.' },
    ],
    summary: { content: "AI Analysis: User's tested biomarkers are optimal. Genetic profile is strong for stress resilience. Primary focus should be on maintaining current lifestyle and monitoring Vitamin D levels." },
    mealPlan: { '2025-08-24': { breakfast: 'b1', lunch: 'l1', dinner: 'd1' }, isVerified: false },
    foodScoreboard: [
        { id: 'f1', name: 'Avocado', improves: 'Cholesterol, Glucose', score: 9.5, isVerified: false },
        { id: 'f2', name: 'Salmon', improves: 'Inflammation, Cognition', score: 9.2, isVerified: false },
    ],
    lifestyle: {
        fitness: [
            { day: 'Monday', activity: 'Strength Training (Full Body)', duration: '60 min', details: 'Compound movements like squats, deadlifts, and overhead press.', isVerified: false },
            { day: 'Tuesday', activity: 'Zone 2 Cardio', duration: '45 min', details: 'Maintain a heart rate of 120-140 bpm.', isVerified: false }
        ],
        isVerified: false
    }
};

const mergeAiData = (template, aiData) => {
    const mergedReport = deepCopy(template);
    mergedReport.biomarkers.forEach(biomarker => {
        const aiMatch = aiData.biomarkers.find(b => b.id === biomarker.id);
        if (aiMatch) {
            biomarker.value = aiMatch.value;
            biomarker.status = aiMatch.status;
        }
    });
    mergedReport.geneticTraits.forEach(trait => {
        const aiMatch = aiData.geneticTraits.find(t => t.id === trait.id);
        if (aiMatch) {
            trait.gene = aiMatch.gene;
            trait.result = aiMatch.result;
            trait.description = aiMatch.description;
        }
    });
    mergedReport.summary.content = aiData.summary.content;
    return mergedReport;
};

const initialUsersData = {
    'user-01': {
        name: 'M. M.', email: 'mm@example.com', lastUpload: '2025-08-18', status: 'Review Needed',
        report: mergeAiData(reportTemplate, aiGeneratedData),
        mealPlan: deepCopy(aiGeneratedData.mealPlan),
        foodScoreboard: deepCopy(aiGeneratedData.foodScoreboard),
        lifestyle: deepCopy(aiGeneratedData.lifestyle),
        auditLog: [],
        wearableData: { steps: { average: 8904 }, calories: { average: 2201 }, sleep: { average: "7h 56m" }, hrv: { average: 78 }, loggedMeals: [{ date: '2025-08-20', type: 'Breakfast', name: 'Scrambled Eggs', calories: 350 }] }
    },
    'user-02': {
        name: 'J. Doe', email: 'jane.doe@example.com', lastUpload: '2025-08-20', status: 'Report Published',
        report: { biomarkers: [{ name: 'hs-CRP', value: 0.5, unit: 'mg/L', range: { min: 0, max: 1.0 }, status: 'Optimal', isVerified: true }], geneticTraits: [{ title: 'Stress Response', gene: 'COMT', result: 'Resilient', description: 'User has the warrior gene variant.', isVerified: true }], summary: { content: "User's inflammation is well-controlled.", isVerified: true } },
        mealPlan: { '2025-08-24': { breakfast: 'b2', lunch: 'l2', dinner: 'd2' }, isVerified: true }, foodScoreboard: [{ name: 'Blueberries', improves: 'Antioxidants', score: 9.8, isVerified: true }], lifestyle: { fitness: [{activity: 'Yoga', day: 'Wednesday', duration: '60 min', details: 'Focus on flexibility.'}], isVerified: true },
        auditLog: [{ timestamp: '2025-08-20 11:34 AM', action: 'Report Published by Dr. Milad Mansoori.' }],
        wearableData: { steps: { average: 6500 }, calories: { average: 1950 }, sleep: { average: "7h 15m" }, hrv: { average: 65 }, loggedMeals: [] }
    },
    'user-03': {
        name: 'S. Smith', email: 'sam.smith@example.com', lastUpload: '2025-08-21', status: 'Pending AI Analysis',
        report: deepCopy(reportTemplate), mealPlan: { isVerified: false }, foodScoreboard: [], lifestyle: { fitness: [], isVerified: false }, auditLog: [],
        wearableData: { steps: { average: 12000 }, calories: { average: 2800 }, sleep: { average: "8h 10m" }, hrv: { average: 85 }, loggedMeals: [] }
    },
    'user-04': {
        name: 'A. Williams', email: 'aw@example.com', lastUpload: '', status: 'Pending Upload',
        report: deepCopy(reportTemplate), mealPlan: { isVerified: false }, foodScoreboard: [], lifestyle: { fitness: [], isVerified: false }, auditLog: [],
        wearableData: { steps: { average: 0 }, calories: { average: 0 }, sleep: { average: "0h 0m" }, hrv: { average: 0 }, loggedMeals: [] }
    },
};

const mealLibraryData = [
    { id: 'b1', type: 'breakfast', name: 'Scrambled Eggs with Spinach & Avocado', calories: 350, protein: 25, carbs: 10, fats: 25 },
    { id: 'b2', type: 'breakfast', name: 'Greek Yogurt with Berries & Nuts', calories: 400, protein: 30, carbs: 35, fats: 15 },
    { id: 'l1', type: 'lunch', name: 'Grilled Salmon with Quinoa & Asparagus', calories: 550, protein: 40, carbs: 40, fats: 25 },
    { id: 'l2', type: 'lunch', name: 'Chicken Salad with Mixed Greens', calories: 450, protein: 35, carbs: 15, fats: 30 },
    { id: 'd1', type: 'dinner', name: 'Lean Steak with Sweet Potato & Broccoli', calories: 600, protein: 50, carbs: 45, fats: 25 },
    { id: 'd2', type: 'dinner', name: 'Lentil Soup with Whole Grain Bread', calories: 500, protein: 25, carbs: 70, fats: 10 }
];

// --- COMPONENTS ---

const Sidebar = ({ onTabClick, activeTab, specialistName }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navItems = [
        { id: 'users', icon: 'fa-users', text: 'User Management' },
        { id: 'lifestyle-overview', icon: 'fa-chart-pie', text: 'Lifestyle Overview' },
        { id: 'report', icon: 'fa-file-medical-alt', text: 'Report Editor' },
        { id: 'meals', icon: 'fa-utensils', text: 'Meal Planner' },
        { id: 'lifestyle', icon: 'fa-person-running', text: 'Lifestyle Protocols' },
    ];

    return (
        <div id="sidebar" className={`fixed top-0 left-0 h-screen bg-[#1f2937] z-30 overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div onClick={() => setIsCollapsed(!isCollapsed)} className="flex items-center p-4 cursor-pointer border-b border-gray-700">
                <div className="w-12 h-12 rounded-full bg-green-800 flex items-center justify-center mr-4 shrink-0">
                    <i className="fas fa-user-shield text-xl text-white"></i>
                </div>
                <div className={`whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                    <h1 className="text-lg font-bold text-white">{specialistName}</h1>
                    <p className="text-sm text-gray-400">Specialist Dashboard</p>
                </div>
            </div>
            <nav className="mt-6 flex flex-col space-y-2">
                {navItems.map(item => (
                    <button key={item.id} onClick={() => onTabClick(item.id)} data-tab={item.id}
                        className={`tab-button flex items-center py-3 px-6 text-sm font-semibold rounded-md transition-colors ${activeTab === item.id ? 'bg-green-800 text-white' : 'text-gray-400 hover:bg-[#2a3b4d]'}`}>
                        <i className={`fas ${item.icon} fa-fw text-lg w-8`}></i>
                        <span className={`ml-4 whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>{item.text}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
};

const Header = ({ activeTab, selectedUser, onBack, onGenerateAI }) => {
    const tabNames = {
        'users': 'User Management',
        'lifestyle-overview': 'Lifestyle Overview',
        'report': 'Report Editor',
        'meals': 'Meal Planner',
        'lifestyle': 'Lifestyle Protocols'
    };

    const title = selectedUser ? `${tabNames[activeTab]} for ${selectedUser.name}` : 'User Management';
    const subtitle = selectedUser ? `Status: ${selectedUser.status}` : 'Select a user to view and edit their data.';

    return (
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
                <h2 className="text-2xl font-bold text-white">{title}</h2>
                <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
                {selectedUser && (
                    <button onClick={onBack} className="bg-[#2a3b4d] border border-[#374151] text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#374151] transition flex items-center text-sm">
                        <i className="fas fa-arrow-left mr-2"></i> Back to Users
                    </button>
                )}
                {selectedUser && selectedUser.status === 'Pending AI Analysis' && (
                    <button onClick={() => onGenerateAI(selectedUser.id)} className="bg-blue-700 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg transition flex items-center text-sm">
                        <i className="fas fa-robot mr-2"></i> Generate AI Recommendations
                    </button>
                )}
            </div>
        </header>
    );
};

const MessageBox = ({ message, type, isVisible }) => {
    const styles = {
        success: { bg: 'bg-green-600', icon: 'fa-check-circle' },
        info: { bg: 'bg-blue-600', icon: 'fa-info-circle' },
        loading: { bg: 'bg-yellow-500', icon: 'fa-spinner fa-spin' }
    };
    const currentStyle = styles[type] || styles.success;

    return (
        <div className={`fixed top-24 right-4 z-50 transition-transform transform ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className={`text-white py-3 px-6 rounded-lg shadow-xl flex items-center ${currentStyle.bg}`}>
                <i className={`fas ${currentStyle.icon} mr-3`}></i>
                <p className="font-semibold">{message}</p>
            </div>
        </div>
    );
};

const UserManagement = ({ users, onSelectUser, onUpload }) => {
    const statusStyles = {
        'Pending Upload': 'bg-gray-700 text-gray-300',
        'Pending AI Analysis': 'bg-blue-800 text-blue-300',
        'Review Needed': 'bg-yellow-800 text-yellow-300',
        'Report Published': 'bg-green-800 text-green-300'
    };

    return (
        <div className="bg-[#1f2937] border border-[#374151] rounded-xl shadow-lg overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-[#2a3b4d]">
                    <tr>
                        <th className="p-4 font-semibold text-white">Name</th>
                        <th className="p-4 font-semibold text-white">Email</th>
                        <th className="p-4 font-semibold text-white text-center">Lab Results</th>
                        <th className="p-4 font-semibold text-white text-right">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(users).map(([id, user]) => (
                        <tr key={id} className="border-b border-gray-700 hover:bg-[#2a3b4d] cursor-pointer transition-colors" onClick={() => onSelectUser(id)}>
                            <td className="p-4 font-bold text-white">{user.name}</td>
                            <td className="p-4 text-gray-300">{user.email}</td>
                            <td className="p-4 text-center">
                                {user.status === 'Pending Upload' ? (
                                    <button onClick={(e) => { e.stopPropagation(); onUpload(id); }} className="bg-green-700 hover:bg-green-600 text-white font-semibold py-1 px-3 rounded-lg text-xs">Upload Results</button>
                                ) : <span className="text-xs text-gray-500">Uploaded</span>}
                            </td>
                            <td className="p-4 text-right">
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[user.status]}`}>{user.status}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const SuggestionCard = ({ title, isVerified, onApprove, children }) => {
    const cardClass = isVerified ? 'border-green-600' : 'ai-suggestion';
    const headerClass = isVerified ? 'bg-green-900/50 border-green-600' : 'ai-suggestion-header';
    const icon = isVerified ? <i className="fas fa-check-circle text-green-400"></i> : <i className="fas fa-lightbulb text-blue-400"></i>;
    const statusText = isVerified ? <span className="text-green-400 font-semibold">Shared with User</span> : <span className="text-blue-400 font-semibold">AI Suggestion</span>;

    return (
        <div className={`bg-[#1f2937] border rounded-xl overflow-hidden ${cardClass}`}>
            <div className={`flex justify-between items-center p-3 ${headerClass}`}>
                <div className="flex items-center gap-3">
                    {icon}
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    {statusText}
                </div>
                {!isVerified && (
                    <button onClick={onApprove} className="bg-green-700 hover:bg-green-600 text-white font-semibold py-1 px-3 rounded-lg text-xs">Approve</button>
                )}
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
};

const FooterActions = ({ user, onPublishAll, onSaveChanges }) => {
    const isReady = useMemo(() => {
        if (!user || user.status !== 'Review Needed') return false;
        const reportVerified = user.report.biomarkers.every(b => b.isVerified) && user.report.geneticTraits.every(g => g.isVerified) && user.report.summary.isVerified;
        const mealsVerified = user.mealPlan.isVerified && user.foodScoreboard.every(f => f.isVerified);
        const lifestyleVerified = user.lifestyle.isVerified;
        return reportVerified && mealsVerified && lifestyleVerified;
    }, [user]);

    if (user.status === 'Review Needed') {
        const buttonClass = isReady ? 'bg-green-700 hover:bg-green-600 cursor-pointer' : 'bg-gray-600 cursor-not-allowed';
        const buttonTitle = isReady ? 'Publish all verified information to the user' : 'All sections must be approved before publishing';
        return (
            <div className="mt-8 border-t border-gray-700 pt-6 flex justify-end">
                <div title={buttonTitle}>
                    <button onClick={isReady ? onPublishAll : null} className={`text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg flex items-center ${buttonClass}`}>
                        <i className="fas fa-paper-plane mr-3"></i>Publish All to User
                    </button>
                </div>
            </div>
        );
    }

    if (user.status === 'Report Published') {
        return (
            <div className="mt-8 border-t border-gray-700 pt-6 flex justify-between items-center">
                 <AuditLog log={user.auditLog} />
                 <button onClick={onSaveChanges} className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg flex items-center shrink-0">
                    <i className="fas fa-save mr-3"></i>Save & Log Changes
                 </button>
            </div>
        );
    }
    return null;
};

const AuditLog = ({ log }) => {
    const [isOpen, setIsOpen] = useState(false);
    const contentRef = React.useRef(null);

    return (
        <div className="w-full md:w-auto">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-3 bg-[#2a3b4d] rounded-lg">
                <span className="font-semibold text-white flex items-center"><i className="fas fa-history mr-2"></i>Audit Log</span>
                <i className={`fas fa-chevron-down text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
            </button>
            <div ref={contentRef} style={{ maxHeight: isOpen ? `${contentRef.current.scrollHeight}px` : '0' }} className="accordion-content overflow-hidden transition-all duration-300 ease-in-out">
                <div className="p-4 bg-[#1f2937] rounded-b-lg">
                    {log.map((entry, index) => (
                        <div key={index} className="flex items-start gap-3 py-2 border-b border-gray-700 last:border-b-0 text-sm">
                            <i className="fas fa-history text-gray-500 mt-1"></i>
                            <div>
                                <p className="text-gray-300">{entry.action}</p>
                                <p className="text-xs text-gray-500">{entry.timestamp}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ReportEditor = ({ user, onApprove, onSaveChanges, onPublishAll }) => {
    const biomarkerContent = (
        <div className="space-y-2">
            {user.report.biomarkers.map(b => (
                <div key={b.id} className="grid grid-cols-12 gap-4 items-center py-2 border-b border-gray-700 last:border-b-0">
                    <input className="col-span-3 bg-[#2a3b4d] rounded p-2 text-sm" defaultValue={b.name} />
                    <input type="number" className="col-span-2 bg-[#2a3b4d] rounded p-2 text-sm" defaultValue={b.value} />
                    <input className="col-span-1 bg-[#2a3b4d] rounded p-2 text-sm" defaultValue={b.unit} />
                    <select className="col-span-4 bg-[#2a3b4d] rounded p-2 text-sm" defaultValue={b.status}>
                        <option>Optimal</option><option>Needs Improvement</option><option>Not Tested</option>
                    </select>
                    <button className="col-span-2 text-red-500 hover:text-red-400"><i className="fas fa-trash-alt"></i></button>
                </div>
            ))}
        </div>
    );
    const traitsContent = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.report.geneticTraits.map(g => (
                <div key={g.id} className="bg-[#2a3b4d] p-4 rounded-lg space-y-2">
                    <input className="w-full bg-[#1f2937] rounded p-2 font-semibold" defaultValue={g.title} />
                    <textarea className="w-full bg-[#1f2937] rounded p-2 text-sm h-24" defaultValue={g.description}></textarea>
                </div>
            ))}
        </div>
    );
    const summaryContent = <textarea className="w-full bg-[#2a3b4d] rounded p-4 text-sm h-48" defaultValue={user.report.summary.content}></textarea>;

    return (
        <div className="space-y-6">
            <SuggestionCard title="Biomarker Analysis" isVerified={user.report.biomarkers.every(i => i.isVerified)} onApprove={() => onApprove('biomarkers')}>
                {biomarkerContent}
            </SuggestionCard>
            <SuggestionCard title="Genetic Traits" isVerified={user.report.geneticTraits.every(i => i.isVerified)} onApprove={() => onApprove('geneticTraits')}>
                {traitsContent}
            </SuggestionCard>
            <SuggestionCard title="Doctor's Summary" isVerified={user.report.summary.isVerified} onApprove={() => onApprove('summary')}>
                {summaryContent}
            </SuggestionCard>
            <FooterActions user={user} onPublishAll={onPublishAll} onSaveChanges={onSaveChanges} />
        </div>
    );
};

const MealPlanner = ({ user, onApprove, onSaveChanges, onPublishAll }) => {
    // ... (MealPlanner component logic and JSX)
    return (
        <div className="space-y-6">
            <SuggestionCard title="User Meal Plan" isVerified={user.mealPlan.isVerified} onApprove={() => onApprove('mealPlan')}>
                <p>Meal plan content goes here.</p>
            </SuggestionCard>
            <SuggestionCard title="Food Scoreboard" isVerified={user.foodScoreboard.every(i => i.isVerified)} onApprove={() => onApprove('foodScoreboard')}>
                <p>Food scoreboard content goes here.</p>
            </SuggestionCard>
            <FooterActions user={user} onPublishAll={onPublishAll} onSaveChanges={onSaveChanges} />
        </div>
    );
};

const LifestyleEditor = ({ user, onApprove, onSaveChanges, onPublishAll }) => {
    // ... (LifestyleEditor component logic and JSX)
    return (
        <div className="space-y-6">
            <SuggestionCard title="Weekly Fitness Protocol" isVerified={user.lifestyle.isVerified} onApprove={() => onApprove('lifestyle')}>
                <p>Lifestyle protocol content goes here.</p>
            </SuggestionCard>
            <FooterActions user={user} onPublishAll={onPublishAll} onSaveChanges={onSaveChanges} />
        </div>
    );
};

const LifestyleOverview = ({ user }) => {
    const createMetricCard = (title, icon, value, unit) => (
        <div className="bg-[#1f2937] border border-[#374151] rounded-xl p-6">
            <div className="flex items-center text-gray-400 mb-2">
                <i className={`fas ${icon} mr-2`}></i>
                <span className="text-sm font-medium">{title}</span>
            </div>
            <p className="text-4xl font-bold text-white">{value} <span className="text-lg font-normal text-gray-400">{unit}</span></p>
        </div>
    );
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {createMetricCard('Avg Steps', 'fa-shoe-prints', user.wearableData.steps.average.toLocaleString(), 'daily')}
                {createMetricCard('Avg Calories', 'fa-fire', user.wearableData.calories.average.toLocaleString(), 'burned')}
                {createMetricCard('Avg Sleep', 'fa-bed', user.wearableData.sleep.average, '')}
                {createMetricCard('Avg HRV', 'fa-heart-pulse', user.wearableData.hrv.average, 'ms')}
            </div>
        </div>
    );
};


// --- Main App Component ---
function App() {
    const [usersData, setUsersData] = useState(initialUsersData);
    const [activeTab, setActiveTab] = useState('users');
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [message, setMessage] = useState({ text: '', type: 'success', isVisible: false });
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type, isVisible: true });
        if (type !== 'loading') {
            setTimeout(() => setMessage(prev => ({ ...prev, isVisible: false })), 3000);
        }
    };
    const hideMessage = () => setMessage(prev => ({ ...prev, isVisible: false }));

    const handleTabClick = (tabId) => {
        if (!selectedUserId && tabId !== 'users') {
            showMessage("Please select a user first.", 'info');
            return;
        }
        setActiveTab(tabId);
    };

    const handleUserSelect = (userId) => {
        setSelectedUserId(userId);
        const user = usersData[userId];
        if (user.status === 'Pending Upload') {
            setActiveTab('users');
        } else {
            setActiveTab('lifestyle-overview');
        }
    };
    
    const handleUpload = (userId) => {
        const newUsersData = deepCopy(usersData);
        newUsersData[userId].status = 'Pending AI Analysis';
        setUsersData(newUsersData);
        showMessage(`Lab results for ${newUsersData[userId].name} uploaded.`, 'info');
    };

    const handleAIGeneration = (userId) => {
        showMessage('AI is analyzing results...', 'loading');
        setTimeout(() => {
            const newUsersData = deepCopy(usersData);
            const user = newUsersData[userId];
            user.report = mergeAiData(user.report, aiGeneratedData);
            user.mealPlan = deepCopy(aiGeneratedData.mealPlan);
            user.foodScoreboard = deepCopy(aiGeneratedData.foodScoreboard);
            user.lifestyle = deepCopy(aiGeneratedData.lifestyle);
            user.status = 'Review Needed';
            setUsersData(newUsersData);
            hideMessage();
            showMessage('AI Report generated and ready for review.');
            setSelectedUserId(userId);
            setActiveTab('report');
        }, 2000);
    };
    
    const handleApprove = (key) => {
        const newUsersData = deepCopy(usersData);
        const user = newUsersData[selectedUserId];
        if (key === 'biomarkers') user.report.biomarkers.forEach(i => i.isVerified = true);
        else if (key === 'geneticTraits') user.report.geneticTraits.forEach(i => i.isVerified = true);
        else if (key === 'summary') user.report.summary.isVerified = true;
        else if (key === 'mealPlan') user.mealPlan.isVerified = true;
        else if (key === 'foodScoreboard') user.foodScoreboard.forEach(i => i.isVerified = true);
        else if (key === 'lifestyle') user.lifestyle.isVerified = true;
        setUsersData(newUsersData);
        showMessage('Section approved!', 'success');
    };

    const handlePublishAll = () => {
        const newUsersData = deepCopy(usersData);
        const user = newUsersData[selectedUserId];
        user.status = 'Report Published';
        const timestamp = new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        user.auditLog.push({ timestamp, action: `Report Published by ${currentSpecialist}.` });
        setUsersData(newUsersData);
        showMessage(`Report for ${user.name} published!`);
        setSelectedUserId(null);
        setActiveTab('users');
    };
    
    const handleSaveChanges = () => {
        const newUsersData = deepCopy(usersData);
        const user = newUsersData[selectedUserId];
        const timestamp = new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        user.auditLog.push({ timestamp, action: `Edits saved in ${activeTab} tab by ${currentSpecialist}.` });
        setUsersData(newUsersData);
        showMessage('Changes saved and logged.');
    };

    const selectedUser = selectedUserId ? { ...usersData[selectedUserId], id: selectedUserId } : null;

    const renderContent = () => {
        if (selectedUser && activeTab !== 'users') {
            switch (activeTab) {
                case 'report': return <ReportEditor user={selectedUser} onApprove={handleApprove} onPublishAll={handlePublishAll} onSaveChanges={handleSaveChanges} />;
                case 'meals': return <MealPlanner user={selectedUser} onApprove={handleApprove} onPublishAll={handlePublishAll} onSaveChanges={handleSaveChanges} />;
                case 'lifestyle': return <LifestyleEditor user={selectedUser} onApprove={handleApprove} onPublishAll={handlePublishAll} onSaveChanges={handleSaveChanges} />;
                case 'lifestyle-overview': return <LifestyleOverview user={selectedUser} />;
                default: return null;
            }
        }
        return <UserManagement users={usersData} onSelectUser={handleUserSelect} onUpload={handleUpload} />;
    };

    return (
        <div className="bg-gray-900 text-gray-200 min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
            <style>{`
                ::-webkit-scrollbar { width: 8px; } ::-webkit-scrollbar-track { background: #1f2937; }
                ::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 4px; } ::-webkit-scrollbar-thumb:hover { background: #6b7280; }
                .ai-suggestion { border: 1px solid #3b82f6; box-shadow: 0 0 15px rgba(59, 130, 246, 0.2); }
                .ai-suggestion-header { background-color: rgba(59, 130, 246, 0.1); border-bottom: 1px solid #3b82f6; }
                .content-fade-in { animation: fadeIn 0.5s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .accordion-content { max-height: 0; overflow: hidden; transition: max-height 0.3s ease-in-out; }
            `}</style>
            <Sidebar activeTab={activeTab} onTabClick={handleTabClick} specialistName={currentSpecialist} />
            <MessageBox message={message.text} type={message.type} isVisible={message.isVisible} />
            <div className={`transition-all duration-300 ease-in-out ml-64`}>
                <div className="max-w-7xl mx-auto p-4 md:p-8">
                    <Header activeTab={activeTab} selectedUser={selectedUser} onBack={() => { setSelectedUserId(null); setActiveTab('users'); }} onGenerateAI={handleAIGeneration} />
                    <main className="content-fade-in">
                        {renderContent()}
                    </main>
                </div>
            </div>
        </div>
    );
}

export default App;
