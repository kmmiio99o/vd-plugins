import { findByStoreName } from "@vendetta/metro";
import { sendMessage } from "../utils/messages";
import { getPetPetData } from "../utils/api";

const UserStore = findByStoreName("UserStore");

export const petPetCommand = {
  name: "petpet",
  displayName: "petpet",
  description: "PetPet someone",
  displayDescription: "PetPet someone",
  options: [
    {
      name: "user",
      description: "The user(or their id) to be patted",
      type: 6,
      required: true,
      displayName: "user",
      displayDescription: "The user(or their id) to be patted",
    },
  ],
  execute: async (args: any, ctx: any) => {
    const user = await UserStore.getUser(args[0].value);
    const image = user.getAvatarURL(512);
    const data = await getPetPetData(image);
    return sendMessage(ctx.channel.id, data.url, ctx.message?.id);
  },
  applicationId: "-1",
  inputType: 1,
  type: 1,
};
