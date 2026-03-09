import { CardDefinition } from "../CardDefinition";
import { tightBondEffect } from "../../effects/tightBond";
import { medicEffect } from "../../effects/medic";
import { moraleBoostEffect } from "../../effects/moraleBoost";
import { spyEffect } from "../../effects/spy";

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
    ongoing: tightBondEffect
  },
  {
    id: "blue_stripes_commando_2",
    name: "Blue Stripes Commando",
    basePower: 4,
    allowedRows: ["MELEE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/blue_stripes_commando_2.png",
    bondGroup: "blue_stripes_commando",
    ongoing: tightBondEffect
  },
  {
    id: "blue_stripes_commando_3",
    name: "Blue Stripes Commando",
    basePower: 4,
    allowedRows: ["MELEE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/blue_stripes_commando_3.png",
    bondGroup: "blue_stripes_commando",
    ongoing: tightBondEffect
  },
  {
    id: "blue_stripes_commando_4",
    name: "Blue Stripes Commando",
    basePower: 4,
    allowedRows: ["MELEE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/blue_stripes_commando_4.png",
    bondGroup: "blue_stripes_commando",
    ongoing: tightBondEffect
  },
  {
    id: "blue_stripes_commando_5",
    name: "Blue Stripes Commando",
    basePower: 4,
    allowedRows: ["MELEE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/blue_stripes_commando_5.png",
    bondGroup: "blue_stripes_commando",
    ongoing: tightBondEffect
  },
  {
    id: "catapult_1",
    name: "Catapult",
    basePower: 8,
    allowedRows: ["SIEGE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/catapult_1.png",
    bondGroup: "catapult",
    ongoing: tightBondEffect
  },
  {
    id: "catapult_2",
    name: "Catapult",
    basePower: 8,
    allowedRows: ["SIEGE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/catapult_2.png",
    bondGroup: "catapult",
    ongoing: tightBondEffect
  },
  {
    id: "crinfrid_reavers_dragon_hunter_1",
    name: "Crinfrid Reavers Dragon Hunter",
    basePower: 5,
    allowedRows: ["RANGED"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/crinfrid_reavers_dragon_hunter_1.png",
    bondGroup: "crinfrid_reavers_dragon_hunter",
    ongoing: tightBondEffect
  },
  {
    id: "crinfrid_reavers_dragon_hunter_2",
    name: "Crinfrid Reavers Dragon Hunter",
    basePower: 5,
    allowedRows: ["RANGED"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/crinfrid_reavers_dragon_hunter_2.png",
    bondGroup: "crinfrid_reavers_dragon_hunter",
    ongoing: tightBondEffect
  },
  {
    id: "crinfrid_reavers_dragon_hunter_3",
    name: "Crinfrid Reavers Dragon Hunter",
    basePower: 5,
    allowedRows: ["RANGED"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/crinfrid_reavers_dragon_hunter_3.png",
    bondGroup: "crinfrid_reavers_dragon_hunter",
    ongoing: tightBondEffect
  },
  {
    id: "dethmold",
    name: "Dethmold",
    basePower: 6,
    allowedRows: ["RANGED"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/dethmold.png"
  },
  {
    id: "dun_banner_medic",
    name: "Dun Banner Medic",
    basePower: 5,
    allowedRows: ["SIEGE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/dun_banner_medic.png",
    onPlay: medicEffect
  },
  {
    id: "esterad_thyssen",
    name: "Esterad Thyssen",
    basePower: 10,
    allowedRows: ["MELEE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/esterad_thyssen.png",
    isHero: true
  },
  {
    id: "foltest_king_of_temeria",
    name: "Foltest, King of Temeria",
    basePower: 0,
    allowedRows: [],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/foltest_king_of_temeria.png",
    isLeader: true,
    leaderAbility: (ctx) => { }
  },
  {
    id: "foltest_lord_commander_of_the_north",
    name: "Foltest, Lord Commander of the North",
    basePower: 0,
    allowedRows: [],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/foltest_lord_commander_of_the_north.png",
    isLeader: true,
    leaderAbility: (ctx) => { }
  },
  {
    id: "foltest_son_of_medell",
    name: "Foltest, Son of Medell",
    basePower: 0,
    allowedRows: [],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/foltest_son_of_medell.png",
    isLeader: true,
    leaderAbility: (ctx) => { }
  },
  {
    id: "foltest_the_siegemaster",
    name: "Foltest, The Siegemaster",
    basePower: 0,
    allowedRows: [],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/foltest_the_siegemaster.png",
    isLeader: true,
    leaderAbility: (ctx) => { }
  },
  {
    id: "foltest_the_steel-forged",
    name: "Foltest, The Steel-Forged",
    basePower: 0,
    allowedRows: [],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/foltest_the_steel-forged.png",
    isLeader: true,
    leaderAbility: (ctx) => { }
  },
  {
    id: "john_natalis",
    name: "John Natalis",
    basePower: 10,
    allowedRows: ["MELEE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/john_natalis.png",
    isHero: true
  },
  {
    id: "keadweni_siege_expert_1",
    name: "Keadweni Siege Expert",
    basePower: 1,
    allowedRows: ["SIEGE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/keadweni_siege_expert_1.png",
    ongoing: moraleBoostEffect
  },
  {
    id: "keadweni_siege_expert_2",
    name: "Keadweni Siege Expert",
    basePower: 1,
    allowedRows: ["SIEGE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/keadweni_siege_expert_2.png",
    ongoing: moraleBoostEffect
  },
  {
    id: "keadweni_siege_expert_3",
    name: "Keadweni Siege Expert",
    basePower: 1,
    allowedRows: ["SIEGE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/keadweni_siege_expert_3.png",
    ongoing: moraleBoostEffect
  },
  {
    id: "keira_metz",
    name: "Keira Metz",
    basePower: 5,
    allowedRows: ["RANGED"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/keira_metz.png",
  },
  {
    id: "philippa_eilhart",
    name: "Philippa Eilhart",
    basePower: 10,
    allowedRows: ["RANGED"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/philippa_eilhart.png",
    isHero: true
  },
  {
    id: "poor_fucking_infantry_1",
    name: "Poor Fucking Infantry",
    basePower: 1,
    allowedRows: ["MELEE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/poor_fucking_infantry_1.png",
    ongoing: tightBondEffect
  },
  {
    id: "poor_fucking_infantry_2",
    name: "Poor Fucking Infantry",
    basePower: 1,
    allowedRows: ["MELEE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/poor_fucking_infantry_2.png",
    ongoing: tightBondEffect
  },
  {
    id: "poor_fucking_infantry_3",
    name: "Poor Fucking Infantry",
    basePower: 1,
    allowedRows: ["MELEE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/poor_fucking_infantry_3.png",
    ongoing: tightBondEffect
  },
  {
    id: "prince_stennis",
    name: "Prince Stennis",
    basePower: 5,
    allowedRows: ["MELEE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/prince_stennis.png",
    onPlay: spyEffect
  },
  {
    id: "redanian_foot_soldier_1",
    name: "Redanian Foot Soldier",
    basePower: 1,
    allowedRows: ["MELEE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/redanian_foot_soldier_1.png",
  },
  {
    id: "redanian_foot_soldier_2",
    name: "Redanian Foot Soldier",
    basePower: 1,
    allowedRows: ["MELEE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/redanian_foot_soldier_2.png",
  },
  {
    id: "sabrina_glevissig",
    name: "Sabrina Glevissig",
    basePower: 4,
    allowedRows: ["RANGED"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/sabrina_glevissig.png",
  },
  {
    id: "shelden_skaggs",
    name: "Shelden Skaggs",
    basePower: 4,
    allowedRows: ["RANGED"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/shelden_skaggs.png",
  },
  {
    id: "siege_tower_1",
    name: "Siege Tower",
    basePower: 6,
    allowedRows: ["SIEGE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/siege_tower_1.png",
  },
  {
    id: "siege_tower_2",
    name: "Siege Tower",
    basePower: 6,
    allowedRows: ["SIEGE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/siege_tower_2.png",
  },
  {
    id: "siegfried_of_denesle",
    name: "Siegfried of Denesle",
    basePower: 5,
    allowedRows: ["MELEE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/siegfried_of_denesle.png",
  },
  {
    id: "sigismund_dijkstra",
    name: "Sigismund Dijkstra",
    basePower: 4,
    allowedRows: ["MELEE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/sigismund_dijkstra.png",
    onPlay: spyEffect
  },
  {
    id: "sile_de_bruyne",
    name: "Sile de Bruyne",
    basePower: 5,
    allowedRows: ["RANGED"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/sile_de_bruyne.png",
  },
  {
    id: "thaler",
    name: "Thaler",
    basePower: 1,
    allowedRows: ["SIEGE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/thaler.png",
    onPlay: spyEffect
  },
  {
    id: "trebuchet_1",
    name: "Trebuchet",
    basePower: 6,
    allowedRows: ["SIEGE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/trebuchet_1.png",
  },
  {
    id: "trebuchet_2",
    name: "Trebuchet",
    basePower: 6,
    allowedRows: ["SIEGE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/trebuchet_2.png",
  },
  {
    id: "vernon_roche",
    name: "Vernon Roche",
    basePower: 10,
    allowedRows: ["MELEE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/vernon_roche.png",
    isHero: true
  },
  {
    id: "ves",
    name: "Ves",
    basePower: 5,
    allowedRows: ["MELEE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/ves.png",
  },
  {
    id: "yarpen_zigrin",
    name: "Yarpen Zigrin",
    basePower: 2,
    allowedRows: ["MELEE"],
    faction: "NORTHERN_REALMS",
    image: "/assets/cards/yarpen_zigrin.png",
  },
];  