import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  Users,
  Trash2,
  UserCog,
  Filter,
  X,
  Download,
  Save,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  group: string | null;
  pendingGroup?: string | null;
}

const UNASSIGNED = "__unassigned__";

const hasPending = (u: User) =>
  u.pendingGroup !== undefined && u.pendingGroup !== u.group;

const effectiveGroup = (u: User) =>
  u.pendingGroup !== undefined ? u.pendingGroup : u.group;

const Admin = () => {
  // Estados iniciam vazios pois virão do banco de dados
  const [groups, setGroups] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newGroup, setNewGroup] = useState("");
  const [search, setSearch] = useState("");
  const [onlyUnassigned, setOnlyUnassigned] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkGroup, setBulkGroup] = useState<string>("");

  // Busca os dados reais do banco ao carregar a página
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, groupsRes] = await Promise.all([
          axios.get("http://localhost:3000/api/users"),
          axios.get("http://localhost:3000/api/groups")
        ]);
        
        const formattedUsers = usersRes.data.map((u: any) => ({ ...u, id: String(u.id) }));
        setUsers(formattedUsers);
        setGroups(groupsRes.data.map((g: any) => g.name));
      } catch (error) {
        toast.error("Erro ao carregar dados do servidor.");
      }
    };
    fetchData();
  }, []);

  const pendingCount = useMemo(
    () => users.filter(hasPending).length,
    [users],
  );

  const handleCreateGroup = async () => {
    const name = newGroup.trim();
    if (!name) {
      toast.error("Digite um nome para o grupo");
      return;
    }
    if (groups.some((g) => g.toLowerCase() === name.toLowerCase())) {
      toast.error("Este grupo já existe");
      return;
    }

    try {
      await axios.post("http://localhost:3000/api/groups", { name });
      setGroups((g) => [...g, name]);
      setNewGroup("");
      toast.success(`Grupo "${name}" criado com sucesso`);
    } catch (error) {
      toast.error("Erro ao criar grupo no servidor");
    }
  };

  const handleRemoveGroup = async (group: string) => {
    try {
      await axios.delete(`http://localhost:3000/api/groups/${group}`);
      setGroups((gs) => gs.filter((g) => g !== group));
      setUsers((us) =>
        us.map((u) => {
          const next = { ...u };
          if (next.group === group) next.group = null;
          if (next.pendingGroup === group) next.pendingGroup = null;
          return next;
        }),
      );
      toast.success(`Grupo "${group}" removido`);
    } catch (error) {
      toast.error("Erro ao remover grupo");
    }
  };

  const handleChangeUserGroup = (userId: string, value: string) => {
    const next = value === UNASSIGNED ? null : value;
    setUsers((us) =>
      us.map((u) => {
        if (u.id !== userId) return u;
        if (next === u.group) {
          const { pendingGroup: _p, ...rest } = u;
          return rest;
        }
        return { ...u, pendingGroup: next };
      }),
    );
  };

  const handleSaveAll = async () => {
    if (pendingCount === 0) return;
    
    try {
      const pendingUsers = users.filter(hasPending);
      
      // Salva no banco de dados
      await Promise.all(pendingUsers.map(u => 
        axios.put(`http://localhost:3000/api/users/${u.id}/group`, { group: u.pendingGroup })
      ));

      // Atualiza a tela
      setUsers((us) =>
        us.map((u) => {
          if (!hasPending(u)) return u;
          const { pendingGroup, ...rest } = u;
          return { ...rest, group: pendingGroup ?? null };
        }),
      );
      toast.success(`${pendingCount} alteração salva com sucesso`);
    } catch (error) {
      toast.error("Erro ao salvar alterações no servidor");
    }
  };

  const handleDiscardAll = () => {
    if (pendingCount === 0) return;
    setUsers((us) =>
      us.map((u) => {
        if (!hasPending(u)) return u;
        const { pendingGroup: _p, ...rest } = u;
        return rest;
      }),
    );
    toast("Alterações descartadas");
  };

  const handleApplyBulk = async () => {
    if (selected.size === 0) {
      toast.error("Selecione ao menos um utilizador");
      return;
    }
    if (!bulkGroup) {
      toast.error("Escolha um grupo de destino");
      return;
    }
    
    const nextGroup = bulkGroup === UNASSIGNED ? null : bulkGroup;
    
    try {
      // Salva no banco de dados
      await Promise.all(Array.from(selected).map(id => 
        axios.put(`http://localhost:3000/api/users/${id}/group`, { group: nextGroup })
      ));

      // Atualiza a tela
      setUsers((us) =>
        us.map((u) => {
          if (!selected.has(u.id)) return u;
          const { pendingGroup: _p, ...rest } = u;
          return { ...rest, group: nextGroup };
        }),
      );
      
      const label = nextGroup ?? "Sem grupo";
      toast.success(
        `${selected.size} utilizadores movidos para ${label}`,
      );
      setSelected(new Set());
      setBulkGroup("");
    } catch (error) {
      toast.error("Erro ao mover usuários em massa.");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase());
      const matchesUnassigned = onlyUnassigned ? effectiveGroup(u) === null : true;
      return matchesSearch && matchesUnassigned;
    });
  }, [users, search, onlyUnassigned]);

  const allFilteredSelected =
    filteredUsers.length > 0 && filteredUsers.every((u) => selected.has(u.id));
  const someFilteredSelected =
    filteredUsers.some((u) => selected.has(u.id)) && !allFilteredSelected;

  const toggleSelectUser = (id: string, value: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (value) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleSelectAllFiltered = (value: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      filteredUsers.forEach((u) => {
        if (value) next.add(u.id);
        else next.delete(u.id);
      });
      return next;
    });
  };

  useEffect(() => {
    setSelected((prev) => {
      const ids = new Set(users.map((u) => u.id));
      const next = new Set<string>();
      prev.forEach((id) => ids.has(id) && next.add(id));
      return next;
    });
  }, [users]);

  const unassignedCount = users.filter((u) => effectiveGroup(u) === null).length;

  const handleExportCSV = () => {
    const header = ["ID", "Nome", "E-mail", "Grupo"];
    const rows = users.map((u) => [
      u.id,
      u.name,
      u.email,
      u.group ?? "Sem grupo",
    ]);
    const csv = [header, ...rows]
      .map((r) =>
        r
          .map((cell) => {
            const s = String(cell ?? "");
            return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
          })
          .join(","),
      )
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `liderai-utilizadores-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Lista exportada em CSV");
  };

  const groupCountClass = (count: number) => {
    if (count === 0)
      return "bg-destructive/15 text-destructive ring-destructive/30";
    if (count === 1)
      return "bg-amber-100 text-amber-700 ring-amber-300";
    return "bg-primary/20 text-primary ring-primary/20";
  };

  const renderStatusBadge = (u: User) => {
    if (hasPending(u)) {
      return (
        <Badge className="rounded-full border border-amber-300 bg-amber-100 text-amber-700 hover:bg-amber-100">
          Pendente
        </Badge>
      );
    }
    if (u.group) {
      return (
        <Badge className="rounded-full bg-primary/10 text-primary hover:bg-primary/10">
          Alocado
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="rounded-full border-orange-300 bg-orange-50 text-orange-600"
      >
        Sem grupo
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <UserCog className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[hsl(var(--dark-green))] md:text-3xl">
                Alocação de Utilizadores
              </h1>
              <p className="text-sm text-muted-foreground">
                Gestão de grupos e atribuição de utilizadores · LiderAI
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {pendingCount > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={handleDiscardAll}
                  className="h-11 gap-2 rounded-xl"
                >
                  <X className="h-4 w-4" />
                  Descartar
                </Button>
                <Button
                  onClick={handleSaveAll}
                  className="h-11 gap-2 rounded-xl px-5 shadow-md shadow-primary/20"
                >
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                  <Badge className="ml-1 h-5 rounded-full bg-primary-foreground px-2 text-[10px] text-primary hover:bg-primary-foreground">
                    {pendingCount}
                  </Badge>
                </Button>
              </>
            )}
            <div className="flex items-center gap-2 self-start rounded-2xl bg-card px-4 py-2 shadow-sm ring-1 ring-border md:self-auto">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-[hsl(var(--dark-green))]">
                {users.length}
              </span>
              <span className="mx-1 h-4 w-px bg-border" />
              <span className="text-sm text-muted-foreground">
                {groups.length} grupos
              </span>
            </div>
          </div>
        </header>

        <section className="mb-6 rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-[hsl(var(--dark-green))]">
            <Plus className="h-4 w-4 text-primary" />
            Criar Novo Grupo
          </h2>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateGroup()}
              placeholder="Ex.: Grupo 5, Equipe Logística..."
              className="h-11 flex-1 rounded-xl"
            />
            <Button
              onClick={handleCreateGroup}
              className="h-11 gap-2 rounded-xl px-6"
            >
              <Plus className="h-4 w-4" />
              Criar Grupo
            </Button>
          </div>

          <div className="mt-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Grupos existentes
            </p>
            {groups.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum grupo criado ainda.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {groups.map((g) => {
                  const count = users.filter((u) => u.group === g).length;
                  const lowCount = count <= 1;
                  return (
                    <div
                      key={g}
                      className={cn(
                        "group flex items-center gap-2 rounded-xl py-2 pl-3 pr-2 text-sm font-medium transition-all ring-1",
                        lowCount
                          ? count === 0
                            ? "bg-destructive/5 text-destructive ring-destructive/20 hover:bg-destructive/10"
                            : "bg-amber-50 text-amber-800 ring-amber-200 hover:bg-amber-100"
                          : "bg-primary/10 text-primary ring-primary/20 hover:bg-primary/15",
                      )}
                      title={
                        lowCount
                          ? "Equipe desfalcada para a gincana"
                          : undefined
                      }
                    >
                      <span>{g}</span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "h-5 rounded-full px-2 text-[10px] ring-1",
                          groupCountClass(count),
                        )}
                      >
                        {count}
                      </Badge>
                      {lowCount && (
                        <AlertTriangle
                          className={cn(
                            "h-3.5 w-3.5",
                            count === 0 ? "text-destructive" : "text-amber-600",
                          )}
                        />
                      )}
                      <button
                        onClick={() => handleRemoveGroup(g)}
                        className="flex h-6 w-6 items-center justify-center rounded-lg text-current/60 opacity-60 transition-all hover:bg-destructive/10 hover:text-destructive hover:opacity-100"
                        aria-label={`Remover ${g}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-[hsl(var(--dark-green))]">
              <Users className="h-4 w-4 text-primary" />
              Utilizadores
              <span className="text-xs font-normal text-muted-foreground">
                ({filteredUsers.length} resultado{filteredUsers.length !== 1 && "s"})
              </span>
            </h2>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome..."
                  className="h-10 w-full rounded-xl pl-9 sm:w-64"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted"
                    aria-label="Limpar busca"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <Button
                variant="outline"
                onClick={handleExportCSV}
                className="h-10 gap-2 rounded-xl"
                title="Exportar lista em CSV"
              >
                <Download className="h-4 w-4" />
                Exportar
              </Button>

              <Button
                variant={onlyUnassigned ? "default" : "outline"}
                onClick={() => setOnlyUnassigned((v) => !v)}
                className="h-10 gap-2 rounded-xl"
              >
                <Filter className="h-4 w-4" />
                Sem grupo
                <Badge
                  className={cn(
                    "h-5 rounded-full px-1.5 text-[10px]",
                    onlyUnassigned
                      ? "bg-primary-foreground text-primary hover:bg-primary-foreground"
                      : "bg-primary/10 text-primary hover:bg-primary/10",
                  )}
                >
                  {unassignedCount}
                </Badge>
              </Button>
            </div>
          </div>

          <div className="hidden overflow-hidden rounded-xl ring-1 ring-border md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary hover:bg-secondary">
                  <TableHead className="w-[44px]">
                    <Checkbox
                      checked={
                        allFilteredSelected
                          ? true
                          : someFilteredSelected
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={(v) => toggleSelectAllFiltered(!!v)}
                      aria-label="Selecionar todos"
                    />
                  </TableHead>
                  <TableHead className="text-[hsl(var(--dark-green))]">Nome</TableHead>
                  <TableHead className="text-[hsl(var(--dark-green))]">E-mail</TableHead>
                  <TableHead className="w-[220px] text-[hsl(var(--dark-green))]">
                    Grupo Atual
                  </TableHead>
                  <TableHead className="w-[130px] text-right text-[hsl(var(--dark-green))]">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      Nenhum utilizador encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((u) => {
                    const pending = hasPending(u);
                    return (
                      <TableRow
                        key={u.id}
                        data-state={selected.has(u.id) ? "selected" : undefined}
                        className={cn(
                          "hover:bg-secondary/40",
                          pending && "bg-amber-50/40",
                        )}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selected.has(u.id)}
                            onCheckedChange={(v) =>
                              toggleSelectUser(u.id, !!v)
                            }
                            aria-label={`Selecionar ${u.name}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {u.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                            </div>
                            <span className="font-medium text-[hsl(var(--dark-green))]">
                              {u.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{u.email}</TableCell>
                        <TableCell>
                          <Select
                            value={effectiveGroup(u) ?? UNASSIGNED}
                            onValueChange={(v) => handleChangeUserGroup(u.id, v)}
                          >
                            <SelectTrigger
                              className={cn(
                                "h-9 rounded-lg",
                                pending && "border-amber-400 ring-1 ring-amber-200",
                              )}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={UNASSIGNED}>
                                <span className="text-muted-foreground">Sem grupo</span>
                              </SelectItem>
                              {groups.map((g) => (
                                <SelectItem key={g} value={g}>
                                  {g}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          {renderStatusBadge(u)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 md:hidden">
            {filteredUsers.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Nenhum utilizador encontrado.
              </p>
            ) : (
              filteredUsers.map((u) => {
                const pending = hasPending(u);
                return (
                  <div
                    key={u.id}
                    className={cn(
                      "rounded-xl bg-secondary/40 p-4 ring-1 ring-border",
                      pending && "bg-amber-50/60 ring-amber-200",
                    )}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selected.has(u.id)}
                          onCheckedChange={(v) => toggleSelectUser(u.id, !!v)}
                          className="mt-1"
                          aria-label={`Selecionar ${u.name}`}
                        />
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {u.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <p className="font-medium text-[hsl(var(--dark-green))]">
                            {u.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                      {renderStatusBadge(u)}
                    </div>
                    <Select
                      value={effectiveGroup(u) ?? UNASSIGNED}
                      onValueChange={(v) => handleChangeUserGroup(u.id, v)}
                    >
                      <SelectTrigger
                        className={cn(
                          "h-10 rounded-lg bg-card",
                          pending && "border-amber-400",
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UNASSIGNED}>
                          <span className="text-muted-foreground">Sem grupo</span>
                        </SelectItem>
                        {groups.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 md:pb-6">
          <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl bg-[hsl(var(--dark-green))] p-3 text-white shadow-2xl ring-1 ring-black/10 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="font-semibold">{selected.size}</span>
              <span className="text-white/70">
                selecionado{selected.size > 1 ? "s" : ""}
              </span>
              <button
                onClick={() => setSelected(new Set())}
                className="ml-1 rounded-md p-1 text-white/60 hover:bg-white/10 hover:text-white"
                aria-label="Limpar seleção"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="hidden h-8 w-px bg-white/15 sm:block" />
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
              <span className="text-xs text-white/70 sm:whitespace-nowrap">
                Mover para:
              </span>
              <Select value={bulkGroup} onValueChange={setBulkGroup}>
                <SelectTrigger className="h-10 flex-1 rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/15 focus:ring-primary">
                  <SelectValue placeholder="Selecione um grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED}>Sem grupo</SelectItem>
                  {groups.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleApplyBulk}
                className="h-10 gap-2 rounded-xl px-5"
              >
                Aplicar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;