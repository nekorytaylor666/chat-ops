"use client";

import { Link } from "@tanstack/react-router";
import {
  BarChart2,
  Bell,
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
import { useEntities } from "@/hooks/use-entities";

const mainNavItems = [
  { icon: Bell, label: "Уведомления", to: "/" },
  { icon: CheckSquare, label: "Задачи", to: "/", badge: 1 },
  { icon: BarChart2, label: "Отчёты", to: "/" },
];

const automationItems = [
  { icon: Zap, label: "Последовательности", to: "/" },
  { icon: Workflow, label: "Рабочие процессы", to: "/" },
];

export function AppSidebar() {
  const { data: entities } = useEntities();

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
                  <span>Быстрые действия</span>
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
                Автоматизации
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
                Избранное
                <ChevronDown className="ml-auto size-3 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="text-muted-foreground">
                      <span>Нет избранного</span>
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
                Записи
                <ChevronDown className="ml-auto size-3 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {entities?.map((entity) => (
                    <SidebarMenuItem key={entity.id}>
                      <SidebarMenuButton asChild>
                        <Link
                          params={{ entitySlug: entity.slug }}
                          to="/entities/$entitySlug"
                        >
                          <Building2 className="size-3 text-muted-foreground" />
                          <span>{entity.pluralName}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  {(!entities || entities.length === 0) && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/entities">
                          <Plus className="size-3 text-muted-foreground" />
                          <span>Создать сущность</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
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
                Списки
                <ChevronDown className="ml-auto size-3 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Plus className="size-3 text-muted-foreground" />
                      <span>Новый список</span>
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
                  Начало работы 43%
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Users className="size-3 text-muted-foreground" />
              <span>Пригласить команду</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
