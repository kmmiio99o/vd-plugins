import { findByProps } from "@vendetta/metro";

export const { ScrollView } = findByProps("ScrollView");
export const {
  TableRowGroup,
  TableSwitchRow,
  TableCheckboxRow,
  Stack,
  TableRow,
} = findByProps(
  "TableSwitchRow",
  "TableCheckboxRow",
  "TableRowGroup",
  "Stack",
  "TableRow",
);
export const { TextInput } = findByProps("TextInput");
