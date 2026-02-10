"use client";

import React from "react"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Application,
  ApplicationStatus,
  ApplicationPriority,
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
} from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface ApplicationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editApplication?: Application | null;
}

export function ApplicationForm({
  open,
  onOpenChange,
  onSuccess,
  editApplication,
}: ApplicationFormProps) {
  const isEditing = !!editApplication;

  const [company, setCompany] = useState(editApplication?.company ?? "");
  const [role, setRole] = useState(editApplication?.role ?? "");
  const [status, setStatus] = useState<ApplicationStatus>(
    editApplication?.status ?? "Applied"
  );
  const [dateApplied, setDateApplied] = useState(
    editApplication?.date_applied ?? new Date().toISOString().split("T")[0]
  );
  const [deadline, setDeadline] = useState(editApplication?.deadline ?? "");
  const [priority, setPriority] = useState<ApplicationPriority>(
    editApplication?.priority ?? "Medium"
  );
  const [notes, setNotes] = useState(editApplication?.notes ?? "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You must be logged in");
      setIsLoading(false);
      return;
    }

    const payload = {
      user_id: user.id,
      company,
      role,
      status,
      date_applied: dateApplied,
      deadline: deadline || null,
      priority,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (isEditing && editApplication) {
      const result = await supabase
        .from("applications")
        .update(payload)
        .eq("id", editApplication.id);
      error = result.error;
    } else {
      const result = await supabase.from("applications").insert(payload);
      error = result.error;
    }

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(
        isEditing ? "Application updated" : "Application added"
      );
      onSuccess();
      onOpenChange(false);
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? "Edit Application" : "Add Application"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Google"
                className="bg-background"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role / Position</Label>
              <Input
                id="role"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Software Engineer Intern"
                className="bg-background"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as ApplicationStatus)}
              >
                <SelectTrigger id="status" className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as ApplicationPriority)}
              >
                <SelectTrigger id="priority" className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="date-applied">Date Applied</Label>
              <Input
                id="date-applied"
                type="date"
                required
                value={dateApplied}
                onChange={(e) => setDateApplied(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-background"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this application..."
              className="min-h-[80px] bg-background resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? isEditing
                  ? "Saving..."
                  : "Adding..."
                : isEditing
                  ? "Save Changes"
                  : "Add Application"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
