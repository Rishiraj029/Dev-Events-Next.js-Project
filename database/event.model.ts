import { HydratedDocument, Model, Schema, model, models } from "mongoose"

export interface EventDocument {
  title: string
  slug: string
  description: string
  overview: string
  image: string
  venue: string
  location: string
  date: string
  time: string
  mode: string
  audience: string
  agenda: string[]
  organizer: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

type EventModel = Model<EventDocument>

const ensureNonEmptyString = (value: string, fieldName: string): string => {
  const trimmed = value.trim()
  if (!trimmed) {
    throw new Error(`${fieldName} is required.`)
  }
  return trimmed
}

const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

const normalizeDateToIso = (value: string): string => {
  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("date must be a valid date value.")
  }
  return parsedDate.toISOString()
}

const normalizeTime = (value: string): string => {
  const normalizedInput = value.trim().toLowerCase()

  const twentyFourHourMatch = normalizedInput.match(/^([01]?\d|2[0-3]):([0-5]\d)$/)
  if (twentyFourHourMatch) {
    const hours = twentyFourHourMatch[1].padStart(2, "0")
    const minutes = twentyFourHourMatch[2]
    return `${hours}:${minutes}`
  }

  const twelveHourMatch = normalizedInput.match(/^(\d{1,2}):([0-5]\d)\s*(am|pm)$/)
  if (twelveHourMatch) {
    const rawHours = Number.parseInt(twelveHourMatch[1], 10)
    const minutes = twelveHourMatch[2]
    const meridiem = twelveHourMatch[3]

    if (rawHours < 1 || rawHours > 12) {
      throw new Error("time must have a valid hour value.")
    }

    const convertedHours = meridiem === "pm" && rawHours !== 12 ? rawHours + 12 : meridiem === "am" && rawHours === 12 ? 0 : rawHours

    return `${String(convertedHours).padStart(2, "0")}:${minutes}`
  }

  throw new Error("time must be in HH:mm or h:mm AM/PM format.")
}

const eventSchema = new Schema<EventDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    mode: { type: String, required: true, trim: true },
    audience: { type: String, required: true, trim: true },
    agenda: { type: [String], required: true },
    organizer: { type: String, required: true, trim: true },
    tags: { type: [String], required: true },
  },
  { timestamps: true }
)

// Keep slug fast to query and enforce uniqueness at the database level.
eventSchema.index({ slug: 1 }, { unique: true })

eventSchema.pre("save", function (next) {
  try {
    // Validate required strings and normalize whitespace before persistence.
    this.title = ensureNonEmptyString(this.title, "title")
    this.description = ensureNonEmptyString(this.description, "description")
    this.overview = ensureNonEmptyString(this.overview, "overview")
    this.image = ensureNonEmptyString(this.image, "image")
    this.venue = ensureNonEmptyString(this.venue, "venue")
    this.location = ensureNonEmptyString(this.location, "location")
    this.mode = ensureNonEmptyString(this.mode, "mode")
    this.audience = ensureNonEmptyString(this.audience, "audience")
    this.organizer = ensureNonEmptyString(this.organizer, "organizer")

    if (!Array.isArray(this.agenda) || this.agenda.length === 0) {
      throw new Error("agenda is required and must contain at least one item.")
    }
    this.agenda = this.agenda.map((item, index) =>
      ensureNonEmptyString(item, `agenda[${index}]`)
    )

    if (!Array.isArray(this.tags) || this.tags.length === 0) {
      throw new Error("tags is required and must contain at least one item.")
    }
    this.tags = this.tags.map((item, index) =>
      ensureNonEmptyString(item, `tags[${index}]`)
    )

    // Normalize temporal values so reads and sorting are consistent.
    this.date = normalizeDateToIso(ensureNonEmptyString(this.date, "date"))
    this.time = normalizeTime(ensureNonEmptyString(this.time, "time"))

    // Regenerate slug only when title changes to keep stable URLs.
    if (this.isModified("title")) {
      this.slug = slugify(this.title)
    }

    next()
  } catch (error) {
    next(error as Error)
  }
})

export const Event =
  (models.Event as EventModel | undefined) ??
  model<EventDocument, EventModel>("Event", eventSchema)

export type EventDoc = HydratedDocument<EventDocument>
