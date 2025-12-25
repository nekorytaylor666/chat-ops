"use client";

import { Link } from "@tanstack/react-router";
import {
  BarChart2,
  Bell,
  Briefcase,
  Building2,
  CheckSquare,
  ChevronDown,
  ChevronsUpDown,
  List,
  Plus,
  Search,
  Star,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const mainNavItems = [
  { icon: Bell, label: "Notifications", to: "/" },
  { icon: CheckSquare, label: "Tasks", to: "/", badge: 1 },
  { icon: BarChart2, label: "Reports", to: "/" },
];

const automationItems = [
  { icon: Zap, label: "Sequences", to: "/" },
  { icon: Workflow, label: "Workflows", to: "/" },
];

const recordItems = [
  { icon: Building2, label: "Companies", to: "/" },
  { icon: Users, label: "People", to: "/" },
  { icon: Briefcase, label: "Deals", to: "/" },
  { icon: Users, label: "Users", to: "/" },
  { icon: Building2, label: "Workspaces", to: "/" },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="flex h-12 flex-row items-center justify-between border-b px-2">
        <SidebarMenu className="flex-1">
          <SidebarMenuItem>
            <SidebarMenuButton className="w-full" size="default">
              <div className="flex size-6 items-center justify-center rounded-md bg-primary font-semibold text-primary-foreground text-xs">
                T
              </div>
              <span className="font-semibold">test</span>
              <ChevronsUpDown className="ml-auto size-3" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarTrigger className="-mr-1" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full justify-start gap-2 text-muted-foreground">
                  <Search className="size-3" />
                  <span>Quick actions</span>
                  <kbd className="ml-auto rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                    K
                  </kbd>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <div className="my-2" />
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <Link to={item.to}>
                      <item.icon className="size-3 text-muted-foreground" />
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Collapsible className="group/collapsible" defaultOpen>
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center">
                Automations
                <ChevronDown className="ml-auto size-3 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {automationItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton asChild>
                        <Link to={item.to}>
                          <item.icon className="size-3 text-muted-foreground" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <Collapsible className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center">
                <Star className="mr-2 size-3 text-muted-foreground" />
                Favorites
                <ChevronDown className="ml-auto size-3 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="text-muted-foreground">
                      <span>No favorites</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <Collapsible className="group/collapsible" defaultOpen>
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center">
                Records
                <ChevronDown className="ml-auto size-3 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {recordItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton asChild>
                        <Link to={item.to}>
                          <item.icon className="size-3 text-muted-foreground" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <Collapsible className="group/collapsible" defaultOpen>
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center">
                <List className="mr-2 size-3" />
                Lists
                <ChevronDown className="ml-auto size-3 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Plus className="size-3 text-muted-foreground" />
                      <span>New list</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-muted">
                  <div className="h-full w-[43%] rounded-full bg-primary" />
                </div>
                <span className="text-muted-foreground text-xs">
                  Getting started 43%
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Users className="size-3 text-muted-foreground" />
              <span>Invite team members</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
