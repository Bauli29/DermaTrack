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
  shower?: boolean
  showerNotes?: string
  clothing?: boolean
  clothingNotes?: string
  animalContact?: boolean
  animalContactNotes?: string
  customContactFactors?: string[]
}

export interface INutrition {
  nuts?: boolean
  nutsNotes?: string
  fruits?: boolean
  fruitsNotes?: string
  shellfish?: boolean
  shellfishNotes?: string
  dairy?: boolean
  dairyNotes?: string
  gluten?: boolean
  glutenNotes?: string
  customNutritionFactors?: string[]
}

export interface ICareProducts {
  skinCare?: boolean
  skinCareNotes?: string
  hairProducts?: boolean
  hairProductsNotes?: string
  soapShampoo?: boolean
  soapShampooNotes?: string
  cosmetics?: boolean
  cosmeticsNotes?: string
  customCareProducts?: string[]
}

export interface IHealth {
  otherAllergies?: boolean
  otherAllergiesNotes?: string
  infections?: boolean
  infectionsNotes?: string
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
