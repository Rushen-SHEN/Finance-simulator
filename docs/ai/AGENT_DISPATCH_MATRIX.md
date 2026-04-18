# Specialist Agent Dispatch Matrix

| Sprint | Objective | Primary Specialist | Supporting Specialist | Entry Criteria | Exit Criteria |
|---|---|---|---|---|---|
| S1 | Clear lint gate on legacy flows | Frontend Developer | EvidenceQA | `98b2b4d` on `main`, build green, lint failure reproducible | `npm run lint` passes and `/` smoke test is green |
| S2 | Lock ARIA v2 numbers with golden checks | Test Results Analyzer | Backend Architect | S1 complete, `financial-model.v2.0.json` accepted as golden source | Baseline and named scenarios validated automatically |
| S3 | Reduce route ambiguity between legacy and ARIA v2 surfaces | ArchitectUX | project-manager-senior | S2 complete, baseline parity evidence available | Route ownership and migration/coexistence decision documented |
| S4 | Harden governance and operator guidance | project-manager-senior | Legal Compliance Checker | S3 complete, route contract agreed | Audit/export/docs rules written and linked from operator docs |
| S5 | Certify release readiness with evidence | testing-reality-checker | EvidenceQA | S1-S4 complete, lint/build/regression green | READY or NEEDS WORK verdict documented with evidence |

## Dispatch Notes

- 当同一个 sprint 出现技术阻塞且 30 分钟内无法收敛时，直接调度 `NEXUS` 做 expert panel brainstorm。
- S1 和 S2 是硬顺序，不能并行跳过；S3 之后才讨论产品收敛。
- 若 reviewer 只允许最小改动，优先执行 S1 + S2，S3-S5 可延后但必须记录风险。