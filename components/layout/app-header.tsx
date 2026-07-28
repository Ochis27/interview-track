import { MobileNavigation } from "@/components/layout/mobile-navigation";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { applicationContent } from "@/content/application";

export function AppHeader() {
  const { interviewer } = applicationContent;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <MobileNavigation />

      <div className="ml-2 lg:ml-0">
        <p className="text-sm font-semibold">
          {applicationContent.name}
        </p>
        <p className="hidden text-xs text-muted-foreground sm:block">
          {applicationContent.workspaceLabel}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium">
            {interviewer.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {interviewer.role}
          </p>
        </div>

        <Avatar className="size-9">
          <AvatarFallback>
            {interviewer.initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}