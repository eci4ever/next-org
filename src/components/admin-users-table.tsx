"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  BanIcon,
  MoreHorizontalIcon,
  PlusIcon,
  RotateCcwIcon,
  SearchIcon,
  ShieldIcon,
  Trash2Icon,
  UserRoundIcon,
  XIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  type AdminUserActionState,
  banAdminUser,
  createAdminUser,
  impersonateAdminUser,
  removeAdminUser,
  setAdminUserRole,
  unbanAdminUser,
} from "@/actions/admin-users";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string | null;
  banned: boolean;
  banReason: string | null;
  banExpires: string | null;
  createdAt: string | null;
};

type AdminUsersTableProps = {
  users: AdminUserRow[];
  currentUserId: string;
};

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().optional(),
  role: z.enum(["user", "admin"]),
});

const setRoleSchema = z.object({
  role: z.enum(["user", "admin"]),
});

const pageSizeOptions = ["10", "20", "50"];

const globalFilterFn = (
  row: { original: AdminUserRow },
  _columnId: string,
  filterValue: string,
) => {
  const q = filterValue.toLowerCase();
  return (
    row.original.name.toLowerCase().includes(q) ||
    row.original.email.toLowerCase().includes(q)
  );
};

function formatDateTime(value: string | null) {
  if (!value) return "Unknown";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getInitials(name: string, email: string) {
  const source = name || email;
  return source.slice(0, 2).toUpperCase();
}

function roleValue(role: string | null) {
  return role === "admin" ? "admin" : "user";
}

function statusLabel(user: AdminUserRow) {
  return user.banned ? "Banned" : "Active";
}

const SortHeader = React.memo(function SortHeader({
  column,
  label,
}: {
  column: {
    getIsSorted: () => false | "asc" | "desc";
    toggleSorting: (desc?: boolean) => void;
  };
  label: string;
}) {
  const sorted = column.getIsSorted();
  const Icon =
    sorted === "asc"
      ? ArrowUpIcon
      : sorted === "desc"
        ? ArrowDownIcon
        : ArrowUpDownIcon;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="-ml-2"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {label}
      <Icon data-icon="inline-end" aria-hidden="true" />
    </Button>
  );
});

