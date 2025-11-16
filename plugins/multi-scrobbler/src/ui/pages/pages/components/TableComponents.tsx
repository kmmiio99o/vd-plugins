import { findByProps } from "@vendetta/metro";

export const { ScrollView } = findByProps("ScrollView");
export const { TableRowGroup, TableSwitchRow, Stack, TableRow } = findByProps(
  "TableSwitchRow",
  "TableRowGroup",
  "Stack",
  "TableRow",
);
export const { TextInput } = findByProps("TextInput");
