"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteDialogProps {
  target: { id: string; name: string } | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteDialog({ target, onClose, onConfirm }: DeleteDialogProps) {
  return (
    <Dialog open={!!target} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="bg-card border-border sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Delete File</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete <strong className="text-foreground">&quot;{target?.name}&quot;</strong>?
          This will permanently remove the file from AWS S3 and cannot be undone.
        </p>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose} id="delete-cancel">Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} className="bg-gradient-to-br from-[#ef4444] to-[#dc2626]" id="delete-confirm">Delete Permanently</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
