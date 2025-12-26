import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingComponent,
});

function OnboardingComponent() {
  const navigate = useNavigate();
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();

  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
    },
    onSubmit: async ({ value }) => {
      const result = await authClient.organization.create({
        name: value.name,
        slug: value.slug,
      });

      if (result.error) {
        toast.error(result.error.message || "Не удалось создать организацию");
        return;
      }

      // Set the new organization as active
      await authClient.organization.setActive({
        organizationId: result.data.id,
      });

      toast.success("Организация успешно создана");
      navigate({ to: "/" });
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "Название должно содержать минимум 2 символа"),
        slug: z
          .string()
          .min(2, "URL-адрес должен содержать минимум 2 символа")
          .regex(
            /^[a-z0-9-]+$/,
            "URL-адрес может содержать только строчные буквы, цифры и дефисы"
          ),
      }),
    },
  });

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    form.setFieldValue("name", name);
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    form.setFieldValue("slug", slug);
  };

  if (isSessionLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!session) {
    navigate({ to: "/login" });
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto w-full max-w-md p-6">
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-bold text-3xl">Добро пожаловать!</h1>
          <p className="text-muted-foreground">
            Создайте свою первую организацию, чтобы начать работу.
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Название организации</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Моя компания"
                  value={field.state.value}
                />
                {field.state.meta.errors.map((error) => (
                  <p className="text-red-500 text-sm" key={error?.message}>
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          <form.Field name="slug">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>URL-адрес</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="moya-kompaniya"
                  value={field.state.value}
                />
                <p className="text-muted-foreground text-xs">
                  Это будет использоваться в ссылках на вашу организацию.
                </p>
                {field.state.meta.errors.map((error) => (
                  <p className="text-red-500 text-sm" key={error?.message}>
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          <form.Subscribe>
            {(state) => (
              <Button
                className="w-full"
                disabled={!state.canSubmit || state.isSubmitting}
                type="submit"
              >
                {state.isSubmitting ? "Создание..." : "Создать организацию"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </div>
    </div>
  );
}
