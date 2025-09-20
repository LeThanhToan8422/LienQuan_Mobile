/**
 * Character Skins Sample Data
 * Contains sample data for character skins selection in admin modal
 */

import { CharacterSkinsData } from "../types";

/**
 * Sample character skins data
 * Used for populating character and skin selection dropdowns
 */
export const characterSkinsData: CharacterSkinsData = [
  {
    name: "Goverra",
    skins: [],
  },
  {
    name: "Heino",
    skins: [],
  },
  {
    name: "Billow",
    skins: [
      {
        name: "Thiên Tướng - Độ Ách",
        rarity: "SS+ HỮU HẠN",
        avatar:
          "https://lienquan.garena.vn/wp-content/uploads/2025/01/59901-1.jpg",
        background:
          "https://lienquan.garena.vn/wp-content/uploads/2025/01/59901.jpg",
      },
    ],
  },
  {
    name: "Bolt Baron",
    skins: [
      {
        name: "Thiên Phủ - Tư Mệnh",
        rarity: "SS+ HỮU HẠN",
        avatar:
          "https://lienquan.garena.vn/wp-content/uploads/2024/11/59802-1.jpg",
        background:
          "https://lienquan.garena.vn/wp-content/uploads/2024/11/59802.jpg",
      },
      {
        name: "Lôi vệ",
        rarity: "A HỮU HẠN",
        avatar:
          "https://lienquan.garena.vn/wp-content/uploads/2024/11/305981head.jpg",
        background:
          "https://lienquan.garena.vn/wp-content/uploads/2024/11/59801.jpg",
      },
    ],
  },
  {
    name: "Biron",
    skins: [
      {
        name: "Yuji Itadori",
        rarity: "呪術廻戦",
        avatar:
          "https://lienquan.garena.vn/wp-content/uploads/2024/10/59702-1.jpg",
        background:
          "https://lienquan.garena.vn/wp-content/uploads/2024/10/59702.jpg",
      },
      {
        name: "Võ sĩ Giác đấu",
        rarity: "S HỮU HẠN",
        avatar:
          "https://lienquan.garena.vn/wp-content/uploads/2024/10/59701-1.jpg",
        background:
          "https://lienquan.garena.vn/wp-content/uploads/2024/10/59701.jpg",
      },
    ],
  },
  {
    name: "Dolia",
    skins: [
      {
        name: "Hoa tiêu đại dương",
        rarity: "S+",
        avatar:
          "https://lienquan.garena.vn/wp-content/uploads/2024/07/15901s.jpg",
        background:
          "https://lienquan.garena.vn/wp-content/uploads/2024/07/15901.jpg",
      },
      {
        name: "Môn đồ tập sự",
        rarity: "A HỮU HẠN",
        avatar:
          "https://lienquan.garena.vn/wp-content/uploads/2024/07/15902-1.jpg",
        background:
          "https://lienquan.garena.vn/wp-content/uploads/2024/07/15902.jpg",
      },
    ],
  },
  {
    name: "Charlotte",
    skins: [
      {
        name: "Hexsword",
        rarity: "SNK",
        avatar:
          "https://lienquan.garena.vn/wp-content/uploads/2024/07/20601s.jpg",
        background:
          "https://lienquan.garena.vn/wp-content/uploads/2024/07/20601.jpg",
      },
    ],
  },
  {
    name: "Tachi",
    skins: [
      {
        name: "Lãng khách",
        rarity: "A",
        avatar:
          "https://lienquan.garena.vn/wp-content/uploads/2024/05/e08fcfd16f1efc71019125d8a975f12a658d368d212661-e1718875847415.jpg",
        background:
          "https://lienquan.garena.vn/wp-content/uploads/2024/05/Honeyview_0e28c84bf5154f4510bf3adefb7334bf658d368ca2aef.jpg",
      },
      {
        name: "Đao khách vô tình",
        rarity: "S+",
        avatar:
          "https://lienquan.garena.vn/wp-content/uploads/2024/05/df6333d7fabc4db3d6c6b0f5bd84504a658d31ae6f8751.jpg",
        background:
          "https://lienquan.garena.vn/wp-content/uploads/2024/05/Honeyview_aeec226c42fab3cb6fbc2b81a63691e8658d31adbf28c.jpg",
      },
      {
        name: "Xích long hỏa diệm",
        rarity: "S+ HỮU HẠN",
        avatar:
          "https://lienquan.garena.vn/wp-content/uploads/2024/05/6b61831c0096b7692017889a464f81a2658d31d83f4ec1.jpg",
        background:
          "https://lienquan.garena.vn/wp-content/uploads/2024/05/Honeyview_4670a85788dbf295b19d79525925c8c4658d31d7bdfae.jpg",
      },
      {
        name: "S-Vinh Quang",
        rarity: "THƯỞNG HẠNG",
        avatar:
          "https://lienquan.garena.vn/wp-content/uploads/2024/05/54204s.jpg",
        background:
          "https://lienquan.garena.vn/wp-content/uploads/2024/05/54204.jpg",
      },
      {
        name: "Thần phong Hộ vệ",
        rarity: "SSM69",
        avatar:
          "https://lienquan.garena.vn/wp-content/uploads/2024/05/54205s.jpg",
        background:
          "https://lienquan.garena.vn/wp-content/uploads/2024/05/54205.jpg",
      },
      {
        name: "Hỗn mang đao",
        rarity: "A HỮU HẠN",
        avatar:
          "https://lienquan.garena.vn/wp-content/uploads/2024/05/54206-1.jpg",
        background:
          "https://lienquan.garena.vn/wp-content/uploads/2024/05/54206-1.jpg",
      },
    ],
  },
];

/**
 * Get rarity color for badge display
 * @param rarity - The rarity level
 * @returns Color string for Ant Design Badge
 */
export const getRarityColor = (rarity: string): string => {
  // Handle Vietnamese rarity names
  if (rarity.includes("SS+ HỮU HẠN")) return "purple";
  if (rarity.includes("SS+")) return "purple";
  if (rarity.includes("SS")) return "purple";
  if (rarity.includes("S+ HỮU HẠN")) return "blue";
  if (rarity.includes("S+")) return "blue";
  if (rarity.includes("S HỮU HẠN")) return "cyan";
  if (rarity.includes("A HỮU HẠN")) return "green";
  if (rarity.includes("A")) return "green";
  if (rarity.includes("THƯỞNG HẠNG")) return "gold";
  if (rarity.includes("呪術廻戦")) return "red"; // Jujutsu Kaisen
  if (rarity.includes("SNK")) return "orange";
  if (rarity.includes("SSM")) return "magenta";

  return "default";
};

/**
 * Get available skins for a specific character
 * @param characterName - Name of the character
 * @returns Array of skins for the character
 */
export const getSkinsForCharacter = (characterName: string) => {
  const character = characterSkinsData.find(
    (char) => char.name === characterName
  );
  return character?.skins || [];
};

/**
 * Get specific skin details
 * @param characterName - Name of the character
 * @param skinName - Name of the skin
 * @returns Skin details or undefined
 */
export const getSkinDetails = (characterName: string, skinName: string) => {
  const character = characterSkinsData.find(
    (char) => char.name === characterName
  );
  return character?.skins.find((skin) => skin.name === skinName);
};

/**
 * Get all character names
 * @returns Array of character names
 */
export const getCharacterNames = () => {
  return characterSkinsData.map((character) => character.name);
};

/**
 * Get all skins count
 * @returns Total number of skins across all characters
 */
export const getTotalSkinsCount = () => {
  return characterSkinsData.reduce(
    (total, character) => total + character.skins.length,
    0
  );
};
