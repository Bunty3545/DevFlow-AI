import { IProject } from '../models/Project';
import { IMilestone } from '../models/Milestone';
import { IIssue } from '../models/Issue';

export interface CalculatedRiskMetrics {
  riskScore: number; // 0 - 100
  riskCategory: 'Low' | 'Medium' | 'High' | 'Critical';
  cpi: number; // Cost Performance Index
  spi: number; // Schedule Performance Index
  costVariancePercent: number;
  scheduleSlippagePercent: number;
  projectedCostOverrun: number; // Crores
  projectedDelayMonths: number;
  predictedCompletionDate: Date;
  primaryRiskDrivers: string[];
  recommendedMitigations: string[];
  explanation: string;
}

/**
 * Earned Value Management (EVM) and Multi-Factor Infrastructure Risk Engine
 * Formulated according to Ministry of Statistics & Programme Implementation (MoSPI) standards.
 */
export function calculateProjectRisk(
  project: IProject,
  milestones: IMilestone[] = [],
  issues: IIssue[] = []
): CalculatedRiskMetrics {
  const approvedCost = project.approvedCost || 1;
  const revisedCost = project.revisedCost || approvedCost;
  const actualExpenditure = project.actualExpenditure || 0;
  const plannedProgress = Math.min(Math.max(project.plannedProgress || 0, 0), 100);
  const actualProgress = Math.min(Math.max(project.actualProgress || 0, 0), 100);

  // 1. Earned Value Analysis
  // EV = Earned Value (Value of physical work performed relative to approved budget)
  const earnedValue = (actualProgress / 100) * approvedCost;
  // PV = Planned Value (Expected value of work scheduled to be completed)
  const plannedValue = (plannedProgress / 100) * approvedCost;
  // AC = Actual Cost
  const actualCost = actualExpenditure;

  // Cost Performance Index (CPI) = EV / AC. If AC is 0, default to 1.0
  let cpi = actualCost > 0 ? Number((earnedValue / actualCost).toFixed(3)) : 1.0;
  if (cpi > 2.0) cpi = 2.0;
  if (cpi < 0.1) cpi = 0.1;

  // Schedule Performance Index (SPI) = EV / PV
  let spi = plannedValue > 0 ? Number((earnedValue / plannedValue).toFixed(3)) : 1.0;
  if (spi > 2.0) spi = 2.0;
  if (spi < 0.1) spi = 0.1;

  // Cost Variance Percent
  const costVariancePercent = Number((((revisedCost - approvedCost) / approvedCost) * 100).toFixed(1));

  // Schedule Slippage (Difference in percentage points between planned and actual)
  const scheduleSlippagePercent = Number((plannedProgress - actualProgress).toFixed(1));

  // 2. Multi-factor Risk Scoring (0 to 100)
  let score = 10; // baseline
  const drivers: string[] = [];
  const mitigations: string[] = [];

  // A. Progress Delay Factor (Up to 35 points)
  if (scheduleSlippagePercent > 25) {
    score += 35;
    drivers.push(`Severe physical execution lag: ${scheduleSlippagePercent}% behind schedule`);
    mitigations.push('Mobilize additional civil contractor shifts and critical path equipment immediately');
  } else if (scheduleSlippagePercent > 15) {
    score += 25;
    drivers.push(`Moderate execution slippage: ${scheduleSlippagePercent}% behind schedule`);
    mitigations.push('Review weekly contractor milestones and expedite pending section handovers');
  } else if (scheduleSlippagePercent > 5) {
    score += 12;
    drivers.push(`Minor execution lag: ${scheduleSlippagePercent}% behind planned progress`);
    mitigations.push('Streamline site inspection clearances to recover planned velocity');
  }

  // B. Cost Overrun & CPI Factor (Up to 25 points)
  if (cpi < 0.75 || costVariancePercent > 20) {
    score += 25;
    drivers.push(`Severe cost stress: CPI is ${cpi} with ${costVariancePercent}% budget revision`);
    mitigations.push('Conduct comprehensive financial audit and invoke cost containment review with MoSPI/Ministry');
  } else if (cpi < 0.9 || costVariancePercent > 10) {
    score += 15;
    drivers.push(`Cost inefficiency: CPI is ${cpi} (expenditure outpacing physical output)`);
    mitigations.push('Reallocate contingency budget and audit item-rate billing against actual site milestones');
  } else if (costVariancePercent > 0) {
    score += 8;
    drivers.push(`Budget revised upwards by ${costVariancePercent}% from original approved cost`);
  }

  // C. Milestone Failure Factor (Up to 20 points)
  const delayedMilestones = milestones.filter(m => m.status === 'Delayed');
  if (delayedMilestones.length >= 3) {
    score += 20;
    drivers.push(`Multiple critical milestones delayed (${delayedMilestones.length} milestones missed)`);
    mitigations.push('Re-baseline non-critical activities and enforce liquidated damages on chronic contractor lapses');
  } else if (delayedMilestones.length >= 1) {
    score += 10;
    drivers.push(`Critical milestone '${delayedMilestones[0].title}' currently flagged as delayed`);
    mitigations.push(`Target expedited resolution for milestone: ${delayedMilestones[0].title}`);
  }

  // D. Open Issue Severity Factor (Up to 20 points)
  const criticalIssues = issues.filter(i => i.status !== 'Resolved' && i.status !== 'Closed' && i.severity === 'Critical');
  const highIssues = issues.filter(i => i.status !== 'Resolved' && i.status !== 'Closed' && i.severity === 'High');

  if (criticalIssues.length > 0) {
    score += 20;
    drivers.push(`${criticalIssues.length} unresolved CRITICAL bottleneck(s) pending resolution`);
    mitigations.push('Escalate critical impediments to State Chief Secretary / Ministry Apex Steering Committee');
  } else if (highIssues.length > 0) {
    score += 10;
    drivers.push(`${highIssues.length} high-severity issue(s) active on site`);
    mitigations.push('Convene inter-departmental task force for rapid statutory/utility clearances');
  }

  // Clamp score 0 - 100
  const riskScore = Math.min(Math.max(Math.round(score), 5), 100);

  // Category
  let riskCategory: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
  if (riskScore >= 75) riskCategory = 'Critical';
  else if (riskScore >= 50) riskCategory = 'High';
  else if (riskScore >= 30) riskCategory = 'Medium';

  // 3. Predictive Forecasts
  // Estimate at Completion (EAC) = ApprovedCost / CPI
  const estimatedCostAtCompletion = Number((approvedCost / cpi).toFixed(2));
  const projectedCostOverrun = Math.max(0, Number((estimatedCostAtCompletion - approvedCost).toFixed(2)));

  // Time forecasting:
  const startDate = new Date(project.startDate).getTime();
  const targetDate = new Date(project.targetCompletionDate).getTime();
  const totalPlannedDurationDays = Math.max(30, (targetDate - startDate) / (1000 * 60 * 60 * 24));

  // Projected duration based on SPI
  const projectedDurationDays = totalPlannedDurationDays / Math.max(spi, 0.3);
  const extraDays = Math.max(0, projectedDurationDays - totalPlannedDurationDays);
  const projectedDelayMonths = Number((extraDays / 30.4).toFixed(1));

  const predictedCompletionDate = new Date(targetDate + extraDays * 24 * 60 * 60 * 1000);

  if (drivers.length === 0) {
    drivers.push('Physical progress and financial expenditure are adhering closely to planned baseline targets.');
    mitigations.push('Maintain active biometric and sensor site monitoring to preserve project velocity.');
  }

  const explanation = `Project risk evaluated at ${riskScore}/100 (${riskCategory} Risk). Cost Performance Index is ${cpi} (threshold ≥ 1.0) and Schedule Performance Index is ${spi} (threshold ≥ 1.0). ${drivers.join('. ')}.`;

  return {
    riskScore,
    riskCategory,
    cpi,
    spi,
    costVariancePercent,
    scheduleSlippagePercent,
    projectedCostOverrun,
    projectedDelayMonths,
    predictedCompletionDate,
    primaryRiskDrivers: drivers,
    recommendedMitigations: mitigations,
    explanation
  };
}

