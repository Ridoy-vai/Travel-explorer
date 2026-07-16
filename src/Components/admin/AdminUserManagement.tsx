"use client";

// import { getUserToken } from "@/lib/session";
import { Avatar, Button, Chip, Table } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Role = "admin" | "traveler" | "agency";
type Status = "active" | "blocked";

interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  status?: Status;
  photoURL?: string;
}

interface UsersResponse {
  success: boolean;
  message?: string;
  data: {
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ActionResponse {
  success: boolean;
  message?: string;
}

const roleColorMap: Record<Role, "danger" | "warning" | "success"> = {
  admin: "danger",
  agency: "warning",
  traveler: "success",
};

const roleOptions: Role[] = ["traveler", "agency"];

const tabs: { key: Role; label: string; endpoint: string }[] = [
  { key: "traveler", label: "Travelers", endpoint: "alltravelers" },
  { key: "agency", label: "Agencies", endpoint: "allagencies" },
];

function getInitials(name = ""): string {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

export function AdminUserManagement({ token }: { token: string | null }) {
  const [activeTab, setActiveTab] = useState<Role>("traveler");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  // ---- Fetch function ----
  const fetchUsers = async () => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      const endpoint = tabs.find((t) => t.key === activeTab)?.endpoint;


      const res = await fetch(`${API_URL}/api/admin/allusers/${endpoint}?page=${page}&limit=10`, {
        headers: token
          ? {
            Authorization: `Bearer ${token}`,
          }
          : {},
      }
      );
      const json: UsersResponse = await res.json();

      if (!res.ok || !json.success) {
        setErrorMsg(json.message || "Failed to load users");
        setUsers([]);
        return;
      }

      setUsers(json.data.users || []);
      setTotal(json.data.total || 0);
      setTotalPages(json.data.totalPages || 1);
    } catch (err) {
      console.error("Fetch users error:", err);
      setErrorMsg("Something went wrong while loading users. Please try again.");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load whenever tab or page changes
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, page]);

  const switchTab = (key: Role) => {
    setActiveTab(key);
    setPage(1);
  };

  // ---- Role change ----
  const changeRole = async (userId: string, newRole: Role) => {
    setBusyId(userId);
    try {
      const res = await fetch(`${API_URL}/api/admin/allusers/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const json: ActionResponse = await res.json();

      if (!res.ok || !json.success) {
        setErrorMsg(json.message || "Failed to update role");
      } else {
        await fetchUsers();
      }
    } catch (err) {
      console.error("Update role error:", err);
      setErrorMsg("Something went wrong while updating role.");
    } finally {
      setBusyId(null);
    }
  };

  // ---- Block / Unblock ----
  const toggleBlock = async (userId: string, currentStatus?: Status) => {
    setBusyId(userId);
    const newStatus: Status = currentStatus === "blocked" ? "active" : "blocked";

    try {
      const res = await fetch(`${API_URL}/api/admin/allusers/${userId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const json: ActionResponse = await res.json();

      if (!res.ok || !json.success) {
        setErrorMsg(json.message || "Failed to update status");
      } else {
        await fetchUsers();
      }
    } catch (err) {
      console.error("Update status error:", err);
      setErrorMsg("Something went wrong while updating status.");
    } finally {
      setBusyId(null);
    }
  };

  // ---- Delete ----
  const deleteUser = async (userId: string, name: string) => {
    if (!window.confirm(`Delete ${name || "this user"}?`)) return;

    setBusyId(userId);
    try {
      const res = await fetch(`${API_URL}/api/admin/allusers/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json: ActionResponse = await res.json();

      if (!res.ok || !json.success) {
        setErrorMsg(json.message || "Failed to delete user");
      } else {
        await fetchUsers();
      }
    } catch (err) {
      console.error("Delete user error:", err);
      setErrorMsg("Something went wrong while deleting user.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <div className="flex items-center gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            size="sm"
            variant={activeTab === tab.key ? "primary" : "tertiary"}
            onClick={() => switchTab(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
        {!isLoading && !errorMsg && (
          <Chip variant="soft" color={roleColorMap[activeTab]} className="ml-2">
            {total} total
          </Chip>
        )}
      </div>

      {errorMsg && (
        <div className="text-sm text-red-500 bg-red-50 rounded-md px-3 py-2 flex items-center justify-between">
          <span>{errorMsg}</span>
          <Button size="sm" variant="tertiary" onClick={fetchUsers}>
            Retry
          </Button>
        </div>
      )}

      <Table aria-label="Users table">
        <Table.ScrollContainer>
          <Table.Content className="min-w-[720px]">
            <Table.Header>
              <Table.Column isRowHeader id="name">Member</Table.Column>
              <Table.Column id="email">Email</Table.Column>
              <Table.Column id="role">Role</Table.Column>
              <Table.Column id="status">Status</Table.Column>
              <Table.Column className="text-end">Actions</Table.Column>
            </Table.Header>

            <Table.Body>
              {isLoading ? (
                <Table.Row>
                  <Table.Cell colSpan={5} className="text-center text-muted py-8">
                    Loading...
                  </Table.Cell>
                </Table.Row>
              ) : users.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={5} className="text-center text-muted py-8">
                    No users found.
                  </Table.Cell>
                </Table.Row>
              ) : (
                users.map((user) => {
                  const isBlocked = user.status === "blocked";
                  const isBusy = busyId === user._id;
                  return (
                    <Table.Row key={user._id} id={user._id}>
                      <Table.Cell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar size="sm">
                            {user.photoURL ? <Avatar.Image src={user.photoURL} /> : null}
                            <Avatar.Fallback>{getInitials(user.name)}</Avatar.Fallback>
                          </Avatar>
                          <span>{user.name || "—"}</span>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="text-muted">{user.email}</Table.Cell>
                      <Table.Cell className="min-w-40">
                        <select
                          value={user.role}
                          disabled={isBusy}
                          onChange={(e) => changeRole(user._id, e.target.value as Role)}
                          className="border rounded-md px-2 py-1 text-sm bg-transparent disabled:opacity-50"
                        >
                          {roleOptions.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </Table.Cell>
                      <Table.Cell>
                        <Chip color={isBlocked ? "danger" : "success"} size="sm" variant="soft">
                          {isBlocked ? "Blocked" : "Active"}
                        </Chip>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            size="sm"
                            variant={isBlocked ? "secondary" : "danger"}
                            isDisabled={isBusy}
                            onClick={() => toggleBlock(user._id, user.status)}
                          >
                            {isBlocked ? "Unblock" : "Block"}
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="danger-soft"
                            isDisabled={isBusy}
                            onClick={() => deleteUser(user._id, user.name)}
                          >
                            <Icon className="size-4" icon="gravity-ui:trash-bin" />
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  );
                })
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          <Button size="sm" variant="tertiary" isDisabled={page <= 1 || isLoading} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button size="sm" variant="tertiary" isDisabled={page >= totalPages || isLoading} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}