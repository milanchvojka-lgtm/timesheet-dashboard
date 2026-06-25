import { ProjectCategory } from '@/types/costlocker.types'

export interface TrackingEntry {
  title: string
  descriptionFormat: string
  examples?: string[]
  belongsHere: string
}

export interface TrackingCategory {
  key: 'ops' | 'guiding' | 'rnd' | 'pr' | 'internal' | 'product'
  label: string
  project: string
  projectCategory: ProjectCategory
  color: string
  strict: boolean
  intro: string
  summary: string // short one-liner for the mini-cards
  entries: TrackingEntry[]
}

export const TRACKING_GUIDE: TrackingCategory[] = [
  {
    key: 'ops',
    label: 'OPS',
    project: 'Design tým OPS',
    projectCategory: 'OPS',
    color: '#3b82f6',
    strict: true,
    intro: 'Popis musí začínat klíčovým slovem a dvojtečkou.',
    summary: 'Hiring / Jobs / Reviews — prefix s dvojtečkou',
    entries: [
      { title: 'Hiring', descriptionFormat: 'Hiring: Jméno Příjmení', belongsHere: 'Nábor designerů.' },
      { title: 'Jobs', descriptionFormat: 'Jobs: Název jobu', belongsHere: 'Příprava jobu k realizaci.' },
      { title: 'Reviews', descriptionFormat: 'Reviews: Jméno Příjmení', belongsHere: 'Reviews schůzky.' },
    ],
  },
  {
    key: 'guiding',
    label: 'Guiding',
    project: 'Guiding',
    projectCategory: 'Guiding',
    color: '#8b5cf6',
    strict: false,
    intro: 'Cokoli na Guiding projektu se počítá jako Guiding.',
    summary: 'Jméno designera / job',
    entries: [
      { title: 'Guiding', descriptionFormat: 'Jméno designera nebo název jobu', belongsHere: 'Guiding designerů i projektů.' },
    ],
  },
  {
    key: 'rnd',
    label: 'R&D',
    project: 'Design tým R&D',
    projectCategory: 'R&D',
    color: '#f59e0b',
    strict: false,
    intro: 'Volný text — popisuj název úkolu.',
    summary: 'Název úkolu',
    entries: [
      { title: 'R&D', descriptionFormat: 'Název úkolu', belongsHere: 'Inovace a ladění postupů designu v 2F.' },
    ],
  },
  {
    key: 'pr',
    label: 'PR',
    project: 'Design tým PR',
    projectCategory: 'PR',
    color: '#ec4899',
    strict: false,
    intro: 'Volný text — komunikace o naší práci ven i dovnitř.',
    summary: 'Talky, články, news',
    entries: [
      { title: 'PR', descriptionFormat: 'Název úkolu', belongsHere: 'Talky, články, posty, team news, Demoday report.' },
    ],
  },
  {
    key: 'internal',
    label: 'Internal',
    project: 'Design tým interní',
    projectCategory: 'Internal',
    color: '#64748b',
    strict: false,
    intro: 'Všechny aktivity mimo OPS, R&D, PR a Guiding.',
    summary: 'Vše ostatní',
    entries: [
      { title: 'Internal', descriptionFormat: 'Název aktivity', belongsHere: 'Syncy, schůzky, trackování, komunikace.' },
    ],
  },
  {
    key: 'product',
    label: '2F Product',
    project: '2F Product',
    projectCategory: '2F Product',
    color: '#14b8a6',
    strict: false,
    intro: 'Volný text — práce na produktu 2F.',
    summary: 'Práce na produktu',
    entries: [
      { title: '2F Product', descriptionFormat: 'Název úkolu', belongsHere: 'Vývoj a ladění produktu 2F.' },
    ],
  },
]

export function getGuideByProjectCategory(
  projectCategory: string
): TrackingCategory | undefined {
  return TRACKING_GUIDE.find((c) => c.projectCategory === projectCategory)
}
