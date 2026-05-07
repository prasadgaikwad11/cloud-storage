"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RenameDialogProps {
  target: { id: string; name: string } | null;
  onClose: () => void;
  onConfirm: (newName: string) => void;
}

export function RenameDialog({ target, onClose, onConfirm }: RenameDialogProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (target) setName(target.name);
  }, [target]);

  return (
    <Dialog open={!!target} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="bg-card border-border sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Rename File</DialogTitle>
        </DialogHeader>
        <div>
          <Label htmlFor="rename-input" className="text-sm font-semibold text-muted-foreground mb-1.5 block">New File Name</Label>
          <Input id="rename-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter new name…" className="bg-[#1a1d2e] border-border" onKeyDown={(e) => { if (e.key === "Enter") onConfirm(name.trim()); if (e.key === "Escape") onClose(); }} autoFocus />
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose} id="rename-cancel">Cancel</Button>
          <Button onClick={() => onConfirm(name.trim())} className="bg-gradient-to-br from-[#6366f1] to-[#4f46e5] text-white" id="rename-confirm">Rename</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
