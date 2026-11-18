import {
  clampCardSize,
  createCanvasElement,
  estimateCanvasElementSize,
  getCanvasContentWidth,
  normalizeCanvasElements,
  snapDeferralCoord,
  DEFERRAL_CARD_PADDING,
  type DeferralCanvasElement,
} from "@shared/deferralCardCanvas";
import { serializeDeferralButtonContent, type DeferralButtonContent } from "@shared/deferralCardButton";
import type { DeferralBlockType } from "@shared/deferralCardLayout";
import type { DeferralScenarioId } from "@shared/deferralCardTypes";

export type CardTemplateCategory = "general" | "ban" | "whitelist" | "queue";

export type CardTemplateCanvas = {
  width: number;
  height: number;
  elements: DeferralCanvasElement[];
};

type Block = {
  type: DeferralBlockType;
  content?: string;
  fontSize?: number;
  button?: Partial<DeferralButtonContent>;
  gapAfter?: number;
  height?: number;
  align?: "start" | "center";
};

type TemplateSpec = {
  id: string;
  name: string;
  description: string;
  category: CardTemplateCategory;
  width: number;
  scenarios: readonly DeferralScenarioId[] | "all";
  blocks: (scenarioId: DeferralScenarioId) => Block[];
};

export type CardTemplate = Omit<TemplateSpec, "blocks"> & {
  build: (scenarioId: DeferralScenarioId, title?: string) => CardTemplateCanvas;
};

const BAN_SCENARIOS = ["ban_temporary", "ban_permanent"] as const satisfies readonly DeferralScenarioId[];

const WHITELIST_SCENARIOS = [
  "whitelist_pending",
  "whitelist_schedule_closed",
  "whitelist_discord_member_denied",
  "whitelist_discord_roles_not_member",
  "whitelist_discord_roles_no_roles",
  "whitelist_insufficient_license",
] as const satisfies readonly DeferralScenarioId[];

const MAINTENANCE_SCENARIOS = [
  "whitelist_admin_denied",
  "whitelist_admin_insufficient_ids",
  "whitelist_error",
  "access_denied",
] as const satisfies readonly DeferralScenarioId[];

const DISCORD_BLURPLE = "#5865F2";

const BLOCK_GAP = 12;

const TEMPLATE_HEIGHT_MIN = 160;

const REJECTION_MEASURE_SAMPLE =
  "You can join https://discord.gg/example to appeal this ban. Mention the ID shown on this card.";

function buildCanvas(
  width: number,
  blocks: Block[],
  scenarioId: DeferralScenarioId,
  title: string,
): CardTemplateCanvas {
  const contentWidth = getCanvasContentWidth(width);
  const elements: DeferralCanvasElement[] = [];
  let y = 0;
  blocks.forEach((block, index) => {
    const base = createCanvasElement(block.type, y, width);
    const fontSize = block.fontSize ?? base.style?.fontSize;
    let el: DeferralCanvasElement = {
      ...base,
      id: `tpl:${scenarioId}:${index}:${block.type}`,
      content: block.content ?? base.content,
      style: { ...base.style, ...(fontSize ? { fontSize } : {}) },
    };
    if (block.type === "button") {
      el.content = serializeDeferralButtonContent(
        {
          label: "Join Discord",
          url: "{discordInvite}",
          backgroundColor: DISCORD_BLURPLE,
          textColor: "#ffffff",
          ...block.button,
        },
        { sanitizeColors: false },
      );
    }
    if (block.type === "spacer") {
      el = { ...el, width: 24, height: block.height ?? 8 };
    } else if (block.type !== "divider" && block.type !== "custom_image") {
      const measureContent =
        el.type === "heading" && !el.content?.trim()
          ? title || "Title"
          : el.type === "rejection_message"
            ? REJECTION_MEASURE_SAMPLE
            : el.content;
      const measured = estimateCanvasElementSize(
        {
          ...el,
          content: measureContent,
          width: undefined,
          height: undefined,
        },
        contentWidth,
      );
      el = { ...el, width: measured.width, height: measured.height };
    }
    if (block.align === "center" && el.width) {
      el = { ...el, x: snapDeferralCoord(Math.max(0, (contentWidth - el.width) / 2)) };
    }
    el = { ...el, y: snapDeferralCoord(y) };
    elements.push(el);
    y = el.y + (el.height ?? 24) + (block.gapAfter ?? BLOCK_GAP);
  });
  const contentBottom = elements.reduce((max, el) => Math.max(max, el.y + (el.height ?? 24)), 0);
  const size = clampCardSize(width, Math.max(TEMPLATE_HEIGHT_MIN, contentBottom + DEFERRAL_CARD_PADDING * 2 + 8));
  return {
    width: size.width,
    height: size.height,
    elements: normalizeCanvasElements(elements, size.width, size.height),
  };
}

