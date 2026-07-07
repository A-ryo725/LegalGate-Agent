const companyRules = `
Risk level rules:
- Use "high" only for severe issues such as unlimited liability, unilateral penalties, unclear termination, or payment terms around 90 days or more.
- Use "medium" for moderate issues such as payment terms around 60 days, automatic renewal, or ambiguous inspection conditions.
- Use "low" for standard and balanced clauses such as 30-day termination notice, capped liability, no automatic renewal, no penalty, and normal payment timing.
- If the file content includes "想定リスク: low", do not return medium or high risks unless the text clearly contradicts it.
- For each risk, excerpt must be an exact sentence or phrase copied from the uploaded file content. Do not put the explanation in excerpt.
`.trim();

module.exports = {
  companyRules
};
