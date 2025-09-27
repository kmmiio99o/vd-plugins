// API functions for facts and images

// Facts APIs
export const uselessFact = async () => {
  const response = await fetch("https://uselessfacts.jsph.pl/api/v2/facts/random");
  const resp = await response.json();
  return {
    text: resp["text"],
    source: resp["source"],
    language: resp["language"],
  };
};

export const dogFact = async () => {
  const response = await fetch("https://dogapi.dog/api/v2/facts?limit=1");
  const resp = await response.json();
  return {
    text: resp["data"]["0"]["attributes"]["body"],
  };
};

export const catFact = async () => {
  const response = await fetch("https://catfact.ninja/fact");
  const resp = await response.json();
  return {
    text: resp["fact"],
    length: resp["length"],
  };
};

// Image APIs
export const getPetPetData = async (image: string) => {
  const data = await fetch(
    `https://api.obamabot.me/v2/image/petpet?image=${image.replace("webp", "png")}`
  );
  const body = await data.json();
  return body;
};
