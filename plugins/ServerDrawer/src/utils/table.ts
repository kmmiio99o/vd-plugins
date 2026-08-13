import { findByProps } from "@vendetta/metro";
import { Forms } from "@vendetta/ui/components";

// Discord's redesigned "Table" row family replaced Forms.Form* in the app itself, but the
// vendetta.ui.components compat object never exposed it - found via direct findByProps instead,
// falling back to the legacy Form component (whose prop names don't perfectly match) if a lookup
// ever comes back empty.
const find = (prop: string): any => findByProps(prop)?.[prop];

const RealTableRow: any = find("TableRow");

export const TableRow: any = RealTableRow ?? Forms.FormRow;
export const TableRowGroup: any = find("TableRowGroup") ?? Forms.FormSection;
export const TableSwitchRow: any = find("TableSwitchRow") ?? Forms.FormSwitchRow;
