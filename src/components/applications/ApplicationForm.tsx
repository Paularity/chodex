import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

const schema = z.object({
  id: z.string().uuid({ message: "Id is required" }),
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  basePath: z.string().min(1, "Base path is required"),
  url: z.string().url("Invalid URL"),
  description: z.string().optional(),
  isOnline: z.boolean(),
  lastChecked: z.string(),
  version: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  owner: z.string().optional().nullable(),
});

export type ApplicationFormData = z.infer<typeof schema>;

interface Props {
  defaultValues: ApplicationFormData;
  onSubmit: (data: ApplicationFormData) => void;
  submitLabel?: string;
  loading?: boolean;
  onCancel?: () => void;
}

export default function ApplicationForm({ defaultValues, onSubmit, submitLabel = "Save", loading = false, onCancel }: Props) {
  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="basePath"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base Path</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={loading} className="flex items-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
