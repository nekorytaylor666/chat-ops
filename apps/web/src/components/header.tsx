import type { LucideIcon } from "lucide-react";
import * as React from "react";
import UserMenu from "./user-menu";

interface PageHeaderProps {
  title: string;
  icon?: LucideIcon;
  count?: number;
}

interface PageToolbarProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
}

interface PageViewSettingsProps {
  children?: React.ReactNode;
}

const PageHeaderContext = React.createContext<{
  header: PageHeaderProps | null;
  setHeader: (header: PageHeaderProps | null) => void;
  toolbar: PageToolbarProps | null;
  setToolbar: (toolbar: PageToolbarProps | null) => void;
  viewSettings: React.ReactNode | null;
  setViewSettings: (viewSettings: React.ReactNode | null) => void;
} | null>(null);

export function PageHeaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [header, setHeader] = React.useState<PageHeaderProps | null>(null);
  const [toolbar, setToolbar] = React.useState<PageToolbarProps | null>(null);
  const [viewSettings, setViewSettings] =
    React.useState<React.ReactNode | null>(null);

  const value = React.useMemo(
    () => ({
      header,
      setHeader,
      toolbar,
      setToolbar,
      viewSettings,
      setViewSettings,
    }),
    [header, toolbar, viewSettings]
  );

  return (
    <PageHeaderContext.Provider value={value}>
      {children}
    </PageHeaderContext.Provider>
  );
}

export function usePageHeader() {
  const context = React.useContext(PageHeaderContext);
  if (!context) {
    throw new Error("usePageHeader must be used within PageHeaderProvider");
  }
  return context;
}

export function PageHeader({ title, icon, count }: PageHeaderProps) {
  const { setHeader } = usePageHeader();

  React.useEffect(() => {
    setHeader({ title, icon, count });
    return () => setHeader(null);
  }, [title, icon, count, setHeader]);

  return null;
}

export function PageToolbar({ left, right }: PageToolbarProps) {
  const { setToolbar } = usePageHeader();

  React.useEffect(() => {
    setToolbar({ left, right });
    return () => setToolbar(null);
  }, [left, right, setToolbar]);

  return null;
}

export function PageViewSettings({ children }: PageViewSettingsProps) {
  const { setViewSettings } = usePageHeader();

  React.useEffect(() => {
    setViewSettings(children);
    return () => setViewSettings(null);
  }, [children, setViewSettings]);

  return null;
}

export default function Header() {
  const context = React.useContext(PageHeaderContext);
  const header = context?.header;
  const toolbar = context?.toolbar;
  const viewSettings = context?.viewSettings;
  const Icon = header?.icon;

  return (
    <header className="flex shrink-0 flex-col border-b">
      {/* Row 1: Route title */}
      <div className="flex h-12 items-center gap-2 border-b px-4">
        {header && (
          <div className="flex items-center gap-2">
            {Icon && <Icon className="size-4 text-muted-foreground" />}
            <h1 className="font-semibold">{header.title}</h1>
            {header.count !== undefined && (
              <span className="text-muted-foreground text-sm">
                ({header.count.toLocaleString()})
              </span>
            )}
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          <UserMenu />
        </div>
      </div>

      {/* Row 2: Toolbar with actions */}
      {toolbar && (
        <div className="flex h-10 items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-2">{toolbar.left}</div>
          <div className="flex items-center gap-2">{toolbar.right}</div>
        </div>
      )}

      {/* Row 3: View settings (sort, filter, etc.) */}
      {viewSettings && (
        <div className="flex h-10 items-center gap-2 border-t px-4">
          {viewSettings}
        </div>
      )}
    </header>
  );
}
