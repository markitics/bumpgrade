"use client";

import { useRouter } from "next/navigation";
import { DragEvent, ReactNode, useEffect, useRef, useState } from "react";

const dragMimeType = "application/x-bumpgrade-funnel-block";
const draftEndpoint = "/api/admin/funnels/drafts";

type DragBlock = {
  blockId: string;
  draftId: string;
  sourceStepId: string;
};

type MoveResponse = {
  ok?: boolean;
  mode?: string;
  draft?: {
    revisionId?: string;
  };
  error?: string;
};

type DropStatus =
  | { kind: "idle"; message: string }
  | { kind: "moving"; message: string }
  | { kind: "done"; message: string }
  | { kind: "error"; message: string };

type AdminFunnelBlockDragDropProps = {
  children: ReactNode;
  disabled: boolean;
  draftId: string;
  label: string;
  revisionId: string;
  stepId: string;
};

function closestElement(target: EventTarget | null, selector: string) {
  return target instanceof Element ? target.closest<HTMLElement>(selector) : null;
}

function randomIdempotencyKey(prefix: string) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
}

function blockIdsIn(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>("[data-funnel-block-id]"))
    .map((block) => block.dataset.funnelBlockId ?? "")
    .filter(Boolean);
}

function parseDragBlock(raw: string): DragBlock | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<DragBlock>;
    if (!parsed.blockId || !parsed.draftId || !parsed.sourceStepId) return null;
    return {
      blockId: parsed.blockId,
      draftId: parsed.draftId,
      sourceStepId: parsed.sourceStepId,
    };
  } catch {
    return null;
  }
}

function dropInsertIndex(root: HTMLElement, event: DragEvent<HTMLElement>, draggedBlockId: string, sameStep: boolean) {
  const targetBlock = closestElement(event.target, "[data-funnel-block-id]");
  const order = blockIdsIn(root);
  const orderWithoutDragged = sameStep ? order.filter((id) => id !== draggedBlockId) : order;

  if (!targetBlock) return orderWithoutDragged.length;

  const targetBlockId = targetBlock.dataset.funnelBlockId;
  if (!targetBlockId || targetBlockId === draggedBlockId) return null;

  const targetIndex = orderWithoutDragged.indexOf(targetBlockId);
  if (targetIndex < 0) return orderWithoutDragged.length;

  const targetRect = targetBlock.getBoundingClientRect();
  const dropAfterTarget = event.clientY > targetRect.top + targetRect.height / 2;
  return targetIndex + (dropAfterTarget ? 1 : 0);
}

async function submitDraftMove(formData: FormData) {
  const response = await fetch(draftEndpoint, {
    method: "POST",
    headers: { accept: "application/json" },
    body: formData,
    credentials: "same-origin",
  });
  const payload = (await response.json()) as MoveResponse;

  if (!response.ok || !payload.ok || !payload.draft?.revisionId) {
    throw new Error(payload.error ?? "The block move could not be saved.");
  }

  return payload.draft.revisionId;
}

function appendBaseMoveFields(
  formData: FormData,
  input: {
    blockId: string;
    draftId: string;
    expectedRevisionId: string;
    idempotencyPrefix: string;
    stepId: string;
  },
) {
  formData.append("draftId", input.draftId);
  formData.append("stepId", input.stepId);
  formData.append("blockId", input.blockId);
  formData.append("expectedRevisionId", input.expectedRevisionId);
  formData.append("idempotencyKey", randomIdempotencyKey(input.idempotencyPrefix));
  formData.append("return", "json");
}

async function moveBlockWithinStep(input: {
  blockId: string;
  direction: "up" | "down";
  draftId: string;
  expectedRevisionId: string;
  stepId: string;
}) {
  const formData = new FormData();
  formData.append("mode", "move-block");
  formData.append("direction", input.direction);
  appendBaseMoveFields(formData, {
    blockId: input.blockId,
    draftId: input.draftId,
    expectedRevisionId: input.expectedRevisionId,
    idempotencyPrefix: `drag-block-${input.direction}`,
    stepId: input.stepId,
  });
  return submitDraftMove(formData);
}

