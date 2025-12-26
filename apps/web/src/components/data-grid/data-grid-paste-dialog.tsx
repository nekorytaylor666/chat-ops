"use client";

import type { TableMeta } from "@tanstack/react-table";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAsRef } from "@/hooks/use-as-ref";
import { cn } from "@/lib/utils";
import type { PasteDialogState } from "@/types/data-grid";

interface DataGridPasteDialogProps<TData> {
  tableMeta: TableMeta<TData>;
  pasteDialog: PasteDialogState;
}

export function DataGridPasteDialog<TData>({
  tableMeta,
  pasteDialog,
}: DataGridPasteDialogProps<TData>) {
  const onPasteDialogOpenChange = tableMeta?.onPasteDialogOpenChange;
  const onCellsPaste = tableMeta?.onCellsPaste;

  if (!pasteDialog.open) return null;

  return (
    <PasteDialog
      onCellsPaste={onCellsPaste}
      onPasteDialogOpenChange={onPasteDialogOpenChange}
      pasteDialog={pasteDialog}
    />
  );
}

interface PasteDialogProps
  extends Pick<TableMeta<unknown>, "onPasteDialogOpenChange" | "onCellsPaste">,
    Required<Pick<TableMeta<unknown>, "pasteDialog">> {}

const PasteDialog = React.memo(PasteDialogImpl, (prev, next) => {
  if (prev.pasteDialog.open !== next.pasteDialog.open) return false;
  if (!next.pasteDialog.open) return true;
  if (prev.pasteDialog.rowsNeeded !== next.pasteDialog.rowsNeeded) return false;

  return true;
});

function PasteDialogImpl({
  pasteDialog,
  onPasteDialogOpenChange,
  onCellsPaste,
}: PasteDialogProps) {
  const propsRef = useAsRef({
    onPasteDialogOpenChange,
    onCellsPaste,
  });

  const expandRadioRef = React.useRef<HTMLInputElement | null>(null);

  const onOpenChange = React.useCallback(
    (open: boolean) => {
      propsRef.current.onPasteDialogOpenChange?.(open);
    },
    [propsRef]
  );

  const onCancel = React.useCallback(() => {
    propsRef.current.onPasteDialogOpenChange?.(false);
  }, [propsRef]);

  const onContinue = React.useCallback(() => {
    propsRef.current.onCellsPaste?.(expandRadioRef.current?.checked ?? false);
  }, [propsRef]);

  return (
    <Dialog onOpenChange={onOpenChange} open={pasteDialog.open}>
      <DialogContent data-grid-popover="">
        <DialogHeader>
          <DialogTitle>Хотите добавить больше строк?</DialogTitle>
          <DialogDescription>
            Нам нужно <strong>{pasteDialog.rowsNeeded}</strong> дополнительных
            строк для вставки всех данных из буфера обмена.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-1">
          <label className="flex cursor-pointer items-start gap-3">
            <RadioItem
              defaultChecked
              name="expand-option"
              ref={expandRadioRef}
              value="expand"
            />
            <div className="flex flex-col gap-1">
              <span className="font-medium text-sm leading-none">
                Создать новые строки
              </span>
              <span className="text-muted-foreground text-sm">
                Добавить {pasteDialog.rowsNeeded} новых строк в таблицу и
                вставить все данные
              </span>
            </div>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <RadioItem name="expand-option" value="no-expand" />
            <div className="flex flex-col gap-1">
              <span className="font-medium text-sm leading-none">
                Оставить текущие строки
              </span>
              <span className="text-muted-foreground text-sm">
                Вставить только то, что помещается в существующие строки
              </span>
            </div>
          </label>
        </div>
        <DialogFooter>
          <Button onClick={onCancel} variant="outline">
            Отмена
          </Button>
          <Button onClick={onContinue}>Продолжить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RadioItem({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "relative size-4 shrink-0 appearance-none rounded-full border border-input bg-background shadow-xs outline-none transition-[color,box-shadow]",
        "text-primary focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "checked:before:absolute checked:before:start-1/2 checked:before:top-1/2 checked:before:size-2 checked:before:-translate-x-1/2 checked:before:-translate-y-1/2 checked:before:rounded-full checked:before:bg-primary checked:before:content-['']",
        "dark:bg-input/30",
        className
      )}
      type="radio"
      {...props}
    />
  );
}
