"use client";

import {
  Activity,
  FileText,
  LayoutGrid,
  ListTodo,
  Mail,
  Users,
} from "lucide-react";
import type * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface RecordTabsProps {
  overviewContent: React.ReactNode;
  className?: string;
}

export function RecordTabs({ overviewContent, className }: RecordTabsProps) {
  return (
    <Tabs
      className={cn("flex flex-1 flex-col", className)}
      defaultValue="overview"
    >
      <TabsList className="h-12 w-full justify-start rounded-none border-b bg-transparent px-6">
        <TabsTrigger
          className="gap-1.5 rounded-none border-primary/0 border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          value="overview"
        >
          <LayoutGrid className="size-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger
          className="gap-1.5 rounded-none border-primary/0 border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          value="activity"
        >
          <Activity className="size-4" />
          Activity
        </TabsTrigger>
        <TabsTrigger
          className="gap-1.5 rounded-none border-primary/0 border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          value="notes"
        >
          <FileText className="size-4" />
          Notes
          <span className="text-muted-foreground">0</span>
        </TabsTrigger>
        <TabsTrigger
          className="gap-1.5 rounded-none border-primary/0 border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          value="tasks"
        >
          <ListTodo className="size-4" />
          Tasks
          <span className="text-muted-foreground">0</span>
        </TabsTrigger>
        <TabsTrigger
          className="gap-1.5 rounded-none border-primary/0 border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          value="people"
        >
          <Users className="size-4" />
          Associated People
          <span className="text-muted-foreground">0</span>
        </TabsTrigger>
        <TabsTrigger
          className="gap-1.5 rounded-none border-primary/0 border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          value="emails"
        >
          <Mail className="size-4" />
          Emails
          <span className="text-muted-foreground">0</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent className="flex-1 overflow-auto p-6" value="overview">
        {overviewContent}
      </TabsContent>

      <TabsContent className="flex-1 p-6" value="activity">
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Activity view coming soon</p>
        </div>
      </TabsContent>

      <TabsContent className="flex-1 p-6" value="notes">
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Notes coming soon</p>
        </div>
      </TabsContent>

      <TabsContent className="flex-1 p-6" value="tasks">
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Tasks coming soon</p>
        </div>
      </TabsContent>

      <TabsContent className="flex-1 p-6" value="people">
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Associated People coming soon</p>
        </div>
      </TabsContent>

      <TabsContent className="flex-1 p-6" value="emails">
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Emails coming soon</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
