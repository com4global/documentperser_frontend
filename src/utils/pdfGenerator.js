/**
 * PDF Generator for Legal Analysis Reports
 * Uses a hidden iframe + window.print() for clean PDF output
 */

export function generateLegalPdf(analysis, fileName, language = 'en') {
    const riskColor = analysis.risk_score >= 70 ? '#ef4444' : analysis.risk_score >= 40 ? '#f59e0b' : '#22c55e';
    const riskLabel = analysis.risk_score >= 70 ? 'HIGH' : analysis.risk_score >= 40 ? 'MEDIUM' : 'LOW';
    const date = new Date().toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const issuesHtml = (analysis.issues || []).map(issue => `
    <div class="issue-item ${issue.severity}">
      <div class="severity-badge ${issue.severity}">${issue.severity?.toUpperCase()}</div>
      <div>
        <strong>${issue.title}</strong>
        <p>${issue.description}</p>
        ${issue.category ? `<span class="tag">${issue.category}</span>` : ''}
      </div>
    </div>
  `).join('');

    const actionsHtml = (analysis.actions || []).map(action => `
    <div class="action-item">
      <span class="priority ${action.priority}">${action.priority}</span>
      <div>
        <strong>${action.title}</strong>
        <p>${action.description}</p>
      </div>
    </div>
  `).join('');

    const conflictsHtml = (analysis.conflicts || []).map(c => `
    <div class="conflict-item">
      <strong>⚡ ${c.title}</strong>
      <p>${c.description}</p>
    </div>
  `).join('');

    const criticalHtml = (analysis.critical_findings || []).map(cf => `
    <div class="critical-item ${cf.severity}">
      <strong>${cf.severity === 'high' ? '🚨' : '⚠️'} ${cf.finding}</strong>
      <p>${cf.impact}</p>
    </div>
  `).join('');

    const clausesHtml = (analysis.key_clauses || []).map(cl => `
    <div class="clause-item ${cl.risk_level}">
      <div class="clause-header">
        <strong>${cl.clause_name}</strong>
        <span class="risk-tag ${cl.risk_level}">${cl.risk_level}</span>
      </div>
      ${cl.original_text ? `<blockquote>"${cl.original_text}"</blockquote>` : ''}
      <p>${cl.plain_english}</p>
      ${cl.notes ? `<div class="clause-note">⚠️ ${cl.notes}</div>` : ''}
    </div>
  `).join('');

    const breakdownHtml = analysis.risk_breakdown ? Object.entries(analysis.risk_breakdown).map(([key, val]) => `
    <div class="breakdown-row">
      <span class="breakdown-label">${key}</span>
      <div class="breakdown-bar"><div class="breakdown-fill" style="width:${val}%;background:${val >= 70 ? '#ef4444' : val >= 40 ? '#f59e0b' : '#22c55e'}"></div></div>
      <span class="breakdown-val">${val}%</span>
    </div>
  `).join('') : '';

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>Legal Analysis Report - ${fileName}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Tahoma, sans-serif; color: #1e293b; line-height: 1.6; padding: 40px; }
  .header { text-align: center; padding: 30px; border-bottom: 3px solid #6366f1; margin-bottom: 30px; }
  .header h1 { font-size: 24px; color: #6366f1; margin-bottom: 4px; }
  .header .sub { color: #64748b; font-size: 13px; }
  .header .file { font-size: 16px; color: #334155; margin-top: 8px; font-weight: 600; }
  .risk-banner { display: flex; align-items: center; justify-content: center; gap: 20px; padding: 20px; border-radius: 12px; margin-bottom: 24px; background: ${riskColor}10; border: 2px solid ${riskColor}30; }
  .risk-score { font-size: 48px; font-weight: 800; color: ${riskColor}; }
  .risk-info { text-align: left; }
  .risk-label { font-size: 18px; font-weight: 700; color: ${riskColor}; }
  .section { margin-bottom: 24px; page-break-inside: avoid; }
  .section-title { font-size: 16px; font-weight: 700; color: #6366f1; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px; }
  .summary { font-size: 14px; color: #334155; line-height: 1.8; background: #f8fafc; padding: 16px; border-radius: 8px; }
  .issue-item { display: flex; gap: 10px; padding: 10px; border-left: 3px solid #e2e8f0; margin-bottom: 8px; }
  .issue-item.high { border-left-color: #ef4444; }
  .issue-item.medium { border-left-color: #f59e0b; }
  .issue-item.low { border-left-color: #22c55e; }
  .severity-badge { padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; color: white; height: fit-content; }
  .severity-badge.high { background: #ef4444; }
  .severity-badge.medium { background: #f59e0b; }
  .severity-badge.low { background: #22c55e; }
  .issue-item p, .action-item p, .conflict-item p { font-size: 12px; color: #64748b; margin-top: 4px; }
  .issue-item strong, .action-item strong, .conflict-item strong { font-size: 13px; }
  .tag { font-size: 10px; background: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 4px; }
  .action-item { display: flex; gap: 10px; padding: 10px; margin-bottom: 8px; background: #f8fafc; border-radius: 8px; }
  .priority { padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; height: fit-content; }
  .priority.urgent { background: #fef2f2; color: #ef4444; }
  .priority.important { background: #fffbeb; color: #f59e0b; }
  .priority.recommended { background: #f0fdf4; color: #22c55e; }
  .conflict-item { padding: 10px; border: 1px solid #fed7aa; border-radius: 8px; margin-bottom: 8px; background: #fffbeb; }
  .critical-item { padding: 10px; border-left: 3px solid #ef4444; margin-bottom: 8px; background: #fef2f2; border-radius: 0 8px 8px 0; }
  .critical-item.medium { border-left-color: #f59e0b; background: #fffbeb; }
  .critical-item p { font-size: 12px; color: #64748b; margin-top: 4px; }
  .clause-item { padding: 12px; border-left: 3px solid #6366f1; margin-bottom: 10px; background: #f8fafc; border-radius: 0 8px 8px 0; }
  .clause-item.high { border-left-color: #ef4444; }
  .clause-item.medium { border-left-color: #f59e0b; }
  .clause-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .risk-tag { font-size: 10px; padding: 2px 8px; border-radius: 4px; font-weight: 700; text-transform: uppercase; }
  .risk-tag.high { background: #fef2f2; color: #ef4444; }
  .risk-tag.medium { background: #fffbeb; color: #f59e0b; }
  .risk-tag.low { background: #f0fdf4; color: #22c55e; }
  blockquote { font-style: italic; color: #64748b; padding: 8px 12px; border-left: 2px solid #c7d2fe; margin-bottom: 8px; font-size: 12px; }
  .clause-note { font-size: 12px; color: #92400e; background: #fffbeb; padding: 6px 10px; border-radius: 4px; margin-top: 6px; }
  .breakdown-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .breakdown-label { width: 100px; font-size: 12px; font-weight: 600; }
  .breakdown-bar { flex: 1; height: 10px; background: #f1f5f9; border-radius: 5px; overflow: hidden; }
  .breakdown-fill { height: 100%; border-radius: 5px; }
  .breakdown-val { width: 40px; text-align: right; font-size: 12px; font-weight: 700; }
  .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 11px; }
  @media print { body { padding: 20px; } .section { page-break-inside: avoid; } }
</style></head><body>
  <div class="header">
    <h1>⚖️ Legal Document Analysis Report</h1>
    <div class="sub">Generated by Zenzee AI on ${date}</div>
    <div class="file">📄 ${fileName}</div>
    ${analysis.document_type ? `<div class="sub">${analysis.document_type}${analysis.total_pages ? ` • ${analysis.total_pages} pages` : ''}</div>` : ''}
  </div>

  <div class="risk-banner">
    <div class="risk-score">${analysis.risk_score || 0}</div>
    <div class="risk-info">
      <div class="risk-label">${riskLabel} RISK</div>
      <div style="font-size:13px;color:#64748b">Overall Risk Assessment</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">📋 Summary</div>
    <div class="summary">${analysis.summary || 'No summary available.'}</div>
  </div>

  ${breakdownHtml ? `<div class="section"><div class="section-title">📊 Risk Breakdown</div>${breakdownHtml}</div>` : ''}
  ${criticalHtml ? `<div class="section"><div class="section-title">⚡ Critical Findings</div>${criticalHtml}</div>` : ''}
  ${issuesHtml ? `<div class="section"><div class="section-title">🔍 Issues Found (${analysis.issues?.length || 0})</div>${issuesHtml}</div>` : ''}
  ${actionsHtml ? `<div class="section"><div class="section-title">✅ Recommended Actions (${analysis.actions?.length || 0})</div>${actionsHtml}</div>` : ''}
  ${clausesHtml ? `<div class="section"><div class="section-title">📑 Key Clauses (${analysis.key_clauses?.length || 0})</div>${clausesHtml}</div>` : ''}
  ${conflictsHtml ? `<div class="section"><div class="section-title">⚠️ Conflicts (${analysis.conflicts?.length || 0})</div>${conflictsHtml}</div>` : ''}

  <div class="footer">
    <p>This report was auto-generated by Zenzee AI Legal Analyzer. It is intended for informational purposes only and does not constitute legal advice.</p>
    <p>© 2024 Zenzee AI • Enterprise Edition</p>
  </div>
</body></html>`;

    // Open in new window and trigger print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    }
}
