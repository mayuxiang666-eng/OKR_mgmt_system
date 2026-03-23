import { Heatmap } from '../../components/Heatmap';
import { RiskIndicator } from '../../components/RiskIndicator';

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl text-white font-semibold">Executive Dashboard</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <h3 className="text-white text-lg">Top Risks</h3>
          <div className="space-y-2 mt-2">
            <RiskIndicator riskLevel="high" description="Oven drift impacting scrap" />
            <RiskIndicator riskLevel="medium" description="Supplier lot on hold" />
          </div>
        </div>
        <div className="card">
          <h3 className="text-white text-lg">At Risk Objectives</h3>
          <ul className="text-slate-300 text-sm mt-2 list-disc pl-4">
            <li>Reduce SMT scrap to 0.8% (25% complete)</li>
          </ul>
        </div>
        <div>
          <Heatmap legend="Weekly Progress" data={[{ label: 'W1', value: 0.2 }, { label: 'W2', value: 0.4 }, { label: 'W3', value: 0.6 }, { label: 'W4', value: 0.5 }]} />
        </div>
      </div>
    </div>
  );
}
