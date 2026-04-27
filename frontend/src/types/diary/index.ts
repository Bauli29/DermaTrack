export interface IDiaryEntry {
  id?: string
  userId?: string
  createdAt?: string
  entryDate: string
  tracking: IDailyTrackingPayload
  notes?: string
}

export interface IDailyTrackingPayload {
  psyche?: IPsyche
  contactFactors?: IContactFactors
  nutrition?: INutrition
  careProducts?: ICareProducts
  health?: IHealth
  symptoms?: ISymptoms
}

export interface IPsyche {
  stressLevel?: number
  sleep?: number
  mentalStrain?: number
}

export interface IContactFactors {
  shower?: string
  clothing?: string
  animalContact?: string
  customContactFactors?: string[]
}

export interface INutrition {
  nuts?: string
  fruits?: string
  shellfish?: string
  dairy?: string
  gluten?: string
  customNutritionFactors?: string[]
}

export interface ICareProducts {
  skinCare?: string
  hairProducts?: string
  soap?: string
  Shampoo?: string
  cosmetics?: string
  customCareProducts?: string[]
}

export interface IHealth {
  otherAllergies?: string
  infections?: number
}

export interface ISymptoms {
  itchiness?: number
  scratch?: boolean
  inflammation?: number
  dryness?: number
  weepingSkin?: boolean
  skinCracks?: boolean
  spreadPhotoUrls?: string[]
}
