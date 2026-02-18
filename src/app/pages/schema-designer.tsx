import { useState } from "react";
import { usePlanner, type DataModel, type Field } from "../context/planner-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Database,
  Plus,
  Trash2,
  Key,
  Link2,
  Snowflake,
  ArrowRight,
  Table2,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

const fieldTypes = [
  "uuid", "text", "integer", "numeric", "boolean", "timestamptz",
  "timestamp", "date", "jsonb", "text[]", "bigint", "smallint", "real",
  "double precision", "varchar", "char", "bytea", "inet", "cidr",
];

function generateId() {
  return "f" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

export function SchemaDesigner() {
  const { plan, addModel, updateModel, removeModel, addFieldToModel, removeFieldFromModel } = usePlanner();
  const [showAddModel, setShowAddModel] = useState(false);
  const [showAddField, setShowAddField] = useState<string | null>(null);
  const [newModelName, setNewModelName] = useState("");
  const [newModelDesc, setNewModelDesc] = useState("");
  const [newField, setNewField] = useState<Partial<Field>>({
    name: "",
    type: "text",
    nullable: true,
    isPrimary: false,
    isUnique: false,
    defaultValue: "",
  });

  function handleAddModel() {
    if (!newModelName.trim()) return;
    const model: DataModel = {
      id: "m" + Date.now().toString(36),
      name: newModelName.trim().toLowerCase().replace(/\s+/g, "_"),
      description: newModelDesc,
      fields: [
        {
          id: generateId(),
          name: "id",
          type: "uuid",
          nullable: false,
          isPrimary: true,
          isUnique: true,
          defaultValue: "gen_random_uuid()",
        },
        {
          id: generateId(),
          name: "created_at",
          type: "timestamptz",
          nullable: false,
          isPrimary: false,
          isUnique: false,
          defaultValue: "now()",
        },
      ],
    };
    addModel(model);
    setNewModelName("");
    setNewModelDesc("");
    setShowAddModel(false);
    toast.success(`Table "${model.name}" created`);
  }

  function handleAddField(modelId: string) {
    if (!newField.name?.trim()) return;
    const field: Field = {
      id: generateId(),
      name: newField.name!.trim().toLowerCase().replace(/\s+/g, "_"),
      type: newField.type || "text",
      nullable: newField.nullable ?? true,
      isPrimary: newField.isPrimary ?? false,
      isUnique: newField.isUnique ?? false,
      defaultValue: newField.defaultValue || "",
      reference: newField.reference,
    };
    addFieldToModel(modelId, field);
    setNewField({ name: "", type: "text", nullable: true, isPrimary: false, isUnique: false, defaultValue: "" });
    setShowAddField(null);
    toast.success(`Field "${field.name}" added`);
  }

  function generateSQL(model: DataModel): string {
    let sql = `CREATE TABLE ${model.name} (\n`;
    const lines: string[] = [];
    const constraints: string[] = [];

    model.fields.forEach((f) => {
      let line = `  ${f.name} ${f.type}`;
      if (!f.nullable) line += " NOT NULL";
      if (f.defaultValue) line += ` DEFAULT ${f.defaultValue}`;
      lines.push(line);
      if (f.isPrimary) constraints.push(`  PRIMARY KEY (${f.name})`);
      if (f.isUnique && !f.isPrimary) constraints.push(`  UNIQUE (${f.name})`);
      if (f.reference) {
        const [refTable, refCol] = f.reference.split(".");
        constraints.push(`  FOREIGN KEY (${f.name}) REFERENCES ${refTable}(${refCol})`);
      }
    });

    sql += [...lines, ...constraints].join(",\n");
    sql += "\n);";
    return sql;
  }

  function copySQL(model: DataModel) {
    const sql = generateSQL(model);
    navigator.clipboard.writeText(sql);
    toast.success("SQL copied to clipboard");
  }

  // Compute relationships
  const relationships: { from: string; fromField: string; to: string; toField: string }[] = [];
  plan.models.forEach((model) => {
    model.fields.forEach((field) => {
      if (field.reference) {
        const [refTable, refCol] = field.reference.split(".");
        relationships.push({
          from: model.name,
          fromField: field.name,
          to: refTable,
          toField: refCol,
        });
      }
    });
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600" />
            Data Models
          </h1>
          <p className="text-muted-foreground mt-1">
            Design your database schema with tables, fields, and relationships.
          </p>
        </div>
        <Button onClick={() => setShowAddModel(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Table
        </Button>
      </div>

      {/* Relationships Overview */}
      {relationships.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-purple-600" />
              Relationships
            </CardTitle>
            <CardDescription>Foreign key relationships between tables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {relationships.map((rel, i) => (
                <div
                  key={`${rel.from}-${rel.fromField}-${i}`}
                  className="flex items-center gap-3 text-sm py-2 px-3 rounded-lg bg-accent/50"
                >
                  <Badge variant="outline">{rel.from}</Badge>
                  <span className="text-muted-foreground">.{rel.fromField}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <Badge variant="outline">{rel.to}</Badge>
                  <span className="text-muted-foreground">.{rel.toField}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {plan.models.map((model) => (
          <Card key={model.id} className="overflow-hidden">
            <CardHeader className="bg-accent/30">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Table2 className="w-5 h-5 text-blue-600" />
                  <div>
                    <CardTitle>{model.name}</CardTitle>
                    <CardDescription className="mt-0.5">{model.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copySQL(model)}
                    className="gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    SQL
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeModel(model.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Field table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-2 text-xs text-muted-foreground">Field</th>
                      <th className="text-left px-4 py-2 text-xs text-muted-foreground">Type</th>
                      <th className="text-left px-4 py-2 text-xs text-muted-foreground">Constraints</th>
                      <th className="text-left px-4 py-2 text-xs text-muted-foreground">Default</th>
                      <th className="text-right px-4 py-2 text-xs text-muted-foreground w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {model.fields.map((field) => (
                      <tr key={field.id} className="border-b border-border last:border-0 hover:bg-accent/20">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            {field.isPrimary && <Key className="w-3 h-3 text-amber-500" />}
                            {field.reference && <Link2 className="w-3 h-3 text-purple-500" />}
                            <span className="font-mono text-xs">{field.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge variant="outline" className="font-mono text-xs">
                            {field.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex gap-1 flex-wrap">
                            {!field.nullable && (
                              <Badge variant="secondary" className="text-xs">NOT NULL</Badge>
                            )}
                            {field.isUnique && !field.isPrimary && (
                              <Badge variant="secondary" className="text-xs">
                                <Snowflake className="w-2.5 h-2.5 mr-0.5" />
                                UNIQUE
                              </Badge>
                            )}
                            {field.isPrimary && (
                              <Badge className="text-xs bg-amber-500/10 text-amber-700 border-amber-200">PK</Badge>
                            )}
                            {field.reference && (
                              <Badge variant="secondary" className="text-xs">
                                FK → {field.reference}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                          {field.defaultValue || "—"}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {!field.isPrimary && (
                            <button
                              onClick={() => removeFieldFromModel(model.id, field.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Add field button */}
              <div className="px-4 py-3 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 w-full"
                  onClick={() => setShowAddField(model.id)}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Field
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* SQL Preview */}
      {plan.models.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated SQL Schema</CardTitle>
            <CardDescription>
              Auto-generated CREATE TABLE statements from your models
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed">
              {plan.models.map((m) => generateSQL(m)).join("\n\n")}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Add Model Dialog */}
      <Dialog open={showAddModel} onOpenChange={setShowAddModel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Table</DialogTitle>
            <DialogDescription>
              Add a new data model to your schema. An id and created_at field will be
              auto-generated.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm text-muted-foreground block mb-1.5">Table Name</label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g. products, users, orders"
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddModel()}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1.5">Description</label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Brief description of this table"
                value={newModelDesc}
                onChange={(e) => setNewModelDesc(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModel(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddModel} disabled={!newModelName.trim()}>
              Create Table
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Field Dialog */}
      <Dialog open={showAddField !== null} onOpenChange={() => setShowAddField(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Field</DialogTitle>
            <DialogDescription>
              Add a new column to{" "}
              {showAddField && plan.models.find((m) => m.id === showAddField)?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm text-muted-foreground block mb-1.5">Field Name</label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g. email, price, status"
                value={newField.name || ""}
                onChange={(e) => setNewField({ ...newField, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1.5">Type</label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={newField.type || "text"}
                onChange={(e) => setNewField({ ...newField, type: e.target.value })}
              >
                {fieldTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={!newField.nullable}
                  onChange={(e) => setNewField({ ...newField, nullable: !e.target.checked })}
                  className="rounded"
                />
                NOT NULL
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={newField.isUnique}
                  onChange={(e) => setNewField({ ...newField, isUnique: e.target.checked })}
                  className="rounded"
                />
                UNIQUE
              </label>
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1.5">Default Value</label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g. now(), 0, 'pending'"
                value={newField.defaultValue || ""}
                onChange={(e) => setNewField({ ...newField, defaultValue: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1.5">
                Foreign Key Reference <span className="text-xs">(optional)</span>
              </label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g. users.id, categories.id"
                value={newField.reference || ""}
                onChange={(e) => setNewField({ ...newField, reference: e.target.value || undefined })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddField(null)}>
              Cancel
            </Button>
            <Button onClick={() => showAddField && handleAddField(showAddField)} disabled={!newField.name?.trim()}>
              Add Field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
