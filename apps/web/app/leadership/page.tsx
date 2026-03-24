import { mockObjectives } from '../../lib/mockData';
import { ShieldAlert, TrendingUp, Users, Target } from 'lucide-react';

export default function LeadershipDashboard() {
  const atRiskCount = mockObjectives.flatMap(o => o.keyResults).filter(kr => (kr.status || '') === 'Behind' || (kr.status || '') === 'Blocked').length;
  const onTrackCount = mockObjectives.flatMap(o => o.keyResults).filter(kr => (kr.status || '') === 'In progress' || (kr.status || '') === 'Completed').length;
  const totalKrs = mockObjectives.flatMap(o => o.keyResults).length;
  
  // Calculate avg confidence
  const totalConfidence = mockObjectives.flatMap(o => o.keyResults).reduce((acc, kr) => acc + (kr.confidenceScore || 0), 0);
  const avgConfidence = totalKrs > 0 ? (totalConfidence / totalKrs).toFixed(1) : "0.0";

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Leadership Dashboard</h1>
        <p className="text-gray-500">
          Global strategic alignment and risk monitoring across Continental Precision Engineering.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><Target className="w-5 h-5"/></div>
            <span className="text-xs font-bold text-gray-500 tracking-wider">ALL OKRS</span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-900">{totalKrs}</h3>
            <p className="text-sm text-gray-500 mt-1">Active Key Results</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-red-100 rounded-lg text-red-600"><ShieldAlert className="w-5 h-5"/></div>
            <span className="text-xs font-bold text-red-500 tracking-wider uppercase">Needs Attention</span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-900">{atRiskCount}</h3>
            <p className="text-sm text-gray-500 mt-1">Blocked or Behind</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-cyan-100 rounded-lg text-cyan-600"><TrendingUp className="w-5 h-5"/></div>
            <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">On Track</span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-900">{onTrackCount}</h3>
            <p className="text-sm text-gray-500 mt-1">Progressing Well</p>
          </div>
        </div>
        
        <div className="bg-[#FAF8F5] border border-orange-100/50 p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[#8B5F2E] rounded-lg text-white"><Users className="w-5 h-5"/></div>
            <span className="text-xs font-bold text-[#D97706] tracking-wider uppercase">Confidence</span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-[#8B5F2E]">{avgConfidence} / 5.0</h3>
            <p className="text-sm text-gray-600 mt-1">Global Average Index</p>
          </div>
        </div>
      </div>

      {/* Risk Heatmap Matrix */}
      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Strategic Risk Heatmap</h2>
        <div className="mb-8">
          <p className="text-sm text-gray-500 mb-4">
            This matrix highlights Key Results that have low confidence scores relative to their progress. 
            <span className="inline-flex items-center justify-center w-3 h-3 bg-red-100 border border-red-300 ml-2 mr-1 rounded-sm"/> Red zones indicate critical alignment risks.
          </p>
          
          {/* Simulated Heatmap Grid */}
          <div className="grid grid-cols-[100px_1fr_1fr_1fr_1fr_1fr] gap-2 items-center text-center">
            {/* Header X-Axis */}
            <div><span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase -rotate-90 block origin-left translate-y-8 w-max">Progress %</span></div>
            <div className="text-xs font-bold text-gray-500">Conf. 1</div>
            <div className="text-xs font-bold text-gray-500">Conf. 2</div>
            <div className="text-xs font-bold text-gray-500">Conf. 3</div>
            <div className="text-xs font-bold text-gray-500">Conf. 4</div>
            <div className="text-xs font-bold text-gray-500">Conf. 5</div>

            {/* Row 4 (76-100%) */}
            <div className="text-xs font-bold text-gray-500 text-right pr-4">76-100%</div>
            <div className="h-16 bg-red-100 rounded flex flex-col items-center justify-center text-red-900 border border-red-200">
              <span className="text-xl font-bold">0</span>
            </div>
            <div className="h-16 bg-orange-100 rounded flex flex-col items-center justify-center text-orange-900 border border-orange-200">
              <span className="text-xl font-bold">0</span>
            </div>
            <div className="h-16 bg-yellow-100 rounded flex flex-col items-center justify-center text-yellow-900 border border-yellow-200">
              <span className="text-xl font-bold">0</span>
            </div>
            <div className="h-16 bg-green-200 rounded flex flex-col items-center justify-center text-green-900 border border-green-300">
              <span className="text-xl font-bold shadow-sm">1</span>
              <span className="text-[10px]">KR-4</span>
            </div>
            <div className="h-16 bg-green-500 rounded flex flex-col items-center justify-center text-white border border-green-600">
              <span className="text-xl font-bold">0</span>
            </div>

            {/* Row 3 (51-75%) */}
            <div className="text-xs font-bold text-gray-500 text-right pr-4">51-75%</div>
            <div className="h-16 bg-red-200 rounded flex flex-col items-center justify-center text-red-900 border border-red-300">
              <span className="text-xl font-bold">0</span>
            </div>
            <div className="h-16 bg-orange-200 rounded flex flex-col items-center justify-center text-orange-900 border border-orange-300">
              <span className="text-xl font-bold">0</span>
            </div>
            <div className="h-16 bg-yellow-100 rounded flex flex-col items-center justify-center text-yellow-900 border border-yellow-200">
              <span className="text-xl font-bold">0</span>
            </div>
            <div className="h-16 bg-green-100 rounded flex flex-col items-center justify-center text-green-900 border border-green-200">
              <span className="text-xl font-bold">1</span>
              <span className="text-[10px]">KR-1</span>
            </div>
            <div className="h-16 bg-green-200 rounded flex flex-col items-center justify-center text-green-900 border border-green-300">
              <span className="text-xl font-bold">0</span>
            </div>

            {/* Row 2 (26-50%) */}
            <div className="text-xs font-bold text-gray-500 text-right pr-4">26-50%</div>
            <div className="h-16 bg-red-300 rounded flex flex-col items-center justify-center text-red-900 border border-red-400">
              <span className="text-xl font-bold">0</span>
            </div>
            <div className="h-16 bg-red-100 rounded flex flex-col items-center justify-center text-red-900 border border-red-200">
              <span className="text-xl font-bold">1</span>
              <span className="text-[10px]">KR-2</span>
            </div>
            <div className="h-16 bg-orange-100 rounded flex flex-col items-center justify-center text-orange-900 border border-orange-200">
              <span className="text-xl font-bold">0</span>
            </div>
            <div className="h-16 bg-yellow-50 rounded flex flex-col items-center justify-center text-yellow-900 border border-yellow-100">
              <span className="text-xl font-bold">0</span>
            </div>
            <div className="h-16 bg-green-50 rounded flex flex-col items-center justify-center text-green-900 border border-green-100">
              <span className="text-xl font-bold">0</span>
            </div>

            {/* Row 1 (0-25%) */}
            <div className="text-xs font-bold text-gray-500 text-right pr-4">0-25%</div>
            <div className="h-16 bg-red-500 rounded flex flex-col items-center justify-center text-white border border-red-600">
              <span className="text-xl font-bold">0</span>
            </div>
            <div className="h-16 bg-red-200 rounded flex flex-col items-center justify-center text-red-900 border border-red-300">
              <span className="text-xl font-bold">0</span>
            </div>
            <div className="h-16 bg-yellow-200 rounded flex flex-col items-center justify-center text-yellow-900 border border-yellow-300">
              <span className="text-xl font-bold">1</span>
              <span className="text-[10px]">KR-3</span>
            </div>
            <div className="h-16 bg-yellow-50 rounded flex flex-col items-center justify-center text-yellow-900 border border-yellow-100">
              <span className="text-xl font-bold">0</span>
            </div>
            <div className="h-16 bg-gray-50 rounded flex flex-col items-center justify-center text-gray-400 border border-gray-100">
              <span className="text-xl font-bold">0</span>
            </div>
          </div>
          <div className="text-center mt-6">
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">— CONFIDENCE SCORE —</span>
          </div>
        </div>
      </div>
    </div>
  );
}
