import { findByProps } from "@vendetta/metro";

const find = (prop: string): any => findByProps(prop)?.[prop];

const TableFamily: any = findByProps("TableRowGroup", "Stack");

export const TableRowGroup: any = TableFamily?.TableRowGroup;
export const TableSwitchRow: any = find("TableSwitchRow");
export const Stack: any = TableFamily?.Stack;
export const ScrollView: any = find("ScrollView");
