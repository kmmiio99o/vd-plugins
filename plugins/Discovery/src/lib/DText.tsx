import { find } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";

const DTextMod: any = find(
    (m: any) => m?.Text != null && m?.Heading != null && m?.TextStyleSheet != null,
);

interface Props {
    variant: string;
    color?: string;
    style?: any;
    numberOfLines?: number;
    children: React.ReactNode;
}

export default function DText({ variant, color = "text-default", style, numberOfLines, children }: Props) {
    return (
        <DTextMod.Text variant={variant} color={color} style={style} lineClamp={numberOfLines}>
            {children}
        </DTextMod.Text>
    );
}
