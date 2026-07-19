import { ReactNative as RN } from "@vendetta/metro/common";
import {
    ScrollView,
    Stack,
    TableRowGroup,
    TableRow,
} from "../components/TableComponents";

type Credit = {
  command: string;
  author: string;
  avatar: string;
  github: string;
};

const credits: Credit[] = [
    {
        command: "Facts Commands",
        author: "jdev082",
        avatar: "https://github.com/jdev082.png",
        github: "https://github.com/jdev082",
    },
    {
        command: "List Commands",
        author: "Kitomanari",
        avatar: "https://github.com/Kitosight.png",
        github: "https://github.com/Kitosight",
    },
    {
        command: "PetPet",
        author: "wolfieeee",
        avatar: "https://github.com/WolfPlugs.png",
        github: "https://github.com/WolfPlugs",
    },
    {
        command: "KonoChan Commands",
        author: "btmc727 & Rico040",
        avatar: "https://github.com/OTKUSteyler.png",
        github: "https://github.com/OTKUSteyler",
    },
    {
        command: "FirstMessage Command",
        author: "sapphire",
        avatar: "https://github.com/aeongdesu.png",
        github: "https://github.com/aeongdesu",
    },
    {
        command: "Sysinfo Command",
        author: "mugman",
        avatar: "https://github.com/mugman174.png",
        github: "https://github.com/mugman174",
    },
    {
        command: "Spotify Commands",
        author: "Kitomanari",
        avatar: "https://github.com/Kitosight.png",
        github: "https://github.com/Kitosight",
    },
    {
        command: "Gary Command",
        author: "Zach Orange",
        avatar: "https://github.com/IAmGaryTheCat.png",
        github: "https://github.com/IAmGaryTheCat",
    },
    {
        command: "IP & NekosLife Commands",
        author: "scruzism",
        avatar: "https://github.com/scrazzz.png",
        github: "https://github.com/scrazzz",
    },
    {
        command: "FriendInvites",
        author: "nikosszzz",
        avatar: "https://github.com/nikosszzz.png",
        github: "https://github.com/nikosszzz",
    },
];

export default function CreditsPage() {
    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
            <Stack spacing={12}>
                <TableRowGroup title="Plugin Authors">
                    {credits.map((credit) => (
                        <TableRow
                            key={credit.github}
                            label={credit.command}
                            subLabel={`by ${credit.author}`}
                            icon={
                                <RN.Image
                                    source={{ uri: credit.avatar }}
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 8,
                                    }}
                                    resizeMode="cover"
                                />
                            }
                            trailing={<TableRow.Arrow />}
                            onPress={() => RN.Linking.openURL(credit.github)}
                        />
                    ))}
                </TableRowGroup>

                <TableRowGroup title="About">
                    <TableRow
                        label="Commands Plugin Collection"
                        subLabel="Version 1.3.0"
                    />
                </TableRowGroup>
            </Stack>
        </ScrollView>
    );
}
