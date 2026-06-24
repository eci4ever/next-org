"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type OnChangeFn,
  type PaginationState,
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
  SearchIcon,
  ShieldIcon,
  Trash2Icon,
  UserRoundIcon,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export type AdminUsersFilters = {
  q: string;
  searchField: "email" | "name";
  role: "all" | "user" | "admin";
  status: "all" | "active" | "banned";
  sort: string;
  page: number;
  pageSize: number;
};

type AdminUsersTableProps = {
  users: AdminUserRow[];
  total: number;
  filters: AdminUsersFilters;
  currentUserId: string;
};

const pageSizeOptions = ["10", "20", "50"];
const defaultSort = "createdAt:desc";

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

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

function formatDate(value: string | null) {
  if (!value) {
    return "Unknown";
  }

  return dateFormatter.format(new Date(value));
}

function parseSorting(sort: string): SortingState {
  const [id, direction] = sort.split(":");

  if (!id) {
    return [{ id: "createdAt", desc: true }];
  }

  return [{ id, desc: direction !== "asc" }];
}

function serializeSorting(sorting: SortingState) {
  const [firstSort] = sorting;

  if (!firstSort) {
    return defaultSort;
  }

  return `${firstSort.id}:${firstSort.desc ? "desc" : "asc"}`;
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
      <Icon data-icon="inline-end" />
    </Button>
  );
});

function useQueryUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return React.useCallback(
    (updates: Record<string, string | number | null | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === undefined || value === "") {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }

      const query = next.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams],
  );
}

function useActionFeedback(
  state: AdminUserActionState,
  onSuccess?: () => void,
) {
  const router = useRouter();

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }

    if (state?.success) {
      toast.success(state.success);
      onSuccess?.();
      router.refresh();
    }
  }, [onSuccess, router, state]);
}

