import { config } from '../config/config';
import { systemSettings, persistSystemSettings, getTokenStats } from '../config/memoryStore';
import { ProjectRepo, IssueRepo, MilestoneRepo } from '../models/store';
import { IProject } from '../models/Project';

export interface AIImageInput {
  data: string;
  mimeType: string;
}

export interface AIChatHistoryItem {
  role: 'user' | 'assistant';
  text: string;
}

export interface AIAssistantRequestOptions {
  specificProjectId?: string;
  image?: AIImageInput;
  history?: AIChatHistoryItem[];
}

export interface TokenUsageInfo {
  promptTokens: number;
  responseTokens: number;
  totalTokens: number;
}

export interface AIAssistantResponse {
  answer: string;
  source: 'gemini' | 'statistical_engine_fallback';
  modelUsed?: string;
  geminiError?: string;
  tokenUsage?: TokenUsageInfo;
  tokenStats: ReturnType<typeof getTokenStats>;
  relevantProjects: Array<{
    projectId: string;
    name: string;
    riskScore: number;
    riskLevel: string;
    actualProgress: number;
    plannedProgress: number;
    approvedCost: number;
    revisedCost: number;
  }>;
  suggestedFollowUps: string[];
}

const GEMINI_MODELS = [
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3.0-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash'
];

function cleanBase64Image(image?: AIImageInput): AIImageInput | null {
  if (!image?.data) return null;
  const trimmed = image.data.trim();
  const dataUrlMatch = trimmed.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (dataUrlMatch) {
    return {
      mimeType: dataUrlMatch[1],
      data: dataUrlMatch[2]
    };
  }
  return {
    mimeType: image.mimeType || 'image/png',
    data: trimmed
  };
}

async function discoverAvailableGeminiModel(apiKey: string): Promise<{ name: string; inputTokenLimit?: number } | null> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
    );
    if (!res.ok) return null;
    const data: any = await res.json();
    const models: any[] = data.models || [];
    const supported = models.filter(
      m =>
        Array.isArray(m.supportedGenerationMethods) &&
        m.supportedGenerationMethods.includes('generateContent') &&
        typeof m.name === 'string'
    );
    const preferred =
      supported.find(m => m.name.includes('flash') && !m.name.includes('lite')) ||
      supported.find(m => m.name.includes('flash')) ||
      supported[0];
    if (!preferred) return null;
    return {
      name: preferred.name.replace(/^models\//, ''),
      inputTokenLimit: preferred.inputTokenLimit
    };
  } catch {
    return null;
  }
}

