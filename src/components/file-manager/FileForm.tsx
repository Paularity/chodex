import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  fullPath: z.string().min(1, "Full path is required"),
  fileType: z.string().min(1, "File type is required"),
  creator: z.string().min(1, "Creator is required"),
  readOnly: z.boolean().optional(),
  encrypted: z.boolean().optional(),
  stamp: z.string(),
  size: z.coerce.number().min(0, "Size is required"),
  tags: z.string().optional().nullable(),
  hash: z.string().min(1, "Hash is required"),
});

export type FileFormData = z.infer<typeof schema>;

interface Props {
  defaultValues: FileFormData;
  onSubmit: (data: FileFormData) => void;
  loading?: boolean;
  onCancel?: () => void;
}

export default function FileForm({ defaultValues, onSubmit, loading = false, onCancel }: Props) {
  const form = useForm<FileFormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          name="fullPath"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Path</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fileType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>File Type</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="creator"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Creator</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="readOnly"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormLabel>Read Only</FormLabel>
                <FormControl>
                  <input type="checkbox" checked={field.value} onChange={field.onChange} className="size-4" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="encrypted"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormLabel>Encrypted</FormLabel>
                <FormControl>
                  <input type="checkbox" checked={field.value} onChange={field.onChange} className="size-4" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Size (bytes)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="hash"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hash</FormLabel>
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
            {loading && <span className="w-4 h-4 animate-spin border-2 border-current border-t-transparent rounded-full" />}
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}
