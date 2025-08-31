
import { ThemeSwitch } from "@/components/theme-switch";
import { Button } from "@heroui/button";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
      <div className="relative flex flex-col min-h-screen">
        {/* Main content area - responsive container */}
        <main className="flex-1 w-full">
          {/* Mobile-first container that centers on larger screens */}
          <div className="w-full max-w-sm min-h-screen mx-auto bg-background border-x border-divider lg:border-x-2">
            {/* Theme switch positioned within the mobile container */}
            <Button
              className="fixed z-50 bottom-20 right-2 sm:right-[calc(50%-12rem)] lg:right-[calc(50%-12rem)]"
              isIconOnly
              radius="full"
              color="primary"
              variant="flat"
            >
              <ThemeSwitch />
            </Button>

            {/* App content */}
            <div className="relative overflow-x-hidden">
              {children}
            </div>
          </div>
        </main>
      </div>
    // </Providers>
  );
}