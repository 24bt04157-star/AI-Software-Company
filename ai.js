
const titleMap={srs:'Software Requirements Specification',userStories:'User Stories',architecture:'Architecture Design',sprintPlan:'Sprint Plan',estimate:'Cost & Timeline Estimate',uml:'UML / Workflow Diagram',testCases:'QA Test Cases',apiDesign:'API Design'};
function demo(type,p){
 const features=p.requirements?.features?.length?p.requirements.features:['User-friendly interface','Core user workflow','Admin management'];
 const list=features.map((x,i)=>`- FR-${String(i+1).padStart(2,'0')}: The system shall support ${x}.`).join('\n');
 const bodies={
 srs:`# Software Requirements Specification\n\n## Purpose\nDefine the requirements for ${p.title}.\n\n## Overview\n${p.idea}\n\n## Functional requirements\n${list}\n\n## Non-functional requirements\n- Validate inputs and show clear errors.\n- Protect private data and enforce role permissions.\n- Provide a responsive interface.\n- Log relevant changes and handle service failures.\n\n## Assumptions\nConfirm user roles, integrations, hosting, budget, and deadline before implementation.`,
 userStories:`# User Stories\n\n${features.map((x,i)=>`## US-${i+1}: ${x}\nAs a relevant user, I want to ${x.toLowerCase()}, so that I can complete the intended workflow.\n\n**Acceptance criteria**\n- Authorized users can complete the action.\n- Invalid inputs are rejected with a useful message.\n- The behavior is covered by a test.`).join('\n\n')}`,
 architecture:`# Architecture Design\n\n- Frontend: React + Vite\n- Backend: Node.js + Express REST API\n- Database: MongoDB (optional; local JSON fallback in this demo)\n- AI: Gemini API through backend provider adapter\n\n## Components\n1. Browser UI: chat, artifacts, tasks, bugs, dashboard.\n2. Express API: authentication, validation, project services.\n3. Persistence: users, projects, artifacts, tasks, bugs.\n4. AI service: role prompt, provider call, output handling.\n\nKeep API keys server-side. Validate model output and review generated content before deployment.`,
 sprintPlan:`# Suggested Sprint Plan\n\n## Sprint 1 — Foundation\n- Set up project repository, authentication, and project CRUD.\n- Build dashboard shell and persistence.\n\n## Sprint 2 — AI planning\n- Add Business Analyst chat.\n- Generate and save SRS and user stories.\n\n## Sprint 3 — Project management\n- Add tasks, bug tracker, artifact editor, and progress metrics.\n\n## Sprint 4 — Quality and delivery\n- Test permissions and failure states.\n- Polish responsive UI and document deployment.\n\nDuration depends on team availability and final scope.`,
 estimate:`# Preliminary Estimate\n\nA focused academic MVP may take about 8–12 weeks for a small team working part-time. Advanced code generation, live preview, and deployment can add several weeks.\n\nEstimated cost formula: person-hours × agreed hourly rate + contingency.\n\nThis is a planning estimate, not a quote. Confirm scope, team size, rates, API pricing, hosting, and maintenance.`,
 uml:`# Workflow diagram\n\n\`\`\`mermaid\nflowchart TD\nA[Client idea] --> B[AI Business Analyst]\nB --> C[Structured requirements]\nC --> D[Solution Architect]\nC --> E[Project Manager]\nD --> F[Architecture and API plan]\nE --> G[Sprints and tasks]\nF --> H[QA test plan]\nG --> H\nH --> I[Review and delivery]\n\`\`\`\n\nReview and adapt the diagram to confirmed requirements.`,
 testCases:`# QA Test Cases\n\n${features.map((x,i)=>`## TC-${i+1}: ${x}\n- Preconditions: authorized user has access to the project.\n- Steps: open the relevant screen, submit valid input.\n- Expected: the feature behaves as specified and saves successfully.\n- Negative test: submit missing/invalid input and expect a clear validation error.`).join('\n\n')}\n\n## Cross-cutting checks\n- A user cannot access another user's project.\n- AI provider failure is shown as a failure, not a fake success.\n- Saved updates remain after refresh.`,
 apiDesign:`# API Design\n\n| Method | Route | Purpose |\n|---|---|---|\n| POST | /api/projects | Create project |\n| GET | /api/projects/:id | Read project |\n| PATCH | /api/projects/:id | Update project |\n| POST | /api/projects/:id/chat | AI consultation |\n| POST | /api/projects/:id/artifacts/generate | Generate artifact |\n| POST | /api/projects/:id/tasks | Create task |\n| POST | /api/projects/:id/bugs | Create bug |\n\nPrivate routes require authentication and project ownership validation. Validate inputs and return structured errors.`
 };
 return bodies[type]||`# ${titleMap[type]||type}\n\n${p.idea}\n\nReview assumptions and edit this draft before use.`;
}
export async function generateAI({role,prompt,project,history=[]}){
 const key=process.env.GEMINI_API_KEY;
 if(!key){
  if(role==='Business Analyst')return {text:`Thanks for sharing your idea for ${project.title}.\n\nTo refine it, please clarify:\n1. Who are the main users?\n2. What are the three most important features?\n3. Is this web, mobile, or both?\n4. Are payment, email, maps, or third-party integrations needed?\n5. Is there a budget or deadline?\n\nDemo mode is active because GEMINI_API_KEY is not configured.`,provider:'demo',demo:true};
  return {text:demo(prompt,project),provider:'demo',demo:true};
 }
 const model=process.env.GEMINI_MODEL||'gemini-2.5-flash';
 const context=JSON.stringify({title:project.title,idea:project.idea,platform:project.platform,requirements:project.requirements}).slice(0,12000);
 const request=`You are the ${role} in an AI Software Company. Work from the supplied context, label assumptions, and produce structured useful output. Do not claim unperformed actions.\nPROJECT:\n${context}\nRECENT CHAT:\n${history.slice(-6).map(m=>`${m.role}: ${m.content}`).join('\n').slice(0,4000)}\nREQUEST:\n${prompt}`;
 const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{role:'user',parts:[{text:request}]}],generationConfig:{temperature:.35,maxOutputTokens:4500}})});
 const d=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(d?.error?.message||`Gemini API error ${r.status}`);
 const text=(d.candidates||[]).flatMap(c=>c.content?.parts||[]).map(p=>p.text||'').join('\n').trim();
 if(!text)throw new Error('AI provider returned an empty response.');
 return {text,provider:model,demo:false};
}
export const artifactTitles=titleMap;