const SPECS: TemplateSpec[] = [
  {
    id: "discord-cta",
    name: "Discord call to action",
    description: "Title, the rejection reason and a big Discord button. Works for every scenario.",
    category: "general",
    width: 640,
    scenarios: "all",
    blocks: () => [
      { type: "heading" },
      { type: "rejection_message", fontSize: 18 },
      { type: "divider" },
      { type: "custom_text", content: "Questions? Our team answers on Discord.", fontSize: 16, gapAfter: 8 },
      { type: "button", button: { label: "Join our Discord" } },
    ],
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Compact card with only the title and the reason. Quiet and to the point.",
    category: "general",
    width: 440,
    scenarios: "all",
    blocks: () => [
      { type: "heading", fontSize: 20 },
      { type: "rejection_message", fontSize: 16 },
    ],
  },
  {
    id: "branded",
    name: "Server branded",
    description: "Leads with your server name and greets the player by name.",
    category: "general",
    width: 600,
    scenarios: "all",
    blocks: () => [
      { type: "custom_text", content: "<strong>{serverName}</strong>", fontSize: 14, gapAfter: 4 },
      { type: "heading" },
      { type: "rejection_message", fontSize: 18 },
      { type: "divider" },
      { type: "custom_text", content: "Connecting as {playerName}", fontSize: 14 },
    ],
  },
  {
    id: "support",
    name: "Support ticket",
    description: "Points players to your support channel with a clear next step.",
    category: "general",
    width: 640,
    scenarios: "all",
    blocks: () => [
      { type: "heading" },
      { type: "rejection_message", fontSize: 18 },
      { type: "divider" },
      {
        type: "custom_text",
        content: "Need help? Open a ticket on Discord and attach a screenshot of this card.",
        fontSize: 16,
        gapAfter: 8,
      },
      { type: "button", button: { label: "Open a ticket", backgroundColor: "#248046" } },
    ],
  },
  {
    id: "ban-appeal",
    name: "Ban with appeal",
    description: "Every ban detail in one place plus an appeal button. Uses the ban fields.",
    category: "ban",
    width: 640,
    scenarios: BAN_SCENARIOS,
    blocks: (scenarioId) => [
      { type: "heading" },
      { type: "ban_reason", fontSize: 18, gapAfter: 4 },
      ...(scenarioId === "ban_temporary" ? [{ type: "ban_expires", fontSize: 18, gapAfter: 4 } as Block] : []),
      { type: "ban_id", fontSize: 18 },
      { type: "divider" },
      {
        type: "custom_text",
        content: "Think this was a mistake? Appeal on Discord and include your Ban ID.",
        fontSize: 16,
        gapAfter: 8,
      },
      { type: "button", button: { label: "Appeal this ban", backgroundColor: "#da373c" } },
    ],
  },
  {
    id: "ban-strict",
    name: "Ban notice",
    description: "No appeal path. Reason and ID only, for zero tolerance servers.",
    category: "ban",
    width: 560,
    scenarios: BAN_SCENARIOS,
    blocks: (scenarioId) => [
      { type: "heading", fontSize: 20 },
      { type: "ban_reason", fontSize: 16, gapAfter: 4 },
      ...(scenarioId === "ban_temporary" ? [{ type: "ban_expires", fontSize: 16, gapAfter: 4 } as Block] : []),
      { type: "ban_id", fontSize: 16 },
    ],
  },
  {
    id: "whitelist-apply",
    name: "Whitelist application",
    description: "Explains the whitelist and sends players to apply. Shows the request ID when pending.",
    category: "whitelist",
    width: 640,
    scenarios: WHITELIST_SCENARIOS,
    blocks: (scenarioId) => [
      { type: "heading" },
      {
        type: "custom_text",
        content: "{serverName} is whitelisted. Apply on our Discord to get access.",
        fontSize: 18,
      },
      { type: "rejection_message", fontSize: 16 },
      ...(scenarioId === "whitelist_pending" ? [{ type: "request_id", fontSize: 18 } as Block] : []),
      { type: "divider" },
      { type: "button", button: { label: "Apply on Discord" } },
    ],
  },
  {
    id: "maintenance",
    name: "Maintenance",
    description: "Friendly downtime notice with a link to status updates.",
    category: "general",
    width: 600,
    scenarios: MAINTENANCE_SCENARIOS,
    blocks: () => [
      { type: "heading", content: "We'll be right back" },
      {
        type: "custom_text",
        content: "The server is in maintenance while we ship an update. Follow progress on Discord.",
        fontSize: 18,
      },
      { type: "divider" },
      { type: "button", button: { label: "Status updates" } },
    ],
  },
  {
    id: "queue-status",
    name: "Queue status",
    description: "Live position, queue size and estimated wait for your queue resource.",
    category: "queue",
    width: 560,
    scenarios: ["connection_queue"],
    blocks: () => [
      { type: "heading", content: "{serverName}" },
      { type: "custom_text", content: "You are <strong>#{queuePosition}</strong> of {queueSize} in the queue.", fontSize: 18, gapAfter: 4 },
      { type: "custom_text", content: "Estimated wait: <strong>{queueEta}</strong>", fontSize: 18 },
      { type: "divider" },
      { type: "custom_text", content: "Hang tight, you will connect automatically.", fontSize: 14, gapAfter: 8 },
      { type: "button", button: { label: "Chat while you wait" } },
    ],
  },
];

export const CARD_TEMPLATES: CardTemplate[] = SPECS.map(({ blocks, ...spec }) => ({
  ...spec,
  build: (scenarioId, title = "") => buildCanvas(spec.width, blocks(scenarioId), scenarioId, title),
}));

export function templateSupportsScenario(template: CardTemplate, scenarioId: string): boolean {
  return template.scenarios === "all" || (template.scenarios as readonly string[]).includes(scenarioId);
}

export function templatesForScenario(scenarioId: string | null): CardTemplate[] {
  if (!scenarioId) return [];
  return CARD_TEMPLATES.filter((tpl) => templateSupportsScenario(tpl, scenarioId));
}
