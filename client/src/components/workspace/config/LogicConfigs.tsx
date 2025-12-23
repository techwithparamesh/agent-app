/**
 * Logic Node Configuration Components
 * 
 * Configuration UIs for logic/flow control nodes:
 * Condition, Switch, Loop, Delay, Filter, Merge, Split, etc.
 */

import React from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  TextField,
  NumberField,
  TextareaField,
  SelectField,
  SwitchField,
  CodeField,
  ExpressionField,
  InfoBox,
  SectionHeader,
} from "./FieldComponents";
import {
  GitBranch,
  Repeat,
  Clock,
  Filter,
  GitMerge,
  Split,
  Shuffle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Hash,
  Code,
  Play,
  Pause,
  Plus,
  Trash2,
} from "lucide-react";

// ============================================
// TYPES
// ============================================

interface LogicConfigProps {
  config: Record<string, any>;
  updateConfig: (key: string, value: any) => void;
}

interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

// ============================================
// CONDITION / IF NODE
// ============================================

export const ConditionConfig: React.FC<LogicConfigProps> = ({ config, updateConfig }) => {
  const conditions: Condition[] = config.conditions || [
    { id: '1', field: '', operator: 'equals', value: '' }
  ];

  const addCondition = () => {
    updateConfig('conditions', [
      ...conditions,
      { id: Date.now().toString(), field: '', operator: 'equals', value: '' }
    ]);
  };

  const removeCondition = (id: string) => {
    if (conditions.length > 1) {
      updateConfig('conditions', conditions.filter(c => c.id !== id));
    }
  };

  const updateCondition = (id: string, key: keyof Condition, value: string) => {
    updateConfig('conditions', conditions.map(c =>
      c.id === id ? { ...c, [key]: value } : c
    ));
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={<GitBranch className="h-4 w-4 text-yellow-500" />}
        title="Condition Configuration"
      />

      <InfoBox type="info" title="How It Works">
        Define conditions to route data. Items matching the conditions go to the "true" output,
        others go to the "false" output.
      </InfoBox>

      <SelectField
        label="Combine Conditions"
        value={config.combineWith || 'and'}
        onChange={(v) => updateConfig('combineWith', v)}
        options={[
          { value: 'and', label: 'AND (All must match)' },
          { value: 'or', label: 'OR (Any must match)' },
        ]}
      />

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Conditions</span>
          <Button
            variant="outline"
            size="sm"
            onClick={addCondition}
            className="h-7"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>

        {conditions.map((condition, index) => (
          <div key={condition.id} className="space-y-2 p-3 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Condition {index + 1}</span>
              {conditions.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCondition(condition.id)}
                  className="h-6 w-6 p-0 text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>

            <ExpressionField
              label="Field/Value"
              value={condition.field}
              onChange={(v) => updateCondition(condition.id, 'field', v)}
              placeholder="{{$node.trigger.data.status}}"
              description="The value to check"
            />

            <SelectField
              label="Operator"
              value={condition.operator}
              onChange={(v) => updateCondition(condition.id, 'operator', v)}
              options={[
                { value: 'equals', label: 'Equals (==)' },
                { value: 'notEquals', label: 'Not Equals (!=)' },
                { value: 'contains', label: 'Contains' },
                { value: 'notContains', label: 'Does Not Contain' },
                { value: 'startsWith', label: 'Starts With' },
                { value: 'endsWith', label: 'Ends With' },
                { value: 'greaterThan', label: 'Greater Than (>)' },
                { value: 'lessThan', label: 'Less Than (<)' },
                { value: 'greaterOrEqual', label: 'Greater or Equal (>=)' },
                { value: 'lessOrEqual', label: 'Less or Equal (<=)' },
                { value: 'isEmpty', label: 'Is Empty' },
                { value: 'isNotEmpty', label: 'Is Not Empty' },
                { value: 'isTrue', label: 'Is True' },
                { value: 'isFalse', label: 'Is False' },
                { value: 'regex', label: 'Matches Regex' },
                { value: 'isType', label: 'Is Type' },
              ]}
            />

            {!['isEmpty', 'isNotEmpty', 'isTrue', 'isFalse'].includes(condition.operator) && (
              <ExpressionField
                label="Compare Value"
                value={condition.value}
                onChange={(v) => updateCondition(condition.id, 'value', v)}
                placeholder={condition.operator === 'isType' ? 'string, number, boolean, object, array' : 'Value to compare'}
              />
            )}

            {index < conditions.length - 1 && (
              <div className="text-center py-1">
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  {config.combineWith || 'and'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <Separator />

      <SectionHeader
        icon={<CheckCircle className="h-4 w-4 text-green-500" />}
        title="Output"
      />

      <SwitchField
        label="Keep Only Matching Items"
        description="If disabled, non-matching items go to false output"
        value={config.keepOnlyMatching ?? false}
        onChange={(v) => updateConfig('keepOnlyMatching', v)}
      />

      <SwitchField
        label="Always Output Array"
        description="Wrap single items in an array"
        value={config.alwaysOutputArray ?? true}
        onChange={(v) => updateConfig('alwaysOutputArray', v)}
      />
    </div>
  );
};

// ============================================
// SWITCH / ROUTER NODE
// ============================================

export const SwitchConfig: React.FC<LogicConfigProps> = ({ config, updateConfig }) => {
  const cases = config.cases || [
    { id: '1', value: '', output: 0 }
  ];

  const addCase = () => {
    updateConfig('cases', [
      ...cases,
      { id: Date.now().toString(), value: '', output: cases.length }
    ]);
  };

  const removeCase = (id: string) => {
    updateConfig('cases', cases.filter((c: any) => c.id !== id));
  };

  const updateCase = (id: string, key: string, value: any) => {
    updateConfig('cases', cases.map((c: any) =>
      c.id === id ? { ...c, [key]: value } : c
    ));
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={<Shuffle className="h-4 w-4 text-purple-500" />}
        title="Switch Configuration"
      />

      <InfoBox type="info" title="How It Works">
        Route data to different outputs based on a value. Each case creates a separate output branch.
      </InfoBox>

      <SelectField
        label="Mode"
        value={config.mode || 'rules'}
        onChange={(v) => updateConfig('mode', v)}
        options={[
          { value: 'rules', label: 'Rules Mode (Multiple Conditions)' },
          { value: 'expression', label: 'Expression Mode (Single Value)' },
        ]}
      />

      {config.mode === 'expression' && (
        <ExpressionField
          label="Value to Switch On"
          value={config.switchValue || ''}
          onChange={(v) => updateConfig('switchValue', v)}
          placeholder="{{$node.trigger.data.type}}"
          description="The value that determines which output to use"
          required
        />
      )}

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Cases</span>
          <Button
            variant="outline"
            size="sm"
            onClick={addCase}
            className="h-7"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Case
          </Button>
        </div>

        {cases.map((caseItem: any, index: number) => (
          <div key={caseItem.id} className="space-y-2 p-3 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">
                Output {index} {index === 0 && '(Default)'}
              </span>
              {cases.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCase(caseItem.id)}
                  className="h-6 w-6 p-0 text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>

            {config.mode === 'expression' ? (
              <TextField
                label="When Value Equals"
                value={caseItem.value}
                onChange={(v) => updateCase(caseItem.id, 'value', v)}
                placeholder="order, payment, refund"
                description="Use comma for multiple values"
              />
            ) : (
              <ExpressionField
                label="Condition"
                value={caseItem.condition || ''}
                onChange={(v) => updateCase(caseItem.id, 'condition', v)}
                placeholder="{{$node.trigger.data.amount}} > 1000"
                description="JavaScript expression that returns true/false"
              />
            )}

            <TextField
              label="Output Label"
              value={caseItem.label || ''}
              onChange={(v) => updateCase(caseItem.id, 'label', v)}
              placeholder={`Case ${index}`}
            />
          </div>
        ))}
      </div>

      <Separator />

      <SwitchField
        label="Fallback to Default"
        description="Route to first output if no case matches"
        value={config.fallbackToDefault ?? true}
        onChange={(v) => updateConfig('fallbackToDefault', v)}
      />
    </div>
  );
};

// ============================================
// LOOP NODE
// ============================================

export const LoopConfig: React.FC<LogicConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<Repeat className="h-4 w-4 text-blue-500" />}
      title="Loop Configuration"
    />

    <InfoBox type="info" title="How It Works">
      Process items one at a time. The loop continues until all items are processed
      or the max iterations limit is reached.
    </InfoBox>

    <SelectField
      label="Loop Mode"
      value={config.mode || 'each'}
      onChange={(v) => updateConfig('mode', v)}
      options={[
        { value: 'each', label: 'Loop Over Each Item' },
        { value: 'count', label: 'Loop N Times' },
        { value: 'while', label: 'While Condition' },
        { value: 'batch', label: 'Process in Batches' },
      ]}
    />

    {config.mode === 'each' && (
      <ExpressionField
        label="Items to Loop Over"
        value={config.items || ''}
        onChange={(v) => updateConfig('items', v)}
        placeholder="{{$node.trigger.data.items}}"
        description="Array of items to process"
      />
    )}

    {config.mode === 'count' && (
      <NumberField
        label="Number of Iterations"
        value={config.iterations || 10}
        onChange={(v) => updateConfig('iterations', v)}
        min={1}
        max={10000}
      />
    )}

    {config.mode === 'while' && (
      <ExpressionField
        label="Continue While"
        value={config.whileCondition || ''}
        onChange={(v) => updateConfig('whileCondition', v)}
        placeholder="{{$node.loop.data.hasMore}} === true"
        description="Loop continues while this is true"
      />
    )}

    {config.mode === 'batch' && (
      <NumberField
        label="Batch Size"
        value={config.batchSize || 10}
        onChange={(v) => updateConfig('batchSize', v)}
        min={1}
        max={1000}
        description="Number of items to process in each batch"
      />
    )}

    <Separator />

    <SectionHeader
      icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
      title="Limits"
    />

    <NumberField
      label="Max Iterations"
      value={config.maxIterations || 100}
      onChange={(v) => updateConfig('maxIterations', v)}
      min={1}
      max={10000}
      description="Safety limit to prevent infinite loops"
    />

    <NumberField
      label="Delay Between Items (ms)"
      value={config.delay || 0}
      onChange={(v) => updateConfig('delay', v)}
      min={0}
      max={60000}
      description="Wait time between processing each item"
    />

    <SwitchField
      label="Continue on Error"
      description="Keep processing other items if one fails"
      value={config.continueOnError ?? true}
      onChange={(v) => updateConfig('continueOnError', v)}
    />
  </div>
);

// ============================================
// DELAY NODE
// ============================================

export const DelayConfig: React.FC<LogicConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<Clock className="h-4 w-4 text-orange-500" />}
      title="Delay Configuration"
    />

    <SelectField
      label="Delay Type"
      value={config.delayType || 'fixed'}
      onChange={(v) => updateConfig('delayType', v)}
      options={[
        { value: 'fixed', label: 'Fixed Delay' },
        { value: 'until', label: 'Until Specific Time' },
        { value: 'expression', label: 'Dynamic (Expression)' },
      ]}
    />

    {config.delayType === 'fixed' && (
      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label="Duration"
          value={config.duration || 5}
          onChange={(v) => updateConfig('duration', v)}
          min={0}
        />
        <SelectField
          label="Unit"
          value={config.unit || 'seconds'}
          onChange={(v) => updateConfig('unit', v)}
          options={[
            { value: 'milliseconds', label: 'Milliseconds' },
            { value: 'seconds', label: 'Seconds' },
            { value: 'minutes', label: 'Minutes' },
            { value: 'hours', label: 'Hours' },
            { value: 'days', label: 'Days' },
          ]}
        />
      </div>
    )}

    {config.delayType === 'until' && (
      <>
        <TextField
          label="Resume At"
          value={config.resumeAt || ''}
          onChange={(v) => updateConfig('resumeAt', v)}
          placeholder="2024-01-15T10:00:00"
          description="ISO datetime when execution should resume"
        />
        <SelectField
          label="Timezone"
          value={config.timezone || 'UTC'}
          onChange={(v) => updateConfig('timezone', v)}
          options={[
            { value: 'UTC', label: 'UTC' },
            { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
            { value: 'America/New_York', label: 'America/New_York (EST)' },
            { value: 'Europe/London', label: 'Europe/London (GMT)' },
          ]}
        />
      </>
    )}

    {config.delayType === 'expression' && (
      <ExpressionField
        label="Delay Duration (ms)"
        value={config.delayExpression || ''}
        onChange={(v) => updateConfig('delayExpression', v)}
        placeholder="{{$node.trigger.data.waitTime * 1000}}"
        description="Expression that returns delay in milliseconds"
      />
    )}

    <Separator />

    <InfoBox type="warning" title="Note">
      Long delays may be subject to execution time limits depending on your plan.
      Consider using scheduled triggers for delays longer than a few minutes.
    </InfoBox>
  </div>
);

// ============================================
// FILTER NODE
// ============================================

export const FilterConfig: React.FC<LogicConfigProps> = ({ config, updateConfig }) => {
  const rules = config.rules || [
    { id: '1', field: '', operator: 'equals', value: '' }
  ];

  const addRule = () => {
    updateConfig('rules', [
      ...rules,
      { id: Date.now().toString(), field: '', operator: 'equals', value: '' }
    ]);
  };

  const removeRule = (id: string) => {
    if (rules.length > 1) {
      updateConfig('rules', rules.filter((r: any) => r.id !== id));
    }
  };

  const updateRule = (id: string, key: string, value: string) => {
    updateConfig('rules', rules.map((r: any) =>
      r.id === id ? { ...r, [key]: value } : r
    ));
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={<Filter className="h-4 w-4 text-green-500" />}
        title="Filter Configuration"
      />

      <InfoBox type="info" title="How It Works">
        Filter items based on conditions. Only items matching the rules pass through.
      </InfoBox>

      <SelectField
        label="Combine Rules"
        value={config.combineWith || 'and'}
        onChange={(v) => updateConfig('combineWith', v)}
        options={[
          { value: 'and', label: 'AND (All must match)' },
          { value: 'or', label: 'OR (Any must match)' },
        ]}
      />

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Filter Rules</span>
          <Button
            variant="outline"
            size="sm"
            onClick={addRule}
            className="h-7"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Rule
          </Button>
        </div>

        {rules.map((rule: any, index: number) => (
          <div key={rule.id} className="space-y-2 p-3 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Rule {index + 1}</span>
              {rules.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRule(rule.id)}
                  className="h-6 w-6 p-0 text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>

            <ExpressionField
              label="Field"
              value={rule.field}
              onChange={(v) => updateRule(rule.id, 'field', v)}
              placeholder="{{$json.status}}"
            />

            <SelectField
              label="Operator"
              value={rule.operator}
              onChange={(v) => updateRule(rule.id, 'operator', v)}
              options={[
                { value: 'equals', label: 'Equals' },
                { value: 'notEquals', label: 'Not Equals' },
                { value: 'contains', label: 'Contains' },
                { value: 'notContains', label: 'Not Contains' },
                { value: 'greaterThan', label: 'Greater Than' },
                { value: 'lessThan', label: 'Less Than' },
                { value: 'isEmpty', label: 'Is Empty' },
                { value: 'isNotEmpty', label: 'Is Not Empty' },
                { value: 'regex', label: 'Matches Regex' },
              ]}
            />

            {!['isEmpty', 'isNotEmpty'].includes(rule.operator) && (
              <ExpressionField
                label="Value"
                value={rule.value}
                onChange={(v) => updateRule(rule.id, 'value', v)}
                placeholder="active"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// MERGE NODE
// ============================================

export const MergeConfig: React.FC<LogicConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<GitMerge className="h-4 w-4 text-indigo-500" />}
      title="Merge Configuration"
    />

    <InfoBox type="info" title="How It Works">
      Combine data from multiple inputs into a single output.
    </InfoBox>

    <SelectField
      label="Mode"
      value={config.mode || 'append'}
      onChange={(v) => updateConfig('mode', v)}
      options={[
        { value: 'append', label: 'Append (Combine all items)' },
        { value: 'merge', label: 'Merge by Index' },
        { value: 'mergeByKey', label: 'Merge by Key/Field' },
        { value: 'multiplex', label: 'Multiplex (Combine pairwise)' },
        { value: 'chooseBranch', label: 'Choose Branch' },
        { value: 'waitAll', label: 'Wait for All Inputs' },
      ]}
    />

    {config.mode === 'mergeByKey' && (
      <>
        <TextField
          label="Key Field (Input 1)"
          value={config.key1 || ''}
          onChange={(v) => updateConfig('key1', v)}
          placeholder="id"
          description="Field to match from first input"
        />
        <TextField
          label="Key Field (Input 2)"
          value={config.key2 || ''}
          onChange={(v) => updateConfig('key2', v)}
          placeholder="userId"
          description="Field to match from second input"
        />
        <SelectField
          label="Join Type"
          value={config.joinType || 'inner'}
          onChange={(v) => updateConfig('joinType', v)}
          options={[
            { value: 'inner', label: 'Inner Join (matching only)' },
            { value: 'left', label: 'Left Join (all from input 1)' },
            { value: 'outer', label: 'Outer Join (all from both)' },
          ]}
        />
      </>
    )}

    {config.mode === 'chooseBranch' && (
      <SelectField
        label="Prefer Input"
        value={config.preferInput || '1'}
        onChange={(v) => updateConfig('preferInput', v)}
        options={[
          { value: '1', label: 'Input 1' },
          { value: '2', label: 'Input 2' },
          { value: 'nonEmpty', label: 'First Non-Empty' },
        ]}
      />
    )}

    <Separator />

    <SectionHeader
      icon={<Hash className="h-4 w-4 text-gray-500" />}
      title="Output Options"
    />

    <SwitchField
      label="Remove Duplicates"
      description="Remove duplicate items from merged output"
      value={config.removeDuplicates ?? false}
      onChange={(v) => updateConfig('removeDuplicates', v)}
    />

    {config.removeDuplicates && (
      <TextField
        label="Duplicate Key Field"
        value={config.duplicateKey || ''}
        onChange={(v) => updateConfig('duplicateKey', v)}
        placeholder="id"
        description="Field to use for duplicate detection"
      />
    )}

    <SwitchField
      label="Flatten Arrays"
      description="Flatten nested arrays in output"
      value={config.flatten ?? false}
      onChange={(v) => updateConfig('flatten', v)}
    />
  </div>
);

// ============================================
// SPLIT NODE
// ============================================

export const SplitConfig: React.FC<LogicConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<Split className="h-4 w-4 text-pink-500" />}
      title="Split Configuration"
    />

    <InfoBox type="info" title="How It Works">
      Split data into multiple outputs or break arrays into individual items.
    </InfoBox>

    <SelectField
      label="Split Mode"
      value={config.mode || 'toItems'}
      onChange={(v) => updateConfig('mode', v)}
      options={[
        { value: 'toItems', label: 'Split Array to Items' },
        { value: 'byField', label: 'Split by Field Value' },
        { value: 'chunks', label: 'Split into Chunks' },
        { value: 'outputs', label: 'Clone to Multiple Outputs' },
      ]}
    />

    {config.mode === 'toItems' && (
      <ExpressionField
        label="Array Field"
        value={config.arrayField || ''}
        onChange={(v) => updateConfig('arrayField', v)}
        placeholder="{{$json.items}}"
        description="The array to split into individual items"
      />
    )}

    {config.mode === 'byField' && (
      <TextField
        label="Group By Field"
        value={config.groupByField || ''}
        onChange={(v) => updateConfig('groupByField', v)}
        placeholder="category"
        description="Create separate outputs for each unique value"
      />
    )}

    {config.mode === 'chunks' && (
      <NumberField
        label="Chunk Size"
        value={config.chunkSize || 10}
        onChange={(v) => updateConfig('chunkSize', v)}
        min={1}
        max={1000}
        description="Number of items per chunk"
      />
    )}

    {config.mode === 'outputs' && (
      <NumberField
        label="Number of Outputs"
        value={config.numberOfOutputs || 2}
        onChange={(v) => updateConfig('numberOfOutputs', v)}
        min={2}
        max={10}
        description="Clone data to this many outputs"
      />
    )}

    <Separator />

    <SwitchField
      label="Include Index"
      description="Add index/position to each output item"
      value={config.includeIndex ?? false}
      onChange={(v) => updateConfig('includeIndex', v)}
    />
  </div>
);

// ============================================
// SET/TRANSFORM NODE
// ============================================

export const SetConfig: React.FC<LogicConfigProps> = ({ config, updateConfig }) => {
  const fields = config.fields || [
    { id: '1', name: '', value: '' }
  ];

  const addField = () => {
    updateConfig('fields', [
      ...fields,
      { id: Date.now().toString(), name: '', value: '' }
    ]);
  };

  const removeField = (id: string) => {
    updateConfig('fields', fields.filter((f: any) => f.id !== id));
  };

  const updateField = (id: string, key: string, value: string) => {
    updateConfig('fields', fields.map((f: any) =>
      f.id === id ? { ...f, [key]: value } : f
    ));
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={<Code className="h-4 w-4 text-cyan-500" />}
        title="Set / Transform Data"
      />

      <SelectField
        label="Mode"
        value={config.mode || 'set'}
        onChange={(v) => updateConfig('mode', v)}
        options={[
          { value: 'set', label: 'Set Field Values' },
          { value: 'rename', label: 'Rename Fields' },
          { value: 'remove', label: 'Remove Fields' },
          { value: 'keep', label: 'Keep Only Specified Fields' },
        ]}
      />

      <SwitchField
        label="Keep Existing Data"
        description="Preserve fields not explicitly set"
        value={config.keepExisting ?? true}
        onChange={(v) => updateConfig('keepExisting', v)}
      />

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {config.mode === 'set' ? 'Fields to Set' :
             config.mode === 'rename' ? 'Fields to Rename' :
             config.mode === 'remove' ? 'Fields to Remove' : 'Fields to Keep'}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={addField}
            className="h-7"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Field
          </Button>
        </div>

        {fields.map((field: any, index: number) => (
          <div key={field.id} className="flex gap-2 items-start">
            <div className="flex-1 grid grid-cols-2 gap-2">
              <TextField
                label={config.mode === 'rename' ? 'Old Name' : 'Field Name'}
                value={field.name}
                onChange={(v) => updateField(field.id, 'name', v)}
                placeholder={config.mode === 'rename' ? 'oldFieldName' : 'fieldName'}
              />
              {(config.mode === 'set' || config.mode === 'rename') && (
                <ExpressionField
                  label={config.mode === 'rename' ? 'New Name' : 'Value'}
                  value={field.value}
                  onChange={(v) => updateField(field.id, 'value', v)}
                  placeholder={config.mode === 'rename' ? 'newFieldName' : '{{$json.value}}'}
                />
              )}
            </div>
            {fields.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeField(field.id)}
                className="h-8 w-8 p-0 mt-6 text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// ERROR HANDLER NODE
// ============================================

export const ErrorHandlerConfig: React.FC<LogicConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
      title="Error Handler"
    />

    <InfoBox type="warning" title="Error Handling">
      This node catches errors from connected nodes and allows you to handle them gracefully.
    </InfoBox>

    <SelectField
      label="On Error"
      value={config.onError || 'continueWithOutput'}
      onChange={(v) => updateConfig('onError', v)}
      options={[
        { value: 'continueWithOutput', label: 'Continue to Error Output' },
        { value: 'retry', label: 'Retry Failed Node' },
        { value: 'stop', label: 'Stop Workflow' },
        { value: 'ignore', label: 'Ignore Error & Continue' },
      ]}
    />

    {config.onError === 'retry' && (
      <>
        <NumberField
          label="Max Retries"
          value={config.maxRetries || 3}
          onChange={(v) => updateConfig('maxRetries', v)}
          min={1}
          max={10}
        />
        <NumberField
          label="Retry Delay (ms)"
          value={config.retryDelay || 1000}
          onChange={(v) => updateConfig('retryDelay', v)}
          min={100}
          max={60000}
        />
        <SwitchField
          label="Exponential Backoff"
          description="Double delay after each retry"
          value={config.exponentialBackoff ?? false}
          onChange={(v) => updateConfig('exponentialBackoff', v)}
        />
      </>
    )}

    <Separator />

    <SectionHeader
      icon={<XCircle className="h-4 w-4 text-gray-500" />}
      title="Error Output"
    />

    <SwitchField
      label="Include Error Details"
      description="Add error message and stack trace to output"
      value={config.includeErrorDetails ?? true}
      onChange={(v) => updateConfig('includeErrorDetails', v)}
    />

    <SwitchField
      label="Include Input Data"
      description="Add the input that caused the error"
      value={config.includeInputData ?? true}
      onChange={(v) => updateConfig('includeInputData', v)}
    />

    <TextField
      label="Custom Error Message"
      value={config.customMessage || ''}
      onChange={(v) => updateConfig('customMessage', v)}
      placeholder="Something went wrong while processing"
      description="Override the error message in output"
    />
  </div>
);

// ============================================
// EXPORT ALL LOGIC CONFIGS
// ============================================

export const LogicConfigs: Record<string, React.FC<LogicConfigProps>> = {
  condition: ConditionConfig,
  if: ConditionConfig,
  if_else: ConditionConfig,
  switch: SwitchConfig,
  router: SwitchConfig,
  loop: LoopConfig,
  foreach: LoopConfig,
  split_batches: LoopConfig,
  delay: DelayConfig,
  wait: DelayConfig,
  filter: FilterConfig,
  merge: MergeConfig,
  combine: MergeConfig,
  split: SplitConfig,
  set: SetConfig,
  transform: SetConfig,
  edit_fields: SetConfig,
  error_handler: ErrorHandlerConfig,
  catch: ErrorHandlerConfig,
};

export default LogicConfigs;
