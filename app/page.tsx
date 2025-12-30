import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Timesheet Analytics</h1>
            <p className="text-muted-foreground">Track and analyze your timesheet data with powerful insights</p>
          </div>
          <ThemeToggle />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-internal">
            <CardHeader>
              <CardTitle className="text-internal">Internal Projects</CardTitle>
              <CardDescription>Company internal projects and operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 hours</div>
            </CardContent>
          </Card>

          <Card className="border-ops">
            <CardHeader>
              <CardTitle className="text-ops">Operations</CardTitle>
              <CardDescription>Operational tasks and maintenance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 hours</div>
            </CardContent>
          </Card>

          <Card className="border-rnd">
            <CardHeader>
              <CardTitle className="text-rnd">Research & Development</CardTitle>
              <CardDescription>Innovation and R&D projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 hours</div>
            </CardContent>
          </Card>

          <Card className="border-guiding">
            <CardHeader>
              <CardTitle className="text-guiding">Guiding</CardTitle>
              <CardDescription>Mentoring and guidance activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 hours</div>
            </CardContent>
          </Card>

          <Card className="border-pr">
            <CardHeader>
              <CardTitle className="text-pr">Public Relations</CardTitle>
              <CardDescription>Marketing and PR activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 hours</div>
            </CardContent>
          </Card>

          <Card className="border-ux">
            <CardHeader>
              <CardTitle className="text-ux">UX Design</CardTitle>
              <CardDescription>User experience and design work</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 hours</div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Your Timesheet Analytics application is ready</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Next.js 14 with App Router configured</li>
                <li>TypeScript and Tailwind CSS ready</li>
                <li>shadcn/ui components installed</li>
                <li>Dark mode support enabled</li>
                <li>Custom color scheme for project categories</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