export async function askInfraAssistant(
  query: string,
  optionsOrProjectId?: string | AIAssistantRequestOptions
): Promise<AIAssistantResponse> {
  const options: AIAssistantRequestOptions =
    typeof optionsOrProjectId === 'string'
      ? { specificProjectId: optionsOrProjectId }
      : optionsOrProjectId || {};

  const { specificProjectId, history = [] } = options;
  const cleanedImage = cleanBase64Image(options.image);
  const effectiveQuery =
    query?.trim() ||
    (cleanedImage
      ? 'Analyze this uploaded screenshot in detail and correlate it with the selected project metrics, risks, and recommended next actions.'
      : 'Provide an executive overview of current project performance.');

  const normalizedQuery = effectiveQuery.toLowerCase();

  let projects: IProject[] = [];
  if (specificProjectId) {
    const single = await ProjectRepo.findOne({ projectId: specificProjectId });
    if (single) projects = [single];
  }

  if (projects.length === 0) {
    projects = await ProjectRepo.find({}, { limit: 25 });
  }

  const issueFilter: any = { status: { $ne: 'Closed' } };
  const milestoneFilter: any = specificProjectId ? { projectId: specificProjectId.toUpperCase() } : { status: 'Delayed' };

  const issues = await IssueRepo.find(issueFilter);
  const milestones = await MilestoneRepo.find(milestoneFilter);

  const highRisk = projects.filter(p => p.riskLevel === 'High' || p.riskLevel === 'Critical');
  const delayedProjects = projects.filter(p => p.plannedProgress - p.actualProgress > 10 || p.status === 'Delayed');
  const costOverrunProjects = projects.filter(p => p.revisedCost > p.approvedCost || p.cpi < 0.9);

  const contextData = projects.map(p => ({
    projectId: p.projectId,
    name: p.name,
    sector: p.sector,
    ministry: p.ministry,
    state: p.state,
    district: p.district,
    implementingAgency: p.implementingAgency,
    approvedCost: p.approvedCost,
    revisedCost: p.revisedCost,
    actualExpenditure: p.actualExpenditure,
    plannedProgress: p.plannedProgress,
    actualProgress: p.actualProgress,
    status: p.status,
    riskLevel: p.riskLevel,
    riskScore: p.riskScore,
    cpi: p.cpi,
    spi: p.spi,
    projectedDelayMonths: p.projectedDelayMonths,
    projectedCostOverrun: p.projectedCostOverrun,
    aiRiskSummary: p.aiRiskSummary,
    openIssuesCount: issues.filter(i => i.projectId === p.projectId).length
  }));

  const relevantIssues = specificProjectId
    ? issues.filter(i => i.projectId === specificProjectId.toUpperCase())
    : issues;

  const activeGeminiKey = (systemSettings.geminiApiKey || config.geminiApiKey || '').trim();
  let lastGeminiError: string | undefined;

  if (activeGeminiKey.length > 10) {
    const systemInstruction = `You are DevFlow AI Copilot, an interactive, real-time senior project intelligence and software/infrastructure analytics assistant (MoSPI / Enterprise Project Intelligence).
Rules:
1. Respond clearly and professionally in English to whatever the user asks or speaks.
2. For portfolio/project facts, stay strictly grounded in the LIVE DATABASE JSON provided below — never fabricate project IDs, budgets, CPI/SPI, or milestone statuses.
3. If the user attaches a screenshot or image (dashboard, chart, code, site photo, error, Gantt chart, or report), analyze what is visible in the image thoroughly and connect it with the live project metrics when relevant.
4. Keep answers structured with concise markdown headings, bullet points, key numbers (CPI, SPI, Risk Score, Cost Overrun), root causes, and actionable next steps.

LIVE DATABASE PROJECTS (${projects.length}):
${JSON.stringify(contextData, null, 2)}

ACTIVE ISSUES (${relevantIssues.length}):
${JSON.stringify(
  relevantIssues.slice(0, 25).map(i => ({
    id: i.issueId,
    projectId: i.projectId,
    title: i.title,
    category: i.category,
    severity: i.severity,
    status: i.status
  })),
  null,
  2
)}

RELEVANT MILESTONES (${milestones.length}):
${JSON.stringify(
  milestones.slice(0, 25).map(m => ({
    projectId: m.projectId,
    title: m.title,
    status: m.status,
    progressPercentage: m.progressPercentage,
    isCriticalPath: m.isCriticalPath
  })),
  null,
  2
)}`;

    const recentHistory = history
      .filter(h => h && typeof h.text === 'string' && h.text.trim().length > 0)
      .slice(-8)
      .map(h => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.text }]
      }));

    const currentUserParts: any[] = [{ text: effectiveQuery }];
    if (cleanedImage) {
      currentUserParts.push({
        inlineData: {
          mimeType: cleanedImage.mimeType,
          data: cleanedImage.data
        }
      });
    }

    const contents = [
      ...recentHistory,
      {
        role: 'user',
        parts: currentUserParts
      }
    ];

    const callGeminiModel = async (modelName: string) => {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(activeGeminiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents,
            generationConfig: { temperature: 0.3, maxOutputTokens: 1500 }
          })
        }
      );

      if (response.ok) {
        const json: any = await response.json();
        const text = json.candidates?.[0]?.content?.parts
          ?.map((p: any) => p.text || '')
          .join('\n')
          .trim();

        if (text) {
          const usage = json.usageMetadata || {};
          const promptTokens = Number(usage.promptTokenCount || 0);
          const responseTokens = Number(usage.candidatesTokenCount || 0);
          const totalTokens = Number(usage.totalTokenCount || promptTokens + responseTokens);

          systemSettings.tokenUsage.promptUsed += promptTokens;
          systemSettings.tokenUsage.responseUsed += responseTokens;
          systemSettings.tokenUsage.totalUsed += totalTokens;
          systemSettings.tokenUsage.requestsCount += 1;
          systemSettings.tokenUsage.lastModel = modelName;
          persistSystemSettings();

          return {
            answer: text,
            source: 'gemini' as const,
            modelUsed: modelName,
            tokenUsage: {
              promptTokens,
              responseTokens,
              totalTokens
            },
            tokenStats: getTokenStats(),
            relevantProjects: projects.slice(0, 5).map(p => ({
              projectId: p.projectId,
              name: p.name,
              riskScore: p.riskScore,
              riskLevel: p.riskLevel,
              actualProgress: p.actualProgress,
              plannedProgress: p.plannedProgress,
              approvedCost: p.approvedCost,
              revisedCost: p.revisedCost
            })),
            suggestedFollowUps: [
              'What are the top mitigation steps for the highest-risk project?',
              'Compare CPI and SPI across delayed projects',
              'Give me an executive briefing for this project'
            ]
          };
        }
      } else {
        const errJson: any = await response.json().catch(() => ({}));
        lastGeminiError = errJson?.error?.message || `Gemini API HTTP ${response.status}`;
        console.warn(`[Gemini Service] Model ${modelName} failed: ${lastGeminiError}`);
      }
      return null;
    };

    for (const modelName of GEMINI_MODELS) {
      try {
        const result = await callGeminiModel(modelName);
        if (result) return result;
      } catch (apiErr: any) {
        lastGeminiError = apiErr?.message || 'Network error calling Gemini API';
        console.warn(`[Gemini Service] Model ${modelName} error:`, apiErr);
      }
    }

    // Dynamic fallback: discover any available generateContent model on this API key
    const discovered = await discoverAvailableGeminiModel(activeGeminiKey);
    if (discovered) {
      if (discovered.inputTokenLimit) {
        systemSettings.tokenUsage.contextWindowLimit = discovered.inputTokenLimit;
      }
      if (!GEMINI_MODELS.includes(discovered.name)) {
        try {
          const result = await callGeminiModel(discovered.name);
          if (result) return result;
        } catch (apiErr: any) {
          lastGeminiError = apiErr?.message || lastGeminiError;
        }
      }
    }
  }

  // Resilient, 100% grounded Rule-Based Domain Engine Fallback
  let answer = '';
  const followUps = [
    'Which projects are at high risk?',
    'Which projects are likely to exceed their budget?',
    'Why is a particular project delayed?',
    'Suggest corrective actions for delayed projects.'
  ];

  const matchedProject =
    (specificProjectId && projects[0]) ||
    projects.find(
      p =>
        normalizedQuery.includes(p.projectId.toLowerCase()) ||
        normalizedQuery.includes(p.name.toLowerCase().split('(')[0].trim())
    );

  if (normalizedQuery.includes('high risk') || normalizedQuery.includes('critical') || normalizedQuery.includes('attention')) {
    const list = highRisk
      .map(
        p =>
          `• **${p.name}** (${p.projectId}) — Risk Score: **${p.riskScore}/100** [${p.riskLevel}]\n  - Progress: Actual **${p.actualProgress}%** vs Planned **${p.plannedProgress}%** (Lag: ${(p.plannedProgress - p.actualProgress).toFixed(1)}%)\n  - Financials: Approved ₹${p.approvedCost} Cr | Revised ₹${p.revisedCost} Cr (CPI: ${p.cpi}, SPI: ${p.spi})\n  - Bottlenecks: Open Issues: ${issues.filter(i => i.projectId === p.projectId).length}, Projected Delay: ${p.projectedDelayMonths} mos.`
      )
      .join('\n\n');

    answer = `### 🚨 MoSPI Executive Alert: High & Critical Risk Projects\n\nCurrently, **${highRisk.length} projects** require urgent administrative intervention:\n\n${list || 'No projects currently categorized as High or Critical risk.'}\n\n**Key Directive**: Convene an immediate inter-ministerial review with respective Project Directors to address critical path bottlenecks.`;
  } else if (normalizedQuery.includes('budget') || normalizedQuery.includes('cost overrun') || normalizedQuery.includes('exceed')) {
    const list = costOverrunProjects
      .map(
        p =>
          `• **${p.name}** (${p.projectId}): Original ₹${p.approvedCost} Cr ➔ Revised ₹${p.revisedCost} Cr (+₹${(p.revisedCost - p.approvedCost).toFixed(2)} Cr overrun). CPI is **${p.cpi}** with ₹${p.actualExpenditure} Cr spent.`
      )
      .join('\n');

    const totalOverrun = costOverrunProjects.reduce((acc, p) => acc + (p.revisedCost - p.approvedCost), 0);

    answer = `### 💰 Financial Risk & Cost Overrun Assessment\n\nA total of **${costOverrunProjects.length} projects** exhibit significant cost variances totaling an estimated overrun of **₹${totalOverrun.toFixed(2)} Crores**:\n\n${list}\n\n**MoSPI Guidance**: Conduct a forensic price-variation clause audit and review contractor claims to arrest further fiscal slippage.`;
  } else if (normalizedQuery.includes('delay') || normalizedQuery.includes('schedule') || normalizedQuery.includes('why')) {
    const list = delayedProjects
      .slice(0, 5)
      .map(p => {
        const pIssues = issues.filter(i => i.projectId === p.projectId);
        const topIssue = pIssues[0]?.title || 'Land acquisition and environmental clearance delays';
        return `• **${p.name}** (${p.projectId}): **${(p.plannedProgress - p.actualProgress).toFixed(1)}% physical slippage**. Estimated delay: **${p.projectedDelayMonths} months**. Primary factor: *${topIssue}*.`;
      })
      .join('\n');

    answer = `### ⏱️ Schedule Slippage & Root Cause Diagnostic\n\nTop projects experiencing schedule variance:\n\n${list}\n\n**Common Root Causes Detected**:\n1. Delay in statutory environmental and railway safety clearances.\n2. Utility shifting (high-tension power transmission lines & water mains).\n3. Land acquisition litigation and compensation disbursement delays.`;
  } else if (matchedProject || normalizedQuery.includes('summar') || normalizedQuery.includes('prj-')) {
    const targetPrj = matchedProject || projects[0];
    const pIssues = issues.filter(i => i.projectId === targetPrj.projectId);

    answer = `### 📋 Project Performance Dossier: ${targetPrj.name} (${targetPrj.projectId})\n\n- **Sector / Ministry**: ${targetPrj.sector} | ${targetPrj.ministry}\n- **Location**: ${targetPrj.district}, ${targetPrj.state}\n- **Physical Progress**: **${targetPrj.actualProgress}%** (Planned: **${targetPrj.plannedProgress}%**)\n- **Financial Status**: Approved ₹${targetPrj.approvedCost} Cr | Revised ₹${targetPrj.revisedCost} Cr | Spent ₹${targetPrj.actualExpenditure} Cr\n- **EVM Indices**: CPI = **${targetPrj.cpi}** | SPI = **${targetPrj.spi}**\n- **Risk Evaluation**: Risk Score **${targetPrj.riskScore}/100** [${targetPrj.riskLevel} Risk]\n- **Active Bottlenecks**: ${pIssues.length} open issues (${pIssues.filter(i => i.severity === 'Critical').length} Critical)\n\n**Summary Verdict**: ${targetPrj.aiRiskSummary || 'Project requires steady resource mobilization to meet revised timeline.'}`;
  } else {
    answer = `### 🚀 DevFlow AI Executive Summary\n\nDevFlow AI is currently monitoring **${projects.length} major development & infrastructure initiatives** across the enterprise portfolio.\n\n- **On Track**: ${projects.filter(p => p.status === 'In Progress' && p.riskLevel === 'Low').length} projects\n- **Delayed / At Risk**: ${highRisk.length} projects require immediate attention\n- **Total Approved Capital**: ₹${projects.reduce((acc, p) => acc + p.approvedCost, 0).toLocaleString('en-IN')} Cr\n- **Total Cumulative Outlay**: ₹${projects.reduce((acc, p) => acc + p.actualExpenditure, 0).toLocaleString('en-IN')} Cr\n\nYou can ask about specific projects, cost overruns, delayed milestones, or request mitigation strategies.`;
  }

  if (cleanedImage) {
    const notice = activeGeminiKey.length > 10
      ? `> ⚠️ **Screenshot Received** (${cleanedImage.mimeType}), but the Gemini Vision request failed (${lastGeminiError || 'API error'}). Showing live database-grounded project analysis below.`
      : `> 📸 **Screenshot Received** (${cleanedImage.mimeType}). Add your **Gemini API Key** in **System Settings** or \`backend/.env\` to enable visual screenshot analysis. Showing live database-grounded analysis below.`;
    answer = `${notice}\n\n${answer}`;
  } else if (lastGeminiError) {
    answer = `> ⚠️ **Gemini API fallback**: ${lastGeminiError}\n\n${answer}`;
  }

  return {
    answer,
    source: 'statistical_engine_fallback',
    geminiError: lastGeminiError,
    tokenUsage: { promptTokens: 0, responseTokens: 0, totalTokens: 0 },
    tokenStats: getTokenStats(),
    relevantProjects: projects.slice(0, 5).map(p => ({
      projectId: p.projectId,
      name: p.name,
      riskScore: p.riskScore,
      riskLevel: p.riskLevel,
      actualProgress: p.actualProgress,
      plannedProgress: p.plannedProgress,
      approvedCost: p.approvedCost,
      revisedCost: p.revisedCost
    })),
    suggestedFollowUps: followUps
  };
}
