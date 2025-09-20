import { ModalValues, SubmitPayload } from "../types";

/**
 * Creates the payload for API submission
 * @param values - Form values from the modal
 * @param images - Array of image items
 * @param uploadedUrls - Array of newly uploaded URLs
 * @returns Formatted payload for API
 */
export const createPayload = (values: ModalValues): SubmitPayload => {
  // Convert characterSkins to JSON string
  let characterSkinsJson: string | null = null;
  if (values.characterSkins && values.characterSkins.length > 0) {
    characterSkinsJson = JSON.stringify(values.characterSkins);
  }

  return {
    rank: values.rank || undefined,
    price: Number(values.price),
    heroesCount: Number(values.heroesCount),
    skinsCount: Number(values.skinsCount),
    status: values.status,
    description: values.description || undefined,
    images: values.imagesText
      ? values.imagesText
          .split(",")
          .map((url) => url.trim())
          .filter((url) => url)
      : [],
    level: values.level ? Number(values.level) : 0,
    matches: values.matches ? Number(values.matches) : 0,
    winRate: values.winRate ? Number(values.winRate) : 0,
    reputation: values.reputation ? Number(values.reputation) : 0,
    // Account credentials
    gameUsername: values.gameUsername || undefined,
    gamePassword: values.gamePassword || undefined,
    loginMethod: values.loginMethod || undefined,
    additionalInfo: values.additionalInfo || undefined,
    characterSkins: characterSkinsJson,
  };
};
