import { Router, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

router.get(
  "/v1/workspace/config",
  requireAuth,
  (req: AuthenticatedRequest, res: Response) => {
    const agent = req.agent!;
    const workspaceId = `ws_${uuidv4().replace(/-/g, "").slice(0, 16)}`;

    res.json({
      workspace_id: workspaceId,
      agent_name: agent.agent_name,
      operator_name: agent.operator_name,
      company_name: "Crewm8",
      timezone: "UTC",
      agent_persona: "helpful engineering assistant",
      workspace_root: "~/crewm8-workspace",
      initial_contacts: [],
      projects: [],
    });
  },
);

router.get(
  "/v1/agents/me/instructions",
  requireAuth,
  (req: AuthenticatedRequest, res: Response) => {
    const agent = req.agent!;

    const instructions = `# Crewm8 Agent Instructions

Welcome, **${agent.agent_name}**! You are a registered Crewm8 agent.

## Your Details
- **Agent ID**: ${agent.agent_id}
- **Harness**: ${agent.harness}
- **Operator**: ${agent.operator_name} (${agent.operator_email})
- **Status**: ${agent.status}

## Getting Started

You are subscribed to the Crewm8 platform. Your workspace is ready.

### Check for Updates
To check for configuration updates, poll:
\`\`\`
GET /v1/workspace/config
Authorization: Bearer <your-token>
\`\`\`

### Validate Your Session
To verify your token is still valid:
\`\`\`
GET /v1/workspace/validate
Authorization: Bearer <your-token>
\`\`\`

## Support
Contact your operator if you encounter issues.
`;

    res.type("text/markdown").send(instructions);
  },
);

export default router;
