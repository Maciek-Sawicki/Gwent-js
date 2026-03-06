import { CardDefinition } from "../CardDefinition";
import { tightBondEffect } from "../../effects/tightBond";

export const northernRealmsCards: CardDefinition[] = [
  {
    id: "balista_1",
    name: "Balista",
    basePower: 6,
    allowedRows: ["SIEGE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/balista_1.png"
  },
  {
    id: "balista_2",
    name: "Balista",
    basePower: 6,
    allowedRows: ["SIEGE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/balista_2.png"
  },
  {
    id: "blue_stripes_commando_1",
    name: "Blue Stripes Commando",
    basePower: 4,
    allowedRows: ["MELEE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/blue_stripes_commando_1.png",
    bondGroup: "blue_stripes_commando",
    onPlay: tightBondEffect
  },
  {
    id: "blue_stripes_commando_2",
    name: "Blue Stripes Commando",
    basePower: 4,
    allowedRows: ["MELEE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/blue_stripes_commando_2.png",
    bondGroup: "blue_stripes_commando",
    onPlay: tightBondEffect
  },
  {
    id: "blue_stripes_commando_3",
    name: "Blue Stripes Commando",
    basePower: 4,
    allowedRows: ["MELEE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/blue_stripes_commando_3.png",
    bondGroup: "blue_stripes_commando",
    onPlay: tightBondEffect
  },
  {
    id: "blue_stripes_commando_4",
    name: "Blue Stripes Commando",
    basePower: 4,
    allowedRows: ["MELEE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/blue_stripes_commando_4.png",
    bondGroup: "blue_stripes_commando",
    onPlay: tightBondEffect
  },
  {
    id: "blue_stripes_commando_5",
    name: "Blue Stripes Commando",
    basePower: 4,
    allowedRows: ["MELEE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/blue_stripes_commando_5.png",
    bondGroup: "blue_stripes_commando",
    onPlay: tightBondEffect
  },
  {
    id: "catapult_1",
    name: "Catapult",
    basePower: 8,
    allowedRows: ["SIEGE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/catapult_1.png",
    bondGroup: "catapult",
    onPlay: tightBondEffect
  },
  {
    id: "catapult_2",
    name: "Catapult",
    basePower: 8,
    allowedRows: ["SIEGE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/catapult_2.png",
    bondGroup: "catapult",
    onPlay: tightBondEffect
  },
  {
    id: "crinfrid reavers dragon hunter_1",
    name: "Crinfrid Reavers Dragon Hunter",
    basePower: 5,
    allowedRows: ["RANGED"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/crinfrid_reavers_dragon_hunter_1.png",
    bondGroup: "crinfrid_reavers_dragon_hunter",
    onPlay: tightBondEffect
  },
  {
    id: "crinfrid reavers dragon hunter_2",
    name: "Crinfrid Reavers Dragon Hunter",
    basePower: 5,
    allowedRows: ["RANGED"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/crinfrid_reavers_dragon_hunter_2.png",
    bondGroup: "crinfrid_reavers_dragon_hunter",
    onPlay: tightBondEffect
  },
  {
    id: "crinfrid reavers dragon hunter_3",
    name: "Crinfrid Reavers Dragon Hunter",
    basePower: 5,
    allowedRows: ["RANGED"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/crinfrid_reavers_dragon_hunter_3.png",
    bondGroup: "crinfrid_reavers_dragon_hunter",
    onPlay: tightBondEffect
  },
  {
    id: "dethmold",
    name: "Dethmold",
    basePower: 6,
    allowedRows: ["RANGED"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/dethmold.png"
  },

];  