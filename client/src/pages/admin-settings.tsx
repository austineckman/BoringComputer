import { useState, useEffect } from "react";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Form schemas
const siteInfoSchema = z.object({
  siteTitle: z.string().min(1, "Site title is required"),
  siteDescription: z.string().min(1, "Site description is required"),
  adminContactEmail: z.string().email("Invalid email address"),
  logoUrl: z.string().url("Must be a valid URL").or(z.string().length(0)),
});

const loginSettingsSchema = z.object({
  welcomeMessage: z.string().min(1, "Welcome message is required"),
  allowRegistration: z.boolean(),
  requireEmailVerification: z.boolean(),
});

const maintenanceSettingsSchema = z.object({
  databaseBackupSchedule: z.string().min(1, "Backup schedule is required"),
  maintenanceMode: z.boolean(),
  contentArchiveDays: z.string().transform(value => parseInt(value, 10)),
  performanceMode: z.enum(["balanced", "performance", "quality"]),
});

type SiteInfoValues = z.infer<typeof siteInfoSchema>;
type LoginSettingsValues = z.infer<typeof loginSettingsSchema>;
type MaintenanceSettingsValues = z.infer<typeof maintenanceSettingsSchema>;

export default function AdminSettingsPage() {
  const { settings, isLoading, getSetting, saveSetting } = useSystemSettings();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("site-info");
  const [isUpdating, setIsUpdating] = useState(false);

  // Forms
  const siteInfoForm = useForm<SiteInfoValues>({
    resolver: zodResolver(siteInfoSchema),
    defaultValues: {
      siteTitle: "",
      siteDescription: "",
      adminContactEmail: "",
      logoUrl: "",
    },
  });

  const loginSettingsForm = useForm<LoginSettingsValues>({
    resolver: zodResolver(loginSettingsSchema),
    defaultValues: {
      welcomeMessage: "",
      allowRegistration: true,
      requireEmailVerification: false,
    },
  });

  const maintenanceSettingsForm = useForm<MaintenanceSettingsValues>({
    resolver: zodResolver(maintenanceSettingsSchema),
    defaultValues: {
      databaseBackupSchedule: "daily",
      maintenanceMode: false,
      contentArchiveDays: "30",
      performanceMode: "balanced",
    },
  });

  // Update form values when settings are loaded
  useEffect(() => {
    if (settings) {
      // Site Info
      const siteTitle = getSetting("site.title")?.value || "Quest Giver";
      const siteDescription = getSetting("site.description")?.value || "STEM education platform";
      const adminContactEmail = getSetting("site.adminEmail")?.value || "admin@questgiver.com";
      const logoUrl = getSetting("site.logoUrl")?.value || "";

      siteInfoForm.reset({
        siteTitle,
        siteDescription,
        adminContactEmail,
        logoUrl,
      });

      // Login Settings
      const welcomeMessage = getSetting("login.welcomeMessage")?.value || "Welcome to Quest Giver!";
      const allowRegistration = getSetting("login.allowRegistration")?.value !== false;
      const requireEmailVerification = getSetting("login.requireEmailVerification")?.value === true;

      loginSettingsForm.reset({
        welcomeMessage,
        allowRegistration,
        requireEmailVerification,
      });

      // Maintenance Settings
      const databaseBackupSchedule = getSetting("maintenance.backupSchedule")?.value || "daily";
      const maintenanceMode = getSetting("maintenance.mode")?.value === true;
      const contentArchiveDays = getSetting("maintenance.contentArchiveDays")?.value?.toString() || "30";
      const performanceMode = getSetting("maintenance.performanceMode")?.value || "balanced";

      maintenanceSettingsForm.reset({
        databaseBackupSchedule,
        maintenanceMode,
        contentArchiveDays,
        performanceMode,
      });
    }
  }, [settings, getSetting]);

  // Handler for site info form submission
  const onSiteInfoSubmit = async (data: SiteInfoValues) => {
    setIsUpdating(true);
    try {
      await saveSetting("site.title", data.siteTitle, "site");
      await saveSetting("site.description", data.siteDescription, "site");
      await saveSetting("site.adminEmail", data.adminContactEmail, "site");
      if (data.logoUrl) {
        await saveSetting("site.logoUrl", data.logoUrl, "site");
      }
      toast({
        title: "Site settings updated",
        description: "Your site information has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update site settings.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handler for login settings form submission
  const onLoginSettingsSubmit = async (data: LoginSettingsValues) => {
    setIsUpdating(true);
    try {
      await saveSetting("login.welcomeMessage", data.welcomeMessage, "login");
      await saveSetting("login.allowRegistration", data.allowRegistration, "login");
      await saveSetting("login.requireEmailVerification", data.requireEmailVerification, "login");
      toast({
        title: "Login settings updated",
        description: "Your login settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update login settings.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handler for maintenance settings form submission
  const onMaintenanceSettingsSubmit = async (data: MaintenanceSettingsValues) => {
    setIsUpdating(true);
    try {
      await saveSetting("maintenance.backupSchedule", data.databaseBackupSchedule, "maintenance");
      await saveSetting("maintenance.mode", data.maintenanceMode, "maintenance");
      await saveSetting("maintenance.contentArchiveDays", parseInt(data.contentArchiveDays.toString()), "maintenance");
      await saveSetting("maintenance.performanceMode", data.performanceMode, "maintenance");
      toast({
        title: "Maintenance settings updated",
        description: "Your maintenance settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update maintenance settings.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">System Settings</h1>
        <p className="text-muted-foreground mb-6">
          Configure your platform's settings, appearance, and functionality.
        </p>

        <Tabs defaultValue="site-info" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="site-info">Site Information</TabsTrigger>
            <TabsTrigger value="login-settings">Login & Registration</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance & Performance</TabsTrigger>
          </TabsList>

          {/* Site Information */}
          <TabsContent value="site-info">
            <Card>
              <CardHeader>
                <CardTitle>Site Information</CardTitle>
                <CardDescription>
                  Configure the basic information about your platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...siteInfoForm}>
                  <form onSubmit={siteInfoForm.handleSubmit(onSiteInfoSubmit)} className="space-y-6">
                    <FormField
                      control={siteInfoForm.control}
                      name="siteTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Site Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            The name of your platform displayed in the browser tab and header.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={siteInfoForm.control}
                      name="siteDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Site Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormDescription>
                            A brief description of your platform shown on the login page.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={siteInfoForm.control}
                      name="adminContactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Contact Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormDescription>
                            The email address users can contact for support.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={siteInfoForm.control}
                      name="logoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logo URL</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://example.com/logo.png" />
                          </FormControl>
                          <FormDescription>
                            URL to your logo image. Leave blank to use the default.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Site Information
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Login Settings */}
          <TabsContent value="login-settings">
            <Card>
              <CardHeader>
                <CardTitle>Login & Registration Settings</CardTitle>
                <CardDescription>
                  Configure how users log in and register on your platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...loginSettingsForm}>
                  <form onSubmit={loginSettingsForm.handleSubmit(onLoginSettingsSubmit)} className="space-y-6">
                    <FormField
                      control={loginSettingsForm.control}
                      name="welcomeMessage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Welcome Message</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormDescription>
                            Message displayed to users on the login page.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginSettingsForm.control}
                      name="allowRegistration"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Allow New Registrations</FormLabel>
                            <FormDescription>
                              When disabled, new user registrations will be blocked.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginSettingsForm.control}
                      name="requireEmailVerification"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Require Email Verification</FormLabel>
                            <FormDescription>
                              When enabled, users must verify their email address before accessing the platform.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Login Settings
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Maintenance Settings */}
          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance & Performance</CardTitle>
                <CardDescription>
                  Configure system maintenance, backups, and performance settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...maintenanceSettingsForm}>
                  <form onSubmit={maintenanceSettingsForm.handleSubmit(onMaintenanceSettingsSubmit)} className="space-y-6">
                    <FormField
                      control={maintenanceSettingsForm.control}
                      name="maintenanceMode"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Maintenance Mode</FormLabel>
                            <FormDescription>
                              When enabled, only administrators can access the platform.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={maintenanceSettingsForm.control}
                      name="databaseBackupSchedule"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Database Backup Schedule</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select backup frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="manual">Manual Only</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How often database backups should be performed automatically.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={maintenanceSettingsForm.control}
                      name="contentArchiveDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content Archive Policy (Days)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormDescription>
                            Number of days to keep archived content before permanent deletion. Use 0 for no automatic archiving.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={maintenanceSettingsForm.control}
                      name="performanceMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Performance Mode</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select performance mode" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="balanced">Balanced (Default)</SelectItem>
                              <SelectItem value="performance">Performance (Lower Quality)</SelectItem>
                              <SelectItem value="quality">Quality (Higher Resource Usage)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Balance between server performance and visual quality.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Maintenance Settings
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}