export function AdminUsersTable({
  users,
  currentUserId,
}: AdminUsersTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setGlobalFilter(searchInput), 300);
  }, [searchInput]);

  const hasActiveFilters = globalFilter !== "" || columnFilters.length > 0;

  const columns = useMemo<ColumnDef<AdminUserRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <SortHeader column={column} label="User" />,
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="size-8">
                <AvatarImage src={user.image ?? ""} alt={user.name} />
                <AvatarFallback className="text-xs">
                  {getInitials(user.name, user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">
                  {user.name || "Unnamed user"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const role = roleValue(row.original.role);
          return (
            <Badge variant={role === "admin" ? "default" : "secondary"}>
              {role === "admin" ? "Admin" : "User"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "banned",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => (
          <Badge variant={row.original.banned ? "destructive" : "outline"}>
            {statusLabel(row.original)}
          </Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <SortHeader column={column} label="Joined" />,
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <UserActions user={row.original} currentUserId={currentUserId} />
        ),
      },
    ],
    [currentUserId],
  );

  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const pageSize = table.getState().pagination.pageSize;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 md:max-w-xs">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email…"
            aria-label="Search users"
            className="h-9 pl-9 text-sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={
              (columnFilters.find((f) => f.id === "role")?.value as string) ??
              "all"
            }
            onValueChange={(value) =>
              typeof value === "string" &&
              setColumnFilters((prev) => {
                const rest = prev.filter(
                  (f) => f.id !== "role" && f.id !== "banned",
                );
                if (value === "all")
                  return [...rest, { id: "banned", value: false }];
                return [...rest, { id: "role", value }];
              })
            }
          >
            <SelectTrigger size="sm" className="w-[110px]">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="user">Users</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            value={
              columnFilters.find((f) => f.id === "role")
                ? "all"
                : ((columnFilters.find((f) => f.id === "banned")
                    ?.value as string) ?? "all")
            }
            onValueChange={(value) =>
              typeof value === "string" &&
              setColumnFilters((prev) => {
                const rest = prev.filter(
                  (f) => f.id !== "role" && f.id !== "banned",
                );
                if (value === "all") return rest;
                return [...rest, { id: "banned", value: value === "banned" }];
              })
            }
          >
            <SelectTrigger size="sm" className="w-[110px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchInput("");
                setGlobalFilter("");
                setColumnFilters([]);
              }}
            >
              <RotateCcwIcon data-icon="inline-start" aria-hidden="true" />
              Reset
            </Button>
          ) : null}
        </div>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {hasActiveFilters ? (
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        No matching users.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setGlobalFilter("");
                          setColumnFilters([]);
                        }}
                      >
                        <XIcon data-icon="inline-start" aria-hidden="true" />
                        Clear filters
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No users yet.
                    </p>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {users.length ? (
        <div className="flex items-center justify-between px-2">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} row(s) total.
          </div>
          <div className="flex items-center gap-6 lg:gap-8">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={String(pageSize)}
                onValueChange={(value) =>
                  typeof value === "string" && table.setPageSize(Number(value))
                }
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={String(pageSize)} />
                </SelectTrigger>
                <SelectContent side="top">
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ArrowDownIcon className="size-4 rotate-90" aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ArrowDownIcon className="size-4 -rotate-90" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type CreateUserForm = z.infer<typeof createUserSchema>;

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const form = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: "", email: "", password: "", role: "user" },
  });

  async function onSubmit(values: CreateUserForm) {
    setPending(true);
    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("email", values.email);
    formData.set("password", values.password ?? "");
    formData.set("role", values.role);
    const result = await createAdminUser(undefined, formData);
    if (result?.error) toast.error(result.error);
    if (result?.success) {
      toast.success(result.success);
      form.reset();
      setOpen(false);
      router.refresh();
    }
    setPending(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="lg" />}>
        <PlusIcon data-icon="inline-start" aria-hidden="true" />
        New user
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Create user</DialogTitle>
          <DialogDescription>
            Add a new user and assign their initial role.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <Field>
              <FieldLabel htmlFor="create-user-name">
                Name <span className="text-destructive">*</span>
              </FieldLabel>
              <Input id="create-user-name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="create-user-email">
                Email <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="create-user-email"
                type="email"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="create-user-password">Password</FieldLabel>
              <Input
                id="create-user-password"
                type="password"
                autoComplete="new-password"
                {...form.register("password")}
              />
              <FieldDescription>
                Leave blank for a credential-less account.
              </FieldDescription>
            </Field>
            <Controller
              control={form.control}
              name="role"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Role</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full" aria-label="Role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating…" : "Create user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const UserActions = React.memo(function UserActions({
  user,
  currentUserId,
}: {
  user: AdminUserRow;
  currentUserId: string;
}) {
  const isCurrentUser = user.id === currentUserId;
  const [roleOpen, setRoleOpen] = useState(false);
  const [banOpen, setBanOpen] = useState(false);
  const [unbanOpen, setUnbanOpen] = useState(false);
  const [impersonateOpen, setImpersonateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <MoreHorizontalIcon />
          <span className="sr-only">Open user actions</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              disabled={isCurrentUser}
              onClick={() => !isCurrentUser && setRoleOpen(true)}
            >
              <ShieldIcon aria-hidden="true" />
              Change role
            </DropdownMenuItem>
            {user.banned ? (
              <DropdownMenuItem onClick={() => setUnbanOpen(true)}>
                <BanIcon aria-hidden="true" />
                Unban user
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                disabled={isCurrentUser}
                onClick={() => !isCurrentUser && setBanOpen(true)}
              >
                <BanIcon aria-hidden="true" />
                Ban user
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              disabled={isCurrentUser}
              onClick={() => !isCurrentUser && setImpersonateOpen(true)}
            >
              <UserRoundIcon aria-hidden="true" />
              Impersonate
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              variant="destructive"
              disabled={isCurrentUser}
              onClick={() => !isCurrentUser && setDeleteOpen(true)}
            >
              <Trash2Icon aria-hidden="true" />
              Delete user
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <RoleDialog user={user} open={roleOpen} onOpenChange={setRoleOpen} />
      <BanDialog user={user} open={banOpen} onOpenChange={setBanOpen} />
      <ConfirmUserActionDialog
        user={user}
        open={unbanOpen}
        onOpenChange={setUnbanOpen}
        action={unbanAdminUser}
        title="Unban user?"
        description={`${user.email} will be able to sign in again.`}
        submitLabel="Unban user"
      />
      <ConfirmUserActionDialog
        user={user}
        open={impersonateOpen}
        onOpenChange={setImpersonateOpen}
        action={impersonateAdminUser}
        title="Impersonate user?"
        description={`You will start a temporary session as ${user.email}.`}
        submitLabel="Impersonate"
      />
      <ConfirmUserActionDialog
        user={user}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        action={removeAdminUser}
        title="Delete user?"
        description={`${user.email} and their sessions will be permanently removed.`}
        submitLabel="Delete user"
        destructive
      />
    </>
  );
});

type SetRoleForm = z.infer<typeof setRoleSchema>;

function RoleDialog({
  user,
  open,
  onOpenChange,
}: {
  user: AdminUserRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const form = useForm<SetRoleForm>({
    resolver: zodResolver(setRoleSchema),
    defaultValues: { role: roleValue(user.role) as "user" | "admin" },
  });

  async function onSubmit(values: SetRoleForm) {
    setPending(true);
    const formData = new FormData();
    formData.set("userId", user.id);
    formData.set("role", values.role);
    const result = await setAdminUserRole(undefined, formData);
    if (result?.error) toast.error(result.error);
    if (result?.success) {
      toast.success(result.success);
      onOpenChange(false);
      router.refresh();
    }
    setPending(false);
  }

  return (
    <Dialog
      key={`role-${user.id}-${open}`}
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Edit role</DialogTitle>
          <DialogDescription>
            Change the platform role for{" "}
            <span className="font-medium text-foreground">{user.email}</span>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <p className="text-sm text-muted-foreground">
            Current role:{" "}
            <span className="font-medium text-foreground">
              {roleValue(user.role)}
            </span>
          </p>
          <div className="mt-4 grid gap-4">
            <Controller
              control={form.control}
              name="role"
              render={({ field }) => (
                <Field>
                  <FieldLabel>New role</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full" aria-label="New role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function BanDialog({
  user,
  open,
  onOpenChange,
}: {
  user: AdminUserRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const form = useForm({
    defaultValues: { banReason: "", banExpiresIn: "" },
  });

  async function onSubmit(values: { banReason: string; banExpiresIn: string }) {
    setPending(true);
    const formData = new FormData();
    formData.set("userId", user.id);
    formData.set("banReason", values.banReason);
    formData.set("banExpiresIn", values.banExpiresIn);
    const result = await banAdminUser(undefined, formData);
    if (result?.error) toast.error(result.error);
    if (result?.success) {
      toast.success(result.success);
      form.reset();
      onOpenChange(false);
      router.refresh();
    }
    setPending(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Ban user</DialogTitle>
          <DialogDescription>
            Revoke access for{" "}
            <span className="font-medium text-foreground">{user.email}</span>{" "}
            and invalidate their sessions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <Field>
              <FieldLabel htmlFor={`ban-reason-${user.id}`}>Reason</FieldLabel>
              <Textarea
                id={`ban-reason-${user.id}`}
                placeholder="Policy violation"
                {...form.register("banReason")}
              />
            </Field>
            <Controller
              control={form.control}
              name="banExpiresIn"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Duration</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full" aria-label="Duration">
                      <SelectValue placeholder="Indefinite" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="">Indefinite</SelectItem>
                        <SelectItem value="86400">1 day</SelectItem>
                        <SelectItem value="604800">7 days</SelectItem>
                        <SelectItem value="2592000">30 days</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? "Banning…" : "Ban user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AdminUsersTableSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-20" />
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((row) => (
              <TableRow key={row}>
                {[1, 2, 3, 4, 5, 6].map((col) => (
                  <TableCell key={col}>
                    <Skeleton
                      className={`h-4 ${col === 1 ? "w-6" : col === 2 ? "w-56" : col === 3 ? "w-14" : col === 4 ? "w-14" : col === 5 ? "w-32" : "w-8"}`}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-2">
        <Skeleton className="h-4 w-36" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-12" />
        </div>
      </div>
    </div>
  );
}

function ConfirmUserActionDialog({
  user,
  open,
  onOpenChange,
  action,
  title,
  description,
  submitLabel,
  destructive = false,
}: {
  user: AdminUserRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: (
    prevState: AdminUserActionState,
    formData: FormData,
  ) => Promise<AdminUserActionState>;
  title: string;
  description: string;
  submitLabel: string;
  destructive?: boolean;
}) {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleConfirm() {
    setPending(true);
    const formData = new FormData();
    formData.set("userId", user.id);
    const result = await action(undefined, formData);
    if (result?.error) toast.error(result.error);
    if (result?.success) {
      toast.success(result.success);
      onOpenChange(false);
      router.refresh();
    }
    setPending(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            type="button"
            disabled={pending}
            variant={destructive ? "destructive" : "default"}
            onClick={handleConfirm}
          >
            {pending ? "Working…" : submitLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
