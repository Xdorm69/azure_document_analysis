import { cn } from "cn";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RISK_TONE_CLASSES } from "@/lib/analysis-view";
import type { ActionItem, Entity } from "@/types/analysis";

const ENTITY_TYPE_LABEL: Record<Entity["type"], string> = {
  person: "Person",
  organization: "Organization",
  location: "Location",
  product: "Product",
  other: "Other",
};

export function EntitiesCard({ entities }: { entities: Entity[] }) {
  if (entities.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {entities.map((entity, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs"
              title={ENTITY_TYPE_LABEL[entity.type]}
            >
              <span className="font-medium">{entity.name}</span>
              <span className="text-muted-foreground">
                {ENTITY_TYPE_LABEL[entity.type]}
              </span>
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const PRIORITY_TONE: Record<ActionItem["priority"], "low" | "medium" | "high"> = {
  low: "low",
  medium: "medium",
  high: "high",
};

export function ActionItemsCard({ actionItems }: { actionItems: ActionItem[] }) {
  if (actionItems.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Action Items</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2.5">
          {actionItems.map((item, index) => {
            const toneClasses = RISK_TONE_CLASSES[PRIORITY_TONE[item.priority]];
            return (
              <li key={index} className="flex items-start gap-2.5 text-sm">
                <span
                  className={cn(
                    "mt-0.5 shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                    toneClasses.bg,
                    toneClasses.text
                  )}
                >
                  {item.priority}
                </span>
                <span>{item.action}</span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