export function AdminUsersTable({
  users,
  total,
  filters,
  currentUserId,
}: AdminUsersTableProps) {
  const updateQuery = useQueryUpdater();
  const [search, setSearch] = useState(filters.q);
  const pageCount = Math.max(1, Math.ceil(total / filters.pageSize));
  const sorting = useMemo(() => parseSorting(filters.sort), [filters.sort]);
  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex: filters.page - 1,
      pageSize: filters.pageSize,
    }),
    [filters.page, filters.pageSize],
  );

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    const nextSorting =
      typeof updater === "function" ? updater(sorting) : updater;

    updateQuery({
      sort: serializeSorting(nextSorting),
      page: 1,
    });
  };

  const handlePaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const nextPagination =
      typeof updater === "function" ? updater(pagination) : updater;

    updateQuery({
      page: nextPagination.pageIndex + 1,
      pageSize: nextPagination.pageSize,
    });
  };

  const columns = useMemo<ColumnDef<AdminUserRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <SortHeader column={column} label="User" />,
        cell: ({ row }) => {
          const user = row.original;

          return (
            <div className="flex min-w-56 items-center gap-3">
              <Avatar className="size-9">
                <AvatarImage src={user.image ?? ""} alt={user.name} />
                <AvatarFallback>
                  {getInitials(user.name, user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate font-medium">
                  {user.name || "Unnamed user"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.id}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "email",
        header: ({ column }) => <SortHeader column={column} label="Email" />,
        cell: ({ row }) => (
          <span className="block max-w-64 truncate">{row.original.email}</span>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const role = roleValue(row.original.role);

          return (
            <Badge variant={role === "admin" ? "default" : "secondary"}>
              {role}
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
        header: ({ column }) => <SortHeader column={column} label="Created" />,
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        id: "actions",
        enableSorting: false,
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
    pageCount,
    state: {
      sorting,
      pagination,
    },
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    onSortingChange: handleSortingChange,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
  });

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateQuery({
      q: search,
      page: 1,
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <form
          onSubmit={handleSearchSubmit}
          className="flex w-full flex-col gap-2 sm:flex-row md:max-w-2xl"
        >
          <Select
            value={filters.searchField}
            onValueChange={(value) =>
              typeof value === "string" &&
              updateQuery({
                searchField: value,
                page: 1,
              })
            }
          >
            <SelectTrigger size="sm" className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className="flex min-w-0 flex-1 gap-2">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users"
              className="min-w-0"
            />
            <Button type="submit" variant="outline">
              <SearchIcon data-icon="inline-start" />
              Search
            </Button>
          </div>
        </form>
        <CreateUserDialog />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle>Users</CardTitle>
            <CardDescription>
              {total} {total === 1 ? "user" : "users"} found
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select
              value={filters.role}
              onValueChange={(value) =>
                typeof value === "string" &&
                updateQuery({
                  role: value === "all" ? null : value,
                  status: null,
                  page: 1,
                })
              }
            >
              <SelectTrigger size="sm" className="w-full sm:w-36">
                <SelectValue />
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
              value={filters.status}
              onValueChange={(value) =>
                typeof value === "string" &&
                updateQuery({
                  status: value === "all" ? null : value,
                  role: null,
                  page: 1,
                })
              }
            >
              <SelectTrigger size="sm" className="w-full sm:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {users.length ? (
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
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <UserRoundIcon />
                </EmptyMedia>
                <EmptyTitle>No users found</EmptyTitle>
                <EmptyDescription>
                  Adjust the search or filters to find matching users.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    updateQuery({
                      q: null,
                      role: null,
                      status: null,
                      page: 1,
                    })
                  }
                >
                  Clear filters
                </Button>
              </EmptyContent>
            </Empty>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              Page {filters.page} of {pageCount}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select
                value={String(filters.pageSize)}
                onValueChange={(value) =>
                  typeof value === "string" && table.setPageSize(Number(value))
                }
              >
                <SelectTrigger size="sm" className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {pageSizeOptions.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value} rows
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!table.getCanPreviousPage()}
                  onClick={() => table.previousPage()}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!table.getCanNextPage()}
                  onClick={() => table.nextPage()}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("user");
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    createAdminUser,
    undefined,
  );

  useActionFeedback(state, () => {
    formRef.current?.reset();
    setRole("user");
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        New user
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create user</DialogTitle>
          <DialogDescription>
            Add a user with a platform role. Password is optional.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction}>
          <input type="hidden" name="role" value={role} />
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="create-user-name">Name</FieldLabel>
              <Input id="create-user-name" name="name" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="create-user-email">Email</FieldLabel>
              <Input
                id="create-user-email"
                name="email"
                type="email"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="create-user-password">Password</FieldLabel>
              <Input
                id="create-user-password"
                name="password"
                type="password"
                autoComplete="new-password"
              />
              <FieldDescription>
                Leave blank for a credential-less account.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel>Role</FieldLabel>
              <Select
                value={role}
                onValueChange={(value) =>
                  typeof value === "string" && setRole(value)
                }
              >
                <SelectTrigger className="w-full">
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
          </FieldGroup>
          <DialogFooter className="mt-6">
            <DialogTrigger render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogTrigger>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create user"}
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
              <ShieldIcon />
              Change role
            </DropdownMenuItem>
            {user.banned ? (
              <DropdownMenuItem onClick={() => setUnbanOpen(true)}>
                <BanIcon />
                Unban user
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                disabled={isCurrentUser}
                onClick={() => !isCurrentUser && setBanOpen(true)}
              >
                <BanIcon />
                Ban user
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              disabled={isCurrentUser}
              onClick={() => !isCurrentUser && setImpersonateOpen(true)}
            >
              <UserRoundIcon />
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
              <Trash2Icon />
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

function RoleDialog({
  user,
  open,
  onOpenChange,
}: {
  user: AdminUserRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [role, setRole] = useState(roleValue(user.role));
  const [state, formAction, pending] = useActionState(
    setAdminUserRole,
    undefined,
  );

  useActionFeedback(state, () => onOpenChange(false));

  return (
    <Dialog
      key={`role-${user.id}-${open}`}
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change role</DialogTitle>
          <DialogDescription>
            Update the platform role for {user.email}.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <input type="hidden" name="userId" value={user.id} />
          <input type="hidden" name="role" value={role} />
          <FieldGroup>
            <Field>
              <FieldLabel>Role</FieldLabel>
              <Select
                value={role}
                onValueChange={(value) =>
                  typeof value === "string" && setRole(value)
                }
              >
                <SelectTrigger className="w-full">
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
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save role"}
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
  const [expiresIn, setExpiresIn] = useState("");
  const [state, formAction, pending] = useActionState(banAdminUser, undefined);

  useActionFeedback(state, () => {
    setExpiresIn("");
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban user</DialogTitle>
          <DialogDescription>
            Ban {user.email} and revoke their sessions.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <input type="hidden" name="userId" value={user.id} />
          <input type="hidden" name="banExpiresIn" value={expiresIn} />
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`ban-reason-${user.id}`}>Reason</FieldLabel>
              <Textarea
                id={`ban-reason-${user.id}`}
                name="banReason"
                placeholder="Policy violation"
              />
            </Field>
            <Field>
              <FieldLabel>Duration</FieldLabel>
              <Select
                value={expiresIn}
                onValueChange={(value) =>
                  typeof value === "string" && setExpiresIn(value)
                }
              >
                <SelectTrigger className="w-full">
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
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? "Banning..." : "Ban user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
  const [state, formAction, pending] = useActionState(action, undefined);

  useActionFeedback(state, () => onOpenChange(false));

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <form action={formAction}>
            <input type="hidden" name="userId" value={user.id} />
            <AlertDialogAction
              type="submit"
              disabled={pending}
              variant={destructive ? "destructive" : "default"}
            >
              {pending ? "Working..." : submitLabel}
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