async function moveBlockToStep(input: {
  blockId: string;
  draftId: string;
  expectedRevisionId: string;
  sourceStepId: string;
  targetStepId: string;
}) {
  const formData = new FormData();
  formData.append("mode", "move-block-to-step");
  formData.append("targetStepId", input.targetStepId);
  appendBaseMoveFields(formData, {
    blockId: input.blockId,
    draftId: input.draftId,
    expectedRevisionId: input.expectedRevisionId,
    idempotencyPrefix: "drag-block-step",
    stepId: input.sourceStepId,
  });
  return submitDraftMove(formData);
}

export function AdminFunnelBlockDragDrop({
  children,
  disabled,
  draftId,
  label,
  revisionId,
  stepId,
}: AdminFunnelBlockDragDropProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const revisionRef = useRef(revisionId);
  const [isDragTarget, setIsDragTarget] = useState(false);
  const [status, setStatus] = useState<DropStatus>({
    kind: "idle",
    message: "Block placement is ready.",
  });

  useEffect(() => {
    revisionRef.current = revisionId;
  }, [revisionId]);

  function handleDragStart(event: DragEvent<HTMLDivElement>) {
    if (disabled) return;

    const handle = closestElement(event.target, "[data-funnel-drag-block-id]");
    if (!handle) return;

    const blockId = handle.dataset.funnelDragBlockId;
    const sourceStepId = handle.dataset.funnelDragStepId;
    if (!blockId || !sourceStepId) return;

    const payload: DragBlock = { blockId, draftId, sourceStepId };
    const serializedPayload = JSON.stringify(payload);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(dragMimeType, serializedPayload);
    event.dataTransfer.setData("text/plain", serializedPayload);
    setStatus({ kind: "idle", message: "Block selected for placement." });
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    if (disabled) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setIsDragTarget(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    if (!rootRef.current || rootRef.current.contains(event.relatedTarget as Node | null)) return;
    setIsDragTarget(false);
  }

  async function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragTarget(false);
    if (disabled || !rootRef.current) return;

    const dragged = parseDragBlock(event.dataTransfer.getData(dragMimeType) || event.dataTransfer.getData("text/plain"));
    if (!dragged || dragged.draftId !== draftId) return;

    const sameStep = dragged.sourceStepId === stepId;
    const currentOrder = blockIdsIn(rootRef.current);
    const sourceIndex = currentOrder.indexOf(dragged.blockId);
    const insertIndex = dropInsertIndex(rootRef.current, event, dragged.blockId, sameStep);
    if (insertIndex === null) return;

    let expectedRevisionId = revisionRef.current;

    try {
      setStatus({ kind: "moving", message: "Saving block placement..." });

      if (sameStep) {
        if (sourceIndex < 0 || sourceIndex === insertIndex) {
          setStatus({ kind: "idle", message: "Block placement is unchanged." });
          return;
        }

        const direction = insertIndex < sourceIndex ? "up" : "down";
        const moveCount = Math.abs(insertIndex - sourceIndex);
        for (let index = 0; index < moveCount; index += 1) {
          expectedRevisionId = await moveBlockWithinStep({
            blockId: dragged.blockId,
            direction,
            draftId,
            expectedRevisionId,
            stepId,
          });
        }
      } else {
        expectedRevisionId = await moveBlockToStep({
          blockId: dragged.blockId,
          draftId,
          expectedRevisionId,
          sourceStepId: dragged.sourceStepId,
          targetStepId: stepId,
        });

        const appendedIndex = currentOrder.length;
        const moveCount = Math.max(0, appendedIndex - insertIndex);
        for (let index = 0; index < moveCount; index += 1) {
          expectedRevisionId = await moveBlockWithinStep({
            blockId: dragged.blockId,
            direction: "up",
            draftId,
            expectedRevisionId,
            stepId,
          });
        }
      }

      revisionRef.current = expectedRevisionId;
      setStatus({ kind: "done", message: "Block placement saved." });
      router.refresh();
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "The block placement could not be saved.",
      });
    }
  }

  return (
    <div
      ref={rootRef}
      className={`admin-block-edit-list ${isDragTarget ? "drag-target" : ""} ${status.kind === "moving" ? "drag-saving" : ""}`}
      aria-label={label}
      data-funnel-drag-step-id={stepId}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={(event) => void handleDrop(event)}
    >
      {children}
      <p className={`admin-block-drag-status ${status.kind}`} aria-live="polite">
        {status.message}
      </p>
    </div>
  );
}
